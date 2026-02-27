import React from "react";
import { FiX, FiChevronRight } from "react-icons/fi";
import product1 from "../assets/images/product.jpg";
import { getQuickOrderProduct } from "../api/apiRequest";

const products = [
  {
    id: 1,
    name: "Power Safe Connectors",
    price: 2000,
    discountedPrice: 1800,
    img: product1,
  },
  {
    id: 2,
    name: "Power Wash Cleaning Equipment",
    price: 2000,
    discountedPrice: 1800,
    img: product1,
  },
  {
    id: 3,
    name: "Power Machines Turbines",
    price: 2000,
    discountedPrice: 1800,
    img: product1,
  },
  {
    id: 4,
    name: "Golden Power Batteries",
    price: 2000,
    discountedPrice: 1800,
    img: product1,
  },
  {
    id: 5,
    name: "Power Film Solar Panels",
    price: 2000,
    discountedPrice: 1800,
    img: product1,
  },
  {
    id: 6,
    name: "Power Lock Connectors",
    price: 2000,
    discountedPrice: 1800,
    img: product1,
  },
];

const SearchModal = ({ searchText, onChange, onClear, onClose }) => {

  const [cat_groups, setCatgroup] = useState(initialCatGroups);
  const [categories, setCategories] = useState(initialCategories);
  const [brands, setBrands] = useState(initialBrands);
  const [search_text, setSearchText] = useState(initialSearchText);
  const [min_price, setMinPrice] = useState(initialMinPrice);
  const [max_price, setMaxPrice] = useState(initialMaxPrice);
  const [location_id, setLocationId] = useState(initialLocationId);
  const [inhouse_product, setInhouseProduct] = useState(initialInhouseProduct);
  const [categoryName, setCategoryName] = useState("");
  const [categoryGroupName, setCategoryGroupName] = useState("");

  const getQuickOrderProductRecord = async (page = 1) => {
    try {
      setLoading(true);
      // alert(filters.delivery);
      const apiRes = await getQuickOrderProduct(
        filters.cat_groups,
        filters.categories,
        filters.brands,
        filters.search_text,
        filters.min_price,
        filters.max_price,
        filters.location_id,
        filters.inhouse_product,
        price_sort,
        filters.delivery,
        page        
      );

      const responseData = await apiRes.json();

      if (responseData.res) {
        const productList = responseData.data?.data || [];
        const total = responseData.data?.total || 0;

        setTotalRecord(total);

        const transformedData = productList.map((item) => {
          const noCredit = item.cash_and_carry_item === 1;
          const fastDeliveryTag = item.fast_delivery_tag === 1;
          const hasWarranty = item.is_warranty === 1;

          const rating = item.rating && item.rating !== 0 ? item.rating : 4;
          const totalRatings =
            Array.isArray(item.reviews) && item.reviews.length > 0
              ? item.reviews.length
              : 20;

          return {
            id: item.id,
            name: item.name,
            img: item.thumb_img?.file_name || no_image,
            oldPrice: item.mrp ? `₹${parseFloat(item.mrp).toFixed(2)}` : "₹0.00",
            newPrice: item.discount_price
              ? `₹${parseFloat(String(item.discount_price).replace(/₹/g, "")).toFixed(2)}`
              : "₹0.00",
            rating,
            totalRatings,
            sold: `${Math.floor(Math.random() * 50 + 1)}/${Math.floor(
              Math.random() * 200 + 50
            )}`,
            fastDeliveryTag,
            is_warranty: hasWarranty,
            noCredit,
            discount: item.discount ? `${item.discount}%` : "20%",
            user_id: user?.id || null,
            category_group: item.category_group?.name,
            category: item.category?.name,
            fast_delivery_tag: item.fast_delivery_tag,
            stocks: item.stocks,
            reviews: item.reviews,
          };
        });

        // ✅ IMPORTANT: append for page>1, replace for page=1
        setProducts((prev) => (page === 1 ? transformedData : [...prev, ...transformedData]));

        const computedTotalPages = Math.ceil(total / productsPerPage) || 1;
        setHasMore(page < computedTotalPages);
      }
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchText.toLowerCase())
  );

  const highlightText = (text) => {
    const lowerSearch = searchText.toLowerCase();
    return text.split(" ").map((word, i) => {
      const lowerWord = word.toLowerCase();
      if (lowerWord.includes(lowerSearch) && searchText !== "") {
        const start = lowerWord.indexOf(lowerSearch);
        const end = start + lowerSearch.length;

        return (
          <span key={i}>
            {word.slice(0, start)}
            <span className="highlight">{word.slice(start, end)}</span>
            {word.slice(end)}{" "}
          </span>
        );
      }
      return <span key={i}>{word} </span>;
    });
  };

  return (
    <div className="search-modal-backdrop">
      <div className="search-modal">
        {/* Results Section */}
        {searchText && (
          <div className="results-wrapper">
            {filteredProducts.length > 0 ? (
              <>
                <h2>Found {filteredProducts.length} Products</h2>
                <div className="results-container">
                  {filteredProducts.map((product) => (
                    <div className="result-item" key={product.id}>
                      <img src={product.img} alt={product.name} />
                      <div className="result-item-product-info">
                        <div className="product-info-lft">
                          <p>{highlightText(product.name)}</p>
                          <p className="price">
                            <del>₹{product.price}</del>{" "}
                            <span className="discount">
                              ₹{product.discountedPrice}
                            </span>
                          </p>
                        </div>
                        <button className="arrow-btn">
                          <FiChevronRight />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="no-results">No products found</div>
            )}
          </div>
        )}

        {/* Search Input Section */}
        <div className="search-input-wrapper">
          <input
            type="text"
            placeholder="Search for products, categories, or brands"
            value={searchText}
            onChange={onChange}
            autoFocus
          />
          <button
            className="close-btn"
            onClick={() => {
              onClear();
              onClose();
            }}
          >
            <FiX />
          </button>
        </div>
      </div>
    </div>
  );
};

export default SearchModal;
