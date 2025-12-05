import { ColorStringHex, ColorStringRGBA } from "scripting"

/**
 * Adjust a color into the direction of another color.
 * @param color color to adjust
 * @param otherColor target color to adjust to
 * @param amount amount to adjust by. Should be a number in the range 0 to 1, where 0 means no adjustment and 1 returns `otherColor`
 * @param options various options
 * @param options.adjustAlpha if `true` then also the alpha channel is adjusted. Defaults to `false`
 * @returns the adjusted color
 */
export function adjustColor(
  color: ColorStringHex | ColorStringRGBA | ParsedColor,
  otherColor: ColorStringHex | ColorStringRGBA | ParsedColor,
  amount: number,
  options?: {
    adjustAlpha?: boolean
  },
): ParsedColor {
  if (!(color instanceof ParsedColor)) color = new ParsedColor(color)
  if (!(otherColor instanceof ParsedColor))
    otherColor = new ParsedColor(otherColor)
  const newColor = new ParsedColor(0, 0, 0)
  newColor.red = color.red * (1 - amount) + otherColor.red * amount
  newColor.green = color.green * (1 - amount) + otherColor.green * amount
  newColor.blue = color.blue * (1 - amount) + otherColor.blue * amount
  if (options?.adjustAlpha) {
    newColor.alpha = color.alpha * (1 - amount) + otherColor.alpha * amount
  }
  return newColor
}

/**
 * Darkens a color.
 * @param color color to darken
 * @param amount amount to darken the color. Should be a number in the range 0 to 1 where 0 is no change and 1 equals black
 * @param options various options
 * @param options.adjustAlpha if `true` then also the alpha channel is adjusted. Defaults to `false`
 * @returns the darkened color
 */
export function darkenColor(
  color: ColorStringHex | ColorStringRGBA | ParsedColor,
  amount: number,
  options?: {
    adjustAlpha?: boolean
  },
) {
  return adjustColor(color, new ParsedColor(0, 0, 0, 1), amount, options)
}

/**
 * Brightens a color.
 * @param color color to brighten
 * @param amount amount to brighten the color. Should be a number in the range 0 to 1 where 0 is no change and 1 equals white
 * @param options various options
 * @param options.adjustAlpha if `true` then also the alpha channel is adjusted. Defaults to `false`
 * @returns the brightened color
 */
export function brightenColor(
  color: ColorStringHex | ColorStringRGBA | ParsedColor,
  amount: number,
  options?: {
    adjustAlpha?: boolean
  },
) {
  return adjustColor(color, new ParsedColor(255, 255, 255, 1), amount, options)
}

/**
 * Class to adjust the RGB values of a color
 */
export class ParsedColor {
  #red: number
  #green: number
  #blue: number
  #alpha: number

  /** Red channel in the range 0 - 255 */
  get red() {
    return this.#red
  }
  /** Green channel in the range 0 - 255 */
  get green() {
    return this.#green
  }
  /** Blue channel in the range 0 - 255 */
  get blue() {
    return this.#blue
  }
  /** Alpha channel in the range 0 - 1 */
  get alpha() {
    return this.#alpha
  }

