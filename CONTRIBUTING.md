# Contributing to EulerBeats CLI

Love EulerBeats and want to get involved? Thank you! ♥️

This document contains some tips on how to collaborate in this project.

## Filing an issue

If you find a bug or want to propose a new feature, please [open an issue](https://github.com/EulerBeats/eulerbeats-cli/issues/new). Pull requests are always welcome; however, we recommend you discuss it in an issue first, especially for big changes. This helps make the contribution process straightforward and effective for everyone involved.

## Project structure

```
├── CONTRIBUTING.md   // This doc
├── README.md
├── package.json
├── src
│   ├── actions       // CLI command handlers
│   ├── config.ts     // CLI and RPC provider settings
│   ├── index.ts      // CLI entry point
│   ├── lib           // Functions that generally involve multiple contract queries or operate on larger sets of data
│   ├── types         // TypeScript types and contract interfaces
│   └── utils         // Atomic helper functions and values
├── tsconfig.json     // TypeScript config
└── yarn.lock
```

## Code linting/formatting

We use [typescript-eslint](https://github.com/typescript-eslint/typescript-eslint) and [prettier](https://prettier.io/) to lint and format all the code without any special configuration. You can use `yarn lint` and `yarn lint:fix` to run the linter/formatter. It's completely fine to commit non-prettied code and then reformat it in a later commit.

## Branching

We work on the branch [main](https://github.com/EulerBeats/eulerbeats-cli/tree/main). Please, branch from `main` when implementing a new feature or fixing a
bug, and use it as the base branch in pull requests.
