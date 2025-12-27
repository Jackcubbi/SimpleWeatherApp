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
  width: 100%;
  overflow-x: hidden;

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

.main {
  width: 100%;
  max-width: 100%;
}

.laptop {
  width: 100%;
  max-width: 100%;
  padding: 20px;
  -webkit-backdrop-filter: blur(4px);
  backdrop-filter: blur(4px);
  overflow: hidden;
  box-sizing: border-box;
  margin: 5rem 0;
  border-radius: 20px;

  @media (max-width: 1300px) {
    padding: 1rem;
  }

  @media (max-width: 1024px) {
    padding: 1rem;
  }

  @media (max-width: 767px) {
    padding: 0.8rem;
  }

  @media (max-width: 480px) {
    padding: 0.5rem;
  }
}

.sections {
  display: flex;
  width: 100%;
  justify-content: center;

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

  @media (max-width: 480px) {
    .search {
      padding-right: 100px; // Make room for both buttons
    }
  }

  .search-btn {
    content: '';
    position: absolute;
    top: -13px;
    right: 10px;
    width: 40px;
    height: 40px;
    background: url('./assets/img/search.svg') no-repeat 50% 50%;
    background-size: contain;
    transform: translateY(50%);
    border-radius: 10px;
    cursor: pointer;
    border: none;

    @media (max-width: 480px) {
      width: 36px;
      height: 36px;
      right: 8px;
    }
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

    @media (max-width: 480px) {
      width: 36px;
      height: 36px;
      right: 52px;
      font-size: 18px;
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
  max-height: 300px;
  overflow-y: auto;
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

  @media (max-width: 480px) {
    padding: 12px;
  }
}
.search {
  width: 100%;
  padding: 16px;
  font-family: 'Inter', Arial, sans-serif;
  color: $white;
  background-color: rgba(0, 0, 0, 0.75);
  border-radius: 16px;
  border: none;
  outline: none;
  cursor: pointer;

  @media (max-width: 480px) {
    padding: 14px;
    padding-right: 100px;
    font-size: 15px;
  }
}
.section-bottom {
  width: 50%;
  margin-top: 16px;

  @media (max-width: 767px) {
    width: 100%;
  }
}

.hourly-forecast-wrapper {
  width: 100%;
  max-width: 100%;
  overflow: hidden;
  box-sizing: border-box;
}

.error {
  color: rgb(221, 219, 85);
  font-size: 14px;
  text-align: center;
  margin-top: 5px;

  @media (max-width: 480px) {
    font-size: 13px;
  }
}

.loading {
  text-align: center;
  padding: 40px 20px;
  font-size: 18px;
  color: $white;
  animation: pulse 1.5s ease-in-out infinite;

  @media (max-width: 480px) {
    padding: 30px 15px;
    font-size: 16px;
  }
}

.forecast-loading {
  text-align: center;
  padding: 20px;
  font-size: 16px;
  color: rgba($white, 0.8);
  animation: pulse 1.5s ease-in-out infinite;

  @media (max-width: 480px) {
    padding: 15px;
    font-size: 14px;
  }
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.6;
  }
}

// Vue Transitions
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.dropdown-enter-active {
  animation: dropdownIn 0.3s ease-out;
}

.dropdown-leave-active {
  animation: dropdownOut 0.2s ease-in;
}

@keyframes dropdownIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes dropdownOut {
  from {
    opacity: 1;
    transform: translateY(0);
  }
  to {
    opacity: 0;
    transform: translateY(-10px);
  }
}

.slide-left-enter-active {
  animation: slideLeftIn 0.4s ease-out;
}

.slide-left-leave-active {
  animation: slideLeftOut 0.3s ease-in;
}

@keyframes slideLeftIn {
  from {
    opacity: 0;
    transform: translateX(30px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes slideLeftOut {
  from {
    opacity: 1;
    transform: translateX(0);
  }
  to {
    opacity: 0;
    transform: translateX(30px);
  }
}

.slide-down-enter-active {
  animation: slideDownIn 0.3s ease-out;
}

.slide-down-leave-active {
  animation: slideDownOut 0.2s ease-in;
}

@keyframes slideDownIn {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideDownOut {
  from {
    opacity: 1;
    transform: translateY(0);
  }
  to {
    opacity: 0;
    transform: translateY(-20px);
  }
}
</style>
