import React, { lazy, Suspense } from 'react';

const LazySpectrumPanel = lazy(() => import('./SpectrumPanel'));

const SpectrumPanel = (props: JSX.IntrinsicAttributes & { children?: React.ReactNode; }) => (
  <Suspense fallback={null}>
    <LazySpectrumPanel {...props} />
  </Suspense>
);

export default SpectrumPanel;
