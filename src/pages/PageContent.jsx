import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import bannerBg from "../assets/images/innerBanner.jpg";
import { pageContent } from "../api/apiRequest";

const PageContent = ({ pageSlug }) => {
  const { slug: routeSlug } = useParams();
  const slug = pageSlug || routeSlug;
  const pageClassSlug = (slug || "")
    .toString()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  const [page, setPage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    const loadPage = async () => {
      setLoading(true);
      setError("");
      try {
        const response = await pageContent(slug);
        if (active) setPage(response?.data ?? null);
      } catch (requestError) {
        if (active) {
          setPage(null);
          setError(requestError?.message || "Unable to load page.");
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    loadPage();

    return () => {
      active = false;
    };
  }, [slug]);

  const bannerStyle = {
    backgroundImage: `url(${bannerBg})`,
    backgroundSize: "cover",
    backgroundPosition: "center",
    borderRadius: "0",
    padding: "40px",
    color: "#fff",
    position: "relative",
    overflow: "hidden",
  };

  return (
    <MainLayout>
      <section className="InnerBannerScetion" style={bannerStyle}>
        <div className="maincontainer">
          <h5>{page?.title || "Page"}</h5>
        </div>
      </section>

      <section className="aboutBody">
        <div className="maincontainer">
          {loading && <div className="loader">Loading page…</div>}
          {!loading && error && <div className="Nofound">{error}</div>}
          {!loading && !error && page && (
            <div
              className={`page-content-html ${
                pageClassSlug ? `page-content-${pageClassSlug}` : ""
              }`}
              dangerouslySetInnerHTML={{ __html: page.content || "" }}
            />
          )}
        </div>
      </section>
    </MainLayout>
  );
};

export default PageContent;
