import React, { useState, useEffect, useMemo, useContext } from "react";
import Table, { indexID } from "@/components/table";
import { Api } from "@/services/service";
import { useRouter } from "next/router";
import moment from "moment";
import { userContext } from "./_app";
import currencySign from "@/utils/currencySign";

function Wallet(props) {
  const router = useRouter();
  const [transactions, setTransactions] = useState([]);
  const [profileData, setProfileData] = useState({});
  const [walletSummary, setWalletSummary] = useState(null);
  const [adminWalletData, setAdminWalletData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useContext(userContext);
  const [page, setPage] = useState(1);
  const limit = 10;

  useEffect(() => {
    fetchData();
  }, [user, page]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      await Promise.all([
        getProfile(),
        user?.role === 'admin' ? getAdminWalletSummary() : getWalletSummary()
      ]);
    } catch (error) {
      console.error('Error fetching data:', error);
      props.toaster({ type: 'error', message: 'Failed to load wallet data' });
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return moment(dateString).format('DD-MM-YYYY, HH:mm:ss');
  };

  const getStatusBadge = (status) => {
    const statusClasses = {
      'Completed': 'bg-green-100 text-green-800',
      'Pending': 'bg-yellow-100 text-yellow-800',
      'Rejected': 'bg-red-100 text-red-800',
      'default': 'bg-gray-100 text-gray-800'
    };
    
    const className = statusClasses[status] || statusClasses['default'];
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${className}`}>
        {status}
      </span>
    );
  };

  const getProfile = async () => {
    props.loader(true);
    Api("get", "auth/getProfile", "", router).then(
      (res) => {
        props.loader(false);
        console.log("res================>", res);
        setProfileData(res.data);
      },
      (err) => {
        props.loader(false);
        console.log(err);
        props.toaster({ type: "error", message: err?.message });
      }
    );
  };

  const getWalletSummary = async () => {
    try {
      console.log('Fetching wallet data...');
      // Fetch all wallet transactions (both credits and debits)
      const [walletRes, withdrawRes] = await Promise.all([
        Api("get", `sellerWalletSummary?page=${page}&limit=${limit}`, "", router),
        Api("get", `getWithdrawreqbyseller?page=${page}&limit=${limit}`, "", router)
      ]);
      
      console.log('Wallet Response:', walletRes);
      console.log('Withdraw Response:', withdrawRes);

      console.log("wallet summary =>", walletRes);
      setWalletSummary(walletRes.data);
      
      // Format all transactions with clear type indicators
      const allTransactions = [
        // Credit Transactions - Money coming IN
        ...(walletRes.data.transactions?.map(tx => ({
          ...tx,
          type: 'credit',
          typeLabel: 'Credit',
          amount: tx.sellerEarnings,
          description: `Sale - Order #${tx.orderId}`,
          date: tx.createdAt,
          status: 'Completed',
          _id: tx._id + '-sale',
          icon: '💰'  // Money in icon
        })) || []),
        
        // Debit Transactions - Money going OUT
        ...(withdrawRes.data?.map(wd => ({
          ...wd,
          type: 'debit', // Always debit for withdrawals
          typeLabel: 'Debit',
          amount: wd.amount,
          description: wd.description || `Withdrawal - ${wd.paymentMethod || 'Bank Transfer'}`,
          date: wd.createdAt || wd.date,
          status: wd.settle || 'Pending',
          _id: wd._id + '-withdraw',
          icon: '💸'  // Money out icon
        })) || [])
      ].sort((a, b) => new Date(b.date) - new Date(a.date)); // Sort by date (newest first)
      
      setTransactions(allTransactions);
      
      // Update wallet balance
      if (walletRes?.data?.wallet !== undefined) {
        setProfileData(prev => ({ ...prev, wallet: walletRes.data.wallet }));
      }
    } catch (err) {
      console.error("Error fetching wallet data:", err);
      props.toaster({ type: 'error', message: 'Failed to load wallet transactions' });
      throw err;
    }
  };

  const getAdminWalletSummary = async () => {
    try {
      const [walletRes, withdrawRes] = await Promise.all([
        Api("get", `adminWalletSummary?page=${page}&limit=${limit}`, "", router),
        Api("get", `getAllWithdrawals?page=${page}&limit=${limit}`, "", router)
      ]);
      
      console.log("admin wallet data =>", { walletRes, withdrawRes });
      
      // Check if walletRes has data property
      const walletData = walletRes.data || {};
      setAdminWalletData(walletData);
      
      // Format commission transactions (credits)
      const commissionTransactions = (walletData.transactions || []).map(tx => ({
        ...tx,
        type: 'credit',
        typeLabel: 'Commission',
        amount: tx.adminFee || 0,
        description: `Commission - Order #${tx.orderId || 'N/A'}`,
        sellerName: tx.seller_id?.firstName 
          ? `${tx.seller_id.firstName} ${tx.seller_id.lastName || ''}`.trim() 
          : 'Unknown Seller',
        date: tx.createdAt || new Date().toISOString(),
        status: 'Completed',
        icon: '💼',
        _id: tx._id ? `${tx._id}-commission` : `commission-${Date.now()}`
      }));
      
      // Format withdrawal transactions (debits)
      const withdrawalTransactions = ((withdrawRes.data?.data || withdrawRes.data || [])).map(wd => {
        const sellerName = wd.request_by?.firstName || wd.request_by?.name || 'Unknown Seller';
        const sellerId = wd.request_by?._id || 'N/A';
        const paymentMethod = wd.paymentMethod || 'Bank Transfer';
        
        return {
          ...wd,
          type: 'debit',
          typeLabel: 'Withdrawal',
          amount: parseFloat(wd.amount || 0),
          description: `Withdrawal - ${paymentMethod}`,
          sellerInfo: `${sellerName} (ID: ${sellerId})`,
          date: wd.createdAt || wd.date || new Date().toISOString(),
          status: wd.settle || 'Pending',
          icon: '💸',
          _id: wd._id ? `${wd._id}-withdraw` : `withdraw-${Date.now()}`
        };
      });
      
      // Combine and sort all transactions by date
      const allTransactions = [...commissionTransactions, ...withdrawalTransactions]
        .sort((a, b) => new Date(b.date) - new Date(a.date));
      
      console.log('Setting transactions:', allTransactions);
      setTransactions(allTransactions);
    } catch (err) {
      console.error("admin wallet summary error", err);
      throw err;
    }
  };

  const renderTransactionItem = (transaction, index) => {
    const isCredit = transaction.type === 'credit' || transaction.type === 'commission';
    const amount = parseFloat(transaction.amount || 0);
    
    // Determine badge color based on transaction type
    const typeBadgeClass = isCredit 
      ? 'bg-green-100 text-green-800' 
      : 'bg-red-100 text-red-800';
    
    // Status badge class
    const statusBadgeClass = transaction.status === 'Completed' 
      ? 'bg-green-100 text-green-800' 
      : transaction.status === 'Rejected'
        ? 'bg-red-100 text-red-800'
        : 'bg-yellow-100 text-yellow-800';
    
    return (
      <div 
        key={index} 
        className="border-b border-gray-200 py-4 px-4 hover:bg-gray-50 transition-colors bg-white"
      >
        <div className="flex justify-between items-start w-full">
          <div className="flex items-start flex-1 min-w-0">
            <div className="mr-3 mt-1 text-2xl">
              {transaction.icon || (isCredit ? '💼' : '💸')}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${typeBadgeClass}`}>
                  {transaction.typeLabel || (isCredit ? 'Credit' : 'Debit')}
                </span>
                <span className="text-sm font-medium text-gray-900">
                  {currencySign}{amount.toFixed(2)}
                </span>
              </div>
              <p className="text-sm font-medium text-gray-900">
                {transaction.description}
              </p>
              {transaction.sellerInfo && (
                <p className="text-xs text-gray-500 mt-1">
                  Seller: {transaction.sellerInfo}
                </p>
              )}
              <p className="text-xs text-gray-500 mt-1">
                {moment(transaction.date).format('DD MMM YYYY, hh:mm A')}
              </p>
            </div>
          </div>
          <div className="text-right">
            <h5 className={`font-semibold ${isCredit ? 'text-green-600' : 'text-red-600'}`}>
              {isCredit ? '↑ +' : '↓ -'} {currencySign}{amount.toFixed(2)}
            </h5>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-1 ${statusBadgeClass}`}>
              {transaction.status}
            </span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <section className="w-full h-full bg-transparent md:pt-5 pt-2 pb-5 pl-5 pr-5">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          {user?.role === 'admin' ? 'Admin Wallet' : 'My Wallet'}
        </h1>
      </div>

      <div className="md:pb-32 pb-28 h-full overflow-auto md:mt-6 mt-4">
        {/* Wallet Balance Card */}
        <div className="bg-custom-blue rounded-lg shadow-lg p-6 text-white mb-8">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm font-medium text-blue-100">
                {user?.role === 'admin' ? 'Total Commission Received' : 'Available Balance'}
              </p>
              <p className="text-3xl font-bold mt-1">
                {currencySign(
                  (user?.role === 'admin' 
                    ? adminWalletData?.cashReceive 
                    : profileData?.wallet || 0
                  )?.toFixed(2) || '0.00'
                )}
              </p>
              {user?.role === 'admin' && (
                <p className="text-sm text-blue-100 mt-2">
                  {adminWalletData?.totalOrders || 0} orders processed
                </p>
              )}
            </div>
            <div className="text-4xl">
              💰
            </div>
          </div>
        </div>

        {/* Transaction History */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              Transaction History
            </h3>
          </div>
          
          {isLoading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500 mx-auto"></div>
              <p className="mt-2 text-sm text-gray-600">Loading transactions...</p>
            </div>
          ) : transactions?.length > 0 ? (
            <div className="divide-y divide-gray-200">
              {transactions.map((tx, index) => renderTransactionItem(tx, index))}
              
              {/* Pagination */}
              <div className="px-4 py-3 bg-gray-50 flex items-center justify-between border-t border-gray-200">
                <div className="flex-1 flex justify-between sm:hidden">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                      page === 1 ? 'bg-gray-100 text-gray-400' : 'bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setPage(p => p + 1)}
                    disabled={!transactions || transactions.length < limit}
                    className={`ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                      (!transactions || transactions.length < limit) ? 'bg-gray-100 text-gray-400' : 'bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center">
              <p className="text-gray-500">No transactions found</p>
            </div>
          )}
        </div>

        {/* Additional wallet info for seller */}
        {user?.role === "seller" && walletSummary && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                Wallet Summary
              </h3>
            </div>
            <div className="p-4">
              <p className="text-sm font-medium text-gray-800">
                Total Sales: {currencySign(walletSummary?.totalSales?.toFixed?.(2) || '0.00')}
              </p>
              <p className="text-sm font-medium text-gray-800">
                Total Earnings: {currencySign(walletSummary?.totalEarnings?.toFixed?.(2) || '0.00')}
              </p>
            </div>
          </div>
        )}

        {/* Admin Commission Wallet */}
        {user?.role === "admin" && adminWalletData && (
          <div className="bg-custom-white relative flex flex-col justify-center cursor-pointer mb-5">
            {/* <div className="bg-customGray w-full flex justify-between items-center md:py-5 py-2 rounded-md md:px-5 px-1">
              <p className="font-bold md:text-lg text-base text-center text-white">
                Admin Commission Wallet
              </p>
              <div>
                <p className="text-white md:text-lg text-base font-bold text-center">
                  {currencySign(
                    typeof adminWalletData?.cashReceive === "number"
                      ? adminWalletData.cashReceive.toFixed(2)
                      : "0.00"
                  )}
                </p>
              </div>
            </div> */}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:px-5 px-2 md:pb-5 pb-2">
              {/* <div className="bg-white/10 rounded-lg p-3 text-center">
                <p className="text-white/80 text-sm">Total Commission</p>
                <p className="text-white font-bold md:text-lg text-base">
                  {currencySign(
                    typeof adminWalletData?.totalCommissions === "number"
                      ? adminWalletData.totalCommissions.toFixed(2)
                      : "0.00"
                  )}
                </p>
              </div> */}
              {/* <div className="bg-white/10 rounded-lg p-3 text-center">
                <p className="text-white/80 text-sm">Total Orders</p>
                <p className="text-white font-bold md:text-lg text-base">
                  {adminWalletData?.totalOrders || 0}
                </p>
              </div> */}
              {/* <div className="bg-white/10 rounded-lg p-3 text-center">
                <p className="text-white/80 text-sm">Commission Rate</p>
                <p className="text-white font-bold md:text-lg text-base">2%</p>
              </div> */}
            </div>
          </div>
        )}

       

      </div>
    </section>
  );
}

export default Wallet;
