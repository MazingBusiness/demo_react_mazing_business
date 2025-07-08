import { API_BASE_URL } from "../app_url";
import axios from 'axios';

let value = JSON.parse(localStorage.getItem("virtualOfficeLoginInfo"));
// console.log(value);
let authorisation = value ? value["authorisation"] : null;
// Check if authorisation is not null before accessing its properties
let token = authorisation ? authorisation["token"] : null;
// console.log(token);


const getHeader = () => {
    let value = JSON.parse(localStorage.getItem("virtualOfficeLoginInfo"));
    // console.warn(value)
    let authorisation = value ? value["authorisation"] : null;

    if (authorisation) {
        let token = authorisation["token"];
        let header = {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        };
        return header;
    } else {
        // Handle the case where authorisation is null.
        console.error("authorisation is missing or null");
        // You might want to return a default header or throw an error here.
        return null; // or return a default header if needed
    }
};

// https://cleverdomizil.de/virtual_office/api/user/page-content-from-json

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


                // -- First Step (LetStarted component) APIs intregation start --

// get languages
export const getLanguages = async () => {
//    const response = await fetch(`${API_BASE_URL}user/get-languages`, {
    const response = await fetch(`${API_BASE_URL}product/get-languages`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
    });
    return response;
}

// get currencies
export const getCurrency = async () => {
    const response = await fetch(`${API_BASE_URL}product/get-currencies`, {
         method: 'GET',
         headers: {
           'Content-Type': 'application/json',
         },
     });
     return response;
}

// complete step1
export const completeStep1 = async (lang_id,curren_id,lang) => {
    let data = {
        language_id: lang_id,
        currency_id: curren_id,
        lang: lang,
        ...getHeader()
    }
    const response = await fetch(`${API_BASE_URL}product/submit-step-one`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            ...data.headers
        },
        body: JSON.stringify(data),
        
    });
    return response;
}

                // -- First Step APIs intregation end --


                // -- Second Step (SelectProduct component) APIs intregation start --

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

// complete step2
export const completeStep2 = async (product_id,lang) => {
    let data = {
        product_id: product_id,
        lang: lang,
        ...getHeader()
    }
    const response = await fetch(`${API_BASE_URL}product/submit-step-two`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            ...data.headers
        },
        body: JSON.stringify(data),
        
    });
    return response;
}

                // -- Second Step APIs intregation end --


// get user details
// export const getUserDetails = async () => {
//     const response = await fetch(`${API_BASE_URL}user/get-user-details`,getHeader(), {
//          method: 'GET',
//          headers: {
//            'Content-Type': 'application/json',
//          },
//      });
//      return response;
// }

export const getUserDetails = async () => {
    const response = await fetch(`${API_BASE_URL}user/get-user-details`,getHeader(), {
         method: 'GET',
         headers: {
            ...getHeader().headers,
           'Content-Type': 'application/json'
        },
    });
    return response;
}


//Account Settings start

export const getUserBillingDetails = async () => {
    const response = await fetch(`${API_BASE_URL}account/get-user-billing-details`,getHeader(), {
        mode: 'no-cors',
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
    });
    return response;
}

export const BillingAddressUpdate = async (formDataBillingAddress) => {
    let data = {
        first_name: formDataBillingAddress.first_name,
        last_name: formDataBillingAddress.last_name,
        company_name: formDataBillingAddress.company_name,
        title: formDataBillingAddress.title,
        address: formDataBillingAddress.address,
        city_id: formDataBillingAddress.city_id,
        country_id: formDataBillingAddress.country_id,
        postal_code: formDataBillingAddress.postal_code,
        phone_number: formDataBillingAddress.phone_number,
        region_id: formDataBillingAddress.region_id,
        vat_number : formDataBillingAddress. vat_number,
        ...getHeader()
    }
    
    const response = await fetch(`${API_BASE_URL}account/update-user-billing-address`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            ...data.headers
        },
        body: JSON.stringify(data),
        
    });
    return response;
}

export const EmailUpdate = async (formDataEmail) => {
    let data = {
        email: formDataEmail.email,
        ...getHeader()

    }
    const response = await fetch(`${API_BASE_URL}account/update-user-email`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            ...data.headers
        },
        body: JSON.stringify(data),
        
    });
    return response;
}

export const PasswordUpdate = async (formDataPassword) => {
    let data = {
        password: formDataPassword.password,
        confirm_password: formDataPassword.ConfirmPassword,
        ...getHeader()

    }
    const response = await fetch(`${API_BASE_URL}account/update-user-password`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            ...data.headers
        },
        body: JSON.stringify(data),
        
    });
    return response;
}

