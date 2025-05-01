import {
  HStack,
  Markdown,
  NavigationStack,
  Path,
  Response,
  Script,
  ScrollView,
  Spacer,
  Text,
  fetch,
} from "scripting"

export const updateCheckIntervalValues = [
  "every time",
  "daily",
  "weekly",
  "monthly",
  "never",
] as const
export type UpdateCheckInterval = (typeof updateCheckIntervalValues)[number]
export interface VersionData {
  version: string
  date: string
  notes: string
  url: string
}
export interface StorageData {
  lastChecked: number
  versions: VersionData[]
}

const storageKey = `scriptUpdater.${Script.name}`
const downloadedZip = Path.join(FileManager.temporaryDirectory, "scriptUpdate.zip")
const unzippedFolder = Path.join(FileManager.temporaryDirectory, "scriptUpdate")
const scriptBackup = Script.directory + "_updateBackup"

const githubReleasesRegex = /^https:\/\/github.com\/(?<owner>[^/]+)\/(?<repo>[^/]+)\/releases/
const githubReleasesApiUrl =
  "https://api.github.com/repos/{owner}/{repo}/releases?per_page=100&page={page}"

/**
 * Fetch the versions file (depending on the update interval) and return all newer versions
 * than the current one.
 *
 * @param url URL pointing to the `version.json` file or to a Github releases page. A simple GET
 * request is made so no authentication is supported.
 * @param interval Interval to check for updates. If this function is called within this
 * interval again then no request is made and only the cache is looked up.
 * @param currentVersion Current version of the script. The forms `a`, `a.b`, `a.b.c`, `a.b.c.d`
 * are supported.
 */
export async function updateAvailable(
  url: string,
  interval: UpdateCheckInterval,
  currentVersion: string,
) {
  const cached: StorageData = Storage.get<StorageData>(storageKey) ?? {
    lastChecked: 1,
    versions: [],
  }
  const intervalDates: Record<UpdateCheckInterval, Date> = {
    ["every time"]: new Date(),
    daily: getIntervalDate(),
    weekly: getIntervalDate((d) => d.setDate(d.getDate() - 7)),
    monthly: getIntervalDate((d) => d.setMonth(d.getMonth() - 1)),
    never: new Date(0),
  }
  if (cached.lastChecked <= intervalDates[interval].getTime()) {
    const githubReleases = await getGithubReleases(url)
    if (githubReleases) {
      cached.versions = githubReleases
    } else {
      const response = await fetch(url)
      cached.versions = (await response.json()) as VersionData[]
    }
    cached.versions.sort((a, b) => compareVersion(a.version, b.version))
    cached.lastChecked = new Date().getTime()

    // save updated cache
    if (!Storage.set(storageKey, cached)) {
      console.log("WARNING: could not write update data to Storage")
    }
  }

  const newVersions = cached.versions.filter((v) => compareVersion(v.version, currentVersion) > 0)
  return newVersions
}

function getIntervalDate(adjust?: (d: Date) => void) {
  const d = new Date()
  adjust && adjust(d)
  d.setHours(0, 0, 0, 0)
  return d
}

async function getGithubReleases(url: string) {
  const match = githubReleasesRegex.exec(url)
  if (!match) {
    return undefined
  }

  const apiUrl = githubReleasesApiUrl
    .replace("{owner}", match.groups!.owner)
    .replace("{repo}", match.groups!.repo)
  const versions: VersionData[] = []
  for (let i = 1; true; i++) {
    const response = await fetch(apiUrl.replace("{page}", i.toString()))
    const data = (await response.json()) as GithubRelease[]
    if (data.length === 0) {
      break
    }

    versions.push(
      ...data
        .filter((release) => !release.draft && !release.prerelease)
        .map((release) => {
          return {
            version: (release.name || release.tag_name).replace(/^v/i, ""),
            date: (release.published_at || release.created_at).replace(/T.*$/, ""),
            notes: release.body || "",
            url: release.zipball_url || "",
          } satisfies VersionData
        }),
    )
  }
  return versions
}

/**
 * Return the cached data containing all versions and the last time it was updated
 */
export function getVersionCache() {
  return Storage.get<StorageData>(storageKey)
}

/**
 * Downloads the update from `url` and extract the ZIP file to a temporary directory. To install
 * the update call `installDownloadedScript` afterwards. Returns the files in the ZIP file.
 * @param url URL to the ZIP file to download
 */
export async function downloadUpdate(url: string) {
  log("downloading zip")
  const response = await fetch(url)
  if (!response.ok) {
    throw new DownloadError(url, response)
  }
  log("converting to Data")
  const data = await response.data()
  log("writing Data to file")
  await FileManager.writeAsData(downloadedZip, data)
  if (!FileManager.existsSync(unzippedFolder)) {
    log("creating folder to unzip into")
    await FileManager.createDirectory(unzippedFolder, true)
  }
  log("unzipping")
  await FileManager.unzip(downloadedZip, unzippedFolder)

  const files = await FileManager.readDirectory(unzippedFolder)
  log("unzipped files:", files)
  if (files.length === 1 && (await FileManager.isDirectory(Path.join(unzippedFolder, files[0])))) {
    // looks like all script files are in a subfolder, so move all out
    log("files are in subfolder, move them out")
    const tmp = unzippedFolder + "_tmp"
    await FileManager.rename(unzippedFolder, tmp)
    await FileManager.rename(Path.join(tmp, files[0]), unzippedFolder)
    await FileManager.remove(tmp)
  }
  return FileManager.readDirectory(unzippedFolder, true)
}

