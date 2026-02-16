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
export const getQuickOrderProduct = async (cat_groups, categories, brands, search_text, min_price, max_price, location_id, inhouse_product, price_sort, delivery, page = 1, pagination = 16) => {
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
  // if (inhouse_product) queryParams.append('inhouse_product', inhouse_product);
  if (delivery) queryParams.append('inhouse_product', delivery);
  if (page) queryParams.append('page', page);
  if (price_sort) queryParams.append('price_sort', price_sort);
  if (pagination) queryParams.append('pagination', pagination);
  // if (delivery != null) queryParams.append("delivery", delivery); // ✅ 1/2
  if (user?.id) queryParams.append('user_id', user.id);
  // queryParams.append('page', page); // ✅ add page with default = 1
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
  const data = await response.json();
  return data;
};

// Cart
export const cart = async () => {
  const header = getHeader();
  if (!header) throw new Error("Authorization token missing");

  const res = await fetch(`${API_BASE_URL}cart`, {
    method: "GET",
    headers: {
      Accept: "application/json",
      ...(header.headers || {}),
    },
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data?.msg || "Cart API failed");
  return data;
};

export const updateQuantity = async ({ id, quantity, product_id, cart_id }) => {
  const header = getHeader();
  if (!header) throw new Error("Authorization token missing");

  const finalId = id ?? cart_id ?? product_id;
  if (!finalId) throw new Error("Missing id/cart_id/product_id for updateQuantity");

  const res = await fetch(`${API_BASE_URL}cart/update-quantity`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...(header.headers || {}),
    },
    body: JSON.stringify({
      id: finalId,
      quantity: Number(quantity),
    }),
  });

  const data = await res.json();
  if (!res.ok || data?.res === false) {
    throw new Error(data?.msg || "Update cart failed");
  }
  return data;
};


export const addToCart = async ({ product_id, quantity, type }) => {
  const header = getHeader();
  if (!header) throw new Error("Authorization token missing");

  const res = await fetch(`${API_BASE_URL}cart/add-to-cart`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...(header.headers || {}), // Authorization: Bearer xxx
    },
    body: JSON.stringify({ product_id, quantity, type, }),
  });

  const data = await res.json();
  if (!res.ok || data?.res === false) {
    throw new Error(data?.msg || "Add to cart failed");
  }
  return data;
};

// Get All Category Group
export const getAllCategoryGroups = async () => {
  const url = `${API_BASE_URL}product/cetrgory-groups`;
  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
  // const data = await response.json();
  return response;
};

// Get All Brands
export const getAllBrands = async (category_group_id, category_id) => {
  const queryParams = new URLSearchParams();
  if (category_group_id) queryParams.append("category_group_id", category_group_id);
  if (category_id) queryParams.append("category_id", category_id);

  const url = `${API_BASE_URL}product/all-brands?${queryParams.toString()}`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  // const data = await response.json();
  return response;
};

export const saveForLater = async ({ cart_id }) => {
  const header = getHeader();
  if (!header) throw new Error("Authorization token missing");
  const finalId = cart_id;
  if (!finalId) throw new Error("Missing cart_id for saveForLater");
  const res = await fetch(`${API_BASE_URL}cart/save-for-later`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...(header.headers || {}),
    },
    body: JSON.stringify({
      cart_id: finalId
    }),
  });
  const data = await res.json();
  if (!res.ok || data?.res === false) {
    throw new Error(data?.msg || "Update cart failed");
  }
  return data;
};

export const saveForLaterAllSelectedItems = async ({ idsCsv }) => {
  const header = getHeader();
  if (!header) throw new Error("Authorization token missing");

  if (!idsCsv || typeof idsCsv !== "string" || !idsCsv.trim()) {
    throw new Error("Missing idsCsv for bulk move");
  }

  const res = await fetch(`${API_BASE_URL}cart/save-for-later`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...(header.headers || {}),
    },
    body: JSON.stringify({
      cart_id: idsCsv, // ✅ string: "12,15,22"
    }),
  });
  const data = await res.json();
  if (!res.ok || data?.res === false) {
    throw new Error(data?.msg || "Bulk move failed");
  }
  return data;
};

export const moveToCart = async ({ cart_id }) => {
  const header = getHeader();
  if (!header) throw new Error("Authorization token missing");
  const finalId = cart_id;
  if (!finalId) throw new Error("Missing cart_id for saveForLater");
  const res = await fetch(`${API_BASE_URL}cart/move-to-cart`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...(header.headers || {}),
    },
    body: JSON.stringify({
      id: finalId
    }),
  });
  const data = await res.json();
  if (!res.ok || data?.res === false) {
    throw new Error(data?.msg || "Update cart failed");
  }
  return data;
};

