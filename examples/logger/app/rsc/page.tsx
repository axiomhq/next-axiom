
import Image from 'next/image';
import { Inter } from 'next/font/google';
import styles from '../page.module.css';
import { Logger } from 'next-axiom';
import Link from 'next/link';

const inter = Inter({ subsets: ['latin'] });

async function AxiomLoggerPage() {
  const logger = new Logger();
  logger.info('RSC', { foo: 'bar' });

  await logger.flush();

  return (
    <main className={styles.main}>
     <h1><Link href="/">Home</Link></h1>
    </main>
  );
}

export default AxiomLoggerPage;