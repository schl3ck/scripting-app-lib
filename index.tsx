import {
  Button,
  ContentUnavailableView,
  EmptyView,
  HStack,
  Image,
  List,
  Navigation,
  NavigationLink,
  NavigationStack,
  Path,
  ProgressView,
  Script,
  Section,
  Spacer,
  Text,
  VStack,
  VirtualNode,
  ZStack,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "scripting"
import { CrawlWidgetSizes } from "./Widget/crawlWidgetSizes"
import { TestMultiSelectionsPickerView } from "./MultiSelectionsPicker/testMultiSelectionsPicker"

function Tests() {
  return <Section
    title="Tests and Examples"
  >
    <NavigationLink
      title="Multi Selections Picker View"
      destination={<TestMultiSelectionsPickerView />}
    />
    <NavigationLink
      title="Widget Sizes"
      destination={<CrawlWidgetSizes />}
    />
  </Section>
}

function MainView() {
  const [from, setFrom] = useState("")
  const [to, setTo] = useState("")
  const dismiss = Navigation.useDismiss()
  const [linkCreated, setLinkCreated] = useState(false)
  const parentFolder = Path.normalize(Path.join(Script.directory, ".."))

  return <NavigationStack>
    <List
      navigationTitle={"Link a lib"}
      // navigationBarTitleDisplayMode={"large"}
      toolbar={{
        cancellationAction: <Button action={dismiss}
        >
          <Text>Close</Text>
        </Button>
      }}
        overlay={
          linkCreated ? (
            <TemporaryPopover>
              <VStack
                font={"title"}
                spacing={5}
              >
                <Image systemName="checkmark" />
                <Text>Done</Text>
              </VStack>
            </TemporaryPopover>
          ) : (
            <EmptyView />
          )
        }
    >
      <Section
        footer={
          <Text>
            Select a library module and a destination folder to create a symbolic link.
          </Text>
        }
      >
        <HStack
          contentShape={"rect"}
          onTapGesture={async () => {
            Navigation.present(<Folder
              path={Script.directory}
              select="file"
              onSelection={(p, dismiss) => {
                setFrom(p)
                dismiss()
              }}
              cancel={dismiss}
            />)
          }}
        >
          <Text>Lib</Text>
          <Spacer />
          <Text>{from.replace(Script.directory + "/", "")}</Text>
          <Image
            systemName="chevron.right"
            foregroundStyle="tertiaryLabel"
          />
        </HStack>
        <HStack
          contentShape={"rect"}
          onTapGesture={async () => {
            Navigation.present(<Folder
              path={parentFolder}
              select="folder"
              onSelection={(p, dismiss) => {
                setTo(p)
                dismiss()
              }}
              cancel={dismiss}
            />)
          }}
        >
          <Text>Target</Text>
          <Spacer />
          <Text>{to.replace(parentFolder + "/", "")}</Text>
          <Image
            systemName="chevron.right"
            foregroundStyle="tertiaryLabel"
          />
        </HStack>
      </Section>

      <Section>
        <Button
          multilineTextAlignment={"center"}
          action={() => {
            FileManager.createLinkSync(Path.join(to, Path.basename(from)), from)
            setLinkCreated(true)
            setTimeout(() => setLinkCreated(false), 1000)
          }}
          disabled={!from || !to}
        >
          <Text>Create Link</Text>
        </Button>
      </Section>

      <Tests />
    </List>
  </NavigationStack>
}

function TemporaryPopover({ children }: { children: VirtualNode }) {
  return (
    <ZStack
      frame={{
        alignment: "center",
        minHeight: 50,
        minWidth: 50,
      }}
      padding={20}
      background={"thinMaterial"}
      clipShape={{
        type: "rect",
        cornerRadius: 15,
        style: "continuous",
      }}
    >
      {children}
    </ZStack>
  )
}

function Folder({
  path,
  onSelection,
  cancel,
  select,
}: {
  path: string,
  onSelection: (path: string, dismiss: ReturnType<typeof Navigation["useDismiss"]>) => void,
  cancel: (dismiss: ReturnType<typeof Navigation["useDismiss"]>) => void,
  select: "folder" | "file",
}) {
  const [content, setContent] = useState<string[]>([])
  const [loaded, setLoaded] = useState(false)
  const dismiss = Navigation.useDismiss()

  const load = useCallback(async () => {
    setContent(
      (await FileManager.readDirectory(path)).map(i => Path.join(path, i))
    )
    setLoaded(true)
  }, [])

  useEffect(() => {
    load()
  }, [])

  const { folders, files } = useMemo(() => {
    const folders = []
    const files = []
    for (const item of content) {
      if (FileManager.isDirectorySync(item)) {
        folders.push(item)
      } else {
        files.push(item)
      }
    }
    folders.sort((a, b) => a.localeCompare(b))
    files.sort((a, b) => a.localeCompare(b))
    return {
      folders,
      files,
    }
  }, [content])

  return <NavigationStack>
    <List
      navigationTitle={Path.basename(path)}
      toolbar={{
        confirmationAction: select === "folder"
          ? <Button
            title={"Select here"}
            action={() => onSelection(path, dismiss)}
          />
          : <EmptyView />,
        cancellationAction: <Button
          title={"Cancel"}
          action={() => cancel(dismiss)}
        />,
        topBarTrailing: <Button
          systemImage="plus"
          title={""}
          action={async () => {
            const name = await Dialog.prompt({
              title: "New Folder",
              cancelLabel: "Cancel",
              confirmLabel: "Create",
            })
            if (name) {
              const folder = Path.join(path, name)
              FileManager.createDirectorySync(folder)
              setContent([folder, ...content])
            }
          }}
        />
      }}
      overlay={
        content.length === 0 || !loaded
          ? <ContentUnavailableView
            title={loaded ? "No entries" : "Loading"}
            systemImage={loaded ? "folder" : "progress.indicator"}
          />
          : <EmptyView />
      }
    >
      {folders.map(f =>
        <NavigationLink
          destination={
            <Folder
              path={f}
              onSelection={(p) => onSelection(p, dismiss)}
              cancel={() => cancel(dismiss)}
              select={select}
            />
          }
        >
          <HStack>
            <Image systemName="folder.fill" />
            <Text>{Path.basename(f)}</Text>
          </HStack>
        </NavigationLink>
      )}
      {
        files.map(f =>
          <HStack
            contentShape={"rect"}
            onTapGesture={() => onSelection(f, dismiss)}
            disabled={select === "folder"}
          >
            <Image systemName="doc.fill" />
            <Text>{Path.basename(f)}</Text>
            <Spacer />
          </HStack>
        )
      }
    </List>
  </NavigationStack>
}

async function run() {
  await Navigation.present(<MainView />)
  Script.exit()
}

run()
