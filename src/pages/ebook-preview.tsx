import type { GetServerSideProps } from "next";

export default function EbookPreviewRedirect() { return null; }

export const getServerSideProps: GetServerSideProps = async () => {
  return { redirect: { destination: "/learn", permanent: true } };
};
