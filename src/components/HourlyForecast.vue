<script setup>
import { capitalizeFirstLetter } from '../utils';

defineProps({
  hourlyData: {
    type: Array,
    required: true,
  },
  isCelsius: {
    type: Boolean,
    default: true,
  },
});
</script>

<template>
  <div class="hourly-forecast">
    <h3 class="hourly-title">
      <span class="title-icon">🕐</span>
      Hourly Forecast (Next 24 Hours)
    </h3>

    <div class="hourly-scroll">
      <div v-for="(hour, index) in hourlyData" :key="index" class="hour-card">
        <div class="hour-time">{{ hour.time }}</div>

        <div
          class="hour-icon"
          :style="`background-image: url('assets/img/weather-main/${hour.icon}.png');`"
          :title="capitalizeFirstLetter(hour.description)"
        ></div>

        <div class="hour-temp">
          {{ Math.round(hour.temp) }}{{ isCelsius ? '°C' : '°F' }}
        </div>

        <div class="hour-details">
          <div class="detail-item" title="Feels like">
            <span class="detail-icon">🌡️ Feels: </span>
            {{ hour.feelsLike }}°
          </div>

          <div class="detail-item" title="Humidity">
            <span class="detail-icon">💧</span>
            {{ hour.humidity }}%
          </div>

          <div class="detail-item" title="Wind speed">
            <span class="detail-icon">💨</span>
            {{ hour.windSpeed }} m/s
          </div>

          <div
            v-if="hour.pop > 0"
            class="detail-item precipitation"
            title="Chance of rain"
          >
            <span class="detail-icon">🌧️</span>
            {{ hour.pop }}%
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
