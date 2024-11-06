import { Link } from "react-router-dom";

const ReportLinks = () => {
  return (
    <div>
      <div>
        <Link to="/average_time_in_inventory">
          View Average Time in Inventory
        </Link>
      </div>
      <div>
        <Link to="/view_seller_history">View Seller History</Link>
      </div>
      <div>
        <Link to="/price_per_condition">Price Per Condition</Link>
      </div>
      <div>
        <Link to="/part_statistics">Part Statistics</Link>
      </div>
      <div>
        <Link to="/monthly_sales/origin">Monthly Sales Origin</Link>
      </div>
      <div>
        <Link to="/monthly_sales/drilldown">Monthly Sales Drilldown</Link>
      </div>
    </div>
  );
};

export default ReportLinks;
