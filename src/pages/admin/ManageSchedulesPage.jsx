import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../../api/axiosConfig";

// ------------------- Simple Custom Components -----------------------
function Card({ children }) {
    return <div style={{
        border: "1px solid #ddd",
        padding: "16px",
        borderRadius: "10px",
        marginBottom: "16px",
        background: "white"
    }}>{children}</div>;
}

function Button({ children, ...props }) {
    return (
        <button
            {...props}
            style={{
                padding: "8px 14px",
                borderRadius: "6px",
                border: "none",
                background: "#2563eb",
                color: "white",
                cursor: "pointer",
                marginRight: "10px"
            }}
        >
            {children}
        </button>
    );
}

function Input({ label, ...props }) {
    return (
        <div style={{ marginBottom: "12px" }}>
            <label>{label}</label>
            <input
                {...props}
                style={{
                    width: "100%",
                    padding: "8px",
                    marginTop: "4px",
                    borderRadius: "6px",
                    border: "1px solid #ccc",
                }}
            />
        </div>
    );
}

// --------------------------------------------------------------------

export default function ManageSchedulesPage() {
    const queryClient = useQueryClient();

    const [selectedRoute, setSelectedRoute] = useState("");
    const [newSchedule, setNewSchedule] = useState({
        departureTime: "",
        arrivalTime: "",
        dayOfWeek: "MONDAY"
    });
    const [selectedDay, setSelectedDay] = useState("MONDAY");

    const days = [
        "MONDAY",
        "TUESDAY",
        "WEDNESDAY",
        "THURSDAY",
        "FRIDAY",
        "SATURDAY",
        "SUNDAY"
    ]

    // ######## Fetch routes #############
    const { data: routes } = useQuery({
        queryKey: ["routes"],
        queryFn: async () => {
            const res = await api.get("/routes");
            return res.data;
        },
    });

    // ######## Fetch schedules for selected route #############
    const { data: schedules, refetch } = useQuery({
        queryKey: ["schedules", selectedRoute],
        enabled: !!selectedRoute,
        queryFn: async () => {
            const res = await api.get(`/schedule/${selectedRoute}`);
            return res.data;
        },
    });

    // ######## Create Schedule Mutation #############
    const createScheduleMutation = useMutation({
        mutationFn: async () => {
            const res = await api.post(`/schedule/${selectedRoute}`, newSchedule);
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(["schedules", selectedRoute]);
            setNewSchedule({ departureTime: "", arrivalTime: "" });
        }
    });

    return (
        <div style={{ padding: "20px" }}>
            <h1 style={{ fontSize: "22px", marginBottom: "20px" }}>Manage Schedules</h1>

            {/* ----------------- Select Route ----------------- */}
            <Card>
                <h2>Select Route</h2>
                <select
                    value={selectedRoute}
                    onChange={(e) => setSelectedRoute(e.target.value)}
                    style={{
                        padding: "8px",
                        marginTop: "10px",
                        borderRadius: "6px",
                        border: "1px solid #ccc",
                    }}
                >
                    <option value="">-- Select Route --</option>
                    {routes?.map((r) => (
                        <option key={r.id} value={r.id}>{r.name}</option>
                    ))}
                </select>
            </Card>

            {/* Only show schedules section if route selected */}
            {selectedRoute && (
                <>
                    {/* ----------------- Add Schedule Form ----------------- */}
                    <Card>
                        <h2>Create Schedule</h2>

                        <Input
                            label="Departure Time"
                            type="time"
                            value={newSchedule.departureTime}
                            onChange={(e) =>
                                setNewSchedule({ ...newSchedule, departureTime: e.target.value })
                            }
                        />

                        <Input
                            label="Arrival Time"
                            type="time"
                            value={newSchedule.arrivalTime}
                            onChange={(e) =>
                                setNewSchedule({ ...newSchedule, arrivalTime: e.target.value })
                            }
                        />
                        <select

                            onChange={(e) => {
                                setNewSchedule({ ...newSchedule, dayOfWeek: e.target.value })
                            }
                            }
                            style={{
                                padding: "8px",
                                margin: "10px 0 ",
                                borderRadius: "6px",
                                border: "1px solid #ccc",
                                width: "100%",
                            }}
                        >
                            <option value="">-- Select Day --</option>
                            {days?.map((day, idx) => (
                                <option key={idx} value={idx}>{day}</option>
                            ))}
                        </select>

                        <Button
                            onClick={() => {
                                if (!newSchedule.departureTime || !newSchedule.arrivalTime) {
                                    alert("Please fill all fields");
                                    return;
                                }
                                createScheduleMutation.mutate();
                            }}
                        >
                            Add Schedule
                        </Button>
                    </Card>

                    {/* ----------------- List of Schedules ----------------- */}
                    <Card>
                        <h2 className="mb-5 text-2xl font-bold">Schedules</h2>

                        {!schedules?.length && <p>No schedules found.</p>}

                        {schedules?.map((s) => (
                            <div
                                key={s.id}
                                style={{
                                    padding: "10px",
                                    border: "1px solid #eee",
                                    borderRadius: "6px",
                                    marginBottom: "10px",
                                }}
                            >

                                <b>Route:</b> {s.routeName} <br />
                                <b>Departure:</b> {s.departureTime} <br />
                                <b>Arrival:</b> {s.arrivalTime}<br />
                                <b>Day:</b> {s.dayOfWeek}

                            </div>
                        ))}
                    </Card>
                </>
            )
            }
        </div >
    );
}