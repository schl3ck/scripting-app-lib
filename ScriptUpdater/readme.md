This script provides functions to aid in checking if an update of your script is available
and then to download and install it.

# Prerequisites

The updater needs publicly available version information. Currently it supports two methods which
are described down below:

- `version.json`
- Github Releases

## `version.json`

You have to host a `version.json` file publicly (e.g. in a Github repo) that
includes all versions of your script. It downloads this file and compares the included versions
with the currently running version. It must have the following structure:

```json
[
  {
    "version": "1.2.3",
    "date": "2025-01-31",
    "notes": "Markdown text describing this release",
    "url": "URL to a ZIP-file containing the update (e.g. from the Releases page of a GitHub repo)"
  }
]
```

**Notes:**

- `version` must be of the form `x.y` or `x.y.z` and so on without any prefix.
- `date` can have any format that javascript can parse but I suggest the ISO 8601 date format (without time).
- `notes` should not include a heading with the version number nor the date
- `url` must be a direct URL to the zip file containing the script update. The access must be public because no authentication is possible.

## Github Releases

If you use a Github Repo for you script then you can use its releases page for the updater too. Simply pass the url to the releases page to the `updateAvailable` function and it fetches the needed information from Github.

The name of the release is used as version number so it should be something like `v1.1` (the prefix is optional). The description is used as the `notes` in `versions.json`. Please make sure that Github has generated a zip file of the repo and attached it as an asset to the release (this should happen automatically).

# Functions

- [`updateAvailable`](#updateavailableurl-string-interval-updatecheckinterval-currentversion-string-promiseversiondata) - Check if an update is available.
- [`downloadUpdate`](#downloadupdateurl-string-promisestring) - Download the update from the provided URL.
- [`installDownloadedScript`](#installdownloadedscript-promisevoid) - Make a backup of the current Script and install the update.
- [`Changelog`](#changelog-versions---versions-versiondata--jsxelement) - Custom component to show the changelog

Utility functions/types:

- [`cleanFiles`](#cleanfiles-promisevoid) - Remove the downloaded files and the Script backup.
- [`compareVersion`](#compareversiona-string-b-string-int) - Compare two version strings and return their ordering.
- [`getVersionCache`](#getversioncache-storagedata--null) - Return the cached data of all versions and the last time this data was fetched.
- [`UpdateCheckInterval`](#updatecheckinterval) - Allowed values for `interval` in `updateAvailable`.
- `DownloadError` - This error is thrown when the download of the .zip file failed.

## `updateAvailable(url: string, interval: UpdateCheckInterval, currentVersion: string): Promise<VersionData[]>`

This function fetches the [`version.json`](#prerequisites) from `url` and compares all versions
in it with the `currentVersion`. The fetched data is stored in a cache together with the last
fetched date. If the last fetched date is newer than `interval` allows then no request is made
but the cache data is used directly.

It returns an array of newer versions than `currentVersion` sorted in ascending order.

## `downloadUpdate(url: string): Promise<string[]>`

Downloads the update from `url` and extract the ZIP file to a temporary directory. To install
the update call `installDownloadedScript` afterwards. Returns the files in the ZIP file.

## `installDownloadedScript(): Promise<void>`

Install the downloaded and extracted Script by moving the current Script to a backup folder
and then moving the extracted files to the Scripts folder. To remove the backup and downloaded
files call `cleanFiles`. Usually you can call it instantly after this function.

## `Changelog({ versions }: { versions: VersionData[] }): JSX.Element`

Show the changelog with the given set of versions. This can be used as the destination in
a NavigationLink.

## `cleanFiles(): Promise<void>`

Remove the Script backup and all downloaded files.

## `compareVersion(a: string, b: string): int`

Compare two versions. This can be used in the `Array.sort()` function. Only supports
versions of the form `a`, `a.b`, `a.b.c` and `a.b.c.d`. No alpha, beta or other pre-release
versions are supported.

Returns `0` if they equal, less than `0` if `a` is less than `b` and greater
than `0` if `a` is greater than `b`.

## `getVersionCache(): StorageData | null`

Return the cached data containing all versions and the last time it was updated.

## `UpdateCheckInterval`

Allowed values:

  - `"every time"`
  - `"daily"`
  - `"weekly"`
  - `"monthly"`
  - `"never"`

# Example

```tsx
const url = "https://example.com/versions.json"
const currentVersion = "1.0.1"
function View() {
  const [newVersions, setNewVersions] = useState<VersionData[]>()
  const [updating, setUpdating] = useState(false)

  const check = useCallback(async () => {
    setNewVersions(await updateAvailable(url, "daily", currentVersion))
  }, [])
  useEffect(() => {
    check()
  }, [])

  const update = useCallback(async () => {
    // the last one should be the newest because of the ordering in the version.json file
    setUpdating(true)
    await downloadUpdate(newVersions[newVersions.length - 1].url)
    await installDownloadedScript()
    await cleanFiles()
    setUpdating(false)
  }, [newVersions])

  return <NavigationStack>
    <List
      overlay={
        newVersions
          ? <EmptyView />
          : <ProgressView progressViewStyle="circular" />
      }
    >
      <NavigationLink
        title="Changelog"
        destination={
          <Changelog versions={newVersions} />
        }
      />
      <Button
        disabled={updating || (newVersions ?? []).length === 0}
        action={update}
      >
        <HStack>
          <Text>Update</Text>
          <Spacer />
          {
            updating
              ? <ProgressView progressViewStyle="circular" />
              : <EmptyView />
          }
        </HStack>
      </Button>
    </List>
  </NavigationStack>
}
```
