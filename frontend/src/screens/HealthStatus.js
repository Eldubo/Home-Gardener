import React, { useEffect, useMemo, useRef, useState } from "react";
import { createAPI } from "../services/api";
import { getHealthStatus } from "../services/healthService";

export default function HealthCheck({ baseUrl = "http://localhost:3000" }) {
  const [health, setHealth] = useState(null);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState(null);

  // Nueva instancia si cambia la URL
  const api = useMemo(() => createAPI(baseUrl), [baseUrl]);

  // Guardar el interval id para limpiar
  const intervalRef = useRef(null);

  const fetchOnce = async () => {
    try {
      setError("");
      const data = await getHealthStatus(api);
      setHealth(data);
      setLastUpdated(new Date().toISOString());
    } catch (e) {
      setError(e?.message || "Fallo al consultar /health");
    }
  };

  useEffect(() => {
    fetchOnce(); // primera vez
    intervalRef.current = setInterval(fetchOnce, 5000); // cada 5s
    return () => clearInterval(intervalRef.current);
  }, [api]); // se reinicia si cambia la URL

  return (
    <div style={{ padding: 16 }}>
      <h2>Estado del servidor</h2>

      <p><strong>Base URL:</strong> {baseUrl}</p>

      {error && (
        <div style={{ color: "crimson", marginBottom: 8 }}>
          Error: {error}
        </div>
      )}

      {!health && !error && <p>Cargando…</p>}

      {health && (
        <ul>
          <li><strong>Status:</strong> {String(health.status)}</li>
          <li><strong>Message:</strong> {health.message}</li>
          <li><strong>Timestamp:</strong> {health.timestamp}</li>
          <li><strong>Environment:</strong> {health.environment}</li>
        </ul>
      )}

      {lastUpdated && <small>Última actualización: {lastUpdated}</small>}
    </div>
  );
}
