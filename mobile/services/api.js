import { API_URL } from "../constants/api";
import { supabase } from "./supabase";

export async function apiRequest(path, options = {}) {
  if (!API_URL) {
    throw new Error("The production API URL has not been configured.");
  }

  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  if (!data.session?.access_token) {
    throw new Error("Please sign in again to continue.");
  }

  const headers = new Headers(options.headers);
  headers.set("Authorization", `Bearer ${data.session.access_token}`);
  if (options.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(`${API_URL}${path}`, { ...options, headers });
  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.error || `API request failed (${response.status}).`);
  }

  return response;
}