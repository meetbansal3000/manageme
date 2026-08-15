import React, { Suspense, lazy } from 'react';

const LazyInteractiveBackground = lazy(() => import('./canvas/InteractiveBackground'));

export const BackgroundCanvas: React.FC = () => {
  return (
    <Suspense fallback={null}>
      <LazyInteractiveBackground />
    </Suspense>
  );
};

export default BackgroundCanvas;
