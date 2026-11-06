import { useEffect } from "react";
import type { GetStaticPaths, GetStaticProps } from "next";
import { useRouter } from "next/router";
import { Loader2 } from "lucide-react";
import { Layout } from "@/components/Layout";
import { SEO } from "@/components/SEO";
import { LessonPlayer } from "@/components/lessons/LessonPlayer";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { ALL_LESSONS, getLesson } from "@/data/lessons-stocks";

export default function LessonPage({ slug }: { slug: string }) {
  const router = useRouter();
  const { isLoggedIn, isLoading } = useSubscription();
  const lesson = getLesson(slug);

  useEffect(() => {
    const isDevPreview = process.env.NODE_ENV === "development" && router.query.pro === "1";
    if (!router.isReady || isDevPreview) return;
    if (!isLoading && !isLoggedIn) {
      router.replace(`/onboarding?returnTo=${encodeURIComponent(`/lessons/${slug}`)}`);
    }
  }, [isLoading, isLoggedIn, router, slug]);

  return (
    <>
      <SEO title={`${lesson?.title ?? "Lesson"} - Bloom`} description={lesson?.subtitle ?? "A free interactive lesson from Bloom."} />
      <Layout>
        {isLoggedIn && lesson ? (
          <LessonPlayer lesson={lesson} />
        ) : (
          <div className="flex min-h-[50vh] items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-primary" aria-label="Loading" />
          </div>
        )}
      </Layout>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => ({
  paths: ALL_LESSONS.map((lesson) => ({ params: { slug: lesson.slug } })),
  fallback: false,
});

export const getStaticProps: GetStaticProps = async ({ params }) => ({
  props: { slug: params?.slug as string },
});
