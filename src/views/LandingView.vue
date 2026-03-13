<script setup lang="ts">
import { useRouter } from 'vue-router'
import { ArrowRight, BarChart3, CreditCard, ShieldCheck, PlayCircle, Smartphone } from 'lucide-vue-next'
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

        <!-- Kasane Simulator Video -->
        <div class="dashboard-preview mt-20 relative w-full max-w-5xl rounded-xl p-2 shadow-2xl flex justify-center perspective-1000">
          <div class="w-full h-auto rounded-lg shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/5 hover:border-white/20 transition-colors duration-500 overflow-hidden relative group">
            <video autoplay loop muted playsinline poster="/app-dashboard.png" class="w-full h-full object-cover">
              <source src="/videos/simulate.mp4" type="video/mp4" />
              Tu navegador no soporta el video.
            </video>
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

    <!-- Sección: Kasane en acción (Video comercial) -->
    <section class="video-section py-24 px-6 relative z-10 bg-bg-primary overflow-hidden">
      <!-- Ambient Glow -->
      <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-accent-neutral/5 rounded-[100%] blur-[120px] pointer-events-none -z-10"></div>
      
      <div class="max-w-6xl mx-auto flex flex-col items-center">
        <h2 class="font-heading text-4xl md:text-5xl font-bold mb-12 text-center text-transparent bg-clip-text bg-gradient-to-r from-white to-white/70">
          Mira a Kasane en acción
        </h2>
        <div class="w-full aspect-video max-w-5xl mx-auto rounded-3xl bg-bg-elevated border border-white/10 shadow-[0_0_60px_rgba(91,157,255,0.15)] overflow-hidden relative group cursor-pointer hover:shadow-[0_0_80px_rgba(91,157,255,0.25)] transition-all duration-700">
          <video autoplay loop muted playsinline poster="/app-browser-mockup.png" class="w-full h-full object-cover transform transition-transform duration-1000 group-hover:scale-105">
            <source src="/videos/commercial.mp4" type="video/mp4" />
            Tu navegador no soporta el video.
          </video>
          <!-- Gradiente superpuesto sutil -->
          <div class="absolute inset-0 bg-gradient-to-t from-bg-primary via-transparent to-transparent pointer-events-none opacity-60"></div>
        </div>
      </div>
    </section>

    <!-- Sección: Diseñado para tu ecosistema (solo texto) -->
    <section class="screenshots-section py-24 px-6 relative z-10 bg-bg-secondary/30 border-t border-white/5 overflow-hidden">
      <div class="absolute top-0 right-0 w-[500px] h-[500px] bg-accent-growth/5 rounded-full blur-[100px] pointer-events-none z-0"></div>
      
      <div class="max-w-4xl mx-auto flex flex-col items-center text-center relative z-10">
        <div class="w-12 h-12 rounded-xl bg-accent-neutral/10 flex items-center justify-center mb-6">
           <Smartphone class="w-6 h-6 text-accent-neutral" />
        </div>
        <h2 class="font-heading text-3xl md:text-5xl font-bold mb-6">Diseñado para tu ecosistema</h2>
        <p class="text-text-secondary text-lg mb-8 leading-relaxed max-w-2xl">
          Una interfaz fluida, predictiva y centrada en tus objetivos. El resumen de tu patrimonio y el detalle de tus movimientos, siempre a la mano.
        </p>
        <ul class="flex flex-wrap justify-center gap-6 mt-4">
           <li class="flex items-center gap-3 text-text-primary"><div class="w-2 h-2 rounded-full bg-accent-growth shadow-glow-growth"></div> Modo oscuro inmersivo</li>
           <li class="flex items-center gap-3 text-text-primary"><div class="w-2 h-2 rounded-full bg-accent-neutral shadow-glow-neutral"></div> Resúmenes gráficos avanzados</li>
           <li class="flex items-center gap-3 text-text-primary"><div class="w-2 h-2 rounded-full bg-accent-alert shadow-glow-alert"></div> Alertas predictivas de gastos</li>
        </ul>
      </div>
    </section>

    <!-- Sección: Seguridad -->
    <section id="security" class="security-section py-24 px-6 relative z-10 bg-bg-primary border-t border-white/5">
      <div class="max-w-4xl mx-auto flex flex-col items-center text-center">
        <h2 class="font-heading text-3xl md:text-5xl font-bold mb-6">Tu seguridad es nuestra prioridad</h2>
        <p class="text-text-secondary text-lg mb-8 leading-relaxed max-w-2xl">
          En Kasane nos tomamos en serio tu privacidad. No vendemos tus datos a terceros y toda tu información viaja cifrada y segura.
        </p>
        <div class="bg-bg-elevated/50 border border-white/10 rounded-2xl p-8 shadow-lg max-w-3xl w-full text-left flex gap-6 items-start">
           <div class="w-12 h-12 shrink-0 rounded-full bg-accent-alert/10 flex items-center justify-center mt-1">
             <ShieldCheck class="w-6 h-6 text-accent-alert" />
           </div>
           <div>
             <h3 class="font-heading text-xl font-bold mb-2">Protección de Datos (Ley N° 19.628)</h3>
             <p class="text-text-secondary text-base leading-relaxed">
               Operamos bajo el cumplimiento de la Ley Sobre Protección de la Vida Privada de Chile. Tu información financiera es estrictamente tuya. Nuestro sistema de autenticación usa tecnología estándar de la industria (Google Auth / Firebase) garantizando que nosotros nunca tenemos acceso a tus contraseñas o datos de tarjeta de crédito en crudo.
             </p>
           </div>
        </div>
      </div>
    </section>

    <!-- Sección: Planes -->
    <section id="pricing" class="pricing-section py-24 px-6 relative z-10 bg-bg-secondary/30 border-t border-white/5">
      <div class="max-w-4xl mx-auto flex flex-col items-center text-center">
        <h2 class="font-heading text-3xl md:text-5xl font-bold mb-6">Planes transparentes</h2>
        <p class="text-text-secondary text-lg mb-12 leading-relaxed max-w-2xl">
          Empieza a tomar el control de tus finanzas hoy mismo sin costos ocultos.
        </p>
        
        <div class="w-full max-w-md bg-bg-elevated border-2 border-accent-growth/30 rounded-3xl p-8 shadow-[0_0_40px_rgba(0,255,170,0.1)] relative transform hover:-translate-y-2 transition-transform duration-500">
          <div class="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-accent-growth text-bg-primary font-bold px-4 py-1 rounded-full text-sm">
            Para todos
          </div>
          <h3 class="font-heading text-3xl font-bold mb-2">Freemium</h3>
          <div class="text-5xl font-extrabold mb-6 mt-4">$0 <span class="text-lg text-text-muted font-normal">/mes</span></div>
          <p class="text-text-secondary mb-8">Todas las herramientas esenciales para proyectar, simular y aprender de tus inversiones.</p>
          
          <ul class="space-y-4 text-left mb-8">
            <li class="flex items-center gap-3"><ShieldCheck class="w-5 h-5 text-accent-growth" /> <span class="text-text-primary">Simulador de inversiones completo</span></li>
            <li class="flex items-center gap-3"><ShieldCheck class="w-5 h-5 text-accent-growth" /> <span class="text-text-primary">Módulo educativo Kasane Educa</span></li>
            <li class="flex items-center gap-3"><ShieldCheck class="w-5 h-5 text-accent-growth" /> <span class="text-text-primary">Seguimiento de patrimonio base</span></li>
            <li class="flex items-center gap-3"><ShieldCheck class="w-5 h-5 text-accent-growth" /> <span class="text-text-primary">Acceso web y móvil</span></li>
          </ul>
          
          <button 
            class="w-full py-4 rounded-xl font-bold text-bg-primary bg-gradient-to-r from-accent-growth to-accent-neutral hover:shadow-glow-growth transition-all"
            @click="navigateToApp"
          >
            Comenzar Gratis
          </button>
        </div>
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
