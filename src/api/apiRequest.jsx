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

//Get Best Seller Products
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

//Get New Arrival Product
export const getNewArrivalProducts = async () => {
  const user = getLoggedInUser();
  const header = getHeader();
  const url = `${API_BASE_URL}home/get-new-arrival-products${user ? `?user_id=${user.id}` : ''}`;
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

export const getQuickOrderProduct = async (
  cat_groups,
  categories,
  brands,
  m_coin_rates,
  search_text,
  min_price,
  max_price,
  location_id,
  inhouse_product,
  price_sort,
  delivery,
  page = 1,
  pagination = 16
) => {
  const user = getLoggedInUser();
  const header = getHeader();

  const queryParams = new URLSearchParams();

  if (cat_groups && String(cat_groups).trim() !== "") {
    queryParams.append("cat_groups", Array.isArray(cat_groups) ? cat_groups.join(",") : cat_groups);
  }

  if (categories && String(categories).trim() !== "") {
    queryParams.append("categories", Array.isArray(categories) ? categories.join(",") : categories);
  }

  if (brands && String(brands).trim() !== "") {
    queryParams.append("brands", Array.isArray(brands) ? brands.join(",") : brands);
  }

  if (m_coin_rates && String(m_coin_rates).trim() !== "") {
    queryParams.append(
      "m_coin_rates",
      Array.isArray(m_coin_rates) ? m_coin_rates.join(",") : m_coin_rates
    );
  }

  if (search_text) {
    queryParams.append("search_text", search_text);
  }

  if (min_price !== null && min_price !== undefined && min_price !== "") {
    queryParams.append("min_price", min_price);
  }

  if (max_price !== null && max_price !== undefined && max_price !== "") {
    queryParams.append("max_price", max_price);
  }

  if (location_id !== null && location_id !== undefined && location_id !== "") {
    queryParams.append("location_id", location_id);
  }

  if (
    inhouse_product !== null &&
    inhouse_product !== undefined &&
    inhouse_product !== ""
  ) {
    queryParams.append("inhouse_product", inhouse_product);
  }

  if (delivery !== null && delivery !== undefined && delivery !== "") {
    queryParams.append("delivery", delivery);
  }

  if (page) {
    queryParams.append("page", page);
  }

  if (price_sort) {
    queryParams.append("price_sort", price_sort);
  }

  if (pagination) {
    queryParams.append("pagination", pagination);
  }

  if (user?.id) {
    queryParams.append("user_id", user.id);
  }

  const url = `${API_BASE_URL}product/quick-order?${queryParams.toString()}`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      ...(header?.headers || {}),
      Accept: "application/json",
      "Content-Type": "application/json",
    },
  });

  return response;
};

export const addToWishlist = async (product_id) => {
  const header = getHeader();
  const user = getLoggedInUser();
  const userId = user?.id ?? user?.user?.id ?? user?.data?.id;
  const params = new URLSearchParams();
  params.append("product_id", product_id);
  if (userId) {
    params.append("user_id", userId);
  }

  const response = await fetch(`${API_BASE_URL}product/add-to-wishlist?${params.toString()}`, {
    method: "GET",
    headers: {
      ...(header?.headers || {}),
      Accept: "application/json",
    },
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data?.msg || data?.message || `Wishlist request failed (${response.status}).`);
  }

  return data;
};

export const removeFromWishlist = async (product_id) => {
  const header = getHeader();
  const params = new URLSearchParams();
  params.append("product_id", product_id);

  const response = await fetch(`${API_BASE_URL}product/remove-from-wishlist?${params.toString()}`, {
    method: "GET",
    headers: {
      ...(header?.headers || {}),
      Accept: "application/json",
    },
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data?.msg || data?.message || `Wishlist request failed (${response.status}).`);
  }

  return data;
};

