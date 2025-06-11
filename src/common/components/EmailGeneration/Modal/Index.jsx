import { Dialog, Transition } from "@headlessui/react";
import React, { Fragment, useState, useEffect } from "react";
import { format } from "date-fns";
const RegenerateIcon = () => (
 <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
  <path d="M2.5 15.0016C2.5 15.4437 2.67559 15.8676 2.98816 16.1801C3.30072 16.4927 3.72464 16.6683 4.16667 16.6683C4.60869 16.6683 5.03262 16.4927 5.34518 16.1801C5.65774 15.8676 5.83333 15.4437 5.83333 15.0016C5.83333 14.5596 5.65774 14.1357 5.34518 13.8231C5.03262 13.5106 4.60869 13.335 4.16667 13.335C3.72464 13.335 3.30072 13.5106 2.98816 13.8231C2.67559 14.1357 2.5 14.5596 2.5 15.0016ZM14.1667 5.00163C14.1667 5.44366 14.3423 5.86758 14.6548 6.18014C14.9674 6.4927 15.3913 6.66829 15.8333 6.66829C16.2754 6.66829 16.6993 6.4927 17.0118 6.18014C17.3244 5.86758 17.5 5.44366 17.5 5.00163C17.5 4.5596 17.3244 4.13568 17.0118 3.82312C16.6993 3.51056 16.2754 3.33496 15.8333 3.33496C15.3913 3.33496 14.9674 3.51056 14.6548 3.82312C14.3423 4.13568 14.1667 4.5596 14.1667 5.00163Z" stroke="white" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M15.8337 6.66667V10.8333C15.8337 11.9384 15.3947 12.9982 14.6133 13.7796C13.8319 14.561 12.7721 15 11.667 15H9.16699M9.16699 15L11.667 12.5M9.16699 15L11.667 17.5M4.16699 13.3333V9.16667C4.16699 8.0616 4.60598 7.00179 5.38738 6.22039C6.16878 5.43899 7.22859 5 8.33366 5H10.8337M10.8337 5L8.33366 2.5M10.8337 5L8.33366 7.5" stroke="white" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
);


const CalendarIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 20 20"
    fill="currentColor"
    className="w-4 h-4 text-orange-500"
  >
    <path
      fillRule="evenodd"
      d="M5.25 2.75a.75.75 0 0 0-1.5 0v2.5a.75.75 0 0 0 1.5 0v-2.5ZM17.25 2.75a.75.75 0 0 0-1.5 0v2.5a.75.75 0 0 0 1.5 0v-2.5ZM2.75 6.75a.75.75 0 0 0 0 1.5h14.5a.75.75 0 0 0 0-1.5H2.75Z"
      clipRule="evenodd"
    />
    <path
      fillRule="evenodd"
      d="M12.47 10.47a.75.75 0 0 1 1.06 0L15.75 12.75V15A2.25 2.25 0 0 1 13.5 17.25h-8.5A2.25 2.25 0 0 1 2.75 15v-2.25L5.03 10.47a.75.75 0 0 1 1.06 0L8 12.19l2.47-2.47a.75.75 0 0 1 1.06 0Z"
      clipRule="evenodd"
    />
  </svg>
);

