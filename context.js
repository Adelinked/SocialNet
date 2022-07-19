import { createContext, useContext, useEffect, useState } from "react";
import { GUEST_USER } from "./variables";
const AppContext = createContext();

export function AppWrapper(props) {
  const { value, setValue, children } = props;
  const [globalState, setGlobalState] = useState(value);

  useEffect(() => {
    if (globalState) return;
    setGlobalState(GUEST_USER);
  }, []);

  return (
    <AppContext.Provider value={{ globalState, setGlobalState }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  return useContext(AppContext);
}
