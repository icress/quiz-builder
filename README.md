# Quiz Builder

Monorepo for a quiz-building app: a **React + TypeScript** SPA talks to a **FastAPI** API that persists quizzes in **SQLite** via **SQLAlchemy**.

## Tech stack

| Area | Technologies |
|------|----------------|
| Frontend | React 19, TypeScript, Vite, Tailwind CSS v4 (`@tailwindcss/vite`), Vitest, Testing Library, ESLint |
| Backend | Python 3.13, FastAPI, SQLAlchemy 2.x, SQLite (`quiz.db`), OpenAI SDK, pytest |

---

## Frontend (`client/`)

The UI is a single-page app built with **React** and **TypeScript**. It loads quiz data from the backend, renders questions and options, and surfaces explanations. Styling uses **Tailwind CSS v4** through the official Vite plugin. **Vitest** (with **jsdom** and **Testing Library**) covers component tests.

### How Vite sets up React and TypeScript

This project follows the standard **React + TypeScript + Vite** layout:

1. **Entry HTML** — `index.html` at the client root is the Vite entry. It mounts the app with a module script pointing at the TypeScript/React bootstrap:

   ```html
   <script type="module" src="/src/main.tsx"></script>
   ```

2. **`main.tsx`** — Creates the React root and renders `<App />` into `#root`.

3. **`vite.config.ts`** — `defineConfig` from `vitest/config` wires **[@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react)** so Vite compiles JSX/TSX and enables React Fast Refresh during `npm run dev`. The **[@tailwindcss/vite](https://tailwindcss.com/docs/installation/using-vite)** plugin processes Tailwind in the same pipeline. Vitest shares this config (`test.environment`, `setupFiles`, etc.).

4. **TypeScript** — `tsconfig.app.json` targets modern JS (`es2023`), uses **`moduleResolution: "bundler"`** (the mode Vite expects), **`jsx: "react-jsx"`**, and **`noEmit: true`** so the app is type-checked and transformed by Vite rather than emitted by `tsc` alone. The production build runs **`tsc -b`** first (see `package.json` `build` script), then **`vite build`** for the bundle.

5. **Scripts** — `vite` serves the dev server with HMR; `vite build` outputs to `dist/`; `vite preview` serves the production build locally.

---

## Backend (`server/`)

The API is implemented in **FastAPI**: REST-style routes for listing and saving quizzes, streaming endpoints where needed, and CORS for the SPA. **Pydantic** models validate request/response payloads (`schemas.py`). Quiz content is generated or enriched with the **OpenAI** Python SDK (`get_questions.py`, `explain_answer.py`).

**SQLite** is used as a file-backed database (`quiz.db` next to the app). **SQLAlchemy 2.0** defines declarative models (`models.py` — `Quiz`, `Question`, `Option`), and `database.py` builds a **`sqlite:///`** engine (with `check_same_thread=False` for compatibility with FastAPI’s threading model), a `SessionLocal` factory, and a **`get_db`** dependency that yields a session per request. On startup, the app lifespan runs **`Base.metadata.create_all`** and a small migration helper for additive schema changes.

### How `uv` sets up FastAPI, SQLite, and SQLAlchemy

**uv** is the Python toolchain for this service: it reads **`pyproject.toml`**, resolves and locks dependencies in **`uv.lock`**, and installs them into a project environment.

1. **Project metadata** — `[project]` declares the package name, Python requirement (`>=3.13`), and runtime dependencies: **`fastapi[standard]`**, **`sqlalchemy`**, **`openai`**, etc. SQLite support is included with Python; no extra driver package is required for the built-in `sqlite3` URL used by SQLAlchemy.

2. **Lockfile** — `uv lock` / `uv sync` records exact versions in `uv.lock` so installs are reproducible across machines and CI.

3. **Dev dependencies** — `[dependency-groups]` / `dev` holds **pytest** and **pytest-asyncio**; install with e.g. `uv sync --group dev`.

4. **Python version** — **`server/.python-version`** pins **3.13** so `uv` (and editors) pick the same interpreter.

5. **Running the app** — From `server/`, after `uv sync`, run the API with FastAPI’s CLI, for example: `uv run fastapi dev app.py` (or `uv run uvicorn app:app --reload`), depending on your preference.

---

## Quick start

**Frontend** (from `client/`):

```bash
npm install
npm run dev
```

**Backend** (from `server/`):

```bash
uv sync
uv run fastapi dev app.py
```

Ensure the backend URL and CORS settings match how you run the client. See `client/README.md` for more Vite- and ESLint-specific notes from the template.
