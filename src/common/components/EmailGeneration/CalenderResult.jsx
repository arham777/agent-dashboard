import React, { useState, useEffect } from "react";
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
  newlyGeneratedCampaign,
}) {
  const [viewMode, setViewMode] = React.useState("calendar");
  const [isAuthModalOpen, setIsAuthModalOpen] = React.useState(false);
  const [isEmailDetailsModalOpen, setIsEmailDetailsModalOpen] = useState(false);
  const [selectedEmailData, setSelectedEmailData] = useState(null);
  const [processedPosts, setProcessedPosts] = useState([]);

  const daysOfWeek = ["Sun", "Mon", "Tues", "Wed", "Thurs", "Fri", "Sat"];
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDateForModal, setSelectedDateForModal] = useState(null);

  const location = useLocation();
  const isEmailGenerator = location.pathname === "/email-generator";

  const getDummyEmailEvents = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth(); 

    return [
   
    ];
  };
  // --- End Dummy Email Event Data ---

  function transformApiEmailToPost(apiEmail, campaignStartDate, emailIndex, campaignObjective, targetAudience) {
    let postDate;
    const timingLower = apiEmail.timing?.toLowerCase();
    const effectiveCampaignStartDate = campaignStartDate || new Date(); 

    if (timingLower && timingLower.startsWith('day ')) {
      const dayNumber = parseInt(timingLower.replace('day ', ''), 10);
      if (!isNaN(dayNumber)) {
        postDate = new Date(effectiveCampaignStartDate);
        postDate.setDate(effectiveCampaignStartDate.getDate() + dayNumber - 1);
      } else {
        postDate = new Date(effectiveCampaignStartDate);
        postDate.setDate(effectiveCampaignStartDate.getDate() + emailIndex);
      }
    } else if (apiEmail.timing) {
      const parsedDate = new Date(apiEmail.timing);
      if (!isNaN(parsedDate.getTime())) {
        postDate = parsedDate;
      } else {
        postDate = new Date(effectiveCampaignStartDate);
        postDate.setDate(effectiveCampaignStartDate.getDate() + emailIndex);
      }
    } else {
      postDate = new Date(effectiveCampaignStartDate);
      postDate.setDate(effectiveCampaignStartDate.getDate() + emailIndex);
    }

    return {
      id: `new-email-${apiEmail.email_number || emailIndex}-${Date.now()}`,
      post_date: postDate.toISOString(),
      caption: apiEmail.subject_line || apiEmail.tag || 'Untitled Email',
      platform: 'Email',
      type: apiEmail.tag || 'General Email',
      subject: apiEmail.subject_line || '',
      body: apiEmail.email_content || '',
      originalApiData: apiEmail,
      campaign_objective: campaignObjective,
      target_audience: targetAudience,
    };
  }

  useEffect(() => {
    let combinedPosts = [...postData];
    const dummyEmails = isEmailGenerator ? getDummyEmailEvents() : [];
    const postDataIds = new Set(postData.map(p => p.id));
    const uniqueDummyEmails = dummyEmails.filter(de => !postDataIds.has(de.id));
    combinedPosts = [...combinedPosts, ...uniqueDummyEmails];

    if (newlyGeneratedCampaign && newlyGeneratedCampaign.campaign_strategy && newlyGeneratedCampaign.campaign_strategy.emails) {
      const campaignStartDate = new Date();
      const { campaign_objective, target_audience } = newlyGeneratedCampaign.campaign_strategy;
      const transformedNewEmails = newlyGeneratedCampaign.campaign_strategy.emails.map((email, index) => 
        transformApiEmailToPost(email, campaignStartDate, index, campaign_objective, target_audience)
      );
      const newEmailIds = new Set(transformedNewEmails.map(ne => ne.id));
      combinedPosts = [
        ...transformedNewEmails,
        ...combinedPosts.filter(p => !newEmailIds.has(p.id))
      ];
    }
    setProcessedPosts(combinedPosts);
  }, [postData, newlyGeneratedCampaign, isEmailGenerator]);

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

  const allPostsForCurrentPath = processedPosts;

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

    const platforms = typeof post.platform === 'string' ? post.platform.split(",").map((p) => p.trim()) : ['Email'];

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
    if (!entries || entries.length === 0) return <div className="h-[80px]"><span></span></div>;

    return (
      <div className="rounded-md p-1 space-y-1 h-[80px] overflow-y-auto">
        {entries.map((entry, idx) => (
          <div
            key={entry.id || idx}
            onClick={() => {
              if (entry.platform === 'Email' || (entry.platforms && entry.platforms.includes('Email'))) {
                setSelectedEmailData(entry);
                setSelectedDateForModal(new Date(entry.post_date));
                setIsEmailDetailsModalOpen(true);
              }
            }}
            className={`flex items-center gap-1 px-2 py-1 text-[10px] font-medium border rounded-sm overflow-hidden text-ellipsis whitespace-nowrap cursor-pointer ${entry.platform === 'Email' || (entry.platforms && entry.platforms.includes('Email')) ? 'hover:bg-gray-100' : ''}`}
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
              const dayOfMonth = i - new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay() + 1;
              const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), dayOfMonth);
              const inMonth = date.getMonth() === currentDate.getMonth();
              
              const entriesForCell = inMonth ? postMap[dayOfMonth] : [];
              const hasData = entriesForCell && entriesForCell.length > 0;

              const cellBorderClass = (() => {
                if (!inMonth) {
                  return 'border border-[#E2E8F0] bg-gray-50 text-gray-400';
                }
                if (hasData && isEmailGenerator) {
                  const firstEntryType = entriesForCell[0]?.type;
                  switch (firstEntryType) {
                    case 'Initial Mail': return 'border-2 border-[#007BFF]';
                    case 'Follow Up Mail': return 'border-2 border-[#FFA500]';
                    case 'Confirmation Mail': return 'border-2 border-[#28A745]';
                    case 'Notification Mail': return 'border-2 border-[#DC3545]';
                    default: return 'border border-gray-300 bg-white';
                  }
                }
                return 'border border-gray-300 bg-white';
              })();

              return (
                <div
                  key={i}
                  className={`h-[100px] p-1 text-left align-top ${cellBorderClass}`}
                  onClick={() => {
                    if(inMonth) setSelectedDateForModal(date);
                  }}
                >
                  <span className={`block text-sm ${inMonth ? 'text-gray-700' : 'text-gray-400'}`}>{inMonth ? dayOfMonth : ''}</span>
                  {inMonth && renderCell(dayOfMonth)} 
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
          posts={currentMonthPosts}
          onPostCreated={() => {
            onPostCreated();
          }}
        />
      )}
      {isAuthModalOpen && (
        <AuthModal
          onClose={() => setIsAuthModalOpen(false)}
          scheduledPosts={[]}
          selectedDate={selectedDateForModal}
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
          selectedDate={selectedDateForModal}
          scheduledEmailsForDate={selectedEmailData ? [selectedEmailData] : []}
        />
      )}
    </div>
  );
}