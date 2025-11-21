import Header from "./Header";
import ProfileSidebar from "./ProfileSidebar";

const UserProfileLayout = ({ children }) => (
  <div className="user-profile-layout-wrapper">
    <Header />
    <div className="profile-layout-body">
      <ProfileSidebar />
      <main className="profile-main-content">
        <div className="profile-page-inner">{children}</div>
      </main>
    </div>
  </div>
);

export default UserProfileLayout;
