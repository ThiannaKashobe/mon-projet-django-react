import React, { useEffect, useState } from "react";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [frequency, setFrequency] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    async function fetchMe() {
      setLoading(true);
      try {
        const access = localStorage.getItem("access");
        const res = await fetch("http://127.0.0.1:8000/users/me/", {
          headers: { Authorization: `Bearer ${access}` },
        });
        if (!res.ok) throw new Error("Erreur de chargement du profil");
        const data = await res.json();
        setUser(data);
        setFrequency(data.notification_frequency || "immediate");
      } catch (e) {
        setMsg(e.message);
      } finally {
        setLoading(false);
      }
    }
    fetchMe();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMsg("");
    try {
      const access = localStorage.getItem("access");
      const res = await fetch("http://127.0.0.1:8000/users/me/", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${access}`,
        },
        body: JSON.stringify({ notification_frequency: frequency }),
      });
      if (!res.ok) throw new Error("Erreur lors de la sauvegarde");
      setMsg("✅ Préférence enregistrée");
    } catch (e) {
      setMsg(e.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="main-wrapper">Chargement…</div>;
  if (!user) return <div className="main-wrapper">Erreur : {msg}</div>;

  return (
    <div className="page-container">
      <div className="main-wrapper" style={{ maxWidth: 500 }}>
        <h2 className="text-xl font-semibold mb-4">👤 Mon profil</h2>
        <div style={{ marginBottom: 24 }}>
          <div><b>Nom d'utilisateur :</b> {user.username}</div>
          <div><b>Email :</b> {user.email}</div>
          <div><b>Rôle :</b> {user.role}</div>
        </div>
        {user.role === "student" ? (
          <form onSubmit={handleSave} className="space-y-4">
            <label className="block text-gray-700 font-medium mb-1">
              Fréquence de notification :
            </label>
            <select
              value={frequency}
              onChange={e => setFrequency(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="immediate">À chaque nouvelle information</option>
              <option value="daily">Une fois par jour (digest)</option>
              <option value="weekly">Une fois par semaine (digest, sauf news très importantes)</option>
            </select>
            <button
              type="submit"
              disabled={saving}
              className="w-full py-3 mt-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold transition duration-200"
            >
              {saving ? "Enregistrement..." : "Enregistrer"}
            </button>
            {msg && <div style={{ marginTop: 10, color: msg.startsWith("✅") ? "green" : "crimson" }}>{msg}</div>}
          </form>
        ) : (
          <form className="space-y-4">
            <label className="block text-gray-700 font-medium mb-1">
              Modifier mes informations :
            </label>
            <input
              type="text"
              value={user.username}
              disabled
              className="w-full p-3 border border-gray-300 rounded-lg bg-gray-100"
            />
            <input
              type="email"
              value={user.email}
              disabled
              className="w-full p-3 border border-gray-300 rounded-lg bg-gray-100"
            />
          </form>
        )}
      </div>
    </div>
  );
}
