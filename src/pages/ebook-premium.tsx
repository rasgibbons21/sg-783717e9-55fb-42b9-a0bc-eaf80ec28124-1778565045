import type { GetServerSideProps } from "next";

export default function EbookPremiumRedirect() { return null; }

export const getServerSideProps: GetServerSideProps = async () => {
  return { redirect: { destination: "/learn", permanent: true } };
};
