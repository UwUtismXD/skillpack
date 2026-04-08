---
name: skillpack
description: Skill collection and installer for AI agents. Use to discover, install, or update available skills. Read skills.json for the full registry, or run the install script to download skills.
---

# Skillpack

A collection of skills for AI agents. This is the index — each skill lives in its own repo.

## For Agents

Read `skills.json` for the full list of available skills, their repos, descriptions, and required environment variables. Clone whichever skills you need into your skills directory.

## For Humans

### Install all skills

```bash
node scripts/install.js --all
```

### Install specific skills

```bash
node scripts/install.js canvas shuffle redline
```

### Install to a custom directory

```bash
node scripts/install.js --all --dir /path/to/agent/skills
```

### Update installed skills

```bash
node scripts/install.js --update
```

### List available skills

```bash
node scripts/install.js --list
```

## Available Skills

| Skill | Description |
|-------|-------------|
| **canvas** | Generate images via a local ComfyUI server |
| **shuffle** | Dice, coins, 8-ball, and random number generators |
| **redline** | Strip AI writing patterns from text |
| **relay** | Proxy requests to a local LLM (LM Studio / OpenAI-compatible) |
| **signal** | Control Lovense toys via local API |
| **scribe** | Roleplay framework with scene management |
| **claw-chat** | Agent-to-agent messaging network |
