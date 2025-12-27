import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { API_KEY, WEATHER_URL, FORECAST_URL } from '../constants';

export const useWeatherStore = defineStore('weather', () => {
  // State
  const city = ref('Kauniainen');
  const weatherInfo = ref(null);
  const forecastInfo = ref({ list: [] });
  const hourlyForecast = ref([]);
  const isLoading = ref(false);
  const isForecastLoading = ref(false);
  const errorMessage = ref('');
  const isOffline = ref(false);
  const units = ref('metric');

  // Search history
  const searchHistory = ref([]);
  const favorites = ref([]);

  // Computed
  const isError = computed(() => weatherInfo.value?.cod !== 200);
  const isCelsius = computed(() => units.value === 'metric');
  const isFavorited = computed(() => {
    return (
      weatherInfo.value && favorites.value.includes(weatherInfo.value.name)
    );
  });

  // Cache keys
  const CACHE_KEYS = {
    WEATHER: 'weatherCache',
    FORECAST: 'forecastCache',
    TIMESTAMP: 'cacheTimestamp',
  };

  // Actions
  function loadSearchHistory() {
    const stored = localStorage.getItem('weatherSearchHistory');
    if (stored) {
      searchHistory.value = JSON.parse(stored);
    }
  }

  function loadFavorites() {
    const stored = localStorage.getItem('weatherFavorites');
    if (stored) {
      favorites.value = JSON.parse(stored);
    }
  }

  function saveToHistory(cityName) {
    if (!cityName) return;

    searchHistory.value = [
      cityName,
      ...searchHistory.value.filter(
        (c) => c.toLowerCase() !== cityName.toLowerCase()
      ),
    ].slice(0, 5);

    localStorage.setItem(
      'weatherSearchHistory',
      JSON.stringify(searchHistory.value)
    );
  }

  function toggleFavorite() {
    if (!weatherInfo.value || weatherInfo.value.cod !== 200) return;

    const cityName = weatherInfo.value.name;

    if (favorites.value.includes(cityName)) {
      favorites.value = favorites.value.filter((c) => c !== cityName);
    } else {
      favorites.value = [...favorites.value, cityName].slice(-10);
    }

    localStorage.setItem('weatherFavorites', JSON.stringify(favorites.value));
  }

  function toggleUnits() {
    units.value = units.value === 'metric' ? 'imperial' : 'metric';
    if (weatherInfo.value && weatherInfo.value.cod === 200) {
      getWeather();
    }
  }

  function cacheWeatherData(weather, forecast) {
    try {
      localStorage.setItem(CACHE_KEYS.WEATHER, JSON.stringify(weather));
      localStorage.setItem(CACHE_KEYS.FORECAST, JSON.stringify(forecast));
      localStorage.setItem(CACHE_KEYS.TIMESTAMP, Date.now().toString());
    } catch (error) {
      console.error('Failed to cache weather data:', error);
    }
  }

  function loadCachedData() {
    try {
      const cachedWeather = localStorage.getItem(CACHE_KEYS.WEATHER);
      const cachedForecast = localStorage.getItem(CACHE_KEYS.FORECAST);
      const timestamp = localStorage.getItem(CACHE_KEYS.TIMESTAMP);

      if (cachedWeather && cachedForecast && timestamp) {
        const cacheAge = Date.now() - parseInt(timestamp);
        const maxAge = 30 * 60 * 1000; // 30 minutes

        if (cacheAge < maxAge) {
          weatherInfo.value = JSON.parse(cachedWeather);
          forecastInfo.value = JSON.parse(cachedForecast);
          city.value = weatherInfo.value.name;
          return true;
        }
      }
    } catch (error) {
      console.error('Failed to load cached data:', error);
    }
    return false;
  }

  function processHourlyForecast(data) {
    if (!data || !data.list) {
      hourlyForecast.value = [];
      return;
    }

    hourlyForecast.value = data.list.slice(0, 8).map((item) => ({
      time: new Date(item.dt * 1000).toLocaleTimeString('fi-FI', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      }),
      temp: Math.round(item.main.temp),
      feelsLike: Math.round(item.main.feels_like),
      description: item.weather[0].description,
      icon: item.weather[0].description,
      humidity: item.main.humidity,
      windSpeed: item.wind.speed,
      pop: Math.round(item.pop * 100),
    }));
  }

  async function getWeather() {
    if (!city.value.trim()) {
      errorMessage.value = 'Enter the city name!';
      return;
    }

    errorMessage.value = '';
    isLoading.value = true;

    try {
      const response = await fetch(
        `${WEATHER_URL}?q=${city.value}&units=${units.value}&appid=${API_KEY}`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.cod !== 200) {
        throw new Error(data.message || 'City not found');
      }

      weatherInfo.value = data;
      isOffline.value = false;
      saveToHistory(data.name);
      await getForecast();
    } catch (error) {
      console.error('Weather API error:', error);

      if (error.message.includes('Failed to fetch')) {
        errorMessage.value =
          'Network error. Please check your internet connection.';
      } else if (error.message.includes('city not found')) {
        errorMessage.value = 'City not found. Please try another name.';
      } else if (error.message.includes('HTTP error')) {
        errorMessage.value = 'Server error. Please try again later.';
      } else {
        errorMessage.value = error.message || 'Failed to fetch weather data';
      }

      weatherInfo.value = { cod: 404 };
    } finally {
      isLoading.value = false;
    }
  }

  async function getForecast() {
    isForecastLoading.value = true;

    try {
      const response = await fetch(
        `${FORECAST_URL}?q=${city.value}&units=${units.value}&appid=${API_KEY}`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.cod !== '200') {
        throw new Error(data.message || 'Failed to fetch forecast');
      }

      forecastInfo.value = data;
      processHourlyForecast(data);
      cacheWeatherData(weatherInfo.value, data);
    } catch (error) {
      console.error('Forecast API error:', error);
      forecastInfo.value = { list: [] };
    } finally {
      isForecastLoading.value = false;
    }
  }

  async function getWeatherByCoords(lat, lon) {
    isLoading.value = true;
    errorMessage.value = '';

    try {
      const response = await fetch(
        `${WEATHER_URL}?lat=${lat}&lon=${lon}&units=${units.value}&appid=${API_KEY}`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.cod !== 200) {
        throw new Error(data.message || 'Failed to fetch weather data');
      }

      weatherInfo.value = data;
      city.value = data.name;
      saveToHistory(data.name);
      await getForecastByCoords(lat, lon);
    } catch (error) {
      console.error('Weather API error:', error);

      if (error.message.includes('Failed to fetch')) {
        errorMessage.value =
          'Network error. Please check your internet connection.';
      } else if (error.message.includes('HTTP error')) {
        errorMessage.value = 'Server error. Please try again later.';
      } else {
        errorMessage.value =
          error.message || 'Failed to fetch weather data for your location';
      }

      weatherInfo.value = { cod: 404 };
    } finally {
      isLoading.value = false;
    }
  }

  async function getForecastByCoords(lat, lon) {
    isForecastLoading.value = true;

    try {
      const response = await fetch(
        `${FORECAST_URL}?lat=${lat}&lon=${lon}&units=${units.value}&appid=${API_KEY}`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.cod !== '200') {
        throw new Error(data.message || 'Failed to fetch forecast');
      }

      forecastInfo.value = data;
      processHourlyForecast(data);
      cacheWeatherData(weatherInfo.value, data);
    } catch (error) {
      console.error('Forecast API error:', error);
      forecastInfo.value = { list: [] };
    } finally {
      isForecastLoading.value = false;
    }
  }

  function useMyLocation() {
    if (!navigator.geolocation) {
      errorMessage.value = 'Geolocation is not supported by your browser';
      return;
    }

    isLoading.value = true;
    errorMessage.value = '';

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        getWeatherByCoords(latitude, longitude);
      },
      (error) => {
        isLoading.value = false;
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage.value = 'Location permission denied';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage.value = 'Location information unavailable';
            break;
          case error.TIMEOUT:
            errorMessage.value = 'Location request timed out';
            break;
          default:
            errorMessage.value = 'An unknown error occurred';
        }
      }
    );
  }

  function initialize() {
    loadSearchHistory();
    loadFavorites();

    const hasCachedData = loadCachedData();

    if (hasCachedData) {
      isOffline.value = true;
      getWeather();
    } else {
      getWeather();
    }
  }

  return {
    // State
    city,
    weatherInfo,
    forecastInfo,
    hourlyForecast,
    isLoading,
    isForecastLoading,
    errorMessage,
    isOffline,
    units,
    searchHistory,
    favorites,

    // Computed
    isError,
    isCelsius,
    isFavorited,

    // Actions
    getWeather,
    getForecast,
    getWeatherByCoords,
    useMyLocation,
    toggleFavorite,
    toggleUnits,
    saveToHistory,
    loadSearchHistory,
    loadFavorites,
    initialize,
  };
});
