import { createBrowserRouter } from "react-router";

import App from "../App";
import DashboardTabs from "../components/DashboardTabs";



const router = createBrowserRouter([
    {
        path: "/", Component: App, children: [
            { path: "profile", Component: DashboardTabs },
        ]

    },
]);

export default router;