import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "../../api/axiosConfig";

import { FaPlus, FaEdit, FaTrash } from "react-icons/fa";

const ManageVehiclesPage = () => {
    const queryClient = useQueryClient();

    const [modalOpen, setModalOpen] = useState(false);
    const [editingVehicle, setEditingVehicle] = useState(null);

    // Fetch vehicles
    const { data: vehicles, isLoading } = useQuery({
        queryKey: ["vehicles"],
        queryFn: async () => {
            const res = await axios.get("/vehicles");
            return res.data;
        },
    });

    // Add / Edit Mutation
    const mutationSave = useMutation({
        mutationFn: async (vehicle) => {
            if (vehicle.id) {
                return axios.put(`/vehicles/${vehicle.id}`, vehicle);
            }
            return axios.post("/vehicles", vehicle);
        },
        onSuccess: () => {
            queryClient.invalidateQueries(["vehicles"]);
            setModalOpen(false);
            setEditingVehicle(null);
        },
    });

    // Delete mutation
    const mutationDelete = useMutation({
        mutationFn: (id) => axios.delete(`/vehicles/${id}`),
        onSuccess: () => queryClient.invalidateQueries(["vehicles"]),
    });

    const openAddModal = () => {
        setEditingVehicle(null);
        setModalOpen(true);
    };

    const openEditModal = (vehicle) => {
        setEditingVehicle(vehicle);
        setModalOpen(true);
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        const form = new FormData(e.target);

        const vehicleData = {
            id: editingVehicle?.id,
            vehicleNo: form.get("vehicleNo"),
            vehicleType: form.get("vehicleType"),
            capacity: form.get("capacity"),
            vehicleStatus: form.get("status")
        };

        mutationSave.mutate(vehicleData);
    };

    return (
        <div className="p-6">
            {/* HEADER */}
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Manage Vehicles</h1>

                <button
                    onClick={openAddModal}
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                >
                    <FaPlus />
                    Add Vehicle
                </button>
            </div>

            {/* TABLE */}
            {isLoading ? (
                <p>Loading vehicles...</p>
            ) : (
                <div className="bg-white rounded-lg shadow-md p-4 overflow-x-auto">
                    <table className="w-full table-auto">
                        <thead>
                            <tr className="bg-gray-100 text-left">
                                <th className="p-3">Vehicle No</th>
                                <th className="p-3">Type</th>
                                <th className="p-3">Capacity</th>
                                <th className="p-3">Status</th>
                                <th className="p-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {vehicles?.map((v) => (
                                <tr
                                    key={v.id}
                                    className="border-b hover:bg-gray-50 transition"
                                >
                                    <td className="p-3">{v.vehicleNo}</td>
                                    <td className="p-3">{v.vehicleType}</td>
                                    <td className="p-3">{v.capacity}</td>
                                    <td className="p-3">
                                        <span
                                            className={`px-3 py-1 text-sm rounded-full
                        ${v.vehicleStatus === "ACTIVE"
                                                    ? "bg-green-100 text-green-600"
                                                    : v.vehicleStatus === "IN_MAINTAINANCE"
                                                        ? "bg-blue-100 text-blue-600"
                                                        : "bg-red-100 text-red-600"
                                                } `}
                                        >
                                            {v.vehicleStatus}
                                        </span>
                                    </td>

                                    <td className="p-3 flex justify-end gap-3">
                                        <button
                                            className="text-blue-600 hover:text-blue-800"
                                            onClick={() => openEditModal(v)}
                                        >
                                            <FaEdit size={18} />
                                        </button>
                                        <button
                                            className="text-red-600 hover:text-red-800"
                                            onClick={() => mutationDelete.mutate(v.id)}
                                        >
                                            <FaTrash size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}

                            {vehicles?.length === 0 && (
                                <tr>
                                    <td colSpan="6" className="text-center py-5 text-gray-500">
                                        No vehicles available
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* MODAL */}
            {modalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                    <div className="bg-white p-6 rounded-lg w-96 shadow-lg">
                        <h2 className="text-xl font-semibold mb-4">
                            {editingVehicle ? "Edit Vehicle" : "Add Vehicle"}
                        </h2>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm mb-1">Vehicle Number</label>
                                <input
                                    name="vehicleNo"
                                    defaultValue={editingVehicle?.vehicleNo || ""}
                                    required
                                    className="w-full border px-3 py-2 rounded-md"
                                />
                            </div>

                            <div>
                                <label className="block text-sm mb-1">Vehicle Type</label>
                                <input
                                    name="vehicleType"
                                    defaultValue={editingVehicle?.vehicleType || ""}
                                    required
                                    className="w-full border px-3 py-2 rounded-md"
                                />
                            </div>

                            <div>
                                <label className="block text-sm mb-1">Capacity</label>
                                <input
                                    type="number"
                                    name="capacity"
                                    min="1"
                                    defaultValue={editingVehicle?.capacity || ""}
                                    required
                                    className="w-full border px-3 py-2 rounded-md"
                                />
                            </div>
                            <div>
                                <label className="block text-sm mb-1">Status</label>
                                <input
                                    type="string"
                                    name="Status"
                                    min="1"
                                    defaultValue={editingVehicle?.vehicleStatus || ""}
                                    required
                                    className="w-full border px-3 py-2 rounded-md"
                                />
                            </div>

                            {/* BUTTONS */}
                            <div className="flex justify-end gap-3 pt-3">
                                <button
                                    type="button"
                                    onClick={() => setModalOpen(false)}
                                    className="px-4 py-2 rounded-md border"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                                >
                                    {editingVehicle ? "Save Changes" : "Add Vehicle"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManageVehiclesPage;