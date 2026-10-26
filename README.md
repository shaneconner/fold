# pi-fold

[![npm](https://img.shields.io/npm/v/pi-fold)](https://www.npmjs.com/package/pi-fold) [![DOI](https://zenodo.org/badge/DOI/10.5281/zenodo.22142456.svg)](https://doi.org/10.5281/zenodo.22142456)

**Long sessions without forgetting.** pi-fold rotates stale context out of the window and into short briefs, while the exact originals stay on disk one tool call away. It runs automatically, keeps your prefix cache warm, and never throws anything away.

![pi-fold folding a session in place: marks outline completed spans as the session works, and the marks commit together at a fold event](https://raw.githubusercontent.com/shaneconner/fold/main/media/fold-demo.gif)

## Install

```sh
pi install npm:pi-fold
```

Requires Node 22+ and Pi 0.83+ (Pi 1.0 needs Node 22.19+). MIT licensed.

For the best results, pair it with a long-term memory store such as [pi-canon](https://github.com/shaneconner/canon). Folding keeps the window lean; the store keeps what the session learned. Together they were the strongest setup in every benchmark.

## Why fold instead of compact

Compaction replaces the transcript with a summary and discards the originals. Folding replaces old spans with briefs and keeps the originals retrievable, so nothing is ever lost.

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/shaneconner/fold/main/media/fold-vs-compaction-dark.svg">
  <img alt="Compaction turns the transcript into a summary and discards the originals, so the session starts over. pi-fold turns it into a brief and keeps the exact originals on disk, one peek or expand away, so the session keeps going." src="https://raw.githubusercontent.com/shaneconner/fold/main/media/fold-vs-compaction-light.svg">
</picture>

On a 64-stage coding assignment over the curl codebase, followed by a 16-question recall test about the whole session:

| Setup | Recall | Cost | Wall clock |
| --- | ---: | ---: | ---: |
| Compaction | 4 / 16 | $151 | 6.9h |
| Compaction + memory store | 14 / 16 | $202 | 9.0h |
| **pi-fold + memory store** | **14 / 16** | **$101** | **5.2h** |

Same recall, half the cost, and hours faster. The savings come from the cache: folding batches its rewrites so the provider replays the cached prefix instead of rereading the session from scratch, and roughly 95% of input in the pi-fold run was served from cache.

Full write-ups, data and logs are on Zenodo ([design](https://doi.org/10.5281/zenodo.21856873), [working memory](https://doi.org/10.5281/zenodo.21980746), [retrieval](https://doi.org/10.5281/zenodo.22142454), [rotation and retention](https://doi.org/10.5281/zenodo.22142456)), with friendlier versions on [Medium](https://medium.com/@shane.conner/a-compaction-summary-is-one-record-doing-a-stores-job-3f46212ef059) and [shaneconner.com](https://shaneconner.com/projects/pi-fold/).

## What you get

- **Automatic folding.** Completed work is marked as it finishes and folded when the window fills up. The agent doesn't have to do anything.
- **Lossless recall.** Every brief links back to the original messages, verified by hash. The agent can `peek` at them or `expand` them back in place.
- **A cache-friendly cadence.** Marks cost nothing. All of them land together in one commit, so the cache is spent once per commit instead of on every change.
- **A clean chat.** Folded spans collapse into a single muted row in the chat, so your screen matches what the model actually sees.
- **The fold bar.** A compact usage bar above Pi's footer shows how full the window is and what's in it, from deeply folded to still raw.

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/shaneconner/fold/main/media/fold-bar-dark.svg">
  <img alt="A single full-height usage bar. Colours group consolidated folds, span folds, tool folds, marked content, raw context and pinned content in that order. The suffix shows percentage, commit point, and fold, mark, and pin counts." src="https://raw.githubusercontent.com/shaneconner/fold/main/media/fold-bar-light.svg">
</picture>

## Commands

| Command | What it does |
| --- | --- |
| `/fold-status` | Detailed token and fold figures |
| `/fold` | Commit every pending mark now |
| `/fold-editor` | Interactive map of the window, for reading inside folds |
| `/fold-settings` | Edit options live; saved to `~/.config/pi-fold/settings.json` |

The agent gets one tool, `pi_fold_context`, with actions to `status`, `peek`, `expand`, `refold`, `pin` and `unpin` content, plus `brief`, `reboundary` and `unmark` for curating pending folds. It's all optional; a session that never calls the tool still folds.

## Configuration

The defaults are the benchmarked setup, so there's nothing you need to tune.

| Option | Default | What it controls |
| --- | --- | --- |
| `thresholds` | `{ maxTarget: 0.80, minTarget: 0.20, consolidateAfter: 10, minFoldChars: 8000 }` | When a commit fires (`maxTarget`), how far it folds down (`minTarget`), when folds consolidate, and the smallest span worth folding |
| `providerInputBudget` | from Pi's context window | The token budget folding works within |
| `blacklistAutoFoldTools` | `new Set()` | Tools whose results should never be auto-folded |
| `toolFoldThreshold` | `0.50` | Oldest share of the window where tool results are clipped in view (`0` turns it off) |
| `preCommitNotice` | `false` | Tell the agent when a commit is approaching |
| `noticeLeadShare` | `0.10` | How early that notice arrives |
| `palette` | `{ map: "batlow", start: 0, end: 1 }` | Fold bar colours: `batlow`, `viridis`, `plasma`, `magma` or `cividis` |

## How it works

**Prefix caches are positional.** A provider replays the longest byte-identical prefix of a prompt, so changing one early byte invalidates everything after it. pi-fold only rewrites the window at a commit; everything else is a pure append.

**Marks, then commits.** As each tool batch or chapter finishes, the runtime marks it as a fold candidate. A mark lives outside the window, so it changes nothing and costs nothing. When the window reaches `maxTarget`, a single commit folds the stalest marks into briefs until it's back down to `minTarget`, leaving recent work raw.

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/shaneconner/fold/main/media/marks-and-commits-dark.svg">
  <img alt="A completed unit becomes a pending mark that leaves the window and its cached prefix untouched. Marks repeat for free below maxTarget; at maxTarget one commit applies every standing mark in a single rewrite. From the brief, peek appends verified history without thinking blocks and expand restores the original messages in place." src="https://raw.githubusercontent.com/shaneconner/fold/main/media/marks-and-commits-light.svg">
</picture>

**Peek and expand.** `peek` appends a verified, plain-text view of a fold's originals (without thinking blocks or provider metadata) for one turn, then steps aside. `expand` restores the original messages in place until the fold is refolded.

**Plays well with Pi.** Pi's own compaction stays enabled underneath. Threshold compaction is skipped because folding gets there first, overflow is recovered by folding and retrying, and manual `/compact` still works as an escape hatch.

## Prior work

pi-fold builds on lossless hierarchical compaction ([LCM, arXiv:2605.04050](https://arxiv.org/abs/2605.04050)) and agentic context management ([Letta](https://github.com/letta-ai/letta), [arXiv:2510.11967](https://arxiv.org/abs/2510.11967)); see also [arXiv:2607.00692](https://arxiv.org/abs/2607.00692). Its contribution is the cache-aware commit: stage every fold as a free mark, then pay for the rewrite once.
