import { useParams } from "react-router-dom";

const PartsOrder = () => {
  const { vin } = useParams();
  return (
    <div>
      <h2>New Parts Order for Vehicle</h2>
      <h3>Vin: {vin}</h3>
      {/* TODO: Create Form to add parts and then submit */}
    </div>
  );
};

export default PartsOrder;