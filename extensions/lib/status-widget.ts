/** One full-height usage bar, coloured by six disjoint content categories. */
import { truncateToWidth } from "@earendil-works/pi-tui";

export const FOLD_BAR_WIDTH = 40;
// GROUPED BY DISTANCE FROM COMPRESSION, left to right (Shane 2026-09-06). Consolidated,
// span and tool folds are compressed now, deepest first. Marked content is raw now and
// folds at the next commit. Raw content is raw now and eligible later. Pinned content is
// raw and HELD against every commit until released, so it is the farthest from
// compression of all, and it sits at the fresh edge of the bar.
export const FOLD_BAR_KINDS = ["consolidated", "span", "tool", "marked", "raw", "pinned"] as const;
export type FoldBarKind = typeof FOLD_BAR_KINDS[number];
export type FoldBarMass = Record<FoldBarKind, number>;
export const emptyFoldBarMass = (): FoldBarMass => ({ consolidated: 0, span: 0, tool: 0, marked: 0, raw: 0, pinned: 0 });

// ALL SIX KINDS TAKE THEIR SHADE FROM THE MAP, in that order (Shane 2026-09-06, second
// pass). A pin sat off the ramp in the theme accent for one build; Shane put it back at
// the far end, because a pin is the MOST settled state of all, decided and held, and the
// map's last shade reads as separate from the rest of the fill on its own.

