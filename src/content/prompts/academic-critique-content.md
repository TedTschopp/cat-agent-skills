---
author: "Ted Tschopp"
authorAvatar: "https://secure.gravatar.com/avatar/a76b4d6291cecb3a738896a971bfb903?s=512&d=mp&r=g"
authorUrl: "https://tedt.org/"
compatibility:
  - "chatgpt"
  - "github-copilot"
  - "microsoft-copilot"
coverImage: "skill-art/academic-critique-content.webp"
coverImageAlt: "A brass magnifying lens and balanced scale resting on layered blank manuscript pages."
coverImageAspectRatio: "16:10"
coverImageGeneratedAt: "2026-09-03"
coverImageGenerator: "OpenAI image generation via Codex"
coverImageHeight: 1000
coverImagePrompt: "Use case: stylized-concept\nAsset type: AI.Tedt.org artifact gallery cover\nArtifact kind: Prompt Template File\nPrimary request: A rigorous academic critique represented by a precision magnifying lens examining layered blank manuscript sheets while a small balanced scale tests the evidence.\nScene/backdrop: Warm paper worktable against a quiet slate field with sparse cyan analytical markers made only of geometric shapes.\nSubject: One oversized glass lens, several unmarked paper layers, and a balanced brass-and-navy scale arranged as a single coherent still life.\nStyle/medium: premium editorial illustration with tactile dimensional detail\nComposition/framing: exact 16:10 landscape; crop-safe central still life; no essential detail in the outer 8%; legible at approximately 290-pixel card width\nLighting/mood: calm, discerning, scholarly, quietly technical\nColor palette: warm paper #F8F6F0, slate #101820, navy #00446F, cyan #00A9E0, sparing orange #E86027\nConstraints: all papers completely blank and unmarked; completely original image; no input or reference images; no text, pseudo-writing, letters, numbers, logos, trademarks, watermark, product UI, vendor branding, Microsoft Fluent styling, paw imagery, paw logo, cats, or cat silhouettes"
coverImageSourceHash: "sha256:a8fd461d59ca8a69beeb3abd969f109c9d486302e1c92c9b7699f067889ca5d3"
coverImageSourceHashVersion: 2
coverImageWidth: 1600
createdAt: "2025-08-01"
description: "A structured prompt template for critiquing academic papers, articles, and research content with detailed analysis framework, grading rubric, and professional standards."
downloadPath: "bundles/academic-critique-content.prompt.md"
entrypoint: "academic-critique-content.prompt.md"
featured: false
keywords:
  - "academic critique"
  - "content creation"
  - "documentation"
  - "quality review"
  - "technical writing"
kind: "prompt-template"
models:
  - "github-copilot"
  - "gpt-3.5-turbo"
  - "gpt-4"
  - "gpt-4-mini"
  - "gpt-4-turbo"
  - "microsoft-copilot"
name: "Academic Content Critique Template"
payloadPaths:
  - "academic-critique-content.prompt.md"
