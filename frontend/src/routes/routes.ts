import { createBrowserRouter } from "react-router";

import App from "../App";
import ProfileComponent from "../components/Profile";


const router = createBrowserRouter([
    {
        path: "/", Component: App, children: [
            { path: "profile", Component: ProfileComponent }
        ]

    },
    // { path: "/profile", Component: ProfileComponent }
]);

export default router;