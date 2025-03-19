import { Button, ContentUnavailableView, EmptyView, HStack, Image, List, Navigation, NavigationLink, NavigationStack, Path, Script, Section, Spacer, Text, VStack, useCallback, useEffect, useMemo, useState } from "scripting"
import { TestEditableList } from "./EditableList/test"
import { CrawlWidgetSizes } from "./Widget/crawlWidgetSizes"

function Tests() {
  return <Section
    title="Tests"
  >
    <NavigationLink
      title="EditableList"
      destination={<TestEditableList />}
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
    >
      <HStack
        contentShape={"rect"}
        onTapGesture={async () => {
          Navigation.present(<Folder
            path={Script.directory}
            select="file"
            onSelection={(p) => {
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
      </HStack>
      <HStack
        contentShape={"rect"}
        onTapGesture={async () => {
          Navigation.present(<Folder
            path={parentFolder}
            select="folder"
            onSelection={(p) => {
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
      </HStack>

      <Section>
        <Button
          multilineTextAlignment={"center"}
          action={() => {
            FileManager.createLinkSync(Path.join(to, Path.basename(from)), from)
            setLinkCreated(true)
            setTimeout(() => setLinkCreated(false), 1000)
          }}
          disabled={!from || !to}
          alert={{
            title: "",
            message: <VStack
              font={"largeTitle"}
            >
              <Image systemName="checkmark" />
              <Text>Done</Text>
            </VStack>,
            actions: <EmptyView />,
            onChanged: setLinkCreated,
            isPresented: linkCreated,
          }}
        >
          <Text>Create Link</Text>
        </Button>
      </Section>

      <Tests />
    </List>
  </NavigationStack>
}

function Folder({
  path,
  onSelection,
  cancel,
  select,
}: {
  path: string,
  onSelection: (path: string) => void,
  cancel: () => void,
  select: "folder" | "file",
}) {
  const [content, setContent] = useState<string[]>([])
  const [loaded, setLoaded] = useState(false)

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
            action={() => onSelection(path)}
          />
          : <EmptyView />,
        cancellationAction: <Button
          title={"Cancel"}
          action={cancel}
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
              onSelection={onSelection}
              cancel={cancel}
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
            onTapGesture={() => onSelection(f)}
            disabled={select === "folder"}
          >
            <Image systemName="doc.fill" />
            <Text>{Path.basename(f)}</Text>
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
