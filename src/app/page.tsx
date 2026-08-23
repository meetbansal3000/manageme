// Page: Next.js Main View Orchestrator & Dashboard Router

'use client';

import React from 'react';
import App from '../App';
import { ErrorBoundary } from '../components/ui/ErrorBoundary';

export default function Page() {
  return (
    <ErrorBoundary
      fallbackTitle="ManageMe Workspace Notice"
      fallbackMessage="The workspace encountered a view disruption. Click retry to recover state."
    >
      <App />
    </ErrorBoundary>
  );
}
