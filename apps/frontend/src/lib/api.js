// Pick API base URL from env or fall back to localhost.
const getApiBase = () => {
    if (typeof import.meta !== "undefined" && import.meta.env?.VITE_API_URL) {
        return import.meta.env.VITE_API_URL;
    }
    if (typeof process !== "undefined" && process.env?.REACT_APP_API_URL) {
        return process.env.REACT_APP_API_URL;
    }
    return "http://localhost:3000";
};

export const API_BASE = getApiBase();
