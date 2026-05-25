// =====================
// 星空生成
// =====================

const starsContainer = document.getElementById("stars");

for (let i = 0; i < 180; i++) {
    const star = document.createElement("div");
    star.classList.add("star");
    star.style.left = Math.random() * 100 + "%";
    star.style.top = Math.random() * 100 + "%";
    star.style.animationDuration = (Math.random() * 3 + 2) + "s";
    star.style.opacity = Math.random();
    starsContainer.appendChild(star);
}

// =====================
// 頁面切換
// =====================

function goTo(type) {
    if (type === "fortune") {
        showPage("fortunePage");
    } else if (type === "register") {
        showPage("authPage");
        setAuthMode("register");
    } else if (type === "login") {
        showPage("authPage");
        setAuthMode("login");
    } else if (type === "rpg") {
        openRpgPage();
    } else if (type === "tarot") {
        // 1. 先用 showPage 幫你把其他畫面（如大廳）隱藏起來
        showPage("tarotScreen"); 
        
        // 2. 強制把塔羅頁面設為 flex，這樣置中排版才不會跑掉
        document.getElementById('tarotScreen').style.display = 'flex'; 
        
        // 3. 重置牌局
        resetTarot();
    } else if (type === "ai") {
        // 進入神燈精靈頁面
        showPage("geniePage");
        document.getElementById('geniePage').style.display = 'flex';
        resetGenieGame();
    } else {
        // 預設返回大廳
        showPage("lobbyPage");
    }
}

// =====================
// 返回大廳
// =====================

function backLobby() {
    showPage("lobbyPage");
}

function showPage(pageId) {
    const pages = ["lobbyPage", "fortunePage", "rpgPage", "authPage","tarotScreen", "geniePage"];
    pages.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.style.display = id === pageId ? "flex" : "none";
        }
    });
}

// 打開迷宮RPG遊戲頁面的函數
function openRpgPage() {
    // 取得當前登入的用戶
    const currentUser = getCurrentUser();
    
    // 如果用戶未登入，提示使用者登入
    if (!currentUser) {
        showLoginAlert("請先登入才能前往看廣告拿幣。", true);
        showPage("authPage");
        setAuthMode("login");
        return;
    }

    // 隱藏用戶資訊下拉選單
    hideUserModal();
    
    // 隱藏頭像下拉選單
    hideAvatarMenu();
    
    // 顯示RPG遊戲頁面
    showPage("rpgPage");
    
    // 初始化遊戲（延遲等待頁面渲染完成）
    setTimeout(() => {
        // 確保Canvas已準備好
        const canvas = document.getElementById("gameCanvas");
        if (canvas && canvas.getContext) {
            initializeRpgGame(currentUser);
        }
    }, 300);
}


function persistCurrentUser(user) {
    if (!user) return;
    localStorage.setItem("destinyCurrentUser", JSON.stringify(user));
    const users = userDataStore.getUsers();
    const index = users.findIndex(u => u.email.toLowerCase() === user.email.toLowerCase());
    if (index !== -1) {
        users[index] = { ...users[index], balance: user.balance };
        localStorage.setItem(userDataStore.STORAGE_KEY, JSON.stringify(users));
    }
}



function setAuthMode(mode) {
    const authTitle = document.getElementById("authTitle");
    const authSubtitle = document.getElementById("authSubtitle");
    const registerForm = document.getElementById("registerForm");
    const loginForm = document.getElementById("loginForm");
    const registerMeta = document.getElementById("registerMeta");
    const authTabRegister = document.getElementById("authTabRegister");
    const authTabLogin = document.getElementById("authTabLogin");
    const registerAlert = document.getElementById("registerAlert");
    const loginAlert = document.getElementById("loginAlert");

    if (registerAlert) {
        registerAlert.style.display = "none";
    }
    if (loginAlert) {
        loginAlert.style.display = "none";
    }

    if (mode === "login") {
        authTitle.textContent = "🔐 使用者登入";
        authSubtitle.textContent = "請輸入已註冊的電子郵件與密碼。";
        registerForm.style.display = "none";
        loginForm.style.display = "flex";
        registerMeta.style.display = "none";
        authTabRegister.classList.remove("auth-active");
        authTabLogin.classList.add("auth-active");
    } else {
        authTitle.textContent = "📝 會員註冊";
        authSubtitle.textContent = "留下姓名與信箱。";
        registerForm.style.display = "flex";
        loginForm.style.display = "none";
        registerMeta.style.display = "block";
        authTabRegister.classList.add("auth-active");
        authTabLogin.classList.remove("auth-active");
    }
}

function updateRegisteredCount() {
    const countElement = document.getElementById("registeredCount");
    if (countElement && window.userDataStore) {
        countElement.innerText = userDataStore.getUsers().length;
    }
}

function showRegisterAlert(message, isError = false) {
    const alert = document.getElementById("registerAlert");
    if (!alert) return;
    alert.textContent = message;
    alert.className = "register-alert" + (isError ? " error" : " success");
    alert.style.display = "block";
}

// =====================
// 每日運勢隨機
// =====================

function getFortune() {
    const fortunes = [
        "今天適合做重大決定。",
        "你可能會遇見重要的人。",
        "今天財運不錯。",
        "最近的努力即將得到回報。",
        "今天適合休息與放鬆。",
        "有些事情不要太急。",
        "今天的你魅力特別高。",
        "可能會收到意外的消息。",
        "適合開始新的計畫。",
        "今天運氣普通，但很平穩。",
        "你正在接近自己的目標。",
        "晚上可能有好事發生。",
        "今天容易想太多。",
        "請相信自己的直覺。",
        "今天適合學習新東西。",
        "可能會有意外之財。",
        "你會得到某人的幫助。",
        "今天適合整理環境。",
        "有件事即將迎來轉機。",
        "今天桃花運提升。",
        "最近會有新的機會出現。",
        "今天的你特別有創造力。",
        "不要錯過眼前的小機會。",
        "今天適合與朋友聚會。",
        "最近壓力有點大，記得休息。",
        "今天的關鍵字是：耐心。",
        "你會發現新的可能性。",
        "今天適合冒險一次。",
        "命運正在悄悄改變。",
        "你離好運只差一步。"
    ];

    const randomIndex = Math.floor(Math.random() * fortunes.length);
    document.getElementById("fortuneResult").innerHTML = fortunes[randomIndex];
}

