---
author: "Ted Tschopp"
authorAvatar: "https://secure.gravatar.com/avatar/a76b4d6291cecb3a738896a971bfb903?s=512&d=mp&r=g"
authorUrl: "https://tedt.org/"
compatibility:
  - "chatgpt"
  - "github-copilot"
  - "microsoft-copilot"
coverImage: "skill-art/simple-blog-generator.webp"
coverImageAlt: "Three-stage navy plant grows from an orange seed into a fan of blank cyan-edged paper leaves."
coverImageAspectRatio: "16:10"
coverImageGeneratedAt: "2026-09-03"
coverImageGenerator: "OpenAI image generation via Codex"
coverImageHeight: 1000
coverImagePrompt: "Use case: stylized-concept\nAsset type: AI.Tedt.org artifact gallery cover\nArtifact kind: Prompt Template File\nPrimary request: Simple blog creation represented by a small planted idea seed growing through three orderly stages into a neat fan of entirely blank paper leaves, conveying topic, audience, and tone becoming an accessible finished post.\nScene/backdrop: A quiet warm-paper work surface with a shallow slate horizon.\nSubject: One orange seed, a compact navy stem with three branches, and several broad cyan-edged blank paper leaves arranged as a clean article-like sequence without any marks.\nStyle/medium: premium editorial illustration with tactile dimensional detail\nComposition/framing: exact 16:10 landscape; one strong crop-safe plant-to-pages silhouette; no essential detail in the outer 8%; legible at approximately 290-pixel card width\nLighting/mood: friendly, direct, productive; soft daylight\nColor palette: warm paper #F8F6F0, slate #101820, navy #00446F, cyan #00A9E0, sparing orange #E86027\nConstraints: every paper surface must remain completely blank; completely original image; no input or reference images; no text, pseudo-writing, letters, numbers, logos, trademarks, watermark, product UI, vendor branding, Microsoft Fluent styling, paw imagery, paw logo, cats, or cat silhouettes"
coverImageSourceHash: "sha256:45f4b37bb1a429ea2d8423564ecff4d06b3387b387ec1ae619043661a064c93b"
coverImageSourceHashVersion: 2
coverImageWidth: 1600
createdAt: "2025-01-31"
description: "A straightforward blog post generator demonstrating basic variable functionality."
downloadPath: "bundles/simple-blog-generator.prompt.md"
entrypoint: "simple-blog-generator.prompt.md"
featured: false
keywords:
  - "content creation"
  - "content writing"
  - "copywriting"
  - "prompt engineering"
  - "prompt templates"
kind: "prompt-template"
models:
  - "github-copilot"
  - "gpt-4"
  - "gpt-4-mini"
  - "microsoft-copilot"
name: "Simple Blog Post Generator"
payloadPaths:
  - "simple-blog-generator.prompt.md"
