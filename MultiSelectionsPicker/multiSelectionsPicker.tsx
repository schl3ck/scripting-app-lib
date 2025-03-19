import { Button, HStack, Image, List, NavigationStack, Section, Spacer, Text, VirtualNode, useState } from "scripting"

export function MultiSelectionsPickerView({
  options,
  selections,
  onChanged,
  selectAll,
  selectNone,
}: {
  options: string[] | VirtualNode[],
  selections: number[],
  onChanged: (selected: number[]) => void,
  selectAll?: string,
  selectNone?: string,
}) {
  if (!selectAll) selectAll = "Select all"
  if (!selectNone) selectNone = "Select none"

  const [selected, setSelected] = useState(() => new Set(selections))

  return <NavigationStack>
    <List
      onDisappear={() => onChanged(Array.from(selected))}
    >
      <Section>
        <HStack>
          <Spacer minLength={0} />
          <Button
            title={selectAll}
            action={() => {
              setSelected(new Set(options.map((_, i) => i)))
            }}
            buttonStyle={"bordered"}
            buttonBorderShape={"capsule"}
          />
          <Button
            title={selectNone}
            action={() => {
              setSelected(new Set())
            }}
            buttonStyle={"bordered"}
            buttonBorderShape={"capsule"}
          />
          <Spacer minLength={0} />
        </HStack>
      </Section>
      <Section>
        {options.map((option, index) =>
          <Button
            foregroundStyle={"label"}
            action={() => {
              if (selected.has(index)) {
                selected.delete(index)
              } else {
                selected.add(index)
              }
              setSelected(new Set(selected))
            }}
          >
            <HStack>
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
          </Button>
        )}
      </Section>
    </List>
  </NavigationStack>
}
