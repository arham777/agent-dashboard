import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export const defaultCategories = [
  {
    label: "Thought Leadership",
    color: "text-[#7B61FF] ",
    dot: "bg-[#7B61FF]",
  },
  {
    label: "Testimonials",
    color: "text-[#10B981]",
    dot: "bg-[#22C55E]",
  },
  {
    label: "Industry News",
    color: "text-[#F43F5E]",
    dot: "bg-[#EF4444]",
  },
];
