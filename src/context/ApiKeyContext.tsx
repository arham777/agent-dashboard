import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

// Types for our persisted data
export interface CodeAnalyzerData {
  code: string;
  userGoal: string;
}

export interface PromptCreatorData {
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

interface AppContextType {
  apiKey: string;
  codeAnalyzerData: CodeAnalyzerData;
  setCodeAnalyzerData: (data: CodeAnalyzerData) => void;
  promptCreatorData: PromptCreatorData;
  setPromptCreatorData: (data: PromptCreatorData) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  // API Key from environment variable
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY || '';

  // CodeAnalyzer state
  const [codeAnalyzerData, setCodeAnalyzerData] = useState<CodeAnalyzerData>(() => {
    const savedData = localStorage.getItem('code_analyzer_data');
    return savedData ? JSON.parse(savedData) : { code: '', userGoal: '' };
  });

  // PromptCreator state
  const [promptCreatorData, setPromptCreatorData] = useState<PromptCreatorData>(() => {
    const savedData = localStorage.getItem('prompt_creator_data');
    return savedData ? JSON.parse(savedData) : {
      appName: '',
      purpose: '',
      features: [],
      userRoles: [],
      entities: [],
      uiPreferences: '',
      integrations: '',
      existingCode: '',
      additionalNotes: ''
    };
  });

  // Save to localStorage whenever data changes
  useEffect(() => {
    localStorage.setItem('code_analyzer_data', JSON.stringify(codeAnalyzerData));
  }, [codeAnalyzerData]);

  useEffect(() => {
    localStorage.setItem('prompt_creator_data', JSON.stringify(promptCreatorData));
  }, [promptCreatorData]);

  return (
    <AppContext.Provider value={{ 
      apiKey, 
      codeAnalyzerData, 
      setCodeAnalyzerData,
      promptCreatorData,
      setPromptCreatorData
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};

// For backward compatibility
export const ApiKeyProvider = AppProvider;
export const useApiKey = () => {
  const { apiKey } = useAppContext();
  return { apiKey };
};
