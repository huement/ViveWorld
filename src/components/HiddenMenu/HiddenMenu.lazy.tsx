import React, { lazy, Suspense, type JSX } from "react";

const LazyHiddenPanel = lazy(() =>
  import("./HiddenMenu").then((module: any) => ({
    default: module.default ?? module.HiddenMenu,
  })),
);

const HiddenPanel = (
  props: JSX.IntrinsicAttributes & { children?: React.ReactNode },
) => (
  <Suspense fallback={null}>
    <LazyHiddenPanel {...props} />
  </Suspense>
);

export default HiddenPanel;
