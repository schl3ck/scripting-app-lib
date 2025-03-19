import { Device, HStack, Picker, Text, VStack, WidgetFamily, useMemo, useState, FunctionComponent, WidgetDisplaySize, useEffect, List, Section, Spacer } from "scripting"
import { iOSSizes, iPadOSSizes, widgetSizes } from "./widgetSizes"

const availableModels = ["current", "iOS", "iPadOS"] as const

type Partial<T extends object, Keys extends keyof T> = { [P in Exclude<keyof T, Keys>]: T[P] } & { [P in Keys]?: T[P] }

type Prettify<T> = {
  [K in keyof T]: T[K]
} & {}

export type WidgetParameters = {
  displaySize: WidgetDisplaySize,
  family: WidgetFamily,
}

export function WidgetPreview({
  widget,
}: {
  widget: FunctionComponent<WidgetParameters>,
}) {
  const AnyWidget = widget as FunctionComponent<any>

  const [model, setModel] = useState<typeof availableModels[number]>("current")

  const { availableDeviceSizes, calculatedModel } = useMemo(() => {
    let m = model
    const currentModel = Device.isiPhone ? "iOS" : "iPadOS"
    if (m === "current") {
      m = currentModel
    }
    return {
      availableDeviceSizes: [...(m === currentModel ? ["current"] : []), ...Object.keys(widgetSizes[m])],
      calculatedModel: m,
    }
  }, [model])

  const [size, setSize] = useState<string>("current")

  useEffect(() => {
    if (!availableDeviceSizes.includes(size)) {
      console.log("resetting size")
      setSize(availableDeviceSizes[0])
    }
  }, [availableDeviceSizes])

  const { availableTypes, calculatedSize } = useMemo(() => {
    const map: Prettify<Partial<Record<
      string,
      iOSSizes | iPadOSSizes
    >, iOSSizes | iPadOSSizes>> = {
        current: `${Device.screen.width}x${Device.screen.height}` as iOSSizes | iPadOSSizes,
        smallest: (availableDeviceSizes[0] === "current" ? availableDeviceSizes[1] : availableDeviceSizes[0]) as iOSSizes | iPadOSSizes,
        largest: availableDeviceSizes[availableDeviceSizes.length - 1] as iOSSizes | iPadOSSizes
      }
    const calculatedSize = map[size] ?? size as iOSSizes | iPadOSSizes
    return {
      availableTypes: Object.keys(
        // @ts-ignore-next
        widgetSizes[calculatedModel][calculatedSize]
      ) as WidgetFamily[],
      calculatedSize,
    }
  }, [model, availableDeviceSizes, size])

  const [widgetFamily, setWidgetFamily] = useState<WidgetFamily>("systemSmall")

  useEffect(() => {
    if (!availableTypes.includes(widgetFamily)) {
      console.log("resetting widgetFamily")
      setWidgetFamily(availableTypes[0])
    }
  }, [availableDeviceSizes, availableTypes])

  const { calculatedWidgetSize, scale } = useMemo(() => {
    // @ts-ignore-next
    const calculatedWidgetSize = widgetSizes[calculatedModel][calculatedSize][widgetFamily] as { width: number, height: number }
    const scale = Math.min(1, (Device.screen.width - 85) / calculatedWidgetSize.width)
    return {
      calculatedWidgetSize,
      scale
    }
  }, [calculatedModel, calculatedSize, widgetFamily])

  return <>
    <Section>
      <HStack
        padding={{ horizontal: 5 }}
        background="systemBackground"
        contentShape="rect"
      >
        <Picker
          title="Model"
          value={model}
          onChanged={(value: string) => setModel(value as typeof model)}
        >
          {
            availableModels.map(m =>
              <Text tag={m}>{m}</Text>
            )
          }
        </Picker>
        <Picker
          title="Device Size"
          value={size}
          onChanged={(value: string) => setSize(value as typeof size)}
        >
          {
            availableDeviceSizes.map(s =>
              <Text tag={s}>{s}</Text>
            )
          }
        </Picker>
        <Picker
          title="Widget Family"
          value={widgetFamily}
          onChanged={(value: string) => setWidgetFamily(value as WidgetFamily)}
        >
          {
            availableTypes.map(t =>
              <Text tag={t}>{t}</Text>
            )
          }
        </Picker>
      </HStack>
    </Section>

    <Section>
      <HStack
        listRowBackground={
          <VStack
            background="secondarySystemBackground"
          />
        }
        frame={{
          height: calculatedWidgetSize.height * scale,
        }}
      >
        <Spacer minLength={0} />
        <HStack
          clipShape={{
            type: "rect",
            cornerRadius: 20,
            style: "continuous",
          }}
          shadow={{
            color: "systemGray",
            radius: 3,
          }}
        >
          <AnyWidget
            family={widgetFamily}
            displaySize={calculatedWidgetSize}
            frame={calculatedWidgetSize}
            scaleEffect={scale}
          />
        </HStack>
        <Spacer minLength={0} />
      </HStack>
    </Section>
  </>
}

