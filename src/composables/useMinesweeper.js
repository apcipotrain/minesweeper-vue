import { ref, reactive } from 'vue'

export function useMinesweeper() {
    const board = ref([])
    const gameOver = ref(false)
    const isWin = ref(false)
    const minesLeft = ref(0)

    /*isClassicMode: 标记当前是实战还是闯关。
    isFirstClick: 实战模式的核心，确保第一下不踩雷。
    config: 记录行、列和雷数（比如 16, 30, 99）。*/
    const isClassicMode = ref(false)
    const isFirstClick = ref(true)
    const gameConfig = reactive({ rows: 0, cols: 0, mines: 0 })

    // 计时功能
    const timer = ref(0)
    let timerInterval = null

    // --- 模式 1：闯关初始化 (保持不变) ---
    function resetGame() {
        stopTimer()

        // 重置状态
        timer.value = 0;
        gameOver.value = false;
        isWin.value = false;
        isFirstClick.value = true
    }

    function initGame(levelData){
        resetGame()
        isClassicMode.value = false
        const { rows, cols, actual_map, opened_map, remaining_mines } = levelData
        gameOver.value = false
        isWin.value = false
        minesLeft.value = remaining_mines

        const tempBoard = []
        for (let r = 0; r < rows; r++) {
            const row = []
            for (let c = 0; c < cols; c++) {
                row.push({
                r, c,
                isMine: actual_map[r][c] === '*',
                isOpen: opened_map[r][c] === '1',
                isFlag: false,
                count: actual_map[r][c] !== '*' ? parseInt(actual_map[r][c]) || 0 : 0
                })
            }
            tempBoard.push(row)
        }
        board.value = tempBoard
    }

    // --- 模式 2：经典实战初始化 ---
    function initClassicGame(rows = 16, cols = 30, mines = 99){
        resetGame()
        isClassicMode.value = true
        isFirstClick.value = true
        gameOver.value = false
        isWin.value = false
        minesLeft.value = mines
        // 保存配置供布雷时使用
        gameConfig.rows = rows
        gameConfig.cols = cols
        gameConfig.mines = mines

        // 生成一个初始全空（无雷）的棋盘
        const tempBoard = []
        for (let r = 0; r < rows; r++) {
            const row = []
            for (let c = 0; c < cols; c++) {
                row.push({
                    r, c, isMine: false, isOpen: false, isFlag: false, count: 0
                })
            }
            tempBoard.push(row)
        }
        board.value = tempBoard
    }

    // --- 核心：随机布雷算法（首次点击免死） ---
    function generateMines(firstR, firstC){
        let placedMines = 0
        const rows = gameConfig.rows
        const cols = gameConfig.cols

        while (placedMines < gameConfig.mines) {
            const r = Math.floor(Math.random() * rows)
            const c = Math.floor(Math.random() * cols)

            // 避开第一次点击的格子及其周围 8 个格子
            const isSafeZone = Math.abs(r - firstR) <= 1 && Math.abs(c - firstC) <= 1
            
            if (!board.value[r][c].isMine && !isSafeZone) {
                board.value[r][c].isMine = true
                placedMines++
            }
        }

        // 布雷完成后，计算每个格子的数字
        updateNumbers()
    }

    // 计算数字逻辑
    function updateNumbers(){
        for (let r = 0; r < gameConfig.rows; r++) {
            for (let c = 0; c < gameConfig.cols; c++) {
                if (board.value[r][c].isMine) continue
                let count = 0
                // 检查周围 8 个格
                for (let dr = -1; dr <= 1; dr++) {
                    for (let dc = -1; dc <= 1; dc++) {
                        const nr = r + dr, nc = c + dc
                        if (board.value[nr] && board.value[nr][nc]?.isMine) count++
                    }
                }
                board.value[r][c].count = count
            }
        }
    }

    // 递归翻开空白格 
    function openCell(r, c){
        if (gameOver.value || isWin.value) return
        const cell = board.value[r][c]
        if (cell.isOpen || cell.isFlag) return

        // --- 【新增核心】：如果是经典模式且是第一次点击 ---
        if (isFirstClick.value) {
            if (isClassicMode.value) {
                generateMines(r, c)       // 此时才真正生成地雷，避开 (r, c)
            }
            isFirstClick.value = false // 立即关闭第一次点击标记
            startTimer()
            // 注意：布雷后，该格子的 isMine 肯定是 false，count 也更新了
        }

        cell.isOpen = true

        // 踩雷判定
        if (cell.isMine) {
            gameOver.value = true
            stopTimer()
            return
        }

        // 如果是数字 0，递归翻开周围
        if (cell.count === 0) {
            const rows = board.value.length
            const cols = board.value[0].length
            for (let dr = -1; dr <= 1; dr++) {
                for (let dc = -1; dc <= 1; dc++) {
                    const nr = r + dr, nc = c + dc
                    if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
                        openCell(nr, nc)
                    }
                }
            }
        }
        checkWin()

    }

    // 在 useMinesweeper.js 的 return 之前添加这个函数
    // useMinesweeper.js 内部
    function chordOpen(r, c){
        const cell = board.value[r][c];

        if (!cell.isOpen || cell.count === 0) {
            return;
        }

        // 1. 找周围 8 个邻居
        const neighbors = []
        let flags = 0
        for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
                if (dr === 0 && dc === 0) continue;
                const nr = r + dr, nc = c + dc;
                // 核心：先判断行是否存在，再判断列是否存在
                if (board.value[nr] && board.value[nr][nc]) {
                    const n = board.value[nr][nc];
                    neighbors.push(n);
                    if (n.isFlag) flags++;
                }
            }
        }

        if (Number(flags) === Number(cell.count)) {
            neighbors.forEach(n => {
                if (!n.isFlag && !n.isOpen) {
                    openCell(n.r, n.c);
                }
            });
        }
    }

    // 插旗逻辑
    function toggleFlag(r, c){
        if (gameOver.value || isWin.value) return
        const cell = board.value[r][c]
        if (cell.isOpen) return
        
        cell.isFlag = !cell.isFlag
        minesLeft.value += cell.isFlag ? -1 : 1
    }

    // 胜利判定 (针对残局：翻开所有非雷格子)
    function checkWin(){
        const allNonMinesOpened = board.value.flat().every(cell => 
            cell.isMine || cell.isOpen
        )
        if (allNonMinesOpened) {
            isWin.value = true
        }
    }

    // 启动计时器
    function startTimer() {
    if (timerInterval) return
        timerInterval = setInterval(() => {
            timer.value++
        }, 1000)
    }

    // 停止计时器
    function stopTimer() {
        clearInterval(timerInterval)
        timerInterval = null
    }

    // --- 修改 1：修复 revealAllMines 函数 ---
    const revealAllMines = async (delay = 1) => {
        const minePositions = [];
        // 遍历 board 寻找所有地雷
        board.value.forEach((row, r) => {
            row.forEach((cell, c) => {
                // 在你的 cell 对象中，属性名是 isMine
                if (cell.isMine) {
                    minePositions.push({ r, c });
                }
            });
        });

        // 依次翻开
        for (const pos of minePositions) {
            const cell = board.value[pos.r][pos.c];
            if (!cell.isOpen) {
                cell.isOpen = true; // 借用 isOpen 状态来配合 CSS 显示地雷
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
    };

    // --- 修改 2：添加战绩统计逻辑 ---
    const saveStats = (win, time) => {
        // 经典模式才统计
        if (!isClassicMode.value) return null;

        const stats = JSON.parse(localStorage.getItem('ms_stats')) || {
            wins: 0,
            total: 0,
            bestTime: 999
        };

        stats.total += 1;
        if (win) {
            stats.wins += 1;
            if (time < stats.bestTime) stats.bestTime = time;
        }

        localStorage.setItem('ms_stats', JSON.stringify(stats));
        return stats;
    };

    // 导出
    return { board, gameOver, isWin, minesLeft, timer, initGame, initClassicGame, openCell, toggleFlag, chordOpen, revealAllMines, saveStats }
}
