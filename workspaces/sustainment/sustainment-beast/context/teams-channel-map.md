# 📡 Teams Channel Map — Beast Monitoring

Quick-reference for posting to Teams channels without needing to call `list_teams` / `list_channels`.

---

## 🔗 Teams Deeplink Configuration

Use this to build clickable links to specific Teams messages (e.g., for the shift updates log).

**Tenant ID:** `56b731a8-a2ac-4c32-bf6b-616810e913c6`

### Group IDs (per Team)

| Team | Group ID |
|---|---|
| DLP Digital DGE Train | `812fe93d-554d-405e-8f29-47fb67208920` |

> ⚠️ Add more Group IDs here as they are discovered from real Teams URLs. The Group ID is NOT the same as the Team ID from the API — it comes from the `groupId` param in Teams deeplinks.

### Deeplink Template

```
https://teams.microsoft.com/l/message/{channelId}/{messageId}?tenantId=56b731a8-a2ac-4c32-bf6b-616810e913c6&groupId={groupId}&parentMessageId={messageId}&teamName={teamNameEncoded}&channelName={channelNameEncoded}&createdTime={messageId}
```

**How to build:**
1. `channelId` — from the channel map tables below
2. `messageId` — the message ID returned by `list_messages` or `get_message`
3. `groupId` — from the Group IDs table above (match by team)
4. `teamName` — URL-encoded team display name
5. `channelName` — URL-encoded channel display name

**Example:**
```
https://teams.microsoft.com/l/message/19:VxOdz0FL0eglF9n-_ijLV5-hRQIaWgRCJR0NxpLo3Z41@thread.tacv2/1777586530685?tenantId=56b731a8-a2ac-4c32-bf6b-616810e913c6&groupId=812fe93d-554d-405e-8f29-47fb67208920&parentMessageId=1777586530685&teamName=DLP%20Digital%20DGE%20Train&channelName=%F0%9F%94%94%20Monitoring%20Alerts%20(Production)&createdTime=1777586530685
```

## DLP Digital DGE Train

| Channel | Channel ID | Use |
|---|---|---|
| 🔔 Incidents | `19:2dfa0d38c865488f9ebbb02674c84efe@thread.tacv2` | INC resolved/reassigned posts |
| 🔔 Monitoring Alerts (Production) | `19:VxOdz0FL0eglF9n-_ijLV5-hRQIaWgRCJR0NxpLo3Z41@thread.tacv2` | Alert ACK and analysis |
| 🆘 Global Production Support | `19:algipF4HZchtlekwsaAOwfaJE-bSluddLzlgXhe_Ma41@thread.tacv2` | P1/P2 posts, CHG pre/during/post (APP scope) |
| 🆘 Global Lower Support | `19:GB7gXQsjqbD3MxZPoSYEH7KiWwQWIOUfOC7UgI-7-1I1@thread.tacv2` | Non-prod support |
| 🔔 Service Now Updates | `19:x8auqLVxa7YRf9R0_X58jHeMWiFUf50H3DHldIFB3Rs1@thread.tacv2` | SNOW notification feed |
| 🚙 FRONT - BEAST - SUPPORT | `19:anJzUn_iXw7btewTcTCb_fuiWwuLJkHzbehm4Rbg7sM1@thread.tacv2` | Frontend support |
| 🚓 BACK - DOC HUDSON - SUPPORT | `19:2KOlcuYOlkwFM7-gWZMAdA5eJEynyW4tgCAUmkKPi6I1@thread.tacv2` | Backend support |
| 🦁 Beast Ongoing Topics | `19:LIcSVEswXGSMp6DXS4T4k-t3M2ngE3Lbn5afzAO-8qM1@thread.tacv2` | Ongoing discussions |
| 🦁 Beast KTs | `19:pFk9aKHrH-C_ENWGVkJOlhN_NCVsQIv5fbFgStBzpRE1@thread.tacv2` | Knowledge transfers |
| 🌐 Ops - DGE | `19:Hc541RL9m_eexVR7hckD4K_poZ9nPUDmCCKZePr4HI01@thread.tacv2` | Ops coordination |

