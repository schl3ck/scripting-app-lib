import { Circle, Color, HStack, List, NavigationLink, NavigationStack, Section, Text, useState } from "scripting"
import { MultiSelectionsPickerView } from "./multiSelectionsPicker"

const allItems: Color[] = [
  "systemRed",
  "systemGreen",
  "systemBlue",
  "systemOrange",
  "systemYellow",
  "systemPink",
  "systemPurple",
  "systemTeal",
  "systemIndigo",
  "systemBrown",
  "systemMint",
  "systemCyan",
]

export function TestMultiSelectionsPickerView() {
  const [items, setItems] = useState<number[]>([])

  return <NavigationStack>
    <List
      navigationTitle="Multi Selections Picker"
      navigationBarTitleDisplayMode="inline"
    >
      <Section
        footer={
          <Text>
            Multi select with simple string options
          </Text>
        }
      >
        <NavigationLink
          title="String options"
          destination={
            <MultiSelectionsPickerView
              options={allItems}
              selections={items}
              onChanged={setItems}
            />}
        />
      </Section>
      <Section
        footer={
          <Text>
            Multi select with custom elements for each option
          </Text>
        }
      >
        <NavigationLink
          title="Custom options"
          destination={
            <MultiSelectionsPickerView
              options={allItems.map(item =>
                <HStack>
                  <Circle
                    fill={item}
                    frame={{
                      width: 20,
                      height: 20,
                    }}
                  />
                  <Text>{item}</Text>
                </HStack>
              )}
              selections={items}
              onChanged={setItems}
              selectAll="Select all"
              selectNone="Select none"
            />
          }
        />
      </Section>
    </List>
  </NavigationStack>
}