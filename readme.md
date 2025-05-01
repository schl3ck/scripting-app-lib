# scripting-app-lib

This repo contains libraries to use with the [Scripting app](https://apps.apple.com/app/id6479691128).

This Script copies the libraries via symbolic links to your own Scripts so whenever the libraries are changed, they are also automatically updated wherever they are used.

> Note: Currently it seems that when the linked file is changed then the link is broken and the original file is not updated. Strangely the iOS Files app still says that it is a symbolic link.

Each library lives in its own folder together with a module that should have a function to preview the library (so far called "test"). Each library module should contain all the logic it needs. (Since I have broken this rule already myself in [/Widget](/Widget) I will add a system that checks for dependencies and will also link them.)

## Install

Download the latest zip file from the [releases page](https://github.com/schl3ck/scripting-app-lib/releases) and import it in the app.

## Preview a library module

1. Run the Script in the app
2. Select a module in the section "Tests"

## How to use a library module

1. Run the Script in the app
2. Select the library by tapping on "Lib"
3. Navigate to the library module inside its folder and select it
4. Select the destination by tapping on "Target"
5. Navigate to your script where you want to use the library. I recommend that you put it in the folder "lib" in your Script (you can create the folder while browsing for the target).
6. Tap "Select here" in the top right corner
7. Tap "Create Link" to create the symbolic link

## This project follows semantic versioning

Breaking changes will only be made in major version changes. New libraries can be added in minor versions though.

## Please contribute

Contributions are welcome! Just create a pull request with your additions.

If you add a library then please also include an additional file with a preview of the library or at least a readme that can be viewed in the running script (see [ScriptUpdater](./ScriptUpdater/scriptUpdaterDescription.tsx) for an example). In the best case the preview should show all features that the library offers. This way not only you can test that everything works but there is also an example for users consuming your library.

## Backlog of ideas

This is an unordered list of ideas. They might be implemented, but there is no warranty that they will.

* Dependency checking when linking a library
* Show all linked libs & remove with dependency checking
