// minimatch is a peer dependency of glob
import minimatch from "minimatch";
export const filterByMinimatch = (input: string, rules: string[]): boolean => {
  return rules.some((item) =>
    minimatch(input, item, {
      dot: true,
    })
  );
};

export const getOrderedJson = (json: object) => {
  const entries = Object.entries(json);
  entries.sort((a, b) => (a[0] < b[0] ? -1 : 1));
  return entries.reduce((total, [key, value]) => ({ ...total, [key]: value }), {});
};
