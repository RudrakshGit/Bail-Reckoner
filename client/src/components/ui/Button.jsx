export default function Button({ children, loading, variant = "primary", ...props }) {
  const className = ["uiBtn", variant === "secondary" ? "uiBtnSecondary" : ""]
    .filter(Boolean)
    .join(" ");

  return (
    <button className={className} {...props} disabled={props.disabled || loading}>
      {loading ? "Please wait…" : children}
    </button>
  );
}

