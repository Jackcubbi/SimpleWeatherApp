<script setup>
import { computed, ref } from "vue";
import { capitalizeFirstLetter } from "../utils";

// Define component props to receive forecast data from the parent component
const props = defineProps({
  forecastInfo: {
    type: [Object, null],
    required: true,
  },
  isCelsius: {
    type: Boolean,
    default: true,
  },
});

// Track which day is expanded for hourly view
const expandedDay = ref(null);

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
      hourlyData: dayForecasts.map((item) => ({
        time: new Date(item.dt * 1000).toLocaleTimeString("fi-FI", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        }),
        temp: Math.round(item.main.temp),
        feelsLike: Math.round(item.main.feels_like),
        description: item.weather[0].description,
        icon: item.weather[0].description,
        humidity: item.main.humidity,
        windSpeed: item.wind.speed,
        pop: Math.round(item.pop * 100),
      })),
    };

    forecasts.push(dailyForecast);
  });

  return forecasts.slice(0, 5); // Return only 5 days
});

// Toggle hourly view for a specific day
const toggleHourlyView = (index) => {
  expandedDay.value = expandedDay.value === index ? null : index;
};

// Format date for display
const formatDate = (timestamp) => {
  const date = new Date(timestamp * 1000);
  return date.toLocaleDateString("en-EN", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
};

// Format temperature with proper rounding
const formatTemperature = (temp) => {
  return Math.round(temp);
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
          v-for="(forecast, index) in dailyForecasts"
          :key="forecast.dt"
          class="forecast-card"
          :class="{ active: expandedDay === index }"
          @click="toggleHourlyView(index)"
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
              {{ formatTemperature(forecast.main.temp_max) }}°
            </div>
            <div class="temp-min">
              {{ formatTemperature(forecast.main.temp_min) }}°
            </div>
          </div>
          <div class="forecast-desc">
            {{ capitalizeFirstLetter(forecast.weather[0].description) }}
          </div>
        </div>
      </div>

      <!-- Horizontal slide-out hourly panel -->
      <transition name="slide-horizontal">
        <div
          v-if="
            expandedDay !== null &&
            dailyForecasts[expandedDay]?.hourlyData.length > 0
          "
          class="hourly-panel"
        >
          <div class="hourly-panel-header">
            <h4>
              {{ formatDate(dailyForecasts[expandedDay].dt) }} - Hourly Forecast
            </h4>
            <button @click.stop="expandedDay = null" class="close-btn">
              ✕
            </button>
          </div>
          <div class="hourly-scroll-container">
            <div class="hourly-cards-horizontal">
              <div
                v-for="(hour, hourIndex) in dailyForecasts[expandedDay]
                  .hourlyData"
                :key="hourIndex"
                class="hour-card"
              >
                <div class="hour-time">{{ hour.time }}</div>
                <div
                  :style="`background-image: url('assets/img/weather-main/${hour.icon}.png');`"
                  class="hour-icon"
                ></div>
                <div class="hour-temp">
                  {{ Math.round(hour.temp) }}{{ isCelsius ? "°C" : "°F" }}
                </div>
                <div class="hour-feels">
                  Feels {{ Math.round(hour.feelsLike) }}°
                </div>
                <div class="hour-desc">{{ hour.description }}</div>
                <div class="hour-stats">
                  <div class="hour-stat">💧 {{ hour.humidity }}%</div>
                  <div class="hour-stat">
                    💨 {{ Math.round(hour.windSpeed) }} m/s
                  </div>
                  <div v-if="hour.pop > 0" class="hour-stat">
                    🌧️ {{ Math.round(hour.pop * 100) }}%
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </transition>
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
  margin: 0 0 20px 0;
  text-align: center;
  letter-spacing: 0.5px;
}

.forecast-cards {
  display: flex;
  justify-content: space-between;
  gap: 12px;

  @media (max-width: 1024px) {
    gap: 10px;
  }

  @media (max-width: 767px) {
    flex-direction: column;
    gap: 8px;
    padding: 0 8px;
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
  transition: all 0.3s ease;
  cursor: pointer;

  &:hover {
    transform: translateY(-2px);
    background: rgba(0, 0, 0, 0.4);
    box-shadow: 0 4px 12px rgba(255, 255, 255, 0.2);
  }

  &.active {
    background: rgba(0, 0, 0, 0.5);
    border-color: rgba(255, 215, 0, 0.5);
    box-shadow: 0 6px 16px rgba(255, 215, 0, 0.3);
  }

  @media (max-width: 1024px) {
    padding: 14px 6px;
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

  @media (max-width: 1024px) {
    font-size: 12px;
  }

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

  @media (max-width: 1024px) {
    width: 36px;
    height: 36px;
  }

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

  @media (max-width: 1024px) {
    font-size: 15px;
  }
}

.temp-min {
  color: rgba($white, 0.7);
  font-size: 14px;

  @media (max-width: 1024px) {
    font-size: 13px;
  }
}

.forecast-desc {
  color: rgba($white, 0.9);
  font-size: 11px;
  text-align: center;
  line-height: 1.2;

  @media (max-width: 1024px) {
    font-size: 10px;
  }

  @media (max-width: 767px) {
    max-width: 80px;
    text-align: right;
  }
}

// Horizontal hourly panel
.hourly-panel {
  margin-top: 16px;
  padding: 16px;
  background: rgba(0, 0, 0, 0.4);
  border-radius: 16px;
  border: 1px solid rgba(255, 215, 0, 0.3);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);

  @media (max-width: 1024px) {
    padding: 14px;
  }

  @media (max-width: 767px) {
    padding: 12px;
    margin-top: 12px;
  }
}

.hourly-panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;

  h4 {
    color: $white;
    font-size: 16px;
    font-weight: 600;
    margin: 0;

    @media (max-width: 767px) {
      font-size: 14px;
    }
  }
}

.close-btn {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: $white;
  font-size: 18px;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  flex-shrink: 0;

  &:hover {
    background: rgba(255, 255, 255, 0.2);
    transform: scale(1.1);
  }

  @media (max-width: 767px) {
    width: 28px;
    height: 28px;
    font-size: 16px;
  }
}

.hourly-scroll-container {
  overflow-x: auto;
  overflow-y: hidden;
  margin: 0 -16px;
  padding: 0 16px;

  @media (max-width: 767px) {
    margin: 0 -12px;
    padding: 0 12px;
  }

  &::-webkit-scrollbar {
    height: 8px;

    @media (max-width: 767px) {
      height: 6px;
    }
  }

  &::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 10px;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(255, 215, 0, 0.5);
    border-radius: 10px;

    &:hover {
      background: rgba(255, 215, 0, 0.7);
    }
  }
}

