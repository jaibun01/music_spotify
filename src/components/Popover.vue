<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
const props = defineProps<{
  showPopover: boolean
  position?: string
  onOpen?: () => void // Function to call when the popover is open
}>()
const popoverStyle = computed(() => {
  return {
    transform: `translateX(${props.position || '-77%'})`,
  }
})
</script>

<template>
  <div class="popover-container">
    <slot name="open"> </slot>

    <div class="popover" :class="{ show: showPopover }" :style="popoverStyle">
      <div class="popover-content">
        <slot name="content"> </slot>
      </div>
      <!-- <div class="popover-arrow"></div> -->
    </div>
  </div>
</template>

<!-- <script>
import { ref } from 'vue';

export default {
    setup() {
        const showPopover = ref(false);
        return { showPopover };
    },
};
</script> -->

<style scoped>
.popover-container {
  position: relative;
  /* Needed for absolute positioning of the popover */
  display: inline-block;
  /* Or block, depending on your layout needs */
}

/* transform: translateX(-77%); */
.popover {
  position: absolute;
  top: 120%;
  /* Position below the button */
  left: 10%;
  /* Center horizontally */
  background-color: white;
  padding: 10px;
  border-radius: 5px;
  box-shadow: 2px 2px 5px rgba(0, 0, 0, 0.2);
  z-index: 10;
  min-width: 196px;
  max-height: 223px;
  height: auto;
  background-color: #282828;
  color: #b3b3b3;
  /* Ensure it's above other content */
  opacity: 0;
  display: none;
  visibility: hidden;
  transition:
    opacity 0.2s ease,
    visibility 0.2s ease;
}

.popover.show {
  opacity: 1;
  display: block;
  visibility: visible;
}

.popover-arrow {
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  width: 0;
  height: 0;
  border-left: 10px solid transparent;
  border-right: 10px solid transparent;
  border-bottom: 10px solid white;
}

/* Optional: Styles for different popover positions (top, left, right) */
.popover.top {
  top: auto;
  bottom: 100%;
}

.popover.top .popover-arrow {
  top: 100%;
  bottom: auto;
  border-top: 10px solid white;
  border-bottom: none;
}
</style>
