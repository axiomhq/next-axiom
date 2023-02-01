import { LogEvent } from "../logger";

export default interface Transport {
    log(event: LogEvent): Promise<void>;
    flush(): Promise<void>;
}
