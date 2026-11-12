import { expect, test } from 'claude-code/testing'

const BAND = {
  plugin: 'usage-blueprint',
  component: 'AbovePrompt',
  props: { hasSurvey: false },
} as const

test('roomy in the terminal, compact in the app', async ($, on) => {
  on('command.register', () => ({ value: { command: 'usage-band' } }))
  on('session.usage', () => ({
    value: {
      startedAt: 0,
      context: { tokens: 66000, window: 200000, percent: 33 },
      rateLimits: [
        { kind: 'five_hour', percentUsed: 23.5 },
        { kind: 'seven_day', percentUsed: 71 },
      ],
      cost: { usd: 1.234 },
    },
  }))
  on('session.start', (_, e) => ({ cwd: e.cwd }))
  on('clock.now', () => ({ value: 0 }))
  on('session.model', () => ({ value: 'claude-opus-5-5' }))

  await $.session.start({ cwd: '/', surface: 'terminal', isInteractive: true })

  const terminal = await $.ui.mount({ ...BAND, surface: 'terminal' })
  expect((await terminal.find({ type: 'Text', text: /66 000/ }))?.text).toContain('200 000')
  expect(await terminal.find({ type: 'Text', text: /23\.5%/ })).toBeTruthy()
  expect(await terminal.find({ type: 'Text', text: /Semaine/ })).toBeTruthy()
  expect(await terminal.find({ type: 'Text', text: /^Opus 5\.5$/ })).toBeTruthy()
  await terminal.unmount()

  const desktop = await $.ui.mount({ ...BAND, surface: 'desktop' })
  expect((await desktop.find({ type: 'Text', text: /66k/ }))?.text).toContain('200k')
  expect(await desktop.find({ type: 'Text', text: /24%/ })).toBeTruthy()
  expect(await desktop.find({ type: 'Text', text: /\$1\.23/ })).toBeTruthy()
  expect(await desktop.find({ type: 'Text', text: /Opus/ })).toBeFalsy()
  await desktop.unmount()
})