export const getWishList = async () => {
  const header = getHeader();
  if (!header) throw new Error("Authorization token missing");

  const response = await fetch(`${API_BASE_URL}product/wishlist-list-products`, {
    method: "GET",
    headers: {
      ...(header.headers || {}),
      Accept: "application/json",
    },
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok || data?.res === false) {
    throw new Error(data?.msg || data?.message || "Unable to load wishlist products.");
  }

  return data;
};

export const getBetaQuickOrderProduct = async (
  cat_groups,
  categories,
  brands,
  m_coin_rates,
  search_text,
  min_price,
  max_price,
  location_id,
  inhouse_product,
  price_sort,
  delivery,
  page = 1,
  pagination = 16
) => {
  const user = getLoggedInUser();
  const header = getHeader();

  const queryParams = new URLSearchParams();

  if (cat_groups && String(cat_groups).trim() !== "") {
    queryParams.append("cat_groups", Array.isArray(cat_groups) ? cat_groups.join(",") : cat_groups);
  }

  if (categories && String(categories).trim() !== "") {
    queryParams.append("categories", Array.isArray(categories) ? categories.join(",") : categories);
  }

  if (brands && String(brands).trim() !== "") {
    queryParams.append("brands", Array.isArray(brands) ? brands.join(",") : brands);
  }

  if (m_coin_rates && String(m_coin_rates).trim() !== "") {
    queryParams.append(
      "m_coin_rates",
      Array.isArray(m_coin_rates) ? m_coin_rates.join(",") : m_coin_rates
    );
  }

  if (search_text) {
    queryParams.append("search_text", search_text);
  }

  if (min_price !== null && min_price !== undefined && min_price !== "") {
    queryParams.append("min_price", min_price);
  }

  if (max_price !== null && max_price !== undefined && max_price !== "") {
    queryParams.append("max_price", max_price);
  }

  if (location_id !== null && location_id !== undefined && location_id !== "") {
    queryParams.append("location_id", location_id);
  }

  if (
    inhouse_product !== null &&
    inhouse_product !== undefined &&
    inhouse_product !== ""
  ) {
    queryParams.append("inhouse_product", inhouse_product);
  }

  if (delivery !== null && delivery !== undefined && delivery !== "") {
    queryParams.append("delivery", delivery);
  }

  if (page) {
    queryParams.append("page", page);
  }

  if (price_sort) {
    queryParams.append("price_sort", price_sort);
  }

  if (pagination) {
    queryParams.append("pagination", pagination);
  }

  if (user?.id) {
    queryParams.append("user_id", user.id);
  }

  const url = `${API_BASE_URL}product/beta-version-quick-order?${queryParams.toString()}`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      ...(header?.headers || {}),
      Accept: "application/json",
      "Content-Type": "application/json",
    },
  });

  return response;
};

export const getRewardProducts = async ({
  search_text = "",
  price_sort = "",
  page = 1,
  pagination = 16,
} = {}) => {
  const user = getLoggedInUser();
  const header = getHeader();

  const queryParams = new URLSearchParams();

  if (search_text && String(search_text).trim() !== "") {
    queryParams.append("search_text", String(search_text).trim());
  }

  if (price_sort && String(price_sort).trim() !== "") {
    queryParams.append("price_sort", price_sort);
  }

  queryParams.append("page", page);
  queryParams.append("pagination", pagination);

  if (user?.id) {
    queryParams.append("user_id", user.id);
  }

  const url = `${API_BASE_URL}product/reward-products?${queryParams.toString()}`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      ...(header?.headers || {}),
      Accept: "application/json",
      "Content-Type": "application/json",
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

export const getGenericProducts = async (productId) => {
  const user = getLoggedInUser();
  const header = getHeader();
  const queryParams = new URLSearchParams();

  if (productId) queryParams.append("product_id", productId);
  if (user?.id) queryParams.append("user_id", user.id);

  const url = `${API_BASE_URL}product/generic-products?${queryParams.toString()}`;
  const response = await fetch(url, {
    method: "GET",
    headers: {
      ...(header?.headers || {}),
      "Content-Type": "application/json",
    },
  });

  return response.json();
};

export const downloadGenericProductList = async ({
  product_id,
  generic_masters_id,
  generic_links_id,
  user_id,
  download_type,
} = {}) => {
  const user = getLoggedInUser();
  const header = getHeader();
  const queryParams = new URLSearchParams();

  if (product_id) queryParams.append("product_id", product_id);
  if (generic_masters_id) queryParams.append("generic_masters_id", generic_masters_id);
  if (generic_links_id) queryParams.append("generic_links_id", generic_links_id);
  if (user_id || user?.id) queryParams.append("user_id", user_id || user.id);
  if (download_type) queryParams.append("download_type", download_type);

  const response = await fetch(`${API_BASE_URL}product/download-generic-products?${queryParams.toString()}`, {
    method: "GET",
    headers: {
      ...(header?.headers || {}),
      Accept: "application/json",
    },
  });

  const data = await response.json();

  if (!response.ok || data?.res === false) {
    throw new Error(data?.msg || data?.message || "Generic product PDF download failed");
  }

  return data;
};

export const getMasterProducts = async (productId) => {
  const user = getLoggedInUser();
  const header = getHeader();
  const queryParams = new URLSearchParams();

  if (productId) queryParams.append("product_id", productId);
  if (user?.id) queryParams.append("user_id", user.id);

  const url = `${API_BASE_URL}product/master-product?${queryParams.toString()}`;
  const response = await fetch(url, {
    method: "GET",
    headers: {
      ...(header?.headers || {}),
      "Content-Type": "application/json",
    },
  });

  return response.json();
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

export const sendQuotation = async (user_id) => {
  const header = getHeader();
  if (!header) throw new Error("Authorization token missing");

  const user = getLoggedInUser();
  const finalUserId = user_id ?? user?.id;
  if (!finalUserId) throw new Error("Missing user_id for send quotation");

  const res = await fetch(`${API_BASE_URL}cart/send-quotation`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...(header.headers || {}),
    },
    body: JSON.stringify({
      user_id: finalUserId,
    }),
  });

  const data = await res.json();
  if (!res.ok || data?.res === false) {
    const error = new Error(data?.msg || data?.message || "Send quotation failed");
    error.data = data;
    throw error;
  }
  return data;
};

