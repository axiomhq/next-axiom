'use client';
import { useLogger } from 'next-axiom';
import Link from 'next/link';

export default async function Home() {
  const log = useLogger();
  log.debug('AXIOM/NEXT::FRONTEND_LOG');

  await log.flush();
  return (
    <div>
      <h4>Client Page</h4>
      <Link href="/">RSC Component</Link>
    </div>
  )
}
