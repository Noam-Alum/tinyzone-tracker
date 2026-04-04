import { useState } from "react";
import useDomains from "../hooks/useDomains";
import Header from "../components/Header";
import DomainCard from "../components/DomainCard";
import Loader from "../components/Loader";
import SearchBar from "../components/SearchBar";
import "../styles/App.css";

export default function Home() {
  const { domains, updated, loading } = useDomains();
  const [search, setSearch] = useState("");

  const filtered = domains.filter(d =>
    d.domain.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="app">
      <Header updated={updated} />

      <SearchBar value={search} onChange={setSearch} />

      {loading && <Loader />}

      <div className="grid">
        {filtered.map((d, i) => (
          <DomainCard key={i} {...d} />
        ))}
      </div>
    </div>
  );
}
