/**
 * Module : Gestion des niveaux (L1, L2, M1, BTS1…).
 * Liés à une filière.
 */
const Niveaux = {
  state: { page:1, pageSize:10, search:'', filtreFiliere:'', sortKey:'ordre', sortDir:'asc' },

  render(container){
    this.container = container;
    container.innerHTML = `
      <div class="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
        <div>
          <div class="page-title">Niveaux</div>
          <div class="page-sub">L1, L2, L3, M1, M2, BTS1…</div>
        </div>
        <div class="d-flex gap-2">
          <button class="btn btn-outline-success btn-sm" id="btnImportNiveaux">
            <i class="bi bi-file-earmark-excel me-1"></i> Importer Excel
          </button>
          <button class="btn btn-outline-secondary btn-sm" id="btnExportCsvNiv">
            <i class="bi bi-filetype-csv me-1"></i> Exporter CSV
          </button>
          <button class="btn btn-primary btn-sm" id="btnAddNiv">
            <i class="bi bi-plus-lg me-1"></i> Nouveau niveau
          </button>
        </div>
      </div>

      <div class="card-panel">
        <div class="row g-2 mb-3">
          <div class="col-12 col-md-5">
            <div class="search-inline">
              <i class="bi bi-search"></i>
              <input type="text" id="fSearchNiv" placeholder="Rechercher un niveau…">
            </div>
          </div>
          <div class="col-6 col-md-4">
            <select class="form-select form-select-sm" id="fFiliereNiv">
              <option value="">Toutes filières</option>
            </select>
          </div>
          <div class="col-6 col-md-2">
            <button class="btn btn-outline-secondary btn-sm w-100" id="btnResetNiv">
              <i class="bi bi-arrow-counterclockwise"></i> Reset
            </button>
          </div>
        </div>

        <div class="table-responsive">
          <table class="table table-hover align-middle mb-0">
            <thead><tr>
              <th data-sort="code" style="cursor:pointer">Code</th>
              <th data-sort="libelle" style="cursor:pointer">Libellé</th>
              <th data-sort="filiere" style="cursor:pointer">Filière</th>
              <th data-sort="creditsRequis" style="cursor:pointer">Crédits</th>
              <th data-sort="fraisScolarite" style="cursor:pointer">Frais annuel</th>
              <th data-sort="groupes" style="cursor:pointer">Groupes</th>
              <th class="text-end">Actions</th>
            </tr></thead>
            <tbody id="tbodyNiv"></tbody>
          </table>
        </div>
        <div class="d-flex justify-content-between align-items-center mt-3">
          <small class="text-muted" id="paginationInfoNiv"></small>
          <nav><ul class="pagination pagination-sm mb-0" id="paginationNiv"></ul></nav>
        </div>
      </div>

      <!-- Modale -->
      <div class="modal fade" id="modalNiv" tabindex="-1">
        <div class="modal-dialog modal-lg modal-dialog-centered">
          <div class="modal-content modal-sup">
            <form id="formNiv" novalidate>
              <div class="modal-header">
                <h6 class="modal-title" id="modalNivTitle">Nouveau niveau</h6>
                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
              </div>
              <div class="modal-body">
                <input type="hidden" id="nivId">
                <div class="row g-3">
                  <div class="col-md-8">
                    <label class="form-label">Filière *</label>
                    <select class="form-select" id="nivFiliere" required></select>
                    <div class="invalid-feedback">Filière obligatoire.</div>
                  </div>
                  <div class="col-md-4">
                    <label class="form-label">Code *</label>
                    <input class="form-control" id="nivCode" required placeholder="L1, M2, BTS1…">
                    <div class="invalid-feedback">Code obligatoire.</div>
                  </div>
                  <div class="col-md-8">
                    <label class="form-label">Libellé *</label>
                    <input class="form-control" id="nivLibelle" required placeholder="Licence 1 Informatique">
                    <div class="invalid-feedback">Libellé obligatoire.</div>
                  </div>
                  <div class="col-md-4">
                    <label class="form-label">Ordre</label>
                    <input type="number" class="form-control" id="nivOrdre" min="1" value="1">
                  </div>
                  <div class="col-md-6">
                    <label class="form-label">Crédits requis</label>
                    <input type="number" class="form-control" id="nivCredits" min="0" value="60">
                    <small class="text-muted">60 crédits ECTS par année LMD.</small>
                  </div>
                  <div class="col-md-6">
                    <label class="form-label">Frais de scolarité annuels (FCFA)</label>
                    <input type="number" class="form-control" id="nivFrais" min="0" value="500000">
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
    this.populateFiliereSelect();
    this.refresh();
  },

  populateFiliereSelect(){
    const filieres = Storage.getAll('filieres');
    document.getElementById('nivFiliere').innerHTML = '<option value="">— Choisir —</option>' +
      filieres.map(f=>`<option value="${f.id}">${Utils.escapeHtml(f.code+' — '+f.nom)}</option>`).join('');
    document.getElementById('fFiliereNiv').innerHTML = '<option value="">Toutes filières</option>' +
      filieres.map(f=>`<option value="${f.id}">${Utils.escapeHtml(f.code+' — '+f.nom)}</option>`).join('');
  },

  bindEvents(){
    document.getElementById('btnAddNiv').onclick = ()=> this.openForm();
    document.getElementById('btnResetNiv').onclick = ()=>{
      this.state = {...this.state, page:1, search:'', filtreFiliere:''};
      document.getElementById('fSearchNiv').value='';
      document.getElementById('fFiliereNiv').value='';
      this.refresh();
    };
    document.getElementById('fSearchNiv').addEventListener('input', e=>{
      this.state.search = e.target.value.trim().toLowerCase();
      this.state.page = 1;
      this.refresh();
    });
    document.getElementById('fFiliereNiv').onchange = e=>{
      this.state.filtreFiliere = e.target.value;
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
    
    // ✅ Boutons avec protection
    const btnImport = document.getElementById('btnImportNiveaux');
    if(btnImport) btnImport.onclick = () => ImportExcel.open('niveaux');
    
    const btnExport = document.getElementById('btnExportCsvNiv');
    if(btnExport) btnExport.onclick = () => this.exportCsv();
    
    document.getElementById('formNiv').onsubmit = (e)=>{ e.preventDefault(); this.save(); };
  },

  getFiltered(){
    let list = Storage.getAll('niveaux');
    const s = this.state;
    if(s.filtreFiliere) list = list.filter(n=>n.filiereId === s.filtreFiliere);
    if(s.search){
      list = list.filter(n=>
        (n.nom||'').toLowerCase().includes(s.search) ||
        (n.code||'').toLowerCase().includes(s.search) ||
        (n.libelle||'').toLowerCase().includes(s.search)
      );
    }
    const dir = s.sortDir==='asc'?1:-1;
    list.sort((a,b)=>{
      let va, vb;
      if(s.sortKey === 'filiere'){
        va = Storage.getById('filieres', a.filiereId)?.nom || '';
        vb = Storage.getById('filieres', b.filiereId)?.nom || '';
      } else if(s.sortKey === 'groupes'){
        va = Storage.getAll('groupes').filter(g=>g.niveauId===a.id).length;
        vb = Storage.getAll('groupes').filter(g=>g.niveauId===b.id).length;
        return (va-vb)*dir;
      } else {
        va = a[s.sortKey] || ''; vb = b[s.sortKey] || '';
      }
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

    const tbody = document.getElementById('tbodyNiv');
    tbody.innerHTML = pageList.length ? pageList.map(n=>{
      const filiere = Storage.getById('filieres', n.filiereId);
      const groupes = Storage.getAll('groupes').filter(g=>g.niveauId===n.id).length;
      return `<tr>
        <td><span class="badge-matricule">${Utils.escapeHtml(n.code)}</span></td>
        <td><strong>${Utils.escapeHtml(n.libelle)}</strong></td>
        <td>${filiere?`<span class="badge-cycle ${(filiere.cycle||'').toLowerCase()}">${Utils.escapeHtml(filiere.code)}</span> ${Utils.escapeHtml(filiere.nom)}`:'—'}</td>
        <td><span class="badge-ects">${n.creditsRequis||60} ECTS</span></td>
        <td class="small">${Utils.formatFCFA(n.fraisScolarite||0)}</td>
        <td>${groupes}</td>
        <td class="text-end">
          <button class="btn btn-sm btn-light" title="Modifier" data-act="edit" data-id="${n.id}"><i class="bi bi-pencil"></i></button>
          <button class="btn btn-sm btn-light text-danger" title="Supprimer" data-act="del" data-id="${n.id}"><i class="bi bi-trash"></i></button>
        </td>
      </tr>`;
    }).join('') : `<tr><td colspan="7" class="text-center text-muted py-4">Aucun niveau.</td></tr>`;

    tbody.querySelectorAll('[data-act]').forEach(btn=>{
      btn.onclick = ()=>{
        if(btn.dataset.act === 'edit') this.openForm(btn.dataset.id);
        else this.archive(btn.dataset.id);
      };
    });

    document.getElementById('paginationInfoNiv').textContent =
      total === 0 ? '0 résultat' : `${start+1}–${Math.min(start+this.state.pageSize, total)} sur ${total}`;

    this.renderPagination(totalPages);
  },

  renderPagination(totalPages){
    const pag = document.getElementById('paginationNiv');
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
    const modal = new bootstrap.Modal(document.getElementById('modalNiv'));
    const form = document.getElementById('formNiv');
    form.classList.remove('was-validated');

    if(id){
      const n = Storage.getById('niveaux', id);
      if(!n) return;
      document.getElementById('modalNivTitle').textContent = 'Modifier niveau · ' + n.code;
      document.getElementById('nivId').value = n.id;
      document.getElementById('nivFiliere').value = n.filiereId || '';
      document.getElementById('nivCode').value = n.code || '';
      document.getElementById('nivLibelle').value = n.libelle || '';
      document.getElementById('nivOrdre').value = n.ordre || 1;
      document.getElementById('nivCredits').value = n.creditsRequis || 60;
      document.getElementById('nivFrais').value = n.fraisScolarite || 500000;
    } else {
      form.reset();
      document.getElementById('modalNivTitle').textContent = 'Nouveau niveau';
      document.getElementById('nivId').value = '';
      document.getElementById('nivOrdre').value = 1;
      document.getElementById('nivCredits').value = 60;
      document.getElementById('nivFrais').value = 500000;
    }
    modal.show();
  },

  save(){
    const form = document.getElementById('formNiv');
    form.classList.add('was-validated');
    if(!form.checkValidity()) return;

    const id = document.getElementById('nivId').value;
    const data = {
      filiereId: document.getElementById('nivFiliere').value,
      code: document.getElementById('nivCode').value.trim().toUpperCase(),
      libelle: document.getElementById('nivLibelle').value.trim(),
      ordre: parseInt(document.getElementById('nivOrdre').value) || 1,
      creditsRequis: parseInt(document.getElementById('nivCredits').value) || 60,
      fraisScolarite: parseInt(document.getElementById('nivFrais').value) || 0
    };

    if(id){
      Storage.update('niveaux', id, data);
      Notify.toast('Niveau modifié.', 'success');
    } else {
      Storage.create('niveaux', data);
      Notify.toast('Niveau créé.', 'success');
    }
    bootstrap.Modal.getInstance(document.getElementById('modalNiv')).hide();
    this.refresh();
  },

  archive(id){
    const n = Storage.getById('niveaux', id);
    if(!n) return;
    const groupes = Storage.getAll('groupes').filter(g=>g.niveauId===id);
    if(groupes.length){
      Notify.toast(`Impossible : ${groupes.length} groupe(s) rattaché(s).`, 'danger');
      return;
    }
    if(!confirm(`Supprimer le niveau "${n.libelle}" ?`)) return;
    Storage.remove('niveaux', id, true);
    Notify.toast('Niveau supprimé.', 'warning');
    this.refresh();
  },

  exportCsv(){
    const list = this.getFiltered();
    const rows = [['Code','Libellé','Filière','Ordre','Crédits requis','Frais scolarité']];
    list.forEach(n=>{
      const filiere = Storage.getById('filieres', n.filiereId);
      rows.push([
        n.code, n.libelle, filiere?filiere.code:'',
        n.ordre||1, n.creditsRequis||60, n.fraisScolarite||0
      ]);
    });
    const csv = rows.map(r=>r.map(v=>`"${String(v??'').replace(/"/g,'""')}"`).join(';')).join('\n');
    const blob = new Blob(['\ufeff'+csv], {type:'text/csv;charset=utf-8;'});
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'niveaux_'+new Date().toISOString().slice(0,10)+'.csv';
    a.click();
    Notify.toast('Export CSV généré.', 'success');
  }
};