.hourly-cards-horizontal {
  display: flex;
  gap: 12px;
  padding-bottom: 8px;

  @media (max-width: 1024px) {
    gap: 10px;
  }

  @media (max-width: 767px) {
    gap: 8px;
  }
}

.hour-card {
  min-width: 140px;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.15);
  transition: all 0.2s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.15);
    transform: translateY(-4px);
    box-shadow: 0 4px 12px rgba(255, 215, 0, 0.2);
  }

  @media (max-width: 1024px) {
    min-width: 130px;
    padding: 11px 10px;
  }

  @media (max-width: 767px) {
    min-width: 120px;
    padding: 10px 8px;
  }
}

.hour-time {
  color: rgba($white, 0.9);
  font-size: 13px;
  font-weight: 700;
  margin-bottom: 8px;

  @media (max-width: 767px) {
    font-size: 12px;
    margin-bottom: 6px;
  }
}

.hour-icon {
  width: 48px;
  height: 48px;
  background-repeat: no-repeat;
  background-position: center;
  background-size: contain;
  margin-bottom: 8px;

  @media (max-width: 767px) {
    width: 40px;
    height: 40px;
    margin-bottom: 6px;
  }
}

.hour-temp {
  color: $white;
  font-size: 18px;
  font-weight: 700;
  margin-bottom: 4px;

  @media (max-width: 767px) {
    font-size: 16px;
  }
}

.hour-feels {
  color: rgba($white, 0.7);
  font-size: 11px;
  margin-bottom: 8px;

  @media (max-width: 767px) {
    font-size: 10px;
    margin-bottom: 6px;
  }
}

.hour-desc {
  color: rgba($white, 0.8);
  font-size: 11px;
  text-align: center;
  margin-bottom: 8px;
  text-transform: capitalize;

  @media (max-width: 767px) {
    font-size: 10px;
    margin-bottom: 6px;
  }
}

.hour-stats {
  display: flex;
  flex-direction: column;
  gap: 4px;
  width: 100%;

  @media (max-width: 767px) {
    gap: 3px;
  }
}

.hour-stat {
  color: rgba($white, 0.8);
  font-size: 11px;
  text-align: center;
  line-height: 1.3;

  @media (max-width: 767px) {
    font-size: 10px;
  }
}

// Horizontal slide transition
.slide-horizontal-enter-active,
.slide-horizontal-leave-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-horizontal-enter-from {
  opacity: 0;
  transform: translateX(-30px);
}

.slide-horizontal-leave-to {
  opacity: 0;
  transform: translateX(30px);
}
</style>
