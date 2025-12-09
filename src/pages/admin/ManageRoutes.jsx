import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "../../api/axiosConfig"; // your configured axios
import { FaPlus, FaEdit, FaTrash, FaUndo } from "react-icons/fa";

/**
 * ManageRoutesPage
 * - Create / Edit Route
 * - Create Stop
 * - Add stop to route (with stopOrder, arrivalOffsetMinutes)
 * - View route stops inline
 * - Reverse route stops order on frontend & persist via PUT /routes/{id}/stops
 *
 * Style + behavior intentionally matches the ManageVehiclesPage you provided.
 */

/* -------------------- Small UI components -------------------- */


const Button = ({ children, className = "", ...props }) => (
    <button
        className={`inline-flex items-center gap-2 px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 ${className}`}
        {...props}
    >
        {children}
    </button>
);


/* -------------------- API helpers -------------------- */
const fetchRoutes = async () => (await axios.get("/routes")).data;
const fetchStops = async () => (await axios.get("/stop")).data;
const postRoute = async (payload) => (await axios.post("/routes", payload)).data;
const putRoute = async (id, payload) => (await axios.put(`/routes/${id}`, payload)).data;
const postStop = async (payload) => (await axios.post("/stop", payload)).data;
const postAddStopToRoute = async (routeId, payload) =>
    (await axios.post(`/routes/${routeId}/stops`, payload)).data;
// const putUpdateRouteStops = async (routeId, payload) =>
//     (await axios.put(`/routes/${routeId}/stops`, payload)).data;

