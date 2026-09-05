# H3 Max Director

English storefront and creator experience for [h3maxdirector.lol](https://h3maxdirector.lol).

## Stack

- Next.js 16, React 19, TypeScript, and Tailwind CSS
- Better Auth with Google-only sign in
- Creem subscription integration (sandbox-ready configuration)
- SQLite / Drizzle for local development

## Local development

```bash
pnpm install
cp .env.example .env.local
pnpm dev --hostname 0.0.0.0 --port 3003
```

## Checks

```bash
pnpm lint
pnpm build
BASE_URL=http://127.0.0.1:3003 node tests/h3max-ui-check.cjs
BASE_URL=http://127.0.0.1:3003 node tests/h3max-cta-gate.cjs
```

## License

This repository is not intended for public redistribution. See [LICENSE](./LICENSE).
