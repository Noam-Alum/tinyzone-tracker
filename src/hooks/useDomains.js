import { useEffect, useState } from "react";
import { DATA_PATH } from "../config";

export default function useDomains() {
  const [domains, setDomains] = useState([]);
  const [updated, setUpdated] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    fetch(DATA_PATH)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch domain data.");
        return res.json();
      })
      .then((data) => {
        setDomains(data.results || []);
        setUpdated(data.updated);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error loading domains:", err);
        setError(err.message);
        setLoading(false);
      });
  }, []);

  return { domains, updated, loading, error };
}
