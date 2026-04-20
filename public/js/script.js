// ================== BALANCE ==================
/*let balance = localStorage.getItem("balance")
    ? parseInt(localStorage.getItem("balance"))
    : 1000;*/
    let storedBalance = parseInt(localStorage.getItem("balance"));
    let history = JSON.parse(localStorage.getItem("history")) || [];

let balance = isNaN(storedBalance) ? 1000 : storedBalance;

/*function updateBalance() {
    document.getElementById("balance").innerText = balance;
    localStorage.setItem("balance", balance);
}*/
function updateBalance() {
    if (isNaN(balance)) balance = 0; // 🔥 prevent crash

    document.getElementById("balance").innerText = balance;
    localStorage.setItem("balance", balance);
}

updateBalance();

// ================== AVIATOR ==================
let multiplier = 1;
let interval;
let crashPoint;
let hasCashedOut = false;
let gameRunning = false;

const canvas = document.getElementById("graphCanvas");
const ctx = canvas.getContext("2d");

let points = [];
let time = 0;

const plane = new Image();
plane.src = "/images/plane.png";

let planeLoaded = false;
plane.onload = () => (planeLoaded = true);

function startGame() {
    if (gameRunning) return;

    //let bet = parseInt(document.getElementById("bet").value);
    let betInput = document.getElementById("bet").value.trim();
    let bet = parseInt(betInput);
    if (!betInput || isNaN(bet)) {
    alert("Enter a valid bet amount");
    return;
}

    if (bet < 100) {
        alert("Minimum bet is ₹100");
        return;
    }

    if (bet > balance) {
        alert("Insufficient balance");
        return;
    }

    gameRunning = true;
    balance -= bet;
    updateBalance();

    multiplier = 1;
    hasCashedOut = false;

    // 🎯 70% win / 30% lose
   let chance = Math.random();
   //alert(chance);

if (chance < 0.55) {
    // ❌ 50% early crash (1x–2x)
    crashPoint = 1 + Math.random() * 1; // 1.0x – 2.0x
} 
else if(chance>=0.65 && chance<=0.7){
    crashPoint = 1;

}
else if (chance < 0.9) {
    // ✅ 40% normal range
    crashPoint = 2 + Math.random() * 3; // 2x – 5x
} 
else if (chance < 0.98) {
    // 🚀 8% big wins
    crashPoint = 5 + Math.random() * 10; // 5x – 15x
} 
else {
    // 💥 2% jackpot
    crashPoint = 15 + Math.random() * 35; // up to 50x
}

    points = [];
    time = 0;

    document.getElementById("status").innerText = "✈️ Flying...";
    document.getElementById("cashoutText").innerText = "";

    clearInterval(interval);

    interval = setInterval(() => {
        multiplier += 0.02 * multiplier;
        time++;

        document.getElementById("multiplier").innerText =
            multiplier.toFixed(2) + "x";

        drawGraph();

        /*if (multiplier >= crashPoint) {
            clearInterval(interval);
            gameRunning = false;

            drawCrash();

            document.getElementById("status").innerText =
                "💥 Crashed at " + crashPoint.toFixed(2) + "x";
        }*/
       if (multiplier >= crashPoint) {
    clearInterval(interval);
    gameRunning = false;

    drawCrash();

    let result = crashPoint.toFixed(2);

    // ✅ store result
    history.unshift(result);

    // keep only last 10
    if (history.length > 10) history.pop();

    localStorage.setItem("history", JSON.stringify(history));

    updateHistoryUI();

    document.getElementById("status").innerText =
        "💥 Crashed at " + result + "x";
}

    }, 100);
}

// ================== GRAPH ==================
function drawGraph() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    let x = time * 6;
    let y = canvas.height - multiplier * 25;

    points.push({ x, y });

    ctx.shadowColor = "#22c55e";
    ctx.shadowBlur = 15;

    ctx.beginPath();
    ctx.moveTo(0, canvas.height);

    points.forEach(p => ctx.lineTo(p.x, p.y));

    ctx.strokeStyle = "#22c55e";
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.shadowBlur = 0;

    if (planeLoaded && points.length > 1) {
        let last = points.at(-1);
        let prev = points.at(-2);

        let angle = Math.atan2(last.y - prev.y, last.x - prev.x);

        ctx.save();
        ctx.translate(last.x, last.y);
        ctx.rotate(angle);
        ctx.drawImage(plane, -20, -20, 40, 40);
        ctx.restore();
    }
}

// ================== CRASH ==================
function drawCrash() {
    ctx.fillStyle = "red";
    ctx.font = "26px Arial";
    ctx.fillText("💥 CRASH!", canvas.width / 2 - 80, canvas.height / 2);
}

// ================== CASHOUT ==================
function cashOut() {
    //let bet = parseInt(document.getElementById("bet").value);
    let betInput = document.getElementById("bet").value.trim();
    let bet = parseInt(betInput);
    if (!betInput || isNaN(bet)) return;

    if (!hasCashedOut && multiplier < crashPoint && gameRunning) {
        hasCashedOut = true;

        let win = bet * multiplier;
        balance += Math.floor(win);

        updateBalance();

        document.getElementById("cashoutText").innerText =
            "✅ Cashed out at " + multiplier.toFixed(2) + "x";

        document.getElementById("status").innerText = "💰 You won!";
    }
}

// ================== PROMO ==================
function applyPromo() {
    let code = document.getElementById("promoCode").value.trim().toLowerCase();

    if (code === "kushreal") {
        if (balance <100) {
            balance += 1000;
            updateBalance();
            alert("🎉 ₹1000 added");
        } else {
            alert("Only works at ₹0");
        }
    } else {
        alert("Invalid code");
    }

    document.getElementById("promoCode").value = "";
}
function updateHistoryUI() {
    const bar = document.getElementById("historyBar");
    bar.innerHTML = "";

    history.forEach(val => {
        let div = document.createElement("div");
        div.className = "history-item";

        let num = parseFloat(val);

        // 🎨 color logic
        if (num < 2) {
            div.classList.add("red");
        } else {
            div.classList.add("green");
        }

        div.innerText = val + "x";

        bar.appendChild(div);
    });
}