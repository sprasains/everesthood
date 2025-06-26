import { fetchAndStoreJobs } from '../src/lib/jobFetcher';

(async () => {
  await fetchAndStoreJobs();
  process.exit(0);
})();
