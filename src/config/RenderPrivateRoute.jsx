import { Navigate } from "react-router-dom";
import { useAuthStatus } from "../libs/hooks/useAuthToken";

function RenderPrivateRoute({ element: Component, ...rest }) {
  const { isAuthenticated } = useAuthStatus();


  if (!isAuthenticated) {
    return <Navigate to="/auth/id" replace />;
  }

  return <Component {...rest} />;
}

export default RenderPrivateRoute;
