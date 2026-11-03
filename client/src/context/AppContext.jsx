import { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { AppContext } from "./useAppContext";
import { getErrorMessage } from "../utils/errors";

// API base URL (see client/.env.example). Empty = same origin.
axios.defaults.baseURL = import.meta.env.VITE_BASE_URL || "";

const TOKEN_KEY = "token";
const readStoredToken = () => {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
};
const applyToken = (token) => {
  if (token) axios.defaults.headers.common.Authorization = `Bearer ${token}`;
  else delete axios.defaults.headers.common.Authorization;
};

// Set the Authorization header *before* the first render so child components
// that fetch on mount are already authenticated after a page refresh.
const initialToken = readStoredToken();
applyToken(initialToken);

// A single 401 handler (set by the provider) so an expired/invalid token logs the user out.
let onUnauthorized = null;
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    const url = error?.config?.url || "";
    const isAuthForm = url.includes("/api/user/login") || url.includes("/api/user/register");
    if (error?.response?.status === 401 && !isAuthForm) onUnauthorized?.();
    return Promise.reject(error);
  }
);

export const AppProvider = ({ children }) => {
  const navigate = useNavigate();
  const currency = import.meta.env.VITE_CURRENCY || "$";
  const [token, setTokenState] = useState(initialToken);
  const [user, setUser] = useState(null);
  const [isOwner, setIsOwner] = useState(false);
  const [authLoading, setAuthLoading] = useState(Boolean(initialToken)); // true while a stored token is being checked
  const [showLogin, setShowLogin] = useState(false);
  const [pickUpDate, setPickUpDate] = useState("");
  const [returnDate, setReturnDate] = useState("");
  const [cars, setCars] = useState([]);
  const [carsLoading, setCarsLoading] = useState(true);

  // Keeps state, localStorage and the axios header in sync.
  const setToken = useCallback((next) => {
    try {
      if (next) localStorage.setItem(TOKEN_KEY, next);
      else localStorage.removeItem(TOKEN_KEY);
    } catch {
      /* storage unavailable (private mode) - session just won't persist */
    }
    applyToken(next);
    setTokenState(next || null);
  }, []);

  const clearSession = useCallback(() => {
    setToken(null);
    setUser(null);
    setIsOwner(false);
  }, [setToken]);

  const fetchUser = useCallback(async () => {
    try {
      const { data } = await axios.get("/api/user/data");
      if (data.success) {
        setUser(data.user);
        setIsOwner(data.user.role === "owner");
      }
    } catch (error) {
      if (error?.response?.status !== 401) toast.error(getErrorMessage(error));
    } finally {
      setAuthLoading(false);
    }
  }, []);

  const fetchCars = useCallback(async () => {
    try {
      const { data } = await axios.get("/api/user/cars");
      if (data.success) setCars(data.cars);
      else toast.error(data.message);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setCarsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    clearSession();
    toast.success("Successfully logged out");
  }, [clearSession]);

  // Stored/expired token => log out and ask the user to sign in again.
  useEffect(() => {
    onUnauthorized = () => {
      clearSession();
      setAuthLoading(false);
      toast.error("Your session has expired. Please log in again.");
    };
    return () => {
      onUnauthorized = null;
    };
  }, [clearSession]);

  useEffect(() => {
    fetchCars();
  }, [fetchCars]);

  useEffect(() => {
    if (token) fetchUser();
    else setAuthLoading(false);
  }, [token, fetchUser]);

  // "List your car": sign-in first, then upgrade the account to an owner.
  const becomeOwner = useCallback(async () => {
    if (!token) {
      setShowLogin(true);
      return;
    }
    if (isOwner) {
      navigate("/owner");
      return;
    }
    try {
      const { data } = await axios.post("/api/owner/change-role");
      if (data.success) {
        setIsOwner(true);
        setUser((u) => (u ? { ...u, role: "owner" } : u));
        toast.success(data.message);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  }, [token, isOwner, navigate]);

  const value = useMemo(
    () => ({
      navigate, currency, axios, user, setUser, token, setToken, isOwner, setIsOwner, authLoading,
      fetchUser, showLogin, setShowLogin, logout, fetchCars, cars, setCars, carsLoading,
      pickUpDate, setPickUpDate, returnDate, setReturnDate, becomeOwner,
    }),
    [navigate, currency, user, token, setToken, isOwner, authLoading, fetchUser, showLogin, logout, fetchCars, cars, carsLoading, pickUpDate, returnDate, becomeOwner]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
