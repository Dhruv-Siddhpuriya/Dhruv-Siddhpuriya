import { useState, useEffect } from "react";
import axios from "axios";
import {API_BASE_URL} from "../../../config/api";
import { DataGrid } from "@mui/x-data-grid";
import styles from "../../css/ActivityLogs.module.css";
const ActivityLogs = () => {

  const [rows, setRows] = useState([]);


   useEffect(() => {
    fetchLogs();
   }, []);
  const fetchLogs = async () => {
    try {
        const token = sessionStorage.getItem("token");
    
        const res = await axios.get(`${API_BASE_URL}/api/activity-logs`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

      const formattedLogs = res.data.map((item,index) => ({
        id: item._id,
        index: index + 1,
        name: item.name || "N/A", // ✅ ADD THIS
        userId: item.userId,
        registeredAt: formatIST(item.registeredAt),
        loginTime: formatIST(item.loginTime),
        ipAddress: item.ipAddress || "N/A",
        device: item.device || "Unknown",
      }));
      setRows(formattedLogs);
    }catch(err){
        console.error("API ERROR:", err.response?.data || err.message);
    }
  }
  const formatIST = (dateString) => {
    if (!dateString) return "N/A";
  
    return new Date(dateString).toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true
    });
  };
  const columns = [
    { field: "index", headerName: "", width: 70 },
    {field: "userId", headerName: "User ID", flex: 1 },
    { field: "name", headerName: "User Name", flex: 1 },
    { field: "registeredAt", headerName: "Registered At", flex: 1 },
    { field: "loginTime", headerName: "Login Time", flex: 1 },
    { field: "ipAddress", headerName: "IP Address", flex: 1 },
    { field: "device", headerName: "Device", flex: 1 },
  ];

    return (
        <div className={styles.container}>
        <div className={styles.card}>
          <h2 className={styles.title}>Activity Logs</h2>
  
          <div style={{  height: 610,
    width: "100%",
    overflowX: "auto"}}>
            <DataGrid
              rows={rows}
              columns={columns}
              pageSizeOptions={[10,20,50]}
              initialState={{
                pagination: {
                  paginationModel: { pageSize: 20, page: 0 },
                },
              }}

  disableRowSelectionOnClick
  disableColumnMenu
  disableDensitySelector
  disableSelectionOnClick
  showToolbar
              className={styles.dataGrid}
              sx={{
                backgroundColor: "#fff",
                minWidth: 700,
                fontSize: 17,
            
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
        </div>
      </div>
    )
}
export default ActivityLogs;