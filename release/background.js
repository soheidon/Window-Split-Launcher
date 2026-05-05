const MIN_WIDTH = 420;
const MIN_HEIGHT = 400;

chrome.action.onClicked.addListener(async () => {
  const settings = await loadSettings();

  let current = await chrome.windows.getLastFocused();

  if (!current || !current.id) {
    console.warn("No focused window found.");
    return;
  }

  if (current.state !== "normal") {
    await chrome.windows.update(current.id, { state: "normal" });
    current = await chrome.windows.get(current.id);
  }

  const displays = await chrome.system.display.getInfo();
  const workArea = getWorkAreaForWindow(current, displays);
  if (!workArea) {
    console.warn("Could not determine display work area.");
    return;
  }

  const url = settings.defaultUrl || "https://chatgpt.com/";
  const targetPosition = settings.targetPosition || "right";
  const mainRatio = settings.mainRatio ?? 0.6;
  const overlapPx = settings.overlapPx ?? 8;

  const baseLeft = workArea.left;
  const baseTop = workArea.top;
  const baseWidth = workArea.width;
  const baseHeight = workArea.height;

  if (baseWidth < MIN_WIDTH * 2 || baseHeight < MIN_HEIGHT) {
    console.warn("Not enough screen space for split layout.");
    return;
  }

  let mainWidth = Math.floor(baseWidth * mainRatio);
  let targetWidth = baseWidth - mainWidth;

  if (mainWidth < MIN_WIDTH || targetWidth < MIN_WIDTH) {
    mainWidth = Math.floor(baseWidth / 2);
    targetWidth = baseWidth - mainWidth;
  }

  if (mainWidth < MIN_WIDTH) {
    console.warn("Not enough screen space for split layout after adjustment.");
    return;
  }

  if (targetPosition === "right") {
    await chrome.windows.update(current.id, {
      left: baseLeft,
      top: baseTop,
      width: mainWidth,
      height: baseHeight,
      state: "normal"
    });

    await chrome.windows.create({
      url,
      left: baseLeft + mainWidth - overlapPx,
      top: baseTop,
      width: targetWidth + overlapPx,
      height: baseHeight,
      type: "normal"
    });
  } else {
    await chrome.windows.update(current.id, {
      left: baseLeft + targetWidth - overlapPx,
      top: baseTop,
      width: mainWidth + overlapPx,
      height: baseHeight,
      state: "normal"
    });

    await chrome.windows.create({
      url,
      left: baseLeft,
      top: baseTop,
      width: targetWidth,
      height: baseHeight,
      type: "normal"
    });
  }
});

function getWorkAreaForWindow(win, displays) {
  const winLeft = win.left ?? 0;
  const winTop = win.top ?? 0;
  const winWidth = win.width ?? 1200;
  const winHeight = win.height ?? 800;

  const centerX = winLeft + winWidth / 2;
  const centerY = winTop + winHeight / 2;

  const display = displays.find((d) => {
    const area = d.bounds;
    return (
      centerX >= area.left &&
      centerX < area.left + area.width &&
      centerY >= area.top &&
      centerY < area.top + area.height
    );
  });

  return display?.workArea || {
    left: winLeft,
    top: winTop,
    width: Math.max(winWidth, 1200),
    height: Math.max(winHeight, 800)
  };
}

function loadSettings() {
  return new Promise((resolve) => {
    chrome.storage.sync.get(
      { defaultUrl: "https://chatgpt.com/", targetPosition: "right", mainRatio: 0.6, overlapPx: 8 },
      resolve
    );
  });
}
