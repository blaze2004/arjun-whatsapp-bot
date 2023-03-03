import { config } from "dotenv";

if (process.env.NODE_ENV !== 'production') {
    config();
}

const environmentVariables = {
    nodeEnv: process.env.NODE_ENV,
    arjunAPIKey: process.env.ARJUN_API_KEY,
    arjunBackendUrl: process.env.ARJUN_BACKEND_URL,
};

export default environmentVariables;