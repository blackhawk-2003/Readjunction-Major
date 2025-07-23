import React, { useEffect, useState } from "react";
import AdminNavbar from "../components/AdminNavbar";
import ErrorBanner from "../components/ErrorBanner";
import "../styles/AdminDashboard.css";

const AdminBuyers = () => {
  const [buyers, setBuyers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchBuyers = async () => {
      setLoading(true);
      setError("");
      try {
        const token = localStorage.getItem("adminToken");
        const res = await fetch("http://localhost:5000/api/v1/users/buyers", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Failed to fetch buyers");
        setBuyers(data.data.buyers);
        console.log("Fetched buyers:", data.data.buyers); // Debug log
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchBuyers();
  }, []);

  return (
    <>
      <AdminNavbar />
      <div className="admin-dashboard__section">
        <h2>All Buyers</h2>
        {error && <ErrorBanner message={error} onClose={() => setError("")} />}
        {loading ? (
          <div className="admin-dashboard__loading">Loading buyers...</div>
        ) : (
          <div className="admin-dashboard__table-container">
            <table className="admin-dashboard__table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Status</th>
                  <th>Verified</th>
                  <th>Joined</th>
                </tr>
              </thead>
              <tbody>
                {buyers.length === 0 ? (
                  <tr>
                    <td colSpan={5}>No buyers found.</td>
                  </tr>
                ) : (
                  buyers.map((buyer) => {
                    const name =
                      buyer.profile &&
                      (buyer.profile.firstName || buyer.profile.lastName)
                        ? `${buyer.profile.firstName || ""} ${
                            buyer.profile.lastName || ""
                          }`.trim()
                        : "";
                    return (
                      <tr key={buyer._id}>
                        <td>
                          {name || (
                            <span style={{ color: "#888" }}>
                              ({buyer.email})
                            </span>
                          )}
                        </td>
                        <td>{buyer.email}</td>
                        <td>{buyer.isActive ? "Active" : "Inactive"}</td>
                        <td>{buyer.isVerified ? "Yes" : "No"}</td>
                        <td>
                          {new Date(buyer.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
};

export default AdminBuyers;
