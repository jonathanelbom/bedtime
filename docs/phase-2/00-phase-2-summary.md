# Phase 2 Summary (Post Phase 1 Code Review)

## Core Goal

Improve **session-level prompt expressiveness** without introducing persistent assistant profiles.

We are **not** building a long-term assistant system.  
We are building a **session-time prompt synthesizer**.

---

## Key Decision

Use a **meta-prompt to generate a custom structured system prompt per session**.

- No stored assistant profiles  
- No long-term assistant identity  
- All customization happens **per session**

---

## Final Architecture

### Step 1 — User Input (Single UX Moment)

User provides:

- musical context (genres, tools, instruments, style)
- optional song brief (e.g. “late-night reflective, body sway”)

This is **one combined input experience**.

---

### Step 2 — Generate Structured Prompt

session input  
→ meta-prompt  
→ generated structured system prompt  

This prompt is **internal only**.

---

### Step 3 — Generate Structured Response

user request  
+ generated structured system prompt  
→ structured JSON rhythm plan  

This powers your existing paged UI.

---

### Step 4 — Continue Chat (Unchanged)

We keep your existing pattern (**Option B**):

user follow-up  
+ static chat system prompt  
+ hidden structured context  
+ conversation history  
→ conversational response  

---

## What Stays the Same

No changes to:

- `/api/chat` route  
- Chat Completions usage  
- structured JSON first response  
- parse + repair logic  
- hidden context injection  
- chat continuation model  
- streaming  

---

## What Changes

Only this:

hardcoded structured prompt  
→ replaced by  
meta-prompt → generated structured prompt  

Everything else remains intact.

---

## Chat Continuation Strategy

We explicitly choose:

### Option B (current system)

- static chat prompt  
- structured output injected as hidden context  

### Why

- avoids duplicated prompt logic  
- simpler system  
- already works well  
- chat always references the structured plan  

---

## Why Use a Meta-Prompt

The meta-prompt provides:

- better synthesis of user inputs  
- more expressive session-level prompts  
- more variation than templated prompts  

Used **once per session**, not per message.

---

## Tradeoff

Meta-prompt adds:

- 1 extra API call  
- slight latency increase  
- more internal complexity  

But improves **quality and variation of output**.

---

## Final Flow

User Input (setup + song brief)  
↓  
Meta-Prompt  
↓  
Generated Structured Prompt  
↓  
Structured JSON Rhythm Plan  
↓  
Convert to Hidden Context  
↓  
Static Chat Prompt + History  
↓  
Conversational Follow-up  

---

## Key Insight

Phase 2 is **not a rewrite**.

It is simply:

> replacing a static structured prompt with a generated one

---

## Next Step

Define the **session input object**.

This determines:

- how expressive prompts can be  
- whether meta-prompt adds real value  
- how clean the system stays  