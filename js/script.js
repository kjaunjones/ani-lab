// MOBILE NAVIGATION

const menuToggle = document.querySelector('.menu-toggle');
const navLinks = document.querySelector('#nav-links');
const navItems = document.querySelectorAll('#nav-links a');
const menuIcon = menuToggle.querySelector('i');

// OPEN AND CLOSE THE MOBILE MENU
menuToggle.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('active');

    menuToggle.setAttribute('aria-expanded', String(isOpen));

    menuIcon.classList.toggle('fa-bars', !isOpen);
    menuIcon.classList.toggle('fa-xmark', isOpen);
});

// CLOSE THE MOBILE MENU
function closeMobileMenu() {
    navLinks.classList.remove('active');
    menuToggle.setAttribute('aria-expanded', 'false');

    menuIcon.classList.add('fa-bars');
    menuIcon.classList.remove('fa-xmark');
}

// CLOSE THE MENU WHEN A NAVIGATION LINK IS CLICKED
navItems.forEach(item => {
    item.addEventListener('click', closeMobileMenu);
});

// DOM ELEMENTS

const trendingGrid = document.querySelector('#trending-grid');
const animeGrid = document.querySelector('#anime-grid');
const mangaGrid = document.querySelector('#manga-grid');

const searchSection = document.querySelector('#search');
const searchForm = document.querySelector('#search-form');
const searchInput = document.querySelector('#search-input');
const searchType = document.querySelector('#search-type');
const searchResults = document.querySelector('#search-results');
const searchMessage = document.querySelector('#search-message');

const animeButton = document.querySelector('.anime-btn');
const mangaButton = document.querySelector('.manga-btn');

// API CONFIGURATION

const API_BASE_URL = 'https://kitsu.io/api/edge';

// API REQUEST FUNCTION

// FETCH DATA FROM KITSU
async function fetchMedia(url) {
    const response = await fetch(url);

    if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
    }

    const data = await response.json();

    if (!Array.isArray(data.data)) {
        throw new Error('Invalid API response');
    }

    return data.data;
}

// HELPER FUNCTIONS

// RETURN A FALLBACK WHEN DATA IS MISSING
function getValue(value, fallback = 'Unknown') {
    if (value === null || value === undefined || value === '') {
        return fallback;
    }

    return value;
}

// CREATE AN HTML ELEMENT WITH SAFE TEXT CONTENT
function createElement(tag, className, text) {
    const element = document.createElement(tag);

    if (className) {
        element.className = className;
    }

    if (text !== undefined) {
        element.textContent = text;
    }

    return element;
}

// CREATE A LABELLED INFORMATION PARAGRAPH
function createInfo(label, value) {
    return createElement('p', '', `${label}: ${value}`);
}

// INTERACTIVE MEDIA CARDS

function createMediaCard(media, type) {
    const attributes = media.attributes || {};

    const title = getValue(
        attributes.canonicalTitle,
        'Untitled'
    );

    const rating = attributes.averageRating ? `${attributes.averageRating}%` : 'N/A';

    const status = getValue(attributes.status);

    const synopsis = getValue(
        attributes.synopsis,
        'No synopsis available.'
    );

    const poster = attributes.posterImage?.medium;

    // CREATE THE MAIN CARD
    const card = document.createElement('article');
    card.classList.add('media-card');

    card.setAttribute('role', 'button');
    card.setAttribute('tabindex', '0');
    card.setAttribute('aria-pressed', 'false');

    card.setAttribute(
        'aria-label',
        `${title}. Press Enter or Space to view details.`
    );

    // CREATE THE ROTATING CONTAINER
    const cardInner = createElement('div', 'card-inner');

    // CARD FRONT

    const cardFront = createElement('div', 'card-front');

    // ADD THE POSTER OR A PLACEHOLDER
    if (poster) {
        const image = document.createElement('img');

        image.src = poster;
        image.alt = `${title} poster`;
        image.loading = 'lazy';

        cardFront.appendChild(image);
    } else {
        const noPoster = createElement(
            'p',
            'no-poster',
            'Poster unavailable'
        );

        cardFront.appendChild(noPoster);
    }

    // ADD THE TITLE, RATING AND STATUS
    const frontTitle = createElement('h3', '', title);
    const frontRating = createInfo('Rating', rating);
    const frontStatus = createInfo('Status', status);

    cardFront.appendChild(frontTitle);
    cardFront.appendChild(frontRating);
    cardFront.appendChild(frontStatus);

    // CARD BACK

    const cardBack = createElement('div', 'card-back');

    const backTitle = createElement('h3', '', title);

    const synopsisHeading = createElement(
        'h4',
        '',
        'Synopsis'
    );

    const synopsisText = createElement(
        'p',
        'synopsis',
        synopsis
    );

    cardBack.appendChild(backTitle);
    cardBack.appendChild(synopsisHeading);
    cardBack.appendChild(synopsisText);

    // DISPLAY EPISODE COUNT FOR ANIME
    if (type === 'anime') {
        const episodes = getValue(attributes.episodeCount);

        cardBack.appendChild(
            createInfo('Episodes', episodes)
        );
    } else {
        // DISPLAY CHAPTER AND VOLUME COUNTS FOR MANGA
        const chapters = getValue(attributes.chapterCount);
        const volumes = getValue(attributes.volumeCount);

        cardBack.appendChild(
            createInfo('Chapters', chapters)
        );

        cardBack.appendChild(
            createInfo('Volumes', volumes)
        );
    }

    cardBack.appendChild(
        createInfo('Status', status)
    );

    // ADD FLIP INSTRUCTIONS
    const flipHint = createElement(
        'p',
        'flip-hint',
        'Click or press Enter to flip back'
    );

    cardBack.appendChild(flipHint);

    // ASSEMBLE THE CARD
    cardInner.appendChild(cardFront);
    cardInner.appendChild(cardBack);
    card.appendChild(cardInner);

    // CARD FLIP FUNCTIONALITY

    function flipCard() {
        const isFlipped = card.classList.toggle('flipped');

        card.setAttribute('aria-pressed', String(isFlipped));

        const cardLabel = isFlipped ? `${title}. Press Enter or Space to return to the poster.` : `${title}. Press Enter or Space to view details.`;

        card.setAttribute('aria-label', cardLabel);

        // HIDE THE INACTIVE CARD FACE FROM SCREEN READERS
        cardFront.setAttribute('aria-hidden', String(isFlipped));
        cardBack.setAttribute('aria-hidden', String(!isFlipped));
    }

    // SET THE INITIAL ACCESSIBILITY STATE
    cardFront.setAttribute('aria-hidden', 'false');
    cardBack.setAttribute('aria-hidden', 'true');

    // FLIP THE CARD WHEN CLICKED
    card.addEventListener('click', flipCard);

    // FLIP THE CARD USING THE KEYBOARD
    card.addEventListener('keydown', event => {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            flipCard();
        }
    });

    return card;
}

