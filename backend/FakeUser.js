const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const { faker } = require("@faker-js/faker");
const User = require("./user");

mongoose.connect("mongodb+srv://users:admin@cluster0.x16hkz6.mongodb.net/?appName=Cluster0")
  .then(() => console.log("DB connected"))
  .catch(err => console.log(err));

const countries = [
  "India", "Russia", "Canada", "China",
  "USA", "UK", "Germany", "France"
];
const locations = {
  India: [
    { city: "Mumbai", state: "Maharashtra", lat: 19.0760, lng: 72.8777 },
    { city: "Delhi", state: "Delhi", lat: 28.6139, lng: 77.2090 },
    { city: "Bengaluru", state: "Karnataka", lat: 12.9716, lng: 77.5946 },
    { city: "Ahmedabad", state: "Gujarat", lat: 23.0225, lng: 72.5714 },
  ],
  USA: [
    { city: "New York", state: "New York", lat: 40.7128, lng: -74.0060 },
    { city: "Austin", state: "Texas", lat: 30.2672, lng: -97.7431 },
    { city: "Chicago", state: "Illinois", lat: 41.8781, lng: -87.6298 },
    { city: "Seattle", state: "Washington", lat: 47.6062, lng: -122.3321 },
  ],
  Russia: [
    { city: "Moscow", state: "Moscow Oblast", lat: 55.7558, lng: 37.6173 },
    { city: "Kazan", state: "Tatarstan", lat: 55.8304, lng: 49.0661 },
  ],
  Canada: [
    { city: "Toronto", state: "Ontario", lat: 43.6510, lng: -79.3470 },
    { city: "Vancouver", state: "British Columbia", lat: 49.2827, lng: -123.1207 },
  ],
  UK: [
    { city: "London", state: "England", lat: 51.5074, lng: -0.1278 },
  ],
  Germany: [
    { city: "Berlin", state: "Berlin", lat: 52.5200, lng: 13.4050 },
  ],
  France: [
    { city: "Paris", state: "Île-de-France", lat: 48.8566, lng: 2.3522 },
  ],
  China: [
    { city: "Beijing", state: "Beijing", lat: 39.9042, lng: 116.4074 },
  ],
};
const createRandomUsers = async () => {
  try {
    for (let i = 0; i < 20; i++) {
      const country = faker.helpers.arrayElement(countries);

      // 2️⃣ Pick matching city/state/lat/lng
      const cityData = faker.helpers.arrayElement(locations[country]);

      const password = await bcrypt.hash("123456", 10);

      const user = new User({
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        email: faker.internet.email().toLowerCase(),
        phone: faker.phone.number("##########"),
        password,
        country,
    state: cityData.state,
    city: cityData.city,
    lat: cityData.lat,
    lng: cityData.lng,
        createdAt: new Date()
      });

      await user.save(); // ✅ THIS is correct
    }

    console.log("✅ 20 random users created");
    process.exit();
  } catch (error) {
    console.error("❌ Error creating users", error);
    process.exit(1);
  }
};

createRandomUsers();
