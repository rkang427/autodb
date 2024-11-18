import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Login from "./components/Login";
import ViewSellerHistory from "./components/ViewSellerHistory";
import AverageTimeInInventory from "./components/AverageTimeInInventory";
import PricePerCondition from "./components/PricePerCondition";
import PartStatistics from "./components/PartStatistics";
import MonthlySales from "./components/MonthlySales";
import AddVehicle from "./components/AddVehicle";
import VehicleDetail from "./components/VehicleDetail";
import PartsOrder from "./components/AddPartsOrder";
import SellVehicle from "./components/SellVehicle";
import React from 'react';
import MonthlySalesDrilldown from "./components/MonthlySalesDrilldown";

const App = () => {
  return (
    <Router>
      <div style={{ fontFamily: 'Poppins, sans-serif' }}>

        <h1 style={styles.title}>Team 006 - Dealership DB</h1>
        <h2 style={styles.subtitle}>North Avenue Automotive</h2>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/view_seller_history" element={<ViewSellerHistory />} />
          <Route path="/add_vehicle" element={<AddVehicle />} />
          <Route path="/vehicle_detail/:vin" element={<VehicleDetail />} />
          <Route path="/parts_order/:vin" element={<PartsOrder />} />
          <Route path="/sell_vehicle/:vin" element={<SellVehicle />} />
          <Route path="/average_time_in_inventory" element={<AverageTimeInInventory />} />
          <Route path="/price_per_condition" element={<PricePerCondition />} />
          <Route path="/part_statistics" element={<PartStatistics />} />
          <Route path="/monthly_sales" element={<MonthlySales />} />
          <Route path="/monthly_sales/drilldown/:year/:month" element={<MonthlySalesDrilldown />} />
        </Routes>
      </div>
    </Router>
  );
};

const styles = {
  title: {
    fontFamily: "Poppins, sans-serif",
    fontWeight: "700", 
    textAlign: "center", 
    letterSpacing: "2px", 
    textTransform: "uppercase",
    fontSize: "36px",
    color: "#2C3E50", 
    background: "linear-gradient(to right, #28a745, #4CAF50)", 
    WebkitBackgroundClip: "text",
    color: "transparent",
    boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)", 
    paddingBottom: "30px", 
    marginTop: "40px",
  },
  subtitle: {
    fontFamily: "Poppins, sans-serif",
    fontWeight: "400", 
    textAlign: "center",
    letterSpacing: "1px", 
    fontSize: "24px", 
    color: "#34495E",
    marginTop: "0", 
    paddingBottom: "20px", 
  },
  spacer: {
    height: "50px",
  },
  divider: {
    width: "100%",
    border: "0",
    borderTop: "2px solid #28a745",
    margin: "20px 0",
  },
};

export default App;
