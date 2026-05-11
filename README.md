# Seeker

Seeker is a desktop productivity app built with Tauri, React, TypeScript, and Vite.

## Tech Stack

- Tauri v2
- React 18
- TypeScript
- Vite
- Tailwind CSS v4

## Development

Install dependencies:

```bash
npm install
```

Run web development server:

```bash
npm run dev
```

Run as a Tauri desktop app:

```bash
npm run tauri dev
```

## Build Desktop App

```bash
npm run tauri build
```

Build desktop app directly with Cargo (alternative):

```bash
cargo tauri build
```

Build artifacts are generated in:

```text
src-tauri/target/release/bundle/
```

## Keyboard Shortcuts

On macOS, **Cmd** (⌘) is accepted alongside **Ctrl** for the shortcuts below that use a modifier.

### Global

- `Ctrl + Esc`: open task list page
- `Ctrl + S`: open settings page

### Welcome Page

- `Enter`: continue from splash / confirm selected mode
- `Tab`: switch mode option (during mode selection)

### Task List Page

- `Ctrl + N`: create a new task
- `j` / `k`: move task selection
- `Enter`: arm selected task, then confirm to open it
- `Esc`: unselect armed task / close delete prompt
- `e`: edit armed task
- `Delete`: open delete confirmation for armed task
- `Shift + Delete`: delete armed task immediately
- `1` / `2` / `3` / `4`: set urgency (`none` / `low` / `medium` / `high`)

### Create / Edit Task Form

- `Enter`: arm draft, then submit when armed
- `Esc`: close form (or cancel armed draft)
- `Tab` / `Shift + Tab`: move focus between title and detail fields
- `Shift + Enter`: insert newline in detail field

### Main Page

- `Ctrl + N`: create one sub task
- `Ctrl + M`: create multiple sub tasks (line-based input)
- `Ctrl + C`: show/hide completed sub tasks
- `Ctrl + I`: toggle task info panel
- `j` / `k`: move sub task selection
- `Alt + j` / `Alt + k`: jump selection by 5 rows
- `Space` or `x`: toggle selected sub task done/todo
- `Enter`: toggle selected sub task todo
- `e`: edit selected sub task
- `Delete`: open delete confirmation
- `Shift + Delete`: delete selected sub task immediately
- `Esc`: close info / cancel current prompt

### Build-up Progressive View

- Setup step 1: `Enter` to continue
- Setup step 2: `Enter` to confirm target, `Esc` to go back
- Setup step 3: `Enter` to start, `Esc` to cancel
- Active session input: `Enter` arms then submits log, `Esc` cancels armed submit

## Notes

- App settings are stored in local app data as `settings.json`.
- App task data is stored in local app data as `seeker.json`.
- Mode selection from welcome is applied through React state immediately after saving settings (no full `window.location.reload()`).
