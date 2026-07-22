import React, { lazy, Suspense, type JSX } from 'react';

const LazyMetricsPanel = lazy(() =>
  import("./MetricsPanel").then((module: any) => ({
    default: module.default ?? module.HiddenMenu,
  })),
);

const MetricsPanel = (props: JSX.IntrinsicAttributes & { children?: React.ReactNode; }) => (
  <Suspense fallback={null}>
    <LazyMetricsPanel {...props} />
  </Suspense>
);

export default MetricsPanel;
