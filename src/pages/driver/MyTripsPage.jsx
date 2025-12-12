import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../../api/axiosConfig";
import { useState } from "react";
import { useAuth } from "../../context/AuthContext";

// ------------------- Simple Custom Components -----------------------
function Card({ children }) {
    return (
        <div
            style={{
                border: "1px solid #ddd",
                padding: "16px",
                borderRadius: "10px",
                marginBottom: "16px",
                background: "white",
            }}
        >
            {children}
        </div>
    );
}

function Tag({ type }) {
    const colors = {
        SCHEDULED: "#2563eb",
        ONGOING: "#fb923c",
        ACTIVE: "#16a34a",
        COMPLETED: "#6b7280",
        CANCELLED: "#dc2626",
    };

    return (
        <span
            style={{
                padding: "4px 8px",
                borderRadius: "6px",
                background: colors[type] || "#6b7280",
                color: "white",
                fontSize: "12px",
                marginLeft: "10px",
            }}
        >
            {type}
        </span>
    );
}
// --------------------------------------------------------------------

export default function MyTripsPage() {
    const [statusFilter, setStatusFilter] = useState("ALL");
    const queryClient = useQueryClient();
    const auth = useAuth();

    // ################# Fetch Driver Trips #################
    const { data: trips } = useQuery({
        queryKey: ["myTrips"],
        queryFn: async () => {
            const res = await api.get(`/trip/driver/${auth.user.id}`); // endpoint
            return res.data;
        },
    });

    // ################# Start Trip Mutation #################
    const startTripMutation = useMutation({
        mutationFn: (tripId) => api.put(`/trip/${tripId}/start`),
        onSuccess: () => queryClient.invalidateQueries(["myTrips"]),
    });

    // ################# End Trip Mutation #################
    const endTripMutation = useMutation({
        mutationFn: (tripId) => api.put(`/trip/${tripId}/end`),
        onSuccess: () => queryClient.invalidateQueries(["myTrips"]),
    });

    // ==================== Filtering ====================
    const filteredTrips =
        statusFilter === "ALL"
            ? trips
            : trips?.filter((t) => t.status === statusFilter);

    return (
        <div style={{ padding: "20px" }}>
            <h1 style={{ fontSize: "22px", marginBottom: "20px" }}>My Trips</h1>

            {/* ----------------- Filter ----------------- */}
            <div style={{ marginBottom: "20px" }}>
                <label>Status Filter: </label>
                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    style={{
                        padding: "8px",
                        borderRadius: "6px",
                        border: "1px solid #ccc",
                        marginLeft: "10px",
                    }}
                >
                    <option value="ALL">All</option>
                    <option value="SCHEDULED">Scheduled</option>
                    <option value="ONGOING">Ongoing</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="CANCELLED">Cancelled</option>
                </select>
            </div>

            {/* ----------------- Trip List ----------------- */}
            {!filteredTrips?.length && <p>No trips found.</p>}

            {filteredTrips?.map((trip) => (
                <Card key={trip.id}>
                    <h2 style={{ marginBottom: "8px" }}>
                        {trip.routeName} <Tag type={trip.status} />
                    </h2>

                    <div style={{ marginBottom: "6px" }}>
                        <b>From:</b> {trip.source}
                    </div>

                    <div style={{ marginBottom: "6px" }}>
                        <b>To:</b> {trip.destination}
                    </div>

                    <div style={{ marginBottom: "6px" }}>
                        <b>Date:</b> {trip.date}
                    </div>

                    {trip.isScheduled ? (
                        <>
                            <div>
                                <b>Schedule Type:</b> Regular Schedule
                            </div>
                            <div>
                                <b>Departure:</b> {trip.scheduledStart}
                            </div>
                            <div>
                                <b>Arrival:</b> {trip.scheduledEnd}
                            </div>
                        </>
                    ) : (
                        <>
                            <div>
                                <b>Schedule Type:</b> Ad-Hoc Trip
                            </div>
                            <div>
                                <b>Start:</b> {trip.scheduledStart}
                            </div>
                            <div>
                                <b>End:</b> {trip.scheduledEnd}
                            </div>
                        </>
                    )}

                    <div style={{ marginTop: "10px" }}>
                        <b>Vehicle:</b> {trip.vehicleName}
                    </div>

                    {/* -------- ACTION BUTTONS (Start / End Trip) -------- */}
                    <div style={{ marginTop: "15px" }}>
                        {trip.status === "SCHEDULED" && (
                            <button
                                onClick={() => startTripMutation.mutate(trip.id)}
                                disabled={startTripMutation.isPending}
                                style={{
                                    padding: "10px 14px",
                                    background: "#2563eb",
                                    color: "white",
                                    borderRadius: "6px",
                                    border: "none",
                                    cursor: "pointer",
                                }}
                            >
                                {startTripMutation.isPending ? "Starting..." : "Start Trip"}
                            </button>
                        )}

                        {trip.status === "ONGOING" && (
                            <button
                                onClick={() => endTripMutation.mutate(trip.id)}
                                disabled={endTripMutation.isPending}
                                style={{
                                    padding: "10px 14px",
                                    background: "#dc2626",
                                    color: "white",
                                    borderRadius: "6px",
                                    border: "none",
                                    cursor: "pointer",
                                }}
                            >
                                {endTripMutation.isPending ? "Ending..." : "End Trip"}
                            </button>
                        )}
                    </div>
                </Card>
            ))}
        </div>
    );
}