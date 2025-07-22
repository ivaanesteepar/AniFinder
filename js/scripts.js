const input = document.getElementById('searchInput');
const results = document.getElementById('results');
const loading = document.getElementById('loading');
const recommendedTitle = document.getElementById('recommendedTitle');

let timeoutId = null;

async function showRecommended() {
    recommendedTitle.style.display = "block";
    loading.style.display = 'block';
    results.innerHTML = '';

    const queryGraphQL = `
        query {
            Page(perPage: 25) {
                media(type: ANIME, sort: START_DATE_DESC) {
                    id
                    type
                    title {
                        romaji
                        english
                    }
                    coverImage {
                        large
                    }
                    startDate {
                        year
                        month
                        day
                    }
                }
            }
        }
    `;

    try {
        const response = await fetch('https://graphql.anilist.co', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
            body: JSON.stringify({ query: queryGraphQL }),
        });

        const data = await response.json();

        if (data.errors) {
            console.error('Error en la respuesta GraphQL:', data.errors);
            alert('Error GraphQL: ' + JSON.stringify(data.errors));
            results.innerHTML = '<p>Error al cargar recomendados.</p>';
            loading.style.display = 'none';
            return;
        }

        // Filtramos solo animes (aunque la query ya lo pide)
        const animeList = data.data.Page.media.filter(item => item.type === "ANIME");

        if (animeList.length === 0) {
            results.innerHTML = '<p>No se encontraron animes recomendados.</p>';
            loading.style.display = 'none';
            return;
        }

        animeList.forEach(anime => {
            const year = anime.startDate?.year;
            const month = anime.startDate?.month;
            const day = anime.startDate?.day;
            const title = anime.title.english || anime.title.romaji;

            const card = document.createElement('div');
            card.className = 'card';
            card.innerHTML = `
                <img src="${anime.coverImage.large}" alt="Portada de ${title}" />
                <div class="title">${title}</div>
            `;
            card.addEventListener('click', () => {
                console.log(anime);
                const searchUrl = `https://www.crunchyroll.com/search?from=search&q=${encodeURIComponent(title)}`;
                window.open(searchUrl, '_blank');
            });
            results.appendChild(card);
        });
    } catch (error) {
        console.error('Error de red o excepción:', error);
        results.innerHTML = '<p>Error de red o servidor.</p>';
    } finally {
        loading.style.display = 'none';
    }
}

input.addEventListener('input', () => {
    clearTimeout(timeoutId);
    const query = input.value.trim();

    if (query.length < 2) {
        showRecommended();
        recommendedTitle.style.display = "block";
        loading.style.display = 'none';
        return;
    }

    recommendedTitle.style.display = "none";
    loading.style.display = 'block';

    timeoutId = setTimeout(() => {
        buscarAnime(query);
    }, 500);
});

// Al cargar la página mostramos recomendados
showRecommended();

async function buscarAnime(query) {
    const queryGraphQL = `
        query ($search: String) {
            Page(perPage: 12) {
                media(type: ANIME, search: $search) {
                    id
                    type
                    title {
                        romaji
                        english
                    }
                    coverImage {
                        large
                    }
                    startDate {
                        year
                        month
                        day
                    }
                }
            }
        }
    `;

    try {
        const response = await fetch('https://graphql.anilist.co', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
            body: JSON.stringify({ query: queryGraphQL, variables: { search: query } }),
        });

        const data = await response.json();

        if (data.errors) {
            console.error('Error en la respuesta GraphQL:', data.errors);
            results.innerHTML = '<p>Error en la búsqueda.</p>';
            loading.style.display = 'none';
            return;
        }

        // Filtramos solo animes
        const animeList = data.data.Page.media.filter(item => item.type === "ANIME");

        if (animeList.length === 0) {
            results.innerHTML = '<p>No se encontraron animes.</p>';
            loading.style.display = 'none';
            return;
        }

        results.innerHTML = '';
        animeList.forEach(anime => {
            const year = anime.startDate.year;
            const month = anime.startDate.month;
            const day = anime.startDate.day;
            const title = anime.title.english || anime.title.romaji;
            const card = document.createElement('div');
            
            card.className = 'card';
            card.innerHTML = `
                <img src="${anime.coverImage.large}" alt="Portada de ${title}" />
                <div class="title">${title}</div>
            `;
            card.addEventListener('click', () => {
                console.log(anime);
                const searchUrl = `https://www.crunchyroll.com/search?from=search&q=${encodeURIComponent(title)}`;
                window.open(searchUrl, '_blank');
            });
            results.appendChild(card);
        });

    } catch (error) {
        console.error('Error de red o excepción:', error);
        results.innerHTML = '<p>Error de red o servidor.</p>';
    } finally {
        loading.style.display = 'none';
    }
}
