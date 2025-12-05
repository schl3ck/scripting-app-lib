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

export function MarkdownView({ title, file }: { title: string, file: string }) {
  const [content, setContent] = useState<string>()

  const loadContent = useCallback(async () => {
    setContent(
      await FileManager.readAsString(
        Path.join(Script.directory, file),
        "utf-8",
      ),
    )
  }, [])
  useEffect(() => {
    loadContent()
  }, [])

  return (
    <NavigationStack>
      <ScrollView
        navigationTitle={title}
        navigationBarTitleDisplayMode={"large"}
        overlay={
          content ? undefined : <ProgressView progressViewStyle={"circular"} />
        }
      >
        <Markdown
          padding
          content={content ?? ""}
        />
      </ScrollView>
    </NavigationStack>
  )
}
