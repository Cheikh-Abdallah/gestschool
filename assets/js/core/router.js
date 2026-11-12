/**
 * Routeur SPA léger via hash.
 * Chaque module enregistre une fonction render().
 */
const Router = {
  routes: {},
  defaultRoute: 'dashboard',

  register(name, renderFn){
    this.routes[name] = renderFn;
  },

  navigate(name){
    location.hash = '#/' + name;
  },

  handle(){
    const hash = location.hash.replace(/^#\//, '') || this.defaultRoute;
    const name = hash.split('?')[0];

    // PROTECTION : vérifier que le rôle a accès au module
    if(typeof Auth !== 'undefined' && Auth.canAccessCurrent && !Auth.canAccessCurrent(name)){
      document.getElementById('appContent').innerHTML = `
        <div class="empty-module">
          <i class="bi bi-shield-lock"></i>
          <h5>Accès refusé</h5>
          <p>Votre rôle ne vous permet pas d'accéder à ce module.</p>
        </div>`;
      return;
    }

    // Marquer le lien actif
    document.querySelectorAll('.nav-item').forEach(el=>{
      el.classList.toggle('active', el.dataset.route === name);
    });

    // Fermer la sidebar mobile
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');
    if(sidebar) sidebar.classList.remove('open');
    if(overlay) overlay.classList.remove('show');

    const content = document.getElementById('appContent');
    const fn = this.routes[name];

    if(!fn){
      content.innerHTML = `
        <div class="empty-module">
          <i class="bi bi-tools"></i>
          <h5>Module en préparation</h5>
          <p class="small">Ce module sera livré dans une prochaine étape du projet.</p>
        </div>`;
      return;
    }

    content.innerHTML = '';
    try {
      fn(content);
    } catch(err){
      console.error('[Router] Erreur dans le module "' + name + '":', err);
      content.innerHTML = `
        <div class="empty-module">
          <i class="bi bi-exclamation-triangle text-danger"></i>
          <h5>Erreur dans le module "${name}"</h5>
          <p class="small text-muted">${err.message}</p>
        </div>`;
    }
  },

  start(){
    window.addEventListener('hashchange', ()=> this.handle());
    this.handle();
  }
};