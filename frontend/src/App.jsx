import { useEffect, useState } from "react";
import Header from "./components/Header.jsx";
import TripForm from "./components/TripForm.jsx";
import Itinerary from "./components/Itinerary.jsx";
import { LoadingState, ErrorState, EmptyState } from "./components/StatusStates.jsx";
import { useTripPlanner } from "./hooks/useTripPlanner.js";

function getInitialTheme() {
  const saved = localStorage.getItem("trip-planner:theme");
  if (saved === "light" || saved === "dark") return saved;
  return window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export default function App() {
  const [theme, setTheme] = useState(getInitialTheme);
  const { status, data, error, lastPrompt, submit, retry, startNewTrip, updateData } = useTripPlanner();

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem("trip-planner:theme", theme);
  }, [theme]);

  const hasResult = status === "success" && data;

  return (
    <div className="app-shell">
      <Header
        theme={theme}
        onToggleTheme={() => setTheme((t) => (t === "dark" ? "light" : "dark"))}
        showReset={hasResult}
        onReset={startNewTrip}
      />

      <main className="app-main">
        {!hasResult && (
          <TripForm onSubmit={submit} disabled={status === "loading"} initialValue={lastPrompt} />
        )}

        {status === "loading" && <LoadingState />}
        {status === "error" && <ErrorState message={error} onRetry={retry} />}
        {status === "idle" && <EmptyState />}
        {hasResult && <Itinerary data={data} onUpdateData={updateData} />}
      </main>

      <footer className="app-footer">
        <p>Waypoint plans with AI — double-check opening hours and bookings before you go.</p>
      </footer>
    </div>
  );
}
