import {
  EmptyView,
  Markdown,
  NavigationStack,
  Path,
  ProgressView,
  Script,
  ScrollView,
  useCallback,
  useEffect,
  useState,
} from "scripting"

const readme = Path.join(Script.directory, "ScriptUpdater/readme.md")

export function ScriptUpdaterDescription() {
  const [content, setContent] = useState<string>()

  const loadContent = useCallback(async () => {
    setContent(await FileManager.readAsString(readme, "utf-8"))
  }, [])
  useEffect(() => {
    loadContent()
  }, [])

  return (
    <NavigationStack>
      <ScrollView
        navigationTitle={"ScriptUpdater"}
        navigationBarTitleDisplayMode={"large"}
        overlay={content ? <EmptyView /> : <ProgressView progressViewStyle={"circular"} />}
      >
        <Markdown padding content={content ?? ""} />
      </ScrollView>
    </NavigationStack>
  )
}
