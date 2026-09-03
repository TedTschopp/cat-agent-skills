---
author: "Ted Tschopp"
authorAvatar: "https://secure.gravatar.com/avatar/a76b4d6291cecb3a738896a971bfb903?s=512&d=mp&r=g"
authorUrl: "https://tedt.org/"
compatibility:
  - "chatgpt"
  - "github-copilot"
  - "microsoft-copilot"
coverImage: "skill-art/universal-content-creator-demo.webp"
coverImageAlt: "Six varied paper vessels feed cyan threads into a navy loom producing a blank paper scroll with an orange clasp."
coverImageAspectRatio: "16:10"
coverImageGeneratedAt: "2026-09-03"
coverImageGenerator: "OpenAI image generation via Codex"
coverImageHeight: 1000
coverImagePrompt: "Use case: stylized-concept\nAsset type: AI.Tedt.org artifact gallery cover\nArtifact kind: Prompt Template File\nPrimary request: Universal variable-driven content creation represented by six unmistakably different handcrafted input vessels feeding a single central loom that produces one coherent blank paper tapestry, conveying text, long-form input, quantity, choices, multiple selections, and format working together.\nScene/backdrop: An uncluttered warm-paper maker's bench against a slate field.\nSubject: Six tactile vessels—a narrow tube, broad basin, stack of smooth counters, branching selector fork, cluster tray, and shaped mold—send cyan threads into one compact navy loom; a broad completely blank paper ribbon emerges, held by one orange clasp.\nStyle/medium: premium editorial illustration with tactile dimensional detail\nComposition/framing: exact 16:10 landscape; strong crop-safe many-to-one loom silhouette with the six inputs clearly differentiated; no essential detail in the outer 8%; legible at approximately 290-pixel card width\nLighting/mood: flexible, demonstrative, orderly; bright editorial studio light\nColor palette: warm paper #F8F6F0, slate #101820, navy #00446F, cyan #00A9E0, sparing orange #E86027\nConstraints: forms must remain physical and abstract, never resembling software controls or a product interface; output paper is entirely blank; completely original image; no input or reference images; no text, pseudo-writing, letters, numbers, logos, trademarks, watermark, product UI, vendor branding, Microsoft Fluent styling, paw imagery, paw logo, cats, or cat silhouettes"
coverImageSourceHash: "sha256:ccdab7d0b93ed34f6e0c3028a3e4a9648e85275de6e30a5006c440c531ef8edf"
coverImageSourceHashVersion: 2
coverImageWidth: 1600
createdAt: "2025-01-31"
description: "This prompt demonstrates all supported variable types including text, textarea, number, select, radio, and checkbox inputs for dynamic content creation."
downloadPath: "bundles/universal-content-creator-demo.prompt.md"
entrypoint: "universal-content-creator-demo.prompt.md"
featured: false
keywords:
  - "content creation"
  - "documentation"
  - "dynamic variables"
  - "prompt engineering"
  - "prompt templates"
kind: "prompt-template"
models:
  - "github-copilot"
  - "gpt-3.5-turbo"
  - "gpt-4"
  - "gpt-4-mini"
  - "gpt-4-turbo"
  - "microsoft-copilot"
name: "Universal Content Creator - Variable Types Demo"
payloadPaths:
  - "universal-content-creator-demo.prompt.md"
