// src/pages/AdminDashboard.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";

// --- URL API ---
const API_URL =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_API_URL) ||
  process.env.REACT_APP_API_URL ||
  "http://127.0.0.1:8000";

const api = axios.create({ baseURL: API_URL });

// Ajouter le token JWT à chaque requête
api.interceptors.request.use((cfg) => {
  const tok = localStorage.getItem("access");
  if (tok) cfg.headers.Authorization = `Bearer ${tok}`;
  return cfg;
});

export default function AdminDashboard() {
  const [tab, setTab] = useState("users");

  const [users, setUsers] = useState([]);
  const [news, setNews] = useState([]);
  const [programmes, setProgrammes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // États pour le modal
  const [modal, setModal] = useState(false);
  const [modalData, setModalData] = useState({});
  const [modalType, setModalType] = useState(""); // "news" | "programme" | "user"
  const [isEditing, setIsEditing] = useState(false);

  // ------------------- INITIAL FETCH -------------------
  useEffect(() => {
    fetchUsers();
    fetchNews();
    fetchProgrammes();
  }, []);

  // ------------------- USERS -------------------
  async function fetchUsers() {
    try {
      setLoading(true);
      const res = await api.get("/api/users/");
      setUsers(res.data);
    } catch (err) {
      console.error("Erreur fetchUsers :", err);
      setError("Erreur lors du chargement des utilisateurs.");
    } finally {
      setLoading(false);
    }
  }

  const handleRoleChange = async (userId, newRole) => {
    try {
      const res = await api.post(`/api/users/${userId}/assign-role/`, { role: newRole });
      alert(res.data.success);
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
      );
      setModalData((prev) => ({ ...prev, role: newRole }));
    } catch (err) {
      console.error("Erreur assign-role :", err.response?.data || err.message);
      alert("Erreur lors de l'attribution du rôle : " + (err.response?.data?.error || err.message));
    }
  };

  async function deleteUser(userId) {
    if (!window.confirm("Supprimer cet utilisateur ?")) return;
    try {
      await api.delete(`/api/users/${userId}/`);
      fetchUsers();
    } catch (err) {
      console.error(err);
      alert("Erreur lors de la suppression de l'utilisateur.");
    }
  }

  // ------------------- NEWS -------------------
  async function fetchNews() {
    try {
      setLoading(true);
      const res = await api.get("/api/news/");
      setNews(res.data);
    } catch (err) {
      console.error("Erreur fetchNews :", err);
      setError("Erreur lors du chargement des actualités.");
    } finally {
      setLoading(false);
    }
  }

  async function handleNewsSubmit(e) {
    e.preventDefault();
    try {
      const payload = {
        titre: modalData.titre,
        contenu: modalData.contenu,
        importance: modalData.importance || "low",
        programme: modalData.programme,
        date_souhaitee_publication: modalData.date_souhaitee_publication || null,
        statut: "pending",
      };

      if (isEditing) {
        await api.patch(`/api/news/${modalData.id}/`, payload);
      } else {
        await api.post(`/api/news/`, payload);
      }

      fetchNews();
      closeModal();
    } catch (err) {
      console.error(err);
      alert("Erreur lors de l'enregistrement de l'actualité.");
    }
  }

  async function deleteNews(newsId) {
    if (!window.confirm("Supprimer cette actualité ?")) return;
    try {
      await api.delete(`/api/news/${newsId}/`);
      fetchNews();
    } catch (err) {
      console.error(err);
      alert("Erreur lors de la suppression de l'actualité.");
    }
  }

  // ------------------- PROGRAMMES -------------------
  async function fetchProgrammes() {
    try {
      setLoading(true);
      const res = await api.get("/api/programmes/");
      setProgrammes(res.data);
    } catch (err) {
      console.error("Erreur fetchProgrammes :", err);
      setError("Erreur lors du chargement des programmes.");
    } finally {
      setLoading(false);
    }
  }

  async function handleProgrammeSubmit(e) {
    e.preventDefault();
    try {
      if (isEditing) {
        await api.patch(`/api/programmes/${modalData.id}/`, modalData);
      } else {
        await api.post(`/api/programmes/`, modalData);
      }
      fetchProgrammes();
      closeModal();
    } catch (err) {
      console.error(err);
      alert("Erreur lors de l'enregistrement du programme.");
    }
  }

  async function deleteProgramme(id) {
    if (!window.confirm("Supprimer ce programme ?")) return;
    try {
      await api.delete(`/api/programmes/${id}/`);
      fetchProgrammes();
    } catch (err) {
      console.error(err);
      alert("Erreur lors de la suppression du programme.");
    }
  }

  // ------------------- MODAL -------------------
  const openModal = (type, data = null) => {
    setModalType(type);
    setModalData(data || {});
    setIsEditing(!!data);
    setModal(true);
  };

  const closeModal = () => {
    setModal(false);
    setModalData({});
    setIsEditing(false);
  };

  // ------------------- RENDER TAB -------------------
  const renderTab = () => {
    if (tab === "users") {
      return (
        <div>
          <button
            onClick={() => openModal("user")}
            className="mb-2 bg-blue-500 text-white px-4 py-2 rounded"
          >
            ➕ Ajouter un utilisateur
          </button>
          {users.map((u) => (
            <div key={u.id} className="border p-2 mb-2 rounded flex justify-between">
              <div>
                <strong>{u.username}</strong> - Rôle : {u.role || "—"}
              </div>
              <div>
                <button
                  onClick={() => openModal("user", u)}
                  className="bg-yellow-500 text-white px-2 rounded mr-1"
                >
                  ✏️ Modifier
                </button>
                <button
                  onClick={() => deleteUser(u.id)}
                  className="bg-red-500 text-white px-2 rounded"
                >
                  🗑️ Supprimer
                </button>
              </div>
            </div>
          ))}
        </div>
      );
    } else if (tab === "news") {
      return (
        <div>
          <button
            onClick={() => openModal("news")}
            className="mb-2 bg-green-500 text-white px-4 py-2 rounded"
          >
            ➕ Ajouter une news
          </button>
          {news.map((n) => (
            <div key={n.id} className="border p-2 mb-2 rounded flex justify-between">
              <div>
                <strong>{n.titre}</strong> - Statut : {n.statut || "—"}
              </div>
              <div>
                <button
                  onClick={() => openModal("news", n)}
                  className="bg-yellow-500 text-white px-2 rounded mr-1"
                >
                  ✏️ Modifier
                </button>
                <button
                  onClick={() => deleteNews(n.id)}
                  className="bg-red-500 text-white px-2 rounded"
                >
                  🗑️ Supprimer
                </button>
              </div>
            </div>
          ))}
        </div>
      );
    } else if (tab === "programmes") {
      return (
        <div>
          <button
            onClick={() => openModal("programme")}
            className="mb-2 bg-purple-500 text-white px-4 py-2 rounded"
          >
            ➕ Ajouter un programme
          </button>
          {programmes.map((p) => (
            <div key={p.id} className="border p-2 mb-2 rounded flex justify-between">
              <div>
                <strong>{p.nom}</strong>
                <p className="text-gray-600 text-sm">{p.description || "—"}</p>
              </div>
              <div>
                <button
                  onClick={() => openModal("programme", p)}
                  className="bg-yellow-500 text-white px-2 rounded mr-1"
                >
                  ✏️ Modifier
                </button>
                <button
                  onClick={() => deleteProgramme(p.id)}
                  className="bg-red-500 text-white px-2 rounded"
                >
                  🗑️ Supprimer
                </button>
              </div>
            </div>
          ))}
        </div>
      );
    }
  };

  // ------------------- MODAL FORM -------------------
  const renderModal = () => {
    if (!modal) return null;

    const handleChange = (e) =>
      setModalData({ ...modalData, [e.target.name]: e.target.value });

    let submitFunc =
      modalType === "user"
        ? () => {}
        : modalType === "news"
        ? handleNewsSubmit
        : handleProgrammeSubmit;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded w-96">
          <h3 className="mb-4">{isEditing ? "Modifier" : "Ajouter"} {modalType}</h3>
          <form onSubmit={submitFunc} className="flex flex-col gap-2">
            {modalType === "user" && (
              <>
                <input
                  name="username"
                  placeholder="Nom d'utilisateur"
                  value={modalData.username || ""}
                  onChange={handleChange}
                  required
                  className="border p-2 rounded"
                />
                <input
                  name="email"
                  placeholder="Email"
                  value={modalData.email || ""}
                  onChange={handleChange}
                  required
                  className="border p-2 rounded"
                  type="email"
                />
                {isEditing && (
                  <div className="mt-2">
                    <label className="block mb-1 font-medium">Rôle :</label>
                    <select
                      value={modalData.role || ""}
                      onChange={(e) => handleRoleChange(modalData.id, e.target.value)}
                      className="border p-2 rounded w-full"
                    >
                      <option value="">— Sélectionner un rôle —</option>
                      <option value="admin">Administrateur</option>
                      <option value="moderator">Modérateur</option>
                      <option value="publisher">Publiant</option>
                      <option value="student">Étudiant</option>
                    </select>
                  </div>
                )}
              </>
            )}

            {modalType === "news" && (
              <>
                <input
                  name="titre"
                  placeholder="Titre"
                  value={modalData.titre || ""}
                  onChange={handleChange}
                  required
                  className="border p-2 rounded"
                />
                <textarea
                  name="contenu"
                  placeholder="Contenu"
                  value={modalData.contenu || ""}
                  onChange={handleChange}
                  required
                  className="border p-2 rounded"
                  rows={5}
                />
                <select
                  name="importance"
                  value={modalData.importance || "low"}
                  onChange={handleChange}
                  className="border p-2 rounded"
                >
                  <option value="low">Faible</option>
                  <option value="medium">Moyenne</option>
                  <option value="high">Importante</option>
                  <option value="urgent">Urgente</option>
                </select>
                <select
                  name="programme"
                  value={modalData.programme || ""}
                  onChange={handleChange}
                  required
                  className="border p-2 rounded"
                >
                  <option value="">— Sélectionner un programme —</option>
                  {programmes.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.nom}
                    </option>
                  ))}
                </select>
                <input
                  type="datetime-local"
                  name="date_souhaitee_publication"
                  value={modalData.date_souhaitee_publication || ""}
                  onChange={handleChange}
                  className="border p-2 rounded"
                />
              </>
            )}

            {modalType === "programme" && (
              <>
                <input
                  name="nom"
                  placeholder="Nom du programme"
                  value={modalData.nom || ""}
                  onChange={handleChange}
                  required
                  className="border p-2 rounded"
                />
                <textarea
                  name="description"
                  placeholder="Description du programme"
                  value={modalData.description || ""}
                  onChange={handleChange}
                  className="border p-2 rounded"
                  rows={3}
                />
              </>
            )}

            <div className="flex justify-end gap-2 mt-2">
              <button
                type="button"
                onClick={closeModal}
                className="px-4 py-2 rounded border"
              >
                Annuler
              </button>
              {modalType !== "user" && (
                <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded">
                  {isEditing ? "Modifier" : "Ajouter"}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    );
  };

  // ------------------- RENDER -------------------
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
      <div className="flex gap-4 mb-4">
        <button onClick={() => setTab("users")} className="px-4 py-2 bg-gray-200 rounded">
          Utilisateurs
        </button>
        <button onClick={() => setTab("news")} className="px-4 py-2 bg-gray-200 rounded">
          News
        </button>
        <button onClick={() => setTab("programmes")} className="px-4 py-2 bg-gray-200 rounded">
          Programmes
        </button>
      </div>
      {loading ? <p>Chargement...</p> : renderTab()}
      {renderModal()}
      {error && <p className="text-red-500 mt-2">{error}</p>}
    </div>
  );
}
