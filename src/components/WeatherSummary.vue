<script setup>
// Importing a utility function for formatting text
import { capitalizeFirstLetter } from "../utils";

// Defining component props to receive weather data from the parent component
const props = defineProps({
  weatherInfo: {
    type: [Object, null],
    required: true,
  },
});

// Creating a formatted string for today's date
const today = new Date().toLocaleString("en-EN", {
  weekday: "short",
  year: "numeric",
  month: "long",
  day: "numeric",
});
</script>

<template>
  <!-- Main container for weather summary -->
  <div class="summary">
    <div
      :style="`background-image: url('img/weather-main/${weatherInfo?.weather[0].description}.png');`"
      class="pic-main"
    ></div>
    <div class="weather">
      <div class="temperature">
        <div class="temp">
          {{ Math.round(weatherInfo?.main?.temp * 2) / 2 }} °C
          <!-- Display "feels like" temperature rounded to 0.5°C increments -->
        </div>
        <div class="card-small feels-like">
          <div class="card-small-info">
            <div class="card-small-data">
              <!-- Display "feels like" temperature rounded to 0.5°C increments -->
              <div class="card-small-title">Feels like:</div>
              <div class="info-main-num">
                {{ Math.round(weatherInfo?.main?.feels_like * 2) / 2 }}
              </div>
              <div class="info-main-text">°C</div>
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

<style lang="scss" scoped>
.pic-main {
  width: 60px;
  height: 60px;
  margin: 20px 0 12px;
  background-repeat: no-repeat;
  background-position: 50% 50%;
  background-size: contain;
}
.city {
  font-size: 24px;
}
.weather {
  margin: 0 0 20px;
  padding: 20px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.4);
  .temperature {
    display: flex;
    .card-small {
      padding: 0 16px;
      background-size: cover;
      border-radius: 8px;

      &-title {
        font-size: 13px;
        margin-right: 5px;
      }
      &-info {
        display: flex;
        flex-direction: column;
        justify-content: space-between;

        @media (max-width: 1199px) {
          flex-direction: column;
          align-items: flex-start;
        }
      }
      &-data {
        display: flex;
        align-items: center;

        @media (max-width: 1199px) {
          width: 100%;
          padding-top: 8px;
        }
      }
      &-hint {
        @media (max-width: 1199px) {
          width: 100%;
        }
      }
      &-text {
        font-size: 11px;
        line-height: 1.2;
        color: rgba($white, 0.6);

        @media (max-width: 1199px) {
          min-height: 22px;
          font-size: 9px;
        }
      }
    }
  }
}
.temp {
  padding-bottom: 8px;
  font-size: 32px;
  width: 60%;
}
.text-block {
  position: relative;
  padding-left: 24px;
  padding-bottom: 8px;
  font-size: 14px;

  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    width: 20px;
    height: 20px;
    margin-right: 6px;
    background-repeat: no-repeat;
    background-position: 50% 50%;
    background-size: contain;
  }
}
.weather-desc {
  &::before {
    background-image: url("../src/assets/img/weather.svg");
  }
}
.city {
  &::before {
    background-image: url("../src/assets/img/location.svg");
  }
}
.date {
  &::before {
    left: 2px;
    width: 15px;
    height: 15px;
    background-image: url("/src/assets/img/calendar.svg");
  }
}
</style>
