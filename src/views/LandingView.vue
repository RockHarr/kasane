<script setup lang="ts">
import { useRouter } from 'vue-router'
import { ArrowRight, BarChart3, CreditCard, ShieldCheck, Smartphone } from 'lucide-vue-next'
import DarkVeil from '@/components/atoms/DarkVeil.vue'
import GlareHover from '@/components/molecules/GlareHover.vue'
import KasaneLogo from '@/components/atoms/KasaneLogo.vue'

const router = useRouter()

const navigateToApp = () => {
  router.push({ name: 'login' })
}
</script>

<template>
  <div class="landing-container min-h-screen bg-bg-primary text-text-primary font-body overflow-x-hidden">
    
    <!-- Navbar -->
    <header class="navbar px-6 py-4 flex items-center justify-between border-b border-white/5 relative z-10 backdrop-blur-md bg-bg-primary/80 sticky top-0">
      <div class="logo flex items-center">
        <KasaneLogo size="md" />
      </div>
      
      <nav class="hidden md:flex gap-6 text-sm font-medium text-text-secondary">
        <a href="#features" class="hover:text-text-primary transition-colors">Características</a>
        <a href="#security" class="hover:text-text-primary transition-colors">Seguridad</a>
        <a href="#pricing" class="hover:text-text-primary transition-colors">Planes</a>
      </nav>

      <button
        class="login-btn px-5 py-2 rounded-full text-sm font-bold bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all"
        @click="navigateToApp"
      >
        Ingresar
      </button>
    </header>

    <!-- Hero Section -->
    <section class="hero relative pt-24 pb-32 px-6 flex flex-col items-center justify-center text-center overflow-hidden min-h-[90vh]">
      <!-- Animated Vue Bits Background -->
      <DarkVeil :speed="0.2" :warp-amount="2.0" class="opacity-60" />

      <!-- Glow ambient background -->
      <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-accent-neutral/10 rounded-full blur-[120px] pointer-events-none -z-10"></div>
      <div class="absolute top-0 right-0 w-[400px] h-[400px] bg-accent-growth/10 rounded-full blur-[100px] pointer-events-none -z-10"></div>
      
      <div class="relative z-10 flex flex-col items-center w-full">
        <h1 class="font-heading text-5xl md:text-7xl font-extrabold tracking-tight max-w-4xl leading-tight mb-6">
          Control total de tu <br />
          <span class="text-transparent bg-clip-text bg-gradient-to-r from-accent-neutral to-accent-growth">
            futuro financiero.
          </span>
        </h1>
        
        <p class="text-lg md:text-xl text-text-secondary max-w-2xl mb-10 font-medium leading-relaxed">
          La plataforma inteligente todo en uno para gestionar, invertir y hacer crecer tu capital. 
          Diseño moderno, tecnología de punta y control absoluto.
        </p>
        
        <div class="flex flex-col sm:flex-row gap-4">
          <button
            class="cta-primary group relative px-8 py-4 rounded-full font-heading font-bold text-bg-primary text-lg overflow-hidden transition-all shadow-glow-growth hover:scale-105 active:scale-95"
            @click="navigateToApp"
          >
            <div class="absolute inset-0 bg-gradient-to-r from-accent-growth to-accent-neutral opacity-90 group-hover:opacity-100 transition-opacity"></div>
            <span class="relative z-10 flex items-center gap-2">
              Comenzar ahora
              <ArrowRight class="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </span>
          </button>
        </div>

        <!-- Ethereal Dashboard Preview (Abstract) -->
        <div class="dashboard-preview mt-20 relative w-full max-w-5xl rounded-2xl border border-white/10 bg-bg-secondary/40 backdrop-blur-xl p-4 shadow-2xl flex justify-center perspective-1000">
           <div class="w-full h-64 md:h-96 rounded-xl border border-white/5 bg-bg-elevated/50 flex flex-col items-center justify-center relative overflow-hidden">
              <!-- Mock UI Elements to look like the design -->
              <div class="absolute top-8 left-8 w-48 h-32 rounded-xl bg-white/5 border border-white/10 flex flex-col p-4">
                 <div class="w-10 h-10 rounded-full bg-accent-neutral/20 mb-auto"></div>
                 <div class="w-full h-2 bg-white/10 rounded mt-2"></div>
                 <div class="w-2/3 h-2 bg-white/10 rounded mt-2"></div>
              </div>
              <div class="absolute bottom-8 right-8 w-64 h-40 rounded-xl bg-white/5 border border-white/10 flex flex-col p-4 shadow-glow-alert">
                 <div class="flex items-end h-full gap-2">
                   <div class="w-1/4 bg-accent-alert/50 h-1/3 rounded-t"></div>
                   <div class="w-1/4 bg-accent-alert/70 h-1/2 rounded-t"></div>
                   <div class="w-1/4 bg-accent-alert/90 h-3/4 rounded-t"></div>
                   <div class="w-1/4 bg-accent-alert h-full rounded-t relative">
                      <div class="absolute -top-3 -right-2 w-3 h-3 rounded-full bg-accent-growth shadow-glow-growth"></div>
                   </div>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section id="features" class="features py-24 px-6 relative z-10 border-t border-white/5 bg-bg-secondary/20">
      <div class="max-w-6xl mx-auto">
        <div class="text-center mb-16">
          <h2 class="font-heading text-3xl md:text-5xl font-bold mb-4">La revolución a tu alcance</h2>
          <p class="text-text-secondary text-lg max-w-2xl mx-auto">Todo lo que necesitas para dominar tus finanzas, sin la complejidad de la banca tradicional.</p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <!-- Feature Card 1 -->
          <GlareHover 
             class-name="feature-card p-8 rounded-2xl bg-bg-elevated/80 border border-white/5 shadow-lg flex flex-col items-start group"
             glare-color="#5b9dff" 
             :glare-opacity="0.1"
          >
            <div class="icon-wrapper w-14 h-14 rounded-xl bg-accent-neutral/10 text-accent-neutral flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <CreditCard class="w-7 h-7" />
            </div>
            <h3 class="font-heading text-xl font-bold mb-3">Tarjetas Inteligentes</h3>
            <p class="text-text-secondary text-base leading-relaxed">
              Gasta globalmente con total control, tarjetas virtuales instantáneas y gestión de límites en tiempo real.
            </p>
          </GlareHover>

          <!-- Feature Card 2 -->
          <GlareHover 
             class-name="feature-card p-8 rounded-2xl bg-bg-elevated/80 border border-white/5 shadow-lg flex flex-col items-start group"
             glare-color="#00ffaa" 
             :glare-opacity="0.1"
          >
            <div class="icon-wrapper w-14 h-14 rounded-xl bg-accent-growth/10 text-accent-growth flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <BarChart3 class="w-7 h-7" />
            </div>
            <h3 class="font-heading text-xl font-bold mb-3">Inversiones Simples</h3>
            <p class="text-text-secondary text-base leading-relaxed">
              Accede a mercados globales, evalúa tu perfil de riesgo y construye un portafolio sólido sin comisiones ocultas.
            </p>
          </GlareHover>

          <!-- Feature Card 3 -->
          <GlareHover 
             class-name="feature-card p-8 rounded-2xl bg-bg-elevated/80 border border-white/5 shadow-lg flex flex-col items-start group"
             glare-color="#ffaa77" 
             :glare-opacity="0.1"
          >
            <div class="icon-wrapper w-14 h-14 rounded-xl bg-accent-alert/10 text-accent-alert flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <ShieldCheck class="w-7 h-7" />
            </div>
            <h3 class="font-heading text-xl font-bold mb-3">Seguridad Absoluta</h3>
            <p class="text-text-secondary text-base leading-relaxed">
              Tu información viaja siempre cifrada. Usamos Firebase Auth con Google para que tus datos nunca queden expuestos en nuestros servidores.
            </p>
          </GlareHover>
        </div>
      </div>
    </section>


    <!-- 'Diseñado para tu ecosistema' — texto + bullets sin imagen -->
    <section class="screenshots-section py-24 px-6 relative z-10 bg-bg-secondary/30 border-t border-white/5 overflow-hidden">
      <!-- Background Ambient -->
      <div class="absolute top-0 right-0 w-[500px] h-[500px] bg-accent-growth/5 rounded-full blur-[100px] pointer-events-none z-0"></div>
      
      <div class="max-w-3xl mx-auto text-center relative z-10">
        <div class="w-12 h-12 rounded-xl bg-accent-neutral/10 flex items-center justify-center mb-6 mx-auto">
           <Smartphone class="w-6 h-6 text-accent-neutral" />
        </div>
        <h2 class="font-heading text-3xl md:text-5xl font-bold mb-6">Diseñado para tu ecosistema</h2>
        <p class="text-text-secondary text-lg mb-10 leading-relaxed">
          Una interfaz fluida, predictiva y centrada en tus objetivos. El resumen de tu patrimonio y el detalle de tus movimientos, siempre a la mano.
        </p>
        <ul class="flex flex-col sm:flex-row justify-center gap-6 text-text-primary">
           <li class="flex items-center gap-3"><div class="w-2 h-2 rounded-full bg-accent-growth shrink-0"></div> Modo oscuro inmersivo</li>
           <li class="flex items-center gap-3"><div class="w-2 h-2 rounded-full bg-accent-neutral shrink-0"></div> Resúmenes gráficos avanzados</li>
           <li class="flex items-center gap-3"><div class="w-2 h-2 rounded-full bg-accent-alert shrink-0"></div> Alertas predictivas de gastos</li>
        </ul>
      </div>
    </section>

    <!-- Footer -->
    <footer class="border-t border-white/5 bg-bg-secondary py-12 px-6">
      <div class="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
        <div class="logo flex items-center">
          <KasaneLogo size="sm" class="opacity-50 grayscale hover:grayscale-0 transition-all duration-300" />
        </div>
        <div class="flex items-center gap-4 text-sm text-text-muted">
          <RouterLink to="/privacidad" class="hover:text-text-secondary transition-colors">
            Privacidad y Datos
          </RouterLink>
          <span class="opacity-30">|</span>
          <span>
            &copy; {{ new Date().getFullYear() }} Kasane Financial Technologies. Todos los derechos reservados.
          </span>
        </div>
      </div>
    </footer>
    
  </div>
</template>

<style scoped lang="postcss">
@reference "tailwindcss";
@config "../../tailwind.config.js";

/* Animaciones sutiles para la UI abstracta */
.perspective-1000 {
  perspective: 1000px;
}
.dashboard-preview {
  transform: rotateX(10deg);
  transition: transform 0.5s ease;
}
.dashboard-preview:hover {
  transform: rotateX(0deg);
}

/* Efectos de vidrio generalizados */
.feature-card {
  backdrop-filter: blur(12px);
}
</style>