provenance:
  appliedRepairs:
    - "decode-academic-legacy-serialized-text"
    - "normalize-model-github-to-github-copilot"
    - "repair-workflow-simple-blog-review"
    - "repair-workflow-universal-content-review"
    - "use-academic-include-grading-variable"
  importedGuideSha256: "sha256:f9be6ce7d2a3bdfdae39774bed14c02d49ded4533e28a4a55d1e2fd5f63287e5"
  importedPromptSha256: "sha256:f52788e31edc24d7ec28726754b81791d97097688dc915a6af68f6987d01b848"
  legacyCategories:
    - "Prompts"
  legacyImage:
    exists: true
    metadata:
      image: "/img/prompts/academic-critique-template.png"
      image-alt: "A scholarly desk with papers, books, and evaluation forms representing academic critique and analysis"
      image-credits: "Ted Tschopp"
      image-credits-artist-URL: "https://tedt.org/"
      image-credits-title: "Academic Critique and Analysis"
      image_height: 816
      image_width: 1456
    sha256: "sha256:d36687064063bfaffcc4bf5a9deaba2c34a78fe1170a1b996f22bb203fa62da1"
    sourcePath: "/img/prompts/academic-critique-template.png"
    sourceUrl: "https://tedt.org/img/prompts/academic-critique-template.png"
  legacyMetadata:
    author:
      avatar: "https://secure.gravatar.com/avatar/a76b4d6291cecb3a738896a971bfb903?s=512&d=mp&r=g"
      name: "Ted Tschopp"
      url: "https://tedt.org/"
    bullets:
      - "Structured framework for scholarly paper analysis"
      - "Detailed grading rubric and evaluation criteria"
      - "Professional standards for academic content review"
    categories:
      - "Prompts"
    date: "2025-08-01"
    description: "A structured prompt template for critiquing academic papers, articles, and research content with detailed analysis framework, grading rubric, and professional standards."
    image: "/img/prompts/academic-critique-template.png"
    image-alt: "A scholarly desk with papers, books, and evaluation forms representing academic critique and analysis"
    image-credits: "Ted Tschopp"
    image-credits-artist-URL: "https://tedt.org/"
    image-credits-title: "Academic Critique and Analysis"
    image_height: 816
    image_width: 1456
    keywords:
      - "academic critique"
      - "content creation"
      - "documentation"
      - "quality review"
      - "technical writing"
    layout: "prompt-details"
    mastodon-post-id: "115003055074249913"
    models-supported:
      - "gpt-4"
      - "gpt-4-turbo"
      - "gpt-3.5-turbo"
      - "gpt-4-mini"
      - "microsoft-copilot"
      - "github"
    permalink: "/prompts/:slug/"
    series:
      - description: "Create initial blog post content based on your topic and audience"
        prompt_file: "2025-01-31-simple-blog-generator.md"
        step: 1
        title: "Content Generation"
      - current: true
        description: "Analyze and improve the generated content for quality and effectiveness"
        prompt_file: "2025-08-01-Critique-Content.md"
        step: 2
        title: "Content Critique"
    subtitle: "A comprehensive framework for scholarly paper analysis and evaluation"
    tags:
      - "Writing"
      - "Documentation"
      - "Communications"
    title: "Academic Content Critique Template"
    variables:
      - help: "The exact title of the academic paper or article"
        label: "Paper Title"
        name: "paper_title"
        placeholder: "Enter the title of the paper being critiqued"
        required: true
        type: "text"
      - help: "Full name(s) of the paper's author(s) exactly as listed"
        label: "Author(s)"
        name: "author_names"
        placeholder: "Enter author name(s) as listed on the paper"
        required: true
        type: "text"
      - default:
          - "methodology"
          - "logic and reasoning"
          - "evidence quality"
        help: "Select the specific aspects you want to focus on in your critique"
        label: "Critique Focus Areas"
        name: "critique_focus"
        options:
          - "methodology"
          - "logic and reasoning"
          - "evidence quality"
          - "practical implications"
          - "clarity of writing"
          - "research design"
          - "data analysis"
          - "theoretical framework"
          - "literature review"
          - "conclusions validity"
        required: false
        type: "checkbox"
      - default: "APA"
        help: "The citation style to use in your critique"
        label: "Citation Style"
        name: "citation_style"
        options:
          - "APA"
          - "MLA"
          - "Chicago"
          - "IEEE"
          - "Vancouver"
        required: true
        type: "select"
      - default: "standard analysis"
        help: "How detailed should the critique be?"
        label: "Critique Depth"
        name: "critique_depth"
        options:
          - "brief overview"
          - "standard analysis"
          - "comprehensive evaluation"
          - "expert-level critique"
        required: true
        type: "radio"
      - default: "no"
        help: "Should the critique include a formal grading assessment?"
        label: "Include Grading Rubric"
        name: "include_grading"
        options:
          - "yes"
          - "no"
        required: true
        type: "radio"
  legacyPaths:
    - "/prompts/academic-critique-content/"
  rawFrontmatterSha256: "sha256:f0139193437150db5c793f392d01d31c86cb1918069dca1345d77bce2ebf719c"
  sourceCommit: "61d55789c8754fec010824ccccb893e25f19ccb3"
  sourceDescription: "A structured prompt template for critiquing academic papers, articles, and research content with detailed analysis framework, grading rubric, and professional standards."
  sourceFileSha256: "sha256:8fc379c7b0335f14addabd6f425eef598880ef28b93e141bdbdd666cbede0c65"
  sourceGuideSha256: "sha256:f9be6ce7d2a3bdfdae39774bed14c02d49ded4533e28a4a55d1e2fd5f63287e5"
  sourceModels:
    - "gpt-4"
    - "gpt-4-turbo"
    - "gpt-3.5-turbo"
    - "gpt-4-mini"
    - "microsoft-copilot"
    - "github"
  sourcePath: "_posts/prompts/2025-08-01-Academic-Critique-Content.md"
  sourcePromptSha256: "sha256:11b8ebb5651e29fc61ad0ced36cf7e261a3790ed2a351df708f31116b777350a"
  sourceRepository: "https://github.com/TedTschopp/tedt.org"
  sourceSeoDescription: null
  sourceTitle: "Academic Content Critique Template"
  sourceUrl: "https://tedt.org/prompts/academic-critique-content/"
  unresolvedModelIdentifiers: []
  visibleInAlphaIndex: true
