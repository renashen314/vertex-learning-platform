# PostHog Self-driving setup report

## Summary

PostHog Self-driving is configured for Vertex. Session Replay, Error Tracking, and Support were enabled; health, error, and support ticket signal sources were enabled; and a focused five-scout troop plus two Replay Vision monitors is armed.

The project has no recordings or established product-data baseline yet. Fresh scout configurations are picked up within about 30 minutes, and findings will start appearing in the [Self-driving inbox](https://us.posthog.com/project/577117/inbox) within about 30 minutes once the application receives real traffic.

## AI data processing

Approved by the organization-level setup gate.

## GitHub

The PostHog GitHub App was already connected before this setup. GitHub Issues was not selected as a Self-driving responder, so no GitHub Issues warehouse source or responder was added.

## Products enabled

| Product | Result | App check |
| --- | --- | --- |
| Session Replay | enabled | `instrumentation-client.ts` initializes `posthog-js` without disabling session recording. |
| Error Tracking | enabled | `instrumentation-client.ts` enables exception capture; `app/global-error.tsx` captures global errors. |
| Support | enabled | An inbound Support channel is still required before tickets can arrive. |

## Signal sources

| Signal source | Action | Notes |
| --- | --- | --- |
| `signals_scout` / `cross_source_issue` | enabled by server default | No row was created because the server treats a missing row as enabled. |
| `health_checks` / `health_issue` | enabled | Created source config `01a06314-36a9-7f9e-9b31-f70fab4f3025`. |
| `error_tracking` / `issue_created` | enabled | Created source config `01a06314-3712-70a0-aeb5-3e817a9330bf`. |
| `error_tracking` / `issue_reopened` | enabled | Created source config `01a06314-36b3-7908-a583-ac8df005efcf`. |
| `error_tracking` / `issue_spiking` | enabled | Created source config `01a06314-3663-7fbe-84b3-b847ea6ab44b`. |
| `conversations` / `ticket` | enabled | Created source config `01a06314-377a-7bcb-85c2-3161c5c4e04b`; it stays idle until an inbound channel is connected. |
| Session Replay native source | skipped | Replay reaches the inbox through the Replay Vision monitors below; the retired session-analysis source was not created. |

## Connected tools

No connected-tool responder was selected. GitHub Issues, Linear, Jira, Sentry, and Zendesk were presented with the draft-PR billing notice and declined as not used for this setup. No external warehouse source was created or enabled.

## Scout troop

The confirmed daily budget is **100 runs**, with **0 used today** and **100 remaining**. The PostHog early-access notice says: “Scouts are in early access. Each project gets up to 100 scout runs a day. Contact team-self-driving@posthog.com if you need more.”

### Enabled scouts (5)

| Scout | Why it is active |
| --- | --- |
| `signals-scout-general` | Cross-product correlations and uncovered surfaces. |
| `signals-scout-product-analytics` | Vertex records course discovery and learning-path engagement events. |
| `signals-scout-web-analytics` | Vertex is a Next.js web application with catalog and course routes. |
| `signals-scout-course-discovery-start-health` | Custom monitor for browse-to-start volume and conversion health. |
| `signals-scout-learning-path-engagement-depth` | Custom monitor for course-start-to-content engagement depth. |

### Disabled scouts (24)

| Scout | Reason |
| --- | --- |
| `signals-scout-ai-observability` | No LLM observability events or SDK usage was found. |
| `signals-scout-anomaly-detection` | No established saved-insight or dashboard baseline is available yet. |
| `signals-scout-apm` | No tracing or APM surface was found. |
| `signals-scout-conversations` | Support tickets are covered by the enabled native Support source. |
| `signals-scout-csp-violations` | No CSP reporting configuration was found. |
| `signals-scout-customer-analytics` | No account or group analytics surface was found. |
| `signals-scout-data-pipelines` | No CDP, export, or Hog Flow surface was found. |
| `signals-scout-data-warehouse` | No warehouse source was selected or connected. |
| `signals-scout-error-tracking` | Error issues are covered by the enabled native Error Tracking sources. |
| `signals-scout-experiments` | No active experiment evidence was found. |
| `signals-scout-feature-flags` | No active feature-flag evidence was found. |
| `signals-scout-health-checks` | Setup health is covered by the enabled native health source. |
| `signals-scout-inbox-validation` | No resolved Self-driving reports exist to validate yet. |
| `signals-scout-insight-alerts` | No configured insight-alert surface was found. |
| `signals-scout-logs` | No PostHog Logs surface was found. |
| `signals-scout-mcp-tool-calls` | No project MCP telemetry surface was found. |
| `signals-scout-observability-gaps` | There is not yet a stable event-volume baseline to assess. |
| `signals-scout-replay-vision` | No earlier scanner observations existed; it remains separate from the newly armed monitors. |
| `signals-scout-revenue-analytics` | No payment SDK or revenue-data surface was found. |
| `signals-scout-session-replay` | Session Replay is covered by the Replay Vision monitors below. |
| `signals-scout-skills-store` | Skill-store hygiene is not a primary Vertex product surface. |
| `signals-scout-surveys` | No surveys exist or were found in the application. |
| `signals-scout-tasks` | No PostHog Tasks surface was found. |
| `signals-scout-web-vitals` | No established web-vitals stream was found. |

## Custom scouts

Both proposed custom scouts were approved and created with the default daily schedule, enabled state, and inbox emission.

| Scout | What it watches | Discriminator and gap covered |
| --- | --- | --- |
| `signals-scout-course-discovery-start-health` | Catalog selection and course-start health, grounded in `CourseCard` and `CourseHero`. | A persistent entry-volume cliff or browse-to-start regression with enough entrants. It covers entry-volume collapse, which the built-in product-analytics scout does not necessarily fire on when conversion rates hold. |
| `signals-scout-learning-path-engagement-depth` | Progress from course start into module exploration and lesson selection, grounded in `CourseContent`. | A sustained fall in the share of starters reaching content, with a volume floor. It makes Vertex’s course-and-lesson path explicit rather than relying on a generic saved flow. |

The following surfaces were considered and ruled out: error tracking and session replay already have their dedicated native/Replay Vision routes; revenue, AI observability, surveys, flags, experiments, logs, CSP, APM, and warehouse pipelines lack repo or server evidence.

If either custom scout becomes noisy, set its `emit` configuration to `false` in PostHog to run it in dry-run mode without sending findings to the inbox.

## Replay Vision scanners

A scanner is an LLM that watches individual session recordings on a schedule and pushes high-confidence observations to the Self-driving inbox. It is the only setup component here that spends Replay Vision quota. Scanner findings arrive at half weight and need independent corroboration before promotion into a report.

| Brief | Status | What it watches | Query scope | Sampling | Estimated spend |
| --- | --- | --- | --- | --- | --- |
| Breakage monitor | created: **Course start and lesson navigation breakage** | Visible course-card/detail loading problems, failed start actions, modules that do not expand, lesson navigation failures, and obscured progress controls. | Sessions visiting `/courses/`, the course detail route where learners begin learning. | 50% | 0 observations / 0 credits monthly at creation. |
| Frustration monitor | created: **Course browsing and learning frustration** | Clear repeated interaction, retries, hunting, or abandonment around course browsing and learning controls. | `$rageclick` sessions only; no URL scope was added. | 100% | 0 observations / 0 credits monthly at creation. |

No recordings existed when the monitors were configured, so both are armed and will begin observing when recordings arrive. The in-product scanner-sizing guide was unavailable in this deployment, so organization-level Replay Vision quota could not be independently checked; the creation responses reported zero estimated observations and credits on the current empty recording population.

## Files created

- `posthog-self-driving-report.md` — this setup record.
- `.claude/skills/replay-vision-setup/` — installed Replay Vision setup skill.
- `.claude/skills/replay-vision-scanners-core/` — installed shared scanner mechanics.
- `.claude/skills/replay-vision-scanner-broken-experiences/` — installed breakage-monitor brief.
- `.claude/skills/replay-vision-scanner-user-frustration/` — installed frustration-monitor brief.

No application source files were modified.

## Follow-ups

- [ ] Connect an inbound Support channel (email, inbox, or Slack) in PostHog so the enabled Support responder can receive tickets.
- [ ] Deploy or visit the application with production-like traffic so session recordings and product-event baselines can begin accumulating.
- [ ] Re-check the custom scouts after enough real traffic arrives; this setup’s MCP connection could not read the event schema, so their first runs should confirm the current event taxonomy.
- [ ] Optionally enable a currently disabled specialist later if Vertex adopts that surface, such as surveys, feature flags, experiments, revenue analytics, or web vitals.

## What happens next

The scout coordinator picks up fresh configurations within roughly 30 minutes and each run uses the project’s daily budget. Findings cluster into reports in the [Self-driving inbox](https://us.posthog.com/project/577117/inbox), where immediately actionable reports can begin coding tasks.
