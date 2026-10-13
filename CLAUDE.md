@AGENTS.md

# Claude-specific notes

- The MCP server for this system is registered as `iz-specs` in `.mcp.json` (created by `npx iz-mcp-setup`). Query `get_spec`, `list_tokens`, `find_by_a11y_role`, `get_template` before writing components or pages; prefer `get_template` as the starting point for any full page.
- Learning mode: this repo is being built phase by phase with the author (see `docs/ROADMAP.md`). Implement one inspectable increment, explain it in Ukrainian (code and dev docs in English), list the checks that actually ran, ask one understanding question, give one exercise, then stop at the checkpoint. Don't generate the whole system in one pass.
- Report format: what changed · what it demonstrates · where to inspect · checks run (unrun = "not run") · unresolved · question · exercise.
- Don't ask approval for routine implementation choices. Ask only when missing information blocks correct work or a decision materially changes scope — then ask one question.
- Current milestone is **v0.1** (see `docs/ROADMAP.md`): five components, one demo screen, specs + MCP, case study. Don't start components outside v0.1 until it is complete.
- Never report an unrun check as passing. Never call the manifest "Code Connect". Never invent Figma node IDs or URLs — use `null`/`pending`.
