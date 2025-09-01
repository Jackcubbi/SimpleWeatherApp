<script setup>
import { computed } from "vue";
import { capitalizeFirstLetter } from "../utils";

// Define component props to receive forecast data from the parent component
const props = defineProps({
  forecastInfo: {
    type: [Object, null],
    required: true,
  },
});

// Process forecast data to get daily forecasts (one per day for 5 days)
const dailyForecasts = computed(() => {
  if (!props.forecastInfo?.list) return [];

  const forecasts = [];
  const today = new Date().toDateString();

  // Group forecasts by date
  const groupedByDate = {};

  props.forecastInfo.list.forEach((item) => {
    const date = new Date(item.dt * 1000);
    const dateString = date.toDateString();

    // Skip today's forecast
    if (dateString === today) return;

    if (!groupedByDate[dateString]) {
      groupedByDate[dateString] = [];
    }
    groupedByDate[dateString].push(item);
  });

  // Process each day to get high/low temps and representative forecast
  Object.keys(groupedByDate).forEach((dateString) => {
    const dayForecasts = groupedByDate[dateString];

    // Find the actual high and low temperatures for the day
    let tempMax = Math.max(...dayForecasts.map((f) => f.main.temp_max));
    let tempMin = Math.min(...dayForecasts.map((f) => f.main.temp_min));

    // Find a representative forecast (preferably around noon for weather conditions)
    const representativeForecast =
      dayForecasts.find((f) => {
        const hour = new Date(f.dt * 1000).getHours();
        return hour >= 11 && hour <= 13;
      }) || dayForecasts[Math.floor(dayForecasts.length / 2)]; // Fallback to middle forecast

    // Create a combined forecast object with actual daily high/low
    const dailyForecast = {
      ...representativeForecast,
      main: {
        ...representativeForecast.main,
        temp_max: tempMax,
        temp_min: tempMin,
      },
    };

    forecasts.push(dailyForecast);
  });

  return forecasts.slice(0, 5); // Return only 5 days
});

// Format date for display
const formatDate = (timestamp) => {
  const date = new Date(timestamp * 1000);
  return date.toLocaleDateString("en-EN", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
};
</script>

<template>
  <section
    v-if="forecastInfo && dailyForecasts.length > 0"
    class="forecast-section"
  >
    <div class="forecast-container">
      <h3 class="forecast-title">5-Day Forecast</h3>
      <div class="forecast-cards">
        <div
          v-for="forecast in dailyForecasts"
          :key="forecast.dt"
          class="forecast-card"
        >
          <div class="forecast-date">
            {{ formatDate(forecast.dt) }}
          </div>
          <div
            :style="`background-image: url('assets/img/weather-main/${forecast.weather[0].description}.png');`"
            class="forecast-icon"
          ></div>
          <div class="forecast-temp">
            <div class="temp-max">
              {{ Math.round(forecast.main.temp_max) }}°
            </div>
            <div class="temp-min">
              {{ Math.round(forecast.main.temp_min) }}°
            </div>
          </div>
          <div class="forecast-desc">
            {{ capitalizeFirstLetter(forecast.weather[0].description) }}
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style lang="scss" scoped>
.forecast-section {
  width: 100%;
  margin-top: 16px;
}

.forecast-container {
  padding: 20px 16px 16px;
  background: radial-gradient(
    circle,
    rgba(2, 0, 36, 1) 0%,
    rgba(79, 29, 0, 1) 100%
  );
  border-radius: 25px;
  opacity: 0.95;
  box-shadow: 0 0 10px #fff;
}

.forecast-title {
  color: $white;
  font-size: 18px;
  font-weight: 700;
  margin: 0 0 16px 0;
  text-align: center;
}

.forecast-cards {
  display: flex;
  justify-content: space-between;
  gap: 12px;

  @media (max-width: 767px) {
    flex-direction: column;
    gap: 8px;
  }
}

.forecast-card {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px 8px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: transform 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    background: rgba(0, 0, 0, 0.4);
  }

  @media (max-width: 767px) {
    flex-direction: row;
    justify-content: space-between;
    padding: 12px 16px;
  }
}

.forecast-date {
  color: $white;
  font-size: 13px;
  font-weight: 600;
  margin-bottom: 8px;
  text-align: center;

  @media (max-width: 767px) {
    margin-bottom: 0;
    min-width: 60px;
  }
}

.forecast-icon {
  width: 40px;
  height: 40px;
  background-repeat: no-repeat;
  background-position: center;
  background-size: contain;
  margin-bottom: 8px;

  @media (max-width: 767px) {
    margin-bottom: 0;
  }
}

.forecast-temp {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 8px;

  @media (max-width: 767px) {
    flex-direction: row;
    gap: 8px;
    margin-bottom: 0;
  }
}

.temp-max {
  color: $white;
  font-size: 16px;
  font-weight: 700;
}

.temp-min {
  color: rgba($white, 0.7);
  font-size: 14px;
}

.forecast-desc {
  color: rgba($white, 0.9);
  font-size: 11px;
  text-align: center;
  line-height: 1.2;

  @media (max-width: 767px) {
    max-width: 80px;
    text-align: right;
  }
}
</style>
