// Example: /pages/checkout/payment.js (Next.js) or /src/pages/checkout/payment.jsx (React)

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router'; // For Next.js
// import { useLocation } from 'react-router-dom'; // For React Router

const PaymentPage = () => {
  const router = useRouter(); // Next.js
  // const location = useLocation(); // React Router
  
  const [orderData, setOrderData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Extract URL parameters
    const { query } = router; // Next.js
    // const searchParams = new URLSearchParams(location.search); // React Router
    
    const orderId = query.orderId;
    const planId = query.planId;
    const amount = query.amount;
    const currency = query.currency;

    if (!orderId || !planId || !amount || !currency) {
      setError('Missing required payment parameters');
      setLoading(false);
      return;
    }

    // Set order data
    setOrderData({
      orderId,
      planId,
      amount: parseInt(amount),
      currency
    });

    setLoading(false);
  }, [router]); // Next.js
  // }, [location]); // React Router

  const handlePayment = () => {
    if (!orderData) return;

    // Initialize Razorpay checkout
    const options = {
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID, // Your Razorpay key
      amount: orderData.amount,
      currency: orderData.currency,
      name: "Your Company Name",
      description: "Coach Plan Purchase",
      order_id: orderData.orderId,
      handler: async function (response) {
        // Handle successful payment
        try {
          const verifyResponse = await fetch('/api/paymentsv1/razorpay/verify-payment', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            })
          });

          const result = await verifyResponse.json();
          
          if (result.success) {
            // Redirect to success page
            router.push('/payment/success');
          } else {
            // Redirect to failure page
            router.push('/payment/failure');
          }
        } catch (error) {
          console.error('Payment verification failed:', error);
          router.push('/payment/failure');
        }
      },
      prefill: {
        name: "Customer Name",
        email: "customer@example.com",
        contact: "+919876543210"
      },
      theme: {
        color: "#3399cc"
      }
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  if (loading) {
    return (
      <div className="payment-page">
        <div className="loading">Loading payment details...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="payment-page">
        <div className="error">
          <h2>Payment Error</h2>
          <p>{error}</p>
          <button onClick={() => router.push('/')}>Go Home</button>
        </div>
      </div>
    );
  }

  return (
    <div className="payment-page">
      <div className="payment-container">
        <h1>Complete Your Payment</h1>
        
        <div className="payment-details">
          <h3>Order Details</h3>
          <p><strong>Order ID:</strong> {orderData.orderId}</p>
          <p><strong>Amount:</strong> ₹{orderData.amount / 100}</p>
          <p><strong>Currency:</strong> {orderData.currency}</p>
        </div>

        <button 
          className="pay-button"
          onClick={handlePayment}
        >
          Pay ₹{orderData.amount / 100}
        </button>

        <div className="payment-info">
          <p>🔒 Secure payment powered by Razorpay</p>
          <p>💳 Accepts cards, UPI, net banking, and wallets</p>
        </div>
      </div>

      <style jsx>{`
        .payment-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #f5f5f5;
          padding: 20px;
        }
        
        .payment-container {
          background: white;
          padding: 40px;
          border-radius: 10px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          max-width: 500px;
          width: 100%;
          text-align: center;
        }
        
        .payment-details {
          background: #f8f9fa;
          padding: 20px;
          border-radius: 8px;
          margin: 20px 0;
          text-align: left;
        }
        
        .pay-button {
          background: #3399cc;
          color: white;
          border: none;
          padding: 15px 30px;
          font-size: 18px;
          border-radius: 5px;
          cursor: pointer;
          margin: 20px 0;
          width: 100%;
        }
        
        .pay-button:hover {
          background: #2980b9;
        }
        
        .payment-info {
          margin-top: 20px;
          font-size: 14px;
          color: #666;
        }
        
        .loading, .error {
          text-align: center;
          padding: 40px;
        }
        
        .error {
          color: #e74c3c;
        }
      `}</style>
    </div>
  );
};

export default PaymentPage;
