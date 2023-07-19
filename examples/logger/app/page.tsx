'use client';

import styles from './page.module.css';
import Link from 'next/link';
import { useLogger } from 'next-axiom/hooks';

function Home() {
  const logger = useLogger();
 
  logger.info('Hello from client', { foo: 'bar' });

  return (
    <main className={styles.main}>
      <h1><Link href="/rsc">RSC Page</Link></h1>
    </main>
  );
}

export default Home;