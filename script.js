// Texture Gen v3 - Main JavaScript
document.addEventListener('DOMContentLoaded', function() {
    
    // Global variables
    let scene, camera, renderer, currentModel, light, grid;
    let uvScene, uvCamera, uvRenderer;
    let baseTexture, normalTexture, roughnessTexture, displacementTexture, aoTexture, emissionTexture;
    let originalImageData, seamlessImageData;
    let hasUploadedImage = false;
    let autoRotate = true;
    let rotationSpeed = { x: 0.0005, y: 0.004 };
    let isDraggingSlider = false;
    let animationFrameId = null;
    let useHDRI = false;
    let pmremGenerator, envMap;
    let currentModelType = 'sphere';
    
    // UV Editor variables
    let uvCanvas, uvContext;
    let uvPreviewScene, uvPreviewCamera, uvPreviewRenderer, uvPreviewModel;
    let uvIslands = [];
    let selectedIslands = [];
    let uvZoom = 1;
    let uvPan = { x: 0, y: 0 };
    let uvActiveTool = 'pan';
    let isDragging = false;
    let dragStart = { x: 0, y: 0 };
    
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
    
    // Controls Tabs
    const controlsTabs = document.querySelectorAll('.controls-tab');
    const controlsPanels = document.querySelectorAll('.controls-panel');
    
    // Model Tabs
    const modelTabs = document.querySelectorAll('.model-tab');
    
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
    
    // Control Elements
    const baseStrength = document.getElementById('base-strength');
    const normalStrength = document.getElementById('normal-strength');
    const roughnessStrength = document.getElementById('roughness-strength');
    const displacementStrength = document.getElementById('displacement-strength');
    const aoStrength = document.getElementById('ao-strength');
    const metalness = document.getElementById('metalness');
    const emissionStrength = document.getElementById('emission-strength');
    const uvRepeatX = document.getElementById('uv-repeat-x');
    const uvRepeatY = document.getElementById('uv-repeat-y');
    const uvOffsetX = document.getElementById('uv-offset-x');
    const uvOffsetY = document.getElementById('uv-offset-y');
    const uvRotation = document.getElementById('uv-rotation');
    const uvScale = document.getElementById('uv-scale');
    const lightX = document.getElementById('light-x');
    const lightY = document.getElementById('light-y');
    const lightZ = document.getElementById('light-z');
    const useHDRIToggle = document.getElementById('use-hdri');
    const materialTypeSelect = document.getElementById('material-type');
    const normalAlgorithmSelect = document.getElementById('normal-algorithm');
    const aoRadius = document.getElementById('ao-radius');
    
    // Seamless controls
    const makeSeamlessBtn = document.getElementById('make-seamless');
    const seamlessPanel = document.getElementById('seamless-panel');
    const seamlessStrength = document.getElementById('seamless-strength');
    const seamlessMethod = document.getElementById('seamless-method');
    const applySeamlessBtn = document.getElementById('apply-seamless');
    const cancelSeamlessBtn = document.getElementById('cancel-seamless');
    
    // UV Editor elements
    uvCanvas = document.getElementById('uv-canvas');
    const uvModelContainer = document.getElementById('uv-model-container');
    const uvTools = document.querySelectorAll('.uv-tool');
    const uvZoomIn = document.getElementById('uv-zoom-in');
    const uvZoomOut = document.getElementById('uv-zoom-out');
    const uvReset = document.getElementById('uv-reset');
    const uvEditPosX = document.getElementById('uv-edit-pos-x');
    const uvEditPosY = document.getElementById('uv-edit-pos-y');
    const uvEditRotation = document.getElementById('uv-edit-rotation');
    const uvEditScaleX = document.getElementById('uv-edit-scale-x');
    const uvEditScaleY = document.getElementById('uv-edit-scale-y');
    const uvShowGrid = document.getElementById('uv-show-grid');
    const uvShowCheckerboard = document.getElementById('uv-show-checkerboard');
    const uvShowTexture = document.getElementById('uv-show-texture');
    const uvShowSeams = document.getElementById('uv-show-seams');
    const uvOverlayOpacity = document.getElementById('uv-overlay-opacity');
    const uvApplyBtn = document.getElementById('uv-apply');
    const uvCancelBtn = document.getElementById('uv-cancel');
    const uvUnwrapBtn = document.getElementById('uv-unwrap');
    const uvResetAllBtn = document.getElementById('uv-reset-all');
    const uvPackBtn = document.getElementById('uv-pack');
    const uvMirrorHBtn = document.getElementById('uv-mirror-h');
    const uvMirrorVBtn = document.getElementById('uv-mirror-v');
    
    // Value display elements
    const baseValue = document.getElementById('base-value');
    const normalValue = document.getElementById('normal-value');
    const roughnessValue = document.getElementById('roughness-value');
    const displacementValue = document.getElementById('displacement-value');
    const aoValue = document.getElementById('ao-value');
    const metalnessValue = document.getElementById('metalness-value');
    const emissionValue = document.getElementById('emission-value');
    const uvRepeatXValue = document.getElementById('uv-repeat-x-value');
    const uvRepeatYValue = document.getElementById('uv-repeat-y-value');
    const uvOffsetXValue = document.getElementById('uv-offset-x-value');
    const uvOffsetYValue = document.getElementById('uv-offset-y-value');
    const uvRotationValue = document.getElementById('uv-rotation-value');
    const uvScaleValue = document.getElementById('uv-scale-value');
    const aoRadiusValue = document.getElementById('ao-radius-value');
    const seamlessStrengthValue = document.getElementById('seamless-strength-value');
    const uvOverlayOpacityValue = document.getElementById('uv-overlay-opacity-value');
    
    // Download buttons
    const downloadBase = document.getElementById('download-base');
    const downloadNormal = document.getElementById('download-normal');
    const downloadRoughness = document.getElementById('download-roughness');
    const downloadDisplacement = document.getElementById('download-displacement');
    const downloadAO = document.getElementById('download-ao');
    const downloadEmission = document.getElementById('download-emission');
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
    const formatRadios = document.querySelectorAll('input[name="format"]');
    
    // Processing indicator
    const processingIndicator = document.getElementById('processing-indicator');
    const progressBar = document.getElementById('progress-bar');
    const processingMessage = document.getElementById('processing-message');
    
    // Notification container
    const notificationContainer = document.getElementById('notification-container');
    
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
            
            // Initialize UV Editor when needed
            setupControlsTabs();
            
            // Set up model tabs
            setupModelTabs();
            
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
                            
                            // Initialize UV Editor if navigating to UV editor page
                            if (targetPage === 'uv-editor' && !uvRenderer) {
                                initUVEditor();
                            }
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
    
    // Set up controls tabs
    function setupControlsTabs() {
        controlsTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                // Remove active class from all tabs
                controlsTabs.forEach(t => t.classList.remove('active'));
                
                // Add active class to clicked tab
                tab.classList.add('active');
                
                // Get target panel
                const targetControls = tab.dataset.controls;
                
                // Hide all panels and show the target
                controlsPanels.forEach(panel => {
                    if (panel.id === `${targetControls}-controls`) {
                        panel.classList.add('active');
                    } else {
                        panel.classList.remove('active');
                    }
                });
            });
        });
    }
    
    // Set up model tabs
    function setupModelTabs() {
        modelTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                // Remove active class from all tabs
                modelTabs.forEach(t => t.classList.remove('active'));
                
                // Add active class to clicked tab
                tab.classList.add('active');
                
                // Get target model
                const modelType = tab.dataset.model;
                currentModelType = modelType;
                
                // Create the selected model
                createModel(modelType);
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
    
        // Create initial sphere model
        createModel('sphere');
        
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
    
    // Initialize the UV Editor
    function initUVEditor() {
        if (!uvCanvas) return;
        
        // Set up canvas
        uvContext = uvCanvas.getContext('2d');
        
        // Adjust canvas size
        resizeUVCanvas();
        
        // Create UV preview scene
        uvPreviewScene = new THREE.Scene();
        uvPreviewScene.background = new THREE.Color(0x0d1117);
        
        // Create camera
        uvPreviewCamera = new THREE.PerspectiveCamera(75, uvModelContainer.clientWidth / uvModelContainer.clientHeight, 0.1, 1000);
        uvPreviewCamera.position.z = 2;
        
        // Create renderer
        uvPreviewRenderer = new THREE.WebGLRenderer({ 
            antialias: true 
        });
        uvPreviewRenderer.setSize(uvModelContainer.clientWidth, uvModelContainer.clientHeight);
        uvPreviewRenderer.setPixelRatio(window.devicePixelRatio);
        
        // Append renderer to container
        uvModelContainer.appendChild(uvPreviewRenderer.domElement);
        
        // Add lighting
        const uvLight = new THREE.DirectionalLight(0xffffff, 1);
        uvLight.position.set(1, 1, 1);
        uvPreviewScene.add(uvLight);
        
        const uvAmbient = new THREE.AmbientLight(0xffffff, 0.5);
        uvPreviewScene.add(uvAmbient);
        
        // Create preview model (same as current model)
        createUVPreviewModel();
        
        // Start UV preview animation
        animateUVPreview();
        
        // Draw initial UV layout
        drawUVGrid();
        
        // Set up UV editor event listeners
        setupUVEditorEvents();
    }
    
    // Resize UV canvas to fit container
    function resizeUVCanvas() {
        const container = uvCanvas.parentElement;
        uvCanvas.width = container.clientWidth;
        uvCanvas.height = container.clientHeight;
    }
    
    // Create UV preview model
    function createUVPreviewModel() {
        // Remove existing model if present
        if (uvPreviewModel) {
            uvPreviewScene.remove(uvPreviewModel);
        }
        
        let geometry;
        
        // Create geometry based on current model type
        switch (currentModelType) {
            case 'cube':
                geometry = new THREE.BoxGeometry(1, 1, 1, 10, 10, 10);
                break;
            case 'plane':
                geometry = new THREE.PlaneGeometry(1.5, 1.5, 10, 10);
                break;
            case 'cylinder':
                geometry = new THREE.CylinderGeometry(0.7, 0.7, 1.5, 32, 10);
                break;
            case 'sphere':
            default:
                geometry = new THREE.SphereGeometry(1, 32, 32);
                break;
        }
        
        // Create material
        const material = new THREE.MeshStandardMaterial({
            color: 0xffffff,
            roughness: 0.5,
            metalness: 0.1
        });
        
        // Apply textures if available
        if (baseTexture) material.map = baseTexture;
        if (normalTexture) material.normalMap = normalTexture;
        if (roughnessTexture) material.roughnessMap = roughnessTexture;
        if (displacementTexture) material.displacementMap = displacementTexture;
        if (aoTexture) material.aoMap = aoTexture;
        if (emissionTexture) material.emissiveMap = emissionTexture;
        
        // Set up UV2 for ambient occlusion
        geometry.setAttribute('uv2', geometry.attributes.uv);
        
        // Create mesh
        uvPreviewModel = new THREE.Mesh(geometry, material);
        uvPreviewScene.add(uvPreviewModel);
        
        // Extract UV islands for editor
        extractUVIslands(geometry);
    }
    
    // Extract UV islands from geometry
    function extractUVIslands(geometry) {
        const positions = geometry.attributes.position.array;
        const uvs = geometry.attributes.uv.array;
        const indices = geometry.index ? geometry.index.array : null;
        
        uvIslands = [];
        
        // If we have indexed geometry
        if (indices) {
            // Process by faces (triangles)
            for (let i = 0; i < indices.length; i += 3) {
                const face = [indices[i], indices[i+1], indices[i+2]];
                const faceUVs = face.map(idx => {
                    return {
                        x: uvs[idx * 2],
                        y: uvs[idx * 2 + 1]
                    };
                });
                
                uvIslands.push({
                    id: i / 3,
                    uvs: faceUVs,
                    selected: false
                });
            }
        } else {
            // Non-indexed geometry, process by vertex trios
            for (let i = 0; i < positions.length; i += 9) {
                const faceUVs = [
                    { x: uvs[i/3 * 2], y: uvs[i/3 * 2 + 1] },
                    { x: uvs[(i/3 + 1) * 2], y: uvs[(i/3 + 1) * 2 + 1] },
                    { x: uvs[(i/3 + 2) * 2], y: uvs[(i/3 + 2) * 2 + 1] }
                ];
                
                uvIslands.push({
                    id: i / 9,
                    uvs: faceUVs,
                    selected: false
                });
            }
        }
        
        // Draw the UV islands
        drawUVIslands();
    }
    
    // Draw UV grid
    function drawUVGrid() {
        if (!uvContext) return;
        
        const width = uvCanvas.width;
        const height = uvCanvas.height;
        
        // Clear canvas
        uvContext.clearRect(0, 0, width, height);
        
        // Scale factor (UV space is 0-1)
        const scale = Math.min(width, height) * 0.8 * uvZoom;
        
        // Center offset
        const offsetX = width / 2 + uvPan.x;
        const offsetY = height / 2 + uvPan.y;
        
        // Draw background
        uvContext.fillStyle = '#161b22';
        uvContext.fillRect(0, 0, width, height);
        
        // Check if grid should be shown
        if (uvShowGrid && uvShowGrid.checked) {
            // Draw UV space border (0-1 square)
            uvContext.strokeStyle = '#30363d';
            uvContext.lineWidth = 2;
            uvContext.strokeRect(
                offsetX - scale / 2, 
                offsetY - scale / 2, 
                scale, 
                scale
            );
            
            // Draw grid lines
            uvContext.strokeStyle = '#21262d';
            uvContext.lineWidth = 1;
            
            // Horizontal lines
            for (let i = 0; i <= 10; i++) {
                const y = offsetY - scale / 2 + (i / 10) * scale;
                uvContext.beginPath();
                uvContext.moveTo(offsetX - scale / 2, y);
                uvContext.lineTo(offsetX + scale / 2, y);
                uvContext.stroke();
            }
            
            // Vertical lines
            for (let i = 0; i <= 10; i++) {
                const x = offsetX - scale / 2 + (i / 10) * scale;
                uvContext.beginPath();
                uvContext.moveTo(x, offsetY - scale / 2);
                uvContext.lineTo(x, offsetY + scale / 2);
                uvContext.stroke();
            }
        }
        
        // Draw checkerboard pattern
        if (uvShowCheckerboard && uvShowCheckerboard.checked) {
            const checkSize = scale / 10;
            uvContext.fillStyle = '#252525';
            
            for (let i = 0; i < 10; i++) {
                for (let j = 0; j < 10; j++) {
                    if ((i + j) % 2 === 0) {
                        uvContext.fillRect(
                            offsetX - scale / 2 + i * checkSize,
                            offsetY - scale / 2 + j * checkSize,
                            checkSize,
                            checkSize
                        );
                    }
                }
            }
        }
        
        // Draw texture overlay
        if (uvShowTexture && uvShowTexture.checked && baseTexture && baseTexture.image) {
            const opacity = uvOverlayOpacity ? parseFloat(uvOverlayOpacity.value) : 0.7;
            uvContext.globalAlpha = opacity;
            
            // Draw the texture in the UV space
            uvContext.drawImage(
                baseTexture.image,
                offsetX - scale / 2,
                offsetY - scale / 2,
                scale,
                scale
            );
            
            uvContext.globalAlpha = 1.0;
        }
    }
    
    // Draw UV islands
    function drawUVIslands() {
        if (!uvContext || !uvIslands) return;
        
        const width = uvCanvas.width;
        const height = uvCanvas.height;
        
        // Scale factor for UV coordinates (0-1 range)
        const scale = Math.min(width, height) * 0.8 * uvZoom;
        
        // Center offset
        const offsetX = width / 2 + uvPan.x;
        const offsetY = height / 2 + uvPan.y;
        
        // Draw each island
        uvIslands.forEach(island => {
            // Convert UV coordinates to canvas coordinates
            const canvasCoords = island.uvs.map(uv => {
                return {
                    x: offsetX + (uv.x - 0.5) * scale,
                    y: offsetY + (uv.y - 0.5) * scale
                };
            });
            
            // Draw the triangle
            uvContext.beginPath();
            uvContext.moveTo(canvasCoords[0].x, canvasCoords[0].y);
            uvContext.lineTo(canvasCoords[1].x, canvasCoords[1].y);
            uvContext.lineTo(canvasCoords[2].x, canvasCoords[2].y);
            uvContext.closePath();
            
            // Fill style depends on selection state
            if (island.selected) {
                uvContext.fillStyle = 'rgba(60, 158, 255, 0.3)';
                uvContext.strokeStyle = '#3c9eff';
                uvContext.lineWidth = 2;
            } else {
                uvContext.fillStyle = 'rgba(255, 255, 255, 0.1)';
                uvContext.strokeStyle = '#8b949e';
                uvContext.lineWidth = 1;
            }
            
            uvContext.fill();
            uvContext.stroke();
        });
        
        // Draw seams if enabled
        if (uvShowSeams && uvShowSeams.checked) {
            // For simplicity, we'll just highlight all edges
            uvContext.strokeStyle = '#f85149';
            uvContext.lineWidth = 2;
            
            uvIslands.forEach(island => {
                const canvasCoords = island.uvs.map(uv => {
                    return {
                        x: offsetX + (uv.x - 0.5) * scale,
                        y: offsetY + (uv.y - 0.5) * scale
                    };
                });
                
                uvContext.beginPath();
                uvContext.moveTo(canvasCoords[0].x, canvasCoords[0].y);
                uvContext.lineTo(canvasCoords[1].x, canvasCoords[1].y);
                uvContext.lineTo(canvasCoords[2].x, canvasCoords[2].y);
                uvContext.closePath();
                uvContext.stroke();
            });
        }
    }
    
    // Set up UV editor events
    function setupUVEditorEvents() {
        // Tool selection
        uvTools.forEach(tool => {
            tool.addEventListener('click', (e) => {
                uvTools.forEach(t => t.classList.remove('active'));
                tool.classList.add('active');
                uvActiveTool = tool.id.replace('uv-', '');
            });
        });
        
        // Zoom controls
        if (uvZoomIn) {
            uvZoomIn.addEventListener('click', () => {
                uvZoom = Math.min(uvZoom * 1.2, 5);
                drawUVGrid();
                drawUVIslands();
            });
        }
        
        if (uvZoomOut) {
            uvZoomOut.addEventListener('click', () => {
                uvZoom = Math.max(uvZoom / 1.2, 0.2);
                drawUVGrid();
                drawUVIslands();
            });
        }
        
        if (uvReset) {
            uvReset.addEventListener('click', () => {
                uvZoom = 1;
                uvPan = { x: 0, y: 0 };
                drawUVGrid();
                drawUVIslands();
            });
        }
        
        // Canvas interactions
        if (uvCanvas) {
            uvCanvas.addEventListener('mousedown', (e) => {
                const rect = uvCanvas.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                
                isDragging = true;
                dragStart = { x, y };
                
                if (uvActiveTool === 'select') {
                    selectUVIslandAtPoint(x, y);
                }
            });
            
            uvCanvas.addEventListener('mousemove', (e) => {
                if (!isDragging) return;
                
                const rect = uvCanvas.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                
                const deltaX = x - dragStart.x;
                const deltaY = y - dragStart.y;
                
                if (uvActiveTool === 'pan') {
                    uvPan.x += deltaX;
                    uvPan.y += deltaY;
                    dragStart = { x, y };
                    drawUVGrid();
                    drawUVIslands();
                } else if (uvActiveTool === 'move' && selectedIslands.length > 0) {
                    // Convert screen movement to UV space movement
                    const scale = Math.min(uvCanvas.width, uvCanvas.height) * 0.8 * uvZoom;
                    const uvDeltaX = deltaX / scale;
                    const uvDeltaY = deltaY / scale;
                    
                    // Move selected islands
                    selectedIslands.forEach(islandId => {
                        const island = uvIslands.find(i => i.id === islandId);
                        if (island) {
                            island.uvs.forEach(uv => {
                                uv.x += uvDeltaX;
                                uv.y += uvDeltaY;
                            });
                        }
                    });
                    
                    dragStart = { x, y };
                    drawUVGrid();
                    drawUVIslands();
                    
                    // Update the position inputs
                    updateUVTransformInputs();
                }
            });
            
            window.addEventListener('mouseup', () => {
                isDragging = false;
            });
            
            // Update display when options change
            if (uvShowGrid) {
                uvShowGrid.addEventListener('change', () => {
                    drawUVGrid();
                    drawUVIslands();
                });
            }
            
            if (uvShowCheckerboard) {
                uvShowCheckerboard.addEventListener('change', () => {
                    drawUVGrid();
                    drawUVIslands();
                });
            }
            
            if (uvShowTexture) {
                uvShowTexture.addEventListener('change', () => {
                    drawUVGrid();
                    drawUVIslands();
                });
            }
            
            if (uvShowSeams) {
                uvShowSeams.addEventListener('change', () => {
                    drawUVGrid();
                    drawUVIslands();
                });
            }
            
            if (uvOverlayOpacity) {
                uvOverlayOpacity.addEventListener('input', () => {
                    if (uvOverlayOpacityValue) {
                        uvOverlayOpacityValue.textContent = parseFloat(uvOverlayOpacity.value).toFixed(1);
                    }
                    drawUVGrid();
                    drawUVIslands();
                });
            }
        }
        
        // UV transformation inputs
        const transformInputs = [uvEditPosX, uvEditPosY, uvEditRotation, uvEditScaleX, uvEditScaleY];
        
        transformInputs.forEach(input => {
            if (input) {
                input.addEventListener('change', () => {
                    applyUVTransformation();
                });
            }
        });
        
        // UV operations buttons
        if (uvUnwrapBtn) {
            uvUnwrapBtn.addEventListener('click', unwrapUVs);
        }
        
        if (uvResetAllBtn) {
            uvResetAllBtn.addEventListener('click', resetAllUVs);
        }
        
        if (uvPackBtn) {
            uvPackBtn.addEventListener('click', packUVIslands);
        }
        
        if (uvMirrorHBtn) {
            uvMirrorHBtn.addEventListener('click', () => mirrorUVIslands('horizontal'));
        }
        
        if (uvMirrorVBtn) {
            uvMirrorVBtn.addEventListener('click', () => mirrorUVIslands('vertical'));
        }
        
        // Apply and cancel buttons
        if (uvApplyBtn) {
            uvApplyBtn.addEventListener('click', applyUVChanges);
        }
        
        if (uvCancelBtn) {
            uvCancelBtn.addEventListener('click', cancelUVChanges);
        }
    }
    
    // Select UV island at point
    function selectUVIslandAtPoint(x, y) {
        const width = uvCanvas.width;
        const height = uvCanvas.height;
        
        // Scale factor for UV coordinates
        const scale = Math.min(width, height) * 0.8 * uvZoom;
        
        // Center offset
        const offsetX = width / 2 + uvPan.x;
        const offsetY = height / 2 + uvPan.y;
        
        // Convert canvas coordinates to UV space
        const uvX = ((x - offsetX) / scale) + 0.5;
        const uvY = ((y - offsetY) / scale) + 0.5;
        
        // Check each island for containment
        let foundIsland = false;
        
        for (let i = 0; i < uvIslands.length; i++) {
            const island = uvIslands[i];
            
            if (pointInTriangle(
                uvX, uvY,
                island.uvs[0].x, island.uvs[0].y,
                island.uvs[1].x, island.uvs[1].y,
                island.uvs[2].x, island.uvs[2].y
            )) {
                // Toggle selection state
                island.selected = !island.selected;
                
                // Update selected islands array
                if (island.selected) {
                    selectedIslands.push(island.id);
                } else {
                    const index = selectedIslands.indexOf(island.id);
                    if (index > -1) {
                        selectedIslands.splice(index, 1);
                    }
                }
                
                foundIsland = true;
                break;
            }
        }
        
        // If clicked on empty space, clear selection
        if (!foundIsland) {
            uvIslands.forEach(island => island.selected = false);
            selectedIslands = [];
        }
        
        // Update displays
        drawUVGrid();
        drawUVIslands();
        updateUVTransformInputs();
    }
    
    // Helper: point in triangle test
    function pointInTriangle(px, py, x1, y1, x2, y2, x3, y3) {
        // Compute barycentric coordinates
        const d1 = (px - x3) * (y2 - y3) - (x2 - x3) * (py - y3);
        const d2 = (px - x1) * (y3 - y1) - (x3 - x1) * (py - y1);
        const d3 = (px - x2) * (y1 - y2) - (x1 - x2) * (py - y2);
        
        const has_neg = (d1 < 0) || (d2 < 0) || (d3 < 0);
        const has_pos = (d1 > 0) || (d2 > 0) || (d3 > 0);
        
        return !(has_neg && has_pos);
    }
    
    // Update UV transform inputs based on selection
    function updateUVTransformInputs() {
        if (selectedIslands.length === 0) {
            // No selection, reset inputs
            if (uvEditPosX) uvEditPosX.value = "0";
            if (uvEditPosY) uvEditPosY.value = "0";
            if (uvEditRotation) uvEditRotation.value = "0";
            if (uvEditScaleX) uvEditScaleX.value = "1";
            if (uvEditScaleY) uvEditScaleY.value = "1";
            return;
        }
        
        // Get first selected island for reference
        const firstIsland = uvIslands.find(i => i.id === selectedIslands[0]);
        if (!firstIsland) return;
        
        // Calculate center point of the first island
        const center = {
            x: (firstIsland.uvs[0].x + firstIsland.uvs[1].x + firstIsland.uvs[2].x) / 3,
            y: (firstIsland.uvs[0].y + firstIsland.uvs[1].y + firstIsland.uvs[2].y) / 3
        };
        
        // For simplicity, we're just setting position as the center point
        // In a real UV editor, you'd have more complex transformations
        if (uvEditPosX) uvEditPosX.value = center.x.toFixed(2);
        if (uvEditPosY) uvEditPosY.value = center.y.toFixed(2);
        
        // Rotation and scale are placeholders - would require more complex calculations
        if (uvEditRotation) uvEditRotation.value = "0";
        if (uvEditScaleX) uvEditScaleX.value = "1";
        if (uvEditScaleY) uvEditScaleY.value = "1";
    }
    
    // Apply UV transformations from inputs
    function applyUVTransformation() {
        if (selectedIslands.length === 0) return;
        
        // Get values from inputs
        const posX = parseFloat(uvEditPosX.value) || 0;
        const posY = parseFloat(uvEditPosY.value) || 0;
        const rotation = parseFloat(uvEditRotation.value) || 0;
        const scaleX = parseFloat(uvEditScaleX.value) || 1;
        const scaleY = parseFloat(uvEditScaleY.value) || 1;
        
        // Apply to all selected islands
        selectedIslands.forEach(islandId => {
            const island = uvIslands.find(i => i.id === islandId);
            if (!island) return;
            
            // Calculate center of island
            const center = {
                x: (island.uvs[0].x + island.uvs[1].x + island.uvs[2].x) / 3,
                y: (island.uvs[0].y + island.uvs[1].y + island.uvs[2].y) / 3
            };
            
            // Apply transformations to each UV vertex
            island.uvs.forEach(uv => {
                // Translate to origin
                let x = uv.x - center.x;
                let y = uv.y - center.y;
                
                // Scale
                x *= scaleX;
                y *= scaleY;
                
                // Rotate (convert degrees to radians)
                const rad = rotation * Math.PI / 180;
                const cos = Math.cos(rad);
                const sin = Math.sin(rad);
                const nx = x * cos - y * sin;
                const ny = x * sin + y * cos;
                x = nx;
                y = ny;
                
                // Translate to new position
                uv.x = x + posX;
                uv.y = y + posY;
            });
        });
        
        // Update display
        drawUVGrid();
        drawUVIslands();
    }
    
    // UV Operations
    
    // Unwrap UVs - a simple implementation that spreads out islands
    function unwrapUVs() {
        // Simple unwrap - spread islands evenly
        const gridSize = Math.ceil(Math.sqrt(uvIslands.length));
        const cellSize = 1 / gridSize;
        
        uvIslands.forEach((island, index) => {
            const row = Math.floor(index / gridSize);
            const col = index % gridSize;
            
            // Center point for this grid cell
            const centerX = col * cellSize + cellSize / 2;
            const centerY = row * cellSize + cellSize / 2;
            
            // Calculate current center of the island
            const currentCenter = {
                x: (island.uvs[0].x + island.uvs[1].x + island.uvs[2].x) / 3,
                y: (island.uvs[0].y + island.uvs[1].y + island.uvs[2].y) / 3
            };
            
            // Move island to new position
            const deltaX = centerX - currentCenter.x;
            const deltaY = centerY - currentCenter.y;
            
            island.uvs.forEach(uv => {
                uv.x += deltaX;
                uv.y += deltaY;
            });
        });
        
        // Update display
        drawUVGrid();
        drawUVIslands();
        showNotification('UV islands unwrapped', 'success');
    }
    
    // Reset all UVs to default
    function resetAllUVs() {
        // In a real implementation, you'd restore original UV coordinates
        // For this example, we'll just reset to a simple grid layout
        unwrapUVs();
        
        // Clear selection
        uvIslands.forEach(island => island.selected = false);
        selectedIslands = [];
        
        // Update displays
        drawUVGrid();
        drawUVIslands();
        updateUVTransformInputs();
        
        showNotification('UV islands reset', 'info');
    }
    
    // Pack UV islands to use space efficiently
    function packUVIslands() {
        // Simple packing - shrink and arrange in grid
        const padding = 0.02; // Space between islands
        
        // First, scale down all islands to use less space
        uvIslands.forEach(island => {
            const center = {
                x: (island.uvs[0].x + island.uvs[1].x + island.uvs[2].x) / 3,
                y: (island.uvs[0].y + island.uvs[1].y + island.uvs[2].y) / 3
            };
            
            // Scale down by 30%
            island.uvs.forEach(uv => {
                uv.x = (uv.x - center.x) * 0.7 + center.x;
                uv.y = (uv.y - center.y) * 0.7 + center.y;
            });
        });
        
        // Then arrange them in a grid with the new size
        const gridSize = Math.ceil(Math.sqrt(uvIslands.length));
        const cellSize = (1 - padding * (gridSize + 1)) / gridSize;
        
        uvIslands.forEach((island, index) => {
            const row = Math.floor(index / gridSize);
            const col = index % gridSize;
            
            // Center point for this grid cell with padding
            const centerX = padding + col * (cellSize + padding) + cellSize / 2;
            const centerY = padding + row * (cellSize + padding) + cellSize / 2;
            
            // Calculate current center of the island
            const currentCenter = {
                x: (island.uvs[0].x + island.uvs[1].x + island.uvs[2].x) / 3,
                y: (island.uvs[0].y + island.uvs[1].y + island.uvs[2].y) / 3
            };
            
            // Move island to new position
            const deltaX = centerX - currentCenter.x;
            const deltaY = centerY - currentCenter.y;
            
            island.uvs.forEach(uv => {
                uv.x += deltaX;
                uv.y += deltaY;
            });
        });
        
        // Update display
        drawUVGrid();
        drawUVIslands();
        showNotification('UV islands packed', 'success');
    }
    
    // Mirror UV islands
    function mirrorUVIslands(direction) {
        if (selectedIslands.length === 0) {
            showNotification('Please select UV islands to mirror', 'warning');
            return;
        }
        
        selectedIslands.forEach(islandId => {
            const island = uvIslands.find(i => i.id === islandId);
            if (!island) return;
            
            // Calculate center of island
            const center = {
                x: (island.uvs[0].x + island.uvs[1].x + island.uvs[2].x) / 3,
                y: (island.uvs[0].y + island.uvs[1].y + island.uvs[2].y) / 3
            };
            
            // Apply mirror transformation
            island.uvs.forEach(uv => {
                if (direction === 'horizontal') {
                    uv.x = 2 * center.x - uv.x; // Mirror around vertical line at center.x
                } else if (direction === 'vertical') {
                    uv.y = 2 * center.y - uv.y; // Mirror around horizontal line at center.y
                }
            });
        });
        
        // Update display
        drawUVGrid();
        drawUVIslands();
        showNotification(`UV islands mirrored ${direction}ly`, 'success');
    }
    
    // Apply UV changes (in real implementation, this would update the model's UVs)
    function applyUVChanges() {
        // In a full implementation, you would apply the UV changes to the model
        // For this demo, we'll just show a notification
        showNotification('UV changes applied', 'success');
        
        // Update the 3D model texture
        createModel(currentModelType);
    }
    
    // Cancel UV changes
    function cancelUVChanges() {
        // Reset UVs and clear selection
        resetAllUVs();
        showNotification('UV changes canceled', 'info');
    }
    
    // Animate UV preview
    function animateUVPreview() {
        if (!uvPreviewRenderer || !uvPreviewScene || !uvPreviewCamera) return;
        
        requestAnimationFrame(animateUVPreview);
        
        if (uvPreviewModel) {
            // Gentle rotation for the preview
            uvPreviewModel.rotation.y += 0.01;
        }
        
        uvPreviewRenderer.render(uvPreviewScene, uvPreviewCamera);
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
        
        // Update model material
        if (currentModel && currentModel.material) {
            currentModel.material.envMap = useHDRI ? envMap : null;
            currentModel.material.needsUpdate = true;
        }
    }
    
    // Create or update the 3D model with textures
    function createModel(modelType) {
        // Remove existing model if it exists
        if (currentModel) {
            scene.remove(currentModel);
        }
        
        // Create geometry based on model type
        let geometry;
        
        switch (modelType) {
            case 'cube':
                geometry = new THREE.BoxGeometry(1.5, 1.5, 1.5, 64, 64, 64);
                break;
            case 'plane':
                geometry = new THREE.PlaneGeometry(2, 2, 64, 64);
                break;
            case 'cylinder':
                geometry = new THREE.CylinderGeometry(0.8, 0.8, 2, 64, 64);
                break;
            case 'sphere':
            default:
                geometry = new THREE.SphereGeometry(1, 64, 64);
                break;
        }
        
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
    
        // Apply textures
        material.map = baseTexture;
        material.normalMap = normalTexture;
        material.roughnessMap = roughnessTexture;
        material.displacementMap = displacementTexture;
        material.aoMap = aoTexture;
        material.emissiveMap = emissionTexture;
        
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
        
        // Apply UV modifications
        const repeatX = parseInt(uvRepeatX.value) || 1;
        const repeatY = parseInt(uvRepeatY.value) || 1;
        const offsetX = parseFloat(uvOffsetX.value) || 0;
        const offsetY = parseFloat(uvOffsetY.value) || 0;
        const rotation = parseFloat(uvRotation.value) || 0;
        const scale = parseFloat(uvScale.value) || 1;
        
        if (material.map) {
            material.map.wrapS = material.map.wrapT = THREE.RepeatWrapping;
            material.map.repeat.set(repeatX, repeatY);
            material.map.offset.set(offsetX, offsetY);
            material.map.rotation = rotation * Math.PI / 180; // Convert degrees to radians
            material.map.center.set(0.5, 0.5); // Set rotation center
        }
        
        // Apply to all other maps
        const maps = [
            'normalMap', 'roughnessMap', 'displacementMap', 
            'aoMap', 'emissiveMap'
        ];
        
        maps.forEach(mapName => {
            if (material[mapName]) {
                material[mapName].wrapS = material[mapName].wrapT = THREE.RepeatWrapping;
                material[mapName].repeat.set(repeatX, repeatY);
                material[mapName].offset.set(offsetX, offsetY);
                material[mapName].rotation = rotation * Math.PI / 180;
                material[mapName].center.set(0.5, 0.5); // Set rotation center
            }
        });
    
        // Ensure material knows it needs updating
        material.needsUpdate = true;
    
        // Create mesh
        currentModel = new THREE.Mesh(geometry, material);
        
        // Set up UV2 coordinates for AO map
        geometry.setAttribute('uv2', geometry.attributes.uv);
        
        scene.add(currentModel);
        
        // Apply HDRI if enabled
        if (useHDRI) {
            toggleHDRILighting(true);
        }
    }
    
    // Animation loop
    function animate() {
        animationFrameId = requestAnimationFrame(animate);
        
        // Add automatic or manual rotation to the model
        if (currentModel) {
            if (autoRotate) {
                currentModel.rotation.y += rotationSpeed.y;
                currentModel.rotation.x += rotationSpeed.x;
                
                // Update sliders to match current rotation
                if (!isDraggingSlider) {
                    rotationX.value = ((currentModel.rotation.x % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2) - Math.PI;
                    rotationY.value = ((currentModel.rotation.y % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2) - Math.PI;
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
        
        // Resize UV canvas if active
        if (uvCanvas && uvContext) {
            resizeUVCanvas();
            drawUVGrid();
            drawUVIslands();
        }
        
        // Resize UV preview if active
        if (uvPreviewCamera && uvPreviewRenderer && uvModelContainer) {
            uvPreviewCamera.aspect = uvModelContainer.clientWidth / uvModelContainer.clientHeight;
            uvPreviewCamera.updateProjectionMatrix();
            uvPreviewRenderer.setSize(uvModelContainer.clientWidth, uvModelContainer.clientHeight);
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
        
        // Texture Sliders
        baseStrength.addEventListener('input', updateTextures);
        normalStrength.addEventListener('input', updateTextures);
        roughnessStrength.addEventListener('input', updateTextures);
        displacementStrength.addEventListener('input', updateTextures);
        aoStrength.addEventListener('input', updateTextures);
        metalness.addEventListener('input', updateMaterial);
        emissionStrength.addEventListener('input', updateMaterial);
        
        // UV Projection controls
        uvRepeatX.addEventListener('input', updateUVProjection);
        uvRepeatY.addEventListener('input', updateUVProjection);
        uvOffsetX.addEventListener('input', updateUVProjection);
        uvOffsetY.addEventListener('input', updateUVProjection);
        uvRotation.addEventListener('input', updateUVProjection);
        uvScale.addEventListener('input', updateUVProjection);
        
        // AO Radius
        if (aoRadius) {
            aoRadius.addEventListener('input', () => {
                if (aoRadiusValue) {
                    aoRadiusValue.textContent = aoRadius.value;
                }
                
                // Regenerate AO map with new radius
                if (originalImageData) {
                    generateAOMap(originalImageData);
                    createModel(currentModelType);
                }
            });
        }
        
        // Seamless controls
        if (makeSeamlessBtn) {
            makeSeamlessBtn.addEventListener('click', toggleSeamlessPanel);
        }
        
        if (seamlessStrength) {
            seamlessStrength.addEventListener('input', () => {
                if (seamlessStrengthValue) {
                    seamlessStrengthValue.textContent = parseFloat(seamlessStrength.value).toFixed(2);
                }
            });
        }
        
        if (applySeamlessBtn) {
            applySeamlessBtn.addEventListener('click', applySeamlessTexture);
        }
        
        if (cancelSeamlessBtn) {
            cancelSeamlessBtn.addEventListener('click', toggleSeamlessPanel);
        }
        
        // Normal algorithm selection
        if (normalAlgorithmSelect) {
            normalAlgorithmSelect.addEventListener('change', () => {
                // Regenerate normal map with new algorithm
                if (originalImageData) {
                    generateNormalMap(originalImageData);
                    createModel(currentModelType);
                }
            });
        }
        
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
    
    // Toggle seamless panel visibility
    function toggleSeamlessPanel() {
        if (seamlessPanel) {
            if (seamlessPanel.classList.contains('active')) {
                seamlessPanel.classList.remove('active');
                seamlessPanel.style.display = 'none';
            } else {
                seamlessPanel.classList.add('active');
                seamlessPanel.style.display = 'block';
            }
        }
    }
    
    // Apply seamless texture transformation
    function applySeamlessTexture() {
        if (!originalImageData) {
            showNotification('Please upload a texture first', 'error');
            return;
        }
        
        showLoadingIndicator('Creating seamless texture...', 20);
        
        setTimeout(() => {
            const method = seamlessMethod.value;
            const strength = parseFloat(seamlessStrength.value);
            
            // Create seamless version
            seamlessImageData = createSeamlessTexture(originalImageData, method, strength);
            
            // Use the seamless image for all textures
            updateProgress(60);
            updateLoadingMessage('Applying seamless texture...');
            
            // Create a temporary image to process
            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = seamlessImageData.width;
            tempCanvas.height = seamlessImageData.height;
            const tempCtx = tempCanvas.getContext('2d');
            tempCtx.putImageData(seamlessImageData, 0, 0);
            
            // Convert to image for processing
            const img = new Image();
            img.onload = function() {
                // Generate texture maps with the seamless image
                generateBaseMap(img, true);
                generateNormalMap(seamlessImageData);
                generateRoughnessMap(seamlessImageData);
                generateDisplacementMap(seamlessImageData);
                generateAOMap(seamlessImageData);
                generateEmissionMap(seamlessImageData);
                
                // Update model
                createModel(currentModelType);
                
                // Hide seamless panel
                toggleSeamlessPanel();
                
                updateProgress(100);
                hideLoadingIndicator();
                showNotification('Seamless texture applied successfully!', 'success');
            };
            img.src = tempCanvas.toDataURL();
            
        }, 500);
    }
    
    // Create seamless texture from image data
    function createSeamlessTexture(imageData, method, strength) {
        const width = imageData.width;
        const height = imageData.height;
        
        // Create output canvas
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        
        // Draw original image
        ctx.putImageData(imageData, 0, 0);
        
        // Get the blending pixels size based on strength
        const blendSize = Math.max(10, Math.floor(Math.min(width, height) * strength * 0.2));
        
        // Apply different methods
        switch (method) {
            case 'mirror':
                // Mirror edges method
                ctx.save();
                
                // Mirror left edge to right
                ctx.translate(width, 0);
                ctx.scale(-1, 1);
                ctx.drawImage(canvas, 0, 0, blendSize, height, 0, 0, blendSize, height);
                ctx.restore();
                
                ctx.save();
                // Mirror right edge to left
                ctx.drawImage(canvas, width - blendSize, 0, blendSize, height, 0, 0, blendSize, height);
                ctx.restore();
                
                ctx.save();
                // Mirror top edge to bottom
                ctx.translate(0, height);
                ctx.scale(1, -1);
                ctx.drawImage(canvas, 0, 0, width, blendSize, 0, 0, width, blendSize);
                ctx.restore();
                
                ctx.save();
                // Mirror bottom edge to top
                ctx.drawImage(canvas, 0, height - blendSize, width, blendSize, 0, 0, width, blendSize);
                ctx.restore();
                break;
                
            case 'wrap':
                // Wrap around method
                ctx.save();
                // Wrap right to left
                ctx.drawImage(canvas, width - blendSize, 0, blendSize, height, 0, 0, blendSize, height);
                // Wrap left to right
                ctx.drawImage(canvas, 0, 0, blendSize, height, width - blendSize, 0, blendSize, height);
                // Wrap bottom to top
                ctx.drawImage(canvas, 0, height - blendSize, width, blendSize, 0, 0, width, blendSize);
                // Wrap top to bottom
                ctx.drawImage(canvas, 0, 0, width, blendSize, 0, height - blendSize, width, blendSize);
                ctx.restore();
                break;
                
            case 'blend':
            default:
                // Edge blend method - use gradient alpha blending
                ctx.save();
                
                // Create gradients for blending
                const leftGradient = ctx.createLinearGradient(0, 0, blendSize, 0);
                leftGradient.addColorStop(0, 'rgba(0,0,0,1)');
                leftGradient.addColorStop(1, 'rgba(0,0,0,0)');
                
                const rightGradient = ctx.createLinearGradient(width - blendSize, 0, width, 0);
                rightGradient.addColorStop(0, 'rgba(0,0,0,0)');
                rightGradient.addColorStop(1, 'rgba(0,0,0,1)');
                
                const topGradient = ctx.createLinearGradient(0, 0, 0, blendSize);
                topGradient.addColorStop(0, 'rgba(0,0,0,1)');
                topGradient.addColorStop(1, 'rgba(0,0,0,0)');
                
                const bottomGradient = ctx.createLinearGradient(0, height - blendSize, 0, height);
                bottomGradient.addColorStop(0, 'rgba(0,0,0,0)');
                bottomGradient.addColorStop(1, 'rgba(0,0,0,1)');
                
                // Blend left and right edges
                ctx.globalCompositeOperation = 'destination-out';
                
                ctx.fillStyle = leftGradient;
                ctx.fillRect(0, 0, blendSize, height);
                
                ctx.fillStyle = rightGradient;
                ctx.fillRect(width - blendSize, 0, blendSize, height);
                
                // Blend top and bottom edges
                ctx.fillStyle = topGradient;
                ctx.fillRect(0, 0, width, blendSize);
                
                ctx.fillStyle = bottomGradient;
                ctx.fillRect(0, height - blendSize, width, blendSize);
                
                // Now copy from opposite sides with normal blending
                ctx.globalCompositeOperation = 'source-over';
                
                // Copy right edge to left with opacity
                ctx.drawImage(canvas, width - blendSize * 2, 0, blendSize * 2, height, -blendSize, 0, blendSize * 2, height);
                
                // Copy left edge to right with opacity
                ctx.drawImage(canvas, 0, 0, blendSize * 2, height, width - blendSize, 0, blendSize * 2, height);
                
                // Copy bottom edge to top with opacity
                ctx.drawImage(canvas, 0, height - blendSize * 2, width, blendSize * 2, 0, -blendSize, width, blendSize * 2);
                
                // Copy top edge to bottom with opacity
                ctx.drawImage(