export const updateQuantity = async ({ id, quantity, product_id, cart_id, staffUserTitle }) => {
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
      staffUserTitle,
    }),
  });

  const data = await res.json();
  if (!res.ok || data?.res === false) {
    throw new Error(data?.msg || "Update cart failed");
  }
  return data;
};

export const updateCartItemPrice = async ({ id, price }) => {
  const header = getHeader();
  if (!header) throw new Error("Authorization token missing");

  if (!id) throw new Error("Missing id for update price");

  const res = await fetch(`${API_BASE_URL}cart/update-price`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...(header.headers || {}),
    },
    body: JSON.stringify({
      id,
      price: Number(price),
    }),
  });

  const data = await res.json();
  if (!res.ok || data?.res === false) {
    throw new Error(data?.msg || "Update price failed");
  }
  return data;
};

export const updateCartItemPriceWithSuperPrice = async ({ id, price }) => {
  const header = getHeader();
  if (!header) throw new Error("Authorization token missing");

  if (!id) throw new Error("Missing id for update price");

  const res = await fetch(`${API_BASE_URL}cart/update-cart-item-price-with-super-price`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...(header.headers || {}),
    },
    body: JSON.stringify({
      id,
      price: Number(price),
    }),
  });

  const data = await res.json();
  if (!res.ok || data?.res === false) {
    const error = new Error(data?.msg || "Update price failed");
    error.data = data;
    throw error;
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

export const addProductReview = async ({ product_id, rating, comment }) => {
  const header = getHeader();
  if (!header) throw new Error("Authorization token missing");

  const response = await fetch(`${API_BASE_URL}product/add-review`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...(header.headers || {}),
    },
    body: JSON.stringify({
      product_id,
      rating,
      comment,
    }),
  });

  const data = await response.json();

  if (!response.ok || data?.res === false) {
    throw new Error(data?.msg || "Review submission failed");
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

const PRE_ARRIVAL_AUTHORIZATION = "Bearer abm_12345_secure_token";

const getPreArrivalApiUrl = (userId, action) => {
  const encodedUserId = encodeURIComponent(userId);

  if (import.meta.env.DEV) {
    return `/abm-api/remote/abm/pre-arrivals/users/${encodedUserId}/${action}`;
  }

  const queryParams = new URLSearchParams({
    action,
    user_id: String(userId),
  });
  return `${import.meta.env.BASE_URL}abm-api.php?${queryParams.toString()}`;
};

// Get pre-arrival items for the currently logged-in user
export const getPreArrivalItems = async (userId) => {
  const loggedInUser = getLoggedInUser();
  const resolvedUserId = userId || loggedInUser?.id;

  if (!resolvedUserId) {
    throw new Error("Logged-in user ID is missing.");
  }

  const response = await fetch(
    getPreArrivalApiUrl(resolvedUserId, "items"),
    {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: PRE_ARRIVAL_AUTHORIZATION,
      },
    }
  );

  const data = await response.json().catch(() => ({}));

  if (!response.ok || data?.success === false) {
    throw new Error(data?.message || data?.msg || "Unable to load pre-arrival items.");
  }

  return data;
};

// Save one or more pre-arrival orders for the currently logged-in user
export const savePreArrivalOrder = async ({ address_id, order_ids = {}, rows = [] } = {}, userId) => {
  const loggedInUser = getLoggedInUser();
  const resolvedUserId = userId || loggedInUser?.id;

  if (!resolvedUserId) {
    throw new Error("Logged-in user ID is missing.");
  }

  if (!Array.isArray(rows) || rows.length === 0) {
    throw new Error("Enter a quantity greater than 0 for at least one product.");
  }

  if (!address_id) {
    throw new Error("Select a delivery address before saving the order.");
  }

  const response = await fetch(
    getPreArrivalApiUrl(resolvedUserId, "save-orders"),
    {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: PRE_ARRIVAL_AUTHORIZATION,
      },
      body: JSON.stringify({ address_id, order_ids, rows }),
    }
  );

  const data = await response.json().catch(() => ({}));

  if (!response.ok || data?.success === false) {
    const error = new Error(data?.message || data?.msg || "Unable to save pre-arrival order.");
    error.data = data;
    throw error;
  }

  return data;
};

