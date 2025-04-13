import {
  Device,
  HStack,
  Picker,
  Text,
  VStack,
  WidgetFamily,
  useMemo,
  useState,
  FunctionComponent,
  WidgetDisplaySize,
  useEffect,
  Section,
  Spacer,
  ZStack,
} from "scripting"
import { iOSSizes, iPadOSSizes, widgetSizes } from "./widgetSizes"

const availableModels = ["current", "iOS", "iPadOS"] as const

type Partial<T extends object, Keys extends keyof T> = { [P in Exclude<keyof T, Keys>]: T[P] } & {
  [P in Keys]?: T[P]
}

type Prettify<T> = {
  [K in keyof T]: T[K]
} & {}

type AdditionalProps = Record<PropertyKey, unknown>

export type WidgetParameters<T extends AdditionalProps> = {
  displaySize: WidgetDisplaySize
  family: WidgetFamily
} & T

export function WidgetPreview<T extends AdditionalProps>({
  widget,
  additionalProps = undefined,
  sectionTitle = undefined,
  pickerAlignment = undefined,
}: {
  widget: FunctionComponent<WidgetParameters<T>>
  additionalProps?: T
  sectionTitle?: string
  pickerAlignment?: "horizontal" | "vertical"
}) {
  const AnyWidget = widget as FunctionComponent<any>

  const [model, setModel] = useState<(typeof availableModels)[number]>("current")

  const { currentModel, availableDeviceSizes, calculatedModel } = useMemo(() => {
    let m = model
    const currentModel = Device.isiPhone ? "iOS" : "iPadOS"
    if (m === "current") {
      m = currentModel
    }
    return {
      currentModel,
      availableDeviceSizes: [
        ...(m === currentModel ? ["current"] : []),
        ...Object.keys(widgetSizes[m]),
      ],
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

  const { availableTypes, calculatedSize, currentSize } = useMemo(() => {
    const currentSize = `${Device.screen.width}x${Device.screen.height}` as iOSSizes | iPadOSSizes
    const calculatedSize = size === "current" ? currentSize : (size as iOSSizes | iPadOSSizes)
    return {
      availableTypes: Object.keys(
        // @ts-ignore-next
        widgetSizes[calculatedModel][calculatedSize],
      ) as WidgetFamily[],
      calculatedSize,
      currentSize,
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
    const calculatedWidgetSize = widgetSizes[calculatedModel][calculatedSize][widgetFamily] as {
      width: number
      height: number
    }
    const scale = Math.min(1, (Device.screen.width - 85) / calculatedWidgetSize.width)
    return {
      calculatedWidgetSize,
      scale,
    }
  }, [calculatedModel, calculatedSize, widgetFamily])

  if (!pickerAlignment) {
    pickerAlignment = Device.isiPhone ? "vertical" : "horizontal"
  }

  const [hash, setHash] = useState(() => UUID.string())

  useEffect(() => {
    setHash(UUID.string())
  }, [additionalProps])

  const pickers = (
    <>
      <Picker
        title="Model"
        value={model}
        onChanged={(value: string) => setModel(value as typeof model)}
      >
        {availableModels.map((m) => (
          <Text tag={m}>{m + (m === "current" ? ` (${currentModel})` : "")}</Text>
        ))}
      </Picker>
      <Picker
        title="Device Size"
        value={size}
        onChanged={(value: string) => setSize(value as typeof size)}
      >
        {availableDeviceSizes.map((s) => (
          <Text tag={s}>{s + (s === "current" ? ` (${currentSize})` : "")}</Text>
        ))}
      </Picker>
      <Picker
        title="Widget Family"
        value={widgetFamily}
        onChanged={(value: string) => setWidgetFamily(value as WidgetFamily)}
      >
        {availableTypes.map((t) => (
          <Text tag={t}>{t}</Text>
        ))}
      </Picker>
    </>
  )

  return (
    <>
      <Section title={sectionTitle}>
        {pickerAlignment === "horizontal" ? (
          <HStack
            padding={{ horizontal: 5 }}
            background="systemBackground"
            contentShape="rect"
          >
            {pickers}
          </HStack>
        ) : (
          pickers
        )}
      </Section>

      <Section>
        <HStack
          listRowBackground={<VStack background="secondarySystemBackground" />}
          frame={{
            height: calculatedWidgetSize.height * scale,
          }}
        >
          <Spacer minLength={0} />
          <ZStack scaleEffect={scale}>
            <AnyWidget
              key={hash}
              family={widgetFamily}
              displaySize={calculatedWidgetSize}
              {...additionalProps}
              frame={calculatedWidgetSize}
              clipShape={{
                type: "rect",
                cornerRadius:
                  widgetFamily === "accessoryCircular" ? calculatedWidgetSize.width / 2 : 20,
                style: "continuous",
              }}
              shadow={{
                color: "systemGray",
                radius: 3,
              }}
            />
          </ZStack>
          <Spacer minLength={0} />
        </HStack>
      </Section>
    </>
  )
}
