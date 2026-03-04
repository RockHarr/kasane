<script setup lang="ts">
import { useRouter } from 'vue-router'
import KasaneLogo from '@/components/atoms/KasaneLogo.vue'
import { ShieldCheck, Database, Eye, Trash2, Lock, ChevronLeft } from 'lucide-vue-next'

const router = useRouter()
</script>

<template>
  <div class="privacy-page">
    <!-- Header -->
    <header class="privacy-header">
      <button class="back-btn" @click="router.back()">
        <ChevronLeft :size="18" /> Volver
      </button>
      <KasaneLogo size="sm" />
    </header>

    <main class="privacy-content">
      <!-- Page Title -->
      <div class="page-hero">
        <div class="hero-icon-wrap">
          <ShieldCheck :size="36" class="hero-icon" />
        </div>
        <h1 class="page-title">Privacidad y Protección de Datos</h1>
        <p class="page-subtitle">
          Tu privacidad es nuestra prioridad. Esta política explica cómo Kasane recopila, usa y protege tu información.
        </p>
        <span class="page-date">Última actualización: Marzo 2025</span>
      </div>

      <!-- Sections -->
      <div class="sections">

        <!-- 1. Qué recopilamos -->
        <section class="policy-section">
          <div class="section-icon-wrap">
            <Database :size="20" />
          </div>
          <div class="section-body">
            <h2 class="section-title">¿Qué datos recopilamos?</h2>
            <p class="section-text">
              Kasane recopila únicamente la información estrictamente necesaria para personalizar tu experiencia financiera:
            </p>
            <ul class="section-list">
              <li><strong>Datos de cuenta:</strong> correo electrónico y nombre de perfil (vía Google Auth o registro directo).</li>
              <li><strong>Perfil financiero:</strong> excedente mensual, aporte estimado y horizonte de inversión que ingresas durante el diagnóstico.</li>
              <li><strong>Historial de simulaciones:</strong> las proyecciones DCA que guardas voluntariamente.</li>
              <li><strong>Preferencias de UI:</strong> configuración de visualización que eliges dentro de la app.</li>
            </ul>
          </div>
        </section>

        <!-- 2. Cómo lo usamos -->
        <section class="policy-section">
          <div class="section-icon-wrap">
            <Eye :size="20" />
          </div>
          <div class="section-body">
            <h2 class="section-title">¿Cómo usamos tus datos?</h2>
            <p class="section-text">
              Tus datos se usan exclusivamente para:
            </p>
            <ul class="section-list">
              <li>Personalizar el dashboard con tu estrategia de inversión.</li>
              <li>Calcular y mostrar proyecciones de interés compuesto (DCA).</li>
              <li>Guardar y recuperar el historial de simulaciones desde cualquier dispositivo.</li>
              <li>Recordar tus preferencias entre sesiones.</li>
            </ul>
            <p class="section-text mt-3">
              <strong>Nunca usamos tus datos para publicidad, perfilado externo ni los vendemos a terceros.</strong>
            </p>
          </div>
        </section>

        <!-- 3. Almacenamiento local -->
        <section class="policy-section highlight">
          <div class="section-icon-wrap">
            <Lock :size="20" />
          </div>
          <div class="section-body">
            <h2 class="section-title">Almacenamiento en tu dispositivo</h2>
            <p class="section-text">
              Kasane utiliza dos mecanismos de almacenamiento local en tu navegador, ambos sin enviar datos a terceros:
            </p>
            <div class="storage-grid">
              <div class="storage-card">
                <h3 class="storage-label">🗂️ localStorage</h3>
                <p class="storage-desc">Persiste entre sesiones. Guardamos aquí tus preferencias de UI (ocultar noticias leídas, configuración del simulador, tutorial descartado). Se borra manualmente desde el navegador.</p>
              </div>
              <div class="storage-card">
                <h3 class="storage-label">⏱️ sessionStorage</h3>
                <p class="storage-desc">Solo dura mientras tienes la pestaña abierta. Guardamos aquí el historial de noticias leídas en esta sesión. Se borra automáticamente al cerrar el navegador.</p>
              </div>
            </div>
          </div>
        </section>

        <!-- 4. Firebase -->
        <section class="policy-section">
          <div class="section-icon-wrap">
            <ShieldCheck :size="20" />
          </div>
          <div class="section-body">
            <h2 class="section-title">Seguridad e infraestructura</h2>
            <p class="section-text">
              Kasane usa <strong>Firebase (Google)</strong> como proveedor de autenticación y base de datos. Esto significa:
            </p>
            <ul class="section-list">
              <li>Tu contraseña nunca es vista ni almacenada por nosotros.</li>
              <li>La comunicación entre la app y Firebase es siempre encriptada (HTTPS/TLS).</li>
              <li>Las reglas de seguridad de Firestore están configuradas para que cada usuario solo pueda leer y escribir su propia información.</li>
            </ul>
          </div>
        </section>

        <!-- 5. Tus derechos -->
        <section class="policy-section">
          <div class="section-icon-wrap">
            <Trash2 :size="20" />
          </div>
          <div class="section-body">
            <h2 class="section-title">Tus derechos sobre tus datos</h2>
            <ul class="section-list">
              <li><strong>Acceso:</strong> Puedes ver toda tu información dentro de la app en cualquier momento.</li>
              <li><strong>Eliminación:</strong> Para eliminar tu cuenta y todos los datos asociados, contáctanos vía el correo listado abajo.</li>
              <li><strong>Portabilidad:</strong> Tus simulaciones están disponibles en pantalla; puedes copiarlas en cualquier momento.</li>
              <li><strong>Sin perfilado automatizado:</strong> No tomamos decisiones automatizadas que afecten tu vida real.</li>
            </ul>
          </div>
        </section>

        <!-- Disclaimer educativo -->
        <div class="disclaimer-box">
          <p>
            <strong>⚠️ Aviso legal:</strong> Kasane es una plataforma educativa de simulación financiera.
            Los datos utilizados en las proyecciones son ilustrativos y <strong>no constituyen asesoramiento financiero profesional</strong>.
            Consulta a un asesor certificado antes de tomar decisiones de inversión reales.
          </p>
        </div>

        <!-- Contacto -->
        <div class="contact-box">
          <p class="contact-text">¿Tienes preguntas sobre tu privacidad? Escríbenos a:</p>
          <a href="mailto:privacidad@kasane.app" class="contact-email">privacidad@kasane.app</a>
        </div>
      </div>
    </main>
  </div>
