import React, { useState , useRef } from 'react'
import Warranty from "../assets/icons/warranty.jpeg"
import { FaArrowRight } from "react-icons/fa";
import MainLayout from "../layouts/MainLayout"
import { verifyWarrantyOtp } from '../api/apiRequest';
import { useNavigate } from 'react-router-dom';
import { FaP } from 'react-icons/fa6';
import { useEffect } from 'react';
const WarrantyLogin = () => {


const[phone,setPhone]=useState("");
const[isLoading,setIsLoading]=useState(false);
const[otpSent,setOtpSent]=useState(false);
const[otp,setOtp]=useState(["", "","","","",""]);
const[isVerifying, setIsVerifying]=useState(false);
const otpRefs=useRef([]);
const[timer,setTimer]=useState(0);
const[serverOtp,setServerOtp]=useState("");
const navigate = useNavigate();

const handleSendOtp = async()=>{
    if(!/^[0-9]{10}$/.test(phone)){
    alert("Please enter 10 digit valid mobile number")
    return;
    }
      // Clear previous OTP before sending a new one
  setServerOtp("");
  setOtp(["", "", "", "", "", ""]);
localStorage.removeItem("warrantyOtp");
    try{
    setIsLoading(true);
const response = await fetch("https://mazingbusiness.com/mazing_business_react/api/user/send-otp-for-login",{
    method:"POST",
    headers:{
    "Content-Type":"application/json",
        "Accept": "application/json",
    },
       credentials: "include",
    body:JSON.stringify({
    phone:phone,
    }),
});

    const data= await response.json();
//     console.log("OTP API STATUS:", response.status);
// console.log("OTP API RESPONSE:", data);
// console.log("OTP GENERATED:", data?.res);
// console.log("OTP MESSAGE:", data?.msg);
//    console.log("send OTP RESPONSE FULL:", JSON.stringify(data, null, 2));

    if(response.ok && data.res === true){
      if (!data.otp) {
  alert("OTP was not received from the server.");
  return;
}
  const receivedOtp = String(data.otp);
      //Save otp received from api
      setServerOtp(receivedOtp);
      localStorage.setItem("warrantyOtp", receivedOtp);
  setOtpSent(true);
      setTimer(60);
    alert("Otp Sent Successfully");
    }
    else{
    alert(data.message || "Failed to sent an OTP")
    }
}

catch(error){
console.error("Send OTP error", error);
alert("Something went wrong.");
}
finally{
setIsLoading(false);
}
}


const handleOtpChange=(value,index)=>{
if(!/^\d*$/.test(value)) return;

const updatedOtp=[...otp];
updatedOtp[index]=value.slice(-1);
setOtp(updatedOtp);

if(value && index<5){
otpRefs.current[index+1]?.focus();
}
}
const handleOtpKeyDown = (e, index) => {
  if (e.key === "Backspace" && !otp[index] && index > 0) {
    otpRefs.current[index - 1]?.focus();
  }
};


const handleVerifyOtp = async () => {
  const enteredOtp = otp.join("").trim();
  const receivedOtp = (localStorage.getItem("warrantyOtp") || "").trim();


  if (!/^\d{6}$/.test(enteredOtp)) {
    alert("Please enter 6 digit OTP");
    return;
  }
  // Compare entered OTP with OTP received from Send OTP API
  if (!receivedOtp || enteredOtp !== receivedOtp) {
    alert("Invalid OTP. Please enter the correct OTP.");
    return;
  }
  try {
    setIsVerifying(true);
    // Call verification API only after OTP matches
    const result = await verifyWarrantyOtp(phone, enteredOtp);
    const loginData = result.data;

    console.log("OTP VERIFY RESPONSE:", loginData);
    const token = loginData?.authorisation?.token;

if (!token) {
  alert("OTP verification failed. Token not received.");
  return;
}

//     // Check whether API request succeeded
//     if (!result.success|| loginData?.res !== true) {
//       alert(loginData?.message || loginData?.msg  || "OTP verification failed");
//       return;
//     }
//    const token =
//   loginData?.authorisation?.token ||
//   loginData?.data?.authorisation?.token ||
//   loginData?.token ||
//   loginData?.data?.token;
// console.log("Login successful:", loginData?.res === true);
// console.log("Token received:", Boolean(token));
//     if (!token) {
//      console.error("Token not found in OTP response:", loginData);
//   alert("Backend did not return an authorization token.");
//   return;
// }

 // Save complete Warranty Login response
localStorage.setItem(
  "warrantyLoginInfo",
  JSON.stringify(loginData)
);

// Save Warranty token separately
localStorage.setItem("warrantyToken", token);

// Save verified phone
sessionStorage.setItem("warrantyVerifiedPhone", phone);



console.log("Warranty login response saved");
console.log(
  "Warranty token saved:",
  Boolean(localStorage.getItem("warrantyToken"))
);


    // Clear OTP after successful verification
    localStorage.removeItem("warrantyOtp");
    setServerOtp("");
    setOtp(["", "", "", "", "", ""]);

    console.log("Warranty login successful");
    console.log(
      "Token saved:",
      Boolean(localStorage.getItem("warrantyToken"))
    );
    // Navigate to Warranty Claim
    navigate("/Warranty-Claim", {
      state: {
        verifiedPhone: phone,
      },
    });

  } catch (error) {
    console.error("OTP ERROR:", error);
    alert("Unable to verify OTP");
  } finally {
    setIsVerifying(false);
  }
};

useEffect(() => {
  if (!otpSent || timer <= 0) return;

  const countdown = setTimeout(() => {
    setTimer((prev) => Math.max(prev - 1, 0));
  }, 1000);

  return () => clearTimeout(countdown);
}, [timer, otpSent]);

return (
    <MainLayout>
    <div className='warranty-login-page'>
<img src={Warranty} alt="Warranty Image" />
<h2>Warranty Claim Portal </h2>

<p>Verify your registered mobile number via one-Time Password
     <br />
     (OTP) to file a new repair claim ,check warranty coverage ,
    <br />
    or manage active returns.</p>


<div className='registration-input-details'>
<h3>REGISTERED MOBILE NUMBER <span>*</span></h3>

<div className='registration-input'>
    <div className='country-code'>
<span className='india-flag'>IN </span>
<span>+91</span>
</div>
<input
type='text'
placeholder='Enter Your Phone Number'
maxLength={10}
inputMode='numeric'
pattern='[0-9]{10}'
value={phone}
onChange={(e)=> setPhone(e.target.value.replace (/\D/g,""))} 
/>
<button
type='button'
className='otp-btn'
onClick={handleSendOtp}
disabled={isLoading || isVerifying || (otpSent && timer > 0)}
>
{isLoading
  ? "Sending..."
  : otpSent
    ? (timer > 0 ? "Please Wait..." : "Resend OTP")
    : "Send OTP"}
    </button>
</div>
<p>Valid 10-digit primary contact</p>
</div>
{otpSent && (
<div className='otp-details'>
    <div className='one-time-password'>
    <p>6-DIGIT-ONE-TIME-PASSWORD</p>
    <span> {timer > 0
    ? `Resend OTP in 00:${String(timer).padStart(2, "0")}`
    : "Resend OTP"}</span>
    {/* Timing must be of 60 seconds */}
    </div>


<div className='otp-fill'>
{otp.map((digit,index)=>(
<input
key={index}
type='text'
inputMode='numeric'
maxLength={1}
value={digit}
ref={(el)=>(otpRefs.current[index]=el)}
      onChange={(e) =>
        handleOtpChange(e.target.value, index)
      }
      onKeyDown={(e) =>
        handleOtpKeyDown(e, index)
      }
/>
))}
</div>
<p>OTP sent to <span>+91 {phone}</span></p>
</div>

)}
<div className='device-details'>
<input 
type='checkbox'
defaultChecked
/>
<p>Remember this device for 30 days</p>
</div>

<div className='verify-details-btn'>
<button
type='button'
onClick={handleVerifyOtp}
disabled={isLoading || isVerifying || !otpSent}
>{isVerifying? "Verifying..." : "Verify & Proceed to Claim"}
    <FaArrowRight/>
    </button>
</div>
    </div>
    </MainLayout>
  )
}

export default WarrantyLogin