document.addEventListener("DOMContentLoaded", () => {
    const registerForm = document.getElementById("registerForm");
    if (registerForm) {
        registerForm.addEventListener("submit", event => {
            event.preventDefault();
            const name = document.getElementById("registerName").value.trim();
            const email = document.getElementById("registerEmail").value.trim();
            const password = document.getElementById("registerPassword").value;

            if (!name || !email || !password) {
                showRegisterAlert("請完整填寫所有欄位。", true);
                return;
            }

            const result = userDataStore.saveUser({
                name,
                email,
                password
            });

            if (!result.success) {
                showRegisterAlert(result.error, true);
                return;
            }

            showRegisterAlert("註冊成功！已儲存你的會員資料。", false);
            updateRegisteredCount();
            registerForm.reset();
        });
    }

    const loginForm = document.getElementById("loginForm");
    if (loginForm) {
        loginForm.addEventListener("submit", event => {
            event.preventDefault();
            const email = document.getElementById("loginEmail").value.trim();
            const password = document.getElementById("loginPassword").value;

            if (!email || !password) {
                showLoginAlert("請完整填寫所有欄位。", true);
                return;
            }

            const result = userDataStore.authenticate(email, password);
            if (!result.success) {
                showLoginAlert(result.error, true);
                return;
            }

            loginUser(result.user);
            showLoginAlert("登入成功！歡迎回來，" + result.user.name + "。", false);
            setTimeout(() => {
                showPage("lobbyPage");
                updateAuthButtons();
            }, 800);
        });
    }

    updateRegisteredCount();
    updateAuthButtons();
    const currentUser = getCurrentUser();
    if (currentUser) {
        updateModalUser(currentUser);
        // 初始化頭像下拉選單的用戶資訊
        updateAvatarDropdownInfo(currentUser);
    }
    setAuthMode("register");
    const modal = document.getElementById("userModal");
    if (modal) {
        modal.addEventListener("click", event => {
            if (event.target === modal) {
                hideUserModal();
            }
        });
    }
});

function showLoginAlert(message, isError = false) {
    const alert = document.getElementById("loginAlert");
    if (!alert) return;
    alert.textContent = message;
    alert.className = "register-alert" + (isError ? " error" : " success");
    alert.style.display = "block";
}

function loginUser(user) {
    // 保存當前用戶到本地儲存
    persistCurrentUser(user);
    
    // 更新舊版的模態框用戶資訊（保留兼容性）
    updateModalUser(user);
    
    // 更新頭像下拉選單中的用戶資訊
    updateAvatarDropdownInfo(user);
}

function updateModalUser(user) {
    const modalName = document.getElementById("modalUserName");
    const modalEmail = document.getElementById("modalUserEmail");
    const modalRegistered = document.getElementById("modalUserRegistered");
    const modalBalance = document.getElementById("modalUserBalance");

    if (modalName) modalName.textContent = user.name || "-";
    if (modalEmail) modalEmail.textContent = user.email || "-";
    if (modalRegistered) modalRegistered.textContent = new Date(user.registeredAt).toLocaleString();
    if (modalBalance) modalBalance.textContent = (typeof user.balance === "number" ? user.balance : 0) + " 元智幣";
}

function getCurrentUser() {
    const raw = localStorage.getItem("destinyCurrentUser");
    try {
        return raw ? JSON.parse(raw) : null;
    } catch (error) {
        return null;
    }
}

function logout() {
    // 從本地儲存中移除當前用戶資訊
    localStorage.removeItem("destinyCurrentUser");
    
    // 隱藏用戶資訊模態框
    hideUserModal();
    
    // 隱藏頭像下拉選單
    hideAvatarMenu();
    
    // 更新認證相關按鈕的顯示狀態
    updateAuthButtons();
    
    // 返回大廳頁面
    showPage("lobbyPage");
}

function toggleUserModal() {
    const modal = document.getElementById("userModal");
    if (!modal) return;
    modal.style.display = modal.style.display === "flex" ? "none" : "flex";
}

function hideUserModal() {
    const modal = document.getElementById("userModal");
    if (modal) modal.style.display = "none";
}

function updateAuthButtons() {
    // 取得當前登入的用戶
    const currentUser = getCurrentUser();
    
    // 取得所有認證相關的DOM元素
    const loginButton = document.getElementById("loginTopBtn");
    const registerButton = document.getElementById("registerTopBtn");
    const avatarDropdown = document.getElementById("avatarDropdown");
    const welcomeText = document.getElementById("welcomeText");

    // 如果用戶已登入
    if (currentUser) {
        // 隱藏登入和註冊按鈕
        if (loginButton) loginButton.style.display = "none";
        if (registerButton) registerButton.style.display = "none";
        
        // 顯示頭像下拉選單
        if (avatarDropdown) {
            avatarDropdown.style.display = "inline-block";
            // 更新下拉選單中的用戶資訊
            updateAvatarDropdownInfo(currentUser);
        }
        
        // 更新歡迎文字
        if (welcomeText) welcomeText.textContent = "歡迎，" + currentUser.name + "";
    } else {
        // 如果用戶未登入，顯示登入和註冊按鈕
        if (loginButton) loginButton.style.display = "inline-flex";
        if (registerButton) registerButton.style.display = "inline-flex";
        
        // 隱藏頭像下拉選單
        if (avatarDropdown) avatarDropdown.style.display = "none";
        
        // 清空歡迎文字
        if (welcomeText) welcomeText.textContent = "";
    }
}

// =====================
// 頭像相關功能
// =====================

/**
 * 更新頭像下拉選單中的用戶資訊
 * @param {Object} user - 用戶對象
 */
function updateAvatarDropdownInfo(user) {
    // 更新用戶名稱
    const nameEl = document.getElementById("dropdownUserName");
    if (nameEl) nameEl.textContent = user.name || "-";
    
    // 更新用戶電子郵件
    const emailEl = document.getElementById("dropdownUserEmail");
    if (emailEl) emailEl.textContent = user.email || "-";
    
    // 更新註冊日期
    const registeredEl = document.getElementById("dropdownUserRegistered");
    if (registeredEl) {
        registeredEl.textContent = new Date(user.registeredAt).toLocaleString();
    }
    
    // 更新元智幣餘額
    const balanceEl = document.getElementById("dropdownUserBalance");
    if (balanceEl) {
        const balance = typeof user.balance === "number" ? user.balance : 0;
        balanceEl.textContent = balance + " 元智幣";
    }
    
    // 如果用戶有頭像，更新頭像圖片
    if (user.avatar) {
        const avatarImg = document.getElementById("avatarImg");
        if (avatarImg) avatarImg.src = user.avatar;
    }
}

/**
 * 切換頭像下拉選單的顯示/隱藏
 */
function toggleAvatarMenu() {
    // 取得下拉選單和按鈕元素
    const menu = document.getElementById("avatarMenu");
    const btn = document.querySelector(".avatar-btn");
    
    if (!menu) return;
    
    // 切換下拉選單的顯示狀態
    if (menu.style.display === "flex" || menu.style.display === "") {
        // 如果選單可見，則隱藏它
        menu.style.display = "none";
        if (btn) btn.classList.remove("active");
    } else {
        // 如果選單隱藏，則顯示它
        menu.style.display = "flex";
        if (btn) btn.classList.add("active");
        menu.style.flexDirection = "column";
    }
}

/**
 * 隱藏頭像下拉選單
 */
function hideAvatarMenu() {
    // 取得下拉選單和按鈕元素
    const menu = document.getElementById("avatarMenu");
    const btn = document.querySelector(".avatar-btn");
    
    if (menu) {
        menu.style.display = "none";
        if (btn) btn.classList.remove("active");
    }
}

