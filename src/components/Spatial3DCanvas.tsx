import React, { Suspense, lazy } from 'react';
import { useTheme } from '../context/ThemeContext';

const LazyInteractiveBackground = lazy(() => import('./canvas/InteractiveBackground'));

export const Spatial3DCanvas: React.FC = () => {
  const { theme } = useTheme();

  return (
    <Suspense fallback={null}>
      <LazyInteractiveBackground theme={theme} />
    </Suspense>
  );
};

export default Spatial3DCanvas;
