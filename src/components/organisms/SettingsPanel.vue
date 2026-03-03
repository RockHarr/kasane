<script setup lang="ts">
// SettingsPanel: panel deslizante de configuración global.
// Por ahora gestiona la selección de tickers de mercado.
// Futuro: preferencias de usuario, notificaciones, etc.
import { ref } from 'vue'
import { useMarketWidgetStore } from '@/stores/marketWidget'

const store = useMarketWidgetStore()

const isOpen = ref(false)

const ALL_TICKERS = [
  { id: 'USD/CLP', label: 'Dólar · USD/CLP',       type: 'fx' },
  { id: 'EUR/CLP', label: 'Euro · EUR/CLP',          type: 'fx' },
  { id: 'COP/CLP', label: 'Colombia · COP/CLP',      type: 'fx' },
  { id: 'ARS/CLP', label: 'Argentina · ARS/CLP',     type: 'fx' },
  { id: 'BTC/USD', label: 'Bitcoin · BTC/USD',        type: 'crypto' },
  { id: 'ETH/USD', label: 'Ethereum · ETH/USD',       type: 'crypto' },
  { id: 'SOL/USD', label: 'Solana · SOL/USD',         type: 'crypto' },
]

function toggle() { isOpen.value = !isOpen.value }
function close()  { isOpen.value = false }

defineExpose({ toggle, isOpen })
</script>

<template>
  <!-- Trigger: botón engranaje (el padre lo invoca via ref o slot) -->
  <slot name="trigger" :toggle="toggle">
    <!-- botón default si no hay slot -->
    <button class="settings-trigger" aria-label="Configuración" @click="toggle">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="3"/>
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
      </svg>
    </button>
  </slot>

  <!-- Backdrop -->
  <Transition name="fade">
    <div v-if="isOpen" class="settings-backdrop" @click="close" />
  </Transition>

  <!-- Panel -->
  <Transition name="slide-up">
    <div v-if="isOpen" class="settings-panel" role="dialog" aria-label="Configuración" aria-modal="true">
      <header class="settings-header">
        <h2 class="settings-title">Configuración</h2>
        <button class="settings-close" aria-label="Cerrar" @click="close">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </header>

      <!-- Sección: Indicadores de mercado -->
      <section class="settings-section">
        <h3 class="section-label">Indicadores de mercado</h3>
        <p class="section-desc">Elige qué pares ver en el ticker y en la sección Mercado.</p>
        <div class="ticker-list">
          <label
            v-for="t in ALL_TICKERS"
            :key="t.id"
            class="ticker-row"
            :class="{ 'is-crypto': t.type === 'crypto' }"
          >
            <div class="ticker-info">
              <span class="ticker-name">{{ t.label }}</span>
              <span class="ticker-type">{{ t.type === 'crypto' ? '₿ Cripto' : '💱 Divisa' }}</span>
            </div>
            <input
              type="checkbox"
              :checked="store.selectedTickers.includes(t.id)"
              class="ticker-check"
              @change="store.toggleTicker(t.id)"
            />
          </label>
        </div>
      </section>

      <!-- Sección futura placeholder -->
      <section class="settings-section settings-section--muted">
        <h3 class="section-label">Más configuraciones</h3>
        <p class="section-desc">Notificaciones, preferencias de moneda, privacidad — próximamente.</p>
      </section>
    </div>
  </Transition>
</template>

<style scoped>
@reference "tailwindcss";
@config "../../../tailwind.config.js";

/* ── Trigger ── */
.settings-trigger {
  @apply flex items-center justify-center w-8 h-8 rounded-full;
  @apply text-text-muted hover:text-text-primary hover:bg-white/5 transition-all;
  @apply cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent-neutral;
}

/* ── Backdrop ── */
.settings-backdrop {
  @apply fixed inset-0 z-50 bg-black/50;
  backdrop-filter: blur(4px);
}

/* ── Panel (bottom sheet) ── */
.settings-panel {
  @apply fixed bottom-0 left-0 right-0 z-50;
  @apply bg-bg-elevated border-t border-white/10 rounded-t-2xl;
  @apply flex flex-col max-h-[80dvh] overflow-hidden;
  padding-bottom: env(safe-area-inset-bottom, 16px);
}

.settings-header {
  @apply flex items-center justify-between px-5 pt-5 pb-3;
  @apply border-b border-white/5;
}

.settings-title {
  @apply font-heading text-lg font-bold text-text-primary;
}

.settings-close {
  @apply flex items-center justify-center w-7 h-7 rounded-full;
  @apply text-text-muted hover:text-text-primary hover:bg-white/5 transition-colors cursor-pointer;
}

/* ── Sections ── */
.settings-section {
  @apply flex flex-col gap-3 px-5 py-4 border-b border-white/5 overflow-y-auto;
}

.settings-section--muted {
  @apply opacity-40;
}

.section-label {
  @apply font-heading text-xs font-bold text-text-secondary uppercase tracking-wider;
}

.section-desc {
  @apply font-body text-xs text-text-muted leading-relaxed;
}

/* ── Ticker list ── */
.ticker-list {
  @apply flex flex-col gap-1;
}

.ticker-row {
  @apply flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer;
  @apply hover:bg-white/5 transition-colors;
}

.ticker-row.is-crypto {
  /* subtle tint for crypto */
}

.ticker-info {
  @apply flex flex-col gap-0.5;
}

.ticker-name {
  @apply font-body text-sm text-text-primary;
}

.ticker-type {
  @apply font-body text-[10px] text-text-muted;
}

.ticker-check {
  @apply w-4 h-4 rounded accent-accent-growth cursor-pointer;
}

/* ── Transitions ── */
.fade-enter-active, .fade-leave-active { transition: opacity 0.25s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

.slide-up-enter-active { transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.3s ease; }
.slide-up-leave-active { transition: transform 0.2s ease, opacity 0.2s ease; }
.slide-up-enter-from, .slide-up-leave-to { transform: translateY(100%); opacity: 0; }
</style>
