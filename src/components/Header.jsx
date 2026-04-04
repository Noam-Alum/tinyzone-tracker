import formatDate from "../utils/formatDate";
import "../styles/Header.css";

export default function Header({ updated }) {
  return (
    <div className="header">
      <h1>🎬 TinyZone Live Domains</h1>
      {updated && (
        <p className="updated">
          Last checked: {formatDate(updated)}
        </p>
      )}
    </div>
  );
}
