import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL } from "../../../config/api";
import styles from "../../css/DeviceDetails.module.css";
import { useNavigate } from "react-router-dom";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer
} from "recharts";
const DeviceDetails = () => {
  const { id } = useParams();
  const [usage, setUsage] = useState(null);
  const [deviceName, setDeviceName] = useState("");
  const [startIndex, setStartIndex] = useState(0);
const ITEMS_PER_PAGE = 5;
  const [date, setDate] = useState( 
    new Date().toISOString().split("T")[0]
  );  
  const [chartData, setChartData] = useState([]); 
  const [activityLogs, setActivityLogs] = useState([]);
  const navigate = useNavigate();
  const token = sessionStorage.getItem("token");
  const fetchDevice = async () => {
    try {
      const res = await axios.get(
        `${API_BASE_URL}/api/device-activeStatus/${id}`,  
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
    
      setDeviceName(res.data.deviceName);
    } catch (err) {
      console.error(err);
    }
  };
  const visibleData = chartData.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  );

  const handleNext = () => {
    if (startIndex + ITEMS_PER_PAGE < chartData.length) {
      setStartIndex(prev => prev + ITEMS_PER_PAGE);
    }
  };
  
  const handlePrev = () => {
    if (startIndex - ITEMS_PER_PAGE >= 0) {
      setStartIndex(prev => prev - ITEMS_PER_PAGE);
    }
  };
  const fetchUsage = async () => {
    try {
        const res = await axios.get(
            `${API_BASE_URL}/api/devices/${id}/usage`,
            {
              params: date ? { date } : {},
              headers: {
                Authorization: `Bearer ${token}`
              }
            }
          );
      setUsage(res.data.formattedTime);
    }   catch (err) {
      console.error(err);
    }
  };
  const fetchChartData = async () => {
    try {
      const res = await axios.get(
        `${API_BASE_URL}/api/devices/${id}/usage-history`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
  
      setChartData(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchActivityLogs = async () => {
    try {
      const res = await axios.get(
        `${API_BASE_URL}/api/devices/${id}/activity-logs`,
        {
          params: { date },
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
  
      setActivityLogs(res.data);
    } catch (err) {
      console.error(err);
    }
  };
  useEffect(() => {
    fetchUsage();
    fetchActivityLogs(); 
  }, [date, id]);
  useEffect(() => {
    fetchDevice();
    fetchChartData();
  }, []);

  return (
    <div className={styles.container}>
      <div className={styles.backButton}>
      <button onClick={() => navigate(-1)}>{"< Back"}</button>
      <h3 className={styles.deviceName}>
      {deviceName || "Loading..."}
    </h3>
      </div>
    
   

      <div className={styles.card}>
      
        <h2 className={styles.title}>Device Usage</h2>

        <div className={styles.inputGroup}>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className={styles.input}
          />
          
          
        </div>

        <div className={styles.result}>
          Active Time:{" "}
          <span className={styles.highlight}>
          {usage || "0 hr 0 min"}
          </span> 
        </div>
      </div>
     
      <div className={styles.rowContainer}>

{/* LEFT - CHART */}
<div className={styles.chartBox}>

<div className={styles.chartHeader}>
<button onClick={handlePrev} disabled={startIndex === 0}>
<ArrowBackIosNewIcon fontSize="small" />
</button>

<h3>Usage History</h3>

<button
onClick={handleNext}
disabled={startIndex + ITEMS_PER_PAGE >= chartData.length}
>
<ArrowForwardIosIcon fontSize="small" />
</button>
</div>
<ResponsiveContainer width="100%" height={330}>
<BarChart data={visibleData}>
    <CartesianGrid strokeDasharray="3 3" />
    <XAxis dataKey="date" />
    <YAxis />

    <Tooltip 
      cursor={false}
      formatter={(value, name, props) => props.payload.label}
    />

    <Bar 
      dataKey="hours" 
      fill="#4CAF50" 
      radius={[6, 6, 0, 0]} 
    />
  </BarChart>
</ResponsiveContainer>
</div>

{/* RIGHT - LOGS */}
<div className={styles.logsCard}>
<div className={styles.logsHeader}>
<h3>Activation History</h3>
</div>

<div className={styles.logsBody}>
{activityLogs.length === 0 ? (
  <p>No activity found</p>
) : (
  activityLogs.map((log, index) => (
    <div key={index} className={styles.logItem}>
      <span>
      {new Date(log.startTime).toLocaleTimeString([], {
  hour: "2-digit",
  minute: "2-digit",
  hour12: true,
  timeZone: "Asia/Kolkata"
})}
      </span>
      {" → "}
      <span>
      {new Date(log.endTime).toLocaleTimeString([], {
  hour: "2-digit",
  minute: "2-digit",
  hour12: true,
  timeZone: "Asia/Kolkata"
})}
      </span>
    </div>
  ))
)}
</div>
</div>

</div>
    </div>
  );
};

export default DeviceDetails;