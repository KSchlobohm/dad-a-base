import { createHash } from 'node:crypto'
import { existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import { isAbsolute, relative, resolve, sep } from 'node:path'
import { spawnSync } from 'node:child_process'

const repositoryRoot = process.cwd()
const outputArgument = process.argv[2]

if (!outputArgument) {
  process.stderr.write('Usage: npm run evidence -- <output-directory>\n')
  process.exit(2)
}

const outputDirectory = resolve(outputArgument)
const outputRelativePath = relative(repositoryRoot, outputDirectory)
if (
  outputRelativePath === ''
  || (
    outputRelativePath !== '..'
    && !outputRelativePath.startsWith(`..${sep}`)
    && !isAbsolute(outputRelativePath)
  )
) {
  process.stderr.write('Evidence output directory must be outside the repository.\n')
  process.exit(2)
}
mkdirSync(outputDirectory, { recursive: true })

const commands = [
  runAndCapture('Repository diff validation', 'git', ['diff', 'HEAD', '--check'], 'git-diff-check.log'),
  auditCommittedTree(),
  runAndCapture('Unified quality gate', npmCommand(), ['run', 'check'], 'quality-gate.log', {
    EVIDENCE_DIR: outputDirectory,
  }),
]

const source = {
  head: gitText(['rev-parse', 'HEAD']).trim(),
  fingerprint: workspaceFingerprint(),
}

const requiredArtifacts = [
  'baseline-source.json',
  'baseline-playwright.log',
  'baseline-desktop.png',
  'baseline-mobile.png',
  'characterization-playwright.log',
  'final-desktop.png',
  'final-mobile.png',
  'git-diff-check.log',
  'committed-tree-audit.log',
  'quality-gate.log',
]

const artifactRecords = requiredArtifacts.map((name) => {
  const path = resolve(outputDirectory, name)
  const validation = validateArtifact(name, path)
  return {
    name,
    path,
    exists: validation.exists,
    valid: validation.valid,
    validation: validation.message,
    sha256: existsSync(path) ? hashFile(path) : null,
    bytes: existsSync(path) ? statSync(path).size : 0,
  }
})

const commandSuccess = commands.every((command) => command.exitCode === 0)
const artifactsComplete = artifactRecords.every((artifact) => artifact.valid)
const qualityLog = resolve(outputDirectory, 'quality-gate.log')
const baselineLog = resolve(outputDirectory, 'characterization-playwright.log')

const acceptanceCriteria = [
  criterion('architecture-patterns', 'Relevant Packback and checklist-map patterns are evaluated.', fileExists('docs/architecture.md'), [
    repositoryPath('docs/architecture.md'),
  ]),
  criterion('vite-typescript', 'The app uses Vite, strict TypeScript, and ES modules.', commandSuccess, [
    repositoryPath('vite.config.ts'),
    repositoryPath('tsconfig.json'),
    qualityLog,
  ]),
  criterion('quality-gate', 'Linting, unit tests, build, and browser tests run through one command.', commandSuccess, [
    repositoryPath('package.json'),
    qualityLog,
  ]),
  criterion('ci-deployment', 'Pull requests validate while successful main pushes deploy Pages.', fileExists('.github/workflows/deploy-pages.yml'), [
    repositoryPath('.github/workflows/deploy-pages.yml'),
  ]),
  criterion('project-path', 'The production build loads beneath /dad-a-base/.', commandSuccess, [
    repositoryPath('vite.config.ts'),
    qualityLog,
  ]),
  criterion('behavior-preserved', 'Existing joke content and interactions remain covered.', commandSuccess && baselineIsBoundToSource(), [
    resolve(outputDirectory, 'baseline-source.json'),
    baselineLog,
    repositoryPath('tests/dad-a-base.spec.ts'),
    qualityLog,
  ]),
  criterion('pwa', 'Manifest, installability assets, and offline app shell are implemented and tested.', commandSuccess, [
    repositoryPath('vite.config.ts'),
    repositoryPath('tests/dad-a-base.spec.ts'),
    qualityLog,
  ]),
  criterion('documentation', 'Development, validation, build, and deployment are documented.', fileExists('README.md') && fileExists('docs/manual-smoke-checklist.md'), [
    repositoryPath('README.md'),
    repositoryPath('docs/manual-smoke-checklist.md'),
  ]),
]
const criteriaComplete = acceptanceCriteria.every((criterion) => criterion.status === 'pass')
const localReady = commandSuccess && artifactsComplete && criteriaComplete

const manifest = {
  schemaVersion: 1,
  generatedAt: new Date().toISOString(),
  repository: 'KSchlobohm/dad-a-base',
  scope: 'local-change-readiness',
  verdict: localReady ? 'ready' : 'not-ready',
  source,
  summary: {
    passedCriteria: acceptanceCriteria.filter((item) => item.status === 'pass').length,
    totalCriteria: acceptanceCriteria.length,
    commandsPassed: commands.filter((command) => command.exitCode === 0).length,
    totalCommands: commands.length,
    artifactsPresent: artifactRecords.filter((artifact) => artifact.valid).length,
    totalArtifacts: artifactRecords.length,
  },
  commands,
  acceptanceCriteria,
  artifacts: artifactRecords,
  findings: {
    adopted: [
      'Framework-free Vite and strict TypeScript modules',
      'Pure domain state transitions with unit tests',
      'One local and CI quality gate',
      'GitHub Pages artifact deployment',
      'Generated manifest, offline shell, and prompted updates',
    ],
    rejected: [
      'Browser persistence and data migration',
      'Backup, import, and QR sharing',
      'Accounts, synchronization, analytics, and telemetry',
    ],
  },
  deferredPostDeploymentChecks: [
    'Confirm Pages deployment after the first successful main push.',
    'Exercise installation and prompted updates on current mobile Safari or Chrome.',
  ],
}

const manifestPath = resolve(outputDirectory, 'evidence-manifest.json')
writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`)
process.stdout.write(`${manifest.verdict}: ${manifestPath}\n`)
process.exit(localReady ? 0 : 1)

function runAndCapture(name, command, args, logName, environment = {}) {
  const result = spawnSync(command, args, {
    cwd: repositoryRoot,
    encoding: 'utf8',
    env: { ...process.env, ...environment },
    maxBuffer: 50 * 1024 * 1024,
    shell: process.platform === 'win32',
  })
  const output = `${result.stdout ?? ''}${result.stderr ?? ''}`
  const logPath = resolve(outputDirectory, logName)
  writeFileSync(logPath, output)
  return {
    name,
    command: [command, ...args].join(' '),
    exitCode: result.status ?? 1,
    logPath,
    sha256: hashFile(logPath),
  }
}

function auditCommittedTree() {
  const forbiddenPaths = ['app.js', 'playwright.config.js', 'styles.css']
  const treePaths = new Set(
    gitText(['ls-tree', '-r', '--name-only', 'HEAD'])
      .split(/\r?\n/)
      .filter(Boolean),
  )
  const retained = forbiddenPaths.filter((path) => treePaths.has(path))
  const logPath = resolve(outputDirectory, 'committed-tree-audit.log')
  const output = retained.length === 0
    ? 'PASS: superseded JavaScript entrypoints are absent from the committed tree.\n'
    : `FAIL: committed tree retains ${retained.join(', ')}.\n`
  writeFileSync(logPath, output)

  return {
    name: 'Committed tree audit',
    command: 'git ls-tree -r --name-only HEAD',
    exitCode: retained.length === 0 ? 0 : 1,
    logPath,
    sha256: hashFile(logPath),
  }
}

function workspaceFingerprint() {
  const hash = createHash('sha256')
  hash.update(gitText(['rev-parse', 'HEAD']))
  hash.update(gitText(['diff', '--binary', 'HEAD']))

  const untracked = gitText(['ls-files', '--others', '--exclude-standard', '-z'])
    .split('\0')
    .filter(Boolean)
    .sort()

  for (const relativePath of untracked) {
    hash.update(relativePath)
    hash.update(readFileSync(resolve(repositoryRoot, relativePath)))
  }

  return hash.digest('hex')
}

function gitText(args) {
  const result = spawnSync('git', args, {
    cwd: repositoryRoot,
    encoding: 'utf8',
    maxBuffer: 50 * 1024 * 1024,
  })
  if (result.status !== 0) {
    throw new Error(result.stderr || `git ${args.join(' ')} failed`)
  }
  return result.stdout
}

function hashFile(path) {
  return createHash('sha256').update(readFileSync(path)).digest('hex')
}

function repositoryPath(relativePath) {
  return resolve(repositoryRoot, relativePath)
}

function fileExists(relativePath) {
  return existsSync(repositoryPath(relativePath))
}

function criterion(id, title, passed, evidence) {
  return {
    id,
    title,
    status: passed ? 'pass' : 'fail',
    evidence,
  }
}

function npmCommand() {
  return process.platform === 'win32' ? 'npm.cmd' : 'npm'
}

function validateArtifact(name, path) {
  if (!existsSync(path)) {
    return { exists: false, valid: false, message: 'missing' }
  }

  const bytes = statSync(path).size
  if (name === 'git-diff-check.log') {
    return { exists: true, valid: bytes === 0, message: bytes === 0 ? 'clean diff' : 'diff errors recorded' }
  }
  if (bytes === 0) {
    return { exists: true, valid: false, message: 'empty' }
  }
  if (name.endsWith('.png')) {
    const expectedDimensions = name.includes('mobile')
      ? { width: 375, height: 667 }
      : { width: 1280, height: 720 }
    const png = validatePng(path, expectedDimensions)
    return {
      exists: true,
      valid: png.valid,
      message: png.message,
    }
  }
  if (name === 'baseline-playwright.log') {
    return textContains(path, '11 passed', 'baseline test result')
  }
  if (name === 'characterization-playwright.log') {
    return textContains(path, '15 passed', 'characterization test result')
  }
  if (name === 'quality-gate.log') {
    return textContains(path, 'passed', 'quality-gate test result')
  }
  if (name === 'baseline-source.json') {
    return {
      exists: true,
      valid: baselineIsBoundToSource(),
      message: baselineIsBoundToSource() ? 'bound to baseline revision and artifact hashes' : 'baseline binding mismatch',
    }
  }
  return { exists: true, valid: true, message: 'present' }
}

function textContains(path, expected, description) {
  const valid = readFileSync(path, 'utf8').includes(expected)
  return {
    exists: true,
    valid,
    message: valid ? description : `missing ${description}`,
  }
}

function baselineIsBoundToSource() {
  const metadataPath = resolve(outputDirectory, 'baseline-source.json')
  if (!existsSync(metadataPath)) return false

  try {
    const metadata = JSON.parse(readFileSync(metadataPath, 'utf8'))
    const mergeBase = gitText(['merge-base', 'HEAD', 'origin/main']).trim()
    if (metadata.head !== mergeBase) return false

    const expectedArtifacts = [
      'baseline-playwright.log',
      'baseline-desktop.png',
      'baseline-mobile.png',
      'characterization-playwright.log',
    ]
    const recordedArtifacts = metadata.artifacts
    if (
      !recordedArtifacts
      || typeof recordedArtifacts !== 'object'
      || !expectedArtifacts.every((name) => typeof recordedArtifacts[name] === 'string')
    ) {
      return false
    }

    return expectedArtifacts.every((name) => {
      const path = resolve(outputDirectory, name)
      return existsSync(path) && hashFile(path) === recordedArtifacts[name]
    })
  } catch {
    return false
  }
}

function validatePng(path, expectedDimensions) {
  const buffer = readFileSync(path)
  if (
    buffer.length < 45
    || buffer.subarray(0, 8).toString('hex') !== '89504e470d0a1a0a'
  ) {
    return { valid: false, message: 'invalid PNG signature or length' }
  }

  let offset = 8
  let width = 0
  let height = 0
  let sawHeader = false
  let sawImageData = false
  let sawEnd = false

  while (offset < buffer.length) {
    if (offset + 12 > buffer.length) {
      return { valid: false, message: 'truncated PNG chunk header' }
    }
    const length = buffer.readUInt32BE(offset)
    const chunkEnd = offset + 12 + length
    if (chunkEnd > buffer.length) {
      return { valid: false, message: 'truncated PNG chunk data' }
    }

    const type = buffer.subarray(offset + 4, offset + 8).toString('ascii')
    const data = buffer.subarray(offset + 8, offset + 8 + length)
    const expectedCrc = buffer.readUInt32BE(offset + 8 + length)
    const actualCrc = crc32(buffer.subarray(offset + 4, offset + 8 + length))
    if (actualCrc !== expectedCrc) {
      return { valid: false, message: `invalid ${type} chunk checksum` }
    }

    if (type === 'IHDR') {
      if (sawHeader || length !== 13 || offset !== 8) {
        return { valid: false, message: 'invalid PNG header chunk' }
      }
      sawHeader = true
      width = data.readUInt32BE(0)
      height = data.readUInt32BE(4)
    } else if (type === 'IDAT') {
      sawImageData = true
    } else if (type === 'IEND') {
      if (length !== 0 || chunkEnd !== buffer.length) {
        return { valid: false, message: 'invalid PNG end chunk' }
      }
      sawEnd = true
    }

    offset = chunkEnd
  }

  const valid = sawHeader
    && sawImageData
    && sawEnd
    && width === expectedDimensions.width
    && height === expectedDimensions.height

  return {
    valid,
    message: valid
      ? `valid ${width}x${height} PNG structure`
      : `expected ${expectedDimensions.width}x${expectedDimensions.height} complete PNG, found ${width}x${height}`,
  }
}

function crc32(buffer) {
  let crc = 0xffffffff
  for (const byte of buffer) {
    crc ^= byte
    for (let bit = 0; bit < 8; bit += 1) {
      crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1))
    }
  }
  return (crc ^ 0xffffffff) >>> 0
}