/**
 * 處理頭像圖片上傳
 * @param {Event} event - 檔案輸入事件
 */
function handleAvatarUpload(event) {
    // 取得選中的檔案
    const file = event.target.files[0];
    if (!file) return;
    
    // 驗證檔案是否為圖片
    if (!file.type.startsWith("image/")) {
        alert("請選擇圖片檔案！");
        return;
    }
    
    // 驗證檔案大小（限制為2MB）
    const maxSize = 2 * 1024 * 1024; // 2MB
    if (file.size > maxSize) {
        alert("圖片檔案過大，請選擇小於2MB的圖片！");
        return;
    }
    
    // 使用FileReader讀取圖片數據
    const reader = new FileReader();
    reader.onload = function(e) {
        // 取得Base64編碼的圖片數據
        const avatarData = e.target.result;
        
        // 取得當前登入的用戶
        const currentUser = getCurrentUser();
        if (!currentUser) return;
        
        // 更新用戶的頭像
        currentUser.avatar = avatarData;
        
        // 將更新的用戶資訊保存到本地儲存
        persistCurrentUser(currentUser);
        
        // 更新頭像圖片顯示
        const avatarImg = document.getElementById("avatarImg");
        if (avatarImg) avatarImg.src = avatarData;
        
        // 顯示成功提示
        alert("頭像已更新！");
    };
    
    // 開始讀取檔案
    reader.readAsDataURL(file);
}

// =====================
// 頁面加載事件
// =====================

// 監聽頁面加載完成事件的現有代碼之後添加以下代碼：
// 點擊頁面其他位置時關閉下拉選單
document.addEventListener("click", (event) => {
    // 取得頭像相關的DOM元素
    const avatarDropdown = document.getElementById("avatarDropdown");
    const avatarMenu = document.getElementById("avatarMenu");
    const avatarBtn = document.querySelector(".avatar-btn");
    
    // 如果點擊的位置不在頭像下拉選單內部
    if (avatarDropdown && avatarMenu && !avatarDropdown.contains(event.target)) {
        // 隱藏下拉選單
        if (avatarMenu.style.display === "flex") {
            hideAvatarMenu();
        }
    }
});

// 當頁面切換到其他頁面時，隱藏下拉選單
const originalShowPage = showPage;
showPage = function(pageId) {
    // 調用原始的showPage函數
    originalShowPage(pageId);
    
    // 隱藏頭像下拉選單
    hideAvatarMenu();
};

// 當打開RPG頁面時，隱藏下拉選單
const originalOpenRpgPage = openRpgPage;
openRpgPage = function() {
    // 隱藏下拉選單
    hideAvatarMenu();
    
    // 調用原始的openRpgPage函數
    originalOpenRpgPage();
};

// =====================
// 迷宮RPG遊戲邏輯
// =====================

/**
 * RPG遊戲類 - 管理遊戲的所有邏輯
 */
class MazeRpgGame {
    // 建構函數 - 初始化遊戲
    constructor(canvas, currentUser) {
        // Canvas相關
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");
        this.width = canvas.width;
        this.height = canvas.height;
        
        // 用戶資訊
        this.currentUser = currentUser;
        this.earnedCoins = 0;
        
        // 遊戲狀態
        this.gameRunning = true;
        this.showingQuiz = false;
        
        // 吃豆人嘴巴動畫狀態
        this.mouthPhase = 0;
        
        // 遊戲配置
        this.tileSize = 40;
        this.cols = Math.floor(this.width / this.tileSize);
        this.rows = Math.floor(this.height / this.tileSize);
        
        // 初始化遊戲元素
        this.initializeMaze();
        this.initializePlayer();
        this.initializeChests();
        
        // 設定遊戲控制（必須在啟動遊戲循環之前）
        this.setupControls();
        
        // 啟動遊戲循環
        this.startGameLoop();
    }
    
