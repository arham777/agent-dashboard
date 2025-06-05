import { useState, useCallback, useEffect } from "react";
import CalendarResult from "./CalenderResult";
import { toast } from "react-toastify";
import LabeledInput from "../ui/InputFields/ LabeledInput";

export default function EmailGenerationAI() {
  const [postData, setPostData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [companyName, setCompanyName] = useState("");
  const [companyObjective, setCompanyObjective] = useState("");
  const [targetAudience, setTargetAudience] = useState("");
  const [contentFocus, setContentFocus] = useState("");
  const [toneAndStyle, setToneAndStyle] = useState("");
  const [numEmails, setNumEmails] = useState("3"); // Changed to string to handle empty input
  const [newlyGeneratedCampaign, setNewlyGeneratedCampaign] = useState(null);
  const [submittedApiContentFocus, setSubmittedApiContentFocus] = useState("");

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
      // Attempt to get user_id from localStorage as before for fetchPosts
      const storedUser = localStorage.getItem("authenticatedUser");
      let userIdForFetch = null;
      if (storedUser) {
        try {
            const parsedUser = JSON.parse(storedUser);
            userIdForFetch = parsedUser.userId || parsedUser.data?.staffid?.toString();
        } catch (e) {
            console.error("Failed to parse stored user for fetchPosts:", e);
        }
      }
      if (!userIdForFetch) {
        // Fallback or error if needed for fetchPosts, using a default if not critical
        console.warn("User ID not found for fetchPosts, using default or proceeding without.");
        // If fetchPosts absolutely needs a user_id and none is found, you might want to toast.error or return.
        // For now, let it try to fetch if the endpoint supports it or if it's not critical.
      }
      const res = await fetch(
        `http://10.229.220.15:8000/get-user-posts${userIdForFetch ? `?user_id=${userIdForFetch}` : ''}`
      );
      if (!res.ok) throw new Error("Failed to fetch posts");
      const data = await res.json();
      setPostData(data);
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

  const handleSubmit = async () => {
    if (!companyName || !companyObjective || !targetAudience || !contentFocus || !toneAndStyle) {
      toast.error("Please fill in all required fields");
      return;
    }

    let apiContentFocus = "";
    const lowerCaseContentFocus = contentFocus.toLowerCase();

    if (contentFocus === "Complete campaign sequence") {
      apiContentFocus = "complete_campaign_sequence";
    } else if (lowerCaseContentFocus === "single mail") {
      apiContentFocus = "single_email";
    } else if (lowerCaseContentFocus === "newsletter" || lowerCaseContentFocus === "promotional email") {
      toast.error(`"${contentFocus}" is not a supported content focus. Please select "Complete campaign sequence" or "Single mail".`);
      return;
    } else {
      toast.error("Invalid content focus selected. Please try again.");
      return;
    }
    setSubmittedApiContentFocus(apiContentFocus); // Store the API-ready content focus

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
      // Get user_id from localStorage, similar to fetchPosts
      const storedUser = localStorage.getItem("authenticatedUser");
      let userIdForCampaign = null;
      if (storedUser) {
        try {
            const parsedUser = JSON.parse(storedUser);
            userIdForCampaign = parsedUser.userId || parsedUser.data?.staffid?.toString();
        } catch (e) {
            console.error("Failed to parse stored user for campaign generation:", e);
        }
      }
      
      // If userId couldn't be retrieved, show error and return
      if (!userIdForCampaign) {
        toast.error("User ID not found. Please log in again.");
        setSubmitting(false);
        return;
      }

      const formData = new URLSearchParams();
      formData.append('user_id', userIdForCampaign);
      formData.append('client_name', companyName);
      formData.append('campaign_objective', companyObjective);
      formData.append('target_audience', targetAudience);
      formData.append('content_focus', apiContentFocus);
      formData.append('num_emails', contentFocus === "Complete campaign sequence" ? parseInt(numEmails) : 1);
      
      if (toneAndStyle) {
        formData.append('tone_and_style', toneAndStyle.toLowerCase());
      }

      console.log('Sending form data to /generate-campaign:', formData.toString());

      const apiUrl = 'http://10.229.220.15:8000/generate-campaign'; // URL without query params

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData // Send URLSearchParams object directly
      });
      
      const responseBody = await response.json(); // Always try to parse JSON

      if (!response.ok) {
        let errorMessage = `Failed to generate campaign (HTTP ${response.status})`;
        // Log the raw response body for 422 or other errors for better debugging
        console.error('Error response body:', responseBody);
        // Try to extract a more specific message from known fields
        errorMessage = responseBody.detail || responseBody.message || responseBody.error || JSON.stringify(responseBody) || errorMessage;
        if (response.status === 422 && typeof responseBody.detail === 'string') {
          // If detail is a string from 422, use it directly
           errorMessage = responseBody.detail;
        } else if (response.status === 422 && Array.isArray(responseBody.detail)) {
          // If detail is an array (FastAPI validation errors), format it
          errorMessage = responseBody.detail.map(err => `${err.loc.join('.')} - ${err.msg}`).join("; ");
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
        console.warn("Generated campaign data from /generate-campaign is not in a recognized array format (e.g., response.emails, response.posts, or response itself being an array). The calendar might appear empty or not update as expected with only the new campaign.", responseBody);
        // Defaulting to an empty array if the structure is not recognized,
        // to ensure only new (and correctly formatted) data is shown.
        newCalendarItems = [];
      }
      
      setPostData(newCalendarItems); // Update postData to show ONLY the newly generated items
      setNewlyGeneratedCampaign(responseBody); // Store the full response, might be used by CalendarResult or other UI elements
      toast.success("Campaign generated successfully!");
      // fetchPosts(); // Removed: We want to show only the new campaign items in postData initially.
                     // fetchPosts is still available via onPostCreated and on mount.
    } catch (error) {
      console.error('Error details:', error);
      toast.error(error.message || "Failed to generate campaign. Please try again.");
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
        {/* Left Panel */}
        <div className="w-full md:w-[40%] bg-white rounded-xl p-4">
          <div className=" flex flex-col gap-4">
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
              className={`mt-12 w-full py-2 text-white font-medium cursor-pointer rounded-md bg-gradient-to-r from-[#02B4FE] to-[#0964F8] hover:opacity-90 transition ${submitting ? 'opacity-50 cursor-not-allowed' : ''}`}
              onClick={handleSubmit}
              disabled={submitting}
            >
              {submitting ? 'Generating...' : 'Continue'}
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
