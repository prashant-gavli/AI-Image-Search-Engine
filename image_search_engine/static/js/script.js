document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.getElementById('search-input');
    const searchBtn = document.getElementById('search-btn');
    const gallery = document.getElementById('gallery');
    const resultsInfo = document.getElementById('results-info');
    const pagination = document.getElementById('pagination');
    
    let currentPage = 1;
    let currentQuery = '';
    let totalPages = 1;
    
    // Event listeners
    searchBtn.addEventListener('click', performSearch);
    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            performSearch();
        }
    });
    
    // Perform search function
    function performSearch() {
        const query = searchInput.value.trim();
        if (query) {
            currentQuery = query;
            currentPage = 1;
            fetchImages(query, currentPage);
        }
    }
    
    // Fetch images from backend
    function fetchImages(query, page) {
        gallery.innerHTML = '<div class="loading">Loading...</div>';
        
        fetch(`/search?query=${encodeURIComponent(query)}&page=${page}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                displayResults(data);
            })
            .catch(error => {
                gallery.innerHTML = `<div class="error">Error: ${error.message}</div>`;
                console.error('Error:', error);
            });
    }
    
    // Display results
    function displayResults(data) {
        // Clear previous results
        gallery.innerHTML = '';
        
        // Update results info
        resultsInfo.textContent = `Found ${data.total} images for "${currentQuery}"`;
        
        // Display images
        if (data.results && data.results.length > 0) {
            data.results.forEach(image => {
                const imageCard = document.createElement('div');
                imageCard.className = 'image-card';
                
                imageCard.innerHTML = `
                    <img src="${image.thumb}" alt="${image.alt}" data-full="${image.url}">
                    <div class="image-info">
                        <p>Photo by <a href="${image.profile_link}" target="_blank">${image.photographer}</a></p>
                    </div>
                `;
                
                // Add click event to show full image
                imageCard.querySelector('img').addEventListener('click', function() {
                    window.open(this.dataset.full, '_blank');
                });
                
                gallery.appendChild(imageCard);
            });
        } else {
            gallery.innerHTML = '<div class="no-results">No images found. Try a different search term.</div>';
        }
        
        // Update pagination
        totalPages = data.total_pages;
        updatePagination();
    }
    
    // Update pagination buttons
    function updatePagination() {
        pagination.innerHTML = '';
        
        if (totalPages <= 1) return;
        
        // Previous button
        if (currentPage > 1) {
            const prevBtn = document.createElement('button');
            prevBtn.innerHTML = '<i class="fas fa-chevron-left"></i> Previous';
            prevBtn.addEventListener('click', () => {
                currentPage--;
                fetchImages(currentQuery, currentPage);
                window.scrollTo({ top: 0, behavior: 'smooth' });
            });
            pagination.appendChild(prevBtn);
        }
        
        // Page buttons
        const startPage = Math.max(1, currentPage - 2);
        const endPage = Math.min(totalPages, currentPage + 2);
        
        for (let i = startPage; i <= endPage; i++) {
            const pageBtn = document.createElement('button');
            pageBtn.textContent = i;
            if (i === currentPage) {
                pageBtn.classList.add('active');
            }
            pageBtn.addEventListener('click', () => {
                currentPage = i;
                fetchImages(currentQuery, currentPage);
                window.scrollTo({ top: 0, behavior: 'smooth' });
            });
            pagination.appendChild(pageBtn);
        }
        
        // Next button
        if (currentPage < totalPages) {
            const nextBtn = document.createElement('button');
            nextBtn.innerHTML = 'Next <i class="fas fa-chevron-right"></i>';
            nextBtn.addEventListener('click', () => {
                currentPage++;
                fetchImages(currentQuery, currentPage);
                window.scrollTo({ top: 0, behavior: 'smooth' });
            });
            pagination.appendChild(nextBtn);
        }
    }
    
    // Initial load with a default search
    fetchImages('nature', 1);
});