// Download the pre-arrival product list as a PDF
export const downloadPreArrivalProductPdf = async ({
  etaDate,
  categoryId,
} = {}) => {
  const queryParams = new URLSearchParams();

  if (etaDate) queryParams.append("eta_date", etaDate);
  if (categoryId) queryParams.append("category_id", categoryId);

  const queryString = queryParams.toString();
  const url = `${API_BASE_URL}prearrival/products/pdf${queryString ? `?${queryString}` : ""}`;
  const response = await fetch(url, {
    method: "GET",
    headers: {
      Accept: "application/json",
      Authorization: PRE_ARRIVAL_AUTHORIZATION,
    },
    credentials: "include",
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok || data?.success === false || !data?.pdf_url) {
    throw new Error(data?.message || data?.msg || "Unable to download pre-arrival PDF.");
  }

  const pdfUrl = data.pdf_url;
  const fileName = decodeURIComponent(
    new URL(pdfUrl, window.location.origin).pathname.split("/").pop() ||
      "pre-arrival-products.pdf"
  );

  return {
    ...data,
    pdfUrl,
    fileName,
  };
};

// Get Brands for the brand listing page
export const getBrands = async () => {
  const response = await fetch(`${API_BASE_URL}product/all-brands`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  return response;
};

// Get All Brands
export const getAllMCoinRate = async () => {
  const url = `${API_BASE_URL}product/all-mCoin-rate`;

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

export const getMCoin = async () => {
  const header = getHeader();
  const url = `${API_BASE_URL}cart/get-m-coin`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      Accept: "application/json",
      ...(header?.headers || {}),
    },
  });
  return response;
};

export const removeMCoin = async () => {
  const header = getHeader();
  const url = `${API_BASE_URL}cart/remove-m-coin`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      Accept: "application/json",
      ...(header?.headers || {}),
    },
  });
  return response;
};

export const applyMCoin = async ({ applied_m_coins }) => {
  const header = getHeader();
  if (!header) throw new Error("Authorization token missing");

  const res = await fetch(`${API_BASE_URL}cart/apply-m-coin`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...(header.headers || {}),
    },
    body: JSON.stringify({ applied_m_coins }),
  });
  return res;
};

export const getAvailableMCoin = async () => {
  const header = getHeader();
  const url = `${API_BASE_URL}cart/get-available-m-coin`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      Accept: "application/json",
      ...(header?.headers || {}),
    },
  });
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

// export const downloadUserStatement = async ({ party_code, data_from = "live" }) => {
//   const params = new URLSearchParams();
//   params.append("party_code", party_code);
//   if (data_from) params.append("data_from", data_from);

//   const res = await fetch(
//     `${API_BASE_URL}user/statement-download?${params.toString()}`,
//     {
//       method: "GET",
//       headers: { Accept: "application/json", ...(getHeader()?.headers || {}) },
//     }
//   );

//   return res.json(); // { pdf_url: "https://....pdf" }
// };

export const downloadUserStatement = async ({
  party_code,
  data_from = "live",
  from_date = "",
  to_date = "",
}) => {
  const params = new URLSearchParams();
  params.append("party_code", party_code);

  if (data_from) params.append("data_from", data_from);
  if (from_date) params.append("from_date", from_date);
  if (to_date) params.append("to_date", to_date);

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

export const getSupportTickets = async (page = 1, pagination = 15) => {
  const header = getHeader();
  if (!header) throw new Error("Authorization token missing");

  const params = new URLSearchParams();
  params.append("page", page);
  params.append("pagination", pagination);

  const response = await fetch(
    `${API_BASE_URL}user/suport-tickets?${params.toString()}`,
    {
      method: "GET",
      headers: {
        Accept: "application/json",
        ...(header.headers || {}),
      },
    }
  );

  const data = await response.json().catch(() => ({}));
  if (!response.ok || data?.res === false) {
    throw new Error(data?.msg || data?.message || "Unable to load support tickets.");
  }

  return data;
};

export const addSuportTickets = async ({ subject, details, photo } = {}) => {
  const header = getHeader();
  if (!header) throw new Error("Authorization token missing");

  const formData = new FormData();
  formData.append("subject", subject || "");
  formData.append("details", details || "");
  if (photo) formData.append("photo", photo);

  const response = await fetch(`${API_BASE_URL}user/add-suport-tickets`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      ...(header.headers || {}),
    },
    body: formData,
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok || data?.res === false) {
    const validationMessage = data?.errors
      ? Object.values(data.errors).flat()[0]
      : null;
    throw new Error(validationMessage || data?.msg || data?.message || "Unable to submit support ticket.");
  }

  return data;
};

