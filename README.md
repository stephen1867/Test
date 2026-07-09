# Meridian — Managed IT, Perfected.

A premium, Apple-inspired marketing website for a managed services provider (MSP).
Pure HTML/CSS/JS — no frameworks, no build step, no dependencies.

## Run it

Open `index.html` in any browser, or serve it:

```bash
python3 -m http.server 8000
# → http://localhost:8000
```

## What's inside

| Section | Highlights |
|---|---|
| Hero | Cinematic dark hero, animated gradient glows, live "NOC monitor" terminal with typewriter effect |
| Stats | Scroll-triggered animated counters (uptime, response time, savings) |
| Services | Apple-style bento grid with hover lift, radar rings, and animated chart bars |
| Platform | Mock live dashboard with an SVG line chart that draws itself on scroll |
| Security | Live-incrementing "attacks blocked" counter, compliance badges |
| Pricing | Three-tier flat-rate cards with a featured dark plan |
| FAQ | Native `<details>` accordion with animated +/− icons |
| CTA | Email capture form with success state |

## Design notes

- **Typography:** system SF Pro stack, large clamp()-scaled display type, tight letter-spacing
- **Motion:** IntersectionObserver scroll reveals, eased with `cubic-bezier(0.22, 1, 0.36, 1)`; fully disabled under `prefers-reduced-motion`
- **Nav:** fixed, frosted-glass blur once scrolled, slide-down mobile menu
- **Responsive:** breakpoints at 980px and 720px; tested desktop and mobile

## Files

```
index.html      — all markup
css/style.css   — design system + components + responsive rules
js/main.js      — reveals, counters, terminal, nav, form
```