export const moveToCartAllSelectedItems = async ({ idsCsv }) => {
  const header = getHeader();
  if (!header) throw new Error("Authorization token missing");

  if (!idsCsv || typeof idsCsv !== "string" || !idsCsv.trim()) {
    throw new Error("Missing idsCsv for bulk move");
  }

  const res = await fetch(`${API_BASE_URL}cart/move-to-cart`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...(header.headers || {}),
    },
    body: JSON.stringify({
      id: idsCsv, // ✅ string: "12,15,22"
    }),
  });

  const data = await res.json();
  if (!res.ok || data?.res === false) {
    throw new Error(data?.msg || "Bulk move failed");
  }
  return data;
};


export const saveAllNoCreditItems = async () => {  
  const header = getHeader();
  const url = `${API_BASE_URL}cart/save-all-no-credit-item-for-later`;
  const response = await fetch(url, {
    method: "GET",
    headers: {
      Accept: "application/json",
      ...(header.headers || {}),
    },
  });
  // const data = await response.json();
  return response;
};

export const moveAllNoCreditItems = async () => {  
  const header = getHeader();
  const url = `${API_BASE_URL}cart/move-all-no-credit-item-to-cart`;
  const response = await fetch(url, {
    method: "GET",
    headers: {
      Accept: "application/json",
      ...(header.headers || {}),
    },
  });
  // const data = await response.json();
  return response;
};

export const deleteFromSaveForLaterItem = async (payload) => {
  const header = getHeader();
  const finalId = typeof payload === "object" ? payload.id : payload;
  const url = `${API_BASE_URL}cart/update-save-for-later?id=${encodeURIComponent(String(finalId))}`;
  const response = await fetch(url, {
    method: "GET",
    headers: { Accept: "application/json", ...(header.headers || {}) },
  });
  return response;
};

export const validOffers = async () => {
  const header = getHeader();
  const url = `${API_BASE_URL}product/valid-offers`;
  const response = await fetch(url, {
    method: "GET",
    headers: { Accept: "application/json", ...(header.headers || {}) },
  });
  return response;
};

export const applyOffer = async (offer_id) => {
  const header = getHeader();
  const queryParams = new URLSearchParams();
  if (offer_id != null) queryParams.append("offer_id", String(offer_id));
  const url = `${API_BASE_URL}cart/apply-offer?${queryParams.toString()}`;
  const response = await fetch(url, {
    method: "GET",
    headers: { Accept: "application/json", ...(header.headers || {}) },
  });
  console.log(response);
  return response;
};

export const removeOffer = async (offer_id) => {
  const header = getHeader();
  const queryParams = new URLSearchParams();
  if (offer_id != null) queryParams.append("offer_id", String(offer_id));
  const url = `${API_BASE_URL}cart/remove-offer?${queryParams.toString()}`;
  const response = await fetch(url, {
    method: "GET",
    headers: { Accept: "application/json", ...(header.headers || {}) },
  });
  console.log(response);
  return response;
};
export const statementDownload = async () => {
  const header = getHeader();
  const url = `${API_BASE_URL}user/statement-download`;

  const res = await fetch(url, {
    method: "GET",
    headers: { Accept: "application/json", ...(header.headers || {}) },
  });

  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`);
  }

  const json = await res.json(); // ✅ read response body
  return json; // { pdf_url: "..." }
};

export const downloadUserStatement = async ({ party_code, data_from = "live" }) => {
  const params = new URLSearchParams();
  params.append("party_code", party_code);
  if (data_from) params.append("data_from", data_from);

  const res = await fetch(
    `${API_BASE_URL}user/statement-download?${params.toString()}`,
    {
      method: "GET",
      headers: { Accept: "application/json", ...(getHeader()?.headers || {}) },
    }
  );

  return res.json(); // { pdf_url: "https://....pdf" }
};

export const userDetails = async () => {
  const header = getHeader();
  const url = `${API_BASE_URL}user/user-details`;
  const res = await fetch(url, {
    method: "GET",
    headers: { Accept: "application/json", ...(header.headers || {}) },
  });
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`);
  }
  const json = await res.json(); // ✅ read response body
  return json;
};