provenance:
  appliedRepairs:
    - "normalize-model-github-to-github-copilot"
    - "repair-workflow-universal-content-review"
  importedGuideSha256: "sha256:85a4ac2a0e11344eb25cbd643214d7c91076330b6e097b6945d61b51f7d8e5e6"
  importedPromptSha256: "sha256:ddde597399e967b4455c3be226053d6cb7895ee6f11f5fe5f5b6fbc766d2a82a"
  legacyCategories:
    - "Prompts"
  legacyImage:
    exists: true
    metadata:
      image: "/img/prompts/prompt-variable-demo.png"
      image-alt: "A futuristic interface showing dynamic form elements and variables being processed"
      image-credits: "Ted Tschopp"
      image-credits-artist-URL: "https://tedt.org/"
      image-credits-title: "Dynamic Prompt Variables Interface"
      image_height: 816
      image_width: 1456
    sha256: "sha256:cc175bf8ffe0a6281ab798ffaf9552dae5957c3a4adba3f12437b5d0485cedb0"
    sourcePath: "/img/prompts/prompt-variable-demo.png"
    sourceUrl: "https://tedt.org/img/prompts/prompt-variable-demo.png"
  legacyMetadata:
    author:
      avatar: "https://secure.gravatar.com/avatar/a76b4d6291cecb3a738896a971bfb903?s=512&d=mp&r=g"
      name: "Ted Tschopp"
      url: "https://tedt.org/"
    bullets:
      - "Demonstrates all variable input types (text, textarea, number, select, radio, checkbox)"
      - "Dynamic content creation with customizable format and style"
      - "Comprehensive example for variable-driven prompts"
    categories:
      - "Prompts"
    date: "2025-01-31"
    description: "This prompt demonstrates all supported variable types including text, textarea, number, select, radio, and checkbox inputs for dynamic content creation."
    image: "/img/prompts/prompt-variable-demo.png"
    image-alt: "A futuristic interface showing dynamic form elements and variables being processed"
    image-credits: "Ted Tschopp"
    image-credits-artist-URL: "https://tedt.org/"
    image-credits-title: "Dynamic Prompt Variables Interface"
    image_height: 816
    image_width: 1456
    keywords:
      - "content creation"
      - "documentation"
      - "dynamic variables"
      - "prompt engineering"
      - "prompt templates"
    layout: "prompt-details"
    models-supported:
      - "gpt-4"
      - "gpt-4-turbo"
      - "gpt-3.5-turbo"
      - "gpt-4-mini"
      - "microsoft-copilot"
      - "github"
    permalink: "/prompts/:slug/"
    series:
      - current: true
        description: "Comprehensive content creation with all customization options"
        prompt_file: "2025-01-31-universal-content-creator-demo.md"
        step: 1
        title: "Content Planning"
      - description: "Analyze and improve the generated content for quality and effectiveness"
        prompt_file: "2025-08-01-Critique-Content.md"
        step: 2
        title: "Content Critique"
    subtitle: "A comprehensive demonstration of all variable input types"
    tags:
      - "Content Creation"
      - "Artificial Intelligence"
      - "Writing"
    title: "Universal Content Creator - Variable Types Demo"
    variables:
      - default: "artificial intelligence"
        help: "The primary subject matter for your content"
        label: "Content Topic"
        name: "topic"
        placeholder: "Enter the main topic for your content"
        required: true
        type: "text"
      - default: "A comprehensive overview covering key concepts, practical applications, and future implications"
        help: "Optional: Add more specific details about your content requirements"
        label: "Detailed Description"
        name: "content_description"
        placeholder: "Provide a detailed description of what you want to cover..."
        required: false
        rows: 4
        type: "textarea"
      - default: "general public"
        help: "Who is the intended audience for this content?"
        label: "Target Audience"
        name: "target_audience"
        options:
          - "general public"
          - "students"
          - "professionals"
          - "experts"
          - "beginners"
          - "intermediate learners"
          - "advanced practitioners"
        required: true
        type: "select"
      - default: 800
        help: "Approximate word count for the final content"
        label: "Content Length (words)"
        max: 5000
        min: 100
        name: "content_length"
        required: true
        step: 50
        type: "number"
      - default: "conversational"
        help: "Choose the tone and approach for your content"
        label: "Writing Style"
        name: "writing_style"
        options:
          - "formal"
          - "conversational"
          - "academic"
          - "journalistic"
          - "creative"
        required: true
        type: "radio"
      - default:
          - "examples"
          - "actionable tips"
        help: "Select which elements to include in your content"
        label: "Include These Features"
        name: "content_features"
        options:
          - "examples"
          - "statistics"
          - "expert quotes"
          - "case studies"
          - "actionable tips"
          - "future predictions"
          - "historical context"
          - "visual descriptions"
        required: false
        type: "checkbox"
      - default: "blog post"
        help: "What type of content format do you need?"
        label: "Content Format"
        name: "format_type"
        options:
          - "blog post"
          - "article"
          - "report"
          - "guide"
          - "tutorial"
          - "review"
          - "analysis"
        required: true
        type: "select"
      - default: "medium"
        help: "How quickly do you need this content?"
        label: "Priority Level"
        name: "urgency_level"
        options:
          - "low"
          - "medium"
          - "high"
          - "urgent"
        required: false
        type: "radio"
  legacyPaths:
    - "/prompts/universal-content-creator-demo/"
  rawFrontmatterSha256: "sha256:a7a4c9d542a2c76fdd8eac6373cb0519d6bfceb4350f5a910b259d9f7b1e72f4"
  sourceCommit: "61d55789c8754fec010824ccccb893e25f19ccb3"
  sourceDescription: "This prompt demonstrates all supported variable types including text, textarea, number, select, radio, and checkbox inputs for dynamic content creation."
  sourceFileSha256: "sha256:74dde0e2d38f7f3c7ffad756d383df11b8451fbf7b47870fb4d658ed7169db21"
  sourceGuideSha256: "sha256:85a4ac2a0e11344eb25cbd643214d7c91076330b6e097b6945d61b51f7d8e5e6"
  sourceModels:
    - "gpt-4"
    - "gpt-4-turbo"
    - "gpt-3.5-turbo"
    - "gpt-4-mini"
    - "microsoft-copilot"
    - "github"
  sourcePath: "_posts/prompts/2025-01-31-universal-content-creator-demo.md"
  sourcePromptSha256: "sha256:ddde597399e967b4455c3be226053d6cb7895ee6f11f5fe5f5b6fbc766d2a82a"
  sourceRepository: "https://github.com/TedTschopp/tedt.org"
  sourceSeoDescription: null
  sourceTitle: "Universal Content Creator - Variable Types Demo"
  sourceUrl: "https://tedt.org/prompts/universal-content-creator-demo/"
  unresolvedModelIdentifiers: []
  visibleInAlphaIndex: true
