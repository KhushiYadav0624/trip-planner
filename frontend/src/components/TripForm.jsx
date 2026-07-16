import { useState } from "react";

const EXAMPLES = [
  "5 days in Lisbon, food-focused, no early mornings",
  "Long weekend road trip through the Scottish Highlands",
  "3 days in Kyoto with my parents, easy pace, temples and gardens",
];

export default function TripForm({ onSubmit, disabled, initialValue = "" }) {
  const [value, setValue] = useState(initialValue);

  function handleSubmit(e) {
    e.preventDefault();
    if (!value.trim() || disabled) return;
    onSubmit(value);
  }

  return (
    <form className="trip-form" onSubmit={handleSubmit}>
      <label htmlFor="trip-prompt" className="trip-form__label">
        Where are you headed?
      </label>
      <textarea
        id="trip-prompt"
        className="trip-form__textarea"
        placeholder="Describe the trip — destination, length, pace, who's coming, what you love..."
        value={value}
        onChange={(e) => setValue(e.target.value)}
        rows={3}
        maxLength={2000}
        disabled={disabled}
      />
      <div className="trip-form__row">
        <div className="trip-form__examples">
          {EXAMPLES.map((ex) => (
            <button
              type="button"
              key={ex}
              className="chip"
              onClick={() => setValue(ex)}
              disabled={disabled}
            >
              {ex}
            </button>
          ))}
        </div>
        <button type="submit" className="btn btn--primary" disabled={disabled || !value.trim()}>
          {disabled ? "Planning…" : "Plan the trip"}
        </button>
      </div>
    </form>
  );
}