// THE COLOUR MAPS, sampled at 64 positions by lab/generate_colour_maps.py: Batlow from
// Crameri's own 256-step table, the other four from matplotlib. Five shades are read off
// the chosen map by linear interpolation between a start and an end position, so a
// person can use the whole map, a slice of it, or run it backwards. No palette library
// ships: these tables are the whole dependency.
export const COLOUR_MAP_NAMES = ["batlow", "viridis", "plasma", "magma", "cividis"] as const;
export type ColourMapName = typeof COLOUR_MAP_NAMES[number];
const COLOUR_MAPS: Record<ColourMapName, readonly string[]> = {
  batlow: [
    "#011959", "#051F5A", "#08265B", "#0B2B5C", "#0D315D", "#0E365E", "#0F3B5F", "#103F60",
    "#114360", "#124761", "#134B61", "#154F62", "#175362", "#195662", "#1C5A62", "#1F5D61",
    "#236061", "#27635F", "#2C665D", "#31695B", "#376B59", "#3C6D56", "#426F52", "#49714F",
    "#4F734C", "#557548", "#5C7744", "#627941", "#697B3D", "#707D3A", "#777F36", "#7E8133",
    "#858330", "#8D852E", "#94872C", "#9C892B", "#A48B2C", "#AC8C2D", "#B48E30", "#BC8F34",
    "#C49138", "#CB923E", "#D29343", "#D9954A", "#E09651", "#E69858", "#EC9A61", "#F19C69",
    "#F59F73", "#F8A17C", "#FAA486", "#FCA78F", "#FDAB98", "#FDAEA1", "#FDB1AA", "#FDB3B3",
    "#FDB6BB", "#FDB9C4", "#FDBCCC", "#FCBFD5", "#FCC2DE", "#FBC6E7", "#FBC9F1", "#FACCFA",
  ],
  viridis: [
    "#440154", "#46075A", "#470D60", "#471365", "#48186B", "#481E6F", "#482374", "#482878",
    "#472D7C", "#46327F", "#453782", "#433C84", "#424186", "#404688", "#3E4A89", "#3C4F8A",
    "#3A538B", "#38578C", "#365C8D", "#34608D", "#32648E", "#31688E", "#2F6C8E", "#2D708E",
    "#2C748E", "#2A778E", "#297B8E", "#277F8E", "#26838E", "#24878E", "#238A8D", "#218E8D",
    "#20928C", "#1F968B", "#1F9A8A", "#1F9D89", "#1FA187", "#21A586", "#23A984", "#26AC81",
    "#2AB07F", "#2FB47C", "#35B779", "#3BBB75", "#42BE71", "#4AC26D", "#52C569", "#5AC864",
    "#63CB5F", "#6CCE59", "#76D054", "#80D34D", "#8AD547", "#94D841", "#9FDA3A", "#A9DC33",
    "#B4DD2C", "#BFDF25", "#CAE01F", "#D4E21A", "#DFE318", "#E9E41A", "#F3E61E", "#FDE725",
  ],
  plasma: [
    "#0D0887", "#19068C", "#220690", "#2A0593", "#320597", "#39049A", "#40049C", "#46039F",
    "#4D02A1", "#5402A3", "#5A01A5", "#6001A6", "#6700A7", "#6D00A8", "#7301A8", "#7902A8",
    "#7F03A8", "#8506A7", "#8B0AA5", "#910EA3", "#9613A1", "#9C179E", "#A11C9B", "#A62098",
    "#AB2594", "#B02991", "#B42E8D", "#B93289", "#BD3785", "#C13B82", "#C5407E", "#C9457A",
    "#CD4976", "#D14E73", "#D4526F", "#D8576C", "#DB5C68", "#DE6065", "#E16561", "#E46A5E",
    "#E76F5A", "#EA7457", "#ED7953", "#EF7E50", "#F2834C", "#F48849", "#F68D45", "#F89342",
    "#F9993E", "#FA9E3B", "#FCA437", "#FDAA34", "#FDB031", "#FEB62E", "#FEBC2B", "#FDC328",
    "#FDC926", "#FCD025", "#FBD624", "#F9DD25", "#F7E425", "#F5EB27", "#F2F227", "#F0F921",
  ],
  magma: [
    "#000004", "#02010A", "#040312", "#06051A", "#0A0822", "#0F0B2B", "#130D34", "#180F3E",
    "#1D1148", "#231151", "#29115B", "#301164", "#37106C", "#3E0F72", "#450F76", "#4B117A",
    "#52137C", "#58157E", "#5F187F", "#651A80", "#6B1D81", "#721F81", "#782281", "#7E2482",
    "#852681", "#8B2981", "#922B81", "#982D80", "#9F2F7F", "#A5317E", "#AC337C", "#B3357A",
    "#B93878", "#C03A76", "#C63D74", "#CD3F71", "#D3436E", "#D9466B", "#DF4A68", "#E44F65",
    "#E95462", "#ED5A5F", "#F1605D", "#F4675C", "#F66E5C", "#F8765C", "#FA7E5E", "#FB8560",
    "#FC8D63", "#FD9567", "#FD9C6B", "#FEA470", "#FEAB75", "#FEB37A", "#FEBA80", "#FEC286",
    "#FEC98D", "#FED193", "#FED89A", "#FDDFA1", "#FDE7A8", "#FCEEB0", "#FCF5B7", "#FCFDBF",
  ],
  cividis: [
    "#00224E", "#002554", "#00285B", "#002B63", "#002E6A", "#003070", "#063370", "#123670",
    "#1B386F", "#223B6E", "#283E6E", "#2D416D", "#32446D", "#37476C", "#3C496C", "#404C6C",
    "#444F6C", "#48526C", "#4C556C", "#50576C", "#545A6D", "#575D6D", "#5B606E", "#5F636F",
    "#62666F", "#666870", "#696B71", "#6D6E72", "#707173", "#747475", "#777776", "#7A7A78",
    "#7E7D78", "#828078", "#868379", "#898678", "#8D8978", "#918C78", "#958F77", "#999277",
    "#9D9576", "#A19875", "#A59C74", "#A99F73", "#ADA272", "#B2A570", "#B6A96F", "#BAAC6D",
    "#BEAF6B", "#C2B369", "#C7B667", "#CBBA64", "#CFBD62", "#D4C15F", "#D8C45C", "#DDC859",
    "#E1CC55", "#E5CF51", "#EAD34D", "#EFD748", "#F3DB42", "#F8DF3C", "#FDE234", "#FEE838",
  ],
};

/** Which map the bar reads and where on it the two ends of the ramp sit. `start` is the
 *  position of the most compressed shade and `end` the position of raw; a start above
 *  its end runs the map backwards. Both are positions in [0, 1] and may not coincide,
 *  because six shades read at one position are one shade. */
export interface FoldBarPalette { map: ColourMapName; start: number; end: number; }
export const DEFAULT_FOLD_BAR_PALETTE: Readonly<FoldBarPalette> = Object.freeze({ map: "batlow", start: 0, end: 1 });

export class FoldBarPaletteError extends Error {}

/** One resolver for every path a palette arrives by: registration, the settings file and
 *  a live edit. Absent means the package default; anything present is validated whole. */
