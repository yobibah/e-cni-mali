import "./App.css";
import { Routes, Route, useLocation, Navigate } from "react-router-dom";

import Home from "./pages/Home.jsx";
import Demande from "./pages/Demande.jsx";
import Login from "./pages/(auth)/login.jsx";
import Inscription from "./pages/(auth)/inscription.jsx";
import Centres from "./pages/Centre.jsx";
import SuivreDemande from "./pages/suiviDemande.jsx";
import Profile from "./pages/profil.jsx";
import Forgot from "./pages/(auth)/forgot.jsx";
import Reset from "./pages/(auth)/reset.jsx";
import { Aide } from "./pages/Aide.jsx";

import Dashboard from "./pages/admin/pages/dashbord.jsx";
import Demandeur from "./pages/admin/pages/Demandeur.jsx";
import Payement from "./pages/admin/pages/payement.jsx";
import AdminDemande from "./pages/admin/pages/Admindemandes.jsx";
import CentreA from "./pages/admin/pages/CentreA.jsx";
import Parametres from "./pages/admin/pages/parametres.jsx";
import AdminLogin from "./pages/admin/(auth)/login.jsx";

import Cookies from "js-cookie";
import { Toaster } from "sonner";

function isAuthenticated() {
  const token = Cookies.get("token");

  if (!token) return false;

  try {
    const payload = JSON.parse(atob(token.split(".")[1]));

    if (payload.exp * 1000 < Date.now()) {
      Cookies.remove("token", { path: "/" });
      return false;
    }

    return true;
  } catch (error) {
    console.error("Erreur token utilisateur :", error);
    Cookies.remove("token", { path: "/" });
    return false;
  }
}

function isAdminAuthenticated() {
  const token = Cookies.get("AdminToken");

  if (!token) return false;

  try {
    const payload = JSON.parse(atob(token.split(".")[1]));

    if (payload.exp * 1000 < Date.now()) {
      Cookies.remove("AdminToken", { path: "/" });
      return false;
    }

    return true;
  } catch (error) {
    console.error("Erreur token admin :", error);
    Cookies.remove("AdminToken", { path: "/" });
    return false;
  }
}

function isReset() {
  const tel = localStorage.getItem("telephone");
  return !!tel;
}

function PrivateRoute({ children }) {
  return isAuthenticated() ? (
    children
  ) : (
    <Navigate to="/connexion" replace />
  );
}

function PublicRoute({ children }) {
  return !isAuthenticated() ? (
    children
  ) : (
    <Navigate to="/suivre-demande" replace />
  );
}

function ResetRoute({ children }) {
  return isReset() ? (
    children
  ) : (
    <Navigate to="/connexion" replace />
  );
}

function AdminRoute({ children }) {
  return isAdminAuthenticated() ? (
    children
  ) : (
    <Navigate to="/admin/login" replace />
  );
}

function AdminPublicRoute({ children }) {
  return !isAdminAuthenticated() ? (
    children
  ) : (
    <Navigate to="/admin/dashboard" replace />
  );
}

function App() {
  const location = useLocation();
  const authenticated = isAuthenticated();

  return (
    <>
      <Toaster position="top-right" richColors />

      <Routes location={location}>
        <Route
          path="/"
          element={
            authenticated ? (
              <Navigate to="/suivre-demande" replace />
            ) : (
              <Home />
            )
          }
        />

        <Route
          path="/connexion"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />

        <Route
          path="/inscription"
          element={
            <PublicRoute>
              <Inscription />
            </PublicRoute>
          }
        />

        <Route
          path="/forgot-password"
          element={
            <PublicRoute>
              <Forgot />
            </PublicRoute>
          }
        />

        <Route path="/centres" element={<Centres />} />
        <Route path="/aides" element={<Aide />} />

        <Route
          path="/reset"
          element={
            <ResetRoute>
              <Reset />
            </ResetRoute>
          }
        />

        <Route
          path="/admin/login"
          element={
            <AdminPublicRoute>
              <AdminLogin />
            </AdminPublicRoute>
          }
        />

        <Route
          path="/admin/dashboard"
          element={
            <AdminRoute>
              <Dashboard />
            </AdminRoute>
          }
        />

        <Route
          path="/admin/demandeur"
          element={
            <AdminRoute>
              <Demandeur />
            </AdminRoute>
          }
        />

        <Route
          path="/admin/utilisateur/demande"
          element={
            <AdminRoute>
              <AdminDemande />
            </AdminRoute>
          }
        />

        <Route
          path="/admin/paiement"
          element={
            <AdminRoute>
              <Payement />
            </AdminRoute>
          }
        />

        <Route
          path="/admin/centres"
          element={
            <AdminRoute>
              <CentreA />
            </AdminRoute>
          }
        />

        <Route
          path="/admin/parametres"
          element={
            <AdminRoute>
              <Parametres />
            </AdminRoute>
          }
        />

        <Route
          path="/demande"
          element={
            <PrivateRoute>
              <Demande />
            </PrivateRoute>
          }
        />

        <Route
          path="/profil"
          element={
            <PrivateRoute>
              <Profile />
            </PrivateRoute>
          }
        />

        <Route
          path="/suivre-demande"
          element={
            <PrivateRoute>
              <SuivreDemande />
            </PrivateRoute>
          }
        />

        <Route
          path="*"
          element={
            authenticated ? (
              <Navigate to="/suivre-demande" replace />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />
      </Routes>
    </>
  );
}

export default App;
