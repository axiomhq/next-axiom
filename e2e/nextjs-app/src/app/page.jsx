
import { Logger } from 'next-axiom'
import Link from 'next/link'

export default async function Home() {
  const log = new Logger();
  log.info('AXIOM/NEXT::SERVER_COMPONENT_LOG')

  await log.flush()
  return (
    <div>
      <h4>RSC Page</h4>
      <Link href="/log_client">Client Component</Link>
    </div>
  )
}
