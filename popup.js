(function () {
  const STORAGE_KEY = 're_instant_launch_enabled';
  const openReBtn = document.getElementById('openReBtn');
  const instantLaunchCheckbox = document.getElementById('instantLaunchCheckbox');

  function launchRelaxationTab() {
    const targetUrl = chrome.runtime.getURL('reset.html');
    chrome.tabs.query({ url: targetUrl }, (existingTabs) => {
      if (existingTabs && existingTabs.length > 0) {
        const tab = existingTabs[0];
        chrome.tabs.update(tab.id, { active: true });
        if (tab.windowId) {
          chrome.windows.update(tab.windowId, { focused: true });
        }
        window.close();
      } else {
        chrome.tabs.create({ url: targetUrl }, () => {
          window.close();
        });
      }
    });
  }

  // Load saved preference for instant launch
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'true') {
      instantLaunchCheckbox.checked = true;
      launchRelaxationTab();
      return;
    }
  } catch (_) {
    // Ignore storage errors in restricted contexts
  }

  openReBtn.addEventListener('click', launchRelaxationTab);

  instantLaunchCheckbox.addEventListener('change', (e) => {
    try {
      localStorage.setItem(STORAGE_KEY, e.target.checked ? 'true' : 'false');
    } catch (_) {}
  });
})();