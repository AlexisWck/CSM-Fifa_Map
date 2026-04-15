const THEMES = {
    education: { label: 'Éducation', icon: '🎓', color: '#3498db' },
    sante: { label: 'Santé', icon: '🏥', color: '#e74c3c' },
    loisirs: { label: 'Loisirs', icon: '⚽', color: '#9b59b6' },
    urgences: { label: 'Urgences', icon: '🚨', color: '#e67e22' },
    developpement: { label: 'Développement', icon: '🌱', color: '#27ae60' },
    agr: { label: 'AGR', icon: '💼', color: '#f39c12' },
    siege: { label: 'Siège / Bureau', icon: '🏢', color: '#2c3e50' }
};

const STATUS = {
    termine: { label: 'Terminé', icon: '✅' },
    en_cours: { label: 'En cours / Permanent', icon: '🔄' },
    reflexion: { label: 'En réflexion', icon: '💭' }
};

const PARTNERS = {
    spf63: 'SPF 63',
    spf83: 'SPF 83',
    spf77: 'SPF 77',
    spfaura: 'SPF AURA',
    spfan: 'SPF AN',
    spf13: 'SPF 13',
    agence_eau: "Agence de l'Eau RMC",
    csm: 'CSM-Fifa National',
    axian: 'Fondation Axian',
    auto: 'Auto-financement',
    aina: 'Aina Madagascar'
};

let map;
let markers = [];
let allProjects = [];

document.addEventListener('DOMContentLoaded', () => {
    initMap();
    setupFilters();
    setupModal();
    loadProjects();
});

function initMap() {
    map = L.map('map').setView([-18.9, 47.5], 6);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);
}

async function loadProjects() {
    try {
        const response = await fetch('project.json');
        const data = await response.json();

        allProjects = data.features.map((feature, index) => ({
            ...feature,
            processed: {
                index,
                ...feature.properties,
                lat: feature.geometry.coordinates[1],
                lng: feature.geometry.coordinates[0]
            }
        }));

        updateMarkers();
        updateCount();

    } catch (error) {
        console.error("Erreur chargement JSON :", error);
    }
}

function createMarker(project) {
    const p = project.processed;
    const theme = THEMES[p.theme] || THEMES.developpement;
    const status = STATUS[p.status] || STATUS.en_cours;

    const icon = L.divIcon({
        className: '',
        html: `<div class="custom-marker marker-${p.theme}">
                ${theme.icon}
               </div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 16]
    });

    const marker = L.marker([p.lat, p.lng], { icon });

    marker.bindPopup(`
        <div class="popup-content">
            <h4>${p.Name}</h4>
            <div style="margin-top:8px;">
                <span class="popup-tag tag-theme" style="background:${theme.color}">
                    ${theme.icon} ${theme.label}
                </span>
                <span class="popup-tag tag-status-${p.status}">
                    ${status.icon} ${status.label}
                </span>
            </div>
        </div>
    `);

    return marker;
}

function getCheckedValues(groupId) {
    const checked = document.querySelectorAll(`#${groupId} input[type="checkbox"]:checked`);
    return Array.from(checked).map(cb => cb.value);
}

function updateMarkers() {
    markers.forEach(m => map.removeLayer(m));
    markers = [];

    const activeThemes = getCheckedValues('theme-filters');
    const activeStatus = getCheckedValues('status-filters');
    const activePartners = getCheckedValues('partner-filters');

    allProjects.forEach(project => {
        const p = project.processed;

        const themeMatch = activeThemes.includes(p.theme);
        const statusMatch = activeStatus.includes(p.status);
        const partnerMatch = Array.isArray(p.partners) && p.partners.some(partner => activePartners.includes(partner));

        if (themeMatch && statusMatch && partnerMatch) {
            const marker = createMarker(project);
            marker.addTo(map);
            markers.push(marker);
        }
    });

    updateCount();

    if (markers.length > 0) {
        const group = L.featureGroup(markers);
        map.fitBounds(group.getBounds().pad(0.1));
    }
}

function updateCount() {
    document.getElementById('visible-count').textContent = markers.length;
    document.getElementById('total-count').textContent = allProjects.length;
}

function setupFilters() {
    document.querySelectorAll('.filter-group input[type="checkbox"]').forEach(cb => {
        cb.addEventListener('change', updateMarkers);
    });

    document.getElementById('select-all').addEventListener('click', () => {
        document.querySelectorAll('.filter-group input[type="checkbox"]').forEach(cb => {
            cb.checked = true;
        });
        updateMarkers();
    });

    document.getElementById('deselect-all').addEventListener('click', () => {
        document.querySelectorAll('.filter-group input[type="checkbox"]').forEach(cb => {
            cb.checked = false;
        });
        updateMarkers();
    });
}

function setupModal() {}