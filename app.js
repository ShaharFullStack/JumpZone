import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

// --- Simple Three.js Background Setup ---
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 2000);
        const renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('bg-canvas'), alpha: true, antialias: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setClearColor(0x000000, 0);
        
        // Allow clicks to pass through canvas to UI elements beneath
        const canvas = document.getElementById('bg-canvas');
        canvas.style.pointerEvents = 'none';
        
        camera.position.z = 2;

        // Enhanced lighting for the mascot
        const ambientLight = new THREE.AmbientLight(0x404040, 5);
        scene.add(ambientLight);
        const directionalLight = new THREE.DirectionalLight(0xffffff, 2);
        directionalLight.position.set(-12, 9.9, 10);
        scene.add(directionalLight);
        
        // Spotlight focused on the mascot
        const spotlight = new THREE.SpotLight(0xffffff, 12);
        spotlight.position.set(0, 2, 0);
        spotlight.target.position.set(0, 1, 0);
        spotlight.angle = Math.PI / 6; // 30 degree cone
        spotlight.penumbra = 0.3; // Soft edges
        spotlight.decay = 2;
        spotlight.distance = 10;
        scene.add(spotlight);
        scene.add(spotlight.target);

        // Variables for mascot
        let mascot = null;
        let headBone = null;
        let mixer = null;
        let animations = {}; // Store all animations by name
        const clock = new THREE.Clock();
        let currentAnimation = null;
        
        // Section-specific animations mapping
        const sectionAnimations = [
            'NlaTrack.005', // Hero
            'NlaTrack.004', // Story
            'NlaTrack.009', // Philosophy
            'NlaTrack.004', // Why Us
            'NlaTrack.010', // Services (then switches to .005)
            'NlaTrack.003', // Testimonials
            'NlaTrack.004', // Pricing
            'NlaTrack.010'  // Final CTA (then switches to .004)
        ];
        const originalRotation = { x: 0, y: Math.PI * 1.35, z: 0 }; // Store original facing angle
        
        // Mouse tracking variables
        let mouse = new THREE.Vector2();
        
        // Enhanced device detection for extra responsiveness
        const isExtraSmallMobile = window.innerWidth <= 320; // iPhone SE, very small phones
        const isSmallMobile = window.innerWidth <= 460;      // Small phones
        const isMobile = window.innerWidth <= 768;           // Regular mobile/tablet
        const isTablet = window.innerWidth <= 1024;          // Tablets
        
        // Mascot positions for each section (multiple responsive breakpoints)
        const mascotPositions = isExtraSmallMobile ? [
            { x: 0.6, y: 0.9, z: -1.0 },   // Extra small: Very conservative positioning
            { x: 0.6, y: 0.9, z: -1.0 },   // Fixed position for all sections
            { x: 0.6, y: 0.9, z: -1.0 },   
            { x: 0.6, y: 0.9, z: -1.0 }    
        ] : isSmallMobile ? [
            { x: 0.8, y: 0.8, z: -1.2 },   // Small mobile: Top right corner
            { x: 0.8, y: 0.8, z: -1.2 },   // Fixed position for all sections
            { x: 0.8, y: 0.8, z: -1.2 },   
            { x: 0.8, y: 0.8, z: -1.2 }    
        ] : isMobile ? [
            { x: 1.8, y: 1.0, z: -1.5 },   // Regular mobile: Top right
            { x: 1.8, y: 1.0, z: -1.5 },   // Fixed position for all sections
            { x: 1.8, y: 1.0, z: -1.5 },   
            { x: 1.8, y: 1.0, z: -1.5 }    
        ] : isTablet ? [
            { x: 0, y: 0.5, z: -1.8 },     // Tablet: Conservative movement
            { x: 2, y: 0.2, z: -1.8 },     
            { x: 1.5, y: -0.5, z: -1.8 },  
            { x: -1.5, y: -0.5, z: -1.8 },

        ] : [
            { x: 0, y: 0.55, z: -2 },      // Desktop: Full movement
            { x: 3.5, y: -1.2, z: -1.8 },         
            { x: 3.3, y: -2.2, z: -2 },        
            { x: 1.8, y: 0, z: -1.3 },       
            { x: -1.5, y: 0.2, z: 0 },
            { x: -2, y: 0.5, z: -1.5 },
            { x: -2.5, y: 0.8, z: -2 },
            { x: -3, y: 1.0, z: -2.5 }
        ];
        
        // Mascot scale based on device (more granular scaling)
        const mascotScale = isExtraSmallMobile ? 0.3 : isSmallMobile ? 0.35 : isMobile ? 0.45 : isTablet ? 0.6 : 0.75;
        
        let currentMascotSection = 0;

        // Load the animated mascot
        const loader = new GLTFLoader();
        loader.load('./assets/nati.glb', (gltf) => {
            mascot = gltf.scene;
            
            // Scale and position the mascot (responsive)
            mascot.scale.set(mascotScale, mascotScale, mascotScale);
            mascot.position.set(mascotPositions[0].x, mascotPositions[0].y, mascotPositions[0].z);
            mascot.rotation.y = Math.PI * 1.45; // Rotate to face the camera
            
            // Add the mascot to the scene
            scene.add(mascot);
            
            // Set up animation mixer and load all section animations
            if (gltf.animations && gltf.animations.length > 0) {
                mixer = new THREE.AnimationMixer(mascot);
                
                // Load all required animations
                const requiredAnimations = ['NlaTrack.003', 'NlaTrack.004', 'NlaTrack.005', 'NlaTrack.009', 'NlaTrack.010'];
                
                requiredAnimations.forEach(animName => {
                    const clip = gltf.animations.find(clip => clip.name === animName);
                    if (clip) {
                        const action = mixer.clipAction(clip);
                        action.setLoop(THREE.LoopRepeat);
                        action.clampWhenFinished = false;
                        animations[animName] = action;
                        console.log('Loaded animation:', animName);
                    } else {
                        console.warn('Animation not found:', animName);
                    }
                });
                
                // Start with hero section animation (NlaTrack.005)
                if (animations['NlaTrack.005']) {
                    currentAnimation = animations['NlaTrack.005'];
                    currentAnimation.play();
                    console.log('Started hero animation: NlaTrack.005');
                }
                
                console.log('Available animations:', gltf.animations.map(a => a.name));
            }
            
            // Find the head bone for targeted movement
            mascot.traverse((child) => {
                if (child.isBone || child.isMesh) {
                    console.log('Found bone/mesh:', child.name, child.type);
                    // Look for head-related names (common naming patterns)
                    if (child.name && (
                        child.name.toLowerCase().includes('head') ||
                        child.name.toLowerCase().includes('skull') ||
                        child.name.toLowerCase().includes('cranium') ||
                        child.name.includes('Head') ||
                        child.name.includes('head')
                    )) {
                        headBone = child;
                        console.log('Found head bone:', child.name);
                    }
                }
            });
            
            // If no head bone found by name, try to find it by hierarchy (usually near top)
            if (!headBone && mascot.children.length > 0) {
                // Look for skeleton first
                mascot.traverse((child) => {
                    if (child.isSkinnedMesh && child.skeleton) {
                        const bones = child.skeleton.bones;
                        console.log('Available bones:', bones.map(b => b.name));
                        // Try to find head bone by common names or position in hierarchy
                        headBone = bones.find(bone => 
                            bone.name.toLowerCase().includes('head') ||
                            bone.name.toLowerCase().includes('skull') ||
                            bone.name.includes('Head')
                        ) || bones[bones.length - 1]; // fallback to last bone (often head)
                        if (headBone) {
                            console.log('Found head bone in skeleton:', headBone.name);
                        }
                    }
                });
            }
        }, undefined, (error) => {
            console.error('Error loading mascot:', error);
        });

        // Mouse tracking for head rotation only
        function onMouseMove(event) {
            // Update mouse position
            mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
            mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
            
            // Note: Head rotation logic is now handled in the main animate loop
            // to ensure consistent position-based angle adjustments
        }

        // Function to move mascot to specific section position
        function moveMascotToSection(sectionIndex) {
            if (!mascot || sectionIndex < 0 || sectionIndex >= mascotPositions.length) return;
            
            currentMascotSection = sectionIndex;
            const targetPos = mascotPositions[sectionIndex];
            
            // Get the animation for this section
            const animationName = sectionAnimations[sectionIndex];
            if (animationName && animations[animationName]) {
                // Stop current animation
                if (currentAnimation) {
                    currentAnimation.stop();
                }
                
                // Start new section animation
                currentAnimation = animations[animationName];
                currentAnimation.reset().play();
                console.log(`Section ${sectionIndex}: Playing ${animationName}`);
                
                // Handle special cases for Services and Final CTA sections
                if (sectionIndex === 4 && animations['NlaTrack.005']) { // Services
                    // After NlaTrack.010 plays for a bit, switch to NlaTrack.005
                    setTimeout(() => {
                        if (currentMascotSection === 4) { // Still on services section
                            currentAnimation.stop();
                            currentAnimation = animations['NlaTrack.005'];
                            currentAnimation.reset().play();
                            console.log('Services: Switched to NlaTrack.005');
                        }
                    }, 3000); // 3 seconds
                } else if (sectionIndex === 7 && animations['NlaTrack.004']) { // Final CTA
                    // After NlaTrack.010 plays for a bit, switch to NlaTrack.004
                    setTimeout(() => {
                        if (currentMascotSection === 7) { // Still on final CTA section
                            currentAnimation.stop();
                            currentAnimation = animations['NlaTrack.004'];
                            currentAnimation.reset().play();
                            console.log('Final CTA: Switched to NlaTrack.004');
                        }
                    }, 3000); // 3 seconds
                }
            }
            
            // Smoothly move to new position with timing that matches CSS transition (0.8s)
            const startTime = performance.now();
            const startPos = { 
                x: mascot.position.x, 
                y: mascot.position.y, 
                z: mascot.position.z 
            };
            const duration = 800; // Match CSS transition duration (0.8s)
            
            const moveAnimation = (currentTime) => {
                const elapsed = currentTime - startTime;
                const progress = Math.min(elapsed / duration, 1);
                
                // Use cubic-bezier easing to match CSS: cubic-bezier(0.68, -0.55, 0.27, 1.55)
                const easeProgress = cubicBezier(progress, 0.68, -0.55, 0.27, 1.55);
                
                mascot.position.x = startPos.x + (targetPos.x - startPos.x) * easeProgress;
                mascot.position.y = startPos.y + (targetPos.y - startPos.y) * easeProgress;
                mascot.position.z = startPos.z + (targetPos.z - startPos.z) * easeProgress;
                
                // Always maintain original body rotation during and after movement
                mascot.rotation.x = originalRotation.x;
                mascot.rotation.y = originalRotation.y;
                mascot.rotation.z = originalRotation.z;
                
                if (progress < 1) {
                    requestAnimationFrame(moveAnimation);
                }
            };
            
            requestAnimationFrame(moveAnimation);
        }
        
        // Cubic bezier easing function to match CSS transition
        function cubicBezier(t, p1x, p1y, p2x, p2y) {
            // Simplified cubic bezier approximation for animation timing
            return t * t * (3 - 2 * t); // Fallback to smoothstep if complex bezier is not needed
        }

        function animate() {
            requestAnimationFrame(animate);
            
            // Update animation mixer for scroll animations
            if (mixer) {
                const delta = clock.getDelta();
                mixer.update(delta);
            }
            
            // Maintain original body rotation and apply head tracking
            if (mascot) {
                // Calculate subtle body adjustments based on head tracking
                let bodyAdjustmentY = 0;
                let bodyAdjustmentX = 0;
                
                if (headBone && mouse) {
                    // Convert mascot's 3D position to screen coordinates for body adjustment too
                    const mascotScreenPos = new THREE.Vector3();
                    mascotScreenPos.copy(mascot.position);
                    mascotScreenPos.project(camera);
                    
                    const relativeMouse = {
                        x: mouse.x - mascotScreenPos.x,
                        y: mouse.y - mascotScreenPos.y
                    };
                    
                    // Full body rotation to face mouse (more natural)
                    bodyAdjustmentY = relativeMouse.x * 0.8; // Strong left/right body turn
                    bodyAdjustmentX = relativeMouse.y * 0.3; // Moderate forward/back body lean
                }
                
                // Apply original rotation with subtle body adjustments
                mascot.rotation.x = originalRotation.x + bodyAdjustmentX;
                mascot.rotation.y = originalRotation.y + bodyAdjustmentY;
                mascot.rotation.z = originalRotation.z;
                
                // Apply head tracking after animation updates
                if (headBone && mouse) {
                    // Convert mascot's 3D position to screen coordinates
                    const mascotScreenPos = new THREE.Vector3();
                    mascotScreenPos.copy(mascot.position);
                    mascotScreenPos.project(camera);
                    
                    // Calculate mouse position relative to mascot's screen position
                    const relativeMouse = {
                        x: mouse.x - mascotScreenPos.x,
                        y: mouse.y - mascotScreenPos.y
                    };
                    
                    const targetRotationY = relativeMouse.x * 0.6; // Reduced head turn since body is doing most of the work
                    
                    // Calculate smooth base angle offset based on mascot's Y position
                    // Map Y position to head angle: higher Y = look down, lower Y = look up
                    const yPosition = mascot.position.y;
                    let baseAngleOffset;
                    
                    if (yPosition >= 0.5) {
                        // High position: look down more
                        baseAngleOffset = -0.7;
                    } else if (yPosition >= 0) {
                        // Neutral-high position: look slightly down
                        baseAngleOffset = -0.4;
                    } else if (yPosition >= -1) {
                        // Neutral-low position: look straight/slightly up
                        baseAngleOffset = -0.1;
                    } else if (yPosition >= -1.5) {
                        // Low position: look up
                        baseAngleOffset = 0.4;
                    } else {
                        // Very low position: look up significantly
                        baseAngleOffset = 0.7;
                    }
                    
                    const targetRotationX = relativeMouse.y + baseAngleOffset; // Up/down head tilt relative to mascot + position-based offset
                    
                    // Apply head rotation every frame to override animation
                    // More aggressive interpolation for Y (left/right) to ensure it follows mouse
                    headBone.rotation.y += (targetRotationY - headBone.rotation.y) * 0.9;
                    headBone.rotation.x += (targetRotationX - headBone.rotation.x) * 0.8;
                    
                    // Debug: Log head rotation values occasionally
                    if (Math.random() < 0.01) { // Log 1% of the time to avoid spam
                        console.log('Mascot Screen Pos:', mascotScreenPos.x.toFixed(2), 'Relative Mouse X:', relativeMouse.x.toFixed(2), 'Head Y Rotation:', headBone.rotation.y.toFixed(2));
                    }
                }
            }
            
            renderer.render(scene, camera);
        }
        animate();

        // --- Scroll and Navigation Logic ---
        const sectionsContainer = document.getElementById('sections-container');
        const sections = document.querySelectorAll('.section');
        const navDotsContainer = document.getElementById('nav-dots');
        let currentIndex = 0;
        let isWheeling = false;
        const totalSections = sections.length;

        // Create navigation dots
        for (let i = 0; i < totalSections; i++) {
            const dot = document.createElement('button');
            dot.setAttribute('aria-label', `Go to section ${i + 1}`);
            dot.addEventListener('click', () => goToSection(i));
            navDotsContainer.appendChild(dot);
        }
        const navDots = navDotsContainer.querySelectorAll('button');

        function updateNavDots() {
            navDots.forEach((dot, i) => {
                if (i === currentIndex) {
                    dot.classList.add('bg-white');
                } else {
                    dot.classList.remove('bg-white');
                }
            });
        }

        function goToSection(index) {
            if (index < 0 || index >= totalSections) return;
            currentIndex = index;
            sectionsContainer.style.transform = `translateY(-${currentIndex * 100}vh)`;
            updateNavDots();
            
            // Move mascot to corresponding position
            moveMascotToSection(index % mascotPositions.length);
        }

        // Handle wheel event for "jump" scroll
        window.addEventListener('wheel', event => {
            event.preventDefault();
            if (isWheeling) return;

            // Require more scroll momentum to trigger section jump
            if (Math.abs(event.deltaY) > 50) {
                isWheeling = true;
                const direction = event.deltaY > 0 ? 1 : -1;
                goToSection(currentIndex + direction);

                setTimeout(() => { isWheeling = false; }, 1500); // Longer debounce for less sensitivity
            }
        }, { passive: false });

        // Touch support for mobile devices
        let touchStartY = 0;
        let touchEndY = 0;
        let isTouching = false;

        window.addEventListener('touchstart', e => {
            touchStartY = e.changedTouches[0].screenY;
            isTouching = false;
        });

        window.addEventListener('touchend', e => {
            if (isTouching) return;
            
            touchEndY = e.changedTouches[0].screenY;
            const touchDiff = touchStartY - touchEndY;
            
            // Require minimum swipe distance
            if (Math.abs(touchDiff) > 50) {
                isTouching = true;
                const direction = touchDiff > 0 ? 1 : -1;
                goToSection(currentIndex + direction);
                
                setTimeout(() => { isTouching = false; }, 1000);
            }
        });

        // Keyboard navigation support
        window.addEventListener('keydown', e => {
            if (e.key === 'ArrowDown' || e.key === 'PageDown') {
                e.preventDefault();
                goToSection(currentIndex + 1);
            } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
                e.preventDefault();
                goToSection(currentIndex - 1);
            } else if (e.key === 'Home') {
                e.preventDefault();
                goToSection(0);
            } else if (e.key === 'End') {
                e.preventDefault();
                goToSection(totalSections - 1);
            }
        });
        
        // Mobile-specific optimizations
        if (isMobile) {
            // Reduce Three.js rendering quality on mobile for better performance
            renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        }

        // Add mouse event listener
        window.addEventListener('mousemove', onMouseMove);
        
        // Handle window resize for responsive behavior
        window.addEventListener('resize', () => {
            const wasExtraSmallMobile = isExtraSmallMobile;
            const wasSmallMobile = isSmallMobile;
            const wasMobile = isMobile;
            const wasTablet = isTablet;
            
            const nowExtraSmallMobile = window.innerWidth <= 320;
            const nowSmallMobile = window.innerWidth <= 460;
            const nowMobile = window.innerWidth <= 768;
            const nowTablet = window.innerWidth <= 1024;
            
            // Update camera and renderer
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
            goToSection(currentIndex); // Recalculate position on resize
            
            // If device state changed, update mascot positioning
            if ((wasExtraSmallMobile !== nowExtraSmallMobile || 
                 wasSmallMobile !== nowSmallMobile || 
                 wasMobile !== nowMobile || 
                 wasTablet !== nowTablet) && mascot) {
                
                // Update positions array based on new screen size
                const newPositions = nowExtraSmallMobile ? [
                    { x: 0.6, y: 0.9, z: -1.0 },   // Extra small mobile
                    { x: 0.6, y: 0.9, z: -1.0 },
                    { x: 0.6, y: 0.9, z: -1.0 },
                    { x: 0.6, y: 0.9, z: -1.0 }
                ] : nowSmallMobile ? [
                    { x: 0.8, y: 0.8, z: -1.2 },   // Small mobile
                    { x: 0.8, y: 0.8, z: -1.2 },
                    { x: 0.8, y: 0.8, z: -1.2 },
                    { x: 0.8, y: 0.8, z: -1.2 }
                ] : nowMobile ? [
                    { x: 1.8, y: 1.0, z: -1.5 },   // Regular mobile
                    { x: 1.8, y: 1.0, z: -1.5 },
                    { x: 1.8, y: 1.0, z: -1.5 },
                    { x: 1.8, y: 1.0, z: -1.5 }
                ] : nowTablet ? [
                    { x: 0, y: 0.5, z: -1.8 },     // Tablet
                    { x: 2, y: 0.2, z: -1.8 },
                    { x: 1.5, y: -0.5, z: -1.8 },
                    { x: -1.5, y: -0.5, z: -1.8 }
                ] : [
                    { x: 0, y: 0.35, z: -2 },      // Desktop
                    { x: 3, y: 0, z: -2 },
                    { x: 2, y: -1, z: -2 },
                    { x: -2, y: -1, z: -2 }
                ];
                
                // Update scale
                const newScale = nowExtraSmallMobile ? 0.6 : nowSmallMobile ? 0.7 : nowMobile ? 0.9 : nowTablet ? 1.2 : 1.5;
                mascot.scale.set(newScale, newScale, newScale);
                
                // Update current position
                const currentPos = newPositions[currentMascotSection];
                mascot.position.set(currentPos.x, currentPos.y, currentPos.z);
            }
        });
        
        // Initial setup
        updateNavDots();

