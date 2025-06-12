import React, { useState } from 'react';
import robot from '../../../assets/icons/robot.png';
import LabeledInput from '../ui/InputFields/LabeledInput';
import ToggleSwitch from '../ui/ToggleSwitch';

const FinancialInsightsAIAgent = () => {
    const [companyName, setCompanyName] = useState('cybergen.com');
    const [comparativeAnalysis, setComparativeAnalysis] = useState(false);
    const [report, setReport] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleContinue = async () => {
        setIsLoading(true);
        setError(null);
        setReport('');

        try {
            let bodyParams = `company=${encodeURIComponent(companyName)}`;

            if (comparativeAnalysis) {
                bodyParams += `&comparative_analysis=comparative analysis`;
            }

            const response = await fetch('https://dev-ai.cybergen.com/generate_market_report', {
                method: 'POST',
                headers: {
                    'accept': 'application/json',
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: bodyParams
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            setReport(data);
        } catch (e) {
            setError(e.message);
        } finally {
            setIsLoading(false);
        }
    };

    /**
     * @param {string} line - The text to parse.
     * @returns {Array<React.ReactNode>} 
     */
    const parseLine = (line) => {
        const regex = /(\(\[.*?\]\(.*?\)\))|(\*\*.*?\*\*)/g;
        const parts = line.split(regex).filter(Boolean); 

        return parts.map((part, index) => {
            const linkMatch = part.match(/\(\[(.*?)\]\((.*?)\)\)/);
            if (linkMatch) {
                const [, text, url] = linkMatch;
                return (
                    <a key={index} href={url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                        {text}
                    </a>
                );
            }

            const boldMatch = part.match(/\*\*(.*?)\*\*/);
            if (boldMatch) {
                const [, text] = boldMatch;
                return <strong key={index}>{text}</strong>;
            }

            return part; 
        });
    };

    /**
     * @param {string} content 
     * @returns {Array<React.ReactNode>} 
     */
    const parseContent = (content) => {
        if (!content) return [];
        const lines = content.split('\n');
        const elements = [];
        let listItems = [];

        lines.forEach((line, index) => {
            if (line.trim().startsWith('- ')) {
                listItems.push(line.trim().substring(2));
            } else {
                if (listItems.length > 0) {
                    elements.push(
                        <ul key={`ul-${index}`} className="list-disc list-inside space-y-2 my-3 pl-2">
                            {listItems.map((item, i) => <li key={i}>{parseLine(item)}</li>)}
                        </ul>
                    );
                    listItems = []; 
                }
                if (line.trim()) {
                    elements.push(<p key={`p-${index}`} className="my-3">{parseLine(line)}</p>);
                }
            }
        });

        if (listItems.length > 0) {
            elements.push(
                <ul key="ul-last" className="list-disc list-inside space-y-2 my-3 pl-2">
                    {listItems.map((item, i) => <li key={i}>{parseLine(item)}</li>)}
                </ul>
            );
        }

        return elements;
    };


    /**
     * @param {string} reportData
     * @returns {Array<React.ReactNode>}x
     */
    const renderReport = (reportData) => {
        const sections = reportData.replace(/\r\n/g, '\n').split('\n\n**');
        
        return sections.map((section, index) => {
            if (!section.trim()) return null;

            if (index === 0 && !section.startsWith('**')) {
                section = `**${section}`;
            }
            
            const parts = section.split('**\n\n');
            const title = parts[0]?.replace(/\*\*/g, '').trim();
            const content = parts.slice(1).join('**\n\n').trim();

            if (!title) return null;

            return (
                <div key={index} className="mb-4">
                    <h4 className="text-lg font-semibold text-gray-800 mb-1">{title}</h4>
                    <div>{parseContent(content)}</div>
                </div>
            );
        });
    };

    return (
        <div className="flex flex-col w-full space-y-6 h-full">
            <h2 className="text-xl font-semibold text-gray-800">
                Financial Insights AI Agent
            </h2>
            <div className="flex lg:h-[28rem] md:h-[24rem] flex-grow gap-6 md:flex-row flex-col">
                {/* Left Panel */}
                <div className="md:w-2/5 lg:w-1/3 p-4 bg-gray-50 rounded-xl shadow-md flex flex-col justify-between ">
                    <div>
                        <LabeledInput
                            label="Company Name/Link"
                            name="companyName"
                            placeholder="Enter company name or website link"
                            value={companyName}
                            onChange={(e) => setCompanyName(e.target.value)}
                            className="mb-6"
                        />
                        <div className="my-4">
                            <ToggleSwitch
                                label="Comparative Analysis"
                                enabled={comparativeAnalysis}
                                setEnabled={setComparativeAnalysis}
                                switchId="comparative-analysis-toggle"
                            />
                        </div>
                    </div>
                    <div>
                        <button
                            onClick={handleContinue}
                            disabled={isLoading}
                            className="w-full hover:cursor-pointer py-3 mt-6 text-white font-medium rounded-md bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                        >
                            {isLoading ? 'Generating...' : 'Continue'}
                        </button>
                    </div>
                </div>

                <div className="md:w-3/5 lg:w-2/3 flex flex-col p-6 bg-gray-50 rounded-xl shadow-md overflow-y-auto">
                    {isLoading && (
                        <div className="flex flex-col items-center justify-center text-center h-full">
                            <img src={robot} alt="robot" className="w-1/6 mb-6 animate-pulse" />
                            <h3 className="text-2xl font-semibold text-gray-800 mb-3">
                                Generating Report...
                            </h3>
                            <p className="text-gray-600 max-w-lg">
                                Please wait while I gather and analyze the financial insights for {companyName}.
                            </p>
                        </div>
                    )}
                    {error && (
                        <div className="flex flex-col items-center justify-center text-center h-full">
                            <h3 className="text-2xl font-semibold text-red-600 mb-3">
                                An Error Occurred
                            </h3>
                            <p className="text-gray-600 max-w-lg">
                                {error}
                            </p>
                        </div>
                    )}
                    {report && !isLoading && (
                        <div className="text-left">
                            <h3 className="text-2xl font-semibold text-gray-800 mb-6">Market Report for {companyName}</h3>
                            {renderReport(report)}
                        </div>
                    )}
                    {!report && !isLoading && !error && (
                        <div className="flex flex-col items-center justify-center text-center h-full">
                            <img src={robot} alt="robot" className="w-1/6 mb-6" />
                            <h3 className="text-2xl font-semibold text-gray-800 mb-3">
                                Welcome to Financial Insights Assistant
                            </h3>
                            <p className="text-gray-600 max-w-lg">
                                Whether you're tracking performance, reviewing forecasts, or exploring investment strategies — I'm here to help you make data-driven decisions with confidence. Let's dive into the numbers!
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default FinancialInsightsAIAgent;
