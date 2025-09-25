<script setup>
import { ref, onMounted, computed } from "vue";
import { API_KEY, WEATHER_URL, FORECAST_URL } from "./constants/index";
import { capitalizeFirstLetter, debounce } from "./utils";

// Importing child components for displaying weather details
import WeatherSummary from "./components/WeatherSummary.vue";
import Highlights from "./components/Highlights.vue";
import Coords from "./components/Coords.vue";
import Humidity from "./components/Humidity.vue";
import WeatherForecast from "./components/WeatherForecast.vue";

// Reactive variable to store the city name
const city = ref("Kauniainen");

// Reactive variable to store fetched weather data
const weatherInfo = ref(null);
// Reactive variable to store forecast data with default structure
const forecastInfo = ref({ list: [] });
// Loading states
const isLoading = ref(false);
const isForecastLoading = ref(false);
// Search history
const searchHistory = ref([]);
const showHistory = ref(false);
// Favorites
const favorites = ref([]);
const showFavorites = ref(false);
// Offline indicator
const isOffline = ref(false);
// Temperature unit (metric = Celsius, imperial = Fahrenheit)
const units = ref("metric");
const isCelsius = computed(() => units.value === "metric");

// Check if current city is favorited
const isFavorited = computed(() => {
  return weatherInfo.value && favorites.value.includes(weatherInfo.value.name);
});

// Computed property to check if an error occurred (API response status is not 200)
const isError = computed(() => weatherInfo.value?.cod !== 200);
const errorMessage = ref("");

// Cache keys for localStorage
const CACHE_KEYS = {
  WEATHER: "weatherCache",
  FORECAST: "forecastCache",
  TIMESTAMP: "cacheTimestamp",
};

// Cache weather data to localStorage
function cacheWeatherData(weather, forecast) {
  try {
    localStorage.setItem(CACHE_KEYS.WEATHER, JSON.stringify(weather));
    localStorage.setItem(CACHE_KEYS.FORECAST, JSON.stringify(forecast));
    localStorage.setItem(CACHE_KEYS.TIMESTAMP, Date.now().toString());
  } catch (error) {
    console.error("Failed to cache weather data:", error);
  }
}

// Load cached weather data
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
    console.error("Failed to load cached data:", error);
  }
  return false;
}

// Toggle temperature units
function toggleUnits() {
  units.value = units.value === "metric" ? "imperial" : "metric";
  // Refresh weather data with new units
  if (weatherInfo.value && weatherInfo.value.cod === 200) {
    getWeather();
  }
}

// Load search history from localStorage on mount
function loadSearchHistory() {
  const stored = localStorage.getItem("weatherSearchHistory");
  if (stored) {
    searchHistory.value = JSON.parse(stored);
  }
}

// Load favorites from localStorage
function loadFavorites() {
  const stored = localStorage.getItem("weatherFavorites");
  if (stored) {
    favorites.value = JSON.parse(stored);
  }
}

// Toggle favorite city
function toggleFavorite() {
  if (!weatherInfo.value || weatherInfo.value.cod !== 200) return;
  
  const cityName = weatherInfo.value.name;
  
  if (favorites.value.includes(cityName)) {
    // Remove from favorites
    favorites.value = favorites.value.filter(c => c !== cityName);
  } else {
    // Add to favorites (max 10)
    favorites.value = [...favorites.value, cityName].slice(-10);
  }
  
  localStorage.setItem("weatherFavorites", JSON.stringify(favorites.value));
}

// Select city from favorites
function selectFromFavorites(cityName) {
  city.value = cityName;
  showFavorites.value = false;
  getWeather();
}

// Save search to history
function saveToHistory(cityName) {
  if (!cityName) return;

  // Remove duplicates and add to beginning
  searchHistory.value = [
    cityName,
    ...searchHistory.value.filter(
      (c) => c.toLowerCase() !== cityName.toLowerCase()
    ),
  ].slice(0, 5); // Keep only last 5 searches

  localStorage.setItem(
    "weatherSearchHistory",
    JSON.stringify(searchHistory.value)
  );
}

