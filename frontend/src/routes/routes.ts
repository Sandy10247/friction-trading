import { createBrowserRouter } from "react-router";

import App from "../App";
import ProfileComponent from "../components/Profile";
import PositionsComponent from "../components/Positions";


const router = createBrowserRouter([
    {
        path: "/", Component: App, children: [
            { path: "profile", Component: ProfileComponent },
            { path: "positions", Component: PositionsComponent }
        ]

    },
    // { path: "/profile", Component: ProfileComponent }
]);

export default router;