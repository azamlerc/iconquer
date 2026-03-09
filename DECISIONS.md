# DECISIONS

## 2026-03-06

### Milestone Scope
- Milestone 0 (optional checkpoint): playable with six human players.
- Milestone 1 target: one human + five computer players, playable until victory.
- Milestone 1 parity requirement: core gameplay loop only.
- Out of scope for Milestone 1: save/load UX, network play, fullscreen support, stats/graphs UI.

### Source of Truth
- Port behavior is based on Objective-C iConquer source code.
- Legacy repo canonical path: `/Users/andrewzc/Projects/kavasoft/iconquer`.

### Core Rules and Defaults
- Preserve iConquer behavior where countries can have zero armies.
- Turn phases remain Risk-style: reinforce, attack, fortify.
- Use default gameplay settings from `English.lproj/Defaults.plist` for now.
- `attacksPerClick` default value is `2` and is treated as "until win or lose".
- Settings customization UI is deferred to backlog.

### Cards
- Cards are required in Milestone 1.
- Card panel/button can exist but does not need to be required for normal play.
- If a player has five or more cards, turn-in is mandatory.
- Human flow: show card turn-in modal with a reasonable preselected set and allow confirm with OK.
- Elimination flow: conquering player takes eliminated player's cards; forced turn-in still applies.

### UI Rendering
- Board should be responsive and stretch to available browser width.
- Country ownership rendering should match original approach:
  - transparent country mask image per country
  - semi-transparent player color overlay
  - selected country has stronger overlay + drop shadow
- Army count indicator can be a simple circle in Milestone 1 (no Aqua polish required yet).

### Architecture
- Modular design is required.
- Map and player systems should be plugin-oriented.
- Milestone 1 player logic can run in-process in the web app (no sandboxing required yet).

### Initial AI Player Set (MVP)
- Port these three legacy player types first:
  - Aggressive
  - Defensive
  - Unpredictable

### AI/Agent Future Direction
- Future LLM agents should be provider-agnostic across OpenAI/Anthropic.
- API keys/providers should be handled via a Node.js backend service (planned deploy target: Render).
- Agent network/alliance/conspiracy mechanics are later milestones after functional parity.
