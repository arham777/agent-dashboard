import React, { useState, useEffect, useMemo } from "react";
import linkedin from "../../../assets/icons/linkedin.svg";
import instagram from "../../../assets/icons/instagram.svg";
import twitter from "../../../assets/icons/twitter.svg";
import facebook from "../../../assets/icons/facebook.svg";
import MonthlyPostResults from "./MonthlyPostResults";
import { MdOutlineCalendarToday } from "react-icons/md";
import { PiList } from "react-icons/pi";
import AuthModal from "../ui/Toggle";
import { toast } from "react-toastify";

export default function CalendarResult({
  postData: initialPostData = [], // Accept initial data but we will manage our own
  loading: initialLoading,
  onPostCreated,
}) {
  const [viewMode, setViewMode] = useState("calendar");
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDayPosts, setSelectedDayPosts] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);

  // State for the component's own data and loading status
  const [postData, setPostData] = useState(initialPostData);
  const [loading, setLoading] = useState(initialLoading);

  // State for campaign filter
  const [campaigns, setCampaigns] = useState([]);
  const [selectedCampaignId, setSelectedCampaignId] = useState(""); // "" means "All Campaigns"

  const daysOfWeek = ["Sun", "Mon", "Tues", "Wed", "Thurs", "Fri", "Sat"];

  // This useEffect fetches the list of campaigns for the dropdown
  useEffect(() => {
    const fetchCampaigns = async () => {
      const storedUser = localStorage.getItem("authenticatedUser");
      const userId = storedUser ? JSON.parse(storedUser).userId : null;
      if (!userId) return;

      try {
        const res = await fetch(
          `https://dev-ai.cybergen.com/calendars?user_id=${userId}`
        );
        if (!res.ok) throw new Error("Failed to fetch campaigns");
        const data = await res.json();
        const validCampaigns = data.filter(
          (c) => c.campaign_name && c.campaign_name.trim() !== ""
        );
        setCampaigns(validCampaigns);
      } catch (err) {
        console.error("Failed to load campaigns for filter:", err);
      }
    };
    fetchCampaigns();
  }, []);

  // 🔄 THIS IS THE MAIN NEW LOGIC 🔄
  // This useEffect fetches posts whenever the campaign selection changes.
  useEffect(() => {
    const loadPostsForSelection = async () => {
      setLoading(true);
      const storedUser = localStorage.getItem("authenticatedUser");
      const userId = storedUser ? JSON.parse(storedUser).userId : null;

      if (!userId) {
        toast.error("User ID not found.");
        setLoading(false);
        return;
      }

      let url = "";

      if (selectedCampaignId) {
        // A specific campaign is selected, use the new endpoint
        url = `https://dev-ai.cybergen.com/calendar-posts?calendar_id=${selectedCampaignId}`;
      } else {
        // "All Campaigns" is selected, use the original endpoint
        url = `https://dev-ai.cybergen.com/get-user-posts?user_id=${userId}`;
      }

      try {
        const res = await fetch(url);
        if (!res.ok)
          throw new Error("Failed to fetch post data for the selection");
        const data = await res.json();
        setPostData(data);
      } catch (err) {
        console.error("Data fetching error:", err);
        toast.error("Could not load posts for the selected campaign.");
        setPostData([]); // Clear data on error
      } finally {
        setLoading(false);
      }
    };

    loadPostsForSelection();
  }, [selectedCampaignId]);
  const monthYearLabel = currentDate.toLocaleString("default", {
    month: "long",
    year: "numeric",
  });

  const goToPreviousMonth = () => {
    const prev = new Date(currentDate);
    prev.setMonth(prev.getMonth() - 1);
    setCurrentDate(prev);
  };

  const goToNextMonth = () => {
    const next = new Date(currentDate);
    next.setMonth(next.getMonth() + 1);
    setCurrentDate(next);
  };

  const currentMonthPosts = postData.filter((post) => {
    const postDate = new Date(post.post_date);
    return (
      postDate.getFullYear() === currentDate.getFullYear() &&
      postDate.getMonth() === currentDate.getMonth()
    );
  });

  const postMap = currentMonthPosts.reduce((acc, post) => {
    const day = new Date(post.post_date).getDate();
    if (!acc[day]) acc[day] = [];
    const platforms = post.platform.split(",").map((p) => p.trim());
    acc[day].push({ ...post, platforms });
    return acc;
  }, {});

  const renderCell = (day) => {
    const entries = postMap[day];
    if (!entries) return <div className="h-[80px]"></div>;
    return (
      <div className="rounded-md p-1 space-y-1">
        {entries.map((entry, idx) => (
          <div
            key={idx}
            className="flex items-center gap-1 px-2 py-1 text-[10px] font-medium border border-gray-300 rounded-sm overflow-hidden text-ellipsis whitespace-nowrap bg-white"
          >
            {entry.platforms.map((p, i) => {
              const icon =
                p.toLowerCase() === "twitter"
                  ? twitter
                  : p.toLowerCase() === "instagram"
                    ? instagram
                    : p.toLowerCase() === "facebook"
                      ? facebook
                      : p.toLowerCase() === "linkedin"
                        ? linkedin
                        : null;
              return (
                icon && <img key={i} src={icon} alt={p} className="w-3 h-3" />
              );
            })}
            <span className="truncate">{entry.caption}</span>
          </div>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[300px]">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg h-full">
      {/* Header */}
      <div className=" align-items-center flex flex-row  border-b border-gray-200 pb-2">
        <h2 className=" w-full text-2xl  font-bold text-[#1E293B]">Result</h2>
        <div className="items-center justify-end  w-full flex  gap-2">
          {/* Campaign Filter Dropdown */}
          <div className="relative">
            <select
              value={selectedCampaignId}
              onChange={(e) => setSelectedCampaignId(e.target.value)}
              className="appearance-none text-sm text-[#475569] bg-[#FAFBFB] rounded-md px-3 pr-8 py-2 w-40 border border-gray-300"
            >
              <option value="">All Campaigns</option>
              {campaigns.map((campaign) => (
                <option key={campaign.calendar_id} value={campaign.calendar_id}>
                  {campaign.campaign_name}
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={() => setViewMode("calendar")}
            className={`p-2 rounded-md bg-[#FAFBFB] cursor-pointer`}
          >
            <MdOutlineCalendarToday
              className={`w-[16px] h-[16px] ${viewMode === "calendar" ? "text-[#0771EF]" : "text-[#64748B]"} `}
            />
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`p-2 rounded-md bg-[#FAFBFB] cursor-pointer`}
          >
            <PiList
              className={`w-[16px] h-[16px] ${viewMode === "list" ? "text-[#0771EF]" : "text-[#64748B]"} `}
            />
          </button>
          <button className="px-4 py-1.5 rounded-md text-white font-medium bg-gradient-to-r from-[#02B4FE] to-[#0964F8]">
            Export
          </button>
        </div>
      </div>

      {/* Calendar/List View */}
      {viewMode === "calendar" ? (
        <>
          {/* Month Navigation */}
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-[#0F172A]">
              {monthYearLabel}
            </h3>
            <div className="flex items-center justify-between text-sm font-medium text-[#0F172A] py-2 gap-2">
              <div className="flex items-center gap-1">
                <button
                  onClick={goToPreviousMonth}
                  className="px-2 py-1 rounded-full bg-gray-100 cursor-pointer"
                >
                  ←
                </button>
                <span>{monthYearLabel}</span>
                <button
                  onClick={goToNextMonth}
                  className="px-2 py-1 rounded-full bg-gray-100 cursor-pointer"
                >
                  →
                </button>
              </div>
            </div>
          </div>
          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-2">
            {daysOfWeek.map((day) => (
              <div
                key={day}
                className="text-center text-sm font-semibold text-[#3B82F6]"
              >
                {day}
              </div>
            ))}
            {[...Array(35)].map((_, i) => {
              // This is a simplified grid, needs proper date logic
              const day = i + 1; // Placeholder for day number
              const inMonth =
                day > 0 &&
                day <=
                  new Date(
                    currentDate.getFullYear(),
                    currentDate.getMonth() + 1,
                    0
                  ).getDate();
              const hasData = !!postMap[day];
              return (
                <div
                  key={i}
                  onClick={() => {
                    if (hasData) {
                      const fullDate = new Date(
                        currentDate.getFullYear(),
                        currentDate.getMonth(),
                        day
                      );
                      setSelectedDayPosts(postMap[day]);
                      setSelectedDate(fullDate);
                      setIsAuthModalOpen(true);
                    }
                  }}
                  className={`min-h-[80px] rounded-lg p-1 text-[12px] text-[#0F172A] cursor-pointer ${hasData ? "border-2 border-[#3B82F6]" : "border border-[#E2E8F0]"}`}
                >
                  <div className="font-medium text-right pr-1 text-xs">
                    {inMonth ? day : ""}
                  </div>
                  {inMonth && renderCell(day)}
                </div>
              );
            })}
          </div>
        </>
      ) : (
        <MonthlyPostResults posts={postData} onPostCreated={onPostCreated} />
      )}
      {isAuthModalOpen && (
        <AuthModal
          onClose={() => setIsAuthModalOpen(false)}
          scheduledPosts={selectedDayPosts}
          selectedDate={selectedDate}
          onPostCreated={() => {
            setIsAuthModalOpen(false);
            const currentSelection = selectedCampaignId;
            setSelectedCampaignId("");
            setTimeout(() => setSelectedCampaignId(currentSelection), 0);
            onPostCreated();
          }}
        />
      )}
    </div>
  );
}
