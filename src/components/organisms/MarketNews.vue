<script setup lang="ts">
// MarketNews.vue: Noticias con feed externo (GNews) + contenido curado
// Storage: sessionStorage para historial de lectura, localStorage para preferencias
import { computed, ref, onMounted } from 'vue'
import { BookOpen, Settings2, Clock, CheckCircle2, ExternalLink, RefreshCw, LayoutGrid, List, ArrowDown, ArrowUp } from 'lucide-vue-next'
import { mockNews, type KasaneNewsItem } from '@/data/news'
import { fetchNoticias, clearNewsCache } from '@/services/newsService'
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

// --- Estado del feed externo ------------------------------------------
const externalNews = ref<KasaneNewsItem[]>([])
const loadingNews = ref(false)

// Feed combinado: curado primero (siempre visible) + externo al cargar
const allNews = computed<KasaneNewsItem[]>(() => [...mockNews, ...externalNews.value])

// Toggle expand solo para artículos curados (sin URL)
const expandedArticleId = ref<string | null>(null)

// --- Carga inicial ----------------------------------------------------
onMounted(async () => {
  loadingNews.value = true
  externalNews.value = await fetchNoticias()
  loadingNews.value = false
})

async function handleRefresh() {
  clearNewsCache()
  loadingNews.value = true
  externalNews.value = await fetchNoticias()
  loadingNews.value = false
  toast.show('Noticias actualizadas', 'info')
}

// --- Filtros por Categoría ----------------------------------------------
const selectedCategory = ref<string>('Todas')

const availableCategories = computed(() => {
  const cats = new Set(allNews.value.map(n => n.category).filter(Boolean))
  return ['Todas', ...Array.from(cats).sort()]
})

// --- Lógica de renderizado -------------------------------------------
const visibleNews = computed(() => {
  let filtered = [...allNews.value]
  
  if (selectedCategory.value !== 'Todas') {
    filtered = filtered.filter(n => n.category === selectedCategory.value)
  }

  if (hideReadNews.value) {
    filtered = filtered.filter(n => !sessionHistory.value.includes(n.id))
  }

  // Ordenamiento por timestamp
  filtered.sort((a, b) => {
    return sortOrder.value === 'desc' 
      ? b.timestamp - a.timestamp 
      : a.timestamp - b.timestamp
  })

  return filtered
})

// --- Vista y Ordenamiento (Cuadrícula / Lista / Asc / Desc) ---
const viewMode = ref<'list' | 'grid'>('grid')
const sortOrder = ref<'desc' | 'asc'>('desc')

function toggleSortOrder() {
  sortOrder.value = sortOrder.value === 'desc' ? 'asc' : 'desc'
}

const readArticlesCount = computed(() =>
  allNews.value.filter(n => sessionHistory.value.includes(n.id)).length
)

const unreadArticlesCount = computed(() => allNews.value.length - readArticlesCount.value)

// --- Interacciones ---------------------------------------------------

/**
 * Artículos externos (con url): marcar leído — el <a> del template abre la pestaña.
 * Artículos curados (sin url): toggle expand inline.
 */
