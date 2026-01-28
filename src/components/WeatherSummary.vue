<script setup>
// Importing a utility function for formatting text
import { capitalizeFirstLetter } from '../utils';

// Defining component props to receive weather data from the parent component
defineProps({
  weatherInfo: {
    type: [Object, null],
    required: true,
  },
  isCelsius: {
    type: Boolean,
    default: true,
  },
  isFavorited: {
    type: Boolean,
    default: false,
  },
});

// Define emits
const emit = defineEmits(['toggle-favorite']);

// Creating a formatted string for today's date
const today = new Date().toLocaleString('en-EN', {
  weekday: 'short',
  year: 'numeric',
  month: 'long',
  day: 'numeric',
});
</script>

<template>
  <!-- Main container for weather summary -->
  <div class="summary">
    <!-- Favorite button -->
    <button
      class="favorite-btn"
      :title="isFavorited ? 'Remove from favorites' : 'Add to favorites'"
      @click="emit('toggle-favorite')"
    >
      {{ isFavorited ? '★' : '☆' }}
    </button>

    <div
      :style="`background-image: url('assets/img/weather-main/${weatherInfo?.weather[0].description}.png');`"
      class="pic-main"
    ></div>
    <div class="weather">
      <div class="temperature">
        <div class="temp">
          {{ Math.round(weatherInfo?.main?.temp * 2) / 2 }}
          {{ isCelsius ? '°C' : '°F' }}
          <!-- Display temperature with dynamic unit -->
        </div>
        <div class="card-small feels-like">
          <div class="card-small-info">
            <div class="card-small-data">
              <!-- Display "feels like" temperature rounded to 0.5 increments -->
              <div class="card-small-title">Feels like:</div>
              <div class="info-main-num">
                {{ Math.round(weatherInfo?.main?.feels_like * 2) / 2 }}
              </div>
              <div class="info-main-text">{{ isCelsius ? '°C' : '°F' }}</div>
            </div>
            <div class="card-small-hint">
              <div class="card-small-text">How hot or cold it really feels</div>
            </div>
          </div>
        </div>
      </div>

      <div class="weather-desc text-block">
        {{ capitalizeFirstLetter(weatherInfo?.weather[0].description) }}
      </div>
    </div>
    <div class="city text-block">
      {{ weatherInfo?.name }}, {{ weatherInfo?.sys?.country }}
    </div>
    <div class="date text-block">
      {{ today }}
    </div>
  </div>
</template>
