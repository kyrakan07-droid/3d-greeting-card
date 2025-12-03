// 全局变量
let scene, camera, renderer, controls;
let cardGroup, isCardOpen = false;
let startTime = Date.now();

// 初始化Three.js场景
function init() {
    // 创建场景
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87CEEB);
    
    // 创建相机
    camera = new THREE.PerspectiveCamera(
        45,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    );
    camera.position.set(0, 5, 15);
    
    // 创建渲染器
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    
    const container = document.getElementById('canvas-container');
    container.appendChild(renderer.domElement);
    
    // 添加光源
    addLights();
    
    // 创建贺卡
    createGreetingCard();
    
    // 添加场景装饰
    addDecorations();
    
    // 添加轨道控制器（允许鼠标拖动查看）
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 5;
    controls.maxDistance = 50;
    
    // 监听窗口大小变化
    window.addEventListener('resize', onWindowResize);
    
    // 生成二维码
    generateQRCode();
    
    // 隐藏加载界面
    setTimeout(() => {
        document.getElementById('loading-screen').style.display = 'none';
    }, 1000);
}

// 添加光源
function addLights() {
    // 环境光
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    
    // 平行光（模拟太阳）
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(10, 20, 5);
    directionalLight.castShadow = true;
    directionalLight.shadow.camera.left = -20;
    directionalLight.shadow.camera.right = 20;
    directionalLight.shadow.camera.top = 20;
    directionalLight.shadow.camera.bottom = -20;
    scene.add(directionalLight);
    
    // 点光源（增加氛围）
    const pointLight = new THREE.PointLight(0xff6b6b, 1, 50);
    pointLight.position.set(5, 10, 5);
    scene.add(pointLight);
}

// 创建3D贺卡
function createGreetingCard() {
    cardGroup = new THREE.Group();
    
    // 贺卡底部
    const cardGeometry = new THREE.BoxGeometry(6, 4, 0.2);
    const cardMaterial = new THREE.MeshPhongMaterial({ 
        color: 0xFFD700,
        shininess: 100
    });
    const cardBase = new THREE.Mesh(cardGeometry, cardMaterial);
    cardBase.castShadow = true;
    cardBase.receiveShadow = true;
    cardBase.position.y = 2;
    
    // 贺卡封面（可以打开的部分）
    const coverGeometry = new THREE.BoxGeometry(6, 4, 0.1);
    const coverMaterial = new THREE.MeshPhongMaterial({ 
        color: 0xFF6B6B,
        shininess: 100
    });
    const cardCover = new THREE.Mesh(coverGeometry, coverMaterial);
    cardCover.castShadow = true;
    cardCover.receiveShadow = true;
    cardCover.position.set(0, 2, 0.15);
    
    // 封面上的文字
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 256;
    const context = canvas.getContext('2d');
    
    context.fillStyle = '#FFFFFF';
    context.fillRect(0, 0, canvas.width, canvas.height);
    
    context.font = 'bold 60px "Microsoft YaHei"';
    context.fillStyle = '#FF6B6B';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText('节日快乐', canvas.width/2, canvas.height/2);
    
    const texture = new THREE.CanvasTexture(canvas);
    const textMaterial = new THREE.MeshBasicMaterial({ map: texture });
    const textGeometry = new THREE.PlaneGeometry(4, 2);
    const textMesh = new THREE.Mesh(textGeometry, textMaterial);
    textMesh.position.set(0, 2, 0.16);
    
    // 内部祝福语
    const innerCanvas = document.createElement('canvas');
    innerCanvas.width = 512;
    innerCanvas.height = 512;
    const innerContext = innerCanvas.getContext('2d');
    
    innerContext.fillStyle = '#FFFFFF';
    innerContext.fillRect(0, 0, innerCanvas.width, innerCanvas.height);
    
    innerContext.font = 'bold 40px "Microsoft YaHei"';
    innerContext.fillStyle = '#333333';
    innerContext.textAlign = 'center';
    innerContext.textBaseline = 'middle';
    
    const message = [
        '亲爱的朋友：',
        '',
        '愿你三冬暖，愿你春不寒',
        '愿你天黑有灯，下雨有伞',
        '愿你一路上，有良人相伴',
        '',
        '节日快乐！',
        '',
        '❤️ ❤️ ❤️'
    ];
    
    message.forEach((line, index) => {
        innerContext.fillText(line, innerCanvas.width/2, 100 + index * 50);
    });
    
    const innerTexture = new THREE.CanvasTexture(innerCanvas);
    const innerMaterial = new THREE.MeshBasicMaterial({ map: innerTexture });
    const innerGeometry = new THREE.PlaneGeometry(5, 5);
    const innerMesh = new THREE.Mesh(innerGeometry, innerMaterial);
    innerMesh.position.set(0, 2, -0.05);
    innerMesh.rotation.y = Math.PI;
    
    // 将所有部分添加到卡片组
    cardGroup.add(cardBase);
    cardGroup.add(cardCover);
    cardGroup.add(textMesh);
    cardGroup.add(innerMesh);
    
    // 将卡片组添加到场景
    scene.add(cardGroup);
    
    // 添加点击事件到封面
    cardCover.userData = { isCover: true };
}

