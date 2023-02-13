import Transport from '../logging/transport';
import { LogEvent } from '../logging/logger';
import { isBrowser } from '../platform';

export const isNoPrettyPrint = process.env.AXIOM_NO_PRETTY_PRINT == 'true' ? true : false;

const levelColors = {
  info: {
    terminal: '32',
    browser: 'lightgreen',
  },
  debug: {
    terminal: '36',
    browser: 'lightblue',
  },
  warn: {
    terminal: '33',
    browser: 'yellow',
  },
  error: {
    terminal: '31',
    browser: 'red',
  },
};

export default class ConsoleTransport implements Transport {
  log(event: LogEvent): Promise<void> {
    this.prettyPrint(event);
    return Promise.resolve();
  }

  prettyPrint(ev: LogEvent) {
    const hasFields = Object.keys(ev.fields).length > 0;
    // check whether pretty print is disabled
    if (isNoPrettyPrint) {
      let msg = `${ev.level} - ${ev.message}`;
      if (hasFields) {
        msg += ' ' + JSON.stringify(ev.fields);
      }
      console.log(msg);
      return;
    }
    // print indented message, instead of [object]
    // We use the %o modifier instead of JSON.stringify because stringify will print the
    // object as normal text, it loses all the functionality the browser gives for viewing
    // objects in the console, such as expanding and collapsing the object.
    let msgString = '';
    let args: any[] = [ev.level, ev.message];

    if (isBrowser) {
      msgString = '%c%s - %s';
      args = [`color: ${levelColors[ev.level].browser};`, ...args];
    } else {
      msgString = `\x1b[${levelColors[ev.level].terminal}m%s\x1b[0m - %s`;
    }
    // we check if the fields object is not empty, otherwise its printed as <empty string>
    // or just "".
    if (hasFields) {
      msgString += ' %o';
      args.push(ev.fields);
    }

    if (ev.request) {
      msgString += ' %o';
      args.push(ev.request);
    }

    console.log.apply(console, [msgString, ...args]);
  }

  flush = () => Promise.resolve();
}
