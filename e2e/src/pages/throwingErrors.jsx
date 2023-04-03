'use client';
import { log } from 'next-axiom'

export default function Page() {
  log.error('without exception', {
    message: 'error message'
  })

try {
    throw new Error('This is a test error');
} catch (error) {
  console.log(JSON.stringify(error))
  console.log(error instanceof Error)
    log.error('scenario1', { error });
    log.error('scenario2', error);
    log.error('scenario3', { with: 'other arguemnts', error });
    log.error('scenario4', { with: 'other arguemnts', ...error });
    log.error('scenario5', { ...error });
}
log.flush();

  return (
    <div>
      <h1>Hello, World!</h1>
    </div>
  )
}
