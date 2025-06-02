import React, { useState } from "react";
import instagram from "../../../assets/icons/instagram.svg";
import twitter from "../../../assets/icons/twitter.svg";
import facebook from "../../../assets/icons/facebook.svg";
import linkedin from "../../../assets/icons/linkedin.svg";
import MonthlyPostResults from "./MonthlyPostResults";
import { MdOutlineCalendarToday } from "react-icons/md";
import { PiList } from "react-icons/pi";
import AuthModal from "../ui/Toggle";

export default function CalendarResult({
  postData = [],
  loading,
  onPostCreated,
}) {
  const [viewMode, setViewMode] = React.useState("calendar");
  const [isAuthModalOpen, setIsAuthModalOpen] = React.useState(false);
  const daysOfWeek = ["Sun", "Mon", "Tues", "Wed", "Thurs", "Fri", "Sat"];
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDayPosts, setSelectedDayPosts] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);

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

    acc[day].push({
      ...post,
      platforms,
    });

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
      <div className=" align-items-center flex flex-row  border-b border-gray-200 pb-2">
        <h2 className=" w-full text-2xl  font-bold text-[#1E293B]">Result</h2>
        <div className="items-center justify-end  w-full flex  gap-2">
          <button
            onClick={() => setViewMode("calendar")}
            className={`p-2 rounded-md  bg-[#FAFBFB] cursor-pointer`}
          >
            <MdOutlineCalendarToday
              className={`w-[16px] h-[16px] ${
                viewMode === "calendar" ? "text-[#0771EF]" : "text-[#64748B]"
              } `}
            />
          </button>

          <button
            onClick={() => setViewMode("list")}
            className={`p-2 rounded-md  bg-[#FAFBFB] cursor-pointer`}
          >
            <PiList
              className={`w-[16px] h-[16px] ${
                viewMode === "list" ? "text-[#0771EF]" : "bg-[#FAFBFB]"
              } `}
            />
          </button>
          <button className="px-4 py-1.5 rounded-md text-white font-medium bg-gradient-to-r from-[#02B4FE] to-[#0964F8]">
            Export
          </button>
        </div>
      </div>

      {/* Calendar grid */}
      {viewMode === "calendar" ? (
        <>
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
                <span className="">{monthYearLabel}</span>
                <button
                  onClick={goToNextMonth}
                  className="px-2 py-1 rounded-full bg-gray-100 cursor-pointer"
                >
                  →
                </button>
              </div>
              <div className="flex items-center gap-2 bg-[#FAFBFB] rounded-[7px] p-[6px]">
                <button className="px-3 py-1.5 rounded-[6px]  bg-[white] text-[#0771EF] font-medium text-sm">
                  Month
                </button>
                <button className="px-3 py-1.5 rounded-[6px]  text-sm text-[#64748B]">
                  Week
                </button>
              </div>
            </div>
          </div>
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
              const day = i + 1;
              const inMonth = day > 0 && day <= 31;
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
                  className={`min-h-[80px] rounded-lg p-1 text-[12px] text-[#0F172A] cursor-pointer ${
                    hasData
                      ? "border-2 border-[#3B82F6]"
                      : "border border-[#E2E8F0]"
                  }`}
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
        <MonthlyPostResults
          posts={postData}
          onPostCreated={() => {
            onPostCreated();
          }}
        />
      )}
      {isAuthModalOpen && (
        <AuthModal
          onClose={() => setIsAuthModalOpen(false)}
          scheduledPosts={selectedDayPosts}
          selectedDate={selectedDate}
          onPostCreated={() => {
            setIsAuthModalOpen(false);
            onPostCreated();
          }}
        />
      )}
    </div>
  );
}
