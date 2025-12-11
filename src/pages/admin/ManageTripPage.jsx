import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../../api/axiosConfig";
import { FaEdit } from "react-icons/fa";

// --------------------------------------
// Reusable Components
// --------------------------------------
const Input = ({ label, ...props }) => (
    <div className="flex flex-col gap-1 mb-3">
        <label className="font-medium">{label}</label>
        <input
            {...props}
            className="border p-2 rounded w-full"
        />
    </div>
);

const Select = ({ label, children, ...props }) => (
    <div className="flex flex-col gap-1 mb-3">
        <label className="font-medium">{label}</label>
        <select {...props} className="border p-2 rounded w-full">
            {children}
        </select>
    </div>
);

const Card = ({ children }) => (
    <div className="border rounded p-4 shadow-sm bg-white mb-4">{children}</div>
);

// --------------------------------------
// API Calls
// --------------------------------------

const fetchTrips = async () => (await api.get("/trip")).data;
const fetchDrivers = async () => (await api.get("/users/drivers")).data;
const fetchVehicles = async () => (await api.get("/vehicles")).data;
const fetchRoutes = async () => (await api.get("/routes")).data;
const fetchSchedules = async () => (await api.get("/schedule")).data;

const createTrip = async (payload) =>
    (await api.post("/trip", payload)).data;

