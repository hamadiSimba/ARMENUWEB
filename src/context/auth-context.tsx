import React, { createContext, useState } from "react";
import useCustomNavigation from "../global/function/navigation";
import { ROLE } from "../lib/enum";

export type userType = {
  name: string;
  email: string;
  role: string;
};

type AuthContextType = {
  logoutUser: () => void;
  user: userType | null;
  loading: boolean;
  loginUnser: (values: { email: string; password: string }) => string | null;
  setLoading: (loading: boolean) => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export default AuthContext;

type AuthProviderProp = {
  children: React.ReactNode;
};

export const AuthProvider: React.FC<AuthProviderProp> = ({ children }) => {
  const { logout } = useCustomNavigation();
  const USER = "user";

  const [user, setUser] = useState<userType | null>(() => {
    const savedUser = localStorage.getItem(USER);
    return savedUser ? (JSON.parse(savedUser) as userType) : null;
  });
  const [loading, setLoading] = useState<boolean>(false);

  const loginUnser = (values: {
    email: string;
    password: string;
  }): string | null => {
    setLoading(true);

    if (values.password && values.email) {
      const data: userType = {
        name: "Admin Name",
        email: values.email,
        role: ROLE.ADMIN,
      };
      localStorage.setItem(USER, JSON.stringify(data));
      setUser(data);

      return "Login successful";
    }

    return null;
  };

  const logoutUser = () => {
    setUser(null);
    localStorage.removeItem(USER);
    logout();
  };

  const contextData = {
    user: user,
    loginUnser: loginUnser,
    logoutUser: logoutUser,
    loading: loading,
    setLoading: setLoading,
  };

  return (
    <AuthContext.Provider value={contextData}>{children}</AuthContext.Provider>
  );
};
