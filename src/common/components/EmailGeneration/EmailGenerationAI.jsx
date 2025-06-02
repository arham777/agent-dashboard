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
      const userId = storedUser
        ? JSON.parse(storedUser).userId ||
          JSON.parse(storedUser).data?.staffid?.toString()
        : null;
      if (!userId) {
        toast.error("User ID not found. Please log in again.");
        return;
      }
      const res = await fetch(
        `http://10.229.220.15:8000/get-user-posts?user_id=${userId}`
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

  const handleSubmit = async () => {
    // Validate required fields
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
      toast.error(`"${contentFocus}" is not a supported content focus for campaign generation. Please select "Complete campaign sequence" or "Single mail".`);
      return; 
    } else {
      // Should not happen if contentFocus is from dropdown and validated
      toast.error("Invalid content focus selected. Please try again.");
      return;
    }

    if (contentFocus === "Complete campaign sequence") {
      const emailCount = parseInt(numEmails);
      if (!emailCount || emailCount < 2) {
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
      const payload = {
        client_name: companyName,
        campaign_objective: companyObjective,
        target_audience: targetAudience,
        content_focus: apiContentFocus,
        num_emails: contentFocus === "Complete campaign sequence" ? parseInt(numEmails) : 1,
        tone_and_style: toneAndStyle.toLowerCase()
      };

      console.log('Sending payload:', payload);

      const response = await fetch('http://10.229.220.15:8000/generate-campaign', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });
      
      if (!response.ok) {
        let errorMessage = `Failed to generate campaign (HTTP ${response.status})`;
        try {
          // Try to parse the error response as JSON
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.detail || errorData.error || JSON.stringify(errorData) || errorMessage;
        } catch (jsonError) {
          // If response is not JSON or .json() fails, try to get plain text
          console.error('Failed to parse error response as JSON:', jsonError); // Log the JSON parsing error
          try {
            const errorText = await response.text();
            if (errorText) errorMessage = errorText;
          } catch (textError) {
            // Fallback if .text() also fails
             console.error('Failed to parse error response text:', textError);
          }
        }
        throw new Error(errorMessage);
      }

      const generatedCampaignData = await response.json(); 
      console.log("Successfully generated campaign data:", generatedCampaignData);
      toast.success("Campaign generated successfully!");
      fetchPosts();
    } catch (error) {
      console.error('Error details:', error);
      toast.error(error.message || "Failed to generate campaign. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

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
          />
        </div>
      </div>
    </div>
  );
}
