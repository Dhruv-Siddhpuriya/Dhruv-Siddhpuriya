import { useEffect, useState } from "react";
import axios from "axios";
import { API_BASE_URL } from "../../config/api";
import styles from "../css/MyProfile.module.css";
import Alert from '@mui/material/Alert';
import { Button } from '@mui/material';
import Snackbar from "@mui/material/Snackbar";
import Slide from "@mui/material/Slide";
const MyProfile = () => {
  const sessionUser = JSON.parse(sessionStorage.getItem("user"));
  const token = sessionStorage.getItem("token");
   const [customFields, setCustomFields] = useState([]);
  const [user, setUser] = useState(null);
  const [edit, setEdit] = useState(false);
  const [alertState, setAlertState] = useState({
    open: false,
    message: "",
    severity: "success"
  });
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    city: "",
    state: "",
    country: ""
  });

    const renderCustomField = (field,index) => {
         switch (field.type) {
          case "text" :
            return(
              <div key={index} className={styles.customField}>
               <label>
                {field.label}
               </label>
               <input type="text" />
              </div>
            )
          case "date":
            return (
              <div key={index} className={styles.customField}>
              <label>{field.label}</label>
              <input type="date" />
              </div>
            )
          case "dropdown":
            return (
              <div key={index} className={styles.customField}>
                 <label>{field.label}</label>
                <select>
                  <option>Pie</option>
                  <option>Bar</option>
                  <option>Line</option>
                  <option>Map</option>
                </select>
              </div>
            )
            default :
            return null;
         }
        };


          useEffect(() => {
              const data = JSON.parse(localStorage.getItem("CustomFields")) || {};
              setCustomFields(data.profile || []);
            }, []);
  // 🔹 Fetch user data
  useEffect(() => {
    fetchUserData();
  }, []);
  
const fetchUserData = async () => {
  if (!sessionUser?.id) return;
  
  axios.get(
    `${API_BASE_URL}/api/users/${sessionUser.id}`,
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  )
    .then(res => {
      setUser(res.data);
      setForm(res.data);
    })
    .catch(err => console.log(err));
}
  // 🔹 Handle input change
  const handleChange = (e) => {
    const {name,value} = e.target;
    if(name === "phone" && !/^\d*$/.test(value)){
      return;
 }
 setForm((prevData) => ({
     ...prevData,    
     [name]: value
 }));
  };
  const handleEditClick = () => {
    // Close any open Snackbar
    setAlertState(prev => ({ ...prev, open: false }));
  
    // Enable edit mode
    setEdit(true);
  };
  // 🔹 Save changes
  const saveProfile = async () => {
    // Validation
    if (!form.email.includes("@") || !form.email.endsWith(".com")) {
      alert("Please enter a valid email address.");
      return;
    }
    if (!/^\d{10}$/.test(form.phone)) {
      alert("Enter 10 Digit number");
      return;
    }
  
    try {
      const res = await axios.put(
        `${API_BASE_URL}/api/users/${sessionUser.id}`,
        form,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
  
      setUser(res.data);
      setForm(res.data);
      setEdit(false);
 
      // Show Snackbar
      setAlertState({
        open: true,
        message: "Profile updated successfully", // ✅ use proper message
        severity: "success"
      });
    
    } catch (err) {
      console.error(err);
      setAlertState({
        open: true,
        message: "Failed to update profile",
        severity: "error"
      });
    }
  };
  if (!user) {
    return <div>Loading profile...</div>; // show a temporary loading message
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.container}>
  
        {/* LEFT PROFILE CARD */}
        <div className={styles.sidebar}>
          <div className={styles.avatarBox}>
            <img
              src={
                user.profileImage
                  ? `${API_BASE_URL}/uploads/${user.profileImage}`
                  : "https://ui-avatars.com/api/?name=" +
                    user.firstName +
                    "+" +
                    user.lastName
              }
              alt="Profile"
            />
          </div>
  
          <h2>{user.firstName} {user.lastName}</h2>
          <p>{user.email}</p>
  
          <div className={styles.badge}>
            Active User
          </div>
        </div>
  
        {/* RIGHT CONTENT */}
        <div className={styles.content}>
  
          <div className={styles.header}>
            <h3>Profile Details</h3>
  
            {!edit ? (
              <Button onClick={handleEditClick}>Edit</Button>
            ) : (
              <Button onClick={saveProfile}>Save</Button>
            )}
          </div>
  
          <div className={styles.grid}>
            {["firstName","lastName","phone","city","state","country"].map(field => (
              <div key={field} className={styles.field}>
                <label>{field}</label>
                <input
                  name={field}
                  value={form[field] || ""}
                  onChange={handleChange}
                  disabled={!edit}
                />
              </div>
            ))}
          </div>
  
          {edit && (
            <div className={styles.cancelBtn}>
              <Button
                variant="outlined"
                onClick={() => {
                  setForm(user);
                  setEdit(false);
                }}
              >
                Cancel
              </Button>
            </div>
          )}
  
          {/* CUSTOM FIELDS */}
          {customFields.length > 0 && (
            <>
              <h3 className={styles.sectionTitle}>Custom Fields</h3>
              <div className={styles.customFieldContainer}>
                {customFields.map((field, index) =>
                  renderCustomField(field, index)
                )}
              </div>
            </>
          )}
        </div>
      </div>
  
      {/* Snackbar (same as yours) */}
      <Snackbar
        open={alertState.open}
        autoHideDuration={3000}
        onClose={(event, reason) => {
          if (reason === "clickaway") return;
          setAlertState(prev => ({ ...prev, open: false }));
        }}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        TransitionComponent={(props) => <Slide {...props} direction="left" />}
      >
        <Alert severity={alertState.severity} variant="filled">
          {alertState.message}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default MyProfile;
