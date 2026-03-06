# iConquer Reborn – System Specification

## Overview

iConquer Reborn is a turn-based strategy simulation where AI agents compete for territory while negotiating alliances and maintaining trust relationships.

The project demonstrates a prototype of a **multi-agent cognition fabric**, where agents coordinate and reason through a shared context layer.

The goal is to illustrate the concept of **distributed intelligence**, inspired by the Internet of Cognition architecture.

---

## Core Gameplay

The game world consists of:

- 6 players
- 42 countries in the default world map
- turn-based actions
- alliances and diplomacy

Agents can:

- attack territories
- propose alliances
- coordinate strategy
- betray alliances
- remember past interactions

---

## Key Concept: Cognition Fabric

Agents share a **structured context graph** containing:

- goals
- alliances
- trust relationships
- strategic plans
- historical events

This shared state allows the system to demonstrate **emergent multi-agent reasoning**.

---

## Model-Agnostic Agents

Agents are independent of their model provider.

Possible providers include:

- OpenAI
- Anthropic
- local models

Example configuration:

Athena — OpenAI  
Sparta — Anthropic  
Babylon — OpenAI  

This allows heterogeneous AI systems to participate in the same agent society.

---

## MVP Scope

Agents: 3  
Territories: 5  
Turns per game: 8–10  

Core systems:

- agent abstraction layer
- provider adapters
- diplomacy messaging
- trust scoring
- cognition graph
- simple visualization