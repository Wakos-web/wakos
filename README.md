# Freebuff Desktop

A full-stack web application built with TanStack Start, React, and Tailwind CSS.

## Development

Requires Node.js 22+ and Bun.

```sh
git clone <this-repository-url>
cd <repository-name>
bun install
bun run dev
```

## Deployment

Hosted on **Cloudflare Workers** (TanStack Start → Nitro `cloudflare-module`), deployed automatically from git:

| Branch  | Environment | Worker       | URL |
|---------|-------------|--------------|-----|
| `master`| production  | `wacos`      | https://wacos.mmwosasocials.workers.dev |
| `stg`   | preview     | `wacos-stg`  | https://wacos-stg.mmwosasocials.workers.dev |

Pushing to `master` or `stg` triggers [.github/workflows/deploy.yml](.github/workflows/deploy.yml) (build → `wrangler deploy` → sync secrets → smoke test). Deployment environments `production` and `preview` on GitHub are branch-pinned accordingly.

Local deploys (require `CLOUDFLARE_API_TOKEN`):

```sh
bun run deploy        # build + deploy production
bun run deploy:stg    # build + deploy preview
bun run secrets:sync  # push .env.local secrets to both Workers
```

Runtime secrets (`SUPABASE_SERVICE_ROLE_KEY`, `RESEND_API_KEY`, `ADMIN_SECRET`, `ADMIN_SESSION_KEY`) are Cloudflare Workers secrets — never committed. See [.env.example](.env.example).
