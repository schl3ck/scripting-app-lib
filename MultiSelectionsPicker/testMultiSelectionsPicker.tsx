import { Circle, Color, HStack, List, NavigationLink, NavigationStack, Text, useState } from "scripting"
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
      <NavigationLink
        title="String options"
        destination={
          <MultiSelectionsPickerView
            options={allItems}
            selections={items}
            onChanged={setItems}
          />}
      />
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
    </List>
  </NavigationStack>
}