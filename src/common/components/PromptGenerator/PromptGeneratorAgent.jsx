import CodeAnalyzer from "./CodeAnalyzer";
import PromptCreator from "./PromptCreator";

import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "../ui/promptUi/tabs";
import { Wand2, Code, AlertTriangle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "../ui/promptUi/alert";
import { useEffect, useState } from "react";

const PromptGeneratorAgent = () => {
    const [apiKeyMissing, setApiKeyMissing] = useState(false);

    useEffect(() => {
        // Check if the API key is available in environment variables
        const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
        setApiKeyMissing(!apiKey || apiKey === "your_api_key_here");
    }, []);

    return (
        <div className="container mx-auto py-6 px-4 sm:px-6 lg:px-8 max-w-7xl">
            {apiKeyMissing && (
                <Alert variant="destructive" className="mb-6">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>API Key Missing</AlertTitle>
                    <AlertDescription>
                        The OpenAI API key is not configured. Please set the VITE_OPENAI_API_KEY in your environment variables.
                    </AlertDescription>
                </Alert>
            )}

            <header className="text-center mb-8">
                <h1 className="text-3xl font-bold tracking-tight">
                    Prompt Generator
                </h1>
                <p className="mt-2 text-base text-muted-foreground">
                    Craft the perfect, detailed prompt for your next React application.
                </p>
            </header>

            <main>
                <Tabs defaultValue="creator" className="w-full">
                    <div className="flex justify-center mb-6">
                        <TabsList className="gap-6">
                            <TabsTrigger value="creator">
                                <Wand2 className="mr-2 h-4 w-4" />
                                Prompt Creator
                            </TabsTrigger>
                            <TabsTrigger value="analyzer">
                                <Code className="mr-2 h-4 w-4" />
                                Code Analyzer
                            </TabsTrigger>
                        </TabsList>
                    </div>

                    <TabsContent value="creator">
                        <PromptCreator />
                    </TabsContent>

                    <TabsContent value="analyzer">
                        <CodeAnalyzer />
                    </TabsContent>
                </Tabs>
            </main>
        </div>
    );
};

export default PromptGeneratorAgent;
