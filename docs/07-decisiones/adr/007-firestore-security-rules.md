# ADR 007: Firestore Security Rules — Validación y Aislamiento por UID

**Fecha:** 2026-02-20
**Estado:** ✅ Aceptado
**Decidido por:** Rockwell Harrison

---

## Contexto

El ADR 006 estableció Firebase + Firestore como backend del MVP e incluía una regla de seguridad básica:

```js
match /users/{userId}/{document=**} {
  allow read, write: if request.auth != null && request.auth.uid == userId;
}
```

Durante la auditoría de seguridad se detectaron las siguientes deficiencias:

1. **Sin validación de estructura** — cualquier dato puede escribirse en Firestore (campos extra, tipos incorrectos, valores fuera de rango)
2. **Sin archivo `.rules` en el repo** — las reglas no estaban versionadas ni desplegables via CLI
3. **Simulaciones mutables** — un usuario podría editar o borrar su historial de simulaciones
4. **Sin índices declarados** — el `orderBy('createdAt', 'desc')` en `loadSimulations` requiere índice explícito

---

## Decisión

Implementar reglas de seguridad completas en `firestore.rules` con:

### 1. Aislamiento estricto por UID
```js
function isOwner(userId) {
  return request.auth != null && request.auth.uid == userId;
}
```

### 2. Validación de estructura y rangos por documento

**Perfil financiero** (`data/profile`):
```js
function isValidProfile(data) {
  return data.keys().hasAll(['excedente', 'reserva', 'aporteMensual', 'horizonte'])
    && data.excedente is number && data.excedente > 0
    && data.reserva is number  && data.reserva >= 0
    && data.aporteMensual is number && data.aporteMensual >= 0
    && data.horizonte is number && data.horizonte >= 1 && data.horizonte <= 600;
}
```

**Asignación de portafolio** (`data/portfolio`):
```js
function isValidAllocation(data) {
  return data.bonds + data.dividends + data.stocks >= 0.99
      && data.bonds + data.dividends + data.stocks <= 1.01;
}
```
— Tolerancia de ±0.01 para errores de punto flotante.

### 3. Simulaciones inmutables
```js
match /simulations/{simId} {
  allow read:   if isOwner(userId);
  allow create: if isOwner(userId) && isValidSimulation(request.resource.data);
  allow update, delete: if false;
}
```

### 4. Catch-all denegado
```js
match /{document=**} {
  allow read, write: if false;
}
```

---

## Bugs corregidos durante la auditoría

| Archivo | Bug | Corrección |
|---|---|---|
| `DashboardView.vue` | `authStore.logout()` no existe | → `authStore.signOut()` |
| `SimulatorView.vue` | `authStore.logout()` no existe | → `authStore.signOut()` |
| `LoginView.vue` | `e.message.includes()` frágil | → `e.code` de FirebaseError |
| `router/index.ts` | Guard sin timeout (cuelgue) | → `Promise.race` con 5s |

---

## Archivos creados

```
firestore.rules          # Reglas de seguridad versionadas
firestore.indexes.json   # Índice para simulations por createdAt DESC
firebase.json            # Config Firebase CLI para despliegue
```

## Despliegue

```bash
firebase deploy --only firestore:rules,firestore:indexes
```

---

## Consecuencias

### Positivas
- ✅ Datos financieros aislados por UID — un usuario no puede leer datos de otro
- ✅ Validación de datos en Firestore (no solo en frontend)
- ✅ Reglas versionadas en el repo y desplegables via CI/CD
- ✅ Historial de simulaciones protegido e inmutable
- ✅ Errores de auth más robustos y con más casos cubiertos

### Negativas / Trade-offs
- ⚠️ Las reglas deben desplegarse por separado (no van con `npm run build`)
- ⚠️ Si cambia la estructura de datos, hay que actualizar también las reglas

### Decisiones futuras
- Agregar tests de Security Rules con Firebase Emulator Suite
- Considerar `allow delete` para simulaciones con confirmación explícita del usuario