export const getTicketDetails = async ({ ticket_id, code } = {}) => {
  const header = getHeader();
  if (!header) throw new Error("Authorization token missing");

  const params = new URLSearchParams();
  if (ticket_id) params.append("ticket_id", ticket_id);
  if (code) params.append("code", code);

  const response = await fetch(
    `${API_BASE_URL}user/get-ticket-details?${params.toString()}`,
    {
      method: "GET",
      headers: {
        Accept: "application/json",
        ...(header.headers || {}),
      },
    }
  );

  const data = await response.json().catch(() => ({}));
  if (!response.ok || data?.res === false) {
    const error = new Error(
      data?.msg || data?.message || "Unable to load ticket details.",
    );
    error.status = response.status;
    error.retryAfter = Number(response.headers.get("Retry-After")) || 0;
    throw error;
  }

  return data;
};

export const addTicketReply = async ({ ticket_id, reply, file } = {}) => {
  const header = getHeader();
  if (!header) throw new Error("Authorization token missing");

  const formData = new FormData();
  formData.append("ticket_id", ticket_id || "");
  if (reply?.trim()) formData.append("reply", reply.trim());
  if (file) formData.append("file", file);

  const response = await fetch(`${API_BASE_URL}user/add-ticket-reply`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      ...(header.headers || {}),
    },
    body: formData,
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok || data?.res === false) {
    const validationMessage = data?.errors
      ? Object.values(data.errors).flat()[0]
      : null;
    throw new Error(validationMessage || data?.msg || data?.message || "Unable to submit ticket reply.");
  }

  return data;
};

export const updateBasicInfo = async (basicInfo, photo = null) => {
  const header = getHeader();
  const formData = new FormData();

  formData.append("name", basicInfo.fullName);
  formData.append("company_name", basicInfo.companyName);
  formData.append("aadhar_card", basicInfo.aadharNumber);
  formData.append("phone", basicInfo.phoneNumber);
  formData.append("gstin", basicInfo.gstin);

  if (photo) {
    formData.append("photo", photo);
  }

  const res = await fetch(`${API_BASE_URL}user/update-basic-Info`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      ...(header?.headers || {}),
    },
    body: formData,
  });
  const json = await res.json();

  if (!res.ok || json?.res === false) {
    throw new Error(json?.msg || json?.message || `HTTP ${res.status}`);
  }

  return json;
};

export const updatePassword = async ({ newPassword, confirmPassword }) => {
  const header = getHeader();

  const res = await fetch(`${API_BASE_URL}user/update-password`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...(header?.headers || {}),
    },
    body: JSON.stringify({
      new_password: newPassword,
      confirm_password: confirmPassword,
    }),
  });
  const json = await res.json();

  if (!res.ok || json?.res === false) {
    throw new Error(json?.msg || json?.message || `HTTP ${res.status}`);
  }

  return json;
};

export const updateEmail = async (email) => {
  const header = getHeader();

  const res = await fetch(`${API_BASE_URL}user/update-email`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...(header?.headers || {}),
    },
    body: JSON.stringify({ email }),
  });
  const json = await res.json();

  if (!res.ok || json?.res === false) {
    throw new Error(json?.msg || json?.message || `HTTP ${res.status}`);
  }

  return json;
};

export const updateSetDefaultAddress = async (addressId) => {
  const header = getHeader();

  const res = await fetch(`${API_BASE_URL}user/update-set-default-address`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...(header?.headers || {}),
    },
    body: JSON.stringify({ address_id: addressId }),
  });
  const json = await res.json();

  if (!res.ok || json?.res === false) {
    throw new Error(json?.msg || json?.message || `HTTP ${res.status}`);
  }

  return json;
};

export const getStateList = async () => {
  const header = getHeader();
  const res = await fetch(`${API_BASE_URL}user/state`, {
    method: "GET",
    headers: { Accept: "application/json", ...(header?.headers || {}) },
  });
  const json = await res.json();

  if (!res.ok || json?.res === false) {
    throw new Error(json?.msg || json?.message || `HTTP ${res.status}`);
  }

  return json;
};

export const updateAddress = async (address) => {
  const header = getHeader();
  const res = await fetch(`${API_BASE_URL}user/update-address`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...(header?.headers || {}),
    },
    body: JSON.stringify({
      address_id: address.id,
      aadhar_card: address.aadharCard || null,
      company_name: address.companyName,
      address: address.address,
      address_2: address.address2,
      postal_code: address.postalCode,
      city: address.city,
      state_id: address.stateId,
      phone: address.phone,
    }),
  });
  const json = await res.json();

  if (!res.ok || json?.res === false) {
    throw new Error(json?.msg || json?.message || `HTTP ${res.status}`);
  }

  return json;
};

