// bull-board-server.js
// Standalone Express server for Bull-Board dashboard
const express = require('express');
const { createBullBoard } = require('@bull-board/api');
const { BullMQAdapter } = require('@bull-board/api/bullMQAdapter');
const { ExpressAdapter } = require('@bull-board/express');
const { getAgentJobQueue } = require('./lib/redis');

(async () => {
  const app = express();
  const serverAdapter = new ExpressAdapter();
  serverAdapter.setBasePath('/admin/queues');
  const queue = await getAgentJobQueue();
  createBullBoard({
    queues: [new BullMQAdapter(queue)],
    serverAdapter
  });
  // TODO: Add authentication middleware here
  app.use('/admin/queues', serverAdapter.getRouter());
  app.listen(3009, () => {
    console.log('Bull-Board dashboard running at http://localhost:3009/admin/queues');
  });
})();
