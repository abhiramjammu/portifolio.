// ─── CUSTOM CURSOR ───
const cursorDot = document.getElementById('cursorDot');
const cursorRing = document.getElementById('cursorRing');

window.addEventListener('mousemove', (e) => {
  if(cursorDot && cursorRing) {
    cursorDot.style.left = e.clientX + 'px';
    cursorDot.style.top = e.clientY + 'px';
    
    setTimeout(() => {
      cursorRing.style.left = e.clientX + 'px';
      cursorRing.style.top = e.clientY + 'px';
    }, 50);
  }
});

// Hover effect for interactives
const interactives = document.querySelectorAll('a, button, .tl-card, .tilt-panel, .contact-link');
interactives.forEach(el => {
  el.addEventListener('mouseenter', () => {
    if(cursorRing) {
      cursorRing.style.width = '60px';
      cursorRing.style.height = '60px';
      cursorRing.style.backgroundColor = 'rgba(59, 130, 246, 0.1)';
      cursorRing.style.borderColor = 'transparent';
    }
  });
  el.addEventListener('mouseleave', () => {
    if(cursorRing) {
      cursorRing.style.width = '36px';
      cursorRing.style.height = '36px';
      cursorRing.style.backgroundColor = 'transparent';
      cursorRing.style.borderColor = 'var(--accent-primary)';
    }
  });
});

// ─── BENTO CARD TO ORBIT HIGHLIGHTING ───
const bentoCards = document.querySelectorAll('.bento-card');

bentoCards.forEach(card => {
  card.addEventListener('mouseenter', () => {
    const category = card.getAttribute('data-category');
    if (!category) return;
    
    // Highlight matching items
    document.querySelectorAll(`.orbit-item[data-category="${category}"]`).forEach(item => {
      item.classList.add('highlighted');
    });
  });
  
  card.addEventListener('mouseleave', () => {
    // Remove highlights
    document.querySelectorAll('.orbit-item.highlighted').forEach(item => {
      item.classList.remove('highlighted');
    });
  });
});

// ─── FLOATING ROBOT LOGIC (Perfect Scroll Follow & Hover Interactivity) ───
const floatingRobot = document.getElementById('floatingRobot');
const heroAnchor = document.getElementById('heroRobotAnchor');
let currentTarget = heroAnchor;
let hoverTarget = null; // Used to override scroll tracking when hovering specific elements
let hoverAnimFrame = null;

if (floatingRobot) {
  const allTargets = Array.from(document.querySelectorAll('.tracking-target, .tracking-target-sub, #heroRobotAnchor'));

  const updateRobotPosition = () => {
    const activeTarget = hoverTarget || currentTarget;
    if (!activeTarget) return;

    const rect = activeTarget.getBoundingClientRect();
    const pos = activeTarget.getAttribute('data-robot-pos'); // 'left' or 'right'
    
    let targetX, targetY;
    
    if (activeTarget === heroAnchor) {
      // Place right over the hero anchor perfectly
      targetX = rect.left;
      targetY = rect.top;
    } else {
      // Place vertically in the middle of the target
      targetY = rect.top + (rect.height / 2) - 30;
      
      if (pos === 'left') {
        targetX = rect.left - 80;
        if (targetX < 20) targetX = 20; // Keep on screen
      } else if (pos === 'far-right') {
        const centerX = window.innerWidth / 2;
        targetX = centerX + 350; // Perfectly fixes it outside the center visual, responsive to screen size without hugging the right edge
        if (targetX + 80 > window.innerWidth) {
          targetX = window.innerWidth - 80;
        }
      } else if (pos === 'top-right') {
        targetX = rect.right - 100; // Over the orbit slightly inward
        targetY = rect.top - 20;    // Near the top
        if (targetX + 80 > window.innerWidth) targetX = window.innerWidth - 80;
      } else if (pos === 'top') {
        targetX = rect.left + (rect.width / 2) - 40; // Centered
        targetY = rect.top - 80;    // Right above the container
      } else {
        targetX = rect.right + 20;
        if (targetX + 80 > window.innerWidth) {
          targetX = window.innerWidth - 80; // Keep on screen
        }
      }
    }

    floatingRobot.style.transform = `translate(${targetX}px, ${targetY}px)`;
  };

  const calculateTarget = () => {
    if (hoverTarget) return; // Don't interrupt if we are actively hovering a target

    if (window.scrollY < 200) {
      currentTarget = heroAnchor;
    } else {
      let closestTarget = heroAnchor;
      let minDistance = Infinity;
      // Bias tracking to elements near the middle-top of the screen
      const viewportFocus = window.innerHeight * 0.4; 

      allTargets.forEach(t => {
        if (t === heroAnchor) return;
        const rect = t.getBoundingClientRect();
        // Skip elements completely offscreen
        if (rect.bottom < 0 || rect.top > window.innerHeight) return;
        
        const targetCenter = rect.top + (rect.height / 2);
        const distance = Math.abs(targetCenter - viewportFocus);
        
        if (distance < minDistance) {
          minDistance = distance;
          closestTarget = t;
        }
      });
      currentTarget = closestTarget;
      
      // Auto-reveal the timeline item when robot targets it
      const tlItem = currentTarget.closest('.tl-item');
      if (tlItem) {
        tlItem.classList.add('revealed');
      }

      // If we completely scroll away from the experience section, fade out the websites
      if (!currentTarget.closest('#experience')) {
        document.querySelectorAll('.tl-item.revealed').forEach(item => {
          item.classList.remove('revealed');
        });
      }
    }
    updateRobotPosition();
  };

  let hoverTimeout;
  const hoverTargetsList = document.querySelectorAll('.interactive-robot-target');
  hoverTargetsList.forEach(card => {
    card.addEventListener('mouseenter', () => {
      clearTimeout(hoverTimeout);
      hoverTarget = card;
      // Use requestAnimationFrame to continuously track position while the card is transitioning/expanding
      const trackHover = () => {
        if (hoverTarget === card) {
          updateRobotPosition();
          hoverAnimFrame = requestAnimationFrame(trackHover);
        }
      };
      trackHover();
    });
    card.addEventListener('mouseleave', () => {
      if (hoverAnimFrame) cancelAnimationFrame(hoverAnimFrame);
      hoverTimeout = setTimeout(() => {
        if (hoverTarget === card) { // Only clear if we haven't hovered something else
          hoverTarget = null;
          calculateTarget(); // Re-evaluate based on scroll
        }
      }, 150);
    });
  });

  window.addEventListener('scroll', calculateTarget);
  window.addEventListener('resize', calculateTarget);
  
  // Track continuously for a short duration to account for any initial layout shifts/animations
  let initialTrackFrames = 0;
  const trackLoad = () => {
    calculateTarget();
    initialTrackFrames++;
    if (initialTrackFrames < 100) {
      requestAnimationFrame(trackLoad);
    }
  };
  trackLoad();
}

