import { createBrowserRouter, Navigate } from "react-router-dom";
import Home from "../views/Home";
import Layout from "../layout";
const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      {
        path: "/",
        // element: <Navigate to="/home" replace />,
        element: <Home />,
      },
      {
        path: "/home",
        element: <Home />,
      },
    ],
  },
]);

export default router;
