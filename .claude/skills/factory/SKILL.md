---
name: factory
description: Run the software factory. Takes a feature through spec, build, four parallel reviews and an approver, tracked on factory/board.json.
argument-hint: <feature> | next | build <job-id> | approve <job-id> | rework <job-id> <note>
disable-model-invocation: true
---
You are the orchestrator. You run the loop, spawn every agent, and you are the only writer of `factory/board.json`. Agents get context from files, not from this conversation. Each one writes only its own file, so pass them paths, not summaries. `factory/context.md` is the factory's shared memory: the spec-writer, builder and approver read it on every job, and only you edit it.

Run from the repo root, with the main checkout on `main`. Shipping needs the `gh` CLI, signed in. Watch the board with `cd factory && python3 -m http.server --bind 127.0.0.1`, then open `/dashboard.html`.

## Board

`factory/board.json` is `{ "jobs": [...] }`. Create it if it's missing. Rewrite the whole file every time a job changes stage or a verdict lands. The board and `factory/jobs/` are local state and are gitignored.

```json
{ "id": "003-rate-limiting", "title": "Add rate limiting", "branch": "factory/003-rate-limiting",
  "stage": "review", "round": 2, "pr": null, "shots": ["event-feed"],
  "reviews": { "security": "CHANGES", "ux": "PASS", "ui": "pending", "code": "PASS" },
  "history": [ { "security": "CHANGES", "ux": "CHANGES", "ui": "PASS", "code": "PASS" } ] }
```

The stage is one of `spec`, `spec-review`, `build`, `review`, `approval`, `needs-human` or `merged`. `pr` is the PR URL once it's open. `shots` lists the job's screenshot names. `reviews` holds the current round. When a new round starts, move the old `reviews` into `history`.

## The loop

1. **Job.** The id is the next three-digit number after the highest one in `factory/jobs/`, plus a short kebab slug, like `004-event-feed`. Create `factory/jobs/<id>/` and add the job at stage `spec`. The title is a short imperative summary like `Add event feed`, and it becomes the PR and commit title.
2. **Spec.** Spawn `spec-writer` with the feature text and the job folder. Wait for `spec.md`, then set the stage to `spec-review` and stop. Refine the spec with the user in this session, editing `spec.md` as you agree, and record their decisions and reasons in `notes.md`. Before building, update `factory/context.md` with any decision that outlives the job, such as a new or changed domain rule or a resolved open question. Rewrite or delete the old line rather than adding to it, and tag it with the job id. Build only on `/factory build <id>`.
3. **Build.** Run `git pull --ff-only origin main`, then `git worktree add .claude/worktrees/<id> -b factory/<id> main`, then set the stage to `build`. Spawn `builder` named `builder-<id>` with the job id and folder. Wait for `build.md`.
4. **Review.** Take screenshots first (below). Then set `round` to n, create `round-<n>/`, set all four reviews to `pending` and the stage to `review`. Spawn `review-security`, `review-ux`, `review-ui` and `review-code` in parallel, each with the job id and the round folder. As each finishes, read the first line of its file and update the board.
5. **Wait for all.** The round is done only when all four `review-*.md` files exist in `round-<n>/`. Never resume the builder mid-round.
6. **Changes.** If any review says `VERDICT: CHANGES` and the builder has been resumed fewer than 2 times, set the stage to `build`. Resume `builder-<id>` with SendMessage, pointing it at `round-<n>/`. When it's done, go to step 4 with n+1. If no `builder-<id>` exists any more (for example in a new session), spawn a fresh `builder` with that name. It picks up from the files.
7. **Approve.** When all four pass, or the resumes are used up, set the stage to `approval` and spawn `approver` with the job folder. Read the first line of `decision.md`:
   - Either way, open the PR first (below).
   - `APPROVE`: merge it (below).
   - `ESCALATE`: set the stage to `needs-human`. Tell the user the job id, the PR link and the question in `decision.md`.

## Ship

**Open the PR.** Run `git push -u origin factory/<id>`. If `pr` is already set, that's all. Otherwise write `pr.md` in the job folder and run `gh pr create --base main --head factory/<id> --title "<title>" --body-file <job folder>/pr.md`. Save the URL as `pr` on the board. If `shots` is set, publish the screenshots (below) and add them to `pr.md` before creating the PR. After later rounds, republish and run `gh pr edit <pr> --body-file <job folder>/pr.md`.