// Helper function to format tag labels
function formatTagLabel(tag) {
  if (!tag || typeof tag !== 'string') return 'Untyped';
  return tag
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

export default function MailSchedulerModal({ 
  isOpen, 
  onClose, 
  selectedDate, 
  scheduledEmailsForDate = [],
  onEmailRecomposed,
  userId,
  clientName,
  submittedApiContentFocus
}) {
  const [selectedTab, setSelectedTab] = useState("scheduled"); 
  
  const [campaignObjective, setCampaignObjective] = useState("Product Promotion");
  const [targetAudience, setTargetAudience] = useState("");
  const [toneAndStyle, setToneAndStyle] = useState("Professional or friendly");
  const [isComposing, setIsComposing] = useState(false);

  const displayScheduledEmail = scheduledEmailsForDate.length > 0
    ? scheduledEmailsForDate[0]
    : null;

  useEffect(() => {
    if (selectedTab === "compose") {
      if (displayScheduledEmail) {
        setCampaignObjective(displayScheduledEmail.campaign_objective || "Product Promotion");
      } else {
        setCampaignObjective("Product Promotion");
      }
      setTargetAudience("");
    }
  }, [selectedTab, displayScheduledEmail]);

  const handleComposeSubmit = async () => {
    if (!displayScheduledEmail || !displayScheduledEmail.id) {
      console.error("Cannot recompose: Original email ID is missing.");
      return;
    }
    if (!userId) {
      console.error("User ID is missing. Cannot generate email.");
      alert("User ID is missing. Please log in again or refresh the page.");
      return;
    }

    setIsComposing(true);
    
    console.log("Submitting compose with client_name:", clientName);
    
    // Prepare query parameters
    const queryParams = new URLSearchParams({
      user_id: userId,
      client_name: clientName,
      campaign_objective: campaignObjective,
      target_audience: targetAudience,
      tone_and_style: toneAndStyle.toLowerCase(), // Send as lowercase
      // content_focus is NOT sent to /generate-single-email as per API spec
    });
    
    const apiUrl = `http://10.229.220.15:8000/generate-single-email?${queryParams.toString()}`;

    // console.log("Payload for email generation:", payload); // Old log for body payload
    console.log("Sending request to generate-single-email with query params:", queryParams.toString());
    console.log("Full API URL:", apiUrl);

    try {
      // console.log("Sending request to generate-single-email..."); // Old log
      const response = await fetch(apiUrl, { // apiUrl now includes query params
        method: 'POST',
        // headers: {
        //   'Content-Type': 'application/json', // Not needed if no body
        // },
        // body: JSON.stringify(payload), // Parameters are now in the URL
      });

      if (!response.ok) {
        let errorMessage;
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.detail || `HTTP error! status: ${response.status}`;
        } catch (parseError) {
          // If JSON parsing fails, use status text
          errorMessage = `HTTP error! status: ${response.status} ${response.statusText}`;
          console.log("Error parsing JSON response:", parseError);
        }
        throw new Error(errorMessage);
      }

      console.log("Received successful response from generate-single-email");
      const newEmailData = await response.json();
      console.log("Parsed API response:", newEmailData);
      
      if (onEmailRecomposed) {
        console.log("Calling onEmailRecomposed with ID:", displayScheduledEmail.id);
        onEmailRecomposed(displayScheduledEmail.id, newEmailData);
      } else {
        console.error("onEmailRecomposed callback is not available");
      }
      
      console.log("Closing modal after successful email generation");
      onClose();

    } catch (error) {
      console.error("Failed to generate email:", error);
      // You could add a toast notification here if you have a toast library
    } finally {
      setIsComposing(false);
    }
  };

  const renderEmailBodyContent = (body) => {
    if (!body) return <p>No email body content.</p>;

    return body.split('\n').map((line, index) => {
      if (line.startsWith('✅')) {
        return (
          <div key={index} className="flex items-center gap-1 text-gray-700">
            ✅
            <span className="text-sm">{line.substring(2).trim()}</span>
          </div>
        );
      }
      if (line.startsWith('🗓️')) {
        return (
          <div key={index} className="flex items-center gap-1 text-gray-700">
            <CalendarIcon />
            <span className="text-sm">{line.substring(2).trim()}</span>
          </div>
        );
      }
      if (line.startsWith('⏰')) {
        return (
          <div key={index} className="flex items-center gap-1 text-gray-700">
            ⏰
            <span className="text-sm">{line.substring(2).trim()}</span>
          </div>
        );
      }
      if (line.startsWith('📍')) {
        return (
          <div key={index} className="flex items-center gap-1 text-gray-700">
            📍
            <span className="text-sm">{line.substring(2).trim()}</span>
          </div>
        );
      }
      if (line.startsWith('⭐')) {
        return (
          <div key={index} className="flex items-center gap-1 text-gray-700">
            🎁
            <span className="text-sm">{line.substring(2).trim()}</span>
          </div>
        );
      }

      if (line.startsWith('**') && line.endsWith('**') && line.length > 4) {
        const boldContent = line.substring(2, line.length - 2);
        return (
          <p key={index} className="text-sm text-gray-700 whitespace-pre-wrap">
            <strong>{boldContent}</strong>
          </p>
        );
      }
      
      return (
        <p key={index} className="text-sm text-gray-700 whitespace-pre-wrap">
          {line}
        </p>
      );
    });
  };


  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 backdrop-blur-sm bg-opacity-50" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-lg transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all relative">
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-gray-800">
                    {selectedDate ? format(selectedDate, "dd MMMM yyyy") : "Date Unavailable"}
                  </h3>
                </div>

                <div className="flex bg-gray-100 rounded-lg p-1 mb-6">
                  <button
                    className={`flex-1 px-4 py-2 text-base font-medium rounded-lg transition-colors duration-200 ${
                      selectedTab === "scheduled"
                        ? "bg-blue-600 text-white shadow"
                        : "text-gray-700 hover:bg-gray-200"
                    }`}
                    onClick={() => setSelectedTab("scheduled")}
                  >
                    Scheduled Mail
                  </button>
                  <button
                    className={`flex-1 px-4 py-2 text-base font-medium rounded-lg transition-colors duration-200 ${
                      selectedTab === "compose"
                        ? "bg-blue-600 text-white shadow"
                        : "text-gray-700 hover:bg-gray-200"
                    }`}
                    onClick={() => setSelectedTab("compose")}
                  >
                    Compose New Mail
                  </button>
                </div>

                {selectedTab === "scheduled" && (
                  displayScheduledEmail ? (
                    <div className="space-y-4 px-2">
                      <span className="inline-block border border-[#007BFF] text-[#007BFF] text-sm font-semibold px-2.5 py-1.5 rounded-full">
                        <span className="text-md">•</span> {formatTagLabel(displayScheduledEmail.type)}
                      </span>
                    <div className="border p-3 rounded-sm border-gray-200">
                      <div>
                        <p className="font-semibold text-[#344054] mb-3 text-sm">Subject Line:</p>
                        <p className="text-base text-sm mb-3 text-[#344054]">
                          {displayScheduledEmail.subject}
                        </p>
                      </div>
                      <div>
                        <p className="font-semibold text-[#344054] mb-3 text-sm">Email Body:</p>
                        <div className="mt-1 space-y-1 text-[#344054]">
                          {renderEmailBodyContent(displayScheduledEmail.body)}
                        </div>
                      </div>
                      </div>

                        <button className="px-6 w-full  py-2 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition duration-200 flex justify-center items-center gap-2">
                          <RegenerateIcon />
                          Regenerate
                        </button>
                    </div>
                  ) : (
                    <div className="text-center py-10">
                      <p className="text-gray-500">No email scheduled for this date.</p>
                    </div>
                  )
                )}

                {selectedTab === "compose" && (
                  <div className="space-y-5 px-2">
                    <div>
                      <label htmlFor="campaignObjective" className="block text-gray-700 text-sm font-semibold mb-2">Campaign Objective</label>
                      <select 
                        id="campaignObjective"
                        name="campaignObjective"
                        value={campaignObjective}
                        onChange={(e) => setCampaignObjective(e.target.value)}
                        className="mt-1 border block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                      >
                        <option>Product Promotion</option>
                        <option>Newsletter</option>
                        <option>Event Invitation</option>
                        <option>Abandon Cart Recovery</option>
                        <option>Welcome Series</option>
                        <option>Confirmation</option>
                        <option>Notification</option>
                      </select>
                    </div>

                    <div>
                      <label htmlFor="targetAudience" className="block text-gray-700 text-sm font-semibold mb-2">Target Audience</label>
                      <input
                        type="text"
                        id="targetAudience"
                        name="targetAudience"
                        placeholder="e.g., Tech enthusiasts, previous customers"
                        value={targetAudience}
                        onChange={(e) => setTargetAudience(e.target.value)}
                        className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label htmlFor="toneAndStyle" className="block text-gray-700 text-sm font-semibold mb-2">Tone and Style</label>
                      <select 
                        id="toneAndStyle"
                        name="toneAndStyle"
                        value={toneAndStyle}
                        onChange={(e) => setToneAndStyle(e.target.value)}
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 border focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                      >
                        <option>Professional or friendly</option>
                        <option>Professional</option>
                        <option>Friendly</option>
                        <option>Casual</option>
                        <option>Formal</option>
                      </select>
                    </div>

                      <button 
                        onClick={handleComposeSubmit}
                        disabled={isComposing}
                        className="px-6 w-full py-2 bg-blue-500 text-white rounded-lg shadow hover:bg-blue-600 transition duration-200 disabled:opacity-50"
                      >
                        {isComposing ? (
                          <span className="flex items-center justify-center">
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Generating Email...
                          </span>
                        ) : "Compose"}
                      </button>
                  </div>
                )}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}