export const getCityByRegionId = async (region_id) => {
    // const response =''
    // if(region_id!=null)
    // {
    //     response = await fetch(`${API_BASE_URL}user/get-cities/${region_id}`, {
    //         method: 'GET',
    //         headers: {
    //             ...getHeader().headers,
    //            'Content-Type': 'application/json'
    //         },
    //     });       
    // }
    // else
    // {
        const response = await fetch(`${API_BASE_URL}product/get-cities/${region_id}`, {
            method: 'GET',
            headers: {
                ...getHeader().headers,
               'Content-Type': 'application/json'
            },
        });
    // }
    return response;
}

export const getCountry = async () => {
    const response = await fetch(`${API_BASE_URL}product/get-countries`, {
         method: 'GET',
         headers: {
           'Content-Type': 'application/json',
        },
    });
    return response;
}

export const getStateByCountryId = async (country_id) => {
    const response = await fetch(`${API_BASE_URL}product/get-states/${country_id}`, {
        method: 'GET',
        headers: {
            ...getHeader().headers,
           'Content-Type': 'application/json'
        },
    });
    return response;
}

//Account Settings End


                // ---- Thrid Step through Email Product(YourDetails component) APIs intregation start ----

// get user status
export const getUserStatus = async () => {
    const response = await fetch(`${API_BASE_URL}user/get-user-last-status`,getHeader(), {
        method: 'GET',
        headers: {
            ...getHeader().headers,
            'Content-Type': 'application/json',
        },
    });
    return response;
}

// get Location Countries(digital postbox address)
export const getLocationCountries = async (lang) => {
    const response = await fetch(`${API_BASE_URL}product/get-location-countries?lang=${lang}`, {
        method: 'GET',
        headers: {
            ...getHeader().headers,
            'Content-Type': 'application/json',
        },
    });
    return response;
}

// get Location Cities
export const getCityByCountryId = async (country_id,lang) => {
    const response = await fetch(`${API_BASE_URL}product/get-location-cities/${country_id}/${lang}`, {
         method: 'GET',
         headers: {
            ...getHeader().headers,
           'Content-Type': 'application/json'
         },
     });
    return response;
}

// get Location address
export const getLocationAddressbyId = async (country_id,city_id,lang) => {
    const response = await fetch(`${API_BASE_URL}product/get-location-addresses/${country_id}/${city_id}/${lang}`, {
         method: 'GET',
         headers: {
            ...getHeader().headers,
           'Content-Type': 'application/json'
         },
     });
    return response;
}

// get Location Features
export const getLoacationFeaturesById = async (location_id,customer_type,lang) => {
    // location_id,customer_type
    const response = await fetch(`${API_BASE_URL}product/get-location-features/${location_id}/${customer_type}/${lang}`, {
         method: 'GET',
         headers: {
            ...getHeader().headers,
           'Content-Type': 'application/json'
        },
    });
    return response;
}

// New API (Get Product Contract Plans) // product_id, contract_period_id,purpose
// export const getProductContractPlans = async (product_id,contract_period_id,purpose) => {
export const getProductContractPlans = async (product_id,location_id,contract_period_id,purpose,lang) => {
    // const response = await fetch(`${API_BASE_URL}product/get-products-contract-period-plans/${product_id}/${contract_period_id}/${purpose}`, {
    const response = await fetch(`${API_BASE_URL}product/get-products-contract-period-plan-details/${product_id}/${location_id}/${contract_period_id}/${purpose}/${lang}`, {
        method: 'GET',
        headers: {
            ...getHeader().headers,
           'Content-Type': 'application/json'
        },
    });
    return response;
}


//get Product Contract Periods
export const getContractPeriods = async (product_id,location_country_id,location_city_id,location_id,lang) => {
    // product_id, location_country_id, location_city_id, location_id
    const response = await fetch(`${API_BASE_URL}product/get-products-contract-periods/${product_id}/${location_country_id}/${location_city_id}/${location_id}/${lang}`, {
         method: 'GET',
         headers: {
            ...getHeader().headers,
           'Content-Type': 'application/json'
        },
    });
    return response;
}

//get Product Contract Plans  product_id, location_id, contract_period_id,purpose
export const getContractPlans = async (product_id,location_id,contract_period_id,purpose,lang) => {
    // product_id, contract_period_id
    const response = await fetch(`${API_BASE_URL}product/get-products-contract-period-plan-details/${product_id}/${location_id}/${contract_period_id}/${purpose}/${lang}`, {
        method: 'GET',
        headers: {
            ...getHeader().headers,
           'Content-Type': 'application/json'
        },
    });
    return response;
}

// get Number Of Letters
export const getNumberOfLetters = async (data) => {
    const response = await fetch(`${API_BASE_URL}product/check-number-of-letters`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            ...getHeader().headers,
        },
        body: JSON.stringify(data),
    });
    return response;
}

