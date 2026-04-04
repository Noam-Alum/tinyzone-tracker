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

  const filtered = useMemo(() => {
    return domains.filter(d =>
      d.domain.toLowerCase().includes(search.toLowerCase()) ||
      (d.title && d.title.toLowerCase().includes(search.toLowerCase()))
    );
  }, [domains, search]);

  return (
    <div className="app">
      <Header updated={updated} error={error} />

      <SearchBar value={search} onChange={setSearch} />

      {loading ? (
        <Loader />
      ) : error ? (
        <div className="empty-state fade-in">
          <h2>Oops! Something went wrong</h2>
          <p>{error}</p>
        </div>
      ) : filtered.length > 0 ? (
        <div className="grid">
          {filtered.map((d) => (
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
        <p>© {new Date().getFullYear()} Tinyzone Tracker. Not affiliated with Tinyzone.</p>
      </footer>
    </div>
  );
}
