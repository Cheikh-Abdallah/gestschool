/**
 * Point d'entrée de l'application.
 * Initialise DB, session, sidebar, routeur, permissions.
 */
(function(){
  // 1. Init DB (seed si vide)
  DB.init();

  // 2. Auth obligatoire
  const session = Auth.requireAuth();
  if(!session) return;

  // 3. Peupler header
  document.getElementById('userName').textContent = session.nom;
  document.getElementById('userRole').textContent = session.role;
  document.getElementById('userAvatar').textContent = session.nom[0].toUpperCase();

  const annee = Storage.getAllIncludingArchived('annees').find(a=>a.active);
  if(annee) document.getElementById('anneeBadge').textContent = 'Année ' + annee.libelle;

  // 4. Setup premier démarrage (choix type d'établissement)
  Setup.run();

  // 5. Menu — libellés adaptés au type d'établissement
  const MENU = [
    {route:'dashboard',   icon:'bi-speedometer2',      label:'Tableau de bord'},
    {route:'eleves',      icon:'bi-people-fill',       label:Utils.label('Eleves')},
    {route:'enseignants', icon:'bi-person-workspace',  label:'Enseignants'},
    {route:'classes',     icon:'bi-building',          label:Utils.label('Classes')},
    {route:'matieres',    icon:'bi-book',              label:Utils.label('Matieres')},
    {route:'filieres',    icon:'bi-diagram-3',        label:'Filières'},
    {route:'niveaux',     icon:'bi-layers',           label:'Niveaux'},
    {route:'ue',          icon:'bi-journal-bookmark', label:'Unités d\'Enseignement'},
    {route:'ecue',        icon:'bi-journal-check',    label:'ECUE'},
    {route:'notes',       icon:'bi-pencil-square',     label:'Notes et évaluations'},
    {route:'absences',    icon:'bi-calendar-x',        label:'Absences et retards'},
    {route:'paiements',   icon:'bi-cash-stack',        label:'Paiements'},
    {route:'bulletins',   icon:'bi-file-earmark-text', label:Utils.label('Bulletins')},
    {route:'emploi',      icon:'bi-calendar3',         label:'Emploi du temps'},
    {route:'annees',      icon:'bi-calendar-range',    label:'Années scolaires'},
    {route:'rapports',    icon:'bi-bar-chart-line',    label:'Rapports'},
    {route:'utilisateurs',icon:'bi-person-gear',       label:'Utilisateurs'},
    {route:'parametres',  icon:'bi-gear',              label:'Paramètres'}
  ];

   const nav = document.getElementById('sidebarNav');
  nav.innerHTML = MENU
    .filter(m => Auth.canAccess(session.role, m.route))
    .filter(m => {
      // Les modules supérieur ne s'affichent QUE si typeEtablissement === 'superieur'
      const supOnly = ['filieres','niveaux','ue','ecue'];
      if(supOnly.includes(m.route) && !Utils.isSuperieur()) return false;
      return true;
    })
    .map(m => `
      <a class="nav-item" data-route="${m.route}" href="#/${m.route}">
        <i class="bi ${m.icon}"></i><span>${m.label}</span>
      </a>`).join('');

  // 6. Enregistrer les modules (une seule fois, avec protection)
  const MODULES = {
    dashboard:    ()=>Dashboard,
    eleves:       ()=> Utils.isSuperieur() ? Etudiants : Eleves,
    enseignants:  ()=>Enseignants,
    classes:      ()=> Utils.isSuperieur() ? Groupes : Classes,
    matieres:     ()=>Matieres,
    notes:        ()=> Utils.isSuperieur() ? NotesLMD : Notes,
    absences:     ()=>Absences,
    paiements:    ()=>Paiements,
    bulletins:    ()=> Utils.isSuperieur() ? BulletinsLMD : Bulletins,
    annees:       ()=>Annees,
    emploi:       ()=>Emploi,
    utilisateurs: ()=>Utilisateurs,
    parametres:   ()=>Parametres,
        rapports:     ()=> Utils.isSuperieur() ? RapportsLMD : Rapports,
    filieres:     ()=>Filieres,
    niveaux:      ()=>Niveaux,
    ue:           ()=>UE,
    ecue:         ()=>ECUE,
    
  };

  Object.entries(MODULES).forEach(([route, getter])=>{
    Router.register(route, (c)=>{
      try {
        const mod = getter();
        if(!mod || typeof mod.render !== 'function'){
          throw new Error('Module ' + route + ' non chargé');
        }
        mod.render(c);
      } catch(err){
        console.error('[Module ' + route + ']', err);
        c.innerHTML = `
          <div class="empty-module">
            <i class="bi bi-exclamation-triangle text-danger"></i>
            <h5>Erreur dans le module "${route}"</h5>
            <p class="small text-muted">${Utils.escapeHtml(err.message)}</p>
          </div>`;
      }
    });
  });

  // 7. Démarrer routeur
  Router.start();

  // 8. UI : toggle sidebar mobile
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebarOverlay');
  document.getElementById('btnToggleSidebar').addEventListener('click', ()=>{
    sidebar.classList.add('open');
    overlay.classList.add('show');
  });
  overlay.addEventListener('click', ()=>{
    sidebar.classList.remove('open');
    overlay.classList.remove('show');
  });

  // 9. Logout
  document.getElementById('btnLogout').addEventListener('click', ()=> Auth.logout());

  // 10. Recherche globale (démo)
  document.getElementById('globalSearch').addEventListener('keydown', e=>{
    if(e.key === 'Enter'){
      Notify.toast('Recherche « ' + e.target.value + ' » — à connecter aux modules.', 'info');
    }
  });
})();