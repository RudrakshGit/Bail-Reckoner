export default function FormField({ label, hint, children }) {
  return (
    <div className="uiField">
      <label className="uiLabel">
        <span>{label}</span>
        {hint ? <span className="uiHint">{hint}</span> : null}
      </label>
      {children}
    </div>
  );
}