provenance:
  appliedRepairs:
    - "normalize-model-github-to-github-copilot"
    - "repair-workflow-simple-blog-review"
  importedGuideSha256: "sha256:65aa4e778b7f0f2521f5a8145e6c1392a95a6d80a7c352cda4b3379d92213ee7"
  importedPromptSha256: "sha256:e056c580ea6ba641b897e996c5e8a1a2593c4dd97679b191240e7c78887b9dfe"
  legacyCategories:
    - "Prompts"
  legacyImage:
    exists: false
    metadata: {}
    sha256: null
    sourcePath: null
    sourceUrl: null
  legacyMetadata:
    author:
      avatar: "https://secure.gravatar.com/avatar/a76b4d6291cecb3a738896a971bfb903?s=512&d=mp&r=g"
      name: "Ted Tschopp"
      url: "https://tedt.org/"
    bullets:
      - "Basic variable functionality demonstration"
      - "Generates 500-800 word blog posts"
      - "Customizable topic, audience, and tone"
    categories:
      - "Prompts"
    date: "2025-01-31"
    description: "A straightforward blog post generator demonstrating basic variable functionality."
    keywords:
      - "content creation"
      - "content writing"
      - "copywriting"
      - "prompt engineering"
      - "prompt templates"
    layout: "prompt-details"
    models-supported:
      - "gpt-4"
      - "gpt-4-mini"
      - "microsoft-copilot"
      - "github"
    permalink: "/prompts/:slug/"
    series:
      - current: true
        description: "Create initial blog post content based on your topic and audience"
        prompt_file: "2025-01-31-simple-blog-generator.md"
        step: 1
        title: "Content Generation"
      - description: "Analyze and improve the generated content for quality and effectiveness"
        prompt_file: "2025-08-01-Critique-Content.md"
        step: 2
        title: "Content Critique"
    subtitle: "Basic example with essential variables"
    tags:
      - "Content Creation"
      - "Writing"
      - "Communications"
    title: "Simple Blog Post Generator"
    variables:
      - default: "productivity tips"
        label: "Blog Topic"
        name: "blog_topic"
        placeholder: "What do you want to write about?"
        required: true
        type: "text"
      - default: "professionals"
        label: "Target Audience"
        name: "audience"
        options:
          - "professionals"
          - "students"
          - "general readers"
        required: true
        type: "select"
      - default: "casual"
        label: "Writing Tone"
        name: "tone"
        options:
          - "formal"
          - "casual"
          - "inspirational"
        type: "radio"
  legacyPaths:
    - "/prompts/simple-blog-generator/"
  rawFrontmatterSha256: "sha256:a6ca7d88e1048d544e578260f11ab5b3dac557903dce4d0d02310c3c1c51b7a4"
  sourceCommit: "61d55789c8754fec010824ccccb893e25f19ccb3"
  sourceDescription: "A straightforward blog post generator demonstrating basic variable functionality."
  sourceFileSha256: "sha256:e2413b6545742b2c4ee2dc916b826e263d8ae281081c1bd59b88ffe6503371a3"
  sourceGuideSha256: "sha256:65aa4e778b7f0f2521f5a8145e6c1392a95a6d80a7c352cda4b3379d92213ee7"
  sourceModels:
    - "gpt-4"
    - "gpt-4-mini"
    - "microsoft-copilot"
    - "github"
  sourcePath: "_posts/prompts/2025-01-31-simple-blog-generator.md"
  sourcePromptSha256: "sha256:e056c580ea6ba641b897e996c5e8a1a2593c4dd97679b191240e7c78887b9dfe"
  sourceRepository: "https://github.com/TedTschopp/tedt.org"
  sourceSeoDescription: null
  sourceTitle: "Simple Blog Post Generator"
  sourceUrl: "https://tedt.org/prompts/simple-blog-generator/"
  unresolvedModelIdentifiers: []
  visibleInAlphaIndex: true
publicationStatus: "published"
relatedAssetIds:
  - "prompt:academic-critique-content"
seoDescription: null
series:
  - id: "simple-blog-review"
    nextAssetId: "prompt:academic-critique-content"
    previousAssetId: null
    step: 1
    title: "Simple Blog Review"
    totalSteps: 2
slug: "simple-blog-generator"
status: "active"
subtitle: "Basic example with essential variables"
summaryBullets:
  - "Basic variable functionality demonstration"
  - "Generates 500-800 word blog posts"
  - "Customizable topic, audience, and tone"
tags:
  - "Content Creation"
  - "Writing"
  - "Communications"
topics:
  - "Content Creation"
  - "Writing"
  - "Communications"
updatedAt: null
variables:
  - default: "productivity tips"
    label: "Blog Topic"
    name: "blog_topic"
    placeholder: "What do you want to write about?"
    required: true
    type: "text"
  - default: "professionals"
    label: "Target Audience"
    name: "audience"
    options:
      - "professionals"
      - "students"
      - "general readers"
    required: true
    type: "select"
  - default: "casual"
    label: "Writing Tone"
    name: "tone"
    options:
      - "formal"
      - "casual"
      - "inspirational"
    type: "radio"
worksWith:
  - "chatgpt"
  - "github-copilot"
  - "microsoft-copilot"
---
Write a blog post about {{blog_topic}} for {{audience}} using a {{tone}} tone.

The blog post should:
- Be engaging and informative
- Include an attention-grabbing headline
- Have a clear introduction, body, and conclusion
- Be approximately 500-800 words
- Include practical tips or insights
- End with a call-to-action

Please make it relevant and valuable for {{audience}}.
