import { DashboardLayout } from "../../common/containers";
import EmailGenerationAI from "../../common/components/EmailGeneration/EmailGenerationAI";

const EmailGeneration = () => {
  return (
    <DashboardLayout>
      <div className="flex flex-col">
        <EmailGenerationAI />
      </div>
    </DashboardLayout>
  );
};

export default EmailGeneration;
