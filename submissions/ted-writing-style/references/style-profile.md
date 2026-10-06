# Style profile and evidence

## Corpus boundary

This profile was derived on July 31, 2026, from the live TedT.org archive.

- Inventory: the site's `Blog Posts` and `RPG Posts` collections, dated 2003
  through 2019.
- Live verification: every inventory item was matched to its canonical URL in
  `https://tedt.org/sitemap.xml` and fetched from `https://tedt.org/`.
- Coverage: 55 of 55 live pages matched with no fetch errors.
- Included: 54 Ted-authored posts.
- Excluded: one 2019 reprint by Hanson W. Baldwin.
- Voice decontamination: block quotations, code, tables, figures, and page
  chrome were excluded before analysis so other writers and structured game
  data did not dominate the prose profile.
- Analyzed prose: about 57,000 words. The exact extraction count was 57,428;
  the lexical analyzer counted 56,477 alphabetic word tokens.

The inventory has two materially different bodies:

| Body | Posts | Words | Median post | First person per 1,000 words | Questions |
|---|---:|---:|---:|---:|---:|
| General blog | 43 | 20,224 | 417 | 41.7 | 8.9% of sentences |
| RPG/reference | 11 | 36,253 | 2,799 | 3.4 | 1.2% of sentences |

This difference is why the skill has modes. A single averaged voice would make
personal essays too encyclopedic and reference material too conversational.

## Stable traits across the archive

### Concrete-to-abstract movement

Ted frequently starts from something visible: rain in Los Angeles, a device in
his hands, the way people communicate at work, a historical community, a map,
or a rule at the table. The piece then asks what that thing reveals about a
larger system. The reliable movement is:

`observation -> question -> model or analogy -> consequence -> human meaning`

### Thinking in public

The prose rarely hides the path to the conclusion. It uses first person,
provisional language, questions, small corrections, and explicit transitions.
This gives it an exploratory quality without making the argument evasive.

Common moves in the general-blog corpus include:

- `I think` 22 times;
- `I hope` 6 times;
- `I suspect` 2 times;
- `to be honest` 4 times;
- `so what` 12 times;
- `what does` 10 times;
- `the first` 32 times and `the second` 12 times;
- `finally` 26 times and `in the end` 8 times.

These counts are evidence of habits, not targets.

### Plain-language systems thinking

Ted often reduces a complex subject to a small model: sender, receiver, and
payload; output, calculation, and storage; participants in a conversation;
technology as something that must be maintained socially. He explains the
parts in ordinary language, then follows their interactions.

### Analogy with mechanical purpose

Theme parks illuminate mobile operating systems. Pens and paper illuminate
collaboration tools. An isolated population illuminates innovation. The metric
system illuminates external standards. The analogy is not ornamental; it lets
the reader see the mechanism.

### Rhetorical questions as structure

Questions often arrive in sequences. They establish the problem, lead the
reader through the model, and then turn outward as a challenge. In the
general-blog corpus, about 8.9% of sentences are questions. This is a strong
signal, but copying the percentage would quickly become mannered.

### Repetition, parallelism, and contrast

The archive frequently repeats an opening or clause while changing the final
term. It uses constructions such as "not just X; it is Y," lists that build
through "first," "second," and "finally," and recurring images that acquire a
different meaning by the end.

### Human stakes

Even technical writing asks what a system changes for a person. Organizational
writing asks what prevents people from talking and learning. Religious or
philosophical writing remains attached to longing, responsibility, hope, or
ordinary experience. Game material asks what an abstraction changes in play.

### Earnestness with humility

Ted can state a strong position, but the voice is usually candid about where it
is personal, predictive, unfinished, or still being worked out. Humor appears
as an aside or a moment of self-awareness, not as a constant performance.

## Sentence and paragraph evidence

Across all included prose:

- Median sentence: 12 words.
- Mean sentence: 12.9 words.
- 90th-percentile sentence: 25 words.
- Contractions: 6.43 per 1,000 words overall; 12.31 in the general blog.
- Semicolons: 0.71 per 1,000 words.
- Em dashes: 0.27 per 1,000 words.
- Ellipses: 0.81 per 1,000 words.
- Exclamation marks: 0.46% of sentences.
- Parenthetical asides: present in 11.52% of extracted paragraphs.

The practical lesson is varied but generally direct syntax, conversational
contractions in essays, occasional asides, and restrained formal punctuation.

## Mode profiles

### Reflective and spiritual

- Begins with an experience, season, landscape, memory, or work of art.
- Uses specific sensory details before naming the larger theme.
- Moves toward longing, incompleteness, forgiveness, truth, hope, or return.
- Uses literary, biblical, and philosophical references as lenses.
- Often returns to the opening image in the final paragraph.
- Can be emotionally direct without abandoning analysis.

Use this layer only when the subject and supplied beliefs warrant it.

### Technology and strategy

- Opens with a conviction, trend, irritation, or familiar product experience.
- Explains technology in terms a non-specialist can picture.
- Compares eras, products, or architectural models.
- Follows second- and third-order effects.
- Makes forecasts, usually with visible markers of uncertainty.
- Returns to how technology changes everyday behavior.

### Collaboration and organization

- Uses a historical or social case as a thought experiment.
- Converts the case into a simple principle.
- Asks the reader a sequence of direct diagnostic questions.
- Ends in a challenge, maxim, or behavioral implication.

### RPG and design reference

- Begins with intent, scope, and sometimes working notes.
- Decomposes a domain into categories and attributes.
- Defines a concept, then states its practical or mechanical consequence.
- Uses examples generously.
- Favors modular completeness and reuse over narrative flow.
- Is comfortable with long inventories when the reader needs a toolkit.

The published skill modernizes this mode by resolving accidental draft debris
unless the user asks for notes.

### Fiction and lyrical work

- Grounds the uncanny in mundane procedural detail.
- Reveals the unusual through small observations rather than exposition.
- Uses dialogue economically.
- Allows a final concrete image to carry the philosophical meaning.

## What not to imitate

The early archive includes misspellings, punctuation slips, homophone errors,
unfinished sentences, duplicate ideas, and raw `TODO`s. Those are artifacts of
drafting and publication history, not defining voice features. Preserve the
cadence and reasoning while applying modern copy editing.

Several current page titles appear optimized for discoverability. Title
punctuation and colon frequency were therefore treated as a weaker signal than
body prose.

## Independent cross-check

After deriving the profile, the existing public `Ted's Writing Style` prompt on
TedT.org was checked as corroboration, not included in the corpus. It confirms
the reflective mode's narrative movement, varied sentence length, repetition,
sensory description, contemplative warmth, sincerity, philosophical and
spiritual themes, and movement from difficulty toward hope. The new skill adds
the technical, organizational, game-design, and fiction modes demonstrated by
the broader pre-2020 archive.
