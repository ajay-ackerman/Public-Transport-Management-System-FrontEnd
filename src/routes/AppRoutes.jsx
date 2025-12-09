import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "../pages/Login";
import Dashboard from "../pages/Dashboard";
import ProtectedRoute from "./protectedRoutes";
import MainLayout from "../layout/MainLayout";
import RoleRedirect from "./RoleRedirect";
import RoleBasedGuard from "./RoleBasedGuard";
import AdminDashboard from "../pages/admin/AdminDashboard";
import PassengerDashboard from "../pages/passenger/PassengerDashboard";
import DriverDashboard from "../pages/driver/DriverDashboard";
import ManageVehiclesPage from "../pages/admin/ManageVehiclePage";
import ManageDriversPage from "../pages/admin/ManageDriversPage";
import ManageRoutes from "../pages/admin/ManageRoutes";
import ManageTripPage from "../pages/admin/ManageTripPage";
const AppRoutes = () => {
    return (
        <BrowserRouter>
            <Routes>
                <Route
                    path="/"
                    element={
                        <RoleRedirect />
                    }
                />
                <Route path="/login" element={<Login />} />

                <Route
                    path="/admin"
                    element={
                        <ProtectedRoute>
                            <RoleBasedGuard allowedRoles={["ADMIN"]}>
                                <MainLayout>
                                    <AdminDashboard />
                                </MainLayout>
                            </RoleBasedGuard>
                        </ProtectedRoute>
                    }

                />
                <Route path="admin/vehicles" element={
                    <ProtectedRoute>
                        <RoleBasedGuard allowedRoles={["ADMIN"]}>
                            <MainLayout>
                                <ManageVehiclesPage />
                            </MainLayout>
                        </RoleBasedGuard>
                    </ProtectedRoute>
                }
                />

                <Route path="admin/drivers" element={
                    <ProtectedRoute>
                        <RoleBasedGuard allowedRoles={["ADMIN"]}>
                            <MainLayout>
                                <ManageDriversPage />
                            </MainLayout>
                        </RoleBasedGuard>
                    </ProtectedRoute>
                }
                />
                <Route path="admin/routes" element={
                    <ProtectedRoute>
                        <RoleBasedGuard allowedRoles={["ADMIN"]}>
                            <MainLayout>
                                <ManageRoutes />
                            </MainLayout>
                        </RoleBasedGuard>
                    </ProtectedRoute>
                }
                />
                <Route path="admin/trips" element={
                    <ProtectedRoute>
                        <RoleBasedGuard allowedRoles={["ADMIN"]}>
                            <MainLayout>
                                <ManageTripPage />
                            </MainLayout>
                        </RoleBasedGuard>
                    </ProtectedRoute>
                }
                />

                <Route
                    path="/driver"
                    element={
                        <ProtectedRoute>
                            <RoleBasedGuard allowedRoles={["DRIVER", "ADMIN"]}>
                                <MainLayout>
                                    <DriverDashboard />
                                </MainLayout>
                            </RoleBasedGuard>
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/passenger"
                    element={
                        <ProtectedRoute>
                            <RoleBasedGuard allowedRoles={["PASSENGER"]}>
                                <MainLayout>
                                    <PassengerDashboard />
                                </MainLayout>
                            </RoleBasedGuard>
                        </ProtectedRoute>
                    }
                />

            </Routes>
        </BrowserRouter>
    );
};

export default AppRoutes;