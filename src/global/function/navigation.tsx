import { useNavigate } from "react-router-dom";

const useCustomNavigation = () => {
  const navigate = useNavigate();

  const navigateAdminPanel = () => {
    navigate("/admin-panel", { replace: false });
  };

  const logout = () => {
    navigate("/", { replace: true });
  };

  return { navigateAdminPanel, logout };
};

export default useCustomNavigation;
