import { useState, useCallback, useEffect } from "react";
import CalendarResult from "./CalenderResult";
import { toast } from "react-toastify";
import LabeledInput from "../ui/InputFields/ LabeledInput";

export default function EmailGenerationAI() {
  const [postData, setPostData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [companyName, setCompanyName] = useState("");
  const [companyObjective, setCompanyObjective] = useState("");
  const [targetAudience, setTargetAudience] = useState("");
  const [contentFocus, setContentFocus] = useState("");
  const [toneAndStyle, setToneAndStyle] = useState("");

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

            <LabeledInput
              label="Tone and Style"
              name="toneAndStyle"
              placeholder="Professional or friendly"
              value={toneAndStyle}
              onChange={(e) => setToneAndStyle(e.target.value)}
              type="select"
              options={ToneAndStyleOptions}
            />
            <button className=" mt-12 w-full py-2 text-white font-medium cursor-pointer rounded-md bg-gradient-to-r from-[#02B4FE] to-[#0964F8] hover:opacity-90 transition">
              Continue
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
