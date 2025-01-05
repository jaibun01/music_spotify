<template>
    <div v-if="openModal" class="modal-overlay">
        <div class="modal">
            <h2 class="modal-title">
                <slot name="title"></slot>
            </h2>
            <p class="modal-message">
                <slot name="message"></slot>
            </p>
            <div class="modal-buttons">
                <button @click="onOpen" class="modal-button cancel-button">Cancel</button>
                <button @click="onSubmit" class="modal-button delete-button">
                    <slot name="confirm"></slot>
                </button>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { defineComponent, ref } from 'vue';
const props = defineProps<{
    openModal: boolean
    onSubmit: () => void
    onOpen?: () => void // Function to call when the popover is open
}>()




</script>

<style scoped>
.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    /* Semi-transparent background */
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
    /* Ensure it's on top */
}

.modal {
    background-color: white;
    padding: 24px;
    /* Adjust padding as needed */
    border-radius: 8px;
    /* Rounded corners */
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    /* Subtle shadow */
    width: fit-content;
    max-width: 400px;
}

.modal-title {
    font-size: 1.55rem;
    margin-bottom: 5px;
    color: #000;
    font-weight: 700;
}

.modal-message {
    color: #555;
    /* Slightly darker text for the message */
    margin-bottom: 24px;
}

.modal-buttons {
    display: flex;
    justify-content: flex-end;
    /* Align buttons to the right */
    gap: 8px;
    /* Space between buttons */
}

.modal-button {
    padding: 8px 16px;
    border-radius: 500px;
    border: 1px solid transparent;
    cursor: pointer;
    font-weight: 700;
    font-size: 16px;
    transition: background-color 0.3s, border-color 0.3s, color 0.3s;
}

.cancel-button {
    background-color: transparent;
    color: #555;
    border-color: #ccc;
}

.delete-button {
    background-color: #1ed760;
    /* Spotify Green */
    color: black;
    border-color: #1ed760;
}

.delete-button:hover {
    background-color: #1db954;
    border-color: #1db954;
}

.cancel-button:hover {
    border-color: #999;
    color: #333;
}
</style>