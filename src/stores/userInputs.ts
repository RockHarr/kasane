import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { UserProfile } from '@/types'
import { saveProfile, loadProfile } from '@/services/firestore'

export const useUserInputsStore = defineStore('userInputs', () => {
  const profile = ref<UserProfile | null>(null)
  const hasProfile = ref(false)
  const saving = ref(false)

  async function setProfile(data: UserProfile, uid?: string) {
    profile.value = data
    hasProfile.value = true

    if (uid) {
      saving.value = true
      try {
        await saveProfile(uid, data)
      } finally {
        saving.value = false
      }
    }
  }

  async function fetchProfile(uid: string) {
    const remote = await loadProfile(uid)
    if (remote) {
      profile.value = remote
      hasProfile.value = true
    }
  }

  function reset() {
    profile.value = null
    hasProfile.value = false
  }

  return { profile, hasProfile, saving, setProfile, fetchProfile, reset }
})
