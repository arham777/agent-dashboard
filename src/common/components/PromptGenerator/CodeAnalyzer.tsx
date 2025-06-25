import { useState } from 'react';
import { Button } from '../ui/promptUi/button';
import { Textarea } from '../ui/promptUi/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/promptUi/card';
import { Badge } from '../ui/promptUi/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/promptUi/tabs';
import { FileText, Lightbulb, Zap, Copy, Target, ArrowRight, CheckCircle, Loader2, AlertTriangle, GanttChartSquare } from 'lucide-react';
import { useToast } from '../../../hooks/use-toast';
import { useApiKey, useAppContext } from '../../../context/ApiKeyContext';
import { Progress } from '../ui/promptUi/progress';
import React from 'react';

interface CodeAnalysis {
  summary: string;
  technologies: string[];
  improvements: string[];
  integrationSteps: string[];
  nextSteps: string[];
  codeQuality: {
    score: number;
    issues: string[];
  };
}

const CodeAnalyzer = () => {
  const { toast } = useToast();
  const { apiKey } = useApiKey();
  const { codeAnalyzerData, setCodeAnalyzerData } = useAppContext();
  const [analysis, setAnalysis] = useState<CodeAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const { code, userGoal } = codeAnalyzerData;

  const updateCode = (newCode: string) => {
    setCodeAnalyzerData({ ...codeAnalyzerData, code: newCode });
  };

  const updateUserGoal = (newGoal: string) => {
    setCodeAnalyzerData({ ...codeAnalyzerData, userGoal: newGoal });
  };

  const analyzeCode = async () => {
    if (!code.trim()) {
      toast({ title: "No code provided", description: "Please paste some code to analyze.", variant: "destructive" });
      return;
    }
    if (!apiKey.trim()) {
      toast({ title: "OpenAI API Key required", description: "Please set up your OpenAI API key first.", variant: "destructive" });
      return;
    }

    setIsAnalyzing(true);
    setAnalysis(null);
    
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'gpt-4o',
          response_format: { type: "json_object" },
          messages: [
            {
              role: 'system',
              content: 'You are a senior software engineer and code analysis expert. Analyze the provided code and return a detailed JSON response with: summary (string), technologies (array of strings), improvements (array of strings), integrationSteps (array of strings), nextSteps (array of actionable next steps), and codeQuality (object with score number 0-100 and issues array of strings). Be thorough and provide actionable insights with specific next steps the developer should take. Ensure the output is a valid JSON object.'
            },
            {
              role: 'user',
              content: `Please analyze this code and provide comprehensive insights including specific next steps:\n\n${userGoal ? `User's Goal: ${userGoal}\n\n` : ''}Code to analyze:\n\n\`\`\`\n${code}\n\`\`\`\n\nProvide detailed analysis including:\n- Clear summary of what the code does\n- Technologies and frameworks used\n- Specific improvement suggestions with explanations\n- Step-by-step integration recommendations\n- Actionable next steps the developer should take immediately\n- Code quality assessment with specific issues identified\n\nFocus on practical, actionable advice that will help the developer move forward with their project. Return a valid JSON object.`
            }
          ],
          temperature: 0.3,
          max_tokens: 4000,
        }),
      });

      if (!response.ok) throw new Error('Failed to analyze code with OpenAI API');

      const data = await response.json();
      const analysisResult = JSON.parse(data.choices[0].message.content);
      setAnalysis(analysisResult);
      
      toast({ title: "Analysis Complete!", description: "Your code has been analyzed successfully." });
    } catch (error) {
      console.error('Analysis error:', error);
      toast({ title: "Analysis Failed", description: "There was an error analyzing your code. Please check your API key and try again.", variant: "destructive" });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const copyToClipboard = (content: string) => {
    navigator.clipboard.writeText(content);
    toast({ title: "Copied!", description: "Analysis copied to clipboard." });
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-2">
          <h3 className="text-base font-medium">Your Goal</h3>
          <p className="text-sm text-muted-foreground">Describe what you want to achieve with this code.</p>
          <Textarea
            value={userGoal}
            onChange={(e) => updateUserGoal(e.target.value)}
            placeholder="e.g., 'Improve performance', 'Add new features'..."
            className="min-h-[120px] text-sm"
          />
        </div>
        <div className="space-y-2">
          <h3 className="text-base font-medium">Your Code</h3>
          <p className="text-sm text-muted-foreground">Paste your code here for a comprehensive analysis.</p>
          <Textarea
            value={code}
            onChange={(e) => updateCode(e.target.value)}
            placeholder="const App = () => ..."
            className="min-h-[120px] font-mono text-sm"
          />
        </div>
      </div>
      
      <div className="flex justify-center">
        <Button
          onClick={analyzeCode}
          disabled={isAnalyzing || !code.trim() || !apiKey}
          size="lg"
        >
          {isAnalyzing ? (
            <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Analyzing...</>
          ) : (
            <><Zap className="mr-2 h-4 w-4" /> Analyze Code</>
          )}
        </Button>
      </div>

      {isAnalyzing && (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-12 text-center">
          <Loader2 className="h-8 w-8 text-primary animate-spin" />
          <p className="mt-4 text-lg font-medium">Analyzing your code...</p>
          <p className="mt-1 text-sm text-muted-foreground">Please wait a moment.</p>
        </div>
      )}

      {analysis && (
        <Card>
          <CardHeader>
            <CardTitle>Analysis Results</CardTitle>
            <CardDescription>A detailed breakdown of your code.</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="summary" className="w-full">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="summary">Summary</TabsTrigger>
                <TabsTrigger value="quality">Quality</TabsTrigger>
                <TabsTrigger value="improvements">Improve</TabsTrigger>
                <TabsTrigger value="integration">Integrate</TabsTrigger>
                <TabsTrigger value="nextsteps">Next Steps</TabsTrigger>
              </TabsList>
              
              <TabsContent value="summary" className="pt-4">
                <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <GanttChartSquare className="h-5 w-5 text-blue-600" /> Code Summary
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-sm leading-relaxed">{analysis.summary}</p>
                      <div className="flex flex-wrap gap-2">
                        <h4 className="text-sm font-semibold w-full">Technologies Detected:</h4>
                        {analysis.technologies.map((tech, index) => (
                          <Badge key={index} variant="secondary">{tech}</Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
              </TabsContent>

              <TabsContent value="quality" className="pt-4">
                 <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-blue-600" /> Code Quality
                      </CardTitle>
                      <CardDescription>Score: {analysis.codeQuality.score}/100</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <Progress value={analysis.codeQuality.score} className="w-full" />
                       <ul className="list-disc space-y-2 pl-5 text-sm">
                        {analysis.codeQuality.issues.map((issue, index) => (
                          <li key={index}>{issue}</li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
              </TabsContent>

              <TabsContent value="improvements" className="pt-4">
                 <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Lightbulb className="h-5 w-5 text-blue-600" /> Improvement Suggestions
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                       <ul className="list-disc space-y-2 pl-5 text-sm">
                        {analysis.improvements.map((item, index) => (
                          <li key={index}>{item}</li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
              </TabsContent>
              
              <TabsContent value="integration" className="pt-4">
                 <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <ArrowRight className="h-5 w-5 text-blue-600" /> Integration Steps
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                       <ul className="list-decimal space-y-2 pl-5 text-sm">
                        {analysis.integrationSteps.map((item, index) => (
                          <li key={index}>{item}</li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
              </TabsContent>

              <TabsContent value="nextsteps" className="pt-4">
                 <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Target className="h-5 w-5 text-blue-600" /> Recommended Next Steps
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                       <ul className="list-disc space-y-2 pl-5 text-sm">
                        {analysis.nextSteps.map((item, index) => (
                          <li key={index}>{item}</li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CodeAnalyzer;
