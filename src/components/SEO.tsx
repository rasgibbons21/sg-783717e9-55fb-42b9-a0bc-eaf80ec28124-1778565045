import Head from "next/head";
import { useRouter } from "next/router";

export interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: string;
  jsonLd?: Record<string, unknown>;
}

const SITE_URL = "https://shebloomswealth.app";
const SITE_NAME = "She Blooms Wealth";

const defaultSEO = {
  title: "She Blooms Wealth — Free Financial Education for Women",
  description:
    "Learn investing, budgeting, and side hustles with Pansy, your friendly AI guide. 150+ plain-language lessons, paper trading simulator, budget tracker, and certificate. Built for women. No jargon.",
  image: `${SITE_URL}/og-image.jpg`,
  url: SITE_URL,
};

export function SEOElements() {
  return (
    <>
      <meta charSet="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <title>{defaultSEO.title}</title>
      <meta name="description" content={defaultSEO.description} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:locale" content="en_US" />
      <meta property="og:title" content={defaultSEO.title} />
      <meta property="og:description" content={defaultSEO.description} />
      <meta property="og:image" content={defaultSEO.image} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:url" content={defaultSEO.url} />
      <meta property="og:type" content="website" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={defaultSEO.title} />
      <meta name="twitter:description" content={defaultSEO.description} />
      <meta name="twitter:image" content={defaultSEO.image} />
    </>
  );
}

export function SEO({ title, description, image, url, type, jsonLd }: SEOProps) {
  const router = useRouter();
  const seoTitle = title || defaultSEO.title;
  const seoDescription = description || defaultSEO.description;
  const seoImage = image
    ? image.startsWith("http")
      ? image
      : `${SITE_URL}${image}`
    : defaultSEO.image;
  const canonicalUrl = url || `${SITE_URL}${router.asPath.split("?")[0]}`;

  return (
    <Head>
      <title>{seoTitle}</title>
      <meta name="description" content={seoDescription} />
      <link rel="canonical" href={canonicalUrl} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:locale" content="en_US" />
      <meta property="og:title" content={seoTitle} />
      <meta property="og:description" content={seoDescription} />
      <meta property="og:image" content={seoImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:type" content={type || "website"} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={seoTitle} />
      <meta name="twitter:description" content={seoDescription} />
      <meta name="twitter:image" content={seoImage} />
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
    </Head>
  );
}
