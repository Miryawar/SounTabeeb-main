import AsyncStorage from "@react-native-async-storage/async-storage";

// Edit this base URL to match your backend host/IP and port.
export const API_BASE = "http://172.28.37.117:5000";

async function getToken(key = "token") {
  return await AsyncStorage.getItem(key);
}

export async function apiGet(path: string, tokenKey = "token") {
  const token = await getToken(tokenKey);
  const res = await fetch(`${API_BASE}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  return res;
}

export async function apiPost(path: string, body: any, tokenKey = "token") {
  const token = await getToken(tokenKey);

  console.log("POST URL:", `${API_BASE}${path}`);
  console.log("POST BODY:", body);

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

export async function apiPut(path: string, body: any, tokenKey = "token") {
  const token = await getToken(tokenKey);
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
