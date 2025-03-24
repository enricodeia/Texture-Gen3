// Wait until everything is fully loaded
document.addEventListener('DOMContentLoaded', function() {
    
    // Global variables
    let scene, camera, renderer, sphere, light, grid;
    let baseTexture, normalTexture, roughnessTexture, displacementTexture, aoTexture;
    let originalImageData;
    let hasUploadedImage = false;
    let autoRotate = true;
    let rotationSpeed = { x: 0.0005, y: 0.004 };
    let isDraggingSlider = false;
    let isDraggingSphere = false;
    let animationFrameId = null;
    let previousMousePosition = { x: 0, y: 0 };
    let isGridVisible = true;
    
    // Default control values for reset
    const defaultValues = {
        baseStrength: 1.0,
        normalStrength: 1.0,
        roughnessStrength: 0.5,
        displacementStrength: 0.2,
        aoStrength: 0.5,
        metalness: 0.0,
        lightX: 5,
        lightY: 5,
        lightZ: 5
    };
    
    // DOM Elements
    const uploadArea = document.getElementById('upload-area');
    const uploadContent = document.querySelector('.upload-content');
    const textureUpload = document.getElementById('texture-upload');
    const previewOverlay = document.getElementById('preview-overlay');
    const uploadedImage = document.getElementById('uploaded-image');
    const deleteImageBtn = document.getElementById('delete-image');
    const modelContainer = document.getElementById('model-container');
    
    // Stats Elements
    const resolutionStat = document.getElementById('resolution-stat');
    const filesizeStat = document.getElementById('filesize-stat');
    const formatStat = document.getElementById('format-stat');
    
    // Map Size Elements
    const baseMapSize = document.getElementById('base-map-size');
    const normalMapSize = document.getElementById('normal-map-size');
    const roughnessMapSize = document.getElementById('roughness-map-size');
    const displacementMapSize = document.getElementById('displacement-map-size');
    const aoMapSize = document.getElementById('ao-map-size');
    
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
    
    // Control Elements
    const baseStrength = document.getElementById('base-strength');
    const normalStrength = document.getElementById('normal-strength');
    const roughnessStrength = document.getElementById('roughness-strength');
    const displacementStrength = document.getElementById('displacement-strength');
    const aoStrength = document.getElementById('ao-strength');
    const metalness = document.getElementById('metalness');
    const lightX = document.getElementById('light-x');
    const lightY = document.getElementById('light-y');
    const lightZ = document.getElementById('light-z');
    
    // Value display elements
    const baseValue = document.getElementById('base-value');
    const normalValue = document.getElementById('normal-value');
    const roughnessValue = document.getElementById('roughness-value');
    const displacementValue = document.getElementById('displacement-value');
    const aoValue = document.getElementById('ao-value');
    const metalnessValue = document.getElementById('metalness-value');
    
    // Download buttons
    const downloadBase = document.getElementById('download-base');
    const downloadNormal = document.getElementById('download-normal');
    const downloadRoughness = document.getElementById('download-roughness');
    const downloadDisplacement = document.getElementById('download-displacement');
    const downloadAO = document.getElementById('download-ao');
    const exportZip = document.getElementById('export-zip');
    const exportThreejs = document.getElementById('export-threejs');
    
    // Export options
    const exportBase = document.getElementById('export-base');
    const exportNormal = document.getElementById('export-normal');
    const exportRoughness = document.getElementById('export-roughness');
    const exportDisplacement = document.getElementById('export-displacement');
    const exportAO = document.getElementById('export-ao');
    
    // Format selectors
    const exportFormat = document.getElementById('export-format');
    const baseFormat = document.getElementById('base-format');
    const normalFormat = document.getElementById('normal-format');
    const roughnessFormat = document.getElementById('roughness-format');
    const displacementFormat = document.getElementById('displacement-format');
    const aoFormat = document.getElementById('ao-format');
    
    // New UI controls
    const toggleGridBtn = document.getElementById('toggle-grid');
    const resetControlsBtn = document.getElementById('reset-controls');
    
    // Processing indicator
    const processingIndicator = document.getElementById('processing-indicator');
    const progressBar = document.getElementById('progress-bar');
    const processingMessage = document.getElementById('processing-message');
    
    // Notification container
    const notificationContainer = document.getElementById('notification-container');
    
    // Humorous loading messages
    const loadingMessages = [
        "Teaching photons how to bounce properly...",
        "Converting 2D boringness into 3D awesomeness...",
        "Convincing pixels to work in the third dimension...",
        "Calculating normal vectors (they seem quite abnormal)...",
        "Making your texture look fabulous in 3D...",
        "Generating bumps where there were none before...",
        "Analyzing surface details with microscopic precision...",
        "Persuading light to interact with virtual materials...",
        "Extracting roughness from smooth images (it's rough work)...",
        "Creating ambient occlusion where the sun don't shine...",
        "Giving depth to the depthless...",
        "Turning flat images into not-so-flat textures...",
        "Simulating reality one pixel at a time...",
        "Activating hyper-realistic texture algorithms...",
        "Applying digital sandpaper for perfect roughness...",
        "Making virtual surfaces feel touchable...",
        "Crafting PBR magic with digital pixie dust...",
        "Converting your image into a material science miracle...",
        "Enhancing reality without the RTX graphics card...",
        "Calculating how shadows would hide if they could..."
    ];
    
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
            
            // Initialize UI state
            toggleGridBtn.classList.add('active');
            toggleAutoRotateBtn.classList.add('active');
            
        } catch (error) {
            console.error('Error initializing application:', error);
            showNotification('Error initializing application. Please refresh the page.', 'error');
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
            metalness: parseFloat(metalness.value)
        });
    
        // Make sure all textures are updated
        if (baseTexture) baseTexture.needsUpdate = true;
        if (normalTexture) normalTexture.needsUpdate = true;
        if (roughnessTexture) roughnessTexture.needsUpdate = true;
        if (displacementTexture) displacementTexture.needsUpdate = true;
        if (aoTexture) aoTexture.needsUpdate = true;
    
        // Apply textures
        material.map = baseTexture;
        material.normalMap = normalTexture;
        material.roughnessMap = roughnessTexture;
        material.displacementMap = displacementTexture;
        material.aoMap = aoTexture;
        
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
    
        // Ensure material knows it needs updating
        material.needsUpdate = true;
    
        // Create mesh
        sphere = new THREE.Mesh(geometry, material);
        
        // Set up UV2 coordinates for AO map
        geometry.setAttribute('uv2', geometry.attributes.uv);
        
        scene.add(sphere);
        
        console.log("Sphere created with textures:", {
            base: !!material.map,
            normal: !!material.normalMap,
            roughness: !!material.roughnessMap,
            displacement: !!material.displacementMap,
            ao: !!material.aoMap
        });
    }
    
    // Animation loop
    function animate() {
        animationFrameId = requestAnimationFrame(animate);
        
        // Add automatic or manual rotation to the sphere
        if (sphere) {
            if (autoRotate && !isDraggingSphere) {
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
        
        // Light position
        lightX.addEventListener('input', updateLightPosition);
        lightY.addEventListener('input', updateLightPosition);
        lightZ.addEventListener('input', updateLightPosition);
        
        // Toggle grid visibility
        toggleGridBtn.addEventListener('click', toggleGridVisibility);
        
        // Reset controls
        resetControlsBtn.addEventListener('click', resetControls);
        
        // Download buttons with format selection
        downloadBase.addEventListener('click', () => downloadTexture(baseCanvas, 'basecolor-map', baseFormat.value));
        downloadNormal.addEventListener('click', () => downloadTexture(normalCanvas, 'normal-map', normalFormat.value));
        downloadRoughness.addEventListener('click', () => downloadTexture(roughnessCanvas, 'roughness-map', roughnessFormat.value));
        downloadDisplacement.addEventListener('click', () => downloadTexture(displacementCanvas, 'displacement-map', displacementFormat.value));
        downloadAO.addEventListener('click', () => downloadTexture(aoCanvas, 'ao-map', aoFormat.value));
        
        // Export ZIP
        exportZip.addEventListener('click', exportAllMapsAsZip);
        
        // Export Three.js code
        if (exportThreejs) {
            exportThreejs.addEventListener('click', exportThreejsCode);
        }
        
        // Rotation controls
        rotationX.addEventListener('input', updateRotation);
        rotationY.addEventListener('input', updateRotation);
        toggleAutoRotateBtn.addEventListener('click', toggleAutoRotation);
        
        // Direct sphere manipulation
        modelContainer.addEventListener('mousedown', onModelMouseDown);
        modelContainer.addEventListener('touchstart', onModelTouchStart, { passive: false });
        
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
    }
    
    // Mouse down handler for model container
    function onModelMouseDown(event) {
        if (!sphere) return;
        
        isDraggingSphere = true;
        previousMousePosition = {
            x: event.clientX,
            y: event.clientY
        };
        
        // Disable auto-rotation when user starts dragging
        if (autoRotate) {
            // Don't turn off the flag, just pause rotation
            // This way it will resume when the user releases
        }
        
        // Add mouse move and mouse up listeners
        document.addEventListener('mousemove', onModelMouseMove);
        document.addEventListener('mouseup', onModelMouseUp);
        
        // Prevent default behavior
        event.preventDefault();
    }
    
    // Mouse move handler for model container
    function onModelMouseMove(event) {
        if (!isDraggingSphere || !sphere) return;
        
        const deltaMove = {
            x: event.clientX - previousMousePosition.x,
            y: event.clientY - previousMousePosition.y
        };
        
        // Calculate rotation based on mouse movement
        // Adjust sensitivity as needed
        const rotationSensitivity = 0.01;
        sphere.rotation.y += deltaMove.x * rotationSensitivity;
        sphere.rotation.x += deltaMove.y * rotationSensitivity;
        
        // Update rotation sliders to match the new rotation
        rotationX.value = sphere.rotation.x;
        rotationY.value = sphere.rotation.y;
        
        // Update previous mouse position
        previousMousePosition = {
            x: event.clientX,
            y: event.clientY
        };
    }
    
    // Mouse up handler for model container
    function onModelMouseUp() {
        isDraggingSphere = false;
        
        // Remove mouse move and mouse up listeners
        document.removeEventListener('mousemove', onModelMouseMove);
        document.removeEventListener('mouseup', onModelMouseUp);
    }
    
    // Touch start handler for model container (mobile)
    function onModelTouchStart(event) {
        if (!sphere) return;
        
        // Prevent default behavior (e.g., scrolling)
        event.preventDefault();
        
        isDraggingSphere = true;
        
        if (event.touches.length === 1) {
            // Single touch for rotation
            previousMousePosition = {
                x: event.touches[0].clientX,
                y: event.touches[0].clientY
            };
            
            // Add touch move and touch end listeners
            document.addEventListener('touchmove', onModelTouchMove, { passive: false });
            document.addEventListener('touchend', onModelTouchEnd);
        }
    }
    
    // Touch move handler for model container (mobile)
    function onModelTouchMove(event) {
        if (!isDraggingSphere || !sphere) return;
        
        // Prevent default behavior (e.g., scrolling)
        event.preventDefault();
        
        if (event.touches.length === 1) {
            // Single touch for rotation
            const deltaMove = {
                x: event.touches[0].clientX - previousMousePosition.x,
                y: event.touches[0].clientY - previousMousePosition.y
            };
            
            // Calculate rotation based on touch movement
            // Adjust sensitivity as needed
            const rotationSensitivity = 0.01;
            sphere.rotation.y += deltaMove.x * rotationSensitivity;
            sphere.rotation.x += deltaMove.y * rotationSensitivity;
            
            // Update rotation sliders to match the new rotation
            rotationX.value = sphere.rotation.x;
            rotationY.value = sphere.rotation.y;
            
            // Update previous touch position
            previousMousePosition = {
                x: event.touches[0].clientX,
                y: event.touches[0].clientY
            };
        }
    }
    
    // Touch end handler for model container (mobile)
    function onModelTouchEnd() {
        isDraggingSphere = false;
        
        // Remove touch move and touch end listeners
        document.removeEventListener('touchmove', onModelTouchMove);
        document.removeEventListener('touchend', onModelTouchEnd);
    }
    
    // Toggle grid visibility
    function toggleGridVisibility() {
        if (grid) {
            isGridVisible = !isGridVisible;
            grid.visible = isGridVisible;
            
            // Update button state
            if (isGridVisible) {
                toggleGridBtn.classList.add('active');
                showNotification('Grid enabled', 'info');
            } else {
                toggleGridBtn.classList.remove('active');
                showNotification('Grid disabled', 'info');
            }
        }
    }
    
    // Reset all controls to default values
    function resetControls() {
        // Reset all sliders to default values
        baseStrength.value = defaultValues.baseStrength;
        normalStrength.value = defaultValues.normalStrength;
        roughnessStrength.value = defaultValues.roughnessStrength;
        displacementStrength.value = defaultValues.displacementStrength;
        aoStrength.value = defaultValues.aoStrength;
        metalness.value = defaultValues.metalness;
        lightX.value = defaultValues.lightX;
        lightY.value = defaultValues.lightY;
        lightZ.value = defaultValues.lightZ;
        
        // Update display values
        baseValue.textContent = defaultValues.baseStrength.toFixed(1);
        normalValue.textContent = defaultValues.normalStrength.toFixed(1);
        roughnessValue.textContent = defaultValues.roughnessStrength.toFixed(1);
        displacementValue.textContent = defaultValues.displacementStrength.toFixed(1);
        aoValue.textContent = defaultValues.aoStrength.toFixed(1);
        metalnessValue.textContent = defaultValues.metalness.toFixed(1);
        
        // Update material if a sphere exists
        if (sphere && sphere.material) {
            sphere.material.roughness = defaultValues.roughnessStrength;
            sphere.material.metalness = defaultValues.metalness;
            
            if (sphere.material.normalMap) {
                sphere.material.normalScale.set(
                    defaultValues.normalStrength,
                    defaultValues.normalStrength
                );
            }
            
            if (sphere.material.displacementMap) {
                sphere.material.displacementScale = defaultValues.displacementStrength;
            }
            
            sphere.material.needsUpdate = true;
        }
        
        // Update light position
        if (light) {
            light.position.set(
                defaultValues.lightX,
                defaultValues.lightY,
                defaultValues.lightZ
            );
        }
        
        showNotification('Settings reset to defaults', 'success');
    }
    
    // Clear the uploaded image
    function clearImage() {
        // Reset the UI
        previewOverlay.style.display = 'none';
        uploadedImage.src = '';
        hasUploadedImage = false;
        
        // Reset stats
        resolutionStat.textContent = '-';
        filesizeStat.textContent = '-';
        formatStat.textContent = '-';
        
        // Reset map sizes
        baseMapSize.textContent = '-';
        normalMapSize.textContent = '-';
        roughnessMapSize.textContent = '-';
        displacementMapSize.textContent = '-';
        aoMapSize.textContent = '-';
        
        // Remove textures from sphere
        if (sphere && sphere.material) {
            sphere.material.map = null;
            sphere.material.normalMap = null;
            sphere.material.roughnessMap = null;
            sphere.material.displacementMap = null;
            sphere.material.aoMap = null;
            sphere.material.needsUpdate = true;
        }
        
        // Clear canvases
        clearCanvas(baseCanvas);
        clearCanvas(normalCanvas);
        clearCanvas(roughnessCanvas);
        clearCanvas(displacementCanvas);
        clearCanvas(aoCanvas);
        
        // Reset textures
        baseTexture = null;
        normalTexture = null;
        roughnessTexture = null;
        displacementTexture = null;
        aoTexture = null;
        originalImageData = null;
        
        showNotification('Image removed', 'info');
    }
    
    // Clear a canvas
    function clearCanvas(canvas) {
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
        
        // Show loading state with random message
        const initialMessage = getRandomLoadingMessage();
        showLoadingIndicator(initialMessage, 10);
        
        const reader = new FileReader();
        
        reader.onload = function(e) {
            try {
                updateProgress(30);
                updateLoadingMessage(getRandomLoadingMessage());
                
                // Display the image
                uploadedImage.src = e.target.result;
                previewOverlay.style.display = 'flex';
                hasUploadedImage = true;
                
                // Update texture stats
                updateTextureStats(file);
                
                // Load the image to process it
                const img = new Image();
                img.onload = function() {
                    try {
                        updateProgress(50);
                        updateLoadingMessage(getRandomLoadingMessage());
                        
                        // Store original image data
                        originalImageData = getImageData(img);
                        
                        updateProgress(60);
                        updateLoadingMessage(getRandomLoadingMessage());
                        
                        // Generate texture maps
                        generateTextureMaps(img);
                        
                        updateProgress(90);
                        updateLoadingMessage("Applying to 3D model... Almost there!");
                        
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
    
    // Update texture stats display
    function updateTextureStats(file) {
        // Format file size
        const fileSizeKB = file.size / 1024;
        let fileSizeStr;
        
        if (fileSizeKB >= 1024) {
            fileSizeStr = (fileSizeKB / 1024).toFixed(2) + ' MB';
        } else {
            fileSizeStr = fileSizeKB.toFixed(2) + ' KB';
        }
        
        // Get image format from MIME type
        const formatMatch = file.type.match(/image\/(\w+)/);
        const format = formatMatch ? formatMatch[1].toUpperCase() : 'Unknown';
        
        // Update stats display
        filesizeStat.textContent = fileSizeStr;
        formatStat.textContent = format;
        
        // Resolution will be updated when the image loads
        const img = new Image();
        img.onload = function() {
            resolutionStat.textContent = img.width + ' × ' + img.height;
        };
        img.src = URL.createObjectURL(file);
    }
    
    // Update map size information
    function updateMapSizes() {
        if (baseCanvas.width && baseCanvas.height) {
            baseMapSize.textContent = `${baseCanvas.width} × ${baseCanvas.height}`;
            normalMapSize.textContent = `${normalCanvas.width} × ${normalCanvas.height}`;
            roughnessMapSize.textContent = `${roughnessCanvas.width} × ${roughnessCanvas.height}`;
            displacementMapSize.textContent = `${displacementCanvas.width} × ${displacementCanvas.height}`;
            aoMapSize.textContent = `${aoCanvas.width} × ${aoCanvas.height}`;
        }
    }
    
    // Get a random loading message
    function getRandomLoadingMessage() {
        return loadingMessages[Math.floor(Math.random() * loadingMessages.length)];
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
        
        // Update map sizes display
        updateMapSizes();
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
                const scale = 3.0; // Increased scale for stronger normal effect
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
                
                // Ensure within range and soften effect
                aoValue = Math.max(0, Math.min(255, aoValue));
                
                // Enhance contrast but not too much
                aoValue = Math.max(100, Math.min(255, (aoValue - 128) * 1.2 + 128));
                
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
        
        if (sphere && sphere.material) {
            sphere.material.metalness = parseFloat(metalness.value);
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
    
    // Estimate file size based on format and canvas
    function estimateFileSize(canvas, format) {
        // Get canvas dimensions
        const width = canvas.width;
        const height = canvas.height;
        
        // Base size calculation (width * height * channels)
        let baseSizeBytes = width * height * 4; // 4 channels (RGBA)
        
        // Compression ratios (approximate)
        const compressionRatios = {
            png: 0.8,    // PNG is lossless but has some compression
            webp: 0.4,   // WebP has good compression
            jpeg: 0.2    // JPEG has high compression
        };
        
        // Calculate estimated file size based on format
        const estimatedSizeBytes = baseSizeBytes * compressionRatios[format];
        
        // Convert to KB or MB for display
        if (estimatedSizeBytes > 1024 * 1024) {
            return (estimatedSizeBytes / (1024 * 1024)).toFixed(2) + ' MB';
        } else {
            return (estimatedSizeBytes / 1024).toFixed(2) + ' KB';
        }
    }
    
    // Download texture as image with selected format
    function downloadTexture(canvas, filename, format = 'png') {
        if (!hasUploadedImage) {
            showNotification('Please upload a texture first', 'error');
            return;
        }
        
        // Create a link element for downloading
        const link = document.createElement('a');
        
        // Generate data URL based on selected format
        switch (format) {
            case 'webp':
                link.href = canvas.toDataURL('image/webp');
                link.download = `${filename}.webp`;
                break;
            case 'jpeg':
                link.href = canvas.toDataURL('image/jpeg', 0.9); // 0.9 quality
                link.download = `${filename}.jpg`;
                break;
            case 'png':
            default:
                link.href = canvas.toDataURL('image/png');
                link.download = `${filename}.png`;
                break;
        }
        
        // Trigger the download
        link.click();
        
        // Show success notification
        const formatNames = { png: 'PNG', webp: 'WebP', jpeg: 'JPEG' };
        showNotification(`${filename.split('-')[0]} map downloaded as ${formatNames[format]}`, 'success');
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
        const format = exportFormat.value;
        const formatExt = format === 'webp' ? 'webp' : (format === 'jpeg' ? 'jpg' : 'png');
        
        // Show processing indicator
        showLoadingIndicator('Packaging texture maps...', 10);
        
        // Add selected maps to ZIP
        if (exportBase.checked && baseCanvas) {
            let dataURL;
            if (format === 'webp') {
                dataURL = baseCanvas.toDataURL('image/webp');
            } else if (format === 'jpeg') {
                dataURL = baseCanvas.toDataURL('image/jpeg', 0.9);
            } else {
                dataURL = baseCanvas.toDataURL('image/png');
            }
            
            zip.file(`${textureBaseName}_basecolor.${formatExt}`, dataURLToBlob(dataURL), {base64: false});
            exportCount++;
            updateProgress(20);
        }
        
        if (exportNormal.checked && normalCanvas) {
            // For normal maps, prefer PNG for quality (or WebP if selected)
            const normalFormat = format === 'jpeg' ? 'png' : format;
            const normalExt = normalFormat === 'webp' ? 'webp' : 'png';
            
            let dataURL;
            if (normalFormat === 'webp') {
                dataURL = normalCanvas.toDataURL('image/webp');
            } else {
                dataURL = normalCanvas.toDataURL('image/png');
            }
            
            zip.file(`${textureBaseName}_normal.${normalExt}`, dataURLToBlob(dataURL), {base64: false});
            exportCount++;
            updateProgress(40);
        }
        
        if (exportRoughness.checked && roughnessCanvas) {
            let dataURL;
            if (format === 'webp') {
                dataURL = roughnessCanvas.toDataURL('image/webp');
            } else if (format === 'jpeg') {
                dataURL = roughnessCanvas.toDataURL('image/jpeg', 0.9);
            } else {
                dataURL = roughnessCanvas.toDataURL('image/png');
            }
            
            zip.file(`${textureBaseName}_roughness.${formatExt}`, dataURLToBlob(dataURL), {base64: false});
            exportCount++;
            updateProgress(60);
        }
        
        if (exportDisplacement.checked && displacementCanvas) {
            // For displacement maps, prefer PNG for quality (or WebP if selected)
            const dispFormat = format === 'jpeg' ? 'png' : format;
            const dispExt = dispFormat === 'webp' ? 'webp' : 'png';
            
            let dataURL;
            if (dispFormat === 'webp') {
                dataURL = displacementCanvas.toDataURL('image/webp');
            } else {
                dataURL = displacementCanvas.toDataURL('image/png');
            }
            
            zip.file(`${textureBaseName}_displacement.${dispExt}`, dataURLToBlob(dataURL), {base64: false});
            exportCount++;
            updateProgress(80);
        }
        
        if (exportAO.checked && aoCanvas) {
            let dataURL;
            if (format === 'webp') {
                dataURL = aoCanvas.toDataURL('image/webp');
            } else if (format === 'jpeg') {
                dataURL = aoCanvas.toDataURL('image/jpeg', 0.9);
            } else {
                dataURL = aoCanvas.toDataURL('image/png');
            }
            
            zip.file(`${textureBaseName}_ao.${formatExt}`, dataURLToBlob(dataURL), {base64: false});
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
                    showNotification(`${exportCount} texture maps exported successfully as ${format.toUpperCase()}!`, 'success');
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
    
    // Export Three.js code with current format settings
    function exportThreejsCode() {
        if (!hasUploadedImage) {
            showNotification('Please upload a texture first', 'error');
            return;
        }
        
        // Get selected format
        const format = exportFormat.value;
        const formatExt = format === 'webp' ? 'webp' : (format === 'jpeg' ? 'jpg' : 'png');
        
        // Normal and displacement maps should use PNG/WebP for quality
        const normalFormat = format === 'jpeg' ? 'png' : formatExt;
        const dispFormat = format === 'jpeg' ? 'png' : formatExt;
        
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
const baseTexture = textureLoader.load('texture_basecolor.${formatExt}');
const normalTexture = textureLoader.load('texture_normal.${normalFormat}');
const roughnessTexture = textureLoader.load('texture_roughness.${formatExt}');
const displacementTexture = textureLoader.load('texture_displacement.${dispFormat}');
const aoTexture = textureLoader.load('texture_ao.${formatExt}');

// Create material with all maps
const material = new THREE.MeshStandardMaterial({
    map: baseTexture,
    normalMap: normalTexture,
    roughnessMap: roughnessTexture,
    displacementMap: displacementTexture,
    aoMap: aoTexture,
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
