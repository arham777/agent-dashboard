import React from "react";
import { DashboardLayout } from "../../common/containers";
import FinancialInsightsAIAgent from "../../common/components/FinancialGenerator/FinancialInsightsAIAgent";

const FinancialGenerator = () => {
  return (
    <DashboardLayout>
      <div className="p-6 flex-grow flex h-full">
        <FinancialInsightsAIAgent />
      </div>
    </DashboardLayout>
  );
};


export default FinancialGenerator;