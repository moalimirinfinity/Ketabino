document.addEventListener('DOMContentLoaded', () => {
    feather.replace(); // Initialize Feather Icons globally

    // --- User Authentication Simulation & Redirection ---
    const isLoggedIn = localStorage.getItem('ketabinoUserLoggedIn') === 'true';
    const currentPage = window.location.pathname.split('/').pop();

    if (!isLoggedIn && currentPage !== 'login.html') {
        window.location.href = 'login.html';
        return; // Stop further execution if redirecting
    }
    if (isLoggedIn && currentPage === 'login.html') {
        window.location.href = 'discover.html'; // Redirect logged-in users away from login
        return;
    }

    // --- Global Navigation & User Dropdown ---
    function setupGlobalNav() {
        const mainNav = document.querySelector('nav.main-nav');
        const streakBarContainer = document.querySelector('.streak-progress-bar-container');
        if (!mainNav || !streakBarContainer) return;

        const userStreak = localStorage.getItem('ketabinoUserStreak') || '0';
        const userName = localStorage.getItem('ketabinoUserName') || 'User'; // Get username

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
                window.location.href = 'login.html';
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
                    if (userAvatarContainer) userAvatarContainer.classList.remove('active'); // Close dropdown
                }
                // If not on me.html, the default href will navigate.
            });
        }
    }
    if (currentPage !== 'login.html') {
        setupGlobalNav();
    }


    // --- Placeholder Book Data (with isSaved and isDownloaded) ---
    // Attempt to load from localStorage or use defaults
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
            bookGrid.innerHTML = '';
            let booksToDisplay = Object.values(booksData);
            const activeFilterTab = filterTabsNav.querySelector('.tab-link.active').dataset.filter;


            if (searchTerm) {
                 booksToDisplay = booksToDisplay.filter(book =>
                    book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    book.author.toLowerCase().includes(searchTerm.toLowerCase())
                );
            } else if (activeFilterTab !== 'all') {
                // This is a placeholder for actual category/trending/new filtering
                // For now, it might not filter much beyond the search term.
                // A real app would have more complex data and filtering logic here.
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
                    displayBooks(searchBarInput.value); // Re-filter with current search term and new tab
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
                statusBadge = `<span class="badge badge-info">Downloaded</span>`; // Changed to info
            } else if (book.status === 'saved') {
                statusBadge = `<span class="badge badge-light">Saved</span>`;
            }

            let progressHtml = '';
            if (book.status === 'in-progress' && book.progress > 0) {
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
            libraryContentContainer.innerHTML = '';
            let booksToDisplay = Object.values(booksData);

            if (filter !== 'all') {
                booksToDisplay = booksToDisplay.filter(book => {
                    if (filter === 'saved') return book.isSaved && book.status !== 'finished'; // Show saved unless also finished
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

        libraryTabsNav.querySelectorAll('.tab-link').forEach(tab => {
            tab.addEventListener('click', () => {
                libraryTabsNav.querySelector('.active').classList.remove('active');
                tab.classList.add('active');
                displayLibraryBooks(tab.dataset.filter);
            });
        });
    }

    // --- "Me" Page Functionality ---
    if (currentPage === 'me.html') {
        const userStreak = localStorage.getItem('ketabinoUserStreak') || '0';
        const userName = localStorage.getItem('ketabinoUserName') || 'Ketabino User';
        document.getElementById('profileUserName').textContent = userName;
        document.getElementById('profileUserAvatar').style.backgroundImage = `url('https://placehold.co/120x120/1A535C/FFFFFF?text=${userName.substring(0,1).toUpperCase()}')`;
        document.getElementById('profileStreak').textContent = `${userStreak} days`;

        document.getElementById('leaderboardUserName').textContent = `${userName} (You)`;
        document.getElementById('leaderboardUserAvatar').src = `https://placehold.co/30x30/1A535C/FFFFFF?text=${userName.substring(0,1).toUpperCase()}`;

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
    const closeBookDetailModalBtn = document.getElementById('closeBookDetailModal') || document.getElementById('closeBookDetailModalLib');


    function openBookDetailModal(bookId) {
        currentBookId = bookId;
        const book = booksData[currentBookId];
        if (!book || !modalBookContent || !bookDetailModal) return;
        currentPageIndex = book.status === 'in-progress' ? Math.floor((book.progress / 100) * book.summaryPages.length) -1 : 0;
        if (currentPageIndex < 0) currentPageIndex = 0;


        modalBookContent.innerHTML = `
            <div class="modal-book-layout">
                <div class="modal-book-cover">
                    <img src="${book.cover}" alt="${book.title}">
                </div>
                <div class="modal-book-info">
                    <h3 class="book-title">${book.title}</h3>
                    <p class="book-author">By ${book.author}</p>
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
                        <button class="btn btn-primary" id="modalReadSummaryBtn"><i data-feather="eye"></i> ${book.progress > 0 && book.progress < 100 ? 'Continue Reading' : 'Read Summary'}</button>
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
        document.getElementById('modalBookTitleHeader').textContent = book.title;
        feather.replace();
        setupModalEventListeners();
        bookDetailModal.classList.add('active');
    }

    function setupModalEventListeners() {
        const modalReadBtn = document.getElementById('modalReadSummaryBtn');
        const modalListenBtn = document.getElementById('modalListenSummaryBtn');
        const readerView = document.getElementById('summaryReaderView');
        const listenerView = document.getElementById('summaryListenerView');

        if (modalReadBtn) modalReadBtn.addEventListener('click', () => {
            readerView.style.display = 'block';
            listenerView.style.display = 'none';
            // currentPageIndex is already set in openBookDetailModal
            updateSummaryPageView();
        });
        if (modalListenBtn) modalListenBtn.addEventListener('click', () => {
            readerView.style.display = 'none';
            listenerView.style.display = 'block';
            document.getElementById('postListenOptions').style.display = 'none';
        });

        const prevBtn = document.getElementById('modalPrevPageBtn');
        const nextBtn = document.getElementById('modalNextPageBtn');
        if (prevBtn) prevBtn.addEventListener('click', () => { if (currentPageIndex > 0) { currentPageIndex--; updateSummaryPageView(); }});
        if (nextBtn) nextBtn.addEventListener('click', () => {
            const book = booksData[currentBookId];
            if (book && currentPageIndex < book.summaryPages.length - 1) { currentPageIndex++; updateSummaryPageView(); }
        });

        const finishListenBtn = document.getElementById('modalFinishListeningBtn');
        if(finishListenBtn) finishListenBtn.addEventListener('click', () => {
            document.getElementById('postListenOptions').style.display = 'block';
        });

        document.querySelectorAll('.modal-action-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const action = e.currentTarget.dataset.action;
                if (action === 'mindmap') {
                    alert('Opening Mindmap (Placeholder Action)');
                } else if (action === 'quiz') {
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
        if (!book || !book.summaryPages) return;

        document.getElementById('summaryTextContent').textContent = book.summaryPages[currentPageIndex];
        document.getElementById('modalPaginationInfo').textContent = `Page ${currentPageIndex + 1} of ${book.summaryPages.length}`;
        document.getElementById('modalPrevPageBtn').disabled = currentPageIndex === 0;
        document.getElementById('modalNextPageBtn').disabled = currentPageIndex === book.summaryPages.length - 1;

        const postSummaryOptions = document.getElementById('postSummaryOptions');
        if (currentPageIndex === book.summaryPages.length - 1) {
            postSummaryOptions.style.display = 'block';
            // Update book status to finished if not already
            if (book.status !== 'finished') {
                book.status = 'finished';
                book.finishedDate = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric'});
                book.progress = 100;
                saveBooksData();
                // Potentially refresh library view if on library page
                if (currentPage === 'library.html') {
                    const activeFilter = document.querySelector('#libraryTabsNav .tab-link.active').dataset.filter;
                    displayLibraryBooks(activeFilter);
                }
            }
        } else {
            postSummaryOptions.style.display = 'none';
        }
        // Update progress
        book.progress = Math.round(((currentPageIndex + 1) / book.summaryPages.length) * 100);
        if (book.status !== 'finished' && book.progress > 0 && book.progress < 100) {
            book.status = 'in-progress';
        }
        saveBooksData();
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
        document.querySelectorAll('#bookGrid .book-card').forEach(card => {
            card.addEventListener('click', (event) => {
                if (!event.target.closest('.btn-icon')) {
                    openBookDetailModal(card.dataset.bookId);
                }
            });
            addCardIconToggleListeners(card);
        });
    }

    function addLibraryItemEventListeners() {
        document.querySelectorAll('#libraryContentContainer .library-item').forEach(item => {
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
                if (icon) icon.style.fill = book.isSaved ? 'var(--secondary-color)' : 'none';
                if(bookDetailModal.classList.contains('active') && currentBookId === bookId){
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
                if (icon) icon.style.fill = book.isDownloaded ? 'var(--primary-color)' : 'none';
                if(bookDetailModal.classList.contains('active') && currentBookId === bookId){
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
    function updateCardIconState(bookId, iconClass, isActive) {
        const card = document.querySelector(`.book-card[data-book-id="${bookId}"]`);
        if(card) {
            const iconBtn = card.querySelector(`.${iconClass}`);
            if(iconBtn) {
                const stateClass = iconClass.includes('save') ? 'saved' : 'downloaded';
                iconBtn.classList.toggle(stateClass, isActive);
                const icon = iconBtn.querySelector('i');
                if (icon) icon.style.fill = isActive ? (iconClass.includes('save') ? 'var(--secondary-color)' : 'var(--primary-color)') : 'none';
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


    let currentQuizBookId = null;
    let currentQuestionIndex = 0;
    let score = 0;
    let quizData = [];

    const sampleQuizBank = {
        "1": [ // The Silent Patient
            { question: "What is Alicia Berenson's profession in 'The Silent Patient'?", options: ["Doctor", "Painter", "Writer", "Musician"], answer: "Painter" },
            { question: "Who is Theo Faber in relation to Alicia?", options: ["Her husband", "Her therapist", "Her brother", "Her lawyer"], answer: "Her therapist" },
            { question: "What is the central mystery surrounding Alicia?", options: ["Her disappearance", "A hidden treasure", "Why she murdered her husband", "A secret identity"], answer: "Why she murdered her husband" }
        ],
        "2": [ // Atomic Habits
            { question: "What is the first law of behavior change according to James Clear?", options: ["Make it attractive", "Make it obvious", "Make it easy", "Make it satisfying"], answer: "Make it obvious" },
            { question: "The concept of 'habit stacking' involves linking a new habit to an...", options: ["Existing reward", "Specific time", "Existing habit", "Desired outcome"], answer: "Existing habit" },
            { question: "What does James Clear emphasize for long-term success with habits?", options: ["Intensity", "Motivation", "Identity", "Perfection"], answer: "Identity" }
        ],
        // Add more quizzes for other book IDs if needed
    };

    function startQuiz(bookId) {
        currentQuizBookId = bookId;
        quizData = sampleQuizBank[bookId] || sampleQuizBank["1"]; // Default to book 1's quiz if specific not found
        currentQuestionIndex = 0;
        score = 0;

        quizModalTitle.textContent = `Quiz: ${booksData[bookId] ? booksData[bookId].title : 'Book Quiz'}`;
        quizQuestionArea.style.display = 'block';
        quizResultsArea.style.display = 'none';
        quizModalFooter.style.display = 'flex';
        quizNextQuestionBtn.disabled = true;
        quizFeedbackArea.style.display = 'none';

        loadQuizQuestion();
        if (quizModal) quizModal.classList.add('active');
    }

    function loadQuizQuestion() {
        const questionData = quizData[currentQuestionIndex];
        quizQuestionText.textContent = questionData.question;
        quizOptionsContainer.innerHTML = '';
        quizFeedbackArea.style.display = 'none';
        quizNextQuestionBtn.disabled = true;
        quizProgressText.textContent = `Question ${currentQuestionIndex + 1} of ${quizData.length}`;


        questionData.options.forEach((option, index) => {
            const optionId = `q${currentQuestionIndex}_option${index}`;
            const optionLabel = document.createElement('label');
            optionLabel.className = 'quiz-option-label';
            optionLabel.htmlFor = optionId;
            optionLabel.textContent = option;

            const optionInput = document.createElement('input');
            optionInput.type = 'radio';
            optionInput.name = `q${currentQuestionIndex}_options`;
            optionInput.id = optionId;
            optionInput.value = option;

            optionLabel.prepend(optionInput);
            quizOptionsContainer.appendChild(optionLabel);

            optionLabel.addEventListener('click', () => handleOptionSelect(optionLabel, questionData.answer));
        });
        feather.replace(); // If icons were used in options
    }

    function handleOptionSelect(selectedLabel, correctAnswer) {
        // Disable further selections for this question
        quizOptionsContainer.querySelectorAll('.quiz-option-label').forEach(label => {
            label.style.pointerEvents = 'none'; // Prevent re-clicking
            if (label.textContent === correctAnswer) {
                label.classList.add('correct');
            }
        });

        const selectedValue = selectedLabel.textContent;
        quizFeedbackArea.style.display = 'block';

        if (selectedValue === correctAnswer) {
            score++;
            selectedLabel.classList.add('correct');
            quizFeedbackArea.textContent = "Correct!";
            quizFeedbackArea.className = 'quiz-feedback correct';
        } else {
            selectedLabel.classList.add('incorrect');
            quizFeedbackArea.textContent = `Incorrect. The correct answer was: ${correctAnswer}`;
            quizFeedbackArea.className = 'quiz-feedback incorrect';
        }
        quizNextQuestionBtn.disabled = false;
    }

    if (quizNextQuestionBtn) {
        quizNextQuestionBtn.addEventListener('click', () => {
            currentQuestionIndex++;
            if (currentQuestionIndex < quizData.length) {
                loadQuizQuestion();
            } else {
                showQuizResults();
            }
        });
    }

    function showQuizResults() {
        quizQuestionArea.style.display = 'none';
        quizResultsArea.style.display = 'block';
        quizModalFooter.style.display = 'none'; // Hide next button on results
        quizScoreText.textContent = `You scored ${score} out of ${quizData.length}!`;
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
