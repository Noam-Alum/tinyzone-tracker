import formatDate from "../utils/formatDate";
import "../styles/Header.css";

export default function Header({ updated, error }) {
  const date = error ? "Update failed" : updated ? formatDate(updated) : "Checking status...";

  return (
    <header className="header fade-in">
      <div className="logo">
        <img src={`${process.env.PUBLIC_URL}/logo.png`} alt="TinyZone Logo" className="logo-img" />
        <h1>Tinyzone Tracker</h1>
      </div>
      <p className="description">
        Real-time status of active Tinyzone mirror domains.
      </p>
      {updated && (
        <div className="status-bar">
          <span className="status-dot"></span>
          <p className="updated">Last updated: {date}</p>
        </div>
      )}
    </header>
  );
}
