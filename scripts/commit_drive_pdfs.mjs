import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

function runGit(args) {
  const result = spawnSync("git", args, { encoding: "utf8" });
  if (result.error) throw result.error;
  return {
    status: result.status ?? 1,
    stdout: result.stdout ?? "",
    stderr: result.stderr ?? "",
  };
}

function runChecked(run, args) {
  const result = run(args);
  if (result.status !== 0) {
    throw new Error(`git ${args.join(" ")} failed:\n${result.stderr || result.stdout}`);
  }
  return result;
}

export function commitDrivePdfs({
  run = runGit,
  log = console.log,
  branch = process.env.GITHUB_REF_NAME || "main",
  maxPushAttempts = 3,
} = {}) {
  runChecked(run, ["config", "user.name", "github-actions[bot]"]);
  runChecked(run, ["config", "user.email", "41898282+github-actions[bot]@users.noreply.github.com"]);
  runChecked(run, ["add", "--", "public/documents"]);

  const stagedDiff = run(["diff", "--cached", "--quiet"]);
  if (stagedDiff.status === 0) {
    log("No document changes to commit.");
    return { committed: false, pushed: false };
  }
  if (stagedDiff.status !== 1) {
    throw new Error(`git diff --cached --quiet failed:\n${stagedDiff.stderr || stagedDiff.stdout}`);
  }

  runChecked(run, ["commit", "-m", "Sync public Google Drive PDFs"]);

  for (let attempt = 1; attempt <= maxPushAttempts; attempt += 1) {
    const push = run(["push", "origin", `HEAD:${branch}`]);
    if (push.status === 0) return { committed: true, pushed: true };
    if (attempt === maxPushAttempts) {
      throw new Error(
        `Could not push Drive PDF sync after ${maxPushAttempts} attempts:\n${push.stderr || push.stdout}`,
      );
    }

    log(`Push attempt ${attempt} failed; fetching ${branch} and rebasing before retry.`);
    runChecked(run, ["fetch", "origin", branch]);
    const rebase = run(["rebase", `origin/${branch}`]);
    if (rebase.status !== 0) {
      run(["rebase", "--abort"]);
      throw new Error(
        `Could not rebase the Drive PDF sync on origin/${branch}:\n${rebase.stderr || rebase.stdout}`,
      );
    }
  }

  throw new Error("Drive PDF sync push loop ended unexpectedly.");
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    commitDrivePdfs();
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
