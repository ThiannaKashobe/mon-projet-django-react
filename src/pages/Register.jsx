import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const navigate = useNavigate();
  const [programmes, setProgrammes] = useState([]);
  const [loadingProg, setLoadingProg] = useState(true);
  const [err, setErr] = useState("");

  const [form, setForm] = useState({
    username: "",
    email: "",
    first_name: "",
    last_name: "",
    password: "",
    programme: "",
    notification_frequency: "immediate",
    fcm_token: "",
  });

  // 🔹 Charger les programmes depuis l'API
  useEffect(() => {
    async function fetchProgrammes() {
      try {
        const res = await fetch("http://127.0.0.1:8000/api/programmes/");
        if (!res.ok) throw new Error("Erreur lors du chargement des programmes");
        const data = await res.json();
        setProgrammes(data);
        setErr("");
      } catch (e) {
        console.error(e);
        setErr("⚠️ Impossible de charger les programmes.");
      } finally {
        setLoadingProg(false);
      }
    }
    fetchProgrammes();
  }, []);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  // 🔹 Soumettre le formulaire pour créer un utilisateur
  const handleRegister = async (e) => {
    e.preventDefault();
    setErr("");

    try {
      const payload = {
        username: form.username.trim(),
        email: form.email.trim(),
        first_name: form.first_name.trim(),
        last_name: form.last_name.trim(),
        password: form.password,
        programme: form.programme ? Number(form.programme) : null,
        notification_frequency: form.notification_frequency,
        ...(form.fcm_token ? { fcm_token: form.fcm_token } : {}),
      };

      const res = await fetch("http://127.0.0.1:8000/api/users/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(
          data?.detail || Object.values(data)[0]?.[0] || "Erreur lors de l’inscription."
        );
      }

      alert("✅ Compte créé avec succès ! Attendez qu’un administrateur vous attribue un rôle.");
      navigate("/inviter"); // Redirection après création

      setForm({
        username: "",
        email: "",
        first_name: "",
        last_name: "",
        password: "",
        programme: "",
        notification_frequency: "immediate",
        fcm_token: "",
      });
    } catch (e) {
      console.error("Erreur d’inscription:", e);
      setErr(e.message || "Erreur inconnue");
    }
  };

  return (
    <div className="page-container flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white shadow-md rounded-2xl p-6 w-full max-w-md">
        <h2 className="text-2xl font-semibold text-center text-gray-800 mb-5">
          📝 Créer un compte
        </h2>

        {err && (
          <p className="text-red-600 text-sm text-center mb-4 font-medium">{err}</p>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          <input
            name="username"
            placeholder="Nom d’utilisateur"
            value={form.username}
            onChange={onChange}
            required
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <input
            name="email"
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={onChange}
            required
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input
              name="first_name"
              placeholder="Prénom"
              value={form.first_name}
              onChange={onChange}
              className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              name="last_name"
              placeholder="Nom"
              value={form.last_name}
              onChange={onChange}
              className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <input
            name="password"
            type="password"
            placeholder="Mot de passe"
            value={form.password}
            onChange={onChange}
            required
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <div>
            <label className="block text-gray-700 font-medium mb-1">Programme :</label>
            <select
              name="programme"
              value={form.programme}
              onChange={onChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">-- Choisir un programme --</option>
              {!loadingProg &&
                programmes.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nom || `Programme ${p.id}`}
                  </option>
                ))}
            </select>
            {loadingProg && (
              <p className="text-sm text-gray-500 mt-1">⏳ Chargement des programmes...</p>
            )}
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Fréquence de notification :
            </label>
            <select
              name="notification_frequency"
              value={form.notification_frequency}
              onChange={onChange}
              required
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="immediate">À chaque nouvelle information</option>
              <option value="daily">Une fois par jour</option>
              <option value="weekly">Une fois par semaine</option>
            </select>
          </div>

          <input
            name="fcm_token"
            placeholder="FCM Token (optionnel)"
            value={form.fcm_token}
            onChange={onChange}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <button
            type="submit"
            className="w-full py-3 mt-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold transition duration-200"
          >
            Créer le compte
          </button>

          <p className="text-center text-gray-600 mt-4">
            Déjà un compte ?{" "}
            <a href="/login" className="text-blue-600 hover:underline">
              Se connecter
            </a>
          </p>
        </form>
      </div>
    </div>
  );
}
