/**
 * Module : Gestion des étudiants (mode supérieur).
 * Réutilise la collection `eleves` mais avec un vocabulaire universitaire.
 * Champs supplémentaires : INE, tuteur, filière/niveau/groupe.
 */
const Etudiants = {
  state: {
    page: 1,
    pageSize: 10,
    search: '',
    filtreGroupe: '',
    filtreNiveau: '',
    filtreFiliere: '',
    filtreSexe: '',
    sortKey: 'nom',
    sortDir: 'asc'
  },

  render(container){
    this.container = container;
    container.innerHTML = `
      <div class="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
        <div>
          <div class="page-title">Étudiants</div>
          <div class="page-sub">Inscriptions universitaires et dossiers étudiants</div>
        </div>
        <div class="d-flex gap-2">
          <button class="btn btn-outline-secondary btn-sm" id="btnExportCsvEtu">
            <i class="bi bi-filetype-csv me-1"></i> Exporter CSV
          </button>
          <button class="btn btn-primary btn-sm" id="btnAddEtu">
            <i class="bi bi-plus-lg me-1"></i> Nouvel étudiant
          </button>
        </div>
      </div>

      <div class="card-panel">
        <div class="row g-2 mb-3">
          <div class="col-12 col-md-3">
            <div class="search-inline">
              <i class="bi bi-search"></i>
              <input type="text" id="fSearchEtu" placeholder="Rechercher (nom, INE, matricule…)">
            </div>
          </div>
          <div class="col-6 col-md-2">
            <select class="form-select form-select-sm" id="fFiliereEtu">
              <option value="">Toutes filières</option>
            </select>
          </div>
          <div class="col-6 col-md-2">
            <select class="form-select form-select-sm" id="fNiveauEtu">
              <option value="">Tous niveaux</option>
            </select>
          </div>
          <div class="col-6 col-md-2">
            <select class="form-select form-select-sm" id="fGroupeEtu">
              <option value="">Tous groupes</option>
            </select>
          </div>
          <div class="col-6 col-md-3">
            <button class="btn btn-outline-secondary btn-sm w-100" id="btnResetEtu">
              <i class="bi bi-arrow-counterclockwise me-1"></i> Réinitialiser
            </button>
          </div>
        </div>

        <div class="table-responsive">
          <table class="table table-hover align-middle mb-0" id="tblEtu">
            <thead>
              <tr>
                <th data-sort="matricule" style="cursor:pointer">Matricule / INE</th>
                <th data-sort="nom" style="cursor:pointer">Nom & Prénom</th>
                <th data-sort="sexe" style="cursor:pointer">Sexe</th>
                <th data-sort="groupe" style="cursor:pointer">Groupe</th>
                <th data-sort="niveau" style="cursor:pointer">Niveau</th>
                <th data-sort="dateNaissance" style="cursor:pointer">Naissance</th>
                <th class="text-end">Actions</th>
              </tr>
            </thead>
            <tbody id="tbodyEtu"></tbody>
          </table>
        </div>

        <div class="d-flex flex-wrap justify-content-between align-items-center mt-3 gap-2">
          <small class="text-muted" id="paginationInfoEtu"></small>
          <nav><ul class="pagination pagination-sm mb-0" id="paginationEtu"></ul></nav>
        </div>
      </div>

      <!-- Modale formulaire -->
      <div class="modal fade" id="modalEtu" tabindex="-1">
        <div class="modal-dialog modal-lg modal-dialog-centered">
          <div class="modal-content modal-sup">
            <form id="formEtu" novalidate>
              <div class="modal-header">
                <h6 class="modal-title" id="modalEtuTitle">Nouvel étudiant</h6>
                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
              </div>
              <div class="modal-body">
                <input type="hidden" id="etuId">
                <div class="row g-3">
                  <div class="col-md-4">
                    <label class="form-label">Matricule *</label>
                    <input class="form-control" id="etuMatricule" required>
                    <div class="invalid-feedback">Matricule obligatoire.</div>
                  </div>
                  <div class="col-md-4">
                    <label class="form-label">INE (si connu)</label>
                    <input class="form-control" id="etuINE" placeholder="Identifiant national étudiant">
                  </div>
                  <div class="col-md-4">
                    <label class="form-label">Date d'inscription</label>
                    <input type="date" class="form-control" id="etuDateInscription">
                  </div>

                  <div class="col-md-4">
                    <label class="form-label">Prénom *</label>
                    <input class="form-control" id="etuPrenom" required>
                    <div class="invalid-feedback">Prénom obligatoire.</div>
                  </div>
                  <div class="col-md-4">
                    <label class="form-label">Nom *</label>
                    <input class="form-control" id="etuNom" required>
                    <div class="invalid-feedback">Nom obligatoire.</div>
                  </div>
                  <div class="col-md-4">
                    <label class="form-label">Sexe *</label>
                    <select class="form-select" id="etuSexe" required>
                      <option value="">— Choisir —</option>
                      <option value="M">Masculin</option>
                      <option value="F">Féminin</option>
                    </select>
                    <div class="invalid-feedback">Sexe obligatoire.</div>
                  </div>

                  <div class="col-md-4">
                    <label class="form-label">Date de naissance</label>
                    <input type="date" class="form-control" id="etuDateNaissance">
                  </div>
                  <div class="col-md-4">
                    <label class="form-label">Lieu de naissance</label>
                    <input class="form-control" id="etuLieuNaissance">
                  </div>
                  <div class="col-md-4">
                    <label class="form-label">Nationalité</label>
                    <input class="form-control" id="etuNationalite" value="Sénégalaise">
                  </div>

                  <div class="col-md-6">
                    <label class="form-label">Email</label>
                    <input type="email" class="form-control" id="etuEmail">
                  </div>
                  <div class="col-md-6">
                    <label class="form-label">Téléphone</label>
                    <input class="form-control" id="etuTelephone">
                  </div>

                  <div class="col-12"><hr class="my-2"><small class="text-muted fw-semibold">Inscription académique</small></div>

                  <div class="col-md-4">
                    <label class="form-label">Filière *</label>
                    <select class="form-select" id="etuFiliere" required></select>
                    <div class="invalid-feedback">Filière obligatoire.</div>
                  </div>
                  <div class="col-md-4">
                    <label class="form-label">Niveau *</label>
                    <select class="form-select" id="etuNiveau" required></select>
                    <div class="invalid-feedback">Niveau obligatoire.</div>
                  </div>
                  <div class="col-md-4">
                    <label class="form-label">Groupe *</label>
                    <select class="form-select" id="etuGroupe" required></select>
                    <div class="invalid-feedback">Groupe obligatoire.</div>
                  </div>

                  <div class="col-12"><hr class="my-2"><small class="text-muted fw-semibold">Tuteur / Contact d'urgence</small></div>

                  <div class="col-md-6">
                    <label class="form-label">Nom du tuteur</label>
                    <input class="form-control" id="etuTuteur" placeholder="Optionnel pour étudiants majeurs">
                  </div>
                  <div class="col-md-6">
                    <label class="form-label">Téléphone du tuteur</label>
                    <input class="form-control" id="etuTelTuteur">
                  </div>

                  <div class="col-12"><hr class="my-2"><small class="text-muted fw-semibold">Divers</small></div>

                  <div class="col-md-6">
                    <label class="form-label">Adresse</label>
                    <input class="form-control" id="etuAdresse">
                  </div>
                  <div class="col-md-6">
                    <label class="form-label">Informations médicales</label>
                    <input class="form-control" id="etuInfosMed">
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
    `;

    this.bindEvents();
    this.populateFilters();
    this.refresh();
  },

  bindEvents(){
    document.getElementById('btnAddEtu').onclick = ()=> this.openForm();
    document.getElementById('btnResetEtu').onclick = ()=>{
      this.state = {...this.state, page:1, search:'', filtreGroupe:'', filtreNiveau:'', filtreFiliere:'', filtreSexe:''};
      document.getElementById('fSearchEtu').value='';
      document.getElementById('fFiliereEtu').value='';
      document.getElementById('fNiveauEtu').value='';
      document.getElementById('fGroupeEtu').value='';
      this.refresh();
    };
    document.getElementById('fSearchEtu').addEventListener('input', e=>{
      this.state.search = e.target.value.trim().toLowerCase();
      this.state.page = 1;
      this.refresh();
    });
    document.getElementById('fFiliereEtu').onchange = e=>{
      this.state.filtreFiliere = e.target.value;
      this.state.filtreNiveau = '';
      this.state.filtreGroupe = '';
      this.updateNiveauFilter();
      this.refresh();
    };
    document.getElementById('fNiveauEtu').onchange = e=>{
      this.state.filtreNiveau = e.target.value;
      this.state.filtreGroupe = '';
      this.updateGroupeFilter();
      this.refresh();
    };
    document.getElementById('fGroupeEtu').onchange = e=>{
      this.state.filtreGroupe = e.target.value;
      this.state.page = 1;
      this.refresh();
    };
    document.getElementById('btnExportCsvEtu').onclick = ()=> this.exportCsv();

    document.querySelectorAll('#tblEtu th[data-sort]').forEach(th=>{
      th.onclick = ()=>{
        const k = th.dataset.sort;
        if(this.state.sortKey === k) this.state.sortDir = this.state.sortDir==='asc'?'desc':'asc';
        else { this.state.sortKey = k; this.state.sortDir = 'asc'; }
        this.refresh();
      };
    });

    document.getElementById('formEtu').onsubmit = (e)=>{ e.preventDefault(); this.save(); };

    // Cascade filière → niveau → groupe
    document.getElementById('etuFiliere').onchange = ()=>{
      const fid = document.getElementById('etuFiliere').value;
      const niveaux = Storage.getAll('niveaux').filter(n=>n.filiereId === fid);
      document.getElementById('etuNiveau').innerHTML = niveaux.length
        ? '<option value="">— Choisir —</option>' + niveaux.map(n=>`<option value="${n.id}">${Utils.escapeHtml(n.libelle)}</option>`).join('')
        : '<option value="">— Aucun niveau —</option>';
      document.getElementById('etuGroupe').innerHTML = '<option value="">— Choisir le niveau d\'abord —</option>';
    };
    document.getElementById('etuNiveau').onchange = ()=>{
      const nid = document.getElementById('etuNiveau').value;
      const groupes = Storage.getAll('groupes').filter(g=>g.niveauId === nid);
      document.getElementById('etuGroupe').innerHTML = groupes.length
        ? '<option value="">— Choisir —</option>' + groupes.map(g=>`<option value="${g.id}">${Utils.escapeHtml(g.nom)}</option>`).join('')
        : '<option value="">— Aucun groupe —</option>';
    };
  },

  populateFilters(){
    const filieres = Storage.getAll('filieres');
    document.getElementById('fFiliereEtu').innerHTML = '<option value="">Toutes filières</option>' +
      filieres.map(f=>`<option value="${f.id}">${Utils.escapeHtml(f.code)}</option>`).join('');
    document.getElementById('fNiveauEtu').innerHTML = '<option value="">Tous niveaux</option>';
    document.getElementById('fGroupeEtu').innerHTML = '<option value="">Tous groupes</option>';

    // Select filière de la modale
    document.getElementById('etuFiliere').innerHTML = '<option value="">— Choisir —</option>' +
      filieres.map(f=>`<option value="${f.id}">${Utils.escapeHtml(f.code+' — '+f.nom)}</option>`).join('');
    document.getElementById('etuNiveau').innerHTML = '<option value="">— Choisir la filière d\'abord —</option>';
    document.getElementById('etuGroupe').innerHTML = '<option value="">— Choisir le niveau d\'abord —</option>';
  },

  updateNiveauFilter(){
    const fid = this.state.filtreFiliere;
    const niveaux = fid ? Storage.getAll('niveaux').filter(n=>n.filiereId === fid) : Storage.getAll('niveaux');
    document.getElementById('fNiveauEtu').innerHTML = '<option value="">Tous niveaux</option>' +
      niveaux.map(n=>`<option value="${n.id}">${Utils.escapeHtml(n.libelle)}</option>`).join('');
    document.getElementById('fGroupeEtu').innerHTML = '<option value="">Tous groupes</option>';
  },

  updateGroupeFilter(){
    const nid = this.state.filtreNiveau;
    const groupes = nid ? Storage.getAll('groupes').filter(g=>g.niveauId === nid) : Storage.getAll('groupes');
    document.getElementById('fGroupeEtu').innerHTML = '<option value="">Tous groupes</option>' +
      groupes.map(g=>`<option value="${g.id}">${Utils.escapeHtml(g.nom)}</option>`).join('');
  },

  getFiltered(){
    let list = Storage.getAll('eleves');
    const s = this.state;

    if(s.filtreGroupe) list = list.filter(e=>e.classeId === s.filtreGroupe);
    if(s.filtreNiveau){
      // Trouver les groupes de ce niveau
      const groupeIds = Storage.getAll('groupes').filter(g=>g.niveauId === s.filtreNiveau).map(g=>g.id);
      list = list.filter(e=>groupeIds.includes(e.classeId));
    }
    if(s.filtreFiliere){
      const niveauIds = Storage.getAll('niveaux').filter(n=>n.filiereId === s.filtreFiliere).map(n=>n.id);
      const groupeIds = Storage.getAll('groupes').filter(g=>niveauIds.includes(g.niveauId)).map(g=>g.id);
      list = list.filter(e=>groupeIds.includes(e.classeId));
    }
    if(s.filtreSexe) list = list.filter(e=>e.sexe === s.filtreSexe);

    if(s.search){
      list = list.filter(e=>
        (e.nom||'').toLowerCase().includes(s.search) ||
        (e.prenom||'').toLowerCase().includes(s.search) ||
        (e.matricule||'').toLowerCase().includes(s.search) ||
        (e.ine||'').toLowerCase().includes(s.search)
      );
    }

    const dir = s.sortDir==='asc'?1:-1;
    list.sort((a,b)=>{
      let va, vb;
      if(s.sortKey==='groupe'){
        va = Storage.getById('groupes', a.classeId)?.nom || '';
        vb = Storage.getById('groupes', b.classeId)?.nom || '';
      } else if(s.sortKey==='niveau'){
        const gA = Storage.getById('groupes', a.classeId);
        const gB = Storage.getById('groupes', b.classeId);
        va = Storage.getById('niveaux', gA?.niveauId)?.libelle || '';
        vb = Storage.getById('niveaux', gB?.niveauId)?.libelle || '';
      } else {
        va = a[s.sortKey] || ''; vb = b[s.sortKey] || '';
      }
      return va.toString().localeCompare(vb.toString(), 'fr') * dir;
    });
    return list;
  },

  refresh(){
    const list = this.getFiltered();
    const total = list.length;
    const totalPages = Math.max(1, Math.ceil(total / this.state.pageSize));
    if(this.state.page > totalPages) this.state.page = totalPages;
    const start = (this.state.page - 1) * this.state.pageSize;
    const pageList = list.slice(start, start + this.state.pageSize);

    const tbody = document.getElementById('tbodyEtu');
    tbody.innerHTML = pageList.length ? pageList.map(e=>{
      const groupe = Storage.getById('groupes', e.classeId);
      const niveau = groupe ? Storage.getById('niveaux', groupe.niveauId) : null;
      return `<tr>
        <td><span class="badge-matricule">${Utils.escapeHtml(e.matricule)}</span>${e.ine?`<br><small class="text-muted">INE: ${Utils.escapeHtml(e.ine)}</small>`:''}</td>
        <td><strong>${Utils.escapeHtml(e.prenom+' '+e.nom)}</strong></td>
        <td>${e.sexe==='M'?'<span class="badge bg-primary-subtle text-primary">M</span>':'<span class="badge bg-warning-subtle text-warning">F</span>'}</td>
        <td>${groupe?Utils.escapeHtml(groupe.nom):'<span class="text-muted">—</span>'}</td>
        <td>${niveau?`<span class="badge-cycle ${(Storage.getById('filieres', niveau.filiereId)?.cycle||'').toLowerCase()}">${Utils.escapeHtml(niveau.code)}</span>`:'—'}</td>
        <td>${Utils.formatDate(e.dateNaissance)}</td>
        <td class="text-end">
          <button class="btn btn-sm btn-light" title="Voir fiche" data-act="fiche" data-id="${e.id}"><i class="bi bi-eye"></i></button>
          <button class="btn btn-sm btn-light" title="Modifier" data-act="edit" data-id="${e.id}"><i class="bi bi-pencil"></i></button>
          <button class="btn btn-sm btn-light text-danger" title="Archiver" data-act="del" data-id="${e.id}"><i class="bi bi-trash"></i></button>
        </td>
      </tr>`;
    }).join('') : `<tr><td colspan="7" class="text-center text-muted py-4">Aucun étudiant.</td></tr>`;

    tbody.querySelectorAll('[data-act]').forEach(btn=>{
      btn.onclick = ()=>{
        const id = btn.dataset.id;
        const act = btn.dataset.act;
        if(act==='fiche') this.showFiche(id);
        else if(act==='edit') this.openForm(id);
        else if(act==='del') this.archive(id);
      };
    });

    document.getElementById('paginationInfoEtu').textContent =
      total === 0 ? '0 résultat' : `${start+1}–${Math.min(start+this.state.pageSize, total)} sur ${total} étudiant(s)`;

    this.renderPagination(totalPages);
  },

  renderPagination(totalPages){
    const pag = document.getElementById('paginationEtu');
    let html = `<li class="page-item ${this.state.page===1?'disabled':''}"><a class="page-link" href="#" data-p="${this.state.page-1}">«</a></li>`;
    for(let i=1;i<=totalPages;i++){
      if(totalPages>7 && i>2 && i<totalPages-1 && Math.abs(i-this.state.page)>1){
        if(i===3) html += `<li class="page-item disabled"><span class="page-link">…</span></li>`;
        continue;
      }
      html += `<li class="page-item ${i===this.state.page?'active':''}"><a class="page-link" href="#" data-p="${i}">${i}</a></li>`;
    }
    html += `<li class="page-item ${this.state.page===totalPages?'disabled':''}"><a class="page-link" href="#" data-p="${this.state.page+1}">»</a></li>`;
    pag.innerHTML = html;
    pag.querySelectorAll('a[data-p]').forEach(a=>{
      a.onclick = (ev)=>{
        ev.preventDefault();
        const p = parseInt(a.dataset.p);
        if(p>=1 && p<=totalPages){ this.state.page = p; this.refresh(); }
      };
    });
  },

  openForm(id=null){
    const modal = new bootstrap.Modal(document.getElementById('modalEtu'));
    const form = document.getElementById('formEtu');
    form.classList.remove('was-validated');

    if(id){
      const e = Storage.getById('eleves', id);
      if(!e) return;
      document.getElementById('modalEtuTitle').textContent = 'Modifier étudiant · ' + e.matricule;
      document.getElementById('etuId').value = e.id;
      document.getElementById('etuMatricule').value = e.matricule || '';
      document.getElementById('etuINE').value = e.ine || '';
      document.getElementById('etuDateInscription').value = e.dateInscription || '';
      document.getElementById('etuPrenom').value = e.prenom || '';
      document.getElementById('etuNom').value = e.nom || '';
      document.getElementById('etuSexe').value = e.sexe || '';
      document.getElementById('etuDateNaissance').value = e.dateNaissance || '';
      document.getElementById('etuLieuNaissance').value = e.lieuNaissance || '';
      document.getElementById('etuNationalite').value = e.nationalite || 'Sénégalaise';
      document.getElementById('etuEmail').value = e.email || '';
      document.getElementById('etuTelephone').value = e.telephone || '';
      document.getElementById('etuTuteur').value = e.nomTuteur || '';
      document.getElementById('etuTelTuteur').value = e.telephoneResponsable || '';
      document.getElementById('etuAdresse').value = e.adresse || '';
      document.getElementById('etuInfosMed').value = e.infosMed || '';

      // Cascade filière → niveau → groupe
      const groupe = Storage.getById('groupes', e.classeId);
      const niveau = groupe ? Storage.getById('niveaux', groupe.niveauId) : null;
      const filiere = niveau ? Storage.getById('filieres', niveau.filiereId) : null;

      if(filiere){
        document.getElementById('etuFiliere').value = filiere.id;
        const niveaux = Storage.getAll('niveaux').filter(n=>n.filiereId === filiere.id);
        document.getElementById('etuNiveau').innerHTML = niveaux.map(n=>`<option value="${n.id}" ${n.id===niveau.id?'selected':''}>${Utils.escapeHtml(n.libelle)}</option>`).join('');
        const groupes = Storage.getAll('groupes').filter(g=>g.niveauId === niveau.id);
        document.getElementById('etuGroupe').innerHTML = groupes.map(g=>`<option value="${g.id}" ${g.id===groupe.id?'selected':''}>${Utils.escapeHtml(g.nom)}</option>`).join('');
      }
    } else {
      form.reset();
      document.getElementById('modalEtuTitle').textContent = 'Nouvel étudiant';
      document.getElementById('etuId').value = '';
      document.getElementById('etuNationalite').value = 'Sénégalaise';

      // Matricule auto
      const all = Storage.getAllIncludingArchived('eleves');
      const maxNum = all.reduce((m,e)=>{
        const n = parseInt((e.matricule||'').replace(/\D/g,'')) || 0;
        return Math.max(m,n);
      }, 1000);
      document.getElementById('etuMatricule').value = 'ETU-' + (maxNum+1);
      document.getElementById('etuDateInscription').value = new Date().toISOString().slice(0,10);

      document.getElementById('etuNiveau').innerHTML = '<option value="">— Choisir la filière d\'abord —</option>';
      document.getElementById('etuGroupe').innerHTML = '<option value="">— Choisir le niveau d\'abord —</option>';
    }
    modal.show();
  },

  save(){
    const form = document.getElementById('formEtu');
    form.classList.add('was-validated');
    if(!form.checkValidity()) return;

    const id = document.getElementById('etuId').value;
    const anneeActive = Storage.getAllIncludingArchived('annees').find(a=>a.active);
    const data = {
      matricule: document.getElementById('etuMatricule').value.trim(),
      ine: document.getElementById('etuINE').value.trim(),
      prenom: document.getElementById('etuPrenom').value.trim(),
      nom: document.getElementById('etuNom').value.trim(),
      sexe: document.getElementById('etuSexe').value,
      dateNaissance: document.getElementById('etuDateNaissance').value,
      lieuNaissance: document.getElementById('etuLieuNaissance').value.trim(),
      nationalite: document.getElementById('etuNationalite').value.trim(),
      email: document.getElementById('etuEmail').value.trim(),
      telephone: document.getElementById('etuTelephone').value.trim(),
      dateInscription: document.getElementById('etuDateInscription').value,
      classeId: document.getElementById('etuGroupe').value,  // classeId = groupeId en mode sup
      nomTuteur: document.getElementById('etuTuteur').value.trim(),
      telephoneResponsable: document.getElementById('etuTelTuteur').value.trim(),
      adresse: document.getElementById('etuAdresse').value.trim(),
      infosMed: document.getElementById('etuInfosMed').value.trim(),
      anneeId: anneeActive?.id
    };

    const dup = Storage.getAllIncludingArchived('eleves').find(e =>
      e.matricule.toLowerCase() === data.matricule.toLowerCase() && e.id !== id
    );
    if(dup){ Notify.toast('Ce matricule existe déjà.', 'danger'); return; }

    if(id){
      Storage.update('eleves', id, data);
      Notify.toast('Étudiant modifié.', 'success');
    } else {
      Storage.create('eleves', data);
      Notify.toast('Étudiant inscrit.', 'success');
    }
    bootstrap.Modal.getInstance(document.getElementById('modalEtu')).hide();
    this.refresh();
  },

  archive(id){
    const e = Storage.getById('eleves', id);
    if(!e) return;
    if(!confirm(`Archiver l'étudiant ${e.prenom} ${e.nom} ?`)) return;
    Storage.remove('eleves', id, true);
    Notify.toast('Étudiant archivé.', 'warning');
    this.refresh();
  },

  showFiche(id){
    const e = Storage.getById('eleves', id);
    if(!e) return;
    const groupe = Storage.getById('groupes', e.classeId);
    const niveau = groupe ? Storage.getById('niveaux', groupe.niveauId) : null;
    const filiere = niveau ? Storage.getById('filieres', niveau.filiereId) : null;
    const param = Storage.read().parametres;
    const annee = Storage.getAllIncludingArchived('annees').find(a=>a.active);

    const html = `
      <div class="modal fade" id="modalFicheEtu" tabindex="-1">
        <div class="modal-dialog modal-lg modal-dialog-scrollable">
          <div class="modal-content">
            <div class="modal-header no-print">
              <h6 class="modal-title">Fiche étudiant</h6>
              <div class="d-flex gap-2">
                <button class="btn btn-sm btn-outline-secondary" onclick="window.print()">
                  <i class="bi bi-printer"></i> Imprimer
                </button>
                <button class="btn-close" data-bs-dismiss="modal"></button>
              </div>
            </div>
            <div class="modal-body">
              <div class="fiche-eleve">
                <div class="fiche-head">
                  <div>
                    <h5 class="mb-0">${Utils.escapeHtml(param.etablissement)}</h5>
                    <small class="text-muted">${Utils.escapeHtml(param.adresse)}</small><br>
                    <small class="text-muted">Année ${annee?.libelle||'—'}</small>
                  </div>
                </div>
                <h6 class="text-center my-3 fw-bold" style="letter-spacing:1px">FICHE ÉTUDIANT</h6>
                <table class="table table-bordered table-sm fiche-table">
                  <tbody>
                    <tr><th style="width:35%">Matricule</th><td>${Utils.escapeHtml(e.matricule)}</td></tr>
                    <tr><th>INE</th><td>${Utils.escapeHtml(e.ine||'—')}</td></tr>
                    <tr><th>Nom & Prénom</th><td><strong>${Utils.escapeHtml(e.prenom+' '+e.nom)}</strong></td></tr>
                    <tr><th>Sexe</th><td>${e.sexe==='M'?'Masculin':'Féminin'}</td></tr>
                    <tr><th>Date de naissance</th><td>${Utils.formatDate(e.dateNaissance)} à ${Utils.escapeHtml(e.lieuNaissance||'—')}</td></tr>
                    <tr><th>Nationalité</th><td>${Utils.escapeHtml(e.nationalite||'—')}</td></tr>
                    <tr><th>Filière</th><td>${filiere?Utils.escapeHtml(filiere.code+' — '+filiere.nom):'—'}</td></tr>
                    <tr><th>Niveau</th><td>${niveau?Utils.escapeHtml(niveau.libelle):'—'}</td></tr>
                    <tr><th>Groupe</th><td>${groupe?Utils.escapeHtml(groupe.nom):'—'}</td></tr>
                    <tr><th>Email</th><td>${Utils.escapeHtml(e.email||'—')}</td></tr>
                    <tr><th>Téléphone</th><td>${Utils.escapeHtml(e.telephone||'—')}</td></tr>
                    <tr><th>Adresse</th><td>${Utils.escapeHtml(e.adresse||'—')}</td></tr>
                    <tr><th>Tuteur</th><td>${Utils.escapeHtml(e.nomTuteur||'—')}</td></tr>
                    <tr><th>Tél. tuteur</th><td>${Utils.escapeHtml(e.telephoneResponsable||'—')}</td></tr>
                    <tr><th>Infos médicales</th><td>${Utils.escapeHtml(e.infosMed||'—')}</td></tr>
                  </tbody>
                </table>
                <div class="fiche-signatures">
                  <div>L'Étudiant<br><br><br>______________________</div>
                  <div>Le Directeur<br><br><br>${Utils.escapeHtml(param.directeur||'')}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
    // Insérer et afficher
    document.body.insertAdjacentHTML('beforeend', html);
    const modalEl = document.getElementById('modalFicheEtu');
    modalEl.addEventListener('hidden.bs.modal', ()=> modalEl.remove());
    new bootstrap.Modal(modalEl).show();
  },

  exportCsv(){
    const list = this.getFiltered();
    const rows = [['Matricule','INE','Prénom','Nom','Sexe','Date naissance','Filière','Niveau','Groupe','Email','Téléphone']];
    list.forEach(e=>{
      const groupe = Storage.getById('groupes', e.classeId);
      const niveau = groupe ? Storage.getById('niveaux', groupe.niveauId) : null;
      const filiere = niveau ? Storage.getById('filieres', niveau.filiereId) : null;
      rows.push([
        e.matricule, e.ine||'', e.prenom, e.nom, e.sexe, e.dateNaissance||'',
        filiere?filiere.code:'', niveau?niveau.code:'', groupe?groupe.nom:'',
        e.email||'', e.telephone||''
      ]);
    });
    const csv = rows.map(r=>r.map(v=>`"${String(v??'').replace(/"/g,'""')}"`).join(';')).join('\n');
    const blob = new Blob(['\ufeff'+csv], {type:'text/csv;charset=utf-8;'});
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'etudiants_'+new Date().toISOString().slice(0,10)+'.csv';
    a.click();
    Notify.toast('Export CSV généré.', 'success');
  }
};