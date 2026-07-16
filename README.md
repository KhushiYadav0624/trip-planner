# Waypoint — AI Trip Planner

A small React app that turns a free-form trip description into a structured,
editable day-by-day itinerary. Built for the frontend internship assignment.

Not a chatbot: the model is forced (via Anthropic tool-use) to return
structured JSON matching a fixed schema, which the frontend parses into
interactive cards — expand/collapse days, reorder stops, remove stops, add
your own stops.

## Stack

- **Frontend:** React 18 + Vite, plain CSS (no framework), `lucide-react` for icons.
- **Backend:** Express, on a separate small server so the API key never reaches the browser.
- **AI:** Anthropic's Messages API, using **tool-use with a forced `tool_choice`** as the structured-output mechanism (see "How structured output works" below). Model is configurable via `.env`.

## Project layout

```
trip-planner/
├── backend/           # Express server, calls the LLM, validates its output
│   ├── server.js
│   └── .env.example
└── frontend/           # Vite + React app
    └── src/
        ├── App.jsx
        ├── components/
        ├── hooks/useTripPlanner.js   # request lifecycle, retries, session persistence
        └── lib/
```

## Setup

Requires Node 18+.

```bash
npm install
cp backend/.env.example backend/.env
# then edit backend/.env and add ANTHROPIC_API_KEY=sk-ant-...
npm start
```

`npm start` (from the repo root) uses npm workspaces to boot **both** the
Express backend (port 8787) and the Vite dev server (port 5173) together.
Open **http://localhost:5173**. Vite proxies `/api/*` to the backend in dev,
so the browser only ever talks to `localhost:5173`.

If you'd rather run them separately: `npm run backend` and `npm run frontend`
in two terminals.

### Using a different provider

The assignment allows any provider. Only `backend/server.js` needs to
change — the frontend just calls `POST /api/plan-trip` and expects the JSON
shape described below, so it's provider-agnostic. To swap in OpenAI, Gemini,
Groq, or a local Ollama model: replace the `anthropic.messages.create(...)`
call with that provider's SDK, and use its equivalent of forced structured
output (OpenAI: `response_format: { type: "json_schema" }` or a forced tool
call; Gemini: `responseSchema`; Groq: JSON mode; Ollama: `format: "json"` in
the request, with more validation, since local models are less reliable at
sticking to a schema).

## How structured output works

Rather than prompting "please respond with JSON" (which models sometimes
ignore, wrap in markdown fences, or subtly malform), the backend defines an
`input_schema` for a `build_itinerary` tool and sets
`tool_choice: { type: "tool", name: "build_itinerary" }`. This forces the
model's only possible response to be a call to that tool with arguments
matching the schema — no free text, no parsing markdown fences out of a
string.

That gets you *shape-valid JSON*, but not necessarily *semantically correct*
JSON (an enum could be slightly off, a required field could be an empty
string). The backend runs a second manual validation pass
(`validateItinerary` in `server.js`) that:

- Rejects the response if structurally required fields (`days`, `stops`,
  `name`, etc.) are missing.
- Coerces recoverable issues (bad `type`/`time_of_day` enum values) to safe
  defaults instead of failing the whole request over one bad field.
- On rejection, retries **once**, telling the model exactly what was wrong
  with its previous attempt, before giving up and returning a `422` with
  details.

## Handling bad AI output (the part most of the grading weight is on)

- **Malformed / wrong-shape JSON:** caught by `validateItinerary` server-side;
  one automatic corrective retry, then a clear error surfaced to the UI with
  a "Try again" button.
- **Model doesn't call the tool at all:** treated the same as invalid output
  and retried.
- **Empty input:** rejected before ever calling the model (400).
- **Slow / hanging requests:** a 30s `AbortController` timeout on the
  Anthropic call, surfaced as "The model took too long."
- **Provider errors** (401/429/network): mapped to specific, human-readable
  messages instead of a raw stack trace.
- **Stale responses overwriting fresh ones:** `useTripPlanner` aborts the
  previous in-flight request when a new one starts, *and* keeps a
  monotonically increasing request-id ref so that even if an old request's
  promise resolves after a newer one, its result is discarded rather than
  clobbering the current state.
- **No crashes on bad data:** every field the UI reads from the model's
  output has a fallback (`stop.duration || ""`, unknown `type` values render
  as a generic "Stop" icon rather than breaking).

## Interactivity

- Expand/collapse each day.
- Reorder stops within a day (up/down — chosen over drag-and-drop for
  reliable touch/mobile support without an extra dependency).
- Remove a stop.
- Add a custom stop to any day.
- All edits persist to `localStorage`, so a refresh doesn't lose your trip
  (see "Stretch" below).

## Stretch goals attempted

- ✅ **Different block types rendered differently** — `stopTypes.js` maps the
  model's `type` enum (sightseeing/food/activity/transport/lodging/other) to
  a distinct icon and color.
- ✅ **Save and reload sessions** — the current prompt + itinerary (including
  your edits) is saved to `localStorage` and restored on reload; "New trip"
  clears it.
- ✅ **Polish** — dark mode (persisted, respects `prefers-color-scheme` on
  first load), reduced-motion support, visible keyboard focus states.
- ❌ **Streaming** — not implemented. Tool-use responses in the Anthropic API
  can be streamed, but reliably parsing partial/incomplete JSON mid-stream
  into the UI adds real complexity, and I prioritized failure-handling
  robustness over this given the time budget. Next step: buffer the stream
  and incrementally render only *complete* stops as they close.
- ❌ **Refinement loop** ("make day 2 more relaxed") — not implemented. The
  backend would need to send the previous itinerary back as context and ask
  for a targeted edit rather than a full regeneration. Next step: add a
  `PATCH /api/plan-trip` that includes the current itinerary JSON + a new
  instruction in the prompt.

## Known limitations

- No authentication or per-user storage — sessions live in the browser's
  `localStorage` only, one trip at a time.
- The model can still invent inaccurate details (hours, prices, whether a
  place currently exists) — there's no fact-checking layer, which is why the
  footer includes a disclaimer.
- Reordering/removing stops is local UI state only; it doesn't re-prompt the
  model, so it won't rebalance timing across the day automatically.
- No automated tests yet — given the time box, I prioritized the failure-
  handling paths (the thing the assignment weights most heavily) over test
  coverage.

## AI-usage note

I used Claude (Anthropic) as a coding assistant throughout — scaffolding the
project structure, writing the Express/tool-use backend, the React
components, and this README. I made the structural decisions myself
(separate backend to protect the API key, tool-use for forced structured
output, up/down reordering over drag-and-drop, localStorage over a real
backend for session persistence given the "no auth needed" scope) and
reviewed/adjusted the generated code rather than pasting it in blind. Being
asked to explain and extend it live is expected, so I made sure I understand
each piece rather than just that it runs.

## Time spent

~8 hours (setup + core flow + failure handling + interactivity + stretch
goals + README).