export function resolveFoldBarPalette(value: unknown): FoldBarPalette {
  if (value === undefined) return { ...DEFAULT_FOLD_BAR_PALETTE };
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new FoldBarPaletteError("palette must be an object { map, start, end }");
  }
  const candidate = value as Record<string, unknown>;
  for (const key of Object.keys(candidate)) {
    if (key !== "map" && key !== "start" && key !== "end") {
      throw new FoldBarPaletteError(`palette has no ${key} field: the fields are map, start, end`);
    }
  }
  const { map, start, end } = candidate;
  if (typeof map !== "string" || !(COLOUR_MAP_NAMES as readonly string[]).includes(map)) {
    throw new FoldBarPaletteError(`palette.map must be one of ${COLOUR_MAP_NAMES.join(", ")}`);
  }
  for (const [name, position] of [["start", start], ["end", end]] as const) {
    if (typeof position !== "number" || !Number.isFinite(position) || position < 0 || position > 1) {
      throw new FoldBarPaletteError(`palette.${name} must be a position on the map from 0 to 1`);
    }
  }
  if (start === end) {
    throw new FoldBarPaletteError("palette.start and palette.end must differ: six shades read at one position are one shade");
  }
  return { map: map as ColourMapName, start: start as number, end: end as number };
}

// sRGB <-> linear <-> OKLab, enough to hold a hue while moving its lightness.
const hexToRgb = (hex: string): number[] => [1, 3, 5].map((at) => parseInt(hex.slice(at, at + 2), 16) / 255);
const rgbToHex = (rgb: number[]): string =>
  "#" + rgb.map((v) => Math.round(Math.max(0, Math.min(1, v)) * 255).toString(16).padStart(2, "0").toUpperCase()).join("");
