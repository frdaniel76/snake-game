// Node.js script to run the simulator headlessly
// We need to mock the browser environment minimally

// The simulator only uses grid.js, levels.js, config.js — no DOM needed
import { simulateAll } from '../js/simulator.js';

const results = simulateAll();

console.log('\n=== LEVEL SIMULATOR RESULTS ===\n');
console.log('ID | Name                    | World | Solvable | Steps | Food | Reason');
console.log('---|-------------------------|-------|----------|-------|------|-------');

let pass = 0, fail = 0;
for (const r of results) {
  const status = r.solvable ? '  ✓  ' : '  ✗  ';
  const name = r.name.padEnd(23);
  const reason = r.reason || '';
  console.log(`${String(r.id).padStart(2)} | ${name} | ${r.world}     | ${status}  | ${String(r.steps || 0).padStart(4)}  | ${String(r.foodEaten || 0).padStart(3)}  | ${reason}`);
  if (r.solvable) pass++; else fail++;
}

console.log(`\nTotal: ${results.length} | Pass: ${pass} | Fail: ${fail}`);
if (fail > 0) process.exit(1);
