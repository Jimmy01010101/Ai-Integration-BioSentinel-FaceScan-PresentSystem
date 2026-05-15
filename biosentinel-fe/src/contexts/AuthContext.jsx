import {
  createContext,
  useContext,
  useEffect,
  useState
} from 'react';


const AuthContext =
  createContext();


export function AuthProvider({
  children
}) {

  const [user, setUser] =
    useState(null);


  // LOAD USER
  useEffect(() => {

    const storedUser =
      localStorage.getItem(
        'user'
      );

    if (storedUser) {

      setUser(
        JSON.parse(storedUser)
      );

    }

  }, []);


  // LOGIN
  const login = (
    userData
  ) => {

    setUser(userData);

    localStorage.setItem(

      'user',

      JSON.stringify(userData)

    );

  };


  // LOGOUT
  const logout = () => {

    setUser(null);

    localStorage.removeItem(
      'token'
    );

    localStorage.removeItem(
      'user'
    );

  };


  return (

    <AuthContext.Provider

      value={{
        user,
        login,
        logout
      }}

    >

      {children}

    </AuthContext.Provider>

  );

}


export const useAuth =
  () => useContext(AuthContext);