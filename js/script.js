const canvas = document.getElementById('hero-canvas');
const context = canvas ? canvas.getContext('2d', { alpha: false, desynchronized: true }) : null;
const loadingScreen = document.getElementById('loading-screen');
const progressBar = document.querySelector('.progress');
const loadingText = document.querySelector('.loading-text');

// Optimize canvas context for performance
if (context) {
    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = 'high';
}


const config = {
    desktop: {
        path: 'assets/images/desktop/',
        count: 121,
        prefix: '',
        suffix: '.jpg',
        pad: 5
    },
    mobile: {
        path: 'assets/images/mobile/',
        count: 233,
        prefix: 'ezgif-frame-',
        suffix: '.jpg',
        pad: 3
    }
};

let currentConfig = null;
const images = [];
let loadedCount = 0;
let isMobile = false;
let isInitialLoad = true;
const INITIAL_IMAGES_TO_LOAD = 10; // Show page after first 10 images


const padNumber = (num, width) => {
    num = num + '';
    return num.length >= width ? num : new Array(width - num.length + 1).join('0') + num;
};


function checkDevice() {

    const mobileQuery = window.matchMedia("(orientation: portrait)");
    const newIsMobile = mobileQuery.matches;

    if (currentConfig === null || isMobile !== newIsMobile) {
        isMobile = newIsMobile;
        currentConfig = isMobile ? config.mobile : config.desktop;
        console.log(`Switching to ${isMobile ? 'Mobile' : 'Desktop'} config`);
        initImages();
    }
}


function resizeCanvas() {
    if (!canvas || !context) return;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    // Update target and current progress to match scroll position
    targetProgress = getScrollProgress();
    currentProgress = targetProgress;
    // Reset last drawn frame to force redraw
    lastDrawnFrameIndex = -1;
    // Trigger immediate update
    requestAnimationFrame(() => updateImage(currentProgress));
}


// Smooth scroll progress tracking
let targetProgress = 0;
let currentProgress = 0;
let rafId = null;
let isScrolling = false;

function getScrollProgress() {
    const scrollTop = document.documentElement.scrollTop;
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    if (maxScroll <= 0) return 0;
    return Math.min(Math.max(scrollTop / maxScroll, 0), 1);
}


function drawImageProp(ctx, img, opacity = 1, clearCanvas = true) {
    if (!img || !img.complete) return false; // Return false if image not ready

    const w = ctx.canvas.width;
    const h = ctx.canvas.height;
    const iW = img.width;
    const iH = img.height;

    const scale = Math.max(w / iW, h / iH);
    const x = (w / 2) - (iW / 2) * scale;
    const y = (h / 2) - (iH / 2) * scale;

    if (opacity < 1) {
        ctx.save();
        ctx.globalAlpha = opacity;
    }
    
    // Only clear if explicitly requested (for single frame draws)
    if (clearCanvas) {
        ctx.clearRect(0, 0, w, h);
    }
    
    ctx.drawImage(img, x, y, iW * scale, iH * scale);
    
    if (opacity < 1) {
        ctx.restore();
    }
    
    return true; // Successfully drawn
}


// Track last drawn frame to prevent black flashes
let lastDrawnFrameIndex = -1;

