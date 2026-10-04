import { fetchPortfolioCms, type PortfolioCms } from "../lib/sanity/projects";

import HomeShell from "./HomeShell";

// ISR: homepage di-regenerate maksimal setiap 60 detik.
export const revalidate = 60;

export default async function Home() {
  const cms: PortfolioCms = await fetchPortfolioCms();
  return <HomeShell cms={cms} />;
}
