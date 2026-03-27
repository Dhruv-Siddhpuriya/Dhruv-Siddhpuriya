import  { useEffect, useState, useMemo } from "react";
import axios from "axios";
import styles from "../css/Dashboard.module.css";
import { PieChart, BarChart, LineChart } from "@mui/x-charts";
import { API_BASE_URL } from "../../config/api";
import UserMap from "./UserMap";
import dayjs from "dayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DateRangePicker } from "@mui/x-date-pickers-pro/DateRangePicker";
import { SingleInputDateRangeField } from "@mui/x-date-pickers-pro/SingleInputDateRangeField";
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from "@mui/material";
import { Button } from '@mui/material';


const COUNTRY_COLORS = {
  India: "#FF9933",
  USA: "#3C3B6E",
  Canada: "#D52B1E",
  UK: "#012169",
  Germany: "#000000",
  France: "#0055A4",
  Russia: "#1E90FF",
  China: "#EE4B2B",
  America:"#BF40BF",
  Default: "#9E9E9E"
};
function Dashboard(){
 
  const isMobile = window.innerWidth < 768;
    const [customFields, setCustomFields] = useState([])
    const [countryData, setCountryData] = useState([]);
    const [activityData, setActivityData] = useState([]);
    const [LastVersion,setLastVersion] = useState(null);
    const [users, setUsers] = useState([]);
    const [dateRange, setDateRange] = useState([null, null]);
    const [appliedStartDate, setAppliedStartDate] = useState(null);
    const [appliedEndDate, setAppliedEndDate] = useState(null);
    const [pieChartData, setPieChartData] = useState([]);
    const [barChartData, setBarChartData] = useState([]);
    const [pieCountry, setPieCountry] = useState("");
    const [barCountry, setBarCountry] = useState("");
    



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
      case "date" :
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
    const checkForUpdates = async () => {

      if (appliedStartDate && appliedEndDate) return;
      if (pieCountry || barCountry) return;

      const res = await axios.get(`${API_BASE_URL}/api/charts/version`);
    
      if (res.data.Version !== LastVersion) {
        setLastVersion(res.data.Version);
        fetchCountryData();
        fetchPieChart();
        fetchBarChart();
      }
    };
    useEffect(() => {
      const data = JSON.parse(localStorage.getItem("CustomFields")) || {};
      setCustomFields(data.dashboard || []);
    }, []);
    
    const user = JSON.parse(sessionStorage.getItem("user"))
    useEffect(() => {
      fetchCountryData();
      fetchCountryActivity();
      fetchMap();
    }, []);
    useEffect(() => {
      if (appliedStartDate && appliedEndDate) return;
      if (pieCountry || barCountry) return;
    
      const interval = setInterval(() => {
        checkForUpdates();
      }, 5000);
    
      return () => clearInterval(interval);
    }, [appliedStartDate, appliedEndDate, pieCountry, barCountry]);
    
    
    const fetchCountryData = async () => {
      const res = await axios.get(`${API_BASE_URL}/api/charts/country`, {
        params:
          appliedStartDate && appliedEndDate
            ? {
                startDate: appliedStartDate.toISOString(),
                endDate: appliedEndDate.toISOString(),
              }
            : {},
      });
  
      setCountryData(res.data);
    };
    const fetchCountryActivity = async () => {
      const res = await axios.get(
        `${API_BASE_URL}/api/charts/country-activity`,
        {
          params: {
            startDate: appliedStartDate?.toISOString(),
            endDate: appliedEndDate?.toISOString(),
          }
        }
      );
      setActivityData(res.data);
    };
    
  const fetchMap = async () => {
    axios.get(`${API_BASE_URL}/api/users-locations`)
    .then(res => setUsers(res.data))
    .catch(err => console.error(err));
  }
  const fetchPieChart = async () => {
    const url = pieCountry
      ? `${API_BASE_URL}/api/charts/state-wise`
      : `${API_BASE_URL}/api/charts/country`;

    const res = await axios.get(url, {
      params: {
        country: pieCountry || undefined,
        startDate: appliedStartDate?.toISOString(),
        endDate: appliedEndDate?.toISOString(),
      },
    });

    setPieChartData(res.data);
  };

  const fetchBarChart = async () => {
    const url = barCountry
      ? `${API_BASE_URL}/api/charts/state-wise`
      : `${API_BASE_URL}/api/charts/country`;

    const res = await axios.get(url, {
      params: {
        country: barCountry || undefined,
        startDate: appliedStartDate?.toISOString(),
        endDate: appliedEndDate?.toISOString(),
      },
    });

    setBarChartData(res.data);
  };
  const applyDateFilter = () => {
    if (dateRange[0] && dateRange[1]) {
      setAppliedStartDate(dateRange[0].toDate());
      setAppliedEndDate(dateRange[1].toDate());
    }
  };
  
  const clearDateFilter = () => {
    setDateRange([null, null]);
    setAppliedStartDate(null);
    setAppliedEndDate(null);
  };
  const shortcutsItems = [
    {
      label: "Last 7 Days",
      getValue: () => {
        const today = dayjs();
        return [today.subtract(7, "day"), today];
      },
    },
    {
      label: "Current Month",
      getValue: () => {
        const today = dayjs();
        return [today.startOf("month"), today.endOf("month")];
      },
    },
    { label: "Reset", getValue: () => [null, null] },
  ];
  useEffect(() => {
    fetchCountryActivity();
  }, [appliedStartDate, appliedEndDate]);
  
  useEffect(() => {
    fetchCountryData();
    fetchPieChart();
    fetchBarChart();
  }, [appliedStartDate, appliedEndDate]);
  
  useEffect(() => {
    fetchPieChart();
  }, [pieCountry, appliedStartDate, appliedEndDate]);
  
  useEffect(() => {
    fetchBarChart();
  }, [barCountry, appliedStartDate, appliedEndDate]);
  

  // Pie chart
  const pieData = pieChartData.map((item, index) => {
    const isCountryView = !pieCountry;
  
    return {
      id: index,
      value: item.count,
      label: item._id || "Unknown",
      color: isCountryView
        ? COUNTRY_COLORS[item._id] || COUNTRY_COLORS.Default
        : undefined, // 🔥 let MUI auto-generate state colors
    };
  });
  
   // Bar chart
   const barLabels = barChartData.map((item) => item._id || "Unknown");
   const barValues = barChartData.map((item) => item.count);
 


// unique dates for x-axis
const { dates, lineSeries } = useMemo(() => {
  if (!activityData.length) {
    return { dates: [], lineSeries: [] };
  }

  // 1️⃣ Filter data by applied date range
  const filteredData = activityData.filter(d => {
    const currentDate = new Date(d.date);

    if (appliedStartDate && currentDate < appliedStartDate) return false;
    if (appliedEndDate && currentDate > appliedEndDate) return false;

    return true;
  });

  // 2️⃣ Extract sorted unique dates
  const dates = [...new Set(filteredData.map(d => d.date))].sort(
    (a, b) => new Date(a) - new Date(b)
  );

  // 3️⃣ Extract countries
  const countries = [...new Set(filteredData.map(d => d.country))];

  // 4️⃣ Build series
  const lineSeries = countries.map(country => ({
    label: country,
    data: dates.map(date => {
      const match = filteredData.find(
        d => d.country === country && d.date === date
      );
      return match ? match.activeUsers : 0;
    }),
    color: COUNTRY_COLORS[country] || "#000000",
  }));

  return { dates, lineSeries };
}, [activityData, appliedStartDate, appliedEndDate]);


return (
  <div className={styles.dash}>
    {/* Inner container */}
    <div className={styles.main}>

      {/* Welcome */}
      <h1 className={styles.welcome}>
        Welcome, {user?.firstName} 👋
      </h1>

      {/* Filters */}
      <div className={styles.filterBar}>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
  <DateRangePicker
    value={dateRange}
    onChange={(newValue) => setDateRange(newValue)}
    slots={{ field: SingleInputDateRangeField }}
    slotProps={{
      shortcuts: {
        items: shortcutsItems,   // ✅ CORRECT PLACE
      },
      field: {
        className: styles.dateRangeField, 
        shortcuts: {
          items: shortcutsItems,
        },
        size: "small",
       
      },
    }}
  />
</LocalizationProvider>

  <div className={styles.buttonGroup}>
    <Button variant="contained" onClick={applyDateFilter}>
      Apply
    </Button>

    <Button variant="outlined" onClick={clearDateFilter}>
      Clear
    </Button>
  </div>
</div>

      {/* Charts */}
      <div className={styles.charts}>

        {/* Pie */}
        <div className={styles.chart}>
  <div className={styles.chartHeader}>
    <h3>
      {pieCountry
        ? `State-wise Users in ${pieCountry}`
        : "Users by Country (Pie)"}
    </h3>

    <div className={styles.slc}>
    <FormControl
  size="small"
  sx={{
    minWidth: 180,
    mt: 1, // ✅ Top margin (16px)
  }}
>
  <InputLabel
    sx={{
      color: "#000000",
      "&.Mui-focused": { color: "#000000" }
    }}
  >
    Country
  </InputLabel>

  <Select
    value={pieCountry}
    label="Country"
    onChange={(e) => setPieCountry(e.target.value)}
    sx={{
      color: "#000000",
    

      ".MuiOutlinedInput-notchedOutline": {
        borderColor: "#000000"
      },

      "&:hover .MuiOutlinedInput-notchedOutline": {
        borderColor: "#000000"
      },

      "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
        borderColor: "#000000"
      },

      ".MuiSvgIcon-root": {
        color: "#000000" // Keep dropdown arrow visible on dark background
      }
    }}
  >
    <MenuItem value="">All Countries</MenuItem>
    {countryData.map((c) => (
      <MenuItem key={c._id} value={c._id}>
        {c._id}
      </MenuItem> 
    ))}
  </Select>
</FormControl>
    </div>
  </div>
  <div className={styles.chartBody}>
    <PieChart
      series={[{ data: pieData, }]}
      width={isMobile ? 240 : 400}
      height={300}
    />
  </div>
</div>


        {/* Bar */}
        <div className={styles.chart}>
          <h3>
            {barCountry
              ? `State-wise Users in ${barCountry}`
              : "Users by Country (Bar)"}
          </h3>

          <div className={styles.slc}>
          <FormControl
  size="small"
  sx={{
    minWidth: 180,
    mt: 1, // ✅ Top margin
  }}
>
  <InputLabel
    sx={{
      color: "#000000",
      "&.Mui-focused": { color: "#000000" }
    }}
  >
    Country
  </InputLabel>

  <Select
    value={barCountry}
    label="Country"
    onChange={(e) => setBarCountry(e.target.value)}
    sx={{
      color: "#000000",

      ".MuiOutlinedInput-notchedOutline": {
        borderColor: "#000000"
      },

      "&:hover .MuiOutlinedInput-notchedOutline": {
        borderColor: "#000000"
      },

      "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
        borderColor: "#000000"
      },

      ".MuiSvgIcon-root": {
        color: "#000000"
      }
    }}
  >
    <MenuItem value="">All Countries</MenuItem>
    {countryData.map((c) => (
      <MenuItem key={c._id} value={c._id}>
        {c._id}
      </MenuItem>
    ))}
  </Select>
</FormControl>
          </div>

          <BarChart
            xAxis={[{ scaleType: "band", data: barLabels }]}
            series={[{ data: barValues }]}
            width={isMobile ? 380 : 600}
            height={300}
          />
        </div>
   
        {/* Line */}
        <div className={styles.chartWide}>
          <h3>Daily Active Users by Country</h3>

          {lineSeries.length > 0 ? (
            <LineChart
              xAxis={[{ data: dates, scaleType: "point" }]}
              series={lineSeries}
              width={isMobile ? 350 : 1200}
              height={350}
            />
          ) : (
            <p>No activity data yet</p>
          )}
        </div>
      </div>

      {/* Map */}
      <h2 className={styles.sectionTitle}>User Locations</h2>
      
      <UserMap className={styles.map} users={users}/>
      {customFields.length >0 && (
        <>
        <h2 className={styles.sectionTitle}>Custom Fields</h2>
        <div className={styles.customFieldContainer}>
           {
            customFields.map((field,index) => 
              renderCustomField(field,index)
           )}
        </div>
        </>
      )}
    </div>
  </div>
);
}
export default Dashboard;