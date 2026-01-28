<script setup>
import lottie from 'lottie-web';
import { computed, onMounted } from 'vue'; // Import computed properties from Vue
import { getPressureMm, getTime } from '@/utils'; // Import utility functions

// Define component props
const props = defineProps({
  weatherInfo: {
    type: [Object, null],
    required: true,
  },
});

// Compute sunrise time using the getTime utility function
const sunriseTime = computed(() => {
  return getTime(props.weatherInfo?.sys?.sunrise);
});

// Compute sunset time using the getTime utility function
const sunsetTime = computed(() => {
  return getTime(props.weatherInfo?.sys?.sunset);
});

onMounted(() => {
  const animations = [
    { id: 'card-pic-wind', path: 'assets/img/wind.json' },
    {
      id: 'card-pic-sunrise-sunset',
      path: 'assets/img/sunrise-sunset.json',
    },
  ];

  animations.forEach(({ id, path }) => {
    const container = document.getElementById(id);
    if (container) {
      lottie.loadAnimation({
        container,
        path,
        renderer: 'svg',
        loop: true,
        autoplay: true,
        name: 'demo animation',
      });
    }
  });
});
</script>

<template>
  <div class="section highlights">
    <div class="title">Today's Highlights</div>
    <div class="highlights-wrapper">
      <!-- Wind Information Card -->
      <div class="highlight">
        <div class="card">
          <div class="card-title">Wind</div>
          <div
            id="card-pic-wind"
            class="card-pic"
            role="img"
            aria-label="Wind icon"
          ></div>

          <div class="card-info">
            <div class="card-justify">
              <!-- Display wind speed rounded to one decimal place -->
              <div class="info-main">
                <div class="info-main-num">
                  {{ Math.round(weatherInfo?.wind?.speed * 10) / 10 }}
                </div>
                <div class="info-main-text">m/s</div>
              </div>

              <!-- Display wind direction in degrees -->
              <div class="info-main">
                <div class="info-main-num">{{ weatherInfo?.wind?.deg }}</div>
                <div class="info-main-text">deg</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Wind Gusts Small Card -->
        <div class="card-small">
          <div class="card-small-title">Wind gusts</div>
          <div class="card-small-info">
            <div v-if="weatherInfo?.wind?.gust" class="card-small-data">
              <!-- Display wind gusts rounded to one decimal place -->
              <div class="info-main-num">
                {{ Math.round(weatherInfo?.wind?.gust * 10) / 10 }}
              </div>
              <div class="info-main-text">m/s</div>
            </div>
            <div class="card-small-hint">
              <div class="card-small-pic card-small-pic--wind"></div>
              <div class="card-small-text text-egorova">
                Learn
                <a
                  href="https://www.windy.com/articles/weather-phenomena-what-s-the-difference-between-sustained-winds-and-wind-gusts-10390?satellite,7.787,115.115,5"
                  target="_blank"
                  >more</a
                >
                about gusts
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Pressure Information Card -->
      <div class="highlight">
        <div class="card">
          <div class="card-title">Pressure</div>
          <div class="card-pic card-pic--pressure"></div>
          <div class="card-info">
            <div class="card-centered">
              <!-- Display pressure converted to mmHg -->
              <div class="info-main">
                <div class="info-main-num">
                  {{ getPressureMm(weatherInfo?.main?.grnd_level) }}
                </div>
                <div class="info-main-text">mmHg</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Feels Like Temperature Small Card -->
        <div class="card-small">
          <div class="card-small-title">Sea level</div>
          <div class="card-small-info">
            <div class="card-small-data">
              <!-- Display "feels like" temperature rounded to 0.5°C increments -->
              <div class="info-main-num">
                {{ getPressureMm(weatherInfo?.main?.sea_level) }}
              </div>
              <div class="info-main-text">mmHg</div>
            </div>
            <div class="card-small-hint">
              <div
                class="card-small-pic card-small-pic--margin card-small-pic--pressure"
              ></div>
              <div class="card-small-text">The mean sea-level pressure</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Sunrise & Sunset Information Card -->
      <div class="highlight">
        <div class="card">
          <div class="card-title">Sunrise and sunset</div>
          <div
            id="card-pic-sunrise-sunset"
            class="card-pic"
            role="img"
            aria-label="Sunrise and sunset icon"
          ></div>
          <div class="card-info">
            <div class="states">
              <div class="state">
                <div class="state-pic"></div>
                <div class="state-title">Sunrise</div>
                <!-- Display computed sunrise time -->
                <div class="state-time">{{ sunriseTime }}</div>
              </div>
              <div class="state">
                <div class="state-pic state-pic--flipped"></div>
                <div class="state-title">Sunset</div>
                <!-- Display computed sunset time -->
                <div class="state-time">{{ sunsetTime }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Cloudiness Small Card -->
        <div class="card-small">
          <div class="card-small-title">Cloudiness</div>
          <div class="card-small-info">
            <div class="card-small-data">
              <!-- Display cloud coverage in percentage -->
              <div class="info-main-num">
                {{ weatherInfo?.clouds?.all }}
              </div>
              <div class="info-main-text">%</div>
            </div>
            <div class="card-small-hint">
              <div class="card-small-pic card-small-pic--sun"></div>
              <div class="card-small-text">
                The sky fraction obscured by clouds
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
