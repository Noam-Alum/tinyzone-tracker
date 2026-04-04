import "../styles/Loader.css";

export default function Loader() {
  return (
    <div className="loader-container">
      <div className="modern-loader">
        <div className="loader-ring"></div>
        <div className="loader-ring"></div>
        <div className="loader-ring"></div>
      </div>
      <p className="loader-text">Verifying domains...</p>
    </div>
  );
}
