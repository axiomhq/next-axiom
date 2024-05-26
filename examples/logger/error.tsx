"use client";

import NavTable from "@/components/NavTable";
import { LogLevel } from "@/next-axiom/logger";
import { useLogger } from "next-axiom";
import { usePathname } from "next/navigation";

export default function ErrorPage({
  error,
}: {
  error: Error & { digest?: string };
}) {
  const pathname = usePathname()
  const log = useLogger({ source: "error.tsx" });
  let status =  error.message == 'Invalid URL' ? 404 : 500;

  log.logHttpRequest(
    LogLevel.error,
    error.message,
    {
      host: window.location.href,
      path: pathname,
      statusCode: status,
    },
    {
      error: error.name,
      cause: error.cause,
      stack: error.stack,
      digest: error.digest,
    },
  );

  return (
    <div>
      Ops! An Error has occurred:{" "}
    </div>
  );
}