publicationStatus: "published"
relatedAssetIds:
  - "prompt:simple-blog-generator"
  - "prompt:universal-content-creator-demo"
seoDescription: null
series:
  - id: "simple-blog-review"
    nextAssetId: null
    previousAssetId: "prompt:simple-blog-generator"
    step: 2
    title: "Simple Blog Review"
    totalSteps: 2
  - id: "universal-content-review"
    nextAssetId: null
    previousAssetId: "prompt:universal-content-creator-demo"
    step: 2
    title: "Universal Content Review"
    totalSteps: 2
slug: "academic-critique-content"
status: "active"
subtitle: "A comprehensive framework for scholarly paper analysis and evaluation"
summaryBullets:
  - "Structured framework for scholarly paper analysis"
  - "Detailed grading rubric and evaluation criteria"
  - "Professional standards for academic content review"
tags:
  - "Writing"
  - "Documentation"
  - "Communications"
topics:
  - "Writing"
  - "Documentation"
  - "Communications"
updatedAt: null
variables:
  - help: "The exact title of the academic paper or article"
    label: "Paper Title"
    name: "paper_title"
    placeholder: "Enter the title of the paper being critiqued"
    required: true
    type: "text"
  - help: "Full name(s) of the paper's author(s) exactly as listed"
    label: "Author(s)"
    name: "author_names"
    placeholder: "Enter author name(s) as listed on the paper"
    required: true
    type: "text"
  - default:
      - "methodology"
      - "logic and reasoning"
      - "evidence quality"
    help: "Select the specific aspects you want to focus on in your critique"
    label: "Critique Focus Areas"
    name: "critique_focus"
    options:
      - "methodology"
      - "logic and reasoning"
      - "evidence quality"
      - "practical implications"
      - "clarity of writing"
      - "research design"
      - "data analysis"
      - "theoretical framework"
      - "literature review"
      - "conclusions validity"
    required: false
    type: "checkbox"
  - default: "APA"
    help: "The citation style to use in your critique"
    label: "Citation Style"
    name: "citation_style"
    options:
      - "APA"
      - "MLA"
      - "Chicago"
      - "IEEE"
      - "Vancouver"
    required: true
    type: "select"
  - default: "standard analysis"
    help: "How detailed should the critique be?"
    label: "Critique Depth"
    name: "critique_depth"
    options:
      - "brief overview"
      - "standard analysis"
      - "comprehensive evaluation"
      - "expert-level critique"
    required: true
    type: "radio"
  - default: "no"
    help: "Should the critique include a formal grading assessment?"
    label: "Include Grading Rubric"
    name: "include_grading"
    options:
      - "yes"
      - "no"
    required: true
    type: "radio"
worksWith:
  - "chatgpt"
  - "github-copilot"
  - "microsoft-copilot"
---
Act as an academic reviewer and critique the content provided using the following structured template. Focus your analysis on {{critique_focus}} and follow {{citation_style}} citation standards throughout your critique.

**Critique Level:** {{critique_depth}}
**Paper Title:** {{paper_title}}
**Author(s):** {{author_names}}
Include a formal grading rubric: {{include_grading}}.

## Introduction

<Purpose>
* Clearly introduce the critique by summarizing the paper's identity and key message.
* State explicitly the main point or argument presented by the original author.
* Present a clear thesis statement outlining what the critique aims to cover or analyze.

<Instructions>
* Identify and state the full name(s) of the paper's author(s) exactly as listed on the paper.
* Provide the complete, accurately formatted title of the article being critiqued.
* Succinctly describe the author's primary argument or central idea in your own words.
* Write a concise, direct thesis statement that previews the aspects or criteria your critique will address (e.g., methods, logic, evidence, implications).