    // 初始化迷宮 - 生成簡單的迷宮結構
    initializeMaze() {
        // 迷宮牆壁矩陣（1代表牆壁，0代表通路）
        this.maze = [
            [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
            [1,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,1],
            [1,0,1,0,1,0,1,1,1,0,1,0,1,0,1,1,1,0,0,1],
            [1,0,1,0,0,0,0,0,1,0,1,0,0,0,0,0,1,0,1,1],
            [1,0,1,1,1,1,1,0,1,0,1,1,1,1,0,1,1,0,0,1],
            [1,0,0,0,0,0,1,0,1,0,0,0,0,1,0,0,1,1,0,1],
            [1,1,1,0,1,0,1,0,0,0,1,1,0,1,1,0,0,0,0,1],
            [1,0,0,0,1,0,0,0,1,0,0,0,0,0,1,1,1,1,0,1],
            [1,0,1,1,1,1,1,0,1,1,1,0,1,0,0,0,0,0,0,1],
            [1,0,0,0,0,0,0,0,0,0,0,0,1,1,1,0,1,1,0,1],
            [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
        ];
    }
    
    // 初始化玩家 - 設定玩家位置和屬性
    initializePlayer() {
        // 玩家從左上角開始（第一個通路位置）
        this.player = {
            // 玩家在迷宮中的網格位置
            gridX: 1,
            gridY: 1,
            // 玩家在Canvas上的像素位置
            x: 1 * this.tileSize,
            y: 1 * this.tileSize,
            // 玩家大小
            width: this.tileSize - 4,
            height: this.tileSize - 4,
            // 玩家速度
            speed: 2,
            // 玩家面向方向
            direction: "right",
        };
    }

    // 初始化寶箱 - 隨機放置寶箱在迷宮中
    // 初始化寶箱 - 在迷宮的空位隨機放置最多 7 個寶箱
    initializeChests() {
        // 寶箱列表
        this.chests = [];
        
        // 搜集所有可放寶箱的空位
        const emptyCells = [];
        for (let row = 1; row < this.maze.length - 1; row++) {
            for (let col = 1; col < this.maze[row].length - 1; col++) {
                if (this.maze[row][col] === 0) {
                    // 排除玩家起始位置
                    if (row === 1 && col === 1) continue;
                    emptyCells.push({ gridX: col, gridY: row });
                }
            }
        }
        
        // 亂序空位列表
        emptyCells.sort(() => Math.random() - 0.5);
        
        // 最多放置七個寶箱
        const chestCount = Math.min(7, emptyCells.length);
        for (let index = 0; index < chestCount; index++) {
            const pos = emptyCells[index];
            this.chests.push({
                gridX: pos.gridX,
                gridY: pos.gridY,
                x: pos.gridX * this.tileSize,
                y: pos.gridY * this.tileSize,
                width: this.tileSize - 4,
                height: this.tileSize - 4,
                requiresQuiz: true,
                reward: 15,
                opened: false,
                id: index,
            });
        }
    }
    
    // 設定遊戲控制 - 鍵盤輸入處理
    setupControls() {
        // 追蹤按鍵狀態
        this.keys = {};
        
        // 創建綁定的事件處理函數（避免重複添加listeners）
        this.keydownHandler = (e) => {
            // 如果遊戲未運行，不處理輸入
            if (!this.gameRunning) return;
            
            this.keys[e.key] = true;
            
            // 按E鍵打開寶箱
            if (e.key === "e" || e.key === "E") {
                this.tryOpenChest();
            }
        };
        
        this.keyupHandler = (e) => {
            this.keys[e.key] = false;
        };
        
        // 監聽按鍵按下
        document.addEventListener("keydown", this.keydownHandler);
        
        // 監聽按鍵抬起
        document.addEventListener("keyup", this.keyupHandler);
    }
    
    // 移除事件監聽 - 清理資源
    removeControls() {
        if (this.keydownHandler) {
            document.removeEventListener("keydown", this.keydownHandler);
        }
        if (this.keyupHandler) {
            document.removeEventListener("keyup", this.keyupHandler);
        }
    }
    
    // 嘗試打開寶箱 - 檢查玩家是否靠近寶箱
    tryOpenChest() {
        // 檢查每個寶箱
        for (let chest of this.chests) {
            // 如果寶箱已開啟，跳過
            if (chest.opened) continue;
            
            // 計算玩家與寶箱的距離
            const dist = Math.hypot(
                this.player.x + this.player.width / 2 - (chest.x + chest.width / 2),
                this.player.y + this.player.height / 2 - (chest.y + chest.height / 2)
            );
            
            // 如果距離小於80像素，代表靠近寶箱
            if (dist < 80) {
                // 標記寶箱為已開啟
                chest.opened = true;
                
                // 如果需要數學題，顯示數學題
                if (chest.requiresQuiz) {
                    this.showMathQuiz(chest);
                } else {
                    // 直接給予獎勵
                    this.earnCoins(chest.reward);
                }
                return;
            }
        }
    }
    
    // 顯示數學題 - 向玩家提出數學題
    showMathQuiz(chest) {
        // 標記正在顯示數學題
        this.showingQuiz = true;
        this.currentQuizChest = chest;
        
        // 生成隨機的數學題
        const num1 = Math.floor(Math.random() * 20) + 1;
        const num2 = Math.floor(Math.random() * 20) + 1;
        const operators = ["+", "-", "*"];
        const operator = operators[Math.floor(Math.random() * operators.length)];
        
        // 計算正確答案
        let correctAnswer;
        if (operator === "+") {
            correctAnswer = num1 + num2;
        } else if (operator === "-") {
            correctAnswer = num1 - num2;
        } else {
            correctAnswer = num1 * num2;
        }
        
        // 生成選項（包含正確答案和3個錯誤答案）
        const options = [correctAnswer];
        while (options.length < 4) {
            const wrongAnswer = correctAnswer + (Math.floor(Math.random() * 20) - 10);
            // 避免重複的選項
            if (!options.includes(wrongAnswer) && wrongAnswer > 0) {
                options.push(wrongAnswer);
            }
        }
        
        // 打亂選項順序
        options.sort(() => Math.random() - 0.5);
        
        // 設定數學題資訊
        this.mathQuiz = {
            question: `${num1} ${operator} ${num2} = ?`,
            options: options,
            correctAnswer: correctAnswer,
        };
        
        // 顯示數學題模態框
        this.displayMathModal();
    }
    
    // 顯示數學題模態框 - 更新DOM顯示數學題
    displayMathModal() {
        // 取得模態框和相關元素
        const modal = document.getElementById("mathQuizModal");
        const questionEl = document.getElementById("mathQuestion");
        const optionsEl = document.getElementById("mathOptions");
        
        if (!modal) return;
        
        // 設定題目文字
        questionEl.textContent = this.mathQuiz.question;
        
        // 清空選項容器
        optionsEl.innerHTML = "";
        
        // 為每個選項添加按鈕
        this.mathQuiz.options.forEach((option) => {
            const btn = document.createElement("button");
            btn.textContent = option;
            btn.style.padding = "10px";
            btn.style.background = "linear-gradient(135deg, #9b5cff, #6f3cff)";
            btn.style.color = "white";
            btn.style.border = "none";
            btn.style.borderRadius = "8px";
            btn.style.cursor = "pointer";
            btn.style.fontWeight = "bold";
            btn.style.transition = "all 0.2s ease";
            
            // 點擊選項按鈕
            btn.onclick = () => {
                // 檢查答案是否正確
                if (option === this.mathQuiz.correctAnswer) {
                    // 回答正確，給予獎勵
                    this.earnCoins(this.currentQuizChest.reward);
                    alert("回答正確！獲得 " + this.currentQuizChest.reward + " 元智幣！");
                } else {
                    // 回答錯誤，不給獎勵
                    alert("回答錯誤，遺憾地未能獲得寶箱獎勵。");
                }
                
                // 關閉數學題模態框
                modal.style.display = "none";
                this.showingQuiz = false;
            };
            
            optionsEl.appendChild(btn);
        });
        
        // 顯示模態框
        modal.style.display = "flex";
    }
    
    // 獲得金幣 - 加入玩家的元智幣
    earnCoins(amount) {
        // 增加玩家的獲得金幣總數
        this.earnedCoins += amount;
        
        // 更新顯示
        const balanceEl = document.getElementById("gameBalance");
        if (balanceEl) {
            balanceEl.textContent = this.earnedCoins;
        }
    }
    
// 更新遊戲邏輯 - 處理玩家移動等
    update() {
        // 如果正在顯示數學題，暫停遊戲邏輯
        if (this.showingQuiz) return;
        
        let dx = 0;
        let dy = 0;
        
        // 只記錄「想移動的方向與距離」，先不直接修改 newX / newY
        if (this.keys["ArrowUp"] || this.keys["w"] || this.keys["W"]) {
            dy -= this.player.speed;
            this.player.direction = "up";
        }
        if (this.keys["ArrowDown"] || this.keys["s"] || this.keys["S"]) {
            dy += this.player.speed;
            this.player.direction = "down";
        }
        if (this.keys["ArrowLeft"] || this.keys["a"] || this.keys["A"]) {
            dx -= this.player.speed;
            this.player.direction = "left";
        }
        if (this.keys["ArrowRight"] || this.keys["d"] || this.keys["D"]) {
            dx += this.player.speed;
            this.player.direction = "right";
        }
        
        // 【優化核心】：分開判定 X 軸與 Y 軸
        // 這樣就算前方有牆壁，但只要側邊沒牆壁，玩家就能貼著牆壁「滑」進轉角
        if (dx !== 0 && this.canMove(this.player.x + dx, this.player.y)) {
            this.player.x += dx;
        }
        if (dy !== 0 && this.canMove(this.player.x, this.player.y + dy)) {
            this.player.y += dy;
        }
        
        // 更新玩家的網格位置
        this.player.gridX = Math.round(this.player.x / this.tileSize);
        this.player.gridY = Math.round(this.player.y / this.tileSize);
    }
  // 檢查是否可以移動 - 碰撞檢測
    canMove(x, y) {
        // 【優化核心】：加入「寬容值 (Margin)」
        // 數字越大，轉彎越容易，建議設為 3~5 像素之間。
        // 這樣玩家不需要 100% 對齊格子，只要「差不多」對齊就能轉進去。
        const margin = 4; 
        
        // 玩家的四個角落座標 (把碰撞框往內縮)
        const left = Math.floor((x + margin) / this.tileSize);
        const right = Math.floor((x + this.player.width - margin - 1) / this.tileSize);
        const top = Math.floor((y + margin) / this.tileSize);
        const bottom = Math.floor((y + this.player.height - margin - 1) / this.tileSize);
        
        // 檢查邊界 (避免超出遊戲畫面報錯)
        if (x < 0 || x + this.player.width > this.width) return false;
        if (y < 0 || y + this.player.height > this.height) return false;
        
        // 檢查四個角落是否碰到牆壁
        if (this.maze[top] && this.maze[top][left] === 1) return false;
        if (this.maze[top] && this.maze[top][right] === 1) return false;
        if (this.maze[bottom] && this.maze[bottom][left] === 1) return false;
        if (this.maze[bottom] && this.maze[bottom][right] === 1) return false;
        
        return true;
    }
    // 繪製遊戲 - 將遊戲內容渲染到Canvas上
    draw() {
        // 清空Canvas
        this.ctx.fillStyle = "rgba(20, 20, 40, 1)";
        this.ctx.fillRect(0, 0, this.width, this.height);
        
        // 繪製迷宮
        this.drawMaze();
        
        // 繪製寶箱
        this.drawChests();
        
        // 繪製玩家
        this.drawPlayer();
        
        // 繪製提示文字
        this.drawHints();
    }
    
    // 繪製迷宮 - 畫出所有牆壁
    drawMaze() {
        // 遍歷迷宮矩陣
        for (let row = 0; row < this.maze.length; row++) {
            for (let col = 0; col < this.maze[row].length; col++) {
                // 如果是牆壁
                if (this.maze[row][col] === 1) {
                    // 繪製牆壁（紫色）
                    this.ctx.fillStyle = "rgba(170, 120, 255, 0.5)";
                    this.ctx.fillRect(
                        col * this.tileSize,
                        row * this.tileSize,
                        this.tileSize,
                        this.tileSize
                    );
                    
                    // 繪製牆壁邊框
                    this.ctx.strokeStyle = "rgba(170, 120, 255, 0.8)";
                    this.ctx.lineWidth = 1;
                    this.ctx.strokeRect(
                        col * this.tileSize,
                        row * this.tileSize,
                        this.tileSize,
                        this.tileSize
                    );
                }
            }
        }
    }
    
    // 繪製寶箱 - 畫出所有寶箱
    drawChests() {
        this.chests.forEach((chest) => {
            // 設定顏色（已開啟為灰色，未開啟為金色）
            if (chest.opened) {
                this.ctx.fillStyle = "rgba(100, 100, 100, 0.5)";
            } else {
                this.ctx.fillStyle = "rgba(255, 215, 0, 0.7)";
            }
            
            // 繪製寶箱主體
            this.ctx.fillRect(
                chest.x + 2,
                chest.y + 2,
                chest.width,
                chest.height
            );
            
            // 繪製寶箱邊框
            this.ctx.strokeStyle = chest.opened ? "rgba(100, 100, 100, 0.8)" : "rgba(255, 215, 0, 1)";
            this.ctx.lineWidth = 2;
            this.ctx.strokeRect(
                chest.x + 2,
                chest.y + 2,
                chest.width,
                chest.height
            );
            
            // 繪製寶箱圖標
            this.ctx.fillStyle = chest.opened ? "rgba(100, 100, 100, 1)" : "rgba(255, 200, 0, 1)";
            this.ctx.font = "20px Arial";
            this.ctx.textAlign = "center";
            this.ctx.textBaseline = "middle";
            this.ctx.fillText(
                chest.opened ? "✓" : "💰",
                chest.x + chest.width / 2,
                chest.y + chest.height / 2
            );
        });
    }
    
    // 繪製玩家 - 畫出玩家角色
    drawPlayer() {
        // 更新嘴巴動畫
        this.mouthPhase += 0.2;
        const mouthAngle = 0.2 + Math.sin(this.mouthPhase) * 0.15;
        const centerX = this.player.x + this.player.width / 2;
        const centerY = this.player.y + this.player.height / 2;
        const radius = this.player.width / 2 - 2;
        
        // 計算嘴巴方向
        // 計算嘴巴方向
        let startAngle = mouthAngle;
        let endAngle = Math.PI * 2 - mouthAngle;
        let eyeX = centerX + radius * 0.2;
        let eyeY = centerY - radius * 0.35;
        
        if (this.player.direction === "left") {
            // 從下嘴唇順時針繞一圈回到上嘴唇 (Math.PI + 2*Math.PI)
            startAngle = Math.PI + mouthAngle;
            endAngle = Math.PI * 3 - mouthAngle;
            eyeX = centerX - radius * 0.2;
            eyeY = centerY - radius * 0.35;
        } else if (this.player.direction === "up") {
            // 從右嘴唇順時針繞一圈回到左嘴唇 (-0.5*Math.PI + 2*Math.PI)
            startAngle = -Math.PI / 2 + mouthAngle;
            endAngle = Math.PI * 1.5 - mouthAngle;
            eyeX = centerX + radius * 0.2;
            eyeY = centerY - radius * 0.2;
        } else if (this.player.direction === "down") {
            // 從左嘴唇順時針繞一圈回到右嘴唇 (0.5*Math.PI + 2*Math.PI)
            startAngle = Math.PI / 2 + mouthAngle;
            endAngle = Math.PI * 2.5 - mouthAngle;
            eyeX = centerX + radius * 0.2;
            eyeY = centerY + radius * 0.2;
        }
        
        // 繪製吃豆人外型
        this.ctx.fillStyle = "rgba(100, 150, 255, 0.95)";
        this.ctx.beginPath();
        this.ctx.moveTo(centerX, centerY);
        this.ctx.arc(
            centerX,
            centerY,
            radius,
            startAngle,
            endAngle
        );
        this.ctx.closePath();
        this.ctx.fill();
        
        // 繪製眼睛
        this.ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
        this.ctx.beginPath();
        this.ctx.arc(
            eyeX,
            eyeY,
            radius * 0.15,
            0,
            Math.PI * 2
        );
        this.ctx.fill();
        
        this.ctx.fillStyle = "rgba(12, 8, 30, 0.95)";
        this.ctx.beginPath();
        this.ctx.arc(
            eyeX,
            eyeY,
            radius * 0.07,
            0,
            Math.PI * 2
        );
        this.ctx.fill();
    }
    
    // 繪製提示文字 - 顯示遊戲提示
    drawHints() {
        // 檢查玩家是否靠近任何未開啟的寶箱
        let nearbyChest = null;
        for (let chest of this.chests) {
            if (chest.opened) continue;
            
            const dist = Math.hypot(
                this.player.x + this.player.width / 2 - (chest.x + chest.width / 2),
                this.player.y + this.player.height / 2 - (chest.y + chest.height / 2)
            );
            
            if (dist < 80) {
                nearbyChest = chest;
                break;
            }
        }
        
        // 如果靠近寶箱，顯示提示文字
        if (nearbyChest) {
            this.ctx.fillStyle = "rgba(255, 215, 0, 0.9)";
            this.ctx.font = "14px Arial";
            this.ctx.textAlign = "center";
            this.ctx.fillText(
                "靠近寶箱！按 E 打開",
                this.width / 2,
                30
            );
        }
    }
    
    // 啟動遊戲循環 - 持續更新和繪製遊戲
    startGameLoop() {
        // 遊戲循環函數
        const gameLoop = () => {
            // 更新遊戲邏輯
            this.update();
            
            // 繪製遊戲
            this.draw();
            
            // 如果遊戲還在運行，繼續循環
            if (this.gameRunning) {
                requestAnimationFrame(gameLoop);
            }
        };
        
        // 開始循環
        gameLoop();
    }
}

// 全局變數 - 儲存當前遊戲實例
let currentGame = null;

/**
 * 初始化RPG遊戲 - 建立遊戲實例
 * @param {Object} currentUser - 當前登入的用戶
 */
function initializeRpgGame(currentUser) {
    // 取得Canvas元素
    const canvas = document.getElementById("gameCanvas");
    if (!canvas) {
        console.error("❌ 找不到Canvas元素");
        return;
    }
    
    console.log("✅ Canvas元素已找到");
    
    // 檢查Canvas上下文
    const ctx = canvas.getContext("2d");
    if (!ctx) {
        console.error("❌ Canvas上下文初始化失敗");
        return;
    }
    
    console.log("✅ Canvas上下文已初始化");
    
    // 如果已有遊戲實例，停止它
    if (currentGame) {
        currentGame.gameRunning = false;
        currentGame.removeControls();
    }
    
    try {
        // 建立新的遊戲實例
        currentGame = new MazeRpgGame(canvas, currentUser);
        console.log("✅ 遊戲已成功初始化");
    } catch (error) {
        console.error("❌ 遊戲初始化失敗:", error);
    }
}

/**
 * 結束RPG遊戲 - 保存數據並返回大廳
 */
function endRpgGame() {
    // 如果有正在運行的遊戲，保存數據
    if (currentGame) {
        // 取得當前用戶
        const currentUser = getCurrentUser();
        
        // 如果用戶存在且獲得了元智幣
        if (currentUser && currentGame.earnedCoins > 0) {
            // 更新用戶的元智幣餘額
            currentUser.balance = (typeof currentUser.balance === "number" ? currentUser.balance : 0) + currentGame.earnedCoins;
            
            // 保存用戶數據到本地儲存
            persistCurrentUser(currentUser);
            
            // 更新頭像下拉選單中的元智幣顯示
            updateAvatarDropdownInfo(currentUser);
            
            // 顯示獲得提示
            console.log(`✅ 本次遊戲獲得 ${currentGame.earnedCoins} 元智幣，總計: ${currentUser.balance}`);
        }
        
        // 停止遊戲
        currentGame.gameRunning = false;
        currentGame.removeControls();
        currentGame = null;
    }
    
    // 隱藏數學題模態框
    const mathModal = document.getElementById("mathQuizModal");
    if (mathModal) {
        mathModal.style.display = "none";
    }
    
    // 返回大廳
    backLobby();
}
// =====================
// 塔羅牌圖片
// =====================

const tarotDeck = ["愚者", "魔術師", "女祭司", "皇后", "皇帝", "教皇", "戀人", "戰車", "力量", "隱者", "命運之輪", "正義", "倒吊人", "死神", "節制", "惡魔", "高塔", "星星", "月亮", "太陽", "審判", "世界"];
const tarotImages = {
    "愚者": "static/images/00_fool.png",
    "魔術師": "static/images/01_magician.png",
    "女祭司": "static/images/02_high_priestess.png",
    "皇后": "static/images/03_empress.png",
    "皇帝": "static/images/04_emperor.png",
    "教皇": "static/images/05_pope.png",
    "戀人": "static/images/06_lovers.png",
    "戰車": "static/images/07_chariot.png",
    "力量": "static/images/08_strength.png",
    "隱者": "static/images/09_hermit.png",
    "命運之輪": "static/images/10_wheel_of_fortune.png",
    "正義": "static/images/11_justice.png",
    "倒吊人": "static/images/12_hanged_man.png",
    "死神": "static/images/13_death.png",
    "節制": "static/images/14_temperance.png",
    "惡魔": "static/images/15_devil.png",
    "高塔": "static/images/16_tower.png",
    "星星": "static/images/17_star.png",
    "月亮": "static/images/18_moon.png",
    "太陽": "static/images/19_sun.png",
    "審判": "static/images/20_judgment.png",
    "世界": "static/images/21_world.png",
};

// 統一的牌背圖片路徑
const cardBackImageUrl = "static/images/card-back.jpg";
let currentQuestionType = "";
let drawnCards = [];

// 1. 開始占卜：洗牌並攤開扇形牌陣
function startDrawing(type) {
    currentQuestionType = type === 'love' ? '感情' : '事業';
    drawnCards = [];
    
    document.getElementById('questionTypeArea').style.display = 'none';
    document.getElementById('tarotDrawArea').style.display = 'flex';
    document.getElementById('tarotInstruction').innerText = `正在為你的【${currentQuestionType}】占卜...`;
    document.getElementById('selectionProgress').innerText = "請從下方牌陣憑直覺選出 3 張牌 (0/3)";

    const fanArea = document.getElementById('tarotFanArea');
    fanArea.innerHTML = ''; // 清空上一局的牌陣

    // 先將 22 張牌隨機洗牌
    let shuffledDeck = [...tarotDeck].sort(() => Math.random() - 0.5);

    const totalCards = shuffledDeck.length; // 22張
    const maxSpreadAngle = 65; // 扇形左右最大張開角度 (從 -65度 到 65度)

    // 動態生成 22 張背面朝上的牌
    for (let i = 0; i < totalCards; i++) {
        let cardEl = document.createElement('div');
        cardEl.className = 'fan-card';
        
        // 計算這張牌在扇形中的角度
        let angle = -maxSpreadAngle + ((maxSpreadAngle * 2) / (totalCards - 1)) * i;
        
        // 透過 CSS 變數傳入角度，層級也照順序疊加
        cardEl.style.setProperty('--rot', `${angle}deg`);
        cardEl.style.zIndex = i + 1;
        
        // 把洗好的牌名藏在 dataset 裡面
        cardEl.dataset.cardName = shuffledDeck[i];
        
        // 綁定點擊事件
        cardEl.onclick = function() {
            selectCardFromFan(this);
        };
        
        fanArea.appendChild(cardEl);
    }
}

// 2. 玩家點擊扇形牌陣中的某張牌
function selectCardFromFan(cardElement) {
    if (drawnCards.length >= 3) return;
    if (cardElement.classList.contains('picked')) return;

    cardElement.classList.add('picked');
    
    const selectedCardName = cardElement.dataset.cardName;
    drawnCards.push(selectedCardName);
    
    const index = drawnCards.length - 1;
    
    // 取得選中的 DOM 元素
    const slotElement = document.getElementById(`slot-${index}`);
    
    // 將該卡片的對應圖片設定為背景
    const imageUrl = tarotImages[selectedCardName];
    slotElement.style.backgroundImage = `url('${imageUrl}')`;
    
    // 🌟 新增：加上半透明黑底金字的牌名標籤
    slotElement.innerHTML = `
        <div style="position: absolute; bottom: 0; left: 0; width: 100%; background: rgba(0, 0, 0, 0.75); color: #ffd700; padding: 8px 0; font-size: 16px; font-weight: bold; text-align: center; border-top: 1px solid rgba(170, 120, 255, 0.5);">
            ${selectedCardName}
        </div>
    `;
    
    // 觸發 3D 翻轉動畫
    document.getElementById(`card-${index}`).classList.add('flipped');
    
    document.getElementById('selectionProgress').innerText = `請從下方牌陣憑直覺選出 3 張牌 (${drawnCards.length}/3)`;

    if (drawnCards.length === 3) {
        document.getElementById('tarotFanArea').style.pointerEvents = 'none';
        
        setTimeout(() => {
            document.getElementById('tarotFanArea').style.display = 'none';
            document.getElementById('selectionProgress').style.display = 'none';
            triggerAIInterpretation();
        }, 800); 
    }
}
function resetTarot() {
    currentQuestionType = "";
    drawnCards = [];
    
    document.getElementById('questionTypeArea').style.display = 'flex';
    document.getElementById('tarotDrawArea').style.display = 'none';
    document.getElementById('tarotResultArea').style.display = 'none';
    document.getElementById('tarotFanArea').style.display = 'flex';
    document.getElementById('selectionProgress').style.display = 'block';
    document.getElementById('tarotFanArea').style.pointerEvents = 'auto'; // 解除鎖定
    document.getElementById('tarotInstruction').innerText = "請選擇你想占卜的問題方向";
    
    const cards = [document.getElementById('card-0'), document.getElementById('card-1'), document.getElementById('card-2')];
    cards.forEach(card => card.classList.remove('flipped'));
}
async function triggerAIInterpretation() {
    // ==========================================
    // 🌟 1. 收費機制檢查
    // 假設你的當前登入者資料是存在 localStorage 的 'currentUser'
    // (請確認你登入時是把當前帳號存在哪個 key，這裡以 currentUser 為例)
    // ==========================================
    const currentUserStr = localStorage.getItem('destinyCurrentUser');
    
    if (!currentUserStr) {
        alert("請先登入才能進行塔羅占卜喔！");
        return; // 終止執行
    }

    let currentUser = JSON.parse(currentUserStr);

    // 檢查元智幣是否大於等於 20
    if (currentUser.balance < 20) {
        alert("餘額不足！塔羅占卜需要 20 元智幣，請先去迷宮尋寶賺取金幣！");
        return; // 錢不夠，直接終止，不會呼叫 AI
    }

    // 確定有錢，執行扣款
    currentUser.balance -= 20;
    
    // 把扣完錢的新資料存回當前使用者
    localStorage.setItem('destinyCurrentUser', JSON.stringify(currentUser));

    // 同步更新總資料庫 (destinyUsers) 裡的餘額
    let allUsers = JSON.parse(localStorage.getItem('destinyUsers')) || [];
    let userIndex = allUsers.findIndex(u => u.email === currentUser.email);
    if (userIndex !== -1) {
        allUsers[userIndex].balance = currentUser.balance;
        localStorage.setItem('destinyUsers', JSON.stringify(allUsers));
    }

    // 更新網頁右上角與資訊欄的數字顯示
    if (document.getElementById('dropdownUserBalance')) {
        document.getElementById('dropdownUserBalance').innerText = currentUser.balance;
    }
    if (document.getElementById('modalUserBalance')) {
        document.getElementById('modalUserBalance').innerText = currentUser.balance;
    }

    // ==========================================
    // 🌟 2. 扣款成功，繼續原本的占卜流程
    // ==========================================
    document.getElementById('tarotInstruction').innerText = "牌陣已確認 (已扣除 20 元智幣)";
    document.getElementById('tarotResultArea').style.display = 'flex';
    document.getElementById('aiLoading').style.display = 'block';
    document.getElementById('aiExplanation').style.display = 'none';

    try {
        // 發送請求給自己的 Flask 後端 (/api/tarot)
        const response = await fetch('/api/tarot', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                question_type: currentQuestionType,
                cards: drawnCards 
            })
        });

