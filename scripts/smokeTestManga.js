#!/usr/bin/env node
import mangaService from '../src/config/mangaService.js';

(async () => {
  console.log('Starting mangaService.createManga smoke test...');
  try {
    const res = await mangaService.createManga({
      title: 'SMOKE TEST - Do not keep',
      author: 'SmokeTester',
      coverUrl: 'https://example.com/smoke-cover.jpg',
      createdBy: 'smoke-test-script'
    });
    console.log('createManga result:', JSON.stringify(res, null, 2));
    process.exit(0);
  } catch (err) {
    console.error('Error during smoke test:', err && (err.message || err));
    process.exit(2);
  }
})();