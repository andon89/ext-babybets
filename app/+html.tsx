import { ScrollViewStyleReset } from "expo-router/html";
import type { PropsWithChildren } from "react";

export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
        <meta name="description" content="Create a baby prediction pool. Friends guess the stats. Reveal the results as a birth announcement." />

        {/* Open Graph */}
        <meta property="og:title" content="Baby Bets" />
        <meta property="og:description" content="Create a baby prediction pool. Friends guess the stats. Reveal the results as a birth announcement." />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Baby Bets" />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Baby Bets" />
        <meta name="twitter:description" content="Create a baby prediction pool. Friends guess the stats. Reveal the results as a birth announcement." />

        {/* Theme */}
        <meta name="theme-color" content="#FFF9F2" />

        <ScrollViewStyleReset />
      </head>
      <body>{children}</body>
    </html>
  );
}
