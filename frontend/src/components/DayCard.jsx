import { useState } from "react";
import { ChevronDown, Plus } from "lucide-react";
import StopCard from "./StopCard.jsx";

export default function DayCard({ day, index, expanded, onToggle, onReorderStop, onRemoveStop, onAddStop }) {
  const [addingStop, setAddingStop] = useState(false);
  const [newStopName, setNewStopName] = useState("");

  function handleAddStop(e) {
    e.preventDefault();
    if (!newStopName.trim()) return;
    onAddStop({
      id: `${day.id}-stop-custom-${Date.now()}`,
      name: newStopName.trim(),
      type: "other",
      time_of_day: "afternoon",
      duration: "",
      description: "Added by you.",
    });
    setNewStopName("");
    setAddingStop(false);
  }

  return (
    <section className={`day-card ${expanded ? "day-card--expanded" : ""}`}>
      <button
        type="button"
        className="day-card__header"
        onClick={onToggle}
        aria-expanded={expanded}
      >
        <span className="day-card__number">Day {day.day_number ?? index + 1}</span>
        <span className="day-card__theme">{day.theme}</span>
        <ChevronDown className="day-card__chevron" size={18} aria-hidden="true" />
      </button>

      {expanded && (
        <div className="day-card__content">
          <ol className="route-line">
            {day.stops.map((stop, sIdx) => (
              <StopCard
                key={stop.id}
                stop={stop}
                isFirst={sIdx === 0}
                isLast={sIdx === day.stops.length - 1}
                onMoveUp={() => onReorderStop(sIdx, sIdx - 1)}
                onMoveDown={() => onReorderStop(sIdx, sIdx + 1)}
                onRemove={() => onRemoveStop(sIdx)}
              />
            ))}
          </ol>

          {day.stops.length === 0 && (
            <p className="day-card__empty">No stops left on this day.</p>
          )}

          {addingStop ? (
            <form className="add-stop-form" onSubmit={handleAddStop}>
              <input
                type="text"
                autoFocus
                placeholder="e.g. Sunset at Miradouro da Graça"
                value={newStopName}
                onChange={(e) => setNewStopName(e.target.value)}
              />
              <button type="submit" className="btn btn--small btn--primary">
                Add
              </button>
              <button
                type="button"
                className="btn btn--small btn--ghost"
                onClick={() => {
                  setAddingStop(false);
                  setNewStopName("");
                }}
              >
                Cancel
              </button>
            </form>
          ) : (
            <button type="button" className="add-stop-trigger" onClick={() => setAddingStop(true)}>
              <Plus size={14} /> Add a stop
            </button>
          )}
        </div>
      )}
    </section>
  );
}
