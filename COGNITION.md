# Addendum: Agent Networks, Cognition Fabric & Model-Agnostic Agents

## Internet of Cognition Prototype Extension

This document is a **sidecar addendum** to the main *iConquer Reborn Game Specification*.  
It describes how to extend the simulation with **multi-agent cognition, diplomacy, and visualization systems** inspired by the *Internet of Cognition* architecture.

The goal is not just to build a strategy game but to create a **living laboratory for agent societies** where:

- agents negotiate and form alliances
- shared knowledge evolves over time
- strategic reasoning becomes observable
- collective intelligence emerges through interaction
- different AI model providers can participate in the same society

This addendum focuses on **agent communication networks, cognition visualization, and provider-agnostic agent architecture**.

---

# 1. Purpose of This Addendum

The main game spec defines:

- world mechanics
- map and territories
- player/agent actions
- combat and resource systems

This addendum introduces an **overlay cognition layer** where agent reasoning, beliefs, and relationships become visible.

Key ideas:

- Agents do not merely act — they **reason and communicate**
- Their internal thinking becomes **observable**
- The simulation becomes a **model of distributed intelligence**
- The cognition layer should work across **heterogeneous model providers**
- Agent **personality** must be separate from **model implementation**

---

# 2. Architectural Overview

The system consists of four conceptual layers.

```
Game World Layer
    territories
    resources
    armies

Agent Role Layer
    personality
    strategy
    diplomacy style

Model Provider Layer
    OpenAI / Anthropic / local model adapters

Cognition Fabric Layer
    shared knowledge
    alliances
    trust
    negotiation
```

The **Cognition Fabric** stores semantic information about:

- agent goals
- alliances
- beliefs
- trust levels
- memories of past actions
- negotiated plans

The key architectural principle is:

> **The interesting layer is not the model. The interesting layer is the shared cognition between models.**

---

# 3. Model-Agnostic Agent Design

The system should support a mix of model providers in the same game.

Example lineup:

- Athena — OpenAI
- Sparta — Anthropic
- Babylon — OpenAI

Or:

- Athena — Anthropic
- Sparta — Anthropic
- Babylon — OpenAI

Or any other combination.

## Design Rule

**Model provider != personality**

That means:

- *Athena* is a game role or personality
- *OpenAI* or *Anthropic* is the implementation backend
- either provider can implement any role

This is important because it demonstrates that the cognition fabric is **provider-agnostic**.

## Why This Matters

If agents can only collaborate when they all use the same model family, that is not really an **Internet of Cognition**.  
The architecture should allow heterogeneous agents to participate in the same society and still:

- negotiate
- form alliances
- share plans
- develop trust
- betray each other
- update shared context

---

# 4. Agent Abstraction Layer

Each agent should be represented as a stable abstraction independent of the underlying model provider.

Example conceptual structure:

```json
{
  "id": "athena",
  "display_name": "Athena",
  "personality": "strategic_diplomat",
  "provider": "openai",
  "model": "gpt-family",
  "goals": [],
  "beliefs": [],
  "trust": {},
  "memory": []
}
```

Each agent has:

- **role/personality**
- **provider**
- **model**
- **memory**
- **trust map**
- **current goals**
- **strategic state**

Provider-specific code should live behind a thin adapter interface.

---

# 5. Provider Adapter Layer

The adapter layer allows the game engine to treat all model providers uniformly.

Example adapters:

- `OpenAIAdapter`
- `AnthropicAdapter`
- `LocalModelAdapter`

All adapters should expose the same logical functions, for example:

- `generate_diplomacy_message()`
- `evaluate_proposal()`
- `choose_turn_action()`
- `summarize_world_state()`
- `update_internal_reasoning()`

This makes the rest of the system independent of the specific model vendor.

---

# 6. Agent Communication Network

Agents communicate through structured messages.

Example message types:

## Diplomacy Messages
- alliance proposals
- ceasefire proposals
- territory negotiations

## Strategic Messages
- attack plans
- defense coordination
- resource sharing

## Informational Messages
- intelligence reports
- warnings
- negotiation responses

Example message:

```json
{
  "type": "alliance_proposal",
  "sender": "Athena",
  "recipient": "Sparta",
  "goal": "capture territory C",
  "terms": "split territories evenly",
  "confidence": 0.72
}
```

Messages are logged in the **Cognition Fabric memory**.

A powerful demonstration case would be an **OpenAI agent and an Anthropic agent forming an alliance** and coordinating against another player.  
That makes the interoperability story immediately visible.

---

# 7. Shared Context Graph (Cognition Fabric)

The cognition fabric represents the **collective knowledge of the agent society**.

## Node Types

Agent nodes  
Goal nodes  
Territory nodes  
Alliance nodes  
Plan nodes  
Belief nodes  
Event nodes  

## Edge Types

trusts  
proposes  
commits_to  
controls  
remembers  
supports  
betrayed  

Example relationships:

