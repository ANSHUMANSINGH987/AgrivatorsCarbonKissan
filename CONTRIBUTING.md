# Contributing to Carbon-Kisan Credit

Thank you for your interest in contributing! This document outlines how to report issues, propose features, and submit code.

---

## Table of Contents
- [Code of Conduct](#code-of-conduct)
- [Reporting Bugs](#reporting-bugs)
- [Suggesting Features](#suggesting-features)
- [Development Setup](#development-setup)
- [Submitting a Pull Request](#submitting-a-pull-request)
- [Branch Naming](#branch-naming)
- [Commit Style](#commit-style)
- [Code Style & Linting](#code-style--linting)
- [Areas Needing Help](#areas-needing-help)

---

## Code of Conduct

Be respectful and constructive. Harassment or discriminatory language of any kind will not be tolerated.

---

## Reporting Bugs

1. Search [existing issues](../../issues) to avoid duplicates.
2. Open a new issue with the label `bug`.
3. Include:
   - **Steps to reproduce** the problem
   - **Expected vs actual behaviour**
   - **Environment** (OS, Node version, browser if frontend)
   - Screenshots or logs if applicable

---

## Suggesting Features

1. Open an issue with the label `enhancement`.
2. Describe the **use case** and **why it belongs in this platform** before writing any code.
3. For AI/model changes, include a brief description of the data or methodology involved.

---

## Development Setup

See [`docs/setup/local-development.md`](docs/setup/local-development.md) for full instructions.

```bash
git clone https://github.com/your-org/carbon-kisan-credit.git
cd carbon-kisan-credit
cp .env.example .env        # Add API keys (Satellite, Payment, Notifications)
docker-compose up --build
```

**Prerequisites:** Node.js v18+ · Python 3.10+ · Docker & Docker Compose · PostgreSQL v14+

---

## Submitting a Pull Request

1. **Fork** the repository and create your branch from `main`.
2. **Make your changes** — keep the scope focused and the diff small.
3. **Write or update tests** for any logic you add or change.
4. **Run linting** before committing (see below).
5. **Commit** using the Conventional Commits format (see below).
6. **Push** to your fork and open a PR against `main`.
7. Fill in the PR template — describe what changed and why, and link the related issue.

PRs without a linked issue or clear description may be closed without review.

---

## Branch Naming

| Prefix | Use for |
|--------|---------|
| `feature/` | New functionality |
| `fix/` | Bug fixes |
| `docs/` | Documentation only |
| `refactor/` | Code restructuring without behaviour change |
| `chore/` | Tooling, dependencies, CI |

**Example:** `feature/carbon-score-chart`, `fix/payout-calculation-edge-case`

---

## Commit Style

This project follows [Conventional Commits](https://www.conventionalcommits.org/).

```
<type>: <short description>

# Examples
feat: add satellite data verification step to scoring pipeline
fix: correct farmer payout rounding on fractional credits
docs: update system architecture section in README
refactor: extract credit lifecycle logic into service module
chore: upgrade Stripe SDK to v12
```

**Types:** `feat` · `fix` · `docs` · `refactor` · `test` · `chore`

---

## Code Style & Linting

- **Backend (Python):** `black` + `flake8`. Run `make lint` before committing.
- **Frontend (JS/TS):** ESLint + Prettier. Run `npm run lint` in the frontend directory.
- CI will fail on lint errors — fix them locally first.

---

## Areas Needing Help

We especially welcome contributions in these areas:

- **AI Scoring Model** — improving carbon sequestration estimation accuracy (`ai-model` label)
- **Multilingual Farmer Dashboard** — Hindi and regional language support (`frontend` label)
- **Satellite Data Integration** — expanding supported data providers (`backend` label)
- **Test Coverage** — unit and integration tests across all microservices (`testing` label)
- **Documentation** — setup guides, API docs, and usage walkthroughs (`docs` label)

---

For questions, open a [GitHub Discussion](../../discussions) or email `maintainer@email.com`.
