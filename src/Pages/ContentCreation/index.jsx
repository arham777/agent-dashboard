import { DashboardLayout } from "../../common/containers";
import ContentCreationAI from "../../common/components/ContentCreation/ContentCreationAI";

const ContentCreation = () => {
  return (
    <DashboardLayout>
      <div className="flex flex-col">
        <ContentCreationAI />
      </div>
    </DashboardLayout>
  );
};

export default ContentCreation;
