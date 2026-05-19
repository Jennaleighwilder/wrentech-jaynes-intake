# WrenTech Jaynes Intake

Client discovery intake form for Jaynes Flooring (Scott Jaynes). Multi-step questionnaire for website + worker portal scoping.

## Live URL

Deploy with Vercel — share the URL with your client. Every submission is saved to a GitHub Gist collection so responses are never lost.

## How submissions work

1. Client completes all 7 steps and clicks **Submit intake**
2. Raw answers POST to `/api/submit`
3. API appends the submission to `jaynes-intake-collection.json` in a private GitHub Gist
4. If `ANTHROPIC_API_KEY` is set, a project summary is generated server-side and shown on the thank-you screen

**View submissions:** https://gist.github.com/Jennaleighwilder/6938207d6a57fdb20b5bca456011ec32

## Vercel env vars

| Variable | Required | Purpose |
|----------|----------|---------|
| `GIST_ID` | Yes | `6938207d6a57fdb20b5bca456011ec32` |
| `GITHUB_TOKEN` | Yes | GitHub PAT with `gist` scope |
| `ANTHROPIC_API_KEY` | No | Generates AI project summary on submit |

## Local dev

```bash
npm install
npm run dev
```

For API routes locally, use `vercel dev` instead of `npm run dev`.

## Deploy

```bash
vercel --prod
```