// Select city from history
function selectFromHistory(cityName) {
  city.value = cityName;
  showHistory.value = false;
  getWeather();
}

// Hide history dropdown with delay
function hideHistory() {
  setTimeout(() => {
    showHistory.value = false;
  }, 200);
}

// Function to fetch current weather data from the API
function getWeather() {
  if (!city.value.trim()) {
    errorMessage.value = "Enter the city name!";
    return;
  }

  errorMessage.value = ""; // Clear the error message
  isLoading.value = true;

  fetch(`${WEATHER_URL}?q=${city.value}&units=${units.value}&appid=${API_KEY}`)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      if (data.cod !== 200) {
        throw new Error(data.message || "City not found");
      }
      weatherInfo.value = data;
      isOffline.value = false; // Clear offline flag
      saveToHistory(data.name); // Save to history
      getForecast();
    })
    .catch((error) => {
      console.error("Weather API error:", error);
      
      // Provide user-friendly error messages
      if (error.message.includes("Failed to fetch")) {
        errorMessage.value = "Network error. Please check your internet connection.";
      } else if (error.message.includes("city not found")) {
        errorMessage.value = "City not found. Please try another name.";
      } else if (error.message.includes("HTTP error")) {
        errorMessage.value = "Server error. Please try again later.";
      } else {
        errorMessage.value = error.message || "Failed to fetch weather data";
      }
      
      weatherInfo.value = { cod: 404 }; // Set error state
    })
    .finally(() => {
      isLoading.value = false;
    });
}

// Function to fetch 5-day forecast data from the API
function getForecast() {
  isForecastLoading.value = true;
  fetch(`${FORECAST_URL}?q=${city.value}&units=${units.value}&appid=${API_KEY}`)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      if (data.cod !== "200") {
        throw new Error(data.message || "Failed to fetch forecast");
      }
      forecastInfo.value = data;
      // Cache both weather and forecast data
      cacheWeatherData(weatherInfo.value, data);
    })
    .catch((error) => {
      console.error("Forecast API error:", error);
      // Silently fail for forecast - set empty data
      forecastInfo.value = { list: [] };
    })
    .finally(() => {
      isForecastLoading.value = false;
    });
}

// Debounced search function to avoid excessive API calls
const debouncedSearch = debounce(getWeather, 800);

// Function to get weather by coordinates (for geolocation)
function getWeatherByCoords(lat, lon) {
  isLoading.value = true;
  errorMessage.value = "";

  fetch(`${WEATHER_URL}?lat=${lat}&lon=${lon}&units=${units.value}&appid=${API_KEY}`)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      if (data.cod !== 200) {
        throw new Error(data.message || "Failed to fetch weather data");
      }
      weatherInfo.value = data;
      city.value = data.name; // Update city name
      saveToHistory(data.name);
      getForecastByCoords(lat, lon);
    })
    .catch((error) => {
      console.error("Weather API error:", error);
      
      if (error.message.includes("Failed to fetch")) {
        errorMessage.value = "Network error. Please check your internet connection.";
      } else if (error.message.includes("HTTP error")) {
        errorMessage.value = "Server error. Please try again later.";
      } else {
        errorMessage.value = error.message || "Failed to fetch weather data for your location";
      }
      
      weatherInfo.value = { cod: 404 };
    })
    .finally(() => {
      isLoading.value = false;
    });
}

