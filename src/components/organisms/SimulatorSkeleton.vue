<script setup lang="ts">
// SimulatorSkeleton: Esqueleto de carga específico para SimulatorView
// Responsabilidad: imitar la estructura del OCASimulator, ComparisonCharts y Mixer
import BaseSkeleton from '@/components/atoms/BaseSkeleton.vue'
</script>

<template>
  <div class="simulator-skeleton" aria-label="Cargando proyecciones..." aria-busy="true">
    <!-- Nav Skeleton -->
    <div class="nav-skeleton">
      <BaseSkeleton width="w-24" height="h-4" />
      <div class="nav-right">
        <BaseSkeleton width="w-16" height="h-4" />
        <BaseSkeleton width="w-10" height="h-4" />
      </div>
    </div>

    <!-- OCASimulator Skeleton (Metrics Grid) -->
    <div class="metrics-grid">
      <div v-for="i in 3" :key="i" class="metric-card">
        <BaseSkeleton width="w-24" height="h-3" class="mb-2" />
        <BaseSkeleton width="w-40" height="h-8" />
        <BaseSkeleton width="w-32" height="h-4" class="mt-4" />
      </div>
    </div>

    <!-- Chart Skeleton (Crecimiento mes a mes) -->
    <BaseSkeleton type="card" height="h-80" rounded="rounded-xl" />

    <!-- Mixer Section Skeleton -->
    <div class="mixer-section">
      <div class="section-header">
        <BaseSkeleton type="title" width="w-48" />
        <BaseSkeleton type="text" width="w-3/4" class="mt-1" />
      </div>

      <!-- InstrumentMixer Skeleton -->
      <BaseSkeleton type="card" height="h-40" rounded="rounded-xl" />

      <!-- ComparisonChart Skeleton -->
      <BaseSkeleton type="card" height="h-80" rounded="rounded-xl" />
    </div>

    <!-- Actions Skeleton -->
    <div class="actions-skeleton">
      <BaseSkeleton width="w-24" height="h-4" class="mr-auto" />
      <BaseSkeleton width="w-32" height="h-10" rounded="rounded-md" />
      <BaseSkeleton width="w-32" height="h-10" rounded="rounded-md" />
    </div>
  </div>
</template>

<style scoped>
@reference "tailwindcss";
@config "../../../tailwind.config.js";

.simulator-skeleton {
  @apply flex flex-col gap-8 w-full max-w-4xl mx-auto;
}

/* Nav */
.nav-skeleton {
  @apply flex items-center justify-between;
}

.nav-right {
  @apply flex items-center gap-4;
}

/* Metrics Grid (OCASimulator) */
.metrics-grid {
  @apply grid gap-4 grid-cols-1 md:grid-cols-3 mb-4;
}

.metric-card {
  @apply bg-bg-elevated rounded-xl p-5 border border-white/5 flex flex-col;
}

/* Mixer Section */
.mixer-section {
  @apply flex flex-col gap-4 mt-2;
}

.section-header {
  @apply flex flex-col;
}

/* Actions */
.actions-skeleton {
  @apply flex gap-3 justify-end items-center mt-4;
}
</style>
