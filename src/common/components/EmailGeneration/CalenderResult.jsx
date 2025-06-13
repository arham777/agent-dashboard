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

// Helper function for simple string hashing
function simpleHash(str) {
  let hash = 0;
  if (!str || str.length === 0) return hash;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0; // Convert to 32bit integer
  }
  return Math.abs(hash);
}

const dynamicColorPalette = [
  { color: "text-purple-600", bg: "bg-purple-100", border: "border-purple-600" },
  { color: "text-pink-600", bg: "bg-pink-100", border: "border-pink-600" },
  { color: "text-teal-600", bg: "bg-teal-100", border: "border-teal-600" },
  { color: "text-indigo-600", bg: "bg-indigo-100", border: "border-indigo-600" },
  { color: "text-yellow-700", bg: "bg-yellow-100", border: "border-yellow-700" },
  { color: "text-cyan-600", bg: "bg-cyan-100", border: "border-cyan-600" },
  { color: "text-lime-600", bg: "bg-lime-100", border: "border-lime-600" },
];

function formatTagLabel(tag) {
  if (!tag || typeof tag !== 'string') return 'Untyped';
  return tag
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

function extractClientName(data) {
  if (!data) return null;
  if (typeof data.client_name === 'string') return data.client_name;
  if (typeof data.clientName === 'string') return data.clientName;
  if (typeof data.client === 'string') return data.client;
  
  if (data.campaign_strategy) {
    if (typeof data.campaign_strategy.client_name === 'string') return data.campaign_strategy.client_name;
    if (typeof data.campaign_strategy.clientName === 'string') return data.campaign_strategy.clientName;
    if (typeof data.campaign_strategy.client === 'string') return data.campaign_strategy.client;
  }

  if (data.metadata && typeof data.metadata.client_name === 'string') return data.metadata.client_name;
  if (data.metadata && typeof data.metadata.clientName === 'string') return data.metadata.clientName;
  
  if (data.campaign_strategy && Array.isArray(data.campaign_strategy.emails) && data.campaign_strategy.emails.length > 0) {
    const firstEmail = data.campaign_strategy.emails[0];
    if (typeof firstEmail.client_name === 'string') return firstEmail.client_name;
    if (typeof firstEmail.clientName === 'string') return firstEmail.clientName;
  }
  
  return null; 
}

export default function CalendarResult({
  postData = [],
  loading,
  onPostCreated,
  newlyGeneratedCampaign,
  companyName = "",
  submittedApiContentFocus = "",
}) {
  const [viewMode, setViewMode] = React.useState("calendar");
  const [isAuthModalOpen, setIsAuthModalOpen] = React.useState(false);
  const [isEmailDetailsModalOpen, setIsEmailDetailsModalOpen] = useState(false);
  const [selectedEmailData, setSelectedEmailData] = useState(null);
  const [processedPosts, setProcessedPosts] = useState([]);
  const [emailTypes, setEmailTypes] = useState([]);

  const daysOfWeek = ["Sun", "Mon", "Tues", "Wed", "Thurs", "Fri", "Sat"];
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDateForModal, setSelectedDateForModal] = useState(null);

  const location = useLocation();
  const isEmailGenerator = location.pathname === "/email-generator";

  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("authenticatedUser");
    let userIdFromStorage = null;
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        userIdFromStorage = parsedUser.userId || parsedUser.data?.staffid?.toString();
        setUserId(userIdFromStorage);
      } catch (e) {
        console.error("Failed to parse stored user in CalenderResult:", e);
      }
    }
  }, []);

  const handleExportEmails = () => {
    if (!processedPosts || processedPosts.length === 0) {
      alert("No emails to export."); 
      return;
    }

    const headers = [
      "ID",
      "Post Date",
      "Subject",
      "Body",
      "Type",
      "Campaign Objective",
      "Target Audience",
      "Client Name",
      "Timing Info"
    ];

    const escapeCsvCell = (cellData) => {
      if (cellData === null || cellData === undefined) {
        return '';
      }
      const stringData = String(cellData);
      if (stringData.includes(',') || stringData.includes('\n') || stringData.includes('"')) {
        return `"${stringData.replace(/"/g, '""')}"`;
      }
      return stringData;
    };

    const rows = processedPosts.map(post => {
      const postDate = new Date(post.post_date);
      const formattedDate = !isNaN(postDate.getTime())
        ? postDate.toLocaleDateString('en-CA') 
        : 'Invalid Date';

      const singleLineBody = post.body ? String(post.body).replace(/\r\n|\r|\n/g, ' ') : '';

      return [
        escapeCsvCell(post.id),
        escapeCsvCell(formattedDate),
        escapeCsvCell(post.subject || post.caption),
        escapeCsvCell(singleLineBody), 
        escapeCsvCell(post.type),
        escapeCsvCell(post.campaign_objective),
        escapeCsvCell(post.target_audience),
        escapeCsvCell(post.client_name),
        escapeCsvCell(post.originalApiData?.timing || post.timing || '') 
      ].join(',');
    });

    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");

    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", "email_campaign_export.csv");
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } else {
      alert("CSV export is not supported in this browser.");
    }
  };

  useEffect(() => {
    if (newlyGeneratedCampaign) {
      console.log("newlyGeneratedCampaign structure:", JSON.stringify(newlyGeneratedCampaign, null, 2));
    }
  }, [newlyGeneratedCampaign]);

  useEffect(() => {
    if (companyName) {
      console.log("CalendarResult received companyName:", companyName);
    }
  }, [companyName]);

  function transformApiEmailToPost(
    apiEmail, 
    campaignStartDate, 
    emailIndex, 
    campaignObjective, 
    targetAudience, 
    clientNameFromCampaign,
    campaignId
  ) {
    let postDate;
    const { timing } = apiEmail; 
    const effectiveCampaignStartDate = campaignStartDate || new Date(); // Base for "Day X" or ultimate fallback

    if (timing) {
      // Check for ISO date format YYYY-MM-DD
      const isoDateMatch = typeof timing === 'string' && timing.match(/^(\d{4})-(\d{2})-(\d{2})$/);
      if (isoDateMatch) {
        const year = parseInt(isoDateMatch[1], 10);
        const month = parseInt(isoDateMatch[2], 10) - 1; // JavaScript months are 0-indexed
        const day = parseInt(isoDateMatch[3], 10);
        const parsed = new Date(year, month, day);
        if (!isNaN(parsed.getTime())) {
          postDate = parsed;
        }
      }

      if (!postDate) {
        const specificDateMatch = timing.match(/^Send on (\w+) (\d{1,2}), (\d{4})/i);
        if (specificDateMatch) {
          const monthName = specificDateMatch[1];
          const day = parseInt(specificDateMatch[2], 10);
          const year = parseInt(specificDateMatch[3], 10);
          const monthIndex = new Date(Date.parse(monthName + " 1, 2000")).getMonth();
          if (!isNaN(day) && !isNaN(year) && !isNaN(monthIndex)) {
            const parsed = new Date(year, monthIndex, day);
            if (!isNaN(parsed.getTime())) {
              postDate = parsed;
            }
          }
        }
      }
      
      if (!postDate) {
        const timingLower = timing.toLowerCase();
        if (timingLower.startsWith('day ')) {
          const dayNumber = parseInt(timingLower.replace('day ', ''), 10);
          if (!isNaN(dayNumber)) {
            postDate = new Date(effectiveCampaignStartDate);
            postDate.setDate(effectiveCampaignStartDate.getDate() + dayNumber - 1);
          }
        }
      }
    }

    if (!postDate) {
      postDate = new Date(effectiveCampaignStartDate);
      postDate.setDate(effectiveCampaignStartDate.getDate() + emailIndex);
    }
    postDate.setHours(0, 0, 0, 0);

    return {
      id: `campaign-${campaignId}-email-${apiEmail.email_number || emailIndex}`,
      post_date: postDate.toISOString(),
      caption: apiEmail.subject_line || apiEmail.tag || 'Untitled Email',
      platform: 'Email',
      type: apiEmail.tag || 'General Email',
      subject: apiEmail.subject_line || '',
      body: apiEmail.email_content || '',
      originalApiData: apiEmail,
      campaign_objective: campaignObjective,
      target_audience: targetAudience,
      client_name: clientNameFromCampaign || companyName || apiEmail.client_name || apiEmail.clientName || 'DefaultClient',
      
      campaign_id: campaignId,
      email_number: apiEmail.email_number,
    };
  }
  
  useEffect(() => {
    let combinedPosts = [...postData];
    let firstCampaignEmailDate = null;

    if (newlyGeneratedCampaign && newlyGeneratedCampaign.campaign_strategy && newlyGeneratedCampaign.campaign_strategy.emails) {
      const campaignStartDateFromEffect = new Date();
      
      const { campaign_objective, target_audience } = newlyGeneratedCampaign.campaign_strategy;
      const campaignId = newlyGeneratedCampaign.id;
      
      let clientNameForEmails = companyName;
      
      if (!clientNameForEmails) {
        const extractedClientName = extractClientName(newlyGeneratedCampaign);
        console.log("No companyName prop, extracted client name:", extractedClientName);
        clientNameForEmails = extractedClientName;
      } else {
        console.log("Using companyName prop for emails:", clientNameForEmails);
      }
      
      const transformedNewEmails = newlyGeneratedCampaign.campaign_strategy.emails.map((email, index) => 
        transformApiEmailToPost(
          email, 
          campaignStartDateFromEffect, 
          index, 
          campaign_objective, 
          target_audience, 
          clientNameForEmails,
          campaignId
        )
      );

      if (transformedNewEmails.length > 0) {
        const dateOfFirst = new Date(transformedNewEmails[0].post_date);
        if(!isNaN(dateOfFirst.getTime())) {
            firstCampaignEmailDate = dateOfFirst;
        }
      }

      const newEmailIds = new Set(transformedNewEmails.map(ne => ne.id));
      combinedPosts = [
        ...transformedNewEmails,
        ...combinedPosts.filter(p => !newEmailIds.has(p.id) && p.platform === 'Email')
      ];
    } else {
      combinedPosts = combinedPosts.filter(p => p.platform === 'Email');
    }
    
    if (combinedPosts.length > 0) {
      console.log("First processed post client_name:", combinedPosts[0].client_name);
    }
    
    setProcessedPosts(combinedPosts);

    if (isEmailGenerator) {
      const types = [...new Set(combinedPosts.map(p => p.type).filter(Boolean))];
      setEmailTypes(types);

      if (firstCampaignEmailDate) {
        if (currentDate.getFullYear() !== firstCampaignEmailDate.getFullYear() ||
            currentDate.getMonth() !== firstCampaignEmailDate.getMonth()) {
          setCurrentDate(new Date(firstCampaignEmailDate.getFullYear(), firstCampaignEmailDate.getMonth(), 1));
        }
      }
    }
  }, [postData, newlyGeneratedCampaign, isEmailGenerator]); 

  const handleEmailRecomposed = (originalEmailId, newEmailApiData) => {
    console.log("handleEmailRecomposed called with:", originalEmailId);
    console.log("New email data:", newEmailApiData);
    
    setProcessedPosts(prevPosts => {
      const postIndex = prevPosts.findIndex(p => p.id === originalEmailId);
      if (postIndex === -1) {
        console.warn("Original email not found for recomposition:", originalEmailId);
        console.log("Available post IDs:", prevPosts.map(p => p.id));
        return prevPosts;
      }

      const originalPost = prevPosts[postIndex];
      console.log("Original post found:", originalPost);
      
      const clientNameFromResponse = extractClientName(newEmailApiData) || originalPost.client_name;

      let emailDetailsToUse = newEmailApiData;
      let campaignObjectiveToUse = newEmailApiData.campaign_objective; 
      let targetAudienceToUse = newEmailApiData.target_audience;   

      if (newEmailApiData.campaign_strategy && 
          Array.isArray(newEmailApiData.campaign_strategy.emails) && 
          newEmailApiData.campaign_strategy.emails.length > 0) {
        
        emailDetailsToUse = newEmailApiData.campaign_strategy.emails[0];
        console.log("Using nested email details from API response:", emailDetailsToUse);

        if (newEmailApiData.campaign_strategy.campaign_objective) {
          campaignObjectiveToUse = newEmailApiData.campaign_strategy.campaign_objective;
        }
        if (newEmailApiData.campaign_strategy.target_audience) {
          targetAudienceToUse = newEmailApiData.campaign_strategy.target_audience;
        }
      } else {
        console.log("Using flat email details from API response (or direct object if not API like structure):", emailDetailsToUse);
      }
      
      const recomposedEmail = {
        ...originalPost,
        id: originalPost.id,
        post_date: originalPost.post_date, 
        
        caption: emailDetailsToUse.subject_line || emailDetailsToUse.tag || 'Recomposed Email',
        subject: emailDetailsToUse.subject_line || '',
        body: emailDetailsToUse.email_content || '',
        type: emailDetailsToUse.tag || originalPost.type || 'General Email',
        
        campaign_objective: campaignObjectiveToUse || originalPost.campaign_objective,
        target_audience: targetAudienceToUse || originalPost.target_audience,
        client_name: clientNameFromResponse, 
        
        campaign_id: originalPost.campaign_id,
        email_number: originalPost.email_number,

        originalApiData: newEmailApiData, // Store the full raw response for reference
        // Preserve any timing information from original post, as the slot in calendar is fixed
        timing: originalPost.timing, 
      };

      console.log("Recomposed email object:", recomposedEmail);

      const updatedPosts = [...prevPosts];
      updatedPosts[postIndex] = recomposedEmail;
      console.log("Updated posts array with replacement at index:", postIndex);
      
      return updatedPosts;
    });
    
    
    setIsEmailDetailsModalOpen(false);
  };

  const getTagStyle = (type) => {
    if (!type) return { label: 'Untyped', color: "text-gray-700", bg: "bg-gray-100", border: "border-gray-400" };

    switch (type) {
      case 'Initial Mail': 
      case 'initial_mail': 
        return { label: "Initial Mail", color: "text-[#007BFF]", bg: "bg-[#007BFF1A]", border: "border-[#007BFF]" };
      case 'Follow Up Mail': 
      case 'follow_up_mail': 
        return { label: "Follow Up Mail", color: "text-[#FFA500]", bg: "bg-[#FFA5001A]", border: "border-[#FFA500]" };
      case 'Confirmation Mail': 
      case 'confirmation_mail': 
        return { label: "Confirmation Mail", color: "text-[#28A745]", bg: "bg-[#28A7451A]", border: "border-[#28A745]" };
      case 'Notification Mail': 
      case 'notification_mail': 
        return { label: "Notification Mail", color: "text-[#DC3545]", bg: "bg-[#DC35451A]", border: "border-[#DC3545]" };
      default: {
        const hash = simpleHash(type);
        const selectedStyle = dynamicColorPalette[hash % dynamicColorPalette.length];
        return { label: formatTagLabel(type), ...selectedStyle };
      }
    }
  };

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
      <div className="rounded-md p-1 space-y-1 h-[80px] overflow-hidden">
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
            className={`flex items-start gap-1 px-2 py-1 text-[10px] font-medium border rounded-sm overflow-hidden cursor-pointer ${entry.platform === 'Email' || (entry.platforms && entry.platforms.includes('Email')) ? 'hover:bg-gray-100' : ''}`}
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
            <span className="line-clamp-2">{entry.caption}</span>
          </div>
        ))}
      </div>
    );
  };

  let clientNameToPass;
  if (companyName) {
    clientNameToPass = companyName;
  } else if (selectedEmailData && selectedEmailData.client_name) {
    clientNameToPass = selectedEmailData.client_name;
  } else if (selectedEmailData) {
    console.warn("client_name not found on selectedEmailData. ID:", selectedEmailData.id);
    clientNameToPass = "Client"; 
  } else {
    clientNameToPass = "Client";
  }

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
          <button 
            onClick={handleExportEmails} 
            className="px-4 py-1.5 rounded-md text-white font-medium bg-gradient-to-r from-[#02B4FE] to-[#0964F8] hover:opacity-90 transition"
          >
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
                if (hasData && isEmailGenerator && entriesForCell[0]?.type) {
                  const firstEntryType = entriesForCell[0].type;
                  const style = getTagStyle(firstEntryType);
                  return `border-2 ${style.border} bg-white`; 
                }
                return 'border border-gray-300 bg-white';
              })();

              return (
                <div
                  key={i}
                  className={`h-[100px] p-1 text-left align-top ${cellBorderClass}`}
                  onClick={() => {
                    if(inMonth) {
                      const firstEntry = entriesForCell && entriesForCell.length > 0 ? entriesForCell[0] : null;
                      setSelectedEmailData(firstEntry); 
                      setSelectedDateForModal(date);
                      setIsEmailDetailsModalOpen(true);
                    }
                  }}
                >
                  <span className={`block text-sm ${inMonth ? 'text-gray-700' : 'text-gray-400'}`}>{inMonth ? dayOfMonth : ''}</span>
                  {inMonth && renderCell(dayOfMonth)} 
                </div>
              );
            })}
          </div>
          {isEmailGenerator && emailTypes.length > 0 && (
            <div className="flex flex-wrap gap-2 py-4">
              {emailTypes.map((type) => {
                const style = getTagStyle(type);
                return (
                  <span
                    key={type}
                    className={`border text-sm font-normal rounded-full px-4 py-1 ${style.bg} ${style.color} ${style.border}`}
                  >
                    {style.label}
                  </span>
                );
              })}
            </div>
          )}
        </>
      ) : (
        <MonthlyPostResults
          posts={currentMonthPosts}
          onPostCreated={() => {
            if (onPostCreated) onPostCreated();
          }}
        />
      )}
      {isAuthModalOpen && (
        <AuthModal
          onClose={() => setIsAuthModalOpen(false)}
          scheduledPosts={[]}
          selectedDate={selectedDateForModal}
          onPostCreated={() => {
            // setIsAuthModalOpen(false);
            if (onPostCreated) onPostCreated();
          }}
        />
      )}

      {isEmailDetailsModalOpen && (
        <EmailDetailsModal
          isOpen={isEmailDetailsModalOpen}
          onClose={() => setIsEmailDetailsModalOpen(false)}
          selectedDate={selectedDateForModal}
          scheduledEmailsForDate={selectedEmailData ? [selectedEmailData] : []}
          userId={userId}
          clientName={clientNameToPass} 
          onEmailRecomposed={handleEmailRecomposed}
          submittedApiContentFocus={submittedApiContentFocus}
        />
      )}
    </div>
  );
}