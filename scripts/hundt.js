document.addEventListener('DOMContentLoaded', function() {
  let currentImageIndex = 0;
  let galleryImages = [];
  
  // Initialize lightbox
  function initLightbox() {
    // Find all strip gallery images
    const stripImages = document.querySelectorAll('.sqs-gallery-design-strip-slide');
    
    if (stripImages.length === 0) {
      return;
    }
    
    // Build gallery array
    galleryImages = Array.from(stripImages).map((img, index) => ({
      src: img.getAttribute('data-src') || img.src,
      fullSrc: (img.getAttribute('data-src') || img.src).replace(/\?format=\d+w/, ''),
      alt: img.alt || `Image ${index + 1}`,
      element: img,
      index: index
    }));
    
    // Add click listeners to gallery images
    galleryImages.forEach((imgData, index) => {
      imgData.element.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        openLightbox(index);
      });
    });
  }
  
  // Open lightbox
  function openLightbox(index) {
    currentImageIndex = index;
    const lightbox = document.getElementById('customLightbox');
    const lightboxContent = document.getElementById('lightboxContent') || document.querySelector('.lightbox-content');
    const lightboxImage = document.getElementById('lightboxImage');
    const loading = document.getElementById('lightboxLoading');
    
    if (!lightbox || !lightboxImage || !loading) {
      console.error('Lightbox elements not found');
      return;
    }
    
    // Force proper sizing on lightbox elements
    lightbox.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(0, 0, 0, 0.95);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 99999;
      padding: 20px;
      box-sizing: border-box;
    `;
    
    if (lightboxContent) {
      lightboxContent.style.cssText = `
        position: relative;
        max-width: calc(100vw - 120px);
        max-height: calc(100vh - 120px);
        display: flex;
        align-items: center;
        justify-content: center;
        width: 100%;
        height: 100%;
      `;
    }
    
    // Reset image styles
    lightboxImage.style.cssText = `
      max-width: 100%;
      max-height: 100%;
      width: auto;
      height: auto;
      object-fit: contain;
      display: none;
    `;
    
    // Show loading spinner
    loading.style.cssText = `
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 40px;
      height: 40px;
      border: 3px solid rgba(255, 255, 255, 0.3);
      border-top: 3px solid white;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      display: block;
    `;
    
    // Load image
    loadLightboxImage(galleryImages[currentImageIndex]);
    updateCounter();
    
    // Prevent body scroll
    document.body.style.overflow = 'hidden';
  }
  
  // Load image in lightbox
  function loadLightboxImage(imgData) {
    const lightboxImage = document.getElementById('lightboxImage');
    const loading = document.getElementById('lightboxLoading');
    
    if (!lightboxImage || !loading) return;
    
    // Create new image to preload
    const newImg = new Image();
    
    newImg.onload = function() {
      // Hide loading spinner
      loading.style.display = 'none';
      
      // Set image source and show it
      lightboxImage.src = this.src;
      lightboxImage.alt = imgData.alt;
      
      // Force image to display properly
      lightboxImage.style.cssText = `
        max-width: 100%;
        max-height: 100%;
        width: auto;
        height: auto;
        object-fit: contain;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
        display: block;
      `;
      
      // Force a reflow
      lightboxImage.offsetHeight;
    };
    
    newImg.onerror = function() {
      console.error('Failed to load image:', imgData.fullSrc);
      loading.style.display = 'none';
      lightboxImage.src = imgData.src; // Fallback to thumbnail
      lightboxImage.style.display = 'block';
    };
    
    // Start loading full resolution image
    newImg.src = imgData.fullSrc;
  }
  
  // Close lightbox
  function closeLightbox() {
    const lightbox = document.getElementById('customLightbox');
    if (lightbox) {
      lightbox.style.display = 'none';
    }
    document.body.style.overflow = '';
  }
  
  // Navigate to previous image
  function prevImage() {
    currentImageIndex = (currentImageIndex - 1 + galleryImages.length) % galleryImages.length;
    loadLightboxImage(galleryImages[currentImageIndex]);
    updateCounter();
  }
  
  // Navigate to next image
  function nextImage() {
    currentImageIndex = (currentImageIndex + 1) % galleryImages.length;
    loadLightboxImage(galleryImages[currentImageIndex]);
    updateCounter();
  }
  
  // Update counter
  function updateCounter() {
    const counter = document.getElementById('lightboxCounter');
    if (counter) {
      counter.textContent = `${currentImageIndex + 1} / ${galleryImages.length}`;
    }
  }
  
  // Wait for elements to be available before setting up event listeners
  function setupEventListeners() {
    const closeBtn = document.getElementById('lightboxClose');
    const prevBtn = document.getElementById('lightboxPrev');
    const nextBtn = document.getElementById('lightboxNext');
    const lightbox = document.getElementById('customLightbox');
    
    if (closeBtn) closeBtn.addEventListener('click', closeLightbox);
    if (prevBtn) prevBtn.addEventListener('click', prevImage);
    if (nextBtn) nextBtn.addEventListener('click', nextImage);
    
    // Close on background click
    if (lightbox) {
      lightbox.addEventListener('click', function(e) {
        if (e.target === this) {
          closeLightbox();
        }
      });
    }
  }
  
  // Keyboard navigation
  document.addEventListener('keydown', function(e) {
    const lightbox = document.getElementById('customLightbox');
    if (lightbox && lightbox.style.display === 'flex') {
      switch(e.key) {
        case 'Escape':
          closeLightbox();
          break;
        case 'ArrowLeft':
          prevImage();
          break;
        case 'ArrowRight':
          nextImage();
          break;
      }
    }
  });
  
  // Initialize when DOM is ready
  initLightbox();
  
  // Setup event listeners after a short delay to ensure elements exist
  setTimeout(setupEventListeners, 100);
  
  // Re-initialize if new images are loaded dynamically
  const observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
      if (mutation.addedNodes.length > 0) {
        setTimeout(function() {
          initLightbox();
          setupEventListeners();
        }, 100);
      }
    });
  });
  
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
});