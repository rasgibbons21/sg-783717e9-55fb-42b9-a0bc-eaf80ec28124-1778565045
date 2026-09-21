import type { GetServerSideProps } from "next";

export default function ReviewRedirect() {
  return null;
}

export const getServerSideProps: GetServerSideProps = async () => {
  return { redirect: { destination: "/journal", permanent: true } };
};
