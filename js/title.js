document.addEventListener("DOMContentLoaded", function () {
  // ==========================================
  // 1. 播放器選單邏輯 (嚴格區分 PC 與手機)
  // ==========================================
  const playerItems = document.querySelectorAll(".player-item");
  let activeIndex = 0;

  // 判斷是否為手機版 (放寬到 992px，涵蓋所有手機尺寸)
  function isMobile() {
    return window.innerWidth <= 992;
  }

  // 電腦版專用：平移與放大效果
  function updatePlayerPositionsPC(activeIndex) {
    if (isMobile()) return; // 如果是手機，立刻停止執行

    playerItems.forEach((item, index) => {
      const offset = index - activeIndex;
      item.style.transition = "transform 0.5s ease, opacity 0.3s ease";
      item.style.transform = `translateX(${offset * 160}px) scale(${index === activeIndex ? 1.5 : 1})`;
      item.style.zIndex = index === activeIndex ? 10 : 1;
      item.style.opacity = index === activeIndex ? 1 : 0.6;
    });
  }

  // 頁面載入時初始化
  if (playerItems.length > 0) {
    if (!isMobile()) {
      updatePlayerPositionsPC(activeIndex);
    } else {
      // 手機版初始狀態：全部稍微縮小變暗
      playerItems.forEach((item) => {
        item.style.transform = "scale(0.85)";
        item.style.opacity = "0.6";
      });
    }
  }

  // 綁定滑鼠與點擊事件
  playerItems.forEach((item, index) => {
    // --- PC 專用 Hover ---
    item.addEventListener("mouseenter", () => {
      if (!isMobile()) updatePlayerPositionsPC(index);
    });

    item.addEventListener("mouseleave", () => {
      if (!isMobile()) {
        activeIndex = index;
        updatePlayerPositionsPC(activeIndex);
      }
    });

    // --- 點擊事件：嚴格的兩階段驗證 ---
    item.addEventListener("click", function (e) {
      const pageUrl = this.getAttribute("data-href");

      if (isMobile()) {
        // 檢查這個選項是不是「已經被選中」了
        const isSelected = this.classList.contains("mobile-selected");

        if (!isSelected) {
          e.preventDefault(); // 🛑 強制阻擋跳轉

          // 1. 先把所有機器重置為未選中、縮小狀態
          playerItems.forEach((el) => {
            el.classList.remove("mobile-selected");
            el.style.transform = "scale(0.85)";
            el.style.opacity = "0.6";
          });

          // 2. 把當前點擊的這台機器貼上「選中標籤」，並放大
          this.classList.add("mobile-selected");
          this.style.transform = "scale(1.15)";
          this.style.opacity = "1";

          // 3. 自動平滑滾動讓這台機器置中
          this.scrollIntoView({
            behavior: "smooth",
            inline: "center",
            block: "nearest",
          });

          return; // 🛑 程式在此終止，絕對不會進入下方的 loading 階段
        }
        // 如果 isSelected 是 true，代表這是第二次點擊，程式就會順利往下走！
      }

      // --- 進入 Loading 與跳轉邏輯 ---
      const loadingScreen = document.getElementById("loading");
      if (loadingScreen && pageUrl) {
        loadingScreen.style.display = "flex";
        setTimeout(() => {
          window.location.href = pageUrl;
        }, 1000);
      } else if (pageUrl) {
        window.location.href = pageUrl;
      }
    });
  });

  // ==========================================
  // 2. 背景音樂與音量鍵控制邏輯 (維持不變)
  // ==========================================
  const bgm = document.getElementById("bgm");
  const rightVol = document.querySelector(".right-vol");
  const volumeIcon = document.querySelector(".volume_icon");

  if (bgm) {
    bgm.volume = 0.3;
    const savedTime = localStorage.getItem("bgmTime");
    if (savedTime) {
      bgm.currentTime = parseFloat(savedTime);
    }

    setInterval(() => {
      localStorage.setItem("bgmTime", bgm.currentTime);
    }, 1000);

    document.body.addEventListener(
      "click",
      function initAudio() {
        if (bgm.paused) {
          bgm.play().catch((err) => console.log("等待互動"));
        }
        document.body.removeEventListener("click", initAudio);
      },
      { once: true },
    );
  }

  if (rightVol && bgm && volumeIcon) {
    rightVol.addEventListener("click", () => {
      bgm.muted = !bgm.muted;
      volumeIcon.src = bgm.muted
        ? "images/icon_mute.svg"
        : "images/icon_volume.svg";
    });
  }
});
