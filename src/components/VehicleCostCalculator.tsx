import React, { useState, useEffect } from 'react';
import { Car, ChevronDown, RotateCcw } from 'lucide-react';

interface CalcData {
  name: string;
  depreciation: number;
  insurance: number;
  fuel: number;
  tax: number;
}

const DEFAULT_CALC: CalcData = {
  name: 'Audi A4 Avant',
  depreciation: 250,
  insurance: 80,
  fuel: 120,
  tax: 25,
};

export const VehicleCostCalculator: React.FC = () => {
  const [calcData, setCalcData] = useState<CalcData>(() => {
    try {
      const saved = localStorage.getItem('manageme_vehicle_calc') || localStorage.getItem('manageme_vehicle');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return DEFAULT_CALC;
  });

  const [isExpanded, setIsExpanded] = useState(true);

  useEffect(() => {
    try {
      localStorage.setItem('manageme_vehicle_calc', JSON.stringify(calcData));
      localStorage.setItem('manageme_vehicle', JSON.stringify(calcData));
    } catch (e) {
      console.error(e);
    }
  }, [calcData]);

  const handleReset = () => {
    setCalcData(DEFAULT_CALC);
  };

  const netMonthlyCost =
    (Number(calcData.depreciation) || 0) +
    (Number(calcData.insurance) || 0) +
    (Number(calcData.fuel) || 0) +
    (Number(calcData.tax) || 0);

  return (
    <div className="glass-panel border border-[var(--border)] rounded-2xl p-5 flex flex-col justify-between">
      <div>
        {/* Header */}
        <div className="flex justify-between items-center mb-4 gap-2">
          <h2 className="text-xl font-bold flex items-center gap-2 text-[var(--text-primary)]">
            <Car className="w-5 h-5 text-blue-400 shrink-0" />
            <span>Vehicle Ownership Cost Calc</span>
          </h2>
          <div className="flex items-center gap-2">
            <button
              onClick={handleReset}
              className="p-1.5 hover:bg-white/10 rounded-lg text-gray-400 transition-colors"
              title="Reset Defaults"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1.5 hover:bg-white/10 rounded-lg text-gray-400 transition-colors"
            >
              <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? '' : 'rotate-180'}`} />
            </button>
          </div>
        </div>

        {isExpanded && (
          <div className="space-y-3 text-xs sm:text-sm">
            {/* Vehicle Model Row */}
            <div className="flex justify-between items-center py-1 border-b border-white/10">
              <span className="text-gray-400 font-medium">Vehicle Name / Model</span>
              <input
                type="text"
                value={calcData.name}
                onChange={(e) => setCalcData({ ...calcData, name: e.target.value })}
                className="bg-transparent text-right outline-none border-b border-white/20 focus:border-blue-500 w-36 text-white font-semibold"
              />
            </div>

            {/* Depreciation Row */}
            <div className="flex justify-between items-center py-1 border-b border-white/10">
              <span className="text-gray-400">Monthly Depreciation / Finance</span>
              <div className="flex items-center gap-1">
                <span className="text-gray-400 font-mono">£</span>
                <input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={calcData.depreciation === 0 ? '' : calcData.depreciation}
                  onChange={(e) => setCalcData({ ...calcData, depreciation: e.target.value === '' ? 0 : parseFloat(e.target.value) || 0 })}
                  className="bg-transparent text-right outline-none border-b border-white/20 focus:border-blue-500 w-24 text-white font-mono"
                />
              </div>
            </div>

            {/* Insurance Row */}
            <div className="flex justify-between items-center py-1 border-b border-white/10">
              <span className="text-gray-400">Monthly Insurance</span>
              <div className="flex items-center gap-1">
                <span className="text-gray-400 font-mono">£</span>
                <input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={calcData.insurance === 0 ? '' : calcData.insurance}
                  onChange={(e) => setCalcData({ ...calcData, insurance: e.target.value === '' ? 0 : parseFloat(e.target.value) || 0 })}
                  className="bg-transparent text-right outline-none border-b border-white/20 focus:border-blue-500 w-24 text-white font-mono"
                />
              </div>
            </div>

            {/* Fuel / Energy Row */}
            <div className="flex justify-between items-center py-1 border-b border-white/10">
              <span className="text-gray-400">Monthly Fuel / Charging</span>
              <div className="flex items-center gap-1">
                <span className="text-gray-400 font-mono">£</span>
                <input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={calcData.fuel === 0 ? '' : calcData.fuel}
                  onChange={(e) => setCalcData({ ...calcData, fuel: e.target.value === '' ? 0 : parseFloat(e.target.value) || 0 })}
                  className="bg-transparent text-right outline-none border-b border-white/20 focus:border-blue-500 w-24 text-white font-mono"
                />
              </div>
            </div>

            {/* Road Tax / Maintenance Row */}
            <div className="flex justify-between items-center py-1 border-b border-white/10">
              <span className="text-gray-400">Monthly Tax & Maintenance</span>
              <div className="flex items-center gap-1">
                <span className="text-gray-400 font-mono">£</span>
                <input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={calcData.tax === 0 ? '' : calcData.tax}
                  onChange={(e) => setCalcData({ ...calcData, tax: e.target.value === '' ? 0 : parseFloat(e.target.value) || 0 })}
                  className="bg-transparent text-right outline-none border-b border-white/20 focus:border-blue-500 w-24 text-white font-mono"
                />
              </div>
            </div>

            {/* Net Monthly Cost Summary */}
            <div className="pt-4 border-t border-[var(--border)] flex justify-between items-center">
              <div>
                <span className="font-bold text-gray-300 block text-xs uppercase tracking-wider">Net Monthly Cost</span>
                <span className="text-[11px] text-gray-400 font-mono">Annual: £{(netMonthlyCost * 12).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
              <span className="font-bold text-2xl text-blue-400 font-mono">
                £{netMonthlyCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};


