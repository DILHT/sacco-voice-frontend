# Conventions

This guide describes how this codebase is written today. It is based on the
LiveKit `agent-starter-react` template (see the `name` field in
[package.json:2](package.json#L2)). Every convention links to an example. Where
the code does the same thing in more than one way, the guide says so and does
not choose one.

"Registry code" means files installed by `pnpm shadcn:install`
([package.json:14](package.json#L14)) from the `@agents-ui` shadcn registry
([components.json:20-23](components.json#L20-L23)). Treat it as vendored:
re-running the installer can overwrite local edits, although the CLI asks before
it does (README.md, "Customizing components").

---

## 1. Folder structure

| Path                                                 | What lives there                                                                                                                                                             | Example                                                                                                                       |
| ---------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| `app/`                                               | Next.js App Router. Contains only the root layout, the single page, and one API route.                                                                                       | [app/page.tsx:12](app/page.tsx#L12)                                                                                           |
| `app/api/token/`                                     | `POST` route that mints a LiveKit participant token.                                                                                                                         | [app/api/token/route.ts:24](app/api/token/route.ts#L24)                                                                       |
| `components/app/`                                    | App-specific code written for this project: the `App` shell, the view switcher, the welcome screen, and the theme provider and toggle.                                       | [components/app/view-controller.tsx:34](components/app/view-controller.tsx#L34)                                               |
| `components/agents-ui/`                              | LiveKit Agents UI registry code: audio visualizers (bar, grid, radial, wave, aura), control bar, chat transcript, track toggles, session provider, and a start-audio button. | [components/agents-ui/agent-session-provider.tsx:50](components/agents-ui/agent-session-provider.tsx#L50)                     |
| `components/agents-ui/blocks/agent-session-view-01/` | A registry "block": the whole in-call screen, built from the pieces above. This is the only folder with a barrel `index.ts`.                                                 | [components/agents-ui/blocks/agent-session-view-01/index.ts:1](components/agents-ui/blocks/agent-session-view-01/index.ts#L1) |
| `components/ui/`                                     | shadcn/ui primitives (see §3).                                                                                                                                               | [components/ui/button.tsx:38](components/ui/button.tsx#L38)                                                                   |
| `hooks/agents-ui/`                                   | Registry hooks that pair with `components/agents-ui/` (visualizer animators, control-bar logic).                                                                             | [hooks/agents-ui/use-agent-audio-visualizer-bar.ts:21](hooks/agents-ui/use-agent-audio-visualizer-bar.ts#L21)                 |
| `hooks/` (root)                                      | App-authored hooks: error toasts and debug logging.                                                                                                                          | [hooks/useAgentErrors.tsx:27](hooks/useAgentErrors.tsx#L27)                                                                   |
| `lib/shadcn/`                                        | Only `cn()`. There is no other shared `lib` code.                                                                                                                            | [lib/shadcn/utils.ts:4](lib/shadcn/utils.ts#L4)                                                                               |
| `styles/`                                            | Only `globals.css`: Tailwind entry, theme tokens, base layer.                                                                                                                | [styles/globals.css:1](styles/globals.css#L1)                                                                                 |
| `fonts/`                                             | Local CommitMono `.otf` files loaded with `next/font/local`.                                                                                                                 | [app/layout.tsx:13-38](app/layout.tsx#L13-L38)                                                                                |
| `public/`                                            | LiveKit logos, which the header uses.                                                                                                                                        | [app/layout.tsx:74](app/layout.tsx#L74)                                                                                       |

**Inconsistencies**

- [components.json:8](components.json#L8) points shadcn at `app/globals.css`, but the file is
  actually `styles/globals.css`, imported at [app/layout.tsx:6](app/layout.tsx#L6).
  A shadcn command that writes CSS will target a file that doesn't exist.
- `public/everett-light.woff` and `public/commit-mono-400-regular.woff` are not
  referenced anywhere in `app/`, `components/` or `styles/`.
- `.github/` holds only a CI workflow and README images. It contains no app code.

---

## 2. Component style

### Function declarations vs arrows

The usual form is a named `function` declaration:
[components/app/theme-toggle.tsx:11](components/app/theme-toggle.tsx#L11).

**Inconsistent:** two components use arrow functions:

- `WelcomeView` in [components/app/welcome-view.tsx:26](components/app/welcome-view.tsx#L26)
- `Toaster` in [components/ui/sonner.tsx:13](components/ui/sonner.tsx#L13)

Hooks are mixed in the same way. `useAgentErrors` is a function
([hooks/useAgentErrors.tsx:27](hooks/useAgentErrors.tsx#L27)) and `useDebugMode`
is an arrow ([hooks/useDebug.ts:5](hooks/useDebug.ts#L5)).

### Props typing

- The main pattern is an `interface <Component>Props` declared just above the
  component, with props destructured in the signature:
  [components/app/view-controller.tsx:30-34](components/app/view-controller.tsx#L30-L34).
- To accept DOM props, intersect with `React.ComponentProps<'tag'>`:
  [components/app/welcome-view.tsx:30](components/app/welcome-view.tsx#L30).
- `components/ui/` puts the whole type inline in the signature and adds
  `VariantProps<typeof xVariants>`, with no named Props type:
  [components/ui/button.tsx:44-47](components/ui/button.tsx#L44-L47).
- A `type` alias is used instead of an `interface` when combining library prop
  types. There are 5 of these, against about 25 interfaces:
  [components/agents-ui/agent-session-provider.tsx:14](components/agents-ui/agent-session-provider.tsx#L14).
- Default values are set in the destructuring, not with `defaultProps`:
  [components/agents-ui/blocks/agent-session-view-01/components/audio-visualizer.tsx:37-45](components/agents-ui/blocks/agent-session-view-01/components/audio-visualizer.tsx#L37-L45).
- Refs use React 19's ref-as-prop. There are no `forwardRef` calls:
  [components/app/welcome-view.tsx:29](components/app/welcome-view.tsx#L29).
- Registry code documents each prop with JSDoc. App code does not.
  Compare [agent-session-block.tsx:101-159](components/agents-ui/blocks/agent-session-view-01/components/agent-session-block.tsx#L101-L159)
  with [app.tsx:23-28](components/app/app.tsx#L23-L28).

### Named vs default exports

- **Named exports everywhere**, e.g. [components/app/app.tsx:30](components/app/app.tsx#L30).
- Default exports appear only where Next.js requires them:
  [app/layout.tsx:44](app/layout.tsx#L44) and [app/page.tsx:12](app/page.tsx#L12).
- **Two export styles:**
  - `components/ui/` declares first and exports in one block at the end:
    [components/ui/button.tsx:61](components/ui/button.tsx#L61).
  - `components/app/` and `components/agents-ui/` use inline `export function`:
    [components/agents-ui/start-audio-button.tsx:42](components/agents-ui/start-audio-button.tsx#L42).

### `"use client"`

- **The server/client boundary is `App`.** `app/layout.tsx` and `app/page.tsx`
  are Server Components. `page.tsx` reads server-only env vars (`LIVEKIT_URL`,
  `AGENT_NAME`, and others, which have no `NEXT_PUBLIC_` prefix) and passes the
  results down as props: [app/page.tsx:6-10](app/page.tsx#L6-L10). The first
  client file is [components/app/app.tsx:1](components/app/app.tsx#L1), which
  needs hooks (`useMemo`, `useSession`).
- The directive appears on files that use hooks, context, or browser APIs, e.g.
  `theme-provider.tsx`, which wraps `next-themes`:
  [components/app/theme-provider.tsx:1](components/app/theme-provider.tsx#L1).
- **Inconsistent:** some files use hooks but lack the directive. They work only
  because they are imported from client components:
  - [tile-view.tsx:61](components/agents-ui/blocks/agent-session-view-01/components/tile-view.tsx#L61)
  - [agent-track-toggle.tsx:129](components/agents-ui/agent-track-toggle.tsx#L129)
  - [react-shader-toy.tsx:467](components/agents-ui/react-shader-toy.tsx#L467)
  - [hooks/useAgentErrors.tsx](hooks/useAgentErrors.tsx)

  If you import one of these directly into a Server Component, the build breaks.

### Imports

- Use the `@/` path alias ([tsconfig.json](tsconfig.json), `"@/*": ["./*"]`).
  Relative imports are used only inside a block folder:
  [tile-view.tsx:12](components/agents-ui/blocks/agent-session-view-01/components/tile-view.tsx#L12).
- Import order is enforced by Prettier (see §6).
- **Inconsistent:** code reaches `React` in three ways:
  - the global namespace with no import ([app/layout.tsx:41](app/layout.tsx#L41))
  - `import * as React` ([components/ui/button.tsx:1](components/ui/button.tsx#L1))
  - named imports ([hooks/useAgentErrors.tsx:1](hooks/useAgentErrors.tsx#L1))

---

## 3. Styling

### Tailwind setup

- **Tailwind CSS v4**, configured in CSS with no `tailwind.config.*`. It loads
  through `@tailwindcss/postcss` ([postcss.config.mjs:2](postcss.config.mjs#L2)),
  with `tailwindcss` `^4` in [package.json](package.json).
- The entry point is [styles/globals.css:1-3](styles/globals.css#L1-L3). It
  imports `tailwindcss` and `tw-animate-css`, and adds `@source` for
  `streamdown`.
- Fonts are exposed as CSS variables in [app/layout.tsx:8-38](app/layout.tsx#L8-L38)
  and mapped to `font-sans` and `font-mono` in
  [styles/globals.css:79-84](styles/globals.css#L79-L84).

### `cn()` and class-variance-authority

- `cn(...inputs)` is `twMerge(clsx(inputs))`:
  [lib/shadcn/utils.ts:4-6](lib/shadcn/utils.ts#L4-L6). Use it whenever classes
  are conditional or a `className` prop has to be merged. Put the caller's
  `className` **last** so it wins:
  [components/app/theme-toggle.tsx:16-19](components/app/theme-toggle.tsx#L16-L19).
  Conditional classes use `cond && 'class'`:
  [theme-toggle.tsx:28](components/app/theme-toggle.tsx#L28).
- Class lists can also be arrays, grouped in named objects:
  [tile-view.tsx:21-58](components/agents-ui/blocks/agent-session-view-01/components/tile-view.tsx#L21-L58).
- **cva pattern:** base classes plus `variants` (usually `variant` and/or
  `size`) plus `defaultVariants`. The component applies it as
  `cn(xVariants({ variant, size, className }))` and adds `data-slot` /
  `data-variant` attributes:
  [components/ui/button.tsx:6-58](components/ui/button.tsx#L6-L58). Visualizers
  use cva the same way for their `size` scale:
  [agent-audio-visualizer-bar.tsx:58-92](components/agents-ui/agent-audio-visualizer-bar.tsx#L58-L92).
- **Inconsistent:** the names of cva constants differ (see §6). Some are
  exported, some are module-private.

### shadcn/ui

- Style is `new-york` and base colour is `neutral`, with CSS variables on:
  [components.json:3-12](components.json#L3-L12).
- Components in `components/ui/`:

| File                   | Exports                                                                                        |
| ---------------------- | ---------------------------------------------------------------------------------------------- |
| `alert.tsx`            | `Alert`, `AlertTitle`, `AlertDescription`                                                      |
| `bubble.tsx`           | `BubbleGroup`, `Bubble`, `BubbleContent`, `BubbleReactions`                                    |
| `button.tsx`           | `Button`, `buttonVariants`                                                                     |
| `button-group.tsx`     | `ButtonGroup`, `ButtonGroupSeparator`, `ButtonGroupText`, `buttonGroupVariants`                |
| `marker.tsx`           | `Marker`, `MarkerIcon`, `MarkerContent`, `markerVariants`                                      |
| `message.tsx`          | `MessageGroup`, `Message`, `MessageAvatar`, `MessageContent`, `MessageFooter`, `MessageHeader` |
| `message-scroller.tsx` | `MessageScrollerProvider`, `MessageScroller`, `MessageScrollerViewport`, …                     |
| `select.tsx`           | `Select`, `SelectContent`, `SelectGroup`, …                                                    |
| `separator.tsx`        | `Separator`                                                                                    |
| `sonner.tsx`           | `Toaster`                                                                                      |
| `toggle.tsx`           | `Toggle`, `toggleVariants`                                                                     |
| `tooltip.tsx`          | `Tooltip`, `TooltipTrigger`, `TooltipContent`, `TooltipProvider`                               |

- **Icons are inconsistent.** `components.json` declares `lucide`
  ([components.json:13](components.json#L13)), and `components/ui/` and
  `components/agents-ui/` use `lucide-react`. App code (`app.tsx`,
  `theme-toggle.tsx`, `useAgentErrors.tsx`) uses `@phosphor-icons/react`:
  [components/app/theme-toggle.tsx:4](components/app/theme-toggle.tsx#L4).

### Colour tokens and dark mode

- The tokens follow shadcn naming (`--background`, `--foreground`, `--primary`,
  `--muted`, `--accent`, `--destructive`, `--border`, `--input`, `--ring`,
  `--chart-1…5`, `--sidebar-*`, `--radius`). Light values sit on `:root`
  ([styles/globals.css:7-41](styles/globals.css#L7-L41)). Dark values sit on
  `.dark` ([styles/globals.css:43-76](styles/globals.css#L43-L76)). The neutrals
  are `oklch()` values.
- The brand colour is `--primary`: `#002cf2` in light mode
  ([globals.css:15](styles/globals.css#L15)) and `#1fd5f9` in dark mode
  ([globals.css:50](styles/globals.css#L50)).
- The tokens become utilities (`bg-background`, `text-muted-foreground`, …)
  through `@theme inline`: [styles/globals.css:78-117](styles/globals.css#L78-L117).
  Use the utilities in markup, not raw colours.
- **Dark mode is class-based.** The dark variant is `@custom-variant dark (&:is(.dark *))`
  ([globals.css:5](styles/globals.css#L5)). `next-themes` sets the class
  (`attribute="class"`, `defaultTheme="system"`):
  [app/layout.tsx:60-65](app/layout.tsx#L60-L65). The toggle lives in
  [components/app/theme-toggle.tsx](components/app/theme-toggle.tsx). For
  per-mode assets, use `dark:` variants, e.g. the logo swap at
  [app/layout.tsx:74-80](app/layout.tsx#L74-L80). `resolvedTheme` is also passed
  to the session view as `themeMode` for the aura visualizer:
  [view-controller.tsx:62](components/app/view-controller.tsx#L62).
- **Inconsistencies:**
  - `--primary-hover` is defined ([globals.css:16](styles/globals.css#L16)) but
    is not mapped in `@theme` and not used anywhere.
  - `text-fg0` at [welcome-view.tsx:11](components/app/welcome-view.tsx#L11) is
    not a defined token, so it has no effect. The icon gets its colour from
    inherited `currentColor`.
  - The SACCO "Try asking" box uses `opacity-70` instead of the
    `text-muted-foreground` token:
    [welcome-view.tsx:55](components/app/welcome-view.tsx#L55).

---

## 4. LiveKit usage

### How the session is created and shared

1. **Server picks the token source.** [app/page.tsx:6-10](app/page.tsx#L6-L10)
   checks the options in this order:
   - `LIVEKIT_TOKEN_SERVER_ID` (LiveKit Cloud dev token server)
   - `/api/token` (when `LIVEKIT_URL` is set)
   - the LiveKit homepage-agent endpoint

   It passes `tokenServerId`, `tokenEndpoint` and `agentName` to `<App>`.

2. **Client builds the session.** [components/app/app.tsx:31-39](components/app/app.tsx#L31-L39)
   wraps the choice in `TokenSource.developmentTokenServer(...)` or
   `TokenSource.endpoint(...)` from `livekit-client`, memoised. It then calls
   `useSession(tokenSource, { agentName })` from `@livekit/components-react`.
3. **Session is provided to the tree** by `AgentSessionProvider`
   ([app.tsx:42](components/app/app.tsx#L42)). That provider is
   `SessionProvider` plus a `RoomAudioRenderer` that plays agent audio:
   [agent-session-provider.tsx:50-60](components/agents-ui/agent-session-provider.tsx#L50-L60).
4. **Consumers read it from context:**
   - `useSessionContext()` for `start`, `end` and `isConnected`
     ([view-controller.tsx:35](components/app/view-controller.tsx#L35)). The
     call starts when the welcome button calls `start`
     ([view-controller.tsx:47](components/app/view-controller.tsx#L47)) and ends
     through `AgentControlBar`'s `onDisconnect={session.end}`
     ([agent-session-block.tsx:267](components/agents-ui/blocks/agent-session-view-01/components/agent-session-block.tsx#L267)).
   - `useAgent()` for agent state and connection.
   - `useSessionMessages(session)` for the transcript
     ([agent-session-block.tsx:182](components/agents-ui/blocks/agent-session-view-01/components/agent-session-block.tsx#L182)).
   - `useRoomContext()` for debug logging
     ([hooks/useDebug.ts:6](hooks/useDebug.ts#L6)).
5. **Side-effect hooks** run in the render-nothing `AppSetup` component inside
   the provider: [app.tsx:16-21](components/app/app.tsx#L16-L21).
   - `useDebugMode` turns on verbose logs in development and exposes
     `window.__lk_room`.
   - `useAgentErrors` shows a toast and ends the session when `agent.state === 'failed'`.

### How the token is fetched from `app/api/token`

- `TokenSource.endpoint('/api/token')` makes a `POST`. The route handler is
  [app/api/token/route.ts:24](app/api/token/route.ts#L24). It:
  - **refuses to run outside development**, unless `IS_VERCEL_PREVIEW=true`
    ([route.ts:26-30](app/api/token/route.ts#L26-L30)). Production needs an auth
    layer first.
  - checks `LIVEKIT_URL`, `LIVEKIT_API_KEY` and `LIVEKIT_API_SECRET`
    ([route.ts:33-41](app/api/token/route.ts#L33-L41)).
  - parses `room_config` from the JSON body
    ([route.ts:45-47](app/api/token/route.ts#L45-L47)) and attaches it to the
    token ([route.ts:97-99](app/api/token/route.ts#L97-L99)). `useSession`'s
    `agentName` reaches the server through this field (agent dispatch).
  - creates a random room and identity (`voice_assistant_room_####`), with a
    15-minute TTL and join/publish/subscribe grants
    ([route.ts:51-52](app/api/token/route.ts#L51-L52),
    [route.ts:84-95](app/api/token/route.ts#L84-L95)).
  - returns `{ serverUrl, roomName, participantName, participantToken }` with
    `Cache-Control: no-store`
    ([route.ts:61-70](app/api/token/route.ts#L61-L70)).
- Env vars are documented in [.env.example](.env.example). Local values go in
  `.env.local`, which is git-ignored.

### Components that show agent state and the audio visualizer

- **View switching:** [components/app/view-controller.tsx:40-66](components/app/view-controller.tsx#L40-L66)
  shows `WelcomeView` while disconnected and `AgentSessionView_01` once
  connected, with a `motion` fade.
- **Audio visualizer:**
  - [audio-visualizer.tsx:49](components/agents-ui/blocks/agent-session-view-01/components/audio-visualizer.tsx#L49)
    reads `state` and `audioTrack` from `useVoiceAssistant()`.
  - It then renders one of `AgentAudioVisualizerBar | Wave | Grid | Radial | Aura`
    from `components/agents-ui/`. **The default is `bar` with 5 bars**
    ([audio-visualizer.tsx:37-40](components/agents-ui/blocks/agent-session-view-01/components/audio-visualizer.tsx#L37-L40)),
    and `view-controller.tsx` passes no visualizer props, so the default applies.
  - Each visualizer puts `data-lk-state={state}` on its root and picks its
    animation from the state:
    [agent-audio-visualizer-bar.tsx:189-202](components/agents-ui/agent-audio-visualizer-bar.tsx#L189-L202),
    [agent-audio-visualizer-bar.tsx:221](components/agents-ui/agent-audio-visualizer-bar.tsx#L221).
  - Its placement and the shrink when chat opens (`scale: 0.2`) are handled in
    [tile-view.tsx:137-162](components/agents-ui/blocks/agent-session-view-01/components/tile-view.tsx#L137-L162).
- **Thinking indicator:** `AgentChatTranscript` shows `AgentChatIndicator` when
  `agentState === 'thinking'`:
  [agent-chat-transcript.tsx:146-150](components/agents-ui/agent-chat-transcript.tsx#L146-L150).
- **Pre-connect message:** a shimmer line is shown until the first message:
  [agent-session-block.tsx:247-259](components/agents-ui/blocks/agent-session-view-01/components/agent-session-block.tsx#L247-L259).
  The text depends on `useAgent().isConnected`:
  [view-controller.tsx:55-57](components/app/view-controller.tsx#L55-L57).
- **Controls:** `AgentControlBar`
  ([agent-session-block.tsx:262-269](components/agents-ui/blocks/agent-session-view-01/components/agent-session-block.tsx#L262-L269))
  gets its logic from
  [hooks/agents-ui/use-agent-control-bar.ts](hooks/agents-ui/use-agent-control-bar.ts).
- **Inconsistent:** agent state comes from two hooks.
  - The visualizer uses `useVoiceAssistant()`.
  - The transcript, error toast and view controller use `useAgent()`
    ([agent-session-block.tsx:185](components/agents-ui/blocks/agent-session-view-01/components/agent-session-block.tsx#L185)).

---

## 5. Configuration

**There is no central config file** (no `app-config.ts`). README.md, section
"Configuration", confirms that text and toggles are set directly in the
components that use them:

| Setting                                                             | Where                                                                                  |
| ------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| Page `<title>` ("LiveKit Voice Agent")                              | [app/layout.tsx:56](app/layout.tsx#L56)                                                |
| Meta description                                                    | [app/layout.tsx:57](app/layout.tsx#L57)                                                |
| Header logo, logo link, "Built with LiveKit Agents"                 | [app/layout.tsx:66-93](app/layout.tsx#L66-L93) (images in `public/lk-logo*.svg`)       |
| Welcome tagline                                                     | [components/app/welcome-view.tsx:37](components/app/welcome-view.tsx#L37)              |
| Start button text                                                   | [components/app/view-controller.tsx:46](components/app/view-controller.tsx#L46)        |
| Pre-connect messages                                                | [components/app/view-controller.tsx:56](components/app/view-controller.tsx#L56)        |
| Chat, video, screen-share and pre-connect toggles; visualizer props | [components/app/view-controller.tsx:58-63](components/app/view-controller.tsx#L58-L63) |
| Audio-unblock button label                                          | [components/app/app.tsx:47](components/app/app.tsx#L47)                                |
| Package name (`agent-starter-react`, not shown to users)            | [package.json:2](package.json#L2)                                                      |
| LiveKit credentials, agent name                                     | `.env.local`, documented in [.env.example](.env.example)                               |

**Note:** the title and description are written as raw `<head>` tags instead of
the Next.js `export const metadata` API. There is no `metadata` export anywhere.

---

## 6. Naming and formatting

### Files

- **Components:** kebab-case `.tsx`, e.g. [components/app/view-controller.tsx](components/app/view-controller.tsx).
- **Hooks: inconsistent.**
  - Registry hooks are kebab-case with a `use-` prefix:
    [hooks/agents-ui/use-agent-control-bar.ts](hooks/agents-ui/use-agent-control-bar.ts).
  - App hooks are camelCase: [hooks/useAgentErrors.tsx](hooks/useAgentErrors.tsx).
  - `hooks/useDebug.ts` exports `useDebugMode`, so the file name and export
    name don't match ([useDebug.ts:5](hooks/useDebug.ts#L5)).
  - `useAgentErrors` is `.tsx` because it renders JSX in a toast.
- **Block file names:**
  [agent-session-block.tsx](components/agents-ui/blocks/agent-session-view-01/components/agent-session-block.tsx)
  exports `AgentSessionView_01`, so the file name doesn't match the component.

### Identifiers

- Components use PascalCase and props use `<Component>Props`:
  [theme-toggle.tsx:7-11](components/app/theme-toggle.tsx#L7-L11).
  - Exception: `AgentSessionView_01`, with an underscore
    ([agent-session-block.tsx:161](components/agents-ui/blocks/agent-session-view-01/components/agent-session-block.tsx#L161)).
- `motion.create(...)` wrappers take a `Motion` prefix:
  [view-controller.tsx:9-10](components/app/view-controller.tsx#L9-L10).
- Module constants are SCREAMING_SNAKE_CASE:
  [view-controller.tsx:12](components/app/view-controller.tsx#L12),
  [app.tsx:14](components/app/app.tsx#L14).
  - Exception: `tileViewClassNames` is camelCase
    ([tile-view.tsx:21](components/agents-ui/blocks/agent-session-view-01/components/tile-view.tsx#L21)).
- **cva constants: inconsistent.**
  - `components/ui/` uses camelCase (`buttonVariants`,
    [button.tsx:6](components/ui/button.tsx#L6)).
  - `components/agents-ui/` visualizers use PascalCase
    (`AgentAudioVisualizerBarVariants`,
    [agent-audio-visualizer-bar.tsx:79](components/agents-ui/agent-audio-visualizer-bar.tsx#L79)).
  - `agentTrackToggleVariants` in the same folder is camelCase
    ([agent-track-toggle.tsx:16](components/agents-ui/agent-track-toggle.tsx#L16)).

### Prettier ([.prettierrc](.prettierrc))

- Single quotes, semicolons, `trailingComma: "es5"`, 2-space indent,
  `printWidth: 100`.
- **Import order** (`@trivago/prettier-plugin-sort-imports`):
  1. `react`
  2. `next` and `next/*`
  3. third-party
  4. `@scope/*`
  5. `@/*`
  6. relative

  There are no blank lines between groups, and the names inside each `{}` are
  sorted. Example: [components/app/app.tsx:3-12](components/app/app.tsx#L3-L12).

- **CSS class order** (`prettier-plugin-tailwindcss`) sorts the classes in
  `className="..."` attributes. Two things to know:
  - `tailwindStylesheet` is not set, so the plugin doesn't know the custom
    tokens. Classes like `text-foreground`, `bg-background` and
    `text-muted-foreground` sort to the **front** as unknown classes:
    [app/layout.tsx:82](app/layout.tsx#L82),
    [welcome-view.tsx:62](components/app/welcome-view.tsx#L62). This is
    expected, not a mistake.
  - `tailwindFunctions` is not set, so strings inside `cn(...)` and `cva(...)`
    are **not** sorted automatically.
- ESLint runs Prettier as a rule (`plugin:prettier/recommended`,
  [eslint.config.mjs:13-19](eslint.config.mjs#L13-L19)).

**Inconsistencies found while checking:**

- There are two ESLint configs: [.eslintrc.json](.eslintrc.json) (legacy) and
  [eslint.config.mjs](eslint.config.mjs) (flat, with the import and Prettier
  plugins). ESLint 9 uses the flat one.
- All source files currently have CRLF line endings (`core.autocrlf=true`), and
  Prettier's default is LF. So `pnpm format:check` and ESLint's `prettier/prettier`
  rule flag every file until it is reformatted or line endings are normalised.
- [components/app/welcome-view.tsx:47-58](components/app/welcome-view.tsx#L47-L58)
  (the SACCO "Try asking" box) is not Prettier-formatted: it is under-indented.
  It also fails `react/no-unescaped-entities` because of the raw `"` and `'` on
  lines 50-53.

---

## Where to edit for common changes

### (a) Change the app name and title

- **[app/layout.tsx](app/layout.tsx)** (required):
  - `<title>` at line 56 and the `description` meta at line 57.
  - The header branding at lines 66-93: logo link, `alt` text, and "Built with
    LiveKit Agents".
- Optional, if the name should appear elsewhere:
  - [components/app/welcome-view.tsx:37](components/app/welcome-view.tsx#L37),
    the welcome tagline.
  - `public/lk-logo.svg` and `public/lk-logo-dark.svg`, the logo images.
  - [package.json:2](package.json#L2), the package name. Users never see it.

### (b) Add a section to the welcome screen

- **[components/app/welcome-view.tsx](components/app/welcome-view.tsx)**: add
  markup inside the `<section>` (lines 33-59). For example, put it after the
  "Try asking" box, which ends at line 58, and before `</section>` at line 59.
  This file is enough for static content.
- Edit [components/app/view-controller.tsx:43-48](components/app/view-controller.tsx#L43-L48)
  as well **only** if the new section needs data or callbacks passed in as
  props. Add those props to `WelcomeViewProps` at
  [welcome-view.tsx:21-24](components/app/welcome-view.tsx#L21-L24).

### (c) Make the audio visualizer bars smaller

- **[components/agents-ui/blocks/agent-session-view-01/components/audio-visualizer.tsx](components/agents-ui/blocks/agent-session-view-01/components/audio-visualizer.tsx)**
  - With the current setup (default `bar`, 5 bars) the bar size comes from line
    128: `*:min-h-[64px] *:w-[64px] gap-4` on the container, plus `size = 'xl'`
    at line 127. Reduce those values.
  - Line 150 sets the bar element (`min-h-2.5 w-2.5 rounded-full …`). In the
    5-bar case the container's `*:` classes from line 128 override its width and
    min-height, because Tailwind v4 emits variant utilities after plain ones. If
    you remove the `*:` classes, line 150 controls the size.
- **Alternative with no size edits:** pass `audioVisualizerBarCount` (for
  example `8`) to `MotionSessionView` in
  [components/app/view-controller.tsx:52-64](components/app/view-controller.tsx#L52-L64).
  Counts from 6 to 10 fall into the `lg` tier (32px bars, lines 129-131); higher
  counts go smaller still.
- **Don't** edit `AgentAudioVisualizerBarElementVariants` in
  [agent-audio-visualizer-bar.tsx:58-77](components/agents-ui/agent-audio-visualizer-bar.tsx#L58-L77)
  for this. That cva only applies when no child element is passed, and this app
  passes one (audio-visualizer.tsx:150). It is also registry code that
  `pnpm shadcn:install` can overwrite.
