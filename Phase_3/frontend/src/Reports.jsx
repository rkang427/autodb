import React from 'react';
//to clear cache
//rm -rf node_modules/.vite
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
//npm install react-router-dom

import ViewSellerHistory from './components/ViewSellerHistory';
import AverageTimeInInventory from './components/AverageTimeInInventory';
import PricePerCondition from './components/PricePerCondition';
import PartStatistics from './components/PartStatistics';
import MonthlySalesReport from './components/MonthlySalesOrigin';


const Reports = () => {
  return (
    <Router>
      <Switch>
        <Route path="/reports/view_seller_history" component={ViewSellerHistory} />
        <Route path="/reports/avg_time_in_inventory" component={AverageTimeInInventory} />
        <Route path="/reports/price_per_condition" component={PricePerCondition} />
        <Route path="/reports/part_statistics" component={PartStatistics} />
        <Route path="/reports/monthly_sales/origin" component={MonthlySales} />
      </Switch>
    </Router>
  );
};

export default Reports;
