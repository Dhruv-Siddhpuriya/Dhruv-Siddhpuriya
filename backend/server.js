require("dotenv").config();
const swaggerUI = require("swagger-ui-express");
const swaggerJsDoc = require("swagger-jsdoc");
const express = require('express');
const client = require("./utils/redisClient");
const mongoose = require('mongoose');
const DeviceDetector = require("device-detector-js");
const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET;
const auth = require("./middleware/auth");
const cors = require('cors');
const User = require("./user");
const bcrypt = require("bcrypt");
const UserSession = require("./UserSession");
const reverseGeocodeOSM = require("./utils/reverseGeocodeOSM");
const axios = require("axios");
const GetClientip = require("./utils/GetClientip");
const deviceRoutes = require("./routes/Devices");
const UserInfo = require("./routes/UserInfo");
const roleRoutes = require("./routes/roleRoutes");
const userRoutes = require("./routes/userRoutes");
const upload = require("./utils/upload");
const compression = require("compression");
const activityLogs = require("./routes/activityLogs");
const PORT = process.env.PORT || 8000;
const app = express();
app.use(cors({
  origin: "*"
}));
app.use(express.json());
app.use(compression());
app.use(express.urlencoded({ extended: true }));
app.set("trust proxy", true); 
const Device = require("./models/Device");
const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "RegiForm API",
      version: "1.0.0",
      description: "API documentation for RegiForm project"
    },
    servers: [
      {
        url: "http://localhost:8000"
      }
    ]
  },
  apis: ["./routes/*.js", "./server.js"]
};

const specs = swaggerJsDoc(options);
app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(specs));
app.get("/api/device-info/:deviceId", async (req, res) => {
  try {
    const cacheKey = `device:${req.params.deviceId}`;

    const cached = await client.get(cacheKey);
    if (cached) {
      console.log("⚡ Device from Redis");
      return res.json(JSON.parse(cached));
    }

    const device = await Device.findOne({ deviceId: req.params.deviceId })
      .populate("userId")
      .lean();

    if (!device) {
      return res.status(404).json({ message: "Device not found" });
    }

    const response = {
      deviceId: device.deviceId,
      deviceName: device.deviceName,
      status: device.isActive ? "Active" : "Inactive"
    };

    await client.setEx(cacheKey, 300, JSON.stringify(response));

    console.log("🐢 Device from DB");

    res.json(response);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
app.get("/api/device-activeStatus/:id", async (req, res) => {
  try {
    const device = await Device.findById(req.params.id)
      .select("deviceId deviceName isActive")
      .lean();

    if (!device) {
      return res.status(404).json({ message: "Device not found" });
    }

    res.json({
      deviceId: device.deviceId,
      deviceName: device.deviceName,
      status: device.isActive ? "Active" : "Inactive",
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

mongoose.connect(process.env.MONGO_URI,  {
  maxPoolSize: 10, // better connection handling
})
.then(() => console.log("DB connected"))
.catch(err => console.log(err));  
app.use("/api/devices", auth, deviceRoutes);
app.use("/api/users", auth, UserInfo);
app.use("/api/users", auth, userRoutes);
app.use("/api/roles", auth, roleRoutes);
app.use("/api/activity-logs", auth, activityLogs);
app.use("/uploads", express.static("uploads"));
let ChartVersion = Date.now();

/**
 * @swagger
 * /api/charts/version:
 *   get:
 *     summary: Get chart version
 *     tags: [Charts]
 *     responses:
 *       200:
 *         description: Chart version returned
 */
app.get("/api/charts/version", (req,res) => {
  res.json({ Version: ChartVersion });
})
/**
 * @swagger
 * /api/charts/country:
 *   get:
 *     summary: Get users grouped by country
 *     tags: [Charts]
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Country chart data
 */
// api for pie chart and bar chart
app.get("/api/charts/country", async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const cacheKey = `charts:country:${startDate || "all"}:${endDate || "all"}`;

    // ✅ CHECK CACHE
    const cached = await client.get(cacheKey);
    if (cached) {
      console.log("⚡ Country chart from Redis");
      return res.json(JSON.parse(cached));
    }

    let matchStage = {};

    if (startDate && endDate) {
      matchStage.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    const data = await User.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: "$country",
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1, _id: 1 } }
    ]);

    // ✅ STORE CACHE (5 min)
    await client.setEx(cacheKey, 300, JSON.stringify(data));

    console.log("🐢 Country chart from DB");

    res.json(data);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});



/**
 * @swagger
 * /login:
 *   post:
 *     summary: Login user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             example:
 *               email: test@gmail.com
 *               password: Password@123
 *     responses:
 *       200:
 *         description: Login successful
 */
//Login API
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email })
      .select("email password firstName phone role")
      .populate("role", "roleName")
      .lean();

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid password" });
    }

    // OPTIONAL: remove or move this to middleware
    // const detector = new DeviceDetector();
    // const device = detector.parse(req.headers["user-agent"]);
    const detector = new DeviceDetector();
    const device = detector.parse(req.headers["user-agent"]);
    
    const clientIp = GetClientip(req);
    
    const session = await UserSession.create({
      userId: user._id,
      loginTime: new Date(),
      ipAddress: clientIp,
      device: device?.client?.name + " - " + device?.os?.name
    });

    const token = jwt.sign(
      { userId: user._id },
      JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        phone: user.phone,
        role: user.role?.roleName || null
      },
      sessionId: session._id
    });
