const configuredApiUrl = process.env.EXPO_PUBLIC_API_URL?.trim();
const developmentApiUrl = __DEV__ ? "http://localhost:5001/api" : "";

const apiUrl = configuredApiUrl || developmentApiUrl;
export const API_URL =
	__DEV__ || apiUrl.startsWith("https://") ? apiUrl.replace(/\/$/, "") : "";
