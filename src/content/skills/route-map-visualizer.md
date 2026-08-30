---
name: Route Map Visualizer
description: "Visualize routes and locations on a map. Accepts pre-ordered stops with coordinates from upstream connectors (Azure Maps, Bing Maps, Dataverse, CRM) plus optional road geometry, leg distances, and durations. Produces PNG, interactive HTML (Leaflet/OSM), GeoJSON, KML, deep links, and QR codes. Fully offline Python engine — road geometry rendered directly when provided, or OSRM used browser-side as a schematic fallback."
agentDescription: "Use this skill to visualize routes and locations on a map — especially after an upstream tool call (routing connector, Azure Maps, Bing Maps connector, HERE, Mapbox, Dataverse, CRM, SharePoint, or any connector that returns coordinates) has returned ordered stops, coordinates, distances, or road geometry. Produces PNG, interactive HTML, GeoJSON, KML, deep links, and QR codes. Also use for marker maps (weather, CRM data, site lists) and for any request to \"show these on a map\", \"map these locations\", or \"visualize this route\". DO NOT use this skill to compute routing — call a routing connector first, then pass the result here for visualization."
platforms: [Copilot Studio]
tags: [maps, routing, visualization, openstreetmap, python, leaflet, geojson, kml, deep-links, qr-codes, logistics, azure-maps, bing-maps]
author: Nazish Qasim
authorUrl: "https://github.com/nazishqassim"
authorGithub: nazishqassim
version: 1.0.0
createdAt: 2026-08-10
updatedAt: 2026-08-10
coverImage: skill-art/route-map-visualizer.webp
coverImageAlt: Five colored pins follow a navy route across a layered terrain map toward three map-output artifacts.
coverImagePrompt: "Use case: stylized-concept\nAsset type: AI.Tedt.org skill gallery cover\nPrimary request: Create a premium editorial illustration that communicates transforming ordered geographic stops and route geometry into clear map outputs.\nScene/backdrop: A warm paper-toned tabletop becomes a dimensional folded landscape with rivers, roads, low relief terrain, and an abstract city edge, all free of labels.\nSubject: A single navy route ribbon travels through five distinct cyan and orange location pins in a clear sequence, then branches into three elegant output artifacts: a framed map image, a folded paper map, and a translucent globe-like geometry tile.\nStyle/medium: Premium editorial illustration with tactile dimensional detail, layered topographic paper, matte ceramic pins, translucent acrylic route layers, precise cartographic craft without resembling a software interface.\nComposition/framing: Exact 16:10 landscape; sweeping lower-left to upper-right route; central route and pins dominate; outputs arranged as a restrained cluster; generous warm negative space; crop-safe focal subject; no essential detail in the outer 8%.\nLighting/mood: Calm, capable, quietly technical; soft studio light across raised terrain, crisp legibility, confident logistical clarity.\nColor palette: Warm paper #F8F6F0, slate #101820, navy #00446F, cyan #00A9E0, sparing orange #E86027.\nConstraints: No text, letters, numbers, logos, trademarks, or watermark; no paw imagery or paw logo; no cats or cat silhouettes; no product UI or Microsoft Fluent branding. No recognizable national borders, road shields, compass letters, QR code, map labels, or vendor map styling."
coverImageAspectRatio: "16:10"
coverImageWidth: 1600
coverImageHeight: 1000
coverImageGenerator: OpenAI image generation via Codex
coverImageGeneratedAt: 2026-08-29
coverImageSourceHash: "sha256:25a62845a978f3a73fd8360f8c29c9f12e0360f7550a17775fba344e5a7d170e"
bundle: bundles/route-map-visualizer.zip
---
Visualizes pre-ordered routes and location maps via `scripts/map_generator.py`.
Fully offline Python engine — no outbound HTTP from Python. Road geometry
rendered directly when provided by a connector; OSRM used browser-side as a
fallback when it is not.

## Steps

**1. Choose kind**

| Value | Use when |
| --- | --- |
| `"map"` | Plot locations only — no path (weather, CRM records, site lists) |
| `"route"` | Ordered stops + path |
| `"auto"` | Default — infers `map` unless `stops` key or `round_trip` hint |

