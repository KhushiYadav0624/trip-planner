import { useState } from "react";
import DayCard from "./DayCard.jsx";

export default function Itinerary({ data, onUpdateData }) {
  const [expandedIds, setExpandedIds] = useState(() => new Set(data.days.map((d) => d.id)));

  function toggleDay(dayId) {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      next.has(dayId) ? next.delete(dayId) : next.add(dayId);
      return next;
    });
  }

  function updateDayStops(dayIndex, updater) {
    onUpdateData((prev) => {
      const days = prev.days.map((day, idx) => {
        if (idx !== dayIndex) return day;
        return { ...day, stops: updater(day.stops) };
      });
      return { ...prev, days };
    });
  }

  function reorderStop(dayIndex, from, to) {
    if (to < 0) return;
    updateDayStops(dayIndex, (stops) => {
      if (to >= stops.length) return stops;
      const next = [...stops];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      return next;
    });
  }

  function removeStop(dayIndex, stopIndex) {
    updateDayStops(dayIndex, (stops) => stops.filter((_, i) => i !== stopIndex));
  }

  function addStop(dayIndex, stop) {
    updateDayStops(dayIndex, (stops) => [...stops, stop]);
  }

  return (
    <div className="itinerary">
      <header className="itinerary__header">
        <h2>{data.trip_title}</h2>
        {data.summary && <p className="itinerary__summary">{data.summary}</p>}
      </header>

      <div className="itinerary__days">
        {data.days.map((day, dIdx) => (
          <DayCard
            key={day.id}
            day={day}
            index={dIdx}
            expanded={expandedIds.has(day.id)}
            onToggle={() => toggleDay(day.id)}
            onReorderStop={(from, to) => reorderStop(dIdx, from, to)}
            onRemoveStop={(stopIdx) => removeStop(dIdx, stopIdx)}
            onAddStop={(stop) => addStop(dIdx, stop)}
          />
        ))}
      </div>
    </div>
  );
}
