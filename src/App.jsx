import './App.css'
import MainForm from './Components/registration-page/MainForm'
import LoginForm from './Components/login-page/Login'
import Dashboard from './Components/dashboard/Dashboard'
import Layout from './Components/dashboard/Sidebar/Layout'
import Devices from "./Components/dashboard/Sidebar/Devices"
import MyProfile from './Components/dashboard/MyProfile'
import AddRoles from "./Components/dashboard/Sidebar/addRoles";
import Users from "./Components/dashboard/Sidebar/Users";
import UserDetails from "./Components/dashboard/Sidebar/UserDetails";
import AdminRoute from "./Components/routes/AdminRoute";
import CustomFields from './Components/dashboard/CustomFields'
import DeviceDetails from "./Components/dashboard/Sidebar/DeviceDetails";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ActivityLogs from './Components/dashboard/Sidebar/activity-logs';
function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<LoginForm />} />
        <Route path="/register" element={<MainForm />} />

        {/* ✅ FIXED LAYOUT ROUTE */}
        <Route path="/" element={<Layout />}>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="devices" element={<Devices />} />
          <Route path="device/:id" element={<DeviceDetails />} />
          <Route path="profile" element={<MyProfile />} />
          <Route path="add-roles" element={<AdminRoute><AddRoles /></AdminRoute>} />
          <Route path="users" element={<AdminRoute><Users /></AdminRoute>} />
          <Route path="users/:id" element={<AdminRoute><UserDetails /></AdminRoute>} />
          <Route path="custom-fields" element={<AdminRoute><CustomFields /></AdminRoute>} />
          <Route path="activity-logs" element={<AdminRoute><ActivityLogs /></AdminRoute>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
