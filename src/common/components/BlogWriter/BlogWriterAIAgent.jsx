import React, { useState, useEffect } from 'react';
import robot from '../../../assets/icons/robot.png';
import LabeledInput from '../ui/InputFields/LabeledInput';
import ToggleSwitch from '../ui/ToggleSwitch';

const loadingMessages = [
    'Thinking...',
    'Analyzing the latest trends...',
    'Gathering key insights...',
    'Structuring your blog post...',
    'Preparing the final report...',
];

const BlogWriterAIAgent = () => {
    const [topicName, setTopicName] = useState('');
    const [downloadUrl, setDownloadUrl] = useState('');
    const [fileName, setFileName] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [currentMessageIndex, setCurrentMessageIndex] = useState(0);

    useEffect(() => {
        return () => {
            if (downloadUrl) {
                window.URL.revokeObjectURL(downloadUrl);
            }
        };
    }, [downloadUrl]);

    useEffect(() => {
        let interval;
        if (isLoading) {
            interval = setInterval(() => {
                setCurrentMessageIndex(
                    prevIndex => (prevIndex + 1) % loadingMessages.length
                );
            }, 3000);
        }
        return () => clearInterval(interval);
    }, [isLoading]);

    const handleContinue = async () => {
        setIsLoading(true);
        setError(null);
        setDownloadUrl('');
        setFileName('');

        try {
            const bodyParams = `topic=${encodeURIComponent(topicName)}`;

            const response = await fetch('https://dev-ai.cybergen.com/generate_report_agent', {
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

            const contentDisposition = response.headers.get('content-disposition');
            let filenameFromServer = 'report.pdf';
            if (contentDisposition) {
                const filenameMatch = contentDisposition.match(/filename="?([^"]+)"?/);
                if (filenameMatch && filenameMatch.length > 1) {
                    filenameFromServer = filenameMatch[1];
                }
            }
            
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            setDownloadUrl(url);
            setFileName(filenameFromServer);
        } catch (e) {
            setError(e.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col w-full space-y-6 h-full">
            <h2 className="text-xl font-semibold text-gray-800">
                Blog Writer AI Agent
            </h2>
            <div className="flex lg:h-[28rem] md:h-[24rem] flex-grow gap-6 md:flex-row flex-col">
                {/* Left Panel */}
                <div className="md:w-2/5 lg:w-1/3 p-4 bg-gray-50 rounded-xl shadow-md flex flex-col justify-between ">
                    <div>
                        <LabeledInput
                            label="Topic"
                            name="TopicName"
                            placeholder="Write a topic for the blog post"
                            value={topicName}
                            onChange={(e) => setTopicName(e.target.value)}
                            className="mb-6"
                        />
                        {/* <div className="my-4">
                            <ToggleSwitch
                                label="Comparative Analysis"
                                enabled={comparativeAnalysis}
                                setEnabled={setComparativeAnalysis}
                                switchId="comparative-analysis-toggle"
                            />
                        </div> */}
                    </div>
                    <div>
                        <button
                            onClick={handleContinue}
                            disabled={isLoading || !topicName.trim()}
                            className="w-full hover:cursor-pointer py-3 mt-6 text-white font-medium rounded-md bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                        >
                            {isLoading ? 'Generating...' : 'Continue'}
                        </button>
                    </div>
                </div>

                <div className="md:w-3/5 lg:w-2/3 flex flex-col p-6 bg-gray-50 rounded-xl shadow-md overflow-y-auto">
                    {isLoading && (
                        <div className="flex flex-col items-center justify-center text-center h-full">
                            <svg className="animate-spin h-12 w-12 text-blue-600 mb-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <h3 className="text-2xl font-semibold text-gray-800 mb-3">
                                {loadingMessages[currentMessageIndex]}
                            </h3>
                            <p className="text-gray-600 max-w-lg">
                                Please wait while I prepare the report on {topicName}.
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
                    {downloadUrl && !isLoading && (
                        <div className="flex flex-col items-center justify-center text-center h-full">
                            <h3 className="text-2xl font-semibold text-gray-800 mb-3">
                                Your blog post is ready!
                            </h3>
                            <p className="text-gray-600 max-w-lg mb-6">
                                Click the button below to download your report.
                            </p>
                            <a
                                href={downloadUrl}
                                download={fileName}
                                className="w-1/2 hover:cursor-pointer py-3 mt-6 text-white font-medium rounded-md bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                                Download Report
                            </a>
                        </div>
                    )}
                    {!downloadUrl && !isLoading && !error && (
                        <div className="flex flex-col items-center justify-center text-center h-full">
                            <img src={robot} alt="robot" className="w-1/6 mb-6" />
                            <h3 className="text-2xl font-semibold text-gray-800 mb-3">
                                Welcome to Blog Writer AI Agent
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

export default BlogWriterAIAgent;
