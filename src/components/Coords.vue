<script setup>
// Define component properties using defineProps
// This component expects a "coord" object as a prop, which contains latitude (lat) and longitude (lon).
const props = defineProps({
  coord: {
    type: Object, // Expected type: Object containing latitude and longitude
    required: true, // The prop is required, meaning the component won't work without it
  },
});
</script>

<template>
  <!-- Main section of the component, applying CSS classes for styling -->
  <section class="section-bottom left">
    <!-- A block that contains all content related to coordinates -->
    <div class="block-bottom">
      <div class="block-bottom-inner">
        <!-- This div represents an image/icon related to coordinates -->
        <div class="block-bottom-pic pic-coords"></div>
        <!-- Container for text information about latitude and longitude -->
        <div class="block-bottom-texts">
          <!-- Block for longitude information -->
          <div class="block-bottom-text-block">
            <div class="block-bottom-text-block-title">
              <!-- Displays the longitude value from the "coord" prop -->
              Longitude: {{ coord?.lon }}
            </div>
            <div class="block-bottom-text-block-desc">
              Longitude measures distance east or west of the prime meridian.
            </div>
          </div>

          <!-- Block for latitude information -->
          <div class="block-bottom-text-block">
            <div class="block-bottom-text-block-title">
              <!-- Displays the latitude value from the "coord" prop -->
              Latitude: {{ coord?.lat }}
            </div>
            <!-- A brief explanation of what latitude represents -->
            <div class="block-bottom-text-block-desc">
              Latitude lines start at the equator (0 degrees latitude) and run
              east and west, parallel to the equator.
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
