import { Button } from '../ui/promptUi/button';
import { Input } from '../ui/promptUi/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '../ui/promptUi/card';
import { useApiKey } from '../../../context/ApiKeyContext';
import { CheckCircle, KeyRound, LogOut, Eye, EyeOff } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Label } from "../ui/promptUi/label";
import React from 'react';

const ApiKeySetup = () => {
  const { apiKey, setApiKey } = useApiKey();
  const [localApiKey, setLocalApiKey] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);

  useEffect(() => {
    setLocalApiKey(apiKey);
  }, [apiKey]);
  
  const handleSave = () => {
    setApiKey(localApiKey);
  };

  const handleClear = () => {
    setApiKey('');
    setLocalApiKey('');
  };

  if (apiKey) {
    return (
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-600">
            <CheckCircle className="h-5 w-5" />
            API Key is Active
          </CardTitle>
          <CardDescription>
            You are all set to generate prompts and analyze code.
          </CardDescription>
        </CardHeader>
        <CardFooter className="flex justify-end">
          <Button
            variant="destructive"
            onClick={handleClear}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Clear Key
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <KeyRound className="h-5 w-5" />
          Set Up Your OpenAI API Key
        </CardTitle>
        <CardDescription>
          Your API key is stored securely in local storage and never sent to our servers.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <Label htmlFor="api-key">OpenAI API Key</Label>
          <div className="relative">
            <Input
              id="api-key"
              type={showApiKey ? 'text' : 'password'}
              value={localApiKey}
              onChange={(e) => setLocalApiKey(e.target.value)}
              placeholder="sk-..."
              className="pr-10"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => setShowApiKey(!showApiKey)}
              className="absolute inset-y-0 right-0 h-full px-3 text-muted-foreground hover:text-foreground"
            >
              {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-end">
        <Button
          onClick={handleSave}
          disabled={!localApiKey.trim() || localApiKey === apiKey}
        >
          Save Key
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ApiKeySetup;
