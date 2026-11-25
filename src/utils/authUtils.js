// Get loged user's info
export const getLoggedInUser = () => {
  const loginInfo = JSON.parse(localStorage.getItem("mazingBusinessLoginInfo"));
  return loginInfo || null;
};

// Get loged user's auth
export const getAuthToken = () => {
  const loginInfo = JSON.parse(localStorage.getItem("mazingBusinessLoginInfo"));
  return loginInfo?.authorisation?.token || null;
};

// Get Warranty user's auth token
export const getWarrantyAuthToken = () => {
  return localStorage.getItem("warrantyToken") || null;
};