import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";

const expoApiBase = Constants.expoConfig?.extra?.API_BASE;
export const API_BASE = expoApiBase || "http://172.28.37.117:5000";

async function getToken(key = "token") {
  return await AsyncStorage.getItem(key);
}

function buildHeaders(token?: string) {
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export async function apiGet(path: string, tokenKey = "token") {
  const token = await getToken(tokenKey);
  const res = await fetch(`${API_BASE}${path}`, {
    headers: buildHeaders(token),
  });
  return res;
}

export async function apiPost(path: string, body: any, tokenKey = "token") {
  const token = await getToken(tokenKey);
  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: buildHeaders(token),
    body: JSON.stringify(body),
  });
  return res;
}

export async function apiPut(path: string, body: any, tokenKey = "token") {
  const token = await getToken(tokenKey);
  const res = await fetch(`${API_BASE}${path}`, {
    method: "PUT",
    headers: buildHeaders(token),
    body: JSON.stringify(body),
  });
  return res;
}

export async function apiDelete(path: string, tokenKey = "token") {
  const token = await getToken(tokenKey);
  const res = await fetch(`${API_BASE}${path}`, {
    method: "DELETE",
    headers: buildHeaders(token),
  });
  return res;
}

export async function uploadProfilePicture(
  base64Image: string,
  tokenKey = "token",
) {
  const token = await getToken(tokenKey);
  const res = await fetch(`${API_BASE}/api/users/upload-profile-picture`, {
    method: "POST",
    headers: buildHeaders(token),
    body: JSON.stringify({ profilePicture: base64Image }),
  });
  return res;
}

export async function removeProfilePicture(tokenKey = "token") {
  const token = await getToken(tokenKey);
  const res = await fetch(`${API_BASE}/api/users/profile-picture`, {
    method: "DELETE",
    headers: buildHeaders(token),
  });
  return res;
}

export default { API_BASE, apiGet, apiPost, apiPut, apiDelete };
