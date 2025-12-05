This script aids with modification of the colors used in Scripting.

# Classes and Functions

- [Classes and Functions](#classes-and-functions)
- [`ParsedColor`](#parsedcolor)
  - [Properties](#properties)
  - [Methods](#methods)
    - [`set`](#set)
    - [`toHex`](#tohex)
    - [`toRGBA`](#torgba)
    - [`toHSL`](#tohsl)
    - [`fromHSL`](#fromhsl)
    - [`toHSV`](#tohsv)
    - [`fromHSV`](#fromhsv)
    - [`getLuminance`](#getluminance)
    - [`getPerceivedLightness`](#getperceivedlightness)
- [`darkenColor`](#darkencolor)
- [`brightenColor`](#brightencolor)
- [`adjustColor`](#adjustcolor)

# `ParsedColor`

This class can parse a color so you can access the red, green, blue and alpha channels.


```typescript
new ParsedColor(color: ColorStringHex | ColorStringRGBA | ParsedColor)
```

Parse a color string.

**Parameters:**

- `color`: The color to parse. Only colors of the format `#RGB`, `#RRGGBB`, `#RRGGBBAA` and `rgba(${number}, ${number}, ${number}, ${number})` are supported. Named colors like `label` or `systemRed` cannot be parsed.

```typescript
new ParsedColor(red: number, green: number, blue: number)
```

Create a parsed color by specifying each channel.

**Parameters:**

- `red`: The red channel in the range 0 - 255
- `green`: The green channel in the range 0 - 255
- `blue`: The blue channel in the range 0 - 255

```typescript
new ParsedColor(red: number, green: number, blue: number, alpha: number)
```

Create a parsed color by specifying each channel (including the alpha channel)

**Parameters:**

- `red`: The red channel in the range 0 - 255
- `green`: The green channel in the range 0 - 255
- `blue`: The blue channel in the range 0 - 255
- `alpha`: The alpha channel in the range 0 - 1

## Properties

- `red`: The red channel
- `green`: The green channel
- `blue`: The blue channel
- `alpha`: The alpha channel

Each property can also be set to a new value.

## Methods

### `set`

```typescript
set(channels: {
  red?: number
  green?: number
  blue?: number
  alpha?: number
}): this
```

Set one or more channels to a new value and return the instance for chaining.

**Parameters:**

- `channels`: The channel(s) to set

**Returns:**

The same instance with the new colors set.

### `toHex`

```typescript
toHex(): ColorStringHex
```

Returns the color as a HEX string. If `alpha` equals `1` then it is not included, otherwise it is included in the last position as in `#RRGGBBAA`.

### `toRGBA`

```typescript
toRGBA(): ColorStringRGBA
```

Retuns the color as an `rgba(...)` string.

### `toHSL`

```typescript
toHSL(): {
  h: number
  s: number
  l: number
}
```

Returns the color in HSL (hue, saturation, lightness) format in the range [0, 1].

_Source:_ https://stackoverflow.com/a/9493060 (modified)

### `fromHSL`

```typescript
static fromHSL({h, s, l}: {h: number, s: number, l: number})
```

Creates a `ParsedColor` instance from a color in HSL format.

_Source:_ https://stackoverflow.com/a/9493060 (modified)

**Parameters:**

- `h`: The hue of the color in the range [0, 1]
- `s`: The saturation of the color in the range [0, 1]
- `l`: The lightness of the color in the range [0, 1]

### `toHSV`

```typescript
toHSV(): {
  h: number
  s: number
  v: number
}
```

Returns the color in HSL (hue, saturation, lightness) format in the range [0, 1].

### `fromHSV`

```typescript
static fromHSV({h, s, v}: {h: number, s: number, v: number})
```

Creates a `ParsedColor` instance from a color in HSV format.

_Source:_ https://stackoverflow.com/a/9493060 (modified)

**Parameters:**

- `h`: The hue of the color in the range [0, 1]
- `s`: The saturation of the color in the range [0, 1]
- `l`: The lightness of the color in the range [0, 1]

### `getLuminance`

```typescript
getLuminance()
```

Returns the luminance of the color (also called `Y`).

_Source:_ https://gist.github.com/mnpenner/70ab4f0836bbee548c71947021f93607 and https://stackoverflow.com/a/56678483 (modified)

### `getPerceivedLightness`

```typescript
getPerceivedLightness()
```

Returns the perceived lightness of the color (also called `L*` or _L star_).

_Source:_ https://gist.github.com/mnpenner/70ab4f0836bbee548c71947021f93607 and https://stackoverflow.com/a/56678483 (modified)

# `darkenColor`

```typescript
export function darkenColor(
  color: ColorStringHex | ColorStringRGBA | ParsedColor,
  amount: number,
  options?: {
    adjustAlpha?: boolean
  },
): ParsedColor
```

Darkens a color.

**Parameters:**

- `color`: The color to darken
- `amount`: Amount to darken the color. Should be a number in the range 0 to 1 where 0 is no change and 1 equals black
- `options.adjustAlpha`: If `true` then also the alpha channel is adjusted. Defaults to `false`

# `brightenColor`

```typescript
export function brightenColor(
  color: ColorStringHex | ColorStringRGBA | ParsedColor,
  amount: number,
  options?: {
    adjustAlpha?: boolean
  },
): ParsedColor
```

Brightens a color.

**Parameters:**

- `color`: The color to brighten
- `amount`: Amount to brighten the color. Should be a number in the range 0 to 1 where 0 is no change and 1 equals white
- `options.adjustAlpha`: If `true` then also the alpha channel is adjusted. Defaults to `false`

# `adjustColor`

```typescript
export function adjustColor(
  color: ColorStringHex | ColorStringRGBA | ParsedColor,
  otherColor: ColorStringHex | ColorStringRGBA | ParsedColor,
  amount: number,
  options?: {
    adjustAlpha?: boolean
  },
): ParsedColor
```

Adjust a color into the direction of another color.

**Parameters:**

- `color`: The color to adjust
- `otherColor`: Target color to adjust to
- `amount`: Amount to adjust by. Should be a number in the range 0 to 1, where 0 means no adjustment and 1 returns `otherColor`
- `options.adjustAlpha`: If `true` then also the alpha channel is adjusted. Defaults to `false`

