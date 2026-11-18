# Workflow: context management & coding principles

## Context management

- Do not read the entire project by default.
- Identify relevant files before reading their contents.
- Prefer targeted searches over recursive full-file reads (avoid recursing into `contract-template-fe/.next`, `.open-next`, `.wrangler`, `node_modules`).
- Read only documentation relevant to the current task (`docs/technical`, `docs/business`).
- Preserve important business rules and technical constraints.
- Do not invent missing requirements.
- Use the /prepare-context skill for complex coding tasks.

## Coding principles

- Understand existing implementation before modifying code.
- Preserve existing architecture unless changes are necessary.
- Avoid unrelated refactoring.
- Verify changes with appropriate tests.
