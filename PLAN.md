# iConquer Reborn --- Product & Engineering Plan

*A modern resurrection of the classic 2002 Mac OS X strategy game with
multi‑agent AI simulation*

------------------------------------------------------------------------

# 1. Historical Context

The original **iConquer (2002)** was an early Mac OS X strategy game
inspired by Risk.\
It featured:

-   Aqua‑styled interface design
-   high‑resolution maps
-   eleven computer player personalities
-   play‑by‑play game messages
-   full‑screen play
-   saved games
-   statistics and graphs
-   network play
-   a developer kit supporting map plug‑ins

The new project should not merely clone the gameplay mechanics.\
It should **restore the spirit of the original software product** while
evolving it into a modern **AI multi‑agent simulation platform**.

------------------------------------------------------------------------

# 2. Project Vision

iConquer Reborn should serve two purposes simultaneously:

## Software Preservation

Restore and modernize a historically interesting early Mac OS X game.

## AI Systems Demonstration

Transform the game into a sandbox for:

-   multi‑agent strategy
-   explainable AI behavior
-   persistent strategic memory
-   tournament simulation
-   emergent diplomacy
-   agent coordination research

This makes the project suitable both as:

-   a playable game
-   a professional AI systems portfolio project

------------------------------------------------------------------------

# 3. Design Philosophy

Three principles should guide development.

### 1. Deterministic Core

The rules engine must be deterministic and testable.

### 2. Explainable AI

Every AI move should have an explainable rationale.

### 3. Plugin Architecture

Maps and AI personalities should remain modular and extensible.

This reflects the philosophy of the original game.

------------------------------------------------------------------------

# 4. System Architecture

The architecture will consist of six layers.

    UI Layer
    Agent Layer
    Simulation Layer
    Rules Engine
    Domain Model
    Plugin System

## Rules Engine

Pure deterministic logic implementing:

-   turn order
-   combat
-   reinforcements
-   card exchanges
-   territory ownership
-   victory conditions

## Domain Model

Core objects:

    GameState
    Player
    Territory
    Region
    MapDefinition
    Move
    CombatResult
    MemoryState
    RelationshipMatrix

## Simulation Layer

Provides:

-   replay system
-   tournament runner
-   batch simulation
-   statistical analysis

## Agent Layer

Supports:

-   legacy AI personalities
-   modern heuristic AI
-   LLM‑assisted agents

## UI Layer

Browser UI rendering:

-   responsive game board
-   player panels
-   AI rationale displays
-   analytics dashboards

## Plugin System

Allows extension through:

-   map plugins
-   AI agent plugins

------------------------------------------------------------------------

# 5. Technology Stack

Recommended stack:

### Language

TypeScript

### Frontend

Vanilla TypeScript + SVG rendering

### Build System

Vite

### Optional Backend

Node + TypeScript

Backend is only required for:

-   LLM access
-   tournament simulations
-   analytics persistence

------------------------------------------------------------------------

# 6. Game Board Rendering

Rendering approach:

**SVG overlay on raster background**

Benefits:

-   responsive scaling
-   easy territory interaction
-   plugin‑friendly map format

Maps will consist of:

    background.png
    territories.svg
    territories.json
    regions.json
    labels.json

------------------------------------------------------------------------

# 7. Map Plugin Format

Example plugin manifest:

``` json
{
  "id": "iconquer.map.large",
  "name": "iConquer Large",
  "version": "1.0",
  "territories": "territories.json",
  "regions": "regions.json",
  "svg": "territories.svg",
  "background": "board.png"
}
```

Maps may represent:

-   world scale
-   continent scale
-   country scale
-   city scale

This mirrors the variety seen in the original game.

------------------------------------------------------------------------

# 8. Legacy AI Personalities

The original game included many computer personalities.

Legacy personalities will be ported faithfully.

Examples:

-   Aggressive
-   Defensive
-   Chaotic
-   Vindictive