// ─── ROBOT EYE TRACKING (SMALL & BIG) & ARMS ───
const robots = document.querySelectorAll('.robot, .big-robot');

// Vertigo Animation Loop
let vertigoFrame;
const animateVertigo = () => {
  const activeTarget = hoverTarget || currentTarget;
  const isVertigo = activeTarget && activeTarget.classList.contains('skills-orbit-wrapper');
  
  if (isVertigo) {
    const smallPupils = document.querySelectorAll('.small-robot .robot-pupil');
    const time = Date.now() / 150;
    smallPupils.forEach(pupil => {
      const x = Math.cos(time) * 3;
      const y = Math.sin(time) * 3;
      pupil.style.transform = `translate(${x}px, ${y}px)`;
    });
  }
  requestAnimationFrame(animateVertigo);
};
requestAnimationFrame(animateVertigo);

if(robots.length > 0) {
  window.addEventListener('mousemove', (e) => {
    const mouseX = e.clientX;
    const mouseY = e.clientY;
    
    const activeTarget = hoverTarget || currentTarget;
    const isVertigo = activeTarget && activeTarget.classList.contains('skills-orbit-wrapper');

    robots.forEach(robot => {
      const isBig = robot.classList.contains('big-robot');
      const pupils = robot.querySelectorAll(isBig ? '.br-pupil' : '.robot-pupil');
      const robotRect = robot.getBoundingClientRect();
      const robotCenterX = robotRect.left + robotRect.width / 2;
      const robotCenterY = robotRect.top + robotRect.height / 2;
      
      const divider = isBig ? 80 : 40;
      const moveX = (mouseX - robotCenterX) / divider;
      const moveY = (mouseY - robotCenterY) / divider;
      
      if(isBig) {
        robot.style.transform = `translateZ(0) translate(${moveX}px, ${moveY}px)`;
      }

      pupils.forEach(pupil => {
        if (!isBig && isVertigo) return; // Let vertigo animation handle it
        const rect = pupil.parentElement.getBoundingClientRect();
        const eyeCenterX = rect.left + rect.width / 2;
        const eyeCenterY = rect.top + rect.height / 2;
        const angle = Math.atan2(mouseY - eyeCenterY, mouseX - eyeCenterX);
        const maxDist = (rect.width / 2) - (pupil.getBoundingClientRect().width / 2) - (isBig ? 4 : 1);
        const x = Math.cos(angle) * maxDist;
        const y = Math.sin(angle) * maxDist;
        pupil.style.transform = `translate(${x}px, ${y}px)`;
      });
    });
  });
}

// ─── 3D TILT EFFECT ───
const tiltPanels = document.querySelectorAll('.tilt-panel');
tiltPanels.forEach(panel => {
  let isTilting = false;
  panel.addEventListener('mousemove', (e) => {
    if (!isTilting) {
      isTilting = true;
      requestAnimationFrame(() => {
        const rect = panel.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        const rotateX = ((y - centerY) / centerY) * -4; 
        const rotateY = ((x - centerX) / centerX) * 4;
        
        panel.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
        isTilting = false;
      });
    }
  });

  panel.addEventListener('mouseleave', () => {
    panel.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg)`;
  });
});

// ─── HERO TYPING EFFECT ───
const roleText = document.getElementById('roleText');
if(roleText) {
  const roles = ["Creative Production Lead", "Performance Marketing", "Motion Designer", "Data Analyst"];
  let roleIndex = 0;
  let charIndex = 0;
  let isDeleting = false;

  function typeEffect() {
    const currentRole = roles[roleIndex];
    if(isDeleting) {
      roleText.textContent = currentRole.substring(0, charIndex - 1);
      charIndex--;
    } else {
      roleText.textContent = currentRole.substring(0, charIndex + 1);
      charIndex++;
    }

    let typeSpeed = isDeleting ? 40 : 80;

    if(!isDeleting && charIndex === currentRole.length) {
      typeSpeed = 2000;
      isDeleting = true;
    } else if(isDeleting && charIndex === 0) {
      isDeleting = false;
      roleIndex = (roleIndex + 1) % roles.length;
      typeSpeed = 500;
    }
    setTimeout(typeEffect, typeSpeed);
  }
  setTimeout(typeEffect, 1000);
}

// ─── IRREVERSIBLE PORTFOLIO PREVIEW HOVER ───
const tlItems = document.querySelectorAll('.tl-item');
tlItems.forEach(item => {
  item.addEventListener('mouseenter', () => {
    item.classList.add('revealed');
  });
});
