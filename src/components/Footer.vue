<script setup>
const currentYear = new Date().getFullYear();
</script>

<template>
  <footer class="footer">
    <div class="footer-content">
      <p class="footer-year">{{ currentYear }}</p>
      <p class="footer-text">Created by Anatoli Rostsin</p>
      <p class="footer-credits">
        Powered by
        <a href="https://openweathermap.org/" target="_blank" rel="noopener"
          >OpenWeatherMap API</a
        >
      </p>
    </div>
  </footer>
</template>
