# ADR 006: Firebase Auth + Firestore para Autenticación y Persistencia

**Fecha:** 2026-02-16
**Estado:** ✅ Aceptado
**Decidido por:** Rockwell Harrison

---

## Contexto

El MVP inicial estaba diseñado como una SPA sin backend — todos los cálculos en frontend, sin persistencia de datos entre sesiones. Durante el desarrollo surgió la necesidad de:

1. **Autenticación** — identificar al usuario para personalizar la experiencia
2. **Persistencia** — guardar el perfil, portafolio y simulaciones entre sesiones
3. **Historial** — consultar simulaciones anteriores

Las opciones consideradas fueron:

| Opción | Auth | DB | Complejidad | Tiempo |
|--------|------|----|-------------|--------|
| Backend propio (Node/Express) | Custom | PostgreSQL | Alta | Semanas |
| Supabase | ✅ | PostgreSQL | Media | Días |
| Firebase | ✅ | Firestore (NoSQL) | Baja | Horas |
| Sin backend (localStorage) | ❌ | localStorage | Ninguna | 0 |

## Decisión

**Firebase** (Authentication + Firestore) por las siguientes razones:

1. **Velocidad de implementación** — SDK oficial para Vue, setup en horas
2. **Sin servidor** — No hay infraestructura que mantener en el MVP
3. **Auth lista** — Google OAuth, email/password out of the box
4. **Gratuito** — Plan Spark cubre el volumen del MVP (50K reads/día)
5. **Escalable** — Si el proyecto crece, Firebase escala sin cambios de código

## Implementación

```
src/services/
├── firebase.ts     # Inicialización del SDK con vars de entorno
├── auth.ts         # loginWithGoogle, loginWithEmail, register, logout, onAuthChange
└── firestore.ts    # CRUD: saveProfile, loadProfile, savePortfolio, loadPortfolio,
                    #       saveSimulation, loadSimulations

src/stores/
└── auth.ts         # Observer de Firebase Auth, carga datos al login, limpia al logout
```

**Estructura de datos en Firestore:**
```
users/
  {uid}/
    data/
      profile     # UserProfile (excedente, reserva, aporteMensual, horizonte)
      portfolio   # PortfolioAllocation (bonds, dividends, stocks)
    simulations/
      {simId}     # SimulationRecord (profile + allocation + createdAt)
```

**Reglas de seguridad:**
```js
match /users/{userId}/{document=**} {
  allow read, write: if request.auth != null && request.auth.uid == userId;
}
```
Solo el usuario autenticado puede acceder a sus propios datos.

## Consecuencias

### Positivas
- ✅ Auth con Google funcional en horas
- ✅ Persistencia entre sesiones sin backend propio
- ✅ Historial de simulaciones en Firestore
- ✅ Reglas de seguridad simples y efectivas

### Negativas / Trade-offs
- ⚠️ Vendor lock-in con Google/Firebase
- ⚠️ Firestore no es relacional (queries limitadas)
- ⚠️ Cold start en el primer load (inicialización del SDK)
- ⚠️ Si supera el plan Spark, hay costos

### Decisiones futuras
- Si se necesita lógica de negocio en servidor → Cloud Functions
- Si se necesitan queries complejas → migrar a Supabase (PostgreSQL)
- Si el volumen crece → revisar costos de Firestore

## Estado

Implementado en MVP v1.0. Firebase Auth con Google habilitado. Firestore en modo producción con reglas de seguridad activas.
