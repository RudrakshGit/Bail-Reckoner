export default function StatusBadge({ eligible }) {
  const className = ["uiBadge", eligible ? "uiBadgeGreen" : "uiBadgeRed"].join(" ");
  return <span className={className}>{eligible ? "Eligible" : "Not Eligible"}</span>;
}

