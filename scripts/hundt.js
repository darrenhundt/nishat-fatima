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
    const lightboxImage = document.getElementById('lightboxImage');
    const loading = document.getElementById('lightboxLoading');
    
    // Show lightbox
    lightbox.style.display = 'flex';
    loading.style.display = 'block';
    lightboxImage.style.display = 'none';
    
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
    
    // Create new image to preload
    const newImg = new Image();
    
    newImg.onload = function() {
      lightboxImage.src = this.src;
      lightboxImage.alt = imgData.alt;
      loading.style.display = 'none';
      lightboxImage.style.display = 'block';
    };
    
    newImg.onerror = function() {
      loading.style.display = 'none';
      lightboxImage.style.display = 'block';
      lightboxImage.src = imgData.src; // Fallback to thumbnail
    };
    
    // Start loading full resolution image
    newImg.src = imgData.fullSrc;
  }
  
  // Close lightbox
  function closeLightbox() {
    const lightbox = document.getElementById('customLightbox');
    lightbox.style.display = 'none';
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
    counter.textContent = `${currentImageIndex + 1} / ${galleryImages.length}`;
  }
  
  // Event listeners
  document.getElementById('lightboxClose').addEventListener('click', closeLightbox);
  document.getElementById('lightboxPrev').addEventListener('click', prevImage);
  document.getElementById('lightboxNext').addEventListener('click', nextImage);
  
  // Close on background click
  document.getElementById('customLightbox').addEventListener('click', function(e) {
    if (e.target === this) {
      closeLightbox();
    }
  });
  
  // Keyboard navigation
  document.addEventListener('keydown', function(e) {
    const lightbox = document.getElementById('customLightbox');
    if (lightbox.style.display === 'flex') {
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
  
  // Re-initialize if new images are loaded dynamically
  const observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
      if (mutation.addedNodes.length > 0) {
        setTimeout(initLightbox, 100);
      }
    });
  });
  
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
});