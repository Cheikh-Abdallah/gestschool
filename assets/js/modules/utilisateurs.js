/**
 * Module 12 : Utilisateurs et droits d'accès.
 * CRUD utilisateurs, changement de rôle, réinitialisation
 * de mot de passe, historique des actions.
 */
const Utilisateurs = {
  state: {
    tab: 'users', // 'users' | 'logs' | 'roles'
    page: 1,
    pageSize: 10,
    search: '',
    filtreRole: ''
  },

  render(container){
    if(!Auth.isAdmin()){
      container.innerHTML = `
        <div class="empty-module">
          <i class="bi bi-shield-lock"></i>
          <h5>Accès restreint</h5>
          <p>Seul l'administrateur peut gérer les utilisateurs.</p>
        </div>`;
      return;
    }

    this.container = container;
    container.innerHTML = `
      <div class="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
        <div>
          <div class="page-title">Utilisateurs et droits</div>
          <div class="page-sub">Comptes, rôles, permissions et historique</div>
        </div>
        <div class="d-flex gap-2">
          <button class="btn btn-outline-secondary btn-sm" id="btnChangeMdpSelf">
            <i class="bi bi-key me-1"></i> Mon mot de passe
          </button>
          <button class="btn btn-primary btn-sm" id="btnAddUser">
            <i class="bi bi-plus-lg me-1"></i> Nouvel utilisateur
          </button>
        </div>
      </div>

      <div class="card-panel">
        <ul class="nav nav-tabs nav-tabs-custom mb-3">
          <li class="nav-item"><a class="nav-link active" data-tab="users">Utilisateurs</a></li>
          <li class="nav-item"><a class="nav-link" data-tab="roles">Rôles et permissions</a></li>
          <li class="nav-item"><a class="nav-link" data-tab="logs">Historique des actions</a></li>
        </ul>
        <div id="userTabContent"></div>
      </div>

      <!-- Modale utilisateur -->
      <div class="modal fade" id="modalUser" tabindex="-1">
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content modal-user">
            <form id="formUser" novalidate>
              <div class="modal-header">
                <h6 class="modal-title" id="modalUserTitle">Nouvel utilisateur</h6>
                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
              </div>
              <div class="modal-body">
                <input type="hidden" id="uId">
                <div class="row g-3">
                  <div class="col-md-6">
                    <label class="form-label">Identifiant *</label>
                    <input class="form-control" id="uLogin" required autocomplete="off">
                    <div class="invalid-feedback">Identifiant obligatoire.</div>
                  </div>
                  <div class="col-md-6">
                    <label class="form-label">Nom complet *</label>
                    <input class="form-control" id="uNom" required>
                    <div class="invalid-feedback">Nom obligatoire.</div>
                  </div>
                  <div class="col-md-6">
                    <label class="form-label">Rôle *</label>
                    <select class="form-select" id="uRole" required>
                      ${Object.entries(Auth.ROLES).map(([key, r])=>`<option value="${key}">${r.label}</option>`).join('')}
                    </select>
                    <div class="invalid-feedback">Rôle obligatoire.</div>
                  </div>
                  <div class="col-md-6" id="wrapPassword">
                    <label class="form-label">Mot de passe *</label>
                    <input type="password" class="form-control" id="uPassword" autocomplete="new-password">
                    <div class="invalid-feedback">6 caractères minimum.</div>
                    <small class="text-muted" id="pwdHint">Minimum 6 caractères.</small>
                  </div>
                </div>
              </div>
              <div class="modal-footer">
                <button type="button" class="btn btn-light" data-bs-dismiss="modal">Annuler</button>
                <button type="submit" class="btn btn-primary">
                  <i class="bi bi-check2 me-1"></i> Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <!-- Modale mot de passe self -->
      <div class="modal fade" id="modalMdpSelf" tabindex="-1">
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content modal-user">
            <form id="formMdpSelf" novalidate>
              <div class="modal-header">
                <h6 class="modal-title"><i class="bi bi-key me-1"></i> Changer mon mot de passe</h6>
                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
              </div>
              <div class="modal-body">
                <div class="mb-3">
                  <label class="form-label">Ancien mot de passe *</label>
                  <input type="password" class="form-control" id="oldPwd" required>
                </div>
                <div class="mb-3">
                  <label class="form-label">Nouveau mot de passe *</label>
                  <input type="password" class="form-control" id="newPwd" required minlength="6">
                  <div class="invalid-feedback">6 caractères minimum.</div>
                </div>
                <div class="mb-3">
                  <label class="form-label">Confirmer le nouveau *</label>
                  <input type="password" class="form-control" id="confirmPwd" required>
                  <div class="invalid-feedback">Les mots de passe ne correspondent pas.</div>
                </div>
                <div id="mdpError" class="alert alert-danger py-2 small d-none"></div>
              </div>
              <div class="modal-footer">
                <button type="button" class="btn btn-light" data-bs-dismiss="modal">Annuler</button>
                <button type="submit" class="btn btn-primary">
                  <i class="bi bi-check2 me-1"></i> Changer
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    `;

    this.bindEvents();
    this.switchTab('users');
  },

  bindEvents(){
    document.querySelectorAll('.nav-tabs-custom .nav-link').forEach(l=>{
      l.onclick = (e)=>{
        e.preventDefault();
        this.switchTab(l.dataset.tab);
      };
    });
    document.getElementById('btnAddUser').onclick = ()=> this.openForm();
    document.getElementById('btnChangeMdpSelf').onclick = ()=> this.openMdpSelf();
    document.getElementById('formUser').onsubmit = (e)=>{ e.preventDefault(); this.save(); };
    document.getElementById('formMdpSelf').onsubmit = (e)=>{ e.preventDefault(); this.saveMdpSelf(); };
  },

  switchTab(tab){
    this.state.tab = tab;
    document.querySelectorAll('.nav-tabs-custom .nav-link').forEach(l=>{
      l.classList.toggle('active', l.dataset.tab === tab);
    });
    const content = document.getElementById('userTabContent');
    if(tab === 'users') this.renderUsers(content);
    else if(tab === 'roles') this.renderRoles(content);
    else if(tab === 'logs') this.renderLogs(content);
  },

  // ============================================================
  // ONGLET UTILISATEURS
  // ============================================================
  renderUsers(container){
    const users = Storage.getAllIncludingArchived('utilisateurs').filter(u=>!u.archived);
    const filtered = users.filter(u=>{
      if(this.state.filtreRole && u.role !== this.state.filtreRole) return false;
      if(this.state.search){
        const s = this.state.search;
        if(!((u.login||'').toLowerCase().includes(s) ||
             (u.nom||'').toLowerCase().includes(s))) return false;
      }
      return true;
    });

    const total = filtered.length;
    const totalPages = Math.max(1, Math.ceil(total / this.state.pageSize));
    if(this.state.page > totalPages) this.state.page = totalPages;
    const start = (this.state.page - 1) * this.state.pageSize;
    const pageList = filtered.slice(start, start + this.state.pageSize);

    const currentUserId = Auth.current()?.userId;

    container.innerHTML = `
      <div class="row g-2 mb-3">
        <div class="col-md-4">
          <div class="search-inline">
            <i class="bi bi-search"></i>
            <input type="text" id="uSearch" placeholder="Rechercher…" value="${Utils.escapeHtml(this.state.search)}">
          </div>
        </div>
        <div class="col-md-3">
          <select class="form-select form-select-sm" id="uFiltreRole">
            <option value="">Tous rôles</option>
            ${Object.entries(Auth.ROLES).map(([k,r])=>`<option value="${k}" ${this.state.filtreRole===k?'selected':''}>${r.label}</option>`).join('')}
          </select>
        </div>
      </div>

      <div class="table-responsive">
        <table class="table table-hover align-middle mb-0">
          <thead>
            <tr>
              <th>Identifiant</th>
              <th>Nom</th>
              <th>Rôle</th>
              <th>Dernière connexion</th>
              <th class="text-end">Actions</th>
            </tr>
          </thead>
          <tbody>
            ${pageList.map(u=>{
              const role = Auth.getRole(u.role) || {label:u.role, color:'secondary', icon:'bi-person'};
              const isSelf = u.id === currentUserId;
              return `<tr>
                <td><code>${Utils.escapeHtml(u.login)}</code>${isSelf?' <span class="badge bg-primary-subtle text-primary ms-1">Vous</span>':''}</td>
                <td>${Utils.escapeHtml(u.nom)}</td>
                <td><span class="badge bg-${role.color}-subtle text-${role.color}"><i class="bi ${role.icon} me-1"></i>${role.label}</span></td>
                <td class="small text-muted">${u.lastLogin ? Utils.formatDate(u.lastLogin) : '—'}</td>
                <td class="text-end">
                  <button class="btn btn-sm btn-light" title="Modifier" data-act="edit" data-id="${u.id}"><i class="bi bi-pencil"></i></button>
                  <button class="btn btn-sm btn-light" title="Réinitialiser mot de passe" data-act="reset" data-id="${u.id}"><i class="bi bi-key"></i></button>
                  ${!isSelf ? `<button class="btn btn-sm btn-light text-danger" title="Supprimer" data-act="del" data-id="${u.id}"><i class="bi bi-trash"></i></button>`:''}
                </td>
              </tr>`;
            }).join('') || `<tr><td colspan="5" class="text-center text-muted py-4">Aucun utilisateur.</td></tr>`}
          </tbody>
        </table>
      </div>

      <div class="d-flex flex-wrap justify-content-between align-items-center mt-3 gap-2">
        <small class="text-muted">${total} utilisateur(s)</small>
        <nav><ul class="pagination pagination-sm mb-0" id="uPagination"></ul></nav>
      </div>
    `;

    // Events
    document.getElementById('uSearch').addEventListener('input', e=>{
      this.state.search = e.target.value.trim().toLowerCase();
      this.state.page = 1;
      this.renderUsers(container);
    });
    document.getElementById('uFiltreRole').onchange = e=>{
      this.state.filtreRole = e.target.value;
      this.state.page = 1;
      this.renderUsers(container);
    };

    container.querySelectorAll('[data-act]').forEach(btn=>{
      btn.onclick = ()=>{
        const id = btn.dataset.id;
        const act = btn.dataset.act;
        if(act==='edit') this.openForm(id);
        else if(act==='reset') this.resetPassword(id);
        else if(act==='del') this.delete(id);
      };
    });

    // Pagination
    const pag = document.getElementById('uPagination');
    let html = '';
    html += `<li class="page-item ${this.state.page===1?'disabled':''}"><a class="page-link" href="#" data-p="${this.state.page-1}">«</a></li>`;
    for(let i=1;i<=totalPages;i++){
      html += `<li class="page-item ${i===this.state.page?'active':''}"><a class="page-link" href="#" data-p="${i}">${i}</a></li>`;
    }
    html += `<li class="page-item ${this.state.page===totalPages?'disabled':''}"><a class="page-link" href="#" data-p="${this.state.page+1}">»</a></li>`;
    pag.innerHTML = html;
    pag.querySelectorAll('a[data-p]').forEach(a=>{
      a.onclick = (ev)=>{
        ev.preventDefault();
        const p = parseInt(a.dataset.p);
        if(p>=1 && p<=totalPages){ this.state.page = p; this.renderUsers(container); }
      };
    });
  },

  // ============================================================
  // ONGLET RÔLES
  // ============================================================
  renderRoles(container){
    const MODULE_LABELS = {
      dashboard:'Tableau de bord', eleves:'Élèves', enseignants:'Enseignants',
      classes:'Classes', matieres:'Matières', notes:'Notes', absences:'Absences',
      paiements:'Paiements', bulletins:'Bulletins', emploi:'Emploi du temps',
      annees:'Années scolaires', rapports:'Rapports', utilisateurs:'Utilisateurs',
      parametres:'Paramètres'
    };

    container.innerHTML = `
      <div class="alert alert-light small border">
        <i class="bi bi-info-circle me-1"></i>
        Les permissions sont définies par rôle. Elles ne sont pas modifiables via l'interface pour préserver la cohérence du système.
      </div>
      <div class="roles-grid">
        ${Object.entries(Auth.ROLES).map(([key, r])=>`
          <div class="role-card border rounded p-3">
            <div class="d-flex align-items-center gap-2 mb-2">
              <div class="role-icon bg-${r.color}-subtle text-${r.color}">
                <i class="bi ${r.icon}"></i>
              </div>
              <div>
                <div class="fw-bold">${r.label}</div>
                <div class="small text-muted">${r.description}</div>
              </div>
            </div>
            <div class="small">
              <strong>Accès aux modules :</strong>
              <div class="mt-1">
                ${r.modules.map(m=>`<span class="badge bg-light text-dark border me-1 mb-1">${MODULE_LABELS[m]||m}</span>`).join('')}
              </div>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  },

  // ============================================================
  // ONGLET LOGS
  // ============================================================
  renderLogs(container){
    const logs = Auth.getLogs();

    container.innerHTML = `
      <div class="d-flex justify-content-between align-items-center mb-3">
        <div class="small text-muted">
          ${logs.length} action(s) enregistrée(s) · 500 dernières conservées
        </div>
        <button class="btn btn-sm btn-outline-danger" id="btnClearLogs">
          <i class="bi bi-trash me-1"></i> Purger les logs
        </button>
      </div>

      <div class="table-responsive" style="max-height:500px;overflow-y:auto;">
        <table class="table table-sm table-hover align-middle mb-0">
          <thead class="sticky-top bg-white">
            <tr>
              <th>Date</th>
              <th>Utilisateur</th>
              <th>Action</th>
              <th>Détails</th>
            </tr>
          </thead>
          <tbody>
            ${logs.length ? logs.map(l=>`
              <tr>
                <td class="small text-muted text-nowrap">${Utils.formatDate(l.date)} ${new Date(l.date).toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'})}</td>
                <td>
                  <strong>${Utils.escapeHtml(l.userNom)}</strong>
                  <br><small class="text-muted">${Utils.escapeHtml(l.role)}</small>
                </td>
                <td><span class="badge bg-secondary-subtle text-secondary">${Utils.escapeHtml(l.action)}</span></td>
                <td class="small">${Utils.escapeHtml(l.details||'')}</td>
              </tr>
            `).join('') : `<tr><td colspan="4" class="text-center text-muted py-4">Aucun log enregistré.</td></tr>`}
          </tbody>
        </table>
      </div>
    `;

    document.getElementById('btnClearLogs').onclick = ()=>{
      if(!confirm('Purger définitivement tous les logs ?')) return;
      Auth.clearLogs();
      Notify.toast('Logs purgés.', 'warning');
      this.renderLogs(container);
    };
  },

  // ============================================================
  // FORMULAIRE UTILISATEUR
  // ============================================================
  openForm(id=null){
    const modal = new bootstrap.Modal(document.getElementById('modalUser'));
    const form = document.getElementById('formUser');
    form.classList.remove('was-validated');

    if(id){
      const u = Storage.getById('utilisateurs', id);
      if(!u) return;
      document.getElementById('modalUserTitle').textContent = 'Modifier utilisateur · ' + u.login;
      document.getElementById('uId').value = u.id;
      document.getElementById('uLogin').value = u.login;
      document.getElementById('uNom').value = u.nom;
      document.getElementById('uRole').value = u.role;
      document.getElementById('uPassword').value = '';
      document.getElementById('uPassword').required = false;
      document.getElementById('pwdHint').textContent = 'Laisser vide pour ne pas changer.';
    } else {
      form.reset();
      document.getElementById('modalUserTitle').textContent = 'Nouvel utilisateur';
      document.getElementById('uId').value = '';
      document.getElementById('uPassword').required = true;
      document.getElementById('pwdHint').textContent = 'Minimum 6 caractères.';
    }
    modal.show();
  },

  save(){
    const form = document.getElementById('formUser');
    form.classList.add('was-validated');
    if(!form.checkValidity()) return;

    const id = document.getElementById('uId').value;
    const login = document.getElementById('uLogin').value.trim().toLowerCase();
    const nom = document.getElementById('uNom').value.trim();
    const role = document.getElementById('uRole').value;
    const password = document.getElementById('uPassword').value;

    // Vérifier doublon login
    const dup = Storage.getAllIncludingArchived('utilisateurs').find(u=>
      u.login.toLowerCase() === login && u.id !== id
    );
    if(dup){ Notify.toast('Cet identifiant existe déjà.', 'danger'); return; }

    if(id){
      const patch = {login, nom, role};
      if(password) patch.password = password;
      Storage.update('utilisateurs', id, patch);
      Auth.log('user_update', 'Modification de l\'utilisateur ' + login);
      Notify.toast('Utilisateur modifié.', 'success');
    } else {
      if(password.length < 6){
        Notify.toast('Le mot de passe doit contenir au moins 6 caractères.', 'danger');
        return;
      }
      Storage.create('utilisateurs', {login, nom, role, password});
      Auth.log('user_create', 'Création de l\'utilisateur ' + login + ' (' + role + ')');
      Notify.toast('Utilisateur créé.', 'success');
    }
    bootstrap.Modal.getInstance(document.getElementById('modalUser')).hide();
    this.renderUsers(document.getElementById('userTabContent'));
  },

  resetPassword(id){
    const u = Storage.getById('utilisateurs', id);
    if(!u) return;
    const newPwd = prompt(`Nouveau mot de passe pour "${u.login}" (6 caractères min) :`, '');
    if(newPwd === null) return;
    const result = Auth.resetPassword(id, newPwd);
    if(result.ok){
      Notify.toast('Mot de passe réinitialisé.', 'success');
    } else {
      Notify.toast(result.message, 'danger');
    }
  },

  delete(id){
    const u = Storage.getById('utilisateurs', id);
    if(!u) return;
    const currentUserId = Auth.current()?.userId;
    if(id === currentUserId){
      Notify.toast('Vous ne pouvez pas supprimer votre propre compte.', 'danger');
      return;
    }
    // Empêcher de supprimer le dernier admin
    if(u.role === 'admin'){
      const admins = Storage.getAll('utilisateurs').filter(x=>x.role === 'admin' && !x.archived);
      if(admins.length <= 1){
        Notify.toast('Impossible de supprimer le dernier administrateur.', 'danger');
        return;
      }
    }
    if(!confirm(`Supprimer l'utilisateur "${u.login}" ?\nCette action est irréversible.`)) return;
    Storage.remove('utilisateurs', id, true);
    Auth.log('user_delete', 'Suppression de l\'utilisateur ' + u.login);
    Notify.toast('Utilisateur supprimé.', 'warning');
    this.renderUsers(document.getElementById('userTabContent'));
  },

  // ============================================================
  // MOT DE PASSE SELF
  // ============================================================
  openMdpSelf(){
    const form = document.getElementById('formMdpSelf');
    form.reset();
    form.classList.remove('was-validated');
    document.getElementById('mdpError').classList.add('d-none');
    new bootstrap.Modal(document.getElementById('modalMdpSelf')).show();
  },

  saveMdpSelf(){
    const form = document.getElementById('formMdpSelf');
    form.classList.add('was-validated');

    const oldPwd = document.getElementById('oldPwd').value;
    const newPwd = document.getElementById('newPwd').value;
    const confirmPwd = document.getElementById('confirmPwd').value;
    const errEl = document.getElementById('mdpError');
    errEl.classList.add('d-none');

    if(newPwd !== confirmPwd){
      errEl.textContent = 'Les mots de passe ne correspondent pas.';
      errEl.classList.remove('d-none');
      return;
    }

    const current = Auth.current();
    if(!current) return;
    const result = Auth.changePassword(current.userId, oldPwd, newPwd);
    if(result.ok){
      Notify.toast('Mot de passe changé avec succès.', 'success');
      bootstrap.Modal.getInstance(document.getElementById('modalMdpSelf')).hide();
    } else {
      errEl.textContent = result.message;
      errEl.classList.remove('d-none');
    }
  }
};