// get Legal Countries
export const getLegalCountries = async () => {
    const response = await fetch(`${API_BASE_URL}product/get-legal-countries`, {
        method: 'GET',
        headers: {
            ...getHeader().headers,
           'Content-Type': 'application/json'
        },
    });
    return response;
}

// get Legal Region by Country Wise
export const getLegalRegionByCountryId = async (country_id) => {
    const response = await fetch(`${API_BASE_URL}product/get-legal-regions/${country_id}`, {
        method: 'GET',
        headers: {
            ...getHeader().headers,
           'Content-Type': 'application/json'
        },
    });
    return response;
}

// get Legal Forms Legal Country Wise
export const getLegalFormByCountryId = async (country_id) => {
    const response = await fetch(`${API_BASE_URL}product/get-legal-forms/${country_id}`, {
        method: 'GET',
        headers: {
            ...getHeader().headers,
           'Content-Type': 'application/json'
        },
    });
    return response;
}

// check VAT number
export const checkVATNumber = async (vat_number,lang) => {
    const response = await fetch(`${API_BASE_URL}product/vat-verification`, {
        method: 'POST',
        headers: {
            ...getHeader().headers,
           'Content-Type': 'application/json'
        },
        body: JSON.stringify(vat_number,lang)
    });
    return response;
}

// https://cleverdomizil.de/virtual_office/api/product/vat-verification

// submit Step Three (Email)
export const completeStep3 = async (data) => {
    const response = await fetch(`${API_BASE_URL}product/submit-step-three`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            ...getHeader().headers,
        },
        body: JSON.stringify(data),
    });
    return response;
}

                // ---- Thrid Step through Email Product(YourDetails component) APIs intregation end ----

//Payment page start

// get Not Purchased Products For step 4 page
export const getProductListStep4 = async (lang) => {
    const response = await fetch(`${API_BASE_URL}product/get-not-purchased-products?lang=${lang}`, {
        method: 'GET',
        headers: {
            ...getHeader().headers,
           'Content-Type': 'application/json'
        },
    });
    return response;
}

// Check phone numbers availability
export const checkPhoneAvailability = async (lang) => {
    const response = await fetch(`${API_BASE_URL}product/check-phone-numbers-availability-on-checkout?lang=${lang}`, {
        method: 'GET',
        headers: {
            ...getHeader().headers,
           'Content-Type': 'application/json'
        },
    });
    return response;
}

export const getPurchasedProductList = async (lang) => {
    const response = await fetch(`${API_BASE_URL}user/get-purchased-products?lang=${lang}`, {
        method: 'GET',
        headers: {
            ...getHeader().headers,
           'Content-Type': 'application/json'
        },
    });
    return response;
}

export const DeleteProductListStep4 = async (id) => {
    let data = {
        id: id,
        ...getHeader()

    }
    const response = await fetch(`${API_BASE_URL}product/delete-not-purchase-product`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            ...data.headers
        },
        body: JSON.stringify(data),
        
    });
    return response;
}

// Submit Not Purchased Product Invoice (New API)
export const notPurchasedProductInvoice = async (data) => {
    const response = await fetch(`${API_BASE_URL}invoice/submit-not-purchased-product-invoice`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            ...getHeader().headers,
        },
        body: JSON.stringify(data),
    });
    return response;
}

export const submitStepFour = async () => {
    let data = {
        ...getHeader()

    }
    const response = await fetch(`${API_BASE_URL}product/submit-step-four`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            ...data.headers
        },
    });
    return response;
}

//Payment page end

// ---- Thrid Step through Phone Product (SelectCountryPhoneNumber component) APIs intregation start ----

//country list
export const getProductPhoneCountries = async () => {
    const response = await fetch(`${API_BASE_URL}product/get-phone-countries`, {
        method: 'GET',
        headers: {
            ...getHeader().headers,
            'Content-Type': 'application/json',
        },
    });
    return response;
}

//Get Phone Area With Respect to Phone Country
export const getPhoneAreaByCountryId = async (country_id,lang) => {
    const response = await fetch(`${API_BASE_URL}product/get-phone-area-country-wise/${country_id}/${lang}`, {
        method: 'GET',
        headers: {
            ...getHeader().headers,
            'Content-Type': 'application/json',
        },
    });
    return response;
}

// Get Phone Features With Respect to Phone Country
export const getPhoneFeaturesByCountryId = async (country_id,lang) => {
    const response = await fetch(`${API_BASE_URL}product/get-phone-features-country-wise/${country_id}/${lang}`, {
        method: 'GET',
        headers: {
            ...getHeader().headers,
            'Content-Type': 'application/json',
        },
    });
    return response;
}

