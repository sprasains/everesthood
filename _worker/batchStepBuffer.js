// worker/batchStepBuffer.js
// Simple in-memory buffer for batching AgentRunStep DB writes

class StepBuffer {
  constructor(prisma, flushSize = 10, flushMs = 1000) {
    this.prisma = prisma;
    this.buffer = [];
    this.flushSize = flushSize;
    this.flushMs = flushMs;
    this.timer = null;
  }

  add(step) {
    this.buffer.push(step);
    if (this.buffer.length >= this.flushSize) {
      this.flush();
    } else if (!this.timer) {
      this.timer = setTimeout(() => this.flush(), this.flushMs);
    }
  }

  async flush() {
    if (this.buffer.length === 0) return;
    const toWrite = this.buffer;
    this.buffer = [];
    clearTimeout(this.timer);
    this.timer = null;
    try {
      await this.prisma.agentRunStep.createMany({ data: toWrite });
    } catch (err) {
      // fallback: write individually if batch fails
      for (const step of toWrite) {
        try { await this.prisma.agentRunStep.create({ data: step }); } catch {}
      }
    }
  }
}

module.exports = StepBuffer;
