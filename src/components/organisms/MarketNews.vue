<script setup lang="ts">
// MarketNews.vue: Módulo de Noticias Integrando Storage API (Session/Local)
import { computed, ref } from 'vue'
import { BookOpen, Settings2, Clock, CheckCircle2 } from 'lucide-vue-next'
import { mockNews, type KasaneNewsItem } from '@/data/news'
import { useStorageHistory } from '@/composables/useStorageHistory'
import { useToast } from '@/composables/useToast'
import BaseBadge from '@/components/atoms/BaseBadge.vue'

const {
  sessionHistory,
  addToSessionHistory,
  clearSessionHistory,
  hideReadNews,
  toggleHideReadPreference,
} = useStorageHistory()
const toast = useToast()

// Estado Local Activo (Toggle Expanded)
const expandedArticleId = ref<string | null>(null)

// ─── Lógica de Renderizado ──────────────────────────────────────
const visibleNews = computed(() => {
  if (hideReadNews.value) {
    return mockNews.filter(n => !sessionHistory.value.includes(n.id))
  }
  return mockNews
})

const readArticlesCount = computed(() => {
  // Filtramos contra history válido caso haya datos sueltos
  return mockNews.filter(n => sessionHistory.value.includes(n.id)).length
})

const unreadArticlesCount = computed(() => mockNews.length - readArticlesCount.value)

// ─── Interacciones ──────────────────────────────────────────────
function toggleArticle(article: KasaneNewsItem) {
  if (expandedArticleId.value === article.id) {
    // Cerrar el artículo si ya está abierto
    expandedArticleId.value = null
  } else {
    // Abrirlo
    expandedArticleId.value = article.id

    // Si NO estaba en el sessionStorage, se añade y notificamos.
    if (!sessionHistory.value.includes(article.id)) {
      addToSessionHistory(article.id)
      toast.success(
        `Añadido a tu historial de lectura: "${article.title.substring(0, 20)}..."`,
        4000
      )
    }
  }
}

function handleClearHistory() {
  if (sessionHistory.value.length === 0) return
  clearSessionHistory()
  toast.show('Historial de sesión borrado', 'info')
}
</script>

<template>
  <section class="market-news" aria-label="Noticias y Educación">
    <header class="news-header">
      <div class="news-title-group">
        <h3 class="news-title">Noticias & Perspectivas</h3>
        <BaseBadge v-if="unreadArticlesCount > 0" variant="growth" size="sm">
          {{ unreadArticlesCount }} nuevas
        </BaseBadge>
      </div>

      <!-- Settings / LocalStorage Controls -->
      <div class="news-controls">
        <button
          class="control-btn"
          :class="{ 'is-active': hideReadNews }"
          title="Ocultar leídas (LocalStorage)"
          aria-label="Alternar visibilidad de noticias leídas"
          @click="toggleHideReadPreference"
        >
          <Settings2 :size="16" />
        </button>
      </div>
    </header>

    <!-- Barra de progreso e Historia (SessionStorage) -->
    <div class="history-bar">
      <div class="history-stats">
        <BookOpen :size="14" class="text-text-muted" />
        <span class="history-text">
          Has leído {{ readArticlesCount }} de {{ mockNews.length }} artículos en esta sesión
        </span>
      </div>
      <button v-if="sessionHistory.length > 0" class="clear-btn" @click="handleClearHistory">
        Limpiar historial
      </button>
    </div>

    <!-- Feed de Noticias -->
    <div class="news-feed">
      <TransitionGroup name="list">
        <article
          v-for="article in visibleNews"
          :key="article.id"
          class="news-card"
          :class="{
            'is-expanded': expandedArticleId === article.id,
            'is-read': sessionHistory.includes(article.id),
          }"
        >
          <div class="news-card-top" @click="toggleArticle(article)">
            <div class="nc-meta">
              <span class="nc-category">{{ article.category }}</span>
              <span class="nc-dot">•</span>
              <span class="nc-date">{{ article.date }}</span>
              <span class="nc-dot">•</span>
              <span class="nc-time"
                ><Clock :size="12" class="inline mr-1" />{{ article.readTime }} min</span
              >
            </div>
            <h4 class="nc-title">{{ article.title }}</h4>
            <p v-show="expandedArticleId !== article.id" class="nc-summary">
              {{ article.summary }}
            </p>

            <div class="nc-footer">
              <span v-if="sessionHistory.includes(article.id)" class="nc-status-read">
                <CheckCircle2 :size="14" /> Leído
              </span>
              <span v-else class="nc-status-unread">No leído</span>

              <span class="nc-toggle-text">
                {{ expandedArticleId === article.id ? 'Contraer ↑' : 'Leer Más ↓' }}
              </span>
            </div>
          </div>

          <!-- Contenido Expandido Toggle -->
          <div v-show="expandedArticleId === article.id" class="news-card-body">
            <p class="nc-content">{{ article.content }}</p>
          </div>
        </article>
      </TransitionGroup>

      <div v-if="visibleNews.length === 0" class="news-empty">
        <p class="empty-text">No hay noticias nuevas para mostrar.</p>
        <button class="empty-action" @click="toggleHideReadPreference">
          Mostrar artículos leídos
        </button>
      </div>
    </div>
  </section>
