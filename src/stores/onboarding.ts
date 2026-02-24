import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { OnboardingProfile } from '@/types'
import { saveOnboarding, loadOnboarding } from '@/services/firestore'

export const useOnboardingStore = defineStore('onboarding', () => {
  const profile = ref<OnboardingProfile | null>(null)
  const hasOnboarding = ref(false)
  const loading = ref(false)

  async function setOnboarding(data: OnboardingProfile, uid?: string) {
    profile.value = data
    hasOnboarding.value = true

    if (uid) {
      try {
        await saveOnboarding(uid, data)
      } catch {
        // fallback silencioso: los datos quedan en store aunque Firestore falle
      }
    }
  }

  async function fetchOnboarding(uid: string) {
    loading.value = true
    try {
      const remote = await loadOnboarding(uid)
      if (remote) {
        profile.value = remote
        hasOnboarding.value = true
      }
    } finally {
      loading.value = false
    }
  }

  function reset() {
    profile.value = null
    hasOnboarding.value = false
  }

  return { profile, hasOnboarding, loading, setOnboarding, fetchOnboarding, reset }
})
