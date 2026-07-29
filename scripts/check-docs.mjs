import { readFileSync } from 'node:fs'

const packageJson = JSON.parse(readFileSync('package.json', 'utf8'))
const readme = readFileSync('README.md', 'utf8')
const changelog = readFileSync('CHANGELOG.md', 'utf8')
const errors = []

if (!readme.includes(`version-${packageJson.version}-`)) {
  errors.push(`README version badge must match package version ${packageJson.version}.`)
}

if (!changelog.includes(`## [${packageJson.version}]`)) {
  errors.push(`CHANGELOG must include version ${packageJson.version}.`)
}

if (/\b(?:draft|in review|pending)\b/i.test(readme)) {
  errors.push('README must not contain temporary workflow states (draft, in review, or pending).')
}

if (errors.length) {
  console.error(errors.join('\n'))
  process.exit(1)
}

console.log(`Documentation is consistent for version ${packageJson.version}.`)