  #validateColor(value: number, min: number, max: number, round: boolean) {
    if (typeof value !== "number") {
      throw new Error(`Expected type number but got type "${typeof value}"`)
    }
    if (value < min) return min
    if (value > max) return max
    return round ? Math.round(value) : value
  }
  /** Red channel in the range 0 - 255 */
  set red(value: number) {
    this.#red = this.#validateColor(value, 0, 255, true)
  }
  /** Green channel in the range 0 - 255 */
  set green(value: number) {
    this.#green = this.#validateColor(value, 0, 255, true)
  }
  /** Blue channel in the range 0 - 255 */
  set blue(value: number) {
    this.#blue = this.#validateColor(value, 0, 255, true)
  }
  /** Alpha channel in the range 0 - 1 */
  set alpha(value: number) {
    this.#alpha = this.#validateColor(value, 0, 1, false)
  }

  /**
   * Parse a color
   * @param color the color to parse
   */
  constructor(color: ColorStringHex | ColorStringRGBA | ParsedColor)
  /**
   * Create a parsed color by specifying each channel
   * @param red red channel in the range 0 - 255
   * @param green green channel in the range 0 - 255
   * @param blue blue channel in the range 0 - 255
   */
  constructor(red: number, green: number, blue: number)
  /**
   * Create a parsed color by specifying each channel
   * @param red red channel in the range 0 - 255
   * @param green green channel in the range 0 - 255
   * @param blue blue channel in the range 0 - 255
   * @param alpha alpha channel in the range 0 - 1
   */
  constructor(red: number, green: number, blue: number, alpha: number)
  constructor(
    color: number | ColorStringHex | ColorStringRGBA | ParsedColor,
    green?: number,
    blue?: number,
    alpha: number = 1,
  ) {
    if (color instanceof ParsedColor) {
      this.#red = color.#red
      this.#green = color.#green
      this.#blue = color.#blue
      this.#alpha = color.#alpha
    } else if (typeof color === "string" && color.startsWith("#")) {
      if (color.length === 4) {
        this.#red = parseInt(color[1], 16) * 16
        this.#green = parseInt(color[2], 16) * 16
        this.#blue = parseInt(color[3], 16) * 16
        this.#alpha = 1
        return
      }
      if (color.length === 7 || color.length === 9) {
        this.#red = parseInt(color.slice(1, 2), 16)
        this.#green = parseInt(color.slice(3, 4), 16)
        this.#blue = parseInt(color.slice(5, 6), 16)
      } else {
        throw new TypeError(
          'Argument "color" has an unsupported length for a hex color',
        )
      }
      if (color.length === 9) {
        this.#alpha = parseInt(color.slice(7, 8), 16) / 0xff
      } else {
        this.#alpha = 1
      }
    } else if (
      typeof color === "string" &&
      color.startsWith("rgba(") &&
      color.endsWith(")")
    ) {
      try {
        const [r, g, b, a] = color.slice(5, color.length - 1).split(",")
        this.#red = parseInt(r)
        this.#green = parseInt(g)
        this.#blue = parseInt(b)
        this.#alpha = parseFloat(a)
      } catch (error) {
        throw new TypeError(
          'Argument "color" has the wrong number of parameters for an rgba color',
        )
      }
    } else if (
      typeof color === "number" &&
      typeof green === "number" &&
      typeof blue === "number"
    ) {
      this.#red = color
      this.#green = green
      this.#blue = blue
      this.#alpha = typeof alpha === "number" ? alpha ?? 1 : 1
    } else {
      throw new TypeError(
        'Argument "color" is not a hex color nor an rgba color or not all of red, green and blue are numbers',
      )
    }
  }

  /**
   * Get a HEX representation of this color
   * @returns this color as a HEX string
   */
  toHex(): ColorStringHex {
    const colors = [this.#red, this.#green, this.#blue]
    if (this.#alpha !== 1) {
      colors.push(Math.max(Math.min(Math.floor(this.#alpha * 0xff), 255), 0))
    }
    return ("#" +
      colors
        .map((c) => c.toString(16).padStart(2, "0").toUpperCase())
        .join("")) as ColorStringHex
  }

  /**
   * Get an rgba() representation of this color
   * @returns this color as a rgba() string
   */
  toRGBA(): ColorStringRGBA {
    return `rgba(${this.#red},${this.#green},${this.#blue},${
      Math.round(this.#alpha * 100) / 100
    })` as const
  }

  /**
   * Set one or more channels to a new value and return the instance for chaining
   * @param channels the channel(s) to set
   * @returns this with the new colors set
   */
  set(channels: {
    red?: number
    green?: number
    blue?: number
    alpha?: number
  }): this {
    const allowedKeys = new Set(["red", "green", "blue", "alpha"])
    for (const [key, value] of Object.entries(channels)) {
      if (!allowedKeys.has(key)) {
        throw new Error(`Property "${key}" cannot be set`)
      }
      this[key as keyof typeof channels] = value
    }
    return this
  }

  /**
   * Returns the color in HSL (hue, saturation, lightness) format in the range [0, 1].
   *
   * _Source:_ https://stackoverflow.com/a/9493060
   */
  toHSL(): {
    h: number
    s: number
    l: number
  } {
    return rgbToHsl(this.red, this.green, this.blue)
  }

  /**
   * Creates a `ParsedColor` instance from a color in HSL format.
   *
   * _Source:_ https://stackoverflow.com/a/9493060
   */
  static fromHSL({ h, s, l }: { h: number; s: number; l: number }) {
    if (h < 0 || h > 1) {
      throw new Error(`hue must be in the range [0, 1], but got "${h}"`);
    }
    if (s < 0 || s > 1) {
      throw new Error(`saturation must be in the range [0, 1], but got "${s}"`);
    }
    if (l < 0 || l > 1) {
      throw new Error(`lightness must be in the range [0, 1], but got "${l}"`);
    }
    const [r, g, b] = hslToRgb(h, s, l)
    return new ParsedColor(r, g, b)
  }

  /**
   * Returns the color in HSV (hue, saturation, value) format in the range [0, 1].
   */
  toHSV(): {
    h: number
    s: number
    v: number
  } {
    const { h, s, l } = this.toHSL()
    const v = l + s * Math.min(l, l - 1)
    const sV = v === 0 ? 0 : 2 * (1 - l / v)
    return { h, s: sV, v }
  }

  /**
   * Creates a `ParsedColor` instance from a color in HSV format.
   */
  static fromHSV({ h, s, v }: { h: number; s: number; v: number }) {
    if (h < 0 || h > 1) {
      throw new Error(`hue must be in the range [0, 1], but got "${h}"`);
    }
    if (s < 0 || s > 1) {
      throw new Error(`saturation must be in the range [0, 1], but got "${s}"`);
    }
    if (v < 0 || v > 1) {
      throw new Error(`value must be in the range [0, 1], but got "${v}"`);
    }
    const l = v * (1 - s / 2)
    s = l === 0 || l === 1 ? 0 : (v - l) / Math.min(l, 1 - l)
    const [r, g, b] = hslToRgb(h, s, l)
    return new ParsedColor(r, g, b)
  }

  /**
   * Returns the luminance of the color (also called `Y`) in the range [0, 1].
   *
   * _Source:_ https://gist.github.com/mnpenner/70ab4f0836bbee548c71947021f93607 and https://stackoverflow.com/a/56678483
   */
  getLuminance(): number {
    return rgbToY(this.red / 255, this.green / 255, this.blue / 255)
  }

  /**
   * Returns the percieved lightness of the color (also called `L*` or _L star_)
   * in the range [0, 100].
   *
   * _Source:_ https://gist.github.com/mnpenner/70ab4f0836bbee548c71947021f93607 and https://stackoverflow.com/a/56678483
   */
  getPercievedLightness(): number {
    return YtoLstar(this.getLuminance())
  }
}

// Source - https://stackoverflow.com/a/9493060
// Posted by Mohsen, modified by community. See post 'Timeline' for change history
// Retrieved 2025-11-28, License - CC BY-SA 4.0

/**
 * Converts an HSL color value to RGB. Conversion formula
 * adapted from https://en.wikipedia.org/wiki/HSL_color_space.
 * Assumes h, s, and l are contained in the set [0, 1] and
 * returns r, g, and b in the set [0, 255].
 *
 * @param   h       The hue
 * @param   s       The saturation
 * @param   l       The lightness
 * @return           The RGB representation
 */
function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  let r, g, b

  if (s === 0) {
    r = g = b = l // achromatic
  } else {
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s
    const p = 2 * l - q
    r = hueToRgb(p, q, h + 1 / 3)
    g = hueToRgb(p, q, h)
    b = hueToRgb(p, q, h - 1 / 3)
  }

  return [
    Math.min(Math.floor(r * 256), 255),
    Math.min(Math.floor(g * 256), 255),
    Math.min(Math.floor(b * 256), 255),
  ]
}

function hueToRgb(p: number, q: number, t: number): number {
  if (t < 0) t += 1
  if (t > 1) t -= 1
  if (t < 1 / 6) return p + (q - p) * 6 * t
  if (t < 1 / 2) return q
  if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6
  return p
}

/**
 * Converts an RGB color value to HSL. Conversion formula
 * adapted from http://en.wikipedia.org/wiki/HSL_color_space.
 * Assumes r, g, and b are contained in the set [0, 255] and
 * returns h, s, and l in the set [0, 1].
 *
 * @param r The red color value
 * @param g The green color value
 * @param b The blue color value
 * @return The HSL representation
 */
function rgbToHsl(r: number, g: number, b: number) {
  r /= 255
  g /= 255
  b /= 255
  const max = Math.max(r, g, b),
    min = Math.min(r, g, b)
  let h,
    s,
    l = (max + min) / 2

  if (max === min) {
    return { h: 0, s: 0, l } // achromatic
  }

  const d = max - min
  s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
  if (max === r) h = (g - b) / d + (g < b ? 6 : 0)
  else if (max === g) h = (b - r) / d + 2
  /* max === b */ else h = (r - g) / d + 4
  h /= 6

  return { h, s, l }
}

// ======================================
// source: https://gist.github.com/mnpenner/70ab4f0836bbee548c71947021f93607
// retrieved on 2025-12-02

function sRGBtoLin(colorChannel: number) {
  // Send this function a decimal sRGB gamma encoded color value
  // between 0.0 and 1.0, and it returns a linearized value.

  if (colorChannel <= 0.04045) {
    return colorChannel / 12.92
  }

  return Math.pow((colorChannel + 0.055) / 1.055, 2.4)
}

/**
 * @param r Red, [0-1]
 * @param g Green, [0-1]
 * @param b Blue, [0-1]
 * @returns Luminance, [0-1]
 */
function rgbToY(r: number, g: number, b: number) {
  return 0.2126 * sRGBtoLin(r) + 0.7152 * sRGBtoLin(g) + 0.0722 * sRGBtoLin(b)
}

/**
 * Luminance to perceived lightness.
 *
 * @param Y Luminance, [0-1]
 */
function YtoLstar(Y: number) {
  // Send this function a luminance value between 0.0 and 1.0,
  // and it returns L* which is "perceptual lightness"

  if (Y <= 216 / 24389) {
    // The CIE standard states 0.008856 but 216/24389 is the intent for 0.008856451679036
    return Y * (24389 / 27) // The CIE standard states 903.3, but 24389/27 is the intent, making 903.296296296296296
  }

  return Math.pow(Y, 1 / 3) * 116 - 16
}
