import { API_BASE_URL } from "../app_url";
import axios from 'axios';

// let value = JSON.parse(localStorage.getItem("mazingBusinessLoginInfo"));
// console.log(value);
// let authorisation = value ? value["authorisation"] : null;
// Check if authorisation is not null before accessing its properties
// let token = authorisation ? authorisation["token"] : null;
// console.log(token);

// Get loged user's info
export const getLoggedInUser = () => {
  const loginInfo = JSON.parse(localStorage.getItem("mazingBusinessLoginInfo"));
  return loginInfo?.user || null;
};

// Get loged user's auth
export const getAuthToken = () => {
  const loginInfo = JSON.parse(localStorage.getItem("mazingBusinessLoginInfo"));
  return loginInfo?.authorisation?.token || null;
};

const getHeader = () => {
    // let value = JSON.parse(localStorage.getItem("mazingBusinessLoginInfo"));    
    // console.warn(value)
    // let authorisation = value ? value["authorisation"] : null;
    const token = getAuthToken();
    if (token) {
        let token = token;
        let header = {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        };
        return header;
    } else {
        // Handle the case where authorisation is null.
        console.error("Authorization token is missing or null");
        // You might want to return a default header or throw an error here.
        return null; // or return a default header if needed
    }
};


//Get Banners
export const getAllSliders = async () => {
    const response = await fetch(`${API_BASE_URL}home/get-sliders`, {
        method: 'GET'
    });
    return response;
}

//Get Offer Product
export const getOfferProducts = async () => {
  const header = getHeader();

  const response = await fetch(`${API_BASE_URL}home/get-offer-products`, {
    method: 'GET',
    headers: {
      ...(header?.headers || {}),
      'Content-Type': 'application/json',
    },
  });

  return response;
};

//Get Offer Product
export const getBestSellerProducts = async () => {
  const user = getLoggedInUser();
  const header = getHeader();
  const url = `${API_BASE_URL}home/get-best-seller-products${user ? `?user_id=${user.id}` : ''}`;
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      ...(header?.headers || {}), // ✅ safely handle null
      'Content-Type': 'application/json',
    },
  });
  return response;
};


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
// --Login API end--

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