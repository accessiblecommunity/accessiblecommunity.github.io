
// Breakpoints
// Note: Not currently using xs, can add it later.
export type Breakpoint = "sm" | "md" | "lg" | "xl" | "xxl";
export type BreakpointOptions<T> = {
  [key in Breakpoint]?: T
}

// Flex Types
export type FlexColumnConfig = "column" | "column-reverse";
export type FlexRowConfig = "row" | "row-reverse";
export type FlexDirection = FlexColumnConfig | FlexRowConfig;
export type FlexJustifyContent = "start" | "end" | "center" | "between" | "around" | "evenly";
export type FlexAlignItems = "start" | "end" | "center" | "baseline" | "stretch";
export interface FlexOptions {
  inline?: boolean;
  direction?: FlexDirection;
  justifyContent?: FlexJustifyContent;
  alignItems?: FlexAlignItems;
}
export type FlexConfig = FlexDirection | FlexOptions;

export type GapSizes = "0" | "1" | "2" | "3" | "4" | "5";
