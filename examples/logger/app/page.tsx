'use client';

import styles from './page.module.css';
import Link from 'next/link';
import { useLogger } from 'next-axiom';

function Home() {
  const logger = useLogger();

  logger.info('Hello from client', { foo: 'bar' });

  const logFromEventHandler = () => {
    logger.info('Hello from event handler', { foo: 'bar' });
  };

  return (
    <main className={styles.main}>
      <h1>
        <Link href="/rsc">RSC Page</Link>
      </h1>
      <h1>
        <Link href="/worker">Worker</Link>
      </h1>
      <button onClick={logFromEventHandler}>Log from event handler</button>
    </main>
  );
}

export default Home;
