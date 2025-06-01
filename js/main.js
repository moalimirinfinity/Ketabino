// js/main.js
document.addEventListener('DOMContentLoaded', () => {
    feather.replace(); // Initialize Feather Icons globally

    // --- User Authentication Simulation & Redirection ---
    const isLoggedIn = localStorage.getItem('ketabinoUserLoggedIn') === 'true';
    const currentPage = window.location.pathname.split('/').pop() || 'index.html'; // Default to index.html if path is empty

    if (!isLoggedIn && currentPage !== 'index.html') {
        window.location.href = 'index.html'; // Redirect to index.html if not logged in
        return; // Stop further execution if redirecting
    }
    if (isLoggedIn && currentPage === 'index.html') {
        window.location.href = 'discover.html'; // Redirect logged-in users away from index (login) page
        return;
    }

    // --- Global Navigation & User Dropdown ---
    function setupGlobalNav() {
        const mainNav = document.querySelector('nav.main-nav');
        const streakBarContainer = document.querySelector('.streak-progress-bar-container');
        if (!mainNav || !streakBarContainer) return;

        const userStreak = localStorage.getItem('ketabinoUserStreak') || '0';
        const userName = localStorage.getItem('ketabinoUserName') || 'User';

        mainNav.innerHTML = `
            <div class="container">
                <a href="discover.html" class="logo">Ketabino</a>
                <div class="nav-links">
                    <a href="discover.html" class="${currentPage === 'discover.html' ? 'active' : ''}">Discover</a>
                    <a href="library.html" class="${currentPage === 'library.html' ? 'active' : ''}">Library</a>
                    <a href="me.html" class="${currentPage === 'me.html' ? 'active' : ''}">Me</a>
                </div>
                <div class="user-actions">
                    <span class="streak-indicator"><i data-feather="zap"></i> ${userStreak} days</span>
                    <div class="user-avatar-container" tabindex="0">
                        <div class="user-avatar" style="background-image: url('https://placehold.co/40x40/1A535C/FFFFFF?text=${userName.substring(0,1).toUpperCase()}');">
                            <span class="visually-hidden">User menu</span>
                        </div>
                        <div class="user-dropdown">
                            <a href="me.html"><i data-feather="user"></i> Profile</a>
                            <a href="${currentPage === 'me.html' ? '#settings-card-anchor' : 'me.html#settings-card-anchor'}" id="settingsDropdownLink"><i data-feather="settings"></i> Settings</a>
                            <div class="dropdown-divider"></div>
                            <a href="#" id="logoutButton"><i data-feather="log-out"></i> Logout</a>
                        </div>
                    </div>
                </div>
            </div>
        `;

        streakBarContainer.innerHTML = `
            <div class="container" style="padding-top:0; padding-bottom:0;">
                <div class="streak-progress-bar" style="width: ${(parseInt(userStreak) / 30 * 100)}%;" title="Day ${userStreak} of reading streak. Keep it up!">
                     <span class="streak-tooltip">Day ${userStreak} of reading streak!</span>
                </div>
            </div>
        `;
        feather.replace();

        const userAvatarContainer = mainNav.querySelector('.user-avatar-container');
        if (userAvatarContainer) {
            userAvatarContainer.addEventListener('click', (event) => {
                event.stopPropagation();
                userAvatarContainer.classList.toggle('active');
            });
            userAvatarContainer.addEventListener('keydown', (event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    userAvatarContainer.classList.toggle('active');
                }
            });
        }

        document.addEventListener('click', (event) => {
            if (userAvatarContainer && userAvatarContainer.classList.contains('active') && !userAvatarContainer.contains(event.target)) {
                userAvatarContainer.classList.remove('active');
            }
        });

        const logoutButton = document.getElementById('logoutButton');
        if (logoutButton) {
            logoutButton.addEventListener('click', (e) => {
                e.preventDefault();
                localStorage.removeItem('ketabinoUserLoggedIn');
                localStorage.removeItem('ketabinoUserStreak');
                localStorage.removeItem('ketabinoUserName');
                localStorage.removeItem('ketabinoBooksData'); // Clear book states on logout for fresh demo
                window.location.href = 'index.html'; // Changed from login.html
            });
        }

        const settingsDropdownLink = document.getElementById('settingsDropdownLink');
        if (settingsDropdownLink) {
            settingsDropdownLink.addEventListener('click', (e) => {
                if (currentPage === 'me.html') {
                    e.preventDefault();
                    const settingsAnchor = document.getElementById('settings-card-anchor');
                    if (settingsAnchor) {
                        settingsAnchor.scrollIntoView({ behavior: 'smooth' });
                    }
                    if (userAvatarContainer) userAvatarContainer.classList.remove('active');
                }
                // If not on me.html, the default href (me.html#settings-card-anchor) will navigate.
            });
        }
    }
    if (currentPage !== 'index.html') { // Changed from login.html
        setupGlobalNav();
    }


    // --- Placeholder Book Data (with isSaved and isDownloaded) ---
    let booksData = JSON.parse(localStorage.getItem('ketabinoBooksData')) || {
        "1": { id: "1", title: "The Silent Patient", author: "Alex Michaelides", time: "15-min read", cover: "https://placehold.co/400x600/1A535C/FFFFFF?text=Silent+Patient", summaryPages: ["Summary page 1/3 for Silent Patient. Key insights...", "Page 2/3. Further discussion on themes...", "Page 3/3. Concluding thoughts and takeaways."], status: "finished", finishedDate: "May 28, 2024", progress: 100, isSaved: true, isDownloaded: false },
        "2": { id: "2", title: "Atomic Habits", author: "James Clear", time: "20-min read", cover: "https://placehold.co/400x600/FF6B6B/FFFFFF?text=Atomic+Habits", summaryPages: ["Summary page 1/2 for Atomic Habits. Core principles...", "Page 2/2. Practical application and benefits."], status: "in-progress", progress: 50, isSaved: true, isDownloaded: true },
        "3": { id: "3", title: "Sapiens: A Brief History of Humankind", author: "Yuval Noah Harari", time: "25-min read", cover: "https://placehold.co/400x600/FFC300/000000?text=Sapiens", summaryPages: ["Page 1/4: The Cognitive Revolution.", "Page 2/4: The Agricultural Revolution.", "Page 3/4: The Unification of Humankind.", "Page 4/4: The Scientific Revolution and beyond."], status: "saved", progress: 0, isSaved: true, isDownloaded: false },
        "4": { id: "4", title: "Educated", author: "Tara Westover", time: "18-min read", cover: "https://placehold.co/400x600/28A745/FFFFFF?text=Educated", summaryPages: ["Page 1/3: Early life and challenges.", "Page 2/3: The pursuit of education.", "Page 3/3: Transformation and reflection."], status: "downloaded", progress: 0, isSaved: false, isDownloaded: true },
    };

    function saveBooksData() {
        localStorage.setItem('ketabinoBooksData', JSON.stringify(booksData));
    }

    let currentBookId = null;
    let currentPageIndex = 0;

    // --- Discover Page Functionality ---
    if (currentPage === 'discover.html') {
        const bookGrid = document.getElementById('bookGrid');
        const searchBarInput = document.getElementById('searchBarInput');
        const filterTabsNav = document.getElementById('filterTabsNav');

        function renderBookCard(book) {
            return `
                <article class="book-card" data-book-id="${book.id}">
                    <div class="cover-image-container">
                        <img src="${book.cover}" alt="${book.title}">
                        <span class="badge badge-primary summary-length-badge">${book.time}</span>
                    </div>
                    <div class="card-content">
                        <h3 class="book-title">${book.title}</h3>
                        <p class="book-author">${book.author}</p>
                        <div class="card-actions">
                            <button class="btn-icon save-btn ${book.isSaved ? 'saved' : ''}" title="Save">
                                <i data-feather="bookmark"></i>
                            </button>
                            <button class="btn-icon download-btn ${book.isDownloaded ? 'downloaded' : ''}" title="Download">
                                <i data-feather="download"></i>
                            </button>
                        </div>
                    </div>
                </article>
            `;
        }

        function displayBooks(searchTerm = '') {
            if (!bookGrid) return; // Guard against null if element not found
            bookGrid.innerHTML = '';
            let booksToDisplay = Object.values(booksData);
            const activeFilterTab = filterTabsNav ? filterTabsNav.querySelector('.tab-link.active').dataset.filter : 'all';


            if (searchTerm) {
                 booksToDisplay = booksToDisplay.filter(book =>
                    book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    book.author.toLowerCase().includes(searchTerm.toLowerCase())
                );
            } else if (activeFilterTab !== 'all') {
                // Placeholder for category/trending/new filtering
                console.log("Filtering by tab (not fully implemented):", activeFilterTab);
            }


            if (booksToDisplay.length === 0) {
                bookGrid.innerHTML = `<p class="text-muted text-center" style="grid-column: 1 / -1;">No books found.</p>`;
            } else {
                booksToDisplay.forEach(book => {
                    bookGrid.insertAdjacentHTML('beforeend', renderBookCard(book));
                });
            }
            feather.replace();
            addBookCardEventListeners();
        }

        displayBooks();

        if (searchBarInput) {
            searchBarInput.addEventListener('input', (e) => {
                displayBooks(e.target.value);
            });
        }
        if (filterTabsNav) {
            filterTabsNav.querySelectorAll('.tab-link').forEach(tab => {
                tab.addEventListener('click', () => {
                    filterTabsNav.querySelector('.active').classList.remove('active');
                    tab.classList.add('active');
                    displayBooks(searchBarInput ? searchBarInput.value : '');
                });
            });
        }
    }

    // --- Library Page Functionality ---
    if (currentPage === 'library.html') {
        const libraryContentContainer = document.getElementById('libraryContentContainer');
        const libraryTabsNav = document.getElementById('libraryTabsNav');

        function renderLibraryItem(book) {
            let actionsHtml = '';
            if (book.status === 'finished') {
                actionsHtml = `
                    <button class="btn btn-outline-primary btn-sm review-mindmap-btn" data-book-id="${book.id}"><i data-feather="git-merge"></i> Mindmap</button>
                    <button class="btn btn-secondary btn-sm take-quiz-btn" data-book-id="${book.id}"><i data-feather="help-circle"></i> Take Quiz</button>
                `;
            } else if (book.status === 'in-progress' || book.status === 'downloaded' || book.status === 'saved') {
                 actionsHtml = `<button class="btn btn-primary btn-sm continue-reading-btn" data-book-id="${book.id}"><i data-feather="play-circle"></i> ${book.progress > 0 ? 'Continue' : 'Start Reading'}</button>`;
            }

            let statusBadge = '';
            if (book.status === 'finished' && book.finishedDate) {
                statusBadge = `<span class="badge badge-success">Finished: ${book.finishedDate}</span>`;
            } else if (book.status === 'in-progress') {
                statusBadge = `<span class="badge badge-accent">In Progress</span>`;
            } else if (book.status === 'downloaded') {
                statusBadge = `<span class="badge badge-info">Downloaded</span>`;
            } else if (book.status === 'saved') {
                statusBadge = `<span class="badge badge-light">Saved</span>`;
            }

            let progressHtml = '';
            if (book.status === 'in-progress' && book.progress > 0 && book.progress < 100) {
                progressHtml = `
                    <div class="library-item-progress-container">
                        <div class="library-item-progress-bar"><div class="progress" style="width: ${book.progress}%;"></div></div>
                        <p class="library-item-progress-text">${book.progress}% complete</p>
                    </div>`;
            }

            return `
                <article class="library-item card" data-book-id="${book.id}">
                    <div class="library-item-cover">
                        <img src="${book.cover}" alt="${book.title}">
                    </div>
                    <div class="library-item-info">
                        <h3 class="item-title book-title-clickable" data-book-id="${book.id}">${book.title}</h3>
                        <p class="item-author">${book.author}</p>
                        <div class="item-status">${statusBadge}</div>
                        ${progressHtml}
                    </div>
                    <div class="library-item-actions">
                        ${actionsHtml}
                    </div>
                </article>
            `;
        }

        function displayLibraryBooks(filter = 'all') {
            if (!libraryContentContainer) return;
            libraryContentContainer.innerHTML = '';
            let booksToDisplay = Object.values(booksData);

            if (filter !== 'all') {
                booksToDisplay = booksToDisplay.filter(book => {
                    if (filter === 'saved') return book.isSaved; // Show all saved books
                    if (filter === 'downloaded') return book.isDownloaded;
                    return book.status === filter;
                });
            }

            if (booksToDisplay.length === 0) {
                libraryContentContainer.innerHTML = `
                    <div class="empty-library-message">
                        <i data-feather="book"></i>
                        <p>Your '${filter}' library is empty.</p>
                        ${filter !== 'all' ? '<p>Try a different section or discover new books!</p>' : ''}
                        <a href="discover.html" class="btn btn-primary mt-1"><i data-feather="search"></i> Discover Books</a>
                    </div>
                `;
            } else {
                 const contentDiv = document.createElement('div');
                 booksToDisplay.forEach(book => {
                    contentDiv.insertAdjacentHTML('beforeend', renderLibraryItem(book));
                });
                libraryContentContainer.appendChild(contentDiv);
            }
            feather.replace();
            addLibraryItemEventListeners();
        }

        displayLibraryBooks('all');

        if (libraryTabsNav) {
            libraryTabsNav.querySelectorAll('.tab-link').forEach(tab => {
                tab.addEventListener('click', () => {
                    libraryTabsNav.querySelector('.active').classList.remove('active');
                    tab.classList.add('active');
                    displayLibraryBooks(tab.dataset.filter);
                });
            });
        }
    }

    // --- "Me" Page Functionality ---
    if (currentPage === 'me.html') {
        const userStreak = localStorage.getItem('ketabinoUserStreak') || '0';
        const userName = localStorage.getItem('ketabinoUserName') || 'Ketabino User';
        const profileUserName = document.getElementById('profileUserName');
        const profileUserAvatar = document.getElementById('profileUserAvatar');
        const profileStreak = document.getElementById('profileStreak');
        const leaderboardUserName = document.getElementById('leaderboardUserName');
        const leaderboardUserAvatar = document.getElementById('leaderboardUserAvatar');


        if(profileUserName) profileUserName.textContent = userName;
        if(profileUserAvatar) profileUserAvatar.style.backgroundImage = `url('https://placehold.co/120x120/1A535C/FFFFFF?text=${userName.substring(0,1).toUpperCase()}')`;
        if(profileStreak) profileStreak.textContent = `${userStreak} days`;

        if(leaderboardUserName) leaderboardUserName.textContent = `${userName} (You)`;
        if(leaderboardUserAvatar) leaderboardUserAvatar.src = `https://placehold.co/30x30/1A535C/FFFFFF?text=${userName.substring(0,1).toUpperCase()}`;

        const saveSettingsBtn = document.getElementById('saveSettingsBtn');
        if (saveSettingsBtn) {
            saveSettingsBtn.addEventListener('click', () => {
                alert('Settings saved (simulation)!');
            });
        }
    }


    // --- Book Detail Modal Functionality (Shared) ---
    const bookDetailModal = document.getElementById('bookDetailModal');
    const modalBookContent = document.getElementById('modalBookContent') || document.getElementById('modalBookContentLib');
    const modalBookTitleHeader = document.getElementById('modalBookTitleHeader');
    const closeBookDetailModalBtn = document.getElementById('closeBookDetailModal') || document.getElementById('closeBookDetailModalLib');

    function openBookDetailModal(bookId) {
        currentBookId = bookId;
        const book = booksData[currentBookId];
        if (!book || !modalBookContent || !bookDetailModal) return;

        // Determine initial page for summary reader
        if (book.status === 'in-progress' && book.progress > 0 && book.progress < 100) {
            currentPageIndex = Math.floor((book.progress / 100) * book.summaryPages.length);
            // Ensure it's a valid index, not exceeding length - 1
            currentPageIndex = Math.max(0, Math.min(currentPageIndex, book.summaryPages.length - 1));
        } else {
            currentPageIndex = 0; // Start from beginning for new or finished books
        }

        modalBookContent.innerHTML = `
            <div class="modal-book-layout">
                <div class="modal-book-cover">
                    <img src="${book.cover}" alt="${book.title}">
                </div>
                <div class="modal-book-info">
                    <h3 class="book-title" style="font-size: 1.75rem; margin-bottom: 0.25rem;">${book.title}</h3>
                    <p class="book-author" style="font-size: 1rem; color: var(--text-muted); margin-bottom: 0.75rem;">By ${book.author}</p>
                    <span class="badge badge-accent">${book.time}</span>

                    <div class="d-flex gap-1 mt-1 mb-2">
                        <button class="btn-icon modal-save-btn ${book.isSaved ? 'saved' : ''}" title="Save">
                            <i data-feather="bookmark"></i> <span class="btn-icon-text visually-hidden">Save</span>
                        </button>
                        <button class="btn-icon modal-download-btn ${book.isDownloaded ? 'downloaded' : ''}" title="Download">
                            <i data-feather="download"></i> <span class="btn-icon-text visually-hidden">Download</span>
                        </button>
                    </div>

                    <div class="action-buttons">
                        <button class="btn btn-primary" id="modalReadSummaryBtn"><i data-feather="eye"></i> ${book.status === 'in-progress' && book.progress < 100 ? 'Continue Reading' : 'Read Summary'}</button>
                        <button class="btn btn-secondary" id="modalListenSummaryBtn"><i data-feather="headphones"></i> Listen Summary</button>
                    </div>

                    <div id="summaryReaderView" style="display:none;">
                        <h4>Summary</h4>
                        <p id="summaryTextContent"></p>
                        <div class="pagination-controls mt-1">
                            <button class="btn btn-outline-primary btn-sm" id="modalPrevPageBtn" disabled><i data-feather="arrow-left"></i> Prev</button>
                            <span id="modalPaginationInfo"></span>
                            <button class="btn btn-outline-primary btn-sm" id="modalNextPageBtn">Next <i data-feather="arrow-right"></i></button>
                        </div>
                        <div id="postSummaryOptions" style="display:none;">
                             <h5>Finished Summary! What's next?</h5>
                             <button class="btn btn-primary modal-action-btn" data-action="mindmap"><i data-feather="git-merge"></i> View Mindmap</button>
                             <button class="btn btn-secondary modal-action-btn" data-action="quiz"><i data-feather="help-circle"></i> Take Quiz</button>
                        </div>
                    </div>
                    <div id="summaryListenerView" style="display:none;">
                        <h4>Listening to Summary...</h4>
                        <div style="background-color:var(--neutral-bg); padding:1rem; border-radius:var(--border-radius-md); text-align:center;">
                            <p>Audio Player Controls (Placeholder)</p>
                            <div class="d-flex justify-center gap-1 mt-1 mb-1">
                                <button class="btn btn-icon"><i data-feather="rewind"></i></button>
                                <button class="btn btn-icon" style="background-color:var(--primary-color); color:white; border-radius:50%; width:40px; height:40px;"><i data-feather="play"></i></button>
                                <button class="btn btn-icon"><i data-feather="fast-forward"></i></button>
                            </div>
                            <button class="btn btn-sm btn-secondary mt-1" id="modalFinishListeningBtn">Simulate Finish Listening</button>
                        </div>
                        <div id="postListenOptions" style="display:none;">
                             <h5>Finished Listening! What's next?</h5>
                             <button class="btn btn-primary modal-action-btn" data-action="mindmap"><i data-feather="git-merge"></i> View Mindmap</button>
                             <button class="btn btn-secondary modal-action-btn" data-action="quiz"><i data-feather="help-circle"></i> Take Quiz</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        if (modalBookTitleHeader) modalBookTitleHeader.textContent = book.title;
        feather.replace();
        setupModalEventListeners();
        bookDetailModal.classList.add('active');
    }

    function setupModalEventListeners() {
        const modalReadBtn = document.getElementById('modalReadSummaryBtn');
        const modalListenBtn = document.getElementById('modalListenSummaryBtn');
        const readerView = document.getElementById('summaryReaderView');
        const listenerView = document.getElementById('summaryListenerView');

        if (modalReadBtn && readerView && listenerView) {
             modalReadBtn.addEventListener('click', () => {
                readerView.style.display = 'block';
                listenerView.style.display = 'none';
                updateSummaryPageView(); // Call to load the current or first page
            });
        }
        if (modalListenBtn && readerView && listenerView) {
            modalListenBtn.addEventListener('click', () => {
                readerView.style.display = 'none';
                listenerView.style.display = 'block';
                const postListenOpts = document.getElementById('postListenOptions');
                if (postListenOpts) postListenOpts.style.display = 'none';
            });
        }

        const prevBtn = document.getElementById('modalPrevPageBtn');
        const nextBtn = document.getElementById('modalNextPageBtn');
        if (prevBtn) prevBtn.addEventListener('click', () => { if (currentPageIndex > 0) { currentPageIndex--; updateSummaryPageView(); }});
        if (nextBtn) nextBtn.addEventListener('click', () => {
            const book = booksData[currentBookId];
            if (book && currentPageIndex < book.summaryPages.length - 1) { currentPageIndex++; updateSummaryPageView(); }
        });

        const finishListenBtn = document.getElementById('modalFinishListeningBtn');
        if(finishListenBtn) finishListenBtn.addEventListener('click', () => {
            const postListenOpts = document.getElementById('postListenOptions');
            if (postListenOpts) postListenOpts.style.display = 'block';
        });

        document.querySelectorAll('.modal-action-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const action = e.currentTarget.dataset.action;
                if (action === 'mindmap') {
                    alert('Opening Mindmap (Placeholder Action)');
                } else if (action === 'quiz') {
                    if (bookDetailModal) bookDetailModal.classList.remove('active'); // Close book detail modal first
                    startQuiz(currentBookId);
                }
            });
        });

        const modalSaveBtn = modalBookContent.querySelector('.modal-save-btn');
        const modalDownloadBtn = modalBookContent.querySelector('.modal-download-btn');

        if(modalSaveBtn) modalSaveBtn.addEventListener('click', () => {
            const book = booksData[currentBookId];
            book.isSaved = !book.isSaved;
            modalSaveBtn.classList.toggle('saved', book.isSaved);
            const icon = modalSaveBtn.querySelector('i.feather-bookmark');
            if (icon) icon.style.fill = book.isSaved ? 'var(--secondary-color)' : 'none';
            updateCardIconState(currentBookId, 'save-btn', book.isSaved);
            saveBooksData();
        });
        if(modalDownloadBtn) modalDownloadBtn.addEventListener('click', () => {
            const book = booksData[currentBookId];
            book.isDownloaded = !book.isDownloaded;
            modalDownloadBtn.classList.toggle('downloaded', book.isDownloaded);
            const icon = modalDownloadBtn.querySelector('i.feather-download');
            if (icon) icon.style.fill = book.isDownloaded ? 'var(--primary-color)' : 'none';
            updateCardIconState(currentBookId, 'download-btn', book.isDownloaded);
            saveBooksData();
        });
    }

    function updateSummaryPageView() {
        const book = booksData[currentBookId];
        if (!book || !book.summaryPages || !document.getElementById('summaryTextContent')) return;

        document.getElementById('summaryTextContent').textContent = book.summaryPages[currentPageIndex];
        document.getElementById('modalPaginationInfo').textContent = `Page ${currentPageIndex + 1} of ${book.summaryPages.length}`;
        document.getElementById('modalPrevPageBtn').disabled = currentPageIndex === 0;
        document.getElementById('modalNextPageBtn').disabled = currentPageIndex === book.summaryPages.length - 1;

        const postSummaryOptions = document.getElementById('postSummaryOptions');
        if (currentPageIndex === book.summaryPages.length - 1) {
            postSummaryOptions.style.display = 'block';
            if (book.status !== 'finished') {
                book.status = 'finished';
                book.finishedDate = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric'});
                book.progress = 100;
                saveBooksData();
                if (currentPage === 'library.html') {
                    const activeFilter = document.querySelector('#libraryTabsNav .tab-link.active');
                    if (activeFilter) displayLibraryBooks(activeFilter.dataset.filter);
                }
            }
        } else {
            postSummaryOptions.style.display = 'none';
        }
        // Update progress only if not already finished
        if (book.status !== 'finished') {
            book.progress = Math.round(((currentPageIndex + 1) / book.summaryPages.length) * 100);
             if (book.progress > 0 && book.progress < 100) {
                book.status = 'in-progress';
            }
            saveBooksData();
        }
    }


    if (closeBookDetailModalBtn) {
        closeBookDetailModalBtn.addEventListener('click', () => bookDetailModal.classList.remove('active'));
    }
    if (bookDetailModal) {
        bookDetailModal.addEventListener('click', (event) => {
            if (event.target === bookDetailModal) {
                bookDetailModal.classList.remove('active');
            }
        });
    }

    function addBookCardEventListeners() {
        const bookGrid = document.getElementById('bookGrid');
        if (!bookGrid) return;
        bookGrid.querySelectorAll('.book-card').forEach(card => {
            card.addEventListener('click', (event) => {
                if (!event.target.closest('.btn-icon')) {
                    openBookDetailModal(card.dataset.bookId);
                }
            });
            addCardIconToggleListeners(card);
        });
    }

    function addLibraryItemEventListeners() {
        const libContent = document.getElementById('libraryContentContainer');
        if (!libContent) return;
        libContent.querySelectorAll('.library-item').forEach(item => {
            item.querySelectorAll('.book-title-clickable, .continue-reading-btn').forEach(el => {
                el.addEventListener('click', () => openBookDetailModal(item.dataset.bookId));
            });
            item.querySelectorAll('.review-mindmap-btn').forEach(btn => {
                 btn.addEventListener('click', () => alert(`Opening Mindmap for Book ID ${item.dataset.bookId} (Placeholder)`));
            });
            item.querySelectorAll('.take-quiz-btn').forEach(btn => {
                btn.addEventListener('click', () => startQuiz(item.dataset.bookId));
            });
        });
    }

    function addCardIconToggleListeners(cardElement) {
        const bookId = cardElement.dataset.bookId;

        const saveBtn = cardElement.querySelector('.save-btn');
        const downloadBtn = cardElement.querySelector('.download-btn');

        if (saveBtn) {
            saveBtn.addEventListener('click', (event) => {
                event.stopPropagation();
                const book = booksData[bookId];
                book.isSaved = !book.isSaved;
                saveBtn.classList.toggle('saved', book.isSaved);
                const icon = saveBtn.querySelector('i.feather-bookmark');
                if (icon) icon.style.fill = book.isSaved ? 'var(--secondary-color)' : 'none'; // Corrected fill logic
                if(bookDetailModal && bookDetailModal.classList.contains('active') && currentBookId === bookId){
                    const modalSave = modalBookContent.querySelector('.modal-save-btn');
                    if(modalSave) {
                        modalSave.classList.toggle('saved', book.isSaved);
                        const modalIcon = modalSave.querySelector('i.feather-bookmark');
                        if(modalIcon) modalIcon.style.fill = book.isSaved ? 'var(--secondary-color)' : 'none';
                    }
                }
                saveBooksData();
            });
        }
        if (downloadBtn) {
            downloadBtn.addEventListener('click', (event) => {
                event.stopPropagation();
                const book = booksData[bookId];
                book.isDownloaded = !book.isDownloaded;
                downloadBtn.classList.toggle('downloaded', book.isDownloaded);
                const icon = downloadBtn.querySelector('i.feather-download');
                if (icon) icon.style.fill = book.isDownloaded ? 'var(--primary-color)' : 'none'; // Corrected fill logic
                 if(bookDetailModal && bookDetailModal.classList.contains('active') && currentBookId === bookId){
                    const modalDownload = modalBookContent.querySelector('.modal-download-btn');
                    if(modalDownload) {
                        modalDownload.classList.toggle('downloaded', book.isDownloaded);
                        const modalIcon = modalDownload.querySelector('i.feather-download');
                        if(modalIcon) modalIcon.style.fill = book.isDownloaded ? 'var(--primary-color)' : 'none';
                    }
                }
                saveBooksData();
            });
        }
    }

    function updateCardIconState(bookId, iconClassSelector, isActive) {
        // Try to find card on Discover page
        let card = document.querySelector(`#bookGrid .book-card[data-book-id="${bookId}"]`);
        // If not found on Discover, try Library page
        if (!card) {
            card = document.querySelector(`#libraryContentContainer .library-item[data-book-id="${bookId}"]`);
        }

        if(card) {
            const iconBtn = card.querySelector(`.${iconClassSelector}`); // Use the provided class selector
            if(iconBtn) {
                const stateClass = iconClassSelector.includes('save') ? 'saved' : 'downloaded';
                iconBtn.classList.toggle(stateClass, isActive);
                const icon = iconBtn.querySelector('i');
                 if (icon) {
                    let activeColor = 'none';
                    if (isActive) {
                        activeColor = iconClassSelector.includes('save') ? 'var(--secondary-color)' : 'var(--primary-color)';
                    }
                    icon.style.fill = activeColor;
                    // Ensure stroke is also set if it was removed/changed by fill
                    if (activeColor !== 'none') {
                         icon.style.stroke = activeColor;
                    } else {
                        icon.style.stroke = 'currentColor'; // Reset to default stroke
                    }
                }
            }
        }
    }

    // --- Quiz Functionality ---
    const quizModal = document.getElementById('quizModal');
    const closeQuizModalBtn = document.getElementById('closeQuizModal');
    const quizModalTitle = document.getElementById('quizModalTitle');
    const quizQuestionArea = document.getElementById('quizQuestionArea');
    const quizResultsArea = document.getElementById('quizResultsArea');
    const quizQuestionText = document.getElementById('quizQuestionText');
    const quizOptionsContainer = document.getElementById('quizOptionsContainer');
    const quizFeedbackArea = document.getElementById('quizFeedbackArea');
    const quizNextQuestionBtn = document.getElementById('quizNextQuestionBtn');
    const quizProgressText = document.getElementById('quizProgressText');
    const quizScoreText = document.getElementById('quizScoreText');
    const quizCloseResultsBtn = document.getElementById('quizCloseResultsBtn');
    const quizModalFooter = document.getElementById('quizModalFooter');


    let currentQuizBookId = null;
    let currentQuestionIndexQuiz = 0; // Renamed to avoid conflict
    let scoreQuiz = 0; // Renamed
    let quizData = [];

    const sampleQuizBank = {
        "1": [
            { question: "What is Alicia Berenson's profession in 'The Silent Patient'?", options: ["Doctor", "Painter", "Writer", "Musician"], answer: "Painter" },
            { question: "Who is Theo Faber in relation to Alicia?", options: ["Her husband", "Her therapist", "Her brother", "Her lawyer"], answer: "Her therapist" },
            { question: "What is the central mystery surrounding Alicia?", options: ["Her disappearance", "A hidden treasure", "Why she murdered her husband", "A secret identity"], answer: "Why she murdered her husband" }
        ],
        "2": [
            { question: "What is the first law of behavior change according to James Clear in 'Atomic Habits'?", options: ["Make it attractive", "Make it obvious", "Make it easy", "Make it satisfying"], answer: "Make it obvious" },
            { question: "The concept of 'habit stacking' involves linking a new habit to an...", options: ["Existing reward", "Specific time", "Existing habit", "Desired outcome"], answer: "Existing habit" },
            { question: "What does James Clear emphasize for long-term success with habits?", options: ["Intensity", "Motivation", "Identity", "Perfection"], answer: "Identity" }
        ],
        "3": [
            { question: "According to 'Sapiens', what was the most important revolution in human history?", options: ["Industrial Revolution", "Agricultural Revolution", "Cognitive Revolution", "Scientific Revolution"], answer: "Cognitive Revolution" },
            { question: "What concept does Harari discuss as a unique human ability to cooperate flexibly in large numbers?", options: ["Tool making", "Shared myths / Fictions", "Language complexity", "Fire control"], answer: "Shared myths / Fictions" },
            { question: "Which of these is NOT a major part of the 'unification of humankind' discussed in Sapiens?", options: ["Monetary order", "Imperial orders", "Universal religions", "Genetic homogeneity"], answer: "Genetic homogeneity" }
        ],
         "4": [
            { question: "What is the primary setting of Tara Westover's childhood in 'Educated'?", options: ["A Mormon compound in Utah", "A survivalist homestead in Idaho", "An Amish farm in Pennsylvania", "A communal ranch in Montana"], answer: "A survivalist homestead in Idaho" },
            { question: "What significant injury does Tara's father, Gene, sustain?", options: ["Loses a leg in a farming accident", "Severe burns from an explosion", "Falls from a roof", "Car crash"], answer: "Severe burns from an explosion" },
            { question: "Which university does Tara eventually attend for her PhD?", options: ["Harvard University", "Stanford University", "University of Cambridge", "Yale University"], answer: "University of Cambridge" }
        ]
    };

    function startQuiz(bookId) {
        if (!quizModal) return;
        currentQuizBookId = bookId;
        // Ensure quizData for the book exists, otherwise use a default or show an error
        quizData = sampleQuizBank[bookId] || sampleQuizBank["1"]; // Fallback to book "1" quiz
        currentQuestionIndexQuiz = 0;
        scoreQuiz = 0;

        if (quizModalTitle) quizModalTitle.textContent = `Quiz: ${booksData[bookId] ? booksData[bookId].title : 'Book Quiz'}`;
        if (quizQuestionArea) quizQuestionArea.style.display = 'block';
        if (quizResultsArea) quizResultsArea.style.display = 'none';
        if (quizModalFooter) quizModalFooter.style.display = 'flex';
        if (quizNextQuestionBtn) quizNextQuestionBtn.disabled = true;
        if (quizFeedbackArea) quizFeedbackArea.style.display = 'none';

        loadQuizQuestion();
        quizModal.classList.add('active');
    }

    function loadQuizQuestion() {
        if (!quizData || currentQuestionIndexQuiz >= quizData.length) return;
        const questionData = quizData[currentQuestionIndexQuiz];

        if (quizQuestionText) quizQuestionText.textContent = questionData.question;
        if (quizOptionsContainer) quizOptionsContainer.innerHTML = '';
        if (quizFeedbackArea) quizFeedbackArea.style.display = 'none';
        if (quizNextQuestionBtn) quizNextQuestionBtn.disabled = true;
        if (quizProgressText) quizProgressText.textContent = `Question ${currentQuestionIndexQuiz + 1} of ${quizData.length}`;

        questionData.options.forEach((option, index) => {
            const optionId = `q${currentQuestionIndexQuiz}_option${index}`;
            const optionLabel = document.createElement('label');
            optionLabel.className = 'quiz-option-label';
            optionLabel.htmlFor = optionId; // Not strictly needed if input is inside
            optionLabel.textContent = option;

            const optionInput = document.createElement('input'); // Not actually used for selection, label click is enough
            optionInput.type = 'radio';
            optionInput.name = `q${currentQuestionIndexQuiz}_options`;
            optionInput.id = optionId;
            optionInput.value = option;
            optionInput.style.display = 'none'; // Hide the radio button

            optionLabel.prepend(optionInput); // Keep for semantics
            if (quizOptionsContainer) quizOptionsContainer.appendChild(optionLabel);

            optionLabel.addEventListener('click', () => handleOptionSelect(optionLabel, questionData.answer));
        });
    }

    function handleOptionSelect(selectedLabel, correctAnswer) {
        quizOptionsContainer.querySelectorAll('.quiz-option-label').forEach(label => {
            label.style.pointerEvents = 'none';
            // Remove previous selection styling if any (though pointerEvents should prevent re-click)
            label.classList.remove('selected');
            if (label.textContent === correctAnswer) {
                label.classList.add('correct'); // Highlight correct answer regardless of user choice
            }
        });

        selectedLabel.classList.add('selected'); // Mark the user's choice
        const selectedValue = selectedLabel.textContent;

        if (quizFeedbackArea) quizFeedbackArea.style.display = 'block';

        if (selectedValue === correctAnswer) {
            scoreQuiz++;
            selectedLabel.classList.add('correct'); // Re-apply if it was the correct one.
            if (quizFeedbackArea) {
                quizFeedbackArea.textContent = "Correct!";
                quizFeedbackArea.className = 'quiz-feedback correct';
            }
        } else {
            selectedLabel.classList.add('incorrect');
             if (quizFeedbackArea) {
                quizFeedbackArea.textContent = `Incorrect. The correct answer was: ${correctAnswer}`;
                quizFeedbackArea.className = 'quiz-feedback incorrect';
            }
        }
        if (quizNextQuestionBtn) quizNextQuestionBtn.disabled = false;
    }

    if (quizNextQuestionBtn) {
        quizNextQuestionBtn.addEventListener('click', () => {
            currentQuestionIndexQuiz++;
            if (currentQuestionIndexQuiz < quizData.length) {
                loadQuizQuestion();
            } else {
                showQuizResults();
            }
        });
    }

    function showQuizResults() {
        if (quizQuestionArea) quizQuestionArea.style.display = 'none';
        if (quizResultsArea) quizResultsArea.style.display = 'block';
        if (quizModalFooter) quizModalFooter.style.display = 'none';
        if (quizScoreText) quizScoreText.textContent = `You scored ${scoreQuiz} out of ${quizData.length}!`;
    }

    if (closeQuizModalBtn) closeQuizModalBtn.addEventListener('click', () => quizModal.classList.remove('active'));
    if (quizCloseResultsBtn) quizCloseResultsBtn.addEventListener('click', () => quizModal.classList.remove('active'));
    if (quizModal) quizModal.addEventListener('click', (e) => { if (e.target === quizModal) quizModal.classList.remove('active'); });


    // Initial calls for current page
    if (currentPage === 'discover.html') {
        addBookCardEventListeners();
    }
    if (currentPage === 'library.html') {
        addLibraryItemEventListeners();
    }

}); // End DOMContentLoaded
