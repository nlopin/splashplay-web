document.addEventListener('DOMContentLoaded', () => {
    // Check user's preferred language and show banner if needed
    checkPreferredLanguage();

    // Helper function to handle videos
    const handleVideo = (videoElement, containerElement) => {
        if (!videoElement) return;

        // Check if the browser supports video playback
        const isVideoSupported = !!document.createElement('video').canPlayType;

        if (isVideoSupported) {
            // Ensure video plays even if autoplay fails on some mobile devices
            videoElement.play().catch(() => {
                console.log('Autoplay prevented. User interaction required to play video.');

                // Add a play button overlay if autoplay is blocked
                if (containerElement) {
                    const playButton = document.createElement('button');
                    playButton.classList.add('video-play-button');
                    playButton.innerHTML = '<span>▶</span>';
                    playButton.setAttribute('aria-label', 'Play video');

                    containerElement.appendChild(playButton);

                    playButton.addEventListener('click', () => {
                        videoElement.play();
                        playButton.style.display = 'none';
                    });
                }
            });

            // Optimize video loading on mobile
            if (window.matchMedia('(max-width: 768px)').matches) {
                videoElement.setAttribute('preload', 'metadata');
            }
        } else {
            // Add a fallback background image if video isn't supported
            if (containerElement) {
                containerElement.classList.add('video-fallback');
            }
        }
    };

    // Handle hero video
    const heroVideo = document.querySelector('.hero__video');
    const heroVideoContainer = document.querySelector('.hero__video-container');
    handleVideo(heroVideo, heroVideoContainer);

    // Handle technique videos
    const techniqueVideos = document.querySelectorAll('.technique-video');
    techniqueVideos.forEach(video => {
        const container = video.closest('.technique-video-container');
        handleVideo(video, container);

        // Add lazy loading for technique videos
        // Videos will only start loading when they're close to being in viewport
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    if (video.paused) {
                        video.play().catch(() => console.log('Could not autoplay technique video'));
                    }
                    observer.unobserve(video);
                }
            });
        }, { threshold: 0.1 });

        observer.observe(video);
    });

    // Smooth scrolling for anchor links
    const navLinks = document.querySelectorAll('nav a[href^="#"]');

    navLinks.forEach(link => {
        // Active state for navigation
        link.addEventListener('click', function(e) {
            e.preventDefault();

            navLinks.forEach(item => item.classList.remove('active'));
            this.classList.add('active');

            // Smooth scroll to section
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);

            if (targetSection) {
                targetSection.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });

    // Fade in elements on page load
    const elements = [
        document.querySelector('.header__logo'),
        document.querySelector('.hero__content'),
        document.querySelector('.hero__video-container')
    ];

    // Pricing tab switching
    const pricingNavItems = document.querySelectorAll('.pricing-nav-item');
    const pricingTabs = document.querySelectorAll('.pricing-tab');

    pricingNavItems.forEach(navItem => {
        navItem.addEventListener('click', () => {
            // Remove active class from all nav items
            pricingNavItems.forEach(item => item.classList.remove('active'));

            // Add active class to clicked nav item
            navItem.classList.add('active');

            // Get the data-tab attribute value
            const tabId = navItem.getAttribute('data-tab');

            // Hide all tabs
            pricingTabs.forEach(tab => tab.classList.remove('active'));

            // Show the selected tab
            document.getElementById(`${tabId}-tab`).classList.add('active');
        });
    });

    // Add initial invisible class if not already in CSS
    elements.forEach(el => {
        if (el) {
            el.style.opacity = '0';
            el.style.transform = 'translateY(20px)';
            el.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
        }
    });

    // Animate elements with slight delay between each
    let delay = 300;
    elements.forEach(el => {
        if (el) {
            setTimeout(() => {
                el.style.opacity = '1';
                el.style.transform = 'translateY(0)';
            }, delay);
            delay += 200;
        }
    });

    // Add video play button styles dynamically
    const style = document.createElement('style');
    style.textContent = `
        .video-play-button {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 70px;
            height: 70px;
            background-color: var(--orange);
            border-radius: 50%;
            border: none;
            cursor: pointer;
            z-index: 2;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
        }

        .video-play-button span {
            color: white;
            font-size: 24px;
            margin-left: 5px; /* Adjust for visual centering */
        }

        .video-fallback {
            background-image: url('../assets/video/fallback.jpg');
            background-size: cover;
            background-position: center;
            width: 100%;
            min-height: 200px;
        }
    `;
    document.head.appendChild(style);

    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const headerNavContainer = document.querySelector('.header__nav-container');

    if (mobileMenuToggle && headerNavContainer) {
        mobileMenuToggle.addEventListener('click', function() {
            this.classList.toggle('active');
            headerNavContainer.classList.toggle('active');
        });
    }
});

const WAS_LANG_BANNER_DISMISSED_KEY = 'wasLangBannerDismissed'
function checkPreferredLanguage() {
    const currentPageLang = document.documentElement.lang;

    let userLanguages = navigator.languages.map(lang => lang.toLowerCase().split('-')[0])

    const supportedLanguages = {
        'en': 'en.html',
        'es': 'index.html'
    };
    const wasBannerDismissed = localStorage.getItem(WAS_LANG_BANNER_DISMISSED_KEY);
    if (wasBannerDismissed) return

    const userLang = userLanguages.find(lang => lang in supportedLanguages);

    // Only show banner if:
    // 1. User's language is supported
    // 2. User's language doesn't match current page language
    // 3. Banner hasn't been dismissed
    if (userLang !== currentPageLang) {
        createLanguageBanner(userLang, supportedLanguages[userLang]);
    }
}

function createLanguageBanner(userLang, targetUrl) {
    const banner = document.createElement('div');
    banner.className = 'language-banner';

    let bannerText, switchText;
    if (userLang === 'en') {
      bannerText = 'Prefer to read this page in English?';
      switchText = 'Switch to English';
    } else {
      bannerText = '¿Prefieres ver esta página en Español?';
      switchText = 'Cambiar a Español';
    }

    banner.innerHTML = `
        <div class="container">
            <div class="language-banner-content">
                <p>${bannerText}</p>
                <div class="language-banner-actions">
                    <a href="${targetUrl}" class="language-switch-link">${switchText}</a>
                    <button class="language-banner-close" aria-label="Close banner">✕</button>
                </div>
            </div>
        </div>
    `;

    const header = document.querySelector('.site-header');
    document.body.insertBefore(banner, header);

    const closeButton = banner.querySelector('.language-banner-close');
    closeButton.addEventListener('click', () => {
        banner.remove();
        localStorage.setItem(WAS_LANG_BANNER_DISMISSED_KEY, 'true');
    });
}
