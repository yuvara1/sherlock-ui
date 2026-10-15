# Sherlock frontend direction

The existing Sherlock tokens and component APIs are the source of truth for
frontend composition and visual decisions.

## Direction: a precise operations console

Sherlock is an SRE investigation workspace. Give the evidence priority: request
durations, service names, incident states, and release context. Keep chrome quiet
and make actions predictable. Do not add decoration to fill available space.

### Palette

Reuse the existing theme mappings:

| Role | Light | Dark |
| --- | --- | --- |
| Canvas | `#fafafa` | `#000000` |
| Panel | `#f2f2f2` | `#0a0a0a` |
| Primary text | `#000000` | `#ededed` |
| Interactive accent | `#0070f3` | `#3291ff` |

Use the semantic success, warning, and danger tokens for states, not decoration.
Tables retain the Incidents-style surface and borders.
Light-theme critical and warning colors use deeper tones so small status and
duration labels remain readable on pale panels; dark-theme colors stay brighter.

### Type

Keep the documented Geist wiring. Geist carries page titles, descriptions,
navigation, and actions. Geist Mono is reserved for identifiers, code, timestamps,
and measured values. Use sentence case for navigation groups. Log levels and
technical status codes retain their domain-specific casing.

### Layout

```text
Navigation | Project and utilities
           | Related pages                  Saved pages / density
           | Page title and description     Page actions
           | Evidence: tables, traces, charts
           | Investigation tools
```

Preserve native heading semantics and page-owned actions inside a shared heading
layout. Mobile navigation gets a full-width shortcut row rather than squeezing
links between utility buttons. Table density is a browser-local preference, not
a backend setting.

Compact row heights are targets, not clipping constraints: native tables may
expand a row to keep wrapped service names and status content readable.

### Review against the brief

Rejected extra title-icon boxes, decorative eyebrow labels, and a new font pair:
the sidebar already supplies orientation, and the user's Geist setup is deliberate.
The visible refinement comes from typography, alignment, responsive utilities,
and optional table density. Preserve the restored landing structure, demo
telemetry, authentication behavior, and existing investigation features.

No unsupported production guarantees or new backend-dependent features are added.
