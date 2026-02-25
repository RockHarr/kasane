import {
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  serverTimestamp,
  type Timestamp,
} from 'firebase/firestore'
import { db } from './firebase'
import type { UserProfile, PortfolioAllocation, OnboardingProfile } from '@/types'

// ─── Perfil del usuario ───────────────────────────────────────────

export async function saveProfile(uid: string, profile: UserProfile): Promise<void> {
  await setDoc(doc(db, 'users', uid, 'data', 'profile'), {
    ...profile,
    updatedAt: serverTimestamp(),
  })
}

export async function loadProfile(uid: string): Promise<UserProfile | null> {
  const snap = await getDoc(doc(db, 'users', uid, 'data', 'profile'))
  if (!snap.exists()) return null
  const data = snap.data()
  return {
    excedente: data.excedente,
    reserva: data.reserva,
    aporteMensual: data.aporteMensual,
    horizonte: data.horizonte,
  }
}

// ─── Onboarding ───────────────────────────────────────────────────

export async function saveOnboarding(uid: string, data: OnboardingProfile): Promise<void> {
  await setDoc(doc(db, 'users', uid, 'data', 'onboarding'), {
    ...data,
    updatedAt: serverTimestamp(),
  })
}

export async function loadOnboarding(uid: string): Promise<OnboardingProfile | null> {
  const snap = await getDoc(doc(db, 'users', uid, 'data', 'onboarding'))
  if (!snap.exists()) return null
  const d = snap.data()
  return {
    perfil: d.perfil,
    meta: d.meta,
    monteMeta: d.monteMeta,
    monedaMeta: d.monedaMeta,
    pais: d.pais,
  }
}

// ─── Portafolio ───────────────────────────────────────────────────

export async function savePortfolio(uid: string, allocation: PortfolioAllocation): Promise<void> {
  await setDoc(doc(db, 'users', uid, 'data', 'portfolio'), {
    ...allocation,
    updatedAt: serverTimestamp(),
  })
}

export async function loadPortfolio(uid: string): Promise<PortfolioAllocation | null> {
  const snap = await getDoc(doc(db, 'users', uid, 'data', 'portfolio'))
  if (!snap.exists()) return null
  const data = snap.data()
  return {
    bonds: data.bonds,
    dividends: data.dividends,
    stocks: data.stocks,
  }
}

// ─── Historial de simulaciones DCA ───────────────────────────────

export interface SimulationRecord {
  id?: string
  profile: UserProfile
  allocation: PortfolioAllocation
  resultado: {
    valorFinal: number
    totalAportado: number
    ganancia: number
    rentabilidadTotal: number
    tasaAnual: number
  }
  createdAt?: Timestamp
}

export async function saveSimulation(
  uid: string,
  record: Omit<SimulationRecord, 'id' | 'createdAt'>
): Promise<string> {
  const ref = await addDoc(collection(db, 'users', uid, 'simulations'), {
    ...record,
    createdAt: serverTimestamp(),
  })
  return ref.id
}

export async function loadSimulations(uid: string): Promise<SimulationRecord[]> {
  const q = query(collection(db, 'users', uid, 'simulations'), orderBy('createdAt', 'desc'))
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() }) as SimulationRecord)
}

export async function deleteSimulation(uid: string, simulationId: string): Promise<void> {
  await deleteDoc(doc(db, 'users', uid, 'simulations', simulationId))
}
