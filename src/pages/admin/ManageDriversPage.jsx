import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "../../api/axiosConfig";
import { FaPlus, FaEdit, FaTrash } from "react-icons/fa";

const ManageDriversPage = () => {
  const queryClient = useQueryClient();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingDriver, setEditingDriver] = useState(null);

  // Fetch all drivers
  const { data: drivers, isLoading } = useQuery({
    queryKey: ["drivers"],
    queryFn: async () => {
      const res = await axios.get("/users/drivers");
      return res.data;
    },
  });

  // Add or Edit Driver
  const saveMutation = useMutation({
    mutationFn: async (driver) => {
      if (driver.id) {
        return axios.put(`/users/${driver.id}`, driver);
      }
      return axios.post(`/users/register-driver`, driver);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["drivers"]);
      setModalOpen(false);
      setEditingDriver(null);
    },
  });

  // Delete driver
  const deleteMutation = useMutation({
    mutationFn: (id) => axios.delete(`/users/${id}`),
    onSuccess: () => queryClient.invalidateQueries(["drivers"]),
  });

  const openAddModal = () => {
    setEditingDriver(null);
    setModalOpen(true);
  };

  const openEditModal = (driver) => {
    setEditingDriver(driver);
    setModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const form = new FormData(e.target);

    const driverData = {
      id: editingDriver?.id,
      name: form.get("name"),
      email: form.get("email"),
      phone: form.get("phone"),
      password: editingDriver ? undefined : form.get("password"), // only for new driver
      role: "DRIVER",
    };

    saveMutation.mutate(driverData);
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Manage Drivers</h1>

        <button
          onClick={openAddModal}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          <FaPlus />
          Add Driver
        </button>
      </div>

      {/* Table */}
      {isLoading ? (
        <p>Loading drivers...</p>
      ) : (
        <div className="bg-white rounded-lg shadow p-4 overflow-x-auto">
          <table className="w-full table-auto">
            <thead>
              <tr className="bg-gray-100 text-left">
                <th className="p-3">Name</th>
                <th className="p-3">Email</th>
                <th className="p-3">Phone</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {drivers?.map((d) => (
                <tr key={d.id} className="border-b hover:bg-gray-50">
                  <td className="p-3">{d.name}</td>
                  <td className="p-3">{d.email}</td>
                  <td className="p-3">{d.phone}</td>

                  <td className="p-3">
                    <span
                      className={`px-3 py-1 text-sm rounded-full 
                        ${
                          d.active
                            ? "bg-green-100 text-green-600"
                            : "bg-red-100 text-red-600"
                        }`}
                    >
                      {d.active ? "ACTIVE" : "INACTIVE"}
                    </span>
                  </td>

                  <td className="p-3 flex justify-end gap-3">
                    <button
                      className="text-blue-600 hover:text-blue-800"
                      onClick={() => openEditModal(d)}
                    >
                      <FaEdit size={18} />
                    </button>

                    <button
                      className="text-red-600 hover:text-red-800"
                      onClick={() => deleteMutation.mutate(d.id)}
                    >
                      <FaTrash size={18} />
                    </button>
                  </td>
                </tr>
              ))}

              {drivers?.length === 0 && (
                <tr>
                  <td
                    colSpan="5"
                    className="text-center py-4 text-gray-500"
                  >
                    No drivers found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-96 shadow-lg">
            <h2 className="text-lg font-semibold mb-4">
              {editingDriver ? "Edit Driver" : "Add Driver"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name */}
              <div>
                <label className="block text-sm mb-1">Name</label>
                <input
                  name="name"
                  required
                  className="w-full border px-3 py-2 rounded-md"
                  defaultValue={editingDriver?.name || ""}
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm mb-1">Email</label>
                <input
                  name="email"
                  type="email"
                  required
                  className="w-full border px-3 py-2 rounded-md"
                  defaultValue={editingDriver?.email || ""}
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm mb-1">Phone</label>
                <input
                  name="phone"
                  required
                  className="w-full border px-3 py-2 rounded-md"
                  defaultValue={editingDriver?.phone || ""}
                />
              </div>

              {/* Password - only show for new driver */}
              {!editingDriver && (
                <div>
                  <label className="block text-sm mb-1">Password</label>
                  <input
                    name="password"
                    type="password"
                    required
                    className="w-full border px-3 py-2 rounded-md"
                  />
                </div>
              )}

              {/* Buttons */}
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
                  {editingDriver ? "Save Changes" : "Add Driver"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageDriversPage;
