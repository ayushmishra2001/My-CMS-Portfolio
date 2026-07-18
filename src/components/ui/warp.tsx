"use client";

import { memo } from "react";
import { Warp as BaseWarp } from "@paper-design/shaders-react";

export const Warp = memo(BaseWarp);
export { warpPresets } from "@paper-design/shaders-react";
export type { WarpProps } from "@paper-design/shaders-react";

export default Warp;
