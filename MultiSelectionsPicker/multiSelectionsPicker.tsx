import { HStack, Image, NavigationStack, Section, Spacer, Text, VirtualNode } from "scripting"

export function MultiSelectionsPickerView({
  options,
  selections,
  onChanged,
}: {
  options: string[] | VirtualNode[],
  selections: number[],
  onChanged: (selected: number[]) => void,
}) {
  const selected = new Set(selections)

  return <NavigationStack>
    <Section>
      {options.map((option, index) =>
        <HStack
          contentShape={"rect"}
          onTapGesture={() => {
            if (selected.has(index)) {
              selected.delete(index)
            } else {
              selected.add(index)
            }
            onChanged(Array.from(selections))
          }}
        >
          {
            typeof option === "string"
              ? <Text>{option}</Text>
              : option
          }
          <Spacer />
          {selected.has(index) ?
            <Image
              systemName={"checkmark"}
              foregroundStyle={"accentColor"}
            />
            : null
          }
        </HStack>
      )}
    </Section>
  </NavigationStack>
}
