// bull-board-server.js
// Standalone Express server for Bull-Board dashboard
const express = require('express');
const { createBullBoard } = require('@bull-board/api');
const { BullMQAdapter } = require('@bull-board/api/bullMQAdapter');
const { ExpressAdapter } = require('@bull-board/express');
const { agentJobQueue } = require('./lib/queue');
const jwt = require('jsonwebtoken'); // npm install jsonwebtoken

(async () => {
  const app = express();
  const serverAdapter = new ExpressAdapter();
  serverAdapter.setBasePath('/admin/queues');
  // Use the centralized queue instance
  createBullBoard({
    queues: [new BullMQAdapter(agentJobQueue)],
    serverAdapter
  });
  // Middleware to authenticate user via JWT (or adapt to your session system)
  function authenticateUser(req, res, next) {
    const authHeader = req.headers['authorization'];
    if (!authHeader) return res.status(401).send('Missing Authorization header');
    const token = authHeader.replace('Bearer ', '');
    try {
      const user = jwt.verify(token, process.env.JWT_SECRET);
      req.user = user;
      next();
    } catch (err) {
      return res.status(401).send('Invalid or expired token');
    }
  }

  // Custom Bull-Board job filtering middleware
  function filterJobsByUserId(req, res, next) {
    const userId = req.user && req.user.id;
    if (!userId) return res.status(401).send('User not authenticated');
    // Patch BullMQAdapter to filter jobs by userId in job data
    const origGetJobs = BullMQAdapter.prototype.getJobs;
    BullMQAdapter.prototype.getJobs = async function (...args) {
      const jobs = await origGetJobs.apply(this, args);
      return jobs.filter(job => job.data && job.data.userId === userId);
    };
    next();
  }

  // Replace admin secret middleware with JWT auth and job filter
  app.use('/admin/queues', authenticateUser, filterJobsByUserId, serverAdapter.getRouter());
  app.listen(3009, () => {
    console.log('Bull-Board dashboard running at http://localhost:3009/admin/queues');
    console.log('Access requires valid JWT token in Authorization header.');
  });
})();
