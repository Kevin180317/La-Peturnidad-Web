/**
 * Icon path data, shared by the Astro shell and the React islands.
 *
 * The panel renders icons from two very different places: AdminShell.astro
 * builds markup strings and hands them to `set:html`, while Icons.tsx returns
 * React components. Keeping the path data in one module means an icon added for
 * one is immediately available to the other, instead of the two copies drifting
 * apart the way a copy-pasted SVG map does.
 *
 * Presentation attributes live on the root <svg> via `svgAttrs`, not on the
 * individual paths, so a stroked icon never has to repeat stroke-width on every
 * path. The exceptions (the spinner's two-tone circle) carry their own
 * attributes inline, which win over the inherited ones.
 *
 * Everything here is a static string authored in this repository. Nothing that
 * reaches these functions comes from a database row, so rendering them through
 * `set:html` / `dangerouslySetInnerHTML` cannot inject anything.
 */

export type IconName = keyof typeof ICON_DEFS;

interface IconDef {
  /** Inner markup of the <svg>, without the element itself. */
  markup: string;
  /** Stroked outlines use currentColor; filled shapes are painted solid. */
  filled?: boolean;
}

const ICON_DEFS = {
  exclamation: {
    markup:
      '<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />',
    filled: true,
  },
  close: {
    markup: '<path d="M6 18L18 6M6 6l12 12" />',
  },
  spinner: {
    markup:
      '<circle class="opacity-25" cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="4" /><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />',
  },
  logout: {
    markup: '<path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />',
  },
  users: {
    markup: '<path d="M12 4.354a4 4 0 110 5.292M15 12H9m6 0a3 3 0 11-6 0 3 3 0 016 0z" />',
  },
  pets: {
    markup:
      '<path d="M12 2c-1.104 0-2-0.896-2-2s0.896-2 2-2 2 0.896 2 2-0.896 2-2 2zm0 4c-1.657 0-3 1.343-3 3s1.343 3 3 3 3-1.343 3-3-1.343-3-3-3zm8-2c-1.104 0-2-0.896-2-2s0.896-2 2-2 2 0.896 2 2-0.896 2-2 2zm0 4c-1.657 0-3 1.343-3 3s1.343 3 3 3 3-1.343 3-3-1.343-3-3-3zM4 2c-1.104 0-2-.896-2-2s.896-2 2-2 2 .896 2 2-.896 2-2 2zm0 4c-1.657 0-3 1.343-3 3s1.343 3 3 3 3-1.343 3-3-1.343-3-3-3z" />',
    filled: true,
  },
  alert: {
    markup: '<path d="M12 9v2m0 4v2m6-4a9 9 0 11-18 0 9 9 0 0118 0z" />',
  },
  heart: {
    markup:
      '<path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />',
    filled: true,
  },
  users2: {
    markup:
      '<path d="M17 20h5v-2a3 3 0 00-5.856-1.487M15 10a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0z" />',
  },
  file: {
    markup: '<path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />',
  },
  comment: {
    markup:
      '<path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />',
  },
  bell: {
    markup:
      '<path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a3 3 0 10-6 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />',
  },
  flag: {
    markup: '<path d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-7 7 7 7H12.5l-1-1H5a2 2 0 00-2 2zm9-13h2.5L12 7" />',
  },
  block: {
    markup: '<path d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />',
  },

  grid: {
    markup: '<path d="M4 4h6v6H4V4zm10 0h6v6h-6V4zM4 14h6v6H4v-6zm10 0h6v6h-6v-6z" />',
  },
  chart: {
    markup: '<path d="M4 20V10m5 10V4m5 16v-7m5 7V8" />',
  },
  sun: {
    markup:
      '<path d="M12 4V2m0 20v-2m8-8h2M2 12h2m13.657-5.657l1.414-1.414M4.929 19.071l1.414-1.414m0-11.314L4.929 4.929m14.142 14.142l-1.414-1.414M16 12a4 4 0 11-8 0 4 4 0 018 0z" />',
  },
  moon: {
    markup: '<path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />',
    filled: true,
  },
  menu: {
    markup: '<path d="M4 6h16M4 12h16M4 18h16" />',
  },
  chevronDown: {
    markup: '<path d="M19 9l-7 7-7-7" />',
  },
  chevronLeft: {
    markup: '<path d="M15 19l-7-7 7-7" />',
  },
  chevronRight: {
    markup: '<path d="M9 5l7 7-7 7" />',
  },
  search: {
    markup: '<path d="M21 21l-4.35-4.35M17 11a6 6 0 11-12 0 6 6 0 0112 0z" />',
  },
  refresh: {
    markup: '<path d="M4 4v6h6M20 20v-6h-6M20 9A8 8 0 006 5.3L4 7m16 10l-2 1.7A8 8 0 014 15" />',
  },
  trendUp: {
    markup: '<path d="M3 17l6-6 4 4 8-8m0 0h-5m5 0v5" />',
  },
  trendDown: {
    markup: '<path d="M3 7l6 6 4-4 8 8m0 0h-5m5 0v-5" />',
  },
  check: {
    markup: '<path d="M5 13l4 4L19 7" />',
  },
  inbox: {
    markup:
      '<path d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-5l-1 3H9l-1-3H4" />',
  },
  external: {
    markup: '<path d="M14 4h6v6m0-6L10 14M18 14v5a1 1 0 01-1 1H5a1 1 0 01-1-1V7a1 1 0 011-1h5" />',
  },
} satisfies Record<string, IconDef>;

// Re-exported with an explicit annotation: `satisfies` keeps the narrow literal
// shape, which would hide `filled` from consumers reading an icon definition.
export const ICONS: Record<IconName, IconDef> = ICON_DEFS;

export function isIconName(value: string): value is IconName {
  return Object.prototype.hasOwnProperty.call(ICONS, value);
}

/**
 * Root attributes for the <svg>, so both renderers present an icon identically.
 * Returned as a spreadable record for React and as a string for `set:html`.
 */
export function svgAttrs(name: IconName): Record<string, string> {
  if (ICONS[name].filled) return { fill: "currentColor" };
  return {
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round",
  };
}

const FILLED_ATTRS = 'fill="currentColor"';
const STROKE_ATTRS =
  'fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"';

/**
 * A complete <svg> string, for `set:html` from an .astro template.
 *
 * Returns an empty string for an unknown name rather than throwing, because the
 * caller is a nav renderer that iterates over config and should not be able to
 * take the whole page down over a typo.
 */
export function iconSvg(name: string, className = "w-5 h-5"): string {
  if (!isIconName(name)) return "";
  const icon = ICONS[name];
  const attrs = icon.filled ? FILLED_ATTRS : STROKE_ATTRS;
  return `<svg class="${className}" viewBox="0 0 24 24" aria-hidden="true" ${attrs}>${icon.markup}</svg>`;
}