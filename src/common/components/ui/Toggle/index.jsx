import React, { useState } from "react";
import linkedin from "../../../../assets/icons/linkedin.svg";
import instagram from "../../../../assets/icons/instagram.svg";
import twitter from "../../../../assets/icons/twitter.svg";
import facebook from "../../../../assets/icons/facebook.svg";
import regenerate from "../../../../assets/icons/regenerate.svg";
import dropdown from "../../../../assets/icons/dropdown.svg";
import { toast } from "react-toastify";
import { BiData } from "react-icons/bi";
import { defaultCategories } from "../../../../libs/utils";

export default function AuthModal({
  onClose,
  scheduledPosts = [],
  selectedDate,
  onPostCreated,
}) {
  const [activeTab, setActiveTab] = useState("Scheduled Post");
  const [platformsSelected, setPlatformsSelected] = useState([]);
  const [tone, setTone] = useState("Professional");
  const [postType, setPostType] = useState("Static");
  const [creativity, setCreativity] = useState(0.3);
  const [selectedCategory, setSelectedCategory] = useState(
    defaultCategories[0].label
  );
  const [categories] = useState(defaultCategories);
  const [loading, setLoading] = useState(false);
  const formattedDate = selectedDate
    ? selectedDate.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      })
    : "";

  const formattedDateinUs = selectedDate.toLocaleDateString("en-US", {
    month: "long",
    day: "2-digit",
    year: "numeric",
  });

  const handleGenerate = async () => {
    setLoading(true);
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
      platform: platformsSelected.join(","),
      category: postType.toLowerCase(),
      tone: tone.toLowerCase(),
      creativity: creativity,
      post_type: postType.toLowerCase(),
      post_date: formattedDateinUs,
      user_id: userId,
    });

    try {
      const res = await fetch(
        `http://10.229.220.15:8000/New-Post?${query.toString()}`,
        {
          method: "GET",
          headers: { accept: "application/json" },
        }
      );

      if (!res.ok) throw new Error("API call failed");

      const data = await res.json();
      if (data) {
        onClose();
        onPostCreated();
        toast.success(" Post generated successfully!");
      }
    } catch (err) {
      console.error("Generation error:", err);
      toast.error("Failed to generate post. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerateScheduled = async (post) => {
    const storedUser = localStorage.getItem("authenticatedUser");
    const userId = storedUser
      ? JSON.parse(storedUser).userId ||
        JSON.parse(storedUser).data?.staffid?.toString()
      : null;
    if (!userId) {
      toast.error("User ID not found. Please log in again.");
      return;
    }
    try {
      const input =
        `caption : "${post.caption}" ` +
        `created_at : "${post.created_at}" ` +
        `id : ${post.id} ` +
        `image_content : "${post.image_content}" ` +
        `image_guidelines : "${post.image_guidelines}" ` +
        `platform : "${post.platform}" ` +
        `post_date : "${post.post_date}" ` +
        `post_type : "${post.post_type}"`;

      const params = new URLSearchParams({
        input,
        user_id: userId,
        post_id: post.id,
      });

      const res = await fetch(
        `http://10.229.220.15:8000/Re-Generate?${params.toString()}`,
        { headers: { accept: "application/json" } }
      );
      if (!res.ok) throw new Error(res.statusText);
      await res.json();

      toast.success("Post regenerated successfully!");
      onPostCreated?.();
      onClose();
    } catch (err) {
      console.error("Regeneration error:", err);
      toast.error("Failed to regenerate post");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-center items-center bg-black/40 px-4">
      <div className="  w-full lg:w-[40%] bg-white rounded-lg shadow-xl overflow-hidden relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 cursor-pointer"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        <div className="px-6 py-4 text-center">
          <h2 className="text-xl font-bold">{formattedDate}</h2>
          <div className="flex  mt-2 ">
            {["Scheduled Post", "New post"].map((tab) => (
              <button
                key={tab}
                className={`w-full  cursor-pointer px-4 py-1.5  text-sm font-medium ${
                  activeTab === tab
                    ? "bg-[#2563EB] text-white "
                    : "border border-[#D0D5DD] text-[#0771EF]"
                } ${tab === "Scheduled Post" ? "rounded-l-lg" : "rounded-r-lg"}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {activeTab === "Scheduled Post" ? (
          <div className="p-6 space-y-4 max-h-[500px] overflow-y-auto ">
            {scheduledPosts.length === 0 ? (
              <p className="text-sm text-gray-500 text-center">
                No scheduled posts for this day.
              </p>
            ) : (
              scheduledPosts.map((post, i) => (
                <div
                  key={i}
                  className="border border-gray-200 rounded-lg p-4 flex flex-col space-y-2"
                >
                  <div className="flex flex-col gap-2 text-sm text-[#344054]">
                    <div className="flex gap-2">
                      {post.platforms.map((p, idx) => {
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
                          icon && (
                            <img
                              key={idx}
                              src={icon}
                              alt={p}
                              className="w-5 h-5"
                            />
                          )
                        );
                      })}
                    </div>
                    <span>{post.caption}</span>
                  </div>
                  <button
                    onClick={() => handleRegenerateScheduled(post)}
                    className="cursor-pointer flex flex-row gap-2 items-center self-start text-[#2563EB] text-xs border border-blue-500 px-3 py-1 rounded-md hover:bg-blue-50"
                  >
                    <img src={regenerate} alt="icon" className="w-3 h-3" />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#02B4FE] to-[#0964F8]">
                      Regenerate
                    </span>
                  </button>
                </div>
              ))
            )}
          </div>
        ) : (
          <div className=" max-h-[500px] overflow-y-auto p-6 space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-1">
                Platform
              </h3>
              <div className="flex gap-3">
                {[linkedin, instagram, twitter, facebook].map((icon, i) => {
                  const platformNames = [
                    "linkedin",
                    "instagram",
                    "twitter",
                    "facebook",
                  ];
                  const isSelected = platformsSelected.includes(
                    platformNames[i]
                  );

                  return (
                    <button
                      key={i}
                      onClick={() => {
                        const selected = platformNames[i];
                        setPlatformsSelected((prev) =>
                          isSelected
                            ? prev.filter((p) => p !== selected)
                            : [...prev, selected]
                        );
                      }}
                      className={`w-10 h-10 cursor-pointer rounded-lg border flex items-center justify-center ${
                        isSelected
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200"
                      }`}
                    >
                      <img src={icon} alt="icon" className="w-5 h-5" />
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-1">
                Post Type
              </h3>
              <div className="relative">
                <select
                  value={postType}
                  onChange={(e) => setPostType(e.target.value)}
                  className="appearance-none w-full border border-gray-300 text-sm rounded-md px-3 py-2 text-gray-600"
                >
                  <option value="Static">Static</option>
                  <option value="Carousel">Carousel</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-[#344054]">
                  <img src={dropdown} alt="" className="w-[16px] h-[16px]" />
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-1">
                Categories
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
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-1">Tone</h3>
              <div className="relative">
                <select
                  value={tone}
                  onChange={(e) => setTone(e.target.value)}
                  className="appearance-none w-full border border-gray-300 text-sm rounded-md px-3 py-2 text-gray-600"
                >
                  <option>Professional</option>
                  <option>Friendly</option>
                  <option>Casual</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-[#344054]">
                  <img src={dropdown} alt="" className="w-[16px] h-[16px]" />
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-1">
                Creativity
              </h3>
              <input
                type="range"
                min="0.1"
                max="1"
                step="0.1"
                value={creativity}
                onChange={(e) => setCreativity(e.target.value)}
                className="w-full accent-blue-600"
              />
              <div className="flex justify-between text-[10px] text-gray-400">
                {[...Array(10)].map((_, i) => (
                  <span key={i}>{(i + 1) / 10}</span>
                ))}
              </div>
            </div>

            <div className="flex justify-end mt-4 gap-2">
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-md text-sm bg-gray-100 text-[#535353] cursor-pointer"
              >
                Close
              </button>
              <button
                onClick={handleGenerate}
                disabled={loading}
                className={`cursor-pointer px-4 py-2 rounded-md text-sm text-white bg-gradient-to-r from-[#02B4FE] to-[#0964F8] transition
    ${loading ? "opacity-70 cursor-not-allowed" : "hover:opacity-90"}`}
              >
                {loading ? (
                  <div className="flex items-center gap-2 justify-center">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    Generating...
                  </div>
                ) : (
                  "Generate"
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
