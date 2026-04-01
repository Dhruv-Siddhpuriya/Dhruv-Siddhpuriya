const axios = require("axios");

const reverseGeocodeOSM = async (lat, lng) => {
  try {
    // ❌ Prevent invalid calls
    if (
      lat === null ||
      lng === null ||
      isNaN(lat) ||
      isNaN(lng)
    ) {
      return { city: null, state: null, country: null };
    }

    const url = `https://nominatim.openstreetmap.org/reverse`;

    const res = await axios.get(url, {
      params: {
        format: "json",
        lat,
        lon: lng
      },
      headers: {
        "User-Agent": "TeacodeApp/1.0"
      },
      timeout: 5000
    });

    const addr = res.data.address || {};

    return {
      city:
        addr.city ||
        addr.town ||
        addr.village ||
        addr.hamlet ||
        addr.suburb ||
        addr.county ||
        null,

      // ✅ FIX STATE PROBLEM HERE
      state:
        addr.state ||
        addr.region ||
        addr.state_district ||
        addr.county ||
        null,

      country: addr.country || null
    };

  } catch (err) {
    console.error("OSM Reverse Geocode Error:", err.message);

    return {
      city: null,
      state: null,
      country: null
    };
  }
};

module.exports = reverseGeocodeOSM;