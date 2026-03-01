<script setup lang="ts">
import { computed } from 'vue'

interface KasaneLogoProps {
  /**
   * Size configuration.
   * 'sm' -> h-6 (24px)
   * 'md' -> h-8 (32px)
   * 'lg' -> h-12 (48px)
   * 'xl' -> h-16 (64px)
   */
  size?: 'sm' | 'md' | 'lg' | 'xl'
  /** Show the logotype "Kasane" text besides the emblem */
  withText?: boolean
  /** Custom CSS classes for the wrapper */
  class?: string
}

const props = withDefaults(defineProps<KasaneLogoProps>(), {
  size: 'md',
  withText: true,
  class: ''
})

const sizeClasses = computed(() => {
  switch (props.size) {
    case 'sm':
      return { icon: 'w-6 h-6', text: 'text-lg', gap: 'gap-1.5', padding: 'p-[4px]' }
    case 'md':
      return { icon: 'w-8 h-8', text: 'text-xl', gap: 'gap-2', padding: 'p-[5px]' }
    case 'lg':
      return { icon: 'w-12 h-12', text: 'text-3xl', gap: 'gap-3', padding: 'p-[8px]' }
    case 'xl':
      return { icon: 'w-16 h-16', text: 'text-5xl', gap: 'gap-4', padding: 'p-[10px]' }
    default:
      return { icon: 'w-8 h-8', text: 'text-xl', gap: 'gap-2', padding: 'p-[5px]' }
  }
})
</script>

<template>
  <div :class="['flex items-center select-none', sizeClasses.gap, props.class]">
    
    <!-- Kasane Emblem (The overlapping 'K' layers) -->
    <div 
      :class="[
        'relative bg-bg-elevated rounded-lg shadow-glow-growth border border-white/10 flex items-center justify-center overflow-hidden', 
        sizeClasses.icon,
        sizeClasses.padding
      ]"
    >
      <!-- Background ambient glow inside the icon -->
      <div class="absolute inset-0 bg-gradient-to-br from-accent-neutral/20 to-accent-growth/20"></div>
      
      <!-- Vector SVG Logo -->
      <svg
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        class="w-full h-full relative z-10 drop-shadow-md"
      >
        <defs>
          <linearGradient id="kasane-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#5b9dff" /><!-- accent-neutral -->
            <stop offset="100%" stop-color="#00ffaa" /><!-- accent-growth -->
          </linearGradient>
          <linearGradient id="kasane-gradient-muted" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stop-color="#3b82f6" /><!-- neutral-bg -->
            <stop offset="100%" stop-color="#00ff88" stop-opacity="0.6" /><!-- growth-bg -->
          </linearGradient>
        </defs>

        <!-- Vertical structural pillar (The foundation) -->
        <rect x="4" y="2" width="4" height="20" rx="1.5" fill="url(#kasane-gradient)" />
        
        <!-- Overlapping Layer 1 (Top wing) -->
        <path 
           d="M10 12 L18 3 H22 L13 13 Z" 
           fill="url(#kasane-gradient-muted)" 
        />
        
        <!-- Overlapping Layer 2 (Bottom wing, overlapping the top one to show 'layers') -->
        <path 
           d="M10 11 L22 21 H17 L9 13 Z" 
           fill="url(#kasane-gradient)" 
        />
      </svg>
    </div>

    <!-- Kasane Logotype Text -->
    <span 
      v-if="props.withText" 
      :class="['font-heading font-bold tracking-wide text-text-primary', sizeClasses.text]"
    >
      Kasane
    </span>
    
  </div>
</template>
