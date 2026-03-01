<script setup lang="ts">
import { RouterView, useRoute } from 'vue-router'
import ToastContainer from '@/components/organisms/ToastContainer.vue'
import MarketSidebar from '@/components/organisms/MarketSidebar.vue'
import { useMarketWidgetStore } from '@/stores/marketWidget'

const route = useRoute()
const marketStore = useMarketWidgetStore()
</script>

<template>
  <div class="app-layout" :class="{ 'sidebar-open': marketStore.isOpen && !route.meta.public }">
    <MarketSidebar v-if="!route.meta.public" />
    <ToastContainer />

    <main class="main-content">
      <RouterView v-slot="{ Component }">
        <Transition name="fade-slide" mode="out-in">
          <component :is="Component" />
        </Transition>
      </RouterView>
    </main>
  </div>
</template>

<style>
/* Layout transitions out-of-the-box */
.app-layout {
  transition: padding-left 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  min-height: 100vh;
}

@media (min-width: 1024px) {
  .app-layout.sidebar-open {
    padding-left: 260px; /* Ancho del sidebar abierto empuja el layout */
  }
}

.main-content {
  width: 100%;
}
</style>
