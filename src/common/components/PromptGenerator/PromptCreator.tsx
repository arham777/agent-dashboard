import { useState } from 'react';
import { Button } from '../ui/promptUi/button';
import { Input } from '../ui/promptUi/input';
import { Label } from '../ui/promptUi/label';
import { Textarea } from '../ui/promptUi/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/promptUi/card';
import { Badge } from '../ui/promptUi/badge';
import { Copy, Wand2, Plus, X, Loader2, CheckCircle } from 'lucide-react';
import { useToast } from '../../../hooks/use-toast';
import { useApiKey, useAppContext, PromptCreatorData } from '../../../context/ApiKeyContext';
import React from 'react';

interface PromptData {
  appName: string;
  purpose: string;
  features: string[];
  userRoles: string[];
  entities: string[];
  uiPreferences: string;
  integrations: string;
  existingCode: string;
  additionalNotes: string;
}

const SectionCard = ({ title, description, children }: { title: string, description?: string, children: React.ReactNode }) => (
    <Card>
        <CardHeader>
            <CardTitle>{title}</CardTitle>
            {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
        <CardContent>
            {children}
        </CardContent>
    </Card>
);

const ListInput = ({ items, onAdd, onRemove, placeholder }: { items: string[], onAdd: (item: string) => void, onRemove: (index: number) => void, placeholder: string }) => {
    const [value, setValue] = useState('');

    const handleAdd = () => {
        if (value.trim()) {
            onAdd(value.trim());
            setValue('');
        }
    };

    return (
        <div className="space-y-3">
            <div className="flex gap-2">
                <Input
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    placeholder={placeholder}
                    onKeyPress={(e) => e.key === 'Enter' && handleAdd()}
                />
                <Button onClick={handleAdd} variant="secondary" size="icon" className="flex-shrink-0">
                    <Plus className="h-4 w-4" />
                </Button>
            </div>
            <div className="flex flex-wrap gap-2">
                {items.map((item, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1.5">
                        {item}
                        <button
                            type="button"
                            onClick={() => onRemove(index)}
                            className="rounded-full hover:bg-black/10 p-0.5"
                        >
                            <X className="h-3 w-3" />
                        </button>
                    </Badge>
                ))}
            </div>
        </div>
    );
};

const PromptCreator = () => {
  const { toast } = useToast();
  const { apiKey } = useApiKey();
  const { promptCreatorData, setPromptCreatorData } = useAppContext();
  const [generatedPrompt, setGeneratedPrompt] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

    const updateField = (field: keyof PromptData, value: string | string[]) => {
        setPromptCreatorData({ ...promptCreatorData, [field]: value });
    };

    const addItem = (type: 'features' | 'userRoles' | 'entities', value: string) => {
        updateField(type, [...promptCreatorData[type], value]);
  };

  const removeItem = (type: 'features' | 'userRoles' | 'entities', index: number) => {
        updateField(type, promptCreatorData[type].filter((_, i) => i !== index));
  };

  const generatePrompt = async () => {
    if (!apiKey.trim()) {
            toast({ title: "OpenAI API Key required", description: "Please set up your OpenAI API key first.", variant: "destructive" });
      return;
    }
        if (!promptCreatorData.appName || !promptCreatorData.purpose) {
            toast({ title: "Missing required fields", description: "Please fill in the App Name and Purpose.", variant: "destructive" });
      return;
    }

    setIsGenerating(true);
        setGeneratedPrompt('');
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
                headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages: [
            {
              role: 'system',
              content: `You are a master prompt engineer and a senior software architect specializing in creating detailed project blueprints for 'Lovable', a React-based web application builder. Your task is to generate a comprehensive and meticulously detailed prompt that serves as a complete guide for building a high-quality, feature-rich application.

When given a set of requirements, you must expand on them to create a full-fledged project plan. This includes:
- Application Core: Elaborate on the app's name and purpose, defining its core value proposition and target audience.
- Feature Breakdown: For each feature, provide a detailed description of its functionality, user interaction flow, and any states it might have (e.g., empty state, loading state, error state).
- User Personas & Roles: Detail each user role, their permissions, and the specific actions they can perform within the application. Create simple user stories for each role.
- Data Architecture: Define the necessary data entities, their attributes, and the relationships between them. Specify how data will be managed on the client-side (e.g., using React hooks, context, or state management libraries) and persisted using local storage.
- Component-Based UI/UX: Propose a logical component hierarchy based on the features. Describe the UI/UX, referencing the user's preferences but filling in the gaps with modern, user-friendly design principles.
- Technical Stack & Implementation Details: The solution must be frontend-only, using React, Tailwind CSS, and other client-side libraries. Explicitly state that no backend or server-side logic is required. All data persistence must be handled via the browser's local storage.

The final output must be a single, comprehensive, well-structured prompt in plain text. It must be actionable and provide a clear roadmap for a developer to build the application MVP with 'Lovable'.

IMPORTANT: The output must be pure plain text. Do not use any markdown formatting such as headers (e.g., ##), bolding (e.g., **text**), lists (e.g., - or 1.), or any other styling. Just provide the raw text content. For example, instead of "## Application Core", just write "Application Core". Instead of "**App Name:** SkillForge", write "App Name: SkillForge".`
            },
            {
              role: 'user',
              content: `Based on the following project details, generate a comprehensive and detailed project blueprint. Elaborate on each point as per your instructions.

App: ${promptCreatorData.appName}
Purpose: ${promptCreatorData.purpose}
${promptCreatorData.features.length > 0 ? `Core Features: ${promptCreatorData.features.join(', ')}` : ''}
${promptCreatorData.userRoles.length > 0 ? `User Roles: ${promptCreatorData.userRoles.join(', ')}` : ''}
${promptCreatorData.entities.length > 0 ? `Data Entities: ${promptCreatorData.entities.join(', ')}` : ''}
${promptCreatorData.uiPreferences ? `UI/UX Preferences: ${promptCreatorData.uiPreferences}` : ''}
${promptCreatorData.integrations ? `Integrations: ${promptCreatorData.integrations}` : ''}
${promptCreatorData.existingCode ? `Existing Code for reference: ${promptCreatorData.existingCode}` : ''}
${promptCreatorData.additionalNotes ? `Additional Notes: ${promptCreatorData.additionalNotes}` : ''}

Key Technical Constraints:
- Build a frontend-only application using React and Tailwind CSS.
- Implement data persistence using the browser's local storage.
- Ensure the application has a responsive design and follows a component-based architecture.
- Do not include any backend services, databases, or cloud infrastructure like AWS.
- The goal is a functional MVP, but the project plan should be detailed enough for clear implementation.`
            }
          ],
          temperature: 0.3,
          max_tokens: 1000,
        }),
      });
            if (!response.ok) throw new Error('Failed to generate prompt');
      const data = await response.json();
      setGeneratedPrompt(data.choices[0].message.content);
            toast({ title: "Prompt Generated!", description: "Your detailed project blueprint is ready." });
    } catch (error) {
      console.error('Generation error:', error);
            toast({ title: "Generation Failed", description: "There was an error generating your prompt. Please check your API key and try again.", variant: "destructive" });
    } finally {
      setIsGenerating(false);
    }
  };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(generatedPrompt);
        setIsCopied(true);
        toast({ title: "Copied!", description: "Prompt copied to clipboard." });
        
        // Reset the copied state after 2 seconds
        setTimeout(() => {
          setIsCopied(false);
        }, 2000);
  };

  return (
    <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                    <SectionCard title="App Basics" description="Start with the core details of your application.">
                        <div className="space-y-4">
            <div className="space-y-2">
                                <Label htmlFor="appName">App Name</Label>
                                <Input id="appName" value={promptCreatorData.appName} onChange={(e) => updateField('appName', e.target.value)} placeholder="e.g., TaskMaster Pro" />
            </div>
            <div className="space-y-2">
                                <Label htmlFor="purpose">App Purpose</Label>
                                <Textarea id="purpose" value={promptCreatorData.purpose} onChange={(e) => updateField('purpose', e.target.value)} placeholder="Describe what your app does and who it's for..." />
            </div>
          </div>
                    </SectionCard>

                    <SectionCard title="Features">
                        <ListInput items={promptCreatorData.features} onAdd={(v) => addItem('features', v)} onRemove={(i) => removeItem('features', i)} placeholder="Add a feature and press Enter..." />
                    </SectionCard>
                    
                    <SectionCard title="User Roles">
                        <ListInput items={promptCreatorData.userRoles} onAdd={(v) => addItem('userRoles', v)} onRemove={(i) => removeItem('userRoles', i)} placeholder="Add a user role and press Enter..." />
                    </SectionCard>
        </div>

                <div className="space-y-4">
                    <SectionCard title="Data Entities">
                        <ListInput items={promptCreatorData.entities} onAdd={(v) => addItem('entities', v)} onRemove={(i) => removeItem('entities', i)} placeholder="Add a data entity and press Enter..." />
                    </SectionCard>

                    <SectionCard title="Additional Information" description="Provide more context for a better prompt.">
                         <div className="space-y-4">
            <div className="space-y-2">
                                <Label htmlFor="uiPreferences">UI Preferences</Label>
                                <Input id="uiPreferences" value={promptCreatorData.uiPreferences} onChange={(e) => updateField('uiPreferences', e.target.value)} placeholder="e.g., minimal, dark theme" />
            </div>
            <div className="space-y-2">
                                <Label htmlFor="integrations">Integrations</Label>
                                <Input id="integrations" value={promptCreatorData.integrations} onChange={(e) => updateField('integrations', e.target.value)} placeholder="e.g., Stripe, Google Maps" />
            </div>
            <div className="space-y-2">
                                <Label htmlFor="existingCode">Existing Code Snippets</Label>
                                <Textarea id="existingCode" value={promptCreatorData.existingCode} onChange={(e) => updateField('existingCode', e.target.value)} placeholder="Paste any relevant code..." className="font-mono" />
            </div>
             <div className="space-y-2">
                                <Label htmlFor="additionalNotes">Additional Notes</Label>
                                <Textarea id="additionalNotes" value={promptCreatorData.additionalNotes} onChange={(e) => updateField('additionalNotes', e.target.value)} placeholder="Any other details to include?" />
            </div>
          </div>
                    </SectionCard>
        </div>
      </div>
      
            <div className="pt-4 border-t">
                <Button onClick={generatePrompt} disabled={isGenerating || !promptCreatorData.appName || !promptCreatorData.purpose || !apiKey} size="lg" className="w-full">
                    {isGenerating ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating...</> : <><Wand2 className="mr-2 h-4 w-4" /> Generate Prompt</>}
          </Button>
        </div>

            {isGenerating && (
                 <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-12 text-center">
                    <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
                    <p className="mt-4 text-lg font-medium">Crafting your prompt...</p>
                    <p className="mt-1 text-sm text-muted-foreground">This may take a few seconds.</p>
                </div>
            )}

        {generatedPrompt && (
                <div className="space-y-4">
                    <h3 className="text-xl font-semibold">Generated Prompt</h3>
                    <Card className="relative">
                        <Button 
                            onClick={copyToClipboard} 
                            variant={isCopied ? "default" : "ghost"} 
                            size="icon" 
                            className={`absolute top-2 right-2 h-8 w-8 transition-all ${isCopied ? 'bg-green-500 hover:bg-green-600' : ''}`}
                        >
                            {isCopied ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                        </Button>
                        <CardContent className="p-4">
                            <pre className="text-sm whitespace-pre-wrap font-sans">
                {generatedPrompt}
                            </pre>
            </CardContent>
          </Card>
                </div>
        )}
    </div>
  );
};

export default PromptCreator;
