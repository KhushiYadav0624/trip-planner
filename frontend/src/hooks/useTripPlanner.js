import { useCallback, useEffect, useRef, useState } from "react";
import { planTrip } from "../lib/api.js";

const SESSION_KEY = "trip-planner:session";

function loadSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed?.data || !parsed?.prompt) return null;
    return parsed;
  } catch {
    // Corrupt or unreadable storage shouldn't crash the app — just ignore it.
    return null;
  }
}

function saveSession(prompt, data) {
  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify({ prompt, data }));
  } catch {
    // Storage can fail (quota, private browsing) — losing session persistence
    // isn't worth surfacing an error to the user for.
  }
}

function clearSession() {
  try {
    localStorage.removeItem(SESSION_KEY);
  } catch {
    /* ignore */
  }
}

export function useTripPlanner() {
  const [status, setStatus] = useState("idle"); // idle | loading | success | error
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [lastPrompt, setLastPrompt] = useState("");

  // Guards against a slow earlier request resolving *after* a newer one and
  // clobbering fresher data — abort() covers most cases, but this belt-and
  // -braces counter also protects against responses that land after abort
  // fires but before the fetch promise actually rejects.
  const requestIdRef = useRef(0);
  const abortRef = useRef(null);

  // Restore a previous session on first load, if there is one.
  useEffect(() => {
    const session = loadSession();
    if (session) {
      setData(session.data);
      setLastPrompt(session.prompt);
      setStatus("success");
    }
  }, []);

  const submit = useCallback(async (prompt) => {
    const trimmed = prompt.trim();
    if (!trimmed) return;

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    const requestId = ++requestIdRef.current;

    setStatus("loading");
    setError(null);
    setLastPrompt(trimmed);

    try {
      const result = await planTrip(trimmed, controller.signal);
      if (requestId !== requestIdRef.current) return; // a newer request has taken over
      setData(result);
      setStatus("success");
      saveSession(trimmed, result);
    } catch (err) {
      if (err.name === "AbortError") return; // superseded by a newer request
      if (requestId !== requestIdRef.current) return;
      setError(err.message || "Something went wrong.");
      setStatus("error");
    }
  }, []);

  const retry = useCallback(() => {
    if (lastPrompt) submit(lastPrompt);
  }, [lastPrompt, submit]);

  const startNewTrip = useCallback(() => {
    abortRef.current?.abort();
    clearSession();
    setData(null);
    setError(null);
    setLastPrompt("");
    setStatus("idle");
  }, []);

  // Lets the itinerary UI apply edits (reorder/remove/add stops) and have
  // them persisted, without every component needing to know about storage.
  const updateData = useCallback(
    (updater) => {
      setData((prev) => {
        const next = typeof updater === "function" ? updater(prev) : updater;
        if (next) saveSession(lastPrompt, next);
        return next;
      });
    },
    [lastPrompt]
  );

  return { status, data, error, lastPrompt, submit, retry, startNewTrip, updateData };
}
