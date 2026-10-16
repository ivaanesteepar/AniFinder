// Cliente compartido para la API pública de anime.
(() => {
    let animeApiQueue = Promise.resolve();
    let lastAnimeApiRequestAt = 0;

    function wait(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    function retryDelay(response, attempt) {
        const retryAfter = response?.headers?.get('Retry-After');
        if (retryAfter) {
            const seconds = Number(retryAfter);
            if (Number.isFinite(seconds)) return Math.max(0, seconds * 1000);

            const retryAt = Date.parse(retryAfter);
            if (!Number.isNaN(retryAt)) return Math.max(0, retryAt - Date.now());
        }
        return Math.min(1000 * (2 ** attempt), 8000);
    }

    async function requestAnimeApi(url) {
        for (let attempt = 0; attempt < 4; attempt++) {
            const spacing = 400 - (Date.now() - lastAnimeApiRequestAt);
            if (spacing > 0) await wait(spacing);

            let response;
            try {
                response = await fetch(url);
            } catch (error) {
                if (attempt === 3) throw error;
                await wait(Math.min(1000 * (2 ** attempt), 8000));
                continue;
            }

            lastAnimeApiRequestAt = Date.now();
            if (response.ok) return response;

            if ((response.status === 429 || response.status >= 500) && attempt < 3) {
                await wait(retryDelay(response, attempt));
                continue;
            }

            throw new Error(`Tenrai respondió con HTTP ${response.status}`);
        }
        throw new Error('No se pudo conectar con Tenrai. Inténtalo de nuevo.');
    }

    function fetchAnimeApi(url) {
        const request = animeApiQueue.then(() => requestAnimeApi(url));
        animeApiQueue = request.catch(() => {});
        return request;
    }

    window.AniFinderAPI = { fetchAnimeApi };
})();