// 添加装饰品
function addDecorations() {
    // 添加地面
    const groundGeometry = new THREE.PlaneGeometry(50, 50);
    const groundMaterial = new THREE.MeshPhongMaterial({ 
        color: 0x7CFC00,
        shininess: 30
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);
    
    // 添加一些漂浮的气球
    const balloonColors = [0xFF6B6B, 0x4ECDC4, 0xFFD166, 0x06D6A0];
    
    for(let i = 0; i < 8; i++) {
        const balloonGroup = new THREE.Group();
        
        // 气球主体（球体）
        const balloonGeometry = new THREE.SphereGeometry(0.5, 32, 32);
        const balloonMaterial = new THREE.MeshPhongMaterial({ 
            color: balloonColors[i % balloonColors.length],
            shininess: 100
        });
        const balloon = new THREE.Mesh(balloonGeometry, balloonMaterial);
        balloon.castShadow = true;
        
        // 气球绳子
        const ropeGeometry = new THREE.CylinderGeometry(0.01, 0.01, 2);
        const ropeMaterial = new THREE.MeshPhongMaterial({ color: 0x8B4513 });
        const rope = new THREE.Mesh(ropeGeometry, ropeMaterial);
        rope.position.y = -1;
        
        balloonGroup.add(balloon);
        balloonGroup.add(rope);
        balloonGroup.position.set(
            (Math.random() - 0.5) * 20,
            10 + Math.random() * 10,
            (Math.random() - 0.5) * 20
        );
        
        scene.add(balloonGroup);
    }
    
    // 添加粒子效果
    const particleCount = 500;
    const particles = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    
    for(let i = 0; i < particleCount; i++) {
        positions[i * 3] = (Math.random() - 0.5) * 100;
        positions[i * 3 + 1] = Math.random() * 50;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 100;
        
        colors[i * 3] = Math.random();
        colors[i * 3 + 1] = Math.random();
        colors[i * 3 + 2] = Math.random();
    }
    
    particles.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particles.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    
    const particleMaterial = new THREE.PointsMaterial({
        size: 0.5,
        vertexColors: true,
        transparent: true,
        opacity: 0.6
    });
    
    const particleSystem = new THREE.Points(particles, particleMaterial);
    scene.add(particleSystem);
}

// 打开贺卡动画
function openCard() {
    if (isCardOpen) return;
    
    isCardOpen = true;
    
    // 找到封面并旋转
    cardGroup.children.forEach(child => {
        if (child.userData && child.userData.isCover) {
            // 创建补间动画
            const startRotation = { y: 0 };
            const endRotation = { y: -Math.PI / 1.5 };
            
            const animate = () => {
                requestAnimationFrame(animate);
                
                if (child.rotation.y > endRotation.y) {
                    child.rotation.y -= 0.05;
                    if (child.rotation.y <= endRotation.y) {
                        child.rotation.y = endRotation.y;
                    }
                }
            };
            
            animate();
        }
    });
    
    // 播放音效（可选）
    playSound();
}

// 播放音效
function playSound() {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.setValueAtTime(440, audioContext.currentTime);
    oscillator.frequency.setValueAtTime(880, audioContext.currentTime + 0.1);
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
    
    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.5);
}

// 生成二维码
function generateQRCode() {
    // 获取当前页面URL
    const currentUrl = window.location.href;
    
    // 生成二维码
    QRCode.toCanvas(document.getElementById('qrcode'), 
        currentUrl, 
        { width: 100, height: 100 },
        function (error) {
            if (error) console.error(error);
            console.log('QR Code generated!');
        }
    );
    
    // 显示二维码区域
    setTimeout(() => {
        document.getElementById('qr-section').style.display = 'block';
    }, 2000);
}

// 窗口大小调整
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// 动画循环
function animate() {
    requestAnimationFrame(animate);
    
    const elapsedTime = (Date.now() - startTime) / 1000;
    
    // 让卡片轻微浮动
    if (cardGroup) {
        cardGroup.position.y = 2 + Math.sin(elapsedTime) * 0.1;
        cardGroup.rotation.y = Math.sin(elapsedTime * 0.5) * 0.1;
    }
    
    // 让气球飘动
    scene.children.forEach(child => {
        if (child.type === 'Group' && child.children.length === 2) {
            child.position.y += Math.sin(elapsedTime + child.position.x) * 0.01;
            child.rotation.y = elapsedTime;
        }
    });
    
    // 粒子动画
    const particles = scene.children.find(child => child.type === 'Points');
    if (particles) {
        particles.rotation.y = elapsedTime * 0.1;
    }
    
    controls.update();
    renderer.render(scene, camera);
}

// 射线检测点击
function setupClickDetection() {
    renderer.domElement.addEventListener('click', (event) => {
        // 计算点击位置
        const mouse = new THREE.Vector2();
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
        
        // 创建射线
        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(mouse, camera);
        
        // 检测与封面的交集
        const intersects = raycaster.intersectObjects(cardGroup.children, true);
        
        if (intersects.length > 0) {
            openCard();
        }
    });
}

// 初始化函数
window.addEventListener('load', () => {
    // 模拟加载进度
    let progress = 0;
    const interval = setInterval(() => {
        progress += 10;
        document.getElementById('loading-progress').style.width = progress + '%';
        
        if (progress >= 100) {
            clearInterval(interval);
        }
    }, 100);
    
    // 初始化3D场景
    init();
    
    // 设置点击检测
    setupClickDetection();
    
    // 开始动画
    animate();
    
    // 开始屏幕点击事件
    document.getElementById('start-screen').addEventListener('click', () => {
        document.getElementById('start-screen').style.display = 'none';
        
        // 开场动画：相机移动到贺卡位置
        const startPosition = camera.position.clone();
        const endPosition = new THREE.Vector3(8, 5, 8);
        
        let progress = 0;
        const duration = 2000; // 2秒
        
        const animateCamera = () => {
            progress += 16; // 约60fps
            const t = Math.min(progress / duration, 1);
            
            // 使用缓动函数
            const easeOutCubic = t => 1 - Math.pow(1 - t, 3);
            const easedT = easeOutCubic(t);
            
            camera.position.lerpVectors(startPosition, endPosition, easedT);
            
            if (t < 1) {
                requestAnimationFrame(animateCamera);
            }
        };
        
        animateCamera();
    });
});
