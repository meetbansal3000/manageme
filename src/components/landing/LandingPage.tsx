// Component: Landing Page Orchestrator View

import React from 'react';
import { LandingView } from './LandingView';

export interface LandingPageProps {
  onEnterApp: (tabId?: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onEnterApp }) => {
  return <LandingView onEnterApp={onEnterApp} />;
};

export default LandingPage;
