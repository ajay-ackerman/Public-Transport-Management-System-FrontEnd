import axios from "axios";

const api = axios.create({
    baseURL: "http://localhost:8080/api/v1",
});

api.interceptors.request.use((config) => {
    if (config.url && config.url.startsWith('/auth/')) {
        delete config.headers['Authorization'];
        return config;
    }
    const token = localStorage.getItem("token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

api.interceptors.response.use(
    (res) => {
        return res;
    },
    async (err) => {
        const originalConfig = err.config;

        if (originalConfig.url !== "/auth/login" && err.response) {
            // Access Token was expired
            if (err.response.status === 401 && !originalConfig._retry) {
                originalConfig._retry = true;

                try {
                    const rs = await api.post("/auth/refresh", {
                        refreshToken: localStorage.getItem("refreshToken"),
                    });

                    const { token } = rs.data;
                    localStorage.setItem("token", token);

                    return api(originalConfig);
                } catch (_error) {
                    return Promise.reject(_error);
                }
            }
        }

        return Promise.reject(err);
    }
);


export default api;