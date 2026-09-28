import fs from 'fs/promises';
import path from 'path';
import Link from 'next/link';
import { Monastery } from './types';
import DirectoryClient from './DirectoryClient';
import { Metadata } from 'next';

// This function gets called at build time on the server.
async function getHouses(): Promise<Monastery[]> {
  const filePath = path.join(process.cwd(), 'data', 'monasteries.json');
  const jsonData = await fs.readFile(filePath, 'utf-8');
  const data = JSON.parse(jsonData);
  return data;
}

export const metadata: Metadata = {
  title: 'Catholic Religious Houses Directory | United States & North America',
  description: 'An open-source directory of Catholic religious houses, monasteries, abbeys, convents, and friaries in North America across all rites.',
};

export default async function HomePage() {
  const allHouses = await getHouses();
  const rites = [...new Set(allHouses.map(house => house.church_rite))].sort();

  return (
    <div>
      <header>
        <h1>🧭 North American Catholic Religious Houses Directory</h1>
        <p>A directory of houses across the 24 Catholic Churches (Rites). Rebuilt with Next.js.</p>
      </header>

      <main>
        <DirectoryClient allHouses={allHouses} rites={rites} />
      </main>

      <footer>
        <p>&copy; 2025 Catholic Religious Houses Directory. Data verification in progress.</p>
      </footer>
    </div>
  );
}