//Get Phone Numbers
export const getPhoneNumbers = async (country_id, area_id) => {
    const response = await fetch(`${API_BASE_URL}product/get-phone-numbers/${country_id}/${area_id}`, {
        method: 'GET',
        headers: {
            ...getHeader().headers,
            'Content-Type': 'application/json',
        },
    });
    return response;
}

// submit Step Three (phone)
// export const completeStep3_phone = async (data) => {
//     const response = await fetch(`${API_BASE_URL}user/submit-step-three`, {
//         method: 'POST',
//         headers: {
//             'Content-Type': 'multipart/form-data',
//             ...getHeader().headers,
//         },
//         body:data,
        
//     });
//     return response;
// }

// Check user purchase phone number
export const checkPhoneNumberPurchaseStatus = async (lang) => {
    const response = await fetch(`${API_BASE_URL}product/check-user-purchase-phone-number?lang=${lang}`, {
        method: 'GET',
        headers: {
            ...getHeader().headers,
            'Content-Type': 'application/json',
        },
    });
    return response;
}

export const completeStep3_phone = async (data) => {
    const response = await axios.post(`${API_BASE_URL}product/submit-step-three`, data, {
        headers: {
            'Content-Type': 'multipart/form-data',
            // 'Content-Type': 'application/json',
            ...getHeader().headers,
        },
    });
    return response;
};

// ---- Third Step through Phone Product (SelectCountryPhoneNumber component) APIs intregation start ----


// ---- Dashboard Section API intregation start ---- Topup page start

export const submitTopup = async (amount) => {
    let data = {
        amount: amount,
        card_number: '',
        expiry_date: '',
        name_card: '',
        CVC: '',
        ...getHeader()
    }
    const response = await fetch(`${API_BASE_URL}account/update-wallet`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            ...data.headers
        },
        body: JSON.stringify(data),
        
    });
    return response;
}

// Mail box and Scan data
export const getMailBoxAndScanData = async () => {
    const response = await fetch(`${API_BASE_URL}user/get-user-dashboard`, {
        method: 'GET',
        headers: {
            ...getHeader().headers,
           'Content-Type': 'application/json'
        },
    });
    return response;
}

// ---- Dashboard Section API intregation end ----Topup page end



                // ---- Sidebar API intregation start ----

//for all mail count
export const getAllMailCount = async () => {
    const response = await fetch(`${API_BASE_URL}mailbox/get-mail-count`, {
        method: 'GET',
        headers: {
            ...getHeader().headers,
           'Content-Type': 'application/json'
        },
    });
    return response;
}

//for all mail count
export const getAllTypes = async (lang) => {
    const response = await fetch(`${API_BASE_URL}mailbox/get-all-types?lang=${lang}`, {
        method: 'GET',
        headers: {
            ...getHeader().headers,
           'Content-Type': 'application/json'
        },
    });
    return response;
}

//for all mails data
export const getAllMailsData = async (pageNumber) => {
    const response = await fetch(`${API_BASE_URL}mailbox/get-all-mails?page=${pageNumber}`, {
        method: 'GET',
        headers: {
            ...getHeader().headers,
           'Content-Type': 'application/json'
        },
    });
    return response;
}

//for all categories
export const getAllMailCategory = async () => {
    const response = await fetch(`${API_BASE_URL}mailbox/get-all-categories`, {
        method: 'GET',
        headers: {
            ...getHeader().headers,
           'Content-Type': 'application/json'
        },
    });
    return response;
}

// filter data
export const getFilterData = async (data) => {
    const response = await fetch(`${API_BASE_URL}mailbox/mail-filter`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            ...getHeader().headers,
        },
        body: JSON.stringify(data),
    });
    return response;
}

//for update mail category
export const updateMailCategoryById = async (id,cat_id) => {
    const response = await fetch(`${API_BASE_URL}mailbox/update-mail-category/${id}/${cat_id}`, {
        method: 'GET',
        headers: {
            ...getHeader().headers,
           'Content-Type': 'application/json'
        },
    });
    return response;
}

// Update New Mail Read Status
export const updateNewMailReadStatus= async (id) => {
    const response = await fetch(`${API_BASE_URL}mailbox/update-mail-read-status/${id}`, {
        method: 'GET',
        headers: {
            ...getHeader().headers,
           'Content-Type': 'application/json'
        },
    });
    return response;
}

//for new mails data
export const getNewMailsData = async (pageNumber,lang) => {
    const response = await fetch(`${API_BASE_URL}mailbox/get-all-new-mails?page=${pageNumber}&lang=${lang}`, {
        method: 'GET',
        headers: {
            ...getHeader().headers,
           'Content-Type': 'application/json'
        },
    });
    return response;
}

//for envelop scan data
export const getEnvelopScanData = async (pageNumber,lang) => {
    const response = await fetch(`${API_BASE_URL}mailbox/get-all-envelopes?page=${pageNumber}&lang=${lang}`, {
        method: 'GET',
        headers: {
            ...getHeader().headers,
           'Content-Type': 'application/json'
        },
    });
    return response;
}

