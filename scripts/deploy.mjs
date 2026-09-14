#!/usr/bin/env node
//
// Build, commit and publish the blog in one move.
//
//   npm run deploy              # the normal path
//   npm run deploy -- --dry     # show what would happen, change nothing
//   npm run deploy -- --yes     # skip the confirmation prompt
//   npm run deploy -- -m "msg"  # supply the commit message up front
//
// The point of this over a bare `git push` is the order: it builds FIRST and
// refuses to push if the build fails. Pushing is publishing — the Action
// rebuilds and deploys whatever lands on main — so a build that only breaks
// on the runner is a broken site you find out about from a red tick in your
// inbox. Better to find out here, where nothing has left the machine.
//
// It also prints which posts will be public before you agree, because
// `draft: true` is one line and forgetting it is how a test post ends up on
// the live site.

import { spawnSync } from 'node:child_process';
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createInterface } from 'node:readline/promises';
import { stdin, stdout } from 'node:process';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
// The live site. Cloudflare Pages (connected via Cloudflare's GitHub App)
// builds from main and serves this at the domain root. The GitHub Pages
// workflow still mirrors to jakecor.github.io/blog/ on the same push, but
// that is a legacy copy nobody points at — don't report it as the result.
const SITE = 'https://jacobcorcoran.com/';

const argv = process.argv.slice(2);
const DRY = argv.includes('--dry');
const YES = argv.includes('--yes') || argv.includes('-y');
const mIndex = argv.findIndex((a) => a === '-m' || a === '--message');
const MESSAGE = mIndex !== -1 ? argv[mIndex + 1] : null;

const bold = (s) => `[1m${s}[0m`;
const dim = (s) => `[2m${s}[0m`;
const red = (s) => `[31m${s}[0m`;
const green = (s) => `[32m${s}[0m`;
const amber = (s) => `[33m${s}[0m`;

// No shell, anywhere. On Windows `shell: true` concatenates arguments rather
// than escaping them (Node DEP0190), so a commit message containing a quote
// or an & would be mangled before git ever saw it — and the message is the
// one argument here that is genuinely arbitrary text.
//
// The usual reason people reach for the shell on Windows is that npx and npm
// are .cmd shims, which Node refuses to spawn directly. Nothing here needs
// them: git, gh and node are all real executables, and Eleventy's bin is a
// plain .cjs that node can run itself. So the shell never enters into it.
function run(cmd, args, opts = {}) {
  return spawnSync(cmd, args, { cwd: ROOT, encoding: 'utf8', ...opts });
}

const ELEVENTY = join(ROOT, 'node_modules', '@11ty', 'eleventy', 'cmd.cjs');

function git(...args) {
  const r = run('git', args);
  return (r.stdout || '').trim();
}

function die(msg, detail) {
  console.error('\n' + red('✗ ') + msg);
  if (detail) console.error(dim(String(detail).trimEnd()));
  process.exit(1);
}

function has(cmd) {
  const probe = process.platform === 'win32' ? 'where' : 'which';
  return run(probe, [cmd]).status === 0;
}

/* ------------------------------------------------------------------ *
 * 1. Sanity
 * ------------------------------------------------------------------ */
if (!existsSync(join(ROOT, 'eleventy.config.js'))) {
  die('This does not look like the blog folder — no eleventy.config.js.');
}

const branch = git('rev-parse', '--abbrev-ref', 'HEAD');
if (branch !== 'main') {
  die(
    `On branch "${branch}", but only main deploys.`,
    'The workflow triggers on push to main. Switch branch, or merge first.'
  );
}

/* ------------------------------------------------------------------ *
 * 2. Build before anything leaves the machine
 * ------------------------------------------------------------------ */
if (!existsSync(ELEVENTY)) {
  die('Eleventy is not installed here.', 'Run: npm ci');
}

console.log(bold('\nBuilding…'));
const build = run(process.execPath, [ELEVENTY], { stdio: 'pipe' });
if (build.status !== 0) {
  die(
    'Build failed — nothing pushed.',
    (build.stdout || '') + (build.stderr || '')
  );
}
const wrote = (build.stdout || '').match(/Wrote \d+ files? in [\d.]+ seconds/);
console.log(green('✓ ') + (wrote ? wrote[0] : 'built'));

/* ------------------------------------------------------------------ *
 * 3. What will actually be public
 * ------------------------------------------------------------------ */
