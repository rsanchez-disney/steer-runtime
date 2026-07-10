# Splunk query cookbook

## Payment service errors

```splunk
index=wdpr_payment* status>=500 source=*payment-service*
| stats count by status, source, host
| sort -count
```

## Connection pool exhaustion

```splunk
index=wdpr_payment* ("pool exhausted" OR "connection timeout" OR "no available connections")
| timechart span=5m count by source
```

## Payment gateway timeouts (INC0067890 pattern)

```splunk
index=wdpr_payment* source=*BAPP0012692*
  (status=504 OR "gateway timeout" OR "connection refused")
| timechart span=1m count
```

## Cascade detection (payment → booking → checkout)

```splunk
index=wdpr_payment* OR index=wdpr_booking* OR index=wdpr_commerce*
  (status>=500)
  (source=*BAPP0012692* OR source=*BAPP0012680* OR source=*BAPP0143610* OR source=*BAPP0138342*)
| timechart span=5m count by source
```

## Post-deployment health check

```splunk
index=wdpr_payment* source=*payment-service* earliest=-30m
| stats count as total,
        count(eval(status>=500)) as errors,
        avg(response_time) as avg_rt
| eval error_rate=round(errors/total*100, 2)
| where error_rate > 1 OR avg_rt > 2000
```

## Service indexes

| Service                       | Index              | BAPP         |
|-------------------------------|--------------------|--------------|
| Payment Service               | wdpr_payment       | BAPP0012692  |
| Booking Service               | wdpr_booking       | BAPP0012680  |
| Order View Assembler          | wdpr_commerce      | BAPP0143610  |
| Checkout SPA                  | wdpr_commerce      | BAPP0138342  |
| Config Services               | wdpr_payment       | —            |
| Payment Controls API          | wdpr_payment       | —            |
| Payment Sheet API             | wdpr_payment       | —            |
| GCP Admin Services            | wdpr_gcp           | —            |
| GCP Guest Services            | wdpr_gcp           | —            |
