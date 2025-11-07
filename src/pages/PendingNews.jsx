// src/pages/PendingNews.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";

const API_URL =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_API_URL) ||
  process.env.REACT_APP_API_URL ||
  "http://127.0.0.1:8000";

const api = axios.create({ baseURL: API_URL });

api.interceptors.request.use((cfg) => {
  const tok = localStorage.getItem("access");
  if (tok) cfg.headers.Authorization = `Bearer ${tok}`;
  return cfg;
});

function formatDate(value) {
  if (!value) return "—";
  const d = new Date(value);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleString("fr-FR", { dateStyle: "medium", timeStyle: "short" });
}

export default function PendingNews() {
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function fetchPending() {
    try {
      setLoading(true);
      const res = await api.get("/api/news/");
      const data = Array.isArray(res.data)
        ? res.data
        : Array.isArray(res.data?.results)
        ? res.data.results
        : [];
      const newsPending = data.filter((n) => n.statut === "pending");
      setPending(newsPending);
    } catch (err) {
      console.error("❌ Erreur chargement :", err);
      setError("Impossible de charger les actualités à modérer.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchPending();
  }, []);

  async function handleAction(id, action) {
    try {
      await api.post(`/api/news/${id}/${action}/`);
      fetchPending();
      alert(action === "approve" ? "✅ Actualité approuvée !" : "❌ Actualité rejetée !");
    } catch (err) {
      console.error(`Erreur ${action}:`, err);
      alert("Une erreur est survenue !");
    }
  }

  if (loading) return <p>⏳ Chargement des actualités...</p>;
  if (error) return <p style={{ color: "crimson" }}>{error}</p>;

  return (
    <div className="page-container">
      <div className="main-wrapper">
        <h2 style={{ textAlign: "center" }}>⏳ Actualités à modérer</h2>
        <p style={{ textAlign: "center", color: "#555" }}>
          Total en attente : <strong>{pending.length}</strong>
        </p>

        {pending.length === 0 ? (
          <p className="text-center text-gray-500">Aucune actualité en attente.</p>
        ) : (
          <div className="news-grid">
            {pending.map((n) => (
              <div key={n.id} className="news-card border-l-4 border-yellow-400">
                <div className="news-header">
                  <h3>{n.titre || "Sans titre"}</h3>
                  <span className="status-badge pending" title="En attente de validation">
                    EN ATTENTE
                  </span>
                </div>

                <p className="news-content">{n.contenu || "—"}</p>

                <div className="news-meta">
                  <small>
                    🧑‍💻 <strong>Auteur :</strong> {n.auteur?.username || "Inconnu"}
                  </small>
                  <br />
                  <small>
                    🎓 <strong>Programme :</strong> {n.programme_detail?.nom || "—"}
                  </small>
                  <br />
                  <small>🕓 Créée le {formatDate(n.date_creation)}</small>
                </div>

                <div
                  style={{
                    marginTop: "10px",
                    display: "flex",
                    gap: "8px",
                    justifyContent: "flex-end",
                  }}
                >
                  <button
                    onClick={() => handleAction(n.id, "approve")}
                    className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition"
                  >
                    ✅ Approuver
                  </button>
                  <button
                    onClick={() => handleAction(n.id, "reject")}
                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition"
                  >
                    ❌ Rejeter
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
