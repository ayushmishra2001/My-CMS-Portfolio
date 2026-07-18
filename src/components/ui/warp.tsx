"use client";

import dynamic from "next/dynamic";
import { memo } from "react";
import type { WarpProps } from "@paper-design/shaders-react";

// Dynamically import Warp with SSR disabled to prevent Node.js WebGL prerender errors
const DynamicWarp = dynamic<WarpProps>(
  () => import("@paper-design/shaders-react").then((mod) => mod.Warp),
  { ssr: false }
);

export const Warp = memo(DynamicWarp);
export { warpPresets } from "@paper-design/shaders-react";
export type { WarpProps } from "@paper-design/shaders-react";

export default Warp;
