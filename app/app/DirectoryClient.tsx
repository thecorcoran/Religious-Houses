
'use client';

import { useState, useMemo } from 'react';
import { Monastery } from './types';
import dynamic from 'next/dynamic';
import Link from 'next/link';

// Dynamically import the Map component to ensure it's only loaded on the client
const MapView = dynamic(() => import('./MapView'), { 
  ssr: false,
  loading: () => <div style={{ padding: '40px', textAlign: 'center' }}>🗺️ Loading interactive map...</div> 
});

interface DirectoryClientProps {
  allHouses: Monastery[];
  rites: string[];
}

function MonasteryCard({ house }: { house: Monastery }) {
  return (
    <div className="monastery-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
        <h3 style={{ margin: '0 0 8px 0', fontSize: '1.2em' }}>
          <Link href={`/monastery/${house.id}`}>{house.name}</Link>
        </h3>
      </div>
      
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginBottom: '10px' }}>
        <span style={{
          backgroundColor: '#e2e8f0',
          color: '#334155',
          fontSize: '0.75em',
          padding: '2px 8px',
          borderRadius: '12px',
          fontWeight: 'bold'
        }}>
          {house.is_mens_house ? "Men's" : "Women's"}
        </span>
        <span style={{
          backgroundColor: house.is_cloistered ? '#dcfce7' : '#e0f2fe',
          color: house.is_cloistered ? '#166534' : '#075985',
          fontSize: '0.75em',
          padding: '2px 8px',
          borderRadius: '12px',
          fontWeight: 'bold'
        }}>
          {house.is_cloistered ? 'Cloistered' : 'Apostolic'}
        </span>
        <span style={{
          backgroundColor: '#fef3c7',
          color: '#92400e',
          fontSize: '0.75em',
          padding: '2px 8px',
          borderRadius: '12px',
          fontWeight: 'bold'
        }}>
          {house.house_type || 'Monastery'}
        </span>
      </div>

      <p><strong>Order:</strong> {house.religious_order}</p>
      <p><strong>Rite:</strong> {house.church_rite}</p>
      <p><strong>Location:</strong> {house.city ? `${house.city}, ` : ''}{house.state_province}, {house.country}</p>
      {house.motherhouse_location && <p><strong>Motherhouse:</strong> {house.motherhouse_location}</p>}
      {house.year_founded && <p><strong>Founded:</strong> {house.year_founded}</p>}
      
      <div style={{ marginTop: '12px', paddingTop: '10px', borderTop: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link href={`/monastery/${house.id}`} style={{ fontWeight: 'bold', color: '#003366', fontSize: '0.9em' }}>
          View Details &rarr;
        </Link>
        {house.website_url && (
          <a href={house.website_url} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.9em' }}>
            Visit Website ↗
          </a>
        )}
      </div>
    </div>
  );
}