// Function to get forecast by coordinates
function getForecastByCoords(lat, lon) {
  isForecastLoading.value = true;
  fetch(`${FORECAST_URL}?lat=${lat}&lon=${lon}&units=${units.value}&appid=${API_KEY}`)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      if (data.cod !== "200") {
        throw new Error(data.message || "Failed to fetch forecast");
      }
      forecastInfo.value = data;
      // Cache data from geolocation
      cacheWeatherData(weatherInfo.value, data);
    })
    .catch((error) => {
      console.error("Forecast API error:", error);
      forecastInfo.value = { list: [] };
    })
    .finally(() => {
      isForecastLoading.value = false;
    });
}

// Function to use geolocation
function useMyLocation() {
  if (!navigator.geolocation) {
    errorMessage.value = "Geolocation is not supported by your browser";
    return;
  }

  isLoading.value = true;
  errorMessage.value = "";

  navigator.geolocation.getCurrentPosition(
    (position) => {
      const { latitude, longitude } = position.coords;
      getWeatherByCoords(latitude, longitude);
    },
    (error) => {
      isLoading.value = false;
      switch (error.code) {
        case error.PERMISSION_DENIED:
          errorMessage.value = "Location permission denied";
          break;
        case error.POSITION_UNAVAILABLE:
          errorMessage.value = "Location information unavailable";
          break;
        case error.TIMEOUT:
          errorMessage.value = "Location request timed out";
          break;
        default:
          errorMessage.value = "An unknown error occurred";
      }
    }
  );
}

// Fetch weather data when the component is mounted
onMounted(() => {
  loadSearchHistory();
  loadFavorites();
  
  // Try to load cached data first
  const hasCachedData = loadCachedData();
  
  if (hasCachedData) {
    isOffline.value = true;
    // Try to update in background
    getWeather();
  } else {
    getWeather();
  }
});
</script>

