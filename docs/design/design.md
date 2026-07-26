# Design Reference

`design.html` is the primary visual source of truth for this system. This markdown is a concise documentation copy derived from that file for easier review and implementation reference.

## Overview

The UI direction is rooted in a Masjid Nabawi-inspired palette: dome green for structure and actions, warm stone neutrals for surfaces, and aged brass for emphasis. The reference covers both light and dark theme targets and treats them as implementation goals rather than placeholder explorations.

The intended feel is calm, architectural, and study-oriented. Surfaces stay warm and readable, hierarchy is carried by green rather than heavy ornament, and accent color is reserved for focus, selection, and small moments of emphasis.

## Colors

The system uses role-based tokens instead of one-off values. Light theme colors support the default reading flow, while dark theme colors preserve the same hierarchy in low-glare contexts.

| Role | Light token | Value | Dark token | Value |
| --- | --- | --- | --- | --- |
| Canvas | `--color-bg` | `#F7F3EA` | `--theme-dark-bg` | `#0F1F1B` |
| Surface | `--color-surface` | `#FFFDFA` | `--theme-dark-surface` | `#163029` |
| Primary | `--color-primary` | `#2F6F5C` | `--theme-dark-primary` | `#72AB96` |
| Accent | `--color-accent` | `#A7863A` | `--theme-dark-accent` | `#C6AB63` |
| Text | `--color-fg` | `#18352F` | `--theme-dark-fg` | `#EDF3EB` |

Supporting tokens cover secondary surfaces, borders, muted text, success, error, shadows, and soft tints for hover and selected states. Accent should read as brass edge detail or highlight, not as the dominant fill across large surfaces.

Contrast intent in the reference is explicit: dark on light, light on dark, primary surfaces, accent emphasis, error, and success treatments should all remain legible and visually distinct.

## Typography

Typography is split by language role.

| Use | Token / family | Guidance |
| --- | --- | --- |
| UI and English text | `Inter`, `Segoe UI`, `Arial`, sans-serif | Default body and heading family |
| Arabic text | `Amiri`, serif | Use for Quranic and Arabic-script content |

The documented scale is:

| Token | Size |
| --- | --- |
| Small | `0.875rem` |
| Base | `1rem` |
| Large | `1.25rem` |
| XL | `1.5rem` |
| H2-scale | `2rem` |
| H1-scale | `2.5rem` |

Use primary green for headings and muted green for metadata rather than neutral gray. Arabic samples are shown larger, right-to-left, and on a soft raised surface so the script reads as content, not decoration.

## Components

The reference currently demonstrates the core interaction set rather than a full catalog.

| Component | Intent | Notes |
| --- | --- | --- |
| Primary button | Main action | Green fill, brass-accented hover/focus detail |
| Secondary button | Lower-emphasis action | Transparent or light surface treatment with structural border |
| Input field | Search and text entry | Warm surface, visible brass focus ring, helper text below |
| Card | Verse/reference container | Warm stone surface, green structure, brass selected state |
| Pills / tags | Metadata or status | Neutral and selected variants are both shown |
| Dark theme variants | Night reading parity | Same hierarchy carried into deep green surfaces |

New UI should be documented against this set with visual intent and key states, not just screenshots or raw markup.

## Responsive Behavior

The layout guidance is breakpoint-based and simple:

| Breakpoint | Behavior |
| --- | --- |
| `<480px` | Single-column, stacked layout |
| `480px-1200px` | Adaptive multi-column layout |
| `>1200px` | Full grid with max-width behavior |

The responsive examples emphasize reflow rather than alternate component designs. Content should stack cleanly first, then expand into columns as space allows.

## Grid System

The base grid is a 12-column system with `16px` gutters. It is meant to provide alignment and rhythm for page-level layout rather than strict visual boxing.

At narrower widths, the demo collapses the grid:

| Viewport | Grid behavior |
| --- | --- |
| Default | 12 columns |
| `<=768px` | 6 columns |
| `<=480px` | 2 columns |

Use the grid to align major sections and cards; do not force every small element onto a rigid column structure.

## Spacing

Spacing is tokenized and intended to keep the UI calm and architectural.

| Token | Value |
| --- | --- |
| `--space-xs` | `4px` |
| `--space-sm` | `8px` |
| `--space-md` | `16px` |
| `--space-lg` | `24px` |
| `--space-xl` | `40px` |

Use these tokens consistently for margin, padding, and gaps. Hero, search, and reading surfaces should receive the larger steps so the palette and layout feel deliberate rather than cramped.

## Accessibility

The reference sets WCAG AA expectations as baseline behavior.

- Text and interactive elements should meet a `4.5:1` contrast ratio.
- All controls must be keyboard reachable and operable.
- Inputs and controls should expose appropriate ARIA labels and roles.
- Focus styling should use a visible `3px` ring.
- Light theme focus uses the deeper brass token.
- Dark theme focus uses the lifted brass token.

The visual source also implies that disabled states must remain obviously inactive without relying on color alone.

## Interaction States

The reference demonstrates default, hover, focus, active, and disabled states.

| State | Intended treatment |
| --- | --- |
| Default | Green remains the structural base |
| Hover | Preserve green fill, add brass edge detail, slight lift, stronger shadow |
| Focus | Clear `3px` outline using theme-appropriate brass token |
| Active | Return to a more grounded green treatment |
| Disabled | Muted color, no lift, no action affordance |

These behaviors should apply consistently across buttons, inputs, and similar interactive controls.

## Iconography

Icons should stay simple, clear, and functional. The examples show small outlined symbols on soft surfaces with either primary green or accent color.

- Icon-only actions must carry their accessible name on the interactive element, typically via `aria-label`.
- Decorative SVGs should remain hidden from assistive technology.
- Icons should support the same surface and contrast rules as other controls.

The current examples are action-oriented rather than decorative, which matches the overall product tone.

## Motion

Motion is intentionally restrained. The sample animation is a light bounce used as loading-style feedback, but the guidance is broader than that specific example.

- Use motion for feedback, transitions, and loading cues.
- Avoid decorative or distracting animation.
- Respect `prefers-reduced-motion` by removing bounce or lift effects and preserving feedback through color, opacity, or outline changes.

Transitions in the source are short and functional, mainly on buttons and interactive affordances.

## Usage Guidelines

- Always use design tokens for color, spacing, and type.
- Follow the documented state model for all interactive components.
- Reserve brass for focus, highlights, and selected states rather than broad fills.
- Keep warm stone surfaces and green structural hierarchy intact across new patterns.
- Document new patterns or justified exceptions in this reference.

The example usage pattern is a labeled transliteration field with helper text. That reinforces the expected baseline: clear labeling, readable surfaces, accessible focus, and restrained emphasis.