import Head from "next/head";
import { useRouter } from "next/router";

export interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
}

const SITE_URL = "https://shebloomswealth.app";

const defaultSEO = {
  title: "Bloom — Investment Analysis for Women",
  description: "Mobile-first investment app designed for women investors. Get warm, approachable analysis from Pansy, your expert guide who explains everything in plain language.",
  image: "/og-image.png",
  url: SITE_URL,
};

export function SEOElements() {
  return (
    <>
      <meta charSet="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <title>{defaultSEO.title}</title>
      <meta name="description" content={defaultSEO.description} />
      <meta property="og:title" content={defaultSEO.title} />
      <meta property="og:description" content={defaultSEO.description} />
      <meta property="og:image" content={defaultSEO.image} />
      <meta property="og:url" content={defaultSEO.url} />
      <meta property="og:type" content="website" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={defaultSEO.title} />
      <meta name="twitter:description" content={defaultSEO.description} />
      <meta name="twitter:image" content={defaultSEO.image} />
    </>
  );
}

export function SEO({ title, description, image, url }: SEOProps) {
  const router = useRouter();
  const seoTitle = title || defaultSEO.title;
  const seoDescription = description || defaultSEO.description;
  const seoImage = image || defaultSEO.image;
  const canonicalUrl = url || `${SITE_URL}${router.asPath.split("?")[0]}`;

  return (
    <Head>
      <title>{seoTitle}</title>
      <meta name="description" content={seoDescription} />
      <link rel="canonical" href={canonicalUrl} />
      <meta property="og:title" content={seoTitle} />
      <meta property="og:description" content={seoDescription} />
      <meta property="og:image" content={seoImage} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:type" content="website" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={seoTitle} />
      <meta name="twitter:description" content={seoDescription} />
      <meta name="twitter:image" content={seoImage} />
    </Head>
  );
}