//for scan data
export const getScanData = async (pageNumber,lang) => {
    const response = await fetch(`${API_BASE_URL}mailbox/get-all-scan-document?page=${pageNumber}&lang=${lang}`, {
        method: 'GET',
        headers: {
            ...getHeader().headers,
           'Content-Type': 'application/json'
        },
    });
    return response;
}

//for my request data
export const getMyRequestData = async (pageNumber,lang) => {
    const response = await fetch(`${API_BASE_URL}mailbox/get-all-my-request?page=${pageNumber}&lang=${lang}`, {
        method: 'GET',
        headers: {
            ...getHeader().headers,
           'Content-Type': 'application/json'
        },
    });
    return response;
}

//for trashed data
export const getTrashedData = async (pageNumber,lang) => {
    const response = await fetch(`${API_BASE_URL}mailbox/get-all-trash-mails?page=${pageNumber}&lang=${lang}`, {
        method: 'GET',
        headers: {
            ...getHeader().headers,
           'Content-Type': 'application/json'
        },
    });
    return response;
}

//for purchased phone number
export const getAllPurchasedPhoneNumbers = async (pageNumber,lang) => {
    const response = await fetch(`${API_BASE_URL}mailbox/purchased-phone-number?page=${pageNumber}&lang=${lang}`, {
        method: 'GET',
        headers: {
            ...getHeader().headers,
           'Content-Type': 'application/json'
        },
    });
    return response;
}

// view the record
export const viewRecord = async (id) => {
    const response = await fetch(`${API_BASE_URL}mailbox/get-mail-by-id/${id}`, {
        method: 'GET',
        headers: {
            ...getHeader().headers,
           'Content-Type': 'application/json'
        },
    });
    return response;
}

// for trashed data delete(soft delete)
export const recordMovedtoTrash = async (id) => {
    const response = await fetch(`${API_BASE_URL}mailbox/mail-soft-delete/${id}`, {
        method: 'GET',
        headers: {
            ...getHeader().headers,
           'Content-Type': 'application/json'
        },
    });
    return response;
}

// for trashed data delete(hard delete)
export const deleteTrashedData = async (id) => {
    const response = await fetch(`${API_BASE_URL}mailbox/mail-hard-delete/${id}`, {
        method: 'GET',
        headers: {
            ...getHeader().headers,
           'Content-Type': 'application/json'
        },
    });
    return response;
}

// for retrive data from trashed data(soft delete)
export const retriveDataFromTrashed = async (id) => {
    const response = await fetch(`${API_BASE_URL}mailbox/move-to-all-mail/${id}`, {
        method: 'GET',
        headers: {
            ...getHeader().headers,
           'Content-Type': 'application/json'
        },
    });
    return response;
}

// for get scan price
export const getScanPrice = async (id) => {
    const response = await fetch(`${API_BASE_URL}mailbox/get-scan-price/${id}`, {
        method: 'GET',
        headers: {
            ...getHeader().headers,
           'Content-Type': 'application/json'
        },
    });
    return response;
}

// for get wallet price
export const getWalletPrice = async () => {
    const response = await fetch(`${API_BASE_URL}mailbox/get-user-wallet-price`, {
        method: 'GET',
        headers: {
            ...getHeader().headers,
           'Content-Type': 'application/json'
        },
    });
    return response;
}

// send scan request
export const sendScanRequest = async (data) => {
    const response = await fetch(`${API_BASE_URL}mailbox/send-mail-scan-request`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            ...getHeader().headers,
        },
        body: JSON.stringify(data),
    });
    return response;
}

// send me request
export const sendMeRequest = async (data) => {
    const response = await fetch(`${API_BASE_URL}mailbox/send-mail-me-request`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            ...getHeader().headers,
        },
        body: JSON.stringify(data),
    });
    return response;
}

// export const sendMeRequest = async (id) => {
//     const response = await fetch(`${API_BASE_URL}mailbox/send-mail-me-request/${id}`, {
//         method: 'GET',
//         headers: {
//             ...getHeader().headers,
//            'Content-Type': 'application/json'
//         },
//     });
//     return response;
// }

// send me address(as billing)
export const sendMeAddressAsBilling = async (data) => {
    const response = await fetch(`${API_BASE_URL}mailbox/user-send-me-address-same-as-billing-address`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            ...getHeader().headers,
        },
        body: JSON.stringify(data),
    });
    return response;
}

// send me address(new address)
export const sendMeNewAddress = async (data) => {
    const response = await fetch(`${API_BASE_URL}mailbox/user-send-me-new-address`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            ...getHeader().headers,
        },
        body: JSON.stringify(data),
    });
    return response;
}

