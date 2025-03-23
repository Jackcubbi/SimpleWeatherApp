<script setup>
import { ref, onMounted, computed } from "vue";
import { API_KEY, BASE_URL } from "./constants/index";
import { capitalizeFirstLetter } from "./utils";

// Importing child components for displaying weather details
import WeatherSummary from "./components/WeatherSummary.vue";
import Highlights from "./components/Highlights.vue";
import Coords from "./components/Coords.vue";
import Humidity from "./components/Humidity.vue";

// Reactive variable to store the city name
const city = ref("Kauniainen");

// Reactive variable to store fetched weather data
const weatherInfo = ref(null);

// Computed property to check if an error occurred (API response status is not 200)
const isError = computed(() => weatherInfo.value?.cod !== 200);
const errorMessage = ref("");

// Function to fetch weather data from the API
function getWeather() {
  if (!city.value.trim()) {
    errorMessage.value = "Enter the city name!";
    return;
  }

  errorMessage.value = ""; // Clear the error message

  fetch(`${BASE_URL}?q=${city.value}&units=metric&appid=${API_KEY}`)
    .then((response) => response.json())
    .then((data) => (weatherInfo.value = data));
}

// Fetch weather data when the component is mounted
onMounted(getWeather);
</script>

<template>
  <!-- Main page wrapper -->
  <div class="page">
    <div
      v-if="!isError"
      :style="`background-image: url('/src/assets/img/weather/${weatherInfo?.weather[0].description}.jpg');`"
      class="main-bgd-image"
    ></div>
    <main class="main">
      <!-- Main weather container -->
      <div class="container">
        <div class="laptop">
          <!-- Section for input and weather summary -->
          <div class="sections">
            <section :class="['section', 'left', { 'section-error': isError }]">
              <div class="info">
                <div class="city-inner">
                  <!-- Search input field with two-way binding -->
                  <input
                    v-model="city"
                    type="text"
                    class="search"
                    @keyup.enter="getWeather"
                  />
                  <button class="search-btn" @click="getWeather"></button>
                  <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
                </div>

                <!-- Display weather summary if no error -->
                <WeatherSummary v-if="!isError" :weatherInfo="weatherInfo" />
                <!-- Display error message if API returns an error -->
                <div v-else class="summary-not">
                  <h4>Unfortunately, something went wrong!</h4>
                  <p>{{ capitalizeFirstLetter(weatherInfo?.message) }}</p>
                </div>
              </div>
            </section>

            <!-- Right section for additional weather highlights -->
            <section v-if="!isError" class="section right">
              <Highlights :weatherInfo="weatherInfo" />
            </section>
          </div>

          <!-- Section for displaying coordinates and humidity -->
          <div v-if="!isError" class="sections">
            <Coords :coord="weatherInfo.coord" />
            <Humidity :humidity="weatherInfo.main.humidity" />
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<style lang="scss" scoped>
.page {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 20px 0;

  .main-bgd-image {
    width: 100%;
    height: 100%;
    position: absolute;
    background-repeat: no-repeat;
    background-position: center;
    background-size: cover;
    transition: ease-in-out 1s;
  }
}
.laptop {
  width: 100%;
  padding: 20px;
  border-radius: 25px;
  -webkit-backdrop-filter: blur(4px);
  backdrop-filter: blur(4px);
  box-shadow: 0 5px 50px rgba(0, 0, 0, 0.5);
}
.sections {
  display: flex;
  width: 100%;

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
  .search-btn {
    content: "";
    position: absolute;
    top: -13px;
    right: 10px;
    width: 40px;
    height: 40px;
    background: url("./assets/img/search.svg") no-repeat 50% 50%;
    background-size: contain;
    transform: translateY(50%);
    border-radius: 10px;
    cursor: pointer;
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
}
.search {
  width: 100%;
  padding: 16px;
  font-family: "Inter", Arial, sans-serif;
  color: $white;
  background-color: rgba(0, 0, 0, 0.75);
  border-radius: 16px;
  border: none;
  outline: none;
  cursor: pointer;
}
.section-bottom {
  width: 50%;
  margin-top: 16px;

  @media (max-width: 767px) {
    width: 100%;
  }
}

.error {
  color: rgb(221, 219, 85);
  font-size: 14px;
  text-align: center;
  margin-top: 5px;
}
</style>