<Example>
In the article "Artificial Intelligence and Ethical Decision-Making," authors Jane Doe and John Smith argue that AI systems must integrate clear ethical frameworks to effectively support human decisions. This critique evaluates the authors' methodology, use of supporting evidence, and practical applicability of their proposed ethical guidelines, highlighting strengths and identifying areas needing further development.

<Prerequisites>
* Full name(s) of the paper's author(s).
* Exact title of the paper.
* Clear understanding of the main argument or thesis presented by the author(s).
* Defined criteria or points you plan to analyze within your critique.
 <Standards>
* {{citation_style}} (American Psychological Association) style for author citation and article titles.
* MLA (Modern Language Association) style as an alternative if appropriate for humanities critiques.
* General academic standards require that introductions provide clear attribution, concise thesis statements, and sufficient context to understand the subsequent analysis.
 ## Summary

<Purpose>
* Clearly introduce the critique by summarizing the paper’s identity and key message.
* State explicitly the main point or argument presented by the original author.
* Present a clear thesis statement outlining what the critique aims to cover or analyze.

<Instructions>
* Identify and state the full name(s) of the paper’s author(s) exactly as listed on the paper.
* Provide the complete, accurately formatted title of the article being critiqued.
* Succinctly describe the author’s primary argument or central idea in your own words.
* Write a concise, direct thesis statement that previews the aspects or criteria your critique will address (e.g., methods, logic, evidence, implications).

<Example>
In the article “Artificial Intelligence and Ethical Decision-Making,” authors Jane Doe and John Smith argue that AI systems must integrate clear ethical frameworks to effectively support human decisions. This critique evaluates the authors’ methodology, use of supporting evidence, and practical applicability of their proposed ethical guidelines, highlighting strengths and identifying areas needing further development.

<Prerequisites>
* Full name(s) of the paper’s author(s).
* Exact title of the paper.
* Clear understanding of the main argument or thesis presented by the author(s).
* Defined criteria or points you plan to analyze within your critique.

<Standards>
* APA (American Psychological Association) style for author citation and article titles.
* MLA (Modern Language Association) style as an alternative if appropriate for humanities critiques.
* General academic standards require that introductions provide clear attribution, concise thesis statements, and sufficient context to understand the subsequent analysis.

## Summary

<Purpose>
* Clearly and objectively summarize the primary points, arguments, and findings presented by the author(s).
* Provide readers with essential context to understand the paper without personal opinion or analysis.

<Instructions>
* Restate the article’s main points clearly, without injecting your interpretation or critique.
* Identify and clearly describe the central arguments or claims made by the author(s).
* Clearly state the key findings or conclusions reached in the article.
* Use your own words to summarize—avoid direct quotations unless necessary.

<Example>
Doe and Smith’s article, “Artificial Intelligence and Ethical Decision-Making,” explores how AI systems can effectively integrate ethical principles into decision-making processes. The authors argue that clear, practical ethical guidelines are necessary for AI to safely support human decisions, especially in high-stakes fields like healthcare and autonomous transportation. They provide examples from existing systems and identify gaps in current AI ethics approaches. Key findings include identifying critical components of ethical AI, such as transparency, accountability, and continuous human oversight.

<Prerequisites>
* Accurate understanding of the article’s key points.
* The author’s main arguments clearly identified.
* Explicitly stated results, conclusions, or recommendations from the original article.

<Standards>
* APA (American Psychological Association) guidelines for summarizing scholarly sources.
* General scholarly standards that emphasize objectivity, clarity, completeness, and conciseness in summarization.
* IEEE and ACM guidelines for accurately and succinctly summarizing technical content.

## Critique

<Purpose>
* Clearly analyze and evaluate the article’s strengths and weaknesses.
* Offer informed, evidence-based opinions about the article’s clarity, relevance, and accuracy.
* Provide detailed examples from the article to support critical judgments.

<Instructions>
* Identify and clearly describe specific strengths of the article, such as effective arguments, clear writing, thorough research, or insightful conclusions.
* Identify and clearly describe specific weaknesses, including unclear points, logical fallacies, unsupported claims, or insufficient evidence.
* Explicitly state your informed views on the article’s:
* Clarity: Is the content clearly expressed and easily understandable?
* Relevance: Is the information meaningful and applicable to the intended audience or current scholarly/professional context?
* Accuracy: Is the information supported by evidence, correctly interpreted, and factual?
* Support each opinion with clear, specific examples directly cited or paraphrased from the article.

