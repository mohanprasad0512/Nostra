/* ===================================================
   NOSTRA — script.js
   Search, Filter, Sort, Form Validation, Mobile Nav
   =================================================== */

document.addEventListener('DOMContentLoaded', () => {

  /* ==========================================
     MOBILE NAV TOGGLE
  ========================================== */
  const navToggle = document.querySelector('.nav-toggle');
  const navLinks = document.querySelector('.nav-links');

  if (navToggle && navLinks) {
    navToggle.addEventListener('click', () => {
      navLinks.classList.toggle('open');
    });
    // Close on link click
    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => navLinks.classList.remove('open'));
    });
  }


  /* ==========================================
     COLLECTIONS: SEARCH + FILTER + SORT
  ========================================== */
  const searchInput   = document.getElementById('searchInput');
  const clearBtn      = document.getElementById('clearSearch');
  const filterPills   = document.querySelectorAll('.pill[data-filter]');
  const sortSelect    = document.getElementById('sortSelect');
  const productsGrid  = document.getElementById('productsGrid');
  const resultsCount  = document.getElementById('resultsCount');
  const emptyState    = document.getElementById('emptyState');
  const resetBtn      = document.getElementById('resetBtn');

  if (!productsGrid) return; // Only runs on collections page

  // Gather all product cards into an array once
  const allCards = Array.from(productsGrid.querySelectorAll('.product-card'));

  let currentFilter = 'all';
  let currentSearch = '';
  let currentSort   = 'default';

  // Check URL params for pre-selected filter (from home page category links)
  const urlParams = new URLSearchParams(window.location.search);
  const urlFilter = urlParams.get('filter');
  if (urlFilter) {
    currentFilter = urlFilter;
    filterPills.forEach(p => {
      p.classList.toggle('active', p.dataset.filter === urlFilter);
    });
  }

  /* --- Core render function --- */
  function renderProducts() {
    const query = currentSearch.toLowerCase().trim();

    // 1) Filter by category and search
    let matching = allCards.filter(card => {
      const cat   = card.dataset.category || '';
      const name  = (card.dataset.name || '').toLowerCase();
      const catLabel = card.querySelector('.product-cat')?.textContent.toLowerCase() || '';

      const passFilter = currentFilter === 'all' || cat === currentFilter;
      const passSearch = !query || name.includes(query) || catLabel.includes(query);
      return passFilter && passSearch;
    });

    // 2) Sort matching results
    if (currentSort === 'price-asc') {
      matching.sort((a, b) => Number(a.dataset.price) - Number(b.dataset.price));
    } else if (currentSort === 'price-desc') {
      matching.sort((a, b) => Number(b.dataset.price) - Number(a.dataset.price));
    } else if (currentSort === 'name-asc') {
      matching.sort((a, b) => (a.dataset.name || '').localeCompare(b.dataset.name || ''));
    }

    // 3) Show/hide and reorder in DOM
    allCards.forEach(card => {
      card.classList.add('hidden');
      card.style.animationDelay = '';
    });

    if (matching.length === 0) {
      emptyState.style.display = 'block';
      resultsCount.textContent = 'No products found';
    } else {
      emptyState.style.display = 'none';
      const total = allCards.length;
      resultsCount.textContent =
        matching.length === total
          ? `Showing all ${total} products`
          : `Showing ${matching.length} of ${total} products`;

      matching.forEach((card, i) => {
        card.classList.remove('hidden');
        card.style.animationDelay = `${i * 0.04}s`;
        productsGrid.appendChild(card); // reorder in DOM
      });
    }
  }

  /* --- Search input --- */
  if (searchInput) {
    searchInput.addEventListener('input', () => {
      currentSearch = searchInput.value;
      clearBtn && clearBtn.classList.toggle('visible', currentSearch.length > 0);
      renderProducts();
    });
  }

  /* --- Clear search --- */
  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      searchInput.value = '';
      currentSearch = '';
      clearBtn.classList.remove('visible');
      renderProducts();
    });
  }

  /* --- Filter pills --- */
  filterPills.forEach(pill => {
    pill.addEventListener('click', () => {
      filterPills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      currentFilter = pill.dataset.filter;
      renderProducts();
    });
  });

  /* --- Sort --- */
  if (sortSelect) {
    sortSelect.addEventListener('change', () => {
      currentSort = sortSelect.value;
      renderProducts();
    });
  }

  /* --- Reset button (in empty state) --- */
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      currentFilter = 'all';
      currentSearch = '';
      currentSort = 'default';
      if (searchInput) searchInput.value = '';
      if (sortSelect) sortSelect.value = 'default';
      if (clearBtn) clearBtn.classList.remove('visible');
      filterPills.forEach(p => p.classList.toggle('active', p.dataset.filter === 'all'));
      renderProducts();
    });
  }

  // Initial render (handles URL param pre-filter)
  renderProducts();


  /* ==========================================
     CONTACT FORM VALIDATION
  ========================================== */
  const contactForm  = document.getElementById('contactForm');
  const formSuccess  = document.getElementById('formSuccess');
  const sendAnotherBtn = document.getElementById('sendAnotherBtn');

  if (!contactForm) return;

  function showError(inputId, errorId, msg) {
    const input = document.getElementById(inputId);
    const error = document.getElementById(errorId);
    if (input) input.classList.add('error');
    if (error) error.textContent = msg;
  }

  function clearError(inputId, errorId) {
    const input = document.getElementById(inputId);
    const error = document.getElementById(errorId);
    if (input) input.classList.remove('error');
    if (error) error.textContent = '';
  }

  // Live clear on input
  ['firstName', 'email', 'subject', 'message'].forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    el.addEventListener('input', () => clearError(id, id + 'Error'));
    el.addEventListener('change', () => clearError(id, id + 'Error'));
  });

  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();

    let valid = true;

    // First Name
    const firstName = document.getElementById('firstName').value.trim();
    if (!firstName) {
      showError('firstName', 'firstNameError', 'First name is required.');
      valid = false;
    } else {
      clearError('firstName', 'firstNameError');
    }

    // Email
    const email = document.getElementById('email').value.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      showError('email', 'emailError', 'Email address is required.');
      valid = false;
    } else if (!emailRegex.test(email)) {
      showError('email', 'emailError', 'Please enter a valid email address.');
      valid = false;
    } else {
      clearError('email', 'emailError');
    }

    // Subject
    const subject = document.getElementById('subject').value;
    if (!subject) {
      showError('subject', 'subjectError', 'Please select a topic.');
      valid = false;
    } else {
      clearError('subject', 'subjectError');
    }

    // Message
    const message = document.getElementById('message').value.trim();
    if (!message) {
      showError('message', 'messageError', 'A message is required.');
      valid = false;
    } else if (message.length < 10) {
      showError('message', 'messageError', 'Message must be at least 10 characters.');
      valid = false;
    } else {
      clearError('message', 'messageError');
    }

    if (!valid) return;

    // Show success state
    contactForm.style.display = 'none';
    formSuccess.style.display = 'block';
  });

  if (sendAnotherBtn) {
    sendAnotherBtn.addEventListener('click', () => {
      contactForm.reset();
      contactForm.style.display = 'block';
      formSuccess.style.display = 'none';
      ['firstName', 'email', 'subject', 'message'].forEach(id => {
        clearError(id, id + 'Error');
      });
    });
  }

});
