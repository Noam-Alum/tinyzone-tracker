import { useEffect, useState } from "react";
import { DATA_PATH } from "../config";

export default function useDomains() {
  const [domains, setDomains] = useState([]);
  const [updated, setUpdated] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(DATA_PATH)
      .then(res => res.json())
      .then(data => {
        setDomains(data.results || []);
        setUpdated(data.updated);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return { domains, updated, loading };
}
