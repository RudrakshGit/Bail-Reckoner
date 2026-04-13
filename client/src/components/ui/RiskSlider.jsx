export default function RiskSlider({ value, onChange, label }) {
  const v = Number.isFinite(Number(value)) ? Number(value) : 0;

  return (
    <div className="uiSliderWrap">
      <div className="uiSliderTop">
        <div className="uiSliderLabel">{label}</div>
        <div className="uiSliderValue">{v}</div>
      </div>
      <input
        className="uiSlider"
        type="range"
        min={0}
        max={10}
        step={1}
        value={v}
        onChange={(e) => onChange(Number(e.target.value))}
      />
      <div className="uiSliderTicks">
        <span>0</span>
        <span>5</span>
        <span>10</span>
      </div>
    </div>
  );
}