export const addAddress = async (address) => {
  const header = getHeader();
  const res = await fetch(`${API_BASE_URL}user/add-address`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...(header?.headers || {}),
    },
    body: JSON.stringify({
      gstin: address.gstin?.trim() || null,
      company_name: address.companyName,
      address: address.address,
      address_2: address.address2 || "",
      postal_code: address.postalCode,
      city: address.city,
      city_id: null,
      state_id: address.stateId,
      country_id: 101,
      phone: address.phone,
      aadhar_card: address.aadharCard || null,
    }),
  });
  const json = await res.json();

  if (!res.ok || json?.res === false) {
    throw new Error(json?.msg || json?.message || `HTTP ${res.status}`);
  }

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

export const getMCoinStatement = async (payload = {}) => {
  const header = getHeader?.() || {};
  const queryParams = new URLSearchParams();

  // if (payload.party_code) queryParams.append("party_code", payload.party_code);
  if (payload.from_date) queryParams.append("from_date", payload.from_date);
  if (payload.to_date) queryParams.append("to_date", payload.to_date);
  // alert(payload.from_date);
  const url = `${API_BASE_URL}user/m-coin-statement${
    queryParams.toString() ? `?${queryParams.toString()}` : ""
  }`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      Accept: "application/json",
      ...(header.headers || {}),
    },
  });

  const contentType = response.headers.get("content-type") || "";
  let data;

  if (contentType.includes("application/json")) {
    data = await response.json();
  } else {
    const text = await response.text();
    throw new Error(text || `Request failed with status ${response.status}`);
  }

  if (!response.ok) {
    throw new Error(data?.msg || `Request failed with status ${response.status}`);
  }

  return data;
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

export const getCurrentOrder = async () => {
  const res = await fetch(
    `${API_BASE_URL}user/current-year-order`,
    {
      method: "GET",
      headers: { Accept: "application/json", ...(getHeader()?.headers || {}) },
    }
  );
  return res.json(); 
};

export const updateProductQty = async (product_id, quantity) => {
  const params = new URLSearchParams();
  params.append("product_id", product_id); // ✅ mandatory
  params.append("quantity", quantity); // ✅ mandatory
  const res = await fetch(
    `${API_BASE_URL}product/update-product-qty?${params.toString()}`,
    {
      method: "GET",
      headers: { Accept: "application/json", ...(getHeader()?.headers || {}) },
    }
  );
  return res.json(); 
};

const normalizeProductListForQuickOrder = (products = [], mainProduct = null) => {
  return products.map((item) => {
    const discountPrice = Number(
      String(item?.discount_price ?? item?.unit_price ?? 0).replace(/[^0-9.]/g, "")
    );
    const cInstockMCoin = Number(
      item?.c_instock_m_coin ?? mainProduct?.c_instock_m_coin ?? 0
    );

    return {
      ...item,
      cash_and_carry_item:
        item?.cash_and_carry_item ?? mainProduct?.cash_and_carry_item ?? 0,
      category_group: item?.category_group ?? mainProduct?.category_group ?? null,
      category: item?.category ?? mainProduct?.category ?? null,
      fast_delivery_tag:
        item?.fast_delivery_tag ?? mainProduct?.fast_delivery_tag ?? 0,
      inhouse_product: item?.inhouse_product ?? mainProduct?.inhouse_product ?? 0,
      is_warranty: item?.is_warranty ?? mainProduct?.is_warranty ?? 0,
      warranty_duration:
        item?.warranty_duration ?? mainProduct?.warranty_duration ?? null,
      offer: Array.isArray(item?.offer) ? item.offer : [],
      stocks: Array.isArray(item?.stocks) ? item.stocks : [],
      reviews: Array.isArray(item?.reviews) ? item.reviews : [],
      thumb_img: item?.thumb_img ?? null,
      images: Array.isArray(item?.images) ? item.images : [],
      c_instock_m_coin: cInstockMCoin,
      earnMCoin: discountPrice * cInstockMCoin,
    };
  });
};

const normalizeProductDetailsVariantProducts = (payload) => {
  const mainProduct = Array.isArray(payload?.data) ? payload.data[0] : null;
  const variants = Array.isArray(payload?.all_varient_products)
    ? payload.all_varient_products
    : [];

  const normalizedVariants = normalizeProductListForQuickOrder(variants, mainProduct);

  return {
    ...payload,
    all_varient_products: normalizedVariants,
    all_variant_products: normalizedVariants,
  };
};

export const productDetails = async (slug) => {
  const user = getLoggedInUser();
  const header = getHeader();
  const queryParams = new URLSearchParams();
  queryParams.append("slug", slug); // ✅ mandatory
  if (user?.id) {
    queryParams.append("user_id", user.id); // For logged-in user
  }
  const url = `${API_BASE_URL}product/product-details?${queryParams.toString()}`;
  const response = await fetch(url, {
    method: "GET",
    headers: {
      ...(header?.headers || {}),
      "Content-Type": "application/json",
    },
  });
  const data = await response.json();
  return normalizeProductDetailsVariantProducts(data);
};