const POSTS = join(ROOT, 'src', 'posts');
const live = [];
const drafts = [];
for (const name of readdirSync(POSTS).sort()) {
  if (!name.endsWith('.md')) continue;
  const raw = readFileSync(join(POSTS, name), 'utf8');
  const fm = /^---[ \t]*\r?\n([\s\S]*?)\r?\n---/.exec(raw);
  const isDraft = fm ? /^\s*draft:\s*true\s*$/m.test(fm[1]) : false;
  const title = fm ? (/^\s*title:\s*(.+)$/m.exec(fm[1]) || [, name])[1] : name;
  (isDraft ? drafts : live).push({ name, title: title.replace(/^["']|["']$/g, '') });
}

// Anything not yet committed is new to the live site, which is the case worth
// looking at twice — it is how a throwaway test post gets published.
const tracked = new Set(
  git('ls-files', 'src/posts').split('\n').filter(Boolean).map((p) => p.split('/').pop())
);
const newlyPublic = live.filter((p) => !tracked.has(p.name));

console.log(bold(`\nWill be public (${live.length})`));
for (const p of live) {
  const flag = newlyPublic.includes(p) ? amber('  ← new') : '';
  console.log(`  ${p.title}${flag}`);
}
if (drafts.length) {
  console.log(dim(`\nHeld back as drafts (${drafts.length})`));
  for (const p of drafts) console.log(dim(`  ${p.title}`));
}

/* ------------------------------------------------------------------ *
 * 4. What is actually going up
 * ------------------------------------------------------------------ */
const dirty = git('status', '--porcelain');
const ahead = git('log', 'origin/main..main', '--oneline');

if (!dirty && !ahead) {
  console.log(green('\n✓ Nothing to deploy — everything is already published.'));
  process.exit(0);
}

if (dirty) {
  console.log(bold('\nUncommitted changes'));
  console.log(dirty.split('\n').map((l) => '  ' + l).join('\n'));
}
if (ahead) {
  console.log(bold('\nCommitted but not yet pushed'));
  console.log(ahead.split('\n').map((l) => '  ' + l).join('\n'));
}

if (DRY) {
  console.log(dim('\n--dry: stopping here, nothing committed or pushed.'));
  process.exit(0);
}

/* ------------------------------------------------------------------ *
 * 5. Commit and push
 * ------------------------------------------------------------------ */
const rl = createInterface({ input: stdin, output: stdout });

if (dirty) {
  let message = MESSAGE;
  if (!message) {
    const suggestion = newlyPublic.length === 1
      ? `Add ${newlyPublic[0].title}`
      : 'Update posts';
    const answer = await rl.question(`\nCommit message ${dim(`[${suggestion}]`)}: `);
    message = answer.trim() || suggestion;
  }
  if (!YES) {
    const ok = await rl.question(`Commit everything above and publish? ${dim('[y/N]')} `);
    if (!/^y(es)?$/i.test(ok.trim())) {
      rl.close();
      console.log(dim('Stopped. Nothing committed.'));
      process.exit(0);
    }
  }
  const add = run('git', ['add', '-A']);
  if (add.status !== 0) { rl.close(); die('git add failed', add.stderr); }
  const commit = run('git', ['commit', '-m', message]);
  if (commit.status !== 0) { rl.close(); die('git commit failed', commit.stderr); }
  console.log(green('✓ ') + 'committed');
} else if (!YES) {
  const ok = await rl.question(`\nPush the commits above and publish? ${dim('[y/N]')} `);
  if (!/^y(es)?$/i.test(ok.trim())) {
    rl.close();
    console.log(dim('Stopped. Nothing pushed.'));
    process.exit(0);
  }
}
rl.close();

console.log(bold('\nPushing…'));
const push = run('git', ['push', 'origin', 'main']);
if (push.status !== 0) die('Push failed.', push.stderr);
console.log(green('✓ ') + 'pushed');

/* ------------------------------------------------------------------ *
 * 6. Follow the deploy, if gh is available
 * ------------------------------------------------------------------ */
if (!has('gh')) {
  console.log(`\nGitHub Actions is building it now.`);
  console.log(`Watch:  https://github.com/jakecor/blog/actions`);
  console.log(`Live:   ${SITE}`);
  process.exit(0);
}

console.log(bold('\nWaiting for GitHub Actions…'));
await new Promise((r) => setTimeout(r, 6000));
const id = run('gh', ['run', 'list', '--limit', '1', '--json', 'databaseId',
  '--jq', '.[0].databaseId']).stdout.trim();
if (!id) {
  console.log(dim('Could not find the run; check the Actions tab.'));
  console.log(`Live: ${SITE}`);
  process.exit(0);
}

const watch = run('gh', ['run', 'watch', id, '--exit-status', '--interval', '5'],
  { stdio: 'ignore' });
if (watch.status !== 0) {
  console.error(red('\n✗ The deploy failed.'));
  console.error(`  gh run view ${id} --log-failed`);
  console.error(dim('  The live site is untouched — Pages keeps serving the last good deploy.'));
  process.exit(1);
}

console.log(green('\n✓ Published.') + `  ${SITE}`);
