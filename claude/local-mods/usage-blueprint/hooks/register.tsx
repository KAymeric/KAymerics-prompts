import { atom, read, update } from 'claude-code'
import type { Register, SessionRateLimit, SessionUsage } from 'claude-code'

import type { Limit, Snapshot } from '../types'

const snapshot = atom({ plugin: 'usage-blueprint', key: 'snapshot' } as const, null)
const isHidden = atom({ plugin: 'usage-blueprint', key: 'isHidden' } as const, false)

// The terminal keeps the roomy layout; the app gets the one-line compact one.
const ROOMY = {
  barWidth: 10, full: '█', empty: '░', gap: 3, isWrapped: true,
  labels: { ctx: 'Tokens', week: 'Semaine', cost: 'Coût' },
  tokens: (n: number) => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ' '),
  separator: ' / ', percent: (n: number) => String(n), minutes: 'min',
}

const COMPACT = {
  barWidth: 5, full: '▰', empty: '▱', gap: 2, isWrapped: false,
  labels: { ctx: 'Ctx', week: 'Sem', cost: '' },
  // 66000 -> "66k", 1000000 -> "1M"
  tokens: (n: number) =>
    n >= 1e6 ? `${+(n / 1e6).toFixed(1)}M` : n >= 1e3 ? `${Math.round(n / 1e3)}k` : String(Math.round(n)),
  separator: '/', percent: (n: number) => String(Math.round(n)), minutes: 'm',
}

type Layout = typeof ROOMY

const limitOf = (limits: SessionRateLimit[], kind: string): Limit | undefined => {
  const found = limits.find(l => l.kind === kind)

  return found && { percentUsed: found.percentUsed, resetsAt: found.resetsAt }
}

// "claude-opus-5-5[1m]" -> "Opus 5.5 (1M)", "fable" -> "Fable"
const modelName = (id: string) => {
  const isLong = /\[1m\]/i.test(id)
  const parts = id.replace(/\[.*?\]/g, '').replace(/^claude-/, '').split('-').filter(p => !/^\d{8}$/.test(p))
  const words = parts.filter(p => !/^\d+$/.test(p)).map(w => w.charAt(0).toUpperCase() + w.slice(1))
  const version = parts.filter(p => /^\d+$/.test(p)).join('.')

  return [...words, version].filter(Boolean).join(' ') + (isLong ? ' (1M)' : '')
}

const toSnapshot = (u: Pick<SessionUsage, 'context' | 'rateLimits' | 'cost'>, model: string): Snapshot => ({
  tokens: u.context.tokens,
  window: u.context.window,
  percent: u.context.percent,
  fiveHour: limitOf(u.rateLimits, 'five_hour'),
  weekly: limitOf(u.rateLimits, 'seven_day'),
  costUsd: u.cost?.usd,
  model: modelName(model),
})

const bar = (percent: number, l: Layout) => {
  const filled = Math.max(0, Math.min(l.barWidth, Math.round((percent / 100) * l.barWidth)))

  return l.full.repeat(filled) + l.empty.repeat(l.barWidth - filled)
}

const colorOf = (percent: number) => (percent >= 90 ? 'red' : percent >= 70 ? 'yellow' : 'green')

const untilReset = (resetsAt: string | undefined, now: number, l: Layout) => {
  if (!resetsAt) return ''
  const minutes = Math.max(0, Math.round((Date.parse(resetsAt) - now) / 60000))
  if (Number.isNaN(minutes)) return ''
  const days = Math.floor(minutes / 1440)
  const hours = Math.floor((minutes % 1440) / 60)
  const rest = minutes % 60

  return days > 0 ? `↻${days}j${hours}h` : hours > 0 ? `↻${hours}h${String(rest).padStart(2, '0')}` : `↻${rest}${l.minutes}`
}

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    await $.command.register({
      name: 'usage-band',
      description: 'Show or hide the usage band (tokens, 5h window, week, cost)',
    })
    const usage = await $.session.usage()
    const model = await $.session.model()
    await update($, snapshot, () => toSnapshot(usage, model))

    return next(e)
  })

  on('session.measure', async ($, e, next) => {
    const model = await $.session.model()
    await update($, snapshot, () => toSnapshot(e, model))

    return next(e)
  })

  on('command.run', { command: 'usage-band' }, async $ => {
    const wasHidden = await read($, isHidden)
    await update($, isHidden, () => !wasHidden)

    return { text: wasHidden ? 'Usage band shown.' : 'Usage band hidden (/usage-band to bring it back).' }
  }).catch(($, e, next) => (next.called ? next(e) : { text: 'usage-blueprint: toggle failed.' }))

  on('ui.render', { component: 'AbovePrompt' }, async ($, e, next) => {
    const s = await read($, snapshot)

    if (e.props.hasSurvey || s === null || (await read($, isHidden))) {
      return next(e)
    }

    const { Box, Text } = $.ui.resolve(e)
    const now = await $.clock.now()
    const ctxPercent = s.percent ?? 0
    const lay: Layout = e.surface === 'terminal' ? ROOMY : COMPACT

    const limit = (label: string, l: Limit | undefined) =>
      l ? (
        <Text>
          <Text dimColor>{label} </Text>
          <Text color={colorOf(l.percentUsed)}>{bar(l.percentUsed, lay)}</Text>
          <Text bold> {lay.percent(l.percentUsed)}%</Text>
          <Text dimColor>{l.resetsAt ? ' ' : ''}{untilReset(l.resetsAt, now, lay)}</Text>
        </Text>
      ) : (
        <Text dimColor>{label} n/a</Text>
      )

    return (
      <Box flexDirection="row" gap={lay.gap} flexWrap={lay.isWrapped ? 'wrap' : 'nowrap'}>
        {lay === ROOMY && s.model ? (
          <Text>
            <Text dimColor>Modèle </Text>
            <Text bold color="magenta">{s.model}</Text>
          </Text>
        ) : null}
        <Text>
          <Text dimColor>{lay.labels.ctx} </Text>
          <Text color={colorOf(ctxPercent)}>{bar(ctxPercent, lay)}</Text>
          <Text bold> {s.tokens === undefined ? '—' : lay.tokens(s.tokens)}</Text>
          <Text dimColor>{lay.separator}{lay.tokens(s.window)}</Text>
        </Text>
        {limit('5h', s.fiveHour)}
        {limit(lay.labels.week, s.weekly)}
        <Text>
          {lay.labels.cost ? <Text dimColor>{lay.labels.cost} </Text> : null}
          <Text bold>{s.costUsd === undefined ? '—' : `$${s.costUsd.toFixed(2)}`}</Text>
        </Text>
      </Box>
    )
  })
}
