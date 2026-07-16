export function LoadingState() {
  return (
    <div className="status-panel status-panel--loading" role="status" aria-live="polite">
      <div className="route-spinner" aria-hidden="true">
        <span className="route-spinner__dot" />
        <span className="route-spinner__dot" />
        <span className="route-spinner__dot" />
      </div>
      <p>Mapping out the route…</p>
    </div>
  );
}

export function ErrorState({ message, onRetry, details }) {
  return (
    <div className="status-panel status-panel--error" role="alert">
      <p className="status-panel__title">The itinerary didn't come together.</p>
      <p className="status-panel__message">{message}</p>
      {details?.length > 0 && (
        <ul className="status-panel__details">
          {details.map((d, i) => (
            <li key={i}>{d}</li>
          ))}
        </ul>
      )}
      <button type="button" className="btn btn--primary" onClick={onRetry}>
        Try again
      </button>
    </div>
  );
}

export function EmptyState() {
  return (
    <div className="status-panel status-panel--empty">
      <p className="status-panel__title">No trip planned yet.</p>
      <p className="status-panel__message">
        Describe a trip above and Waypoint will lay out a day-by-day plan you can rearrange, trim, and extend.
      </p>
    </div>
  );
}
