<script setup lang="ts">
// BottomTabBar: barra de navegación fija al fondo, estilo app nativa
import { useRouter } from 'vue-router'

type TabId = 'portafolio' | 'mercado'

interface Props {
  activeTab: TabId
}

interface Emits {
  (e: 'update:activeTab', tab: TabId): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()
const router = useRouter()

const tabs = [
  {
    id: 'portafolio' as TabId,
    label: 'Portafolio',
    route: null,
    icon: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
      <rect x="3" y="12" width="4" height="9" rx="1"/>
      <rect x="10" y="8" width="4" height="13" rx="1"/>
      <rect x="17" y="4" width="4" height="17" rx="1"/>
    </svg>`,
  },
  {
    id: 'simulador' as const,
    label: 'Simulador',
    route: 'simulator',
    icon: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
      <polyline points="3 17 9 11 13 15 21 7"/>
      <polyline points="17 7 21 7 21 11"/>
    </svg>`,
  },
  {
    id: 'mercado' as TabId,
    label: 'Mercado',
    route: null,
    icon: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1"/>
      <rect x="14" y="3" width="7" height="7" rx="1"/>
      <rect x="3" y="14" width="7" height="7" rx="1"/>
      <rect x="14" y="14" width="7" height="7" rx="1"/>
    </svg>`,
  },
]

function handleTab(tab: typeof tabs[number]) {
  if (tab.route) {
    router.push({ name: tab.route })
  } else {
    emit('update:activeTab', tab.id as TabId)
  }
}

function isActive(tab: typeof tabs[number]) {
  if (tab.id === 'simulador') return false
  return props.activeTab === tab.id
}
</script>

<template>
  <nav class="bottom-tab-bar" role="tablist" aria-label="Navegación principal">
    <button
      v-for="tab in tabs"
      :key="tab.id"
      class="tab-item"
      :class="{ 'is-active': isActive(tab) }"
      role="tab"
      :aria-selected="isActive(tab)"
      :aria-label="tab.label"
      @click="handleTab(tab)"
    >
      <!-- SVG icon -->
      <span class="tab-icon" aria-hidden="true" v-html="tab.icon" />
      <span class="tab-label">{{ tab.label }}</span>
      <span v-if="isActive(tab)" class="tab-indicator" aria-hidden="true" />
    </button>
  </nav>
</template>

<style scoped>
@reference "tailwindcss";
@config "../../../tailwind.config.js";

.bottom-tab-bar {
  @apply w-full z-50;
  @apply flex items-stretch justify-around;
  @apply bg-bg-elevated/90 border-t border-white/8;
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  padding-bottom: env(safe-area-inset-bottom, 0px);
  height: calc(60px + env(safe-area-inset-bottom, 0px));
  flex-shrink: 0;
}

.tab-item {
  @apply flex flex-col items-center justify-center gap-0.5 flex-1 relative;
  @apply text-text-muted cursor-pointer transition-all duration-200;
  @apply focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-growth;
  min-height: 60px;
}

.tab-item:hover {
  @apply text-text-secondary;
}

.tab-item.is-active {
  @apply text-accent-growth;
}

.tab-icon {
  @apply text-xl leading-none;
  transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.tab-item.is-active .tab-icon {
  transform: translateY(-2px) scale(1.15);
}

.tab-label {
  @apply font-body text-[10px] font-medium tracking-wide;
}

/* Indicador: línea verde debajo del ícono */
.tab-indicator {
  @apply absolute bottom-0 left-1/2 -translate-x-1/2;
  @apply w-8 h-0.5 rounded-full bg-accent-growth;
  box-shadow: 0 0 8px color-mix(in srgb, var(--color-accent-growth, #00ffaa) 60%, transparent);
}
</style>
