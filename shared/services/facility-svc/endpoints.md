# Facility Service — Endpoints

Base path: `/facility-service`

## Endpoint Groups

### Destinations
| Method | Path | Description |
|--------|------|-------------|
| GET | `/destinations` | List all destinations |
| GET | `/destinations/{id}` | Get destination by ID |

### Resorts
| Method | Path | Description |
|--------|------|-------------|
| GET | `/resorts` | List resorts for a destination |
| GET | `/resorts/{id}` | Get resort details |

### Theme Parks & Water Parks
| Method | Path | Description |
|--------|------|-------------|
| GET | `/theme-parks` | List theme parks |
| GET | `/theme-parks/{id}` | Get theme park details |
| GET | `/water-parks` | List water parks |
| GET | `/water-parks/{id}` | Get water park details |

### Attractions
| Method | Path | Description |
|--------|------|-------------|
| GET | `/attractions` | List attractions (filterable by park/resort) |
| GET | `/attractions/{id}` | Get attraction details |
| GET | `/attractions/{id}/wait-times` | Get wait times for attraction |

### Entertainments
| Method | Path | Description |
|--------|------|-------------|
| GET | `/entertainments` | List entertainment offerings |
| GET | `/entertainments/{id}` | Get entertainment details |
| GET | `/entertainments/{id}/schedules` | Get entertainment schedules |

### Restaurants / Dining
| Method | Path | Description |
|--------|------|-------------|
| GET | `/restaurants` | List restaurants |
| GET | `/restaurants/{id}` | Get restaurant details |
| GET | `/restaurants/{id}/menus` | Get restaurant menus |

### Characters
| Method | Path | Description |
|--------|------|-------------|
| GET | `/characters` | List characters |
| GET | `/characters/{id}` | Get character details |
| GET | `/characters/{id}/schedules` | Character appearance schedules |

### Schedules
| Method | Path | Description |
|--------|------|-------------|
| GET | `/schedules` | Get schedules (by facility/date range) |
| GET | `/schedules/{facilityId}` | Get schedule for specific facility |

### Wait Times
| Method | Path | Description |
|--------|------|-------------|
| GET | `/wait-times` | Bulk wait times |
| GET | `/wait-times/{facilityId}` | Wait time for specific facility |

### Transportation
| Method | Path | Description |
|--------|------|-------------|
| GET | `/transportation` | List transportation options |
| GET | `/transportation/{id}` | Get transportation details |
| GET | `/transportation/routes` | Get available routes |

### Room Types (Resorts)
| Method | Path | Description |
|--------|------|-------------|
| GET | `/room-types` | List room types |
| GET | `/room-types/{id}` | Get room type details |

### Admin
| Method | Path | Description |
|--------|------|-------------|
| GET | `/admin/health` | Health check |
| GET | `/admin/cache/stats` | Cache statistics |
| POST | `/admin/cache/clear` | Clear cache (authorized) |
| GET | `/admin/config` | Current configuration |

## Common Query Parameters

- `region` — Filter by geographic region
- `fields` — Sparse field selection
- `page`, `size` — Pagination
- `startDate`, `endDate` — Date range filtering (schedules)
- `view` — Response detail level (e.g., `full`, `summary`)
