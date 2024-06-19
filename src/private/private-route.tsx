import React, { useContext } from "react";
import AuthContext from "../context/auth-context";
import { Navigate } from "react-router-dom";
import { ROLE } from "../lib/enum";

type PrivateRouteProps = {
  children: React.ReactNode;
  role: ROLE;
};

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children, role }) => {
  const authContext = useContext(AuthContext);

  if (!authContext) {
    throw new Error("AuthContext is not defined");
  }

  const { user } = authContext;

  if (!user) {
    return <Navigate to={"/"} />;
  }

  if (user.role !== role) {
    return user.role === ROLE.ADMIN ? (
      <Navigate to={"/admin-panel"} />
    ) : (
      <Navigate to={"/"} />
    );
  }

  return <>{children}</>;
};

export default PrivateRoute;
