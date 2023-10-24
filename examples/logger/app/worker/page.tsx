'use client'
import { useEffect, useRef, useCallback } from 'react'
import styles from '../page.module.css';

export default function WorkerPage() {
  const workerRef = useRef<Worker>()

  useEffect(() => {
    workerRef.current = new Worker(new URL('../../worker.ts', import.meta.url))
    workerRef.current.onmessage = (event: MessageEvent<number>) =>
      alert(`WebWorker Response => ${event.data}`)
    return () => {
      workerRef.current?.terminate()
    }
  }, [])

  const handleWork = useCallback(async () => {
    workerRef.current?.postMessage(100000)
  }, [])

  return (
    <main className={styles.main}>
      <p>Do work in a WebWorker!</p>
      <button onClick={handleWork}>Send Logs to Axiom</button>
    </main>
  )
}
