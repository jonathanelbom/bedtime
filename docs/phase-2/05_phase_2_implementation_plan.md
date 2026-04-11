git # Phase 2 Implementation Plan

## Purpose

This document describes how the Phase 2 prompt system should be implemented in the application. It connects the onboarding inputs, normalization layer, meta‑prompt generation, validation, and runtime assistant behavior.

The goal is to generate a **personalized system prompt per user** that preserves the Neiliyo rhythm framework while adapting to the user's musical environment.

---

# System Overview

The system operates in five stages:

1. User onboarding
2. Context normalization
3. System prompt generation
4. Prompt validation
5. Runtime assistant usage

Each stage is described below.

---

# 1. User Onboarding

The application collects user inputs that describe their musical context.

Inputs may include:

- genres
- emotional tone
- instruments
- DAW
- creative goals
- reference artists or songs
- production setup

These inputs may come from:

- multiple‑choice selections
- text fields
- hybrid input components

Raw onboarding data should **not be sent directly to the prompt generator**.

---

# 2. Context Normalization

The raw onboarding inputs must be transformed into the **Normalized User Context Schema**.

Reference: `02-user-context-schema.md`

Normalization responsibilities:

- trim strings
- remove duplicate array entries
- convert empty values to null
- normalize DAW names
- infer primary expressive instrument
- determine whether context is sufficient

Suggested function signature:

```ts
normalizeUserContext(rawInput)
```

Output should be a schema‑compliant context object.

The system should verify:

```
context.system_metadata.context_ready === true
```

If false, the UI should request additional user input.

---

# 3. System Prompt Generation

Once context is ready, the application generates the personalized system prompt.

Reference: `01-meta-prompt.md`

Generation flow:

1. Serialize normalized context to JSON
2. Insert JSON into the meta‑prompt template
3. Send meta‑prompt to the LLM
4. Receive generated system prompt

Example flow:

```ts
const context = normalizeUserContext(rawInput)

const metaPrompt = buildMetaPrompt(context)

const systemPrompt = callLLM(metaPrompt)
```

The output should be a **complete system prompt string**.

---

# 4. Prompt Validation

Before storing the prompt, the system must validate it.

Reference: `03-system-prompt-output-spec.md`

Validation checks should confirm:

- all framework sections exist
- section order is correct
- "What To Avoid" section exists
- no placeholder tokens remain
- USER_CONTEXT is not present

If validation fails, regenerate the prompt.

Example logic:

```ts
if (!validatePrompt(systemPrompt)) {
  regeneratePrompt()
}
```

---

# 5. Prompt Storage

Once validated, the prompt should be stored with metadata.

Example record:

```json
{
  "user_id": "123",
  "system_prompt": "...",
  "prompt_version": "1.0",
  "framework_version": "1.0",
  "context_schema_version": "1.0",
  "generated_at": "timestamp"
}
```

Storing prompts prevents regeneration on every conversation.

---

# 6. Runtime Assistant Usage

During conversations, the stored system prompt becomes the **system instruction**.

Example request structure:

```json
{
  "messages": [
    { "role": "system", "content": system_prompt },
    { "role": "user", "content": user_message }
  ]
}
```

The system prompt should remain constant throughout a conversation.

---

# 7. Prompt Regeneration

Prompts may need regeneration when:

- framework version changes
- guardrail rules change
- context schema changes
- user updates onboarding inputs

Regeneration should repeat the generation and validation pipeline.

---

# Suggested File Structure

```
/src
  /assistant
    metaPrompt.ts
    normalizeUserContext.ts
    validatePrompt.ts
    generateSystemPrompt.ts

/docs
  assistant-system
    01-meta-prompt.md
    02-user-context-schema.md
    03-system-prompt-output-spec.md
    04-prompt-guardrails.md
    05-phase2-implementation-plan.md
```

---

# Recommended Generation Pipeline

```
user_input
   ↓
normalizeUserContext
   ↓
meta_prompt_generation
   ↓
LLM_generate_system_prompt
   ↓
prompt_validation
   ↓
prompt_storage
   ↓
runtime_assistant
```

---

# Future Extensions

Potential future improvements:

- assistant editing interface
- prompt evolution tracking
- collaborative reference libraries
- automatic context enrichment

These features are not required for Phase 2 but the architecture should allow them.

---

# Success Criteria

Phase 2 is successful when:

- each user receives a distinct assistant identity
- prompts are stable across conversations
- assistants preserve the rhythm framework
- assistants reflect the user's musical environment
- prompts regenerate safely when framework updates occur

