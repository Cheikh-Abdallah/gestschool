/**
 * Module : Gestion des filières (enseignement supérieur).
 * CRUD complet, filtres par cycle.
 */
const Filieres = {
  state: { page:1, pageSize:10, search:'', filtreCycle:'', sortKey:'nom', sortDir:'asc' },

  render(container){
    this.container = container;
    container.innerHTML = `
      <div class="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
        <div>
          <div class="page-title">Filières</div>
          <div class="page-sub">Licences, Masters, BTS, DUT, BT…</div>
        </div>
        <div class="d-flex gap-2">
          <button class="btn btn-outline-success btn-sm" id="btnImportFilieres">
            <i class="bi bi-file-earmark-excel me-1"></i> Importer Excel
          </button>
          <button class="btn btn-primary btn-sm" id="btnAddFil">
            <i class="bi bi-plus-lg me-1"></i> Nouvelle filière
          </button>
        </div>
      </div>

      <div class="card-panel">
        <div class="row g-2 mb-3">
          <div class="col-12 col-md-5">
            <div class="search-inline">
              <i class="bi bi-search"></i>
              <input type="text" id="fSearchFil" placeholder="Rechercher une filière…">
            </div>
          </div>
          <div class="col-6 col-md-3">
            <select class="form-select form-select-sm" id="fCycleFil">
              <option value="">Tous cycles</option>
              <option value="Licence">Licence</option>
              <option value="Master">Master</option>
              <option value="Doctorat">Doctorat</option>
              <option value="BTS">BTS</option>
              <option value="DUT">DUT</option>
              <option value="BT">BT</option>
            </select>
          </div>
          <div class="col-6 col-md-2">
            <button class="btn btn-outline-secondary btn-sm w-100" id="btnResetFil">
              <i class="bi bi-arrow-counterclockwise"></i> Reset
            </button>
          </div>
        </div>

        <div class="table-responsive">
          <table class="table table-hover align-middle mb-0">
            <thead><tr>
              <th data-sort="code" style="cursor:pointer">Code</th>
              <th data-sort="nom" style="cursor:pointer">Nom</th>
              <th data-sort="cycle" style="cursor:pointer">Cycle</th>
              <th data-sort="dureeAnnees" style="cursor:pointer">Durée</th>
              <th data-sort="niveaux" style="cursor:pointer">Niveaux</th>
              <th class="text-end">Actions</th>
            </tr></thead>
            <tbody id="tbodyFil"></tbody>
          </table>
        </div>
        <div class="d-flex justify-content-between align-items-center mt-3">
          <small class="text-muted" id="paginationInfoFil"></small>
          <nav><ul class="pagination pagination-sm mb-0" id="paginationFil"></ul></nav>
        </div>
      </div>

      <!-- Modale -->
      <div class="modal fade" id="modalFil" tabindex="-1">
        <div class="modal-dialog modal-lg modal-dialog-centered">
          <div class="modal-content modal-sup">
            <form id="formFil" novalidate>
              <div class="modal-header">
                <h6 class="modal-title" id="modalFilTitle">Nouvelle filière</h6>
                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
              </div>
              <div class="modal-body">
                <input type="hidden" id="filId">
                <div class="row g-3">
                  <div class="col-md-4">
                    <label class="form-label">Code *</label>
                    <input class="form-control" id="filCode" required placeholder="INFO, GEST…">
                    <div class="invalid-feedback">Code obligatoire.</div>
                  </div>
                  <div class="col-md-8">
                    <label class="form-label">Nom de la filière *</label>
                    <input class="form-control" id="filNom" required placeholder="Informatique">
                    <div class="invalid-feedback">Nom obligatoire.</div>
                  </div>
                  <div class="col-md-4">
                    <label class="form-label">Cycle *</label>
                    <select class="form-select" id="filCycle" required>
                      <option value="">— Choisir —</option>
                      <option value="Licence">Licence</option>
                      <option value="Master">Master</option>
                      <option value="Doctorat">Doctorat</option>
                      <option value="BTS">BTS</option>
                      <option value="DUT">DUT</option>
                      <option value="BT">BT</option>
                    </select>
                    <div class="invalid-feedback">Cycle obligatoire.</div>
                  </div>
                  <div class="col-md-4">
                    <label class="form-label">Durée (années)</label>
                    <input type="number" class="form-control" id="filDuree" min="1" max="8" value="3">
                  </div>
                  <div class="col-md-4">
                    <label class="form-label">Description</label>
                    <input class="form-control" id="filDesc">
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
    this.refresh();
  },

  bindEvents(){
    document.getElementById('btnAddFil').onclick = ()=> this.openForm();
    document.getElementById('btnResetFil').onclick = ()=>{
      this.state = {...this.state, page:1, search:'', filtreCycle:''};
      document.getElementById('fSearchFil').value='';
      document.getElementById('fCycleFil').value='';
      this.refresh();
    };
    document.getElementById('fSearchFil').addEventListener('input', e=>{
      this.state.search = e.target.value.trim().toLowerCase();
      this.state.page = 1;
      this.refresh();
    });
    document.getElementById('fCycleFil').onchange = e=>{
      this.state.filtreCycle = e.target.value;
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
    document.getElementById('btnImportFilieres').onclick = () => ImportExcel.open('filieres');
    document.getElementById('formFil').onsubmit = (e)=>{ e.preventDefault(); this.save(); };
  },

  getFiltered(){
    let list = Storage.getAll('filieres');
    const s = this.state;
    if(s.filtreCycle) list = list.filter(f=>f.cycle === s.filtreCycle);
    if(s.search){
      list = list.filter(f=>
        (f.nom||'').toLowerCase().includes(s.search) ||
        (f.code||'').toLowerCase().includes(s.search)
      );
    }
    const dir = s.sortDir==='asc'?1:-1;
    list.sort((a,b)=>{
      let va, vb;
      if(s.sortKey === 'niveaux'){
        va = Storage.getAll('niveaux').filter(n=>n.filiereId===a.id).length;
        vb = Storage.getAll('niveaux').filter(n=>n.filiereId===b.id).length;
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

    const tbody = document.getElementById('tbodyFil');
    tbody.innerHTML = pageList.length ? pageList.map(f=>{
      const niveaux = Storage.getAll('niveaux').filter(n=>n.filiereId===f.id).length;
      const cycleCls = (f.cycle||'').toLowerCase();
      return `<tr>
        <td><span class="badge-matricule">${Utils.escapeHtml(f.code)}</span></td>
        <td><strong>${Utils.escapeHtml(f.nom)}</strong></td>
        <td><span class="badge-cycle ${cycleCls}">${Utils.escapeHtml(f.cycle)}</span></td>
        <td>${f.dureeAnnees||'—'} an(s)</td>
        <td>${niveaux}</td>
        <td class="text-end">
          <button class="btn btn-sm btn-light" title="Modifier" data-act="edit" data-id="${f.id}"><i class="bi bi-pencil"></i></button>
          <button class="btn btn-sm btn-light text-danger" title="Supprimer" data-act="del" data-id="${f.id}"><i class="bi bi-trash"></i></button>
        </td>
      </tr>`;
    }).join('') : `<tr><td colspan="6" class="text-center text-muted py-4">Aucune filière.</td></tr>`;

    tbody.querySelectorAll('[data-act]').forEach(btn=>{
      btn.onclick = ()=>{
        if(btn.dataset.act === 'edit') this.openForm(btn.dataset.id);
        else this.archive(btn.dataset.id);
      };
    });

    document.getElementById('paginationInfoFil').textContent =
      total === 0 ? '0 résultat' : `${start+1}–${Math.min(start+this.state.pageSize, total)} sur ${total}`;

    this.renderPagination(totalPages);
  },

  renderPagination(totalPages){
    const pag = document.getElementById('paginationFil');
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
    const modal = new bootstrap.Modal(document.getElementById('modalFil'));
    const form = document.getElementById('formFil');
    form.classList.remove('was-validated');

    if(id){
      const f = Storage.getById('filieres', id);
      if(!f) return;
      document.getElementById('modalFilTitle').textContent = 'Modifier filière · ' + f.nom;
      document.getElementById('filId').value = f.id;
      document.getElementById('filCode').value = f.code || '';
      document.getElementById('filNom').value = f.nom || '';
      document.getElementById('filCycle').value = f.cycle || '';
      document.getElementById('filDuree').value = f.dureeAnnees || 3;
      document.getElementById('filDesc').value = f.description || '';
    } else {
      form.reset();
      document.getElementById('modalFilTitle').textContent = 'Nouvelle filière';
      document.getElementById('filId').value = '';
      document.getElementById('filDuree').value = 3;
    }
    modal.show();
  },

  save(){
    const form = document.getElementById('formFil');
    form.classList.add('was-validated');
    if(!form.checkValidity()) return;

    const id = document.getElementById('filId').value;
    const data = {
      code: document.getElementById('filCode').value.trim().toUpperCase(),
      nom: document.getElementById('filNom').value.trim(),
      cycle: document.getElementById('filCycle').value,
      dureeAnnees: parseInt(document.getElementById('filDuree').value) || 3,
      description: document.getElementById('filDesc').value.trim()
    };

    const dup = Storage.getAll('filieres').find(f =>
      f.code.toLowerCase() === data.code.toLowerCase() && f.id !== id
    );
    if(dup){ Notify.toast('Ce code existe déjà.', 'danger'); return; }

    if(id){
      Storage.update('filieres', id, data);
      Notify.toast('Filière modifiée.', 'success');
    } else {
      Storage.create('filieres', data);
      Notify.toast('Filière créée.', 'success');
    }
    bootstrap.Modal.getInstance(document.getElementById('modalFil')).hide();
    this.refresh();
  },

  archive(id){
    const f = Storage.getById('filieres', id);
    if(!f) return;
    const niveaux = Storage.getAll('niveaux').filter(n=>n.filiereId===id);
    if(niveaux.length){
      Notify.toast(`Impossible : ${niveaux.length} niveau(x) rattaché(s) à cette filière.`, 'danger');
      return;
    }
    if(!confirm(`Supprimer la filière "${f.nom}" ?`)) return;
    Storage.remove('filieres', id, true);
    Notify.toast('Filière supprimée.', 'warning');
    this.refresh();
  }
};
