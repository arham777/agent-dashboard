import { Search } from "lucide-react";
import alert from "../../assets/icons/alert.svg";
// import clock from "../../assets/icons/clock.svg";
// import share from "../../assets/icons/share.svg";
// import tick from "../../assets/icons/tick.svg";
import profile_logo from "../../assets/icons/profile_logo.png";

const Navbar = () => {
  return (
    <header className="h-25   flex items-center justify-between px-4 sticky top-0 z-10 bg-white shadow-md ">
      <div className="flex items-center gap-4">
        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            size={18}
          />
          <input
            type="text"
            placeholder="Search"
            className="pl-10 pr-4 py-2 w-64 rounded-md border border-gray-300 text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      <div className="flex items-center space-x-3">
        {/* <IconButton icon={share} />
        <IconButton icon={tick} /> */}

        <div className="w-8 h-8 rounded-full border-2 border-blue-600 flex items-center justify-center">
          <img src={profile_logo} alt="" className="rounded-full" />
        </div>

        {/* <IconButton icon={clock} /> */}
        <IconButton icon={alert} />
      </div>
    </header>
  );
};

const IconButton = ({ icon }) => (
  <button className="relative w-8 h-8 flex items-center justify-center rounded-md   transition">
    <img src={icon} alt="" />
  </button>
);

export default Navbar;
