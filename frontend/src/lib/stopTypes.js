import { Camera, Utensils, Ticket, Bus, BedDouble, MapPin } from "lucide-react";

// Central place mapping the model's `type` enum to how a stop renders.
// Adding a new type the model might return is a one-line change here.
export const STOP_TYPES = {
  sightseeing: { label: "Sightseeing", icon: Camera, color: "var(--color-teal)" },
  food: { label: "Food & drink", icon: Utensils, color: "var(--color-accent)" },
  activity: { label: "Activity", icon: Ticket, color: "var(--color-plum)" },
  transport: { label: "Transport", icon: Bus, color: "var(--color-ink-soft)" },
  lodging: { label: "Lodging", icon: BedDouble, color: "var(--color-teal-dark)" },
  other: { label: "Stop", icon: MapPin, color: "var(--color-ink-soft)" },
};

export function stopTypeInfo(type) {
  return STOP_TYPES[type] || STOP_TYPES.other;
}
