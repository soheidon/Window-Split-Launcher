const defaults = {
  defaultUrl: "https://chatgpt.com/",
  targetPosition: "right",
  mainRatio: 0.6,
  overlapPx: 8
};

document.addEventListener("DOMContentLoaded", () => {
  const urlInput = document.getElementById("defaultUrl");
  const ratioRange = document.getElementById("mainRatio");
  const ratioValue = document.getElementById("ratioValue");
  const overlapRange = document.getElementById("overlapPx");
  const overlapValue = document.getElementById("overlapValue");
  const saveBtn = document.getElementById("saveBtn");
  const statusEl = document.getElementById("status");

  chrome.storage.sync.get(defaults, (settings) => {
    urlInput.value = settings.defaultUrl;

    const radios = document.getElementsByName("targetPosition");
    for (const radio of radios) {
      if (radio.value === settings.targetPosition) {
        radio.checked = true;
      }
    }

    const pct = Math.round((settings.mainRatio ?? defaults.mainRatio) * 100);
    ratioRange.value = pct;
    updateRatioDisplay(pct);

    ratioRange.addEventListener("input", () => {
      updateRatioDisplay(parseInt(ratioRange.value, 10));
    });

    overlapRange.value = settings.overlapPx ?? defaults.overlapPx;
    overlapValue.textContent = overlapRange.value + "px";

    overlapRange.addEventListener("input", () => {
      overlapValue.textContent = overlapRange.value + "px";
    });
  });

  function updateRatioDisplay(currentPct) {
    const targetPct = 100 - currentPct;
    ratioValue.textContent = currentPct + " : " + targetPct;
  }

  saveBtn.addEventListener("click", () => {
    const url = urlInput.value.trim() || defaults.defaultUrl;

    let targetPosition = defaults.targetPosition;
    const radios = document.getElementsByName("targetPosition");
    for (const radio of radios) {
      if (radio.checked) {
        targetPosition = radio.value;
      }
    }

    const mainRatio = parseInt(ratioRange.value, 10) / 100;
    const overlapPx = parseInt(overlapRange.value, 10);

    chrome.storage.sync.set(
      { defaultUrl: url, targetPosition, mainRatio, overlapPx },
      () => {
        statusEl.textContent = "Saved.";
        setTimeout(() => { statusEl.textContent = ""; }, 2000);
      }
    );
  });
});
