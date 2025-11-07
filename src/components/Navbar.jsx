import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import API from "../api";

// 🔔 Composant Dropdown de notifications
function NotificationsDropdown({ notifications, onClickNotification }) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);
  const unreadCount = notifications.filter((n) => !n.lue).length;

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setOpen(!open)}
        className="relative text-2xl hover:scale-110 transition-transform duration-200"
      >
        🔔
        {unreadCount > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs rounded-full px-2">
            {unreadCount}
          </span>
        )}
      </button>

      {open && (
        <ul className="absolute right-0 mt-2 w-72 bg-white border border-gray-200 rounded-lg shadow-xl z-50 animate-fadeIn">
          {notifications.length === 0 ? (
            <li className="p-4 text-gray-500 text-sm text-center">
              Aucune notification
            </li>
          ) : (
            notifications.map((notif) => (
              <li
                key={notif.id}
                onClick={() => {
                  onClickNotification(notif);
                  setOpen(false);
                }}
                className={`p-3 text-sm cursor-pointer hover:bg-blue-50 transition ${
                  notif.lue ? "text-gray-500" : "font-semibold text-gray-900"
                }`}
              >
                {notif.message}
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}

// 🌍 Navbar principale
export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [notifications, setNotifications] = useState([]);

  const user = (() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch {
      return null;
    }
  })();

  const token = localStorage.getItem("access");

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  // 🔹 Chargement notifications
  useEffect(() => {
    if (!user || !token) return;

    const fetchNotifications = async () => {
      try {
        const res = await API.get("notifications/"); // API corrigée avec localhost
        setNotifications(res.data);
      } catch (err) {
        console.error("⚠️ Erreur chargement notifications :", err);
      }
    };

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [user, token]);

  const handleNotificationClick = async (notif) => {
    try {
      await API.patch(`notifications/${notif.id}/`, { lue: true });
      setNotifications((prev) =>
        prev.map((n) => (n.id === notif.id ? { ...n, lue: true } : n))
      );
      navigate(`/news/${notif.news}`);
    } catch (err) {
      console.error("⚠️ Erreur marquage notification :", err);
    }
  };

  // Masquer la navbar sur certaines pages
  if (["/login", "/register"].includes(location.pathname)) return null;

  return (
    <nav className="navbar flex justify-between items-center px-6 py-4 bg-white shadow-md sticky top-0 z-50">
      <h1
        className="text-2xl font-bold text-blue-700 cursor-pointer hover:text-blue-800 transition-colors"
        onClick={() => navigate("/")}
      >
        📰 NewsPlatform
      </h1>

      <div className="flex items-center gap-5">
        {user ? (
          <>
            <span className="text-gray-700 font-medium">👤 {user.username}</span>
            <NotificationsDropdown
              notifications={notifications}
              onClickNotification={handleNotificationClick}
            />
            <button
              onClick={handleLogout}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              Se déconnecter
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => navigate("/login")}
              className="text-blue-600 hover:underline"
            >
              Connexion
            </button>
            <button
              onClick={() => navigate("/register")}
              className="text-blue-600 hover:underline"
            >
              Inscription
            </button>
          </>
        )}
      </div>
    </nav>
  );
}
