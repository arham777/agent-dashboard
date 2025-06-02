import { useState } from "react";
import Sidebar from "./SideBar";
import Navbar from "./NavBar";
import { SidebarProvider } from "../../context/SidebarProvider";

const DashboardLayout = ({ children }) => {
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  return (
    <SidebarProvider>
      <div className=" flex h-[100vh] bg-gray-50">
        <Sidebar
          expanded={sidebarExpanded}
          toggleSidebar={() => setSidebarExpanded(!sidebarExpanded)}
        />
        <div
          style={{ width: `calc(100% - ${sidebarExpanded ? "288" : "64"}px)` }}
          className="flex flex-col"
        >
          <Navbar />
          <main className="height-mange">
            <div className="">{children}</div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default DashboardLayout;