function handleArticleClick(article: KasaneNewsItem) {
  if (!sessionHistory.value.includes(article.id)) {
    addToSessionHistory(article.id)
    toast.success(`"${article.title.substring(0, 30)}..." añadido al historial`, 3000)
  }
  if (article.url) return // apertura delegada al <a>
  expandedArticleId.value = expandedArticleId.value === article.id ? null : article.id
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

      <div class="news-controls">
        <!-- Refrescar feed externo -->
        <button
          class="control-btn"
          :class="{ 'is-loading': loadingNews }"
          title="Actualizar noticias"
          aria-label="Actualizar feed de noticias"
          :disabled="loadingNews"
          @click="handleRefresh"
        >
          <RefreshCw :size="16" :class="{ 'animate-spin': loadingNews }" />
        </button>

        <!-- Ordenamiento: Asc / Desc -->
        <button
          class="control-btn"
          title="Alternar Orden de Fecha"
          aria-label="Alternar orden ascedente/descendente"
          @click="toggleSortOrder"
        >
          <ArrowDown v-if="sortOrder === 'desc'" :size="16" />
          <ArrowUp v-else :size="16" />
        </button>

        <!-- Vista Cuadrícula -->
        <button
          class="control-btn"
          :class="{ 'is-active': viewMode === 'grid' }"
          title="Vista de cuadrícula"
          @click="viewMode = 'grid'"
        >
          <LayoutGrid :size="16" />
        </button>

        <!-- Vista Lista -->
        <button
          class="control-btn"
          :class="{ 'is-active': viewMode === 'list' }"
          title="Vista de lista"
          @click="viewMode = 'list'"
        >
          <List :size="16" />
        </button>

        <!-- Ocultar leídas (LocalStorage) -->
        <button
          class="control-btn"
          :class="{ 'is-active': hideReadNews }"
          title="Ocultar leídas"
          aria-label="Alternar visibilidad de noticias leídas"
          @click="toggleHideReadPreference"
        >
          <Settings2 :size="16" />
        </button>
      </div>
    </header>

    <!-- Filtros por categoría (Chips) -->
    <div class="category-filters hide-scrollbar">
      <button
        v-for="cat in availableCategories"
        :key="cat"
        class="category-chip"
        :class="{ 'is-active': selectedCategory === cat }"
        @click="selectedCategory = cat"
      >
        {{ cat }}
      </button>
    </div>

    <!-- Barra de progreso e historial (SessionStorage) -->
    <div class="history-bar">
      <div class="history-stats">
        <BookOpen :size="14" class="text-text-muted" />
        <span class="history-text">
          Has leído {{ readArticlesCount }} de {{ allNews.length }} artículos en esta sesión
        </span>
      </div>
      <button v-if="sessionHistory.length > 0" class="clear-btn" @click="handleClearHistory">
        Limpiar historial
      </button>
    </div>

    <!-- Skeleton de carga para el feed externo -->
    <div v-if="loadingNews && externalNews.length === 0" class="news-skeleton">
      <div v-for="n in 3" :key="n" class="skeleton-card" />
    </div>

    <!-- Feed de Noticias -->
    <div v-else class="news-feed" :class="{ 'is-grid': viewMode === 'grid' }">
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
          <div class="news-card-top" @click="handleArticleClick(article)">
            <img v-if="article.image" :src="article.image" alt="Ilustración de noticia" class="nc-image" loading="lazy" />
            <div class="nc-meta">
              <span class="nc-category">{{ article.category }}</span>
              <span class="nc-dot">•</span>
              <span v-if="article.source" class="nc-source">{{ article.source }}</span>
              <span v-if="article.source" class="nc-dot">•</span>
              <span class="nc-date">{{ article.date }}</span>
              <span class="nc-dot">•</span>
              <span class="nc-time">
                <Clock :size="12" class="inline mr-1" />{{ article.readTime }} min
              </span>
            </div>

            <h4 class="nc-title">{{ article.title }}</h4>
            <p class="nc-summary">{{ article.summary }}</p>

            <div class="nc-footer">
              <span v-if="sessionHistory.includes(article.id)" class="nc-status-read">
                <CheckCircle2 :size="14" /> Leído
              </span>
              <span v-else class="nc-status-unread">No leído</span>

              <!-- Artículo externo: enlace en nueva pestaña -->
              <a
                v-if="article.url"
                :href="article.url"
                target="_blank"
                rel="noopener noreferrer"
                class="nc-external-link"
                @click.stop
              >
                Leer artículo <ExternalLink :size="12" class="inline ml-1" />
              </a>

              <!-- Artículo curado: toggle expand -->
              <span v-else class="nc-toggle-text">
                {{ expandedArticleId === article.id ? 'Contraer ↑' : 'Leer Más ↓' }}
              </span>
            </div>
          </div>

          <!-- Contenido expandido (solo artículos curados) -->
          <div v-if="!article.url" v-show="expandedArticleId === article.id" class="news-card-body">
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

<style scoped lang="postcss">
@reference "tailwindcss";
@config "../../../tailwind.config.js";

.market-news {
  @apply flex flex-col gap-5 w-full bg-bg-secondary/40 backdrop-blur-md border border-white/5 rounded-[2rem] p-6 md:p-8 shadow-2xl;
}

.news-header {
  @apply flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4;
}

.news-title-group {
  @apply flex items-center gap-3;
}

.news-title {
  @apply font-heading text-lg font-bold text-text-primary;
}

.news-controls {
  @apply flex items-center gap-1;
}

.control-btn {
  @apply p-2 rounded-lg text-text-muted hover:text-text-primary hover:bg-white/5 transition-colors cursor-pointer;
  @apply focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent-neutral;
  @apply disabled:opacity-40 disabled:cursor-not-allowed;
}

.control-btn.is-active {
  @apply text-accent-neutral bg-accent-neutral/10;
}

/* Category Filters */
.category-filters {
  @apply flex items-center gap-2 overflow-x-auto py-1;
}

.category-chip {
  @apply whitespace-nowrap px-4 py-1.5 rounded-full font-body text-sm font-medium border border-white/5 transition-all text-text-secondary bg-white/5;
  @apply hover:bg-white/10 hover:text-text-primary;
}

.category-chip.is-active {
  @apply bg-accent-neutral/15 border-accent-neutral/30 text-accent-neutral shadow-glow-neutral/20;
}

/* Hide Scrollbar util */
.hide-scrollbar {
  -ms-overflow-style: none; /* IE and Edge */
  scrollbar-width: none; /* Firefox */
}
.hide-scrollbar::-webkit-scrollbar {
  display: none; /* Chrome, Safari and Opera */
}

/* History Bar */
.history-bar {
  @apply flex items-center justify-between bg-white/5 backdrop-blur-md rounded-xl p-4 border border-white/5 shadow-inner;
}

.history-stats {
  @apply flex items-center gap-3;
}

.history-text {
  @apply font-mono text-xs text-text-secondary;
}

.clear-btn {
  @apply font-body text-xs text-accent-alert hover:text-accent-alert/80 underline cursor-pointer transition-colors;
}

/* Skeleton loader */
.news-skeleton {
  @apply flex flex-col gap-3 mt-2;
}

.skeleton-card {
  @apply h-24 rounded-xl bg-bg-primary border border-white/5 animate-pulse;
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

.news-feed.is-grid {
  @apply grid grid-cols-1 md:grid-cols-2 gap-5;
}

/* Image styling */
.nc-image {
  @apply w-full h-40 object-cover rounded-xl mb-3 border border-white/5 bg-white/5;
}

/* Make grid card take full height and push footer to bottom */
.news-feed.is-grid .news-card {
  @apply justify-between;
}

.news-feed.is-grid .news-card-top {
  @apply h-full flex flex-col;
}

.news-feed.is-grid .nc-footer {
  @apply mt-auto;
}

/* News Card */
.news-card {
  @apply bg-bg-elevated/40 backdrop-blur-sm border border-white/5 rounded-2xl flex flex-col transition-all duration-300 shadow-md;
  @apply hover:border-white/10 hover:-translate-y-1 hover:shadow-glow-neutral/10;
}

.news-card.is-read {
  @apply opacity-60 border-dashed border-white/5 bg-transparent shadow-none hover:translate-y-0 hover:border-white/10 hover:shadow-none;
}

.news-card.is-expanded {
  @apply border-accent-neutral/30 bg-bg-elevated;
}

.news-card-top {
  @apply p-4 cursor-pointer flex flex-col gap-2;
}

.nc-meta {
  @apply flex flex-wrap items-center gap-2.5 font-mono text-[10px] text-text-muted uppercase tracking-wider mb-1;
}

.nc-category {
  @apply text-accent-neutral bg-accent-neutral/10 px-2.5 py-1 rounded-md font-semibold tracking-widest;
}

.nc-source {
  @apply text-text-muted italic normal-case;
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
  @apply font-body font-semibold text-xs text-accent-neutral bg-accent-neutral/10 px-4 py-2 rounded-full hover:bg-accent-neutral/20 transition-colors flex items-center gap-1;
}

.nc-external-link {
  @apply flex items-center font-body font-semibold text-xs text-accent-neutral bg-accent-neutral/10 px-4 py-2 rounded-full hover:bg-accent-neutral/20 hover:text-accent-growth transition-colors;
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
