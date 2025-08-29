// Advanced search module for titlebar integration
// Provides a debounced, fuzzy search API and dispatches results via events

(function(window){
    class AdvancedSearch {
        constructor(options = {}) {
            this.products = options.products || [];
            this.debounceMs = options.debounceMs || 220;
            this.maxResults = options.maxResults || 50;
            this._timeout = null;
        }

        setProducts(list) {
            this.products = Array.isArray(list) ? list : [];
        }

        // Simple fuzzy scoring: checks name, description, category and gives a score
        scoreItem(item, query) {
            const q = query.toLowerCase();
            let score = 0;
            if (item.name.toLowerCase().includes(q)) score += 50;
            if (item.description.toLowerCase().includes(q)) score += 20;
            if ((item.category || '').toLowerCase().includes(q)) score += 15;
            if ((item.tags || []).some(t => t.toLowerCase().includes(q))) score += 10;
            return score;
        }

        search(query) {
            clearTimeout(this._timeout);
            return new Promise((resolve) => {
                this._timeout = setTimeout(() => {
                    if (!query || !query.trim()) {
                        const empty = [];
                        document.dispatchEvent(new CustomEvent('advanced-search-results', { detail: { query, results: empty }}));
                        return resolve(empty);
                    }

                    const q = query.trim().toLowerCase();
                    const results = this.products
                        .map(p => ({ p, score: this.scoreItem(p, q) }))
                        .filter(x => x.score > 0)
                        .sort((a,b) => b.score - a.score)
                        .slice(0, this.maxResults)
                        .map(x => x.p);

                    document.dispatchEvent(new CustomEvent('advanced-search-results', { detail: { query, results }}));
                    resolve(results);
                }, this.debounceMs);
            });
        }
    }

    // Expose a global instance
    window.AdvancedSearch = new AdvancedSearch();
})(window);