await client.del("charts:country:all:all");
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


/**
 * @swagger
 * /logout:
 *   post:
 *     summary: Logout user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             example:
 *               sessionId: "123456"
 *     responses:
 *       200:
 *         description: Logged out successfully
 */
//Log out API
app.post("/logout", async (req, res) => {
  try {
    const { sessionId } = req.body;

    if (!sessionId) {
      return res.status(400).json({ message: "Session ID is required" });
    }

    const updatedSession = await UserSession.findByIdAndUpdate(
      sessionId,
      { logoutTime: new Date() },
      { new: true } // 🔥 returns updated doc
    );

    if (!updatedSession) {
      return res.status(404).json({ message: "Session not found" });
    }

    res.json({
      message: "Logged out successfully",
      data: updatedSession
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/**
 * @swagger
 * /api/charts/country-activity:
 *   get:
 *     summary: Country activity line chart
 *     tags: [Charts]
 *     responses:
 *       200:
 *         description: Country activity data
 */
//Line chart API 
app.get("/api/charts/country-activity", async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const cacheKey = `charts:activity:${startDate || "all"}:${endDate || "all"}`;

    // ✅ CACHE CHECK
    const cached = await client.get(cacheKey);
    if (cached) {
      console.log("⚡ Activity chart from Redis");
      return res.json(JSON.parse(cached));
    }

    let matchStage = { loginTime: { $ne: null } };

    if (startDate && endDate) {
      matchStage.loginTime = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    const data = await UserSession.aggregate([
      { $match: matchStage },
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "user"
        }
      },
      { $unwind: "$user" },
      {
        $project: {
          userId: 1,
          country: "$user.country",
          date: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$loginTime"
            }
          }
        }
      },
      {
        $group: {
          _id: {
            date: "$date",
            country: "$country",
            userId: "$userId"
          }
        }
      },
      {
        $group: {
          _id: {
            date: "$_id.date",
            country: "$_id.country"
          },
          activeUsers: { $sum: 1 }
        }
      },
      {
        $project: {
          _id: 0,
          date: "$_id.date",
          country: "$_id.country",
          activeUsers: 1
        }
      },
      { $sort: { date: 1 } }
    ]);

    // ✅ SAVE CACHE
    await client.setEx(cacheKey, 300, JSON.stringify(data));

    console.log("🐢 Activity chart from DB");

    res.json(data);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/**
 * @swagger
 * /api/charts/state-wise:
 *   get:
 *     summary: Get state-wise users by country
 *     tags: [Charts]
 *     parameters:
 *       - in: query
 *         name: country
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: State-wise user data
 */
// STATE-WISE USERS BY COUNTRY (Pie + Bar filter)
app.get("/api/charts/state-wise", async (req, res) => {
  try {
    const { country, startDate, endDate } = req.query;

    if (!country) {
      return res.status(400).json({ message: "Country is required" });
    }

    let matchStage = { country };

    if (startDate && endDate) {
      matchStage.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    const data = await User.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: "$state",
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]);

    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }   
});

/**
 * @swagger
 * /register:
 *   post:
 *     summary: Register new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               email:
 *                 type: string
 *               phone:
 *                 type: string
 *               password:
 *                 type: string
 *               profileImage:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: User registered successfully
 */ 
//Register Page API
app.post("/register",upload.single("profileImage"), async (req, res) => {
  try {
        const { firstName, lastName, email, phone,country, password,lat, lng} = req.body;
        let location = { city: null, state: null, country: null };
        const imagePath = req.file ? req.file.filename : "";
        const strongPasswordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;

if (!strongPasswordRegex.test(password)) {
  return res.status(400).json({
    message: "Password is not strong enough",
  });
}
    // 2️⃣ If GPS exists → Reverse Geocode
    if (lat && lng) {
      location = await reverseGeocodeOSM(lat, lng);
    } 
    // 3️⃣ If GPS NOT available → Use IP
    else {
      const clientIp = GetClientip(req);
      const finalIp =
        clientIp === "::1" || clientIp.startsWith("192.168")
          ? "8.8.8.8" // fallback for localhost/LAN
          : clientIp;

      const geoRes = await axios.get(`http://ip-api.com/json/${finalIp}`, {
        timeout: 5000,
      });

      location = {
        city: geoRes.data.city || null,
        state: geoRes.data.regionName || null,
        country: geoRes.data.country || country || null,
      };
    }

        const existingUser = await User.findOne({ email });
          if (existingUser) 
          {
            return res.status(400).json({ message: "Email already registered" });
          }
          const existingPhone = await User.findOne({phone});
          if(existingPhone){
            return res.status(400).json({message : "Phone Number Already exsits"})
          }
           
            const hashedPassword = await bcrypt.hash(password, 10);
            const user = new User({
              firstName,
              lastName,
              email,
              phone,
              country,
              lat: lat || null,
              lng: lng || null,
              city: location.city,
              state: location.state,
              password: hashedPassword,
              profileImage: imagePath  
            });
            
            await user.save();
            ChartVersion = Date.now();
             res.status(201).json({ message: "User registered successfully" });
      } 
      catch (error) {
        console.error("Register Error:", error);
      
        // If it's a Mongoose validation error
        if (error.name === "ValidationError") {
          const messages = Object.values(error.errors).map(e => e.message);
          return res.status(400).json({ message: messages.join(", ") });
        }
      
        // If it's a duplicate key error
        if (error.code === 11000) {
          const field = Object.keys(error.keyPattern)[0];
          return res.status(400).json({ message: `${field} already exists` });
        }
      
        res.status(500).json({ message: error.message });
      }
  });
  /**
 * @swagger
 * /api/users-locations:
 *   get:
 *     summary: Get users location for map
 *     tags: [Map]
 *     responses:
 *       200:
 *         description: Users location data
 */
  //Map API
  app.get("/api/users-locations", async (req, res) => {
    const users = await User.find(
      { lat: { $ne: null }, lng: { $ne: null } },
      { country: 1, state: 1, city: 1, lat: 1, lng: 1 }
    );
  
    res.json(users);
  });
  
 
  app.listen(PORT, "0.0.0.0", () => {
    console.log("Server running on " + PORT);
  });