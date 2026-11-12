import assert from "node:assert/strict";
import test from "node:test";
import { commitDrivePdfs } from "../scripts/commit_drive_pdfs.mjs";

function result(status = 0, stdout = "", stderr = "") {
  return { status, stdout, stderr };
}

test("Drive sync skips commit and push when the export has no changes", () => {
  const commands = [];
  const logs = [];
  const run = (args) => {
    commands.push(args);
    return args[0] === "diff" ? result(0) : result();
  };

  assert.deepEqual(commitDrivePdfs({ run, log: (message) => logs.push(message) }), {
    committed: false,
    pushed: false,
  });
  assert.ok(commands.some(([command]) => command === "add"));
  assert.ok(!commands.some(([command]) => command === "commit" || command === "push"));
  assert.deepEqual(logs, ["No document changes to commit."]);
});

test("Drive sync rebases on a concurrent main update and retries the push", () => {
  const commands = [];
  let pushAttempts = 0;
  const run = (args) => {
    commands.push(args);
    if (args[0] === "diff") return result(1);
    if (args[0] === "push" && pushAttempts++ === 0) {
      return result(1, "", "rejected: fetch first");
    }
    return result();
  };

  assert.deepEqual(commitDrivePdfs({ run, log() {}, branch: "main" }), {
    committed: true,
    pushed: true,
  });
  assert.deepEqual(commands.filter(([command]) => command === "push"), [
    ["push", "origin", "HEAD:main"],
    ["push", "origin", "HEAD:main"],
  ]);
  assert.ok(commands.some((args) => args.join(" ") === "fetch origin main"));
  assert.ok(commands.some((args) => args.join(" ") === "rebase origin/main"));
});

test("Drive sync aborts a conflicting rebase instead of force pushing", () => {
  const commands = [];
  const run = (args) => {
    commands.push(args);
    if (args[0] === "diff") return result(1);
    if (args[0] === "push") return result(1, "", "rejected: fetch first");
    if (args[0] === "rebase" && args[1] !== "--abort") return result(1, "", "conflict");
    return result();
  };

  assert.throws(() => commitDrivePdfs({ run, log() {} }), /Could not rebase the Drive PDF sync/);
  assert.ok(commands.some((args) => args.join(" ") === "rebase --abort"));
  assert.ok(!commands.flat().some((argument) => argument.includes("--force")));
});

test("Drive sync reports a persistent push failure after the bounded retries", () => {
  const commands = [];
  const run = (args) => {
    commands.push(args);
    if (args[0] === "diff") return result(1);
    if (args[0] === "push") return result(1, "", "remote unavailable");
    return result();
  };

  assert.throws(() => commitDrivePdfs({ run, log() {}, maxPushAttempts: 3 }), /after 3 attempts/);
  assert.equal(commands.filter(([command]) => command === "push").length, 3);
  assert.equal(commands.filter(([command]) => command === "fetch").length, 2);
});
