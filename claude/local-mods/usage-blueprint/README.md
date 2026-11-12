# usage-blueprint

Draws a live band above the Claude Code prompt with the session's context tokens
(e.g. `66 000 / 200 000`), the rolling 5-hour usage window, the weekly limit (with
time until each resets) and the estimated cost of the session in dollars. Bars turn
yellow past 70 % and red past 90 %. Type `/usage-band` to hide or show it.
