// ============================================================
// services/trading.ts — Kasane Trading Lab 🧪
// CRUD de Firestore para cuenta y operaciones de trading simulado.
//
// Rutas:
//   users/{uid}/data/tradingAccount  → TradingAccount (doc único)
//   users/{uid}/trades/{tradeId}     → TradeOrder (colección)
// ============================================================

import {
    doc,
    getDoc,
    setDoc,
    addDoc,
    collection,
    getDocs,
    query,
    orderBy,
    limit,
    serverTimestamp,
} from 'firebase/firestore'
import { db } from './firebase'
import type { TradingAccount, TradeOrder } from '@/types'

const INITIAL_CAPITAL = 10_000

// ─── Cuenta ───────────────────────────────────────────────────

export async function loadTradingAccount(uid: string): Promise<TradingAccount | null> {
    const snap = await getDoc(doc(db, 'users', uid, 'data', 'tradingAccount'))
    if (!snap.exists()) return null
    const d = snap.data()
    return {
        cashUSD: d.cashUSD,
        holdings: d.holdings ?? [],
    }
}

export async function saveTradingAccount(uid: string, account: TradingAccount): Promise<void> {
    await setDoc(doc(db, 'users', uid, 'data', 'tradingAccount'), {
        cashUSD: account.cashUSD,
        holdings: account.holdings,
        updatedAt: serverTimestamp(),
    })
}

/**
 * Crea una cuenta nueva con el capital inicial si no existía.
 * Llamar solo cuando loadTradingAccount retorna null.
 */
export async function initializeTradingAccount(uid: string): Promise<TradingAccount> {
    const account: TradingAccount = {
        cashUSD: INITIAL_CAPITAL,
        holdings: [],
    }
    await saveTradingAccount(uid, account)
    return account
}

// ─── Historial de operaciones ─────────────────────────────────

export async function saveTradeOrder(
    uid: string,
    order: Omit<TradeOrder, 'id' | 'createdAt'>,
): Promise<string> {
    const ref = await addDoc(collection(db, 'users', uid, 'trades'), {
        ...order,
        createdAt: serverTimestamp(),
    })
    return ref.id
}

export async function loadTradeHistory(uid: string, maxResults = 20): Promise<TradeOrder[]> {
    const q = query(
        collection(db, 'users', uid, 'trades'),
        orderBy('createdAt', 'desc'),
        limit(maxResults),
    )
    const snap = await getDocs(q)
    return snap.docs.map(d => ({ id: d.id, ...d.data() }) as TradeOrder)
}
