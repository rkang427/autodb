import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Login from "./components/Login";
import ViewSellerHistory from "./components/ViewSellerHistory";
import AverageTimeInInventory from "./components/AverageTimeInInventory";
import PricePerCondition from "./components/PricePerCondition";
import PartStatistics from "./components/PartStatistics";
import MonthlySalesOrigin from "./components/MonthlySalesOrigin";
import MonthlySalesDrilldown from "./components/MonthlySalesDrilldown";
import BuyVehicle from "./components/BuyVehicle";
import VehicleDetail from "./components/VehicleDetail";

const App = () => {
  return (
    <Router>
      <div>
        <h1>Team 006 - Dealership DB</h1>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/view_seller_history" element={<ViewSellerHistory />} />
          <Route path="/buy_vehicle" element={<BuyVehicle />} />
          <Route path="/vehicle_detail/:vin" element={<VehicleDetail />} />
          <Route
            path="/average_time_in_inventory"
            element={<AverageTimeInInventory />}
          />
          <Route path="/price_per_condition" element={<PricePerCondition />} />
          <Route path="/part_statistics" element={<PartStatistics />} />
          <Route
            path="/monthly_sales/origin"
            element={<MonthlySalesOrigin />}
          />
          <Route
            path="/monthly_sales/drilldown"
            element={<MonthlySalesDrilldown />}
          />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
