import React, { useState } from "react";
import styles from "../css/CustomFields.module.css";
import Alert from "@mui/material/Alert";
import Snackbar from "@mui/material/Snackbar";
import Slide from "@mui/material/Slide";
import {
  Button,
  FormGroup,
  TextField,
  Checkbox,
  FormControlLabel,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from "@mui/material";

const CustomFields = () => {
  const [module, setModule] = useState("");
  const [type, setType] = useState("");
  const [label, setLabel] = useState("");
  const [required, setRequired] = useState(false);
  const [showInTable, setShowInTable] = useState(false);

  const [alertState, setAlertState] = useState({
    open: false,
    message: "",
    severity: "success"
  });

  const handleAddField = () => {
    if (!module || !type || !label.trim()) {
      setAlertState({ open: false });

      setTimeout(() => {
        setAlertState({
          open: true,
          message: "Please fill all required fields!",
          severity: "error"
        });
      }, 100);
      return;
    }

    try {
      const existing =
        JSON.parse(localStorage.getItem("CustomFields")) || {};

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

      // Reset
      setLabel("");
      setType("");
      setModule("");
      setRequired(false);
      setShowInTable(false);

      setAlertState({
        open: true,
        message: "Field added successfully!",
        severity: "success"
      });
    } catch {
      setAlertState({
        open: true,
        message: "Something went wrong!",
        severity: "error"
      });
    }
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.card}>
        {/* Header */}
        <div className={styles.header}>
          <h2>Custom Fields</h2>
          <p>Create dynamic fields for your modules</p>
        </div>

        {/* Form */}
        <div className={styles.form}>

          {/* Module */}
          <FormControl fullWidth size="small">
            <InputLabel>Module</InputLabel>
            <Select
              value={module}
              label="Module"
              onChange={(e) => setModule(e.target.value)}
            >
              <MenuItem value="dashboard">Dashboard</MenuItem>
              <MenuItem value="devices">Devices</MenuItem>
              <MenuItem value="profile">My Profile</MenuItem>
            </Select>
          </FormControl>

          {/* Type */}
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

          {/* Label */}
          <TextField
            label="Field Label"
            size="small"
            fullWidth
            value={label}
            onChange={(e) => setLabel(e.target.value)}
          />

          {/* Checkboxes */}
          <div className={styles.checkboxRow}>
            <FormGroup row>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={required}
                    onChange={(e) => setRequired(e.target.checked)}
                  />
                }
                label="Required"
              />

              <FormControlLabel
                control={
                  <Checkbox
                    checked={showInTable}
                    onChange={(e) => setShowInTable(e.target.checked)}
                  />
                }
                label="Show in Table"
              />
            </FormGroup>
          </div>

          {/* Button */}
          <Button
            variant="contained"
            fullWidth
            className={styles.button}
            onClick={handleAddField}
          >
            + Add Field
          </Button>
        </div>
      </div>

      {/* Snackbar */}
      <Snackbar
        key={alertState.message}
        open={alertState.open}
        autoHideDuration={3000}
        onClose={() =>
          setAlertState({ ...alertState, open: false })
        }
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        TransitionComponent={(props) => (
          <Slide {...props} direction="left" />
        )}
      >
        <Alert
          severity={alertState.severity}
          variant="filled"
          sx={{
            backgroundColor:
              alertState.severity === "success"
                ? "#065f46"
                : "#7f1d1d",
            color: "#fff",
            borderRadius: "12px",
            fontWeight: 500,
            minWidth: "300px"
          }}
        >
          {alertState.message}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default CustomFields;