// DISPLAY MEDIA

function displayMedia(mediaList, grid, type) {
    grid.replaceChildren();

    if (mediaList.length === 0) {
        grid.textContent = 'No titles available.';
        return;
    }

    // GENERATE A CARD FOR EACH TITLE
    mediaList.forEach(media => {
        const card = createMediaCard(media, type);
        grid.appendChild(card);
    });
}

// LOAD CONTENT SECTIONS

async function loadSection(url, grid, type) {
    grid.textContent = 'Loading titles...';

    try {
        const mediaList = await fetchMedia(url);

        displayMedia(mediaList, grid, type);
    } catch (error) {
        console.error('Unable to load media:', error);

        grid.textContent =
            'Unable to load titles. Please refresh the page and try again.';
    }
}

// TOP-RATED ANIME

async function getTopAnime() {
    await loadSection(
        `${API_BASE_URL}/anime?page[limit]=10&sort=-averageRating`,
        trendingGrid,
        'anime'
    );
}

// LATEST ANIME

async function getLatestAnime() {
    await loadSection(
        `${API_BASE_URL}/anime?page[limit]=10&sort=-startDate`,
        animeGrid,
        'anime'
    );
}

// LATEST MANGA

async function getLatestManga() {
    await loadSection(
        `${API_BASE_URL}/manga?page[limit]=10&sort=-startDate`,
        mangaGrid,
        'manga'
    );
}

// INITIALISE CONTENT

// LOAD ALL THREE SECTIONS
getTopAnime();
getLatestAnime();
getLatestManga();

// SEARCH FUNCTIONALITY

searchForm.addEventListener('submit', async event => {
    event.preventDefault();

    const query = searchInput.value.trim();
    const type = searchType.value;

    // PREVENT EMPTY SEARCHES
    if (!query) {
        searchSection.hidden = false;
        searchMessage.hidden = false;

        searchMessage.textContent =
            'Please enter an anime or manga title.';

        return;
    }

    // CLOSE THE MOBILE NAVIGATION
    closeMobileMenu();

    // SHOW THE SEARCH RESULTS SECTION
    searchSection.hidden = false;
    searchMessage.hidden = false;

    // CLEAR PREVIOUS SEARCH RESULTS
    searchResults.replaceChildren();

    // DISPLAY LOADING MESSAGE
    searchMessage.textContent = 'Searching...';

    // SCROLL TO THE SEARCH RESULTS SECTION
    searchSection.scrollIntoView({
        behavior: 'smooth'
    });

    try {
        // CREATE THE SEARCH URL
        const url = new URL(`${API_BASE_URL}/${type}`);

        url.searchParams.set('filter[text]', query);
        url.searchParams.set('page[limit]', '10');

        // FETCH SEARCH RESULTS
        const mediaList = await fetchMedia(url.toString());

        // HANDLE SEARCHES WITH NO RESULTS
        if (mediaList.length === 0) {
            searchMessage.textContent =
                `No ${type} results found for "${query}".`;

            return;
        }

        // DISPLAY THE SEARCH RESULTS
        displayMedia(mediaList, searchResults, type);

        searchMessage.textContent =
            `Showing ${mediaList.length} ${type} results for "${query}".`;

    } catch (error) {
        console.error('Search error:', error);

        searchMessage.textContent =
            'Unable to complete your search. Please try again.';
    }
});

// HERO BUTTONS

// SCROLL TO THE LATEST ANIME SECTION
animeButton.addEventListener('click', () => {
    animeGrid.closest('section').scrollIntoView({
        behavior: 'smooth'
    });
});

// SCROLL TO THE LATEST MANGA SECTION
mangaButton.addEventListener('click', () => {
    mangaGrid.closest('section').scrollIntoView({
        behavior: 'smooth'
    });
});