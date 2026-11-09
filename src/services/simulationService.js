import { auth } from "./firebase.js";
import { appError } from "../utils/errors.js";

const baseUrl = String(import.meta.env.VITE_SIMULATION_API_URL || "").replace(
  /\/$/,
  "",
);

export const fetchSimulationOverview = async () => {
  let token = "";
  try {
    token = (await auth?.currentUser?.getIdToken?.()) || "";
  } catch {
    token = "";
  }

  let response;
  try {
    response = await fetch(`${baseUrl}/api/simulation/overview`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
  } catch {
    throw appError("simulation/unavailable");
  }

  if (response.status === 401 || response.status === 403) {
    throw appError("simulation/unauthorized");
  }
  if (!response.ok) throw appError("simulation/unavailable");

  try {
    return await response.json();
  } catch {
    throw appError("simulation/unavailable");
  }
};
