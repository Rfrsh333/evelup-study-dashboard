# LevelUp Study Dashboard

The runnable web app lives in `app/`.

## Run from repo root

Use these commands from `~/Desktop/levelup-study-dashboard`:

```bash
npm run dev
npm run dev:e2e
npm run build
npm run e2e:dashboard
npm run e2e
```

These root scripts forward to `app/package.json` via `npm --prefix app run ...`, so you can stay in repo root without ENOENT errors.

## Notes

- App source and dependencies are managed in `app/`.
- GitHub Actions CI already runs with `working-directory: app` and is unchanged.
