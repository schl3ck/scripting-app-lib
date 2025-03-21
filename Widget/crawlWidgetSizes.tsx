import { Button, Divider, EmptyView, HStack, List, NavigationStack, Path, ProgressView, Script, ScrollView, Section, Spacer, Text, VStack, WidgetDisplaySize, WidgetFamily, useState } from "scripting"
import { getWidgetSizes } from "./widgetSizes"
import { WidgetPreview } from "./widgetPreview"

const url = "https://developer.apple.com/design/human-interface-guidelines/widgets"

function SimpleWidget({
  displaySize,
  family,
  title,
}: {
  displaySize: WidgetDisplaySize,
  family: WidgetFamily,
  title: string,
}) {
  return <VStack
    frame={displaySize}
    background='accentColor'
    foregroundStyle="white"
    padding
  >
    <Text fontWeight="bold" font={20}>
      {title}
    </Text>
    <Text>
      {family}
    </Text>
    <Text>{displaySize.width}*{displaySize.height}</Text>
  </VStack>
}

export function CrawlWidgetSizes() {
  const [crawling, setCrawling] = useState(false)
  const [crawlResult, setCrawlResult] = useState<string>()
  const [isError, setIsError] = useState(false)
  const [saved, setSaved] = useState(false)

  const [currentSizes, setCurrentSizes] = useState<string>()

  return <NavigationStack
    background="secondarySystemBackground"
  >
    <List
      navigationTitle="Widget Sizes"
      navigationBarTitleDisplayMode="inline"
    >
      <Section
        footer={
          <Text>
            Loads the widget size data from {url}
          </Text>
        }
      >
        <Button
          title="Crawl widget sizes"
          systemImage="tray.and.arrow.down"
          action={async () => {
            setCrawling(true)
            setSaved(false)
            let result = await crawlWidgetSizes(setCrawlResult)
            if (!("error" in result)) {
              try {
                await saveWidgetSizes(result)
                setSaved(true)
              } catch (error) {
                result = {
                  error: "" + error
                }
              }
            }
            setCrawling(false)
            setIsError("error" in result)
            setCrawlResult(JSON.stringify(result, null, 2))
          }}
        />
        {crawling
          ? <HStack>
            <Spacer />
            <Text>Loading</Text>
            <ProgressView
              progressViewStyle={'circular'}
            />
            <Spacer />
          </HStack>
          : <EmptyView />
        }
        {crawlResult
          ? <ScrollView
            frame={{ maxHeight: 300 }}
          >
            <Text
              monospaced
              foregroundStyle={isError ? "systemRed" : crawling ? "systemOrange" : "systemGreen"}
            >
              {crawlResult}
            </Text>
          </ScrollView>
          : <EmptyView />
        }
        {saved
          ? <Text
            multilineTextAlignment="center"
          >
            Saved!
          </Text>
          : <EmptyView />
        }
      </Section>

      <Section
        footer={
          <Text>
            Display all widget families and their sizes for the current device
          </Text>
        }
      >
        <Button
          title="Get sizes for current device"
          action={() => {
            setCurrentSizes(
              JSON.stringify(
                Object.fromEntries(
                  Object
                    .values(widgetFamilyMap)
                    .map(family => {
                      console.log(family, getWidgetSizes(family))
                      return [
                        family,
                        getWidgetSizes(family)
                      ]
                    })
                ),
                null,
                2
              )
            )
          }}
        />
        {currentSizes
          ? <Text
            monospaced
          >
            {currentSizes}
          </Text>
          : <EmptyView />
        }
      </Section>

      <WidgetPreview
        widget={SimpleWidget}
        additionalProps={{
          title: "Widget Preview"
        }}
        sectionTitle="Widget Preview"
      />
    </List>
  </NavigationStack>
}

export type OSType = "iOS" | "iPadOS"
type WebViewResult = Record<OSType, string[][]> | { error: string }

const widgetFamilyMap: Record<string, WidgetFamily> = {
  small: "systemSmall",
  medium: "systemMedium",
  large: "systemLarge",
  "extra large": "systemExtraLarge",
  circular: "accessoryCircular",
  rectangular: "accessoryRectangular",
  inline: "accessoryInline",
}

async function crawlWidgetSizes(status: (msg: string) => void) {
  status("loading url")

  const wv = new WebViewController()
  if (!await wv.loadURL(url)) {
    throw new Error("Failed to load " + url)
  }
  status("waiting for content")
  // wait for async content to load
  await new Promise<void>((res) => setTimeout(res, 500))

  status("extracting content")
  const table = await wv.evaluateJavaScript<WebViewResult>(`
function get() {
  try {
    const iOS = getTable("#iOS-widget-dimensions")
    const iPadOS = getTable("#iPadOS-widget-dimensions")
    return {
      iOS,
      iPadOS,
    }
  } catch (error) {
    return {
      error: "" + error,
    }
  }
}

function getTable(query) {
  const table = document.querySelector(query + " + .table-wrapper table")
  if (!table) {
    throw new Error('Did not find element "' + query + '"')
    }
  return getTableContent(table)
}

function getTableContent(table) {
  return Array
    .from(table.querySelectorAll("tr"))
    .map(
      tr => Array
        .from(tr.children)
        .map(
          cell => cell
            .innerText
            .trim()
            .replace("×", "x")
        )
    )
}

get()
`)
  wv.dispose()
  if ("error" in table) return table
  status("transforming content")
  try {
    const result = Object.fromEntries(
      Object.entries(table)
        .map(([key, content]: [string, string[][]]) => {
          const headers = content[0].slice(1)
          const rows = content.slice(1)
          return [
            key,
            processRows(rows, headers)
          ]
        })
    )
    return result
  } catch (error) {
    return {
      error: "" + error
    }
  }
}

function isTruethy<T>(value: T): value is NonNullable<T> {
  return Boolean(value)
}

function processRows(
  rows: string[][],
  headers: string[],
) {
  return Object.fromEntries(
    rows.map((cells, rowIndex) => {
      // check if we are in a row with a cell that span from the previous row via "rowspan" HTML attribute
      if (
        rowIndex > 0
        && rows[rowIndex - 1].length > rows[rowIndex].length
      ) {
        cells.unshift(rows[rowIndex - 1][0])
      }
      if (cells[1] === "Canvas") {
        return undefined
      }
      return [
        cells[0].replace(" *", ""),
        processColumns(headers, cells),
      ]
    }).filter(isTruethy)
  )
}

function processColumns(
  headers: string[],
  cells: string[]
) {
  return Object.fromEntries(
    headers.map((header, i) => {
      if (header === "Target") {
        return undefined
      }
      const parts = cells[i + 1].split("x")
      return [
        widgetFamilyMap[header.replace(" (pt)", "").toLowerCase()],
        {
          width: parseInt(parts[0]),
          height: parseInt(parts[1]),
        }
      ] as const
    })
      .filter(isTruethy)
      .filter(([_, size]) => !isNaN(size.width) && !isNaN(size.height))
  )
}

async function saveWidgetSizes(sizes: object) {
  const file = Path.join(Script.directory, "Widget/widgetSizes.ts")
  const content = await FileManager.readAsString(file)
  const newContent = content.replace(/(\/\/ <--- start insert widget sizes\s+[^\{]+)[^\/]+(\/\/ <--- end insert widget sizes)/s, "$1" + JSON.stringify(sizes, null, 2) + " as const\n$2")
  await FileManager.writeAsString(file, newContent)
}
