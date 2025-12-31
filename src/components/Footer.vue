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

<style lang="scss" scoped>
@use '@/assets/styles/variables' as *;

.footer {
  width: 100%;
  padding: 20px 0;
  margin-top: auto;
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(10px);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.footer-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  text-align: center;
}

.footer-text,
.footer-year {
  color: rgba($white, 0.6);
  font-size: 12px;
  margin: 0 0 8px 0;

  @media (max-width: 480px) {
    font-size: 12px;
  }
}

.footer-credits {
  color: rgba($white, 0.4);
  font-size: 11px;
  margin: 0;

  a {
    color: rgba(255, 215, 0, 0.8);
    text-decoration: none;
    transition: color 0.2s ease;

    &:hover {
      color: rgba(255, 215, 0, 1);
      text-decoration: underline;
    }
  }

  @media (max-width: 480px) {
    font-size: 11px;
  }
}
</style>
