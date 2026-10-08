const menuToggle = document.querySelector('.menu-toggle');
const navLinks = document.querySelector('nav ul');
const navItems = document.querySelectorAll('nav a');

menuToggle.addEventListener('click', () => {
    navLinks.classList.toggle('active');

    const isOpen = navLinks.classList.contains('active');
    menuToggle.setAttribute('aria-expanded', isOpen);
});

navItems.forEach(item => {
    item.addEventListener('click', () => {
        navLinks.classList.remove('active');
        menuToggle.setAttribute('aria-expanded', 'false');
    });
});

const trendingGrid = document.querySelector('#trending-grid');
const animeGrid = document.querySelector('#anime-grid');
const mangaGrid = document.querySelector('#manga-grid');

async function getTopAnime() {
    try { 
        const response = await fetch('https://kitsu.io/api/edge/anime?page[limit]=10&sort=-averageRating');
        if (!response.ok) {throw new Error ('Failed to fetch anime')}
        const data = await response.json();

        displayAnime(data.data,trendingGrid);
    } catch (error) {
        console.error('Error fetching anime:', error);
    }
}

function displayAnime(animeList, grid) {
    grid.innerHTML = '';

    animeList.forEach(anime => {
        const attributes = anime.attributes;

        const card = document.createElement('article');
        card.classList.add('media-card');

        card.innerHTML = `
            <img 
                src="${attributes.posterImage?.medium}" 
                alt="${attributes.canonicalTitle} poster"
            >
            <h3>${attributes.canonicalTitle}</h3>
            <p>Rating: ${attributes.averageRating || 'N/A'}%</p>
            <p>Status: ${attributes.status || 'Unknown'}</p>
        `;

        grid.appendChild(card);
    });
}

getTopAnime();

async function getLatestManga() {
    try {
        const response = await fetch('https://kitsu.io/api/edge/manga?page[limit]=10&sort=-startDate');
        if (!response.ok) {
            throw new Error('Failed to fetch manga');
        }
        const data = await response.json();

        displayManga(data.data, mangaGrid);
    } catch (error) {
        console.error('Error fetching manga:', error);
    }
}

function displayManga(mangaList, grid) {
    grid.innerHTML = '';

    mangaList.forEach(manga => {
        const attributes = manga.attributes;

        const card = document.createElement('article');
        card.classList.add('media-card');

        card.innerHTML = `
            <img 
                src="${attributes.posterImage?.medium}" 
                alt="${attributes.canonicalTitle} poster"
            >
            <h3>${attributes.canonicalTitle}</h3>
            <p>Rating: ${attributes.averageRating || 'N/A'}%</p>
            <p>Status: ${attributes.status || 'Unknown'}</p>
        `;

        grid.appendChild(card);
    });
}

getLatestManga();

async function getLatestAnime() {
    try {
        const response = await fetch(
            'https://kitsu.io/api/edge/anime?page[limit]=10&sort=-startDate'
        );

        if (!response.ok) {
            throw new Error('Failed to fetch latest anime');
        }

        const data = await response.json();

        displayAnime(data.data, animeGrid);

    } catch (error) {
        console.error('Error fetching latest anime:', error);
    }
}

getLatestAnime();