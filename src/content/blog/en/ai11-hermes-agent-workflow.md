---
title: Three Months Embedding an Agent into My Workflow
published: '2026-07-12'
updated: '2026-07-12'
description: 'Three months with Hermes Agent: memory, toolchains, cron jobs, skills, capture channels, model strategy, and its place in a personal knowledge system.'
tags: [Artificial Intelligence, agent, Hermes, tools, workflow]
category: 'Life Notes'
draft: false
lang: en
---

I have used Hermes for about three months. What began as an experiment is now woven into my knowledge management, writing, and task execution. This post records the pitfalls, configuration strategies, and where it sits in my actual workflow.

## What Hermes Is

Hermes is an open-source AI agent framework from Nous Research. Unlike conversational tools such as ChatGPT, it keeps persistent memory, can operate the filesystem and external services, supports cron jobs that push results proactively, and loads reusable workflow templates through a skill system.

I run it locally on macOS and interact through a Telegram bot. From anywhere, I can send a message on my phone and have it execute work on my computer.

## Memory: Conversations Do Not Start from Zero

Hermes has two memory areas: `memory` (8,000 characters for environment, projects, and preferences) and `user_profile` (6,000 characters for identity and long-term preferences). Both are injected at the start of every conversation.

In practice, I no longer restate where my vault lives, which projects are active, or that I prefer Chinese replies. If I say “pause Project Second Foundation,” it knows that means our earlier product line, moves the active Linear issues back to Backlog, and updates the project summary with the pause date.

Persistent memory gets sharper over time, but it has a maintenance cost: the character limit forces regular cleanup. My rule is to store only facts I will still need next week—paths, toolchain settings, writing preferences—not temporary task state.

## From Chat to Execution: Tools and MCP

Tool calling is the largest difference from conversational AI. Hermes can:

- Read and write the local filesystem (create notes, edit frontmatter, update indexes in my vault)
- Run shell commands (git, builds, dependency installs)
- Connect external services through MCP (Linear, GitHub, Feishu)

MCP (Model Context Protocol) is a standard agent–tool interface. I currently connect three services:

| Service | Use |
|------|------|
| Linear | Create, query, and update issues |
| GitHub | Read PRs, inspect diffs, manage repos |
| Feishu | Document read/write and cloud files |

Approvals use `smart` mode: high-risk actions (deletes, dangerous commands) need confirmation; low-risk ones (reads, search, creating notes) proceed automatically. The setting lives in `~/.hermes/config.yaml` under `approvals.mode`.

## Cron: From Reactive Answers to Proactive Push

This is where Hermes pulls ahead of most AI tools.

Traditional AI waits for a prompt. Hermes can run cron jobs at set times and push results. I currently run four:

| Time | Job | Content |
|------|------|------|
| 08:30 daily | Morning brief | Vault changes, reminders, reading backlog |
| 22:00 daily | Evening intake | Day’s output, cold notes, draft status |
| 23:00 daily | Harvest prompt | One line: “What did you learn today?” |
| Sunday 10:00 | Publishing report | Draft backlog and publish stats |

Each cron runs in its own session so it does not pollute daily chat context. Prompts and skills are fixed at creation time and can later be adjusted with `hermes cron update`.

One design choice: cron approval mode is `deny`. Unattended confirmation would stall jobs, so scheduled work may only read, analyze, summarize, and push.

## Skills: Reusable Process Templates

A skill is a process document for the agent: when to run, which steps to follow, and which tools to use.

My writing skill is a typical example. It encodes the path from capture to publish:

1. Understand the request (topic, length, platform, tone)
2. Research (search vault and the web in parallel)
3. Draft into `00-Inbox/` rather than Projects
4. De-AI the prose (load `humanizer-zh` and scan 24 features)
5. Suggest images
6. Archive

The benefit is that I do not restate preferences every time. The cost is maintenance: when preferences change, the skill must change too, or the agent confidently follows outdated rules.

My instance loads 100+ skills across writing, development, research, and automation. Quantity matters less than quality. An outdated skill is more dangerous than no skill.

## Four Capture Channels

This is the lightest Hermes setup I use most often. Four entries drop fleeting ideas into my Obsidian vault:

- **`/闪念`**: one-line thoughts appended to `00-Inbox/闪念.md`, grouped by date
- **`/好文`**: send a URL; Hermes extracts the article, writes markdown, and stores it
- **`/记录`**: longer fragments saved as standalone notes
- **Natural chat**: when a dense judgment appears, Hermes asks whether to archive it

The design goal is minimal friction—idea to vault in under ten seconds. Formatting, naming, and filing stay with the agent; I only provide content.

## Model Strategy: High and Low Mix

My default model is DeepSeek v4 Pro: strong Chinese text quality and low token cost. Daily chat, file ops, drafts, and batch cleanup all go there. Monthly token spend is roughly ¥30–50.

For design decisions, architecture reviews, and hard judgment calls, I switch manually to a stronger model (Claude or GPT). The economics are comparative advantage: reserve expensive models for work only they can do.

Hermes supports runtime switches such as `hermes config set model.default "claude-sonnet-4"` without a restart.

## Its Place in the System: Semi-Organ

In my personal cognition-system notes (Project Gaia), Hermes is classified as a “semi-organ.”

- **Organ**: remove it and the system is no longer mine—Obsidian vault, writing system, core frameworks.
- **Semi-organ**: replaceable, but switching cost is high—Hermes, the blog, X/Twitter distribution.
- **Tool**: purely functional and easy to swap—Godot, terminal, Node.js.

That taxonomy drives resource allocation. Organs need continuous care. Semi-organs need periodic cost/benefit reviews. Tools can be replaced when they break.

Calling Hermes a semi-organ means admitting that part of my cognition already depends on it—not on one model’s IQ, but on the workflow we tuned together: skills, cron, memory, and interaction patterns that do not transfer cleanly to another framework.

## A Concrete Case: Technical Selection

For a budget-tight ecommerce outsourcing project, I asked Hermes to find open-source options near $0/month. It searched GitHub, cloned candidates, inspected `package.json` and source structure, checked hidden SaaS costs, and produced a comparison table in about five minutes—work that would have taken me half a day.

The valuable part was not “being smarter,” but spotting that one frontend was MIT while its backend was a paid SaaS. That detail lived in env config, not the README.

## Limits and Pitfalls

**Context windows are finite.** Very long batch jobs can overflow mid-run. Split work or schedule it in cron batches.

**Skills need upkeep.** When preferences or directory structures change, patch skills immediately.

**Memory fills up.** Keep long-term facts only.

**Hallucinations still happen.** After critical filesystem writes, verify with `read_file` or terminal checks.

**Smart approvals can misclassify risk.** For deletes, overwrites, and external write APIs, confirm manually.

## Closing

Hermes is not about better chat. It is about helping maintain a cognition system through persistent memory, tool execution, and proactive scheduling.

It is not plug-and-play. The first weeks are infrastructure: models, MCP, skills, cron, memory. Only later does the time savings compound.

If you manage knowledge in a notes system, keep a repeatable creative process, and need an agent that executes rather than only answers, Hermes is worth trying. If you only want a nicer ChatGPT, it may be overdesigned.