<template>
  <!-- Main page wrapper -->
  <div class="page">
    <!-- Favorites toggle button -->
    <button 
      class="favorites-toggle" 
      @click="showFavorites = !showFavorites"
      :title="showFavorites ? 'Hide favorites' : 'Show favorites'"
    >
      ★ {{ favorites.length }}
    </button>
    
    <!-- Favorites panel -->
    <div v-if="showFavorites && favorites.length > 0" class="favorites-panel">
      <div class="favorites-title">Favorite Cities</div>
      <div class="favorites-grid">
        <button
          v-for="(favCity, index) in favorites"
          :key="index"
          class="favorite-city-btn"
          @click="selectFromFavorites(favCity)"
        >
          {{ favCity }}
        </button>
      </div>
    </div>
    
    <!-- Unit toggle button -->
    <button class="unit-toggle" @click="toggleUnits" :title="`Switch to ${isCelsius ? 'Fahrenheit' : 'Celsius'}`">
      {{ isCelsius ? '°F' : '°C' }}
    </button>
    
    <!-- Offline indicator -->
    <div v-if="isOffline" class="offline-banner">
      📦 Showing cached data
    </div>
    
    <div
      v-if="!isError"
      :style="`background-image: url('assets/img/main-backgrounds/${weatherInfo?.weather[0].description}.jpg');`"
      class="main-bgd-image"
    ></div>
    <main class="main">
      <!-- Main weather container -->
      <div class="container">
        <div class="laptop">
          <!-- Section for input and weather summary -->
          <div class="sections">
            <section :class="['section', 'left', { 'section-error': isError }]">
              <div class="info">
                <div class="city-inner">
                  <!-- Search input field with two-way binding -->
                  <input
                    id="city-search-input"
                    v-model="city"
                    type="text"
                    class="search"
                    placeholder="Enter city name..."
                    autocomplete="off"
                    @keyup.enter="getWeather"
                    @focus="showHistory = true"
                    @blur="hideHistory"
                  />
                  <button
                    class="location-btn"
                    @click="useMyLocation"
                    title="Use my location"
                  >
                    📍
                  </button>
                  <button class="search-btn" @click="getWeather"></button>

                  <!-- Search History Dropdown -->
                  <div
                    v-if="showHistory && searchHistory.length > 0"
                    class="history-dropdown"
                  >
                    <div class="history-title">Recent Searches</div>
                    <div
                      v-for="(historyCity, index) in searchHistory"
                      :key="index"
                      class="history-item"
                      @click="selectFromHistory(historyCity)"
                    >
                      {{ historyCity }}
                    </div>
                  </div>

                  <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
                  <p v-if="isLoading" class="loading">
                    Loading weather data...
                  </p>
                </div>

                <!-- Display weather summary if no error -->
                <WeatherSummary
                  v-if="!isError && !isLoading"
                  :weatherInfo="weatherInfo"
                />
                
                <!-- Favorite button -->
                <button
                  v-if="!isError && !isLoading"
                  class="favorite-btn"
                  @click="toggleFavorite"
                  :title="isFavorited ? 'Remove from favorites' : 'Add to favorites'"
                >
                  {{ isFavorited ? '★' : '☆' }}
                </button>
                
                <!-- Display error message if API returns an error -->
                <div v-else-if="isError && !isLoading" class="summary-not">
                  <h4>Unfortunately, something went wrong!</h4>
                  <p>{{ capitalizeFirstLetter(weatherInfo?.message) }}</p>
                </div>
              </div>
            </section>

            <!-- Right section for additional weather highlights -->
            <section v-if="!isError && !isLoading" class="section right">
              <Highlights :weatherInfo="weatherInfo" />
            </section>
          </div>

          <!-- Section for displaying 5 days forecast -->
          <div v-if="!isError && !isLoading" class="sections">
            <WeatherForecast
              v-if="!isForecastLoading && forecastInfo.list.length > 0"
              :forecastInfo="forecastInfo"
            />
            <p v-if="isForecastLoading" class="forecast-loading">
              Loading forecast...
            </p>
          </div>

          <!-- Section for displaying coordinates and humidity -->
          <div v-if="!isError && !isLoading" class="sections">
            <Coords :coord="weatherInfo.coord" />
            <Humidity :humidity="weatherInfo.main.humidity" />
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<style lang="scss" scoped>
.favorites-toggle {
  position: fixed;
  top: 20px;
  left: 20px;
  padding: 10px 16px;
  background: rgba(255, 255, 255, 0.2);
  border: 2px solid rgba(255, 255, 255, 0.4);
  border-radius: 25px;
  color: white;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  z-index: 1000;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);

  &:hover {
    background: rgba(255, 255, 255, 0.3);
    border-color: rgba(255, 255, 255, 0.6);
  }
}

