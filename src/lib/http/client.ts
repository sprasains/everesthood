import axios, { AxiosRequestConfig, AxiosError } from 'axios';

export interface HttpClientOptions extends AxiosRequestConfig {
  retries?: number;
  retryDelayMs?: number;
  timeoutMs?: number;
}

export async function httpRequest<T = any>(
  config: HttpClientOptions
): Promise<T> {
  const {
    retries = 3,
    retryDelayMs = 300,
    timeoutMs = 10000,
    ...axiosConfig
  } = config;

  let attempt = 0;
  let lastError: AxiosError | null = null;

  while (attempt <= retries) {
    try {
      const resp = await axios({ ...axiosConfig, timeout: timeoutMs });
      return resp.data;
    } catch (err) {
      lastError = err as AxiosError;
      if (attempt === retries) throw lastError;
      await new Promise((res) =>
        setTimeout(res, retryDelayMs * Math.pow(2, attempt))
      );
      attempt++;
    }
  }
  throw lastError;
}