**Team ID:** `19:59Kpldwk9yGKD7JLJ9NOXWhPWD8XVcuwvgyW5ezbCA41@thread.tacv2`

---

## DLP Ecommerce Train

| Channel | Channel ID | Use |
|---|---|---|
| 🧯 Incidents | `19:417294c04dc542458272a9db0019498f@thread.tacv2` | ECO INC posts |
| 🔔 ARS-CME Monitoring Alerts (Production) | `19:235f6f5400a042a3a5992bf98f527ab2@thread.tacv2` | ECO alert ACK |
| 🛟 ARS-CME support | `19:6011a23e08f3429d8f86e6e500cc26f5@thread.tacv2` | P1/P2 posts, CHG pre/during/post (ECO scope) |
| 🚀 Releases | `19:d2e51a8ee81647b2be95c1ba2834cecd@thread.tacv2` | Release notifications |
| 🧯 [LOWER] Issues | `19:f7fb7bfaffd3491d8bdcf44e1923dcaf@thread.tacv2` | Non-prod issues |
| 🛠️ Deployment-Ops Support | `19:4c5b84c73e0f4fc68ad9e43683809402@thread.tacv2` | Deployment ops |

**Team ID:** `19:vFIiWlNxi2QNxvodiwUV30V74vnnbRtFJXciT7P7M8E1@thread.tacv2`

---

## DLP ITOC (IT Operations Center)

| Channel | Channel ID | Use |
|---|---|---|
| DLP ITOC | `19:f6_FGGAzTXySL5GrMgHLtIKeNNeT0Et3JqpspkwgU-c1@thread.tacv2` | ITOC pre-CHG, P1/P2 posts |
| DLP IT Communication | `19:xMeynCdEXM6szxcgvWzsboMEo-xCm9iC_T8N5fiF__w1@thread.tacv2` | IT communications |

**Team ID:** `19:xMeynCdEXM6szxcgvWzsboMEo-xCm9iC_T8N5fiF__w1@thread.tacv2`

---

## DLP - The Forky Team

| Channel | Channel ID | Use |
|---|---|---|
| Alerts (prod) | `19:86703d5a53044cbe8a3718272e073f6f@thread.tacv2` | Forky prod alerts |
| Alerts (lower envs) | `19:5bc524f98ae54b37a0b854e86f8d9ab1@thread.tacv2` | Forky lower alerts |

**Team ID:** `19:io48qCn015YE4Q3pLYcwRvFks0ee8GauUQ1jDUhsBgQ1@thread.tacv2`

---

## DLP Beast Team (Internal)

| Channel | Channel ID | Use |
|---|---|---|
| 🌎🌍🌍 ADM Beast Team | `19:PtJi1Yz8fVcxOAnz-1jIyhMewSdp_GryL_p4jv24l5s1@thread.tacv2` | General channel |
| 🌎 ADM Beast LATAM | `19:ca13a4801a594591b2520eceed6b6f6f@thread.tacv2` | LATAM shift |
| 🏠 All shifts | `19:W9UHsQnnQgJ6CzGjEfnIrTsKzjUtVjYPGLJQX2EQm9s1@thread.tacv2` | Shift handovers |
| 🏰 Castle Keepers | `19:54bd1b0f44134cdeb88e14229f394861@thread.tacv2` | Private ops |
| 📋 CHGs log | `19:93c93a6f5ff04a8f9c6ac5c6fd43f130@thread.tacv2` | CHG tracking |
| 📈 Daily Report | `19:28d65dbe1ad048768d0b8b07dc0c85ef@thread.tacv2` | Daily reports |
| 🤖🧠 AI Topics | `19:e39b52e11d1b4bdd884429b4e264dfd9@thread.tacv2` | AI tooling |
| 🧑‍💻 Dev Internal Topics | `19:f9657ce66d0640a2ba09cd0508ec6cc4@thread.tacv2` | Dev discussions |
| 👁️ Dev - QA tickets follow-up | `19:a088ff72c68a428ab348276767980026@thread.tacv2` | QA tracking |
| LATAM chat | `19:178b9ce1834f44fc8089523e4067ca54@thread.tacv2` | LATAM private |

