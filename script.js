document.addEventListener('DOMContentLoaded', function() {
    // Logo functionality
    const logoLink = document.getElementById('logo-link');
    const logo = document.getElementById('logo');
    
    // Function to set logo source
    window.setLogo = function(logoSrc) {
        logo.src = logoSrc;
        logo.style.display = 'block';
    };
    
    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
    
    // Highlight active navigation item
    const sections = document.querySelectorAll('.section');
    const navLinks = document.querySelectorAll('.nav-menu a');
    
    function highlightActiveSection() {
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop - 100;
            if (window.pageYOffset >= sectionTop) {
                current = section.getAttribute('id');
            }
        });
        
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === '#' + current) {
                link.classList.add('active');
            }
        });
    }
    
    window.addEventListener('scroll', highlightActiveSection);
    
    // Copy code functionality
    document.querySelectorAll('.code-block').forEach(block => {
        const button = document.createElement('button');
        button.className = 'copy-btn';
        button.textContent = 'Copy';
        button.style.cssText = `
            position: absolute;
            top: 10px;
            right: 10px;
            background: #0ea5e9;
            color: white;
            border: none;
            padding: 5px 10px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 12px;
            opacity: 0;
            transition: opacity 0.3s;
        `;
        
        block.style.position = 'relative';
        block.appendChild(button);
        
        block.addEventListener('mouseenter', () => {
            button.style.opacity = '1';
        });
        
        block.addEventListener('mouseleave', () => {
            button.style.opacity = '0';
        });
        
        button.addEventListener('click', () => {
            const code = block.querySelector('code').textContent;
            navigator.clipboard.writeText(code).then(() => {
                button.textContent = 'Copied!';
                setTimeout(() => {
                    button.textContent = 'Copy';
                }, 2000);
            });
        });
    });
    
    // Global Search functionality
    const searchContainer = document.createElement('div');
    searchContainer.style.cssText = 'position: relative; display: inline-block;';
    
    const searchInput = document.createElement('input');
    searchInput.type = 'text';
    searchInput.placeholder = 'Search functions, methods...';
    searchInput.style.cssText = `
        padding: 8px 12px;
        border: 1px solid #ddd;
        border-radius: 4px;
        font-size: 14px;
        width: 250px;
    `;
    
    const searchResults = document.createElement('div');
    searchResults.style.cssText = `
        position: absolute;
        top: 100%;
        left: 0;
        right: 0;
        background: white;
        border: 1px solid #ddd;
        border-top: none;
        border-radius: 0 0 4px 4px;
        max-height: 300px;
        overflow-y: auto;
        z-index: 1000;
        display: none;
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    `;
    
    searchContainer.appendChild(searchInput);
    searchContainer.appendChild(searchResults);
    
    const navMenu = document.querySelector('.nav-menu');
    navMenu.appendChild(searchContainer);
    
    // Global search data
    let globalSearchData = [];
    const pages = [
        { name: 'index.html', title: 'Home' },
        { name: 'getting-started.html', title: 'Getting Started' },
        { name: 'syntax.html', title: 'Syntax' },
        { name: 'temporal.html', title: 'Temporal' },
        { name: 'data-structures.html', title: 'Data Structures' },
        { name: 'functions.html', title: 'Functions' },
        { name: 'examples.html', title: 'Examples' }
    ];
    
    async function loadGlobalSearchData() {
        const items = [];
        
        // Add current page items
        items.push(...findSearchableItemsFromDOM(document, window.location.pathname.split('/').pop() || 'index.html'));
        
        // Load other pages
        for (const page of pages) {
            if (page.name !== (window.location.pathname.split('/').pop() || 'index.html')) {
                try {
                    const response = await fetch(page.name);
                    const html = await response.text();
                    const parser = new DOMParser();
                    const doc = parser.parseFromString(html, 'text/html');
                    items.push(...findSearchableItemsFromDOM(doc, page.name));
                } catch (error) {
                    console.warn(`Could not load ${page.name}:`, error);
                }
            }
        }
        
        return items;
    }
    
    function findSearchableItemsFromDOM(doc, pageName) {
        const items = [];
        const pageTitle = pages.find(p => p.name === pageName)?.title || pageName;
        
        // Find function definitions, method calls, and important terms
        doc.querySelectorAll('code').forEach(code => {
            const text = code.textContent;
            const lines = text.split('\n');
            
            lines.forEach((line, index) => {
                // Match function definitions and calls
                const functionMatches = line.match(/\b(\w+)\s*\(/g);
                if (functionMatches) {
                    functionMatches.forEach(match => {
                        const funcName = match.replace(/\s*\($/, '');
                        if (funcName.length > 2 && !funcName.match(/^(if|for|while|let|func)$/)) {
                            items.push({
                                name: funcName,
                                context: line.trim(),
                                type: 'function',
                                page: pageName,
                                pageTitle: pageTitle
                            });
                        }
                    });
                }
                
                // Match class/struct definitions
                const classMatches = line.match(/\b(class|struct)\s+(\w+)/g);
                if (classMatches) {
                    classMatches.forEach(match => {
                        const className = match.split(/\s+/)[1];
                        items.push({
                            name: className,
                            context: line.trim(),
                            type: 'class',
                            page: pageName,
                            pageTitle: pageTitle
                        });
                    });
                }
            });
        });
        
        // Find headings
        doc.querySelectorAll('h1, h2, h3, h4').forEach(heading => {
            const text = heading.textContent.trim();
            if (text && text.length > 2) {
                items.push({
                    name: text,
                    context: text,
                    type: 'heading',
                    page: pageName,
                    pageTitle: pageTitle
                });
            }
        });
        
        return items;
    }
    
    // Initialize global search data
    loadGlobalSearchData().then(data => {
        globalSearchData = data;
    });
    
    searchInput.addEventListener('input', function(e) {
        const searchTerm = e.target.value.toLowerCase().trim();
        
        if (searchTerm === '') {
            searchResults.style.display = 'none';
            return;
        }
        
        const matches = globalSearchData.filter(item => 
            item.name.toLowerCase().includes(searchTerm)
        ).slice(0, 10);
        
        if (matches.length > 0) {
            searchResults.innerHTML = matches.map(match => `
                <div class="search-result" style="
                    padding: 8px 12px;
                    cursor: pointer;
                    border-bottom: 1px solid #eee;
                    hover: background-color: #f5f5f5;
                ">
                    <div style="font-weight: bold; color: #0284c7;">${match.name}</div>
                    <div style="font-size: 12px; color: #666; margin-top: 2px;">${match.context}</div>
                    <div style="font-size: 10px; color: #999; margin-top: 2px;">${match.type} • ${match.pageTitle}</div>
                </div>
            `).join('');
            
            searchResults.style.display = 'block';
            
            // Add click handlers to search results
            searchResults.querySelectorAll('.search-result').forEach((result, index) => {
                result.addEventListener('mouseenter', () => {
                    result.style.backgroundColor = '#f5f5f5';
                });
                result.addEventListener('mouseleave', () => {
                    result.style.backgroundColor = 'white';
                });
                
                result.addEventListener('click', () => {
                    const match = matches[index];
                    
                    // Navigate to the page if it's different from current
                    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
                    if (match.page !== currentPage) {
                        // Store search term to highlight after page load
                        sessionStorage.setItem('searchHighlight', match.name);
                        window.location.href = match.page;
                    } else {
                        // Find and highlight on current page
                        highlightSearchTerm(match.name);
                    }
                    
                    searchResults.style.display = 'none';
                    searchInput.value = '';
                });
            });
        } else {
            searchResults.innerHTML = '<div style="padding: 12px; color: #666; text-align: center;">No results found</div>';
            searchResults.style.display = 'block';
        }
    });
    
    // Hide search results when clicking outside
    document.addEventListener('click', function(e) {
        if (!searchContainer.contains(e.target)) {
            searchResults.style.display = 'none';
        }
    });
    
    // Handle keyboard navigation
    searchInput.addEventListener('keydown', function(e) {
        const results = searchResults.querySelectorAll('.search-result');
        let selected = searchResults.querySelector('.search-result.selected');
        
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (selected) {
                selected.classList.remove('selected');
                selected.style.backgroundColor = 'white';
                const next = selected.nextElementSibling;
                if (next) {
                    next.classList.add('selected');
                    next.style.backgroundColor = '#e0f2fe';
                }
            } else if (results.length > 0) {
                results[0].classList.add('selected');
                results[0].style.backgroundColor = '#e0f2fe';
            }
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            if (selected) {
                selected.classList.remove('selected');
                selected.style.backgroundColor = 'white';
                const prev = selected.previousElementSibling;
                if (prev) {
                    prev.classList.add('selected');
                    prev.style.backgroundColor = '#e0f2fe';
                }
            }
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (selected) {
                selected.click();
            }
        } else if (e.key === 'Escape') {
            searchResults.style.display = 'none';
        }
    });
    
    // Function to highlight search term on page
    function highlightSearchTerm(term) {
        const elements = document.querySelectorAll('code, h1, h2, h3, h4');
        
        for (const element of elements) {
            if (element.textContent.toLowerCase().includes(term.toLowerCase())) {
                element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                element.style.backgroundColor = '#dcfce7';
                element.style.border = '2px solid #16a34a';
                
                setTimeout(() => {
                    element.style.backgroundColor = '';
                    element.style.border = '';
                }, 3000);
                break;
            }
        }
    }
    
    // Check for search highlight on page load
    const highlightTerm = sessionStorage.getItem('searchHighlight');
    if (highlightTerm) {
        sessionStorage.removeItem('searchHighlight');
        setTimeout(() => highlightSearchTerm(highlightTerm), 500);
    }
    
    // Collapsible sections
    document.querySelectorAll('.section h2').forEach(header => {
        header.style.cursor = 'pointer';
        header.addEventListener('click', function() {
            const section = this.parentElement;
            const content = Array.from(section.children).slice(1);
            
            content.forEach(element => {
                if (element.style.display === 'none') {
                    element.style.display = 'block';
                    this.textContent = this.textContent.replace('▶ ', '');
                } else {
                    element.style.display = 'none';
                    this.textContent = '▶ ' + this.textContent;
                }
            });
        });
    });
    
    // Remove any existing syntax highlighting spans
    document.querySelectorAll('code').forEach(code => {
        code.innerHTML = code.textContent;
    });
});