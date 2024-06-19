import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import Authentication from "./pages/auth/auth";
import { useEffect } from "react";
import AdminPanel from "./pages/admin/admin-panel";
import PrivateRoute from "./private/private-route";
import { ROLE } from "./lib/enum";
import { AuthProvider } from "./context/auth-context";

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

const App = () => {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Authentication />} />
          <Route
            path="/admin-panel"
            element={
              <PrivateRoute role={ROLE.ADMIN}>
                <AdminPanel />
              </PrivateRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