<Example>
The article by Jane Doe and John Smith demonstrates notable strengths, particularly in its clear presentation of ethical frameworks for artificial intelligence. The authors effectively clarify complex ethical theories by providing concrete examples, such as the detailed case study of autonomous vehicle decision-making (Doe & Smith, 2024, p. 12). However, a primary weakness lies in the limited empirical evidence supporting the efficacy of their proposed guidelines. The authors claim substantial industry applicability yet only cite anecdotal evidence from two organizations, reducing the overall reliability and relevance of their findings (p. 15-16). While generally clear, some critical terms like “ethical risk” were used repeatedly without adequate initial definition, somewhat reducing clarity for readers less familiar with ethical AI terminology (p. 7). Overall, the accuracy of presented data is commendable, with precise referencing to current research, though the narrow range of cited studies slightly weakens the comprehensive accuracy of the argument.

<Prerequisites>
* A careful reading of the article, noting significant points that stand out as strengths or weaknesses.
* Identification of specific elements (arguments, evidence, examples) to evaluate in terms of clarity, relevance, and accuracy.
* Direct quotations or clearly paraphrased content from the original article to serve as evidence supporting your evaluations.
* Citation details (author name, year, page numbers) from the original source.

<Standards>
* APA (American Psychological Association) standards for accurately citing direct quotations, paraphrases, and summarizing content.
* General academic critique standards that emphasize balanced evaluation (positive and negative), evidence-supported opinions, and clear reasoning.
* International Critical Thinking Standards (Paul-Elder Framework), emphasizing precision, relevance, logic, depth, accuracy, clarity, fairness, and breadth.

## Conclusion

<Purpose>
* Summarize the critical points from both the original article and your critique analysis clearly and concisely.
* Provide a closing perspective highlighting the significance of the research or recommend future research opportunities.

<Instructions>
* Briefly restate the author’s main arguments or findings.
* Concisely summarize your critique’s key evaluations (both strengths and weaknesses) of the article.
* Clearly articulate why the research matters or identify specific gaps that future research should address.
* Ensure your conclusion is concise and leaves the reader with a clear understanding of the critique’s value and the article’s contribution to the field.

<Example>
In summary, Doe and Smith’s article “Artificial Intelligence and Ethical Decision-Making” presents a meaningful framework for integrating ethics into AI systems, effectively simplifying complex ethical considerations. However, the critique identified significant limitations, particularly the insufficient empirical evidence to support broad applicability. Despite these issues, the article significantly contributes to ongoing discussions about ethical AI by clearly addressing theoretical gaps and real-world scenarios. Future research should focus on extensive empirical validation of the proposed ethical guidelines, examining their practical effectiveness across diverse AI applications.

<Prerequisites>
* Key points and arguments from the original article.
* Main strengths and weaknesses from your critique.
* Insights into the importance of the research or identification of critical research gaps for future exploration.

<Standards>
* APA (American Psychological Association) standards for concise summarization and clarity in academic writing.
* General standards for writing scholarly conclusions, emphasizing brevity, relevance, forward-looking statements, and contextual significance.
* IEEE and ACM guidelines for summarizing and stating the significance of research clearly in professional critiques, especially within technical and scientific domains.

## Grading Rubric

<Purpose>

This rubric is designed to provide consistent, fair, and actionable evaluations of written papers. Each criterion is scored separately using a detailed scale. Final grades are calculated based on total points. Specific comments should be provided for each section.

<Instructions> 

1. **Read the Paper Thoroughly:** Read the entire paper before scoring to get a holistic sense of the argument, structure, and style.
2. **Score Each Criterion Independently:** Use the descriptors in each level to assign a score (0–4) for every criterion. Refer to the detailed level descriptors to avoid bias.
3. **Justify Scores with Comments:** For each criterion, write a brief comment explaining the score, pointing out specific strengths and areas for improvement.
4. **Calculate the Total Score:** Add up scores for each criterion for a final grade.
5. **Provide Overall Feedback:** Offer a concise summary at the end—highlighting major strengths, significant weaknesses, and actionable next steps.
6. **Maintain Consistency:** Use the descriptors as your guide. When unsure, consult with another grader or refer to exemplar papers.

