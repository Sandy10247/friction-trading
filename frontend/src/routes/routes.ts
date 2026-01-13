import { createBrowserRouter } from "react-router";

import App from "../App";
import DashboardTabs from "../components/Dashboard";



const router = createBrowserRouter([
    {
        path: "/", Component: App, children: [
            { path: "profile", Component: DashboardTabs },
        ]

    },
]);

export default router;