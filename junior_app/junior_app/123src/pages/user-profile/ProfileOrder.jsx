import React from "react";
import UserProfileLayout from "../../layouts/UserProfileLayout";
import OrderTable from "../../components/user-profile/OrderTable";

const ProfileOrder = () => {
  return (
    <UserProfileLayout>
      <div>
        <OrderTable />
      </div>
    </UserProfileLayout>
  );
};

export default ProfileOrder;
