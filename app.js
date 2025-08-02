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
// x: 0, y: 0.55, z: -2
        // Enhanced lighting for the mascot
        const ambientLight = new THREE.AmbientLight(0x404040, 5);
        scene.add(ambientLight);
        const directionalLight = new THREE.DirectionalLight(0xffffff, 6);
        directionalLight.position.set(0, 9.9, 10);
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
            
            // Handle services video playback (play once when entering section)
            const servicesVideo = document.getElementById('services-video');
            const servicesSectionIndex = 4; // Services is the 5th section (index 4)
            
            if (servicesVideo) {
                if (sectionIndex === servicesSectionIndex) {
                    // Reset video to beginning and play once
                    servicesVideo.currentTime = 0;
                    servicesVideo.play().catch(error => {
                        console.log('Video play was prevented:', error);
                    });
                    console.log('Services video started playing');
                } else {
                    // Pause video when leaving services section
                    servicesVideo.pause();
                }
            }
            
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
                    bodyAdjustmentY = relativeMouse.x * 0.4; // Strong left/right body turn
                    bodyAdjustmentX = relativeMouse.y * 0.2; // Moderate forward/back body lean
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
                    
                    const targetRotationY = relativeMouse.x * 0.8; // Reduced head turn since body is doing most of the work
                    
                    // Calculate smooth base angle offset based on mascot's Y position
                    // Map Y position to head angle: higher Y = look down, lower Y = look up
                    const yPosition = mascot.position.y;
                    let baseAngleOffset;
                    
                    if (yPosition >= 0.5) {
                        // High position: look down more
                        baseAngleOffset = -0.1;
                    } else if (yPosition >= 0) {
                        // Neutral-high position: look slightly down
                        baseAngleOffset = 0.2;
                    } else if (yPosition >= 1) {
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
                    headBone.rotation.y += (targetRotationY - headBone.rotation.y) * 0.8;
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
            const previousIndex = currentIndex;
            currentIndex = index;
            sectionsContainer.style.transform = `translateY(-${currentIndex * 100}vh)`;
            updateNavDots();
            
            // Move mascot to corresponding position
            moveMascotToSection(index % mascotPositions.length);
            
            // Handle philosophy section animations (background slide-out + image animations)
            const philosophySection = document.getElementById('philosophy');
            const philosophySectionIndex = 2; // Philosophy is the 3rd section (index 2)
            
            if (philosophySection) {
                // If we're scrolling to philosophy section
                if (currentIndex === philosophySectionIndex) {
                    philosophySection.classList.remove('scroll-out');
                    philosophySection.classList.add('active');
                }
                // If we're scrolling away from philosophy section
                else if (previousIndex === philosophySectionIndex && currentIndex !== philosophySectionIndex) {
                    philosophySection.classList.add('scroll-out');
                    philosophySection.classList.remove('active');
                }
                // If we're scrolling past philosophy section (from before it)
                else if (previousIndex < philosophySectionIndex && currentIndex > philosophySectionIndex) {
                    philosophySection.classList.add('scroll-out');
                    philosophySection.classList.remove('active');
                }
                // If we're not on philosophy section, make sure it's not active
                else if (currentIndex !== philosophySectionIndex) {
                    philosophySection.classList.remove('active');
                }
            }
            
            // Handle services section animations (image slide-in/out)
            const servicesSection = document.getElementById('services');
            const servicesSectionIndex = 4; // Services is the 5th section (index 4)
            
            if (servicesSection) {
                // If we're scrolling to services section
                if (currentIndex === servicesSectionIndex) {
                    servicesSection.classList.remove('scroll-out');
                    servicesSection.classList.add('active');
                }
                // If we're scrolling away from services section
                else if (previousIndex === servicesSectionIndex && currentIndex !== servicesSectionIndex) {
                    servicesSection.classList.add('scroll-out');
                    servicesSection.classList.remove('active');
                }
                // If we're scrolling past services section (from before it)
                else if (previousIndex < servicesSectionIndex && currentIndex > servicesSectionIndex) {
                    servicesSection.classList.add('scroll-out');
                    servicesSection.classList.remove('active');
                }
                // If we're not on services section, make sure it's not active
                else if (currentIndex !== servicesSectionIndex) {
                    servicesSection.classList.remove('active');
                }
            }
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

        // Enhanced touch support for mobile devices with better "jump" behavior
        let touchStartY = 0;
        let touchEndY = 0;
        let touchStartTime = 0;
        let isTouching = false;

        window.addEventListener('touchstart', e => {
            touchStartY = e.changedTouches[0].screenY;
            touchStartTime = Date.now();
            isTouching = false;
        }, { passive: true });

        window.addEventListener('touchmove', e => {
            // Prevent default scrolling during section navigation
            if (Math.abs(e.changedTouches[0].screenY - touchStartY) > 20) {
                e.preventDefault();
            }
        }, { passive: false });

        window.addEventListener('touchend', e => {
            if (isTouching) return;
            
            touchEndY = e.changedTouches[0].screenY;
            const touchDiff = touchStartY - touchEndY;
            const touchTime = Date.now() - touchStartTime;
            
            // More sensitive thresholds for better mobile experience
            const minSwipeDistance = 30; // Reduced from 50
            const maxSwipeTime = 800; // Allow slower swipes
            
            if (Math.abs(touchDiff) > minSwipeDistance && touchTime < maxSwipeTime) {
                isTouching = true;
                const direction = touchDiff > 0 ? 1 : -1;
                goToSection(currentIndex + direction);
                
                // Shorter debounce for more responsive feel
                setTimeout(() => { isTouching = false; }, 800);
            }
        }, { passive: true });

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
// Load different videos on mobile for all sections
function setupMobileVideos() {
    if (isMobile || isSmallMobile || isExtraSmallMobile) {
        // Hero section video
        const heroVideo = document.querySelector('section:first-child video source');
        if (heroVideo) {
            heroVideo.src = './assets/Hero-mobile.mp4';
            const videoElement = heroVideo.parentElement;
            videoElement.load();
            console.log('Loaded mobile video: Hero-mobile.mp4');
        }

        // Why Us section video
        const whyUsVideo = document.querySelector('#why-us video source');
        if (whyUsVideo) {
            whyUsVideo.src = './assets/Boxing-mobile.mp4';
            const videoElement = whyUsVideo.parentElement;
            videoElement.load();
            console.log('Loaded mobile video: Boxing-mobile.mp4');
        }

        // Services section video
        const servicesVideo = document.querySelector('#services video source');
        if (servicesVideo) {
            servicesVideo.src = './assets/servicesBG.mp4';
            const videoElement = servicesVideo.parentElement;
            // Remove autoplay and loop for mobile as well
            videoElement.removeAttribute('autoplay');
            videoElement.removeAttribute('loop');
            videoElement.load();
            console.log('Loaded mobile video: servicesBG.mp4');
        }

        // Final CTA section video
        const finalCtaVideo = document.querySelector('#final-cta video source');
        if (finalCtaVideo) {
            finalCtaVideo.src = './assets/services-mobile.mp4';
            const videoElement = finalCtaVideo.parentElement;
            videoElement.load();
            console.log('Loaded mobile video: services-mobile.mp4 for Final CTA');
        }
    }
}

// Setup mobile videos immediately
setupMobileVideos();

// Services video - ensure it plays only once
document.addEventListener('DOMContentLoaded', function() {
    const servicesVideo = document.getElementById('services-video');
    if (servicesVideo) {
        // Add event listener to stop video after it ends (no loop)
        servicesVideo.addEventListener('ended', function() {
            console.log('Services video finished playing');
            this.pause();
            this.currentTime = 0; // Reset to beginning for next time
        });
        
        // Ensure video is paused initially
        servicesVideo.pause();
    }
});

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

// Testimonials Carousel Functionality
document.addEventListener('DOMContentLoaded', function() {
    const carousel = document.getElementById('testimonials-carousel');
    const slides = carousel.querySelectorAll('.testimonial-slide');
    const prevBtn = document.getElementById('testimonials-prev');
    const nextBtn = document.getElementById('testimonials-next');
    const dots = document.querySelectorAll('.carousel-dot');
    
    let currentSlide = 0;
    let isTransitioning = false;
    
    // Auto-advance carousel every 4 seconds
    let autoAdvanceInterval;
    
    function startAutoAdvance() {
        autoAdvanceInterval = setInterval(() => {
            if (!isTransitioning) {
                nextSlide();
            }
        }, 4000);
    }
    
    function stopAutoAdvance() {
        clearInterval(autoAdvanceInterval);
    }
    
    function showSlide(slideIndex) {
        if (isTransitioning || slideIndex === currentSlide) return;
        
        isTransitioning = true;
        
        // Remove active class from current slide
        slides[currentSlide].classList.remove('active');
        dots[currentSlide].classList.remove('active');
        
        // Add prev class to current slide for animation
        slides[currentSlide].classList.add('prev');
        
        // Update current slide index
        currentSlide = slideIndex;
        
        // Add active class to new slide
        slides[currentSlide].classList.add('active');
        dots[currentSlide].classList.add('active');
        
        // Clean up animation classes after transition
        setTimeout(() => {
            slides.forEach(slide => {
                if (!slide.classList.contains('active')) {
                    slide.classList.remove('prev');
                }
            });
            isTransitioning = false;
        }, 600); // Match transition duration in CSS
    }
    
    function nextSlide() {
        const nextIndex = (currentSlide + 1) % slides.length;
        showSlide(nextIndex);
    }
    
    function prevSlide() {
        const prevIndex = (currentSlide - 1 + slides.length) % slides.length;
        showSlide(prevIndex);
    }
    
    // Navigation arrow event listeners
    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            stopAutoAdvance();
            nextSlide();
            startAutoAdvance();
        });
    }
    
    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            stopAutoAdvance();
            prevSlide();
            startAutoAdvance();
        });
    }
    
    // Dot navigation event listeners
    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            stopAutoAdvance();
            showSlide(index);
            startAutoAdvance();
        });
    });
    
    // Keyboard navigation for carousel
    document.addEventListener('keydown', (e) => {
        // Only handle carousel navigation when in testimonials section
        const testimonialsSection = document.getElementById('testimonials');
        const currentSection = document.querySelector('.section');
        
        if (testimonialsSection && e.target === document.body) {
            if (e.key === 'ArrowLeft') {
                e.preventDefault();
                stopAutoAdvance();
                nextSlide(); // RTL: left arrow goes to next
                startAutoAdvance();
            } else if (e.key === 'ArrowRight') {
                e.preventDefault();
                stopAutoAdvance();
                prevSlide(); // RTL: right arrow goes to previous
                startAutoAdvance();
            }
        }
    });
    
    // Enhanced touch/swipe support for mobile
    let touchStartX = 0;
    let touchEndX = 0;
    let touchStartY = 0;
    let touchEndY = 0;
    let touchStartTime = 0;
    let isSwiping = false;
    
    carousel.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
        touchStartY = e.changedTouches[0].screenY;
        touchStartTime = Date.now();
        isSwiping = false;
        
        // Stop auto-advance when user starts touching
        stopAutoAdvance();
    }, { passive: true });
    
    carousel.addEventListener('touchmove', (e) => {
        if (!touchStartX) return;
        
        const touchCurrentX = e.changedTouches[0].screenX;
        const touchCurrentY = e.changedTouches[0].screenY;
        
        const diffX = Math.abs(touchCurrentX - touchStartX);
        const diffY = Math.abs(touchCurrentY - touchStartY);
        
        // If horizontal movement is greater than vertical, prevent default scrolling
        if (diffX > diffY && diffX > 10) {
            e.preventDefault();
            isSwiping = true;
        }
    }, { passive: false });
    
    carousel.addEventListener('touchend', (e) => {
        if (!touchStartX) return;
        
        touchEndX = e.changedTouches[0].screenX;
        touchEndY = e.changedTouches[0].screenY;
        
        handleSwipe();
        
        // Reset touch values
        touchStartX = 0;
        touchStartY = 0;
        touchEndX = 0;
        touchEndY = 0;
        isSwiping = false;
        
        // Restart auto-advance after a delay
        setTimeout(() => {
            startAutoAdvance();
        }, 1000);
    }, { passive: true });
    
    function handleSwipe() {
        const swipeThreshold = 30; // Reduced threshold for better mobile sensitivity
        const swipeDistance = touchStartX - touchEndX;
        const verticalDistance = Math.abs(touchStartY - touchEndY);
        const swipeTime = Date.now() - touchStartTime;
        
        // Only process horizontal swipes that are greater than vertical movement
        if (Math.abs(swipeDistance) > swipeThreshold && 
            Math.abs(swipeDistance) > verticalDistance && 
            swipeTime < 500) { // Quick swipe detection
            
            if (swipeDistance > 0) {
                // Swiped left - go to next slide (RTL)
                nextSlide();
            } else {
                // Swiped right - go to previous slide (RTL)
                prevSlide();
            }
        }
    }
    
    // Pause auto-advance on hover (desktop only)
    if (!isMobile) {
        carousel.addEventListener('mouseenter', stopAutoAdvance);
        carousel.addEventListener('mouseleave', startAutoAdvance);
    }
    
    // Start auto-advance
    startAutoAdvance();
    
    // Accessibility: Announce slide changes to screen readers
    function announceSlideChange() {
        const announcement = `המלצה ${currentSlide + 1} מתוך ${slides.length}`;
        
        // Create or update ARIA live region for announcements
        let liveRegion = document.getElementById('carousel-live-region');
        if (!liveRegion) {
            liveRegion = document.createElement('div');
            liveRegion.id = 'carousel-live-region';
            liveRegion.setAttribute('aria-live', 'polite');
            liveRegion.setAttribute('aria-atomic', 'true');
            liveRegion.style.position = 'absolute';
            liveRegion.style.left = '-10000px';
            liveRegion.style.width = '1px';
            liveRegion.style.height = '1px';
            liveRegion.style.overflow = 'hidden';
            document.body.appendChild(liveRegion);
        }
        
        liveRegion.textContent = announcement;
    }
    
    // Update the showSlide function to include accessibility announcement
    const originalShowSlide = showSlide;
    showSlide = function(slideIndex) {
        originalShowSlide(slideIndex);
        setTimeout(announceSlideChange, 100); // Slight delay for better screen reader experience
    };
});

