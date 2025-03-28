<script setup>
import lottie from "lottie-web";
import { computed, onMounted } from "vue"; // Import computed properties from Vue
import { getPressureMm, getTime } from "@/utils"; // Import utility functions

// Define component props
const props = defineProps({
  weatherInfo: {
    type: [Object, null],
    required: true,
  },
});

// Compute timezone from weatherInfo object
const timezone = computed(() => props.weatherInfo?.timezone);

// Compute sunrise time using the getTime utility function
const sunriseTime = computed(() => {
  return getTime(props.weatherInfo?.sys?.sunrise + timezone.value);
});

// Compute sunset time using the getTime utility function
const sunsetTime = computed(() => {
  return getTime(props.weatherInfo?.sys?.sunset + timezone.value);
});

onMounted(() => {
  const animations = [
    { id: "card-pic-wind", path: "assets/img/wind.json" },
    {
      id: "card-pic-sunrise-sunset",
      path: "assets/img/sunrise-sunset.json",
    },
  ];

  animations.forEach(({ id, path }) => {
    const container = document.getElementById(id);
    if (container) {
      lottie.loadAnimation({
        container,
        path,
        renderer: "svg",
        loop: true,
        autoplay: true,
        name: "demo animation",
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
          <div class="card-pic" id="card-pic-wind"></div>

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
          <div class="card-pic" id="card-pic-sunrise-sunset"></div>
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

<style lang="scss" scoped>
.highlights {
  padding: 28px 16px 16px;
  background: radial-gradient(
    circle,
    rgba(2, 0, 36, 1) 0%,
    rgba(79, 29, 0, 1) 100%
  );
  background-size: cover;
  border-radius: 25px;
  opacity: 0.95;
  box-shadow: 0 0 10px #fff;

  &-wrapper {
    display: flex;
    justify-content: space-between;

    @media (max-width: 575px) {
      flex-direction: column;
    }
  }
}
.title {
  padding-bottom: 16px;
}
.highlight {
  width: 32%;

  @media (max-width: 575px) {
    width: 100%;
    margin-bottom: 16px;
  }
}
.card {
  min-height: 230px;
  padding: 16px;
  background-size: cover;
  border-right: 1px solid;
  border-left: 1px solid;
  border-radius: 8px;

  @media (max-width: 1199px) {
    padding: 12px;
  }

  &-centered {
    display: flex;
    justify-content: center;
    margin-top: 40px;
  }
  &-justify {
    display: flex;
    justify-content: space-between;
    margin-top: 40px;
  }
  &-title {
    padding-bottom: 12px;
    font-size: 13px;

    @media (max-width: 1199px) {
      font-size: 12px;
    }
  }
  &-pic {
    width: 100%;
    height: 90px;
    margin-bottom: 16px;
    background-repeat: no-repeat;
    background-position: 50% 50%;
    background-size: contain;

    &--pressure {
      background-image: url("/src/assets/img/barometer.png");
    }
  }
}
.states {
  display: flex;
  justify-content: space-between;

  &--margin {
    margin-top: 40px;
  }
}
.state {
  width: 40%;

  &:last-child {
    text-align: right;
  }
  &-pic {
    width: 20px;
    height: 20px;
    margin-bottom: 6px;
    background: url("/src/assets/img/sun.svg") no-repeat 50% 50%;
    background-size: cover;

    &--flipped {
      margin-left: auto;
      -webkit-transform: scaleX(-1);
      transform: scaleX(-1);
    }
  }
  &-title {
    font-size: 12px;
    color: $gold;
  }
  &-time {
    font-size: 13px;
    font-weight: 700;

    @media (max-width: 1199px) {
      font-size: 11px;
    }
  }
}
.info-main {
  display: flex;
  align-items: flex-end;

  &:last-child {
    text-align: right;
  }
  &-num {
    font-size: 20px;

    @media (max-width: 1199px) {
      font-size: 18px;
    }
  }
  &-text {
    padding-left: 2px;
    padding-bottom: 3px;
    font-size: 13px;
    color: rgba($white, 0.75);

    @media (max-width: 1199px) {
      padding-bottom: 1.5px;
      font-size: 12px;
    }
  }
}
.card-small {
  margin-top: 12px;
  padding: 12px 16px;
  background-size: cover;
  border: 1px solid;
  border-radius: 8px;

  &-title {
    font-size: 13px;
  }
  &-info {
    display: flex;
    justify-content: space-between;
    align-items: center;

    @media (max-width: 1199px) {
      flex-direction: column;
      align-items: flex-start;
    }
  }
  &-pic {
    width: 20px;
    height: 20px;
    background-repeat: no-repeat;
    background-position: 50% 50%;
    background-size: contain;

    @media (max-width: 1199px) {
      display: none;
    }

    &--margin {
      width: 16px;
      height: 16px;
      margin-bottom: 3px;
    }
    &--wind {
      background-image: url("/src/assets/img/gusts.svg");
    }
    &--pressure {
      background-image: url("/src/assets/img/humidity.svg");
    }
    &--sun {
      background-image: url("/src/assets/img/cloud.svg");
    }
  }
  &-data {
    display: flex;
    align-items: flex-end;
    width: 45%;

    @media (max-width: 1199px) {
      width: 100%;
      padding-top: 8px;
    }
  }
  &-hint {
    width: 55%;

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
</style>
