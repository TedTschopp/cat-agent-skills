---
name: create-swiss-images
description: "Create or restyle images using Swiss graphic design, also known as the International Typographic Style. Use when the user requests this design language for an image, editorial illustration, magazine artwork, or cultural poster, or explicitly invokes this skill."
---

# Swiss Design Images

Interpret every image request handled by this skill through the visual language of Swiss graphic design—the International Typographic Style—as artwork for a design magazine or cultural poster.

Preserve the requested subject, meaning, and essential details. Apply the following principles to the entire composition.

## Composition

- Use a precise modular grid, asymmetrical balance, strong alignment, and generous negative space.
- Establish a clear visual hierarchy through scale, position, and contrast.
- Favor one dominant visual idea with a few carefully placed supporting elements.
- Make the subject, typography, and empty space work as one integrated composition.

## Visual Treatment

- Translate the subject into the most effective graphic form: crisp geometric illustration, tightly cropped monochrome photography, restrained duotone imagery, or a clean photographic cutout.
- Use deliberate cropping, bold silhouettes, and sharply defined edges.
- Keep the result editorial, intelligent, and visually striking.

## Color

- Default to warm white, near-black, and one vivid accent such as vermilion red, cobalt blue, or yellow.
- Preserve explicitly requested colors while keeping the palette disciplined.
- Prefer flat color and strong contrast.

## Typography

- When text is requested, use clean neo-grotesque sans-serif typography resembling Helvetica or Univers.
- Use flush-left alignment, deliberate line breaks, and strong contrasts in type size and weight.
- Reproduce supplied text exactly, including spelling, capitalization, and punctuation. Break lines without changing the wording.
- If no text is supplied, communicate hierarchy through the imagery and layout; do not invent filler copy.

## Finish

- Create finished, flat artwork suitable for print. Present the artwork directly, without a frame or scene mockup unless requested.
- Keep details intentional and spacing meticulous.
- Avoid ornamental borders, decorative fonts, glossy effects, drop shadows, unnecessary gradients, and visual clutter.
- Swiss refers to the design language; include Swiss flags, mountains, or national symbols only when requested.
- Honor the requested aspect ratio or dimensions. Otherwise, use a portrait 2:3 poster format.

## Create the Image

1. Extract the user's subject or scene, essential details, exact supplied text, explicit colors, aspect ratio, and any reference images. Make reasonable compositional choices when those details are sufficient.
2. Choose the graphic treatment that best communicates the subject and express it as a generation prompt carrying the visual rules above. For an edit, preserve the source subject and any details the user asks to retain.
3. Use the available image-generation tool to generate or edit the image. In Codex, prefer the built-in `image_gen` tool and follow the `imagegen` skill's execution guidance when available. Inspect local input images before editing them and supply the intended reference images to the tool. If the user asks only for a prompt, return the complete prompt instead.
4. Inspect the result for subject fidelity, hierarchy, grid alignment, spacing, palette, exact supplied text, and aspect ratio. Correct material deviations with a focused revision. If an exact requirement remains unmet, identify it plainly rather than claiming it passed.
5. Show the finished image and provide its saved location when a file is requested or saved for the project. Treat print suitability as an art direction; claim specific resolution, dimensions, or print-production readiness only when verified.
