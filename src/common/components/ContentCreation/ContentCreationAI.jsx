import React, { useState, useCallback, useEffect } from "react";
import linkedin from "../../../assets/icons/linkedin.svg";
import instagram from "../../../assets/icons/instagram.svg";
import twitter from "../../../assets/icons/twitter.svg";
import facebook from "../../../assets/icons/facebook.svg";
import { Plus } from "lucide-react";
import dropdown from "../../../assets/icons/dropdown.svg";
import ScheduleForm from "./ScheduleForm";
import CalendarResult from "./CalenderResult";
import { toast } from "react-toastify";
import { defaultCategories } from "../../../libs/utils";
import LabeledInput from "../ui/InputFields/ LabeledInput";

const platforms = [
  { name: "LinkedIn", icon: linkedin },
  { name: "Instagram", icon: instagram },
  { name: "Twitter", icon: twitter },
  { name: "Facebook", icon: facebook },
];

export default function ContentCreationAI() {
  const [selectedTab, setSelectedTab] = useState("Content");
  const [client, setClient] = useState("");
  const [platformsSelected, setPlatformsSelected] = useState([]);
  const [categories, setCategories] = useState(defaultCategories);
  const [selectedCategory, setSelectedCategory] = useState(
    defaultCategories[0].label
  );
  const [postType, setPostType] = useState("Static");
  const [newCategory, setNewCategory] = useState("");
  const [postData, setPostData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [companies, setCompanies] = useState([]);
  const [campaignName, setCampaignName] = useState("");

  const addCategory = () => {
    if (newCategory.trim() === "") return;
    const newCat = {
      label: newCategory,
      color: "text-[#111827]",
      dot: "bg-[#64748B]",
    };
    setCategories([...categories, newCat]);
    setSelectedCategory(newCategory);
    setNewCategory("");
  };

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
        `https://dev-ai.cybergen.com/get-user-posts?user_id=${userId}`
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

  useEffect(() => {
    async function loadCompanies() {
      try {
        const res = await fetch("https://dev-ai.cybergen.com/Get-company-list", {
          headers: { accept: "application/json" },
        });
        if (!res.ok) throw new Error(res.statusText);
        const data = await res.json();
        setCompanies(data);
        if (data.length) setClient(data[0]);
      } catch (err) {
        console.error("Failed loading companies:", err);
        toast.error("Could not load clients.");
      }
    }
    loadCompanies();
  }, []);

  return (
    <div className="overflow-y-auto flex flex-col px-6 text-[#475569]">
      <div className="py-2 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-[#475569]">
          Content Creation AI Agent
        </h2>
      </div>
      <div className="flex flex-col md:flex-row gap-4 py-2">
        <div className="w-full md:w-[40%] bg-white rounded-xl p-4">
          <div className="flex border-b border-[#E2E8F0]">
            {["Content", "Schedule"].map((tab) => (
              <button
                key={tab}
                onClick={() => {
                  setSelectedTab(tab);
                }}
                className={`w-full text-sm font-medium px-4 py-2 border-b-2 transition cursor-pointer ${
                  selectedTab === tab
                    ? "border-[#0771EF] text-[#0771EF]"
                    : "border-transparent text-[#475569]"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {selectedTab === "Content" && (
            <div className="flex flex-col gap-4 mt-4">
              {/* Select Client */}
              <div className="mt-2">
                <h3 className="font-semibold text-sm mb-1 text-[#475569]">
                  Select Client
                </h3>
                <div className="relative">
                  <select
                    className="appearance-none w-full text-[#344054] text-sm border border-[#E2E8F0] rounded-md px-3 pr-10 py-2"
                    value={client}
                    onChange={(e) => setClient(e.target.value)}
                  >
                    {companies.map((c, idx) => (
                      <option key={idx} value={c}>
                        {c}
                      </option>
                    ))}
                    {companies.length === 0 && (
                      <option disabled>Loading clients…</option>
                    )}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-[#344054]">
                    <img src={dropdown} alt="" className="w-[16px] h-[16px]" />
                  </div>
                </div>
              </div>
              <LabeledInput
                label="Campaign Name"
                name="campaignName"
                placeholder="Enter campaign name here....."
                value={campaignName}
                onChange={(e) => setCampaignName(e.target.value)}
              />
              {/* Select Platform */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-1">
                  Platform
                </h3>
                <div className="flex gap-3 flex-wrap">
                  {platforms.map((p) => {
                    const isSelected = platformsSelected.includes(p.name);

                    return (
                      <button
                        key={p.name}
                        onClick={() => {
                          setPlatformsSelected((prev) =>
                            isSelected
                              ? prev.filter((item) => item !== p.name)
                              : [...prev, p.name]
                          );
                        }}
                        className={`flex items-center justify-center w-[64px] h-[64px] rounded-[10px] border transition-colors cursor-pointer ${
                          isSelected
                            ? "bg-blue-100 border-blue-500"
                            : "bg-white border-[#E2E8F0] hover:border-gray-400"
                        }`}
                      >
                        <img
                          src={p.icon}
                          alt={p.name}
                          className="w-[24px] h-[24px]"
                        />
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Post Type */}
              <div>
                <h3 className="font-semibold text-sm mb-1 text-[#475569]">
                  Post Type
                </h3>
                <div className="relative">
                  <select
                    className="appearance-none w-full  text-[#344054] text-sm border border-[#E2E8F0] rounded-md px-3 pr-10 py-2"
                    value={postType}
                    onChange={(e) => setPostType(e.target.value)}
                  >
                    <option value="Static">Static</option>
                    <option value="Carousel">Carousel</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-[#344054]">
                    <img src={dropdown} alt="" className="w-[16px] h-[16px]" />
                  </div>
                </div>
              </div>

              {/* Content Categories */}
              <div>
                <h3 className="font-semibold text-sm mb-1 text-[#475569]">
                  Content Categories
                </h3>
                <div className="bg-white border border-[#E2E8F0] rounded-lg p-3 space-y-3 mb-2">
                  <div className="flex flex-wrap gap-2">
                    {categories.map((cat, i) => {
                      const isSelected = selectedCategory === cat.label;

                      return (
                        <span
                          key={i}
                          onClick={() => setSelectedCategory(cat.label)}
                          className={`flex items-center gap-2 text-sm font-medium rounded-xl px-3 py-1 cursor-pointer transition-colors duration-200 
        ${isSelected ? ` ${cat.color}` : `text-[#46484B] `}
      `}
                        >
                          <span
                            className={`w-2 h-2 rounded-full ${isSelected ? cat.dot : cat.dot}`}
                          ></span>
                          {cat.label}
                        </span>
                      );
                    })}
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Add custom category"
                      className="flex-1 text-sm border border-[#E2E8F0] rounded-md px-3 py-2 text-[#344054]"
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                    />
                    <button
                      onClick={addCategory}
                      className="w-9 h-9 flex items-center justify-center rounded-md bg-gradient-to-r from-[#02B4FE] to-[#0964F8] text-white"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setSelectedTab("Schedule")}
                className="w-full py-2 text-white font-medium cursor-pointer rounded-md bg-gradient-to-r from-[#02B4FE] to-[#0964F8] hover:opacity-90 transition"
              >
                Continue
              </button>
            </div>
          )}

          {selectedTab === "Schedule" && (
            <ScheduleForm
              client={client}
              platform={platformsSelected}
              postType={postType}
              category={selectedCategory}
              onGenerateSuccess={fetchPosts}
              campaignName={campaignName}
            />
          )}
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