export const getShippingAddress = async () => {
  const header = getHeader();
  const url = `${API_BASE_URL}cart/shipping-address`;
  const res = await fetch(url, {
    method: "GET",
    headers: { Accept: "application/json", ...(header.headers || {}) },
  });
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`);
  }
  const json = await res.json(); // ✅ read response body
  return json;
};

export const updateShippingAddressToCart = async (address_id) => {
  const header = getHeader();
  const queryParams = new URLSearchParams();
  if (address_id != null) queryParams.append("address_id", String(address_id));
  const url = `${API_BASE_URL}cart/update-shipping-address-to-cart?${queryParams.toString()}`;
  const response = await fetch(url, {
    method: "GET",
    headers: { Accept: "application/json", ...(header.headers || {}) },
  });
  console.log(response);
  return response;
};

export const orderSubmit = async () => {
  const header = getHeader();
  const queryParams = new URLSearchParams();
  queryParams.append("order_from", "web");
  const url = `${API_BASE_URL}cart/order-submit?${queryParams.toString()}`;
  const response = await fetch(url, {
    method: "GET",
    headers: { Accept: "application/json", ...(header.headers || {}) },
  });
  console.log(response);
  return response;
};

export const paymentStatus = async (merchant_tran_id) => {
  const header = getHeader();
  const queryParams = new URLSearchParams();
  if (merchant_tran_id != null) queryParams.append("merchant_tran_id", String(merchant_tran_id));
  const url = `${API_BASE_URL}cart/check-payment-status?${queryParams.toString()}`;
  const response = await fetch(url, {
    method: "GET",
    headers: { Accept: "application/json", ...(header.headers || {}) },
  });
  console.log(response);
  // throws if not 2xx (optional but useful)
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`paymentStatus failed: ${response.status} ${text}`);
  }
  return response.json(); // ✅ { res: false, status: "PENDING" }
};

export const getMyOrders = async ({ page = 1, per_page = 15 } = {}) => {
  try {
    const header = getHeader?.() || {};
    const queryParams = new URLSearchParams();
    queryParams.append("page", String(page));
    queryParams.append("per_page", String(per_page));
    const url = `${API_BASE_URL}user/my-order?${queryParams.toString()}`;
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/json",
        ...(header.headers || {}), // includes Authorization if your app uses token
      },
    });
    const text = await response.text();
    let json = null;

    try {
      json = JSON.parse(text);
    } catch (e) {
      // not JSON
    }
    if (!response.ok) {
      return {
        res: false,
        msg: json?.message || json?.msg || `HTTP ${response.status}`,
        debug: { url, status: response.status, body: text },
      };
    }
    return json || { res: false, msg: "Invalid JSON response", debug: { url, body: text } };
  } catch (err) {
    return { res: false, msg: err?.message || "Network error" };
  }
};

export const getOrderDetails = async (order_id) => {
  const header = getHeader?.() || {};
  const url = `${API_BASE_URL}user/order-details?order_id=${order_id}`; 
  // or: `${API_BASE_URL}/user/my-order/${order_id}` depending on your backend

  const response = await fetch(url, {
    method: "GET",
    headers: {
      Accept: "application/json",
      ...(header.headers || {}),
    },
  });
  const data = await response.json();
  return data;
};

export const downloadInvoice = async (orderId) => {
  const header = getHeader?.() || {};
  const url = `${API_BASE_URL}user/download-invoice?id=${encodeURIComponent(orderId)}`;

  const res = await fetch(url, {
    method: "GET",
    headers: { Accept: "application/json", ...(header.headers || {}) },
  });

  return await res.json(); // { pdf_url: "..." }
};

export const getStatementList = async () => {
  const header = getHeader?.() || {};
  const url = `${API_BASE_URL}user/statement-list`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      Accept: "application/json",
      ...(header.headers || {}),
    },
  });

  const data = await response.json();
  return data; // { res, msg, data:[], dueAmount, overdueAmount }
};

export const getStatementDetails = async ({party_code, data_from = "database", from_date = "", to_date = "", }) => {
  const params = new URLSearchParams();
  params.append("party_code", party_code); // ✅ mandatory
  if (data_from) params.append("data_from", data_from);
  if (from_date) params.append("from_date", from_date);
  if (to_date) params.append("to_date", to_date);

  const res = await fetch(`${API_BASE_URL}user/statement-details?${params.toString()}`, {
    method: "GET",
    headers: { Accept: "application/json", ...(getHeader()?.headers || {}) },
  });

  return res.json();
};

export const refreshStatementDetails = async ({party_code, data_from = "live" }) => {
  const params = new URLSearchParams();
  params.append("party_code", party_code); // ✅ mandatory
  if (data_from) params.append("data_from", data_from);
  const res = await fetch(`${API_BASE_URL}user/refresh-statement?${params.toString()}`, {
    method: "GET",
    headers: { Accept: "application/json", ...(getHeader()?.headers || {}) },
  });
  return res.json();
};

export const getTotalOrderCount = async (orderId) => {
  const header = getHeader?.() || {};
  const url = `${API_BASE_URL}user/total-count-of-order`;

  const res = await fetch(url, {
    method: "GET",
    headers: { Accept: "application/json", ...(header.headers || {}) },
  });

  return await res.json(); // { pdf_url: "..." }
};

export const sendStatementWhatsapp = async () => {
  const res = await fetch(
    `${API_BASE_URL}user/send-statement`,
    {
      method: "GET",
      headers: { Accept: "application/json", ...(getHeader()?.headers || {}) },
    }
  );
  return res.json(); 
};

export const getAllPendingOrderCount = async () => {
  const res = await fetch(
    `${API_BASE_URL}user/get-all-pending-order`,
    {
      method: "GET",
      headers: { Accept: "application/json", ...(getHeader()?.headers || {}) },
    }
  );
  return res.json(); 
};