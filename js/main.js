// js/main.js
document.addEventListener('DOMContentLoaded', () => {
    // --- Global Nav Dropdown ---
    const userAvatarContainer = document.querySelector('.user-avatar-container');
    const userDropdown = document.querySelector('.user-dropdown');

    if (userAvatarContainer) {
        userAvatarContainer.addEventListener('click', (event) => {
            event.stopPropagation(); // Prevent click from bubbling up to document
            userDropdown.classList.toggle('active');
        });
        // Close dropdown if clicked outside
        document.addEventListener('click', (event) => {
            if (userDropdown && userDropdown.classList.contains('active') && !userAvatarContainer.contains(event.target)) {
                userDropdown.classList.remove('active');
            }
        });
    }
    if(userDropdown){ // Prevent error on login page
        userDropdown.addEventListener('click', (event) => {
            event.stopPropagation(); // Prevent dropdown from closing when clicking inside it
        });
    }


    // --- Filter Tabs on Discover Page ---
    const filterTabs = document.querySelectorAll('.filter-tabs .btn');
    filterTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            filterTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            const filterValue = tab.dataset.filter;
            console.log('Filtering by:', filterValue); // Simulate filtering
            // Add actual filtering logic here if book data were present
        });
    });

    // --- Book Card Interactions (Save/Download Toggle & Open Modal) ---
    const bookCards = document.querySelectorAll('.book-card');
    const bookDetailModal = document.getElementById('bookDetailModal');
    const modalCloseBtn = bookDetailModal ? bookDetailModal.querySelector('.modal-close-btn') : null;
    const modalBookContent = document.getElementById('modalBookContent');

    // Placeholder book data (in a real app, this would come from an API)
    const booksData = {
        "1": { id: "1", title: "The Silent Patient", author: "Alex Michaelides", time: "15-min read", cover: "assets/images/book-cover1.jpg", summaryPages: ["Summary page 1/3 for Silent Patient...", "Page 2/3. More details...", "Page 3/3. Conclusion."]},
        "2": { id: "2", title: "Atomic Habits", author: "James Clear", time: "20-min read", cover: "assets/images/book-cover2.jpg", summaryPages: ["Summary page 1/2 for Atomic Habits...", "Page 2/2. Key takeaways."]},
        // Add more book data as needed
    };
    let currentBookId = null;
    let currentPage = 0;

    bookCards.forEach(card => {
        // Open Modal
        card.addEventListener('click', (event) => {
            // Prevent modal from opening if a button inside the card was clicked
            if (event.target.closest('.btn-icon')) {
                return;
            }
            currentBookId = card.dataset.bookId;
            const book = booksData[currentBookId];
            if (book && modalBookContent) {
                // Dynamically populate modal (simplified)
                modalBookContent.innerHTML = `
                    <div class="modal-book-cover" style="flex-basis: 35%; text-align:center;">
                        <img src="${book.cover}" alt="${book.title}" style="max-width:200px; border-radius: var(--border-radius-md); box-shadow: var(--shadow-sm);">
                    </div>
                    <div class="modal-book-info" style="flex-basis: 65%;">
                        <h2 id="modalBookTitle" style="font-size: 1.8rem;">${book.title}</h2>
                        <p id="modalBookAuthor" style="color: var(--text-muted); margin-bottom: 0.5rem;">By ${book.author}</p>
                        <span class="badge badge-accent" id="modalBookTime">${book.time}</span>
                        <div class="mt-1 mb-2" style="display:flex; gap: 1rem;">
                            <button class="btn-icon modal-save-btn" title="Save">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path></svg> Save
                            </button>
                            <button class="btn-icon modal-download-btn" title="Download">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg> Download
                            </button>
                        </div>
                        <div class="d-flex" style="gap:1rem;">
                            <button class="btn btn-primary" id="readSummaryBtn">Read Summary</button>
                            <button class="btn btn-secondary" id="listenSummaryBtn">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 0.5em; vertical-align: middle;"><path d="M3 18v-6a9 9 0 0 1 18 0v6"></path><path d="M21 19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3S9 4 12 4s3 10 3 10h3a2 2 0 0 1 2 2z"></path></svg>
                                Listen Summary
                            </button>
                        </div>
                        <div id="summaryReaderView" style="display:none; margin-top:1.5rem; border-top: 1px solid var(--subtle-border); padding-top: 1.5rem;">
                            <div class="d-flex justify-between align-center mb-1">
                                <h4 style="margin-bottom:0; color: var(--primary-color);">Summary</h4>
                                <span id="paginationInfo"></span>
                            </div>
                            <p id="summaryTextContent" style="min-height: 100px; background-color: var(--neutral-bg); padding: 1rem; border-radius: var(--border-radius-md);"></p>
                            <div class="d-flex justify-between mt-1">
                                <button class="btn btn-secondary btn-sm" id="prevPageBtn">&leftarrow; Prev</button>
                                <button class="btn btn-secondary btn-sm" id="nextPageBtn">Next &rightarrow;</button>
                            </div>
                            <div id="postSummaryOptions" style="display:none; margin-top:1.5rem; text-align:center; padding-top: 1rem; border-top:1px solid var(--subtle-border);">
                                 <h5 style="margin-bottom:1rem; color:var(--text-muted);">Finished Summary!</h5>
                                 <button class="btn btn-primary" id="viewMindmapBtn">View Mindmap</button>
                                 <button class="btn btn-secondary" id="takeQuizBtn">Take Quiz</button>
                            </div>
                        </div>
                         <div id="summaryListenerView" style="display:none; margin-top:1.5rem; border-top: 1px solid var(--subtle-border); padding-top: 1.5rem;">
                            <h4 style="margin-bottom:1rem; color: var(--primary-color);">Listening...</h4>
                            <div style="background-color:var(--neutral-bg); padding:1rem; border-radius:var(--border-radius-md); text-align:center;">
                                <p>Audio Player Controls (Play/Pause, Scrubber)</p>
                                <button class="btn btn-sm btn-secondary">1x</button>
                                <button class="btn btn-sm btn-secondary">1.5x</button>
                                <button class="btn btn-sm btn-secondary">2x</button>
                                <br><br>
                                <button class="btn btn-sm btn-accent" id="finishListeningBtn">Simulate Finish Listening</button>
                            </div>
                            <div id="postListenOptions" style="display:none; margin-top:1.5rem; text-align:center; padding-top: 1rem; border-top:1px solid var(--subtle-border);">
                                 <h5 style="margin-bottom:1rem; color:var(--text-muted);">Finished Listening!</h5>
                                 <button class="btn btn-primary">View Mindmap</button>
                                 <button class="btn btn-secondary">Take Quiz</button>
                            </div>
                        </div>
                    </div>
                `;
                setupModalInteractions(); // Re-attach event listeners for new modal content
            }
            if (bookDetailModal) bookDetailModal.classList.add('active');
            // Reset summary views
            const readerView = modalBookContent.querySelector('#summaryReaderView');
            const listenerView = modalBookContent.querySelector('#summaryListenerView');
            if (readerView) readerView.style.display = 'none';
            if (listenerView) listenerView.style.display = 'none';
        });

        // Save/Download Icon Toggle (Example for save button)
        card.querySelectorAll('.save-btn').forEach(btn => {
            btn.addEventListener('click', (event) => {
                event.stopPropagation(); // Prevent modal from opening
                btn.classList.toggle('saved'); // Add a 'saved' class for styling (e.g., fill icon)
                const icon = btn.querySelector('svg');
                if (btn.classList.contains('saved')) {
                    icon.style.fill = 'var(--secondary-color)';
                    icon.style.stroke = 'var(--secondary-color)';
                    console.log(`Book ID ${card.dataset.bookId} saved!`);
                } else {
                    icon.style.fill = 'none';
                    icon.style.stroke = 'currentColor';
                    console.log(`Book ID ${card.dataset.bookId} unsaved!`);
                }
            });
        });
         card.querySelectorAll('.download-btn').forEach(btn => {
            btn.addEventListener('click', (event) => {
                event.stopPropagation();
                btn.classList.toggle('downloaded');
                // Add visual feedback for download
                console.log(`Book ID ${card.dataset.bookId} download toggled!`);
            });
        });
    });

    // Close Modal
    if (modalCloseBtn) {
        modalCloseBtn.addEventListener('click', () => bookDetailModal.classList.remove('active'));
    }
    if (bookDetailModal) {
        bookDetailModal.addEventListener('click', (event) => { // Close on overlay click
            if (event.target === bookDetailModal) {
                bookDetailModal.classList.remove('active');
            }
        });
    }


    function setupModalInteractions() {
        const readSummaryBtn = document.getElementById('readSummaryBtn');
        const listenSummaryBtn = document.getElementById('listenSummaryBtn');
        const summaryReaderView = document.getElementById('summaryReaderView');
        const summaryListenerView = document.getElementById('summaryListenerView');

        const modalSaveBtn = modalBookContent.querySelector('.modal-save-btn');
        const modalDownloadBtn = modalBookContent.querySelector('.modal-download-btn');

        if(modalSaveBtn) modalSaveBtn.addEventListener('click', () => { /* Toggle save state */ console.log('Modal save toggled'); modalSaveBtn.classList.toggle('active'); });
        if(modalDownloadBtn) modalDownloadBtn.addEventListener('click', () => { /* Toggle download state */ console.log('Modal download toggled'); modalDownloadBtn.classList.toggle('active');});


        if (readSummaryBtn) {
            readSummaryBtn.addEventListener('click', () => {
                if(summaryReaderView) summaryReaderView.style.display = 'block';
                if(summaryListenerView) summaryListenerView.style.display = 'none';
                currentPage = 0;
                updateSummaryPage();
            });
        }
        if (listenSummaryBtn) {
            listenSummaryBtn.addEventListener('click', () => {
                if(summaryReaderView) summaryReaderView.style.display = 'none';
                if(summaryListenerView) summaryListenerView.style.display = 'block';
                document.getElementById('postListenOptions').style.display = 'none'; // Reset
            });
        }

        // Summary Reader Pagination
        const prevPageBtn = document.getElementById('prevPageBtn');
        const nextPageBtn = document.getElementById('nextPageBtn');

        if(prevPageBtn) prevPageBtn.addEventListener('click', () => { if(currentPage > 0) { currentPage--; updateSummaryPage();}});
        if(nextPageBtn) nextPageBtn.addEventListener('click', () => {
            const book = booksData[currentBookId];
            if(book && currentPage < book.summaryPages.length - 1) { currentPage++; updateSummaryPage();}
        });

        // Listener view simulation
        const finishListeningBtn = document.getElementById('finishListeningBtn');
        if(finishListeningBtn) {
            finishListeningBtn.addEventListener('click', () => {
                document.getElementById('postListenOptions').style.display = 'block';
            });
        }

        // Post-summary options buttons
        const viewMindmapBtn = document.getElementById('viewMindmapBtn');
        const takeQuizBtn = document.getElementById('takeQuizBtn');
        if(viewMindmapBtn) viewMindmapBtn.addEventListener('click', () => alert('Opening Mindmap (placeholder)'));
        if(takeQuizBtn) takeQuizBtn.addEventListener('click', () => alert('Opening Quiz (placeholder)'));

        // Placeholder for listen options as well
        const postListenMindmap = summaryListenerView ? summaryListenerView.querySelector('.btn-primary') : null;
        const postListenQuiz = summaryListenerView ? summaryListenerView.querySelector('.btn-secondary') : null;
        if(postListenMindmap) postListenMindmap.addEventListener('click', () => alert('Opening Mindmap (placeholder)'));
        if(postListenQuiz) postListenQuiz.addEventListener('click', () => alert('Opening Quiz (placeholder)'));

    }

    function updateSummaryPage() {
        const book = booksData[currentBookId];
        if (!book || !book.summaryPages) return;

        const summaryTextContent = document.getElementById('summaryTextContent');
        const paginationInfo = document.getElementById('paginationInfo');
        const postSummaryOptions = document.getElementById('postSummaryOptions');
        const prevPageBtn = document.getElementById('prevPageBtn');
        const nextPageBtn = document.getElementById('nextPageBtn');

        if(summaryTextContent) summaryTextContent.textContent = book.summaryPages[currentPage];
        if(paginationInfo) paginationInfo.textContent = `Page ${currentPage + 1} of ${book.summaryPages.length}`;

        if(prevPageBtn) prevPageBtn.disabled = currentPage === 0;
        if(nextPageBtn) nextPageBtn.disabled = currentPage === book.summaryPages.length - 1;

        if(postSummaryOptions) {
            postSummaryOptions.style.display = (currentPage === book.summaryPages.length - 1) ? 'block' : 'none';
        }
    }


    // Logout (Example)
    const logoutButton = document.getElementById('logoutButton');
    if (logoutButton) {
        logoutButton.addEventListener('click', (e) => {
            e.preventDefault();
            alert('Logging out...');
            window.location.href = 'login.html';
        });
    }
});