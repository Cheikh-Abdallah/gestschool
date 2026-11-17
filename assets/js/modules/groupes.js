/**
 * Module : Gestion des groupes (mode supérieur).
 * Un groupe = ensemble d'étudiants d'un même niveau.
 */
const Groupes = {
  state: {
    page:1, pageSize:10, search:'',
    filtreNiveau:'', filtreFiliere:'',
    sortKey:'nom', sortDir:'asc'
  },

  render(container){
    this.container = container;
    container.innerHTML = `
      <div class="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
        <div>
          <div class="page-title">Groupes</div>
          <div class="page-sub">Groupes d'étudiants par niveau et filière</div>
        </div>
        <div class="d-flex gap-2">
          <button class="btn btn-outline-secondary btn-sm" id="btnExportCsvGrp">
            <i class="bi bi-filetype-csv me-1"></i> Exporter CSV
          </button>
          <button class="btn btn-primary btn-sm" id="btnAddGrp">
            <i class="bi bi-plus-lg me-1"></i> Nouveau groupe
          </button>
        </div>
      </div>

      <div class="card-panel">
        <div class="row g-2 mb-3">
          <div class="col-12 col-md-4">
            <div class="search-inline">
              <i class="bi bi-search"></i>
              <input type="text" id="fSearchGrp" placeholder="Rechercher un groupe…">
            </div>
          </div>
          <div class="col-6 col-md-3">
            <select class="form-select form-select-sm" id="fFiliereGrp"><option value="">Toutes filières</option></select>
          </div>
          <div class="col-6 col-md-3">
            <select class="form-select form-select-sm" id="fNiveauGrp"><option value="">Tous niveaux</option></select>
          </div>
          <div class="col-12 col-md-2">
            <button class="btn btn-outline-secondary btn-sm w-100" id="btnResetGrp">
              <i class="bi bi-arrow-counterclockwise"></i> Reset
            </button>
          </div>
        </div>

        <div class="table-responsive">
          <table class="table table-hover align-middle mb-0">
            <thead><tr>
              <th data-sort="nom" style="cursor:pointer">Groupe</th>
              <th data-sort="niveau" style="cursor:pointer">Niveau</th>
              <th data-sort="filiere" style="cursor:pointer">Filière</th>
              <th data-sort="effectif" style="cursor:pointer">Effectif</th>
              <th data-sort="prof" style="cursor:pointer">Responsable</th>
              <th class="text-end">Actions</th>
            </tr></thead>
            <tbody id="tbodyGrp"></tbody>
          </table>
        </div>
        <div class="d-flex justify-content-between align-items-center mt-3">
          <small class="text-muted" id="paginationInfoGrp"></small>
          <nav><ul class="pagination pagination-sm mb-0" id="paginationGrp"></ul></nav>
        </div>
      </div>

      <!-- Modale -->
      <div class="modal fade" id="modalGrp" tabindex="-1">
        <div class="modal-dialog modal-lg modal-dialog-centered">
          <div class="modal-content modal-sup">
            <form id="formGrp" novalidate>
              <div class="modal-header">
                <h6 class="modal-title" id="modalGrpTitle">Nouveau groupe</h6>
                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
              </div>
              <div class="modal-body">
                <input type="hidden" id="grpId">
                <div class="row g-3">
                  <div class="col-md-6">
                    <label class="form-label">Filière *</label>
                    <select class="form-select" id="grpFiliere" required></select>
                    <div class="invalid-feedback">Filière obligatoire.</div>
                  </div>
                  <div class="col-md-6">
                    <label class="form-label">Niveau *</label>
                    <select class="form-select" id="grpNiveau" required></select>
                    <div class="invalid-feedback">Niveau obligatoire.</div>
                  </div>
                  <div class="col-md-8">
                    <label class="form-label">Nom du groupe *</label>
                    <input class="form-control" id="grpNom" required placeholder="L1 Info - Groupe A">
                    <div class="invalid-feedback">Nom obligatoire.</div>
                  </div>
                  <div class="col-md-4">
                    <label class="form-label">Effectif max</label>
                    <input type="number" class="form-control" id="grpEffectifMax" min="1" max="200" value="40">
                  </div>
                  <div class="col-md-12">
                    <label class="form-label">Responsable pédagogique</label>
                    <select class="form-select" id="grpProf"></select>
                  </div>
                </div>
              </div>
              <div class="modal-footer">
                <button type="button" class="btn btn-light" data-bs-dismiss="modal">Annuler</button>
                <button type="submit" class="btn btn-primary"><i class="bi bi-check2 me-1"></i> Enregistrer</button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <!-- Modale détail -->
      <div class="modal fade" id="modalDetailGrp" tabindex="-1">
        <div class="modal-dialog modal-xl modal-dialog-scrollable">
          <div class="modal-content">
            <div class="modal-header">
              <h6 class="modal-title" id="modalDetailGrpTitle">Détail groupe</h6>
              <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body" id="detailGrpBody"></div>
          </div>
        </div>
      </div>
    `;

    this.bindEvents();
    this.populateFilters();
    this.refresh();
  },

  bindEvents(){
    document.getElementById('btnAddGrp').onclick = ()=> this.openForm();
    document.getElementById('btnResetGrp').onclick = ()=>{
      this.state = {...this.state, page:1, search:'', filtreNiveau:'', filtreFiliere:''};
      document.getElementById('fSearchGrp').value='';
      document.getElementById('fFiliereGrp').value='';
      this.updateNiveauFilter();
      this.refresh();
    };
    document.getElementById('fSearchGrp').addEventListener('input', e=>{
      this.state.search = e.target.value.trim().toLowerCase();
      this.state.page = 1;
      this.refresh();
    });
    document.getElementById('fFiliereGrp').onchange = e=>{
      this.state.filtreFiliere = e.target.value;
      this.state.filtreNiveau = '';
      this.updateNiveauFilter();
      this.refresh();
    };
    document.getElementById('fNiveauGrp').onchange = e=>{
      this.state.filtreNiveau = e.target.value;
      this.state.page = 1;
      this.refresh();
    };

    document.querySelectorAll('thead th[data-sort]').forEach(th=>{
      th.onclick = ()=>{
        const k = th.dataset.sort;
        if(this.state.sortKey === k) this.state.sortDir = this.state.sortDir==='asc'?'desc':'asc';
        else { this.state.sortKey = k; this.state.sortDir = 'asc'; }
        this.refresh();
      };
    });

    document.getElementById('formGrp').onsubmit = (e)=>{ e.preventDefault(); this.save(); };

    document.getElementById('grpFiliere').onchange = ()=>{
      const fid = document.getElementById('grpFiliere').value;
      const niveaux = Storage.getAll('niveaux').filter(n=>n.filiereId === fid);
      document.getElementById('grpNiveau').innerHTML = niveaux.length
        ? '<option value="">— Choisir —</option>' + niveaux.map(n=>`<option value="${n.id}">${Utils.escapeHtml(n.libelle)}</option>`).join('')
        : '<option value="">— Aucun niveau —</option>';
    };

    // ✅ Export CSV avec protection
    const btnExport = document.getElementById('btnExportCsvGrp');
    if(btnExport) btnExport.onclick = () => this.exportCsv();
  },

  populateFilters(){
    const filieres = Storage.getAll('filieres');
    document.getElementById('fFiliereGrp').innerHTML = '<option value="">Toutes filières</option>' +
      filieres.map(f=>`<option value="${f.id}">${Utils.escapeHtml(f.code)}</option>`).join('');
    document.getElementById('fNiveauGrp').innerHTML = '<option value="">Tous niveaux</option>';

    document.getElementById('grpFiliere').innerHTML = '<option value="">— Choisir —</option>' +
      filieres.map(f=>`<option value="${f.id}">${Utils.escapeHtml(f.code+' — '+f.nom)}</option>`).join('');
    document.getElementById('grpNiveau').innerHTML = '<option value="">— Choisir la filière d\'abord —</option>';

    const ens = Storage.getAll('enseignants');
    document.getElementById('grpProf').innerHTML = '<option value="">— Aucun —</option>' +
      ens.map(e=>`<option value="${e.id}">${Utils.escapeHtml(e.prenom+' '+e.nom)}</option>`).join('');
  },

  updateNiveauFilter(){
    const fid = this.state.filtreFiliere;
    const niveaux = fid ? Storage.getAll('niveaux').filter(n=>n.filiereId === fid) : Storage.getAll('niveaux');
    document.getElementById('fNiveauGrp').innerHTML = '<option value="">Tous niveaux</option>' +
      niveaux.map(n=>`<option value="${n.id}">${Utils.escapeHtml(n.libelle)}</option>`).join('');
  },

  getFiltered(){
    let list = Storage.getAll('groupes');
    const s = this.state;
    if(s.filtreNiveau) list = list.filter(g=>g.niveauId === s.filtreNiveau);
    if(s.filtreFiliere){
      const niveauIds = Storage.getAll('niveaux').filter(n=>n.filiereId === s.filtreFiliere).map(n=>n.id);
      list = list.filter(g=>niveauIds.includes(g.niveauId));
    }
    if(s.search){
      list = list.filter(g=>(g.nom||'').toLowerCase().includes(s.search));
    }
    const dir = s.sortDir==='asc'?1:-1;
    list.sort((a,b)=>{
      let va, vb;
      if(s.sortKey==='niveau'){
        va = Storage.getById('niveaux', a.niveauId)?.libelle || '';
        vb = Storage.getById('niveaux', b.niveauId)?.libelle || '';
      } else if(s.sortKey==='filiere'){
        const nA = Storage.getById('niveaux', a.niveauId);
        const nB = Storage.getById('niveaux', b.niveauId);
        va = Storage.getById('filieres', nA?.filiereId)?.nom || '';
        vb = Storage.getById('filieres', nB?.filiereId)?.nom || '';
      } else if(s.sortKey==='effectif'){
        va = Storage.getAll('eleves').filter(e=>e.classeId===a.id).length;
        vb = Storage.getAll('eleves').filter(e=>e.classeId===b.id).length;
        return (va-vb)*dir;
      } else if(s.sortKey==='prof'){
        va = Storage.getById('enseignants', a.profPrincipalId)?.nom || '';
        vb = Storage.getById('enseignants', b.profPrincipalId)?.nom || '';
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

    const tbody = document.getElementById('tbodyGrp');
    tbody.innerHTML = pageList.length ? pageList.map(g=>{
      const niveau = Storage.getById('niveaux', g.niveauId);
      const filiere = niveau ? Storage.getById('filieres', niveau.filiereId) : null;
      const prof = Storage.getById('enseignants', g.profPrincipalId);
      const effectif = Storage.getAll('eleves').filter(e=>e.classeId===g.id).length;
      return `<tr>
        <td><strong>${Utils.escapeHtml(g.nom)}</strong></td>
        <td>${niveau?Utils.escapeHtml(niveau.libelle):'—'}</td>
        <td>${filiere?`<span class="badge-cycle ${(filiere.cycle||'').toLowerCase()}">${Utils.escapeHtml(filiere.code)}</span>`:'—'}</td>
        <td><strong>${effectif}</strong> / ${g.effectifMax||40}</td>
        <td>${prof?Utils.escapeHtml(prof.prenom+' '+prof.nom):'<span class="text-muted">—</span>'}</td>
        <td class="text-end">
          <button class="btn btn-sm btn-light" title="Voir" data-act="detail" data-id="${g.id}"><i class="bi bi-eye"></i></button>
          <button class="btn btn-sm btn-light" title="Modifier" data-act="edit" data-id="${g.id}"><i class="bi bi-pencil"></i></button>
          <button class="btn btn-sm btn-light text-danger" title="Supprimer" data-act="del" data-id="${g.id}"><i class="bi bi-trash"></i></button>
        </td>
      </tr>`;
    }).join('') : `<tr><td colspan="6" class="text-center text-muted py-4">Aucun groupe.</td></tr>`;

    tbody.querySelectorAll('[data-act]').forEach(btn=>{
      btn.onclick = ()=>{
        const act = btn.dataset.act;
        const id = btn.dataset.id;
        if(act==='detail') this.showDetail(id);
        else if(act==='edit') this.openForm(id);
        else this.archive(id);
      };
    });

    document.getElementById('paginationInfoGrp').textContent =
      total === 0 ? '0 résultat' : `${start+1}–${Math.min(start+this.state.pageSize, total)} sur ${total} groupe(s)`;

    this.renderPagination(totalPages);
  },

  renderPagination(totalPages){
    const pag = document.getElementById('paginationGrp');
    let html = `<li class="page-item ${this.state.page===1?'disabled':''}"><a class="page-link" href="#" data-p="${this.state.page-1}">«</a></li>`;
    for(let i=1;i<=totalPages;i++){
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
    const modal = new bootstrap.Modal(document.getElementById('modalGrp'));
    const form = document.getElementById('formGrp');
    form.classList.remove('was-validated');

    if(id){
      const g = Storage.getById('groupes', id);
      if(!g) return;
      document.getElementById('modalGrpTitle').textContent = 'Modifier groupe · ' + g.nom;
      document.getElementById('grpId').value = g.id;
      document.getElementById('grpNom').value = g.nom || '';
      document.getElementById('grpEffectifMax').value = g.effectifMax || 40;
      document.getElementById('grpProf').value = g.profPrincipalId || '';

      const niveau = Storage.getById('niveaux', g.niveauId);
      if(niveau){
        document.getElementById('grpFiliere').value = niveau.filiereId;
        const niveaux = Storage.getAll('niveaux').filter(n=>n.filiereId === niveau.filiereId);
        document.getElementById('grpNiveau
