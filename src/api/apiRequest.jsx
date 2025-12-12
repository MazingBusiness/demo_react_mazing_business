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
export const getCatProduct = async (id, page = 1, brand_id) => {
  const user = getLoggedInUser();
  const header = getHeader();
  // Build query params
  const queryParams = new URLSearchParams();
  if (id) queryParams.append('category_id', id);
  if (brand_id) queryParams.append('brand_id', brand_id);
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

// Quick Order Product
export const getQuickOrderProduct = async (cat_groups, categories, brands, search_text, min_price, max_price, location_id, inhouse_product, page = 1, pagination = 16) => {
  const user = getLoggedInUser();
  const header = getHeader();
  // Build query params
  const queryParams = new URLSearchParams();
  if (cat_groups) queryParams.append('cat_groups', cat_groups);
  if (categories) queryParams.append('categories', categories);
  if (brands) queryParams.append('brands', brands);
  if (search_text) queryParams.append('search_text', search_text);
  if (min_price) queryParams.append('min_price', min_price);
  if (max_price) queryParams.append('max_price', max_price);
  if (location_id) queryParams.append('location_id', location_id);
  if (inhouse_product) queryParams.append('inhouse_product', inhouse_product);
  if (page) queryParams.append('page', page);
  if (pagination) queryParams.append('pagination', pagination);
  if (user?.id) queryParams.append('user_id', user.id);
  queryParams.append('page', page); // ✅ add page with default = 1
  const url = `${API_BASE_URL}product/quick-order?${queryParams.toString()}`;
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      ...(header?.headers || {}),
      'Content-Type': 'application/json',
    },
  });
  return response;
};

// Product Details
export const getProductDetails = async (id) => {
  const user = getLoggedInUser();
  const header = getHeader();
  // Build query params
  const queryParams = new URLSearchParams();
  if (id) queryParams.append('product_id', id);
  if (user?.id) queryParams.append('user_id', user.id); // For Loged User
  const url = `${API_BASE_URL}product/product-details?${queryParams.toString()}`;
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      ...(header?.headers || {}),
      'Content-Type': 'application/json',
    },
  });
  return response;
};

