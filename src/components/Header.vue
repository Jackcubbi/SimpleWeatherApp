<script setup>
import { ref } from 'vue';
import { useWeatherStore } from '@/stores/weather';

const weatherStore = useWeatherStore();

// Local UI state
const showFavorites = ref(false);

// Select city from favorites
function selectFromFavorites(cityName) {
  weatherStore.city = cityName;
  showFavorites.value = false;
  weatherStore.getWeather();
}
</script>

<template>
  <header>
    <div class="header-content">
      <div>
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
      </div>
      <div>
        <h1 class="header-title">Simple Weather App</h1>
        <p class="header-subtitle">Your daily weather companion</p>
      </div>

      <div>
        <!-- Unit toggle button -->
        <button
          class="unit-toggle"
          :title="`Switch to ${weatherStore.isCelsius ? 'Fahrenheit' : 'Celsius'}`"
          @click="weatherStore.toggleUnits"
        >
          {{ weatherStore.isCelsius ? '°F' : '°C' }}
        </button>
      </div>
    </div>
  </header>
</template>
