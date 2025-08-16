// bull-board-server.js
// Standalone Express server for Bull-Board dashboard
const express = require('express');
const { createBullBoard } = require('@bull-board/api');
const { BullMQAdapter } = require('@bull-board/api/bullMQAdapter');
const { ExpressAdapter } = require('@bull-board/express');
const { agentJobQueue } = require('./lib/queue');
const jwt = require('jsonwebtoken'); // npm install jsonwebtoken
const crypto = require('crypto');

(async () => {
  const app = express();

  // Add CORS and security headers
  app.use((req, res, next) => {
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Referrer-Policy', 'no-referrer');
    res.setHeader('Content-Security-Policy', "default-src 'self'");
    next();
  });

  // Request logging with correlation ID
  app.use((req, res, next) => {
    req.correlationId = crypto.randomUUID();
    console.log(`[${req.correlationId}] ${req.method} ${req.url}`);
    next();
  });

  const serverAdapter = new ExpressAdapter();
  serverAdapter.setBasePath('/admin/queues');
  createBullBoard({
    queues: [new BullMQAdapter(agentJobQueue)],
    serverAdapter
  });

  // Hardened JWT authentication middleware
  function authenticateUser(req, res, next) {
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
      console.warn(`[${req.correlationId}] Missing Authorization header`);
      return res.status(401).send('Missing Authorization header');
    }
    const token = authHeader.replace('Bearer ', '');
    try {
      const user = jwt.verify(token, process.env.JWT_SECRET);
      // Optionally enforce admin role
      if (!user || !user.role || user.role !== 'admin') {
        console.warn(`[${req.correlationId}] Unauthorized role`);
        return res.status(403).send('Forbidden: Admins only');
      }
      req.user = user;
      next();
    } catch (err) {
      console.error(`[${req.correlationId}] JWT error:`, err.message);
      return res.status(401).send('Invalid or expired token');
    }
  }

  // Robust per-user job filtering
  function filterJobsByUserId(req, res, next) {
    const userId = req.user && req.user.id;
    if (!userId) {
      console.warn(`[${req.correlationId}] User not authenticated`);
      return res.status(401).send('User not authenticated');
    }
    const origGetJobs = BullMQAdapter.prototype.getJobs;
    BullMQAdapter.prototype.getJobs = async function (...args) {
      const jobs = await origGetJobs.apply(this, args);
      // Only show jobs for this user, or all if admin
      if (req.user.role === 'admin') return jobs;
      return jobs.filter(job => job.data && job.data.userId === userId);
    };
    next();
  }

  app.use('/admin/queues', authenticateUser, filterJobsByUserId, serverAdapter.getRouter());

  app.listen(3009, () => {
    console.log('Bull-Board dashboard running at http://localhost:3009/admin/queues');
    console.log('Access requires valid JWT token in Authorization header.');
  });
})();
