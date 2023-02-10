import config, { isVercel, Version } from '../config';
import { LogEvent } from '../logger';
import { throttle } from '../shared';
import Transport from './transport';

export default class FetchTransport implements Transport {
  public url = config.getLogsEndpoint();
  public logEvents: LogEvent[] = [];
  throttledSendLogs = throttle(this.sendLogs, 1000);

  constructor() {}

  async log(event: LogEvent): Promise<void> {
    this.logEvents.push(event);
    this.throttledSendLogs()
    return Promise.resolve();
  }

  async sendLogs() {
    if (!this.logEvents.length) {
      return
    }

    const method = 'POST';
    const keepalive = true;
    const body = JSON.stringify(this.logEvents);
    // clear pending logs
    this.logEvents = [];
    // fire request to ingest logs
    const headers = {
      'Content-Type': 'application/json',
      'User-Agent': 'next-axiom/v' + Version,
    };
    if (config.token) {
      headers['Authorization'] = `Bearer ${config.token}`;
    }
    const reqOptions: RequestInit = { body, method, keepalive, headers };

    // Do not leak network errors; does not affect the running app
    const sendFallback = () => fetch(this.url, reqOptions).catch(console.error);

    try {
      if (typeof fetch === 'undefined') {
        const fetch = await require('whatwg-fetch');
        fetch(this.url, reqOptions).catch(console.error);
      } else if (config.isBrowser && isVercel && navigator.sendBeacon) {
        // sendBeacon fails if message size is greater than 64kb, so
        // we fall back to fetch.
        if (!navigator.sendBeacon(this.url, body)) {
          await sendFallback();
        }
      } else {
        await sendFallback();
      }
    } catch (e) {
      console.error(`Failed to send logs to Axiom: ${e}`);
    }
  }

  flush = () => this.sendLogs();
}
