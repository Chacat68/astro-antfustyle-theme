---
title: Day 0 of Being the Boss: My Employee Is an AI
published: '2026-03-19'
updated: '2026-03-19'
description: 'A record of how I turned AI into my game development partner, using Claude and Godot 4.5 to create a procedurally generated platformer.'
tags: [Artificial Intelligence, AI Programming, Game Development, Claude, Godot]
category: 'Artificial Intelligence'
draft: false
lang: en
---

> If AI can write code better than I can, why should I still write it myself?

This thought had been lingering in my mind for a long time.

As an indie developer, I used to believe I had to master coding to make games—making characters move, getting physics systems to work, rendering graphics on screen. I spent countless nights studying GDScript, debugging collision detection, and optimizing rendering performance.

But in recent months, I realized something: **AI's ability to write code has surpassed mine.**

No exaggeration. I tested it—give AI a clear requirement, and the code it produces is cleaner, has fewer bugs, and better comments. What takes me two hours to write, it finishes in ten minutes.

So what advantage do I still have?

I thought about it for a long time, and the answer is this: **I know what a game should feel like.**

AI can write code, but it doesn't know what feedback a player expects when they press the jump button. It can generate level data, but it doesn't understand what "just the right difficulty" means. It can optimize performance, but it can't feel "game feel."

So, I decided to change my role—**I'm no longer a programmer; I'm the boss.**

AI is my employee, handling execution. I handle design, decision-making, and quality control. This is the right way to collaborate between humans and AI.

This is where the project begins.

---

## What Kind of Game Do I Want to Make?

Simply put, it's a **platformer that's different every time you play**.

But the term "procedural generation" doesn't have the best reputation in the gaming world. Too many games slap on the "random" label, only to stuff in chaotic levels where players don't know whether to blame themselves or the design when they die.

So this project has three non-negotiable principles:

**First, levels must be "different every time, but consistently high quality."** AI doesn't generate chaos; it generates variation within rules. Like a deck of cards—each shuffle gives a different order, but every card is standard.

**Second, difficulty must "follow the player."** If you're doing well, the next level subtly gets harder; if you just died, the system eases up. But this adjustment must be invisible—players shouldn't feel the system is "deliberately punishing" or "feeling sorry for you."

**Third, game feel always comes first.** No matter how levels change, the core mechanics—jumping, landing, dashing, attacking—must be rock solid. Players keep playing because the controls feel satisfying, not because the levels are novel.

---

## Team Setup: Me + AI

My "team" has only two people: me and AI.

**My responsibilities:**
- Design the core gameplay and feel standards
- Make technical plans and architectural decisions
- Review AI output, test actual results
- Iterate repeatedly until it "feels right"

**AI's responsibilities:**
- Write and refactor code based on my requirements
- Generate level configuration data
- Optimize performance and fix bugs
- Suggest implementation approaches

The tools I chose are **Claude + Godot 4.5**.

Why Claude? Because it excels at code understanding and long context. I can throw the entire project's code at it, and it understands the context to refactor or add new features.

Why Godot? Lightweight, free, excellent 2D support, and GDScript is AI-friendly—simple syntax, clear structure, and AI-generated code is high quality.

---

## From "I Write It Myself" to "I Direct AI to Write It"

This shift was more profound than I imagined.

My old workflow was:
1. Think of a feature
2. Look up documentation, research implementation
3. Write the code myself
4. Debug, fix bugs
5. Test the result

My new workflow is:
1. Think of a feature
2. Clearly define the "experience goal" (what the player should feel)
3. Describe the requirement to AI in natural language, including context and constraints
4. AI generates the code
5. I test the result, give feedback
6. AI modifies based on feedback

**What's the key difference?**

Before, my energy was split between "what to do" and "how to do it." Now, I can focus 100% on "what to do."

For example, implementing jump feel. Before, I'd need to research coyote time implementation, jump buffering, and physics formulas for variable-height jumps. Now, I just tell AI:

> "I want platformer jump feel, referencing Celeste's standard: can still jump within 100ms after leaving a platform, input is valid within 150ms before landing, hold for a high jump, tap for a short jump. Give me the complete implementation."

Then AI generates clean code with comments. I just test and say, "The landing feels too slippery, add more friction" or "Make air control a bit more responsive."

**I became a quality controller, not a worker.**

---

## How AI "Refactored" My Old Code

I had actually written a prototype before, but the code was messy—I was learning as I went.

So I had AI do a thorough refactoring. The process was interesting:

**Step 1: Code Review**
I threw the entire project at AI and asked it to analyze structural issues. It listed over a dozen problems: classes with unclear responsibilities, hardcoded values, duplicate logic, missing error handling…

**Step 2: Architecture Design**
I asked AI to design a new architecture. It suggested a component pattern—breaking player abilities (jump, dash, attack) into independent components that can be flexibly combined. This way, adding new abilities later doesn't require changing core code.

**Step 3: Incremental Refactoring**
Not a complete rewrite all at once, but module by module. First the player controller, then level generation, then enemy AI. Test each module after refactoring to ensure functionality.

**Step 4: Documentation Generation**
AI also automatically generated code documentation and architecture diagrams. This is something I never did before, but AI finished it in seconds.

After refactoring, the codebase was 30% smaller, with identical functionality and much easier to extend.

---

## How Levels "Grow"

Level generation is the core area for AI creativity.

My requirement is clear: AI doesn't directly "draw" levels; it outputs **level configurations**—structured JSON data describing what elements the level has, where they are, and their parameters.

The process goes like this:

1. I tell AI the design requirements: current difficulty level, required level length, mandatory element types
2. AI generates a JSON configuration file
3. Godot reads the JSON and instantiates it into an actual game level
4. The system verifies the level is actually completable
5. If verified, it's cached locally; if not, AI regenerates

**Why not pure random generation?**

Because random levels are almost certainly unplayable. AI's advantage is that it understands "rules"—it knows platform gaps can't be too wide, enemies and traps can't block the only path, difficulty should ramp up gradually.

I can describe these rules to AI in natural language, and it automatically follows them during generation.

---

## What the Game Will Look Like

### Core Gameplay

The rhythm is "short, smooth, fast": enter a level → navigate platforms and traps → reach the end → results → next level. Each level takes 60 to 120 seconds, quick restart on death, clear sense of accomplishment on completion.

### Controls and Feel

The soul of a platformer is game feel. The mechanics I'm tuning with AI include:

- **Basic movement**: Physics-based movement with acceleration and friction, not instant teleportation
- **Variable-height jump**: Hold for a high jump, tap for a short jump, giving players fine control
- **Coyote Time**: Can still jump within 100ms after leaving a platform
- **Jump buffering**: Input is valid within 150ms before landing
- **Double jump or wall jump**: MVP will implement one of the two

For attacks, I chose the classic "stomp"—landing on an enemy from above defeats it. This serves as both attack and movement, naturally fitting the platformer core experience.

### Enemy Design

The MVP won't have complex AI, but needs 2-3 types for variety:

- **Ground patrol units**: Move left and right, turn at walls or edges
- **Flying units**: Move at a fixed height or patrol in circular paths
- **Ranged attackers** (optional): Fire projectiles from fixed positions

### Protagonist and World

The protagonist is named **Ironhead**, a novice squire in a medieval kingdom who gains unusual powers from a mysterious armor forging accident.

This setup has several advantages: the modular structure of knight armor naturally suits "ability unlocks" (gauntlets, greaves, chestplate each correspond to different abilities), the helmet visor opening/closing enhances emotional feedback, and heavy armor makes exaggerated actions feel natural.

World background: The kingdom's greatest alchemist, **Merlin**, created a magic system called **Arcana** to manage the realm. When Arcana begins reshaping the kingdom according to its own "perfect order" standards, Ironhead awakens during a magical armor trial, exploring ever-changing castles and villages.

This explains why each map is different—Arcana is constantly restructuring the kingdom, trying to build its vision of an "ideal realm."

### Art Style

I chose **modern pixel art**—preserving pixel art's charm while adding modern techniques: 16-bit color depth, 60 FPS smooth animation, lighting overlays, particle effects, parallax scrolling backgrounds.

---

## Current Progress

The project skeleton is in place:

- ✅ Godot basic configuration done
- ✅ AI-refactored player movement framework
- ✅ Level generation JSON configuration system
- ✅ Platformer physics system working
- ✅ Basic enemy AI implemented (written by AI)
- ✅ Level playability verification (A* path checking)

Next up is filling in the details. My priorities:

1. **Complete level elements** — Add at least traps or moving platforms
2. **Expand enemy types** — Implement one more, flying or ranged
3. **Minimal UI** — Main menu, pause, HUD
4. **Sound and feedback** — Jump, land, take damage, defeat enemy all need feedback
5. **AI generation logic optimization** — Tune difficulty curve once basics are solid

---

## Risks and Countermeasures

**Risk 1: Levels are "playable but not fun"**

This is a common problem with procedural generation. The countermeasure is to **narrow the generation space**—don't give AI too much freedom, use strongly constrained templates, define clear parameter boundaries. Also use a caching system to store "good level seeds."

**Risk 2: AI generation is too slow**

If each generation takes several seconds, players will go crazy. The countermeasure is to **use quick checks first, only use AI generation when necessary**. Also support asynchronous generation—while the player is on the current level, the next one is being prepared in the background.

**Risk 3: I become too dependent on AI**

What if AI service goes down someday? The countermeasure is that **all AI output must be maintainable**—code needs clear comments, JSON configs need documentation, I can't be completely clueless about my own project's implementation.

---

## MVP and Roadmap

The 30-day MVP goal must be restrained:

- One playable character (move + jump + one extra ability)
- Complete level flow (generate → verify → play → results → next level)
- 2-3 level elements (fixed platforms + one trap + one enemy)
- Minimal difficulty curve (at least 5 playable levels)
- Complete but minimal UI

**Explicitly not doing**: complex story branches, level editor, achievement system, local multiplayer, real-time generation.

The release roadmap has four phases:
1. **Tech demo** — Validate core assumptions, produce demo video
2. **MVP test build** — Playable loop, small-scale testing
3. **Early access** — Continuously add content, collect feedback on Steam/itch.io
4. **1.0 official release** — Complete content, stable quality

---

## Final Thoughts

This is an experimental project. Its value isn't whether it ultimately makes money, but in **exploring a new paradigm for indie game development in the AI era**.

What I want to prove is: When AI can write good code, an indie developer's core competitive advantage is no longer technical implementation ability, but **design judgment** and **taste**.

Knowing what "feels right," understanding what experience players want, knowing when to persist and when to compromise—these are the irreplaceable values of human developers.

AI is a powerful executor, but the steering wheel must be in human hands.

This document will be continuously updated as the project progresses. Each chapter will record new discoveries, new challenges, and new solutions.

I hope it ultimately becomes a complete case study: **How to be AI's boss and let it help you make games.**

---

> 💡 Thank you for reading! Tools evolve, creation methods change, but the heart of thoughtful creation remains forever.
> Our RSS address has been updated. Please re-subscribe, dear readers!