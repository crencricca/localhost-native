// Design tokens ported from the web app's globals.css :root.
// CommonJS so tailwind.config.js can require it; theme.ts re-exports it typed.

const accent2 = "#5e96a3";
const sageFocus = "#8fc7d8";

const Colors = /** @type {const} */ ({
  canvas: "#191724",
  surface: "#1f1d2e",
  surfaceRaised: "#26233a",
  ink: "#dcd7f0",
  muted: "#7a7693",
  line: "#5a566b",
  lineSoft: "#403d52",
  accent: "#9078bb",
  accentHover: "#7f68a8",
  accent2,
  accent3: "#b88a92",
  accentFg: "#191724",
  chip: "#2d2842",
  chipHover: "#383153",
  chipInk: "#dcd7f0",
  sageBg: "#437a86",
  sageFg: "#dcd7f0",
  sageFocus,
  focusRing: sageFocus,
  wash: accent2,
});

// From .brutal-card / .brutal-button.
const Border = /** @type {const} */ ({
  width: 2,
  radius: 8,
  color: Colors.ink,
});

const Shadows = /** @type {const} */ ({
  hard: "2px 2px 0px 0px rgba(10, 8, 18, 0.58)",
});

// Family names are the keys fonts are registered under with useFonts.
const Fonts = /** @type {const} */ ({
  sans: {
    400: "SpaceGrotesk_400Regular",
    500: "SpaceGrotesk_500Medium",
    600: "SpaceGrotesk_600SemiBold",
    700: "SpaceGrotesk_700Bold",
  },
  display: {
    500: "ChakraPetch_500Medium",
    600: "ChakraPetch_600SemiBold",
    700: "ChakraPetch_700Bold",
  },
  handwritten: {
    600: "Caveat_600SemiBold",
    700: "Caveat_700Bold",
  },
});

module.exports = { Colors, Border, Shadows, Fonts };
