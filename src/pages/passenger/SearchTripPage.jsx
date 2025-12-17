import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../../api/axiosConfig";
import { useAuth } from "../../context/AuthContext";

export default function SearchTripPage() {
    const auth = useAuth();
    const queryClient = useQueryClient();

    const [form, setForm] = useState({
        source: "",
        destination: "",
        date: "",
    });

    const [searchParams, setSearchParams] = useState(null);
    const [openTripId, setOpenTripId] = useState(null);
    const [selectedSeat, setSelectedSeat] = useState([]);

    /* ---------------- SEARCH TRIPS ---------------- */
    const { data: trips = [], isFetching } = useQuery({
        queryKey: ["searchTrips", searchParams],
        queryFn: async () => {
            const { source, destination, date } = searchParams;
            const res = await api.get(
                `/trip/search?source=${source}&destination=${destination}&date=${date}`
            );
            return res.data;
        },
        enabled: !!searchParams,
    });

    /* ---------------- FETCH SEATS ---------------- */
    const { data: seats = [], isLoading: seatsLoading } = useQuery({
        queryKey: ["seats", openTripId],
        queryFn: async () => {
            const res = await api.get(`/seats/trip/${openTripId}`);
            return res.data;
        },
        enabled: !!openTripId,
    });

    /* ---------------- BOOK SEAT ---------------- */
    const bookMutation = useMutation({
        mutationFn: async () =>
            api.post("/ticket/book", {
                tripId: openTripId,
                seatIds: selectedSeat,
                passengerId: auth.user.id,
                fareAmount: 100
            }),
        onSuccess: () => {
            alert("Ticket booked successfully!");
            setOpenTripId(null);
            setSelectedSeat([]);
            queryClient.invalidateQueries(["seats", openTripId]);
        },
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        setSearchParams(form);
    };
    const toggleSelected = (e, seat) => {
        if (!selectedSeat.includes(seat.id))
            setSelectedSeat([...selectedSeat, seat.id]);
        else
            setSelectedSeat(selectedSeat.filter(number => number !== seat.id));
    }


    return (
        <div className="p-6 max-w-6xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">Search Trips</h1>

            {/* ---------------- SEARCH FORM ---------------- */}
            <form
                onSubmit={handleSubmit}
                className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8"
            >
                <input
                    className="border rounded-md px-3 py-2"
                    placeholder="Source"
                    required
                    value={form.source}
                    onChange={(e) =>
                        setForm({ ...form, source: e.target.value })
                    }
                />
                <input
                    className="border rounded-md px-3 py-2"
                    placeholder="Destination"
                    required
                    value={form.destination}
                    onChange={(e) =>
                        setForm({ ...form, destination: e.target.value })
                    }
                />
                <input
                    type="date"
                    className="border rounded-md px-3 py-2"
                    required
                    value={form.date}
                    onChange={(e) =>
                        setForm({ ...form, date: e.target.value })
                    }
                />
                <button className="bg-blue-600 text-white rounded-md px-4 py-2 hover:bg-blue-700">
                    Search
                </button>
            </form>

            {isFetching && <p>Searching trips...</p>}
            {!isFetching && trips.length === 0 && searchParams && (
                <p className="text-gray-500">No trips found</p>
            )}

            {/* ---------------- TRIP LIST ---------------- */}
            <div className="space-y-4">
                {trips.map((trip) => (
                    <div
                        key={trip.id}
                        className="border rounded-lg p-4 bg-white shadow"
                    >
                        <div className="flex justify-between items-center">
                            <h2 className="text-lg font-semibold">
                                {trip.routeName}
                            </h2>
                            <span
                                className={`text-xs px-2 py-1 rounded-full
                                ${trip.isScheduled
                                        ? "bg-blue-100 text-blue-600"
                                        : "bg-green-100 text-green-600"
                                    }`}
                            >
                                {trip.isScheduled ? "Scheduled" : "Ad-hoc"}
                            </span>
                        </div>

                        <div className="mt-2 text-sm text-gray-700">
                            <p>
                                <b>From:</b> {trip.source}
                            </p>
                            <p>
                                <b>To:</b> {trip.destination}
                            </p>
                            <p>
                                <b>Date:</b> {trip.date}
                            </p>
                            <p>
                                <b>Time:</b> {trip.scheduledStart} -{" "}
                                {trip.scheduledEnd}
                            </p>
                            <p>
                                <b>Vehicle:</b> {trip.vehicleNo}
                            </p>
                        </div>

                        <button
                            onClick={() => {
                                setOpenTripId(trip.id);
                                setSelectedSeat([]);
                            }}
                            className="mt-4 bg-emerald-600 text-white px-4 py-2 rounded-md hover:bg-emerald-700"
                        >
                            Book Trip
                        </button>
                    </div>
                ))}
            </div>

            {/* ---------------- SEAT DIALOG ---------------- */}
            {openTripId && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-[420px]">
                        <h2 className="text-xl font-semibold mb-4">
                            Select Seat
                        </h2>

                        {seatsLoading && <p>Loading seats...</p>}

                        <div className="grid grid-cols-3  gap-2">
                            {seats.sort((a, b) => a.seatNumber - b.seatNumber).map((seat) => {
                                const isBooked =
                                    seat.status === "BOOKED";
                                const isSelected =
                                    selectedSeat.includes(seat.id);

                                return (
                                    <button
                                        key={seat.id}
                                        disabled={isBooked}
                                        onClick={(e) => toggleSelected(e, seat)}
                                        className={`
                                            px-2 py-2 w-24 rounded-md border text-sm
                                            ${isBooked
                                                ? "bg-gray-200 cursor-not-allowed"
                                                : isSelected
                                                    ? "bg-blue-600 text-white"
                                                    : "bg-white hover:bg-blue-50"
                                            }
                                        `}
                                    >
                                        {seat.seatNumber}
                                    </button>
                                );
                            })}
                        </div>

                        <div className="flex justify-end gap-3 mt-6">
                            <button
                                onClick={() => setOpenTripId(null)}
                                className="px-4 py-2 border rounded-md"
                            >
                                Cancel
                            </button>

                            <button
                                disabled={!selectedSeat || bookMutation.isPending}
                                onClick={() => bookMutation.mutate()}
                                className={`px-4 py-2 rounded-md text-white
                                    ${selectedSeat
                                        ? "bg-emerald-600 hover:bg-emerald-700"
                                        : "bg-gray-400 cursor-not-allowed"
                                    }
                                `}
                            >
                                {bookMutation.isPending
                                    ? "Booking..."
                                    : "Confirm Booking"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}