export const getRecentlyViewedProducts = async () => {
  const header = getHeader();
  const response = await fetch(
    `${API_BASE_URL}product/recently-viewed-products`,
    {
      method: "GET",
      headers: {
        ...(header?.headers || {}),
        "Content-Type": "application/json",
      },
    }
  );

  return response;
};

export const getMostOrderCategoryProducts = async (categoryId) => {
  const header = getHeader();
  const queryParams = new URLSearchParams({
    category_id: String(categoryId),
  });
  const response = await fetch(
    `${API_BASE_URL}product/most-order-category-products?${queryParams.toString()}`,
    {
      method: "GET",
      headers: {
        ...(header?.headers || {}),
        "Content-Type": "application/json",
      },
    }
  );

  return response;
};

export const getVariationProductBySelectedValues = async ({
  selected_values,
  variation_parent_part_no,
  user_id,
} = {}) => {
  const user = getLoggedInUser();
  const header = getHeader();
  const selectedValues = Array.isArray(selected_values)
    ? selected_values.filter(Boolean).join(",")
    : String(selected_values || "").trim();

  const body = new URLSearchParams();
  body.append("selected_values", selectedValues);
  body.append("variation_parent_part_no", variation_parent_part_no || "");

  if (user_id || user?.id) {
    body.append("user_id", user_id || user.id);
  }

  const response = await fetch(`${API_BASE_URL}product/variarion_product_id`, {
    method: "POST",
    headers: {
      ...(header?.headers || {}),
      Accept: "application/json",
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  });

  const data = await response.json();

  if (!response.ok || data?.res === false) {
    throw new Error(data?.msg || data?.message || "Variation product API failed");
  }

  const mainProduct = Array.isArray(data?.data) ? data.data[0] : null;
  const productDetailsList = Array.isArray(data?.product_details)
    ? data.product_details
    : [];
  const normalizedProducts = normalizeProductListForQuickOrder(
    productDetailsList,
    mainProduct
  );

  return {
    ...data,
    product_details: normalizedProducts,
    data: Array.isArray(data?.data)
      ? normalizeProductListForQuickOrder(data.data, mainProduct)
      : data?.data,
  };
};

/**
 * ✅ Product details by SLUG (for ProductDetails page)
 * NOTE: Change endpoint path to match your Laravel route.
 */
export const getProductDetailsBySlug = async (slug) => {
  const params = new URLSearchParams();
  params.append("slug", slug);

  const res = await fetch(`${API_BASE_URL}product/details?${params.toString()}`, {
    method: "GET",
    ...getHeader(),
  });

  return res.json();
};

export const generatePdfFileName = async () => {
  const header = getHeader();
  const queryParams = new URLSearchParams();
  const url = `${API_BASE_URL}download_document/generate-pdf-file-name`;
  const response = await fetch(url, {
    method: "GET",
    headers: {
      ...(header?.headers || {}),
      "Content-Type": "application/json",
    },
  });
  const data = await response.json();
  return data;
};

export const getPdfQuickOrderProduct = async (
  file_name,
  cat_groups,
  categories,
  brands,
  m_coin_rates,
  search_text,
  min_price,
  max_price,
  location_id,
  inhouse_product,
  price_sort,
  delivery,
  page = 1,
  pagination = 16
) => {
  const user = getLoggedInUser();
  const header = getHeader();

  // Debug: print every parameter received by getPdfQuickOrderProduct.
  console.log("getPdfQuickOrderProduct parameters:", {
    file_name,
    cat_groups,
    categories,
    brands,
    m_coin_rates,
    search_text,
    min_price,
    max_price,
    location_id,
    inhouse_product,
    price_sort,
    delivery,
    page,
    pagination,
    user_id: user?.id ?? null,
  });

  const queryParams = new URLSearchParams();

  if (file_name) queryParams.append("file_name", file_name);
  if (cat_groups) queryParams.append("cat_groups", cat_groups);
  if (categories) queryParams.append("categories", categories);
  if (brands) queryParams.append("brands", brands);
  if (m_coin_rates) queryParams.append("m_coin_rates", m_coin_rates);
  if (search_text) queryParams.append("search_text", search_text);
  if (min_price) queryParams.append("min_price", min_price);
  if (max_price) queryParams.append("max_price", max_price);
  if (location_id) queryParams.append("location_id", location_id);
  if (inhouse_product !== null && inhouse_product !== undefined && inhouse_product !== "") {
    queryParams.append("inhouse_product", inhouse_product);
  }

  if (delivery !== null && delivery !== undefined && delivery !== "") {
    queryParams.append("delivery", delivery);
  }

  if (page) queryParams.append("page", page);
  if (price_sort) queryParams.append("price_sort", price_sort);
  if (pagination) queryParams.append("pagination", pagination);
  if (user?.id) queryParams.append("user_id", user.id);

  const url = `${API_BASE_URL}download_document/pdf-quick-order-products?${queryParams.toString()}`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      ...(header?.headers || {}),
      Accept: "application/json",
      "Content-Type": "application/json",
    },
  });

  return response;
};

