import React, { lazy, Suspense } from 'react';

const LazyMetricsPanel = lazy(() => import('./MetricsPanel'));

const MetricsPanel = (props: JSX.IntrinsicAttributes & { children?: React.ReactNode; }) => (
  <Suspense fallback={null}>
    <LazyMetricsPanel {...props} />
  </Suspense>
);

export default MetricsPanel;