/* -------------------- Main component -------------------- */
const ManageRoutesPage = () => {
    const qc = useQueryClient();

    // UI state
    const [routeModalOpen, setRouteModalOpen] = useState(false);
    const [stopModalOpen, setStopModalOpen] = useState(false);
    const [editingRoute, setEditingRoute] = useState(null);
    const [selectedRouteForStops, setSelectedRouteForStops] = useState(null);
    const [addingStopPayload, setAddingStopPayload] = useState({
        stopId: "",
        stopOrder: "",
        arrivalOffsetMinutes: "",
    });

    // form states for route & stop creation
    const [routeForm, setRouteForm] = useState({ name: "", transportMode: "BUS", active: true });
    const [stopForm, setStopForm] = useState({ name: "", latitude: "", longitude: "" });

    /* -------------------- Queries -------------------- */
    const { data: routes = [], isLoading: loadingRoutes } = useQuery({
        queryKey: ["routes"],
        queryFn: fetchRoutes,
        staleTime: 1000 * 60,
    });

    const { data: stops = [] } = useQuery({
        queryKey: ["stops"],
        queryFn: fetchStops,
    });

    /* -------------------- Mutations -------------------- */
    const createRouteMutation = useMutation({
        mutationFn: (payload) => postRoute(payload),
        onSuccess: () => {
            qc.invalidateQueries(["routes"]);
            setRouteModalOpen(false);
            setRouteForm({ name: "", transportMode: "BUS", active: true });
        },
    });

    const updateRouteMutation = useMutation({
        mutationFn: ({ id, payload }) => putRoute(id, payload),
        onSuccess: () => {
            qc.invalidateQueries(["routes"]);
            setRouteModalOpen(false);
            setEditingRoute(null);
        },
    });

    const createStopMutation = useMutation({
        mutationFn: (payload) => postStop(payload),
        onSuccess: () => {
            qc.invalidateQueries(["stops"]);
            setStopModalOpen(false);
            setStopForm({ name: "", latitude: "", longitude: "" });
        },
    });

    const addStopToRouteMutation = useMutation({
        mutationFn: ({ routeId, payload }) => postAddStopToRoute(routeId, payload),
        onSuccess: () => {
            qc.invalidateQueries(["routes"]);
            setAddingStopPayload({ stopId: "", stopOrder: "", arrivalOffsetMinutes: "" });
        },
    });

    const updateRouteStopsMutation = useMutation({
        mutationFn: ({ routeId, stopsArray }) => putUpdateRouteStops(routeId, stopsArray),
        onSuccess: () => qc.invalidateQueries(["routes"]),
    });

    const deleteRouteMutation = useMutation({
        mutationFn: (id) => axios.delete(`/routes/${id}`),
        onSuccess: () => qc.invalidateQueries(["routes"]),
    });

    /* -------------------- Handlers -------------------- */
    const openAddRoute = () => {
        setEditingRoute(null);
        setRouteForm({ name: "", transportMode: "BUS", active: true });
        setRouteModalOpen(true);
    };

    const openEditRoute = (route) => {
        setEditingRoute(route);
        setRouteForm({ name: route.name || "", transportMode: route.transportMode || "BUS", active: route.active ?? true });
        setRouteModalOpen(true);
    };

    const submitRouteForm = (e) => {
        e.preventDefault();
        const payload = {
            name: routeForm.name,
            transportMode: routeForm.transportMode,
            active: routeForm.active,
        };

        if (editingRoute?.id) {
            updateRouteMutation.mutate({ id: editingRoute.id, payload });
        } else {
            createRouteMutation.mutate(payload);
        }
    };

    const openAddStopModal = () => {
        setStopModalOpen(true);
        setStopForm({ name: "", latitude: "", longitude: "" });
    };

    const submitStopForm = (e) => {
        e.preventDefault();
        createStopMutation.mutate(stopForm);
    };

    const openAssignStopToRoute = (route) => {
        setSelectedRouteForStops(route);
        setAddingStopPayload({ stopId: "", stopOrder: route.stops?.length + 1 || 1, arrivalOffsetMinutes: "" });
    };

    const handleAddStopToRoute = () => {
        if (!selectedRouteForStops?.id) return;
        const payload = {
            stopId: Number(addingStopPayload.stopId),
            stopOrder: Number(addingStopPayload.stopOrder),
            arrivalOffsetMinutes: Number(addingStopPayload.arrivalOffsetMinutes || 0),
        };
        addStopToRouteMutation.mutate({ routeId: selectedRouteForStops.id, payload });
    };

    // const handleReverseStops = (route) => {
    //     // Build a new stops array reversed based on stopOrder or current order
    //     const currentStops = route.stops || [];
    //     // Map to a normalized array of { stopId, stopOrder, arrivalOffsetMinutes }
    //     const normalized = currentStops
    //         .slice()
    //         .sort((a, b) => (Number(a.stopOrder ?? 0) - Number(b.stopOrder ?? 0)))
    //         .map((rs) => ({
    //             stopId: rs.stopId ?? rs.id ?? (rs.stop && rs.stop.id),
    //             stopOrder: Number(rs.stopOrder ?? rs.order ?? 0),
    //             arrivalOffsetMinutes: Number(rs.arrivalOffsetMinutes ?? 0),
    //         }));

    //     // Reverse order numbers
    //     const reversed = normalized
    //         .slice()
    //         .reverse()
    //         .map((item, idx) => ({ ...item, stopOrder: idx + 1 }));

    //     // Persist via PUT /routes/{id}/stops
    //     updateRouteStopsMutation.mutate({ routeId: route.id, stopsArray: reversed });
    // };

    // const handleSaveStopsOrder = (route, editedStops) => {
    //     // editedStops: array of { stopId, stopOrder, arrivalOffsetMinutes }
    //     updateRouteStopsMutation.mutate({ routeId: route.id, stopsArray: editedStops });
    // };

    /* -------------------- Derived / Helpers -------------------- */
    // const stopsLookup = useMemo(() => {
    //     const map = new Map();
    //     (stops || []).forEach((s) => map.set(s.id, s));
    //     return map;
    // }, [stops]);

    /* -------------------- Render -------------------- */
    return (
        <div className="p-6">
            {/* HEADER */}
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Manage Routes</h1>

                <div className="flex items-center gap-3">
                    <Button onClick={openAddRoute}>
                        <FaPlus />
                        Add Route
                    </Button>

                    <button onClick={openAddStopModal} className="px-3 py-2 border rounded-md">
                        Add Stop
                    </button>
                </div>
            </div>

            {/* ROUTES TABLE */}
            {loadingRoutes ? (
                <p>Loading routes...</p>
            ) : (
                <div className="bg-white rounded-lg shadow-md p-4 overflow-x-auto">
                    <table className="w-full table-auto">
                        <thead>
                            <tr className="bg-gray-100 text-left">
                                <th className="p-3">Name</th>
                                <th className="p-3">Mode</th>
                                <th className="p-3">Active</th>
                                <th className="p-3">Stops</th>
                                <th className="p-3 text-right">Actions</th>
                            </tr>
                        </thead>

                        <tbody>
                            {routes.map((r) => (
                                <tr key={r.id} className="border-b hover:bg-gray-50 transition">
                                    <td className="p-3">{r.name}</td>
                                    <td className="p-3">{r.transportMode}</td>
                                    <td className="p-3">{r.active ? "Yes" : "No"}</td>

                                    <td className="p-3">
                                        <div className="max-w-lg">
                                            {(r.stops || [])
                                                .slice()
                                                .sort((a, b) => (Number(a.stopOrder ?? 0) - Number(b.stopOrder ?? 0)))
                                                .map((rs, idx) => {
                                                    const stopObj = rs.stop || {};
                                                    return (
                                                        <div key={idx} className="flex items-center gap-3 text-sm py-1">
                                                            <div className="w-6 text-gray-600">{rs.stopOrder}.</div>
                                                            <div className="flex-1">
                                                                <div className="font-medium">{stopObj.stopName ?? rs.stopName ?? "Stop"}</div>
                                                                <div className="text-xs text-gray-500">
                                                                    {stopObj.latitude ? `${stopObj.latitude}, ${stopObj.longitude}` : ""}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                })}

                                        </div>
                                    </td>

                                    <td className="p-3 text-right flex justify-end gap-3">
                                        <button
                                            onClick={() => openAssignStopToRoute(r)}
                                            className="px-3 py-1 border rounded-md"
                                        >
                                            Assign Stop
                                        </button>

                                        <button
                                            onClick={() => openEditRoute(r)}
                                            className="text-blue-600 hover:text-blue-800"
                                        >
                                            <FaEdit size={16} />
                                        </button>

                                        {/* <button
                                            onClick={() => handleReverseStops(r)}
                                            title="Reverse stops order"
                                            className="text-gray-700 hover:text-gray-900"
                                        >
                                            <FaUndo size={16} />
                                        </button> */}

                                        <button
                                            onClick={() => deleteRouteMutation.mutate(r.id)}
                                            className="text-red-600 hover:text-red-800"
                                        >
                                            <FaTrash size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))}

                            {routes.length === 0 && (
                                <tr>
                                    <td colSpan="5" className="text-center py-5 text-gray-500">
                                        No routes available
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}
            {/* -------------------- Route Modal (Add / Edit) -------------------- */}
            {routeModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg w-96 shadow-lg">
                        <h2 className="text-xl font-semibold mb-4">{editingRoute ? "Edit Route" : "Add Route"}</h2>

                        <form onSubmit={submitRouteForm} className="space-y-4">
                            <div>
                                <label className="block text-sm mb-1">Route Name</label>
                                <input
                                    required
                                    value={routeForm.name}
                                    onChange={(e) => setRouteForm({ ...routeForm, name: e.target.value })}
                                    className="w-full border px-3 py-2 rounded-md"
                                />
                            </div>

                            <div>
                                <label className="block text-sm mb-1">Transport Mode</label>
                                <select
                                    value={routeForm.transportMode}
                                    onChange={(e) => setRouteForm({ ...routeForm, transportMode: e.target.value })}
                                    className="w-full border px-3 py-2 rounded-md"
                                >
                                    <option value="BUS">BUS</option>
                                    <option value="TRAIN">TRAIN</option>
                                </select>
                            </div>

                            <div>
                                <label className="inline-flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        checked={routeForm.active}
                                        onChange={(e) => setRouteForm({ ...routeForm, active: e.target.checked })}
                                    />
                                    <span className="text-sm">Active</span>
                                </label>
                            </div>

                            <div className="flex justify-end gap-3 pt-3">
                                <button type="button" onClick={() => setRouteModalOpen(false)} className="px-4 py-2 rounded-md border">
                                    Cancel
                                </button>
                                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                                    {editingRoute ? "Save Changes" : "Add Route"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* -------------------- Stop Modal (Create Stop) -------------------- */}
            {stopModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg w-96 shadow-lg">
                        <h2 className="text-xl font-semibold mb-4">Add Stop</h2>
                        <form onSubmit={submitStopForm} className="space-y-4">
                            <div>
                                <label className="block text-sm mb-1">Stop Name</label>
                                <input
                                    required
                                    value={stopForm.name}
                                    onChange={(e) => setStopForm({ ...stopForm, name: e.target.value })}
                                    className="w-full border px-3 py-2 rounded-md"
                                />
                            </div>
                            <div>
                                <label className="block text-sm mb-1">Latitude</label>
                                <input
                                    required
                                    value={stopForm.latitude}
                                    onChange={(e) => setStopForm({ ...stopForm, latitude: e.target.value })}
                                    className="w-full border px-3 py-2 rounded-md"
                                />
                            </div>
                            <div>
                                <label className="block text-sm mb-1">Longitude</label>
                                <input
                                    required
                                    value={stopForm.longitude}
                                    onChange={(e) => setStopForm({ ...stopForm, longitude: e.target.value })}
                                    className="w-full border px-3 py-2 rounded-md"
                                />
                            </div>

                            <div className="flex justify-end gap-3 pt-3">
                                <button type="button" onClick={() => setStopModalOpen(false)} className="px-4 py-2 rounded-md border">
                                    Cancel
                                </button>
                                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                                    Add Stop
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* -------------------- Assign Stop to Route Panel -------------------- */}
            {selectedRouteForStops && (
                <div className="fixed bottom-6 right-6 z-50">
                    <div className="bg-white rounded-lg shadow-md p-4 w-96">
                        <div className="flex justify-between items-center mb-3">
                            <div>
                                <div className="font-semibold">{selectedRouteForStops.name}</div>
                                <div className="text-xs text-gray-500">Assign stop to this route</div>
                            </div>
                            <button onClick={() => setSelectedRouteForStops(null)} className="text-gray-500">Close</button>
                        </div>

                        <div className="mb-3">
                            <label className="block text-sm mb-1">Select Stop</label>
                            <select
                                value={addingStopPayload.stopId}
                                onChange={(e) => setAddingStopPayload({ ...addingStopPayload, stopId: e.target.value })}
                                className="w-full border px-3 py-2 rounded-md"
                            >
                                <option value="">Select stop</option>
                                {stops.map((s) => (
                                    <option key={s.id} value={s.id}>{s.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="mb-3">
                            <label className="block text-sm mb-1">Stop Order</label>
                            <input
                                type="number"
                                value={addingStopPayload.stopOrder}
                                onChange={(e) => setAddingStopPayload({ ...addingStopPayload, stopOrder: e.target.value })}
                                className="w-full border px-3 py-2 rounded-md"
                            />
                        </div>

                        <div className="mb-3">
                            <label className="block text-sm mb-1">Arrival Offset Minutes</label>
                            <input
                                type="number"
                                value={addingStopPayload.arrivalOffsetMinutes}
                                onChange={(e) => setAddingStopPayload({ ...addingStopPayload, arrivalOffsetMinutes: e.target.value })}
                                className="w-full border px-3 py-2 rounded-md"
                            />
                        </div>

                        <div className="flex justify-end gap-3">
                            <button onClick={() => setSelectedRouteForStops(null)} className="px-3 py-1 border rounded-md">Cancel</button>
                            <Button onClick={handleAddStopToRoute}>Add</Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManageRoutesPage;