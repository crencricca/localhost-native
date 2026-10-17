const { Colors, Border, Shadows, Fonts } = require("./src/constants/tokens");

// font-<role> uses the role's default weight; font-<role>-<weight> picks one.
const defaultWeight = { sans: 400, display: 600, handwritten: 600 };
const fontFamily = Object.fromEntries(
  Object.entries(Fonts).flatMap(([role, weights]) => [
    [role, [weights[defaultWeight[role]]]],
    ...Object.entries(weights).map(([weight, family]) => [
      `${role}-${weight}`,
      [family],
    ]),
  ]),
);

/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all files that contain Nativewind classes.
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: Colors,
      fontFamily,
      borderRadius: { card: `${Border.radius}px` },
      borderWidth: { card: `${Border.width}px` },
      boxShadow: Shadows,
    },
  },
  plugins: [],
};
