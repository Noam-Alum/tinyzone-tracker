import "../styles/Header.css";

export default function SearchBar({ value, onChange }) {
  return (
    <input
      className="search"
      placeholder="Search domains..."
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}
