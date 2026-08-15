import React, { Suspense, lazy } from 'react';

const LazyInteractiveBackground = lazy(() => import('./canvas/InteractiveBackground'));

export const Spatial3DCanvas: React.FC = () => {
  return (
    <Suspense fallback={null}>
      <LazyInteractiveBackground />
    </Suspense>
  );
};

export default Spatial3DCanvas;
