---
name: factory
description: Run the software factory. Takes a feature through spec, build, four parallel reviews and an approver, tracked on factory/board.json.
argument-hint: <feature> | next | approve <job-id> | rework <job-id> <note>
disable-model-invocation: true
---
You are the orchestrator. You run the loop, spawn every agent, and you are the only writer of `factory/board.json`. Agents get context from files, not from this conversation. Each one writes only its own file, so pass them paths, not summaries.

Run from the repo root, with the main checkout on `main`. Watch the board with `cd factory && python3 -m http.server`, then open `/dashboard.html`.

## Board

`factory/board.json` is `{ "jobs": [...] }`. Rewrite the whole file every time a job changes stage or a verdict lands.

```json
{ "id": "003-rate-limiting", "title": "Rate limiting", "branch": "factory/003-rate-limiting",
  "stage": "review", "round": 2,
  "reviews": { "security": "CHANGES", "ux": "PASS", "ui": "pending", "code": "PASS" },
  "history": [ { "security": "CHANGES", "ux": "CHANGES", "ui": "PASS", "code": "PASS" } ] }
```

The stage is one of `spec`, `build`, `review`, `approval`, `needs-human` or `merged`. `reviews` holds the current round. When a new round starts, move the old `reviews` into `history`.

## The loop

1. **Job.** The id is the next three-digit number after the highest one in `factory/jobs/`, plus a short kebab slug, like `004-event-feed`. Create `factory/jobs/<id>/` and add the job at stage `spec`.
2. **Spec.** Spawn `spec-writer` with the feature text and the job folder. Wait for `spec.md`.
3. **Build.** Run `git worktree add .claude/worktrees/<id> -b factory/<id> main`, then set the stage to `build`. Spawn `builder` named `builder-<id>` with the job id and folder. Wait for `build.md`.
4. **Review.** Set `round` to n, create `round-<n>/`, set all four reviews to `pending` and the stage to `review`. Spawn `review-security`, `review-ux`, `review-ui` and `review-code` in parallel, each with the job id and the round folder. As each finishes, read the first line of its file and update the board.
5. **Wait for all.** The round is done only when all four `review-*.md` files exist in `round-<n>/`. Never resume the builder mid-round.
6. **Changes.** If any review says `VERDICT: CHANGES` and the builder has been resumed fewer than 2 times, set the stage to `build`. Resume `builder-<id>` with SendMessage, pointing it at `round-<n>/`. When it's done, go to step 4 with n+1. If no `builder-<id>` exists any more (for example in a new session), spawn a fresh `builder` with that name. It picks up from the files.
7. **Approve.** When all four pass, or the resumes are used up, set the stage to `approval` and spawn `approver` with the job folder. Read the first line of `decision.md`:
   - `APPROVE`: ship it (below).
   - `ESCALATE`: set the stage to `needs-human` and tell the user the job id and the question in `decision.md`.

## Ship

From the main checkout on `main`, run `git merge --no-ff factory/<id>`, then `git worktree remove .claude/worktrees/<id>`. Commit the job record with `git add factory/jobs/<id> factory/board.json`, using the message `factory: merge <id>`. Set the stage to `merged`. Don't push. The user pushes.

## Commands

- `/factory <feature>`: run the loop on the feature text.
- `/factory next`: take the first `- [ ]` item in `factory/backlog.md`, mark it `- [x] … (<id>)`, and run the loop on it.
- `/factory approve <id>`: only for a `needs-human` job. Ship it.
- `/factory rework <id> <note>`: write the note to `round-<n>/review-human.md` as `VERDICT: CHANGES` followed by the note. Recreate the worktree if it's gone, resume the builder at `round-<n>/` as in step 6, then continue from step 4. A rework gets a fresh allowance of 2 resumes.
