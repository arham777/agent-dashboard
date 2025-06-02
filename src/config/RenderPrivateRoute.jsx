import { Navigate } from "react-router-dom";
import { useAuthStatus } from "../libs/hooks/useAuthToken";

function RenderPrivateRoute({ element: Component, ...rest }) {
  const { isAuthenticated } = useAuthStatus();

  console.log("RenderPrivateRoute - isAuthenticated:", isAuthenticated);

  if (!isAuthenticated) {
    return <Navigate to="/auth/id" replace />;
  }

  return <Component {...rest} />;
}

export default RenderPrivateRoute;
