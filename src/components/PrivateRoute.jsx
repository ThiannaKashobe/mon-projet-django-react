// src/components/PrivateRoute.jsx
import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import API from "../api";

export default function PrivateRoute({ children, roles = [] }) {
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    async function checkAuth() {
      const access = localStorage.getItem("access");
      const refresh = localStorage.getItem("refresh");
      const userData = localStorage.getItem("user");

      // 🚨 Pas de token ni d'utilisateur enregistré
      if (!access || !userData) {
        setAuthorized(false);
        setLoading(false);
        return;
      }

      let user;
      try {
        user = JSON.parse(userData);
      } catch (e) {
        console.error("Erreur de parsing user :", e);
        setAuthorized(false);
        setLoading(false);
        return;
      }

      // Vérifie que le rôle est autorisé
      if (roles.length > 0 && !roles.includes(user.role)) {
        setAuthorized(false);
        setLoading(false);
        return;
      }

      try {
        // Vérifie que le token est encore valide
        await API.get("users/me/");
        setAuthorized(true);
      } catch (err) {
        // Si token expiré, essaie de rafraîchir
        if (refresh) {
          try {
            const res = await API.post("token/refresh/", { refresh });
            localStorage.setItem("access", res.data.access);
            setAuthorized(true);
          } catch {
            setAuthorized(false);
          }
        } else {
          setAuthorized(false);
        }
      } finally {
        setLoading(false);
      }
    }

    checkAuth();
  }, [roles]);

  if (loading) return <p>⏳ Vérification de l’authentification...</p>;

  // 🚪 Si non autorisé → redirection vers login
  if (!authorized) return <Navigate to="/login" replace />;

  // ✅ Sinon on rend la page protégée
  return children;
}
