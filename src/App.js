// src/App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Feed from "./pages/Feed";
import MyPosts from "./pages/MyPosts";
import PendingNews from "./pages/PendingNews";
import AdminDashboard from "./pages/AdminDashboard";
import Profile from "./pages/Profile";
import Inviter from "./pages/Inviter";

import Navbar from "./components/Navbar";
import PrivateRoute from "./components/PrivateRoute";

import "./App.css";

export default function App() {
  return (
    <Router>
      <Navbar />
      <div className="app-background">
        <Routes>
          {/* Utilisateur sans rôle */}
          <Route path="/inviter" element={<Inviter />} />

          {/* Étudiant / Publisher / Modérateur / Admin */}
          <Route
            path="/"
            element={
              <PrivateRoute roles={["student", "admin", "moderator", "publisher"]}>
                <Feed />
              </PrivateRoute>
            }
          />

          {/* Auth */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Publisher */}
          <Route
            path="/myposts"
            element={
              <PrivateRoute roles={["publisher", "admin"]}>
                <MyPosts />
              </PrivateRoute>
            }
          />

          {/* Modérateur */}
          <Route
            path="/moderation"
            element={
              <PrivateRoute roles={["moderator", "admin"]}>
                <PendingNews />
              </PrivateRoute>
            }
          />

          {/* Admin */}
          <Route
            path="/admin"
            element={
              <PrivateRoute roles={["admin"]}>
                <AdminDashboard />
              </PrivateRoute>
            }
          />

          {/* Profil utilisateur */}
          <Route
            path="/profile"
            element={
              <PrivateRoute roles={["student", "admin", "moderator", "publisher"]}>
                <Profile />
              </PrivateRoute>
            }
          />

          {/* Redirection par défaut */}
          <Route path="*" element={<Inviter />} />
        </Routes>
      </div>
    </Router>
  );
}
