import { Link, useLocation } from "react-router-dom";
import { cn } from "../../libs/utils";
import {
  Home,
  Settings,
  ChevronLeft,
  FileText,
  UserCog,
  Megaphone,
  CalendarCheck2,
  CalendarDays,
  Calendar,
  Mails,
  DollarSign,
} from "lucide-react";
import GritLogo from "../../assets/logo/grit_logo.svg";

const SidebarItem = ({ icon: Icon, label, to, badge, expanded }) => {
  // const { expanded } = useSidebar();
  const { pathname } = useLocation();
  const isActive = pathname === to;

  return (
    <Link
      to={to}
      className={cn(
        "flex items-center justify-between py-2 px-4 rounded-lg transition-colors ",
        isActive ? "bg-white text-[#0771EF] font-semibold" : "text-white",
        expanded ? "w-full" : "justify-center"
      )}
    >
      <div className="flex items-center font-thin">
        <Icon size={20} className={expanded ? "mr-3" : ""} />
        {expanded && <span>{label}</span>}
      </div>
      {badge && expanded && (
        <div className="flex space-x-1">
          <span className="bg-white text-blue-600 px-2 py-0.5 text-xs rounded-md font-bold">
            {badge[0]}
          </span>
          <span className=" bg-blue-700 px-2 py-0.5 text-xs rounded-md font-bold">
            {badge[1]}
          </span>
        </div>
      )}
    </Link>
  );
};

const Sidebar = ({ toggleSidebar, expanded }) => {
  const sidebarItems = [
    { icon: Home, label: "Dashboard", to: "/" },
    { icon: FileText, label: "Social Media Calendar", to: "/content" },
    { icon: Mails, label: "Email Journey", to: "/email-generator" },
    { icon: DollarSign, label: "Market Analysis", to: "/financial-generator" },
    { icon: UserCog, label: "Blog Writer", to: "/hr-agent" },
    { icon: Megaphone, label: "Marketing AI Agent", to: "/marketing" },
    { icon: CalendarCheck2, label: "Grant Writer", to: "/grants" },
    { icon: CalendarDays, label: "Client Management", to: "/clients" },
    { icon: Calendar, label: "Calendar", to: "/calendar" },
    { icon: Settings, label: "Setup", to: "/setup" },
  ];

  return (
    <aside
      className={cn(
        " relative transition-all duration-300 flex flex-col ",
        expanded ? "w-72" : "w-16",
        "bg-gradient-to-r from-[#02B4FE] to-[#0964F8]"
      )}
    >
      <div className=" relative p-4 flex items-center justify-between">
        {expanded && (
          <div>
            <img src={GritLogo} alt=""></img>
          </div>
        )}
        <button
          onClick={toggleSidebar}
          className="border border-white absolute z-100 top-[5px] right-[-15px] bg-gradient-to-r from-[#02B4FE] to-[#0964F8] p-1.5 rounded-full  text-white cursor-pointer "
        >
          <ChevronLeft size={20} className={expanded ? "" : "rotate-180"} />
        </button>
      </div>

      <nav className="flex-1 space-y-1 px-2 py-2">
        {sidebarItems.map((item) => (
          <SidebarItem
            key={item.label}
            icon={item.icon}
            label={item.label}
            to={item.to}
            active={item.active}
            badge={item.badge}
            expanded={expanded}
          />
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
