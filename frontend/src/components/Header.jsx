import { Moon, Sun, RotateCcw } from "lucide-react";

export default function Header({ theme, onToggleTheme, showReset, onReset }) {
  return (
    <header className="app-header">
      <div className="app-header__brand">
        <span className="app-header__mark" aria-hidden="true">
          ✦
        </span>
        <span>
          Way<em>point</em>
        </span>
      </div>
      <div className="app-header__actions">
        {showReset && (
          <button type="button" className="btn btn--ghost btn--small" onClick={onReset}>
            <RotateCcw size={14} /> New trip
          </button>
        )}
        <button
          type="button"
          className="icon-btn icon-btn--large"
          onClick={onToggleTheme}
          aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          title="Toggle theme"
        >
          {theme === "dark" ? <Sun size={17} /> : <Moon size={17} />}
        </button>
      </div>
    </header>
  );
}
