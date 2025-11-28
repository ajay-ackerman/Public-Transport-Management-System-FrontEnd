import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";

const Sidebar = () => {
    const { user } = useAuth();

    const menus = {
        ADMIN: [
            { label: "Dashboard", path: "/admin" },
            { label: "Vehicles", path: "/admin/vehicles" },
            { label: "Drivers", path: "/admin/drivers" },
            { label: "Trips", path: "/admin/trips" },
            { label: "Schedules", path: "/admin/schedules" },
        ],
        DRIVER: [
            { label: "Dashboard", path: "/driver" },
            { label: "My Trips", path: "/driver/trips" },
            { label: "Start Trip", path: "/driver/start" },
        ],
        PASSENGER: [
            { label: "Dashboard", path: "/passenger" },
            { label: "Search Trips", path: "/passenger/search" },
            { label: "My Bookings", path: "/passenger/bookings" },
        ],
    };

    return (
        <aside>
            {menus[user.role]?.map((item) => (
                <Link key={item.path} to={item.path}>{item.label}</Link>
            ))}
        </aside>
    );
};

export default Sidebar;