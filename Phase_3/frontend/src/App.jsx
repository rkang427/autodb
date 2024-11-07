import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { useState, useEffect } from "react";
import Login from "./components/Login";
import ViewSellerHistory from "./components/ViewSellerHistory";
import AverageTimeInInventory from "./components/AverageTimeInInventory";
import PricePerCondition from "./components/PricePerCondition";
import PartStatistics from "./components/PartStatistics";
import MonthlySales from "./components/MonthlySales";
import BuyVehicle from "./components/BuyVehicle";
import VehicleDetail from "./components/VehicleDetail";
import PartsOrder from "./components/PartsOrder";
import auth from "./services/auth";
import SellVehicle from "./components/SellVehicle";

const App = () => {

  return (
    <Router>
      <div style={{ fontFamily: 'Poppins, sans-serif'}}>
        <h1>Team 006 - Dealership DB</h1>
        <h2>North Avenue Automotive</h2>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/view_seller_history" element={<ViewSellerHistory />} />
          <Route path="/buy_vehicle" element={<BuyVehicle />} />
          <Route path="/vehicle_detail/:vin" element={<VehicleDetail />} />
          <Route path="/parts_order/:vin" element={<PartsOrder />} />
          <Route path="/sell_vehicle/:vin" element={<SellVehicle />} />
          <Route
            path="/average_time_in_inventory"
            element={<AverageTimeInInventory />}
          />
          <Route path="/price_per_condition" element={<PricePerCondition />} />
          <Route path="/part_statistics" element={<PartStatistics />} />
          <Route
            path="/monthly_sales/origin"
            element={<MonthlySales />}
          />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
