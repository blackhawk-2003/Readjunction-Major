import React, { useEffect, useState } from "react";
import AdminNavbar from "../components/AdminNavbar";
import ErrorBanner from "../components/ErrorBanner";
import "../styles/AdminDashboard.css";

const AdminSellers = () => {
  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchSellers = async () => {
      setLoading(true);
      setError("");
      try {
        const token = localStorage.getItem("adminToken");
        const res = await fetch("http://localhost:5000/api/v1/users/sellers", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Failed to fetch sellers");
        setSellers(data.data.sellers);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchSellers();
  }, []);

  return (
    <>
      <AdminNavbar />
      <div className="admin-dashboard__section">
        <h2>All Sellers</h2>
        {error && <ErrorBanner message={error} onClose={() => setError("")} />}
        {loading ? (
          <div className="admin-dashboard__loading">Loading sellers...</div>
        ) : (
          <div className="admin-dashboard__table-container">
            <table className="admin-dashboard__table">
              <thead>
                <tr>
                  <th>Business Name</th>
                  <th>Email</th>
                  <th>Status</th>
                  <th>Verified</th>
                  <th>Approved</th>
                  <th>Joined</th>
                </tr>
              </thead>
              <tbody>
                {sellers.length === 0 ? (
                  <tr>
                    <td colSpan={6}>No sellers found.</td>
                  </tr>
                ) : (
                  sellers.map((seller) => (
                    <tr key={seller._id}>
                      <td>{seller.businessName}</td>
                      <td>{seller.userId?.email}</td>
                      <td>{seller.isActive ? "Active" : "Inactive"}</td>
                      <td>{seller.userId?.isVerified ? "Yes" : "No"}</td>
                      <td>{seller.isApproved ? "Yes" : "No"}</td>
                      <td>{new Date(seller.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
};

export default AdminSellers;