`pr.md` is for a human scanning the PR list, not a copy of the spec. Write it yourself from `spec.md`, `build.md` and `decision.md`, under 100 words before the attribution line:

```markdown
<One sentence: what changed and why.>

- <3–5 bullets, only what a reviewer should look at: schema or API changes, behaviour changes, deliberate omissions, anything surprising>

**Needs your call:** <the ESCALATE question in one line. Omit this line on APPROVE.>
```

Leave out acceptance criteria, file lists, test logs, review verdicts and helper-by-helper details. The diff and the job folder already have them.

**Merge.** Run `gh pr checks <pr> --watch`. If CI fails, run `/factory rework <id> Fix CI: <failing check>` instead of merging. Otherwise run `git worktree remove .claude/worktrees/<id>` (the branch can't be deleted while a worktree holds it), then `gh pr merge <pr> --squash --subject "<title> (#<n>)" --delete-branch` and `git pull --ff-only origin main`. Set the stage to `merged` and `merged_at` to the current ISO time, then rebuild the baseline (below). Then add anything new from `build.md`, the reviews or `decision.md` to the Open questions and Known gaps sections of `factory/context.md`, and remove what this job closed.

**Conflicts.** If `gh pr merge` fails on a conflict, run `/factory rework <id> Merge origin/main and resolve the conflicts`. After every successful merge, check each other job with an open PR using `gh pr view <pr> --json mergeable`, and rework every one that says `CONFLICTING` the same way.

## Screenshots

These are for reviewers to see what changed. They're not a test.

**Baseline.** `factory/baseline/LocalHost.app` is a Release build of `main`, gitignored. If it's missing, and after every merge, run `npx expo run:ios --configuration Release` in the main checkout, then replace it with `cp -R "$(xcrun simctl get_app_container booted com.crencricca.localhost)" factory/baseline/LocalHost.app`.

**Capture.** Take the `.maestro/` flows the job added or changed (`git diff --name-only main...factory/<id> -- .maestro/`). If none of them has a `takeScreenshot` step, or the builder couldn't run the flows, skip this. The builder has just installed the job build, so:
1. Run each flow with `maestro test --test-output-dir <job folder>/shots/raw-after <worktree>/<flow>`.
2. Run `xcrun simctl install booted factory/baseline/LocalHost.app`, then run the same flows into `shots/raw-before`. A flow that fails on `main` is fine, because that screen is new.
3. Copy each PNG under `raw-after` and `raw-before` to `shots/after/<name>.png` and `shots/before/<name>.png`, run `sips --resampleWidth 400` on them, and delete the raw folders. Set `shots` on the board to the names.

**Publish.** Screenshots live on the `factory-screenshots` branch, which is never merged, so `main` never holds images. Work in it at `.claude/worktrees/screenshots`. If that's missing, run `git fetch origin factory-screenshots` and `git worktree add .claude/worktrees/screenshots factory-screenshots`. If the branch doesn't exist yet, run `git worktree add --orphan -b factory-screenshots .claude/worktrees/screenshots` instead. Copy `shots/before` and `shots/after` to `<id>/` there, then commit and push, and note the commit sha. In `pr.md`, add a `### Screenshots` table with one row per name: before and after images from `https://raw.githubusercontent.com/crencricca/localhost-native/<sha>/<id>/<before|after>/<name>.png`, with "new" where there's no before.

## Commands

- `/factory <feature>`: run the loop on the feature text.
- `/factory next`: take the first `- [ ]` item in `factory/backlog.md`, mark it `- [x] … (<id>)`, and run the loop on it.
- `/factory build <id>`: only for a `spec-review` job. Continue from step 3.
- `/factory approve <id>`: only for a `needs-human` job. Merge its PR.
- `/factory rework <id> <note>`: write the note to `round-<n>/review-human.md` as `VERDICT: CHANGES` followed by the note. Recreate the worktree if it's gone, resume the builder at `round-<n>/` as in step 6, and push the branch if a PR is open. Then continue from step 4. A rework gets a fresh allowance of 2 resumes.
