#!/usr/bin/env bash
set -euo pipefail

usage() {
  cat <<'USAGE'
Usage: scripts/pr-feedback-workflow.sh <pr-number> [--sync-base]

Collect GitHub pull-request context into .codex/pr-feedback/pr-<number>/ so you can
turn PR comments into a focused local change. With --sync-base, the script also
checks out the PR branch and attempts to merge the PR base branch into it so
merge conflicts surface locally.

Examples:
  scripts/pr-feedback-workflow.sh 4
  scripts/pr-feedback-workflow.sh 4 --sync-base

Requirements: GitHub CLI (`gh`) authenticated for this repository.
USAGE
}

if [[ $# -lt 1 || "${1:-}" == "-h" || "${1:-}" == "--help" ]]; then
  usage
  exit 0
fi

pr_number=""
sync_base=0

while [[ $# -gt 0 ]]; do
  case "$1" in
    --sync-base)
      sync_base=1
      shift
      ;;
    -* )
      echo "Unknown option: $1" >&2
      usage >&2
      exit 64
      ;;
    *)
      if [[ -n "$pr_number" ]]; then
        echo "Only one PR number is supported." >&2
        usage >&2
        exit 64
      fi
      pr_number="$1"
      shift
      ;;
  esac
done

if [[ -z "$pr_number" || ! "$pr_number" =~ ^[0-9]+$ ]]; then
  echo "PR number must be a positive integer." >&2
  usage >&2
  exit 64
fi

for required in git gh; do
  if ! command -v "$required" >/dev/null 2>&1; then
    echo "Missing required command: $required" >&2
    exit 69
  fi
done

repo_root="$(git rev-parse --show-toplevel)"
cd "$repo_root"

if ! gh auth status >/dev/null 2>&1; then
  echo "GitHub CLI is not authenticated. Run: gh auth login" >&2
  exit 77
fi

out_dir=".codex/pr-feedback/pr-${pr_number}"
mkdir -p "$out_dir"

echo "Collecting PR #${pr_number} context into ${out_dir} ..."
gh pr view "$pr_number" \
  --json number,title,state,isDraft,url,author,baseRefName,headRefName,mergeStateStatus,body \
  > "${out_dir}/pr.json"
gh pr view "$pr_number" --comments > "${out_dir}/thread.md"
gh api "repos/:owner/:repo/pulls/${pr_number}/comments" --paginate > "${out_dir}/review-comments.json"
gh api "repos/:owner/:repo/issues/${pr_number}/comments" --paginate > "${out_dir}/issue-comments.json"

base_ref="$(gh pr view "$pr_number" --json baseRefName --jq '.baseRefName')"
head_ref="$(gh pr view "$pr_number" --json headRefName --jq '.headRefName')"
merge_state="$(gh pr view "$pr_number" --json mergeStateStatus --jq '.mergeStateStatus')"

cat > "${out_dir}/next_steps.md" <<STEPS
# PR #${pr_number} update packet

- Head branch: \`${head_ref}\`
- Base branch: \`${base_ref}\`
- GitHub merge state: \`${merge_state}\`

## Manual update loop

1. Read \`thread.md\`, \`review-comments.json\`, and \`issue-comments.json\` in this folder.
2. Convert each requested change into a small checklist item.
3. Check out the PR branch: \`gh pr checkout ${pr_number}\`.
4. Bring the branch up to date with the base: \`git fetch origin ${base_ref} && git merge origin/${base_ref}\`.
5. If conflicts appear, resolve each file, run checks, then commit.
6. Push the same PR branch: \`git push\`. The existing PR updates automatically.

## Suggested checks for this repo

- \`npm run sync:videos\`
- \`npm run typecheck\`
- \`npm run build\`

STEPS

if [[ "$sync_base" -eq 1 ]]; then
  echo "Checking out PR branch and attempting to merge origin/${base_ref} ..."
  gh pr checkout "$pr_number"
  git fetch origin "$base_ref"
  if ! git merge --no-ff --no-commit "origin/${base_ref}"; then
    git diff --name-only --diff-filter=U > "${out_dir}/conflicts.txt" || true
    echo "Merge conflicts detected. Conflicted files were written to ${out_dir}/conflicts.txt" >&2
    echo "Resolve conflicts, then run: git add <files> && git commit" >&2
    exit 2
  fi
  echo "Base branch merged cleanly but not committed. Review, test, then commit if appropriate."
fi

echo "Done. Start with: ${out_dir}/next_steps.md"
