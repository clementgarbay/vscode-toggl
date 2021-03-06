# Toggl for VSCode

Toggl time tracker integration for VSCode.

## Features

- `toggl.setToken`: set a Toggl API token
- `toggl.track`: start a new task on Toggl or stop the running task (if an existing task is already running outside of VSCode, it will be stopped)
- `toggl.sync`: synchronize Toggl remote running task with VSCode

The `track` and `sync` commands can also be triggered via the Toggl buttons in the navigation menu of the edition view.

In status bar (on right), the current task timer is visible and is clickable to open Toggl website.

_The Toggl API token can be find at the bottom of the [Toggl Profile page](https://toggl.com/app/profile)._

## Extension Settings

This extension contributes the following settings:

- `toggl.extraTags`: a list of additional tags to attach to the new tasks (optional)