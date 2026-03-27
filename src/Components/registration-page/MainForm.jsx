import React from "react";
import { useState } from "react";
import  styles from "../css/MainForm.module.css";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../../config/api";



function MainForm() {
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
  
  const navigate = useNavigate(); 
    const [step,setstep] = useState(1);
    const [image, setImage] = useState(null);
    const [preview, setPreview] = useState(null);
        const [formData,setFormData] = useState(() => {
         const saved = sessionStorage.getItem("formData");
          return saved
           ? JSON.parse(saved)
            :{
               firstName: "",
               lastName: "",
               email: "",
               phone:"",
               country:"",
               password: "",
            }
        });

    
    const handleChange = (e) => {
        const {name,value} = e.target;
           if(name === "phone" && !/^\d*$/.test(value)){
             return;
        }
        setFormData((prevData) => ({
            ...prevData,    
            [name]: value
        }));
    }
     // 1️⃣ Get browser location
     const getUserLocation = () => {
      return new Promise((resolve) => {
        if (!navigator.geolocation) {
          return resolve({ lat: null, lng: null });
        }
    
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            resolve({
              lat: pos.coords.latitude,
              lng: pos.coords.longitude
            });
          },
          () => resolve({ lat: null, lng: null }), // permission denied
          { enableHighAccuracy: true }
        );
      });
    };
    
    const handlesubmit = async (e) => {
      e.preventDefault();
      const strongPasswordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;
  
    if (!strongPasswordRegex.test(formData.password)) {
      alert(
        "Password must be at least 8 characters and include:\n" +
        "• One uppercase letter\n" +
        "• One lowercase letter\n" +
        "• One number\n" +
        "• One special character"
      );
      return;
    }
  
      try {
        const location = await getUserLocation();
    
        // 1️⃣ Create FormData
        const formDataToSend = new FormData();
    
        // 2️⃣ Append text fields
        Object.keys(formData).forEach((key) => {
          formDataToSend.append(key, formData[key]);
        });
    
        // 3️⃣ Append location
        formDataToSend.append("lat", location.lat);
        formDataToSend.append("lng", location.lng);
    
        // 4️⃣ Append image (important)
        if (image) {
          formDataToSend.append("profileImage", image);
        }
    
        // 5️⃣ Send request (NO headers)
        const response = await fetch(`${API_BASE_URL}/register`, {
          method: "POST",
          body: formDataToSend,
        });
    
        const data = await response.json();
    
        if (!response.ok) {
          alert(data.message || "Registration Failed");
          return;
        }
    
        alert(data.message);
        setTimeout(() => {
          navigate("/");
        }, 500);
    
      } catch (error) {
        console.error(error);
        alert("Failed to connect to server");
      }
    
      sessionStorage.removeItem("formData");
      sessionStorage.removeItem("step");
    
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        country: "",
        password: "",
      });
    };
    const nextStep = () => {
        if(formData.firstName.trim() === "" || formData.lastName.trim() === ""){
            alert("Please fill in all required fields.");
            return;
        }
       
        sessionStorage.setItem("formData", JSON.stringify(formData));
         sessionStorage.setItem("step",step)
        setstep(2)
    }
     const nextStep2 = () => {
        if(formData.email.trim() === "" || formData.phone.trim() === "" || formData.country.trim() === ''){
            alert("Please fill in all required fields.");
            return;
        }
        if(!formData.email.includes("@") || !formData.email.endsWith(".com"))
            {
                alert("Please enter a valid email address.");
                return;
            }
        if(!/^\d{10}$/.test(formData.phone))
            {
            alert("Enter 10 Digit number");
            return;
            }
            sessionStorage.setItem("formData", JSON.stringify(formData));
            sessionStorage.setItem("step",step)
        setstep(3)
    }

    return (
      <div className={styles.registration}>
        <div key={step} className={styles.Container}>
          <h1 className={styles.heading}>Register</h1>
    
          <form onSubmit={handlesubmit} className={styles.form}>
            {step === 1 && (
              <>
             
                <input
                  type="text"
                  name="firstName"
                  placeholder="First Name"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                  className={styles.input}
                />
                
                <input
                  type="text"
                  name="lastName"
                  placeholder="Last Name"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                  className={styles.input}
                />
    
                <button
                  type="button"
                  onClick={nextStep}
                  className={styles.next1}
                >
                  Next
                </button>
              </>
            )}
    
            {step === 2 && (
              <>
                <input
                  type="email"
                  name="email"
                  placeholder="Your Email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className={styles.input}
                />
    
                <input
                  type="tel"
                  name="phone"
                  placeholder="Phone NO"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  className={styles.input}
                />
    
                <select
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  required
                  className={styles.select}
                >
                  <option value="">Select Country</option>
                  {countries.map((country) => (
                    <option key={country} value={country}>
                      {country}
                    </option>
                  ))}
                </select>
    
                <div className={styles.buttonrow}>
                  <button
                    type="button"
                    onClick={() => setstep(1)}
                    className={styles.back}
                  >
                    Back
                  </button>
    
                  <button
                    type="button"
                    onClick={nextStep2}
                    className={styles.next2}
                  >
                    Next
                  </button>
                </div>
              </>
            )}
    
            {step === 3 && (
              <>
                <input
                  type="password"
                  name="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className={styles.input}
                />
                 <div className={styles.avatarContainer}>
      <label htmlFor="profileUpload">
        <img
          src={
            preview
              ? preview
              : "https://cdn-icons-png.flaticon.com/512/149/149071.png"
          }
          alt="Profile"
          className={styles.avatar}
        />
      </label>

      <input
        type="file"
        id="profileUpload"
        accept="image/*"
        style={{ display: "none" }}
        onChange={(e) => {
          const file = e.target.files[0];
          if (file) {
            setImage(file);
            setPreview(URL.createObjectURL(file));
          }
        }}
      />
      <p className={styles.uploadText}>Click image to upload profile picture</p>
    </div>
                <div className={styles.buttonraw}>
                  <button
                    type="button"
                    onClick={() => setstep(2)}
                    className={styles.back}
                  >
                    Back
                  </button>
    
                  <button type="submit" className={styles.sub}>
                    Submit
                  </button>
                </div>
              </>
            )}
          </form>
        </div>
      </div>
    );
    
}
export default MainForm;