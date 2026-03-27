import { useState } from "react";
import axios from "axios";
import {API_BASE_URL} from "../../../config/api";
import styles from "../../css/AddRoles.module.css";
import TextField from '@mui/material/TextField';
import { Button } from '@mui/material';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Alert from '@mui/material/Alert';
import Snackbar from "@mui/material/Snackbar";
import Slide from "@mui/material/Slide";
const AddRoles = () => {

 const token = sessionStorage.getItem("token");
 const [roleName, setRoleName] = useState("");
 const [permissions, setPermissions] = useState({
    add: false,
    edit: false,
    delete:false,
 })
 const [alertState, setAlertState] = useState({
  open: false,
  message: "",
  severity: "success"
});
 const handleChange = (e) => {
    setPermissions({
        ...permissions,
        [e.target.name] : e.target.checked,
    })
 }
 
 const handleSubmit = async (e) => {
  e.preventDefault();

  try {
    await axios.post(
      `${API_BASE_URL}/api/roles`,
      {
        roleName,
        permissions,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    // ✅ SHOW SUCCESS ALERT
    setAlertState({
      open: true,
      message: "Role added successfully!",
      severity: "success",
    });

    // Reset form
    setRoleName("");
    setPermissions({
      add: false,
      edit: false,
      delete: false,
    });

  } catch (error) {
    // ❌ SHOW ERROR ALERT
    setAlertState({
      open: true,
      message: "Field is required" || "Something went wrong!",
      severity: "error",
    });
  }
};


 return (
  <div className={styles.wrapper}>
    <Snackbar
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
      <h2 className={styles.title}>Add Role</h2>
  
      <form onSubmit={handleSubmit}>
        <div className={styles.formGroup}>
          <TextField id="outlined-basic" variant="outlined" label="Role Name"  size="small"
            className={styles.input}
            
            value={roleName}
            onChange={(e) => setRoleName(e.target.value)}
          />
        </div>
  
        <div className={styles.permissions}>
      
          <FormGroup>
          <FormControlLabel
  control={
    <Checkbox
      name="add"
      checked={permissions.add}
      onChange={handleChange}
    />
  }
  label="Add"
/>

<FormControlLabel
  control={
    <Checkbox
      name="edit"
      checked={permissions.edit}
      onChange={handleChange}
    />
  }
  label="Edit"
/>

<FormControlLabel
  control={
    <Checkbox
      name="delete"
      checked={permissions.delete}
      onChange={handleChange}
    />
  }
  label="Delete"
/>
    </FormGroup>
        </div>
        <Button  variant="contained" className={styles.button} type="submit">
          Save Role
        </Button>
      </form>
    </div>
    </div>
  );

}
export default AddRoles;