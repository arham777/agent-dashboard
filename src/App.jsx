import { Suspense } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { PageLoader } from "./common/containers";
import { ScrollTop, RenderPublicRoute } from "./config";
import { PublicRoutes } from "./config/Routes";
import { PrivateRoutes } from "./config/Routes";
import { AuthProvider } from "./libs/hooks/useAuthToken";
import RenderPrivateRoute from "./config/RenderPrivateRoute";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./styling/app.css";

function App() {
  return (
    <AuthProvider>
      <Suspense fallback={<PageLoader />}>
        <Router>
          <ScrollTop />
          <Routes>
            {PublicRoutes.map((route) => (
              <Route
                key={route.key}
                path={route.path}
                element={<RenderPublicRoute element={route.component} />}
              />
            ))}
            {PrivateRoutes.map((route) => (
              <Route
                key={route.key}
                path={route.path}
                element={<RenderPrivateRoute element={route.component} />}
              />
            ))}
            <Route path="*" element={<h2>404: Not Found</h2>} />
          </Routes>
          <ToastContainer
            position="top-right"
            autoClose={5000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick={false}
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="light"
          />
        </Router>
      </Suspense>
    </AuthProvider>
  );
}

export default App;
