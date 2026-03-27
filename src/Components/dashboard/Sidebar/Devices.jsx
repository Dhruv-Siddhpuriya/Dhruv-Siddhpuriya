  import { useEffect, useState } from "react";
  import axios from "axios";
  import { API_BASE_URL } from "../../../config/api";
  import styles from "../../css/Devices.module.css";
  import { useNavigate } from "react-router-dom"; 
  import { Button } from '@mui/material';
  import Alert from '@mui/material/Alert';
import Snackbar from "@mui/material/Snackbar";
import { DataGrid } from "@mui/x-data-grid";
import TextField from "@mui/material/TextField";
import Switch from "@mui/material/Switch";
import Stack from "@mui/material/Stack";
import Grid from "@mui/material/Grid";
import Slide from "@mui/material/Slide";
import { MenuItem } from "@mui/material";
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
  const Devices = () => {
    const user = JSON.parse(sessionStorage.getItem("user"));
    const token = sessionStorage.getItem("token");
    const navigate = useNavigate();
    const [customFields, setCustomFields] = useState([]);
    const [devices, setDevices] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [deviceName, setDeviceName] = useState("");
    const [customFieldValues, setCustomFieldValues] = useState({});
    const [images, setImages] = useState([]);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [alertState, setAlertState] = useState({
      open: false,
      message: "",
      severity: "success"
    });
 
    const countries = [
      "India",
      "Russia",
      "Canada",
      "China",
      "USA",
      "UK",
      "Germany",
      "France"
    ];
    const whiteTextFieldStyle = {
      "& .MuiInputBase-input": {
        color: "#fff",  // normal text field text
      },
    
      "& .MuiSelect-select": {
        color: "#fff",  // dropdown selected value text
      },
    
      "& .MuiInputLabel-root": {
        color: "#fff",
      },
    
      "& .MuiInputLabel-root.Mui-focused": {
        color: "#fff",
      },
    
      "& .MuiOutlinedInput-root": {
    
        "& fieldset": {
          borderColor: "#fff",
        },
        "&:hover fieldset": {
          borderColor: "#fff",
        },
        "&.Mui-focused fieldset": {
          borderColor: "#fff",
        },
      },
    };
    const renderCustomField = (field, index) => {
      const handleChange = (value) => {
        setCustomFieldValues(prev => ({
          ...prev,
          [field.label]: value
        }));
      };
    
      switch (field.type) {
    
        case "text":
          return (
            
            <TextField
              key={index}
              fullWidth
              label={field.label}
              variant="outlined"
              size="small"
              value={customFieldValues[field.label] || ""}
              onChange={(e) => handleChange(e.target.value)}
              sx={whiteTextFieldStyle}
            />
          );
    
        case "date":
          return (
            <TextField
              key={index}
              fullWidth
              type="date"
              label={field.label}
              variant="outlined"
              size="small"
              InputLabelProps={{ shrink: true }}
              value={customFieldValues[field.label] || ""}
              onChange={(e) => handleChange(e.target.value)}
              sx={whiteTextFieldStyle}
            />
          );
    
        case "dropdown":
          return (
            <TextField
              key={index}
              fullWidth
              select
              label={field.label}
              variant="outlined"
              size="small"
              value={customFieldValues[field.label] || ""}
              onChange={(e) => handleChange(e.target.value)}
              sx={{
                ...whiteTextFieldStyle,
                "& .MuiOutlinedInput-root": {
                  height: 43,  // your custom height
              
                  "& fieldset": {
                    borderColor: "#fff",
                  },
                  "&:hover fieldset": {
                    borderColor: "#fff",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "#fff",
                  },
                },
              }}
            >
             
              {countries.map((country, i) => (
                <MenuItem key={i} value={country}>
                  {country}
                </MenuItem>
              ))}
            </TextField>
          );
    
        default:
          return null;
      }
    };
    
          useEffect(() => {
              const data = JSON.parse(localStorage.getItem("CustomFields")) || {};
              setCustomFields(data.devices || []);
            }, []);
            useEffect(() => {
              fetchDevices();
            }, []);
    const handleAuthError = (error) => {
      if (error.response?.status === 401) {
        // Token expired or invalid
        const message = error.response?.data?.message || "Session expired";
        
        // Show alert to user
        alert(message);
        
        // Clear session storage
        sessionStorage.removeItem("user");
        sessionStorage.removeItem("token");
        
        // Redirect to login page
        navigate("/");
        return true;
      }
      return false;
    };
    const fetchDevices = async () => {
    
    
      try {
        setLoading(true);
        const res = await axios.get(
        `${API_BASE_URL}/api/devices/user/${user.id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );
        
        let allDevices = res.data;
      
     
        
        setDevices(allDevices);
      
      
      } catch (error) {
        console.error("Fetch devices error:", error);
        
        // Check if it's an auth error
        if (!handleAuthError(error)) {
          // Handle other errors
          setError("Failed to fetch devices. Please try again.");
        
        }
      } finally {
        setLoading(false);
      }
    };
    
    const addDevice = async () => {
      if (!deviceName.trim()) {
        alert(`Device Name is required`);
        return};
      for (let field of customFields) {
        if (field.required) {
          const value = customFieldValues[field.label];
    
          if (!value || value.toString().trim() === "") {
            alert(`${field.label} is required`);
            return;
          }
        }
      }
      const formData = new FormData();

formData.append("userId", user.id);
formData.append("deviceName", deviceName);
formData.append("customFields", JSON.stringify(customFieldValues));

for (let i = 0; i < images.length; i++) {
  formData.append("images", images[i]);
}
      try {
        await axios.post(
          `${API_BASE_URL}/api/devices`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "multipart/form-data"
            }
          }
        );

        setDeviceName("");
        setShowForm(false);
       
        await fetchDevices();
        
        setAlertState({
          open: true,
          message: "Device Added Successfully",
          severity: "success"
        });
     
      } catch (error) {
        console.error("Add device error:", error);
        
        // Check if it's an auth error
        if (!handleAuthError(error)) {
          alert("Failed to add device: " + (error.response?.data?.message || error.message));
        }
      }
    };
    
    const toggleStatus = async (id, status) => {
      try {
        await axios.patch(
          `${API_BASE_URL}/api/devices/${id}`,
          { isActive: !status },
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );
        
        setDevices(prev =>
          prev.map(d =>
            d._id === id ? { ...d, isActive: !status } : d
          )
        );
      } catch (error) {
        console.error("Toggle status error:", error);
        
        // Check if it's an auth error
        if (!handleAuthError(error)) {
          alert("Failed to update device status: " + (error.response?.data?.message || error.message));
        }
      }
    };

    const removeDevice = async (id) => {
      const confirmDelete = window.confirm(
        "Are you sure you want to remove this device?"
      );
    
      if (!confirmDelete) return;
    
      try {
        await axios.delete(
          `${API_BASE_URL}/api/devices/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );
        
        setDevices(prev => prev.filter(d => d._id !== id));
        setAlertState({
          open: true,
          message: "Device Deleted Successfully",
          severity: "success"
        });
      } catch (error) {
        console.error("Remove device error:", error);
        
        // Check if it's an auth error
        if (!handleAuthError(error)) {
          if (error.response) {
            setAlertState({
              open: true,
              message: error.response.data.message,
              severity: "error"
            });
          } else {
            alert("Server error");
          }
        }
      }
    };
    // ================= DATAGRID ROWS =================
    const rows = devices.map((device, index) => ({
      id: device._id, // 🔥 REQUIRED (unique id)
      srNo: index + 1,
      deviceId: device.deviceId,
      deviceName: device.deviceName,
      isActive: device.isActive,
      ...(device.customFields || {})
    }));
    const baseColumns = [
      { field: "srNo", headerName: "Sr.no", flex: 0.5, },
    
      { field: "deviceId", headerName: "Device ID", flex: 1,renderCell: (params) => (
        <span
          style={{ cursor: "pointer", color: "#1976d2" }}
          onClick={() => navigate(`/device/${params.row.id}`)}
        >
          {params.value}
        </span>
      ), },
    
      { field: "deviceName", headerName: "Device Name", flex: 1 },
    ];
    
    const customColumns = customFields
      .filter(field => field.showInTable)
      .map(field => ({
        field: field.label,
        headerName: field.label,
        flex: 0.5,
        renderCell: (params) => {
          const value = params.row[field.label];
          return value && value !== "" ? value : "-";
        }
      }));
    
    const actionColumns = [
      {
        field: "status",
        headerName: "Status",
        flex: 0.8,
        sortable: false,
filterable: false,
disableColumnMenu: true,
        renderCell: (params) => (
          <span
            style={{
              color: params.row.isActive ? "green" : "red",
              fontWeight: "bold",
              
            }}
            
          >
           
            {params.row.isActive ? "Active" : "Inactive"}
          </span>
        ),
      },
      {
        field: "actions",
        headerName: "Actions",
        flex: 0.5,
        sortable: false,
filterable: false,
disableColumnMenu: true,
        
        renderCell: (params) => (
          <Stack direction="row" spacing={1} alignItems="center">
            
            {/* Toggle Switch */}
            <Switch
              checked={params.row.isActive}
              onClick={(e) => e.stopPropagation()}   // 🔥 ADD THIS
              onChange={() =>
                toggleStatus(params.row.id, params.row.isActive)
              }
              color="success"
            />
      
            {/* Delete Button */}
            <Button
              size="small"
              color="error"
              onClick={(e) => {
                e.stopPropagation();   // 🔥 ADD THIS
                removeDevice(params.row.id);
              }}
            >
              🗑️
            </Button>
      
          </Stack>
        ),
      }
    ];
    
    const columns = [...baseColumns, ...customColumns, ...actionColumns]; 
    return (
      <div className={styles.wrapper}>
 <Snackbar
  open={alertState.open}
  autoHideDuration={3000}
  sx={{
    zIndex: 9999,
    pointerEvents: "none"   // ⭐ IMPORTANT FIX
  }}
  onClose={(event, reason) => {
    if (reason === "clickaway") return;
    setAlertState(prev => ({ ...prev, open: false }));
  }}
  anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
  TransitionComponent={(props) => <Slide {...props} direction="left" />}
 
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
        <div className={styles.header}>
          <h2>📱 Devices</h2>

          <Button variant="contained"
            className={styles.addBtn}
            onClick={() => setShowForm(!showForm)}
          >
             Add Device
          </Button>
        </div>
        {showForm && (
          <div className={styles.form}>
            <div className={styles.formRow}>
            <TextField
  fullWidth
  label="Device Name"
  value={deviceName}
  onChange={(e) => setDeviceName(e.target.value)}
  variant="outlined"
  size="small"
  sx={{
    input: {
      color: "#fff", // typed text color
    },
    label: {
      color: "#fff", // label color
    },
    "& .MuiOutlinedInput-root": {
      "& fieldset": {
        borderColor: "#fff", // default border
      },
      "&:hover fieldset": {
        borderColor: "#fff", // hover border
      },
      "&.Mui-focused fieldset": {
        borderColor: "#fff", // focused border
      },
    },
    "& .MuiInputLabel-root.Mui-focused": {
      color: "#fff", // focused label color
    },
  }}
/>

    <Button
      component="label"
      role={undefined}
      variant="contained"
      tabIndex={-1}
      startIcon={<CloudUploadIcon />}
    >
      Upload files
      <input
  type="file"
  multiple
  hidden
  onChange={(event) => setImages([...event.target.files])}
/>  
    </Button>
            </div>
            {customFields.length >0 && (
                  <>
                  
                  <Grid container spacing={2}>
  {customFields.map((field, index) => (
    <Grid item xs={12} sm={6} md={6} lg={4} key={index}>
    <div style={{ minWidth: 250 }}>
      {renderCustomField(field, index)}
    </div>
  </Grid>
  ))}
</Grid>
                  </>
                )}
            <Button className={styles.savebtn} variant="contained" onClick={addDevice}>Save</Button>
          </div>
            
        )}
  

<div style={{
    height: 600,
    width: "100%",
    overflowX: "auto",
    marginTop: "20px"
  }}>
 <DataGrid
  rows={rows}
  columns={columns}
 
  loading={loading}
  pageSizeOptions={[10,20,50]}

  disableRowSelectionOnClick
  disableColumnMenu


  disableDensitySelector
  disableSelectionOnClick
  showToolbar
  initialState={{
    pagination: {
      paginationModel: { pageSize: 20, page: 0 },
    },
  }}

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
      
    );
  };
  
  export default Devices;