export const getPdfCreateCompleteStatus = async (file_name) => {
  const header = getHeader();
  const queryParams = new URLSearchParams();

  if (file_name) queryParams.append("file_name", file_name);

  const url = `${API_BASE_URL}download_document/pdf-create-complete-status?${queryParams.toString()}`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      ...(header?.headers || {}),
      Accept: "application/json",
      "Content-Type": "application/json",
    },
  });

  return response.json();
};

export const deletePdfFile = async (file_name) => {
  const header = getHeader();
  const queryParams = new URLSearchParams();

  if (file_name) queryParams.append("file_name", file_name);

  const url = `${API_BASE_URL}download_document/delete-file?${queryParams.toString()}`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      ...(header?.headers || {}),
      Accept: "application/json",
      "Content-Type": "application/json",
    },
  });

  return response.json();
};

export const deleteDownloadedFile = async (filePath) => {
  const header = getHeader();
  const queryParams = new URLSearchParams({ filePath });
  const url = `${API_BASE_URL}user/delete-downloaded-file?${queryParams.toString()}`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      ...(header?.headers || {}),
      Accept: "application/json",
      "Content-Type": "application/json",
    },
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok || data?.res === false) {
    throw new Error(data?.msg || data?.message || "Unable to delete downloaded file.");
  }

  return data;
};

export const generateExcelFileName = async () => {
  const header = getHeader();
  const queryParams = new URLSearchParams();
  const url = `${API_BASE_URL}download_document/generate-excel-file-name`;
  const response = await fetch(url, {
    method: "GET",
    headers: {
      ...(header?.headers || {}),
      "Content-Type": "application/json",
    },
  });
  const data = await response.json();
  return data;
};

export const getExcelQuickOrderProduct = async (
  file_name,
  cat_groups,
  categories,
  brands,
  search_text,
  min_price,
  max_price,
  location_id,
  inhouse_product,
  price_sort,
  delivery,
  page = 1,
  pagination = 16
) => {
  const user = getLoggedInUser();
  const header = getHeader();

  const queryParams = new URLSearchParams();

  if (file_name) queryParams.append("file_name", file_name);
  if (cat_groups) queryParams.append("cat_groups", cat_groups);
  if (categories) queryParams.append("categories", categories);
  if (brands) queryParams.append("brands", brands);
  if (search_text) queryParams.append("search_text", search_text);
  if (min_price) queryParams.append("min_price", min_price);
  if (max_price) queryParams.append("max_price", max_price);
  if (location_id) queryParams.append("location_id", location_id);
  if (inhouse_product !== null && inhouse_product !== undefined && inhouse_product !== "") {
    queryParams.append("inhouse_product", inhouse_product);
  }

  if (delivery !== null && delivery !== undefined && delivery !== "") {
    queryParams.append("delivery", delivery);
  }

  if (page) queryParams.append("page", page);
  if (price_sort) queryParams.append("price_sort", price_sort);
  if (pagination) queryParams.append("pagination", pagination);
  if (user?.id) queryParams.append("user_id", user.id);

  const url = `${API_BASE_URL}download_document/excel-quick-order-products?${queryParams.toString()}`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      ...(header?.headers || {}),
      Accept: "application/json",
      "Content-Type": "application/json",
    },
  });

  return response;
};

const getHomeBanner = async (endpoint) => {
  const header = getHeader();
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: "GET",
    headers: {
      ...(header?.headers || {}),
      Accept: "application/json",
    },
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok || data?.res === false) {
    throw new Error(data?.msg || data?.message || "Unable to load banners.");
  }
  return data;
};

export const getBannerOne = async () =>
  getHomeBanner("home/get-banner-one");

export const getBannerTwo = async () =>
  getHomeBanner("home/get-banner-two");

export const getBannerThree = async () =>
  getHomeBanner("home/get-banner-three");

export const getAllPageShug = async () => {
  const response = await fetch(`${API_BASE_URL}page/get-all-page-slug`, {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok || data?.res === false) {
    throw new Error(data?.msg || data?.message || "Unable to load page slugs.");
  }
  return data;
};

export const pageContent = async (slug) => {
  const params = new URLSearchParams({ slug: slug || "" });
  const response = await fetch(
    `${API_BASE_URL}page/page-content?${params.toString()}`,
    {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    },
  );
  const data = await response.json().catch(() => ({}));
  if (!response.ok || data?.res === false) {
    throw new Error(data?.msg || data?.message || "Unable to load page.");
  }
  return data;
};

