import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem("ownshoe-user");
    const savedToken = localStorage.getItem("ownshoe-token");

    if (savedUser && savedToken) {
      try {
        setUser(JSON.parse(savedUser));
        setToken(savedToken);
      } catch (error) {
        console.error("Failed to load auth data:", error);

        localStorage.removeItem("ownshoe-user");
        localStorage.removeItem("ownshoe-token");
      }
    }

    setLoading(false);
  }, []);

  const login = (userData, userToken) => {
    const safeUser = userData && typeof userData === "object" ? userData : null;

    if (safeUser) {
      localStorage.setItem("ownshoe-user", JSON.stringify(safeUser));
    }

    if (userToken) {
      localStorage.setItem("ownshoe-token", userToken);
    }

    setUser(safeUser);
    setToken(userToken || null);
  };

  const logout = () => {
    localStorage.removeItem("ownshoe-user");
    localStorage.removeItem("ownshoe-token");
    localStorage.removeItem("token");

    setUser(null);
    setToken(null);
  };

  const isAuthenticated = !!user;
  const isAdmin = user?.role === "admin";

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated,
        isAdmin,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
