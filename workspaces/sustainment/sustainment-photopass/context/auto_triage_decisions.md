# Auto-Triage Decision Matrix — PhotoPass Bot

> Reglas para que el bot tome decisiones rápidas basadas en el patrón detectado.
> Objetivo: Reducir MTTR y aumentar productividad del ingeniero.

## Decisión Flow

```
INC llega → Detectar patrón del título → ¿Es auto-resolvable? → Sí → Generar work note + cerrar
                                                                   → No → Investigar con Splunk → Documentar → Cerrar/Escalar
```

---

## ✅ Patrones Auto-Cerrables (No necesitan Splunk)

Estos patrones se pueden cerrar inmediatamente con la work note estándar:

### 1. PP+ Watermarks (DLR)
- **Trigger en título**: `PP+ Entitlement Failed to Remove Watermarks`
- **Decisión**: CERRAR inmediatamente
- **Close Code**: Solved (Work Around)
- **Work Note**:
```
GS team has recovered the incident with a workaround. The team is already working on the solution and is monitoring the issue via PRB0076145
```
- **Tiempo ahorrado**: ~20 min por INC (× 5-10/día = **100-200 min/día**)

### 2. CM3 Crashes (documentación)
- **Trigger en título**: `CM3 froze`, `CM3 crashed`, `CM3 performance degradation`
- **Decisión**: CERRAR inmediatamente
- **Close Code**: Solved (Work Around)
- **Work Note**:
```
Issue is already taken care by Cast Member. Hence closing the INC.
```
- **Tiempo ahorrado**: ~5 min por INC

### 3. UK Memory Maker Not Activated
- **Trigger en título**: `UK MM Did Not Activate Upon Entry`
- **Decisión**: CERRAR después de verificar con GS
- **Close Code**: Solved (Work Around)
- **Work Note**:
```
UK Memory Maker activation issue. Guest recovered via GS manual activation.
```

### 4. Kiosk Issues (PagerDuty)
- **Trigger en título**: `Association Kiosk issue`
- **Decisión**: CERRAR si ya resuelto por PagerDuty
- **Close Code**: Solved (Permanently) si PD resuelve / Solved (Work Around) si restart manual
- **Work Note**:
```
Solved by restarting kiosk session.
```

### 5. Camera PagerDuty (resolved)
- **Trigger en título**: `PagerDuty: AGMC:` + close_notes contiene "Resolved via PagerDuty"
- **Decisión**: CERRAR
- **Close Code**: Solved (Permanently)
- **Work Note**:
```
Resolved via PagerDuty. Closed by PagerDuty.
```

---

## 🔍 Patrones que Requieren Investigación Breve (5 min)

### 6. Black Hole (Photos Missing)
- **Trigger en título**: `Possible Black Hole`
- **Investigación**: Verificar trigger count de la cámara en AGMC console
- **Decisión**: Si no hay fotos → CERRAR
- **Close Code**: Solved (Work Around)
- **Work Note** (la más común):
```
We investigated this, and unfortunately, no photos were found for this gap at this location. The camera's consecutive trigger count appears to be correct, and no photos are available for this case.
```
- **Work Note alternativa** (si se encuentran fotos):
```
[X] photos found and linked to PPID [PPID]. Photos are now visible on the guest profile.
```

### 7. EMLE / Photo Crop Error
- **Trigger en título**: `AGMC Photo Crop Error`, `EMLE`, `PHOTOBOMB`
- **Investigación**: ¿Hay errores en EMLE service? → Ejecutar **Q2**
- **Decisión**: Reportar a DS team → CERRAR
- **Close Code**: Solved (Work Around)
- **Work Note**:
```
It has been reported to the DS team. Resolved by GS and assigned to the respective problem.
```

### 8. Memory Finder (Snowflake)
- **Trigger en título**: `Memory Finder - No scan time populations`
- **Investigación**: ¿Qué fecha falta? → Reprocessar en Snowflake
- **Decisión**: Reprocess → Verificar → CERRAR
- **Close Code**: Solved (Work Around)
- **Work Note**:
```
This was caused by an error with Snowflake. Data was reprocessed and scan times are showing now as expected.
```

