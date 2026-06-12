// js/scrollytelling.js - Vanilla JS Scroll Engine

document.addEventListener('DOMContentLoaded', () => {
    const sections = document.querySelectorAll('.scrolly-section');
    const maskLayer = document.querySelector('.bg-mask-layer');
    const bgImage = document.querySelector('.fixed-bg img');

    function easeOutCubic(x) {
        return 1 - Math.pow(1 - x, 3);
    }

    function handleScroll() {
        // Calculate total scroll progress (0 to 1)
        const scrollPx = window.scrollY;
        const maxScroll = document.body.scrollHeight - window.innerHeight;
        const progress = maxScroll > 0 ? scrollPx / maxScroll : 0;

        // Background Mask Expansion Effect
        // Mask starts shrinking at 10% progress, completely reveals by 30%
        if (maskLayer) {
            if (progress < 0.1) {
                maskLayer.style.opacity = '1';
                maskLayer.style.webkitMaskImage = `radial-gradient(circle at center, transparent 0%, black 10%)`;
            } else if (progress >= 0.1 && progress <= 0.4) {
                const maskProgress = (progress - 0.1) / 0.3; // 0 to 1
                const e = easeOutCubic(maskProgress);
                const transparentRadius = e * 150; // Expands to 150%
                const solidRadius = transparentRadius + 10;
                
                maskLayer.style.webkitMaskImage = `radial-gradient(circle at center, transparent ${transparentRadius}%, black ${solidRadius}%)`;
                
                if (maskProgress > 0.8) {
                    maskLayer.style.opacity = 1 - ((maskProgress - 0.8) * 5); // Fade out last 20%
                } else {
                    maskLayer.style.opacity = '1';
                }
            } else {
                maskLayer.style.opacity = '0';
            }
        }
        
        // Background Zoom Effect
        if (bgImage) {
            const scale = 1 + (progress * 0.2); // Slow zoom from 1 to 1.2
            bgImage.style.transform = `scale(${scale})`;
        }

        // Section Animations
        sections.forEach((sec) => {
            const start = parseFloat(sec.getAttribute('data-start'));
            const end = parseFloat(sec.getAttribute('data-end'));
            
            if (progress >= start && progress <= end) {
                const localProgress = (progress - start) / (end - start);
                
                let opacity = 0;
                let translateY = 10; // start at 10vh below
                
                // Fade in (first 15%)
                if (localProgress < 0.15) {
                    if (start === 0.0) {
                        const p = localProgress / 0.15;
                        opacity = p; // Start at 0 and fade to 1
                        translateY = 5 * (1 - easeOutCubic(p));
                    } else {
                        const p = localProgress / 0.15;
                        opacity = p;
                        translateY = 10 * (1 - easeOutCubic(p));
                    }
                } 
                // Fade out (last 15%)
                else if (localProgress > 0.85) {
                    const p = (localProgress - 0.85) / 0.15;
                    opacity = 1 - p;
                    translateY = -10 * easeOutCubic(p); // drift upwards
                } 
                // Hold (middle 70%)
                else {
                    opacity = 1;
                    translateY = 0;
                }
                
                sec.style.opacity = opacity.toFixed(3);
                sec.style.transform = `translateY(${translateY.toFixed(2)}vh)`;
                sec.style.pointerEvents = opacity > 0.5 ? 'auto' : 'none';
            } else {
                sec.style.opacity = '0';
                sec.style.transform = `translateY(10vh)`;
                sec.style.pointerEvents = 'none';
            }
        });

        // Auto-back at the bottom
        if (progress >= 0.99) {
            if (!window.hasAutoBacked) {
                window.hasAutoBacked = true;
                setTimeout(() => {
                    if (window.history.length > 1) {
                        window.history.back();
                    } else {
                        window.location.href = "index.html#projects";
                    }
                }, 800);
            }
        } else {
            window.hasAutoBacked = false;
        }
    }

    // Initialize and bind
    window.addEventListener('scroll', () => {
        requestAnimationFrame(handleScroll);
    }, { passive: true });
    
    // Initial call
    handleScroll();

    // Auto-scroll slightly on load to trigger the first fade-in gracefully immediately
    setTimeout(() => {
        if(window.scrollY < 10) {
            window.scrollTo({ top: 350, behavior: 'smooth' });
        }
    }, 50);
});
