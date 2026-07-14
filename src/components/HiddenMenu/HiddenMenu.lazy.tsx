import React, { lazy, Suspense } from "react";

const LazyHiddenPanel = lazy(() => import("./HiddenMenu"));

const HiddenPanel = (
  props: JSX.IntrinsicAttributes & { children?: React.ReactNode },
) => (
  <Suspense fallback={null}>
    <LazyHiddenPanel {...props} />
  </Suspense>
);

export default HiddenPanel;
