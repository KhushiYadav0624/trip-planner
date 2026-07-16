/**
 * Thin wrapper around the one backend endpoint we call. Kept separate from
 * the hook so the fetch/error-shape logic is easy to unit test or swap out
 * on its own.
 */
export async function planTrip(prompt, signal) {
  let response;
  try {
    response = await fetch("/api/plan-trip", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt }),
      signal,
    });
  } catch (err) {
    if (err.name === "AbortError") throw err;
    // Network failure (backend not running, offline, CORS, etc).
    throw new Error("Can't reach the server. Is the backend running?");
  }

  let body = null;
  try {
    body = await response.json();
  } catch {
    // Non-JSON response body — fall through to the generic message below.
  }

  if (!response.ok) {
    throw new Error(body?.error || `Request failed (${response.status}).`);
  }

  return body;
}
