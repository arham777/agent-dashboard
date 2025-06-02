import React, { useState } from "react";
import instagram from "../../../assets/icons/instagram.svg";
import twitter from "../../../assets/icons/twitter.svg";
import facebook from "../../../assets/icons/facebook.svg";
import linkedin from "../../../assets/icons/linkedin.svg";
import MonthlyPostResults from "./MonthlyPostResults";
import { MdOutlineCalendarToday } from "react-icons/md";
import { PiList } from "react-icons/pi";
import AuthModal from "../ui/Toggle";
import { useLocation } from "react-router-dom";
import EmailDetailsModal from './Modal/Index'

export default function CalendarResult({
  postData = [],
  loading,
  onPostCreated,
}) {
  const [viewMode, setViewMode] = React.useState("calendar");
  const [isAuthModalOpen, setIsAuthModalOpen] = React.useState(false);
  const [isEmailDetailsModalOpen, setIsEmailDetailsModalOpen] = useState(false);
  const [selectedEmailData, setSelectedEmailData] = useState([]);

  const daysOfWeek = ["Sun", "Mon", "Tues", "Wed", "Thurs", "Fri", "Sat"];
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDayPosts, setSelectedDayPosts] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);

  const location = useLocation();
  const isEmailGenerator = location.pathname === "/email-generator";

  const getDummyEmailEvents = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth(); 

    return [
      {
        id: 'email-dummy-1',
        post_date: new Date(year, month, 5).toISOString(),
        caption: 'Welcome Series - Day 1',
        platform: 'Email',
        type: 'Initial Mail',
        subject: 'Welcome to Our Platform!',
        body: 'Dear new user,\n\nWelcome to our platform! We are thrilled to have you join our community. Explore our features and let us know if you have any questions.'
      },
      {
        id: 'email-dummy-2',
        post_date: new Date(year, month, 12).toISOString(),
        caption: 'Follow-up on your recent activity',
        platform: 'Email',
        type: 'Follow Up Mail',
        subject: 'Quick Question About Your Recent Visit',
        body: 'Hi there,\n\nWe noticed you were Browse our services recently. Is there anything we can help you with or any questions you have?'
      },
      {
        id: 'email-dummy-3',
        post_date: new Date(year, month, 22).toISOString(),
        caption: 'Important Update: New Feature Launch',
        platform: 'Email',
        type: 'Notification Mail',
        subject: 'Exciting News: Introducing Our Latest Feature!',
        body: 'Hello valued customer,\n\nWe are excited to announce a new feature that will enhance your experience...'
      },
      {
        id: 'email-dummy-4',
        post_date: new Date(year, month, 28).toISOString(),
        caption: 'Confirmation: Your Subscription Renewal',
        platform: 'Email',
        type: 'Confirmation Mail',
        subject: 'Your Subscription Has Been Renewed!',
        body: 'Thank you for continuing your subscription with us. Your service has been successfully renewed for another year.'
      },
    ];
  };
  // --- End Dummy Email Event Data ---


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

  const allPostsForCurrentPath = isEmailGenerator
    ? [...postData, ...getDummyEmailEvents()]
    : postData;

  const currentMonthPosts = allPostsForCurrentPath.filter((post) => {
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
      type: post.type || 'General Post',
      subject: post.subject || '', 
      body: post.body || '',   
    });

    return acc;
  }, {});

  const renderCell = (day) => {
    const entries = postMap[day];
    if (!entries || entries.length === 0) return <div className="h-[80px]"><span></span></div>; // Empty span for empty cells

    return (
      <div className="rounded-md p-1 space-y-1">
        {entries.map((entry, idx) => (
          <div
            key={idx}
            className="flex items-center gap-1 px-2 py-1 text-[10px] font-medium border border-gray-300 rounded-sm overflow-hidden text-ellipsis whitespace-nowrap bg-white"
          >
            {!isEmailGenerator && entry.platforms.map((p, i) => {
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
            <span className="truncate whitespace-normal">{entry.caption}</span>
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
        <h2 className=" w-full text-2xl  font-bold text-[#1E293B]">Email Campaign Workflow with Scenarios</h2>
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
                  Week</button>
              </div>
            </div>
          </div>
          <div className=" grid grid-cols-7 gap-2">
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
              const inMonth = day > 0 && day <= new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
              const hasData = !!postMap[day] && postMap[day].length > 0; 
              const cellBorderClass = (() => {
                if (!inMonth) {
                  return 'border border-[#E2E8F0] bg-gray-50 text-gray-400';
                }
                if (hasData) {
                  if (isEmailGenerator) {
                    const firstEntryType = postMap[day][0]?.type;
                    switch (firstEntryType) {
                      case 'Initial Mail': return 'border-2 border-[#007BFF]';
                      case 'Follow Up Mail': return 'border-2 border-[#FFA500]';
                      case 'Confirmation Mail': return 'border-2 border-[#16A34A]';
                      case 'Notification Mail': return 'border-2 border-[#17A2B8]';
                      default: return 'border-2 border-[#3B82F6]';
                    }
                  } else {
                    return 'border-2 border-[#3B82F6]';
                  }
                }
                return 'border border-[#E2E8F0]';
              })();

              return (
                <div
                  key={i}
                  onClick={() => {
                    if (hasData && inMonth) {
                      const fullDate = new Date(
                        currentDate.getFullYear(),
                        currentDate.getMonth(),
                        day
                      );
                      setSelectedDate(fullDate);

                      if (isEmailGenerator) {
                        setSelectedEmailData(postMap[day]);
                        setIsEmailDetailsModalOpen(true);
                      } else {
                        setSelectedDayPosts(postMap[day]);
                        setIsAuthModalOpen(true);
                      }
                    }
                  }}
                  className={`min-h-[80px] rounded-lg p-1 text-[12px] text-[#0F172A] cursor-pointer ${cellBorderClass}`}
                >
                  <div className="font-medium text-right pr-1 text-xs">
                    {inMonth ? day : ""}
                  </div>
                  {inMonth && renderCell(day)}
                </div>
              );
            })}
          </div>
          {isEmailGenerator && (
            <div className="flex flex-wrap gap-2 py-4">
              {[
                {
                  label: "Initial Mail",
                  color: "text-[#007BFF]",
                  bg: "bg-[#007BFF1A]",
                  border: "border-[#007BFF]",
                },
                {
                  label: "Follow Up Mail",
                  color: "text-[#FFA500]",
                  bg: "bg-[#FFA5001A]",
                  border: "border-[#28A745]",
                },
                {
                  label: "Confirmation Mail",
                  color: "text-[#16A34A]",
                  bg: "bg-[#28A7451A]",
                  border: "border-[#16A34A]",
                },
                {
                  label: "Notification Mail",
                  color: "text-[#17A2B8]",
                  bg: "bg-[#17A2B81A]",
                  border: "border-[#17A2B8]",
                },
              ].map((chip, idx) => (
                <span
                  key={idx}
                  className={`border text-sm font-normal rounded-full px-4 py-1 ${chip.bg} ${chip.color} ${chip.border}`}
                >
                  {chip.label}
                </span>
              ))}
            </div>
          )}
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

      {isEmailDetailsModalOpen && (
        <EmailDetailsModal
          isOpen={isEmailDetailsModalOpen}
          onClose={() => setIsEmailDetailsModalOpen(false)}
          selectedDate={selectedDate}
          emailsForDate={selectedEmailData}
        />
      )}
    </div>
  );
}