// for get all purchased plan
export const getAllPurchasedPlan = async () => {
    const response = await fetch(`${API_BASE_URL}mailbox/show-purchased-plan`, {
        method: 'GET',
        headers: {
            ...getHeader().headers,
           'Content-Type': 'application/json'
        },
    });
    return response;
}

// for get all purchased product by user
export const getAllPurchasedProductByUser = async (lang) => {
    const response = await fetch(`${API_BASE_URL}product/get-all-purchased-products?lang=${lang}`, {
        method: 'GET',
        headers: {
            ...getHeader().headers,
           'Content-Type': 'application/json'
        },
    });
    return response;
}

// for get all expire purchased product
export const getAllExpirePurchasedProduct = async () => {
    const response = await fetch(`${API_BASE_URL}/product/get-all-expire-purchased-products`, {
        method: 'GET',
        headers: {
            ...getHeader().headers,
           'Content-Type': 'application/json'
        },
    });
    return response;
}

                        // ---- Sidebar API intregation end ----


                        // ---- Notification API intregation start ----

// for get all unread notifications
export const getAllUnreadNotification = async () => {
    const response = await fetch(`${API_BASE_URL}mailbox/show-unread-notifications`, {
        method: 'GET',
        headers: {
            ...getHeader().headers,
           'Content-Type': 'application/json'
        },
    });
    return response;
}

// for get all read notifications
export const getAllReadNotification = async () => {
    const response = await fetch(`${API_BASE_URL}mailbox/update-read-status-notifications`, {
        method: 'GET',
        headers: {
            ...getHeader().headers,
           'Content-Type': 'application/json'
        },
    });
    return response;
}

                    // ---- Notification API intregation end ----


                    // Plan Purchased & expire Products By User start

// for get all read notifications
export const getPurchaseProductByUser = async () => {
    const response = await fetch(`${API_BASE_URL}product/get-all-purchased-products`, {
        method: 'GET',
        headers: {
            ...getHeader().headers,
           'Content-Type': 'application/json'
        },
    });
    return response;
}

// for get all read notifications
export const getExpireProductByUser = async () => {
    const response = await fetch(`${API_BASE_URL}product/get-all-expire-purchased-products`, {
        method: 'GET',
        headers: {
            ...getHeader().headers,
           'Content-Type': 'application/json'
        },
    });
    return response;
}

export const getFilterProductByUser = async (data) => {
    const response = await fetch(`${API_BASE_URL}mailbox/purchased-plan-filter`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            ...getHeader().headers,
        },
        body: JSON.stringify(data),
    });
    return response;
}
                     // Plan Purchased & expire Products By User end


//              ---- Home Page all API intregation start ----

//Get Phone Number Countries
export const getAllLanguages = async () => {
    const response = await fetch(`${API_BASE_URL}home/get-language`, {
        method: 'GET'
    });
    return response;
}

//Get Phone Number Countries
export const getPhoneNumberCountryList = async () => {
    const response = await fetch(`${API_BASE_URL}home/get-phone-number-countries`, {
        method: 'GET'
    });
    return response;
}

//Get Digital Mail Countries
export const getDigitalMailCountryList = async () => {
    const response = await fetch(`${API_BASE_URL}home/get-digital-mail-countries`, {
        method: 'GET'
    });
    return response;
}

//Get Banners  lang:de
export const getAllBanners = async (lang_code) => {
    const response = await fetch(`${API_BASE_URL}home/get-banners?lang=${lang_code}`, {
        method: 'GET'
    });
    return response;
}

//Get counter with in banner
export const getCounterInBanner = async () => {
    const response = await fetch(`${API_BASE_URL}home/get-counter-in-banner`, {
        method: 'GET'
    });
    return response;
}

//Get Testimonials
export const getAllTestimonials = async (lang_code) => {
    const response = await fetch(`${API_BASE_URL}home/get-testimonials?lang=${lang_code}`, {
        method: 'GET'
    });
    return response;
}

//Get Products
export const getProducts = async (lang_code) => {
    const response = await fetch(`${API_BASE_URL}home/get-products?lang=${lang_code}`, {
        method: 'GET'
    });
    return response;
}

//Get Blogs
export const getblogs = async (pageNumber,lang) => {
        const response = await fetch(`${API_BASE_URL}blog/get-blogs?page=${pageNumber}&lang=${lang}`, {
        method: 'GET'
    });
    return response;
} 

//Get Blog details by id
export const getblogsByid = async (id,lang)=> {
    const response = await fetch(`${API_BASE_URL}blog/get-blog-by-id/${id}/${lang}`, {
        method: 'GET'
    });
    return response;
}


// Get Product Features By Product Id (email & number both)
export const getFeaturesByProductId = async (product_id) => {
    const response = await fetch(`${API_BASE_URL}product/get-product-features/${product_id}`, {
        method: 'GET'
    });
    return response;
}

