import axios from "axios";
import environmentVariables from "./config";

const axiosClient = axios.create({
    baseURL: environmentVariables.arjunBackendUrl,
    headers: {
        "Content-Type": "application/json",
        "X-API-Key": environmentVariables.arjunAPIKey
    }
});

export default axiosClient;