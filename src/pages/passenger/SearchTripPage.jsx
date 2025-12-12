import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../../api/axiosConfig";
import { useAuth } from "../../context/AuthContext";

//ui components
const Card = ({ children }) => (
    <div
        style={{
            border: "1px solid #ddd",
            padding: "16px",
            borderRadius: "10px",
            background: "white",
            marginBottom: "16px",
        }}
    >
        {children}
    </div>
);

export default function SearchTripPage() {
    const [form, setForm] = useState({
        source: "",
        destination: "",
        date: "",
    });

    const [searchParams, setSearchParams] = useState(null);
    const queryClient = useQueryClient();
    const auth = useAuth();

    // ---------------- TRIP SEARCH QUERY ----------------
    const { data: trips, isFetching } = useQuery({
        queryKey: ["searchTrips", searchParams],
        queryFn: async () => {
            if (!searchParams) return [];
            const { source, destination, date } = searchParams;

            const res = await api.get(
                `/trip/search?source=${source}&destination=${destination}&date=${date}`
            );
            return res.data;
        },
        enabled: !!searchParams,
    });

    // ----------------- BOOK TRIP MUTATION -----------------
    const bookMutation = useMutation({
        mutationFn: async (tripId) =>
            api.post("ticket/book", { tripId, userId: auth.user.id, }),
        onSuccess: () => alert("Booked successfully!"),
    });

    // ----------------- HANDLE FORM -----------------
    const handleSubmit = (e) => {
        e.preventDefault();
        setSearchParams(form);
    };

    return (
        <div style={{ padding: "20px" }}>
            <h1 style={{ marginBottom: "20px" }}>Search Trips</h1>

            {/* ----------------- SEARCH FORM ----------------- */}
            <form
                onSubmit={handleSubmit}
                style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr 1fr auto",
                    gap: "10px",
                    marginBottom: "20px",
                }}
            >
                <input
                    placeholder="Source"
                    required
                    value={form.source}
                    onChange={(e) => setForm({ ...form, source: e.target.value })}
                    style={{
                        padding: "10px",
                        border: "1px solid #ccc",
                        borderRadius: "6px",
                    }}
                />

                <input
                    placeholder="Destination"
                    required
                    value={form.destination}
                    onChange={(e) => setForm({ ...form, destination: e.target.value })}
                    style={{
                        padding: "10px",
                        border: "1px solid #ccc",
                        borderRadius: "6px",
                    }}
                />

                <input
                    type="date"
                    required
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                    style={{
                        padding: "10px",
                        border: "1px solid #ccc",
                        borderRadius: "6px",
                    }}
                />

                <button
                    type="submit"
                    style={{
                        padding: "10px 16px",
                        background: "#2563eb",
                        color: "white",
                        borderRadius: "6px",
                        border: "none",
                    }}
                >
                    Search
                </button>
            </form>

            {/* ----------------- SEARCH RESULTS ----------------- */}
            {isFetching && <p>Searching trips...</p>}

            {!isFetching && trips?.length === 0 && searchParams && (
                <p>No trips found for the given search.</p>
            )}

            {trips?.map((trip) => (
                <Card key={trip.id}>
                    <h2 style={{ marginBottom: "10px" }}>
                        {trip.routeName}{" "}
                        <span
                            style={{
                                padding: "4px 8px",
                                background: "#2563eb",
                                color: "white",
                                borderRadius: "6px",
                                fontSize: "12px",
                                marginLeft: "10px",
                            }}
                        >
                            {trip.isScheduled ? "Scheduled" : "Ad-hoc"}
                        </span>
                    </h2>

                    <div>
                        <b>From:</b> {trip.source}
                    </div>

                    <div>
                        <b>To:</b> {trip.destination}
                    </div>

                    <div>
                        <b>Date:</b> {trip.date}
                    </div>

                    <div>
                        <b>Start:</b> {trip.scheduledStart}
                    </div>

                    <div>
                        <b>End:</b> {trip.scheduledEnd}
                    </div>

                    <div style={{ marginTop: "10px" }}>
                        <b>Vehicle:</b> {trip.vehicleName}
                    </div>

                    {/* BOOK BUTTON */}
                    <button
                        onClick={() => bookMutation.mutate(trip.id)}
                        disabled={bookMutation.isPending}
                        style={{
                            marginTop: "15px",
                            background: "#059669",
                            color: "white",
                            padding: "10px 16px",
                            borderRadius: "6px",
                            border: "none",
                            cursor: "pointer",
                        }}
                    >
                        {bookMutation.isPending ? "Booking..." : "Book Trip"}
                    </button>
                </Card>
            ))}
        </div>
    );
}