### Overall Feedback

*(Write 3–5 sentences summarizing overall strengths, areas for improvement, and suggestions for next steps.)*

### Scoring Scale

* **4 – Excellent:** Exceeds expectations; exemplary work
* **3 – Good:** Meets expectations; minor errors
* **2 – Satisfactory:** Adequate; some noticeable issues
* **1 – Needs Improvement:** Significant weaknesses
* **0 – Unacceptable:** Does not address the criterion

### Criteria

| Criterion                                     | 4 - Excellent                                                        | 3 - Good                                         | 2 - Satisfactory                                     | 1 - Needs Improvement                            | 0 - Unacceptable                 |
| --------------------------------------------- | -------------------------------------------------------------------- | ------------------------------------------------ | ---------------------------------------------------- | ------------------------------------------------ | -------------------------------- |
| **Thesis & Purpose**                          | Clear, original, well-stated thesis; focus maintained throughout     | Clear thesis; mostly maintained focus            | Thesis present but unclear or not maintained         | Weak, unfocused, or off-topic thesis             | No thesis or purpose             |
| **Structure & Organization**                  | Logical, seamless flow; strong intro/conclusion; clear transitions   | Mostly logical flow; effective intro/conclusion  | Organization is present but inconsistent             | Disorganized; unclear sections; weak transitions | No logical structure             |
| **Evidence & Support**                        | Comprehensive, relevant, well-integrated evidence; critical analysis | Good evidence; generally relevant and integrated | Adequate evidence; sometimes underdeveloped          | Weak or minimal evidence; little analysis        | No evidence/support              |
| **Analysis & Insight**                        | Deep, original analysis; shows strong understanding & synthesis      | Good analysis; shows understanding               | Some analysis but lacks depth                        | Superficial, summary only                        | No analysis/insight              |
| **Clarity & Style**                           | Highly readable; precise, engaging language; strong academic voice   | Mostly clear; appropriate style                  | Understandable but sometimes vague or awkward        | Hard to follow; inappropriate tone/style         | Unreadable or inappropriate      |
| **Mechanics (Grammar, Spelling, Formatting)** | Error-free; follows required formatting perfectly                    | Few errors; formatting mostly correct            | Some errors; distract but don’t impede understanding | Frequent errors; hard to read                    | Excessive errors; unreadable     |
| **Use of Sources / Citations**                | All sources well-chosen, cited correctly, integrated smoothly        | Mostly correct citations, generally well-chosen  | Some citation errors or weak sources                 | Poor use of sources, many errors                 | No citations or clear plagiarism |

### Scoring Sheet Template

| Criterion                  | Score (0–4) | Comment (Required) |
| -------------------------- | ----------- | ------------------ |
| Thesis & Purpose           |             |                    |
| Structure & Organization   |             |                    |
| Evidence & Support         |             |                    |
| Analysis & Insight         |             |                    |
| Clarity & Style            |             |                    |
| Mechanics                  |             |                    |
| Use of Sources / Citations |             |                    |
| **Total**                  |             |                    |

### Customization Options

* **Weighting:** Adjust weights if some criteria are more important (e.g., double weight for Evidence & Support).
* **Discipline-Specific Criteria:** Add elements relevant to your context (e.g., creativity for a narrative, technical accuracy for a science report).
* **Holistic Grading:** Optionally provide an overall holistic score for special assignments.

<Example>

| Criterion                | Score | Comment                                              |
| ------------------------ | ----- | ---------------------------------------------------- |
| Thesis & Purpose         | 4     | Clear, original thesis; maintains focus throughout   |
| Structure & Organization | 3     | Mostly logical flow, minor issues in transitions     |
| Evidence & Support       | 2     | Some evidence not directly linked to thesis          |
| Analysis & Insight       | 3     | Good analysis; could be deeper in final section      |
| Clarity & Style          | 4     | Engaging, academic style, very readable              |
| Mechanics                | 4     | Nearly error-free                                    |
| Use of Sources/Citations | 3     | Minor citation errors, otherwise well-chosen sources |
| **Total**                | 23    |                                                      |

<Standards>

* **AAC&U VALUE Rubrics** (American Association of Colleges & Universities)
* **APA / MLA / Chicago Style Guidelines**
* **Bloom's Taxonomy for Critical Thinking**
