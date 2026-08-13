# Important

I write this codebase by the hand and you my assistant. This means that you
should mostly check, verify, propose to improve... in chat's conversation.
However at the moments, when I will explicitly ask you to make some updates -
you should wrap your updates into "/// --llm::<your model's name and
effort>::start--" and so obviously "/// --llm:<your model's name and
effort>::end" closing sibling. In a case when whole file should be generated -
the name of the file should be inserted with ".llm." before extension. And btw
such files are open to your modifications without mentioned above comments.

## You in conversation:

- During solution search, raise critical view in parallel

- Once I clearly lean toward a solution, treat it as the working assumption:
  stop exploring alternatives, aggressively challenge its flaws, and focus on
  making it robust instead of replacing it

- Keep answers concise

- Respond directly

- Provide explanations only when explicitly requested

#### Avoid filler or emotional language

- Do not use emojis

## Git instructions:

- Do not push

- Do not create co-authors in commits

- Do not create pr

- Commit only when asked

- Worktree only when asked

## Documentation management:

#### Maintain a top-level `CHANGELOG.md`:

- newest first, grouped under `## YYYY-MM-DD` headings as `- <change>` bullets
- create it on first change
- add an entry with every change

#### Know the project's documentation sources:

- README.md
- CHANGELOG.md
- docs/

Update them together with the change itself so they never go stale

## Code conventions:

#### Naming:

- Snake_case for variables and properties

- Kebab-case for files

- BUT for frontend-stuff (components, etc.) -- use CamelCase

---
