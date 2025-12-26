import { useState } from "react";
import api from "../api/axiosConfig";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import LoadingSpinner from "../components/LoadingSpinner";

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const { login } = useAuth();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const res = await api.post("/auth/login", {
                email,
                password,
            });
            setIsLoading(true);
            const { token, user, refreshToken } = res.data;
            login(user, token, refreshToken);

            toast.success("Logged in successfully");
            navigate("/");
        } catch (err) {
            toast.error("Invalid email or password");
        }
        finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-10 bg-gray-100">
            <div className="bg-white shadow-lg rounded-lg p-8 w-full max-w-md">
                <h1 className="text-2xl font-bold text-center mb-6">
                    Login to PTMS
                </h1>

                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <label className="block text-sm mb-1">Email</label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full border px-3 py-2 rounded-md"
                            placeholder="john@example.com"
                        />
                    </div>

                    <div>
                        <label className="block text-sm mb-1">Password</label>
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full border px-3 py-2 rounded-md"
                            placeholder="••••••••"
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition"
                    >
                        {isLoading ? <LoadingSpinner /> : "Login"}
                    </button>
                </form>

                <p className="text-sm text-center mt-4">
                    Don’t have an account?{" "}
                    <Link
                        to="/register"
                        className="text-blue-600 hover:underline"
                    >
                        Register
                    </Link>
                </p>
            </div>
        </div>
    );
}