```
Athena --trusts--> Sparta
Athena --proposes--> Alliance1
Alliance1 --goal--> Capture Territory C
Sparta --remembers--> "Athena betrayed alliance on turn 4"
```

This graph is the **semantic backbone of the simulation**.

The graph must not depend on whether Athena is implemented by OpenAI or Anthropic.  
Provider is metadata, not the organizing principle of the system.

---

# 8. Trust and Memory System

Agents maintain **dynamic trust scores** toward other agents.

Trust evolves based on behavior:

| Event | Trust Change |
|------|------|
| Alliance honored | +0.15 |
| Alliance broken | -0.40 |
| Support delivered | +0.10 |
| Deception detected | -0.30 |

Agents also record **memories** of key events.

Example memory:

```
turn: 4
event: betrayal
actor: Athena
target: Sparta
impact: trust -0.40
```

Memory drives future strategic reasoning.

This can become especially interesting in a heterogeneous setup because different model providers may display different negotiation styles, caution levels, or alliance behaviors.

---

# 9. Turn-Based Agent Reasoning Loop

Each game turn proceeds as follows:

```
1. Update world state
2. Update cognition fabric
3. Agents analyze context
4. Agents send diplomatic messages
5. Alliances and plans update
6. Agents choose actions
7. Execute actions
8. Record events in cognition fabric
```

This loop allows **collective intelligence to emerge**.

In a provider-agnostic game, the same loop is used regardless of whether the participating agents are powered by OpenAI, Anthropic, or other backends.

---

# 10. Visualization System

The system includes two synchronized visualizations.

## 10.1 World Map

Displays:

- territories
- armies
- resource production
- territorial control

## 10.2 Cognition Fabric Graph

Displays:

- alliances
- trust relationships
- goals
- plans
- beliefs

Example visual graph:

```
Athena ---- alliance ---- Sparta
   |                       |
   |                       |
 goal: Capture C       distrust
   |
 Territory C
```

Edges may be color coded:

Blue = alliance  
Red = hostility  
Green = shared plan  
Gray = uncertain relationship  

Line thickness indicates strength of trust.

## 10.3 Provider Visibility

The UI should also make the provider layer visible, for example:

- Athena — model provider: OpenAI
- Sparta — model provider: Anthropic
- Babylon — model provider: OpenAI

This is important because it demonstrates cross-provider cognition in a concrete way.

---

# 11. Interactive Cognition Explorer

Users can click nodes to inspect:

## Agent View

Displays:

- personality
- model provider
- goals
- trust levels
- alliances
- memories
- active plans

## Alliance View

Displays:

- member agents
- shared objective
- stability score
- risk of betrayal

## Territory View

Displays:

- controlling agent
- contested claims
- strategic importance

This turns the prototype into a real **cognition explorer** rather than just a game board.

---

# 12. Example Gameplay Scenario

Turn 1

Athena (OpenAI) proposes alliance to Sparta (Anthropic) to defeat Babylon.

Turn 2

Sparta accepts.

Cognition graph now includes:

```
Athena ↔ Sparta (alliance)
Goal: Capture C
```

Turn 4

Athena fails to support Sparta during battle.

Cognition graph updates:

```
Sparta --remembers betrayal--> Athena
trust level drops
alliance becomes unstable
```

Turn 6

Babylon exploits the fractured alliance.

The cognition graph reflects **political dynamics**.

This example is valuable because it shows that collaboration and distrust evolve at the cognition layer, not the provider layer.

---

# 13. Minimal Prototype Scope

To keep the prototype achievable:

Agents: 3  
Territories: 5  
Turns per game: 8–10  

Core mechanics required:

- provider-agnostic agent abstraction
- diplomacy messaging
- trust scoring
- shared context graph
- visualization panel

Optional future expansions:

- deception strategies
- intelligence sharing
- agent personalities
- long-term memory across games
- more providers and local models

---

# 14. Research Value

Beyond gameplay, this prototype demonstrates:

- distributed decision making
- multi-agent negotiation
- trust dynamics
- emergent strategy
- heterogeneous model collaboration

It functions as a **sandbox for experimenting with agent societies**.

A particularly compelling outcome would be to compare how different model providers behave under the same game roles and strategic constraints.

---

# 15. Design Principles

1. **Keep provider choice orthogonal to agent personality**
2. **Make cognition state visible**
3. **Prefer structured messages over opaque chat transcripts**
4. **Persist trust and memory as first-class data**
5. **Design the cognition fabric as the shared layer across all models**
6. **Make heterogeneous alliances a core feature, not a special case**

---

# 16. Compliance With Original iConquer License

Per the original iConquer license clause:

> This software must not be used for actual world domination.

The agent society simulation is intended solely for:

- research
- experimentation
- education
- entertainment

All attempts at genuine planetary conquest remain strictly prohibited, including but not limited to cross-provider AI alliances pursuing real geopolitical control.

---

# End of Addendum
