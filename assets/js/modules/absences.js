/**
 * Module 7 : Gestion des absences et retards.
 * Enregistrement, justification, filtres, suivi par classe,
 * rapports imprimables.
 */
const Absences = {
  state: {
    page: 1,
    pageSize: 15,
    search: '',
    filtreClasse: '',
    filtreType: '',
    filtreStatut: '',
    filtreDateFrom: '',
    filtreDateTo: '',
    sortKey: 'date',
    sortDir: 'desc'
  },

  render(container){
    this.container = container;
    container.innerHTML = `
      <div class="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
        <div>
          <div class="page-title">Absences et retards</div>
          <div class="page-sub">Enregistrement, justification et suivi</div>
        </div>
        <div class="d-flex gap-2 flex-wrap">
          <button class="btn btn-outline-secondary btn-sm" id="btnRapportAbs">
            <i class="bi bi-printer me-1"></i> Rapport
          </button>
          <button class="btn btn-outline-primary btn-sm" id="btnExportCsvAbs">
            <i class="bi bi-filetype-csv me-1"></i> CSV
          </button>
          <button class="btn btn-primary btn-sm" id="btnAddAbs">
            <i class="bi bi-plus-lg me-1"></i> Nouvel enregistrement
          </button>
        </div>
      </div>

      <div class="row g-3 mb-3">
        <div class="col-6 col-md-3">
          <div class="stat-card">
            <div class="stat-icon red"><i class="bi bi-x-circle-fill"></i></div>
            <div><div class="stat-value" id="statAbsTotal">0</div><div class="stat-label">Absences</div></div>
          </div>
        </div>
        <div class="col-6 col-md-3">
          <div class="stat-card">
            <div class="stat-icon orange"><i class="bi bi-clock-history"></i></div>
            <div><div class="stat-value" id="statRetards">0</div><div class="stat-label">Retards</div></div>
          </div>
        </div>
        <div class="col-6 col-md-3">
          <div class="stat-card">
            <div class="stat-icon green"><i class="bi bi-check-circle-fill"></i></div>
            <div><div class="stat-value" id="statJustifiees">0</div><div class="stat-label">Justifiées</div></div>
          </div>
        </div>
        <div class="col-6 col-md-3">
          <div class="stat-card">
            <div class="stat-icon red"><i class="bi bi-exclamation-circle-fill"></i></div>
            <div><div class="stat-value" id="statNonJust">0</div><div class="stat-label">Non justifiées</div></div>
          </div>
        </div>
      </div>

      <!-- Suivi par classe -->
      <div class="card-panel">
        <h6><i class="bi bi-bar-chart-fill"></i> Suivi des absences par classe</h6>
        <div class="table-responsive">
          <table class="table table-sm align-middle mb-0" id="tblSuiviCls">
            <thead>
              <tr>
                <th>Classe</th>
                <th>Effectif</th>
                <th>Absences</th>
                <th>Retards</th>
                <th>Justifiées</th>
                <th>Non justif.</th>
                <th>Taux</th>
              </tr>
            </thead>
            <tbody id="tbodySuiviCls"></tbody>
          </table>
        </div>
      </div>

      <!-- Liste détaillée -->
      <div class="card-panel">
        <h6><i class="bi bi-list-ul"></i> Historique des absences et retards</h6>
        <div class="row g-2 mb-3">
          <div class="col-12 col-md-3">
            <div class="search-inline">
              <i class="bi bi-search"></i>
              <input type="text" id="fSearchAbs" placeholder="Rechercher un élève…">
            </div>
          </div>
          <div class="col-6 col-md-2">
            <select class="form-select form-select-sm" id="fClasseAbs"><option value="">Toutes classes</option></select>
          </div>
          <div class="col-6 col-md-1">
            <select class="form-select form-select-sm" id="fTypeAbs">
              <option value="">Tous</option>
              <option value="absence">Absence</option>
              <option value="retard">Retard</option>
            </select>
          </div>
          <div class="col-6 col-md-2">
            <select class="form-select form-select-sm" id="fStatutAbs">
              <option value="">Tous statuts</option>
              <option value="justifie">Justifiées</option>
              <option value="non">Non justifiées</option>
            </select>
          </div>
          <div class="col-6 col-md-2">
            <input type="date" class="form-control form-control-sm" id="fFromAbs" title="Du">
          </div>
          <div class="col-6 col-md-2">
            <input type="date" class="form-control form-control-sm" id="fToAbs" title="Au">
          </div>
          <div class="col-12">
            <button class="btn btn-outline-secondary btn-sm" id="btnResetAbs">
              <i class="bi bi-arrow-counterclockwise me-1"></i> Réinitialiser filtres
            </button>
          </div>
        </div>

        <div class="table-responsive">
          <table class="table table-hover align-middle mb-0" id="tblAbs">
            <thead>
              <tr>
                <th data-sort="date" style="cursor:pointer">Date</th>
                <th data-sort="eleve" style="cursor:pointer">Élève</th>
                <th data-sort="classe" style="cursor:pointer">Classe</th>
                <th data-sort="type" style="cursor:pointer">Type</th>
                <th data-sort="motif" style="cursor:pointer">Motif</th>
                <th data-sort="justifie" style="cursor:pointer">Statut</th>
                <th class="text-end">Actions</th>
              </tr>
            </thead>
            <tbody id="tbodyAbs"></tbody>
          </table>
        </div>

        <div class="d-flex flex-wrap justify-content-between align-items-center mt-3 gap-2">
          <small class="text-muted" id="paginationInfoAbs"></small>
          <nav><ul class="pagination pagination-sm mb-0" id="paginationAbs"></ul></nav>
        </div>
      </div>

      <!-- Modale formulaire -->
      <div class="modal fade" id="modalAbs" tabindex="-1">
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content modal-abs">
            <form id="formAbs" novalidate>
              <div class="modal-header">
                <h6 class="modal-title" id="modalAbsTitle">Nouvel enregistrement</h6>
                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
              </div>
              <div class="modal-body">
                <input type="hidden" id="absId">
                <div class="row g-3">
                  <div class="col-md-6">
                    <label class="form-label">Classe *</label>
                    <select class="form-select" id="absClasse" required></select>
                    <div class="invalid-feedback">Classe obligatoire.</div>
                  </div>
                  <div class="col-md-6">
                    <label class="form-label">Élève *</label>
                    <select class="form-select" id="absEleve" required></select>
                    <div class="invalid-feedback">Élève obligatoire.</div>
                  </div>

                  <div class="col-md-6">
                    <label class="form-label">Type *</label>
                    <select class="form-select" id="absType" required>
                      <option value="absence">Absence</option>
                      <option value="retard">Retard</option>
                    </select>
                  </div>
                  <div class="col-md-6">
                    <label class="form-label">Date *</label>
                    <input type="date" class="form-control" id="absDate" required>
                    <div class="invalid-feedback">Date obligatoire.</div>
                  </div>

                  <div class="col-md-6">
                    <label class="form-label">Heure (retard)</label>
                    <input type="time" class="form-control" id="absHeure">
                  </div>
                  <div class="col-md-6">
                    <label class="form-label">Motif</label>
                    <input class="form-control" id="absMotif" placeholder="Maladie, RDV…">
                  </div>

                  <div class="col-md-12">
                    <label class="form-label">Justification</label>
                    <select class="form-select" id="absJustifie">
                      <option value="non">Non justifiée</option>
                      <option value="oui">Justifiée</option>
                    </select>
                  </div>
                  <div class="col-12" id="absJustifDetailWrap" style="display:none;">
                    <label class="form-label">Détail de la justification</label>
                    <input class="form-control" id="absJustifDetail" placeholder="Certificat médical, mot des parents…">
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

      <!-- Modale rapport -->
      <div class="modal fade" id="modalRapportAbs" tabindex="-1">
        <div class="modal-dialog modal-lg modal-dialog-scrollable">
          <div class="modal-content">
            <div class="modal-header no-print">
              <h6 class="modal-title"><i class="bi bi-file-text me-1"></i> Rapport d'absences</h6>
              <div class="d-flex gap-2">
                <button class="btn btn-sm btn-outline-secondary" id="btnPrintRapportAbs">
                  <i class="bi bi-printer"></i> Imprimer
                </button>
                <button class="btn-close" data-bs-dismiss="modal"></button>
              </div>
            </div>
            <div class="modal-body" id="rapportAbsBody"></div>
          </div>
        </div>
      </div>
    `;

    this.bindEvents();
    this.populateFilters();
    this.refresh();
  },

  bindEvents(){
    document.getElementById('btnAddAbs').onclick = ()=> this.openForm();
    document.getElementById('btnResetAbs').onclick = ()=>{
      this.state = {...this.state, page:1, search:'', filtreClasse:'', filtreType:'', filtreStatut:'', filtreDateFrom:'', filtreDateTo:''};
      document.getElementById('fSearchAbs').value='';
      document.getElementById('fClasseAbs').value='';
      document.getElementById('fTypeAbs').value='';
      document.getElementById('fStatutAbs').value='';
      document.getElementById('fFromAbs').value='';
      document.getElementById('fToAbs').value='';
      this.refresh();
    };
    document.getElementById('fSearchAbs').addEventListener('input', e=>{
      this.state.search = e.target.value.trim().toLowerCase();
      this.state.page = 1;
      this.refresh();
    });
    document.getElementById('fClasseAbs').onchange = e=>{ this.state.filtreClasse=e.target.value; this.state.page=1; this.refresh(); };
    document.getElementById('fTypeAbs').onchange   = e=>{ this.state.filtreType=e.target.value;   this.state.page=1; this.refresh(); };
    document.getElementById('fStatutAbs').onchange = e=>{ this.state.filtreStatut=e.target.value; this.state.page=1; this.refresh(); };
    document.getElementById('fFromAbs').onchange   = e=>{ this.state.filtreDateFrom=e.target.value; this.state.page=1; this.refresh(); };
    document.getElementById('fToAbs').onchange     = e=>{ this.state.filtreDateTo=e.target.value;   this.state.page=1; this.refresh(); };

    document.querySelectorAll('#tblAbs th[data-sort]').forEach(th=>{
      th.onclick = ()=>{
        const k = th.dataset.sort;
        if(this.state.sortKey === k) this.state.sortDir = this.state.sortDir==='asc'?'desc':'asc';
        else { this.state.sortKey = k; this.state.sortDir = 'asc'; }
        this.refresh();
      };
    });

    document.getElementById('formAbs').onsubmit = (e)=>{ e.preventDefault(); this.save(); };
    document.getElementById('btnRapportAbs').onclick = ()=> this.openRapport();
    document.getElementById('btnPrintRapportAbs').onclick = ()=> window.print();
    document.getElementById('btnExportCsvAbs').onclick = ()=> this.exportCsv();

    // Recharger élèves selon classe
    document.getElementById('absClasse').onchange = ()=>{
      this.populateElevesSelect();
    };
    // Afficher/masquer le détail de justification
    document.getElementById('absJustifie').onchange = (e)=>{
      const wrap = document.getElementById('absJustifDetailWrap');
      wrap.style.display = e.target.value === 'oui' ? 'block' : 'none';
    };
  },

  populateFilters(){
    const classes = Storage.getAll('classes');
    document.getElementById('fClasseAbs').innerHTML =
      '<option value="">Toutes classes</option>' +
      classes.map(c=>`<option value="${c.id}">${Utils.escapeHtml(c.nom)}</option>`).join('');
    document.getElementById('absClasse').innerHTML =
      '<option value="">— Choisir —</option>' +
      classes.map(c=>`<option value="${c.id}">${Utils.escapeHtml(c.nom)}</option>`).join('');
  },

  populateElevesSelect(selectedId=null){
    const classeId = document.getElementById('absClasse').value;
    const sel = document.getElementById('absEleve');
    if(!classeId){
      sel.innerHTML = '<option value="">— Choisir une classe d\'abord —</option>';
      return;
    }
    const eleves = Storage.getAll('eleves').filter(e=>e.classeId===classeId).sort((a,b)=>a.nom.localeCompare(b.nom));
    sel.innerHTML = '<option value="">— Choisir —</option>' +
      eleves.map(e=>`<option value="${e.id}" ${e.id===selectedId?'selected':''}>${Utils.escapeHtml(e.matricule+' — '+e.prenom+' '+e.nom)}</option>`).join('');
  },

  getFiltered(){
    let list = Storage.getAll('absences');
    const s = this.state;

    if(s.filtreClasse){
      list = list.filter(a=>{
        const el = Storage.getById('eleves', a.eleveId);
        return el && el.classeId === s.filtreClasse;
      });
    }
    if(s.filtreType)   list = list.filter(a=>a.type === s.filtreType);
    if(s.filtreStatut) list = list.filter(a=> s.filtreStatut==='justifie' ? a.justifie : !a.justifie);
    if(s.filtreDateFrom) list = list.filter(a=>(a.date||'') >= s.filtreDateFrom);
    if(s.filtreDateTo)   list = list.filter(a=>(a.date||'') <= s.filtreDateTo);

    if(s.search){
      list = list.filter(a=>{
        const el = Storage.getById('eleves', a.eleveId);
        return el && ((el.nom+' '+el.prenom+' '+el.matricule).toLowerCase().includes(s.search));
      });
    }

    const dir = s.sortDir==='asc'?1:-1;
    list.sort((a,b)=>{
      let va, vb;
      if(s.sortKey==='eleve'){
        const ea = Storage.getById('eleves', a.eleveId);
        const eb = Storage.getById('eleves', b.eleveId);
        va = ea?.nom || ''; vb = eb?.nom || '';
      } else if(s.sortKey==='classe'){
        const ea = Storage.getById('eleves', a.eleveId);
        const eb = Storage.getById('eleves', b.eleveId);
        va = Storage.getById('classes', ea?.classeId)?.nom || '';
        vb = Storage.getById('classes', eb?.classeId)?.nom || '';
      } else if(s.sortKey==='justifie'){
        return ((a.justifie?1:0)-(b.justifie?1:0))*dir;
      } else {
        va = a[s.sortKey] || '';
        vb = b[s.sortKey] || '';
      }
      return va.toString().localeCompare(vb.toString(), 'fr') * dir;
    });
    return list;
  },

  refresh(){
    // Stats globales
    const all = Storage.getAll('absences');
    document.getElementById('statAbsTotal').textContent = all.filter(a=>a.type==='absence').length;
    document.getElementById('statRetards').textContent = all.filter(a=>a.type==='retard').length;
    document.getElementById('statJustifiees').textContent = all.filter(a=>a.justifie).length;
    document.getElementById('statNonJust').textContent = all.filter(a=>!a.justifie).length;

    // Suivi par classe
    const classes = Storage.getAll('classes');
    const tbodySuivi = document.getElementById('tbodySuiviCls');
    tbodySuivi.innerHTML = classes.map(c=>{
      const eleves = Storage.getAll('eleves').filter(e=>e.classeId===c.id);
      const eleveIds = new Set(eleves.map(e=>e.id));
      const absCls = all.filter(a=>eleveIds.has(a.eleveId));
      const nAbs = absCls.filter(a=>a.type==='absence').length;
      const nRet = absCls.filter(a=>a.type==='retard').length;
      const nJust = absCls.filter(a=>a.justifie).length;
      const nNon = absCls.filter(a=>!a.justifie).length;
      const taux = eleves.length ? ((nAbs/eleves.length)*100).toFixed(1) : '0.0';
      return `<tr>
        <td><strong>${Utils.escapeHtml(c.nom)}</strong></td>
        <td>${eleves.length}</td>
        <td><span class="badge bg-danger-subtle text-danger">${nAbs}</span></td>
        <td><span class="badge bg-warning-subtle text-warning">${nRet}</span></td>
        <td><span class="badge bg-success-subtle text-success">${nJust}</span></td>
        <td><span class="badge bg-secondary-subtle text-secondary">${nNon}</span></td>
        <td class="small text-muted">${taux}%</td>
      </tr>`;
    }).join('') || `<tr><td colspan="7" class="text-center text-muted small py-3">Aucune classe.</td></tr>`;

    // Liste détaillée
    const list = this.getFiltered();
    const total = list.length;
    const totalPages = Math.max(1, Math.ceil(total / this.state.pageSize));
    if(this.state.page > totalPages) this.state.page = totalPages;

    const start = (this.state.page - 1) * this.state.pageSize;
    const pageList = list.slice(start, start + this.state.pageSize);

    const tbody = document.getElementById('tbodyAbs');
    if(!pageList.length){
      tbody.innerHTML = `<tr><td colspan="7" class="text-center text-muted py-4">Aucun enregistrement trouvé.</td></tr>`;
    } else {
      tbody.innerHTML = pageList.map(a=>{
        const el = Storage.getById('eleves', a.eleveId);
        const cls = el ? Storage.getById('classes', el.classeId) : null;
        return `<tr>
          <td>${Utils.formatDate(a.date)}${a.heure?' <small class="text-muted">'+Utils.escapeHtml(a.heure)+'</small>':''}</td>
          <td>${el?Utils.escapeHtml(el.prenom+' '+el.nom):'—'}</td>
          <td>${cls?Utils.escapeHtml(cls.nom):'—'}</td>
          <td>${a.type==='absence'?'<span class="badge bg-danger-subtle text-danger">Absence</span>':'<span class="badge bg-warning-subtle text-warning">Retard</span>'}</td>
          <td class="small text-muted">${Utils.escapeHtml(a.motif||'—')}</td>
          <td>${a.justifie?'<span class="badge bg-success-subtle text-success">Justifiée</span>':'<span class="badge bg-secondary-subtle text-secondary">Non justifiée</span>'}</td>
          <td class="text-end">
            <button class="btn btn-sm btn-light" title="Modifier" data-act="edit" data-id="${a.id}"><i class="bi bi-pencil"></i></button>
            <button class="btn btn-sm btn-light text-danger" title="Supprimer" data-act="del" data-id="${a.id}"><i class="bi bi-trash"></i></button>
          </td>
        </tr>`;
      }).join('');
    }

    tbody.querySelectorAll('[data-act]').forEach(btn=>{
      btn.onclick = ()=>{
        const id = btn.dataset.id;
        const act = btn.dataset.act;
        if(act==='edit') this.openForm(id);
        else if(act==='del') this.delete(id);
      };
    });

    document.getElementById('paginationInfoAbs').textContent =
      total === 0 ? '0 résultat' : `${start+1}–${Math.min(start+this.state.pageSize, total)} sur ${total} enregistrement(s)`;

    const pag = document.getElementById('paginationAbs');
    let html = '';
    html += `<li class="page-item ${this.state.page===1?'disabled':''}"><a class="page-link" href="#" data-p="${this.state.page-1}">«</a></li>`;
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
    const modal = new bootstrap.Modal(document.getElementById('modalAbs'));
    const form = document.getElementById('formAbs');
    form.classList.remove('was-validated');
    document.getElementById('absJustifDetailWrap').style.display = 'none';

    if(id){
      const a = Storage.getById('absences', id);
      if(!a) return;
      const el = Storage.getById('eleves', a.eleveId);
      document.getElementById('modalAbsTitle').textContent = 'Modifier enregistrement';
      document.getElementById('absId').value = a.id;
      document.getElementById('absClasse').value = el?.classeId || '';
      this.populateElevesSelect(a.eleveId);
      document.getElementById('absType').value = a.type || 'absence';
      document.getElementById('absDate').value = a.date || '';
      document.getElementById('absHeure').value = a.heure || '';
      document.getElementById('absMotif').value = a.motif || '';
      document.getElementById('absJustifie').value = a.justifie ? 'oui' : 'non';
      document.getElementById('absJustifDetail').value = a.justifDetail || '';
      if(a.justifie){
        document.getElementById('absJustifDetailWrap').style.display = 'block';
      }
    } else {
      form.reset();
      document.getElementById('modalAbsTitle').textContent = 'Nouvel enregistrement';
      document.getElementById('absId').value = '';
      document.getElementById('absEleve').innerHTML = '<option value="">— Choisir une classe d\'abord —</option>';
      document.getElementById('absDate').value = new Date().toISOString().slice(0,10);
    }
    modal.show();
  },

  save(){
    const form = document.getElementById('formAbs');
    form.classList.add('was-validated');
    if(!form.checkValidity()) return;

    const id = document.getElementById('absId').value;
    const anneeActive = Storage.getAllIncludingArchived('annees').find(a=>a.active);
    const data = {
      eleveId:  document.getElementById('absEleve').value,
      type:     document.getElementById('absType').value,
      date:     document.getElementById('absDate').value,
      heure:    document.getElementById('absHeure').value,
      motif:    document.getElementById('absMotif').value.trim(),
      justifie: document.getElementById('absJustifie').value === 'oui',
      justifDetail: document.getElementById('absJustifDetail').value.trim(),
      anneeId:  anneeActive?.id
    };

    if(id){
      Storage.update('absences', id, data);
      Notify.toast('Enregistrement modifié.', 'success');
    } else {
      Storage.create('absences', data);
      Notify.toast('Enregistrement ajouté.', 'success');
    }
    bootstrap.Modal.getInstance(document.getElementById('modalAbs')).hide();
    this.refresh();
  },

  delete(id){
    if(!confirm('Supprimer cet enregistrement ?')) return;
    Storage.remove('absences', id, false);
    Notify.toast('Enregistrement supprimé.', 'warning');
    this.refresh();
  },

  openRapport(){
    const param = Storage.read().parametres;
    const annee = Storage.getAllIncludingArchived('annees').find(a=>a.active);
    const classes = Storage.getAll('classes');
    const all = Storage.getAll('absences');

    let html = `
      <div class="fiche-eleve">
        <div class="fiche-head">
          <div>
            <h5 class="mb-0">${Utils.escapeHtml(param.etablissement)}</h5>
            <small class="text-muted">${Utils.escapeHtml(param.adresse)}</small><br>
            <small class="text-muted">Année ${annee?.libelle||'—'} — Généré le ${Utils.formatDate(new Date().toISOString())}</small>
          </div>
        </div>
        <h6 class="text-center my-3 fw-bold" style="letter-spacing:1px">RAPPORT D'ABSENCES ET RETARDS</h6>
        <table class="table table-bordered table-sm">
          <thead class="table-light">
            <tr>
              <th>Classe</th><th>Effectif</th><th>Absences</th><th>Retards</th>
              <th>Justifiées</th><th>Non justif.</th>
            </tr>
          </thead>
          <tbody>
    `;
    classes.forEach(c=>{
      const eleves = Storage.getAll('eleves').filter(e=>e.classeId===c.id);
      const ids = new Set(eleves.map(e=>e.id));
      const absCls = all.filter(a=>ids.has(a.eleveId));
      html += `<tr>
        <td>${Utils.escapeHtml(c.nom)}</td>
        <td>${eleves.length}</td>
        <td>${absCls.filter(a=>a.type==='absence').length}</td>
        <td>${absCls.filter(a=>a.type==='retard').length}</td>
        <td>${absCls.filter(a=>a.justifie).length}</td>
        <td>${absCls.filter(a=>!a.justifie).length}</td>
      </tr>`;
    });
    html += `</tbody></table>`;

    // Top 10 élèves les plus absents
    const eleveCount = {};
    all.filter(a=>a.type==='absence').forEach(a=>{
      eleveCount[a.eleveId] = (eleveCount[a.eleveId]||0)+1;
    });
    const top = Object.entries(eleveCount).sort((a,b)=>b[1]-a[1]).slice(0,10);
    if(top.length){
      html += `<h6 class="mt-4 mb-2 fw-bold">Top 10 élèves les plus absents</h6>
        <table class="table table-bordered table-sm">
          <thead class="table-light"><tr><th>#</th><th>Élève</th><th>Classe</th><th>Nb absences</th></tr></thead>
          <tbody>`;
      top.forEach(([eid,count],i)=>{
        const el = Storage.getById('eleves', eid);
        const cls = el ? Storage.getById('classes', el.classeId) : null;
        html += `<tr>
          <td>${i+1}</td>
          <td>${el?Utils.escapeHtml(el.prenom+' '+el.nom):'—'}</td>
          <td>${cls?Utils.escapeHtml(cls.nom):'—'}</td>
          <td><strong>${count}</strong></td>
        </tr>`;
      });
      html += `</tbody></table>`;
    }

    html += `
        <div class="fiche-signatures mt-4">
          <div>Le Surveillant<br><br><br>______________________</div>
          <div>Le Directeur<br><br><br>${Utils.escapeHtml(param.directeur||'')}</div>
        </div>
      </div>
    `;

    document.getElementById('rapportAbsBody').innerHTML = html;
    new bootstrap.Modal(document.getElementById('modalRapportAbs')).show();
  },

  exportCsv(){
    const list = this.getFiltered();
    const rows = [['Date','Heure','Élève','Classe','Type','Motif','Justifiée','Détail']];
    list.forEach(a=>{
      const el = Storage.getById('eleves', a.eleveId);
      const cls = el ? Storage.getById('classes', el.classeId) : null;
      rows.push([
        a.date, a.heure||'', el?el.prenom+' '+el.nom:'', cls?cls.nom:'',
        a.type, a.motif||'', a.justifie?'Oui':'Non', a.justifDetail||''
      ]);
    });
    const csv = rows.map(r=>r.map(v=>`"${String(v??'').replace(/"/g,'""')}"`).join(';')).join('\n');
    const blob = new Blob(['\ufeff'+csv], {type:'text/csv;charset=utf-8;'});
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'absences_'+new Date().toISOString().slice(0,10)+'.csv';
    a.click();
    Notify.toast('Export CSV généré.', 'success');
  }
};