function updateImage(progress) {
    if (!context || images.length === 0 || !currentConfig) return;

    // Calculate exact frame position (not floored) for smooth interpolation
    const exactFrame = progress * (currentConfig.count - 1);
    const frameIndex = Math.floor(exactFrame);
    const nextFrameIndex = Math.min(frameIndex + 1, currentConfig.count - 1);
    const blendFactor = exactFrame - frameIndex; // 0 to 1, how much to blend to next frame

    const currentImg = images[frameIndex];
    const nextImg = images[nextFrameIndex];

    // Only update if we have a valid image ready
    if (currentImg && currentImg.complete) {
        const w = context.canvas.width;
        const h = context.canvas.height;
        
        // If we have both frames and they're loaded, blend between them for smoothness
        // Only blend if blendFactor is significant enough to be visible
        if (nextImg && nextImg.complete && frameIndex !== nextFrameIndex && blendFactor > 0.05) {
            // Clear canvas only when we're ready to draw both frames
            context.clearRect(0, 0, w, h);
            
            // Draw current frame (base layer) - don't clear again
            if (drawImageProp(context, currentImg, 1, false)) {
                // Blend next frame on top for smooth transition
                context.save();
                context.globalAlpha = blendFactor;
                context.globalCompositeOperation = 'source-over';
                drawImageProp(context, nextImg, 1, false);
                context.restore();
                
                lastDrawnFrameIndex = frameIndex;
            }
        } else {
            // Single frame - only clear and redraw if frame changed or if we haven't drawn anything yet
            if (lastDrawnFrameIndex !== frameIndex || lastDrawnFrameIndex === -1) {
                // drawImageProp will clear the canvas for single frame draws
                if (drawImageProp(context, currentImg, 1, true)) {
                    lastDrawnFrameIndex = frameIndex;
                }
            }
        }
    } else if (!currentImg) {
        // Preload nearby images if current one isn't loaded yet
        const preloadRange = 5;
        for (let i = Math.max(0, frameIndex - preloadRange);
            i <= Math.min(currentConfig.count - 1, frameIndex + preloadRange);
            i++) {
            if (!images[i]) {
                const { path, prefix, suffix, pad } = currentConfig;
                const imgToLoad = new Image();
                const number = padNumber(i + 1, pad);
                imgToLoad.src = `${path}${prefix}${number}${suffix}`;
                imgToLoad.onload = () => {
                    images[i] = imgToLoad;
                    // Redraw if this was the frame we needed
                    if (i === frameIndex || i === nextFrameIndex) {
                        requestAnimationFrame(() => updateImage(progress));
                    }
                };
            }
        }
    }
    // If image isn't ready, don't clear canvas - keep showing last frame
}

// Smooth animation loop
function animateProgress() {
    // Smooth interpolation towards target progress
    const diff = targetProgress - currentProgress;
    const smoothingFactor = isScrolling ? 0.15 : 0.08; // Faster when scrolling, slower when idle
    currentProgress += diff * smoothingFactor;
    
    // Update image with interpolated progress
    updateImage(currentProgress);
    
    // Continue animation if we're not at target or if still scrolling
    if (Math.abs(diff) > 0.001 || isScrolling) {
        rafId = requestAnimationFrame(animateProgress);
    } else {
        rafId = null;
    }
}


function initImages() {
    if (!currentConfig) return;

    images.length = 0;
    loadedCount = 0;
    isInitialLoad = true;

    if (loadingScreen) {
        loadingScreen.style.opacity = '1';
        loadingScreen.style.pointerEvents = 'auto';
    }

    const { path, count, prefix, suffix, pad } = currentConfig;

    // Initialize array with nulls
    for (let i = 0; i < count; i++) {
        images.push(null);
    }

    // Load images progressively
    function loadImage(index) {
        if (index > count || index < 1) return;
        if (images[index - 1] !== null) return; // Already loading or loaded

        const img = new Image();
        const number = padNumber(index, pad);
        img.src = `${path}${prefix}${number}${suffix}`;

        img.onload = () => {
            images[index - 1] = img; // Store at index-1 since arrays are 0-indexed
            loadedCount++;

            const percent = Math.round((loadedCount / count) * 100);
            if (progressBar) progressBar.style.width = `${percent}%`;
            if (loadingText) loadingText.innerText = `SYSTEM LOADING... ${percent}%`;

            // Show page after initial images load
            if (isInitialLoad && loadedCount >= INITIAL_IMAGES_TO_LOAD) {
                isInitialLoad = false;
                setTimeout(() => {
                    if (loadingScreen) {
                        loadingScreen.style.opacity = '0';
                        loadingScreen.style.pointerEvents = 'none';
                    }
                    resizeCanvas();
                }, 300);
            }
        };

        img.onerror = (e) => {
            console.error(`Failed to load image: ${img.src}`, e);
            images[index - 1] = null; // Mark as failed but keep trying
            loadedCount++;
        };
    }

    // Load first batch in parallel (critical for fast initial load)
    for (let i = 1; i <= Math.min(INITIAL_IMAGES_TO_LOAD, count); i++) {
        loadImage(i);
    }

    // Load remaining images progressively (with batching to avoid overwhelming)
    if (count > INITIAL_IMAGES_TO_LOAD) {
        setTimeout(() => {
            let batchStart = INITIAL_IMAGES_TO_LOAD + 1;
            const BATCH_SIZE = 10; // Load 10 at a time

            function loadBatch() {
                const batchEnd = Math.min(batchStart + BATCH_SIZE, count + 1);
                for (let i = batchStart; i < batchEnd; i++) {
                    loadImage(i);
                }
                batchStart = batchEnd;

                if (batchStart <= count) {
                    // Load next batch after a short delay
                    setTimeout(loadBatch, 100);
                }
            }

            loadBatch();
        }, 500);
    }


    const scrollHeight = count * 35;
    const spacerElement = document.querySelector('.spacer');
    if (spacerElement) {
        spacerElement.style.height = `${scrollHeight}px`;
    }

    // Safety Timeout: Dismiss loader after 2 seconds if initial images don't load
    setTimeout(() => {
        if (isInitialLoad && loadingScreen && loadingScreen.style.opacity !== '0') {
            isInitialLoad = false;
            loadingScreen.style.opacity = '0';
            loadingScreen.style.pointerEvents = 'none';
            resizeCanvas();
            console.warn('Loader dismissed by safety timeout (Showing page with available images).');
        }
    }, 2000);
}


