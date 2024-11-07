import { useParams } from "react-router-dom";

const VehicleDetail = () => {
  const { vin } = useParams();
  return (
    <div>
      <h2>Vehicle Detail</h2>
      <h3>Vin: {vin}</h3>
    </div>
  );
};

export default VehicleDetail;