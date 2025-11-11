import { API_BASE_URL } from "../app_url";
import axios from 'axios';
import { getLoggedInUser, getAuthToken } from '../utils/authUtils';


let value = JSON.parse(localStorage.getItem("mazingBusinessLoginInfo"));
// console.log(value);
let authorisation = value ? value["authorisation"] : null;
// Check if authorisation is not null before accessing its properties
let token = authorisation ? authorisation["token"] : null;
// console.log(token);


const getHeader = () => {
    const token = getAuthToken();
    if (token) {
        return {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        };
    } else {
        console.error("Authorization token is missing or null");
        return null;
    }
};

//Get Banners
export const getAllSliders = async () => {
    const response = await fetch(`${API_BASE_URL}home/get-sliders`, {
        method: 'GET'
    });
    return response;
}

// Get Page Content Form Json
export const getPageContent = async (lang) => {
    const response = await fetch(`${API_BASE_URL}user/page-content-from-json?lang=${lang}`, {
        method: 'GET'
    });
    return response;
}
// --Registraton Process APIs start--

// Verify Email
export const sendVerifyEmail = async (data) =>
{
    const response = await fetch(`${API_BASE_URL}user/send-verify-email`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });
    return response;
}

export const registerUser = async (userData) => {
    const response = await fetch(`${API_BASE_URL}user/sign-up`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
    });
    return response;
}

export const verifyGstinForRegistration = async (gst_number) => {
  return fetch(`${API_BASE_URL}user/verify-gst-for-registration`, {
    method: 'POST',
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ gst_number }),
  });
};

export const getAllStates = async () => {
  const response = await fetch(`${API_BASE_URL}user/state`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  return response;
};

// Get cities by state_id
export const getCitiesByState = async (stateId) => {
  const response = await fetch(`${API_BASE_URL}user/city?state_id=${stateId}`);
  return await response.json();
};

export const verifyPhoneForRegistration = async (phone) => {
  const response = await fetch(`${API_BASE_URL}user/verify-phone-for-registration`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ phone }),
  });
  return response;
};

// --Registraton Process APIs end--

// --Login API start--
export const login = async (login_info) => {
    const response = await fetch(`${API_BASE_URL}user/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(login_info),
    });
    return response;
}

// Send OTP for login
export const sendOtpForLogin = async (phone) => {
  const response = await fetch(`${API_BASE_URL}user/send-otp-for-login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ phone }),
  });
  return response;
};

//  Send OTP for Forgot Password
export const sendForgotPasswordOtp = async (phone) => {
  const response = await fetch(`${API_BASE_URL}user/send-otp-for-forget-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ phone }),
  });

  return response;
};
// --Login API end--



// Get My Orders
export const getMyOrders = async () => {
  try {
    
    const response = await fetch(`${API_BASE_URL}user/my-order/`, {
      
      method: 'GET',
      headers: {
         ...getHeader().headers,
        'Content-Type': 'application/json',
      },
    });

    return response;
  } catch (error) {
    console.error("Error fetching orders:", error);
    throw error;
  }
};

// fetching Product list
export const getProduct = async (lang) => {
    const response = await fetch(`${API_BASE_URL}product/get-products?lang=${lang}`,{
         method: 'GET',
         headers: {
            ...getHeader().headers,
           'Content-Type': 'application/json',
        },
    });
    return response;
}