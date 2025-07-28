import { API_BASE_URL } from "../app_url";
import axios from 'axios';
import { getLoggedInUser, getAuthToken } from '../utils/authUtils';


const getHeader = () => {
    const token = getAuthToken();
    // console.log(token);
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
export const getMegaMenu = async () => {
    const response = await fetch(`${API_BASE_URL}home/get-top-category-groups`, {
        method: 'GET'
    });
    return response;
}

//Get Banners
export const getAllSliders = async () => {
    const response = await fetch(`${API_BASE_URL}home/get-sliders`, {
        method: 'GET'
    });
    return response;
}

//Get Offer Product
export const getOfferProducts = async () => {
    const user = getLoggedInUser();
    const header = getHeader();
    const url = `${API_BASE_URL}home/get-offer-products${user ? `?user_id=${user.id}` : ''}`;
    const response = await fetch(url, {
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
      ...(header?.headers || {}),
      'Content-Type': 'application/json',
    },
  });
  return response;
};

//Get Top Brand
export const getTopBrand = async (lang) => {
    const response = await fetch(`${API_BASE_URL}home/get-top-brand`, {
        method: 'GET'
    });
    return response;
}

//Get Category by cat group
export const getCategory = async (id) => {
    const response = await fetch(`${API_BASE_URL}product/cetrgory-groups?id=${id}`, {
        method: 'GET'
    });
    return response;
}

//Get Top Category group
export const getTopCategoryGroup = async () => {
    const response = await fetch(`${API_BASE_URL}home/get-top-category-groups`, {
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

// fetching Product list
export const getCatProduct = async (id, page = 1) => {
  const user = getLoggedInUser();
  const header = getHeader();
  // Build query params
  const queryParams = new URLSearchParams();
  if (id) queryParams.append('category_id', id);
  if (user?.id) queryParams.append('user_id', user.id);
  queryParams.append('page', page); // ✅ add page with default = 1
  const url = `${API_BASE_URL}product/cetrgory-products?${queryParams.toString()}`;
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      ...(header?.headers || {}),
      'Content-Type': 'application/json',
    },
  });
  return response;
};
