import React from 'react';
import { VehicleCostCalculator } from './VehicleCostCalculator';

export { VehicleCostCalculator };
export const VehicleCalc: React.FC = (props) => <VehicleCostCalculator {...props} />;
export default VehicleCalc;
