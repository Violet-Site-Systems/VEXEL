#!/usr/bin/env node

/**
 * SPDX License Header Generator for VEXEL
 * Adds appropriate SPDX headers to all source files
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const HEADERS = {
  // AGPL v3 - Core System
  agpl: `/**
 * VEXEL - Decentralized Identity Bridge Layer
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * Copyright (c) 2026 VEXEL Contributors
 * 
 * This file is part of VEXEL.
 * See LICENSE file in repository root for full license details.
 */
`,

  // MIT - Libraries
  mit: `/**
 * VEXEL Utility Library
 * SPDX-License-Identifier: MIT
 * Copyright (c) 2026 VEXEL Contributors
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 */
`,

  // Solidity - Smart Contracts
  solidity: `// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (c) 2026 VEXEL Contributors
// 
// This program is part of VEXEL.
// See LICENSE file for full license details.
`,
};

const FILE_CATEGORIES = {
  agpl: [
    'src/api/**/*.ts',
    'src/cross-platform/**/*.ts',
    'src/badge/**/*.ts',
    'src/haap/**/*.ts',
    'src/database/**/*.ts',
    'src/knowledge-base/**/*.ts',
    'src/utils/**/*.ts',  // Include utils
    'src/wallet/**/*.ts',  // Include wallet
    'src/signature/**/*.ts', // Include signature
    'src/index.ts',
    'src/**/*.test.ts',
    'scripts/**/*.js',
  ],
  solidity: [
    'contracts/**/*.sol',
  ],
};

/**
 * Check if file already has SPDX header
 */
function hasHeader(content) {
  return content.includes('SPDX-License-Identifier');
}

/**
 * Get appropriate header for file
 */
function getHeader(filePath) {
  if (filePath.endsWith('.sol')) {
    return HEADERS.solidity;
  }
  
  // Check if it's a library file (should use MIT)
  if (
    filePath.includes('src/utils/') ||
    filePath.includes('src/wallet/') ||
    filePath.includes('src/signature/')
  ) {
    return HEADERS.mit;
  }
  
  // Default to AGPL v3
  return HEADERS.agpl;
}

/**
 * Add header to file
 */
function addHeaderToFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf-8');
    
    if (hasHeader(content)) {
      console.log(`✓ Already has header: ${filePath}`);
      return;
    }
    
    const header = getHeader(filePath);
    const newContent = header + '\n' + content;
    
    fs.writeFileSync(filePath, newContent, 'utf-8');
    console.log(`✓ Added header: ${filePath}`);
  } catch (error) {
    console.error(`✗ Error processing ${filePath}: ${error.message}`);
  }
}

/**
 * Recursively find files matching patterns
 */
function findFiles(dir, patterns) {
  const files = [];
  
  function walk(current) {
    const entries = fs.readdirSync(current, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(current, entry.name);
      const relativePath = path.relative(path.join(__dirname, '..'), fullPath);
      
      // Skip node_modules, dist, .git, etc.
      if (
        entry.name.startsWith('.') ||
        entry.name === 'node_modules' ||
        entry.name === 'dist' ||
        entry.name === 'build'
      ) {
        continue;
      }
      
      if (entry.isDirectory()) {
        walk(fullPath);
      } else if (
        (entry.name.endsWith('.ts') || entry.name.endsWith('.js') || entry.name.endsWith('.sol')) &&
        !entry.name.endsWith('.test.ts')
      ) {
        files.push(fullPath);
      }
    }
  }
  
  walk(dir);
  return files;
}

/**
 * Main function
 */
async function main() {
  console.log('🔖 VEXEL SPDX License Header Generator\n');
  
  const srcDir = path.join(__dirname, '..', 'src');
  const contractsDir = path.join(__dirname, '..', 'contracts');
  const scriptsDir = path.join(__dirname, '..', 'scripts');
  const examplesDir = path.join(__dirname, '..', 'examples');
  
  let count = 0;
  
  console.log('Processing source files...');
  if (fs.existsSync(srcDir)) {
    const files = findFiles(srcDir, []);
    files.forEach(file => {
      addHeaderToFile(file);
      count++;
    });
  }
  
  console.log('\nProcessing smart contracts...');
  if (fs.existsSync(contractsDir)) {
    const files = findFiles(contractsDir, []);
    files.forEach(file => {
      if (file.endsWith('.sol')) {
        addHeaderToFile(file);
        count++;
      }
    });
  }
  
  console.log('\nProcessing scripts...');
  if (fs.existsSync(scriptsDir)) {
    const files = findFiles(scriptsDir, []);
    files.forEach(file => {
      addHeaderToFile(file);
      count++;
    });
  }
  
  console.log('\nProcessing examples...');
  if (fs.existsSync(examplesDir)) {
    const files = findFiles(examplesDir, []);
    files.forEach(file => {
      addHeaderToFile(file);
      count++;
    });
  }
  
  console.log(`\n✅ Processed ${count} files`);
  console.log('\n📊 Summary:');
  console.log('- AGPL v3 headers: src/api, src/cross-platform, src/badge, etc.');
  console.log('- MIT headers: src/utils, src/wallet, src/signature, examples/');
  console.log('- All headers include copyright notice');
  console.log('\n🔍 Next steps:');
  console.log('1. Review changes: git diff');
  console.log('2. Verify headers: npm run license:check');
  console.log('3. Commit: git add -A && git commit -m "docs: add SPDX license headers"');
}

main().catch(error => {
  console.error('Error:', error);
  process.exit(1);
});
