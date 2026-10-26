# Exxat-UI Design Tokens — Reference for Cursor

Extracted from `@exxat/ui` (v27.7.10-beta), the shared React component library for Exxat One, Network & Talent. Use this as context when prompting Cursor to generate on-brand screens. The machine-readable sources live alongside this doc:

- `exxat-tokens.css` — Tailwind v4 `@theme` + CSS variables. **Import this in your project's globals.css and reference the utility classes/vars directly.**
- `tokens.dtcg.json` — W3C standard tokens (Style Dictionary, etc.).
- `tokens-studio.json` — import into Figma via the Tokens Studio plugin.
- `accessibility-contrast-audit.md` — WCAG contrast results for the key pairs.

## How to prompt Cursor

> Paste `exxat-tokens.css` into the project and tell Cursor: *"Use ONLY the CSS variables and Tailwind classes defined in exxat-tokens.css. Primary brand color is `--color-blue-500` (#3f51b5) or `--color-purple-500` (#9333ea) depending on `data-theme`. Body text uses Inter 14px/20px (`text-sm`). Default radius is `rounded-md`; pills use `rounded-full`. Cards sit on `--bg-card` inside `--bg-container`. Respect light/dark via `data-color-scheme`."*

## Foundations

**Fonts** — UI: `Inter, sans-serif`. App base (html): `Source Sans 3`.

**Type scale (most-used first):** `text-sm` 14px is the workhorse (319 uses), `text-xs` 12px for meta (208), then `lg/base/xl`.

| Style | Size | Weight | Line | Tracking | Usage |
|---|---|---|---|---|---|
| caption | 11px | 400 | 14px | 0px | metadata, timestamps, hints |
| badge-label | 10px | 500 | 15px | 0px | pills/tags (UPPERCASE) |
| ui-elements-label | 14px | 500 | 16px | 0px | buttons, inputs, labels |
| body-default | 14px | 400 | 20px | 0px | default body copy |
| body-reading | 14px | 400 | 24px | 0px | long-form reading |
| heading-minor-title | 14px | 500 | 20px | 0px | minor titles |
| heading-group-title | 14px | 600 | 20px | -0.08px | form group headers |
| heading-subsection-title | 16px | 700 | 24px | 0px | sub-section headers |
| cta-label | 18px | 700 | 22px | 0px | card CTAs |
| heading-page-title | 20px | 700 | 28px | -0.08px | page titles |
| key-metrics-medium | 24px | 700 | 32px | -0.08px | modal titles / metrics |

## Color ramps

Ramps follow a 50–900 scale; **500 is the base brand value**, lighter below, black-mixed above (matches the library's runtime `color-shade()`).

**Neutral (grays):** `0`=#ffffff `50`=#f7f7f7 `100`=#f4f4f5 `150`=#eaeaeb `200`=#dadadc `300`=#c6c6ca `400`=#adadb2 `500`=#8c8c92 `600`=#727279 `700`=#545454 `800`=#374151 `850`=#1f2937 `900`=#111827 `950`=#0a0a0a `1000`=#000000

**Blue theme primary:** `50`=#e4e7f6 `100`=#d1d6ef `200`=#abb4e2 `300`=#8591d5 `400`=#606fc7 `500`=#3f51b5 `600`=#3848a1 `700`=#313f8c `800`=#2a3678 `900`=#232d64

**Purple theme primary:** `50`=#ffffff `100`=#f5ecfd `200`=#dcbef8 `300`=#c48ff4 `400`=#ab61ef `500`=#9333ea `600`=#822dd0 `700`=#7228b5 `800`=#61229b `900`=#511c81

**Accent (amber):** `50`=#fef6e7 `100`=#fdeccf `200`=#fbd89e `300`=#f9c56d `400`=#f7b13c `500`=#f59e0b `600`=#d98c0a `700`=#be7a09 `800`=#a26907 `900`=#875706

**Warn/critical (red):** `50`=#ffffff `100`=#ffffff `200`=#fbd1d1 `300`=#f7a2a2 `400`=#f37373 `500`=#ef4444 `600`=#d43c3c `700`=#b93535 `800`=#9e2d2d `900`=#832525

### Functional / status

- **positive:** default `#088a48`, strong `#05aa57`, subtle `#11ac78`
- **negative:** default `#b91c1c`, strong `#e50005`, subtle `#ef4444`
- **warning:** default `#924602`, strong `#e5e300`, subtle `#f59e0b`
- **informative:** default `#1d4ed8`, strong `#5983ee`, subtle `#074c6b`, surface `#dcf2fc`

## Semantic surface & text (light / dark)

Set `data-color-scheme="light|dark"` on `<body>`. Prefer these vars over raw ramp values for surfaces.

| Token | Light | Dark |
|---|---|---|
| `--bg-card` | #ffffff | #1e1e1e |
| `--bg-container` | #f7f7f7 | #121212 |
| `--bg-hover` | #f3f4f6 | rgba(255,255,255,0.10) |
| `--bg-header` | #ffffff | #121212 |
| `--bg-table` | #ffffff | #1e1e1e |
| `--bg-table-header` | #e2e4f4 | #232229 |
| `--bg-alternate-row` | #f9fafb | #2a2a2a |
| `--bg-input` | #ffffff | #1e1e1e |
| `--bg-disabled` | rgba(26,27,31,0.12) | rgba(255,255,255,0.12) |
| `--text-default` | #111827 | #ffffff |
| `--text-secondary` | #1f2937 | rgba(255,255,255,0.70) |
| `--text-hint` | #9ba0ab | rgba(255,255,255,0.50) |
| `--text-disabled` | #9ba0ab | rgba(255,255,255,0.50) |
| `--border` | #e5e7eb | rgba(0,0,0,0.12) |
| `--divider` | #e5e7eb | rgba(0,0,0,0.12) |
| `--icon` | #6b7280 | #ffffff |

## Spacing (Tailwind v4 scale, 0.25rem base)

Real component usage skews small: `gap-2`/`p-2`/`px-2` dominate, then `py-1`, `px-4`, `p-4`.

`0`=0rem, `0.5`=0.125rem, `1`=0.25rem, `1.5`=0.375rem, `2`=0.5rem, `3`=0.75rem, `4`=1rem, `5`=1.25rem, `6`=1.5rem, `8`=2rem, `10`=2.5rem, `12`=3rem, `16`=4rem

## Radius

Most used: `rounded-md` (153), `rounded-full` (121), `rounded` (115), `rounded-lg` (59).

`none`=0px, `sm`=0.125rem, `DEFAULT`=0.25rem, `md`=0.375rem, `lg`=0.5rem, `xl`=0.75rem, `2xl`=1rem, `3xl`=1.5rem, `pill`=40px, `full`=9999px

## Shadows

- `shadow-sm`: 0px 1px 2px 0px rgba(0,0,0,0.10)
- `shadow-md`: 0px 1px 3px 0px rgba(0,0,0,0.10), 0px 1px 2px -1px rgba(0,0,0,0.10)
- `shadow-lg`: 0px 4px 6px -1px rgba(0,0,0,0.10), 0px 2px 4px -2px rgba(0,0,0,0.10)

## Accessibility notes (see full audit)

- **Hint/placeholder gray (#9ba0ab / #8c8c92)** and **accent amber (#f59e0b)** fail AA for small text on white — use for large/bold text, borders, or icons only.
- Warn-red `#ef4444` and positive `#088a48` pass only at large sizes on white; use the darker `negative.default #b91c1c` / `warning.default #924602` for small text.
- Primary blue and purple both pass AA on white and white-on-primary — safe for buttons.

