# Splunk Queries — Studio PhotoPass (DPI)

> **✅ VALIDADO 2026-06-19** — Queries probadas contra Splunk producción real via Compass MCP.

## Índices Confirmados

| Index | Sourcetypes | Volumen (1h) | Contenido |
|-------|-------------|--------------|-----------|
| `wdw_photopass` | `kinesis:cloudwatchlogs`, `aws:cloudwatchlogs:vpcflow` | ~76M events/h | WDW PhotoPass Lambda services + VPC network |
| `dlr_photopass` | `kinesis:cloudwatchlogs` | ~2.5M events/h | DLR PhotoPass Lambda services |

## Servicios Lambda (Confirmados en Producción)

| Lambda | Función | Volumen |
|--------|---------|---------|
| `wdw-dpi-S0001318-use1-prd-emle-content-logic-service` | EMLE (Experience Magic Lens Enhancement) rendering | Mayor volumen |
| `wdw-dpi-S0001318-use1-prd-perfectlyclear-service` | Photo enhancement (PerfectlyClear AI) | Alto volumen |
| `wdw-dpi-S0001318-use1-prd-blush-content-listener` | Blush AI scan (inappropriate content filter) | Medio |
| `wdw-dpi-S0001318-use1-prd-emle-content-listener` | EMLE event listener | Medio |
| `wdw-dpi-S0001318-use1-prd-guest-msg-processor` | Guest messaging / notifications | Medio |
| `dcl-dpi-S0001402-use1-prd-guest-msg-ingest-eval` | DCL guest message intake | Bajo |
| `wdw-dpi-S0001318-use1-prd-url-shortener-service` | Short URLs for photo links | Bajo |

## Log Format

```
{timestamp}\t{request_id}\t{log_level_code}\t[{Level}] {Namespace.Class}: {Message}
```

Ejemplo real:
```
2026-06-19T21:02:32.045Z  e5c7255e-a759-4ffe-a2fd-0f050d68a5eb  trce  [Information] Photopass.Media.PerfectlyClear.Service.Handler.PerfectlyClearServiceHandler: Upload progress status, percent done 46
```

---

## 🔴 Queries de Productividad (Copy-Paste para Investigación)

### Q1. Errores AHORA — ¿Qué servicios están fallando?
**Cuándo usar:** Primer paso cuando llega un INC de PhotoPass. Muestra si hay errores activos.
```spl
search index=wdw_photopass sourcetype="kinesis:cloudwatchlogs" earliest=-30m
| rex field=source "lambda/(?P<lambda_name>[^:]+)"
| rex field=_raw "\[(?P<log_level>\w+)\]"
| where log_level="Error" OR log_level="Warning"
| stats count by lambda_name, log_level
| sort -count
```
**Qué muestra:** Tabla de servicios con errores en los últimos 30 min. Si un servicio tiene muchos errores, ese es tu problema.

---

### Q2. Errores de EMLE (Photo Crop / Rendering)
**Cuándo usar:** Incidentes de "EMLE Photo Crop Error", "Cannot Generate EMLE", "Buzz Lightyear EMLE Scorecard Failed"
```spl
search index=wdw_photopass sourcetype="kinesis:cloudwatchlogs" source="*emle*" "[Error]" earliest=-1h
| rex field=_raw "\[Error\]\s+(?P<error_message>.+)"
| stats count by error_message
| sort -count
| head 10
```
**Qué muestra:** Los mensajes de error más frecuentes de EMLE. Te dice exactamente qué está fallando en el rendering.

---

### Q3. Errores de PerfectlyClear (Photo Enhancement)
**Cuándo usar:** Cuando fotos salen con calidad mala, grainy, o sin procesamiento.
```spl
search index=wdw_photopass sourcetype="kinesis:cloudwatchlogs" source="*perfectlyclear*" "[Error]" earliest=-1h
| rex field=_raw "\[Error\]\s+(?P<error_message>.+)"
| stats count by error_message
| sort -count
| head 10
```
**Qué muestra:** Errores en el servicio de enhancement. Si hay muchos, las fotos pueden estar sin procesar.

---

### Q4. Blush AI — Contenido Flaggeado (Content Moderation)
**Cuándo usar:** Cuando el PHOTOBOMB error aparece (fotos filtradas incorrectamente por AI).
```spl
search index=wdw_photopass sourcetype="kinesis:cloudwatchlogs" source="*blush*" earliest=-1h
| rex field=_raw "\[(?P<log_level>\w+)\]\s+(?P<message>.+)"
| where log_level="Warning" OR log_level="Error"
| stats count by log_level, message
| sort -count
| head 10
```
**Qué muestra:** Fotos flaggeadas por el AI como inapropiadas. Si hay muchos false positives, es un PHOTOBOMB pattern.

---

### Q5. Guest Messaging — Notificaciones y Entitlements
**Cuándo usar:** Cuando el guest no recibe sus fotos, o entitlement no se propaga (PP+ watermarks, Memory Maker).
```spl
search index=wdw_photopass sourcetype="kinesis:cloudwatchlogs" source="*guest-msg*" "[Error]" earliest=-2h
| rex field=_raw "\[Error\]\s+(?P<error_message>.+)"
| stats count by error_message
| sort -count
| head 10
```
**Qué muestra:** Errores en el pipeline de mensajería guest. Puede indicar por qué entitlements no se propagan.

