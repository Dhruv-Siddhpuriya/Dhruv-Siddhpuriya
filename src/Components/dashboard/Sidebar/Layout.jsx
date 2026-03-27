import { NavLink, Outlet, useLocation } from "react-router-dom";
import React, { useState } from "react";
import styles from "../../css/Layout.module.css";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../../../config/api";
import axios from "axios";
import { Button } from "@mui/material";

const Layout = () => {
  const user = JSON.parse(sessionStorage.getItem("user"));
  const role = user?.role;


  const navigate = useNavigate();
  const location = useLocation();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [rolesOpen, setRolesOpen] = useState(false);
  const [touchStartX, setTouchStartX] = useState(null);
const [touchEndX, setTouchEndX] = useState(null);

const minSwipeDistance = 5; // minimum px to detect swipe

const onTouchStart = (e) => {
  setTouchEndX(null); // reset
  setTouchStartX(e.targetTouches[0].clientX);
};

const onTouchMove = (e) => {
  setTouchEndX(e.targetTouches[0].clientX);
};

const onTouchEnd = () => {
  if (!touchStartX || !touchEndX) return;

  const distance = touchStartX - touchEndX;

  // Swipe left
  if (distance > minSwipeDistance) {
    setSidebarOpen(false);
  }
};
const isRolesActive =
location.pathname.startsWith("/add-roles") ||
location.pathname.startsWith("/users") ||
location.pathname.startsWith("/custom-fields") ||
location.pathname.startsWith("/activity-logs");

  const handleLogout = async () => {
   
    if (!window.confirm("Are you sure you want to LogOut?")) return;
    const sessionId = sessionStorage.getItem("sessionId");

    await axios.post(`${API_BASE_URL}/logout`, {
      sessionId: sessionStorage.getItem("sessionId"),
    });

    sessionStorage.clear();
    navigate("/");
  };
  const isDevicesActive = location.pathname.startsWith("/devices") 
  || location.pathname.startsWith("/device");
  return (
    <>
      {/* Mobile Hamburger */}
      <button
        className={styles.menuBtn}
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        ☰
      </button>

      {/* Overlay (mobile only) */}
      {sidebarOpen && (
        <div
          className={styles.overlay}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className={styles.layout}>
        <aside
          className={`${styles.sidebar} ${
            sidebarOpen ? styles.open : ""
          }`}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          <h2 className={styles.logo}>
             {role === "Admin" ? "Admin Panel" : role === "Manager" ? "Manager Panel" : "User Panel"}
          </h2>

          <NavLink to="/dashboard" className={({ isActive }) =>
            isActive ? `${styles.link} ${styles.active}` : styles.link
          } onClick={() => setSidebarOpen(false)}>
            Dashboard
          </NavLink>

          <NavLink
  to="/devices"
  className={`${styles.link} ${
    isDevicesActive ? styles.active : ""
  }`}
  onClick={() => setSidebarOpen(false)}
>
  Devices
</NavLink>
         
          {role === "Admin" && (
  <div className={styles.menuGroup}>
    <div
      className={`${styles.link} ${
        isRolesActive ? styles.active : ""
      }`}
      onClick={() => setRolesOpen(!rolesOpen)}
      style={{ cursor: "pointer" }}
    >
      Roles & Fields {rolesOpen ? "▾" : "▸"}
    </div>

    <div
      className={`${styles.subMenu} ${
        rolesOpen ? styles.openMenu : styles.closeMenu
      }`}
    >
      <NavLink
        to="/add-roles"
        className={({ isActive }) =>
          isActive
            ? `${styles.sublink} ${styles.active}`
            : styles.sublink
        }
        onClick={() => setSidebarOpen(false)}
      >
        Add Roles
      </NavLink>

      <NavLink
        to="/users"
        className={({ isActive }) =>
          isActive
            ? `${styles.sublink} ${styles.active}`
            : styles.sublink
        }
        onClick={() => setSidebarOpen(false)}
      >
        Users
      </NavLink>

      <NavLink
        to="/custom-fields"
        className={({ isActive }) =>
          isActive
            ? `${styles.sublink} ${styles.active}`
            : styles.sublink
        }
        onClick={() => setSidebarOpen(false)}
      >
        Custom Fields
      </NavLink>
      
      <NavLink
        to="/activity-logs"
        className={({ isActive }) =>
          isActive
            ? `${styles.sublink} ${styles.active}`
            : styles.sublink
        }
        onClick={() => setSidebarOpen(false)}
      >
        Activity Logs
      </NavLink>
    </div>
  </div>
)}

            

      
          <NavLink to="/profile" className={({ isActive }) =>
            isActive ? `${styles.link} ${styles.active}` : styles.link
          } onClick={() => setSidebarOpen(false)}>
             My Profile
          </NavLink>
         
            
         

          <div className={styles.bottomSection}>
  <Button
    variant="contained"
    className={styles.logoutBtn}
    onClick={handleLogout}
  >
    Logout
  </Button>

  <div className={styles.bottom}>
    Logged in as <strong>{user.firstName}</strong>
  </div>
</div>
        </aside>

        <main className={styles.content}>
          <Outlet />
        </main>
      </div>
    </>
  );
};  

export default Layout;