Vindictive players track grudges using persistent counters.

Example:

    grudge[playerID] += 1

Agents prioritize retaliation against high‑grudge opponents.

These legacy agents serve as baseline competitors.

------------------------------------------------------------------------

# 9. Modern AI Agents

New agents will demonstrate more sophisticated reasoning.

Examples:

### Opportunist

Attacks weakest borders.

### Fortress

Consolidates strong defensive regions.

### Punisher

Strong retaliation logic.

### Balance Keeper

Targets runaway leaders.

### Schemer

Prioritizes betrayal opportunities.

### Hedger

Maintains multiple fallback fronts.

These agents rely on analytical tools.

------------------------------------------------------------------------

# 10. AI Tool System

Agents should reason through tools.

Example tools:

    estimateThreat()
    rankTargets()
    predictCounterattack()
    calculateRegionValue()
    findWeakBorders()
    evaluateAlliance()

LLMs should choose among structured tools rather than generate raw
moves.

------------------------------------------------------------------------

# 11. AI Memory Model

Each player maintains memory structures.

    trustScore
    grudgeScore
    fearScore
    betrayalCount
    helpCount
    recentEvents

Relationships stored as matrix:

    relationship[playerA][playerB]

This allows emergent strategic behavior.

------------------------------------------------------------------------

# 12. Explainability System

Each AI move produces rationale output.

Example:

> Opportunist attacked Green because Green's border strength dropped
> below threat threshold.

UI should display:

-   AI strategy mode
-   reasoning summary
-   relationship changes

------------------------------------------------------------------------

# 13. Tournament Simulation

The game becomes a research sandbox.

Tournament features:

-   run thousands of matches
-   compare personality win rates
-   analyze alliance frequency
-   measure betrayal impact

Output metrics:

-   average game length
-   elimination order
-   region dominance
-   retaliation frequency

------------------------------------------------------------------------

# 14. UI/UX Direction

Visual inspiration:

**Mac OS X Aqua era design**

Features:

-   glossy controls
-   gradient panels
-   playful colors
-   crisp map overlays

Important screens:

    Main Menu
    Game Setup
    Game Board
    Replay Viewer
    Tournament Lab
    Plugin Manager

------------------------------------------------------------------------

# 15. Product Heritage Features

The original game emphasized polish.

Features to restore:

-   play‑by‑play message log
-   statistics and graphs
-   guided tour / tutorial
-   saved games
-   map plug‑ins
-   optional network play

Network play should be a **later milestone**.

------------------------------------------------------------------------

# 16. Milestone Roadmap

## Milestone 0

Legacy research and asset extraction.

## Milestone 1

Rules engine and domain model.

## Milestone 2

Playable browser game.

## Milestone 3

Legacy AI personalities.

## Milestone 4

Replay system and analytics.

## Milestone 5

Modern heuristic AI agents.

## Milestone 6

LLM‑assisted agents.

## Milestone 7

Plugin SDK and public release.

------------------------------------------------------------------------

# 17. Testing Strategy

Tests required for:

-   rule correctness
-   combat outcomes
-   legal move generation
-   AI legality
-   deterministic simulations

Tournament regression tests ensure AI stability.

------------------------------------------------------------------------

# 18. Deployment

Recommended deployment:

Frontend: Fly.io or static hosting

Backend: Node service for AI orchestration

------------------------------------------------------------------------

# 19. Portfolio Positioning

iConquer Reborn demonstrates:

-   modern TypeScript architecture
-   multi‑agent systems
-   explainable AI behavior
-   simulation environments
-   plugin architectures
-   UI design craftsmanship

This combination makes the project ideal as a **flagship portfolio
artifact**.

------------------------------------------------------------------------

# 20. Final Vision

The final product should feel like:

> A polished descendant of the original Mac OS X strategy game, reborn
> as a modern multi‑agent simulation platform with explainable AI
> personalities and extensible maps.

The rails of the original game remain --- but the city built around them
is modern.