// --------------------------------------
// Main Component
// --------------------------------------
export default function ManageTrips() {

    const [tab, setTab] = useState("list");
    const [isScheduled, setIsScheduled] = useState(false);

    // Form State
    const [form, setForm] = useState({
        vehicleId: "",
        driverId: "",
        isScheduled: false,
        scheduleId: "",
        source: "",
        destination: "",
        tripDate: "",
        scheduledStart: "",
        scheduledEnd: "",
        routeId: "",
    });

    const handleChange = (key, val) => {
        setForm({ ...form, [key]: val });
    };

    const qc = useQueryClient();

    // Queries
    const tripsQuery = useQuery({ queryKey: ["trips"], queryFn: fetchTrips });
    const driversQuery = useQuery({ queryKey: ["drivers"], queryFn: fetchDrivers });
    const vehiclesQuery = useQuery({ queryKey: ["vehicles"], queryFn: fetchVehicles });
    const routesQuery = useQuery({ queryKey: ["routes"], queryFn: fetchRoutes });
    const schedulesQuery = useQuery({ queryKey: ["schedules"], queryFn: fetchSchedules });

    // Mutation
    const mutation = useMutation({
        mutationFn: createTrip,
        onSuccess: () => {
            qc.invalidateQueries(["trips"]);
            alert("Trip created!");
            setTab("list");
        }
    });

    const handleSubmit = () => {
        const payload = {
            ...form,
            isScheduled,
            scheduleId: isScheduled ? Number(form.scheduleId) : null,
            routeId: !isScheduled ? Number(form.routeId) : null,
            vehicleId: Number(form.vehicleId),
            driverId: Number(form.driverId),
            tripDate: form.tripDate,
            scheduledStart: isScheduled ? null : form.scheduledStart,
            scheduledEnd: isScheduled ? null : form.scheduledEnd,
        };
        mutation.mutate(payload);
    };

    // Auto-fill route + schedule times
    const selectedSchedule = schedulesQuery.data?.find(s => s.id == form.scheduleId);

    return (
        <div className="p-6 w-full mx-auto">

            {/* TABS */}
            <div className="flex justify-between gap-16 items-center mb-6">
                <h1 className="text-2xl font-bold">Manage Trip</h1>
                <div className="flex items-center gap-3">
                    <button
                        className={`px-4 py-2 rounded ${tab === "list" ? "bg-blue-600 text-white" : "bg-gray-200"}`}
                        onClick={() => setTab("list")}
                    >
                        All Trips
                    </button>

                    <button
                        className={`px-4 py-2 rounded ${tab === "create" ? "bg-blue-600 text-white" : "bg-gray-200"}`}
                        onClick={() => setTab("create")}
                    >
                        Create Trip
                    </button>
                </div>
            </div>

            {/* LIST TRIPS */}
            {
                tab === "list" && (
                    <div>
                        <h2 className="text-xl font-bold mb-3">Trips</h2>
                        {tripsQuery.data?.map(trip => (
                            <Card key={trip.id}>
                                <div className="flex flex-col items-start">
                                    <span><b>ID:</b> {trip.id}</span>
                                    <span><b>Route:</b> {trip.routeName}</span>
                                    <span><b>Driver:</b> {trip.driverName}</span>
                                    <span><b>Vehicle:</b> {trip.vehicleNo}</span>
                                    <span><b>Date:</b> {trip.tripDate}</span>
                                    <span><b>Scheduled Start:</b> {trip.scheduledStart}</span>
                                    <span><b>Scheduled End:</b> {trip.scheduledEnd}</span>
                                    <span><b>Scheduled:</b> {trip.isScheduled ? "YES" : "NO"}</span>
                                </div>
                                <button
                                    onClick={() => { }}
                                    className="text-blue-600 hover:text-blue-800 right-2"
                                >
                                    <FaEdit size={16} />
                                </button>
                            </Card>
                        ))}
                    </div>
                )
            }

            {/* CREATE TRIP */}
            {
                tab === "create" && (
                    <Card>
                        <h2 className="text-xl font-bold mb-4">Create Trip</h2>

                        <Select
                            label="Vehicle"
                            value={form.vehicleId}
                            onChange={e => handleChange("vehicleId", e.target.value)}
                        >
                            <option value="">Select Vehicle</option>
                            {vehiclesQuery.data?.map(v => (
                                <option key={v.id} value={v.id}>{v.vehicleNo}</option>
                            ))}
                        </Select>

                        <Select
                            label="Driver"
                            value={form.driverId}
                            onChange={e => handleChange("driverId", e.target.value)}
                        >
                            <option value="">Select Driver</option>
                            {driversQuery.data?.map(d => (
                                <option key={d.id} value={d.id}>{d.name}</option>
                            ))}
                        </Select>

                        <div className="mb-3">
                            <label className="font-medium">Is Scheduled?</label>
                            <input
                                type="checkbox"
                                className="ml-2"
                                checked={isScheduled}
                                onChange={() => setIsScheduled(!isScheduled)}
                            />
                        </div>

                        {/* If Scheduled */}
                        {isScheduled && (
                            <>
                                <Select
                                    label="Schedule"
                                    value={form.scheduleId}
                                    onChange={e => handleChange("scheduleId", e.target.value)}
                                >
                                    <option value="">Select Schedule</option>
                                    {schedulesQuery.data?.map(s => (
                                        <option key={s.id} value={s.id}>
                                            {s.routeName} — {s.departureTime}
                                        </option>
                                    ))}
                                </Select>

                                {selectedSchedule && (
                                    <>
                                        <Input label="Route (Auto)" value={selectedSchedule.routeName} disabled />
                                        <Input label="Departure (Auto)" value={selectedSchedule.departureTime} disabled />
                                        <Input label="Arrival (Auto)" value={selectedSchedule.arrivalTime} disabled />
                                    </>
                                )}
                            </>
                        )}

                        {/* If NOT scheduled (Ad-Hoc Trip) */}
                        {!isScheduled && (
                            <>
                                <Select
                                    label="Route"
                                    value={form.routeId}
                                    onChange={e => handleChange("routeId", e.target.value)}
                                >
                                    <option value="">Select Route</option>
                                    {routesQuery.data?.map(r => (
                                        <option key={r.id} value={r.id}>{r.name}</option>
                                    ))}
                                </Select>

                                <Input
                                    label="Start Time"
                                    type="time"
                                    value={form.scheduledStart}
                                    onChange={e => handleChange("scheduledStart", e.target.value)}
                                />

                                <Input
                                    label="End Time"
                                    type="time"
                                    value={form.scheduledEnd}
                                    onChange={e => handleChange("scheduledEnd", e.target.value)}
                                />
                            </>
                        )}

                        <Input
                            label="Source"
                            value={form.source}
                            onChange={e => handleChange("source", e.target.value)}
                        />

                        <Input
                            label="Destination"
                            value={form.destination}
                            onChange={e => handleChange("destination", e.target.value)}
                        />

                        <Input
                            label="Trip Date"
                            type="date"
                            value={form.tripDate}
                            onChange={e => handleChange("tripDate", e.target.value)}
                        />

                        <button
                            onClick={handleSubmit}
                            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded"
                        >
                            Create Trip
                        </button>

                    </Card>
                )
            }
        </div >
    );
}