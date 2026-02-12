const canvas = document.getElementById('hero-canvas');
const context = canvas.getContext('2d');
const loadingScreen = document.getElementById('loading-screen');
const progressBar = document.querySelector('.progress');
const loadingText = document.querySelector('.loading-text');


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
    const dpr = window.devicePixelRatio || 1;

    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;



    requestAnimationFrame(() => updateImage(getScrollProgress()));
}


function getScrollProgress() {
    const scrollTop = document.documentElement.scrollTop;
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    return Math.min(Math.max(scrollTop / maxScroll, 0), 1);
}


function drawImageProp(ctx, img) {
    if (!img) return;

    const w = ctx.canvas.width;
    const h = ctx.canvas.height;
    const iW = img.width;
    const iH = img.height;


    const scale = Math.max(w / iW, h / iH);
    const x = (w / 2) - (iW / 2) * scale;
    const y = (h / 2) - (iH / 2) * scale;

    ctx.clearRect(0, 0, w, h);
    ctx.drawImage(img, x, y, iW * scale, iH * scale);
}


function updateImage(progress) {
    if (images.length === 0) return;

    const frameIndex = Math.min(
        currentConfig.count - 1,
        Math.floor(progress * currentConfig.count)
    );

    const img = images[frameIndex];
    if (img && img.complete) {
        drawImageProp(context, img);
    }
}


function initImages() {

    images.length = 0;
    loadedCount = 0;
    loadingScreen.style.opacity = '1';
    loadingScreen.style.pointerEvents = 'auto';

    const { path, count, prefix, suffix, pad } = currentConfig;


    for (let i = 1; i <= count; i++) {
        const img = new Image();
        const number = padNumber(i, pad);
        img.src = `${path}${prefix}${number}${suffix}`;

        img.onload = () => {
            loadedCount++;
            const percent = Math.round((loadedCount / count) * 100);
            progressBar.style.width = `${percent}%`;
            loadingText.innerText = `SYSTEM LOADING... ${percent}%`;

            if (loadedCount === count) {
                setTimeout(() => {
                    loadingScreen.style.opacity = '0';
                    loadingScreen.style.pointerEvents = 'none';

                    resizeCanvas();
                }, 500);
            }
        };

        img.onerror = (e) => {
            console.error(`Failed to load image: ${img.src}`, e);

            loadedCount++;
        };

        images.push(img);
    }


    const scrollHeight = count * 15;
    document.querySelector('.spacer').style.height = `${scrollHeight}px`;
}


window.addEventListener('resize', () => {
    resizeCanvas();
    checkDevice();
});

window.addEventListener('scroll', () => {
    const progress = getScrollProgress();
    requestAnimationFrame(() => updateImage(progress));
});


checkDevice();
resizeCanvas();
