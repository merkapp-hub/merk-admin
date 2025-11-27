import React, { useState, useEffect, useContext } from 'react';
import { Api } from '@/services/service';
import { useRouter } from 'next/router';
import { userContext } from './_app';
import isAuth from '@/components/isAuth';
import currencySign from '@/utils/currencySign';

function CommissionInfo(props) {
  const router = useRouter();
  const [user, setUser] = useContext(userContext);
  const [commissionRate, setCommissionRate] = useState(15);
  const [samplePrice, setSamplePrice] = useState(100);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRates();
  }, []);

  const fetchRates = async () => {
    try {
      setLoading(true);
      
      // Fetch fresh seller profile data to get latest commission rate
      try {
        const profileResponse = await Api('get', 'auth/getProfile', '', router);
        console.log('Profile Response:', profileResponse);
        if (profileResponse?.data?.commissionRate !== undefined) {
          setCommissionRate(profileResponse.data.commissionRate);
          
          // Update user context and localStorage with fresh data
          const updatedUser = { ...user, commissionRate: profileResponse.data.commissionRate };
          setUser(updatedUser);
          localStorage.setItem('userDetail', JSON.stringify(updatedUser));
        } else if (user?.commissionRate !== undefined) {
          // Fallback to user context if API fails
          setCommissionRate(user.commissionRate);
        }
      } catch (profileError) {
        console.error('Error fetching profile:', profileError);
        // Fallback to user context
        if (user?.commissionRate !== undefined) {
          setCommissionRate(user.commissionRate);
        }
      }
    } catch (error) {
      console.error('Error fetching rates:', error);
      props.toaster({ type: 'error', message: 'Failed to fetch commission rates' });
    } finally {
      setLoading(false);
    }
  };

  const calculateBreakdown = (price) => {
    const productPrice = parseFloat(price) || 0;
    const commission = (productPrice * commissionRate) / 100;
    const sellerAmount = productPrice - commission;

    return {
      productPrice,
      commission,
      commissionRate,
      sellerAmount,
      sellerPercentage: productPrice > 0 ? ((sellerAmount / productPrice) * 100).toFixed(2) : 0
    };
  };

  const breakdown = calculateBreakdown(samplePrice);

  if (loading) {
    return (
      <section className="w-full h-full bg-transparent pt-5 pb-5 pl-5 pr-5">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-300 rounded w-1/4 mb-5"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </section>
    );
  }

  return (
    <section className="w-full h-full bg-transparent pt-5 pb-5 pl-5 pr-5">
      <div className="md:pt-0 pt-0 h-full overflow-scroll no-scrollbar">
        <p className="text-gray-800 font-bold md:text-[32px] text-2xl md:pb-5 pb-5">
          💰 Commission Information
        </p>

        <div className="grid md:grid-cols-2 grid-cols-1 gap-5">
          {/* Commission Rates Card */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">
              Your Commission Rates
            </h2>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-blue-50 rounded-lg">
                <div>
                  <p className="text-sm text-gray-600">App Commission</p>
                  <p className="text-2xl font-bold text-blue-600">{commissionRate}%</p>
                </div>
                <div className="text-4xl">📊</div>
              </div>

              <div className="flex justify-between items-center p-4 bg-green-50 rounded-lg">
                <div>
                  <p className="text-sm text-gray-600">Your Earnings</p>
                  <p className="text-2xl font-bold text-green-600">
                    {(100 - commissionRate).toFixed(2)}%
                  </p>
                </div>
                <div className="text-4xl">💵</div>
              </div>
            </div>

            <div className="mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
              <p className="text-xs text-gray-700">
                ℹ️ <strong>Note:</strong> Your commission rate is set by the admin. 
                Contact support if you have questions about your rates.
              </p>
            </div>
          </div>

          {/* Calculator Card */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">
              Earnings Calculator
            </h2>

            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Enter Product Price:
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={samplePrice}
                onChange={(e) => setSamplePrice(e.target.value)}
                className="w-full h-12 px-4 text-gray-700 border-2 border-gray-300 rounded-lg text-lg font-semibold focus:border-blue-500 outline-none"
                placeholder="Enter price..."
              />
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center pb-3 border-b-2 border-gray-200">
                <span className="text-base font-semibold text-gray-700">Product Price:</span>
                <span className="text-lg font-bold text-gray-900">
                  {currencySign(breakdown.productPrice)}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">
                  App Commission ({breakdown.commissionRate}%):
                </span>
                <span className="text-sm font-semibold text-orange-600">
                  - {currencySign(breakdown.commission)}
                </span>
              </div>

              <div className="flex justify-between items-center pt-3 border-t-2 border-green-300 mt-3 bg-green-50 p-3 rounded-lg">
                <span className="text-base font-bold text-gray-800">
                  Your Earnings ({breakdown.sellerPercentage}%):
                </span>
                <span className="text-2xl font-bold text-green-600">
                  {currencySign(breakdown.sellerAmount)}
                </span>
              </div>
            </div>
          </div>

          {/* Example Scenarios */}
          <div className="bg-white rounded-lg shadow-lg p-6 md:col-span-2">
            <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">
              Example Scenarios
            </h2>

            <div className="grid md:grid-cols-3 grid-cols-1 gap-4">
              {[25, 50, 100].map((price) => {
                const example = calculateBreakdown(price);
                return (
                  <div key={price} className="border-2 border-gray-200 rounded-lg p-4 hover:border-blue-400 transition-colors">
                    <p className="text-center text-lg font-bold text-gray-800 mb-3">
                      {currencySign(price)} Product
                    </p>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Commission:</span>
                        <span className="text-orange-600 font-semibold">
                          {currencySign(example.commission)}
                        </span>
                      </div>
                      <div className="flex justify-between pt-2 border-t border-gray-300">
                        <span className="font-bold text-gray-800">You Get:</span>
                        <span className="text-green-600 font-bold">
                          {currencySign(example.sellerAmount)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default isAuth(CommissionInfo);
