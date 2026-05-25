import AsyncStorage from "@react-native-async-storage/async-storage";

// Edit this base URL to match your backend host/IP and port.
export const API_BASE = "http://192.168.44.66:5000";

async function getToken() {
  return await AsyncStorage.getItem("token");
}

export async function apiGet(path: string) {
  const token = await getToken();
  const res = await fetch(`${API_BASE}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  return res;
}

export async function apiPost(path: string, body: any) {
  const token = await getToken();
  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  });
  return res;
}

export async function apiPut(path: string, body: any) {
  const token = await getToken();
  const res = await fetch(`${API_BASE}${path}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  });
  return res;
}

export default { API_BASE, apiGet, apiPost, apiPut };
