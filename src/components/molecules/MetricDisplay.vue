<script setup lang="ts">
interface Props {
  label: string
  value: string | number
  suffix?: string       // ej: "%" o "USD"
  trend?: 'up' | 'down' | 'neutral'
  trendValue?: string   // ej: "+5.2%"
}

defineProps<Props>()
</script>

<template>
  <div class="metric">
    <span class="metric-label">{{ label }}</span>

    <div class="metric-value-row">
      <span class="metric-value">{{ value }}</span>
      <span v-if="suffix" class="metric-suffix">{{ suffix }}</span>
    </div>

    <div v-if="trendValue" class="metric-trend" :class="`trend-${trend ?? 'neutral'}`">
      <span class="trend-arrow">
        {{ trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→' }}
      </span>
      <span>{{ trendValue }}</span>
    </div>
  </div>
</template>

<style scoped>
.metric {
  @apply flex flex-col gap-1;
}

.metric-label {
  @apply font-body text-xs text-text-secondary uppercase tracking-widest;
}

.metric-value-row {
  @apply flex items-baseline gap-1;
}

.metric-value {
  @apply font-mono text-4xl font-bold text-text-primary;
}

.metric-suffix {
  @apply font-mono text-lg text-text-secondary;
}

.metric-trend {
  @apply flex items-center gap-1 font-mono text-sm font-medium;
}

.trend-up   { @apply text-accent-growth; }
.trend-down { @apply text-accent-alert; }
.trend-neutral { @apply text-text-secondary; }
</style>
