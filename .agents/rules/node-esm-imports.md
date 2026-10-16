# TypeScript Module Imports with Node Native ESM

In this project, unit tests run under Node's native test runner (`node:test`).
- When importing internal files across `src/lib/` or `tests/`, always specify the file extension:
  - **Correct**: `import { getDb } from './db.ts';`
  - **Incorrect**: `import { getDb } from './db';`
- This prevents `ERR_MODULE_NOT_FOUND` during test execution while remaining fully compatible with Next.js bundling.
