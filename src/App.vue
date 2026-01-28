<script setup>
import { ref, onMounted } from 'vue';
import { useWeatherStore } from './stores/weather';
import { capitalizeFirstLetter } from './utils';

// Importing child components for displaying weather details
import WeatherSummary from './components/WeatherSummary.vue';
import Highlights from './components/Highlights.vue';
import Coords from './components/Coords.vue';
import Humidity from './components/Humidity.vue';
import WeatherForecast from './components/WeatherForecast.vue';
import HourlyForecast from './components/HourlyForecast.vue';
import Footer from './components/Footer.vue';

// Use weather store
const weatherStore = useWeatherStore();

// Local UI state (not in store)
const showHistory = ref(false);
const showFavorites = ref(false);

// Select city from history
function selectFromHistory(cityName) {
  weatherStore.city = cityName;
  showHistory.value = false;
  weatherStore.getWeather();
}

// Select city from favorites
function selectFromFavorites(cityName) {
  weatherStore.city = cityName;
  showFavorites.value = false;
  weatherStore.getWeather();
}

// Hide history dropdown with delay
function hideHistory() {
  setTimeout(() => {
    showHistory.value = false;
  }, 200);
}

// Fetch weather data when the component is mounted
onMounted(() => {
  weatherStore.initialize();
});
</script>

<template>
  <!-- Main page wrapper -->
  <div class="page">
    <!-- Favorites toggle button -->
    <button
      class="favorites-toggle"
      :title="showFavorites ? 'Hide favorites' : 'Show favorites'"
      @click="showFavorites = !showFavorites"
    >
      ★ {{ weatherStore.favorites.length }}
    </button>

    <!-- Favorites panel -->
    <transition name="slide-down">
      <div
        v-if="showFavorites && weatherStore.favorites.length > 0"
        class="favorites-panel"
      >
        <div class="favorites-title">Favorite Cities</div>
        <div class="favorites-grid">
          <button
            v-for="(favCity, index) in weatherStore.favorites"
            :key="index"
            class="favorite-city-btn"
            @click="selectFromFavorites(favCity)"
          >
            {{ favCity }}
          </button>
        </div>
      </div>
    </transition>

    <!-- Unit toggle button -->
    <button
      class="unit-toggle"
      :title="`Switch to ${weatherStore.isCelsius ? 'Fahrenheit' : 'Celsius'}`"
      @click="weatherStore.toggleUnits"
    >
      {{ weatherStore.isCelsius ? '°F' : '°C' }}
    </button>

    <!-- Offline indicator -->
    <div v-if="weatherStore.isOffline" class="offline-banner">
      📦 Showing cached data
    </div>

    <div
      v-if="!weatherStore.isError"
      :style="`background-image: url('assets/img/main-backgrounds/${weatherStore.weatherInfo?.weather[0].description}.jpg');`"
      class="main-bgd-image"
    ></div>
    <main class="main">
      <!-- Main weather container -->
      <div class="container">
        <div class="laptop">
          <!-- Section for input and weather summary -->
          <div class="sections">
            <section
              :class="[
                'section',
                'left',
                { 'section-error': weatherStore.isError },
              ]"
            >
              <div class="info">
                <div class="city-inner">
                  <!-- Search input field with two-way binding -->
                  <input
                    id="city-search-input"
                    v-model="weatherStore.city"
                    type="text"
                    class="search"
                    placeholder="Enter city name..."
                    autocomplete="off"
                    @keyup.enter="weatherStore.getWeather"
                    @focus="showHistory = true"
                    @blur="hideHistory"
                  />
                  <button
                    class="location-btn"
                    title="Use my location"
                    @click="weatherStore.useMyLocation"
                  >
                    📍
                  </button>
                  <button
                    class="search-btn"
                    @click="weatherStore.getWeather"
                  ></button>

                  <!-- Search History Dropdown -->
                  <transition name="dropdown">
                    <div
                      v-if="
                        showHistory && weatherStore.searchHistory.length > 0
                      "
                      class="history-dropdown"
                    >
                      <div class="history-title">Recent Searches</div>
                      <div
                        v-for="(
                          historyCity, index
                        ) in weatherStore.searchHistory"
                        :key="index"
                        class="history-item"
                        @click="selectFromHistory(historyCity)"
                      >
                        {{ historyCity }}
                      </div>
                    </div>
                  </transition>

                  <p v-if="weatherStore.errorMessage" class="error">
                    {{ weatherStore.errorMessage }}
                  </p>
                  <p v-if="weatherStore.isLoading" class="loading">
                    Loading weather data...
                  </p>
                </div>

                <!-- Display weather summary if no error -->
                <transition name="fade" mode="out-in">
                  <WeatherSummary
                    v-if="!weatherStore.isError && !weatherStore.isLoading"
                    :weather-info="weatherStore.weatherInfo"
                    :is-celsius="weatherStore.isCelsius"
                    :is-favorited="weatherStore.isFavorited"
                    @toggle-favorite="weatherStore.toggleFavorite"
                  />
                </transition>

                <!-- Display error message if API returns an error -->
                <transition name="fade" mode="out-in">
                  <div
                    v-if="weatherStore.isError && !weatherStore.isLoading"
                    class="summary-not"
                  >
                    <h4>Unfortunately, something went wrong!</h4>
                    <p>
                      {{
                        capitalizeFirstLetter(weatherStore.weatherInfo?.message)
                      }}
                    </p>
                  </div>
                </transition>
              </div>
            </section>

            <!-- Right section for additional weather highlights -->
            <transition name="slide-left">
              <section
                v-if="!weatherStore.isError && !weatherStore.isLoading"
                class="section right"
              >
                <Highlights :weather-info="weatherStore.weatherInfo" />
              </section>
            </transition>
          </div>

          <!-- Hourly Forecast Section -->
          <transition name="fade">
            <div
              v-if="
                !weatherStore.isError &&
                !weatherStore.isLoading &&
                weatherStore.hourlyForecast.length > 0
              "
              class="hourly-forecast-wrapper"
            >
              <HourlyForecast
                :hourly-data="weatherStore.hourlyForecast"
                :is-celsius="weatherStore.isCelsius"
              />
            </div>
          </transition>

          <!-- Section for displaying 5 days forecast -->
          <transition name="fade">
            <div
              v-if="!weatherStore.isError && !weatherStore.isLoading"
              class="sections"
            >
              <WeatherForecast
                v-if="
                  !weatherStore.isForecastLoading &&
                  weatherStore.forecastInfo.list.length > 0
                "
                :forecast-info="weatherStore.forecastInfo"
                :is-celsius="weatherStore.isCelsius"
              />
              <p v-if="weatherStore.isForecastLoading" class="forecast-loading">
                Loading forecast...
              </p>
            </div>
          </transition>

          <!-- Section for displaying coordinates and humidity -->
          <div
            v-if="!weatherStore.isError && !weatherStore.isLoading"
            class="sections"
          >
            <Coords :coord="weatherStore.weatherInfo.coord" />
            <Humidity :humidity="weatherStore.weatherInfo.main.humidity" />
          </div>
        </div>
      </div>

      <!-- Footer -->
      <Footer />
    </main>
  </div>
</template>
