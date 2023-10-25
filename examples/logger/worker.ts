// This is a module worker, so we can use imports (in the browser too!)
import { log } from 'next-axiom';

addEventListener('message', async (event: MessageEvent<number>) => {
    log.info("fired from worker")
    log.info(event.data.toString())
    await log.flush()
    postMessage('done')
})
