// Custom Scrollbar initializer
(function(){
  function applyCustomScroll(enabled){
    const targets = [document.body, document.querySelector('.main-content'), document.querySelector('.library-main'), document.querySelector('.product-grid'), document.querySelector('.tab-panels'), document.querySelector('.cart-items')];
    targets.forEach(el=>{ if(!el) return; if(enabled) el.classList.add('custom-scroll'); else el.classList.remove('custom-scroll'); });
  }

  function init(){
    const pref = localStorage.getItem('useCustomScroll');
    const enabled = pref === null ? true : pref === 'true';
    applyCustomScroll(enabled);
    // expose API
    window.CustomScrollbar = {
      enabled: enabled,
      toggle: function(on){
        const val = typeof on === 'boolean' ? on : !window.CustomScrollbar.enabled;
        window.CustomScrollbar.enabled = val;
        localStorage.setItem('useCustomScroll', val.toString());
        applyCustomScroll(val);
      },
      apply: applyCustomScroll
    };

    // Add a quick keyboard shortcut: Ctrl+Shift+S to toggle
    document.addEventListener('keydown', function(e){
      if(e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 's'){
        window.CustomScrollbar.toggle();
        const status = window.CustomScrollbar.enabled ? 'aktif' : 'devre dışı';
        if(window.showToast) showToast(`Custom scrollbar ${status}`, 'info');
      }
    });
  }

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
