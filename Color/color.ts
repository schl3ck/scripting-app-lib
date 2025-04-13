import { ColorStringHex, ColorStringRGBA } from "scripting"

/**
 * Adjust a color into the direction of another color.
 * @param color color to adjust
 * @param otherColor target to adjust to
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
  if (!(otherColor instanceof ParsedColor)) otherColor = new ParsedColor(otherColor)
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
    if (value < min) return 0
    if (value > max) return 255
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
        throw new TypeError('Argument "color" has an unsupported length for a hex color')
      }
      if (color.length === 9) {
        this.#alpha = parseInt(color.slice(7, 8), 16) / 0xff
      } else {
        this.#alpha = 1
      }
    } else if (typeof color === "string" && color.startsWith("rgba(") && color.endsWith(")")) {
      try {
        const [r, g, b, a] = color.slice(5, color.length - 1).split(",")
        this.#red = parseInt(r)
        this.#green = parseInt(g)
        this.#blue = parseInt(b)
        this.#alpha = parseFloat(a)
      } catch (error) {
        throw new TypeError('Argument "color" has the wrong number of parameters for an rgba color')
      }
    } else if (typeof color === "number" && typeof green === "number" && typeof blue === "number") {
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
      colors.push(this.#alpha * 0xff)
    }
    return ("#" +
      colors.map((c) => c.toString(16).padStart(2, "0").toUpperCase()).join("")) as ColorStringHex
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
   * Set one or more channels to a new value and return the this instance for chaining
   * @param options the channel(s) to set
   * @returns this with the new colors set
   */
  set(options: { red?: number; green?: number; blue?: number; alpha?: number }): this {
    const allowedKeys = new Set(["red", "green", "blue", "alpha"])
    for (const [key, value] of Object.entries(options)) {
      if (!allowedKeys.has(key)) {
        throw new Error(`Property "${key}" cannot be set`)
      }
      this[key as keyof typeof options] = value
    }
    return this
  }
}