**2. Resolve coordinates** — per point, in order:
1. `lat`/`lon` already present — from user, connector result, Dataverse, CRM, CSV, etc. **Never overwrite.**
2. Alias match in `assets/place_lookup.json`
3. Web-search the place's lat/lon, then add to payload

Never call external geocoding APIs from the script. Never invent coordinates.

**3. Pass connector route data (when available)**

If an upstream connector (Azure Maps, Bing Maps, etc.) returned routing data,
pass it directly — the visualizer will use it for accurate distances and the
actual road polyline in PNG and HTML:

| Field | Source | Effect |
| --- | --- | --- |
| `route_geometry` | Connector road polyline | Draw actual road path in PNG + HTML |
| `legs` | Connector leg breakdown | Show per-leg distance/time table |
| `route_source` | e.g. `"azure_maps"` | Attribution badge on map and outputs |
| `total_distance_m` | Connector total distance | Accurate distance in header + exports |
| `total_duration_s` | Connector total time | Accurate time in header + exports |

Without these, the PNG uses straight lines (labeled **schematic**) and the
HTML calls OSRM browser-side for road routing.

**4. Point fields**

| Field | Notes |
| --- | --- |
| `lat`, `lon` | Required (or place_lookup match) |
| `name` | Display label |
| `value` | Metric — `"24 C"`, `"$1.2M"`, CRM field, etc. |
| `icon` | See icon list below |
| `color` | Hex (validated — invalid values fall back to default) |
| `order` | Optional sequence number (connector-assigned) |

**5. Call generate()**

```python
import sys; sys.path.insert(0, "scripts")
from map_generator import generate

# Minimal — stops in provided order, schematic PNG, OSRM HTML
result = generate({
    "kind": "route",
    "title": "Delivery run",
    "stops": [
        {"name": "Depot",  "lat": -33.86, "lon": 151.21},
        {"name": "Stop A", "lat": -33.90, "lon": 151.18},
        {"name": "Stop B", "lat": -33.88, "lon": 151.15},
    ],
    # Optional exports (all off by default):
    # "html": True   "csv": True   "geojson": True   "kml": True
    # "map_links": True   "qr_codes": True
})

# With connector road data — produces accurate PNG + no OSRM needed
result = generate({
    "kind": "route",
    "title": "Delivery run — Azure Maps",
    "stops": [...],
    "route_geometry": [              # connector road polyline
        {"lat": -33.860, "lon": 151.210},
        {"lat": -33.865, "lon": 151.208},
        ...
    ],
    "legs": [                        # per-leg breakdown
        {"from": "Depot", "to": "Stop A", "distance_m": 5200,
         "duration_s": 420, "summary": "via Parramatta Rd"},
        {"from": "Stop A", "to": "Stop B", "distance_m": 3100,
         "duration_s": 280, "summary": "via Church St"},
    ],
    "route_source": "azure_maps",
    "total_distance_m": 8300,
    "total_duration_s": 700,
    "html": True,
})
print(result["markdown"])
```

Key result keys: `chart_path` (PNG, always), `html_path`, `csv_path`,
`geojson_path`, `kml_path`, `map_links_path`, `qr_sheet_path`,
`google_maps_url`, `apple_maps_url`, `bing_maps_url`, `has_road_geometry`,
`route_source`, `generated_exports`.

**6. Reply** — paste `result["markdown"]`. It always ends with an **Optional
exports** hint. Clarify:
- **PNG** = road route when `route_geometry` provided, else straight-line schematic
- **HTML** = connector polyline embedded (no OSRM) when geometry provided, else OSRM browser-side
- **`schematic_order: true`** — opt-in offline stop ordering (NN + 2-opt, straight-line estimate); always prefer a connector for real road order

## Icons

`pin` `sunny` `partly-cloudy` `cloudy` `rain` `storm` `snow` `fog` `wind`
`hot` `cold` `office` `home` `factory` `hospital` `school` `warning` `check`
`star` `shop` `truck`

## Guardrails

- Never overwrite `lat`/`lon` from user or prior tools.
- Never call external geocoding/routing APIs from the Python script.
- Never invent coordinates — ask the user or web-search.
- Never reorder stops unless `"schematic_order": true` is explicitly set.

## Bundled files

- `scripts/map_generator.py` — engine (`generate`)
- `assets/place_lookup.json` — place aliases
- `references/cheatsheet.md` — full payload reference + CLI flags
