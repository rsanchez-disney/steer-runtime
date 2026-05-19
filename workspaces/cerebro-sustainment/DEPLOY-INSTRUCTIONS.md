# Cerebro — Deploy Instructions

## 1. Crear branch y PR

Abre Git Bash o tu terminal con git y ejecuta:

```bash
cd ~/Kiro/steer-runtime-main

git checkout -b feat/cerebro-sustainment-workspace

git add workspaces/cerebro-sustainment/

git commit -m "feat(workspace): add cerebro-sustainment for DX Profile incident ops

- 8-section incident analysis response format
- Top 8 known incident patterns with Splunk queries
- ServiceNow Disney conventions (states, SLAs, close codes)
- Routing/reassignment table by root cause category
- Architecture context (5-layer, BAPPs, ECS, databases)
- Splunk query templates (SWID, GUID, CorrID)
- Bilingual support (EN/ES)"

git push -u origin feat/cerebro-sustainment-workspace
```

Luego crea el PR en github.disney.com apuntando a `main`.

---

## 2. PR Description (copy-paste)

```markdown
## Summary

Adds `cerebro-sustainment` workspace for the ADM PCS · DX Profile team.

This workspace provides incident management context that enables the AI assistant to respond with structured 8-section analyses when triaging ServiceNow incidents, including:

- Pattern matching against 8 known incident types
- Ready-to-paste Splunk queries and ServiceNow work notes
- Correct routing/reassignment based on root cause
- SLA awareness and Disney state code conventions

## Files Added

```
workspaces/cerebro-sustainment/
├── workspace.json                      # Workspace config (sustainment + ops + dev-core)
├── README.md                           # Usage guide
├── context/
│   ├── team_context.md                 # AG, BAPPs, architecture, routing table
│   ├── incident_patterns.md            # 8 patterns with queries and resolution
│   ├── splunk_queries.md               # Query templates + AppD thresholds
│   └── servicenow_conventions.md       # Disney states, SLAs, triage flow
└── rules/
    └── cerebro-incident-response.md    # 8-section response format (enforced)
```

## How to Test

```bash
koda sync
koda workspace apply cerebro-sustainment
```

Then in chat: "Analiza: usuarios reportan login loop en DLR"

## Impact

- No changes to existing workspaces or profiles
- Additive only — layers on top of `sustainment` profile
```

---

## 3. Mensaje de Slack para el equipo (copy-paste)

### Versión corta:

```
🧠 *Cerebro está disponible como workspace de steer-runtime*

Les da análisis de incidentes en 8 secciones, queries de Splunk listos para copiar, work notes en formato Disney, y routing automático.

*Setup (30 seg):*
```
koda sync
koda workspace apply cerebro-sustainment
```

*Pruébenlo:* peguen la descripción de un INC en el chat y vean la magia ✨

No toca nada de sus profiles actuales — se suma encima.
```

### Versión completa:

```
🧠 *Cerebro — AI Incident Assistant para DX Profile*

Team, les comparto una herramienta que armé para hacer más eficiente la operación diaria de incidentes. Es un workspace de steer-runtime que le da contexto al AI assistant sobre nuestros servicios, patrones conocidos, y convenciones de ServiceNow.

*¿Qué hace?*
Cuando le pegas un INC o describes un problema, responde con 8 secciones:
1️⃣ Entendimiento del incidente (humano + técnico)
2️⃣ Causa probable (hipótesis rankeadas)
3️⃣ 3 pasos de resolución (herramienta → acción → qué buscar)
4️⃣ Incidentes relacionados (históricos)
5️⃣ Work note para ServiceNow (copy-paste)
6️⃣ Routing (a qué AG escalar)
7️⃣ Nivel de confianza
8️⃣ Acciones rápidas (queries, dashboards)

*¿Cómo lo activo?*
```
koda sync
koda workspace apply cerebro-sustainment
```

*Ejemplos de uso:*
• `Analiza: Cast Members en City Hall no pueden sincronizar perfiles`
• `Tengo un login loop en DLR`
• `Dame query de Splunk para SWID abc-123`
• `Work note para un 502 en profile API`
• `¿A quién escalo un problema de OneID?`

*Importante:*
• No reemplaza nada — se suma a sus profiles existentes
• Responde en ES o EN según cómo le hablen
• Los queries de Splunk son copy-paste directo
• Las work notes siguen el formato Disney

Cualquier feedback o patrón nuevo que quieran agregar, me avisan 🙌
```

---

## 4. Después del merge — Verificación

Pídele a alguien del equipo que corra:

```bash
koda sync
koda workspace apply cerebro-sustainment
koda doctor
```

Y que pruebe con:
```
Analiza: usuarios reportan que no pueden ver sus fotos con watermark en la app DLM en WDW
```

Debería responder con las 8 secciones completas.
