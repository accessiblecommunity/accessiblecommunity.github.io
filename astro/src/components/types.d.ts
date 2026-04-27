export interface Breakpoints<T> {
  xs: T,
  sm: T,
  md: T,
  lg: T,
  xl: T,
  xxl: T,
}

export interface OptionalBreakpoints<T> {
  xs?: T,
  sm?: T,
  md?: T,
  lg?: T,
  xl?: T,
  xxl?: T,
}

// Flex Types
type FlexColumnConfig = "column" | "column-reverse";
type FlexRowConfig = "row" | "row-reverse";
type FlexDirection = FlexColumnConfig | FlexRowConfig;
type FlexJustifyContent = "start" | "end" | "center" | "between" | "around" | "evenly";
type FlexAlignItems = "start" | "end" | "center" | "baseline" | "stretch";
interface FlexOptions {
  inline?: boolean;
  direction?: FlexDirection;
  justifyContent?: FlexJustifyContent;
  alignItems?: FlexAlignItems;
}
type FlexConfig = FlexDirection | FlexOptions;

type GapSizes = "0" | "1" | "2" | "3" | "4" | "5";
