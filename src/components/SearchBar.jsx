import "../styles/SearchBar.css";

export default function SearchBar({ value, onChange }) {
  return (
    <div className="search-container fade-in">
      <div className="search-wrapper">
        <span className="search-icon">🔍</span>
        <input
          type="text"
          className="search-input"
          placeholder="Search for a domain..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
        {value && (
          <button className="clear-search" onClick={() => onChange("")}>
            ✕
          </button>
        )}
      </div>
    </div>
  );
}
