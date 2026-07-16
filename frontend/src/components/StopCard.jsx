import { ChevronUp, ChevronDown, X } from "lucide-react";
import { stopTypeInfo } from "../lib/stopTypes.js";

export default function StopCard({ stop, isFirst, isLast, onMoveUp, onMoveDown, onRemove }) {
  const { label, icon: Icon, color } = stopTypeInfo(stop.type);

  return (
    <li className="stop-card">
      <div className="stop-card__marker" style={{ "--stop-color": color }} aria-hidden="true">
        <Icon size={15} strokeWidth={2.25} />
      </div>

      <div className="stop-card__body">
        <div className="stop-card__meta">
          <span className="stop-card__type" style={{ "--stop-color": color }}>
            {label}
          </span>
          {stop.time_of_day && <span className="stop-card__time">{stop.time_of_day}</span>}
          {stop.duration && <span className="stop-card__duration">{stop.duration}</span>}
        </div>
        <h4 className="stop-card__name">{stop.name}</h4>
        {stop.description && <p className="stop-card__description">{stop.description}</p>}
      </div>

      <div className="stop-card__controls">
        <button
          type="button"
          className="icon-btn"
          onClick={onMoveUp}
          disabled={isFirst}
          aria-label={`Move ${stop.name} earlier`}
          title="Move up"
        >
          <ChevronUp size={16} />
        </button>
        <button
          type="button"
          className="icon-btn"
          onClick={onMoveDown}
          disabled={isLast}
          aria-label={`Move ${stop.name} later`}
          title="Move down"
        >
          <ChevronDown size={16} />
        </button>
        <button
          type="button"
          className="icon-btn icon-btn--danger"
          onClick={onRemove}
          aria-label={`Remove ${stop.name}`}
          title="Remove stop"
        >
          <X size={16} />
        </button>
      </div>
    </li>
  );
}
