import { useEffect, useRef, useState } from "react";
import { Link,  useNavigate } from "react-router-dom";

import { getAllCategoryGroups } from "../api/apiRequest";
import searchIcon from "../assets/icons/SearchIcon.svg";
import noImage from "../assets/images/no-image.png";

import "../styles/CategorySlide.css";
import MainLayout from "../layouts/MainLayout";
// import loadingGif from "../assets/images/transperent-loader.gif";
import { useLoading } from "../context/LoadingContext";





const CategorySlide = () => {
  const { startLoading, stopLoading } = useLoading();
  const navigate = useNavigate();
  const childListRef = useRef(null);
  const [category, setCategory] = useState([]);
 ;

  
  const [selectedParent, setSelectedParent] = useState(null);
  
  const [childSearchText, setChildSearchText] = useState("");
 
 

  const [categoryLoading, setCategoryLoading] = useState(true);
  
  const[categoryError,setCategoryError]=useState("");


// useEffect(() => {
//   let isMounted = true;

//   const getCategory = async () => {
//     setCategoryLoading(true);
//     setCategoryError("");

//     try {
//       const response = await getAllCategoryGroups();
//       if(response.status===429){
//       if (isMounted) {
//           setCategoryError(
//             "Too many requests. Please wait a moment and try again."
//           );
//           setCategory([]);
//         }
//         return;
//       }

//       if (!response.ok) {
//         throw new Error(`API Error: ${response.status}`);
//       }














//       const result = await response.json();

//       if (!response.ok || result?.res === false) {
//         throw new Error(
//           result?.msg || "Unable to load category groups"
//         );
//       }

//       if (isMounted) {
//         setCategory(
//           Array.isArray(result?.data)
//             ? result.data
//             : []
//         );
//       }
//     } catch (error) {
//       if (isMounted) {
//         console.error("Category API Error:", error);
//         setCategory([]);
//       }
//     } finally {
//       if (isMounted) {
//         setCategoryLoading(false);
//       }
//     }
//   };

//   getCategory();

//   return () => {
//     isMounted = false;
//   };
// }, []);

const getCategory = async () => {
  setCategoryLoading(true);
  startLoading();
  setCategoryError("");

  try {
    const response = await getAllCategoryGroups();

    if (response.status === 429) {
      setCategoryError(
        "Too many requests. Please try again after 5 seconds."
      );
      setCategory([]);
      return;
    }

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    const result = await response.json();

    if (Array.isArray(result?.data)) {
      setCategory(result.data);
    } else {
      setCategory([]);
      setCategoryError("Unable to load product categories. Please try again after 5 seconds");
    }

  } catch (error) {
    console.error("Category API Error:", error);
    setCategory([]);
    setCategoryError(
      "Unable to load product categories. Please try again."
    );
  } finally {
    setCategoryLoading(false);
    stopLoading();
  }
};

useEffect(() => {
  getCategory();
}, []);




useEffect(() => {
  if (categoryLoading) {
    document.body.style.overflow = "hidden";
  } else {
    document.body.style.overflow = "";
  }

  return () => {
    document.body.style.overflow = "";
  };
}, [categoryLoading]);







  useEffect(() => {
    if (category.length > 0 && selectedParent === null) {
      setSelectedParent(category[0].id);
    }
  }, [category, selectedParent]);


  const selectedCategory = category.find(
    (item) => item.id === selectedParent,
  );

  

  useEffect(() => {
    setChildSearchText("");
  }, [selectedParent]);



  const filteredCategories=category;

  const normalizedChildSearch = childSearchText.toLowerCase().trim();
  const filteredChildren = (selectedCategory?.child_category || []).filter(
    (child) => child.name?.toLowerCase().includes(normalizedChildSearch),
  );


useEffect(() => {
  if (categoryLoading||selectedParent === null) return;

  const timer = setTimeout(() => {
    const childList = childListRef.current;

    if (!childList) return;

    const headerHeight = 150; // change according to your MainLayout header

    const position =
      childList.getBoundingClientRect().top +
      window.scrollY -
      headerHeight;

    window.scrollTo({
      top: position,
      behavior: "smooth",
    });
  }, 100);

  return () => clearTimeout(timer);
}, [selectedParent,categoryLoading]);



return (

      <MainLayout hideFloatingButtons={categoryLoading}>
  
 <div className='wrapper'
 
 >
         { categoryLoading? null :categoryError ?(
   <div className="category-error">
    <h2>Unable to load categories</h2>

    <p>{categoryError}</p>

    <button onClick={getCategory}>
      Try Again
    </button>
  </div>
):(
      <div className="category-container">
        <div className="parent-list" >
          {filteredCategories.map((item) => (
            <div
              key={item.id}
              
              className={`parent-category ${
                selectedParent === item.id ? "selected" : ""
              }`}
              onClick={(e) =>{
                 setSelectedParent(item.id);
   

              }}
            >
              <div className="category-info">
                <img
                  src={item.photo || noImage}
                  alt={item.name}
                  className="category-image"
                  onError={(event) => {
                    event.currentTarget.src = noImage;
                  }}
                />
                <span>{item.name}</span>
              </div>
            </div>
          ))}
        </div>
    

        <div className="child-list" ref={childListRef}>
          <div className="child-content">
            <div className="child-header">
              <h2>{selectedCategory?.name}</h2>
            </div>

            <Link
              to="/quick-order"
              className="category-slide-view-btn"
              state={{ cat_g_id: selectedCategory?.id }}
            >
              View All Products
            </Link>

            <div className="child-search-box">
              <div className="search-wrapper">
                <input
                  type="text"
                  placeholder={`Search ${
                    selectedCategory?.name || "category"
                  }...`}
                  value={childSearchText}
                  onChange={(event) => setChildSearchText(event.target.value)}
                />
                <img
                  src={searchIcon}
                  alt="SearchIcon"
                  className="search-icon"
                />
              </div>
            </div>
          </div>
   {filteredChildren.length > 0 ? (
            <div className="child-cards">
              
              {filteredChildren.map((child) => (
                <div
                  key={child.id}
                  className="child-item"
                  onClick={() => {
                    navigate("/quick-order", {
                      state: {
                        cat_g_id: selectedCategory.id,
                        cat_id: child.id,
                      },
                    });
                  }}
                >
                  <img
                    src={child.photo || noImage}
                    alt={child.name}
                    className="child-image"
                    onError={(event) => {
                      event.currentTarget.src = noImage;
                    }}
                  />

                  <span
                    className="child-name"
                  >
                    {child.name}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-children">
              <p>No Product Category is available...</p>
            </div>
          )}
            </div>
            </div>
)}
  </div>
      
     </MainLayout>
  
  );
}

export default CategorySlide;