</template>

<style scoped>
@reference "tailwindcss";
@config "../../../tailwind.config.js";

.market-news {
  @apply flex flex-col gap-4 w-full bg-bg-secondary border border-white/5 rounded-2xl p-4 md:p-6;
}

.news-header {
  @apply flex items-center justify-between border-b border-white/5 pb-4;
}

.news-title-group {
  @apply flex items-center gap-3;
}

.news-title {
  @apply font-heading text-lg font-bold text-text-primary;
}

.control-btn {
  @apply p-2 rounded-lg text-text-muted hover:text-text-primary hover:bg-white/5 transition-colors cursor-pointer;
  @apply focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent-neutral;
}

.control-btn.is-active {
  @apply text-accent-neutral bg-accent-neutral/10;
}

.history-bar {
  @apply flex items-center justify-between bg-bg-primary rounded-lg p-3 border border-white/5;
}

.history-stats {
  @apply flex items-center gap-2;
}

.history-text {
  @apply font-mono text-xs text-text-secondary;
}

.clear-btn {
  @apply font-body text-xs text-accent-alert hover:text-accent-alert/80 underline cursor-pointer transition-colors;
}

/* Feed List Transitions */
.list-enter-active,
.list-leave-active {
  transition: all 0.3s ease;
}
.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

.news-feed {
  @apply flex flex-col gap-3 mt-2;
}

/* News Card */
.news-card {
  @apply bg-bg-primary border border-white/5 rounded-xl flex flex-col transition-all duration-300;
  @apply hover:border-white/10;
}

.news-card.is-read {
  @apply opacity-80 border-transparent bg-transparent border-dashed border-white/10;
}

.news-card.is-expanded {
  @apply border-accent-neutral/30 bg-bg-elevated;
}

.news-card-top {
  @apply p-4 cursor-pointer flex flex-col gap-2;
}

.nc-meta {
  @apply flex items-center gap-2 font-mono text-[10px] text-text-muted uppercase tracking-wider mb-1;
}

.nc-category {
  @apply text-accent-neutral;
}

.nc-dot {
  @apply opacity-50;
}

.nc-title {
  @apply font-heading text-base font-semibold text-text-primary leading-tight;
}

.nc-summary {
  @apply font-body text-sm text-text-secondary line-clamp-2 mt-1;
}

.nc-footer {
  @apply flex items-center justify-between mt-3 pt-3 border-t border-white/5 font-body text-xs;
}

.nc-status-read {
  @apply flex items-center gap-1 text-accent-growth font-medium;
}

.nc-status-unread {
  @apply text-text-muted;
}

.nc-toggle-text {
  @apply text-accent-neutral font-medium;
}

/* Expanded Body */
.news-card-body {
  @apply px-4 pb-5 pt-1 border-t border-white/5;
}

.nc-content {
  @apply font-body text-sm leading-relaxed text-text-secondary;
}

.news-empty {
  @apply py-8 flex flex-col items-center justify-center gap-3 border border-dashed border-white/10 rounded-xl;
}

.empty-text {
  @apply font-body text-sm text-text-muted;
}

.empty-action {
  @apply font-body text-xs text-accent-neutral underline cursor-pointer hover:text-accent-neutral/80;
}
</style>
