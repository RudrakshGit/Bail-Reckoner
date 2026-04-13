function normalizeSectionsInput(raw) {
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

function replaceLastToken(raw, nextToken) {
  const parts = raw.split(",");
  if (parts.length === 0) return nextToken;
  parts[parts.length - 1] = ` ${nextToken}`;
  return parts
    .map((p) => p.trim())
    .filter(Boolean)
    .join(", ");
}

export default function SectionChips({ value, onChange, placeholder, suggestions = [] }) {
  const sections = normalizeSectionsInput(value);

  return (
    <div>
      <input
        className="uiInput"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />

      {suggestions.length > 0 ? (
        <div className="uiSuggest">
          {suggestions.slice(0, 8).map((s) => (
            <button
              type="button"
              className="uiSuggestItem"
              key={`${s.act}:${s.sectionNumber}`}
              onClick={() => onChange(replaceLastToken(value, s.sectionNumber))}
              title={s.offenceName || s.sectionNumber}
            >
              <span className="uiSuggestMain">{s.sectionNumber}</span>
              <span className="uiSuggestSub">{s.act}</span>
            </button>
          ))}
        </div>
      ) : null}

      {sections.length > 0 ? (
        <div className="uiChips">
          {sections.slice(0, 12).map((s) => (
            <span className="uiChip" key={s}>
              {s}
            </span>
          ))}
          {sections.length > 12 ? (
            <span className="uiChip uiChipMuted">+{sections.length - 12} more</span>
          ) : null}
        </div>
      ) : (
        <div className="uiEmptyHint">Tip: separate multiple sections with commas.</div>
      )}
    </div>
  );
}

export { normalizeSectionsInput };

