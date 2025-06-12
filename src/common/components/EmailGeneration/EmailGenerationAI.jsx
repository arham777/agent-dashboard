import { useState, useCallback, useEffect } from "react";
import CalendarResult from "./CalenderResult";
import { toast } from "react-toastify";
import LabeledInput from "../ui/InputFields/ LabeledInput";
import { IoChevronDownOutline } from "react-icons/io5";

export default function EmailGenerationAI() {
  const [postData, setPostData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [companyName, setCompanyName] = useState("");
  const [companyObjective, setCompanyObjective] = useState("");
  const [targetAudience, setTargetAudience] = useState("");
  const [contentFocus, setContentFocus] = useState("");
  const [toneAndStyle, setToneAndStyle] = useState("");
  const [numEmails, setNumEmails] = useState("3");
  const [newlyGeneratedCampaign, setNewlyGeneratedCampaign] = useState(null);
  const [submittedApiContentFocus, setSubmittedApiContentFocus] = useState("");
  
  const [allCampaigns, setAllCampaigns] = useState([]);
  const [showHistoryDropdown, setShowHistoryDropdown] = useState(false);
  const [selectedCampaignId, setSelectedCampaignId] = useState(null);

  const contentFocusOptions = [
    "Complete campaign sequence",
    "Single mail",
    "Newsletter",
    "Promotional email",
  ];

  const ToneAndStyleOptions = ["Professional", "Friendly"];

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    try {
      const storedUser = localStorage.getItem("authenticatedUser");
      let userIdForFetch = null;
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          userIdForFetch =
            parsedUser.userId || parsedUser.data?.staffid?.toString();
        } catch (e) {
          console.error("Failed to parse stored user for fetchPosts:", e);
        }
      }
      if (!userIdForFetch) {
        console.warn(
          "User ID not found for fetchPosts, using default or proceeding without."
        );
      }

      const res = await fetch(
        `https://dev-ai.cybergen.com/Emails/${userIdForFetch}`
      );

      if (!res.ok) throw new Error("Failed to fetch campaigns");

      const data = await res.json();

      if (data && data.campaigns && Array.isArray(data.campaigns)) {
        setAllCampaigns(data.campaigns);
        
        const namedCampaigns = data.campaigns.filter(c => c.campaign?.campaign_strategy?.campaign_name);
        
        // Find the campaign with the highest ID from the named campaigns
        let highestIdCampaign = namedCampaigns.reduce(
          (highest, current) => (current.id > highest.id ? current : highest),
          { id: 0 } // Start with a dummy campaign
        );

        if (highestIdCampaign && highestIdCampaign.id > 0) {
          setSelectedCampaignId(highestIdCampaign.id);
          
          // Transform the campaign data to match expected format for CalendarResult
          if (highestIdCampaign.campaign && 
              highestIdCampaign.campaign.campaign_strategy && 
              highestIdCampaign.campaign.campaign_strategy.emails) {
            
            // Set the newlyGeneratedCampaign with the campaign data for display
            setNewlyGeneratedCampaign({ ...highestIdCampaign.campaign, id: highestIdCampaign.id });
            setPostData(highestIdCampaign.campaign.campaign_strategy.emails);

            if (highestIdCampaign.campaign.campaign_strategy.campaign_name) {
              setCompanyName(
                highestIdCampaign.campaign.campaign_strategy.campaign_name
              );
            }

            if (highestIdCampaign.campaign.campaign_strategy.content_focus) {
              const apiContentFocus =
                highestIdCampaign.campaign.campaign_strategy.content_focus;
              setSubmittedApiContentFocus(apiContentFocus);

              if (apiContentFocus === "complete_campaign_sequence") {
                setContentFocus("Complete campaign sequence");
              } else if (apiContentFocus === "single_email") {
                setContentFocus("Single mail");
              }
            }
          }
        }
      } else {
        setPostData([]);
        setNewlyGeneratedCampaign(null);
      }
    } catch (err) {
      console.error(err);
      toast.error("Unable to load calendar data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const handleCampaignSelect = (campaign) => {
    setSelectedCampaignId(campaign.id);
    setShowHistoryDropdown(false);
    
    // Transform the selected campaign data for display
    if (campaign.campaign && 
        campaign.campaign.campaign_strategy && 
        campaign.campaign.campaign_strategy.emails) {
      
      // Pass the whole object, including the ID
      setNewlyGeneratedCampaign({ ...campaign.campaign, id: campaign.id });
      setPostData(campaign.campaign.campaign_strategy.emails);

      if (campaign.campaign.campaign_strategy.campaign_name) {
        setCompanyName(campaign.campaign.campaign_strategy.campaign_name);
      }

      if (campaign.campaign.campaign_strategy.content_focus) {
        const apiContentFocus =
          campaign.campaign.campaign_strategy.content_focus;
        setSubmittedApiContentFocus(apiContentFocus);

        if (apiContentFocus === "complete_campaign_sequence") {
          setContentFocus("Complete campaign sequence");
        } else if (apiContentFocus === "single_email") {
          setContentFocus("Single mail");
        }
      }
    }
  };

  const handleSubmit = async () => {
    if (
      !companyName ||
      !companyObjective ||
      !targetAudience ||
      !contentFocus ||
      !toneAndStyle
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    let apiContentFocus = "";
    const lowerCaseContentFocus = contentFocus.toLowerCase();

    if (contentFocus === "Complete campaign sequence") {
      apiContentFocus = "complete_campaign_sequence";
    } else if (lowerCaseContentFocus === "single mail") {
      apiContentFocus = "single_email";
    } else if (
      lowerCaseContentFocus === "newsletter" ||
      lowerCaseContentFocus === "promotional email"
    ) {
      toast.error(
        `"${contentFocus}" is not a supported content focus. Please select "Complete campaign sequence" or "Single mail".`
      );
      return;
    } else {
      toast.error("Invalid content focus selected. Please try again.");
      return;
    }
    setSubmittedApiContentFocus(apiContentFocus);

    if (contentFocus === "Complete campaign sequence") {
      const emailCount = parseInt(numEmails);
      if (isNaN(emailCount) || emailCount < 2) {
        toast.error("Please enter at least 2 emails for campaign sequence");
        return;
      }
      if (emailCount > 10) {
        toast.error("Maximum 10 emails allowed for campaign sequence");
        return;
      }
    }

    setSubmitting(true);
    try {
      const storedUser = localStorage.getItem("authenticatedUser");
      let userIdForCampaign = null;
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          userIdForCampaign =
            parsedUser.userId || parsedUser.data?.staffid?.toString();
        } catch (e) {
          console.error(
            "Failed to parse stored user for campaign generation:",
            e
          );
        }
      }

      if (!userIdForCampaign) {
        toast.error("User ID not found. Please log in again.");
        setSubmitting(false);
        return;
      }

      const formData = new URLSearchParams();
      formData.append("user_id", userIdForCampaign);
      formData.append("client_name", companyName);
      formData.append("campaign_objective", companyObjective);
      formData.append("target_audience", targetAudience);
      formData.append("content_focus", apiContentFocus);
      formData.append(
        "num_emails",
        contentFocus === "Complete campaign sequence" ? parseInt(numEmails) : 1
      );

      if (toneAndStyle) {
        formData.append("tone_and_style", toneAndStyle.toLowerCase());
      }

      console.log(
        "Sending form data to /generate-campaign:",
        formData.toString()
      );

      const apiUrl = "https://dev-ai.cybergen.com/generate-campaign";

      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: formData,
      });

      const responseBody = await response.json();

      if (!response.ok) {
        let errorMessage = `Failed to generate campaign (HTTP ${response.status})`;
        console.error("Error response body:", responseBody);
        errorMessage =
          responseBody.detail ||
          responseBody.message ||
          responseBody.error ||
          JSON.stringify(responseBody) ||
          errorMessage;
        if (
          response.status === 422 &&
          typeof responseBody.detail === "string"
        ) {
          errorMessage = responseBody.detail;
        } else if (
          response.status === 422 &&
          Array.isArray(responseBody.detail)
        ) {
          errorMessage = responseBody.detail
            .map((err) => `${err.loc.join(".")} - ${err.msg}`)
            .join("; ");
        }
        throw new Error(errorMessage);
      }

      console.log("Successfully generated campaign data:", responseBody);

      let newCalendarItems = [];
      if (responseBody && Array.isArray(responseBody.emails)) {
        newCalendarItems = responseBody.emails;
      } else if (responseBody && Array.isArray(responseBody.posts)) {
        newCalendarItems = responseBody.posts;
      } else if (Array.isArray(responseBody)) {
        newCalendarItems = responseBody;
      } else {
        console.warn(
          "Generated campaign data from /generate-campaign is not in a recognized array format (e.g., response.emails, response.posts, or response itself being an array). The calendar might appear empty or not update as expected with only the new campaign.",
          responseBody
        );
        newCalendarItems = [];
      }

      setPostData(newCalendarItems);
      setNewlyGeneratedCampaign(responseBody);
      toast.success("Campaign generated successfully!");

      fetchPosts();
    } catch (error) {
      console.error("Error details:", error);
      toast.error(
        error.message || "Failed to generate campaign. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="overflow-y-auto flex flex-col px-6 text-[#475569]">
      <div className="py-2 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-[#475569]">
          Email Campaign AI Agent
        </h2>
      </div>
      <div className="flex flex-col md:flex-row gap-4 py-2">
        <div className="w-full md:w-[40%] bg-white rounded-xl p-4">
          <div className="flex flex-col gap-4">
            <div className="relative">
              <button
                onClick={() => setShowHistoryDropdown(!showHistoryDropdown)}
                className="w-full flex justify-between items-center px-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-md hover:bg-gray-100"
              >
                <span>Campaign History</span>
                <IoChevronDownOutline
                  className={`transition-transform ${showHistoryDropdown ? "rotate-180" : ""}`}
                />
              </button>

              {showHistoryDropdown && allCampaigns.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
                  {allCampaigns
                    .filter(campaign => campaign.campaign?.campaign_strategy?.campaign_name)
                    .map((campaign) => (
                    <div 
                      key={campaign.id}
                      onClick={() => handleCampaignSelect(campaign)}
                      className={`px-4 py-2 text-sm cursor-pointer hover:bg-gray-100 ${selectedCampaignId === campaign.id ? "bg-blue-50 text-blue-600" : ""}`}
                    >
                      {campaign.id}:{" "}
                      {campaign.campaign?.campaign_strategy?.campaign_name ||
                        "Unnamed Campaign"}
                    </div>
                  ))}
                </div>
              )}

              {showHistoryDropdown && allCampaigns.length === 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg">
                  <div className="px-4 py-2 text-sm text-gray-500">
                    No campaigns found
                  </div>
                </div>
              )}
            </div>

            <LabeledInput
              label="Company Name"
              name="companyName"
              placeholder="Enter company name here....."
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
            />

            <LabeledInput
              label="Campaign Objective"
              name="campaignObjective"
              placeholder="Product Promotion, Newsletter, Event Invitation, Abandoned Cart, Re-engagement"
              value={companyObjective}
              onChange={(e) => setCompanyObjective(e.target.value)}
            />

            <LabeledInput
              label="Target Audience"
              name="targetAudience"
              placeholder="Write your audience here"
              value={targetAudience}
              onChange={(e) => setTargetAudience(e.target.value)}
            />

            <LabeledInput
              label="Content Focus"
              name="contentFocus"
              placeholder="Complete campaign sequence or single mail"
              value={contentFocus}
              onChange={(e) => setContentFocus(e.target.value)}
              type="select"
              options={contentFocusOptions}
            />

            {contentFocus === "Complete campaign sequence" && (
              <LabeledInput
                label="Number of Emails"
                name="numEmails"
                type="number"
                placeholder="Enter number of emails (2-10)"
                value={numEmails}
                onChange={(e) => setNumEmails(e.target.value)}
              />
            )}

            <LabeledInput
              label="Tone and Style"
              name="toneAndStyle"
              placeholder="Professional or friendly"
              value={toneAndStyle}
              onChange={(e) => setToneAndStyle(e.target.value)}
              type="select"
              options={ToneAndStyleOptions}
            />
            <button
              className={`mt-12 w-full py-2 text-white font-medium cursor-pointer rounded-md bg-gradient-to-r from-[#02B4FE] to-[#0964F8] hover:opacity-90 transition ${submitting ? "opacity-50 cursor-not-allowed" : ""}`}
              onClick={handleSubmit}
              disabled={submitting}
            >
              {submitting ? "Generating..." : "Continue"}
            </button>
          </div>
        </div>

        <div className="w-full md:w-[60%]">
          <CalendarResult
            postData={postData}
            loading={loading}
            onPostCreated={fetchPosts}
            newlyGeneratedCampaign={newlyGeneratedCampaign}
            companyName={companyName}
            submittedApiContentFocus={submittedApiContentFocus}
          />
        </div>
      </div>
    </div>
  );
}
