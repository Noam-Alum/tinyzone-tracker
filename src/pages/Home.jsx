import { useState, useMemo } from "react";
import useDomains from "../hooks/useDomains";
import Header from "../components/Header";
import DomainCard from "../components/DomainCard";
import Loader from "../components/Loader";
import SearchBar from "../components/SearchBar";
import "../styles/App.css";

export default function Home() {
  const { domains, updated, loading, error } = useDomains();
  const [search, setSearch] = useState("");

  const sortedDomains = useMemo(() => {
    const filtered = domains.filter(d =>
      d.domain.toLowerCase().includes(search.toLowerCase()) ||
      (d.title && d.title.toLowerCase().includes(search.toLowerCase()))
    );

    // Sort: Original first, then Replica
    return filtered.sort((a, b) => {
      if (a.category === "Original" && b.category !== "Original") return -1;
      if (a.category !== "Original" && b.category === "Original") return 1;
      return 0;
    });
  }, [domains, search]);

  const handleQuickWatch = () => {
    const originals = domains.filter(d => d.category === "Original");
    const target = originals.length > 0 ? originals[0] : domains[0];
    if (target) window.open(target.url, "_blank");
  };

  return (
    <div className="app">
      <Header updated={updated} error={error} />

      <SearchBar value={search} onChange={setSearch} />

      {domains.length > 0 && (
        <div className="quick-actions fade-in">
          <button className="quick-watch-btn" onClick={handleQuickWatch}>
            <span className="btn-icon">⚡</span> Quick Watch
          </button>
        </div>
      )}

      {loading ? (
        <Loader />
      ) : error ? (
        <div className="empty-state fade-in">
          <h2>Oops! Something went wrong</h2>
          <p>{error}</p>
        </div>
      ) : sortedDomains.length > 0 ? (
        <div className="grid">
          {sortedDomains.map((d) => (
            <DomainCard key={d.domain} {...d} />
          ))}
        </div>
      ) : (
        <div className="empty-state fade-in">
          <h2>No results found</h2>
          <p>Try searching for something else or check back later.</p>
        </div>
      )}

      <footer className="footer fade-in">
        <div className="footer-support">
          <h3>Support this Project</h3>
          <p>
            I maintain this tracker to help the community find reliable streaming portals. 
            If you find it useful, consider becoming a sponsor! 
            Your support helps keep this project alive and updated.
          </p>
          <a 
            href="https://github.com/sponsors/Noam-Alum" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="footer-support-btn"
          >
            <span className="btn-icon">❤️</span> Become a Sponsor
          </a>
        </div>
        <div className="footer-links">
          <a href="https://github.com/Noam-Alum/tinyzone-tracker" target="_blank" rel="noopener noreferrer" className="footer-link">
            GitHub Repository
          </a>
        </div>
        <p className="copyright">© {new Date().getFullYear()} Tinyzone Tracker. Not affiliated with Tinyzone.</p>
      </footer>
    </div>
  );
}
