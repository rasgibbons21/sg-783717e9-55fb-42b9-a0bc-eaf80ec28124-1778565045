import type { GetServerSideProps } from "next";

export default function PortfolioRedirect() {
  return null;
}

export const getServerSideProps: GetServerSideProps = async () => {
  return { redirect: { destination: "/practice", permanent: true } };
};
