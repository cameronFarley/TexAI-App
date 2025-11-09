# TEXAI Backend (Node + Express)

This lightweight proxy keeps your OpenAI key off user devices and prevents client-side rate limits. The React Native app now calls this backend at `/chat`.

## 1. Setup

```bash
cd server
cp .env   # add your OpenAI API key here
npm install
npm run dev            # starts on http://localhost:4000
```

## 2. Environment variables

| Name                     | Required | Description                                                                 |
| ------------------------ | -------- | --------------------------------------------------------------------------- |
| `OPENAI_API_KEY`         | ✅       | Secret key from https://platform.openai.com                                 |
| `PORT`                   | ❌       | Defaults to `4000`                                                          |
| `ALLOWED_ORIGIN`         | ❌       | CORS allowlist, defaults to `*`                                             |
| `OPENAI_MIN_INTERVAL_MS` | ❌       | Minimum ms between OpenAI calls (default `2500` to avoid free-tier limits) |

## 3. Deploying

This server is a single `node server.js` process and can be deployed to:

- [Railway](https://railway.app) / [Render](https://render.com)
- Fly.io / AWS Elastic Beanstalk
- Any container platform (Dockerfile: `FROM node:20-alpine`, copy files, `npm install`, `npm run dev`)

Expose the `OPENAI_API_KEY` env var, and set the public URL inside `config/environment.ts` in the React Native app.

## 4. Why a backend?

- Keeps API secrets off devices and out of source control
- Avoids OpenAI per-device/IP rate limits
- Adds retries, logging, and a single place to integrate future features (RAG, scenario scoring, audit logs, etc.)
