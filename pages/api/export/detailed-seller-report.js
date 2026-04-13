import axios from 'axios';
import * as XLSX from 'xlsx';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { reportTypes, id } = req.body;

    if (!id) {
      return res.status(400).json({ message: 'Seller ID is required' });
    }

    if (!reportTypes || reportTypes.length === 0) {
      return res.status(400).json({ message: 'Please select at least one report type' });
    }

    const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
    const token = req.headers.authorization;

    // Create workbook
    const workbook = XLSX.utils.book_new();

    // Fetch seller details
    const sellerResponse = await axios.get(`${baseURL}/auth/getSellerListt?page=1&limit=1000`, {
      headers: { Authorization: token }
    });

    const seller = sellerResponse.data.data.find(s => s._id === id);
    
    if (!seller) {
      return res.status(404).json({ message: 'Seller not found' });
    }

    // Products Report
    if (reportTypes.includes('Products')) {
      try {
        const productsResponse = await axios.get(`${baseURL}/getProductsByUserId/${id}`, {
          headers: { Authorization: token }
        });

        const products = productsResponse.data.data || [];
        const productsData = products.map((product, index) => ({
          'S.No': index + 1,
          'Product Name': product.name || '',
          'Category': product.category?.name || '',
          'Price': product.price || 0,
          'Stock': product.stock || 0,
          'Status': product.status || '',
          'Created At': product.createdAt ? new Date(product.createdAt).toLocaleDateString() : ''
        }));

        const productsSheet = XLSX.utils.json_to_sheet(productsData);
        XLSX.utils.book_append_sheet(workbook, productsSheet, 'Products');
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    }

    // Orders Report
    if (reportTypes.includes('Orders')) {
      try {
        const ordersResponse = await axios.get(`${baseURL}/getOrdersBySellerId/${id}`, {
          headers: { Authorization: token }
        });

        const orders = ordersResponse.data.data || [];
        const ordersData = orders.map((order, index) => ({
          'S.No': index + 1,
          'Order ID': order.orderId || '',
          'Customer Name': (order.user?.firstName || '') + ' ' + (order.user?.lastName || ''),
          'Total Amount': order.finalAmount || order.total || 0,
          'Status': order.status || '',
          'Payment Mode': order.paymentmode || '',
          'Order Date': order.createdAt ? new Date(order.createdAt).toLocaleDateString() : ''
        }));

        const ordersSheet = XLSX.utils.json_to_sheet(ordersData);
        XLSX.utils.book_append_sheet(workbook, ordersSheet, 'Orders');
      } catch (error) {
        console.error('Error fetching orders:', error);
      }
    }

    // Returns Report (includes both returns and refunds)
    if (reportTypes.includes('Returns')) {
      try {
        const returnsResponse = await axios.get(`${baseURL}/getReturnsBySellerId/${id}`, {
          headers: { Authorization: token }
        });

        const returns = returnsResponse.data.data || [];
        const returnsData = [];

        returns.forEach((order) => {
          order.productDetail?.forEach((product) => {
            if (product.returnDetails?.isReturned || product.returnDetails?.isRefunded) {
              returnsData.push({
                'Order ID': order.orderId || '',
                'Product Name': product.product?.name || '',
                'Return Status': product.returnDetails.returnStatus || '',
                'Return Reason': product.returnDetails.reason || '',
                'Return Date': product.returnDetails.returnRequestDate ? 
                  new Date(product.returnDetails.returnRequestDate).toLocaleDateString() : '',
                'Is Refunded': product.returnDetails.isRefunded ? 'Yes' : 'No',
                'Refund Amount': product.returnDetails.refundAmount || 0,
                'Refunded At': product.returnDetails.refundedAt ? 
                  new Date(product.returnDetails.refundedAt).toLocaleDateString() : ''
              });
            }
          });
        });

        const returnsSheet = XLSX.utils.json_to_sheet(returnsData);
        XLSX.utils.book_append_sheet(workbook, returnsSheet, 'Returns & Refunds');
      } catch (error) {
        console.error('Error fetching returns:', error);
      }
    }

    // Generate Excel buffer
    const excelBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    // Set headers for file download
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=seller-${seller.firstName}-report.xlsx`);
    
    return res.status(200).send(excelBuffer);

  } catch (error) {
    console.error('Export error:', error);
    return res.status(500).json({ 
      message: error.message || 'Failed to export seller report' 
    });
  }
}
