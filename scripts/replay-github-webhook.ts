import { createHmac } from "crypto";
import { readFile } from "fs/promises";
import path from "path";

type ReplayTarget = {
  event: string;
  fixture: string;
};

const defaultTargets: ReplayTarget[] = [
  { event: "pull_request", fixture: "pull_request.opened.json" },
  { event: "check_run", fixture: "check_run.completed-success.json" },
  { event: "pull_request", fixture: "pull_request.closed-merged.json" }
];

const webhookUrl =
  process.env.WEBHOOK_REPLAY_URL ?? "http://localhost:3000/api/github/webhook";
const webhookSecret = process.env.GITHUB_WEBHOOK_SECRET;
const fixtureDir = path.join(process.cwd(), "scripts", "github-webhook-fixtures");
const requestedFixture = process.argv[2];
const targets = requestedFixture
  ? [targetFromFixture(requestedFixture)]
  : defaultTargets;

async function main() {
  for (const target of targets) {
    const body = await readFile(path.join(fixtureDir, target.fixture), "utf8");
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-github-event": target.event,
        ...(webhookSecret
          ? { "x-hub-signature-256": signBody(body, webhookSecret) }
          : {})
      },
      body
    });
    const payload = await response.text();

    console.log(
      `${target.event} ${target.fixture}: ${response.status} ${response.statusText}`
    );
    console.log(payload);

    if (!response.ok) {
      process.exitCode = 1;
      return;
    }
  }
}

function targetFromFixture(fixture: string): ReplayTarget {
  if (fixture.startsWith("pull_request.")) {
    return { event: "pull_request", fixture };
  }

  if (fixture.startsWith("check_run.")) {
    return { event: "check_run", fixture };
  }

  if (fixture.startsWith("check_suite.")) {
    return { event: "check_suite", fixture };
  }

  if (fixture.startsWith("workflow_run.")) {
    return { event: "workflow_run", fixture };
  }

  throw new Error(`Cannot infer GitHub event from fixture: ${fixture}`);
}

function signBody(body: string, secret: string) {
  return `sha256=${createHmac("sha256", secret).update(body).digest("hex")}`;
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
