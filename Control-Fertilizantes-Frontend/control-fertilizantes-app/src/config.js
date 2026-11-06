const CONFIG = {
  API_URL: (import.meta.env.VITE_API_URL || "/api").replace(/\/+$/, "")
};

export default CONFIG;
