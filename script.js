// Wait until everything is fully loaded
document.addEventListener('DOMContentLoaded', function() {
    
    // Global variables
    let scene, camera, renderer, sphere, light, grid;
    let baseTexture, normalTexture, roughnessTexture, displacementTexture, aoTexture, emissionTexture, alphaTexture;
    let originalImageData;
    let hasUploadedImage = false;
    let autoRotate = true;
    let rotationSpeed = { x: 0.0005, y: 0.004 };
    let isDraggingSlider = false;
    let animationFrameId = null;
    let useHDRI = false;
    let pmremGenerator, envMap;
    
    // DOM Elements
    const uploadArea = document.getElementById('upload-area');
    const uploadContent = document.querySelector('.upload-content');
    const textureUpload = document.getElementById('texture-upload');
    const previewOverlay = document.getElementById('preview-overlay');
    const uploadedImage = document.getElementById('uploaded-image');
    const deleteImageBtn = document.getElementById('delete-image');
    const modelContainer = document.getElementById('model-container');
    
    // Navigation Tabs
    const navTabs = document.querySelectorAll('.nav-tab');
    const pages = document.querySelectorAll('.page-content');
    
    // Rotation controls
    const rotationX = document.getElementById('rotation-x');
    const rotationY = document.getElementById('rotation-y');
    const toggleAutoRotateBtn = document.getElementById('toggle-auto-rotate');
    
    // Canvas Elements
    const baseCanvas = document.getElementById('base-map');
    const normalCanvas = document.getElementById('normal-map');
    const roughnessCanvas = document.getElementById('roughness-map');
    const displacementCanvas = document.getElementById('displacement-map');
    const aoCanvas = document.getElementById('ao-map');
    const emissionCanvas = document.getElementById('emission-map');
    const alphaCanvas = document.getElementById('alpha-map');
    
    // Control Elements
    const baseStrength = document.getElementById('base-strength');
    const normalStrength = document.getElementById('normal-strength');
    const roughnessStrength = document.getElementById('roughness-strength');
    const displacementStrength = document.getElementById('displacement-strength');
    const aoStrength = document.getElementById('ao-strength');
    const metalness = document.getElementById('metalness');
    const emissionStrength = document.getElementById('emission-strength');
    const uvRepeat = document.getElementById('uv-repeat');
    const lightX = document.getElementById('light-x');
    const lightY = document.getElementById('light-y');
    const lightZ = document.getElementById('light-z');
    const useHDRIToggle = document.getElementById('use-hdri');
    const materialTypeSelect = document.getElementById('material-type');
    
    // Value display elements
    const baseValue = document.getElementById('base-value');
    const normalValue = document.getElementById('normal-value');
    const roughnessValue = document.getElementById('roughness-value');
    const displacementValue = document.getElementById('displacement-value');
    const aoValue = document.getElementById('ao-value');
    const metalnessValue = document.getElementById('metalness-value');
    const emissionValue = document.getElementById('emission-value');
    const uvValue = document.getElementById('uv-value');
    
    // Download buttons
    const downloadBase = document.getElementById('download-base');
    const downloadNormal = document.getElementById('download-normal');
    const downloadRoughness = document.getElementById('download-roughness');
    const downloadDisplacement = document.getElementById('download-displacement');
    const downloadAO = document.getElementById('download-ao');
    const downloadEmission = document.getElementById('download-emission');
    const downloadAlpha = document.getElementById('download-alpha');
    const exportZip = document.getElementById('export-zip');
    const exportThreejs = document.getElementById('export-threejs');
    const smartEnhanceBtn = document.getElementById('smart-enhance');
    
    // Export options
    const exportBase = document.getElementById('export-base');
    const exportNormal = document.getElementById('export-normal');
    const exportRoughness = document.getElementById('export-roughness');
    const exportDisplacement = document.getElementById('export-displacement');
    const exportAO = document.getElementById('export-ao');
    const exportEmission = document.getElementById('export-emission');
    const exportAlpha = document.getElementById('export-alpha');
    const formatRadios = document.querySelectorAll('input[name="format"]');
    
    // Processing indicator
    const processingIndicator = document.getElementById('processing-indicator');
    const progressBar = document.getElementById('progress-bar');
    const processingMessage = document.getElementById('processing-message');
    
    // Notification container
    const notificationContainer = document.getElementById('notification-container');
    
    // Theme toggle
    const themeSwitch = document.getElementById('theme-switch');
    const moonIcon = themeSwitch?.querySelector('.fa-moon');
    const sunIcon = themeSwitch?.querySelector('.fa-sun');
    
    // Initialize the application
    init();
    
    function init() {
        // Check if THREE is loaded
        if (typeof THREE === 'undefined') {
            console.error('THREE is not defined. Please check if Three.js is loaded correctly.');
            showNotification('Error loading Three.js library. Please refresh and try again.', 'error');
            return;
        }
        
        // Check if JSZip is loaded
        if (typeof JSZip === 'undefined') {
            console.error('JSZip is not defined. Please check if JSZip is loaded correctly.');
            showNotification('Error loading JSZip library. Please refresh and try again.', 'error');
            return;
        }
        
        try {
            // Initialize Three.js
            initThreeJS();
            
            // Set up event listeners
            setupEventListeners();
            
            // Set up page navigation
            setupNavigation();
            
            // Check for theme preference
            checkThemePreference();
            
        } catch (error) {
            console.error('Error initializing application:', error);
            showNotification('Error initializing application. Please refresh the page.', 'error');
        }
    }
    
    // Check theme preference
    function checkThemePreference() {
        // Check for saved theme preference or use device preference
        const savedTheme = localStorage.getItem('texture-gen-theme');
        if (savedTheme === 'light' || (!savedTheme && window.matchMedia('(prefers-color-scheme: light)').matches)) {
            document.body.classList.add('light-theme');
            if (moonIcon && sunIcon) {
                moonIcon.style.display = 'none';
                sunIcon.style.display = 'block';
            }
        }
    }
    
    // Set up page navigation
    function setupNavigation() {
        navTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                // Remove active class from all tabs
                navTabs.forEach(t => t.classList.remove('active'));
                
                // Add active class to clicked tab
                tab.classList.add('active');
                
                // Get target page
                const targetPage = tab.dataset.page;
                
                // Hide all pages and then show the target
                pages.forEach(page => {
                    if (page.id === `${targetPage}-page`) {
                        page.classList.remove('hidden');
                        setTimeout(() => {
                            page.style.opacity = '1';
                            page.style.transform = 'translateY(0)';
                        }, 50);
                    } else {
                        page.style.opacity = '0';
                        page.style.transform = 'translateY(10px)';
                        setTimeout(() => {
                            page.classList.add('hidden');
                        }, 300);
                    }
                });
            });
        });
    }
    
    // Initialize Three.js scene
    function initThreeJS() {
        // Create scene
        scene = new THREE.Scene();
        scene.background = new THREE.Color(0x0d1117);
    
        // Create camera
        camera = new THREE.PerspectiveCamera(75, modelContainer.clientWidth / modelContainer.clientHeight, 0.1, 1000);
        camera.position.z = 3;
        camera.position.y = 0.5; // Slight angle for better viewing
    
        // Create renderer
        renderer = new THREE.WebGLRenderer({ 
            antialias: true,
            alpha: true 
        });
        renderer.setSize(modelContainer.clientWidth, modelContainer.clientHeight);
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.outputEncoding = THREE.sRGBEncoding;
        
        // Setup for HDRI environment
        pmremGenerator = new THREE.PMREMGenerator(renderer);
        pmremGenerator.compileEquirectangularShader();
        
        // Append renderer to container
        modelContainer.appendChild(renderer.domElement);
    
        // Create lighting
        light = new THREE.DirectionalLight(0xffffff, 1.5);
        light.position.set(5, 5, 5);
        scene.add(light);
    
        // Add ambient light
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
        scene.add(ambientLight);
        
        // Add subtle hemisphere light for better detail visibility
        const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 0.3);
        hemiLight.position.set(0, 20, 0);
        scene.add(hemiLight);
        
        // Add grid for better orientation
        grid = new THREE.GridHelper(10, 20, 0x444444, 0x252525);
        grid.position.y = -1.5;
        scene.add(grid);
    
        // Create initial sphere
        createSphere();
        
        // Add loading indicator until fully loaded
        showLoadingIndicator('Initializing 3D environment...', 0);
        
        // Simulate progress
        let progress = 0;
        const progressInterval = setInterval(() => {
            progress += 10;
            if (progress <= 100) {
                updateProgress(progress);
            } else {
                clearInterval(progressInterval);
                hideLoadingIndicator();
            }
        }, 100);
    
        // Handle window resize
        window.addEventListener('resize', onWindowResize);
    
        // Start animation loop
        animate();
    }
    
    // Setup HDRI environment
    function setupHDRIEnvironment() {
        // Create a simple equirectangular HDRI texture
        const size = 1024;
        const halfSize = size / 2;
        
        // Create gradient canvas for fake HDRI
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size / 2;
        const ctx = canvas.getContext('2d');
        
        // Create sky gradient (top to middle)
        const skyGradient = ctx.createLinearGradient(0, 0, 0, halfSize);
        skyGradient.addColorStop(0, '#0077ff'); // Top sky
        skyGradient.addColorStop(1, '#88bbff'); // Horizon
        
        // Draw sky
        ctx.fillStyle = skyGradient;
        ctx.fillRect(0, 0, size, halfSize);
        
        // Create ground gradient (middle to bottom)
        const groundGradient = ctx.createLinearGradient(0, halfSize, 0, canvas.height);
        groundGradient.addColorStop(0, '#667766'); // Horizon ground
        groundGradient.addColorStop(1, '#445544'); // Bottom ground
        
        // Draw ground
        ctx.fillStyle = groundGradient;
        ctx.fillRect(0, halfSize, size, halfSize);
        
        // Add sun
        ctx.fillStyle = 'rgba(255, 255, 220, 0.8)';
        ctx.beginPath();
        ctx.arc(size * 0.75, halfSize * 0.4, 60, 0, Math.PI * 2);
        ctx.fill();
        
        // Create texture from canvas
        const texture = new THREE.CanvasTexture(canvas);
        texture.mapping = THREE.EquirectangularReflectionMapping;
        
        // Generate environment map
        envMap = pmremGenerator.fromEquirectangular(texture).texture;
        
        // Clean up
        texture.dispose();
        pmremGenerator.dispose();
        
        return envMap;
    }
    
    // Toggle HDRI Lighting
    function toggleHDRILighting(enabled) {
        useHDRI = enabled;
        
        if (enabled) {
            if (!envMap) {
                envMap = setupHDRIEnvironment();
            }
            
            scene.environment = envMap;
            scene.background = envMap;
            
            // Hide directional light
            light.visible = false;
        } else {
            scene.environment = null;
            scene.background = new THREE.Color(0x0d1117);
            
            // Show directional light
            light.visible = true;
        }
        
        // Update sphere material
        if (sphere && sphere.material) {
            sphere.material.envMap = useHDRI ? envMap : null;
            sphere.material.needsUpdate = true;
        }
    }
    
    // Create or update the sphere with textures
    function createSphere() {
        // Remove existing sphere if it exists
        if (sphere) {
            scene.remove(sphere);
        }
        
        // Create geometry with higher segment count for better displacement
        const geometry = new THREE.SphereGeometry(1, 64, 64);
        
        // Create material
        const material = new THREE.MeshStandardMaterial({
            color: 0xffffff,
            roughness: parseFloat(roughnessStrength.value),
            metalness: parseFloat(metalness.value),
            envMapIntensity: 1.0
        });
    
        // Make sure all textures are updated
        if (baseTexture) baseTexture.needsUpdate = true;
        if (normalTexture) normalTexture.needsUpdate = true;
        if (roughnessTexture) roughnessTexture.needsUpdate = true;
        if (displacementTexture) displacementTexture.needsUpdate = true;
        if (aoTexture) aoTexture.needsUpdate = true;
        if (emissionTexture) emissionTexture.needsUpdate = true;
        if (alphaTexture) {
            alphaTexture.needsUpdate = true;
            material.transparent = true;
            material.alphaTest = 0.5;
        }
    
        // Apply textures
        material.map = baseTexture;
        material.normalMap = normalTexture;
        material.roughnessMap = roughnessTexture;
        material.displacementMap = displacementTexture;
        material.aoMap = aoTexture;
        material.emissiveMap = emissionTexture;
        material.alphaMap = alphaTexture;
        
        // If emission map is applied, set emissive color and intensity
        if (emissionTexture) {
            material.emissive = new THREE.Color(0xffffff);
            material.emissiveIntensity = parseFloat(emissionStrength.value);
        }
        
        // Update material parameters
        if (normalTexture) {
            material.normalScale = new THREE.Vector2(
                parseFloat(normalStrength.value),
                parseFloat(normalStrength.value)
            );
        }
        
        if (displacementTexture) {
            material.displacementScale = parseFloat(displacementStrength.value);
        }
        
        // Apply UV repeat if set higher than 1
        const repeatValue = parseInt(uvRepeat.value) || 1;
        if (repeatValue > 1 && material.map) {
            material.map.wrapS = material.map.wrapT = THREE.RepeatWrapping;
            material.map.repeat.set(repeatValue, repeatValue);
            
            // Apply to all other maps
            const maps = [
                'normalMap', 'roughnessMap', 'displacementMap', 
                'aoMap', 'emissiveMap', 'alphaMap'
            ];
            
            maps.forEach(mapName => {
                if (material[mapName]) {
                    material[mapName].wrapS = material[mapName].wrapT = THREE.RepeatWrapping;
                    material[mapName].repeat.set(repeatValue, repeatValue);
                }
            });
        }
    
        // Ensure material knows it needs updating
        material.needsUpdate = true;
    
        // Create mesh
        sphere = new THREE.Mesh(geometry, material);
        
        // Set up UV2 coordinates for AO map
        geometry.setAttribute('uv2', geometry.attributes.uv);
        
        scene.add(sphere);
        
        // Apply HDRI if enabled
        if (useHDRI) {
            toggleHDRILighting(true);
        }
        
        console.log("Sphere created with textures:", {
            base: !!material.map,
            normal: !!material.normalMap,
            roughness: !!material.roughnessMap,
            displacement: !!material.displacementMap,
            ao: !!material.aoMap,
            emission: !!material.emissiveMap,
            alpha: !!material.alphaMap
        });
    }
    
    // Animation loop
    function animate() {
        animationFrameId = requestAnimationFrame(animate);
        
        // Add automatic or manual rotation to the sphere
        if (sphere) {
            if (autoRotate) {
                sphere.rotation.y += rotationSpeed.y;
                sphere.rotation.x += rotationSpeed.x;
                
                // Update sliders to match current rotation
                if (!isDraggingSlider) {
                    rotationX.value = ((sphere.rotation.x % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2) - Math.PI;
                    rotationY.value = ((sphere.rotation.y % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2) - Math.PI;
                }
            }
        }
        
        if (renderer) {
            renderer.render(scene, camera);
        }
    }
    
    // Handle window resize
    function onWindowResize() {
        if (camera && renderer && modelContainer) {
            camera.aspect = modelContainer.clientWidth / modelContainer.clientHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(modelContainer.clientWidth, modelContainer.clientHeight);
        }
    }
    
    // Set up event listeners
    function setupEventListeners() {
        // File upload via input
        textureUpload.addEventListener('change', handleFileUpload);
        
        // FIX for file upload bug: Stop propagation on the input click
        textureUpload.addEventListener('click', function(e) {
            e.stopPropagation();
        });
        
        // Drag and drop events
        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.classList.add('active');
        });
        
        uploadArea.addEventListener('dragleave', () => {
            uploadArea.classList.remove('active');
        });
        
        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.classList.remove('active');
            
            if (e.dataTransfer.files.length) {
                processUploadedFile(e.dataTransfer.files[0]);
            }
        });
        
        // Fix for the upload content click handler
        uploadContent.addEventListener('click', (e) => {
            e.stopPropagation(); // Stop event from bubbling up
            
            // Only trigger file input if no image is uploaded yet
            if (!hasUploadedImage) {
                // Ensure the input is cleared to trigger change event even on the same file
                textureUpload.value = '';
                setTimeout(() => {
                    textureUpload.click();
                }, 10);
            }
        });
        
        // Delete image
        deleteImageBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            clearImage();
        });
        
        // Sliders
        baseStrength.addEventListener('input', updateTextures);
        normalStrength.addEventListener('input', updateTextures);
        roughnessStrength.addEventListener('input', updateTextures);
        displacementStrength.addEventListener('input', updateTextures);
        aoStrength.addEventListener('input', updateTextures);
        metalness.addEventListener('input', updateMaterial);
        emissionStrength.addEventListener('input', updateMaterial);
        uvRepeat.addEventListener('input', updateUVTiling);
        
        // HDRI toggle
        useHDRIToggle.addEventListener('change', (e) => {
            toggleHDRILighting(e.target.checked);
        });
        
        // Smart enhance button
        if (smartEnhanceBtn) {
            smartEnhanceBtn.addEventListener('click', smartEnhanceTexture);
        }
        
        // Light position
        lightX.addEventListener('input', updateLightPosition);
        lightY.addEventListener('input', updateLightPosition);
        lightZ.addEventListener('input', updateLightPosition);
        
        // Download buttons
        downloadBase.addEventListener('click', () => downloadTexture(baseCanvas, 'basecolor-map'));
        downloadNormal.addEventListener('click', () => downloadTexture(normalCanvas, 'normal-map'));
        downloadRoughness.addEventListener('click', () => downloadTexture(roughnessCanvas, 'roughness-map'));
        downloadDisplacement.addEventListener('click', () => downloadTexture(displacementCanvas, 'displacement-map'));
        downloadAO.addEventListener('click', () => downloadTexture(aoCanvas, 'ao-map'));
        downloadEmission.addEventListener('click', () => downloadTexture(emissionCanvas, 'emission-map'));
        downloadAlpha.addEventListener('click', () => downloadTexture(alphaCanvas, 'alpha-map'));
        
        // Export ZIP
        exportZip.addEventListener('click', exportAllMapsAsZip);
        
        // Export Three.js code
        if (exportThreejs) {
            exportThreejs.addEventListener('click', exportThreejsCode);
        }
        
        // Theme toggle
        if (themeSwitch) {
            themeSwitch.addEventListener('click', toggleTheme);
        }
        
        // Rotation controls
        rotationX.addEventListener('input', updateRotation);
        rotationY.addEventListener('input', updateRotation);
        toggleAutoRotateBtn.addEventListener('click', toggleAutoRotation);
        
        // When sliders are used, set dragging flag
        const sliders = document.querySelectorAll('input[type="range"]');
        sliders.forEach(slider => {
            slider.addEventListener('mousedown', () => {
                isDraggingSlider = true;
                
                // Add mouseup listener to document to detect when slider drag ends
                document.addEventListener('mouseup', function onMouseUp() {
                    isDraggingSlider = false;
                    document.removeEventListener('mouseup', onMouseUp);
                }, { once: true });
            });
            
            // Touch support for mobile
            slider.addEventListener('touchstart', () => {
                isDraggingSlider = true;
                
                // Add touchend listener to document to detect when slider touch ends
                document.addEventListener('touchend', function onTouchEnd() {
                    isDraggingSlider = false;
                    document.removeEventListener('touchend', onTouchEnd);
                }, { once: true });
            });
        });
        
        // Keyboard shortcuts
        document.addEventListener('keydown', handleKeyboardShortcuts);
    }
    
    // Handle keyboard shortcuts
    function handleKeyboardShortcuts(e) {
        // Ignore shortcuts when in input fields
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
        
        switch (e.key) {
            case ' ': // Spacebar - toggle auto-rotate
                toggleAutoRotation();
                e.preventDefault();
                break;
                
            case 'e': // Export ZIP
            case 'E':
                exportAllMapsAsZip();
                break;
                
            case 'c': // Export Three.js Code
            case 'C':
                exportThreejsCode();
                break;
                
            case 's': // Smart enhance
            case 'S':
                if (smartEnhanceBtn) smartEnhanceTexture();
                break;
                
            case 't': // Toggle theme
            case 'T':
                toggleTheme();
                break;
                
            case 'h': // Toggle HDRI
            case 'H':
                if (useHDRIToggle) {
                    useHDRIToggle.checked = !useHDRIToggle.checked;
                    toggleHDRILighting(useHDRIToggle.checked);
                }
                break;
                
            case 'Escape': // Close modals
                // You can handle closing modals here if needed
                break;
                
            case 'ArrowLeft': // Rotate Y axis left
                if (sphere) {
                    sphere.rotation.y -= 0.1;
                    rotationY.value = sphere.rotation.y;
                }
                break;
                
            case 'ArrowRight': // Rotate Y axis right
                if (sphere) {
                    sphere.rotation.y += 0.1;
                    rotationY.value = sphere.rotation.y;
                }
                break;
                
            case 'ArrowUp': // Rotate X axis up
                if (sphere) {
                    sphere.rotation.x -= 0.1;
                    rotationX.value = sphere.rotation.x;
                }
                break;
                
            case 'ArrowDown': // Rotate X axis down
                if (sphere) {
                    sphere.rotation.x += 0.1;
                    rotationX.value = sphere.rotation.x;
                }
                break;
        }
    }
    
    // Toggle theme
    function toggleTheme() {
        if (document.body.classList.contains('light-theme')) {
            document.body.classList.remove('light-theme');
            if (moonIcon && sunIcon) {
                moonIcon.style.display = 'block';
                sunIcon.style.display = 'none';
            }
            localStorage.setItem('texture-gen-theme', 'dark');
        } else {
            document.body.classList.add('light-theme');
            if (moonIcon && sunIcon) {
                moonIcon.style.display = 'none';
                sunIcon.style.display = 'block';
            }
            localStorage.setItem('texture-gen-theme', 'light');
        }
    }
    
    // Update UV tiling
    function updateUVTiling() {
        uvValue.textContent = uvRepeat.value;
        
        if (sphere && sphere.material) {
            const repeatValue = parseInt(uvRepeat.value) || 1;
            
            // Apply to all maps
            const maps = [
                'map', 'normalMap', 'roughnessMap', 'displacementMap', 
                'aoMap', 'emissiveMap', 'alphaMap'
            ];
            
            maps.forEach(mapName => {
                if (sphere.material[mapName]) {
                    sphere.material[mapName].wrapS = sphere.material[mapName].wrapT = THREE.RepeatWrapping;
                    sphere.material[mapName].repeat.set(repeatValue, repeatValue);
                    sphere.material[mapName].needsUpdate = true;
                }
            });
            
            sphere.material.needsUpdate = true;
        }
    }
    
    // Smart enhance texture based on material type
    function smartEnhanceTexture() {
        if (!originalImageData) {
            showNotification('Please upload a texture first', 'error');
            return;
        }
        
        showLoadingIndicator('Analyzing texture...', 20);
        
        // Get selected material type
        const materialType = materialTypeSelect.value;
        
        // Simulate processing delay
        setTimeout(() => {
            updateLoadingMessage('Identifying material properties...');
            updateProgress(40);
            
            setTimeout(() => {
                updateLoadingMessage('Applying optimized settings...');
                updateProgress(70);
                
                // Apply optimized settings based on material type
                switch(materialType) {
                    case 'metal':
                        // Optimal settings for metal
                        roughnessStrength.value = 0.2;
                        metalness.value = 0.9;
                        normalStrength.value = 0.8;
                        displacementStrength.value = 0.1;
                        aoStrength.value = 0.4;
                        emissionStrength.value = 0;
                        break;
                        
                    case 'wood':
                        // Optimal settings for wood
                        roughnessStrength.value = 0.7;
                        metalness.value = 0;
                        normalStrength.value = 1.2;
                        displacementStrength.value = 0.3;
                        aoStrength.value = 0.6;
                        emissionStrength.value = 0;
                        break;
                        
                    case 'stone':
                        // Optimal settings for stone
                        roughnessStrength.value = 0.8;
                        metalness.value = 0;
                        normalStrength.value = 1.5;
                        displacementStrength.value = 0.5;
                        aoStrength.value = 0.7;
                        emissionStrength.value = 0;
                        break;
                        
                    case 'fabric':
                        // Optimal settings for fabric
                        roughnessStrength.value = 0.9;
                        metalness.value = 0;
                        normalStrength.value = 0.7;
                        displacementStrength.value = 0.15;
                        aoStrength.value = 0.4;
                        emissionStrength.value = 0;
                        break;
                        
                    case 'plastic':
                        // Optimal settings for plastic
                        roughnessStrength.value = 0.3;
                        metalness.value = 0.1;
                        normalStrength.value = 0.6;
                        displacementStrength.value = 0.05;
                        aoStrength.value = 0.3;
                        emissionStrength.value = 0;
                        break;
                        
                    default:
                        // Auto-detect material type (simplified logic)
                        const avgBrightness = analyzeImageBrightness(originalImageData);
                        const textureComplexity = analyzeTextureComplexity(originalImageData);
                        
                        if (avgBrightness > 200 && textureComplexity < 50) {
                            // Likely metal
                            roughnessStrength.value = 0.2;
                            metalness.value = 0.9;
                            materialTypeSelect.value = 'metal';
                        } else if (textureComplexity > 150) {
                            // Likely organic (wood, stone)
                            roughnessStrength.value = 0.7;
                            metalness.value = 0;
                            materialTypeSelect.value = textureComplexity > 200 ? 'stone' : 'wood';
                        } else {
                            // Generic material
                            roughnessStrength.value = 0.5;
                            metalness.value = 0.1;
                        }
                        
                        normalStrength.value = Math.min(2.0, textureComplexity / 100);
                        displacementStrength.value = Math.min(1.0, textureComplexity / 300);
                        break;
                }
                
                // Update display values
                updateTextures();
                updateMaterial();
                
                // Regenerate maps with new settings
                generateTextureMaps(new Image().src = uploadedImage.src);
                
                setTimeout(() => {
                    updateProgress(100);
                    hideLoadingIndicator();
                    showNotification('Smart enhancement complete!', 'success');
                }, 500);
            }, 800);
        }, 800);
    }
    
    // Helper function to analyze image brightness
    function analyzeImageBrightness(imageData) {
        let totalBrightness = 0;
        for (let i = 0; i < imageData.data.length; i += 4) {
            const r = imageData.data[i];
            const g = imageData.data[i + 1];
            const b = imageData.data[i + 2];
            totalBrightness += (r + g + b) / 3;
        }
        return totalBrightness / (imageData.width * imageData.height);
    }
    
    // Helper function to analyze texture complexity
    function analyzeTextureComplexity(imageData) {
        // Simple edge detection to determine texture complexity
        let edgeCount = 0;
        const threshold = 30;
        
        for (let y = 1; y < imageData.height - 1; y++) {
            for (let x = 1; x < imageData.width - 1; x++) {
                const idx = (y * imageData.width + x) * 4;
                const idxUp = ((y-1) * imageData.width + x) * 4;
                const idxRight = (y * imageData.width + (x+1)) * 4;
                
                const currentPixel = (imageData.data[idx] + imageData.data[idx+1] + imageData.data[idx+2]) / 3;
                const upPixel = (imageData.data[idxUp] + imageData.data[idxUp+1] + imageData.data[idxUp+2]) / 3;
                const rightPixel = (imageData.data[idxRight] + imageData.data[idxRight+1] + imageData.data[idxRight+2]) / 3;
                
                if (Math.abs(currentPixel - upPixel) > threshold || 
                    Math.abs(currentPixel - rightPixel) > threshold) {
                    edgeCount++;
                }
            }
        }
        
        // Normalize to 0-255 range
        return (edgeCount / (imageData.width * imageData.height)) * 255;
    }
    
    // Clear the uploaded image
    function clearImage() {
        // Reset the UI
        previewOverlay.style.display = 'none';
        uploadedImage.src = '';
        hasUploadedImage = false;
        
        // Remove textures from sphere
        if (sphere && sphere.material) {
            sphere.material.map = null;
            sphere.material.normalMap = null;
            sphere.material.roughnessMap = null;
            sphere.material.displacementMap = null;
            sphere.material.aoMap = null;
            sphere.material.emissiveMap = null;
            sphere.material.alphaMap = null;
            sphere.material.transparent = false;
            sphere.material.needsUpdate = true;
        }
        
        // Clear canvases
        clearCanvas(baseCanvas);
        clearCanvas(normalCanvas);
        clearCanvas(roughnessCanvas);
        clearCanvas(displacementCanvas);
        clearCanvas(aoCanvas);
        clearCanvas(emissionCanvas);
        clearCanvas(alphaCanvas);
        
        // Reset textures
        baseTexture = null;
        normalTexture = null;
        roughnessTexture = null;
        displacementTexture = null;
        aoTexture = null;
        emissionTexture = null;
        alphaTexture = null;
        originalImageData = null;
        
        showNotification('Image removed', 'info');
    }
    
    // Clear a canvas
    function clearCanvas(canvas) {
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    
    // Handle file upload
    function handleFileUpload(e) {
        console.log("File upload triggered", e.target.files);
        if (e.target.files && e.target.files.length) {
            processUploadedFile(e.target.files[0]);
        }
    }
    
    // Process uploaded file
    function processUploadedFile(file) {
        console.log("Processing file:", file);
        if (!file || !file.type.match('image.*')) {
            showNotification('Please upload an image file.', 'error');
            return;
        }
        
        // Show loading state
        showLoadingIndicator('Reading image file...', 10);
        
        const reader = new FileReader();
        
        reader.onload = function(e) {
            try {
                updateProgress(30);
                updateLoadingMessage('Processing image...');
                
                // Display the image
                uploadedImage.src = e.target.result;
                previewOverlay.style.display = 'flex';
                hasUploadedImage = true;
                
                // Load the image to process it
                const img = new Image();
                img.onload = function() {
                    try {
                        updateProgress(50);
                        updateLoadingMessage('Analyzing texture...');
                        
                        // Store original image data
                        originalImageData = getImageData(img);
                        
                        updateProgress(60);
                        updateLoadingMessage('Generating texture maps...');
                        
                        // Generate texture maps
                        generateTextureMaps(img);
                        
                        updateProgress(90);
                        updateLoadingMessage('Applying to 3D model...');
                        
                        // Recreate the sphere to apply textures
                        createSphere();
                        
                        // Remove loading state
                        setTimeout(() => {
                            updateProgress(100);
                            hideLoadingIndicator();
                            showNotification('Texture maps generated successfully!', 'success');
                        }, 500);
                    } catch (error) {
                        console.error('Error processing image:', error);
                        handleProcessingError();
                    }
                };
                img.src = e.target.result;
            } catch (error) {
                console.error('Error loading image:', error);
                handleProcessingError();
            }
        };
        
        reader.onerror = function() {
            handleProcessingError();
        };
        
        reader.readAsDataURL(file);
    }
    
    // Handle processing error
    function handleProcessingError() {
        hideLoadingIndicator();
        showNotification('Error processing image. Please try another image.', 'error');
    }
    
    // Show loading indicator with specified message and progress
    function showLoadingIndicator(message, progress = 0) {
        processingMessage.textContent = message;
        progressBar.style.width = `${progress}%`;
        processingIndicator.style.display = 'flex';
    }
    
    // Update loading progress
    function updateProgress(progress) {
        progressBar.style.width = `${progress}%`;
    }
    
    // Update loading message
    function updateLoadingMessage(message) {
        processingMessage.textContent = message;
    }
    
    // Hide loading indicator
    function hideLoadingIndicator() {
        processingIndicator.style.display = 'none';
    }
    
    // Show notification
    function showNotification(message, type = 'info') {
        // Define titles based on notification type
        const titles = {
            success: 'Success',
            error: 'Error',
            info: 'Information',
            warning: 'Warning'
        };
        
        // Define icons based on notification type
        const icons = {
            success: 'fa-check-circle',
            error: 'fa-exclamation-circle',
            info: 'fa-info-circle',
            warning: 'fa-exclamation-triangle'
        };
        
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <div class="notification-icon">
                <i class="fas ${icons[type]}"></i>
            </div>
            <div class="notification-content">
                <h4 class="notification-title">${titles[type]}</h4>
                <p class="notification-message">${message}</p>
            </div>
            <button class="notification-close">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        // Add to notification container
        notificationContainer.appendChild(notification);
        
        // Add close button functionality
        const closeBtn = notification.querySelector('.notification-close');
        closeBtn.addEventListener('click', () => {
            notification.classList.remove('show');
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        });
        
        // Animate in
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);
        
        // Auto-remove after delay
        setTimeout(() => {
            if (notification.parentNode) {
                notification.classList.remove('show');
                setTimeout(() => {
                    if (notification.parentNode) {
                        notification.parentNode.removeChild(notification);
                    }
                }, 300);
            }
        }, 5000);
    }
    
    // Get image data from an image element
    function getImageData(img) {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        return ctx.getImageData(0, 0, canvas.width, canvas.height);
    }
    
    // Generate all texture maps
    function generateTextureMaps(img) {
        // Generate base color map (formerly diffuse)
        generateBaseMap(img);
        
        // Generate normal map
        generateNormalMap(originalImageData);
        
        // Generate roughness map
        generateRoughnessMap(originalImageData);
        
        // Generate displacement map 
        generateDisplacementMap(originalImageData);
        
        // Generate ambient occlusion map
        generateAOMap(originalImageData);
        
        // Generate emission map (new)
        generateEmissionMap(originalImageData);
        
        // Generate alpha/transparency map (new)
        generateAlphaMap(originalImageData);
    }
    
    // Generate base color map (formerly diffuse)
    function generateBaseMap(img) {
        // Set canvas dimensions
        baseCanvas.width = img.width;
        baseCanvas.height = img.height;
        
        // Draw the image
        const ctx = baseCanvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        
        // Create base color texture
        baseTexture = new THREE.Texture(baseCanvas);
        if (renderer) {
            baseTexture.anisotropy = renderer.capabilities.getMaxAnisotropy();
        }
        baseTexture.needsUpdate = true;
        
        console.log("Base color map generated");
    }
    
    // Generate normal map with enhanced detail
    function generateNormalMap(imageData) {
        // Set canvas dimensions
        normalCanvas.width = imageData.width;
        normalCanvas.height = imageData.height;
        
        const ctx = normalCanvas.getContext('2d');
        const outputData = ctx.createImageData(imageData.width, imageData.height);
        
        // Sobel operators for edge detection
        const sobelX = [
            -1, 0, 1,
            -2, 0, 2,
            -1, 0, 1
        ];
        
        const sobelY = [
            -1, -2, -1,
            0, 0, 0,
            1, 2, 1
        ];
        
        // Process each pixel to create normal map
        for (let y = 0; y < imageData.height; y++) {
            for (let x = 0; x < imageData.width; x++) {
                // Calculate gradient using Sobel operators
                let gx = 0;
                let gy = 0;
                
                for (let ky = -1; ky <= 1; ky++) {
                    for (let kx = -1; kx <= 1; kx++) {
                        const px = Math.min(imageData.width - 1, Math.max(0, x + kx));
                        const py = Math.min(imageData.height - 1, Math.max(0, y + ky));
                        
                        const idx = (py * imageData.width + px) * 4;
                        // Use grayscale value (average of RGB)
                        const val = (imageData.data[idx] + imageData.data[idx + 1] + imageData.data[idx + 2]) / 3;
                        
                        gx += val * sobelX[(ky + 1) * 3 + (kx + 1)];
                        gy += val * sobelY[(ky + 1) * 3 + (kx + 1)];
                    }
                }
                
                // Convert gradient to normal vector
                const scale = 3.0 * parseFloat(normalStrength.value); // Apply strength parameter
                const nx = -gx * scale;
                const ny = -gy * scale;
                const nz = 200; // Higher Z value for more pronounced effect
                
                // Normalize
                const length = Math.sqrt(nx * nx + ny * ny + nz * nz);
                
                // Convert from [-1, 1] to [0, 1] range for RGB
                const outIdx = (y * imageData.width + x) * 4;
                outputData.data[outIdx] = ((nx / length) * 0.5 + 0.5) * 255;
                outputData.data[outIdx + 1] = ((ny / length) * 0.5 + 0.5) * 255;
                outputData.data[outIdx + 2] = ((nz / length) * 0.5 + 0.5) * 255;
                outputData.data[outIdx + 3] = 255; // Alpha
            }
        }
        
        // Put the processed data back to canvas
        ctx.putImageData(outputData, 0, 0);
        
        // Create normal texture
        normalTexture = new THREE.Texture(normalCanvas);
        normalTexture.needsUpdate = true;
        
        console.log("Normal map generated");
    }
    
    // Generate roughness map
    function generateRoughnessMap(imageData) {
        // Set canvas dimensions
        roughnessCanvas.width = imageData.width;
        roughnessCanvas.height = imageData.height;
        
        const ctx = roughnessCanvas.getContext('2d');
        const outputData = ctx.createImageData(imageData.width, imageData.height);
        
        // Calculate frequency components and variance for roughness estimation
        for (let y = 0; y < imageData.height; y++) {
            for (let x = 0; x < imageData.width; x++) {
                const idx = (y * imageData.width + x) * 4;
                
                // Sample a 3x3 neighborhood
                let sumVariance = 0;
                let count = 0;
                
                for (let ky = -1; ky <= 1; ky++) {
                    for (let kx = -1; kx <= 1; kx++) {
                        const px = Math.min(imageData.width - 1, Math.max(0, x + kx));
                        const py = Math.min(imageData.height - 1, Math.max(0, y + ky));
                        
                        const nIdx = (py * imageData.width + px) * 4;
                        const centerIdx = (y * imageData.width + x) * 4;
                        
                        // Get grayscale values
                        const centerVal = (imageData.data[centerIdx] + imageData.data[centerIdx + 1] + imageData.data[centerIdx + 2]) / 3;
                        const neighborVal = (imageData.data[nIdx] + imageData.data[nIdx + 1] + imageData.data[nIdx + 2]) / 3;
                        
                        // Accumulate square differences
                        sumVariance += Math.pow(neighborVal - centerVal, 2);
                        count++;
                    }
                }
                
                // Normalize and apply inverse - smoother areas are less rough
                let roughness = Math.sqrt(sumVariance / count) / 16.0;
                
                // Apply variable roughness adjustment based on brightness
                const brightness = (imageData.data[idx] + imageData.data[idx + 1] + imageData.data[idx + 2]) / 3;
                
                // Brighter areas tend to be smoother
                roughness = roughness * 0.6 + (255 - brightness) / 255 * 0.4;
                
                // Apply strength parameter
                roughness *= parseFloat(roughnessStrength.value) * 2;
                
                // Ensure roughness is between 0 and 1
                roughness = Math.min(1.0, Math.max(0.0, roughness));
                
                // Convert to 0-255 range
                const pixelValue = roughness * 255;
                
                outputData.data[idx] = pixelValue;
                outputData.data[idx + 1] = pixelValue;
                outputData.data[idx + 2] = pixelValue;
                outputData.data[idx + 3] = 255; // Alpha
            }
        }
        
        // Put the processed data back to canvas
        ctx.putImageData(outputData, 0, 0);
        
        // Create roughness texture
        roughnessTexture = new THREE.Texture(roughnessCanvas);
        roughnessTexture.needsUpdate = true;
        
        console.log("Roughness map generated");
    }
    
    // Generate displacement map
    function generateDisplacementMap(imageData) {
        // Set canvas dimensions
        displacementCanvas.width = imageData.width;
        displacementCanvas.height = imageData.height;
        
        const ctx = displacementCanvas.getContext('2d');
        const outputData = ctx.createImageData(imageData.width, imageData.height);
        
        // Simple grayscale conversion with contrast enhancement
        for (let i = 0; i < imageData.data.length; i += 4) {
            const r = imageData.data[i];
            const g = imageData.data[i + 1];
            const b = imageData.data[i + 2];
            
            // Calculate brightness
            let brightness = Math.round(0.299 * r + 0.587 * g + 0.114 * b);
            
            // Enhance contrast
            brightness = Math.max(0, Math.min(255, (brightness - 128) * 1.2 + 128));
            
            outputData.data[i] = brightness;
            outputData.data[i + 1] = brightness;
            outputData.data[i + 2] = brightness;
            outputData.data[i + 3] = 255; // Alpha
        }
        
        // Put the processed data back to canvas
        ctx.putImageData(outputData, 0, 0);
        
        // Create displacement texture
        displacementTexture = new THREE.Texture(displacementCanvas);
        displacementTexture.needsUpdate = true;
        
        console.log("Displacement map generated");
    }
    
    // Generate ambient occlusion map
    function generateAOMap(imageData) {
        // Set canvas dimensions
        aoCanvas.width = imageData.width;
        aoCanvas.height = imageData.height;
        
        const ctx = aoCanvas.getContext('2d');
        const outputData = ctx.createImageData(imageData.width, imageData.height);
        
        // Generate AO by analyzing edges and shadows in the image
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = imageData.width;
        tempCanvas.height = imageData.height;
        const tempCtx = tempCanvas.getContext('2d');
        
        // Draw original image to temp canvas
        tempCtx.putImageData(imageData, 0, 0);
        
        // First blur the image slightly
        tempCtx.filter = 'blur(2px)';
        tempCtx.drawImage(tempCanvas, 0, 0);
        
        // Get the blurred image data
        const blurredData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
        
        // Reset filter
        tempCtx.filter = 'none';
        
        // Calculate edge detection (similar to normal map generation)
        for (let y = 0; y < imageData.height; y++) {
            for (let x = 0; x < imageData.width; x++) {
                const idx = (y * imageData.width + x) * 4;
                
                // Edge detection based on neighboring pixels
                let sumGradient = 0;
                let samples = 0;
                
                // Sample 5x5 neighborhood for broader detection
                for (let ky = -2; ky <= 2; ky++) {
                    for (let kx = -2; kx <= 2; kx++) {
                        if (kx === 0 && ky === 0) continue;
                        
                        const px = Math.min(imageData.width - 1, Math.max(0, x + kx));
                        const py = Math.min(imageData.height - 1, Math.max(0, y + ky));
                        
                        const nIdx = (py * imageData.width + px) * 4;
                        
                        // Calculate difference with center pixel (using blurred image for softer edges)
                        const centerVal = (blurredData.data[idx] + blurredData.data[idx + 1] + blurredData.data[idx + 2]) / 3;
                        const neighborVal = (blurredData.data[nIdx] + blurredData.data[nIdx + 1] + blurredData.data[nIdx + 2]) / 3;
                        
                        // Add absolute gradient
                        sumGradient += Math.abs(neighborVal - centerVal);
                        samples++;
                    }
                }
                
                // Calculate average gradient
                const avgGradient = sumGradient / samples;
                
                // Invert and adjust gradient for AO effect (edges and darker areas get more occlusion)
                let aoValue = 255 - (avgGradient * 1.5); // Amplify the effect
                
                // Darken image based on grayscale value (darker areas typically have more occlusion)
                const originalGray = (imageData.data[idx] + imageData.data[idx + 1] + imageData.data[idx + 2]) / 3;
                aoValue = aoValue * 0.7 + (255 - originalGray) * 0.3;
                
                // Apply strength parameter
                aoValue = Math.min(255, Math.max(0, aoValue * parseFloat(aoStrength.value) * 2));
                
                // Set grayscale value
                outputData.data[idx] = aoValue;
                outputData.data[idx + 1] = aoValue;
                outputData.data[idx + 2] = aoValue;
                outputData.data[idx + 3] = 255; // Alpha
            }
        }
        
        // Put the processed data back to canvas
        ctx.putImageData(outputData, 0, 0);
        
        // Create AO texture
        aoTexture = new THREE.Texture(aoCanvas);
        aoTexture.needsUpdate = true;
        
        console.log("AO map generated");
    }
    
    // Generate emission map
    function generateEmissionMap(imageData) {
        // Set canvas dimensions
        emissionCanvas.width = imageData.width;
        emissionCanvas.height = imageData.height;
        
        const ctx = emissionCanvas.getContext('2d');
        const outputData = ctx.createImageData(imageData.width, imageData.height);
        
        // Basic emission map - use bright areas of the image
        for (let i = 0; i < imageData.data.length; i += 4) {
            const r = imageData.data[i];
            const g = imageData.data[i + 1];
            const b = imageData.data[i + 2];
            
            // Calculate brightness
            const brightness = (r + g + b) / 3;
            
            // Threshold to determine emissive parts (only very bright areas)
            const threshold = 210;
            
            // Only keep areas above threshold, scale by strength
            let emissionValue = 0;
            if (brightness > threshold) {
                emissionValue = (brightness - threshold) / (255 - threshold) * 255 * parseFloat(emissionStrength.value);
            }
            
            // For emission, we keep the color but scale intensity
            outputData.data[i] = (r / 255) * emissionValue;
            outputData.data[i + 1] = (g / 255) * emissionValue;
            outputData.data[i + 2] = (b / 255) * emissionValue;
            outputData.data[i + 3] = 255; // Alpha
        }
        
        // Put the processed data back to canvas
        ctx.putImageData(outputData, 0, 0);
        
        // Create emission texture
        emissionTexture = new THREE.Texture(emissionCanvas);
        emissionTexture.needsUpdate = true;
        
        console.log("Emission map generated");
    }
    
    // Generate alpha/transparency map
    function generateAlphaMap(imageData) {
        // Set canvas dimensions
        alphaCanvas.width = imageData.width;
        alphaCanvas.height = imageData.height;
        
        const ctx = alphaCanvas.getContext('2d');
        const outputData = ctx.createImageData(imageData.width, imageData.height);
        
        // Simple alpha map - for demonstration, use inverse of brightness
        // In a real world scenario, this might be connected to a specific color channel or user input
        for (let i = 0; i < imageData.data.length; i += 4) {
            const r = imageData.data[i];
            const g = imageData.data[i + 1];
            const b = imageData.data[i + 2];
            
            // By default, everything is opaque (alpha = 255)
            // For demonstration, darker areas are more transparent
            const brightness = (r + g + b) / 3;
            
            // Generate basic alpha map (black = transparent, white = opaque)
            // Invert this behavior if you want dark areas to be opaque
            outputData.data[i] = brightness;
            outputData.data[i + 1] = brightness;
            outputData.data[i + 2] = brightness;
            outputData.data[i + 3] = 255; // Alpha for this image itself
        }
        
        // Put the processed data back to canvas
        ctx.putImageData(outputData, 0, 0);
        
        // Create alpha texture
        alphaTexture = new THREE.Texture(alphaCanvas);
        alphaTexture.needsUpdate = true;
        
        console.log("Alpha map generated");
    }
    
    // Update textures based on slider values
    function updateTextures() {
        // Update display values
        baseValue.textContent = parseFloat(baseStrength.value).toFixed(1);
        normalValue.textContent = parseFloat(normalStrength.value).toFixed(1);
        roughnessValue.textContent = parseFloat(roughnessStrength.value).toFixed(1);
        displacementValue.textContent = parseFloat(displacementStrength.value).toFixed(1);
        aoValue.textContent = parseFloat(aoStrength.value).toFixed(1);
        
        // Check if we need to update the sphere material
        if (sphere && sphere.material) {
            // Update normal map intensity
            if (sphere.material.normalMap) {
                sphere.material.normalScale.set(
                    parseFloat(normalStrength.value),
                    parseFloat(normalStrength.value)
                );
            }
            
            // Update displacement map intensity
            if (sphere.material.displacementMap) {
                sphere.material.displacementScale = parseFloat(displacementStrength.value);
            }
            
            // Make sure material updates
            sphere.material.needsUpdate = true;
        } else {
            // If sphere doesn't exist, create it
            createSphere();
        }
    }
    
    // Update material properties
    function updateMaterial() {
        // Update display values
        metalnessValue.textContent = parseFloat(metalness.value).toFixed(1);
        if (emissionValue) {
            emissionValue.textContent = parseFloat(emissionStrength.value).toFixed(1);
        }
        
        if (sphere && sphere.material) {
            sphere.material.metalness = parseFloat(metalness.value);
            
            // Update emission if we have an emission map
            if (sphere.material.emissiveMap) {
                sphere.material.emissiveIntensity = parseFloat(emissionStrength.value);
            }
            
            sphere.material.needsUpdate = true;
        }
    }
    
    // Update light position
    function updateLightPosition() {
        if (light) {
            light.position.set(
                parseFloat(lightX.value),
                parseFloat(lightY.value),
                parseFloat(lightZ.value)
            );
        }
    }
    
    // Download texture as image
    function downloadTexture(canvas, filename) {
        if (!hasUploadedImage) {
            showNotification('Please upload a texture first', 'error');
            return;
        }
        
        const link = document.createElement('a');
        link.download = `${filename}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
        
        showNotification(`${filename.split('-')[0]} map downloaded`, 'success');
    }
    
    // Export all selected maps as a ZIP file
    function exportAllMapsAsZip() {
        if (!hasUploadedImage) {
            showNotification('Please upload a texture first', 'error');
            return;
        }
        
        if (typeof JSZip === 'undefined' || typeof saveAs === 'undefined') {
            showNotification('ZIP export libraries not loaded. Please refresh and try again.', 'error');
            return;
        }
        
        const zip = new JSZip();
        const textureBaseName = 'texture';
        let exportCount = 0;
        
        // Show processing indicator
        showLoadingIndicator('Packaging texture maps...', 10);
        
        // Get selected export format
        let format = 'png';
        let mimeType = 'image/png';
        
        formatRadios.forEach(radio => {
            if (radio.checked) {
                format = radio.value;
                mimeType = `image/${format}`;
            }
        });
        
        // Add selected maps to ZIP
        if (exportBase.checked && baseCanvas) {
            zip.file(`${textureBaseName}_basecolor.${format}`, dataURLToBlob(baseCanvas.toDataURL(mimeType)), {base64: false});
            exportCount++;
            updateProgress(20);
        }
        
        if (exportNormal.checked && normalCanvas) {
            zip.file(`${textureBaseName}_normal.${format}`, dataURLToBlob(normalCanvas.toDataURL(mimeType)), {base64: false});
            exportCount++;
            updateProgress(40);
        }
        
        if (exportRoughness.checked && roughnessCanvas) {
            zip.file(`${textureBaseName}_roughness.${format}`, dataURLToBlob(roughnessCanvas.toDataURL(mimeType)), {base64: false});
            exportCount++;
            updateProgress(60);
        }
        
        if (exportDisplacement.checked && displacementCanvas) {
            zip.file(`${textureBaseName}_displacement.${format}`, dataURLToBlob(displacementCanvas.toDataURL(mimeType)), {base64: false});
            exportCount++;
            updateProgress(70);
        }
        
        if (exportAO.checked && aoCanvas) {
            zip.file(`${textureBaseName}_ao.${format}`, dataURLToBlob(aoCanvas.toDataURL(mimeType)), {base64: false});
            exportCount++;
            updateProgress(80);
        }
        
        if (exportEmission && exportEmission.checked && emissionCanvas) {
            zip.file(`${textureBaseName}_emission.${format}`, dataURLToBlob(emissionCanvas.toDataURL(mimeType)), {base64: false});
            exportCount++;
            updateProgress(85);
        }
        
        if (exportAlpha && exportAlpha.checked && alphaCanvas) {
            zip.file(`${textureBaseName}_alpha.${format}`, dataURLToBlob(alphaCanvas.toDataURL(mimeType)), {base64: false});
            exportCount++;
            updateProgress(90);
        }
        
        if (exportCount === 0) {
            hideLoadingIndicator();
            showNotification('Please select at least one map to export', 'warning');
            return;
        }
        
        updateLoadingMessage('Creating ZIP file...');
        
        // Generate and download the ZIP file
        zip.generateAsync({type: 'blob'})
            .then(function(content) {
                updateProgress(100);
                saveAs(content, `${textureBaseName}_maps.zip`);
                setTimeout(() => {
                    hideLoadingIndicator();
                    showNotification(`${exportCount} texture maps exported successfully!`, 'success');
                }, 500);
            })
            .catch(function(error) {
                console.error('Error creating ZIP file:', error);
                hideLoadingIndicator();
                showNotification('Error creating ZIP file. Please try again.', 'error');
            });
    }
    
    // Convert Data URL to Blob for ZIP file
    function dataURLToBlob(dataURL) {
        const parts = dataURL.split(';base64,');
        const contentType = parts[0].split(':')[1];
        const raw = window.atob(parts[1]);
        const rawLength = raw.length;
        const uInt8Array = new Uint8Array(rawLength);
        
        for (let i = 0; i < rawLength; ++i) {
            uInt8Array[i] = raw.charCodeAt(i);
        }
        
        return new Blob([uInt8Array], {type: contentType});
    }
    
    // Toggle auto-rotation
    function toggleAutoRotation() {
        autoRotate = !autoRotate;
        if (autoRotate) {
            toggleAutoRotateBtn.classList.add('active');
            showNotification('Auto-rotation enabled', 'info');
        } else {
            toggleAutoRotateBtn.classList.remove('active');
            showNotification('Auto-rotation disabled', 'info');
        }
    }
    
    // Update rotation from sliders
    function updateRotation() {
        if (!sphere) return;
        
        // Disable auto-rotate when user drags sliders
        if (!isDraggingSlider) {
            isDraggingSlider = true;
            autoRotate = false;
            toggleAutoRotateBtn.classList.remove('active');
        }
        
        // Apply rotation from sliders
        sphere.rotation.x = parseFloat(rotationX.value);
        sphere.rotation.y = parseFloat(rotationY.value);
    }
    
    // Export Three.js code
    function exportThreejsCode() {
        if (!hasUploadedImage) {
            showNotification('Please upload a texture first', 'error');
            return;
        }
        
        // Show loading indicator
        showLoadingIndicator('Generating Three.js code...', 50);
        
        // Create sample Three.js code with current settings
        const code = `// Three.js Material Example with Exported Textures
import * as THREE from 'three';

// Create a scene, camera, and renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 5;

const renderer = new THREE.WebGLRenderer({ 
    antialias: true,
    alpha: true
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
document.body.appendChild(renderer.domElement);

// Load textures
const textureLoader = new THREE.TextureLoader();
const baseTexture = textureLoader.load('texture_basecolor.png');
const normalTexture = textureLoader.load('texture_normal.png');
const roughnessTexture = textureLoader.load('texture_roughness.png');
const displacementTexture = textureLoader.load('texture_displacement.png');
const aoTexture = textureLoader.load('texture_ao.png');
${parseFloat(emissionStrength.value) > 0 ? "const emissionTexture = textureLoader.load('texture_emission.png');" : ""}

// Create material with all maps
const material = new THREE.MeshStandardMaterial({
    map: baseTexture,
    normalMap: normalTexture,
    roughnessMap: roughnessTexture,
    displacementMap: displacementTexture,
    aoMap: aoTexture,
    ${parseFloat(emissionStrength.value) > 0 ? "emissiveMap: emissionTexture,\n    emissive: new THREE.Color(0xffffff),\n    emissiveIntensity: " + emissionStrength.value + "," : ""}
    normalScale: new THREE.Vector2(${normalStrength.value}, ${normalStrength.value}),
    roughness: ${roughnessStrength.value},
    metalness: ${metalness.value},
    displacementScale: ${displacementStrength.value}
});

// Create a sphere geometry with high resolution for better displacement
const geometry = new THREE.SphereGeometry(2, 64, 64);
const mesh = new THREE.Mesh(geometry, material);

// For ambient occlusion to work, we need UV2
geometry.setAttribute('uv2', geometry.attributes.uv);

scene.add(mesh);

// Add lights
const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1.5);
directionalLight.position.set(${lightX.value}, ${lightY.value}, ${lightZ.value});
scene.add(directionalLight);

// Add subtle hemisphere light for better detail visibility
const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 0.3);
hemiLight.position.set(0, 20, 0);
scene.add(hemiLight);

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    
    // Rotation animation
    mesh.rotation.y += 0.005;
    
    renderer.render(scene, camera);
}

animate();

// Handle window resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});`;
        
        // Simulate processing delay
        setTimeout(() => {
            // Create a download link for the code
            updateProgress(100);
            
            const blob = new Blob([code], { type: 'text/javascript' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = 'texture_material.js';
            link.click();
            
            hideLoadingIndicator();
            showNotification('Three.js code exported successfully', 'success');
        }, 800);
    }
});
