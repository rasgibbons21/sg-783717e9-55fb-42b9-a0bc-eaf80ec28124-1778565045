import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <meta charSet="utf-8" />
        <link rel="icon" href="/favicon.ico" />
        <meta name="theme-color" content="#25262F" />
      </Head>
      <body className="bg-charcoal text-white">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