/**
 * Install the downloaded and extracted Script by moving the current Script to a backup folder
 * and then moving the extracted files to the Scripts folder. To remove the backup and downloaded
 * files call `cleanFiles`. Usually you can call it instantly after this function.
 */
export async function installDownloadedScript() {
  await FileManager.rename(Script.directory, scriptBackup)
  await FileManager.rename(unzippedFolder, Script.directory)
}

/**
 * Remove the Script backup and all downloaded files.
 */
export async function cleanFiles() {
  if (await FileManager.exists(scriptBackup)) {
    await FileManager.remove(scriptBackup)
  }
  if (await FileManager.exists(downloadedZip)) {
    await FileManager.remove(downloadedZip)
  }
  if (await FileManager.exists(unzippedFolder)) {
    await FileManager.remove(unzippedFolder)
  }
}

/**
 * Compare two versions. This can be used in the Array.sort() function. Only supports
 * versions of the form a.b(...). No alpha, beta or other pre-release versions are supported.
 *
 * Returns `0` if they equal, less than `0` if `a` is less than `b` and greater
 * than `0` if `a` is greater than `b`.
 */
export function compareVersion(a: string, b: string): number {
  const regex = /^\d+(?:\.\d+){0,3}$/
  if (!regex.test(a)) {
    throw new Error(`Parameter "a" is not a version: "${a}"`)
  }
  if (!regex.test(b)) {
    throw new Error(`Parameter "b" is not a version: "${b}"`)
  }
  const aParts = a.split(".").map((i) => parseInt(i))
  const bParts = b.split(".").map((i) => parseInt(i))
  if (aParts.length < bParts.length) {
    aParts.push(...new Array(bParts.length - aParts.length).fill(0))
  }
  if (bParts.length < aParts.length) {
    bParts.push(...new Array(aParts.length - bParts.length).fill(0))
  }

  for (let i = 0; i < aParts.length; i++) {
    const result = aParts[i] - bParts[i]
    if (result !== 0) return result
  }
  return 0
}

/**
 * This error is thrown when the download of the .zip file failed.
 */
export class DownloadError {
  url: string
  response: Response

  constructor(url: string, response: Response) {
    this.url = url
    this.response = response
  }

  toString() {
    return `Failed to download the update from ${this.url}: ${this.response.status} ${this.response.statusText}`
  }
}

/**
 * Show the changelog with the given set of versions. This can be used as the destination in
 * a NavigationLink
 * @example
 * ```tsx
 * const url = "https://example.com/versions.json"
 * const currentVersion = "1.0.1"
 * function View() {
 *   const [newVersions, setNewVersions] = useState<VersionData[]>()
 *
 *   const load = useCallback(async () => {
 *     setNewVersions(await updateAvailable(url, "daily", currentVersion))
 *   }, [])
 *   useEffect(() => {
 *     load()
 *   }, [])
 *
 *   return <NavigationStack>
 *     <List
 *       overlay={
 *         newVersions
 *           ? <EmptyView />
 *           : <ProgressView progressViewStyle="circular" />
 *       }
 *     >
 *       <NavigationLink
 *         title="Changelog"
 *         destination={
 *           <Changelog versions={newVersions} />
 *         }
 *       />
 *     </List>
 *   </NavigationStack>
 * }
 * ```
 */
export function Changelog({
  versions,
}: {
  /**
   * The list of versions which should be displayed in the changelog. This is not sorted
   * before displaying it!
   */
  versions: VersionData[]
}) {
  const text = versions
    .map(
      (v) => `## ${v.version} - ${new Date(v.date).toLocaleDateString()}

${v.notes}
`,
    )
    .join("\n\n")

  return (
    <NavigationStack>
      <ScrollView>
        <HStack>
          <Markdown
            padding
            content={text}
          />
          <Spacer />
        </HStack>
      </ScrollView>
    </NavigationStack>
  )
}

function log(...args: any[]) {
  // console.log(...args)
}

/**
 * A release.
 */
interface GithubRelease {
  url: string
  html_url: string
  assets_url: string
  upload_url: string
  tarball_url: string | null
  zipball_url: string | null
  id: number
  node_id: string
  /**
   * The name of the tag.
   */
  tag_name: string
  /**
   * Specifies the commitish value that determines where the Git tag is created from.
   */
  target_commitish: string
  name: string | null
  body?: string | null
  /**
   * true to create a draft (unpublished) release, false to create a published one.
   */
  draft: boolean
  /**
   * Whether to identify the release as a prerelease or a full release.
   */
  prerelease: boolean
  created_at: string
  published_at: string | null
  author: unknown
  assets: unknown[]
  body_html?: string
  body_text?: string
  mentions_count?: number
  /**
   * The URL of the release discussion.
   */
  discussion_url?: string
  reactions?: unknown
  [k: string]: unknown
}
