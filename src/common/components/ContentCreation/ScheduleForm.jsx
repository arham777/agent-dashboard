import React, { useState } from "react";
import dropdown from "../../../assets/icons/dropdown.svg";
import { toast } from "react-toastify";

const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const years = [2023, 2024, 2025];
const frequencies = ["1", "2", "3"];
const tones = ["Professional", "Friendly", "Informal"];

export default function ScheduleForm({
  client,
  platform,
  postType,
  category,
  onGenerateSuccess,
  campaignName,
}) {
  const [month, setMonth] = useState("January");
  const [year, setYear] = useState(2025);
  const [mode, setMode] = useState("Monthly");
  const [frequency, setFrequency] = useState("2");
  const [tone, setTone] = useState("Professional");
  const [creativity, setCreativity] = useState(0.4);
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
      if (!campaignName || campaignName.trim() === "") {
        toast.error("Error: Campaign Name is required.");
        setLoading(false);
        return;
    }
    const storedUser = localStorage.getItem("authenticatedUser");
    let userId = null;

    try {
      if (storedUser) {
        const parsed = JSON.parse(storedUser);
        userId = parsed.userId;
      }
    } catch (err) {
      console.error("Error parsing authenticatedUser from localStorage", err);
    }

    if (!userId) {
      toast.error("User ID not found. Please log in again.");
      setLoading(false);
      return;
    }
    const query = new URLSearchParams({
      client_details: client.toLowerCase().replace(/\s+/g, ""),
      platform: platform.map((p) => p.toLowerCase()).join(", "),
      month: month.toLowerCase(),
      year,
      creativity,
      post_type: postType.toLowerCase(),
      category: category.toLowerCase(),
      tone: tone.toLowerCase(),
      frequency,
      duration: mode.toLowerCase() === "monthly" ? "month" : "weeks",
      user_id: userId,
       campaign_name: campaignName,
    });

    try {
      const res = await fetch(
        `https://dev-ai.cybergen.com/agent_on---?${query}`,
        {
          method: "GET",
          headers: {
            accept: "application/json",
          },
        }
      );

      if (!res.ok) throw new Error("Failed to fetch data");

      const data = await res.json();
      if (data) {
        onGenerateSuccess();
        toast.success("Posts Generated Successfully!");
      }
    } catch (error) {
      console.error("Error fetching AI posts:", error);
      toast.error("Failed to generate calendar. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className=" space-y-6">
      {/* Calendar Period */}
      <div>
        <h3 className="font-bold text-sm my-4 text-[#334155]">
          Calendar Period
        </h3>
        <div className="border border-[#E2E8F0] rounded-xl p-4 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {/* Month */}
            <div>
              <label className="text-sm font-semibold text-[#334155] mb-1 block">
                Month
              </label>
              <div className="relative">
                <select
                  value={month}
                  onChange={(e) => setMonth(e.target.value)}
                  className="appearance-none w-full text-sm border border-[#E2E8F0] rounded-md px-3 py-2 text-[#344054]"
                >
                  {months.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-[#94A3B8]">
                  <img src={dropdown} alt="" className="w-[16px] h-[16px]" />
                </div>
              </div>
            </div>

            {/* Year */}
            <div>
              <label className="text-sm font-semibold text-[#334155] mb-1 block">
                Year
              </label>
              <div className="relative">
                <select
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  className="appearance-none w-full text-sm border border-[#E2E8F0] rounded-md px-3 py-2 text-[#344054]"
                >
                  {years.map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-[#94A3B8]">
                  <img src={dropdown} alt="" className="w-[16px] h-[16px]" />
                </div>
              </div>
            </div>
          </div>

          {/* Mode */}
          <div className="flex gap-3">
            {["Monthly", "Weekly"].map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`flex-1 border border-transparent rounded-md py-2 text-[#334155] font-medium text-sm cursor-pointer ${
                  mode === m
                    ? "bg-[#F4F4F4] border-[#E2E8F0]"
                    : "hover:bg-[#F4F4F4]"
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Post Settings */}
      <div>
        <h3 className="font-bold text-sm mb-3 text-[#334155]">Post Setting</h3>
        <div className="border border-[#E2E8F0] rounded-xl p-4 space-y-4">
          {/* Frequency */}
          <div className="">
            <label className="text-sm font-semibold text-[#334155] mb-1 block">
              Frequency
            </label>
            <div className="relative">
              <select
                value={frequency}
                onChange={(e) => setFrequency(e.target.value)}
                className="appearance-none w-full text-sm border border-[#E2E8F0] rounded-md px-3 py-2 text-[#344054]]"
              >
                {frequencies.map((f) => (
                  <option key={f} value={f}>
                    {f} posts a week
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-[#344054]]">
                <img src={dropdown} alt="" className="w-[16px] h-[16px]" />
              </div>
            </div>
          </div>

          {/* Tone */}
          <div>
            <label className="text-sm font-semibold text-[#334155] mb-1 block">
              Tone
            </label>
            <div className="relative">
              <select
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                className="appearance-none  w-full text-sm border border-[#E2E8F0] rounded-md px-3 py-2 text-[#344054]]"
              >
                {tones.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-[#344054]]">
                <img src={dropdown} alt="" className="w-[16px] h-[16px]" />
              </div>
            </div>
          </div>

          {/* Creativity */}

          <div>
            <label className="text-sm font-semibold text-[#334155] mb-1 block">
              Creativity
            </label>
            <input
              type="range"
              min="0.1"
              max="1"
              step="0.1"
              value={creativity}
              onChange={(e) => setCreativity(parseFloat(e.target.value))}
              className="w-full accent-[#0964F8] custom-slider"
            />
            <div className="text-xs text-[#94A3B8] mt-1 flex justify-between">
              {[...Array(10)].map((_, i) => (
                <span key={i}>{(i + 1) / 10}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <button
        onClick={handleGenerate}
        disabled={loading}
        className={`w-full py-2 text-white font-medium rounded-md bg-gradient-to-r from-[#02B4FE] to-[#0964F8] transition cursor-pointer
    ${loading ? "opacity-70 cursor-not-allowed" : "hover:opacity-90"}
  `}
      >
        {loading ? (
          <div className="flex items-center justify-center gap-2">
            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            Generating...
          </div>
        ) : (
          "Generate Calendar"
        )}
      </button>
    </div>
  );
}
