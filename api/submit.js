function json(res, status, body) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.end(JSON.stringify(body));
}

function requireEnv(name) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing ${name}`);
  return value;
}

async function github(path, options = {}) {
  const token = requireEnv("GITHUB_TOKEN");
  const response = await fetch(`https://api.github.com${path}`, {
    ...options,
    headers: {
      Accept: "application/vnd.github+json",
      "Content-Type": "application/json",
      "X-GitHub-Api-Version": "2022-11-28",
      Authorization: `Bearer ${token}`,
      ...(options.headers || {}),
    },
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`GitHub ${response.status}: ${text}`);
  }
  return response.json();
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let raw = "";
    req.on("data", (chunk) => {
      raw += chunk;
      if (raw.length > 2_000_000) {
        reject(new Error("Body too large"));
        req.destroy();
      }
    });
    req.on("end", () => {
      try {
        resolve(raw ? JSON.parse(raw) : {});
      } catch (error) {
        reject(error);
      }
    });
    req.on("error", reject);
  });
}

async function generateSummary(intake) {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return null;

  const { biz, team, site, pages, portal, timeline } = intake;
  const prompt = `You are preparing a project summary for WrenTech (wrentech.net), owned by Jennifer Leigh West, based on a client discovery intake. The client, ${biz?.ownerName || "the owner"} of ${biz?.bizName || "a flooring business"}, has no website currently — WrenTech is building them one from scratch, plus an employee/subcontractor portal (command center) for their installers and sales team.

INTAKE DATA: ${JSON.stringify(intake, null, 2)}

Generate a clean, professional PROJECT SUMMARY that Jennifer can use to scope the build. Format:

═══════════════════════════════════════
WRENTECH · PROJECT SUMMARY
${biz?.bizName || "Client"} · ${new Date().toLocaleDateString()}
Prepared by: Jennifer Leigh West, WrenTech
═══════════════════════════════════════

1. CLIENT OVERVIEW — who they are, what they do, team size, service area, what makes them different

2. DELIVERABLE ONE: CUSTOM WEBSITE
   - No website exists today — building from scratch
   - Client's goals and what success looks like
   - Recommended pages with brief rationale for each
   - Design direction (style, tone, colors)
   - Content needs (photos, copy, logo, reviews)
   - Key features (quote form, gallery, SEO, etc.)

3. DELIVERABLE TWO: WORKER PORTAL / COMMAND CENTER
   - Who uses it: subcontractor installers + salespeople + office staff
   - Login per employee with role-based access
   - Features: scheduling, job assignment, calendar, time-off requests, emergency notifications, lead tracking
   - Workflow: how a job goes from lead → scheduled → assigned → in progress → complete
   - Emergency flow: sick days, reschedules, crew changes
   - Mobile priority for field installers

4. TEAM ROSTER (from what's known so far — note any gaps)

5. RECOMMENDED TECH APPROACH (brief, non-technical language)

6. INVESTMENT SUMMARY — website + portal ranges based on stated budget

7. NEXT STEPS — 3 concrete actions

8. STILL NEEDED — what info is missing before the build starts

Be specific, warm, and professional. This is a local East Tennessee business — WrenTech values that relationship. No fluff, no filler.`;

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": key,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 2000,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Anthropic ${response.status}: ${text}`);
  }

  const data = await response.json();
  return data.content?.[0]?.text || null;
}

const FILE_NAME = "jaynes-intake-collection.json";

module.exports = async function handler(req, res) {
  try {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "POST,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    if (req.method === "OPTIONS") {
      res.statusCode = 204;
      return res.end();
    }

    if (req.method !== "POST") {
      return json(res, 405, { error: "Method not allowed" });
    }

    const intake = await readBody(req);
    if (!intake?.biz?.ownerName && !intake?.biz?.bizName && !intake?.biz?.email) {
      return json(res, 400, { error: "Please include at least a name, business name, or email." });
    }

    let summary = null;
    let summaryError = null;
    try {
      summary = await generateSummary(intake);
    } catch (error) {
      summaryError = error.message;
    }

    const submission = {
      id: crypto.randomUUID(),
      submittedAt: new Date().toISOString(),
      clientSlug: "jaynes-flooring",
      intake,
      summary,
      summaryError,
    };

    const gistId = requireEnv("GIST_ID");
    const gist = await github(`/gists/${gistId}`);
    const existingRaw = gist.files?.[FILE_NAME]?.content || "[]";
    let collection = [];
    try {
      collection = JSON.parse(existingRaw);
      if (!Array.isArray(collection)) collection = [];
    } catch {
      collection = [];
    }

    collection.push(submission);

    await github(`/gists/${gistId}`, {
      method: "PATCH",
      body: JSON.stringify({
        files: {
          [FILE_NAME]: {
            content: JSON.stringify(collection, null, 2),
          },
        },
      }),
    });

    return json(res, 200, {
      ok: true,
      id: submission.id,
      summary,
      saved: true,
    });
  } catch (error) {
    return json(res, 500, { error: error.message });
  }
};
