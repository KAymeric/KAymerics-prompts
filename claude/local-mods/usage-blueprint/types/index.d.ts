export type Limit = { percentUsed: number; resetsAt?: string }

export type Snapshot = {
  tokens?: number
  window: number
  percent?: number
  fiveHour?: Limit
  weekly?: Limit
  costUsd?: number
  model?: string
}

declare module 'claude-code' {
  interface PluginState {
    'usage-blueprint': { snapshot: Snapshot | null; isHidden: boolean }
  }
}
