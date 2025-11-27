import React from 'react';
import currencySign from '@/utils/currencySign';

const CommissionBreakdown = ({ productPrice = 0, commissionRate = 15, showTitle = true }) => {

  const calculateBreakdown = () => {
    const price = parseFloat(productPrice) || 0;
    const commission = (price * commissionRate) / 100;
    const sellerAmount = price - commission;

    return {
      price,
      commission,
      commissionRate,
      sellerAmount,
      sellerPercentage: price > 0 ? ((sellerAmount / price) * 100).toFixed(2) : 0
    };
  };

  const breakdown = calculateBreakdown();

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
      {showTitle && (
        <h3 className="text-lg font-bold text-gray-800 mb-3">
          💰 Commission Breakdown
        </h3>
      )}
      
      <div className="space-y-2">
        {/* Product Price */}
        <div className="flex justify-between items-center pb-2 border-b border-blue-200">
          <span className="text-sm font-semibold text-gray-700">Product Price:</span>
          <span className="text-base font-bold text-gray-900">
            {currencySign(breakdown.price)}
          </span>
        </div>

        {/* Commission */}
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">
            App Commission ({breakdown.commissionRate}%):
          </span>
          <span className="text-sm font-semibold text-orange-600">
            - {currencySign(breakdown.commission)}
          </span>
        </div>

        {/* Seller Amount */}
        <div className="flex justify-between items-center pt-2 border-t-2 border-blue-300 mt-2">
          <span className="text-base font-bold text-gray-800">
            Your Earnings ({breakdown.sellerPercentage}%):
          </span>
          <span className="text-lg font-bold text-green-600">
            {currencySign(breakdown.sellerAmount)}
          </span>
        </div>
      </div>

      {/* Info Message */}
      <div className="mt-3 p-2 bg-blue-100 rounded text-xs text-gray-600">
        ℹ️ This breakdown shows how the product price is distributed. Your commission rate is set by the admin.
      </div>
    </div>
  );
};

export default CommissionBreakdown;
