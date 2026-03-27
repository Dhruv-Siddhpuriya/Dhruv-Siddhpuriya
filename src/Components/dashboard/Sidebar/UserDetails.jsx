import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL } from "../../../config/api";
import styles from "../../css/UserDetails.module.css";
import { DataGrid } from "@mui/x-data-grid";

const UserDetails = () => {
  const { id } = useParams();
  const token = sessionStorage.getItem("token");

  const [user, setUser] = useState(null);
  const [devices, setDevices] = useState([]);

  useEffect(() => {
    fetchUser();
    fetchDevices();
  }, [id]);

  const fetchUser = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchDevices = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/devices/user/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDevices(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  if (!user) return <h2>Loading...</h2>;

  // DataGrid Columns
  const columns = [
    { field: "deviceId", headerName: "Device ID", flex: 1 },
    { field: "deviceName", headerName: "Device Name", flex: 1 },
    {
      field: "isActive",
      headerName: "Status",
      flex: 1,
      renderCell: (params) => (
        <span
          className={
            params.value ? styles.active : styles.inactive
          }
        >
          {params.value ? "Active" : "Inactive"}
        </span>
      ),
    },
  ];

  // DataGrid Rows
  const rows = devices.map((device) => ({
    id: device._id,
    deviceId: device.deviceId,
    deviceName: device.deviceName,
    isActive: device.isActive,
  }));

  return (
    <div className={styles.wrapper}>
      <div className={styles.card}>
        <h2>User Details</h2>

        <div className={styles.grid}>
          <div><strong>First Name:</strong> {user.firstName}</div>
          <div><strong>Last Name:</strong> {user.lastName}</div>
          <div><strong>Email:</strong> {user.email}</div>
          <div><strong>Phone:</strong> {user.phone}</div>
          <div><strong>Role:</strong> {user.role?.roleName}</div>
          <div><strong>City:</strong> {user.city}</div>
          <div><strong>State:</strong> {user.state}</div>
          <div><strong>Country:</strong> {user.country}</div>
        </div>

        <h3 className={styles.deviceTitle}>Devices</h3>

        {devices.length > 0 ? (
         <div style={{ height: 450, width: "100%", overflowX: "auto" }}>
         <DataGrid
           rows={rows}
           columns={columns}
           pageSizeOptions={[10, 20, 50]}
           initialState={{
             pagination: {
               paginationModel: { pageSize: 10, page: 0 },
             },
           }}
           disableRowSelectionOnClick
           disableColumnMenu
           disableDensitySelector
           disableSelectionOnClick
           showToolbar
           sx={{
             fontSize: "16px", // row font size
             minWidth: 700,
             "& .MuiDataGrid-columnHeaders": {
               fontSize: "18px", // header font size
               fontWeight: "bold",
             },
             "& .MuiDataGrid-cell": {
               fontSize: "17px",
             },
             "& .MuiDataGrid-cell:focus": {
              outline: "none",
            },
            "& .MuiDataGrid-cell:focus-within": {
              outline: "none",
            },
        
            "& .MuiDataGrid-columnHeader:focus": {
              outline: "none",
            },
           }}
         />
       </div>
        ) : (
          <p>No devices added</p>
        )}
      </div>
    </div>
  );
};

export default UserDetails;