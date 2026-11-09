import { auth } from "./firebase.js";
import { appError } from "../utils/errors.js";

const baseUrl = String(import.meta.env.VITE_SIMULATION_API_URL || "").replace(
  /\/$/,
  "",
);

const getToken = async () => {
  try {
    return (await auth?.currentUser?.getIdToken?.()) || "";
  } catch {
    return "";
  }
};

const requestJson = async (path, { method = "GET", failureCode } = {}) => {
  const token = await getToken();

  let response;
  try {
    response = await fetch(`${baseUrl}${path}`, {
      method,
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
  } catch {
    throw appError("simulation/unavailable");
  }

  if (response.status === 401 || response.status === 403) {
    throw appError("simulation/unauthorized");
  }
  if (response.status === 409) {
    throw appError("simulation/running");
  }
  if (!response.ok) {
    throw appError(failureCode || "simulation/unavailable");
  }

  try {
    return await response.json();
  } catch {
    throw appError(failureCode || "simulation/unavailable");
  }
};

export const fetchSimulationOverview = () =>
  requestJson("/api/simulation/overview");

export const rerunSimulation = () =>
  requestJson("/api/simulation/rerun", {
    method: "POST",
    failureCode: "simulation/runFailed",
  });
