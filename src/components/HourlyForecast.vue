<script setup>
import { capitalizeFirstLetter } from "../utils";

const props = defineProps({
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
          {{ Math.round(hour.temp) }}{{ isCelsius ? "°C" : "°F" }}
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

<style lang="scss" scoped>
@use "@/assets/styles/variables" as *;

.hourly-forecast {
  width: 100%;
  max-width: 100%;
  margin: 16px 0;
  padding: 20px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 16px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  overflow: hidden;
  box-sizing: border-box;
}

.hourly-title {
  color: $white;
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 8px;

  .title-icon {
    font-size: 22px;
  }
}

.hourly-scroll {
  display: flex;
  gap: 12px;
  overflow-x: auto;
  overflow-y: hidden;
  padding: 8px 0;
  scroll-behavior: smooth;
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 255, 255, 0.3) rgba(0, 0, 0, 0.2);
  -webkit-overflow-scrolling: touch;

  &::-webkit-scrollbar {
    height: 8px;
  }

  &::-webkit-scrollbar-track {
    background: rgba(0, 0, 0, 0.2);
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.3);
    border-radius: 4px;

    &:hover {
      background: rgba(255, 255, 255, 0.5);
    }
  }

  @media (max-width: 767px) {
    gap: 10px;

    &::-webkit-scrollbar {
      height: 6px;
    }
  }

  @media (max-width: 480px) {
    gap: 8px;

    &::-webkit-scrollbar {
      height: 5px;
    }
  }
}

.hour-card {
  min-width: 140px;
  flex-shrink: 0;
  padding: 16px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: all 0.3s ease;
  cursor: pointer;
  backdrop-filter: blur(5px);

  &:hover {
    background: rgba(255, 255, 255, 0.15);
    transform: translateY(-4px);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.3);
  }
}

.hour-time {
  color: rgba($white, 0.8);
  font-size: 14px;
  font-weight: 600;
  text-align: center;
  margin-bottom: 12px;
}

.hour-icon {
  width: 50px;
  height: 50px;
  margin: 0 auto 12px;
  background-repeat: no-repeat;
  background-position: center;
  background-size: contain;
}

.hour-temp {
  color: $white;
  font-size: 22px;
  font-weight: bold;
  text-align: center;
  margin-bottom: 12px;
}

.hour-details {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 6px;
  color: rgba($white, 0.8);
  font-size: 14px;

  &.precipitation {
    color: #4fc3f7;
  }

  .detail-icon {
    font-size: 14px;
  }
}

// Tablet landscape and smaller desktops
@media (max-width: 1024px) {
  .hourly-forecast {
    padding: 18px;
  }

  .hour-card {
    min-width: 130px;
    padding: 14px 12px;
  }

  .hour-icon {
    width: 46px;
    height: 46px;
  }

  .hour-temp {
    font-size: 20px;
  }

  .detail-item {
    font-size: 13px;
  }
}

// Tablet portrait
@media (max-width: 767px) {
  .hourly-forecast {
    padding: 14px;
    margin: 12px 0;
  }

  .hourly-title {
    font-size: 16px;
    margin-bottom: 12px;

    .title-icon {
      font-size: 18px;
    }
  }

  .hour-card {
    min-width: 110px;
    padding: 10px 8px;
    border-radius: 10px;
  }

  .hour-time {
    font-size: 12px;
    margin-bottom: 8px;
  }

  .hour-icon {
    width: 40px;
    height: 40px;
    margin-bottom: 8px;
  }

  .hour-temp {
    font-size: 18px;
    margin-bottom: 10px;
  }

  .hour-details {
    gap: 4px;
  }

  .detail-item {
    font-size: 12px;
    gap: 4px;
    line-height: 1.3;

    .detail-icon {
      font-size: 12px;
    }
  }
}

@media (max-width: 480px) {
  .hourly-forecast {
    padding: 12px;
    margin: 10px 0;
  }

  .hourly-title {
    font-size: 15px;
  }

  .hour-card {
    min-width: 100px;
    padding: 8px 6px;
    border-radius: 8px;
  }

  .hour-time {
    font-size: 11px;
  }

  .hour-icon {
    width: 36px;
    height: 36px;
  }

  .hour-temp {
    font-size: 16px;
  }

  .detail-item {
    font-size: 11px;
  }
}
</style>
