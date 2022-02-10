import { Blend } from "../blend/blend";
import { CorePalette } from "../palettes/core_palette";
import { TonalPalette } from "../palettes/tonal_palette";
import { Scheme } from "../scheme/scheme";
import { seedFromImage } from "./image_utils";

/**
 * Custom color used to pair with a theme
 */
export interface CustomColor {
  value: number;
  name: string;
  blend: boolean;
}

/**
 * Color group
 */
export interface ColorGroup {
  color: number;
  onColor: number;
  colorContainer: number;
  onColorContainer: number;
}

/**
 * Custom Color Group
 */
export interface CustomColorGroup {
  color: CustomColor;
  value: number;
  light: ColorGroup;
  dark: ColorGroup;
}

/**
 * Theme
 */
export interface Theme {
  seed: number;
  schemes: {
    light: Scheme;
    dark: Scheme;
  };
  palettes: {
    primary: TonalPalette;
    secondary: TonalPalette;
    tertiary: TonalPalette;
    neutral: TonalPalette;
    neutralVariant: TonalPalette;
    error: TonalPalette;
  };
  customColors: CustomColorGroup[];
}

/**
 * Generate a theme from a seed
 *
 * @param seed Seed color
 * @param customColors Array of custom colors
 * @return Theme object
 */
export function themeFromSeed(
  seed: number,
  customColors: CustomColor[] = []
): Theme {
  const palette = CorePalette.of(seed);
  return {
    seed: seed,
    schemes: {
      light: Scheme.light(seed),
      dark: Scheme.dark(seed),
    },
    palettes: {
      primary: palette.a1,
      secondary: palette.a2,
      tertiary: palette.a3,
      neutral: palette.n1,
      neutralVariant: palette.n2,
      error: palette.error,
    },
    customColors: customColors.map((c) => customColor(seed, c)),
  };
}

/**
 * Generate a theme from an image seed
 *
 * @param image Image url or array buffer
 * @param customColors Array of custom colors
 * @return Theme object
 */
export async function themeFromImage(
  image: ArrayBuffer | string,
  customColors: CustomColor[] = []
) {
  const seed = await seedFromImage(image);
  return themeFromSeed(seed, customColors);
}

/**
 * Generate custom color group from seed and target color.
 *
 * @param seed Seed color
 * @param color Custom color
 * @return Custom color group
 */
export function customColor(
  seed: number,
  color: CustomColor
): CustomColorGroup {
  let value = color.value;
  const from = value;
  const to = seed;
  if (color.blend) {
    value = Blend.harmonize(from, to);
  }
  const palette = CorePalette.of(value);
  const tones = palette.a1;
  return {
    color,
    value,
    light: {
      color: tones.tone(40),
      onColor: tones.tone(100),
      colorContainer: tones.tone(90),
      onColorContainer: tones.tone(10),
    },
    dark: {
      color: tones.tone(80),
      onColor: tones.tone(20),
      colorContainer: tones.tone(30),
      onColorContainer: tones.tone(90),
    },
  };
}


/**
 * Apply a theme to an element
 * 
 * @param theme Theme object
 * @param options Options
 */
export function applyTheme(theme: Theme, options?: {
  dark?: boolean,
  target?: HTMLElement,
}) {
  const target = options?.target || document.body;
  const isDark = options?.dark ?? window.matchMedia("(prefers-color-scheme: dark)").matches;
  const scheme = isDark ? theme.schemes.dark : theme.schemes.light;
  for (const [key, value] of Object.entries(scheme.toJSON())) {
    const token = key.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase();
    const color = hexFromArgb(value);
    target.style.setProperty(`--md-sys-color-${token}`, color);
  }
}
