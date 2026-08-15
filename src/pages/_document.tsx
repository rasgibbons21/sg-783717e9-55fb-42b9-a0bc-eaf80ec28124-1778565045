import { Html, Head, Main, NextScript } from "next/document";
import { SEOElements } from "@/components/SEO";

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <SEOElements />
        
        {/* PWA Meta Tags */}
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#27B7C8" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Bloom" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
        
        {/* Favicon */}
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/icon-192.png" type="image/png" sizes="192x192" />
        <link rel="icon" href="/icon-512.png" type="image/png" sizes="512x512" />

        {/* Google AdSense / AdMob */}
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-app-pub-1507435968246952"
          crossOrigin="anonymous"
        />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
