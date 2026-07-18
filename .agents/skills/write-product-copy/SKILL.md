---
name: write-product-copy
description: Audit, write, or revise user-facing copy for the Portfolio-resume website and agent chat. Use whenever adding or changing visible interface text, including headings, empty states, prompts, buttons, labels, placeholders, helper text, notices, errors, owner controls, navigation, and onboarding. Separate internal product discussion and implementation rationale from what the current user needs to see.
---

# Write Product Copy

Start from no copy. Add only text that helps the current user act, recover, or understand a consequential state.

## Apply the visibility test

For every proposed visible string:

1. Identify the user, their current state, and their immediate action.
2. Classify the string as one of:
   - **Action**: names an input or control whose purpose is not already obvious.
   - **Recovery**: explains an error and the next useful step.
   - **Consequence**: communicates privacy, cost, deletion, or another material outcome at the moment it matters.
   - **Required**: accessibility, legal, or trust text that must be present.
   - **Internal**: product goals, architecture, roadmap, rationale, future capability, or discussion with Steven.
3. Delete **Internal** strings from the interface. Move them to code comments, prompts, tests, or documentation when they remain useful.
4. Delete any other string when the layout, control, icon, or surrounding interaction already communicates it.
5. Rewrite surviving copy with the fewest plain words that preserve meaning.

Do not turn internal requirements into marketing copy. A detail can be important to Steven and still be irrelevant to a visitor.

## Default rules for this repository

- Prefer an empty interface over an explanatory empty state.
- Do not add hero copy, subtitles, prompt chips, welcome text, capability descriptions, disclaimers, or footer copy to chat by default.
- Keep chat centered on the transcript and composer. Use a short placeholder such as `Message` only when needed.
- Reveal owner-only controls through capability, not explanation. Use accessible names for icon buttons and disclose privacy at the moment a memory is saved.
- Show operational metadata as quiet data, for example `$0.0008` or `$0.42 / $5`, with a precise accessible label rather than a visible paragraph.
- Keep errors brief and actionable. Do not expose provider, infrastructure, or policy implementation details.
- Keep SEO metadata descriptive; it does not justify duplicating that description in the rendered page.
- Do not use copy to compensate for unclear interaction design. Improve the affordance first.

## Audit existing UI

1. Search the changed components for rendered string literals, placeholders, titles, `aria-*` text, and metadata.
2. Make a private list of what each string is trying to communicate.
3. Remove strings that fail the visibility test.
4. Preserve accessible names even when visible labels disappear.
5. Render the affected state at desktop and phone widths. Check that removing copy improves focus without making controls ambiguous.
6. Report the copy removed or retained in implementation notes, not inside the product.

## Examples

### Chat empty state

Remove:

```text
Talk with my agent
Ask about my ideas, work, interests, or anything else.
What has been on your mind lately?
```

Keep the empty transcript and composer. If the input needs a hint, use:

```text
Message
```

### Owner capability

Do not show:

```text
Private · teach me anything
Tell me to remember a thought, opinion, preference, or moment.
```

Show the attachment control only to the owner with an accessible name. Confirm scope after a save because that is when the consequence matters.

### Spend

Prefer:

```text
$0.0012
$0.38 / $5
```

Use `aria-label="This response cost $0.0012"` and `aria-label="Monthly agent spend: $0.38 of $5"`. Do not add an explanatory card.
