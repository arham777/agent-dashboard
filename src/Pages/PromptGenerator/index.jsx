import React from "react";
import { DashboardLayout } from "../../common/containers";
import PromptGeneratorAgent from "../../common/components/PromptGenerator/PromptGeneratorAgent";


const PromptGenerator = () => {
    return (
      <DashboardLayout>
        <div className="p-6 flex-grow flex h-full">
          <PromptGeneratorAgent/>
        </div>
      </DashboardLayout>
    );
  };
  
  
  export default PromptGenerator;