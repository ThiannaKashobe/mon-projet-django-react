import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      // 🔹 Étape 1 : obtenir le token JWT
      const res = await axios.post("http://127.0.0.1:8000/api/token/", {
        username,
        password,
      });

      localStorage.setItem("access", res.data.access);
      localStorage.setItem("refresh", res.data.refresh);

      // 🔹 Étape 2 : récupérer les infos de l'utilisateur
      const me = await axios.get("http://127.0.0.1:8000/api/users/me/", {
        headers: { Authorization: `Bearer ${res.data.access}` },
      });

      const user = me.data;
      const role = user.role;

      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("role", role || "");

      // 🔹 Étape 3 : redirection selon le rôle
      if (!role) {
        navigate("/inviter"); // Utilisateur sans rôle → page d’attente
      } else if (role === "admin") {
        navigate("/admin");
      } else if (role === "moderator") {
        navigate("/moderation");
      } else if (role === "publisher") {
        navigate("/myposts");
      } else if (role === "student") {
        navigate("/"); // Accueil étudiant
      } else {
        navigate("/login"); // Valeur inattendue
      }
    } catch (err) {
      console.error("Erreur de connexion :", err.response?.data || err.message);
      setError(
        err.response?.data?.detail ||
        "Identifiants incorrects ou serveur injoignable."
      );
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-100 bg-opacity-50">
      <div className="bg-white shadow-lg rounded-2xl p-6 w-full max-w-md">
        <h2 className="text-2xl font-semibold text-center text-gray-800 mb-5">
          🔐 Connexion
        </h2>

        {error && (
          <p className="text-red-600 text-sm text-center mb-4 font-medium">
            {error}
          </p>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="text"
            placeholder="Nom d'utilisateur"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <input
            type="password"
            placeholder="Mot de passe"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <button
            type="submit"
            className="w-full py-3 mt-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold transition duration-200"
          >
            Se connecter
          </button>

          <p className="text-center text-gray-600 mt-4">
            Pas encore de compte ?{" "}
            <a href="/register" className="text-blue-600 hover:underline">
              S’inscrire
            </a>
          </p>
        </form>
      </div>
    </div>
  );
}
