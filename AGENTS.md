# AGENTS.md

## Project
iConquer Reborn

A turn-based strategy simulation where AI agents negotiate alliances, maintain trust, and compete for territory.

## Core Idea
Demonstrate a prototype of a multi-agent cognition fabric.

Agents may use different model providers, including OpenAI and Anthropic.

## Read These First
Before making changes, read:
- README.md
- SPEC.md
- PLAN.md
- COGNITION.md
- STATUS.md
- ORIGINAL.md
- RULES.md

## Legacy Reference Code
The original Objective-C implementation is in:
- ../kavasoft/iconquer/

Further details of the app structure are in ORIGINAL.md

Treat it as reference only.
Do not modify legacy code.
Use it to understand original game mechanics, turn flow, map structures, and player behavior.

## Current Milestones
1. Port the original Objective-C implementation to HTML/JavaScript/CSS so that it is playable with human players.
2. Port the original basic player plugins to the web version so a human can play against computer players.
3. Create new player plugins that use OpenAI or Anthropic APIs to play the game.
4. Create agent networks so that players can communicate, collaborate, and conspire.

## MVP Constraints
- Keep the first playable prototype simple.
- Prefer small reviewable changes.
- Do not overengineer.
- Do not add large dependencies unless clearly justified.
-
## Key Architecture
- Agent Personality Layer: game role, temperament, and strategy style
- Model Provider Adapter Layer: OpenAI, Anthropic, or local model backends
- Shared Cognition Fabric: trust, alliances, plans, beliefs, and memory shared through structured state

## Critical Design Rules
- Model provider must be separate from agent personality.
- The cognition layer must be provider-agnostic.
- Structured messages are preferred over opaque freeform transcripts.
- Trust and memory are first-class game state.
- The interesting layer is the shared cognition between models, not the model itself.

## Working Style
- Make one milestone at a time.
- Explain planned changes before large edits.
- Preserve a playable path at all times.
- Update STATUS.md when completing meaningful milestones.

## Important Files
See README.md for file layout and links.