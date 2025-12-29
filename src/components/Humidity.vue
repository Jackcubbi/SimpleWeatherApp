<script setup>
// Define the component properties using defineProps
// This component expects a "humidity" prop, which should be a number
defineProps({
  humidity: {
    type: Number,
    required: true,
  },
});
</script>

<template>
  <!-- Main section wrapper with a class for styling -->
  <section class="section-bottom right">
    <div class="block-bottom">
      <div class="block-bottom-inner">
        <!-- Icon representing humidity -->
        <div class="block-bottom-pic pic-humidity"></div>
        <!-- Container for text information -->
        <div class="block-bottom-texts">
          <div class="block-bottom-text-block">
            <!-- Displays the humidity value dynamically -->
            <div class="block-bottom-text-block-title">
              Humidity: {{ humidity }}
            </div>
            <!-- Description text explaining humidity -->
            <div class="block-bottom-text-block-desc">
              Humidity is the concentration of water vapor present in the air.
              Water vapor, the gaseous state of water, is generally invisible to
              the human eye.
              <br /><br />
              The same amount of water vapor results in higher relative humidity
              in cool air than warm air.
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