publicationStatus: "published"
relatedAssetIds:
  - "prompt:academic-critique-content"
seoDescription: null
series:
  - id: "universal-content-review"
    nextAssetId: "prompt:academic-critique-content"
    previousAssetId: null
    step: 1
    title: "Universal Content Review"
    totalSteps: 2
slug: "universal-content-creator-demo"
status: "active"
subtitle: "A comprehensive demonstration of all variable input types"
summaryBullets:
  - "Demonstrates all variable input types (text, textarea, number, select, radio, checkbox)"
  - "Dynamic content creation with customizable format and style"
  - "Comprehensive example for variable-driven prompts"
tags:
  - "Content Creation"
  - "Artificial Intelligence"
  - "Writing"
topics:
  - "Content Creation"
  - "Artificial Intelligence"
  - "Writing"
updatedAt: null
variables:
  - default: "artificial intelligence"
    help: "The primary subject matter for your content"
    label: "Content Topic"
    name: "topic"
    placeholder: "Enter the main topic for your content"
    required: true
    type: "text"
  - default: "A comprehensive overview covering key concepts, practical applications, and future implications"
    help: "Optional: Add more specific details about your content requirements"
    label: "Detailed Description"
    name: "content_description"
    placeholder: "Provide a detailed description of what you want to cover..."
    required: false
    rows: 4
    type: "textarea"
  - default: "general public"
    help: "Who is the intended audience for this content?"
    label: "Target Audience"
    name: "target_audience"
    options:
      - "general public"
      - "students"
      - "professionals"
      - "experts"
      - "beginners"
      - "intermediate learners"
      - "advanced practitioners"
    required: true
    type: "select"
  - default: 800
    help: "Approximate word count for the final content"
    label: "Content Length (words)"
    max: 5000
    min: 100
    name: "content_length"
    required: true
    step: 50
    type: "number"
  - default: "conversational"
    help: "Choose the tone and approach for your content"
    label: "Writing Style"
    name: "writing_style"
    options:
      - "formal"
      - "conversational"
      - "academic"
      - "journalistic"
      - "creative"
    required: true
    type: "radio"
  - default:
      - "examples"
      - "actionable tips"
    help: "Select which elements to include in your content"
    label: "Include These Features"
    name: "content_features"
    options:
      - "examples"
      - "statistics"
      - "expert quotes"
      - "case studies"
      - "actionable tips"
      - "future predictions"
      - "historical context"
      - "visual descriptions"
    required: false
    type: "checkbox"
  - default: "blog post"
    help: "What type of content format do you need?"
    label: "Content Format"
    name: "format_type"
    options:
      - "blog post"
      - "article"
      - "report"
      - "guide"
      - "tutorial"
      - "review"
      - "analysis"
    required: true
    type: "select"
  - default: "medium"
    help: "How quickly do you need this content?"
    label: "Priority Level"
    name: "urgency_level"
    options:
      - "low"
      - "medium"
      - "high"
      - "urgent"
    required: false
    type: "radio"
worksWith:
  - "chatgpt"
  - "github-copilot"
  - "microsoft-copilot"
---
Create a comprehensive {{format_type}} about {{topic}} for {{target_audience}}.

**Content Requirements:**
- Topic: {{topic}}
- Target Audience: {{target_audience}}
- Content Length: Approximately {{content_length}} words
- Writing Style: {{writing_style}}
- Format: {{format_type}}
- Priority: {{urgency_level}} priority

**Detailed Description:**
{{content_description}}

**Include These Features:**
{{content_features}}

**Instructions:**
1. Research the topic thoroughly and ensure accuracy
2. Structure the content logically with clear headings and subheadings
3. Write in a {{writing_style}} style appropriate for {{target_audience}}
4. Include relevant examples and practical applications
5. Ensure the content is engaging and informative
6. Add a compelling introduction and strong conclusion
7. Include actionable takeaways where appropriate

**Additional Guidelines:**
- Use clear, concise language
- Include transition sentences between sections
- Optimize for readability and engagement
- Fact-check all claims and statistics
- Consider SEO best practices if this is for web publication

Please provide a well-structured, informative {{format_type}} that meets these specifications.
