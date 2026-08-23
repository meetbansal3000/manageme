// Component: Master Landing Page Wrapper

import React from 'react';
import { LandingView } from './landing/LandingView';

export interface LandingPageProps {
  onEnterApp: (tabId?: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onEnterApp }) => {
  return <LandingView onEnterApp={onEnterApp} />;
};

export default LandingPage;
