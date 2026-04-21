export default function ThemeToggle({ theme, onToggle }) {
  const nextLabel = theme === "dark" ? "light" : "dark";

  return (
    <button
      type="button"
      className="themeToggle"
      onClick={onToggle}
      aria-label={`Switch to ${nextLabel} theme`}
      title={`Current: ${theme === "dark" ? "Dark" : "Light"} theme`}
    >
      {theme === "dark" ? (
        <span className="themeIcon themeMoon" aria-hidden="true">🌙</span>
      ) : (
        <span className="themeIcon themeSun" aria-hidden="true">☀️</span>
      )}
    </button>
  );
}
