import Transport from "../logging/transport";
import { LogEvent } from '../logging/logger'

export default class LogDrainTransport implements Transport {
    log(event: LogEvent): Promise<void> {
        console.log(JSON.stringify(event))
        return Promise.resolve()
    }

    flush = () => Promise.resolve()
}
