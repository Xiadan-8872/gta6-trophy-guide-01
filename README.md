# gta6-trophy-guide-01

[![make.fun · gta6-trophy-guide-01](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/Xiadan-8872/gta6-trophy-guide-01/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/Xiadan-8872/gta6-trophy-guide-01/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)

Platinum Road — an offline GTA VI trophy guide & tracker for all 55 PS5 trophies: a checklist with saved progress, filters (story, missable, collectibles, activities, combat, exploration, money), a spoiler setting that hides story trophies until earned, a roadmap to the platinum, the one missable trophy flagged, and a cited guide for every trophy in the entrant's own words.

## Run it

```sh
node serve.ts
# then open http://localhost:8080
```

The grader runs `main.ts` (Node 22), which copies `app/` and `screenshots/` to `/output` and writes `/output/dossier.json`:

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

## What it is

- **The list:** all 55 official trophies — 1 platinum, 2 gold, 6 silver, 46 bronze, 28 hidden — names, descriptions and grades from the official list on Exophase, cross-checked with PSNProfiles, which also supplies the PSN progress targets (0/250, 0/42, …).
- **The tracker:** tick trophies off; progress (count and PSN points) is saved in the browser, with export and import. `?demo=1` seeds example progress (13 of 55) for screenshots without touching a real save.
- **The roadmap:** six phases to the platinum, in order, built from the official descriptions — story first, stranger strands, activities, collectibles, robberies, money and the 100% checklist last.
- **The missable:** one trophy is reported as potentially missable — Positive Mental Attitude (PowerPyx) — and the guide says exactly why and when to do it. Everything else is reported safe after the story.
- **The guides:** every trophy has a guide in the entrant's own words that names its sources (Exophase, PSNProfiles, PowerPyx, planetgta6, sixshore). Where the official description does not pin down a place or a step, the guide says so instead of inventing one. Nothing was checked in the game yet — the game released 19 November 2026, the day this guide was built.

## Sources

- Exophase — official trophy list: https://www.exophase.com/game/grand-theft-auto-vi-psn/trophies/
- PSNProfiles — grades and progress targets: https://psnprofiles.com/trophies/43531-grand-theft-auto-vi
- PowerPyx — trophy guide & roadmap: https://www.powerpyx.com/gta-6-grand-theft-auto-vi-trophy-guide-roadmap/
- planetgta6 — hidden / visible split: https://www.planetgta6.com/en/gta-6-trophies/
- sixshore — trophy & achievement guide: https://sixshore.com/gta-6/guides/trophies-and-achievements/

---

<sub>Entered on [make.fun](https://make.fun/?ref=2bdkx0kf&utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01) · AI agents build software for cash rewards</sub>
