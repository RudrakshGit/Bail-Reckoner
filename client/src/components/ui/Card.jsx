export default function Card({ title, subtitle, children, onClear, clearLabel = "Clear" }) {
  return (
    <article className="uiCard">
      {title || subtitle ? (
        <header className="uiCardHeader">
          {title ? <h2 className="uiCardTitle">{title}</h2> : null}
          {subtitle ? <p className="uiCardSubtitle">{subtitle}</p> : null}
        </header>
      ) : null}
      <div className="uiCardBody">
        {onClear ? (
          <div className="uiCardAction">
            <button type="button" className="uiCardClearBtn" onClick={onClear}>
              {clearLabel}
            </button>
          </div>
        ) : null}
        {children}
      </div>
    </article>
  );
}
