// src/pages/Feed.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";

// -- URL de ton backend Django (API)
const API_URL =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_API_URL) ||
  process.env.REACT_APP_API_URL ||
  "http://127.0.0.1:8000/api"; // <-- ajouté /api ici

const api = axios.create({ baseURL: API_URL });

// Intercepteur pour ajouter le token JWT à chaque requête
api.interceptors.request.use((cfg) => {
  const tok = localStorage.getItem("access");
  if (tok) cfg.headers.Authorization = `Bearer ${tok}`;
  return cfg;
});

// Utilitaire pour formater les dates en français
function formatDate(value) {
  if (!value) return "—";
  const d = new Date(value);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleString("fr-FR", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export default function Feed() {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    console.log("[Feed] Chargement du fil d’actualités…");

    const token = localStorage.getItem("access");
    const user = JSON.parse(localStorage.getItem("user"));

    if (!token || !user) {
      setError("🔑 Vous devez être connecté pour voir les actualités.");
      setLoading(false);
      return;
    }

    const programmeId = user.programme?.id || user.programme; // selon ton serializer

    let alive = true;
    (async () => {
      try {
        setLoading(true);

        // 🔹 URL mise à jour pour le backend Django
        const res = await api.get("/news/"); 

        const allNews = Array.isArray(res.data)
          ? res.data
          : Array.isArray(res.data?.results)
          ? res.data.results
          : [];

        // 🧩 Filtrage : uniquement les news approuvées du programme de l’étudiant
        const filtered = allNews.filter(
          (n) =>
            n.statut === "approved" &&
            (n.programme === programmeId || n.programme?.id === programmeId)
        );

        if (alive) setNews(filtered);
      } catch (err) {
        console.error("❌ Erreur feed :", err);
        const s = err?.response?.status;
        const msg =
          s === 401
            ? "Non autorisé (401)."
            : s === 403
            ? "⛔ Accès refusé."
            : "Impossible de charger les actualités.";
        if (alive) setError(msg);
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  if (loading) return <p>⏳ Chargement des actualités...</p>;
  if (error) return <p style={{ color: "crimson" }}>{error}</p>;

  return (
    <div className="page-container">
      <div className="main-wrapper">
        <h2 style={{ textAlign: "center" }}>📰 Fil d’actualités</h2>
        <p style={{ textAlign: "center", color: "#555" }}>
          Actualités de votre programme :{" "}
          <strong>
            {JSON.parse(localStorage.getItem("user"))?.programme_nom || "—"}
          </strong>
        </p>

        {news.length === 0 ? (
          <p>Aucune actualité approuvée pour votre programme.</p>
        ) : (
          <div className="news-grid">
            {news.map((n) => (
              <div key={n.id} className={`news-card ${n.statut || ""}`}>
                <div className="news-header">
                  <h3>{n.titre || "Sans titre"}</h3>
                  {n.importance && (
                    <span
                      className={`status-badge ${n.importance}`}
                      title={`Importance : ${n.importance}`}
                    >
                      {String(n.importance).toUpperCase()}
                    </span>
                  )}
                </div>

                <p className="news-content">{n.contenu || "—"}</p>

                <div className="news-meta">
                  <small>
                    🧑‍💻 <strong>Auteur :</strong>{" "}
                    {n.auteur_nom || n.auteur?.username || "Inconnu"}
                  </small>
                  <br />
                  {n.modere_par_nom && (
                    <small>
                      ✅ <strong>Validée par :</strong>{" "}
                      {n.modere_par_nom || n.modere_par?.username || "—"} —{" "}
                      {formatDate(n.date_publication)}
                    </small>
                  )}
                  <br />
                  <small>🕓 Créée le {formatDate(n.date_creation)}</small>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
