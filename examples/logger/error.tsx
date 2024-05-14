'use client';

import { useLogger } from 'next-axiom';

export default function Error({
  error,
}: {
  error: Error & { digest?: string };
}) {
  const log = useLogger();
  log.error(error.message, {
    error: error.name,
    cause: error.cause,
    stack: error.stack,
    digest: error.digest,
  });

  return (
    <div className="p-8">
      Ops! An Error has occurred:{' '}
      <p className="text-red-400 px-8 py-2 text-lg">`{error.message}`</p>
    </div>
  );
}
