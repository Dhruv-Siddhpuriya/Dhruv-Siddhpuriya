// utils/reverseGeocodeOSM.js
const axios = require("axios");

const reverseGeocodeOSM = async (lat, lng) => {
  try {
    if (lat === null || lng === null) return { city:null, state:null, country:null };
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`;
    const res = await axios.get(url, { headers:{ "User-Agent":"YourApp/1.0" } });
    const addr = res.data.address;
    return {
      city:
        addr.city ||
        addr.town ||
        addr.village ||
        addr.county ||
        addr.state_district ||
        null,
      state:
        addr.state ||
        addr.region ||
        addr.state_district ||
        null,
      country: addr.country || null
    };
  } catch(err) {
    console.error("OSM Reverse Geocode Error:", err);
    return { city:null, state:null, country:null };
  }
};

module.exports = reverseGeocodeOSM;
