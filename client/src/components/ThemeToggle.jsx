export default function ThemeToggle({ theme, onToggle }) {
  const nextLabel = theme === "dark" ? "light" : "dark";

  return (
    <button
      type="button"
      className="themeToggle"
      onClick={onToggle}
      aria-label={`Switch to ${nextLabel} theme`}
      aria-pressed={theme === "light"}
      title={`${theme === "dark" ? "Dark" : "Light"} theme (switch to ${nextLabel})`}
    >
      <span className="themeToggleTrack" data-theme={theme}>
        <span className="themeToggleMoon" aria-hidden />
        <span className="themeToggleDay" aria-hidden>☀</span>
        <span className="themeToggleKnob" />
      </span>
    </button>
  );
}
