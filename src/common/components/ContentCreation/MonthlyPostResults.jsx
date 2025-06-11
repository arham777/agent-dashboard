import regenerate from "../../../assets/icons/regenerate.svg";
import { toast } from "react-toastify";

export default function MonthlyPostResults({ posts = [], onPostCreated }) {
  console.log("posts", posts);
  const postsByMonth = posts.reduce((acc, post) => {
    const date = new Date(post.post_date);
    const monthKey = `${date.getFullYear()}-${date.getMonth()}`;

    if (!acc[monthKey]) acc[monthKey] = [];
    acc[monthKey].push(post);

    return acc;
  }, {});

  async function handleRegenerate(post) {
    
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
        user_id: post.user_id.toString(),
        post_id: post.id.toString(),
         
      });

      const res = await fetch(
        `https://dev-ai.cybergen.com/Re-Generate?${params.toString()}`,
        { headers: { accept: "application/json" } }
      );
      if (!res.ok) throw new Error(res.statusText);

      const data = await res.json();
      console.log("Regenerated:", data);
      toast.success("Post regenerated successfully!");
      // onPostCreated();
    } catch (err) {
      console.error("Regeneration error:", err);
      toast.error("Failed to regenerate post");
    }
  }

  const sortedMonthKeys = Object.keys(postsByMonth).sort(
    (a, b) => new Date(b) - new Date(a)
  );

  return (
    <div className="max-h-[500px] overflow-auto py-4">
      <p className="text-sm font-medium text-[#777777] mb-4">
        Here are your posts sorted by month and date.
      </p>

      <div className="space-y-8">
        {sortedMonthKeys.map((monthKey) => {
          const monthPosts = postsByMonth[monthKey];

          const sortedPosts = monthPosts.sort(
            (a, b) => new Date(a.post_date) - new Date(b.post_date)
          );

          const sampleDate = new Date(sortedPosts[0].post_date);
          const monthName = sampleDate.toLocaleString("default", {
            month: "long",
            year: "numeric",
          });

          return (
            <div key={monthKey}>
              <h3 className="text-base font-semibold text-[#1E293B] mb-2">
                {monthName}
              </h3>
              <div className="space-y-6">
                {sortedPosts.map((post, idx) => {
                  const day = new Date(post.post_date).getDate();

                  return (
                    <div key={idx}>
                      <p className="text-xs font-bold text-[#777777] mb-1">
                        Date {day}
                      </p>
                      <div className="flex justify-between items-start gap-2 bg-white border border-[#E2E8F0] font-medium rounded-lg px-4 py-3 text-[#344054] text-sm">
                        <p className="leading-snug">{post.caption}</p>
                      </div>
                      <button
                        onClick={() => handleRegenerate(post)}
                        className="mt-1 flex flex-row gap-2 items-center ml-auto text-[#2563EB] text-xs cursor-pointer px-3 py-1 rounded-md hover:bg-blue-50"
                      >
                        <img src={regenerate} alt="icon" className="w-3 h-3" />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#02B4FE] to-[#0964F8]">
                          Regenerate
                        </span>
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
