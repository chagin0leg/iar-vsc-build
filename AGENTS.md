# AGENTS.md

## Cursor Cloud specific instructions

This is a **VS Code extension** project ("IAR Build") written in TypeScript. Standard commands are documented in `package.json` scripts and `CONTRIBUTING.md`.

### Key setup caveat

The `iar-vsc-common` dependency uses an SSH git URL (`git@github.com:IARSystems/iar-vsc-common.git`). In Cloud Agent environments without SSH keys, configure git to use HTTPS before running `npm install`:

```sh
git config --global url."https://github.com/".insteadOf "git@github.com:"
```

### Quick reference

| Task | Command |
|------|---------|
| Install deps | `npm install` |
| Lint | `npm run lint` |
| Dev build (webpack) | `npm run webpack` |
| Production build | `npm run package` |
| TypeScript compile | `npm run test-compile` |
| Run all tests | `node out/tests/runTests.js` (after `npm run test-compile`) |

### Testing notes

- **Unit tests** (44 tests) pass without any external tools. They run inside a VS Code extension host downloaded by `@vscode/test-electron`.
- **Integration tests** require an IAR Embedded Workbench / Build Tools installation (proprietary, not available in Cloud Agent VMs). Expect 3 failures without it.
- **VS Code integration tests** additionally require the `iarsystems.iar-login` sibling extension. Expect all 10 to fail without it.
- Tests download VS Code Insiders automatically to `.vscode-test/` on first run.

### Pre-commit hooks

The `.husky/pre-commit` hook:

1. Checks that `iar-vsc-common` dependency source points to the public GitHub repo.
2. Validates MPLv2 license headers on all `.ts` files.
3. Runs `lint-staged` (ESLint on `.ts`, markdownlint on `.md`).
