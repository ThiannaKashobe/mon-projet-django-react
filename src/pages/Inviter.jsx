// src/pages/Inviter.jsx
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

// ✅ Définition sûre de l'URL de l'API
const API_URL =
  (typeof import.meta !== "undefined" && import.meta.env && import.meta.env.VITE_API_URL)
    ? import.meta.env.VITE_API_URL
    : "http://127.0.0.1:8000/api/";

const api = axios.create({ baseURL: API_URL });

// ✅ Intercepteur : ajoute le token si disponible
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default function Inviter() {
  const navigate = useNavigate();

  useEffect(() => {
    const checkRole = async () => {
      try {
        const res = await api.get("check-role/");
        if (res.data.redirect && res.data.redirect !== "/inviter") {
          navigate(res.data.redirect);
        }
      } catch (err) {
        console.error("❌ Erreur check role:", err);
      }
    };

    checkRole();
  }, [navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-indigo-50 to-white px-4">
      <div className="bg-white shadow-lg rounded-2xl p-8 max-w-md w-full text-center border border-indigo-100">
        <div className="flex justify-center mb-6">
          <div className="bg-indigo-100 text-indigo-600 w-16 h-16 rounded-full flex items-center justify-center text-3xl font-bold">
            ⏳
          </div>
        </div>

        <h2 className="text-2xl font-semibold text-gray-800 mb-3">
          En attente d’attribution de rôle
        </h2>
        <p className="text-gray-600 mb-6">
          Votre compte est créé, mais il doit encore être validé par un administrateur.
          Vous recevrez une notification dès que votre rôle sera attribué.
        </p>

        <button
          onClick={() => navigate("/")}
          className="px-6 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition duration-300"
        >
          Retour à l’accueil
        </button>
      </div>

      <footer className="mt-10 text-sm text-gray-500">
        &copy; {new Date().getFullYear()} Mon Application. Tous droits réservés.
      </footer>
    </div>
  );
}
