const axios = require("axios");
require('dotenv').config();

// Function to verify Khalti Payment
// Debug the verification request
async function verifyKhaltiPayment(pidx) {
  const headersList = {
    "Authorization": `Key ${process.env.KHALTI_SECRET_KEY}`,
    "Content-Type": "application/json",
  };

  const bodyContent = JSON.stringify({ pidx });
  
  console.log("Making verification request with pidx:", pidx);
  console.log("Using secret key:", process.env.KHALTI_SECRET_KEY);
  console.log("Using URL:", `${process.env.KHALTI_GATEWAY_URL}/api/v2/epayment/lookup/`);

  const reqOptions = {
    url: `${process.env.KHALTI_GATEWAY_URL}/api/v2/epayment/lookup/`,
    method: "POST",
    headers: headersList,
    data: bodyContent,
  };

  try {
    const response = await axios.request(reqOptions);
    console.log("Full verification response:", JSON.stringify(response.data, null, 2));
    return response.data;
  } catch (error) {
    console.error("Error verifying Khalti payment:", error.response?.data || error.message);
    throw error;
  }
}

// Function to initialize Khalti Payment
async function initializeKhaltiPayment(details) {
  const headersList = {
    "Authorization": `Key ${process.env.KHALTI_SECRET_KEY}`,
    "Content-Type": "application/json",
  };

  // Ensure purchase_order_id is included correctly
  const payload = {
    ...details,
    purchase_order_id: details.purchase_order_id.toString(), // Ensure it's a string
    purchase_order_name: details.purchase_order_name,
    amount: details.amount,
    return_url: details.return_url,
    website_url: details.website_url,
  };

  console.log("Initializing Khalti payment with payload:", JSON.stringify(payload, null, 2));

  const reqOptions = {
    url: `${process.env.KHALTI_GATEWAY_URL}/api/v2/epayment/initiate/`,
    method: "POST",
    headers: headersList,
    data: JSON.stringify(payload),
  };

  try {
    const response = await axios.request(reqOptions);
    console.log("Khalti initialization response:", JSON.stringify(response.data, null, 2));
    return response.data;
  } catch (error) {
    console.error("Error initializing Khalti payment:", error.response?.data || error.message);
    throw error;
  }
}

module.exports = { verifyKhaltiPayment, initializeKhaltiPayment };