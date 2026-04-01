import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// 🔴 current user icon
const redIcon = new L.Icon({
  iconUrl: "https://maps.google.com/mapfiles/ms/icons/red-dot.png",
  iconSize: [32, 32],
});

// 🔵 other users
const blueIcon = new L.Icon({
  iconUrl: "https://maps.google.com/mapfiles/ms/icons/blue-dot.png",
  iconSize: [32, 32],
});

const UserMap = ({ users }) => {
  // ✅ get logged-in user
  const currentUser = JSON.parse(sessionStorage.getItem("user"));

  return (
    <div style={{ width: "90%", maxWidth: "1500px", margin: "0 auto" }}>
      <div style={{ height: "600px", width: "100%" }}>
        <MapContainer center={[20, 0]} zoom={2} style={{ height: "100%", width: "100%" }}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"/>

          {users
            .filter(u => u.lat && u.lng) // ✅ avoid crash
            .map((u, i) => {
              
              // 🔥 FIX HERE (id vs _id)
              const isMe = currentUser?.id === u._id;

              return (
                <Marker
                  key={i}
                  position={[u.lat, u.lng]}
                  icon={isMe ? redIcon : blueIcon}
                >
                  <Popup>
                    <strong>{u.city}</strong><br />
                    {u.state}, {u.country}
                    {isMe && <div>📍 You are here</div>}
                  </Popup>
                </Marker>
              );
            })}
        </MapContainer>
      </div>
    </div>
  );
};

export default UserMap;