.favorites-panel {
  position: fixed;
  top: 80px;
  left: 20px;
  max-width: 300px;
  background: rgba(0, 0, 0, 0.9);
  border-radius: 12px;
  padding: 16px;
  z-index: 999;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.favorites-title {
  color: rgba($white, 0.8);
  font-size: 14px;
  margin-bottom: 12px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.favorites-grid {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.favorite-city-btn {
  padding: 10px 16px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  color: $white;
  cursor: pointer;
  transition: all 0.2s;
  text-align: left;
  font-size: 14px;

  &:hover {
    background: rgba(255, 255, 255, 0.2);
    border-color: rgba(255, 255, 255, 0.4);
  }
}

.favorite-btn {
  position: absolute;
  top: 20px;
  right: 20px;
  width: 40px;
  height: 40px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  color: gold;
  font-size: 24px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background: rgba(255, 255, 255, 0.2);
    transform: scale(1.1);
  }
}

.offline-banner {
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(255, 165, 0, 0.9);
  color: white;
  padding: 10px 20px;
  border-radius: 8px;
  font-size: 14px;
  z-index: 1000;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.unit-toggle {
  position: fixed;
  top: 20px;
  right: 20px;
  width: 50px;
  height: 50px;
  background: rgba(255, 255, 255, 0.2);
  border: 2px solid rgba(255, 255, 255, 0.4);
  border-radius: 50%;
  color: white;
  font-size: 18px;
  font-weight: bold;
  cursor: pointer;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);

  &:hover {
    background: rgba(255, 255, 255, 0.3);
    border-color: rgba(255, 255, 255, 0.6);
    transform: scale(1.1);
  }

  &:active {
    transform: scale(0.95);
  }
}

.page {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 20px 0;

  .main-bgd-image {
    width: 100%;
    height: 100%;
    position: absolute;
    background-repeat: no-repeat;
    background-position: center;
    background-size: cover;
    background-attachment: fixed;
    transition: ease-in-out 1s;
  }
}
.laptop {
  width: 100%;
  padding: 20px;
  border-radius: 25px;
  -webkit-backdrop-filter: blur(4px);
  backdrop-filter: blur(4px);
  box-shadow: 0 5px 50px rgba(0, 0, 0, 0.5);
}
.sections {
  display: flex;
  width: 100%;

  @media (max-width: 767px) {
    flex-direction: column;
  }
}
.left {
  width: 30%;
  padding-right: 10px;

  @media (max-width: 767px) {
    width: 100%;
    padding-right: 0;
  }
  &.section-error {
    min-width: 335px;
    width: auto;
    padding: 0;
  }
}
.right {
  width: 70%;
  padding-left: 10px;

  @media (max-width: 767px) {
    width: 100%;
    margin-top: 16px;
    padding-left: 0;
  }
}
.city-inner {
  position: relative;
  display: inline-block;
  width: 100%;
  .search-btn {
    content: "";
    position: absolute;
    top: -13px;
    right: 10px;
    width: 40px;
    height: 40px;
    background: url("./assets/img/search.svg") no-repeat 50% 50%;
    background-size: contain;
    transform: translateY(50%);
    border-radius: 10px;
    cursor: pointer;
    border: none;
  }
  .location-btn {
    position: absolute;
    top: -13px;
    right: 60px;
    width: 40px;
    height: 40px;
    background: rgba(255, 255, 255, 0.1);
    transform: translateY(50%);
    border-radius: 10px;
    cursor: pointer;
    border: 1px solid rgba(255, 255, 255, 0.3);
    font-size: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;

    &:hover {
      background: rgba(255, 255, 255, 0.2);
    }
  }
}

.history-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: rgba(0, 0, 0, 0.95);
  border-radius: 12px;
  margin-top: 8px;
  padding: 8px 0;
  z-index: 1000;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.history-title {
  padding: 8px 16px;
  font-size: 12px;
  color: rgba($white, 0.6);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.history-item {
  padding: 10px 16px;
  color: $white;
  cursor: pointer;
  transition: background 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }
}

.info {
  height: 100%;
  padding: 16px;
  background: radial-gradient(
    circle,
    rgba(2, 0, 36, 1) 0%,
    rgba(79, 29, 0, 1) 100%
  );
  background-size: cover;
  border-radius: 25px;
  opacity: 0.95;
  box-shadow: 0 0 10px #fff;
}
.search {
  width: 100%;
  padding: 16px;
  font-family: "Inter", Arial, sans-serif;
  color: $white;
  background-color: rgba(0, 0, 0, 0.75);
  border-radius: 16px;
  border: none;
  outline: none;
  cursor: pointer;
}
.section-bottom {
  width: 50%;
  margin-top: 16px;

  @media (max-width: 767px) {
    width: 100%;
  }
}

.error {
  color: rgb(221, 219, 85);
  font-size: 14px;
  text-align: center;
  margin-top: 5px;
}

.loading {
  text-align: center;
  padding: 40px 20px;
  font-size: 18px;
  color: $white;
  animation: pulse 1.5s ease-in-out infinite;
}

.forecast-loading {
  text-align: center;
  padding: 20px;
  font-size: 16px;
  color: rgba($white, 0.8);
  animation: pulse 1.5s ease-in-out infinite;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}
</style>
