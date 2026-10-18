# Podcast Script Generator

Create a two-host episode or a host-and-guest interview from a topic, newsletter, article set, transcript, or other supplied material. The source boundary applies to both formats: dialogue is a script, and factual claims must be supported.

## Choose the Format

- Two-host episode: Nova and Miles discuss selected stories and their implications. Supply a different cast if needed.
- Interview: Jane opens and guides a conversation with a guest role, then closes. Supply names and the source material that supports the guest's answers.

## Choose the Output

Ask for readable dialogue in chat, a transcript file, TTS-ready SSML, or narrated audio. Script-only output does not require an Azure connector. SSML uses one voice per turn and keeps pauses inside each voice element.

The audio mode uses the configured Azure Text-to-Speech action when available. The Copilot Studio container writes files into `/app/created/`; another host uses its available artifact directory. The skill reports only files actually created and storage or synthesis that actually succeeded.

Provide a desired duration, language, cast, and output format when they matter. Existing source-supplied facts and uncertainty remain intact.

## Available Modes

Choose a two-host roundup or a host-and-guest interview. Jane leads the default interview; Nova and Miles remain the default two-host cast. Ask for a script in chat, a transcript file, SSML, or audio. The script-only mode does not require the Azure connector.

- Includes the Communications Script a Podcast workflow by Ted Tschopp. [Original source](https://github.com/TedTschopp/cat-agent-skills/tree/1a3e42195454e4e4159a327d175a72870d505268/submissions/script-a-podcast).

Use this entry for the maintained workflow and current download.

Readable scripts can be used in any supported Agent Skills host. Audio synthesis requires the configured Azure Speech action; missing audio tooling does not block script creation.
