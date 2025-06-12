import React from "react";
import { DashboardLayout } from "../../common/containers";
import BlogWriterAIAgent from "../../common/components/BlogWriter/BlogWriterAIAgent";

const BlogWriter = () => {
  return (
    <DashboardLayout>
      <div className="p-6 flex-grow flex h-full">
        <BlogWriterAIAgent />
      </div>
    </DashboardLayout>
  );
};


export default BlogWriter;