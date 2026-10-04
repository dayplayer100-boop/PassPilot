'use strict';
// Open public links in the separate viewer, before starting the private app.
function openPublicPass() {
  if (/^#(?:pass|online|handoff|asset)=/.test(location.hash)) {
    location.replace(new URL('pass/' + location.hash, location.href));
  }
}
window.addEventListener('hashchange', openPublicPass);
openPublicPass();