// Contact Form Functionality
document.addEventListener('DOMContentLoaded', function() {
    const contactForm = document.getElementById('contact-form');
    const submitBtn = document.getElementById('submit-btn');
    const formStatus = document.getElementById('form-status');
    
    // Smooth scroll for CTA links
    document.querySelectorAll('.scroll-to-contact').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const contactSection = document.getElementById('contact');
            const contactSectionIndex = Array.from(document.querySelectorAll('.section')).indexOf(contactSection);
            
            if (contactSectionIndex !== -1) {
                goToSection(contactSectionIndex);
            }
        });
    });
    
    if (contactForm) {
        contactForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            // Disable submit button and show loading state
            submitBtn.disabled = true;
            submitBtn.textContent = 'שולח...';
            formStatus.className = 'form-status';
            formStatus.textContent = '';
            
            // Collect form data
            const formData = new FormData(contactForm);
            
            // Basic validation
            const name = formData.get('name').trim();
            const phone = formData.get('phone').trim();
            
            if (!name || !phone) {
                showFormStatus('error', 'אנא מלא את השדות החובה (שם וטלפון)');
                resetSubmitButton();
                return;
            }
            
            // Phone validation (Israeli format)
            const phoneRegex = /^0\d{1,2}-?\d{7}$|^05\d-?\d{7}$/;
            if (!phoneRegex.test(phone.replace(/\s/g, ''))) {
                showFormStatus('error', 'אנא הכנס מספר טלפון תקין');
                resetSubmitButton();
                return;
            }
            
            try {
                // Submit to Formspree
                const response = await fetch(contactForm.action, {
                    method: 'POST',
                    body: formData,
                    headers: {
                        'Accept': 'application/json'
                    }
                });
                
                if (response.ok) {
                    showFormStatus('success', 'תודה! ההודעה נשלחה בהצלחה. נחזור אליך בהקדם');
                    contactForm.reset();
                    
                    // Optional: redirect to WhatsApp as fallback
                    setTimeout(() => {
                        const whatsappMessage = encodeURIComponent(`שלום! שלחתי טופס יצירת קשר באתר. שמי ${name} והטלפון שלי ${phone}`);
                        const whatsappUrl = `https://wa.me/972508447575?text=${whatsappMessage}`;
                        window.open(whatsappUrl, '_blank');
                    }, 2000);
                    
                } else {
                    const errorData = await response.json();
                    if (errorData.errors) {
                        showFormStatus('error', 'שגיאה בשליחת הטופס. אנא נסה שוב או צור קשר ישירות');
                    } else {
                        showFormStatus('error', 'שגיאה בשליחת הטופס. אנא נסה שוב');
                    }
                }
            } catch (error) {
                console.error('Form submission error:', error);
                showFormStatus('error', 'שגיאת רשת. אנא בדק את החיבור שלך ונסה שוב');
            }
            
            resetSubmitButton();
        });
    }
    
    function showFormStatus(type, message) {
        formStatus.className = `form-status ${type}`;
        formStatus.textContent = message;
    }
    
    function resetSubmitButton() {
        submitBtn.disabled = false;
        submitBtn.textContent = 'שלח הודעה';
    }
    
    // Real-time validation feedback
    const nameInput = document.getElementById('name');
    const phoneInput = document.getElementById('phone');
    const emailInput = document.getElementById('email');
    
    if (nameInput) {
        nameInput.addEventListener('blur', function() {
            if (this.value.trim().length < 2) {
                this.style.borderColor = '#f44336';
            } else {
                this.style.borderColor = '#4CAF50';
            }
        });
        
        nameInput.addEventListener('input', function() {
            if (this.value.trim().length >= 2) {
                this.style.borderColor = 'rgba(255, 255, 255, 0.2)';
            }
        });
    }
    
    if (phoneInput) {
        phoneInput.addEventListener('blur', function() {
            const phoneRegex = /^0\d{1,2}-?\d{7}$|^05\d-?\d{7}$/;
            if (!phoneRegex.test(this.value.replace(/\s/g, ''))) {
                this.style.borderColor = '#f44336';
            } else {
                this.style.borderColor = '#4CAF50';
            }
        });
        
        phoneInput.addEventListener('input', function() {
            // Auto-format phone number
            let value = this.value.replace(/\D/g, '');
            if (value.startsWith('972')) {
                value = '0' + value.substring(3);
            }
            if (value.length > 3 && !value.includes('-')) {
                if (value.startsWith('05')) {
                    value = value.substring(0, 3) + '-' + value.substring(3);
                } else if (value.startsWith('0')) {
                    value = value.substring(0, 2) + '-' + value.substring(2);
                }
            }
            this.value = value;
        });
    }
    
    if (emailInput) {
        emailInput.addEventListener('blur', function() {
            if (this.value && !this.value.includes('@')) {
                this.style.borderColor = '#f44336';
            } else if (this.value) {
                this.style.borderColor = '#4CAF50';
            } else {
                this.style.borderColor = 'rgba(255, 255, 255, 0.2)';
            }
        });
    }
});