        const data = await response.json();
        
        if (!response.ok) {
            // 如果後端當機了，為了公平起見，可以考慮在這裡把 20 幣加回去 (退款機制)
            throw new Error(data.error || "後端處理失敗");
        }

        // 隱藏 Loading，顯示結果
        document.getElementById('aiLoading').style.display = 'none';
        document.getElementById('aiExplanation').style.display = 'block';
        document.getElementById('aiExplanation').innerHTML = data.text.replace(/\n/g, '<br>');

    } catch (error) {
        console.error("占卜連線失敗:", error);
        document.getElementById('aiLoading').style.display = 'none';
        document.getElementById('aiExplanation').style.display = 'block';
        document.getElementById('aiExplanation').innerHTML = "星象似乎受到強烈干擾，無法順利解讀。請稍後再試一次。";
    }
}

// =====================
// 神燈精靈 - 遊戲函數
// =====================

// 重置神燈精靈遊戲
function resetGenieGame() {
    document.getElementById('genieStartArea').style.display = 'flex';
    document.getElementById('genieGameArea').style.display = 'none';
    document.getElementById('genieResultArea').style.display = 'none';
    document.getElementById('genieLoading').style.display = 'none';
    document.getElementById('genieSubtitle').innerText = '請心想一個人物，我會試著猜出你想的是誰';
}

