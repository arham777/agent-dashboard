import { createContext, useState, useContext, useEffect } from "react";

const SidebarContext = createContext(undefined);

export function SidebarProvider({ children }) {
  const [expanded, setExpanded] = useState(true);

  const toggleSidebar = () => setExpanded((prev) => !prev);
  const collapseSidebar = () => setExpanded(false);
  const expandSidebar = () => setExpanded(true);
  useEffect(() => {
    const isSmallScreen = window.innerWidth < 768;
    if (isSmallScreen) {
      setExpanded(false);
    }
  }, []);

  return (
    <SidebarContext.Provider
      value={{ expanded, toggleSidebar, collapseSidebar, expandSidebar }}
    >
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  const context = useContext(SidebarContext);
  if (context === undefined) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return context;
}
