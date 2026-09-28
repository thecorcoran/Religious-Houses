/**
 * Analytical Directory Application - Edward Tufte Layout
 * Full support for Latin & Eastern Catholic Religious Houses
 */

let allHouses = [];
let map = null;
let markersLayer = null;

// Color accents for map markers
const COLOR_LATIN = '#821717';     // Oxblood / Cardinal
const COLOR_EASTERN = '#b45309';   // Byzantine Amber / Gold

// SVG Dot Marker Icon Generator
function createTufteIcon(isEastern) {
    const color = isEastern ? COLOR_EASTERN : COLOR_LATIN;
    const svg = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
            <circle cx="12" cy="12" r="8" fill="${color}" stroke="#ffffff" stroke-width="2"/>
            <circle cx="12" cy="12" r="3" fill="#ffffff"/>
        </svg>
    `;
    return L.divIcon({
        className: 'custom-tufte-pin',
        html: svg,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
        popupAnchor: [0, -10]
    });
}

// Initialize Leaflet Map
function initMap() {
    if (map === null) {
        const mapContainer = document.getElementById('map');
        if (!mapContainer) return;

        // Centered on the continental United States
        map = L.map('map', {
            center: [39.5, -98.35],
            zoom: 4,
            scrollWheelZoom: true
        });

        // CartoDB Positron - Minimalist, high-legibility cartography ideal for Tufte design
        L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
            subdomains: 'abcd',
            maxZoom: 19
        }).addTo(map);

        markersLayer = L.layerGroup().addTo(map);
    }
}

function escapeHtml(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function isEasternRite(churchRite) {
    if (!churchRite) return false;
    const lower = churchRite.toLowerCase();
    return !lower.includes('latin') && !lower.includes('roman rite');
}

// Update Top Macro Metrics Bar
function updateMacroMetrics(data) {
    const totalEl = document.getElementById('stat-total');
    const easternEl = document.getElementById('stat-eastern');
    const latinEl = document.getElementById('stat-latin');
    const cloisteredEl = document.getElementById('stat-cloistered');
    const statesEl = document.getElementById('stat-states');

    if (!totalEl) return;

    const total = data.length;
    const eastern = data.filter(h => isEasternRite(h.church_rite)).length;
    const latin = total - eastern;
    const cloistered = data.filter(h => h.is_cloistered).length;
    const uniqueStates = new Set(data.map(h => h.state_province).filter(Boolean)).size;

    totalEl.textContent = total;
    easternEl.textContent = eastern;
    latinEl.textContent = latin;
    cloisteredEl.textContent = cloistered;
    statesEl.textContent = uniqueStates;
}

// Filter and Render Listings and Map Markers
function filterAndRender(data = allHouses) {
    const searchBar = document.getElementById('search-bar');
    const sortBy = document.getElementById('sort-by').value;
    const filterRite = document.getElementById('filter-rite').value;
    const filterState = document.getElementById('filter-state') ? document.getElementById('filter-state').value : 'all';
    const filterGender = document.getElementById('filter-gender').value;
    const filterCloistered = document.getElementById('filter-cloistered').value;
    const searchTerm = searchBar ? searchBar.value.trim().toLowerCase() : '';

    // 1. Filter Data
    const filteredHouses = data.filter(house => {
        // Multi-field search
        if (searchTerm) {
            const name = (house.name || '').toLowerCase();
            const order = (house.religious_order || '').toLowerCase();
            const state = (house.state_province || '').toLowerCase();
            const city = (house.city || '').toLowerCase();
            const rite = (house.church_rite || '').toLowerCase();
            const notes = (house.notes || '').toLowerCase();
            const addr = (house.address_verified || '').toLowerCase();

            if (!name.includes(searchTerm) && !order.includes(searchTerm) && !state.includes(searchTerm) && !city.includes(searchTerm) && !rite.includes(searchTerm) && !notes.includes(searchTerm) && !addr.includes(searchTerm)) {
                return false;
            }
        }

        // State filter
        if (filterState !== 'all' && house.state_province !== filterState) return false;

        // Rite filter
        if (filterRite !== 'all') {
            if (filterRite === 'eastern-all') {
                if (!isEasternRite(house.church_rite)) return false;
            } else if (filterRite === 'latin-all') {
                if (isEasternRite(house.church_rite)) return false;
            } else if (house.church_rite !== filterRite) {
                return false;
            }
        }

        // Gender filter
        if (filterGender === 'mens' && house.is_mens_house !== true) return false;
        if (filterGender === 'womens' && house.is_mens_house !== false) return false;

        // Cloistered status filter
        if (filterCloistered !== 'all') {
            const isCloistered = (filterCloistered === 'true');
            if (house.is_cloistered !== isCloistered) return false;
        }

        return true;
    });

    // 2. Sort Data
    filteredHouses.sort((a, b) => {
        switch (sortBy) {
            case 'name-asc':
                return a.name.localeCompare(b.name);
            case 'name-desc':
                return b.name.localeCompare(a.name);
            case 'year-asc':
                return (a.year_founded || 9999) - (b.year_founded || 9999);
            case 'year-desc':
                return (b.year_founded || 0) - (a.year_founded || 0);
            case 'state-asc':
                return (a.state_province || '').localeCompare(b.state_province || '');
            default:
                return 0;
        }
    });

    // 3. Update Status UI
    const isFiltered = searchTerm !== '' || filterState !== 'all' || filterRite !== 'all' || filterGender !== 'all' || filterCloistered !== 'all';
    const resetBtn = document.getElementById('reset-filters-btn');
    const summarySpan = document.getElementById('filter-summary');
    const countDisplay = document.getElementById('house-count-display');
    const mapCountDisplay = document.getElementById('map-marker-count');

    if (resetBtn) {
        resetBtn.style.display = isFiltered ? 'inline-block' : 'none';
    }
    if (summarySpan) {
        summarySpan.textContent = isFiltered
            ? `Filter active: Displaying ${filteredHouses.length} of ${allHouses.length} religious houses`
            : `Displaying all ${allHouses.length} verified houses across the United States`;
    }
    if (countDisplay) {
        countDisplay.textContent = `${filteredHouses.length} Houses`;
    }

    // 4. Render Listings
    const monasteryList = document.getElementById('monastery-list');
    if (monasteryList) {
        monasteryList.innerHTML = '';

        if (filteredHouses.length === 0) {
            monasteryList.innerHTML = `
                <div class="empty-state">
                    <p style="font-size: 1.1em; margin-bottom: 8px;">No religious houses match your selected criteria.</p>
                    <button class="btn-reset" onclick="resetFilters()">Reset All Filters</button>
                </div>
            `;
        } else {
            filteredHouses.forEach(house => {
                const entry = document.createElement('article');
                entry.className = 'monastery-entry';

                const isEastern = isEasternRite(house.church_rite);
                const easternTag = isEastern ? `<span class="tufte-tag tag-eastern">Eastern Catholic</span>` : '';
                const cloisteredTag = `<span class="tufte-tag ${house.is_cloistered ? 'tag-cloistered' : ''}">${house.is_cloistered ? 'Cloistered' : 'Apostolic'}</span>`;
                const genderTag = `<span class="tufte-tag">${house.is_mens_house ? "Men's" : "Women's"}</span>`;

                const websiteLink = house.website_url 
                    ? `<a href="${escapeHtml(house.website_url)}" target="_blank" rel="noopener noreferrer">Official Website &rarr;</a>`
                    : `<span></span>`;

                const mapsUrl = house.map_lat_lng
                    ? `https://www.google.com/maps/search/?api=1&query=${house.map_lat_lng[0]},${house.map_lat_lng[1]}`
                    : (house.address_verified ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(house.address_verified)}` : null);

                const directionsLink = mapsUrl
                    ? `<a href="${mapsUrl}" target="_blank" rel="noopener noreferrer" class="maps-link">Google Maps Directions &nearr;</a>`
                    : '';

                entry.innerHTML = `
                    <div class="entry-header">
                        <h3 class="entry-name">${escapeHtml(house.name)}</h3>
                        <div class="entry-badges">
                            ${easternTag}
                            ${cloisteredTag}
                            ${genderTag}
                        </div>
                    </div>

                    <div class="entry-body">
                        <p><strong>Order / Institute:</strong> ${escapeHtml(house.religious_order)}</p>
                        <p><strong>Tradition &amp; Rite:</strong> <em>${escapeHtml(house.church_rite)}</em></p>
                        <p><strong>Location:</strong> ${escapeHtml(house.city ? house.city + ', ' : '')}${escapeHtml(house.state_province)}, USA${house.address_verified ? ` &mdash; <span style="color:#666;">${escapeHtml(house.address_verified)}</span>` : ''}</p>
                        ${house.year_founded ? `<p><strong>Year Founded:</strong> ${escapeHtml(house.year_founded)}</p>` : ''}
                        ${house.diocese_eparchy ? `<p><strong>Diocese / Eparchy:</strong> ${escapeHtml(house.diocese_eparchy)}</p>` : ''}
                        ${house.notes ? `<p class="entry-notes">${escapeHtml(house.notes)}</p>` : ''}
                    </div>

                    <div class="entry-actions">
                        ${websiteLink}
                        ${directionsLink}
                    </div>
                `;

                monasteryList.appendChild(entry);
            });
        }
    }

    // 5. Update Map Markers
    if (map !== null && markersLayer !== null) {
        markersLayer.clearLayers();
        const validBounds = [];
        let mappedCount = 0;

        filteredHouses.forEach(house => {
            if (house.map_lat_lng && Array.isArray(house.map_lat_lng) && house.map_lat_lng.length === 2) {
                const isEastern = isEasternRite(house.church_rite);
                const icon = createTufteIcon(isEastern);
                const marker = L.marker(house.map_lat_lng, { icon: icon });

                const popupContent = `
                    <div>
                        <div class="popup-title">${escapeHtml(house.name)}</div>
                        <div class="popup-order">${escapeHtml(house.religious_order)}</div>
                        <div class="popup-rite">${escapeHtml(house.church_rite)}</div>
                        <div class="popup-meta">
                            📍 ${escapeHtml(house.city ? house.city + ', ' : '')}${escapeHtml(house.state_province)}<br>
                            🏷️ ${house.is_cloistered ? 'Cloistered Contemplative' : 'Apostolic'} &bull; ${house.is_mens_house ? "Men's" : "Women's"}
                        </div>
                        ${house.website_url ? `<a href="${escapeHtml(house.website_url)}" target="_blank" rel="noopener noreferrer" class="popup-link">Visit Website &rarr;</a>` : ''}
                    </div>
                `;

                marker.bindPopup(popupContent);
                markersLayer.addLayer(marker);
                validBounds.push(house.map_lat_lng);
                mappedCount++;
            }
        });

        if (mapCountDisplay) {
            mapCountDisplay.textContent = `Showing ${mappedCount} points`;
        }

        if (validBounds.length > 1) {
            map.fitBounds(validBounds, { padding: [30, 30], maxZoom: 12 });
        } else if (validBounds.length === 1) {
            map.setView(validBounds[0], 9);
        }
    }
}

// Populate Rite & State Filter Selects
function populateFilters(data) {
    // 1. Church Rites (Distinguish Latin & Eastern)
    const filterRiteSelect = document.getElementById('filter-rite');
    if (filterRiteSelect) {
        const rites = Array.from(new Set(data.map(h => h.church_rite).filter(Boolean))).sort();
        
        filterRiteSelect.innerHTML = `
            <option value="all">All Rites (Latin &amp; Eastern)</option>
            <option value="eastern-all">&bull; All Eastern Catholic Monasteries (${data.filter(h => isEasternRite(h.church_rite)).length})</option>
            <option value="latin-all">&bull; All Latin Church Houses (${data.filter(h => !isEasternRite(h.church_rite)).length})</option>
            <optgroup label="Specific Church Rites">
        `;

        rites.forEach(rite => {
            const count = data.filter(h => h.church_rite === rite).length;
            const option = document.createElement('option');
            option.value = rite;
            option.textContent = `${rite} (${count})`;
            filterRiteSelect.appendChild(option);
        });

        filterRiteSelect.innerHTML += `</optgroup>`;
    }

    // 2. States
    const filterStateSelect = document.getElementById('filter-state');
    if (filterStateSelect) {
        const states = Array.from(new Set(data.map(h => h.state_province).filter(Boolean))).sort();
        filterStateSelect.innerHTML = `<option value="all">All States (${states.length})</option>`;
        states.forEach(state => {
            const count = data.filter(h => h.state_province === state).length;
            const option = document.createElement('option');
            option.value = state;
            option.textContent = `${state} (${count})`;
            filterStateSelect.appendChild(option);
        });
    }
}

// Reset all active filters
function resetFilters() {
    const searchBar = document.getElementById('search-bar');
    if (searchBar) searchBar.value = '';
    
    document.getElementById('sort-by').value = 'name-asc';
    document.getElementById('filter-rite').value = 'all';
    if (document.getElementById('filter-state')) document.getElementById('filter-state').value = 'all';
    document.getElementById('filter-gender').value = 'all';
    document.getElementById('filter-cloistered').value = 'all';

    filterAndRender();
}

// Load dataset and start application
async function loadDataAndInit() {
    try {
        let response = await fetch('./monasteries.json');
        if (!response.ok) {
            response = await fetch('./data/monasteries.json');
        }
        if (!response.ok) {
            throw new Error('Failed to load monasteries.json');
        }
        allHouses = await response.json();

        initMap();
        updateMacroMetrics(allHouses);
        populateFilters(allHouses);
        filterAndRender();

        // Invalidate map size shortly after load to ensure complete tile rendering
        setTimeout(() => {
            if (map) map.invalidateSize();
        }, 200);

    } catch (error) {
        console.error("Error loading directory data:", error);
        const list = document.getElementById('monastery-list');
        if (list) {
            list.innerHTML = '<p style="color:var(--accent-oxblood);">Error loading directory data. Please check network connection.</p>';
        }
    }
}

// Run on page load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadDataAndInit);
} else {
    loadDataAndInit();
}
