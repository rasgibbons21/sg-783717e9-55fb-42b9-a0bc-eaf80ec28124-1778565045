import Head from "next/head";

export interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
}

const defaultSEO = {
  title: "Bloom — Investment Analysis for Women",
  description: "Mobile-first investment app designed for women investors. Get warm, approachable analysis from Pansy, your expert guide who explains everything in plain language.",
  image: "https://shebloomswealth.app/og-image.png",
  url: "https://shebloomswealth.app",
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
  const seoTitle = title || defaultSEO.title;
  const seoDescription = description || defaultSEO.description;
  const seoImage = image 
    ? (image.startsWith('http') ? image : `https://shebloomswealth.app${image}`)
    : defaultSEO.image;
  const seoUrl = url || defaultSEO.url;

  return (
    <Head>
      <title>{seoTitle}</title>
      <meta name="description" content={seoDescription} />
      <meta property="og:title" content={seoTitle} />
      <meta property="og:description" content={seoDescription} />
      <meta property="og:image" content={seoImage} />
      <meta property="og:url" content={seoUrl} />
      <meta property="og:type" content="website" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={seoTitle} />
      <meta name="twitter:description" content={seoDescription} />
      <meta name="twitter:image" content={seoImage} />
    </Head>
  );
}