</template>

<style scoped lang="postcss">
@reference "tailwindcss";
@config "../../tailwind.config.js";

.privacy-page {
  @apply min-h-screen bg-bg-primary text-text-primary font-body;
  @apply flex flex-col;
}

.privacy-header {
  @apply flex items-center justify-between px-6 py-4 sticky top-0 z-10;
  @apply border-b border-white/5 backdrop-blur-md bg-bg-primary/80;
}

.back-btn {
  @apply flex items-center gap-1 text-sm text-text-muted;
  @apply hover:text-text-primary transition-colors;
}

.privacy-content {
  @apply w-full max-w-2xl mx-auto px-6 py-12;
}

/* Hero */
.page-hero {
  @apply flex flex-col items-center text-center gap-3 mb-12;
}

.hero-icon-wrap {
  @apply p-4 rounded-2xl bg-accent-neutral/10 border border-accent-neutral/20;
}

.hero-icon {
  @apply text-accent-neutral;
}

.page-title {
  @apply font-heading text-3xl font-bold text-text-primary;
}

.page-subtitle {
  @apply text-text-secondary text-base leading-relaxed max-w-lg;
}

.page-date {
  @apply text-xs text-text-muted font-mono;
}

/* Sections */
.sections {
  @apply flex flex-col gap-6;
}

.policy-section {
  @apply flex gap-4 p-6 rounded-2xl;
  @apply border border-white/5 bg-bg-elevated/50 backdrop-blur-sm;
}

.policy-section.highlight {
  @apply border-accent-neutral/20 bg-accent-neutral/5;
}

.section-icon-wrap {
  @apply flex-shrink-0 w-9 h-9 rounded-xl;
  @apply flex items-center justify-center;
  @apply bg-white/5 text-text-secondary;
}

.section-body {
  @apply flex flex-col gap-3;
}

.section-title {
  @apply font-heading text-lg font-semibold text-text-primary;
}

.section-text {
  @apply text-text-secondary text-sm leading-relaxed;
}

.section-list {
  @apply space-y-2 text-sm text-text-secondary;
  @apply list-disc list-inside;
}

/* Storage grid */
.storage-grid {
  @apply grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2;
}

.storage-card {
  @apply p-4 rounded-xl bg-white/5 border border-white/8;
}

.storage-label {
  @apply font-heading text-sm font-semibold text-text-primary mb-2;
}

.storage-desc {
  @apply text-xs text-text-secondary leading-relaxed;
}

/* Disclaimer */
.disclaimer-box {
  @apply p-5 rounded-2xl bg-amber-500/5 border border-amber-500/20;
  @apply text-sm text-text-secondary leading-relaxed;
}

/* Contact */
.contact-box {
  @apply flex flex-col items-center gap-2 pt-4 pb-8 text-center;
}

.contact-text {
  @apply text-sm text-text-muted;
}

.contact-email {
  @apply font-mono text-sm text-accent-neutral hover:underline;
}
</style>