const toLinear = (c: number): number => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
const fromLinear = (c: number): number => (c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055);
const luminanceOf = (hex: string): number => {
  const [r, g, b] = hexToRgb(hex).map(toLinear);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
/** WCAG contrast ratio between two colours, the measure gate 165 has always applied. */
export function contrastRatio(a: string, b: string): number {
  const [la, lb] = [luminanceOf(a), luminanceOf(b)];
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}
const linearToOklab = ([r, g, b]: number[]): number[] => {
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  return [
    0.2104542553 * l + 0.7936177850 * m - 0.0040720468 * s,
    1.9779984951 * l - 2.4285922050 * m + 0.4505937099 * s,
    0.0259040371 * l + 0.7827717662 * m - 0.8086757660 * s,
  ];
};
const oklabToLinear = ([L, a, b]: number[]): number[] => {
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (L - 0.0894841775 * a - 1.2914855480 * b) ** 3;
  return [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s,
  ];
};
/** An OKLab colour brought into the sRGB gamut by shrinking its chroma, hue held. */
const inGamut = (L: number, a: number, b: number): number[] => {
  const inside = (rgb: number[]): boolean => rgb.every((v) => v >= -1e-6 && v <= 1 + 1e-6);
  let rgb = oklabToLinear([L, a, b]);
  if (inside(rgb)) return rgb.map(fromLinear);
  let lo = 0, hi = 1;
  for (let i = 0; i < 16; i += 1) {
    const mid = (lo + hi) / 2;
    if (inside(oklabToLinear([L, a * mid, b * mid]))) lo = mid; else hi = mid;
  }
  rgb = oklabToLinear([L, a * lo, b * lo]);
  return rgb.map((v) => fromLinear(Math.max(0, Math.min(1, v))));
};

/** The two reference backgrounds the readability floor is measured against. */
export const READABILITY = Object.freeze({ dark: "#202122", light: "#FFFFFF", contrast: 4.5 });

/** THE READABILITY CLAMP. A map's dark end vanishes on a dark terminal and its pale end
 *  on a light one, and the old build carried two hand-adjusted hex tables to cover that
 *  for one map at one range. With the map and the range a choice, the adjustment runs
 *  here: lightness moves away from the background, hue held and chroma shrunk only as far
 *  as the gamut needs, until the shade clears 4.5:1 against the reference background. A
 *  shade that already clears it is returned untouched. */
export function readableOn(hex: string, dark: boolean): string {
  const background = dark ? READABILITY.dark : READABILITY.light;
  if (contrastRatio(hex, background) >= READABILITY.contrast) return hex.toUpperCase();
  const [L, a, b] = linearToOklab(hexToRgb(hex).map(toLinear));
  // Lightness is monotone in luminance at held hue, so the boundary is found by bisection
  // between the shade's own lightness and the far end, which always clears the floor.
  let fails = L;
  let passes = dark ? 1 : 0;
  for (let i = 0; i < 24; i += 1) {
    const mid = (fails + passes) / 2;
    if (contrastRatio(rgbToHex(inGamut(mid, a, b)), background) >= READABILITY.contrast) passes = mid;
    else fails = mid;
  }
  return rgbToHex(inGamut(passes, a, b));
}

/** The glyph a guide draws: the band is an interval, so its floor opens a bracket and
 *  its ceiling closes one. Marks, not breaks: the fill's own colour stays behind them. */
export const GUIDE_GLYPHS = Object.freeze({ aim: "[", commit: "]" });
/** A guide's ink over a shade: whichever of the two reference inks contrasts more with
 *  the shade under it, near-white over the dark end of a map and near-black over the
 *  light end, so a bracket over pale pink is as legible as one over navy. Neither is a
 *  hue, so no guide competes with a category. */
export function guideInk(under: string): string {
  return contrastRatio(under, READABILITY.light) >= contrastRatio(under, READABILITY.dark) ? READABILITY.light : READABILITY.dark;
}

/** The shade a map holds at a position in [0, 1], interpolated between its samples. */
export function sampleColourMap(map: ColourMapName, position: number): string {
  const table = COLOUR_MAPS[map];
  const at = Math.max(0, Math.min(1, position)) * (table.length - 1);
  const lo = Math.floor(at), hi = Math.min(table.length - 1, lo + 1), t = at - lo;
  const a = hexToRgb(table[lo]), b = hexToRgb(table[hi]);
  return rgbToHex(a.map((v, i) => v * (1 - t) + b[i] * t));
}

const shadeMemo = new Map<string, Record<FoldBarKind, string>>();
/** The six shades for a palette on a background: read off the map at evenly spaced
 *  positions from start to end, then brought up to the readability floor. Memoized on
 *  the palette and background, since the bar renders many times per choice. */
export function foldBarShades(palette: FoldBarPalette, dark: boolean): Record<FoldBarKind, string> {
  const key = `${palette.map}:${palette.start}:${palette.end}:${dark ? "dark" : "light"}`;
  const held = shadeMemo.get(key);
  if (held) return held;
  const shades = Object.fromEntries(FOLD_BAR_KINDS.map((kind, i) => {
    const position = palette.start + (palette.end - palette.start) * (i / (FOLD_BAR_KINDS.length - 1));
    return [kind, readableOn(sampleColourMap(palette.map, position), dark)];
  })) as Record<FoldBarKind, string>;
  shadeMemo.set(key, shades);
  return shades;
}

export interface FoldBarModel {
  brand: string;
  share: number | null;
  commitShare: number;
  aimShare: number;
  /** Estimated visible mass, counted exactly once, in the category order above. */
  mass: FoldBarMass;
  mapped: boolean;
  folds: number;
  foldSpans: number;
  foldTruncations: number;
  foldConsolidations: number;
  pinnedRefs: number;
  stagedMarks: number;
  unplacedItems: number;
  weighed: boolean;
  staleAfterCommit: boolean;
  stopped: string | null;
  /** Absent means the package default, exactly as it does in the settings file. */
  palette?: FoldBarPalette;
}
export interface FoldBarTheme {
  fg(color: "dim" | "muted" | "text" | "warning" | "error" | "accent", text: string): string;
  bold(text: string): string;
  getColorMode?(): "truecolor" | "256color";
  getFgAnsi?(color: "text" | "muted" | "accent"): string;
  name?: string;
}

export function lightBackground(theme: FoldBarTheme): boolean {
  try {
    const match = /38;2;(\d+);(\d+);(\d+)/.exec(theme.getFgAnsi?.("text") ?? "");
    if (match) {
      const [r, g, b] = match.slice(1).map((v) => Number(v) / 255);
      return 0.2126 * r + 0.7152 * g + 0.0722 * b < 0.5;
    }
  } catch { }
  return /light/i.test(theme.name ?? "");
}
const truecolor = (hex: string, text: string): string => {
  const rgb = [1, 3, 5].map((at) => parseInt(hex.slice(at, at + 2), 16));
  return `\x1b[38;2;${rgb.join(";")}m${text}\x1b[39m`;
};

/** Two half-cell samples per terminal column. The measured fill never grows to fit
 * inventory. Each nonempty CATEGORY gets one half-cell when there is room, then quotas
 * follow relative mass. This is a visibility floor, not a per-fold width or token-exact
 * proportion. A guide reserves the RIGHT half of its column only: the hairline is drawn
 * at that column's right edge, which is the exact share the guide names, over whatever
 * colour the left half holds, so a guide costs one half-cell and erases no category.
 */
export function foldBarCells(model: FoldBarModel, width = FOLD_BAR_WIDTH): Array<FoldBarKind | "empty" | "unknown" | "tick"> {
  const samples = 2 * width;
  const filled = Math.max(0, Math.min(samples, Math.round((model.share ?? 0) * samples)));
  const ticks = foldBarTicks(model, width);
  const total = FOLD_BAR_KINDS.reduce((sum, kind) => sum + model.mass[kind], 0);
  const cells: Array<FoldBarKind | "empty" | "unknown" | "tick"> = Array.from({ length: samples }, (_, i) =>
    i % 2 === 1 && ticks.has(Math.floor(i / 2)) ? "tick" : i < filled ? "unknown" : "empty");
  const slots = cells.flatMap((kind, i) => kind === "unknown" ? [i] : []);
  if (!model.mapped || total <= 0 || !slots.length) return cells;
  const allocation = FOLD_BAR_KINDS.filter((kind) => model.mass[kind] > 0)
    .map((kind) => ({ kind, quota: model.mass[kind] * slots.length / total, count: 0 }));
  if (slots.length < allocation.length) {
    // At very low occupancy there may be fewer slots than kinds. Keep the largest
    // shares rather than inventing occupancy; ties keep the declared category order.
    for (const item of [...allocation].sort((a, b) => b.quota - a.quota).slice(0, slots.length)) item.count = 1;
  } else {
    for (const item of allocation) item.count = Math.max(1, Math.floor(item.quota));
    let assigned = allocation.reduce((sum, item) => sum + item.count, 0);
    while (assigned !== slots.length) {
      const direction = assigned < slots.length ? 1 : -1;
      const candidates = allocation.filter((item) => direction > 0 || item.count > 1);
      candidates.sort((a, b) => direction * ((b.quota - b.count) - (a.quota - a.count)));
      candidates[0].count += direction;
      assigned += direction;
    }
  }
  let next = 0;
  for (const item of allocation) {
    for (let n = 0; n < item.count; n += 1) cells[slots[next++]] = item.kind;
  }
  return cells;
}
/** The column whose RIGHT EDGE is the named share. When both guides land on one column
 *  the commit wins, since it is the one the label also names. */
export function foldBarTicks(model: FoldBarModel, width = FOLD_BAR_WIDTH): Map<number, "aim" | "commit"> {
  const at = (share: number): number => Math.max(0, Math.min(width - 1, Math.round(share * width) - 1));
  return new Map([[at(model.aimShare), "aim"], [at(model.commitShare), "commit"]]);
}
export function foldBarPlainText(model: FoldBarModel): string {
  return renderFoldBar(model, Number.POSITIVE_INFINITY, { fg: (_c, t) => t, bold: (t) => t });
}

export function renderFoldBar(model: FoldBarModel, width: number, theme: FoldBarTheme): string {
  const cut = (text: string): string => truncateToWidth(text, width, theme.fg("dim", "..."));
  const neutral = (text: string): string => theme.fg("text", text);
  const muted = (text: string): string => theme.fg("muted", text);
  const brand = theme.fg("dim", model.brand);
  if (model.stopped) return cut(`${brand} ${theme.fg("error", theme.bold("FOLDING STOPPED"))}` +
    (model.share === null ? "" : neutral(` · ${Math.round(model.share * 100)}% full`)));
  if (model.share === null) return cut(`${brand} ${muted(`not measured yet · folds automatically at ${Math.round(model.commitShare * 100)}%`)}`);
  const truecolorMode = theme.getColorMode?.() === "truecolor";
  const dark = !lightBackground(theme);
  const shades = foldBarShades(model.palette ?? DEFAULT_FOLD_BAR_PALETTE, dark);
  // Without truecolor the theme's own inks stand in: pinned takes the accent, raw the
  // muted ink, everything compressed or marked the text ink.
  const ink = (kind: FoldBarKind, text: string): string => {
    if (truecolorMode) return truecolor(shades[kind], text);
    return theme.fg(kind === "pinned" ? "accent" : kind === "raw" ? "muted" : "text", text);
  };
  const cells = foldBarCells(model);
  const ticks = foldBarTicks(model);
  const solid = (kind: typeof cells[number]): string => {
    if (kind === "empty") return theme.fg("dim", "░");
    if (kind === "unknown") return muted("█");
    return ink(kind as FoldBarKind, "█");
  };
  const background = (kind: FoldBarKind | "unknown"): string | null => {
    if (truecolorMode && kind !== "unknown") return truecolor(shades[kind], "").replace("[38;", "[48;");
    // Pi exposes the same theme ink in 256-colour mode, and the accent for a pin there.
    // Convert its foreground escape to background, without assuming an RGB theme or
    // leaking styles into the label.
    const fg = theme.getFgAnsi?.(kind === "pinned" ? "accent" : kind === "raw" || kind === "unknown" ? "muted" : "text") ?? "";
    const extended = /^\x1b\[38;(?:2;\d+;\d+;\d+|5;\d+)m$/.test(fg);
    if (extended) return fg.replace("[38;", "[48;");
    const basic = /^\x1b\[(3[0-7]|9[0-7])m$/.exec(fg);
    return basic ? `\x1b[${Number(basic[1]) + 10}m` : null;
  };
  // THE GUIDES ARE MARKS ON THE AXIS, NOT BREAKS IN THE FILL (Shane 2026-09-06, third
  // pass). A hairline in text ink read as a white bar; a notch cut into the fill read as
  // a boundary between two kinds of content, which a threshold is not. The band is an
  // interval, so the aim opens a bracket and the commit point closes one, each drawn
  // over the fill's own colour in whichever reference ink contrasts more with it. No
  // hue of its own, since a coloured guide competes with a category; never the warning
  // ink, since folding is automatic and the person has nothing to do about it. On the
  // bare track the muted ink stands in; without truecolor the bracket stands on the
  // default background, because the theme's inks are the fill there.
  const shadeUnder = (left: typeof cells[number]): string | null =>
    truecolorMode && (FOLD_BAR_KINDS as readonly string[]).includes(left) ? shades[left as FoldBarKind] : null;
  const guide = (column: number, left: typeof cells[number]): string => {
    const glyph = GUIDE_GLYPHS[ticks.get(column) ?? "aim"];
    const under = shadeUnder(left);
    if (under) return `${background(left as FoldBarKind)}${truecolor(guideInk(under), glyph)}\x1b[49m`;
    return theme.fg("muted", glyph);
  };
  let bar = "";
  for (let i = 0; i < cells.length; i += 2) {
    const left = cells[i], right = cells[i + 1];
    if (right === "tick") {
      // The bracket over the left half's own colour: the guide sits at the exact share
      // it names and hides no fill. Off the fill it stands on the bare track.
      bar += guide(i / 2, left);
      continue;
    }
    if (left === right) { bar += solid(left); continue; }
    // One full-height left-half glyph, right colour supplied by the cell background:
    // two colours in one column, never a notch, gap, score, or extra terminal column.
    if (right === "empty") {
      bar += left === "unknown" ? muted("▌") : ink(left as FoldBarKind, "▌");
    } else {
      const bg = background(right as FoldBarKind);
      bar += bg ? `${bg}${ink(left as FoldBarKind, "▌")}\x1b[49m` : solid(left);
    }
  }
  const pct = Math.round(model.share * 100);
  const parts: string[] = [];
  if (model.staleAfterCommit) parts.push(muted(`${pct}% before the commit`));
  else {
    const when = model.share < model.commitShare ? `commit at ${Math.round(model.commitShare * 100)}%`
      : model.weighed ? "commit held" : "at commit point";
    parts.push(neutral(`${pct}%`), muted(when));
  }
  if (model.mapped) {
    // N counts compressed folds. Mark/Pin are accompanying states, not added to N, and
    // they are named in the bar's own order.
    const counts = [
      ink("consolidated", `${model.foldConsolidations} Cons.`), ink("span", `${model.foldSpans} Span`),
      ink("tool", `${model.foldTruncations} Tool`), ink("marked", `${model.stagedMarks} Mark`),
      ink("pinned", `${model.pinnedRefs} Pin`),
    ];
    parts.push(neutral(`${model.folds} Folds (`) + counts.join(muted(", ")) + neutral(")"));
    if (model.unplacedItems > 0) parts.push(muted(`${model.unplacedItems} not mapped`));
  } else parts.push(muted("mapping"));
  return cut(`${bar} ${parts.join(theme.fg("dim", " · "))}`);
}
