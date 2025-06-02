import React, { useState } from 'react';
import robot from '../../../assets/icons/robot.png';
import LabeledInput from '../ui/InputFields/ LabeledInput';
import ToggleSwitch from '../ui/ToggleSwitch';

const FinancialInsightsAIAgent = () => {
  const [companyName, setCompanyName] = useState('Cybergen.com');
  const [comparativeAnalysis, setComparativeAnalysis] = useState(false);
  const [ratioAnalysis, setRatioAnalysis] = useState(false);

  const handleContinue = () => {
    // Logic for continue button will go here
    console.log('Continue clicked with:', { companyName, comparativeAnalysis, ratioAnalysis });
  };

  return (
    <div className="flex flex-col w-full space-y-6 h-full">
      <h2 className="text-xl font-semibold text-gray-800">
        Financial Insights AI Agent
      </h2>
      <div className="flex h-screen flex-grow gap-6 md:flex-row flex-col">
        {/* Left Panel */}
        <div className=" md:w-2/5 lg:w-1/3 p-4 bg-gray-50 rounded-xl shadow-md flex flex-col justify-between ">
          <div>
            <LabeledInput
              label="Company Name/Link"
              name="companyName"
              placeholder="Enter company name or website link"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="mb-6"
            />
            <div className="my-4"> {/* Added margin for spacing */}
            <ToggleSwitch
              label="Comparative Analysis"
              enabled={comparativeAnalysis}
              setEnabled={setComparativeAnalysis}
              switchId="comparative-analysis-toggle"
            />
            </div>
            <div className="my-4"> {/* Added margin for spacing */}
              <ToggleSwitch
                label="Ratio Analysis"
                enabled={ratioAnalysis}
                setEnabled={setRatioAnalysis}
                switchId="ratio-analysis-toggle"
              />
            </div>
          </div>
          <div>
            <button
                onClick={handleContinue}
                className="w-full hover:cursor-pointer py-3 mt-6 text-white font-medium rounded-md bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
                Continue
            </button>  
          </div>
          
        </div>

        {/* Right Panel */}
        <div className=" md:w-3/5 lg:w-2/3 flex flex-col items-center justify-center text-center p-4 bg-gray-50 rounded-xl shadow-md">
          <img src={robot} alt="robot" className="w-1/6 h-1/6 mb-6" />
          <h3 className="text-2xl font-semibold text-gray-800 mb-3">
            Welcome to Financial Insights Assistant
          </h3>
          <p className="text-gray-600 max-w-md">
            Whether you're tracking performance, reviewing forecasts, or exploring investment strategies — I'm here to help you make data-driven decisions with confidence. Let's dive into the numbers!
          </p>
        </div>
      </div>
    </div>
  );
};

export default FinancialInsightsAIAgent; 