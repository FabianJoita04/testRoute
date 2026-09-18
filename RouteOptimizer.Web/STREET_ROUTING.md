# Street-Following Route Visualization

## Overview

The route management system now generates paths that follow actual streets instead of drawing straight lines between stops. This provides a much more realistic visualization of bus routes on the map.

## How It Works

### Routing Service

We use **OpenStreetMap Routing Machine (OSRM)**, a free and open-source routing service:

- **Public API**: `https://router.project-osrm.org`
- **Routing Mode**: Driving (suitable for buses)
- **Output**: GeoJSON coordinates following actual streets

### Implementation

#### 1. Routing Utility (`src/utils/routing.ts`)

```typescript
export async function generateRoutePath(stops: BusStop[]): Promise<[number, number][]>
```

- Takes an array of bus stops in order
- Calls OSRM API to get street-following path
- Returns coordinates as `[latitude, longitude]` array
- Automatically falls back to straight lines if API fails

#### 2. Auto-Generation in Route Form

When creating or editing a route through `RouteFormDialog`:

1. User selects stops in order
2. On save, `generateRoutePath()` is called automatically
3. Route path is generated following actual streets
4. Path is saved with the route data

### Benefits

✓ **Realistic visualization** - Routes follow actual streets
✓ **Accurate distances** - OSRM calculates real driving distances
✓ **Better planning** - See actual paths buses will take
✓ **No manual work** - Automatic generation when stops are selected

### API Response Example

For route from Piața Victoriei → Piața Romană → Piața Universității → Piața Unirii:

- **Points**: 289 coordinates following streets
- **Distance**: 5.33 km (actual driving distance)
- **Duration**: 9.9 minutes (estimated travel time)

### Fallback Behavior

If the OSRM API is unavailable or fails:
- System automatically falls back to straight-line paths
- Routes still display (just less realistic)
- No error shown to user

### Performance Considerations

- **Caching**: Consider implementing client-side cache for generated paths
- **Rate Limiting**: Public OSRM API has rate limits (use with care)
- **Self-Hosted**: For production, consider hosting your own OSRM instance

## Usage

### For New Routes

1. Open "Add New Route" dialog
2. Select stops in order
3. Click Save
4. ✓ Path automatically generated following streets!

### For Existing Routes

Existing sample routes still use simplified paths. To update them:

1. Edit the route
2. Re-save (even without changes)
3. Path will be regenerated with street-following

### Programmatic Usage

```typescript
import { generateRoutePath } from '@/utils/routing';

const stops = [stop1, stop2, stop3];
const path = await generateRoutePath(stops);
// path contains coordinates following actual streets
```

## API Details

### OSRM Endpoint

```
GET https://router.project-osrm.org/route/v1/driving/{coordinates}
    ?overview=full
    &geometries=geojson
```

### Parameters

- `coordinates`: Semicolon-separated `lng,lat` pairs
- `overview=full`: Return complete path geometry
- `geometries=geojson`: Return coordinates as GeoJSON

### Response

```json
{
  "code": "Ok",
  "routes": [{
    "geometry": {
      "coordinates": [[lng, lat], [lng, lat], ...]
    },
    "distance": 5330.5,  // meters
    "duration": 594.2    // seconds
  }]
}
```

## Future Enhancements

- Cache generated paths in localStorage
- Add loading indicator during path generation
- Allow manual path editing
- Support different routing profiles (bus lanes, accessibility)
- Self-host OSRM for production reliability

## Troubleshooting

### Routes showing as straight lines

**Cause**: OSRM API failed or route hasn't been regenerated
**Solution**: Edit and re-save the route

### API rate limiting

**Cause**: Too many requests to public OSRM server
**Solution**: Add delay between requests or use own OSRM instance

### Incorrect paths

**Cause**: Stops too far apart or in wrong order
**Solution**: Check stop coordinates and order