// 開始神燈精靈遊戲
async function startGenieGame() {
    const currentUserStr = localStorage.getItem('destinyCurrentUser');
    
    if (!currentUserStr) {
        alert("請先登入才能招喚神燈精靈喔！");
        return; 
    }

    let currentUser = JSON.parse(currentUserStr);

    if (currentUser.balance < 15) {
        alert("餘額不足！召喚神燈精靈需要 15 元智幣，請先去迷宮尋寶賺取金幣！");
        return; 
    }
 try {
        const oldAlerts = document.querySelectorAll('.genie-error-alert, .genie-quota-alert');
        oldAlerts.forEach(alert => alert.remove());

        document.getElementById('genieStartArea').style.display = 'none';
        document.getElementById('genieGameArea').style.display = 'flex';
        document.getElementById('genieLoading').style.display = 'block';
        document.getElementById('genieCurrentQuestion').innerText = '正在初始化...';
        document.getElementById('genieYesBtn').disabled = true;
        document.getElementById('genieNoBtn').disabled = true;

        // 調用後端 API 初始化遊戲
        const response = await fetch('/api/genie/start', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();

        
        if (response.status === 429 || data.error_code === 'QUOTA_EXCEEDED') {
            throw new Error(data.error || '神燈精靈忙碌中，請稍後再試');
        }

        if (!response.ok) {
            throw new Error(data.error || '遊戲初始化失敗');
        }
    currentUser.balance -= 15;
    
    localStorage.setItem('destinyCurrentUser', JSON.stringify(currentUser));

    let allUsers = JSON.parse(localStorage.getItem('destinyUsers')) || [];
    let userIndex = allUsers.findIndex(u => u.email === currentUser.email);
    if (userIndex !== -1) {
        allUsers[userIndex].balance = currentUser.balance;
        localStorage.setItem('destinyUsers', JSON.stringify(allUsers));
    }

    if (document.getElementById('dropdownUserBalance')) {
        document.getElementById('dropdownUserBalance').innerText = currentUser.balance;
    }
    if (document.getElementById('modalUserBalance')) {
        document.getElementById('modalUserBalance').innerText = currentUser.balance;
    }





   

        // 隱藏 Loading，顯示第一個問題
        document.getElementById('genieLoading').style.display = 'none';
        document.getElementById('genieCurrentQuestion').innerText = data.question;
        document.getElementById('genieQuestionCount').innerText = data.question_count;
        document.getElementById('genieMaxQuestions').innerText = data.max_questions;
        document.getElementById('genieYesBtn').disabled = false;
        document.getElementById('genieNoBtn').disabled = false;

    } catch (error) {
        console.error('神燈精靈初始化錯誤:', error);
        document.getElementById('genieLoading').style.display = 'none';
        document.getElementById('genieGameArea').style.display = 'none';
        document.getElementById('genieStartArea').style.display = 'flex';
        
        // 顯示錯誤提示
        const alertDiv = document.createElement('div');
        alertDiv.style.cssText = 'background: rgba(255, 180, 100, 0.2); border: 1px solid #ffb464; color: #ffb464; padding: 15px; border-radius: 8px; margin-top: 15px; font-size: 14px; text-align: center;';
        alertDiv.innerHTML = `${error.message}`;
        alertDiv.className = 'genie-error-alert';
        document.getElementById('genieStartArea').appendChild(alertDiv);
    }
}

// 回答神燈精靈的問題
async function answerGenie(answer) {
    try {
        // 【修複】強制刪除所有舊的配額和錯誤提示
        const allAlerts = document.querySelectorAll('.genie-quota-alert, .genie-error-alert');
        allAlerts.forEach(alert => alert.remove());
        
        document.getElementById('genieLoading').style.display = 'block';
        document.getElementById('genieYesBtn').disabled = true;
        document.getElementById('genieNoBtn').disabled = true;

        // 調用後端 API 處理回答
        const response = await fetch('/api/genie/answer', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                answer: answer
            })
        });

        const data = await response.json();

        // 檢查是否配額超限
        if (response.status === 429 || data.error_code === 'QUOTA_EXCEEDED') {
            document.getElementById('genieLoading').style.display = 'none';
            document.getElementById('genieYesBtn').disabled = false;
            document.getElementById('genieNoBtn').disabled = false;
            
            // 顯示配額超限提示
            const newQuotaAlert = document.createElement('div');
            newQuotaAlert.style.cssText = 'background: rgba(255, 180, 100, 0.2); border: 1px solid #ffb464; color: #ffb464; padding: 15px; border-radius: 8px; margin-top: 15px; font-size: 14px; text-align: center;';
            newQuotaAlert.innerHTML = `${data.error}`;
            newQuotaAlert.className = 'genie-quota-alert';
            
            document.getElementById('genieGameArea').appendChild(newQuotaAlert);
            
            return;
        }

        if (!response.ok) {
            throw new Error(data.error || '答題失敗');
        }

        document.getElementById('genieLoading').style.display = 'none';

        // 檢查遊戲狀態
        if (data.status === 'guessing') {
            // 精靈在猜測 - 詢問玩家確認
            document.getElementById('genieCurrentQuestion').innerText = data.question;
            document.getElementById('genieQuestionCount').innerText = data.question_count;
            document.getElementById('genieYesBtn').disabled = false;
            document.getElementById('genieNoBtn').disabled = false;
        } else if (data.status === 'correct') {
            // 精靈猜對了
            document.getElementById('genieGameArea').style.display = 'none';
            document.getElementById('genieResultArea').style.display = 'flex';
            document.getElementById('genieResultMessage').innerHTML = `
                <div style="font-size: 20px; margin-bottom: 15px;">🎉 恭喜！🎉</div>
                <p style="color: #64ff64; font-weight: bold; font-size: 18px; margin-bottom: 10px;">${data.message}</p>
                <p style="color: rgba(255, 255, 255, 0.7); margin-top: 15px;">我用了 ${data.question_count} 個問題就猜出來了！</p>
            `;
        } else if (data.status === 'give_up') {
            // 精靈放棄了
            document.getElementById('genieGameArea').style.display = 'none';
            document.getElementById('genieResultArea').style.display = 'flex';
            document.getElementById('genieResultMessage').innerHTML = `
                <div style="font-size: 20px; margin-bottom: 15px;">😅 我認輸了</div>
                <p>${data.message}</p>
                <p style="color: rgba(255, 255, 255, 0.7); margin-top: 15px;">我問了 ${data.question_count} 個問題還是沒有猜出來。</p>
            `;
        } else if (data.status === 'game_over') {
            // 達到問題上限
            document.getElementById('genieGameArea').style.display = 'none';
            document.getElementById('genieResultArea').style.display = 'flex';
            document.getElementById('genieResultMessage').innerHTML = `
                <div style="font-size: 20px; margin-bottom: 15px;">我認輸了</div>
                <p>${data.final_message}</p>
                <p style="color: rgba(255, 255, 255, 0.7); margin-top: 15px;">我已經用完了所有 20 個問題。</p>
            `;
        } else {
            // 繼續遊戲（正常問題）
            document.getElementById('genieCurrentQuestion').innerText = data.question;
            document.getElementById('genieQuestionCount').innerText = data.question_count;
            document.getElementById('genieYesBtn').disabled = false;
            document.getElementById('genieNoBtn').disabled = false;
        }

    } catch (error) {
        console.error('神燈精靈答題錯誤:', error);
        document.getElementById('genieLoading').style.display = 'none';
        document.getElementById('genieYesBtn').disabled = false;
        document.getElementById('genieNoBtn').disabled = false;
        
        // 顯示錯誤提示
        const errorAlert = document.createElement('div');
        errorAlert.style.cssText = 'background: rgba(255, 180, 100, 0.2); border: 1px solid #ffb464; color: #ffb464; padding: 15px; border-radius: 8px; margin-top: 15px; font-size: 14px; text-align: center;';
        errorAlert.innerHTML = `⏳ ${error.message}`;
        errorAlert.className = 'genie-error-alert';
        
        document.getElementById('genieGameArea').appendChild(errorAlert);
    }
}