### 9. Can't Complete Purchase / Failed Titus
- **Trigger en título**: `Can't Complete Purchase`, `iOS MM Failed Titus`
- **Investigación**: Buscar order UUID en Magneto → Ejecutar **Q5**
- **Decisión**: Si order existe → guest retry → CERRAR
- **Close Code**: Solved (Work Around)
- **Work Note**:
```
Order in magneto: [UUID]. Guest completed purchase on second attempt / via website.
```

---

## 🚨 Patrones que Requieren Escalación (Raro)

### 10. Photo Ingest Pipeline Down
- **Trigger**: `We are not seeing any new photos ingesting into CM3`
- **Investigación**: Ejecutar **Q1** + **Q6** (timeline)
- **Decisión**: Si errores masivos → ESCALAR a DPI engineering
- **Escalation to**: DPI Platform Services (PagerDuty escalation)

### 11. DCL Ship Outage
- **Trigger**: `DCL - [ship] - SSL Cert expired`, `DCL Photo Systems`
- **Investigación**: Ejecutar **Q10** (DCL errors)
- **Decisión**: ESCALAR si es outage de barco
- **Related PRB**: PRB0074421 (DCL cert expiry)

---

## 📊 Impacto en Productividad

| Métrica | Sin Bot | Con Bot |
|---------|---------|---------|
| Tiempo por INC (PP+ watermarks) | ~20 min | ~30 seg (auto-close) |
| Tiempo por INC (Black Hole) | ~30 min | ~5 min (verify + close) |
| Tiempo por INC (CM3 crash) | ~10 min | ~30 seg (auto-close) |
| Tiempo por INC (Camera/PD) | ~15 min | ~2 min |
| INCs procesados/día | 15-20 | 40-60 |
| **Ahorro diario estimado** | — | **3-4 horas** |

---

## 🔄 ServiceNow Work Note Automation

El bot puede generar automáticamente:

1. **Work Note inicial** (al tomar el INC):
```
[{timestamp}] — Investigation performed by Disney Sustainment Glober team (PhotoPass / L3).
Pattern identified: {pattern_name}
Status: Work in Progress
Investigating via {tool} - {query_type}
```

2. **Work Note de cierre** (al resolver):
```
{standard_close_note_for_pattern}
---
```

3. **Actualización de estado**:
- New → WIP (detiene SLA)
- WIP → Resolved (con close note + close code)

---

## Checklist de Cierre por Patrón

| Patrón | Close Code | Verificar Antes de Cerrar |
|--------|-----------|---------------------------|
| PP+ Watermarks | Solved (Work Around) | ¿Es DLR? ¿Tiene PRB0076145? → Sí = cerrar |
| Black Hole | Solved (Work Around) | ¿Se verificó trigger count? → Sí = cerrar |
| CM3 Crash | Solved (Work Around) | ¿Cast Member ya lo reinició? → Sí = cerrar |
| Camera/PD | Solved (Permanently) | ¿PagerDuty muestra resolved? → Sí = cerrar |
| Kiosk | Solved (Work Around) | ¿Se reinició sesión? → Sí = cerrar |
| EMLE/Crop | Solved (Work Around) | ¿Se reportó a DS team? → Sí = cerrar |
| Memory Finder | Solved (Work Around) | ¿Scan times visibles después de reprocess? → Sí = cerrar |
| Purchase | Solved (Work Around) | ¿Guest completó en 2do intento? → Sí = cerrar |
| UK MM | Solved (Work Around) | ¿GS activó manualmente? → Sí = cerrar |
| DLR Download | Solved (Permanently) | ¿Guest pudo via website? → Sí = cerrar |
| iOS Titus | Solved (Work Around) | ¿Order en Magneto? → Sí = cerrar |
| Duplicate | Duplicate | ¿Mismo email + mismo issue? → Link + cerrar |
