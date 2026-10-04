import { executeDailyBirthdayCheck } from './index.js';

console.log('Testing 6:00 AM Birthday Automation Dispatcher immediately...');
executeDailyBirthdayCheck().then(result => {
  console.log('Result:', result);
  process.exit(0);
});
