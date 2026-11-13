# Design System — VibeBlog

A complete, editorial design system inspired by Reuters, The New York Times, and Medium.
Applied consistently across the entire application.

## Principles
1. **Editorial first**: typography drives the layout. Headings in a serif display face, body in a readable serif, UI in a clean sans.
2. **Restraint**: neutral palette, generous whitespace, thin dividers. Color is used sparingly (accent blue for links/CTAs).
3. **Consistency**: every component uses the same tokens. No ad-hoc colors or sizes.
4. **Accessibility**: focus rings, sufficient contrast, semantic HTML, aria labels.

## Typography
| Role | Font | Usage |
|------|------|-------|
| Display | Playfair Display | Page titles, article titles, section headings |
| Serif | Lora | Article body, quotes, long-form text |
| Sans | Inter | UI, navigation, buttons, labels, metadata |
| Mono | JetBrains Mono | Code blocks |

Scale: `display-xl` (4.5rem) → `display-lg` (3.5) → `display-md` (2.5) → `display-sm` (2rem) → body (1.1875rem for articles).

## Colors
- **Ink**: 900 (text) → 50 (surface). Neutral grays for text, borders, surfaces.
- **Accent**: `#1d4ed8` (blue) for links, CTAs, focus rings.
- **Surface**: white (light) / `#0f0f0f` (dark).

Dark mode toggled via `.dark` class on `<html>`.

## Spacing
Base 4px. Container max-width 1280px. Article max-width 720px. Prose max-width 68ch.

## Border radius
- `sm`: 4px (tags, inputs, small elements)
- `md`: 6px (buttons, cards, containers)
- `lg`: 8px (images, large containers)

## Components
- **Button**: variants primary/secondary/ghost/danger/outline/accent; sizes sm/md/lg.
- **Input/Textarea**: rounded-md, ink borders, accent focus ring.
- **ArticleCard**: image (4:3), display title, serif subtitle, metadata row, tag chips.
- **Header**: sticky, translucent, logo + search + nav.
- **Footer**: minimal, tagline.

## Motion
- Transition duration 150ms for interactions, 500ms for image hover scale.
- Easing: `cubic-bezier(0.4, 0, 0.2, 1)` (smooth).

## Dark mode
Toggled by adding `.dark` to `<html>`. All components use `dark:` variants. Persisted in localStorage. Respects `prefers-color-scheme` on first visit.

## Files
- `tailwind.config.js` — tokens
- `src/index.css` — base styles, prose, utilities
- `src/components/*` — components consuming tokens
- `index.html` — font loading