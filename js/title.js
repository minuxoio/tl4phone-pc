document.addEventListener("DOMContentLoaded", function () {
  // ==========================================
  // 1. 播放器 Hover 與平移效果 (區分 PC 與手機)
  // ==========================================
  const playerItems = document.querySelectorAll(".player-item");
  let activeIndex = 0; // PC 預設選中第一個
  let mobileActiveIndex = -1; // 手機版預設「沒有選中任何項目」

  // 判斷當前是否為手機版螢幕 (< 768px)
  function isMobile() {
    return window.innerWidth <= 768;
  }

  // 更新播放器位置並放大 active 項目 (★ 僅限 PC 執行)
  function updatePlayerPositionsPC(activeIndex) {
    if (isMobile()) return; // 如果是手機，立刻停止，不執行電腦的位移動畫

    playerItems.forEach((item, index) => {
      const offset = index - activeIndex;
      item.style.transition = "transform 0.5s ease, opacity 0.3s ease";
      item.style.transform = `translateX(${offset * 160}px) scale(${
        index === activeIndex ? 1.5 : 1
      })`;
      item.style.zIndex = index === activeIndex ? 10 : 1;
      item.style.opacity = index === activeIndex ? 1 : 0.6;
    });
  }

  // 頁面載入時的初始化
  if (playerItems.length > 0) {
    if (!isMobile()) {
      updatePlayerPositionsPC(activeIndex);
    } else {
      // 手機版初始狀態：讓大家稍微縮小一點點、變半透明
      playerItems.forEach((item) => {
        item.style.transform = "scale(0.95)";
        item.style.opacity = "0.7";
      });
    }
  }

  // 監聽視窗大小改變 (避免電腦縮小視窗時跑版)
  window.addEventListener("resize", () => {
    if (isMobile()) {
      playerItems.forEach((item) => {
        item.style.transform = "scale(0.95)";
        item.style.opacity = "0.7";
        item.style.zIndex = "";
      });
      mobileActiveIndex = -1; // 重置選取狀態
    } else {
      updatePlayerPositionsPC(activeIndex);
    }
  });

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

    // --- 點擊事件：處理跳轉與「手機版雙擊邏輯」 ---
    item.addEventListener("click", (e) => {
      const pageUrl = item.getAttribute("data-href");

      // 【手機版邏輯】：第一次選中(微放大)，第二次跳轉
      if (isMobile()) {
        if (mobileActiveIndex !== index) {
          e.preventDefault(); // 阻止第一次點擊跳轉網頁
          mobileActiveIndex = index; // 紀錄目前選中的是誰

          // 視覺回饋：放大選中的，縮小其他的
          playerItems.forEach((el, i) => {
            el.style.transition = "transform 0.3s ease, opacity 0.3s ease";
            // 手機版放大倍率改為 1.15 倍就好，避免過度放大被裁切
            el.style.transform = i === index ? "scale(1.15)" : "scale(0.85)";
            el.style.opacity = i === index ? "1" : "0.5";
          });

          // 自動將選中的播放器「滑動到畫面正中央」
          item.scrollIntoView({
            behavior: "smooth",
            inline: "center",
            block: "nearest",
          });
          return; // 結束執行，不要進入下面的跳轉程式碼
        }
      }

      // 【跳轉邏輯】 (PC 會直接執行；手機版如果是點擊「已經選中」的項目，也會執行)
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
  // 2. 背景音樂與音量鍵控制邏輯 (保持原樣，沒有更動)
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
