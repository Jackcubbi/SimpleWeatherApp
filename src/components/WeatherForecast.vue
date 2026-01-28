<script setup>
import { computed, ref } from 'vue';
import { capitalizeFirstLetter } from '../utils';

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
        time: new Date(item.dt * 1000).toLocaleTimeString('fi-FI', {
          hour: '2-digit',
          minute: '2-digit',
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
  return date.toLocaleDateString('en-EN', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
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
            <button class="close-btn" @click.stop="expandedDay = null">
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
                  {{ Math.round(hour.temp) }}{{ isCelsius ? '°C' : '°F' }}
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
                    🌧️ {{ hour.pop }}%
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
