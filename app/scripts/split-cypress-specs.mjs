#!/usr/bin/env node

/**
 * Split Cypress specs across multiple shards for parallel execution
 *
 * Usage:
 *   node split-cypress-specs.mjs --shards 4 --shard 1
 *
 * This script:
 * 1. Finds all Cypress spec files in cypress/e2e
 * 2. Sorts them alphabetically
 * 3. Distributes them round-robin across N shards
 * 4. Outputs a comma-separated list of specs for the given shard
 */

import { globSync } from 'glob'
import { resolve, relative } from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Parse command line arguments
const args = process.argv.slice(2)
let totalShards = 4
let currentShard = 1

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--shards' && args[i + 1]) {
    totalShards = parseInt(args[i + 1], 10)
  }
  if (args[i] === '--shard' && args[i + 1]) {
    currentShard = parseInt(args[i + 1], 10)
  }
}

// Validate inputs
if (currentShard < 1 || currentShard > totalShards) {
  console.error(`Error: shard must be between 1 and ${totalShards}`)
  process.exit(1)
}

// Find all spec files
const specPattern = 'cypress/e2e/**/*.{cy,spec}.{js,jsx,ts,tsx}'
const cwd = resolve(__dirname, '..')
const specs = globSync(specPattern, { cwd })
  .map(spec => relative(cwd, resolve(cwd, spec)))
  .sort()

if (specs.length === 0) {
  console.error('No Cypress specs found')
  process.exit(0)
}

// Distribute specs round-robin
const specsForShard = specs.filter((_, index) => {
  return (index % totalShards) === (currentShard - 1)
})

if (specsForShard.length === 0) {
  // No specs for this shard - exit gracefully
  process.exit(0)
}

// Output comma-separated list
console.log(specsForShard.join(','))