**Team ID:** `19:PtJi1Yz8fVcxOAnz-1jIyhMewSdp_GryL_p4jv24l5s1@thread.tacv2`

---

## DLP_DX-Release-Management

| Channel | Channel ID | Use |
|---|---|---|
| dlp-digital-rm-communications | `19:b6bc85d732e34cdf92531a948e42c6c7@thread.tacv2` | RM comms |
| dlp-digital-rm-approval | `19:edde641fc806466d82f6629a631904ec@thread.tacv2` | RM approvals |

**Team ID:** `19:WjLGPQT9O8HyaJrZqnKwdoBfQpom4gPFxkdVydL0x9E1@thread.tacv2`

---

## Other Relevant Teams

| Team | Channel | Channel ID | Team ID |
|---|---|---|---|
| DLP DPA Support | 💫 dlp_dpa_prod_support | `19:1cc3bad003c14ab78d788f7487ba4b36@thread.tacv2` | `19:3bKdRbbNeAVCL4eE9LNBi_LLBT6noMvkc3tn4fbDqYc1@thread.tacv2` |
| Galaxy-TMS | TMS Topics | `19:IwvuTz6zxpIlro25SJcv_NRbShdjo7kavwwDVQteB5s1@thread.tacv2` | `19:IwvuTz6zxpIlro25SJcv_NRbShdjo7kavwwDVQteB5s1@thread.tacv2` |
| TravelBox Ops | travelbox-dlp | `19:L2ptY0Ro0g0a9NaUAwfhikg_6TsHh8ZE16hT3B7OWyM1@thread.tacv2` | `19:61fDOyLa6Ap0AUCIedPGe6eho_FCBiYjRxpqvJZ-7nw1@thread.tacv2` |
| Titus Integration | Titus Production Support | `19:0cee7394335d4a77a768ad8cc12d68e5@thread.tacv2` | `19:dNlCbl6jrG3sa3F3K-hIKM6WPE5ELowuUkeHiGx5PfA1@thread.tacv2` |

---

## Cross-Team Group Chats

These are 1:N group chats (not team channels). Use `list_chat_messages` with the chat ID to read them.

| Chat | Chat ID | Use |
|---|---|---|
| Click and Collect | `19:5e0a4b0ab37d4cecaeb07636bf7db7dd@thread.v2` | C&C / Mobile Order issues with Agilysys & POS |
| DGE & Opera OHIP | `19:53fbb4fd2fba4d209aa15441c68541c6@thread.v2` | Opera/OHIP latency & I/O errors coordination |
| DGE & DRS | `19:b697c27d3e6149e49c45df4cb0ecce96@thread.v2` | Book Dine / DRS issues with Didier/Guillaume |
| DLP DPA incident | `19:405678237ed04d8b88b0d49799f96315@thread.v2` | DPA One/SYS/ULT incidents with EA & BIO teams |

---

## Quick Reference: Where to Post by Scenario

| Scenario | Scope | Channel |
|---|---|---|
| Alert ACK (APP) | DGE | 🔔 Monitoring Alerts (Production) — DGE Train |
| Alert ACK (ECO) | ECO | 🔔 ARS-CME Monitoring Alerts (Production) — Ecommerce Train |
| INC Resolved/Reassigned (APP) | DGE | 🔔 Incidents — DGE Train |
| INC Resolved/Reassigned (ECO) | ECO | 🧯 Incidents — Ecommerce Train |
| P1/P2 ITOC | Both | DLP ITOC |
| P1/P2 Comms (APP) | DGE | 🆘 Global Production Support — DGE Train |
| P1/P2 Comms (ECO) | ECO | 🛟 ARS-CME support — Ecommerce Train |
| CHG Pre/During/Post (APP) | DGE | ITOC + 🆘 Global Production Support — DGE Train |
| CHG Pre/During/Post (ECO) | ECO | ITOC + 🛟 ARS-CME support — Ecommerce Train |
| CHG Daily Log | Beast | 📋 CHGs log — Beast Team |
| Shift Handover | Beast | 🏠 All shifts — Beast Team |

*Last Updated: 2026-04-28*
