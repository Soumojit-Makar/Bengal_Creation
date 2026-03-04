// // utils/razorpay.js - development version
// const Razorpay = require('razorpay');

// // For development, use mock if no credentials
// if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
//   console.log('🔧 Running in development mode with mock Razorpay');
  
//   // Export a mock object for development
//   module.exports = {
//     orders: {
//       create: async (options) => {
//         console.log('📦 Mock order created:', options);
//         return {
//           id: 'order_mock_' + Date.now(),
//           amount: options.amount,
//           currency: options.currency,
//           receipt: options.receipt
//         };
//       }
//     }
//   };
// } else {
//   // Use real Razorpay in production
//   const razorpay = new Razorpay({
//     key_id: process.env.RAZORPAY_KEY_ID,
//     key_secret: process.env.RAZORPAY_KEY_SECRET,
//   });
//   module.exports = razorpay;
// }