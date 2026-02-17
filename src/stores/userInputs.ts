import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { UserProfile } from '@/types'

export const useUserInputsStore = defineStore('userInputs', () => {
  const profile = ref<UserProfile | null>(null)
  const hasProfile = ref(false)

  function setProfile(data: UserProfile) {
    profile.value = data
    hasProfile.value = true
  }

  function reset() {
    profile.value = null
    hasProfile.value = false
  }

  return { profile, hasProfile, setProfile, reset }
})
