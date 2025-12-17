import { useQuery } from "@tanstack/react-query";
import api from "../../api/axiosConfig";
import { useAuth } from "../../context/AuthContext";

export default function MyBookingsPage() {
    const { user } = useAuth();

    const { data: tickets = [], isLoading } = useQuery({
        queryKey: ["myBookings"],
        queryFn: async () => {
            const res = await api.get(`/ticket/history/${user.id}`);
            return res.data;
        },
    });

    return (
        <div className="p-6">
            {/* HEADER */}
            <h1 className="text-2xl font-bold mb-6">My Bookings</h1>

            {/* LOADING */}
            {isLoading && <p>Loading your bookings...</p>}

            {/* EMPTY */}
            {!isLoading && tickets.length === 0 && (
                <p className="text-gray-500">You have no bookings yet.</p>
            )}

            {/* BOOKINGS LIST */}
            <div className="grid gap-4">
                {tickets.map((ticket) => (
                    <div
                        key={ticket.id}
                        className="bg-white rounded-lg shadow-md p-4 border"
                    >
                        {/* TOP ROW */}
                        <div className="flex justify-between items-center mb-2">
                            <h2 className="font-semibold text-lg">
                                {ticket.source} → {ticket.destination}
                            </h2>

                            <span
                                className={`px-3 py-1 rounded-full text-sm font-medium
                                    ${ticket.status === "BOOKED"
                                        ? "bg-green-100 text-green-700"
                                        : ticket.status === "CANCELLED"
                                            ? "bg-red-100 text-red-700"
                                            : "bg-gray-100 text-gray-700"
                                    }`}
                            >
                                {ticket.status}
                            </span>
                        </div>

                        {/* DETAILS */}
                        <div className="grid grid-cols-2 gap-3 text-sm text-gray-700">
                            <div>
                                <span className="font-medium">Date:</span>{" "}
                                {ticket.date}
                            </div>

                            <div>
                                <span className="font-medium">Passenger:</span>{" "}
                                {ticket.passengerName}
                            </div>

                            <div>
                                <span className="font-medium">Source:</span>{" "}
                                {ticket.source}
                            </div>

                            <div>
                                <span className="font-medium">Destination:</span>{" "}
                                {ticket.destination}
                            </div>

                            <div>
                                <span className="font-medium">Vehicle:</span>{" "}
                                {ticket.vehicleNo}
                            </div>

                            <div>
                                <span className="font-medium">Fare:</span> ₹
                                {ticket.fareAmount}
                            </div>
                        </div>

                        {/* FOOTER */}
                        <div className="mt-3 text-xs text-gray-500">
                            Booked at: {ticket.bookedAt}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}