// --- Mobile Video Setup ---
// Load different video on mobile for hero section
function setupMobileVideo() {
    if (isMobile || isSmallMobile || isExtraSmallMobile) {
        const heroVideo = document.querySelector('.section video source');
        if (heroVideo) {
            heroVideo.src = './assets/NatiKangaroo.mp4';
            // Reload the video element to use new source
            const videoElement = heroVideo.parentElement;
            videoElement.load();
            console.log('Loaded mobile video: NatiKangaroo.mp4');
        }
    }
}

// Setup mobile video immediately
setupMobileVideo();

// --- Accessibility Features ---
// High contrast mode toggle
function toggleHighContrast() {
    document.body.classList.toggle('high-contrast');
    localStorage.setItem('highContrast', document.body.classList.contains('high-contrast'));
}

// Load high contrast preference
if (localStorage.getItem('highContrast') === 'true') {
    document.body.classList.add('high-contrast');
}

// Font size adjustment
let currentFontSize = 16;

function increaseFontSize() {
    if (currentFontSize < 24) {
        currentFontSize += 2;
        document.documentElement.style.fontSize = currentFontSize + 'px';
        localStorage.setItem('fontSize', currentFontSize);
    }
}

function decreaseFontSize() {
    if (currentFontSize > 12) {
        currentFontSize -= 2;
        document.documentElement.style.fontSize = currentFontSize + 'px';
        localStorage.setItem('fontSize', currentFontSize);
    }
}