---

### Q6. Error Rate Timeline — ¿Cuándo empezó el problema?
**Cuándo usar:** Para identificar el momento exacto en que comenzó una degradación.
```spl
search index=wdw_photopass sourcetype="kinesis:cloudwatchlogs" "[Error]" earliest=-4h
| rex field=source "lambda/(?P<lambda_name>[^:]+)"
| timechart span=5m count by lambda_name
```
**Qué muestra:** Gráfica de errores por servicio en el tiempo. Un spike te dice exactamente cuándo empezó.

---

### Q7. DLR Specific — Errores Disneyland (PP+ Watermarks DLR)
**Cuándo usar:** Incidentes de DLR (watermarks, downloads, entitlements DLR).
```spl
search index=dlr_photopass sourcetype="kinesis:cloudwatchlogs" "[Error]" earliest=-1h
| rex field=source "lambda/(?P<lambda_name>[^:]+)"
| rex field=_raw "\[Error\]\s+(?P<error_message>.+)"
| stats count by lambda_name, error_message
| sort -count
| head 15
```
**Qué muestra:** Todos los errores en DLR production. Útil para PP+ watermark issues.

---

### Q8. Buscar por Request ID (Tracing una foto específica)
**Cuándo usar:** Cuando tienes un request_id de un INC work note o de PagerDuty.
```spl
search index=wdw_photopass sourcetype="kinesis:cloudwatchlogs" "{REQUEST_ID}" earliest=-24h
| sort _time
| table _time, source, _raw
| head 50
```
**Qué muestra:** Toda la traza de un request específico. Útil para "Black Hole" — puedes ver si la foto pasó por el pipeline.

---

### Q9. Health Check Rápido — ¿Todo está OK?
**Cuándo usar:** Check rápido al inicio de turno o antes de cerrar un INC.
```spl
search index=wdw_photopass sourcetype="kinesis:cloudwatchlogs" earliest=-15m
| rex field=source "lambda/(?P<lambda_name>[^:]+)"
| rex field=_raw "\[(?P<log_level>\w+)\]"
| stats count(eval(log_level="Error")) as errors, count(eval(log_level="Information")) as info, count as total by lambda_name
| eval error_rate = round(errors/total*100, 2)
| sort -error_rate
| table lambda_name, total, errors, error_rate
```
**Qué muestra:** Error rate por servicio. Si error_rate > 5% = hay un problema activo.

---

### Q10. DCL Ship — Errores por barco
**Cuándo usar:** Incidentes DCL (missing photos on ship, purchase issues per voyage).
```spl
search index=wdw_photopass sourcetype="kinesis:cloudwatchlogs" source="*dcl-dpi*" earliest=-24h
| rex field=source "lambda/(?P<lambda_name>[^:]+)"
| rex field=_raw "\[(?P<log_level>\w+)\]\s+(?P<message>.+)"
| where log_level="Error"
| stats count by lambda_name, message
| sort -count
```
**Qué muestra:** Errores específicos de DCL. Ayuda a diagnosticar issues de barcos.

---

## 📋 Uso Rápido por Patrón de Incidente

| Patrón | Query a Usar | Qué Buscar |
|--------|-------------|------------|
| PP+ Watermarks (DLR) | Q7 (DLR errors) + Q5 (guest-msg) | Errores en entitlement propagation |
| Black Hole (photos missing) | Q8 (by request_id) + Q1 (errors now) | Si la foto pasó por el pipeline |
| Camera Freeze/Reset | No aplica Splunk (PagerDuty/AGMC) | Usar AGMC console directamente |
| EMLE Crop Error | Q2 (EMLE errors) | Qué rendering falló |
| PHOTOBOMB Error | Q4 (Blush AI) | False positives del AI |
| Can't Complete Purchase | Q5 (guest-msg) | Errores en order processing |
| Memory Finder | Q5 (guest-msg) + Q6 (timeline) | Cuándo falló el ETL |
| CM3 Performance | No aplica (CM3 es on-prem Windows) | Check AppDynamics |

---

## ⚡ MCP Integration (Bot Auto-Triage)

Cuando el bot recibe un INC de PhotoPass, ejecuta automáticamente:

**Paso 1:** Leer INC → extraer patrón del título  
**Paso 2:** Si el patrón requiere Splunk → ejecutar query correspondiente  
**Paso 3:** Analizar resultado → ¿hay errores activos? ¿cuándo empezaron?  
**Paso 4:** Generar work note con hallazgos  
**Paso 5:** Recomendar: cerrar (workaround), escalar, o investigar más

### Ejemplo de Auto-Triage completo:

```
INC: "WDW - guest@email.com - AGMC Photo Crop Error (PFTH Blue C1)"
→ Patrón detectado: EMLE Crop Error
→ Ejecutar Q2 (EMLE errors)
→ Resultado: 5424 errores en emle-content-logic-service en última hora
→ Work note: "Investigated EMLE service in Splunk. Found 5424 errors in emle-content-logic-service. Issue reported to DS team."
→ Acción: Close as "Solved (Work Around)" — reported to DS team
```
