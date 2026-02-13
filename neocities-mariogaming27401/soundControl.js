// soundControl.js

function getCookie(name) {
  const value = "; " + document.cookie;
  const parts = value.split("; " + name + "=");
  if (parts.length === 2) return parts.pop().split(";").shift();
}
function setCookie(name, value, days) {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = name + '=' + encodeURIComponent(value) + '; expires=' + expires + '; path=/';
}

function setGlobalVolume(value) {
  document.querySelectorAll("audio").forEach(audio => {
    audio.volume = value;
  });
}

function showFixedEnableSoundBtn(show) {
  const btn = document.getElementById("enableSoundButtonFixed");
  if (btn) btn.style.display = show ? "block" : "none";
}

async function tryPlayAudio(testAudio, pageAudio) {
  try {
    await testAudio.play();
    await pageAudio.play();
    return true;
  } catch {
    return false;
  }
}

window.addEventListener("load", async () => {
  const loader = document.getElementById("loader");
  const popup = document.getElementById("enableSoundPopup");
  const volumeSlider = document.getElementById("volumeSlider");
  const mainContent = document.getElementById("main-content");
  const fixedEnableSoundBtn = document.getElementById("enableSoundButtonFixed");

  const testAudio = document.getElementById("testAudio");
  const pageAudio = document.getElementById("pageAudio");

  // Default slider volume fallback
  let volumeValue = volumeSlider ? volumeSlider.value : "1";

  const cookieSoundEnabled = getCookie("siteLoadedAndSoundEnabled");

  if (cookieSoundEnabled === "true") {
    // Returning user: skip popup & loader, try play audio immediately
    if (loader) loader.style.display = "none";
    if (mainContent) mainContent.style.display = "block";
    if (popup) popup.style.display = "none";
    showFixedEnableSoundBtn(false);

    testAudio.muted = false;
    setGlobalVolume(volumeValue);

    const played = await tryPlayAudio(testAudio, pageAudio);
    if (!played) {
      showFixedEnableSoundBtn(true);
    }
  } else {
    // New user: show popup with slider and loader
    if (loader) loader.style.display = "flex";
    if (mainContent) mainContent.style.display = "none";
    if (popup) {
      popup.style.display = "flex";  // **Explicitly show the popup**
    }
    showFixedEnableSoundBtn(false);

    setTimeout(async () => {
      if (loader) loader.style.display = "none";
      if (mainContent) mainContent.style.display = "block";

      const played = await tryPlayAudio(testAudio, pageAudio);

      if (played) {
        // Audio plays: hide popup
        if (popup) popup.style.display = "none";
        showFixedEnableSoundBtn(false);
      } else {
        // Audio fails: keep popup visible with slider, allow retry with fixed button
        if (popup) popup.style.display = "flex";  // keep popup visible for volume slider
        showFixedEnableSoundBtn(true);
      }
    }, 2000);
  }

  if (fixedEnableSoundBtn) {
    fixedEnableSoundBtn.addEventListener("click", async () => {
      testAudio.muted = false;
      testAudio.currentTime = 0;
      pageAudio.currentTime = 0;
      setGlobalVolume(volumeSlider.value);

      const played = await tryPlayAudio(testAudio, pageAudio);
      if (played) {
        if (popup) popup.style.display = "none";
        showFixedEnableSoundBtn(false);
        setCookie("siteLoadedAndSoundEnabled", "true", 30);
      } else {
        alert("Could not play audio. Please check your browser's sound settings.");
      }
    });
  }

  if (volumeSlider) {
    volumeSlider.addEventListener("input", e => {
      setGlobalVolume(e.target.value);
    });
  }
});