// Get Product Services By Product Id
export const getServicesByProductId = async (product_id) => {
    const response = await fetch(`${API_BASE_URL}product/get-product-service/${product_id}`, {
        method: 'GET',
    });
    return response;
}

// Get All Mail Product Country
export const getMailProductCountry = async (product_id,lang) => {
    const response = await fetch(`${API_BASE_URL}product/get-mail-product-country/${product_id}/${lang}`, {
        method: 'GET'
    });
    return response;
}

// Get All Mail Product City
export const getMailProductCity = async () => {
    const response = await fetch(`${API_BASE_URL}product/get-mail-product-all-city`, {
        method: 'GET'
    });
    return response;
}

// Get All Mail Product City
export const getMailProductCitiesByCountry = async (country_id,lang) => {
    const response = await fetch(`${API_BASE_URL}product/get-mail-product-city/${country_id}/${lang}`, {
        method: 'GET'
    });
    return response;
}

//Get Phone Countries For Phone Product Page
export const getPhoneCountries = async () => {
    const response = await fetch(`${API_BASE_URL}product/get-phone-countries-for-product-page`, {
        method: 'GET'
    });
    return response;
}

// Location Countries
export const getHomeLocationCountries = async (product_id) => {
    const response = await fetch(`${API_BASE_URL}product/get-location-page-countries/${product_id}`, {
        method: 'GET'
    });
    return response;
}

// Location state by Country id
export const getHomeLocationStates = async (product_id,country_id) => {
    const response = await fetch(`${API_BASE_URL}product/get-location-page-states/${product_id}/${country_id}`, {
        method: 'GET'
    });
    return response;
}

// Location Page Mail Area
export const getHomeMailArea = async (product_id,country_id,state_id) => {
    const response = await fetch(`${API_BASE_URL}product/get-location-page-mail-area/${product_id}/${country_id}/${state_id}`, {
        method: 'GET'
    });
    return response;
}

// Location Page Phone Area
export const getHomePhoneArea = async (product_id,country_id,lang) => {
    const response = await fetch(`${API_BASE_URL}product/get-location-page-phone-area/${product_id}/${country_id}/${lang}`, {
        method: 'GET'
    });
    return response;
}

// pricing Mail Location Country
export const getPricingMailCountries = async () => {
    const response = await fetch(`${API_BASE_URL}product/get-mail-location-countries`, {
        method: 'GET'
    });
    return response;
}

// pricing Mail Location cities by Country id
export const getPricingMailCitiesById = async (country_id) => {
    const response = await fetch(`${API_BASE_URL}product/get-mail-location-cities/${country_id}`, {
        method: 'GET'
    });
    return response;
}

// pricing Mail contract plan by ids
export const getPricingMailContractPlansById = async (country_id,city_id,type,lang) => {
    const response = await fetch(`${API_BASE_URL}product/get-mail-contract-plan/${country_id}/${city_id}/${type}/${lang}`, {
        method: 'GET'
    });
    return response;
}

// pricing Phone- Location Country
export const getPricingPhoneCountries = async () => {
    const response = await fetch(`${API_BASE_URL}product/get-phone-location-countries`, {
        method: 'GET'
    });
    return response;
}

// pricing phone - phone areas detail
export const getPricingPhoneAreasById = async (country_id) => {
    const response = await fetch(`${API_BASE_URL}product/get-phone-location-area-country-wise/${country_id}`, {
        method: 'GET'
    });
    return response;
}

// pricing phone - phone features detail
export const getPricingPhoneFeaturesById = async (country_id,lang) => {
    const response = await fetch(`${API_BASE_URL}product/get-phone-location-features-country-wise/${country_id}/${lang}`, {
        method: 'GET'
    });
    return response;
}

//              ---- Home Page all API intregation end ----
                     

//              ---- Contact us Page API intregation start ----

export const submitInquiry = async (data) => {
    const response = await fetch(`${API_BASE_URL}cms/submit-contact-us`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });
    return response;
}
//              ---- Contact us Page API intregation end ----


//              ---- About us Page API intregation start ----

export const aboutPageData = async () => {
    const response = await fetch(`${API_BASE_URL}cms/get-about-page`, {
        method: 'GET'
    });
    return response;
}

//              ---- About us Page API intregation end ----

//              ---- ImPrint Page API intregation start ----

export const imPrintData = async () => {
    const response = await fetch(`${API_BASE_URL}cms/get-im-print-page`, {
        method: 'GET'
    });
    return response;
}
//              ---- ImPrint Page API intregation end ----

export const footerPageData = async (lang) => {
    const response = await fetch(`${API_BASE_URL}cms/get-footer-data?lang=${lang}`, {
        method: 'GET'
    });
    return response;
}