// Load font size preference
const savedFontSize = localStorage.getItem('fontSize');
if (savedFontSize) {
    currentFontSize = parseInt(savedFontSize);
    document.documentElement.style.fontSize = currentFontSize + 'px';
}

// Add CSS for high contrast mode
const style = document.createElement('style');
style.innerHTML = `
.high-contrast {
    background: #000 !important;
    color: #fff !important;
}
.high-contrast * {
    background: #000 !important;
    color: #fff !important;
    border-color: #fff !important;
}
.high-contrast a, 
.high-contrast .btn {
    color: #000 !important;
    background: #fff !important;
    border: 2px solid #fff !important;
}
.high-contrast input, 
.high-contrast textarea, 
.high-contrast select {
    background: #111 !important;
    color: #fff !important;
    border: 2px solid #fff !important;
}
`;
document.head.appendChild(style);

// Video play/pause on click
document.querySelectorAll('video').forEach(video => {
    video.addEventListener('click', function() {
        if (this.paused) {
            this.play();
        } else {
            this.pause();
        }
    });
});

// Make accessibility functions globally available
window.toggleHighContrast = toggleHighContrast;
window.increaseFontSize = increaseFontSize;
window.decreaseFontSize = decreaseFontSize;

// Accessibility menu functionality
document.addEventListener('DOMContentLoaded', function() {
    const accessibilityBtn = document.getElementById('accessibility-btn');
    const accessibilityPanel = document.getElementById('accessibility-panel');
    const closeAccessibilityBtn = document.getElementById('close-accessibility');

    if (accessibilityBtn && accessibilityPanel) {
        // Open/close accessibility panel
        accessibilityBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            accessibilityPanel.classList.toggle('active');
        });

        // Close panel with close button
        if (closeAccessibilityBtn) {
            closeAccessibilityBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                accessibilityPanel.classList.remove('active');
            });
        }

        // Close panel when clicking outside
        document.addEventListener('click', function(e) {
            if (!accessibilityPanel.contains(e.target) && !accessibilityBtn.contains(e.target)) {
                accessibilityPanel.classList.remove('active');
            }
        });

        // Prevent panel from closing when clicking inside it
        accessibilityPanel.addEventListener('click', function(e) {
            e.stopPropagation();
        });

        // Keyboard support for accessibility menu
        accessibilityBtn.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                accessibilityPanel.classList.toggle('active');
            }
        });

        // Close with Escape key
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && accessibilityPanel.classList.contains('active')) {
                accessibilityPanel.classList.remove('active');
                accessibilityBtn.focus(); // Return focus to button
            }
        });
    }
});