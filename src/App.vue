<script setup lang="ts">
import { RouterView } from 'vue-router'
import ToastContainer from '@/components/organisms/ToastContainer.vue'
</script>

<template>
  <ToastContainer />

  <RouterView v-slot="{ Component }">
    <Transition name="fade-slide" mode="out-in">
      <component :is="Component" />
    </Transition>
  </RouterView>
</template>
