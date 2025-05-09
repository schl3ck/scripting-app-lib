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
import { ScriptUpdaterDescription } from "./ScriptUpdater/scriptUpdaterDescription"
import {
  VersionData,
  StorageData,
  downloadUpdate,
  installDownloadedScript,
  cleanFiles,
  updateAvailable,
  getVersionCache,
  Changelog,
  UpdateCheckInterval,
} from "./ScriptUpdater/scriptUpdater"

const versionsUrl = "https://github.com/schl3ck/scripting-app-lib/releases"
const currentVersion = "1.4.1"

function Tests() {
  return (
    <Section title="Tests and Examples">
      <NavigationLink
        title="Multi Selections Picker View"
        destination={<TestMultiSelectionsPickerView />}
      />
      <NavigationLink
        title="Widget Sizes"
        destination={<CrawlWidgetSizes />}
      />
      <NavigationLink
        title="Script Updater"
        destination={<ScriptUpdaterDescription />}
      />
    </Section>
  )
}

function MainView() {
  const [from, setFrom] = useState("")
  const [to, setTo] = useState("")
  const dismiss = Navigation.useDismiss()
  const [linkCreated, setLinkCreated] = useState(false)
  const parentFolder = Path.normalize(Path.join(Script.directory, ".."))
  const [updatedToVersion, setUpdatedToVersion] = useState<string>()

  return (
    <NavigationStack>
      <List
        navigationTitle={updatedToVersion ? "" : "Link a lib"}
        // navigationBarTitleDisplayMode={"large"}
        toolbar={{
          cancellationAction: (
            <Button action={dismiss}>
              <Text>Close</Text>
            </Button>
          ),
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
          ) : updatedToVersion ? (
            <UpdateFinished version={updatedToVersion} />
          ) : (
            <EmptyView />
          )
        }
      >
        <Section
          footer={
            <Text>Select a library module and a destination folder to create a symbolic link.</Text>
          }
        >
          <NavigationLink
            destination={
              <Folder
                key={"libDestination"}
                path={Script.directory}
                select="file"
                onSelection={(p) => {
                  setFrom(p)
                }}
                tip={"Select a file to link"}
              />
            }
          >
            <HStack>
              <Text>Select a Lib File</Text>
              <Spacer />
              <Text
                foregroundStyle={"secondaryLabel"}
                font={"callout"}
              >{from.replace(Script.directory + "/", "")}</Text>
            </HStack>
          </NavigationLink>
          <NavigationLink
            destination={
              <Folder
                key={"targetDestination"}
                path={parentFolder}
                select="folder"
                topLevel
                onSelection={(p) => {
                  setTo(p)
                }}
              />
            }
          >
            <HStack>
              <Text>Select a Target Folder</Text>
              <Spacer />
              <Text
                foregroundStyle={"secondaryLabel"}
                font={"callout"}
              >{to.replace(parentFolder + "/", "")}</Text>
            </HStack>
          </NavigationLink>
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

        <UpdateSection onUpdated={setUpdatedToVersion} />
      </List>
    </NavigationStack>
  )
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
  select,
  topLevel = false,
  tip,
}: {
  path: string
  onSelection: (path: string) => void
  select: "folder" | "file"
  topLevel?: boolean
  tip?: string
}) {
  const dismiss = Navigation.useDismiss()
  const [content, setContent] = useState<string[]>([])
  const [loaded, setLoaded] = useState(false)

  const load = useCallback(async () => {
    setContent((await FileManager.readDirectory(path)).map((i) => Path.join(path, i)))
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

  return (
    <List
      navigationTitle={Path.basename(path)}
      toolbar={{
        bottomBar: select === "folder" && !topLevel ?
          <HStack>
            <Spacer />
            <Button
              action={() => {
                dismiss()
                onSelection(path)
              }}
            >
              <HStack>
                <Image systemName={"link"} />
                <Text>Link lib file here</Text>
              </HStack>
            </Button>
            <Spacer />
          </HStack>
          : undefined,
        topBarTrailing: <Button
          systemImage="folder.badge.plus"
          title={"New Folder"}
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
        />,
      }}
      overlay={
        content.length === 0 || !loaded ? (
          <ContentUnavailableView
            title={loaded ? "No entries" : "Loading"}
            systemImage={loaded ? "folder" : "progress.indicator"}
          />
        ) : (
          <EmptyView />
        )
      }
      contentMargins={
        tip != null
          ? {
            edges: 'top',
            insets: 0,
          }
          : undefined
      }
    >
      {tip != null
        ? <Section footer={
          <Text>{tip}</Text>
        }>
          <EmptyView />
        </Section>
        : null}

      {folders.map((f) => (
        <NavigationLink
          destination={
            <Folder
              path={f}
              tip={tip}
              onSelection={(p) => {
                dismiss()
                onSelection(p)
              }}
              select={select}
            />
          }
        >
          <HStack>
            <Image
              systemName="folder.fill"
              foregroundStyle={"accentColor"}
            />
            <Text>{Path.basename(f)}</Text>
          </HStack>
        </NavigationLink>
      ))}
      {files.map((f) => (
        <HStack
          contentShape={"rect"}
          onTapGesture={() => {
            dismiss()
            onSelection(f)
          }}
          disabled={select === "folder"}
        >
          <Image
            systemName="doc.fill"
            foregroundStyle={"accentColor"}
          />
          <Text>{Path.basename(f)}</Text>
          <Spacer />
        </HStack>
      ))}
    </List>
  )
}

function UpdateSection({
  onUpdated,
}: {
  onUpdated: (version: string) => void,
}) {
  const [error, setError] = useState<string>()
  const [showError, setShowError] = useState(false)
  const [checkingForUpdate, setCheckingForUpdate] = useState(false)
  const [updating, setUpdating] = useState(false)
  const [newVersions, setNewVersions] = useState<VersionData[]>(() => [])
  const [versionCache, setVersionCache] = useState<StorageData | null>()

  const update = useCallback(async () => {
    setUpdating(true)
    await downloadUpdate(newVersions[newVersions.length - 1].url)
    await installDownloadedScript()
    await cleanFiles()
    setUpdating(false)
    onUpdated(newVersions[newVersions.length - 1].version)
  }, [newVersions])
  const checkForUpdate = useCallback(async (interval: UpdateCheckInterval) => {
    setCheckingForUpdate(true)
    try {
      setNewVersions(await updateAvailable(versionsUrl, interval, currentVersion))
    } catch (err) {
      const e = err as any
      setError("" + err)
      console.error({
        name: e.name,
        message: e.message,
        cause: e.cause,
        fileName: e.fileName,
        lineNumber: e.lineNumber,
        columnNumber: e.columnNumber,
        stack: e.stack,
      })
      setShowError(true)
    }
    setVersionCache(getVersionCache())
    setCheckingForUpdate(false)
  }, [])
  useEffect(() => {
    setVersionCache(getVersionCache())
    checkForUpdate("daily")
  }, [])

  return (
    <Section>
      <Button
        action={() => checkForUpdate("every time")}
        disabled={checkingForUpdate || updating}
        alert={{
          title: "There was an error",
          message: <Text>{error ?? ""}</Text>,
          actions: <EmptyView />,
          isPresented: showError,
          onChanged: setShowError,
        }}
      >
        <HStack>
          <Text>{checkingForUpdate ? "Checking..." : "Check for an update"}</Text>
          <Spacer />
          {checkingForUpdate ? (
            <ProgressView progressViewStyle="circular" />
          ) : error ? (
            <Image
              systemName="exclamationmark.triangle.fill"
              foregroundStyle="systemYellow"
            />
          ) : (
            <VStack
              foregroundStyle="secondaryLabel"
              alignment={"trailing"}
            >
              <Text
                font={"caption"}
              >
                {versionCache ? new Date(versionCache.lastChecked).toLocaleString() : "never"}
              </Text>
              <Text
                font={"caption2"}
              >Last checked</Text>
            </VStack>
          )}
        </HStack>
      </Button>
      <NavigationLink
        title="Changelog"
        destination={
          <Changelog
            versions={newVersions.length > 0 ? newVersions : versionCache?.versions ?? []}
          />
        }
      />
      {newVersions.length > 0 ? (
        <Button action={update}>
          <HStack>
            <Text>
              {updating
                ? "Updating..."
                : "Update to " + newVersions[newVersions.length - 1].version}
            </Text>
            <Spacer />
            {updating ? <ProgressView progressViewStyle="circular" /> : <EmptyView />}
          </HStack>
        </Button>
      ) : (
        <EmptyView />
      )}
    </Section>
  )
}

function UpdateFinished({ version }: { version: string }) {
  return (
    <ContentUnavailableView
      systemImage="sparkles"
      title={"Update to " + version + " installed!"}
      description="Please close this script, rebuild all scripts (in the settings of Scripting) and start this script again to use the new version."
      background="secondarySystemBackground"
    />
  )
}

async function run() {
  await Navigation.present(
    <MainView />
  )
  Script.exit()
}

run()
