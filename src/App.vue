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

// Function to fetch weather data from the API
function getWeather() {
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
  background: url(./assets/img/bg-cold.jpg) no-repeat 50% 50%;
  background-size: cover;
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

  &::after {
    content: "";
    position: absolute;
    top: 0;
    right: 10px;
    width: 25px;
    height: 25px;
    background: url("./assets/img/search.svg") no-repeat 50% 50%;
    background-size: contain;
    transform: translateY(50%);
    cursor: pointer;
  }
}
.info {
  height: 100%;
  padding: 16px;
  background: url("./assets/img/gradient-1.jpg") no-repeat 50% 50%;
  background-size: cover;
  border-radius: 25px;
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
</style>
