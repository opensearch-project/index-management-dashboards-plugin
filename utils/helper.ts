// minimatch is a peer dependency of glob
import minimatch from "minimatch";
export const filterByMinimatch = (input: string, rules: string[]): boolean => {
  return rules.some((item) => minimatch(input, item));
};
