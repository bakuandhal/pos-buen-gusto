<script setup lang="ts">
interface Props {
  label?: string;
}

const props = defineProps<Props>();
</script>

<template>
  <div class="welcome-message" data-testid="welcome-message">
    {{ props.label || 'Bienvenido al POS Buen Gusto' }}
  </div>
</template>

<style scoped>
.welcome-message {
  font-weight: bold;
  padding: 1rem;
}
</style>
