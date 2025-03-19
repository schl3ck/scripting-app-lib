import { Device, WidgetFamily } from "scripting"

// <--- start insert widget sizes
export const widgetSizes = {
  "iOS": {
    "430x932": {
      "systemSmall": {
        "width": 170,
        "height": 170
      },
      "systemMedium": {
        "width": 364,
        "height": 170
      },
      "systemLarge": {
        "width": 364,
        "height": 382
      },
      "accessoryCircular": {
        "width": 76,
        "height": 76
      },
      "accessoryRectangular": {
        "width": 172,
        "height": 76
      },
      "accessoryInline": {
        "width": 257,
        "height": 26
      }
    },
    "428x926": {
      "systemSmall": {
        "width": 170,
        "height": 170
      },
      "systemMedium": {
        "width": 364,
        "height": 170
      },
      "systemLarge": {
        "width": 364,
        "height": 382
      },
      "accessoryCircular": {
        "width": 76,
        "height": 76
      },
      "accessoryRectangular": {
        "width": 172,
        "height": 76
      },
      "accessoryInline": {
        "width": 257,
        "height": 26
      }
    },
    "414x896": {
      "systemSmall": {
        "width": 169,
        "height": 169
      },
      "systemMedium": {
        "width": 360,
        "height": 169
      },
      "systemLarge": {
        "width": 360,
        "height": 379
      },
      "accessoryCircular": {
        "width": 76,
        "height": 76
      },
      "accessoryRectangular": {
        "width": 160,
        "height": 72
      },
      "accessoryInline": {
        "width": 248,
        "height": 26
      }
    },
    "414x736": {
      "systemSmall": {
        "width": 159,
        "height": 159
      },
      "systemMedium": {
        "width": 348,
        "height": 157
      },
      "systemLarge": {
        "width": 348,
        "height": 357
      },
      "accessoryCircular": {
        "width": 76,
        "height": 76
      },
      "accessoryRectangular": {
        "width": 170,
        "height": 76
      },
      "accessoryInline": {
        "width": 248,
        "height": 26
      }
    },
    "393x852": {
      "systemSmall": {
        "width": 158,
        "height": 158
      },
      "systemMedium": {
        "width": 338,
        "height": 158
      },
      "systemLarge": {
        "width": 338,
        "height": 354
      },
      "accessoryCircular": {
        "width": 72,
        "height": 72
      },
      "accessoryRectangular": {
        "width": 160,
        "height": 72
      },
      "accessoryInline": {
        "width": 234,
        "height": 26
      }
    },
    "390x844": {
      "systemSmall": {
        "width": 158,
        "height": 158
      },
      "systemMedium": {
        "width": 338,
        "height": 158
      },
      "systemLarge": {
        "width": 338,
        "height": 354
      },
      "accessoryCircular": {
        "width": 72,
        "height": 72
      },
      "accessoryRectangular": {
        "width": 160,
        "height": 72
      },
      "accessoryInline": {
        "width": 234,
        "height": 26
      }
    },
    "375x812": {
      "systemSmall": {
        "width": 155,
        "height": 155
      },
      "systemMedium": {
        "width": 329,
        "height": 155
      },
      "systemLarge": {
        "width": 329,
        "height": 345
      },
      "accessoryCircular": {
        "width": 72,
        "height": 72
      },
      "accessoryRectangular": {
        "width": 157,
        "height": 72
      },
      "accessoryInline": {
        "width": 225,
        "height": 26
      }
    },
    "375x667": {
      "systemSmall": {
        "width": 148,
        "height": 148
      },
      "systemMedium": {
        "width": 321,
        "height": 148
      },
      "systemLarge": {
        "width": 321,
        "height": 324
      },
      "accessoryCircular": {
        "width": 68,
        "height": 68
      },
      "accessoryRectangular": {
        "width": 153,
        "height": 68
      },
      "accessoryInline": {
        "width": 225,
        "height": 26
      }
    },
    "360x780": {
      "systemSmall": {
        "width": 155,
        "height": 155
      },
      "systemMedium": {
        "width": 329,
        "height": 155
      },
      "systemLarge": {
        "width": 329,
        "height": 345
      },
      "accessoryCircular": {
        "width": 72,
        "height": 72
      },
      "accessoryRectangular": {
        "width": 157,
        "height": 72
      },
      "accessoryInline": {
        "width": 225,
        "height": 26
      }
    },
    "320x568": {
      "systemSmall": {
        "width": 141,
        "height": 141
      },
      "systemMedium": {
        "width": 292,
        "height": 141
      },
      "systemLarge": {
        "width": 292,
        "height": 311
      }
    }
  },
  "iPadOS": {
    "768x1024": {
      "systemSmall": {
        "width": 120,
        "height": 120
      },
      "systemMedium": {
        "width": 260,
        "height": 120
      },
      "systemLarge": {
        "width": 260,
        "height": 260
      },
      "systemExtraLarge": {
        "width": 540,
        "height": 260
      }
    },
    "744x1133": {
      "systemSmall": {
        "width": 120,
        "height": 120
      },
      "systemMedium": {
        "width": 260,
        "height": 120
      },
      "systemLarge": {
        "width": 260,
        "height": 260
      },
      "systemExtraLarge": {
        "width": 540,
        "height": 260
      }
    },
    "810x1080": {
      "systemSmall": {
        "width": 124,
        "height": 124
      },
      "systemMedium": {
        "width": 272,
        "height": 124
      },
      "systemLarge": {
        "width": 272,
        "height": 272
      },
      "systemExtraLarge": {
        "width": 568,
        "height": 272
      }
    },
    "820x1180": {
      "systemSmall": {
        "width": 136,
        "height": 136
      },
      "systemMedium": {
        "width": 300,
        "height": 136
      },
      "systemLarge": {
        "width": 300,
        "height": 300
      },
      "systemExtraLarge": {
        "width": 628,
        "height": 300
      }
    },
    "834x1112": {
      "systemSmall": {
        "width": 132,
        "height": 132
      },
      "systemMedium": {
        "width": 288,
        "height": 132
      },
      "systemLarge": {
        "width": 288,
        "height": 288
      },
      "systemExtraLarge": {
        "width": 600,
        "height": 288
      }
    },
    "834x1194": {
      "systemSmall": {
        "width": 136,
        "height": 136
      },
      "systemMedium": {
        "width": 300,
        "height": 136
      },
      "systemLarge": {
        "width": 300,
        "height": 300
      },
      "systemExtraLarge": {
        "width": 628,
        "height": 300
      }
    },
    "954x1373": {
      "systemSmall": {
        "width": 162,
        "height": 162
      },
      "systemMedium": {
        "width": 350,
        "height": 162
      },
      "systemLarge": {
        "width": 350,
        "height": 350
      },
      "systemExtraLarge": {
        "width": 726,
        "height": 350
      }
    },
    "970x1389": {
      "systemSmall": {
        "width": 162,
        "height": 162
      },
      "systemMedium": {
        "width": 350,
        "height": 162
      },
      "systemLarge": {
        "width": 350,
        "height": 350
      },
      "systemExtraLarge": {
        "width": 726,
        "height": 350
      }
    },
    "1024x1366": {
      "systemSmall": {
        "width": 160,
        "height": 160
      },
      "systemMedium": {
        "width": 356,
        "height": 160
      },
      "systemLarge": {
        "width": 356,
        "height": 356
      },
      "systemExtraLarge": {
        "width": 748,
        "height": 356
      }
    },
    "1192x1590": {
      "systemSmall": {
        "width": 188,
        "height": 188
      },
      "systemMedium": {
        "width": 412,
        "height": 188
      },
      "systemLarge": {
        "width": 412,
        "height": 412
      },
      "systemExtraLarge": {
        "width": 860,
        "height": 412
      }
    }
  }
} as const
// <--- end insert widget sizes

export type iOSSizes = keyof typeof widgetSizes["iOS"]
export type iOSWidgetFamily = typeof widgetSizes["iOS"][iOSSizes]
export type iPadOSSizes = keyof typeof widgetSizes["iPadOS"]
export type iPadOSWidgetFamily = typeof widgetSizes["iPadOS"][iPadOSSizes]

export function getWidgetSizes(type: WidgetFamily): { width: number | undefined, height: number | undefined } | undefined {
  const deviceType = Device.isiPhone ? "iOS" : "iPadOS"
  const sizesForDevice = widgetSizes[deviceType]
  const deviceSize = `${Device.screen.width}x${Device.screen.height}` as any
  if (!(deviceSize in sizesForDevice)) {
    return undefined
  }
  // @ts-ignore-next
  const widgetTypes = sizesForDevice[deviceSize] as iOSWidgetFamily | iPadOSWidgetFamily
  if (!(type in widgetTypes)) {
    return undefined
  }
  // @ts-ignore-next
  return widgetTypes[type]
}
