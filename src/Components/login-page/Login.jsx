import React from "react";
import { useState } from "react";
import styles from "../css/LoginForm.module.css";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../../config/api";


function LoginForm(){
    const navigate = useNavigate();
   const [email,setemail] = useState("");
   const [password,setpassword] = useState('');
   const [loading, setLoading] = useState(false);
   const [error, setError] = useState("");
   

   const handlelogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try{
      const res = await fetch(`${API_BASE_URL}/login`, {
      method : "POST",
      headers:{
        "content-type": "application/json",
      },
      body: JSON.stringify({email,password}),
    })
    console.log("BASE URL:", API_BASE_URL);
    console.log("FINAL URL:", `${API_BASE_URL}/login`);

    const data = await res.json();
  
    if (!res.ok) {
      setError(data.message || "Login failed");
      setpassword("");
      setLoading(false);
      return;
    }
    
    sessionStorage.setItem("token", data.token);
    sessionStorage.setItem("user", JSON.stringify(data.user));    
    sessionStorage.setItem("sessionId", data.sessionId);
 
    navigate("/dashboard")
    return;
}
catch (error) {
  console.error("Login error:", error);
  setError("Server Error");
} finally {
  setLoading(false);
}
   }
 
  
   return (
    <div className={styles.login}>
      <div className={styles.loginPage}>
        <h1 className={styles.heading}>Login</h1>
  
        <form onSubmit={handlelogin} className={styles.form}>
          <label className={styles.label}>Enter Your Email</label>
  
          <input
            type="email"
            name="email"
            value={email}
            placeholder="Email"
            onChange={(e) => setemail(e.target.value)}
            required
            className={styles.input}
          />
  
          <label className={styles.label}>Enter Your Password</label>
  
          <input
            type="password"
            name="password"
            value={password}
            placeholder="Password"
            onChange={(e) => setpassword(e.target.value)}
            required
            className={styles.input}
          />
  {error && <p className={styles.error}>{error}</p>}
  <button type="submit" className={styles.log}>
  {loading ? (
    <>
      <span className={styles.spinner}></span>
    
    </>
  ) : (
    "Submit"
  )}
</button>

        </form>
        

        <p className={styles.registerText}>
          Don&apos;t have an account?{" "}
          <span
            className={styles.registerLink}
            onClick={() => navigate("/register")}
          >
            Register here
          </span>
        </p>
      </div>
    </div>
  );
  
}
export default LoginForm;