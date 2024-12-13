# Remove edge report and http request for Vercel

On [#250](https://github.com/axiomhq/next-axiom/pull/250) 

1. We removed a seemingly unused `logEdgeReport` function that tests revealed wasn't actually being processed in Axiom.
2. We decided to conditionally fire the `logHttpRequest` function only when the Vercel integration is not enabled. We did this because we were seeing duplicate logs being ingested in Axiom.
   
authors: [@gabrielelpidio](https://github.com/gabrielelpidio) [@dasfmi](https://github.com/dasfmi)
