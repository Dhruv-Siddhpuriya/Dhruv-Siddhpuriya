import React, { useState } from "react";
import styles from "../css/CustomFields.module.css";
import Alert from '@mui/material/Alert';
import Snackbar from "@mui/material/Snackbar";
import Slide from "@mui/material/Slide";
import { Button, FormGroup } from '@mui/material';
import TextField from '@mui/material/TextField';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from "@mui/material";
const CustomFields = () => {
  const [module, setModule] = useState("");
  const [type, setType] = useState("");
  const [label, setLabel] = useState("");
  const[required, setRequired] = useState(false)
  const [showInTable, SetShowINTable] = useState(false);
  const [alertState, setAlertState] = useState({
    open: false,
    message: "",
    severity: "success"
  });
  const handleAddField = () => {

    if (!module || !type || !label.trim()) {
  
      // close snackbar first
      setAlertState(prev => ({ ...prev, open: false }));
  
      setTimeout(() => {
        setAlertState({
          open: true,
          message: "Please fill all required fields!",
          severity: "error",
        });
      }, 100);
  
      return;
    }
  
    try {
      const existing = JSON.parse(localStorage.getItem("CustomFields")) || {};
  
      if (!existing[module]) {
        existing[module] = [];
      }
  
      existing[module].push({
        type,
        label,
        required,
        showInTable
      });
  
      localStorage.setItem("CustomFields", JSON.stringify(existing));
    
  
      setLabel("");
      setType("");
      setModule("");
      setRequired(false);
      SetShowINTable(false);
      
      setAlertState({
        open: true,
        message: "Field added successfully!",
        severity: "success",
      }); 
    } catch (error) {
      setAlertState({
        open: true,
        message: "Something went wrong!",
        severity: "error",
      });
    }
  }; // ✅ FUNCTION CLOSED HERE
  

  return (      
    <div className={styles.wrapper}>                   
    <div className={styles.container}>
      <h2 className={styles.title}>Custom Fields</h2>

      {/* Module */}
      <div className={styles.formGroup}>
        <FormControl fullWidth size="small">
          <InputLabel>
          Module
          </InputLabel>
          <Select value={module}
           label="Module"
          onChange={(e) => setModule(e.target.value)}>
         
            <MenuItem value="dashboard">Dashboard</MenuItem>
            <MenuItem value="devices">Devices</MenuItem>
            <MenuItem value="profile">My Profile</MenuItem>
          </Select>
        </FormControl>
     
      </div>

      {/* Type */}
      <div className={styles.formGroup}>
   
  <FormControl fullWidth size="small">
    <InputLabel>Field Type</InputLabel>
    <Select
      value={type}
      label="Field Type"
      onChange={(e) => setType(e.target.value)}
    >
     
      <MenuItem value="text">Text</MenuItem>
      <MenuItem value="date">Date</MenuItem>
      <MenuItem value="dropdown">Dropdown</MenuItem>
    </Select>
  </FormControl>

      </div>

      {/* Label */}
      <div className={styles.formGroup}>
         <TextField id="outlined-basic" variant="outlined" label="Enter Label"  size="small"
                  
                   
                   value={label}
                   onChange={(e) => setLabel(e.target.value)}
                 />
      </div>
        <div className={styles.checkbox}>
          {/* ✅ Material UI Checkboxes */}
<div className={styles.checkbox}>
  <FormGroup row>
    <FormControlLabel
      control={
        <Checkbox
          checked={required}
          onChange={(e) => setRequired(e.target.checked)}
          name="required"
          color="primary"
        />
      }
      label="Required"
    />

    <FormControlLabel
      control={
        <Checkbox
          checked={showInTable}
          onChange={(e) => SetShowINTable(e.target.checked)}
          name="showInTable"
          color="primary"
        />
      }
      label="Show In Table"
    />
  </FormGroup>
</div>
        </div>

      <Button variant="contained" className={styles.button} onClick={handleAddField}>
        Add Field
      </Button>
    </div>
    <Snackbar
  key={alertState.message}
  open={alertState.open}
  autoHideDuration={3000}
  onClose={() => setAlertState({ ...alertState, open: false })}
  anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
  TransitionComponent={(props) => <Slide {...props} direction="left" />}
>
  <Alert
    severity={alertState.severity}
    variant="filled"
    sx={{
      backgroundColor:
        alertState.severity === "success" ? "#065f46" : "#7f1d1d",
      color: "#fff",
      boxShadow: "0 15px 40px rgba(0,0,0,0.7)",
      borderRadius: "12px",
      fontWeight: 500,
      minWidth: "320px",
    }}
  >
    {alertState.message}
  </Alert>
</Snackbar>
    </div>   
  );
};

export default CustomFields;