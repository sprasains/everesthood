export class AgentRunError extends Error {
  constructor(
    public type:
      | 'CONFIGURATION_ERROR'
      | 'INSUFFICIENT_CREDITS'
      | 'EXECUTION_ERROR',
    message: string
  ) {
    super(message);
    this.name = 'AgentRunError';
  }
}

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class ConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ConfigurationError';
  }
}

export class InsufficientCreditsError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InsufficientCreditsError';
  }
}

export class ExecutionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ExecutionError';
  }
}
