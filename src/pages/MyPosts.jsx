import { useEffect, useState } from "react";
import axios from "axios";

// --- API setup ---
const API_URL =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_API_URL) ||
  process.env.REACT_APP_API_URL ||
  "http://127.0.0.1:8000/api";

const api = axios.create({ baseURL: API_URL });

// Intercepteur pour ajouter le token JWT à chaque requête
api.interceptors.request.use((cfg) => {
  const tok = localStorage.getItem("access");
  if (tok) cfg.headers.Authorization = `Bearer ${tok}`;
  return cfg;
});

export default function MyPosts() {
  const [news, setNews] = useState([]);
  const [programmes, setProgrammes] = useState([]);
  const [form, setForm] = useState({
    titre: "",
    contenu: "",
    importance: "low",
    programme: "",
    date_souhaitee_publication: "",
  });
  const [loading, setLoading] = useState(false);

  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    fetchMyNews();
    fetchProgrammes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Charger la liste des programmes
  async function fetchProgrammes() {
    try {
      const res = await api.get("/programmes/");
      setProgrammes(res.data);
    } catch (err) {
      console.error("❌ Erreur chargement programmes :", err.response?.data || err.message);
    }
  }

  // Charger les actualités de l'utilisateur
  async function fetchMyNews() {
    try {
      const res = await api.get("/news/");
      const myNews = Array.isArray(res.data)
        ? res.data.filter((n) => n.auteur.username === user?.username)
        : [];
      setNews(myNews);
    } catch (err) {
      console.error("❌ Erreur fetchMyNews :", err.response?.data || err.message);
    }
  }

  // Création d’une nouvelle actualité
  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);

    if (!form.titre || !form.contenu || !form.programme) {
      alert("❌ Veuillez remplir tous les champs obligatoires et sélectionner un programme.");
      setLoading(false);
      return;
    }

    try {
      const res = await api.post("/news/", {
        titre: form.titre,
        contenu: form.contenu,
        importance: form.importance,
        programme: form.programme, // ID du programme
        date_souhaitee_publication: form.date_souhaitee_publication || null,
      });

      // Ajouter la news créée directement dans l'état
      setNews((prev) => [res.data, ...prev]);

      setForm({
        titre: "",
        contenu: "",
        importance: "low",
        programme: "",
        date_souhaitee_publication: "",
      });

      alert("✅ Actualité créée avec succès !");
    } catch (err) {
      console.error("❌ Erreur création news :", err.response?.data || err.message);
      alert("❌ Erreur lors de la publication : " + JSON.stringify(err.response?.data));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page-container p-4">
      <h2 className="text-center text-2xl font-bold mb-6">🖋️ Mes publications</h2>

      {/* FORMULAIRE DE CREATION */}
      <div className="bg-white shadow-md rounded-2xl p-6 mb-8">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">🗞️ Publier une actualité</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Titre de l'actualité"
            value={form.titre}
            onChange={(e) => setForm({ ...form, titre: e.target.value })}
            required
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          />
          <textarea
            placeholder="Contenu de l’actualité..."
            value={form.contenu}
            onChange={(e) => setForm({ ...form, contenu: e.target.value })}
            required
            rows="5"
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none"
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-gray-600 font-medium mb-1">Importance :</label>
              <select
                value={form.importance}
                onChange={(e) => setForm({ ...form, importance: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="low">Faible</option>
                <option value="medium">Moyenne</option>
                <option value="high">Importante</option>
                <option value="urgent">Urgente</option>
              </select>
            </div>
            <div>
              <label className="block text-gray-600 font-medium mb-1">Programme :</label>
              <select
                value={form.programme}
                onChange={(e) => setForm({ ...form, programme: e.target.value })}
                required
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="">-- Sélectionner un programme --</option>
                {programmes.map((p) => (
                  <option key={p.id} value={p.id}>{p.nom}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-gray-600 font-medium mb-1">📅 Date souhaitée :</label>
              <input
                type="datetime-local"
                value={form.date_souhaitee_publication}
                onChange={(e) =>
                  setForm({ ...form, date_souhaitee_publication: e.target.value })
                }
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 mt-3 rounded-lg text-white font-semibold transition duration-200 ${
              loading ? "bg-blue-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {loading ? "Publication en cours..." : "Publier l’actualité"}
          </button>
        </form>
      </div>

      {/* LISTE DES ACTUALITÉS */}
      <div>
        <h3 className="text-xl font-semibold mb-4 border-b pb-2">📄 Mes actualités publiées</h3>
        {news.length === 0 ? (
          <p className="text-gray-500 text-center">Aucune actualité pour le moment.</p>
        ) : (
          <div className="grid gap-4">
            {news.map((n) => (
              <div
                key={n.id}
                className={`news-card ${n.statut}`}
                style={{ borderLeft: "4px solid #3b82f6", padding: "12px", borderRadius: "8px", background: "#f9f9f9" }}
              >
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-bold">{n.titre}</h4>
                  <span className={`status-badge ${n.statut}`} title={`Statut : ${n.statut}`}>
                    {String(n.statut).toUpperCase()}
                  </span>
                </div>
                <p className="mb-2">{n.contenu}</p>
                <div className="text-sm text-gray-600">
                  🎓 <strong>Programme :</strong> {n.programme_detail?.nom || "—"}
                  <br />
                  ⚙️ <strong>Importance :</strong> {n.importance?.toUpperCase() || "—"}
                  <br />
                  🗓️ <strong>Date souhaitée :</strong> {n.date_souhaitee_publication || "—"}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
