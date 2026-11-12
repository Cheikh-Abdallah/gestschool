/**
 * Module 5 : Gestion des matières et coefficients.
 * CRUD, filtres, affectation enseignant/classes, volume horaire.
 * Les coefficients sont pris en compte dans le calcul des moyennes (Module 6/9).
 */
const Matieres = {
  state: {
    page: 1,
    pageSize: 10,
    search: '',
    filtreClasse: '',
    filtreEnseignant: '',
    sortKey: 'nom',
    sortDir: 'asc'
  },

  render(container){
    this.container = container;
    container.innerHTML = `
      <div class="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
        <div>
          <div class="page-title">Gestion des matières</div>
          <div class="page-sub">Coefficients, volumes horaires et affectations</div>
        </div>
        <div class="d-flex gap-2">
          <button class="btn btn-outline-secondary btn-sm" id="btnExportCsvMat">
            <i class="bi bi-filetype-csv me-1"></i> Exporter CSV
          </button>
          <button class="btn btn-primary btn-sm" id="btnAddMat">
            <i class="bi bi-plus-lg me-1"></i> Nouvelle matière
          </button>
        </div>
      </div>

      <div class="row g-3 mb-3">
        <div class="col-6 col-md-3">
          <div class="stat-card">
            <div class="stat-icon"><i class="bi bi-book"></i></div>
            <div><div class="stat-value" id="statNbMat">0</div><div class="stat-label">Matières</div></div>
          </div>
        </div>
        <div class="col-6 col-md-3">
          <div class="stat-card">
            <div class="stat-icon purple"><i class="bi bi-123"></i></div>
            <div><div class="stat-value" id="statTotalCoef">0</div><div class="stat-label">Total coefficients</div></div>
          </div>
        </div>
        <div class="col-6 col-md-3">
          <div class="stat-card">
            <div class="stat-icon green"><i class="bi bi-clock-history"></i></div>
            <div><div class="stat-value" id="statTotalH">0 h</div><div class="stat-label">Volume horaire / sem.</div></div>
          </div>
        </div>
        <div class="col-6 col-md-3">
          <div class="stat-card">
            <div class="stat-icon orange"><i class="bi bi-person-workspace"></i></div>
            <div><div class="stat-value" id="statMatSansEns">0</div><div class="stat-label">Sans enseignant</div></div>
          </div>
        </div>
      </div>

      <div class="card-panel">
        <div class="row g-2 mb-3">
          <div class="col-12 col-md-4">
            <div class="search-inline">
              <i class="bi bi-search"></i>
              <input type="text" id="fSearchMat" placeholder="Rechercher une matière…">
            </div>
          </div>
          <div class="col-6 col-md-3">
            <select class="form-select form-select-sm" id="fClasseMat">
              <option value="">Toutes classes</option>
            </select>
          </div>
          <div class="col-6 col-md-3">
            <select class="form-select form-select-sm" id="fEnsMat">
              <option value="">Tous enseignants</option>
            </select>
          </div>
          <div class="col-12 col-md-2">
            <button class="btn btn-outline-secondary btn-sm w-100" id="btnResetMat">
              <i class="bi bi-arrow-counterclockwise me-1"></i> Réinitialiser
            </button>
          </div>
        </div>

        <div class="table-responsive">
          <table class="table table-hover align-middle mb-0" id="tblMat">
            <thead>
              <tr>
                <th data-sort="nom" style="cursor:pointer">Matière</th>
                <th data-sort="coefficient" style="cursor:pointer">Coefficient</th>
                <th data-sort="volumeHoraire" style="cursor:pointer">Volume horaire</th>
                <th data-sort="enseignant" style="cursor:pointer">Enseignant</th>
                <th data-sort="classes" style="cursor:pointer">Classes</th>
                <th class="text-end">Actions</th>
              </tr>
            </thead>
            <tbody id="tbodyMat"></tbody>
          </table>
        </div>

        <div class="d-flex flex-wrap justify-content-between align-items-center mt-3 gap-2">
          <small class="text-muted" id="paginationInfoMat"></small>
          <nav><ul class="pagination pagination-sm mb-0" id="paginationMat"></ul></nav>
        </div>
      </div>

      <!-- Modale formulaire -->
      <div class="modal fade" id="modalMat" tabindex="-1">
        <div class="modal-dialog modal-lg modal-dialog-centered">
          <div class="modal-content modal-mat">
            <form id="formMat" novalidate>
              <div class="modal-header">
                <h6 class="modal-title" id="modalMatTitle">Nouvelle matière</h6>
                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
              </div>
              <div class="modal-body">
                <input type="hidden" id="matId">
                <div class="row g-3">
                  <div class="col-md-6">
                    <label class="form-label">Nom de la matière *</label>
                    <input class="form-control" id="matNom" required placeholder="Mathématiques…">
                    <div class="invalid-feedback">Nom obligatoire.</div>
                  </div>
                  <div class="col-md-3">
                    <label class="form-label">Coefficient *</label>
                    <input type="number" class="form-control" id="matCoef" min="1" max="10" required value="1">
                    <div class="invalid-feedback">Entre 1 et 10.</div>
                  </div>
                  <div class="col-md-3">
                    <label class="form-label">Volume horaire / sem. *</label>
                    <input type="number" class="form-control" id="matVolume" min="1" max="20" required value="2">
                    <div class="invalid-feedback">Entre 1 et 20 h.</div>
                  </div>

                  <div class="col-md-6">
                    <label class="form-label">Enseignant affecté</label>
                    <select class="form-select" id="matEns"></select>
                  </div>
                  <div class="col-md-6">
                    <label class="form-label">Année scolaire *</label>
                    <select class="form-select" id="matAnnee" required></select>
                    <div class="invalid-feedback">Sélectionnez l'année.</div>
                  </div>

                  <div class="col-12">
                    <label class="form-label">Classes concernées *</label>
                    <div class="classes-checkbox-grid" id="matClassesGrid"></div>
                    <small class="text-muted">Cochez les classes dans lesquelles cette matière est enseignée.</small>
                    <div class="invalid-feedback d-block" id="matClassesError"></div>
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
    document.getElementById('btnAddMat').onclick = ()=> this.openForm();
    document.getElementById('btnResetMat').onclick = ()=>{
      this.state = {...this.state, page:1, search:'', filtreClasse:'', filtreEnseignant:''};
      document.getElementById('fSearchMat').value='';
      document.getElementById('fClasseMat').value='';
      document.getElementById('fEnsMat').value='';
      this.refresh();
    };
    document.getElementById('fSearchMat').addEventListener('input', e=>{
      this.state.search = e.target.value.trim().toLowerCase();
      this.state.page = 1;
      this.refresh();
    });
    document.getElementById('fClasseMat').onchange = e=>{ this.state.filtreClasse=e.target.value; this.state.page=1; this.refresh(); };
    document.getElementById('fEnsMat').onchange    = e=>{ this.state.filtreEnseignant=e.target.value; this.state.page=1; this.refresh(); };
    document.getElementById('btnExportCsvMat').onclick = ()=> this.exportCsv();

    document.querySelectorAll('#tblMat th[data-sort]').forEach(th=>{
      th.onclick = ()=>{
        const k = th.dataset.sort;
        if(this.state.sortKey === k) this.state.sortDir = this.state.sortDir==='asc'?'desc':'asc';
        else { this.state.sortKey = k; this.state.sortDir = 'asc'; }
        this.refresh();
      };
    });

    document.getElementById('formMat').onsubmit = (e)=>{ e.preventDefault(); this.save(); };
  },

  populateFilters(){
    const classes = Storage.getAll('classes');
    const selCls = document.getElementById('fClasseMat');
    selCls.innerHTML = '<option value="">Toutes classes</option>' +
      classes.map(c=>`<option value="${c.id}">${Utils.escapeHtml(c.nom)}</option>`).join('');

    const ens = Storage.getAll('enseignants');
    const selEns = document.getElementById('fEnsMat');
    selEns.innerHTML = '<option value="">Tous enseignants</option>' +
      ens.map(e=>`<option value="${e.id}">${Utils.escapeHtml(e.prenom+' '+e.nom)}</option>`).join('');

    // Select enseignant de la modale
    const matEns = document.getElementById('matEns');
    matEns.innerHTML = '<option value="">— Aucun —</option>' +
      ens.map(e=>`<option value="${e.id}">${Utils.escapeHtml(e.prenom+' '+e.nom)}</option>`).join('');

    // Année
    const annees = Storage.getAllIncludingArchived('annees');
    const matAnnee = document.getElementById('matAnnee');
    matAnnee.innerHTML = annees.map(a=>`<option value="${a.id}" ${a.active?'selected':''}>${Utils.escapeHtml(a.libelle)}</option>`).join('');

    // Grille classes (checkbox)
    const grid = document.getElementById('matClassesGrid');
    grid.innerHTML = classes.map(c=>`
      <label class="class-checkbox">
        <input type="checkbox" value="${c.id}">
        <span>${Utils.escapeHtml(c.nom)}</span>
      </label>`).join('');
  },

  getFiltered(){
    let list = Storage.getAll('matieres');
    const s = this.state;

    if(s.filtreClasse)     list = list.filter(m=>(m.classeIds||[]).includes(s.filtreClasse));
    if(s.filtreEnseignant) list = list.filter(m=>m.enseignantId === s.filtreEnseignant);

    if(s.search){
      list = list.filter(m=>(m.nom||'').toLowerCase().includes(s.search));
    }

    const dir = s.sortDir==='asc'?1:-1;
    list.sort((a,b)=>{
      let va, vb;
      if(s.sortKey==='enseignant'){
        va = Storage.getById('enseignants', a.enseignantId)?.nom || '';
        vb = Storage.getById('enseignants', b.enseignantId)?.nom || '';
      } else if(s.sortKey==='classes'){
        va = (a.classeIds||[]).length;
        vb = (b.classeIds||[]).length;
        return (va-vb)*dir;
      } else if(s.sortKey==='coefficient' || s.sortKey==='volumeHoraire'){
        return ((a[s.sortKey]||0)-(b[s.sortKey]||0))*dir;
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
    const allMat = Storage.getAll('matieres');
    document.getElementById('statNbMat').textContent = allMat.length;
    document.getElementById('statTotalCoef').textContent = allMat.reduce((s,m)=>s+(m.coefficient||0),0);
    document.getElementById('statTotalH').textContent = allMat.reduce((s,m)=>s+(m.volumeHoraire||0),0) + ' h';
    document.getElementById('statMatSansEns').textContent = allMat.filter(m=>!m.enseignantId).length;

    const list = this.getFiltered();
    const total = list.length;
    const totalPages = Math.max(1, Math.ceil(total / this.state.pageSize));
    if(this.state.page > totalPages) this.state.page = totalPages;

    const start = (this.state.page - 1) * this.state.pageSize;
    const pageList = list.slice(start, start + this.state.pageSize);

    const tbody = document.getElementById('tbodyMat');
    if(!pageList.length){
      tbody.innerHTML = `<tr><td colspan="6" class="text-center text-muted py-4">Aucune matière trouvée.</td></tr>`;
    } else {
      tbody.innerHTML = pageList.map(m=>{
        const ens = Storage.getById('enseignants', m.enseignantId);
        const classes = (m.classeIds||[]).map(cid=>Storage.getById('classes', cid)?.nom).filter(Boolean);
        const coefBadge = m.coefficient >= 4 ? 'danger' : m.coefficient >= 3 ? 'warning' : 'primary';
        return `<tr>
          <td><strong>${Utils.escapeHtml(m.nom)}</strong></td>
          <td><span class="badge bg-${coefBadge}-subtle text-${coefBadge} fw-bold">×${m.coefficient}</span></td>
          <td>${m.volumeHoraire||0} h/sem.</td>
          <td>${ens?Utils.escapeHtml(ens.prenom+' '+ens.nom):'<span class="text-muted">Non affecté</span>'}</td>
          <td>${classes.length?classes.slice(0,3).map(c=>`<span class="badge-matricule me-1">${Utils.escapeHtml(c)}</span>`).join('')+(classes.length>3?`<span class="text-muted small"> +${classes.length-3}</span>`:''):'<span class="text-muted">—</span>'}</td>
          <td class="text-end">
            <button class="btn btn-sm btn-light" title="Modifier" data-act="edit" data-id="${m.id}"><i class="bi bi-pencil"></i></button>
            <button class="btn btn-sm btn-light text-danger" title="Supprimer" data-act="del" data-id="${m.id}"><i class="bi bi-trash"></i></button>
          </td>
        </tr>`;
      }).join('');
    }

    tbody.querySelectorAll('[data-act]').forEach(btn=>{
      btn.onclick = ()=>{
        const id = btn.dataset.id;
        const act = btn.dataset.act;
        if(act==='edit') this.openForm(id);
        else if(act==='del') this.archive(id);
      };
    });

    document.getElementById('paginationInfoMat').textContent =
      total === 0 ? '0 résultat' : `${start+1}–${Math.min(start+this.state.pageSize, total)} sur ${total} matière(s)`;

    const pag = document.getElementById('paginationMat');
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
    const modal = new bootstrap.Modal(document.getElementById('modalMat'));
    const form = document.getElementById('formMat');
    form.classList.remove('was-validated');
    document.getElementById('matClassesError').textContent = '';

    // Reset checkboxes
    document.querySelectorAll('#matClassesGrid input[type=checkbox]').forEach(cb=>cb.checked=false);

    if(id){
      const m = Storage.getById('matieres', id);
      if(!m) return;
      document.getElementById('modalMatTitle').textContent = 'Modifier matière · ' + m.nom;
      document.getElementById('matId').value = m.id;
      document.getElementById('matNom').value = m.nom || '';
      document.getElementById('matCoef').value = m.coefficient || 1;
      document.getElementById('matVolume').value = m.volumeHoraire || 2;
      document.getElementById('matEns').value = m.enseignantId || '';
      document.getElementById('matAnnee').value = m.anneeId || '';
      (m.classeIds||[]).forEach(cid=>{
        const cb = document.querySelector(`#matClassesGrid input[value="${cid}"]`);
        if(cb) cb.checked = true;
      });
    } else {
      form.reset();
      document.getElementById('modalMatTitle').textContent = 'Nouvelle matière';
      document.getElementById('matId').value = '';
      document.getElementById('matCoef').value = 1;
      document.getElementById('matVolume').value = 2;
      const anneeActive = Storage.getAllIncludingArchived('annees').find(a=>a.active);
      if(anneeActive) document.getElementById('matAnnee').value = anneeActive.id;
    }
    modal.show();
  },

  save(){
    const form = document.getElementById('formMat');
    form.classList.add('was-validated');

    const classeIds = [...document.querySelectorAll('#matClassesGrid input[type=checkbox]:checked')].map(cb=>cb.value);
    const errCls = document.getElementById('matClassesError');
    if(!classeIds.length){
      errCls.textContent = 'Sélectionnez au moins une classe.';
    } else {
      errCls.textContent = '';
    }

    if(!form.checkValidity() || !classeIds.length) return;

    const id = document.getElementById('matId').value;
    const data = {
      nom:          document.getElementById('matNom').value.trim(),
      coefficient:  parseInt(document.getElementById('matCoef').value) || 1,
      volumeHoraire:parseInt(document.getElementById('matVolume').value) || 2,
      enseignantId: document.getElementById('matEns').value || null,
      anneeId:      document.getElementById('matAnnee').value,
      classeIds
    };

    // Doublon nom/année
    const all = Storage.getAllIncludingArchived('matieres');
    const dup = all.find(m=> m.nom.toLowerCase() === data.nom.toLowerCase()
      && m.anneeId === data.anneeId && m.id !== id);
    if(dup){
      Notify.toast('Cette matière existe déjà pour cette année.', 'danger');
      return;
    }

    if(id){
      Storage.update('matieres', id, data);
      Notify.toast('Matière modifiée avec succès.', 'success');
    } else {
      Storage.create('matieres', data);
      Notify.toast('Matière créée avec succès.', 'success');
    }

    // Synchronisation des classes (matiereIds sur classes)
    this.syncClassMatieres();

    bootstrap.Modal.getInstance(document.getElementById('modalMat')).hide();
    this.refresh();
  },

  /**
   * Synchronise la propriété matiereIds des classes
   * à partir de la propriété classeIds des matières.
   */
  syncClassMatieres(){
    const matieres = Storage.getAll('matieres');
    const classes = Storage.getAll('classes');
    classes.forEach(c=>{
      const mids = matieres.filter(m=>(m.classeIds||[]).includes(c.id)).map(m=>m.id);
      Storage.update('classes', c.id, {matiereIds: mids});
    });
  },

  archive(id){
    const m = Storage.getById('matieres', id);
    if(!m) return;
    // Vérifier si des notes existent
    const evals = Storage.getAll('evaluations').filter(e=>e.matiereId===id);
    const hasNotes = evals.some(ev=>Storage.getAll('notes').some(n=>n.evaluationId===ev.id));
    if(hasNotes){
      Notify.toast('Impossible : des notes existent déjà pour cette matière.', 'danger');
      return;
    }
    if(!confirm(`Supprimer la matière ${m.nom} ?`)) return;
    Storage.remove('matieres', id, true);
    this.syncClassMatieres();
    Notify.toast('Matière archivée.', 'warning');
    this.refresh();
  },

  exportCsv(){
    const list = this.getFiltered();
    const rows = [['Matière','Coefficient','Volume horaire','Enseignant','Classes','Année']];
    list.forEach(m=>{
      const ens = Storage.getById('enseignants', m.enseignantId);
      const classes = (m.classeIds||[]).map(cid=>Storage.getById('classes', cid)?.nom).filter(Boolean).join(', ');
      const annee = Storage.getById('annees', m.anneeId);
      rows.push([m.nom, m.coefficient||1, (m.volumeHoraire||0)+'h', ens?ens.prenom+' '+ens.nom:'', classes, annee?annee.libelle:'']);
    });
    const csv = rows.map(r=>r.map(v=>`"${String(v??'').replace(/"/g,'""')}"`).join(';')).join('\n');
    const blob = new Blob(['\ufeff'+csv], {type:'text/csv;charset=utf-8;'});
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'matieres_'+new Date().toISOString().slice(0,10)+'.csv';
    a.click();
    Notify.toast('Export CSV généré.', 'success');
  }
};