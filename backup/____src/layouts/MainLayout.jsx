import Header from "./Header";
import Footer from "./Footer";

const MainLayout = ({ children }) => (
  <div className="layout-wrapper">
    <Header />
    <main className="content">{children}</main>
    <Footer />
  </div>
);

export default MainLayout;
