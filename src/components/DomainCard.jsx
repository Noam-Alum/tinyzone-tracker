import "../styles/Card.css";

export default function DomainCard({ domain, status }) {
  return (
    <a
      href={`http://${domain}`}
      target="_blank"
      rel="noopener noreferrer"
      className="card"
    >
      <div className="badge">LIVE</div>
      <h3>{domain}</h3>
      <p>Status {status}</p>
      <button>Watch Now</button>
    </a>
  );
}
