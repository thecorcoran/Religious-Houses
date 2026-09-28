
import fs from 'fs/promises';
import path from 'path';
import { Monastery } from '../../types';
import { notFound } from 'next/navigation';
import Link from 'next/link';

const dataFilePath = path.join(process.cwd(), 'data', 'monasteries.json');

async function getHouses(): Promise<Monastery[]> {
  const jsonData = await fs.readFile(dataFilePath, 'utf-8');
  return JSON.parse(jsonData);
}

async function getHouse(id: string): Promise<Monastery | undefined> {
  const houses = await getHouses();
  return houses.find(house => house.id === id);
}

// This function tells Next.js which pages to pre-render at build time
export async function generateStaticParams() {
  const houses = await getHouses();
  return houses.map(house => ({
    id: house.id,
  }));
}

// This is the page component
export default async function MonasteryPage({ params }: { params: { id: string } }) {
  const house = await getHouse(params.id);

  if (!house) {
    notFound();
  }

  const jsonLd: Record<string, any> = {
    '@context': 'https://schema.org',
    '@type': 'PlaceOfWorship',
    name: house.name,
    address: {
      '@type': 'PostalAddress',
      streetAddress: house.address_verified || undefined,
      addressLocality: house.city || undefined,
      addressRegion: house.state_province,
      addressCountry: house.country,
    },
    description: `Details for ${house.name}, a ${house.religious_order} house${house.year_founded ? ` founded in ${house.year_founded}` : ''}.`,
  };

  if (house.website_url) {
    jsonLd.url = house.website_url;
  }
  if (house.year_founded) {
    jsonLd.foundingDate = house.year_founded.toString();
  }
  if (house.map_lat_lng) {
    jsonLd.geo = {
      '@type': 'GeoCoordinates',
      latitude: house.map_lat_lng[0],
      longitude: house.map_lat_lng[1],
    };
  }

  const mapsUrl = house.map_lat_lng
    ? `https://www.google.com/maps/search/?api=1&query=${house.map_lat_lng[0]},${house.map_lat_lng[1]}`
    : house.address_verified
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(house.address_verified)}`
    : null;

  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <header>
        <h1>{house.name}</h1>
        <p>{house.religious_order} &bull; {house.church_rite}</p>
      </header>
      <main style={{ padding: '20px' }}>
        <div className="monastery-card" style={{ maxWidth: '800px', margin: 'auto' }}>
          <p><strong>Church Rite:</strong> {house.church_rite}</p>
          <p><strong>Religious Order:</strong> {house.religious_order}</p>
          <p><strong>Type:</strong> {house.house_type} | {house.is_mens_house ? "Men's House" : "Women's House"}</p>
          <p><strong>Status:</strong> {house.is_cloistered ? 'Cloistered / Contemplative' : 'Apostolic / Active'}</p>
          {house.diocese_eparchy && <p><strong>Diocese / Eparchy:</strong> {house.diocese_eparchy}</p>}
          <p><strong>Location:</strong> {house.address_verified || `${house.state_province}, ${house.country}`}</p>
          {house.year_founded && <p><strong>Founded:</strong> {house.year_founded}</p>}
          
          {house.website_url && (
            <p><strong>Official Website:</strong> <a href={house.website_url} target="_blank" rel="noopener noreferrer">{house.website_url}</a></p>
          )}
          {house.vocations_url && (
            <p><strong>Vocations Page:</strong> <a href={house.vocations_url} target="_blank" rel="noopener noreferrer">{house.vocations_url}</a></p>
          )}
          {house.contact_email && (
            <p><strong>Contact Email:</strong> <a href={`mailto:${house.contact_email}`}>{house.contact_email}</a></p>
          )}
          {house.phone && (
            <p><strong>Phone:</strong> <a href={`tel:${house.phone}`}>{house.phone}</a></p>
          )}
          {mapsUrl && (
            <p><strong>Map Directions:</strong> <a href={mapsUrl} target="_blank" rel="noopener noreferrer">View on Google Maps &rarr;</a></p>
          )}
          {house.notes && (
            <p style={{ marginTop: '15px', paddingTop: '10px', borderTop: '1px solid #eee' }}>
              <strong>Notes & Charism:</strong> {house.notes}
            </p>
          )}
        </div>
      </main>
      <footer style={{ textAlign: 'center', marginTop: '2rem' }}>
        <Link href="/">Back to Directory</Link>
      </footer>
    </div>
  );
}

// Optional: Add metadata to each page for even better SEO
export async function generateMetadata({ params }: { params: { id: string } }) {
  const house = await getHouse(params.id);
  if (!house) {
    return { title: 'Not Found' };
  }
  return {
    title: `${house.name} | Catholic Religious Houses Directory`,
    description: `Details for ${house.name}, a ${house.religious_order} house${house.year_founded ? ` founded in ${house.year_founded}` : ''}.`,
  };
}
