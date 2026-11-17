/**
 * Module : Gestion des Unités d'Enseignement (UE — LMD).
 */
const UE = {
  state: { page:1, pageSize:10, search:'', filtreNiveau:'', filtreSemestre:'', sortKey:'code', sortDir:'asc' },

  render(container){
    this.container = container;
    container.innerHTML = `
      <div class="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
        <div>
          <div class="page-title">Unités d'Enseignement (UE)</div>
          <div class="page-sub">Système LMD — crédits ECTS et coefficients</div>
        </div>
        <div class="d-flex gap-2">
          <button class="btn btn-outline-success btn-sm" id="btnImportUE">
            <i class="bi bi-file-earmark-excel me-1"></i> Importer Excel
          </button>
          <button class="btn btn-outline-secondary btn-sm" id="btnExportCsvUE">
            <i class="bi bi-filetype-csv me-1"></i> Exporter CSV
          </button>
          <button class="btn btn-primary btn-sm" id="btnAddUE">
            <i class="bi bi-plus-lg me-1"></i> Nouvelle UE
          </button>
        </div>
      </div>

      <div class="card-panel">
        <div class="row g-2 mb-3">
          <div class="col-12 col-md-4">
            <div class="search-inline">
              <i class="bi bi-search"></i>
              <input type="text" id="fSearchUE" placeholder="Rechercher une UE…">
            </div>
          </div>
          <div class="col-6 col-md-3">
            <select class="form-select form-select-sm" id="fNiveauUE"><option value="">Tous niveaux</option></select>
          </div>
          <div class="col-6 col-md-2">
            <select class="form-select form-select-sm" id="fSemestreUE">
              <option value="">Tous semestres</option>
              <option value="S1">Semestre 1</option>
              <option value="S2">Semestre 2</option>
            </select>
          </div>
          <div class="col-12 col-md-2">
            <button class="btn btn-outline-secondary btn-sm w-100" id="btnResetUE">
              <i class="bi bi-arrow-counterclockwise"></i> Reset
            </button>
          </div>
        </div>

        <div class="table-responsive">
          <table class="table table-hover align-middle mb-0">
            <thead><tr>
              <th data-sort="code" style="cursor:pointer">Code</th>
              <th data-sort="nom" style="cursor:pointer">Nom</th>
              <th data-sort="semestre" style="cursor:pointer">Semestre</th>
              <th data-sort="typeUE" style="cursor:pointer">Type</th>
              <th data-sort="creditsECTS" style="cursor:pointer">ECTS</th>
              <th data-sort="ecue" style="cursor:pointer">ECUE</th>
              <th class="text-end">Actions</th>
            </tr></thead>
            <tbody id="tbodyUE"></tbody>
          </table>
        </div>
        <div class="d-flex justify-content-between align-items-center mt-3">
          <small class="text-muted" id="paginationInfoUE"></small>
          <nav><ul class="pagination pagination-sm mb-0" id="paginationUE"></ul></nav>
        </div>
      </div>

      <!-- Modale -->
      <div class="modal fade" id="modalUE" tabindex="-1">
        <div class="modal-dialog modal-lg modal-dialog-centered">
          <div class="modal-content modal-sup">
            <form id="formUE" novalidate>
              <div class="modal-header">
                <h6 class="modal-title" id="modalUETitle">Nouvelle UE</h6>
                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
              </div>
              <div class="modal-body">
                <input type="hidden" id="ueId">
                <div class="row g-3">
                  <div class="col-md-4">
                    <label class="form-label">Code *</label>
                    <input class="form-control" id="ueCode" required placeholder="UE-INFO-L1-S1-01">
                    <div class="invalid-feedback">Code obligatoire.</div>
                  </div>
                  <div class="col-md-8">
                    <label class="form-label">Nom de l'UE *</label>
                    <input class="form-control" id="ueNom" required placeholder="Programmation 1">
                    <div class="invalid-feedback">Nom obligatoire.</div>
                  </div>
                  <div class="col-md-6">
                    <label class="form-label">Filière *</label>
                    <select class="form-select" id="ueFiliere" required></select>
                  </div>
                  <div class="col-md-6">
                    <label class="form-label">Niveau *</label>
                    <select class="form-select" id="ueNiveau" required></select>
                  </div>
                  <div class="col-md-4">
                    <label class="form-label">Semestre *</label>
                    <select class="form-select" id="ueSemestre" required>
                      <option value="S1">Semestre 1</option>
                      <option value="S2">Semestre 2</option>
                    </select>
                  </div>
                  <div class="col-md-4">
                    <label class="form-label">Crédits ECTS *</label>
                    <input type="number" class="form-control" id="ueCredits" min="1" max="30" value="6" required>
                  </div>
                  <div class="col-md-4">
                    <label class="form-label">Coefficient *</label>
                    <input type="number" class="form-control" id="ueCoef" min="1" max="10" value="1" required>
                  </div>
                  <div class="col-md-12">
                    <label class="form-label">Type d'UE *</label>
                    <select class="form-select" id="ueType" required>
                      <option value="Fondamentale">Fondamentale</option>
                      <option value="Transversale">Transversale</option>
                      <option value="Professionnelle">Professionnelle</option>
                      <option value="Ouverte">Ouverte</option>
                    </select>
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
    `;

    this.bindEvents();
    this.populateSelects();
    this.refresh();
  },

  populateSelects(){
    const filieres = Storage.getAll('filieres');
    document.getElementById('ueFiliere').innerHTML = '<option value="">— Choisir —</option>' +
      filieres.map(f=>`<option value="${f.id}">${Utils.escapeHtml(f.code+' — '+f.nom)}</option>`).join('');

    document.getElementById('fNiveauUE').innerHTML = '<option value="">Tous niveaux</option>' +
      Storage.getAll('niveaux').map(n=>`<option value="${n.id}">${Utils.escapeHtml(n.libelle)}</option>`).join('');

    document.getElementById('ueNiveau').innerHTML = '<option value="">— Choisir une filière d\'abord —</option>';
  },

  bindEvents(){
    document.getElementById('btnAddUE').onclick = ()=> this.openForm();
    document.getElementById('btnResetUE').onclick = ()=>{
      this.state = {...this.state, page:1, search:'', filtreNiveau:'', filtreSemestre:''};
      document.getElementById('fSearchUE').value='';
      document.getElementById('fNiveauUE').value='';
      document.getElementById('fSemestreUE').value='';
      this.refresh();
    };
    document.getElementById('fSearchUE').addEventListener('input', e=>{
      this.state.search = e.target.value.trim().toLowerCase();
      this.state.page = 1;
      this.refresh();
    });
    document.getElementById('fNiveauUE').onchange = e=>{
      this.state.filtreNiveau = e.target.value;
      this.state.page = 1;
      this.refresh();
    };
    document.getElementById('fSemestreUE').onchange = e=>{
      this.state.filtreSemestre = e.target.value;
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
    document.getElementById('formUE').onsubmit = (e)=>{ e.preventDefault(); this.save(); };

    document.getElementById('ueFiliere').onchange = ()=>{
      const fid = document.getElementById('ueFiliere').value;
      const niveaux = Storage.getAll('niveaux').filter(n=>n.filiereId === fid);
      document.getElementById('ueNiveau').innerHTML = niveaux.length
        ? niveaux.map(n=>`<option value="${n.id}">${Utils.escapeHtml(n.libelle)}</option>`).join('')
        : '<option value="">— Aucun niveau dans cette filière —</option>';
    };

    // ✅ Boutons avec protection
    const btnImport = document.getElementById('btnImportUE');
    if(btnImport) btnImport.onclick = () => ImportExcel.open('ue');
    
    const btnExport = document.getElementById('btnExportCsvUE');
    if(btnExport) btnExport.onclick = () => this.exportCsv();
  },

  getFiltered(){
    let list = Storage.getAll('ue');
    const s = this.state;
    if(s.filtreNiveau) list = list.filter(u=>u.niveauId === s.filtreNiveau);
    if(s.filtreSemestre) list = list.filter(u=>u.semestre === s.filtreSemestre);
    if(s.search){
      list = list.filter(u=>
        (u.nom||'').toLowerCase().includes(s.search) ||
        (u.code||'').toLowerCase().includes(s.search)
      );
    }
    const dir = s.sortDir==='asc'?1:-1;
    list.sort((a,b)=>{
      let va, vb;
      if(s.sortKey === 'ecue'){
        va = (a.ecueIds||[]).length;
        vb = (b.ecueIds||[]).length;
        return (va-vb)*dir;
      }
      va = a[s.sortKey] || ''; vb = b[s.sortKey] || '';
      if(typeof va === 'number') return (va-vb)*dir;
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

    const tbody = document.getElementById('tbodyUE');
    tbody.innerHTML = pageList.length ? pageList.map(u=>{
      const nbEcue = (u.ecueIds||[]).length;
      return `<tr>
        <td><span class="badge-matricule">${Utils.escapeHtml(u.code)}</span></td>
        <td><strong>${Utils.escapeHtml(u.nom)}</strong></td>
        <td><span class="badge bg-primary-subtle text-primary">${Utils.escapeHtml(u.semestre)}</span></td>
        <td><span class="badge-type-ue ${(u.typeUE||'').toLowerCase()}">${Utils.escapeHtml(u.typeUE)}</span></td>
        <td><span class="badge-ects">${u.creditsECTS} ECTS</span></td>
        <td>${nbEcue}</td>
        <td class="text-end">
          <button class="btn btn-sm btn-light" title="Modifier" data-act="edit" data-id="${u.id}"><i class="bi bi-pencil"></i></button>
          <button class="btn btn-sm btn-light text-danger" title="Supprimer" data-act="del" data-id="${u.id}"><i class="bi bi-trash"></i></button>
        </td>
      </tr>`;
    }).join('') : `<tr><td colspan="7" class="text-center text-muted py-4">Aucune UE.</td></tr>`;

    tbody.querySelectorAll('[data-act]').forEach(btn=>{
      btn.onclick = ()=>{
        if(btn.dataset.act === 'edit') this.openForm(btn.dataset.id);
        else this.archive(btn.dataset.id);
      };
    });

    document.getElementById('paginationInfoUE').textContent =
      total === 0 ? '0 résultat' : `${start+1}–${Math.min(start+this.state.pageSize, total)} sur ${total} UE`;

    this.renderPagination(totalPages);
  },

  renderPagination(totalPages){
    const pag = document.getElementById('paginationUE');
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
    const modal = new bootstrap.Modal(document.getElementById('modalUE'));
    const form = document.getElementById('formUE');
    form.classList.remove('was-validated');

    if(id){
      const u = Storage.getById('ue', id);
      if(!u) return;
      document.getElementById('modalUETitle').textContent = 'Modifier UE · ' + u.code;
      document.getElementById('ueId').value = u.id;
      document.getElementById('ueCode').value = u.code || '';
      document.getElementById('ueNom').value = u.nom || '';
      document.getElementById('ueFiliere').value = u.filiereId || '';
      const niveaux = Storage.getAll('niveaux').filter(n=>n.filiereId === u.filiereId);
      document.getElementById('ueNiveau').innerHTML = niveaux.map(n=>`<option value="${n.id}" ${n.id===u.niveauId?'selected':''}>${Utils.escapeHtml(n.libelle)}</option>`).join('');
      document.getElementById('ueSemestre').value = u.semestre || 'S1';
      document.getElementById('ueCredits').value = u.creditsECTS || 6;
      document.getElementById('ueCoef').value = u.coefficient || 1;
      document.getElementById('ueType').value = u.typeUE || 'Fondamentale';
    } else {
      form.reset();
      document.getElementById('modalUETitle').textContent = 'Nouvelle UE';
      document.getElementById('ueId').value = '';
      document.getElementById('ueNiveau').innerHTML = '<option value="">— Choisir une filière d\'abord —</option>';
      document.getElementById('ueCredits').value = 6;
      document.getElementById('ueCoef').value = 1;
    }
    modal.show();
  },

  save(){
    const form = document.getElementById('formUE');
    form.classList.add('was-validated');
    if(!form.checkValidity()) return;

    const id = document.getElementById('ueId').value;
    const data = {
      code: document.getElementById('ueCode').value.trim().toUpperCase(),
      nom: document.getElementById('ueNom').value.trim(),
      filiereId: document.getElementById('ueFiliere').value,
      niveauId: document.getElementById('ueNiveau').value,
      semestre: document.getElementById('ueSemestre').value,
      creditsECTS: parseInt(document.getElementById('ueCredits').value) || 6,
      coefficient: parseInt(document.getElementById('ueCoef').value) || 1,
      typeUE: document.getElementById('ueType').value,
      ecueIds: [],
      enseignantIds: []
    };

    if(id){
      const old = Storage.getById('ue', id);
      data.ecueIds = old?.ecueIds || [];
      data.enseignantIds = old?.enseignantIds || [];
      Storage.update('ue', id, data);
      Notify.toast('UE modifiée.', 'success');
    } else {
      Storage.create('ue', data);
      Notify.toast('UE créée.', 'success');
    }
    bootstrap.Modal.getInstance(document.getElementById('modalUE')).hide();
    this.refresh();
  },

  archive(id){
    const u = Storage.getById('ue', id);
    if(!u) return;
    if((u.ecueIds||[]).length){
      Notify.toast(`Impossible : ${u.ecueIds.length} ECUE rattaché(s). Supprimez-les d'abord.`, 'danger');
      return;
    }
    if(!confirm(`Supprimer l'UE "${u.nom}" ?`)) return;
    Storage.remove('ue', id, true);
    Notify.toast('UE supprimée.', 'warning');
    this.refresh();
  },

  exportCsv(){
    const list = this.getFiltered();
    const rows = [['Code','Nom','Filière','Niveau','Semestre','Crédits ECTS','Coefficient','Type']];
    list.forEach(u=>{
      const filiere = Storage.getById('filieres', u.filiereId);
      const niveau = Storage.getById('niveaux', u.niveauId);
      rows.push([
        u.code, u.nom, filiere?filiere.code:'', niveau?niveau.code:'',
        u.semestre, u.creditsECTS, u.coefficient, u.typeUE
      ]);
    });
    const csv = rows.map(r=>r.map(v=>`"${String(v??'').replace(/"/g,'""')}"`).join(';')).join('\n');
    const blob = new Blob(['\ufeff'+csv], {type:'text/csv;charset=utf-8;'});
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'ue_'+new Date().toISOString().slice(0,10)+'.csv';
    a.click();
    Notify.toast('Export CSV généré.', 'success');
  }
};
