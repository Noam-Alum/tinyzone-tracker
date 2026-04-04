import "../styles/Card.css";

export default function DomainCard({ domain, url, status, title, description }) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="domain-card fade-in"
    >
      <div className="card-header">
        <span className="status-badge">ONLINE</span>
        <span className="status-code">{status}</span>
      </div>
      
      <div className="card-content">
        <h3 className="domain-title">{title || domain}</h3>
        <p className="domain-url">{domain}</p>
        {description && (
          <p className="domain-description">{description}</p>
        )}
      </div>

      <div className="card-footer">
        <span className="visit-text">Visit Site</span>
        <span className="visit-icon">→</span>
      </div>
    </a>
  );
}
