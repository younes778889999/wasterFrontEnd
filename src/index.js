import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import 'rsuite/dist/rsuite.min.css';
import { AuthProvider } from "./contexts/AuthContext";

import "assets/plugins/nucleo/css/nucleo.css";
import "assets/scss/argon-dashboard-react.scss";

import HLayout from "layouts/HLayout.js";
import Login from "views/examples/Login.js"; 
import TrackPanel from "layouts/TrackPanel";
import AddComplaints from "views/examples/AddComplaints.js";

const root = ReactDOM.createRoot(document.getElementById("root"));
const isAuthenticated = () => {
  return !!localStorage.getItem('token');
};

const getUserType = () => {
  return localStorage.getItem('role');
};


root.render(
  <AuthProvider>
    <BrowserRouter>
      <Routes>
        {/* Add the login page as the default route */}
        <Route path="/auth/login" element={<Login />} />

        {/* Anonymous Complaints Page */}
        <Route path="/add-complaints" element={<AddComplaints />} />

        {/* Admin pages (protected) */}
        <Route path="/admin/*" element={isAuthenticated() && getUserType() === 'admin' ? <HLayout /> : <Navigate to="/auth/login" />} />

        {/* Manager pages (protected) */}
        <Route path="/manager_user/*" element={isAuthenticated() && getUserType() === 'manager_user' ? <HLayout /> : <Navigate to="/auth/login" />} />

        {/* Employee pages (protected) */}
        <Route path="/employee_user/*" element={isAuthenticated() && getUserType() === 'employee_user' ? <HLayout /> : <Navigate to="/auth/login" />} />

        {/* Track pages (protected) */}
        <Route path="/truck_user/*" element={isAuthenticated() && getUserType() === 'truck_user' ? <TrackPanel /> : <Navigate to="/auth/login" />} />

        <Route path="*" element={<Navigate to="/auth/login" replace />} />
      </Routes>
    </BrowserRouter>
  </AuthProvider>
);
