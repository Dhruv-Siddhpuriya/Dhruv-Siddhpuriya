import { useEffect, useState } from "react";
import axios from "axios";
import { API_BASE_URL } from "../../../config/api";
import styles from "../../css/Users.module.css";
import Alert from '@mui/material/Alert';
import Snackbar from "@mui/material/Snackbar";
import { useNavigate } from "react-router-dom";
import { DataGrid } from "@mui/x-data-grid";
import { MenuItem, Select, Button } from "@mui/material";
import Slide from "@mui/material/Slide";
const Users = () => {
  const token = sessionStorage.getItem("token");

  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [selectedRowIds, setSelectedRowIds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [alertState, setAlertState] = useState({
    open: false,
    message: "",
    severity: "success"
  });
  const navigate = useNavigate();

  // Store selected roles temporarily
  const [selectedRoles, setSelectedRoles] = useState({});
 
 
  const fetchData = async () => {
    try {
      setLoading(true);
  
      const userRes = await axios.get(`${API_BASE_URL}/api/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
  
      let userSearch = userRes.data;
  
  
      setUsers(userSearch);
  
      const roleRes = await axios.get(`${API_BASE_URL}/api/roles`, {
        headers: { Authorization: `Bearer ${token}` },
      });
  
      setRoles(roleRes.data);
  
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Store selected role locally
  const handleRoleChange = (userId, roleId) => {
    setSelectedRoles({
      ...selectedRoles,
      [userId]: roleId,
    });
  };

  // Submit role to backend
  const saveRole = async (userId) => {
    const roleId = selectedRoles[userId];

    if (!roleId) {
      alert("Please select a role first");
      return;
    }

    try {
      await axios.put(
        `${API_BASE_URL}/api/users/${userId}/role`,
        { roleId },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

    // 🔥 Find user object
    const user = users.find(u => u._id === userId);

    // 🔥 Find role object
    const role = roles.find(r => r._id === roleId);
    await fetchData();
    setAlertState({
      open: true,
      message: ` ${user?.firstName || "User"} is Now ${role?.roleName || "updated"}`,
      severity: "success"
    });
   
    } catch (error) {
      console.error(error);
      alert("Error updating role");
    }
  };
  const deleteSelectedUsers = async () => {
    if (selectedRowIds.length === 0) return;
  
    if (!window.confirm("Are you sure you want to Remove Users?")) return;
  
    // Step 1: Find selected user objects
    const selectedUsers = users.filter(user =>
      selectedRowIds.includes(user._id)
    );
  
    // Step 2: Separate Admin and Non-Admin
    const adminUsers = selectedUsers.filter(
      user => user.role?.roleName === "Admin"
    );
  
    const deletableUsers = selectedUsers.filter(
      user => user.role?.roleName !== "Admin"
    );
  
    // Step 3: If Admin found → show message
    if (adminUsers.length > 0) {
      setAlertState({
        open: true,
        message: "Admin cannot be deleted",
        severity: "error"
      });
      return;
    } 
  
    // Step 4: If nothing to delete
    if (deletableUsers.length === 0) {
      return;
    }
     
    // Step 5: Get IDs to delete
    const deletableIds = deletableUsers.map(user => user._id);
  
    try {
      await axios.delete(`${API_BASE_URL}/api/users`, {
        headers: { Authorization: `Bearer ${token}` },
        data: { userIds: deletableIds },
      });
  
    
  
      setSelectedRowIds([]);
     await fetchData();
      setAlertState({
        open: true,
        message: `${deletableIds.length} user(s) deleted`,
        severity: "success"
      });
      
    } catch (err) {
      console.error(err);
    }
  };
 // ================= DATAGRID ROWS =================
 const rows = users.map((user, index) => ({
  id: user._id,
  sr_no: index + 1,
  name: user.firstName,
  email: user.email,
  roleId: selectedRoles[user._id] || user.role?._id || "",
  original: user,
}));

// ================= DATAGRID COLUMNS =================
const columns = [
  {
    field: "sr_no",
    headerName: "Sr.no",
    width: 90,
  },
  {
    field: "name",
    headerName: "Name",
    flex: 1,
    renderCell: (params) => (
      <span
        style={{ cursor: "pointer", color: "#1976d2" }}
        onClick={() => navigate(`/users/${params.row.id}`)}
      >
        {params.value}
      </span>
    ),
  },
  {
    field: "email",
    headerName: "Email",
    flex: 1.5,
    renderCell: (params) => (
      <span
        style={{ cursor: "pointer", color: "#1976d2" }}
        onClick={() => navigate(`/users/${params.row.id}`)}
      >
        {params.value}
      </span>
    ),
  },
  {
    field: "role",
    headerName: "Select Role",
    flex: 1,
    sortable: false,
filterable: false,
disableColumnMenu: true,
    renderCell: (params) => (
      <Select
  size="small"
  fullWidth
  displayEmpty
  value={
    selectedRoles[params.row.id] ||
    params.row.original.role?._id ||
    ""
  }
  onChange={(e) =>
    handleRoleChange(params.row.id, e.target.value)
  }
  renderValue={(selected) => {
    if (!selected) {
      return <span style={{ color: "#888" }}>Select Role</span>;
    }

    const role = roles.find(r => r._id === selected);
    return role ? role.roleName : "";
  }}
>
 

  {roles.map((role) => (
    <MenuItem key={role._id} value={role._id}>
      {role.roleName}
    </MenuItem>
  ))}
</Select>
    ),
  },
  {
    field: "action",
    headerName: "Action",
    width: 80,
    sortable: false,
filterable: false,
disableColumnMenu: true,

    renderCell: (params) => (
      <Button className={styles.saveBtn}
        variant="contained"
        size="small"
        onClick={() => saveRole(params.row.id)}
      >
        Save
      </Button>
    ),
  },
];


  return (
    <div className={styles.wrapper}>
     <Snackbar
  open={alertState.open}
  autoHideDuration={3000}
  onClose={(event, reason) => {
    if (reason === "clickaway") return;
    setAlertState(prev => ({ ...prev, open: false }));
  }}
  anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
    TransitionComponent={(props) => <Slide {...props} direction="left" />}
    sx={{
      zIndex: 9999, // 🔥 ensures it stays above DataGrid
    }}
>
  <Alert
     severity={alertState.severity}
     variant="filled"
     sx={{
       backgroundColor:
         alertState.severity === "success"
           ? "#065f46"   // solid dark green
           : "#7f1d1d",  // solid dark red
       color: "#fff",
       boxShadow: "0 15px 40px rgba(0,0,0,0.7)",
       borderRadius: "12px",
       fontWeight: 500,
       minWidth: "320px",
       opacity: 1,        // 🔥 force full visibility
     }}
   >
     {alertState.message}
   </Alert>
</Snackbar>
    <div className={styles.container}>
      <h2 className={styles.title}>User Roles</h2>
     
        {/* ============= SEARCH ============= */}
       
      {/* ============= DATAGRID ============= */}
      <div
  style={{
    height: 600,
    width: "100%",
    overflowX: "auto"
  }}
>
  
<DataGrid
  loading={loading}
  rows={rows}
  columns={columns}
  pageSizeOptions={[10, 20, 50]}
  
  initialState={{
    pagination: {
      paginationModel: { pageSize: 20, page: 0 },
    },
  }}

  checkboxSelection
  disableRowSelectionOnClick
  showToolbar

  onRowSelectionModelChange={(selectionModel) => {
    let idsArray = [];

    if (selectionModel.ids) {
      const idsSet = selectionModel.ids;
      const allRowIds = rows.map(row => row.id);

      if (selectionModel.type === "include") {
        idsArray = Array.from(idsSet);
      }

      if (selectionModel.type === "exclude") {
        idsArray = allRowIds.filter(id => !idsSet.has(id));
      }
    } else {
      idsArray = selectionModel;
    }

    setSelectedRowIds(idsArray);
  }}

  sx={{
    backgroundColor: "#fff",
    minWidth: 700,
    fontSize: 17,

    "& .MuiDataGrid-columnHeaders": {
      position: "sticky",
      top: 0,
      backgroundColor: "#fff",
      zIndex: 1,
    },

    /* 🔴 remove blue focus on cells */
    "& .MuiDataGrid-cell:focus": {
      outline: "none",
    },
    "& .MuiDataGrid-cell:focus-within": {
      outline: "none",
    },

    /* 🔴 remove blue focus on header */
    "& .MuiDataGrid-columnHeader:focus": {
      outline: "none",
    },

    /* 🔴 remove row selection color */
    "& .Mui-selected": {
      backgroundColor: "transparent !important",
    },
  }}
/>
<div className={styles.btn}>
  <Button
    variant="contained"
    color="error"
    onClick={deleteSelectedUsers}
  >
    Delete Selected ({selectedRowIds.length})
  </Button>
</div>    
        </div>
         
    </div>
    </div>
  );
};

export default Users;
