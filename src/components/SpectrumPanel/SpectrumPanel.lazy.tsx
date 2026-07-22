import React, { lazy, Suspense, type JSX } from 'react';

const LazySpectrumPanel= lazy(() =>
  import("./SpectrumPanel").then((module: any) => ({
    default: module.default ?? module.HiddenMenu,
  })),
);

const SpectrumPanel = (props: JSX.IntrinsicAttributes & { children?: React.ReactNode; }) => (
  <Suspense fallback={null}>
    <LazySpectrumPanel {...props} />
  </Suspense>
);

export default SpectrumPanel;
