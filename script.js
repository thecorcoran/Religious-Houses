// Function to load the JSON data
let allHouses = [];
const monasteryList = document.getElementById('monastery-list');
const houseCount = document.getElementById('house-count');
let map = null; // Variable to hold the Leaflet map instance
let markersLayer = null;

// Initialize the map on load, but only display it when the tab is active
function initMap() {
    if (map === null) {
        // Centered on the United States
        map = L.map('map').setView([39.8283, -98.5795], 4);
        
        // Use OpenStreetMap
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>',
            maxZoom: 18,
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

// Function to render the list and map markers
function filterAndRender(data = allHouses) {
    // 1. Get filter/sort criteria
    const sortBy = document.getElementById('sort-by').value;
    const filterRite = document.getElementById('filter-rite').value;
    const filterGender = document.getElementById('filter-gender').value;
    const filterCloistered = document.getElementById('filter-cloistered').value;
    const searchTerm = document.getElementById('search-bar').value.trim().toLowerCase();

    // 2. Filter the data
    let filteredHouses = data.filter(house => {
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

        // Filter by Rite
        if (filterRite !== 'all' && house.church_rite !== filterRite) return false;

        // Filter by Gender
        if (filterGender === 'mens' && house.is_mens_house !== true) return false;
        if (filterGender === 'womens' && house.is_mens_house !== false) return false;

        // Filter by Cloistered Status
        if (filterCloistered !== 'all') {
            const isCloistered = (filterCloistered === 'true');
            if (house.is_cloistered !== isCloistered) return false;
        }

        return true;
    });

    // 3. Sort the data
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

    // 4. Render the List View
    monasteryList.innerHTML = '';
    houseCount.textContent = filteredHouses.length;
    
    if (filteredHouses.length === 0) {
        monasteryList.innerHTML = '<p style="grid-column: 1 / -1; text-align: center; padding: 30px;">No houses match the current filters. Please adjust your criteria.</p>';
    }

    filteredHouses.forEach(house => {
        const card = document.createElement('div');
        card.className = 'monastery-card';
        
        const websiteLink = house.website_url 
            ? `<p><a href="${escapeHtml(house.website_url)}" target="_blank" rel="noopener noreferrer">Visit Website ↗</a></p>`
            : '';

        const directionsLink = house.map_lat_lng
            ? `<a href="https://www.google.com/maps/search/?api=1&query=${house.map_lat_lng[0]},${house.map_lat_lng[1]}" target="_blank" rel="noopener noreferrer" style="font-size:0.85em; color:#666;">View on Maps ↗</a>`
            : '';

        card.innerHTML = `
            <h3>${escapeHtml(house.name)}</h3>
            <p><strong>Rite:</strong> ${escapeHtml(house.church_rite)}</p>
            <p><strong>Order:</strong> ${escapeHtml(house.religious_order)}</p>
            <p><strong>Location:</strong> ${escapeHtml(house.city ? house.city + ', ' : '')}${escapeHtml(house.state_province)}, ${escapeHtml(house.country)}</p>
            ${house.year_founded ? `<p><strong>Founded:</strong> ${escapeHtml(house.year_founded)}</p>` : ''}
            <p><strong>Type:</strong> ${escapeHtml(house.house_type || 'Monastery')} | ${house.is_mens_house ? "Men's House" : "Women's House"}</p>
            <p><strong>Status:</strong> ${house.is_cloistered ? 'Cloistered / Contemplative' : 'Apostolic / Active'}</p>
            ${house.diocese_eparchy ? `<p><strong>Diocese/Eparchy:</strong> ${escapeHtml(house.diocese_eparchy)}</p>` : ''}
            ${house.notes ? `<p style="font-size:0.85em; color:#555; border-top:1px solid #eee; padding-top:6px; margin-top:8px;">${escapeHtml(house.notes)}</p>` : ''}
            <div style="display:flex; justify-content:space-between; align-items:center; margin-top:10px; padding-top:8px; border-top:1px solid #eee;">
                ${websiteLink}
                ${directionsLink}
            </div>
        `;
        monasteryList.appendChild(card);
    });

    // 5. Update Map Markers
    if (map !== null && markersLayer !== null) {
        markersLayer.clearLayers();
        const validBounds = [];

        filteredHouses.forEach(house => {
            if (house.map_lat_lng && Array.isArray(house.map_lat_lng) && house.map_lat_lng.length === 2) {
                const marker = L.marker(house.map_lat_lng);
                const popupContent = `
                    <div style="min-width:180px;">
                        <b style="color:#003366;">${escapeHtml(house.name)}</b><br>
                        <span style="font-size:0.85em;">${escapeHtml(house.religious_order)}</span><br>
                        <span style="font-size:0.85em; color:#555;">${escapeHtml(house.city ? house.city + ', ' : '')}${escapeHtml(house.state_province)}</span><br>
                        ${house.website_url ? `<a href="${escapeHtml(house.website_url)}" target="_blank" rel="noopener noreferrer" style="font-size:0.85em;">Website ↗</a>` : ''}
                    </div>
                `;
                marker.bindPopup(popupContent);
                markersLayer.addLayer(marker);
                validBounds.push(house.map_lat_lng);
            }
        });

        if (validBounds.length > 1) {
            map.fitBounds(validBounds, { padding: [40, 40], maxZoom: 12 });
        } else if (validBounds.length === 1) {
            map.setView(validBounds[0], 9);
        }
    }
}

// Function to populate the Rite filter options
function populateFilters(data) {
    const rites = Array.from(new Set(data.map(house => house.church_rite).filter(Boolean))).sort();
    const filterRiteSelect = document.getElementById('filter-rite');

    // Remove existing non-default options
    filterRiteSelect.innerHTML = '<option value="all">All Rites</option>';

    rites.forEach(rite => {
        const option = document.createElement('option');
        option.value = rite;
        option.textContent = rite;
        filterRiteSelect.appendChild(option);
    });
}

// Function to switch between list and map view
function showView(viewId) {
    document.querySelectorAll('.view-content').forEach(view => {
        view.style.display = 'none';
    });
    document.getElementById(viewId).style.display = 'block';

    document.querySelectorAll('.tab-button').forEach(button => {
        button.classList.remove('active');
    });
    document.querySelector(`.tab-button[onclick="showView('${viewId}')"]`).classList.add('active');

    // Recalculate size when map tab is activated
    if (viewId === 'map-view' && map !== null) {
        setTimeout(() => {
            map.invalidateSize();
        }, 100);
    }
}

// Initial function to load the data and start the app
async function loadDataAndInit() {
    try {
        let response = await fetch('./monasteries.json');
        if (!response.ok) {
            response = await fetch('./data/monasteries.json');
        }
        if (!response.ok) {
            throw new Error('Failed to load monasteries.json from root or data/');
        }
        allHouses = await response.json();
        
        initMap(); // Initialize the map after loading data
        populateFilters(allHouses);
        filterAndRender();
        
    } catch (error) {
        console.error("Error loading data:", error);
        monasteryList.innerHTML = '<p style="color:red;">Error: Could not load directory data. Please check network/file permissions.</p>';
    }
}

// Start the application
loadDataAndInit();
