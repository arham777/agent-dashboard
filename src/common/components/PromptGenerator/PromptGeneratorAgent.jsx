import ApiKeySetup from "./ApiKeySetup";
import CodeAnalyzer from "./CodeAnalyzer";
import PromptCreator from "./PromptCreator";

import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "../ui/promptUi/tabs";
import { useApiKey } from "../../../context/ApiKeyContext";
import { Wand2, Code, KeyRound } from "lucide-react";


const PromptGeneratorAgent = () => {
    const { apiKey } = useApiKey();

    return (
        <div className="container mx-auto py-6 px-4 sm:px-6 lg:px-8 max-w-7xl">
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
                            <TabsTrigger value="api-key" className="relative">
                                <KeyRound className="mr-2 h-4 w-4" />
                                API Key
                                {!apiKey && (
                                    <span className="absolute top-0 right-[-10px] flex h-2.5 w-2.5">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-destructive"></span>
                                    </span>
                                )}
                            </TabsTrigger>
                        </TabsList>
                    </div>

                    <TabsContent value="creator">
                        <PromptCreator />
                    </TabsContent>

                    <TabsContent value="analyzer">
                        <CodeAnalyzer />
                    </TabsContent>

                    <TabsContent value="api-key">
                        <ApiKeySetup />
                    </TabsContent>
                </Tabs>
            </main>
        </div>
    );
};

export default PromptGeneratorAgent;
