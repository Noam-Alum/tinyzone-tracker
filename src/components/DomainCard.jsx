import "../styles/Card.css";

export default function DomainCard({ domain, url, status, title, description, category }) {
  const isOriginal = category === "Original";

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={`domain-card fade-in ${isOriginal ? "original" : "replica"}`}
    >
      <div className="card-header">
        <span className={`status-badge ${isOriginal ? "badge-original" : "badge-replica"}`}>
          {category || "Replica"}
        </span>
        {status && <span className="status-code">{status}</span>}
      </div>
      
      <div className="card-content">
        <h3 className="domain-url">{domain}</h3>
        <p className="domain-title">{title}</p>
        {description && (
          <p className="domain-description">{description}</p>
        )}
      </div>

      <div className="card-footer">
        <span className="visit-text">Visit Mirror</span>
        <span className="visit-icon">→</span>
      </div>
    </a>
  );
}
