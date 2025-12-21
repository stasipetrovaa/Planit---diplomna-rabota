import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import * as DB from "@/services/db";
import { UserType } from "@/types/types";

type AuthContextType = {
  user: UserType | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (user: UserType) => Promise<boolean>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  login: async () => false,
  register: async () => false,
  logout: () => { },
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserType | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkLoginStatus();
  }, []);

  const checkLoginStatus = async () => {
    try {
      const storedUser = await AsyncStorage.getItem("user");
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (e) {
      console.error("Failed to fetch user session", e);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const loggedInUser = await DB.loginUser(email, password);
      if (loggedInUser) {
        await AsyncStorage.setItem("user", JSON.stringify(loggedInUser));
        setUser(loggedInUser);
        return true;
      }
      return false;
    } catch (e) {
      console.error("Failed to login", e);
      return false;
    }
  };

  const register = async (newUser: UserType): Promise<boolean> => {
    try {
      // Check if user exists (simple check via login or catch error in DB)
      // For now we rely on DB constraint (email unique)
      const registeredUser = await DB.registerUser(newUser);
      if (registeredUser) {
        await AsyncStorage.setItem("user", JSON.stringify(registeredUser));
        setUser(registeredUser);
        return true;
      }
      return false;
    } catch (e) {
      console.error("Failed to register", e);
      return false;
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem("user");
      setUser(null);
    } catch (e) {
      console.error("Failed to remove user session", e);
    }
  };

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: !!user,
      isLoading,
      login,
      register,
      logout,
    }),
    [user, isLoading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
