  import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
  import "leaflet/dist/leaflet.css";
  import L from "leaflet";

  // Fix Leaflet marker paths
  delete L.Icon.Default.prototype._getIconUrl;

  L.Icon.Default.mergeOptions({
    iconUrl: "/images/marker-icon.png",    // path in public folder
    shadowUrl: "/images/marker-shadow.png" // path in public folder
  });

  const UserMap = ({ users }) => {
    return (
      <div style={{ width: "90%", maxWidth: "1500px", border:"2px solid black", margin:"0 auto"}}>
        <div style={{ height: "600px", width: "100%" }}>
          <MapContainer center={[20, 0]} zoom={2} style={{ height: "100%", width: "100%" }}>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"/>
            {users
  .filter(u => u.lat && u.lng)
  .map((u, i) => (
              <Marker key={i} position={[u.lat, u.lng]}>
                <Popup>
                  <strong>{u.city}</strong><br />
                  {u.state}, {u.country}
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      </div>
    );
  };

  export default UserMap;