import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth, isFirebaseConfigured } from "../services/firebase.js";
import {
  getProfileWithRetry,
  registerUser,
  signInUser,
  signOutUser,
} from "../services/authService.js";
import { getErrorMessage } from "../utils/errors.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [profile, setProfile] = useState(null);
  const [firebaseUser, setFirebaseUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState("");
  const [configurationError, setConfigurationError] = useState(
    isFirebaseConfigured
      ? ""
      : "Firebase no está configurado. Completa las variables en .env.local.",
  );

  useEffect(() => {
    if (!isFirebaseConfigured || !auth) {
      setLoading(false);
      return undefined;
    }

    let active = true;
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!active) return;

      if (!user) {
        setFirebaseUser(null);
        setProfile(null);
        setLoading(false);
        setAuthError("");
        return;
      }

      setLoading(true);
      try {
        const loadedProfile = await getProfileWithRetry(user.uid);
        if (!active) return;

        if (!loadedProfile) {
          await signOut(auth);
          if (!active) return;
          setFirebaseUser(null);
          setProfile(null);
          setLoading(false);
          setAuthError(
            "Tu cuenta existe, pero no tiene un perfil asociado. Contacta a la administradora.",
          );
          return;
        }

        if (loadedProfile.activo === false) {
          await signOut(auth);
          if (!active) return;
          setFirebaseUser(null);
          setProfile(null);
          setLoading(false);
          setAuthError("Tu cuenta está desactivada. Contacta a la administradora.");
          return;
        }

        setFirebaseUser(user);
        setProfile(loadedProfile);
        setAuthError("");
        setConfigurationError("");
      } catch (error) {
        console.error("No se pudo cargar el perfil:", error);
        if (!active) return;
        setFirebaseUser(user);
        setProfile(null);
        setLoading(false);
        setAuthError(getErrorMessage(error, "No se pudo cargar tu perfil."));
      } finally {
        if (active) setLoading(false);
      }
    });

    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  const login = useCallback(async (email, password) => {
    setAuthError("");
    try {
      const loggedProfile = await signInUser(email, password);
      setProfile(loggedProfile);
      setFirebaseUser(auth?.currentUser || null);
      setLoading(false);
      return loggedProfile;
    } catch (error) {
      setAuthError(getErrorMessage(error));
      throw error;
    }
  }, []);

  const register = useCallback(async (values) => {
    setAuthError("");
    try {
      const created = await registerUser(values);
      setProfile(created);
      setFirebaseUser(auth?.currentUser || null);
      setLoading(false);
      return created;
    } catch (error) {
      setAuthError(getErrorMessage(error));
      throw error;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await signOutUser();
    } finally {
      setProfile(null);
      setFirebaseUser(null);
      setAuthError("");
      setLoading(false);
    }
  }, []);

  const refreshProfile = useCallback(async () => {
    if (!firebaseUser?.uid) return null;
    const updated = await getProfileWithRetry(firebaseUser.uid, 2);
    if (updated) setProfile(updated);
    return updated;
  }, [firebaseUser?.uid]);

  const updateProfileState = useCallback((updated) => {
    if (updated) setProfile(updated);
  }, []);

  const value = useMemo(
    () => ({
      profile,
      firebaseUser,
      loading,
      authError,
      configurationError,
      isConfigured: isFirebaseConfigured,
      isAuthenticated: Boolean(profile),
      login,
      register,
      logout,
      refreshProfile,
      updateProfileState,
      clearAuthError: () => setAuthError(""),
    }),
    [
      profile,
      firebaseUser,
      loading,
      authError,
      configurationError,
      login,
      register,
      logout,
      refreshProfile,
      updateProfileState,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe usarse dentro de AuthProvider.");
  }
  return context;
};
