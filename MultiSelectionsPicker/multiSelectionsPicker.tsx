import {
  Button,
  EmptyView,
  HStack,
  Image,
  List,
  NavigationStack,
  Section,
  Spacer,
  Text,
  VirtualNode,
  useState,
} from "scripting"

/**
 * A view to let the user select multiple options from a list. Use this as the destination of a
 * `<NavigationLink>`.
 */
export function MultiSelectionsPickerView({
  options,
  selections,
  onChanged,
  selectAll,
  selectNone,
}: {
  /**
   * The options from which the user can select. Can either be an array of
   * strings or an array of custom JSX elements
   */
  options: string[] | VirtualNode[]
  /** An array of the selected indices */
  selections: number[]
  /** Will be called with the new indices when the selection has changed */
  onChanged: (selected: number[]) => void
  /** The label of the button that selects all options when tapped */
  selectAll?: string
  /** The label of the button that selects no options when tapped */
  selectNone?: string
}) {
  if (!selectAll) selectAll = "Select all"
  if (!selectNone) selectNone = "Select none"

  const [selected, setSelected] = useState(() => new Set(selections))

  return (
    <NavigationStack>
      <List
        onDisappear={() => onChanged(Array.from(selected))}
        listSectionSpacing={16}
      >
        <Section
          listRowBackground={
            <EmptyView />
          }
        >
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
          {options.map((option, index) => (
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
                {typeof option === "string" ? <Text>{option}</Text> : option}
                <Spacer />
                {selected.has(index) ? (
                  <Image
                    systemName={"checkmark"}
                    foregroundStyle={"accentColor"}
                  />
                ) : null}
              </HStack>
            </Button>
          ))}
        </Section>
      </List>
    </NavigationStack>
  )
}
