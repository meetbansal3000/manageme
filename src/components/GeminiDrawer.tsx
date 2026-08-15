import React from 'react';
import { AIAssistantDrawer } from './AIAssistantDrawer';

export interface GeminiDrawerProps {
  trackerContext: any;
  activeTab: string;
  onMutateState?: (mutations: any) => void;
  isOpenExternal?: boolean;
  onCloseExternal?: () => void;
}

export const GeminiDrawer: React.FC<GeminiDrawerProps> = (props) => {
  return <AIAssistantDrawer {...props} />;
};

export default GeminiDrawer;
