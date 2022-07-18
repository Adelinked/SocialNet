import { createContext, useContext, useEffect, useState } from "react";

const AppContext = createContext();

export function AppWrapper(props) {
  const { value, setValue, children } = props;
  const [globalState, setGlobalState] = useState(value);

  useEffect(() => {
    if (globalState) return;
    setGlobalState({ displayName: "Guest", img: "/anonymous.png" });
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
