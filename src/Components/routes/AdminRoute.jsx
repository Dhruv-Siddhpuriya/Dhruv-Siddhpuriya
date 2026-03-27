import { Navigate } from "react-router-dom";
 

const AdminRole = ({children}) => {
    const user =  JSON.parse(sessionStorage.getItem("user"));
     if(!user || user.role !== "Admin"){
        return <Navigate to="/dashboard" replace />;
     }
     return children;
}
export default AdminRole;