export const termPrivasyData = async () => {
    const response = await fetch(`${API_BASE_URL}cms/get-termprivasy-data`, {
        method: 'GET'
    });
    return response;
}

//Get Home Data
export const getHomePageData = async () => {
    const response = await fetch(`${API_BASE_URL}home/get-home-page-data`, {
        method: 'GET'
    });
    return response;
}

// CMS
export const getCmsDataById = async (id) => {
    const response = await fetch(`${API_BASE_URL}cms/get-page-data/${id}`, {
        method: 'GET'
    });
    return response;
}

// Student Portal Data(CMS)
export const studentPortalData = async (lang) => {
    const response = await fetch(`${API_BASE_URL}cms/get-student-portal-page?lang=${lang}`, {
        method: 'GET'
    });
    return response;
}


/*  ## Data send after Paypal Payment ##  */
export const paymentInvoice = async (data) => {
    const response = await fetch(`${API_BASE_URL}invoice/submit-invoice`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            ...getHeader().headers,
        },
        body: JSON.stringify(data),
    });
    return response;
}

// all invoice list
export const invoiceList = async (pageNumber,lang) => {
    const response = await fetch(`${API_BASE_URL}invoice/get-all-invoice-list?page=${pageNumber}&lang=${lang}`, {
        method: 'GET',
        headers: {
            ...getHeader().headers,
           'Content-Type': 'application/json'
        },
    });
    return response;
}

// delete invoice
export const deleteInvoice = async (id) => {
    const response = await fetch(`${API_BASE_URL}invoice/invoice-delete/${id}`, {
        method: 'GET',
        headers: {
            ...getHeader().headers,
           'Content-Type': 'application/json'
        },
    });
    return response;
}

// overview list
export const getAllReadOverviewList = async (lang) => {
    const response = await fetch(`${API_BASE_URL}invoice/get-all-overview-list?lang=${lang}`, {
        method: 'GET',
        headers: {
            ...getHeader().headers,
           'Content-Type': 'application/json'
        },
    });
    return response;
}

// download invoice pdf
export const downloadInvoicePdf = async (id) => {
    const response = await fetch(`${API_BASE_URL}invoice/create-invoice/${id}`, {
        method: 'GET',
        headers: {
            ...getHeader().headers,
           'Content-Type': 'application/json'
        },
    });
    return response;
}

// download agreement pdf
export const downloadAgreement = async () => {
    const response = await fetch(`${API_BASE_URL}product/get-not-purchased-products-agreement`, {
        method: 'GET',
        headers: {
            ...getHeader().headers,
           'Content-Type': 'application/json'
        },
    });
    return response;
}

// download Top-up or Scan or Send-me pdf
export const downloadAgreement2 = async (amount,type) => {
    const response = await fetch(`${API_BASE_URL}product/get-topup-scan-sendme-agreement/${amount}/${type}`, {
        method: 'GET',
        headers: {
            ...getHeader().headers,
           'Content-Type': 'application/json'
        },
    });
    return response;
}

// download Top-up or Scan or Send-me pdf
export const sendInvoiceViaMail = async (transaction_id) => {
    const response = await fetch(`${API_BASE_URL}invoice/send-invoice/${transaction_id}`, {
        method: 'GET',
        headers: {
            ...getHeader().headers,
           'Content-Type': 'application/json'
        },
    });
    return response;
}

                // -- Renew Product Section Start -- 

// Get Renew Product Details
export const getRenewalProductDetails = async (lang,product_id) => {
    const response = await fetch(`${API_BASE_URL}product/get-renew-package?lang=${lang}&id=${product_id}`, {
        method: 'GET',
        headers: {
            ...getHeader().headers,
           'Content-Type': 'application/json'
        },
    });
    return response;
}

// Submit Renew Product Invoice
export const submitRenewProductInvoice = async (data) => {
    const response = await fetch(`${API_BASE_URL}invoice/submit-renew-product-invoice`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            ...getHeader().headers,
        },
        body: JSON.stringify(data),
    });
    return response;
}

// Update Renew Package
export const updateRenewPackage = async (product_id) => {
    const response = await fetch(`${API_BASE_URL}product/update-renew-package?id=${product_id}`, {
        method: 'GET',
        headers: {
            ...getHeader().headers,
           'Content-Type': 'application/json'
        },
    });
    return response;
}

// Agreement For Renew Purchased Product
export const renewPurchasedProduct = async (product_id) => {
    const response = await fetch(`${API_BASE_URL}product/get-renew-purchased-products-agreement/${product_id}`, {
        method: 'GET',
        headers: {
            ...getHeader().headers,
           'Content-Type': 'application/json'
        },
    });
    return response;
}

                // -- Renew Product Section End -- 
