# GitHub Analytics Dashboard

A responsive analytics dashboard that visualizes GitHub activity, 
repository metrics, and developer insights using the GitHub REST API.

🔗 **[Live Demo](https://ujjwalkushwah24-sys.github.io/GDA-Github-dashboard-analyzer/)**

---

## Features

- **Profile analytics** — visualize stars, forks, commits, language 
  distribution, and activity trends for any GitHub user
- **Profile comparison** — compare up to 3 developers side by side 
  with a weighted scoring system across 6 dimensions
- **AI-powered suggestions** — instant rule-based tips + Claude AI 
  deep analysis to improve your GitHub profile
- **Dark mode** — full light/dark theme with system preference detection
- **Shareable links** — encode profiles into URL params, share 
  with one click
- **Export to PNG** — download the dashboard as a high-resolution image
- **PWA support** — installable, works offline with service worker caching
- **Keyboard navigation** — Press `/` to focus search, `D` to toggle 
  dark mode, `Escape` to clear

---

## Tech stack

| Technology | Why |
|---|---|
| Vanilla JavaScript | No framework overhead — proves DOM and async fundamentals |
| GitHub REST API | Real data source, demonstrates API integration |
| Chart.js | Bar, line, doughnut, and radar charts |
| Claude API (Anthropic) | AI-powered profile analysis and suggestions |
| CSS Custom Properties | Token-based theming system for dark/light mode |
| localStorage | Client-side caching with TTL to respect API rate limits |
| Service Worker | Offline support and static asset caching |
| GitHub Pages | Zero-config static deployment |

---

## Architecture