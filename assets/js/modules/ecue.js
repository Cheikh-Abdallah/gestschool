/**
 * Module : Gestion des Éléments Constitutifs (ECUE — sous-UE).
 */
const ECUE = {
  state: { page:1, pageSize:15, search:'', filtreUE:'', sortKey:'nom', sortDir:'asc' },

  render(container){
    this.container = container;
    container.innerHTML = `
      <div class="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
        <div>
          <div class="page-title">Éléments Constitutifs (ECUE)</div>
          <div class="page-sub">CM, TD, TP rattachés aux Unités d'Enseignement</div>
        </div>
        <button class="btn btn-primary btn-sm" id="btnAddECUE">
          <i class="bi bi-plus-lg me-1"></i> Nouvel ECUE
        </button>
      </div>

      <div class="card-panel">
        <div class="row g-2 mb-3">
          <div class="col-12 col-md-5">
            <div class="search-inline">
              <i class="bi bi-search"></i>
              <input type="text" id="fSearchECUE" placeholder="Rechercher un ECUE…">
            </div>
          </div>
          <div class="col-6 col-md-4">
            <select class="form-select form-select-sm" id="fUEECUE"><option value="">Toutes UE</option></select>
          </div>
          <div class="col-6 col-md-2">
            <button class="btn btn-outline-secondary btn-sm w-100" id="btnResetECUE">
              <i class="bi bi-arrow-counterclockwise"></i> Reset
            </button>
          </div>
        </div>

        <div class="table-responsive">
          <table class="table table-hover align-middle mb-0">
            <thead><tr>
              <th data-sort="nom" style="cursor:pointer">Nom</th>
              <th data-sort="ue" style="cursor:pointer">UE rattachée</th>
              <th data-sort="coefficient" style="cursor:pointer">Coef</th>
              <th class="text-center">CM</th>
              <th class="text-center">TD</th>
              <th class="text-center">TP</th>
              <th class="text-end">Actions</th>
            </tr></thead>
            <tbody id="tbodyECUE"></tbody>
          </table>
        </div>
        <div class="d-flex justify-content-between align-items-center mt-3">
          <small class="text-muted" id="paginationInfoECUE"></small>
          <nav><ul class="pagination pagination-sm mb-0" id="paginationECUE"></ul></nav>
        </div>
      </div>

      <!-- Modale -->
      <div class="modal fade" id="modalECUE" tabindex="-1">
        <div class="modal-dialog modal-lg modal-dialog-centered">
          <div class="modal-content modal-sup">
            <form id="formECUE" novalidate>
              <div class="modal-header">
                <h6 class="modal-title" id="modalECUETitle">Nouvel ECUE</h6>
                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
              </div>
              <div class="modal-body">
                <input type="hidden" id="ecueId">
                <div class="row g-3">
                  <div class="col-md-12">
                    <label class="form-label">UE rattachée *</label>
                    <select class="form-select" id="ecueUE" required></select>
                    <div class="invalid-feedback">UE obligatoire.</div>
                  </div>
                  <div class="col-md-8">
                    <label class="form-label">Nom de l'ECUE *</label>
                    <input class="form-control" id="ecueNom" required placeholder="CM Programmation 1">
                    <div class="invalid-feedback">Nom obligatoire.</div>
                  </div>
                  <div class="col-md-4">
                    <label class="form-label">Coefficient *</label>
                    <input type="number" class="form-control" id="ecueCoef" min="1" max="10" value="1" required>
                  </div>
                  <div class="col-md-4">
                    <label class="form-label">Volume CM (h)</label>
                    <input type="number" class="form-control" id="ecueCM" min="0" value="0">
                  </div>
                  <div class="col-md-4">
                    <label class="form-label">Volume TD (h)</label>
                    <input type="number" class="form-control" id="ecueTD" min="0" value="0">
                  </div>
                  <div class="col-md-4">
                    <label class="form-label">Volume TP (h)</label>
                    <input type="number" class="form-control" id="ecueTP" min="0" value="0">
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
    const ues = Storage.getAll('ue');
    document.getElementById('ecueUE').innerHTML = '<option value="">— Choisir —</option>' +
      ues.map(u=>`<option value="${u.id}">${Utils.escapeHtml(u.code+' — '+u.nom)}</option>`).join('');
    document.getElementById('fUEECUE').innerHTML = '<option value="">Toutes UE</option>' +
      ues.map(u=>`<option value="${u.id}">${Utils.escapeHtml(u.code+' — '+u.nom)}</option>`).join('');
  },

  bindEvents(){
    document.getElementById('btnAddECUE').onclick = ()=> this.openForm();
    document.getElementById('btnResetECUE').onclick = ()=>{
      this.state = {...this.state, page:1, search:'', filtreUE:''};
      document.getElementById('fSearchECUE').value='';
      document.getElementById('fUEECUE').value='';
      this.refresh();
    };
    document.getElementById('fSearchECUE').addEventListener('input', e=>{
      this.state.search = e.target.value.trim().toLowerCase();
      this.state.page = 1;
      this.refresh();
    });
    document.getElementById('fUEECUE').onchange = e=>{
      this.state.filtreUE = e.target.value;
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
    document.getElementById('formECUE').onsubmit = (e)=>{ e.preventDefault(); this.save(); };
  },

  getFiltered(){
    let list = Storage.getAll('ecue');
    const s = this.state;
    if(s.filtreUE) list = list.filter(e=>e.ueId === s.filtreUE);
    if(s.search) list = list.filter(e=>(e.nom||'').toLowerCase().includes(s.search));
    const dir = s.sortDir==='asc'?1:-1;
    list.sort((a,b)=>{
      let va, vb;
      if(s.sortKey === 'ue'){
        va = Storage.getById('ue', a.ueId)?.nom || '';
        vb = Storage.getById('ue', b.ueId)?.nom || '';
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

    const tbody = document.getElementById('tbodyECUE');
    tbody.innerHTML = pageList.length ? pageList.map(e=>{
      const ue = Storage.getById('ue', e.ueId);
      return `<tr>
        <td><strong>${Utils.escapeHtml(e.nom)}</strong></td>
        <td>${ue?`<span class="badge-matricule">${Utils.escapeHtml(ue.code)}</span> ${Utils.escapeHtml(ue.nom)}`:'—'}</td>
        <td class="text-center">×${e.coefficient||1}</td>
        <td class="text-center">${e.volumeCM||0}h</td>
        <td class="text-center">${e.volumeTD||0}h</td>
        <td class="text-center">${e.volumeTP||0}h</td>
        <td class="text-end">
          <button class="btn btn-sm btn-light" title="Modifier" data-act="edit" data-id="${e.id}"><i class="bi bi-pencil"></i></button>
          <button class="btn btn-sm btn-light text-danger" title="Supprimer" data-act="del" data-id="${e.id}"><i class="bi bi-trash"></i></button>
        </td>
      </tr>`;
    }).join('') : `<tr><td colspan="7" class="text-center text-muted py-4">Aucun ECUE.</td></tr>`;

    tbody.querySelectorAll('[data-act]').forEach(btn=>{
      btn.onclick = ()=>{
        if(btn.dataset.act === 'edit') this.openForm(btn.dataset.id);
        else this.archive(btn.dataset.id);
      };
    });

    document.getElementById('paginationInfoECUE').textContent =
      total === 0 ? '0 résultat' : `${start+1}–${Math.min(start+this.state.pageSize, total)} sur ${total} ECUE`;

    this.renderPagination(totalPages);
  },

  renderPagination(totalPages){
    const pag = document.getElementById('paginationECUE');
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
    const modal = new bootstrap.Modal(document.getElementById('modalECUE'));
    const form = document.getElementById('formECUE');
    form.classList.remove('was-validated');

    if(id){
      const e = Storage.getById('ecue', id);
      if(!e) return;
      document.getElementById('modalECUETitle').textContent = 'Modifier ECUE · ' + e.nom;
      document.getElementById('ecueId').value = e.id;
      document.getElementById('ecueUE').value = e.ueId || '';
      document.getElementById('ecueNom').value = e.nom || '';
      document.getElementById('ecueCoef').value = e.coefficient || 1;
      document.getElementById('ecueCM').value = e.volumeCM || 0;
      document.getElementById('ecueTD').value = e.volumeTD || 0;
      document.getElementById('ecueTP').value = e.volumeTP || 0;
    } else {
      form.reset();
      document.getElementById('modalECUETitle').textContent = 'Nouvel ECUE';
      document.getElementById('ecueId').value = '';
      document.getElementById('ecueCoef').value = 1;
      document.getElementById('ecueCM').value = 0;
      document.getElementById('ecueTD').value = 0;
      document.getElementById('ecueTP').value = 0;
    }
    modal.show();
  },

  save(){
    const form = document.getElementById('formECUE');
    form.classList.add('was-validated');
    if(!form.checkValidity()) return;

    const id = document.getElementById('ecueId').value;
    const data = {
      ueId: document.getElementById('ecueUE').value,
      nom: document.getElementById('ecueNom').value.trim(),
      coefficient: parseInt(document.getElementById('ecueCoef').value) || 1,
      volumeCM: parseInt(document.getElementById('ecueCM').value) || 0,
      volumeTD: parseInt(document.getElementById('ecueTD').value) || 0,
      volumeTP: parseInt(document.getElementById('ecueTP').value) || 0
    };

    let created;
    if(id){
      Storage.update('ecue', id, data);
      Notify.toast('ECUE modifié.', 'success');
    } else {
      created = Storage.create('ecue', data);
      Notify.toast('ECUE créé.', 'success');
    }

    // Synchroniser ue.ecueIds
    this.syncUE();

    bootstrap.Modal.getInstance(document.getElementById('modalECUE')).hide();
    this.refresh();
  },

  syncUE(){
    const allUe = Storage.getAll('ue');
    const allEcue = Storage.getAll('ecue');
    allUe.forEach(u=>{
      const ids = allEcue.filter(e=>e.ueId === u.id).map(e=>e.id);
      Storage.update('ue', u.id, {ecueIds: ids});
    });
  },

  archive(id){
    const e = Storage.getById('ecue', id);
    if(!e) return;
    if(!confirm(`Supprimer l'ECUE "${e.nom}" ?`)) return;
    Storage.remove('ecue', id, true);
    this.syncUE();
    Notify.toast('ECUE supprimé.', 'warning');
    this.refresh();
  }
};