window.addEventListener('resize', () => {
    resizeCanvas();
    checkDevice();
});

// Optimized scroll handler with smooth animation
let scrollTimeout;
window.addEventListener('scroll', () => {
    targetProgress = getScrollProgress();
    isScrolling = true;
    
    // Start animation loop if not already running
    if (!rafId) {
        rafId = requestAnimationFrame(animateProgress);
    }
    
    // Clear timeout
    clearTimeout(scrollTimeout);
    
    // Mark as not scrolling after a short delay
    scrollTimeout = setTimeout(() => {
        isScrolling = false;
    }, 150);
}, { passive: true });


// --- AWARD-WINNING POLISH (Scroll & Interaction) ---

// 1. Scroll-Triggered Animations (Intersection Observer)
const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.15 // Trigger when 15% visible
};

const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const target = entry.target;
        target.classList.add('visible');
        if (target.classList.contains('count-up')) animateValue(target);
        obs.unobserve(target); // Only animate once
    });
}, observerOptions);

// 2. Dynamic Number Counting
function animateValue(obj) {
    if (!obj) return;
    const rawValue = obj.getAttribute('data-value') || obj.innerText || '0';
    const value = parseFloat(rawValue.replace(/[^0-9.]/g, ''));
    const suffix = rawValue.replace(/[0-9.]/g, '');

    let startTimestamp = null;
    const duration = 2000;

    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);

        // Easing function (easeOutExpo)
        const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);

        obj.innerHTML = (ease * value).toFixed(1) + suffix;

        if (progress < 1) {
            window.requestAnimationFrame(step);
        } else {
            obj.innerHTML = rawValue; // Ensure final value is exact
        }
    };
    window.requestAnimationFrame(step);
}

// 3. Interactive Glassmorphism (Mouse Tracking)
document.addEventListener('mousemove', (e) => {
    const glassPanels = document.querySelectorAll('.glass-panel');

    glassPanels.forEach(panel => {
        const rect = panel.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        panel.style.setProperty('--mouse-x', `${x}px`);
        panel.style.setProperty('--mouse-y', `${y}px`);
    });
});

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    // Start loading images immediately (only if canvas exists - main page)
    if (canvas) {
        checkDevice();
        // Initialize progress values
        targetProgress = getScrollProgress();
        currentProgress = targetProgress;
        // Start animation loop for smooth updates
        if (!rafId) {
            rafId = requestAnimationFrame(animateProgress);
        }
    }

    const hiddenElements = document.querySelectorAll('.reveal-on-scroll');
    hiddenElements.forEach((el) => observer.observe(el));
});

// Re-run observer on resize in case layout changes
window.addEventListener('resize', () => {
    resizeCanvas();
    checkDevice();
});