export default function DirectoryClient({ allHouses, rites }: DirectoryClientProps) {
  const [view, setView] = useState<'list' | 'map'>('list');
  
  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('name-asc');
  const [filterRite, setFilterRite] = useState('all');
  const [filterGender, setFilterGender] = useState('all');
  const [filterCloistered, setFilterCloistered] = useState('all');
  const [filterState, setFilterState] = useState('all');

  const states = useMemo(() => {
    const list = Array.from(new Set(allHouses.map(h => h.state_province).filter(Boolean)));
    return list.sort();
  }, [allHouses]);

  const resetFilters = () => {
    setSearchQuery('');
    setSortBy('name-asc');
    setFilterRite('all');
    setFilterGender('all');
    setFilterCloistered('all');
    setFilterState('all');
  };

  const filteredHouses = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    const result = allHouses.filter(house => {
      // Full-text search
      if (query) {
        const matchName = house.name.toLowerCase().includes(query);
        const matchOrder = house.religious_order.toLowerCase().includes(query);
        const matchState = (house.state_province || '').toLowerCase().includes(query);
        const matchCity = (house.city || '').toLowerCase().includes(query);
        const matchRite = house.church_rite.toLowerCase().includes(query);
        const matchNotes = (house.notes || '').toLowerCase().includes(query);
        const matchAddress = (house.address_verified || '').toLowerCase().includes(query);
        const matchMotherhouse = (house.motherhouse_location || '').toLowerCase().includes(query);

        if (!matchName && !matchOrder && !matchState && !matchCity && !matchRite && !matchNotes && !matchAddress && !matchMotherhouse) {
          return false;
        }
      }

      // Rite filter
      if (filterRite !== 'all' && house.church_rite !== filterRite) return false;

      // Gender filter
      if (filterGender === 'mens' && !house.is_mens_house) return false;
      if (filterGender === 'womens' && house.is_mens_house) return false;

      // Cloistered filter
      if (filterCloistered !== 'all') {
        const isCloistered = (filterCloistered === 'true');
        if (house.is_cloistered !== isCloistered) return false;
      }

      // State filter
      if (filterState !== 'all' && house.state_province !== filterState) return false;

      return true;
    });

    result.sort((a, b) => {
      switch (sortBy) {
        case 'name-asc':
          return a.name.localeCompare(b.name);
        case 'name-desc':
          return b.name.localeCompare(a.name);
        case 'year-asc':
          return (a.year_founded ?? 9999) - (b.year_founded ?? 9999);
        case 'year-desc':
          return (b.year_founded ?? 0) - (a.year_founded ?? 0);
        case 'state-asc':
          return (a.state_province || '').localeCompare(b.state_province || '');
        default:
          return 0;
      }
    });

    return result;
  }, [allHouses, searchQuery, sortBy, filterRite, filterGender, filterCloistered, filterState]);

  const isFiltered = searchQuery !== '' || filterRite !== 'all' || filterGender !== 'all' || filterCloistered !== 'all' || filterState !== 'all';

  return (
    <>
      <div className="tabs">
        <button className={`tab-button ${view === 'list' ? 'active' : ''}`} onClick={() => setView('list')}>
          📋 List View ({filteredHouses.length})
        </button>
        <button className={`tab-button ${view === 'map' ? 'active' : ''}`} onClick={() => setView('map')}>
          🗺️ Interactive Map
        </button>
      </div>

      <section id="controls">
        <h2 style={{ marginTop: 0, fontSize: '1.2em', color: '#003366' }}>🔎 Search & Filter Directory</h2>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '15px', alignItems: 'end' }}>
          <div>
            <label htmlFor="search-input" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Search (Name, Order, City, etc.):
            </label>
            <input
              id="search-input"
              type="text"
              placeholder="e.g. Benedictine, Spencer, Carmelite..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{ width: '100%', boxSizing: 'border-box' }}
            />
          </div>

          <div>
            <label htmlFor="filter-state" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              State / Province:
            </label>
            <select id="filter-state" value={filterState} onChange={e => setFilterState(e.target.value)} style={{ width: '100%' }}>
              <option value="all">All States / Provinces ({states.length})</option>
              {states.map(state => (
                <option key={state} value={state}>{state}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="filter-rite" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Church Rite:
            </label>
            <select id="filter-rite" value={filterRite} onChange={e => setFilterRite(e.target.value)} style={{ width: '100%' }}>
              <option value="all">All Rites</option>
              {rites.map(rite => (
                <option key={rite} value={rite}>{rite}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="filter-gender" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Gender:
            </label>
            <select id="filter-gender" value={filterGender} onChange={e => setFilterGender(e.target.value)} style={{ width: '100%' }}>
              <option value="all">All (Men's & Women's)</option>
              <option value="mens">Men's Houses</option>
              <option value="womens">Women's Houses</option>
            </select>
          </div>

          <div>
            <label htmlFor="filter-cloistered" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Status / Charism:
            </label>
            <select id="filter-cloistered" value={filterCloistered} onChange={e => setFilterCloistered(e.target.value)} style={{ width: '100%' }}>
              <option value="all">All Charisms</option>
              <option value="true">Cloistered / Contemplative</option>
              <option value="false">Apostolic / Active</option>
            </select>
          </div>

          <div>
            <label htmlFor="sort-by" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Sort By:
            </label>
            <select id="sort-by" value={sortBy} onChange={e => setSortBy(e.target.value)} style={{ width: '100%' }}>
              <option value="name-asc">Name (A-Z)</option>
              <option value="name-desc">Name (Z-A)</option>
              <option value="year-asc">Year Founded (Oldest First)</option>
              <option value="year-desc">Year Founded (Newest First)</option>
              <option value="state-asc">State / Province</option>
            </select>
          </div>
        </div>

        {isFiltered && (
          <div style={{ marginTop: '15px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '0.9em', color: '#555' }}>
              Filtering active ({filteredHouses.length} of {allHouses.length} houses match)
            </span>
            <button
              onClick={resetFilters}
              style={{
                background: '#fee2e2',
                color: '#991b1b',
                border: '1px solid #f87171',
                borderRadius: '4px',
                padding: '4px 10px',
                cursor: 'pointer',
                fontSize: '0.85em',
                fontWeight: 'bold'
              }}
            >
              Reset Filters ✕
            </button>
          </div>
        )}
      </section>

      <hr style={{ margin: '20px 0', border: '0', borderTop: '1px solid #e2e8f0' }} />

      {view === 'list' && (
        <section id="list-view" className="view-content active">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
            <h2 style={{ margin: 0 }}>🏠 Houses Found: <span id="house-count">{filteredHouses.length}</span></h2>
            <span style={{ fontSize: '0.9em', color: '#666' }}>Showing {filteredHouses.length} of {allHouses.length} total entries</span>
          </div>

          <div id="monastery-list">
            {filteredHouses.length > 0 ? (
              filteredHouses.map(house => <MonasteryCard key={house.id} house={house} />)
            ) : (
              <div style={{ gridColumn: '1 / -1', padding: '40px', textAlign: 'center', background: '#fff', borderRadius: '8px', border: '1px dashed #ccc' }}>
                <p style={{ fontSize: '1.1em', color: '#666', margin: '0 0 10px 0' }}>
                  No religious houses match your current filter and search criteria.
                </p>
                <button
                  onClick={resetFilters}
                  style={{
                    padding: '8px 16px',
                    background: '#003366',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  Clear All Filters
                </button>
              </div>
            )}
          </div>
        </section>
      )}

      {view === 'map' && (
        <section id="map-view" className="view-content active">
          <h2>🗺️ Geographic Map</h2>
          <MapView houses={filteredHouses} />
        </section>
      )}
    </>
  );
}

