# LinkedIn Insights

[![CI](https://github.com/obrenoalvim/linkedin-insights/actions/workflows/ci.yml/badge.svg)](https://github.com/obrenoalvim/linkedin-insights/actions/workflows/ci.yml) [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

**Sinal** turns LinkedIn's own "Content analytics" export (`AggregateAnalytics_*.xlsx`) into a
dashboard built for people who post — not just impressions and follower counts, but the
questions a creator actually has: which day of the week should I post on, which topics land,
which posts punch above their weight.

Everything runs in your browser. The `.xlsx` is parsed client-side with SheetJS — nothing is
uploaded anywhere, there's no backend at all.

## Features

- **Overview stats** — impressions, reach, followers, engagement rate for the exported period.
- **Best day to post** — average engagement rate by weekday, compared against how often you
  actually post on each day.
- **Momentum** — last 7 days vs. the previous 7, so you can tell if reach is trending up or down.
- **Reach efficiency** — impressions per follower, a rough signal of reach beyond your own network.
- **Topics that perform** — hashtags extracted straight from each post's URL, ranked by average
  engagement and average impressions.
- **"Double win" posts** — posts that land in both the top-engagement and top-impressions lists
  at once.
- **Longest posting gap**, top posts tables, and audience demographics (company, seniority,
  industry, location...).
- **Any export locale** — sheet names, date order (`DD/MM` vs `MM/DD`) and percentage formatting
  ("< 1%" vs "menos de 1%") are all detected automatically; tested against both English and
  Portuguese (Brazil) exports.
- Dark/light mode, no account, no tracking.

## Tech stack

- **Vite + React 19 + TypeScript**
- **Tailwind CSS v4** with a small copy-in UI kit (`src/components/ui`)
- **[xlsx (SheetJS)](https://sheetjs.com/)** — parses the export in the browser (the official
  CDN build, not the vulnerable npm package)
- **[Recharts](https://recharts.org)** for the charts
- **Zod** to validate/normalize the numbers coming out of the spreadsheet
- **Vitest** for unit tests

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173), then drop your `.xlsx` on the page (or click
"Selecionar arquivo").

Get the export from LinkedIn: your profile → **Analytics** → **Content analytics** → **Export**
(last 90 days, or up to a year on some accounts).

## Project structure

```
src/
  lib/
    linkedin-export.ts   # parses the 5 export sheets (position-based, locale-agnostic)
    dates.ts              # detects DD/MM vs MM/DD per file and normalizes to local ISO
    weekday-insights.ts, topics.ts, extra-insights.ts
    format.ts              # pt-BR number/date/percent formatting
  components/
    file-drop.tsx           # upload / drag-and-drop screen
    engagement-chart.tsx, followers-chart.tsx, weekday-chart.tsx, topics-chart.tsx
    extra-insights.tsx, top-posts.tsx, demographics.tsx
    stat-tile.tsx, insight-card.tsx, chart-card.tsx, chart-tooltip.tsx, bar-list.tsx
    ui/                       # copy-in kit inherited from front-template-react
  pages/dashboard.tsx        # owns state (file loaded or not) and page layout
```

## Scripts

| Script              | Purpose                      |
| ------------------- | ---------------------------- |
| `npm run dev`       | Start dev server             |
| `npm run build`     | Production build             |
| `npm run preview`   | Preview the production build |
| `npm run lint`      | oxlint + Prettier check      |
| `npm run format`    | Format with Prettier         |
| `npm run test:unit` | Vitest                       |

## Design notes

- **Started from `front-template-react`**, then stripped everything that template needed but a
  single-screen local tool doesn't: auth, multi-locale i18n, TanStack Query, zustand,
  react-hook-form, react-router. What was left — Tailwind v4, the copy-in UI kit, dark mode, a
  sortable/paginated `Table` — was reused as-is.
- **No dual-axis charts.** Impressions and engagements sit on very different scales (hundreds vs.
  tens), so instead of one chart with two Y axes (a dataviz anti-pattern), "Impressions per day"
  and "Engagement rate per day" are two small-multiple charts sharing the same X axis.
- **Chart palette** is a pre-validated categorical/sequential palette (checked for contrast and
  deuteranopia/protanopia safety), not picked by eye — see `--series-1..8` in `src/index.css`.
- **Locale-proof parser.** LinkedIn ships the exact same sheet layout across every export
  language, only the labels change — so `linkedin-export.ts` reads sheets by position instead of
  matching English names, detects date order (`DD/MM` vs `MM/DD`) by scanning every date in the
  file for a value over 12, and extracts percentages by regex instead of matching words like
  "less than". A bare `YYYY-MM-DD` also gets an explicit local-time suffix — otherwise it parses
  as UTC midnight and rolls back a day in negative-UTC timezones (Brazil included).
- **Topic extraction is a heuristic.** LinkedIn encodes a post's hashtags in its URL slug
  (`.../author_tag-one-tag-two-share-123`); `topics.ts` splits on that, so it only sees hashtags
  used on posts that made the Top Posts lists (max ~50 each), not your full post history.
