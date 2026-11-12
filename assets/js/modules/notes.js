/**
 * Module 6 : Gestion des notes et évaluations.
 * Création d'évaluations, saisie de notes par classe/matière,
 * calcul automatique des moyennes pondérées, classements et rangs.
 */
const Notes = {
  POIDS: {
    'Interrogation': 1,
    'Devoir': 2,
    'Évaluation continue': 2,
    'Composition': 3,
    'Examen': 4
  },

  state: {
    // Vue liste des évaluations
    page: 1,
    pageSize: 10,
    search: '',
    filtreClasse: '',
    filtreMatiere: '',
    filtrePeriode: '',
    sortKey: 'date',
    sortDir: 'desc',

    // Vue saisie
    saisieEvalId: null
  },

  render(container){
    this.container = container;
    container.innerHTML = `
      <div class="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
        <div>
          <div class="page-title">Notes et évaluations</div>
          <div class="page-sub">Saisie des notes, moyennes pondérées et classements</div>
        </div>
        <div class="d-flex gap-2">
          <button class="btn btn-outline-primary btn-sm" id="btnVoirClassement">
            <i class="bi bi-trophy me-1"></i> Classement classe
          </button>
          <button class="btn btn-primary btn-sm" id="btnAddEval">
            <i class="bi bi-plus-lg me-1"></i> Nouvelle évaluation
          </button>
        </div>
      </div>

      <div class="row g-3 mb-3">
        <div class="col-6 col-md-3">
          <div class="stat-card">
            <div class="stat-icon"><i class="bi bi-clipboard-check"></i></div>
            <div><div class="stat-value" id="statNbEval">0</div><div class="stat-label">Évaluations</div></div>
          </div>
        </div>
        <div class="col-6 col-md-3">
          <div class="stat-card">
            <div class="stat-icon green"><i class="bi bi-pencil-square"></i></div>
            <div><div class="stat-value" id="statNbNotes">0</div><div class="stat-label">Notes saisies</div></div>
          </div>
        </div>
        <div class="col-6 col-md-3">
          <div class="stat-card">
            <div class="stat-icon purple"><i class="bi bi-graph-up-arrow"></i></div>
            <div><div class="stat-value" id="statMoyGen">—</div><div class="stat-label">Moyenne générale</div></div>
          </div>
        </div>
        <div class="col-6 col-md-3">
          <div class="stat-card">
            <div class="stat-icon orange"><i class="bi bi-exclamation-circle"></i></div>
            <div><div class="stat-value" id="statNonEval">0</div><div class="stat-label">Élèves non évalués</div></div>
          </div>
        </div>
      </div>

      <div class="card-panel">
        <div class="row g-2 mb-3">
          <div class="col-12 col-md-3">
            <div class="search-inline">
              <i class="bi bi-search"></i>
              <input type="text" id="fSearchEval" placeholder="Rechercher…">
            </div>
          </div>
          <div class="col-6 col-md-2">
            <select class="form-select form-select-sm" id="fClasseEval"><option value="">Toutes classes</option></select>
          </div>
          <div class="col-6 col-md-2">
            <select class="form-select form-select-sm" id="fMatiereEval"><option value="">Toutes matières</option></select>
          </div>
          <div class="col-6 col-md-2">
            <select class="form-select form-select-sm" id="fPeriodeEval"><option value="">Toutes périodes</option></select>
          </div>
          <div class="col-6 col-md-3">
            <button class="btn btn-outline-secondary btn-sm w-100" id="btnResetEval">
              <i class="bi bi-arrow-counterclockwise me-1"></i> Réinitialiser
            </button>
          </div>
        </div>

        <div class="table-responsive">
          <table class="table table-hover align-middle mb-0" id="tblEval">
            <thead>
              <tr>
                <th data-sort="date" style="cursor:pointer">Date</th>
                <th data-sort="classe" style="cursor:pointer">Classe</th>
                <th data-sort="matiere" style="cursor:pointer">Matière</th>
                <th data-sort="type" style="cursor:pointer">Type</th>
                <th data-sort="periode" style="cursor:pointer">Période</th>
                <th data-sort="progression" style="cursor:pointer">Progression</th>
                <th class="text-end">Actions</th>
              </tr>
            </thead>
            <tbody id="tbodyEval"></tbody>
          </table>
        </div>

        <div class="d-flex flex-wrap justify-content-between align-items-center mt-3 gap-2">
          <small class="text-muted" id="paginationInfoEval"></small>
          <nav><ul class="pagination pagination-sm mb-0" id="paginationEval"></ul></nav>
        </div>
      </div>

      <!-- Modale évaluation -->
      <div class="modal fade" id="modalEval" tabindex="-1">
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content modal-notes">
            <form id="formEval" novalidate>
              <div class="modal-header">
                <h6 class="modal-title" id="modalEvalTitle">Nouvelle évaluation</h6>
                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
              </div>
              <div class="modal-body">
                <input type="hidden" id="evId">
                <div class="row g-3">
                  <div class="col-md-6">
                    <label class="form-label">Classe *</label>
                    <select class="form-select" id="evClasse" required></select>
                    <div class="invalid-feedback">Classe obligatoire.</div>
                  </div>
                  <div class="col-md-6">
                    <label class="form-label">Matière *</label>
                    <select class="form-select" id="evMatiere" required></select>
                    <div class="invalid-feedback">Matière obligatoire.</div>
                  </div>
                  <div class="col-md-6">
                    <label class="form-label">Type d'évaluation *</label>
                    <select class="form-select" id="evType" required>
                      <option value="">— Choisir —</option>
                      ${Object.keys(this.POIDS).map(t=>`<option value="${t}">${t} (poids ×${this.POIDS[t]})</option>`).join('')}
                    </select>
                    <div class="invalid-feedback">Type obligatoire.</div>
                  </div>
                  <div class="col-md-6">
                    <label class="form-label">Période *</label>
                    <select class="form-select" id="evPeriode" required></select>
                    <div class="invalid-feedback">Période obligatoire.</div>
                  </div>
                  <div class="col-md-6">
                    <label class="form-label">Date *</label>
                    <input type="date" class="form-control" id="evDate" required>
                    <div class="invalid-feedback">Date obligatoire.</div>
                  </div>
                  <div class="col-md-6">
                    <label class="form-label">Barème (note max)</label>
                    <select class="form-select" id="evBareme">
                      <option value="20">Sur 20</option>
                      <option value="10">Sur 10</option>
                      <option value="40">Sur 40</option>
                      <option value="100">Sur 100</option>
                    </select>
                    <small class="text-muted">Les notes seront ramenées sur 20 pour les calculs.</small>
                  </div>
                </div>
              </div>
              <div class="modal-footer">
                <button type="button" class="btn btn-light" data-bs-dismiss="modal">Annuler</button>
                <button type="submit" class="btn btn-primary">
                  <i class="bi bi-check2 me-1"></i> Créer
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <!-- Modale saisie de notes -->
      <div class="modal fade" id="modalSaisie" tabindex="-1">
        <div class="modal-dialog modal-xl modal-dialog-scrollable">
          <div class="modal-content">
            <div class="modal-header">
              <div>
                <h6 class="modal-title" id="saisieTitle">Saisie des notes</h6>
                <small class="text-muted" id="saisieSub"></small>
              </div>
              <div class="d-flex gap-2">
                <button class="btn btn-sm btn-outline-secondary" id="btnPrintSaisie">
                  <i class="bi bi-printer"></i>
                </button>
                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
              </div>
            </div>
            <div class="modal-body" id="saisieBody"></div>
            <div class="modal-footer">
              <div class="me-auto small text-muted" id="saisieStats"></div>
              <button type="button" class="btn btn-light" data-bs-dismiss="modal">Fermer</button>
              <button type="button" class="btn btn-primary" id="btnSaveNotes">
                <i class="bi bi-save me-1"></i> Enregistrer
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Modale classement -->
      <div class="modal fade" id="modalClassement" tabindex="-1">
        <div class="modal-dialog modal-xl modal-dialog-scrollable">
          <div class="modal-content">
            <div class="modal-header">
              <h6 class="modal-title"><i class="bi bi-trophy me-1"></i> Classement de la classe</h6>
              <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body">
              <div class="row g-2 mb-3">
                <div class="col-md-5">
                  <select class="form-select form-select-sm" id="classClasse"></select>
                </div>
                <div class="col-md-5">
                  <select class="form-select form-select-sm" id="classPeriode"></select>
                </div>
                <div class="col-md-2">
                  <button class="btn btn-primary btn-sm w-100" id="btnCalcClass">
                    <i class="bi bi-calculator me-1"></i> Calculer
                  </button>
                </div>
              </div>
              <div id="classementBody"></div>
            </div>
          </div>
        </div>
      </div>
    `;

    this.bindEvents();
    this.populateFilters();
    this.refresh();
  },

  bindEvents(){
    document.getElementById('btnAddEval').onclick = ()=> this.openForm();
    document.getElementById('btnResetEval').onclick = ()=>{
      this.state = {...this.state, page:1, search:'', filtreClasse:'', filtreMatiere:'', filtrePeriode:''};
      document.getElementById('fSearchEval').value='';
      document.getElementById('fClasseEval').value='';
      document.getElementById('fMatiereEval').value='';
      document.getElementById('fPeriodeEval').value='';
      this.refresh();
    };
    document.getElementById('fSearchEval').addEventListener('input', e=>{
      this.state.search = e.target.value.trim().toLowerCase();
      this.state.page = 1;
      this.refresh();
    });
    document.getElementById('fClasseEval').onchange  = e=>{ this.state.filtreClasse=e.target.value;  this.state.page=1; this.refresh(); };
    document.getElementById('fMatiereEval').onchange = e=>{ this.state.filtreMatiere=e.target.value; this.state.page=1; this.refresh(); };
    document.getElementById('fPeriodeEval').onchange = e=>{ this.state.filtrePeriode=e.target.value; this.state.page=1; this.refresh(); };

    document.querySelectorAll('#tblEval th[data-sort]').forEach(th=>{
      th.onclick = ()=>{
        const k = th.dataset.sort;
        if(this.state.sortKey === k) this.state.sortDir = this.state.sortDir==='asc'?'desc':'asc';
        else { this.state.sortKey = k; this.state.sortDir = 'asc'; }
        this.refresh();
      };
    });

    document.getElementById('formEval').onsubmit = (e)=>{ e.preventDefault(); this.saveEval(); };
    document.getElementById('btnSaveNotes').onclick = ()=> this.saveNotes();
    document.getElementById('btnPrintSaisie').onclick = ()=> window.print();
    document.getElementById('btnVoirClassement').onclick = ()=> this.openClassement();
    document.getElementById('btnCalcClass').onclick = ()=> this.calcClassement();
  },

  populateFilters(){
    const classes = Storage.getAll('classes');
    const matieres = Storage.getAll('matieres');
    const anneeActive = Storage.getAllIncludingArchived('annees').find(a=>a.active);
    const periodes = anneeActive?.periodes || ['Trimestre 1','Trimestre 2','Trimestre 3'];

    // Filtres
    document.getElementById('fClasseEval').innerHTML =
      '<option value="">Toutes classes</option>' +
      classes.map(c=>`<option value="${c.id}">${Utils.escapeHtml(c.nom)}</option>`).join('');
    document.getElementById('fMatiereEval').innerHTML =
      '<option value="">Toutes matières</option>' +
      matieres.map(m=>`<option value="${m.id}">${Utils.escapeHtml(m.nom)}</option>`).join('');
    document.getElementById('fPeriodeEval').innerHTML =
      '<option value="">Toutes périodes</option>' +
      periodes.map(p=>`<option value="${p}">${p}</option>`).join('');

    // Modale évaluation
    document.getElementById('evClasse').innerHTML =
      '<option value="">— Choisir —</option>' +
      classes.map(c=>`<option value="${c.id}">${Utils.escapeHtml(c.nom)}</option>`).join('');
    document.getElementById('evMatiere').innerHTML =
      '<option value="">— Choisir —</option>' +
      matieres.map(m=>`<option value="${m.id}">${Utils.escapeHtml(m.nom)}</option>`).join('');
    document.getElementById('evPeriode').innerHTML =
      periodes.map(p=>`<option value="${p}">${p}</option>`).join('');

    // Modale classement
    document.getElementById('classClasse').innerHTML =
      classes.map(c=>`<option value="${c.id}">${Utils.escapeHtml(c.nom)}</option>`).join('');
    document.getElementById('classPeriode').innerHTML =
      periodes.map(p=>`<option value="${p}">${p}</option>`).join('');
  },

  getFilteredEvaluations(){
    let list = Storage.getAll('evaluations');
    const s = this.state;

    if(s.filtreClasse)  list = list.filter(ev=>ev.classeId === s.filtreClasse);
    if(s.filtreMatiere) list = list.filter(ev=>ev.matiereId === s.filtreMatiere);
    if(s.filtrePeriode) list = list.filter(ev=>ev.periode === s.filtrePeriode);

    if(s.search){
      list = list.filter(ev=>{
        const cls = Storage.getById('classes', ev.classeId)?.nom || '';
        const mat = Storage.getById('matieres', ev.matiereId)?.nom || '';
        return (cls+' '+mat+' '+ev.type).toLowerCase().includes(s.search);
      });
    }

    const dir = s.sortDir==='asc'?1:-1;
    list.sort((a,b)=>{
      let va, vb;
      if(s.sortKey==='classe'){
        va = Storage.getById('classes', a.classeId)?.nom || '';
        vb = Storage.getById('classes', b.classeId)?.nom || '';
      } else if(s.sortKey==='matiere'){
        va = Storage.getById('matieres', a.matiereId)?.nom || '';
        vb = Storage.getById('matieres', b.matiereId)?.nom || '';
      } else if(s.sortKey==='progression'){
        const na = Storage.getAll('notes').filter(n=>n.evaluationId===a.id && n.statut==='noté').length;
        const nb = Storage.getAll('notes').filter(n=>n.evaluationId===b.id && n.statut==='noté').length;
        return (na-nb)*dir;
      } else {
        va = a[s.sortKey] || '';
        vb = b[s.sortKey] || '';
      }
      return va.toString().localeCompare(vb.toString(), 'fr') * dir;
    });
    return list;
  },

  refresh(){
    // Stats
    const evals = Storage.getAll('evaluations');
    const notes = Storage.getAll('notes');
    const notesValides = notes.filter(n=>n.statut==='noté' && n.valeur!=null);
    const moy = notesValides.length ? (notesValides.reduce((s,n)=>s+n.valeur,0)/notesValides.length) : 0;
    document.getElementById('statNbEval').textContent = evals.length;
    document.getElementById('statNbNotes').textContent = notesValides.length;
    document.getElementById('statMoyGen').textContent = notesValides.length ? moy.toFixed(2)+'/20' : '—';
    document.getElementById('statNonEval').textContent =
      evals.reduce((s,ev)=>{
        const nbEleves = Storage.getAll('eleves').filter(e=>e.classeId===ev.classeId).length;
        const nbNotes = notes.filter(n=>n.evaluationId===ev.id && n.statut==='noté').length;
        return s + Math.max(0, nbEleves - nbNotes);
      }, 0);

    // Liste
    const list = this.getFilteredEvaluations();
    const total = list.length;
    const totalPages = Math.max(1, Math.ceil(total / this.state.pageSize));
    if(this.state.page > totalPages) this.state.page = totalPages;

    const start = (this.state.page - 1) * this.state.pageSize;
    const pageList = list.slice(start, start + this.state.pageSize);

    const tbody = document.getElementById('tbodyEval');
    if(!pageList.length){
      tbody.innerHTML = `<tr><td colspan="7" class="text-center text-muted py-4">Aucune évaluation trouvée.</td></tr>`;
    } else {
      tbody.innerHTML = pageList.map(ev=>{
        const cls = Storage.getById('classes', ev.classeId);
        const mat = Storage.getById('matieres', ev.matiereId);
        const nbEleves = Storage.getAll('eleves').filter(e=>e.classeId===ev.classeId).length;
        const nbNotes = Storage.getAll('notes').filter(n=>n.evaluationId===ev.id && n.statut==='noté').length;
        const pct = nbEleves ? Math.round((nbNotes/nbEleves)*100) : 0;
        const pctClass = pct===100?'green':pct>=50?'orange':'red';
        return `<tr>
          <td>${Utils.formatDate(ev.date)}</td>
          <td>${cls?Utils.escapeHtml(cls.nom):'—'}</td>
          <td>${mat?Utils.escapeHtml(mat.nom):'—'}</td>
          <td><span class="badge bg-secondary-subtle text-secondary">${Utils.escapeHtml(ev.type)}</span></td>
          <td>${Utils.escapeHtml(ev.periode)}</td>
          <td>
            <div class="d-flex align-items-center gap-2">
              <span class="small fw-semibold">${nbNotes}/${nbEleves}</span>
              <div class="progress-mini"><div class="fill ${pctClass}" style="width:${pct}%"></div></div>
            </div>
          </td>
          <td class="text-end">
            <button class="btn btn-sm btn-primary" title="Saisir notes" data-act="saisie" data-id="${ev.id}">
              <i class="bi bi-pencil-square"></i>
            </button>
            <button class="btn btn-sm btn-light text-danger" title="Supprimer" data-act="del" data-id="${ev.id}"><i class="bi bi-trash"></i></button>
          </td>
        </tr>`;
      }).join('');
    }

    tbody.querySelectorAll('[data-act]').forEach(btn=>{
      btn.onclick = ()=>{
        const id = btn.dataset.id;
        const act = btn.dataset.act;
        if(act==='saisie') this.openSaisie(id);
        else if(act==='del') this.deleteEval(id);
      };
    });

    document.getElementById('paginationInfoEval').textContent =
      total === 0 ? '0 résultat' : `${start+1}–${Math.min(start+this.state.pageSize, total)} sur ${total} évaluation(s)`;

    const pag = document.getElementById('paginationEval');
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

  openForm(){
    const modal = new bootstrap.Modal(document.getElementById('modalEval'));
    const form = document.getElementById('formEval');
    form.classList.remove('was-validated');
    form.reset();
    document.getElementById('modalEvalTitle').textContent = 'Nouvelle évaluation';
    document.getElementById('evId').value = '';
    document.getElementById('evDate').value = new Date().toISOString().slice(0,10);
    modal.show();
  },

  saveEval(){
    const form = document.getElementById('formEval');
    form.classList.add('was-validated');
    if(!form.checkValidity()) return;

    const anneeActive = Storage.getAllIncludingArchived('annees').find(a=>a.active);
    const data = {
      classeId:  document.getElementById('evClasse').value,
      matiereId: document.getElementById('evMatiere').value,
      type:      document.getElementById('evType').value,
      periode:   document.getElementById('evPeriode').value,
      date:      document.getElementById('evDate').value,
      bareme:    parseInt(document.getElementById('evBareme').value) || 20,
      anneeId:   anneeActive?.id
    };

    // Doublon : même classe + matière + type + période + date
    const dup = Storage.getAll('evaluations').find(ev=>
      ev.classeId===data.classeId && ev.matiereId===data.matiereId &&
      ev.type===data.type && ev.periode===data.periode && ev.date===data.date
    );
    if(dup){
      Notify.toast('Cette évaluation existe déjà.', 'danger');
      return;
    }

    const created = Storage.create('evaluations', data);
    Notify.toast('Évaluation créée. Saisissez les notes.', 'success');
    bootstrap.Modal.getInstance(document.getElementById('modalEval')).hide();
    this.refresh();
    // Ouvrir directement la saisie
    this.openSaisie(created.id);
  },

  deleteEval(id){
    const ev = Storage.getById('evaluations', id);
    if(!ev) return;
    const nbNotes = Storage.getAll('notes').filter(n=>n.evaluationId===id).length;
    if(nbNotes > 0){
      if(!confirm(`Cette évaluation contient ${nbNotes} note(s). Supprimer ?`)) return;
    } else {
      if(!confirm('Supprimer cette évaluation ?')) return;
    }
    // Supprimer les notes liées
    const notes = Storage.getAll('notes').filter(n=>n.evaluationId===id);
    notes.forEach(n=>Storage.remove('notes', n.id, false));
    Storage.remove('evaluations', id, true);
    Notify.toast('Évaluation supprimée.', 'warning');
    this.refresh();
  },

  openSaisie(evalId){
    const ev = Storage.getById('evaluations', evalId);
    if(!ev) return;
    this.state.saisieEvalId = evalId;

    const cls = Storage.getById('classes', ev.classeId);
    const mat = Storage.getById('matieres', ev.matiereId);
    const eleves = Storage.getAll('eleves').filter(e=>e.classeId===ev.classeId).sort((a,b)=>a.nom.localeCompare(b.nom));
    const notes = Storage.getAll('notes').filter(n=>n.evaluationId===evalId);

    document.getElementById('saisieTitle').textContent = `Saisie : ${mat?.nom} · ${cls?.nom}`;
    document.getElementById('saisieSub').textContent = `${ev.type} — ${ev.periode} — ${Utils.formatDate(ev.date)} (Barème /${ev.bareme||20})`;

    if(!eleves.length){
      document.getElementById('saisieBody').innerHTML =
        `<div class="empty-module"><i class="bi bi-people"></i><p>Aucun élève dans cette classe.</p></div>`;
      new bootstrap.Modal(document.getElementById('modalSaisie')).show();
      return;
    }

    document.getElementById('saisieBody').innerHTML = `
      <div class="table-responsive">
        <table class="table table-hover align-middle mb-0 saisie-table">
          <thead>
            <tr>
              <th style="width:40px">#</th>
              <th>Matricule</th>
              <th>Nom & Prénom</th>
              <th style="width:130px">Note /${ev.bareme||20}</th>
              <th style="width:150px">Statut</th>
            </tr>
          </thead>
          <tbody>
            ${eleves.map((e,i)=>{
              const note = notes.find(n=>n.eleveId===e.id);
              const valeur = note && note.statut==='noté' && note.valeur!=null ? note.valeur : '';
              const statut = note ? note.statut : 'noté';
              return `<tr data-eleve="${e.id}">
                <td>${i+1}</td>
                <td><span class="badge-matricule">${Utils.escapeHtml(e.matricule)}</span></td>
                <td><strong>${Utils.escapeHtml(e.prenom+' '+e.nom)}</strong></td>
                <td>
                  <input type="number" class="form-control form-control-sm note-input"
                    data-eleve="${e.id}" min="0" max="${ev.bareme||20}" step="0.25"
                    value="${valeur}" placeholder="—">
                </td>
                <td>
                  <select class="form-select form-select-sm statut-select" data-eleve="${e.id}">
                    <option value="noté" ${statut==='noté'?'selected':''}>Noté</option>
                    <option value="absent" ${statut==='absent'?'selected':''}>Absent</option>
                    <option value="dispensé" ${statut==='dispensé'?'selected':''}>Dispensé</option>
                  </select>
                </td>
              </tr>`;
            }).join('')}
          </tbody>
        </table>
      </div>
    `;

    // Activer/désactiver input selon statut
    document.querySelectorAll('.statut-select').forEach(sel=>{
      sel.onchange = ()=>{
        const elvId = sel.dataset.eleve;
        const input = document.querySelector(`.note-input[data-eleve="${elvId}"]`);
        if(sel.value !== 'noté'){
          input.value = '';
          input.disabled = true;
        } else {
          input.disabled = false;
        }
        this.updateSaisieStats();
      };
    });
    // Init : désactiver ceux qui sont absents/dispensés
    document.querySelectorAll('.statut-select').forEach(sel=>{
      const elvId = sel.dataset.eleve;
      const input = document.querySelector(`.note-input[data-eleve="${elvId}"]`);
      if(sel.value !== 'noté') input.disabled = true;
    });
    // Stats live
    document.querySelectorAll('.note-input').forEach(inp=>{
      inp.oninput = ()=> this.updateSaisieStats();
    });

    this.updateSaisieStats();
    new bootstrap.Modal(document.getElementById('modalSaisie')).show();
  },

  updateSaisieStats(){
    const inputs = [...document.querySelectorAll('.note-input')].filter(i=>!i.disabled && i.value!=='');
    const vals = inputs.map(i=>parseFloat(i.value)).filter(v=>!isNaN(v));
    if(!vals.length){
      document.getElementById('saisieStats').textContent = 'Aucune note saisie.';
      return;
    }
    const moy = vals.reduce((a,b)=>a+b,0)/vals.length;
    const min = Math.min(...vals);
    const max = Math.max(...vals);
    document.getElementById('saisieStats').innerHTML =
      `<strong>${vals.length}</strong> note(s) — Moyenne : <strong>${moy.toFixed(2)}</strong> · Min : ${min} · Max : ${max}`;
  },

  saveNotes(){
    const evalId = this.state.saisieEvalId;
    const ev = Storage.getById('evaluations', evalId);
    if(!ev) return;
    const bareme = ev.bareme || 20;

    const rows = document.querySelectorAll('#saisieBody tbody tr');
    let created = 0, updated = 0, deleted = 0;

    rows.forEach(row=>{
      const elvId = row.dataset.eleve;
      const input = row.querySelector('.note-input');
      const sel = row.querySelector('.statut-select');
      const statut = sel.value;
      const valRaw = input.value.trim();

      const existing = Storage.getAll('notes').find(n=>n.evaluationId===evalId && n.eleveId===elvId);

      if(statut !== 'noté'){
        // Absent ou dispensé
        if(existing){
          Storage.update('notes', existing.id, {statut, valeur:null});
          updated++;
        } else {
          Storage.create('notes', {
            evaluationId: evalId, eleveId: elvId,
            statut, valeur: null, anneeId: ev.anneeId
          });
          created++;
        }
        return;
      }

      // Statut "noté" mais note vide → on ignore (non évalué)
      if(valRaw === ''){
        if(existing){ Storage.remove('notes', existing.id, false); deleted++; }
        return;
      }

      let val = parseFloat(valRaw);
      if(isNaN(val) || val < 0 || val > bareme){
        Notify.toast(`Note invalide pour ${elvId} (0–${bareme}).`, 'danger');
        return;
      }

      // Ramener sur 20
      const val20 = +(val * (20/bareme)).toFixed(2);

      if(existing){
        Storage.update('notes', existing.id, {statut:'noté', valeur: val20});
        updated++;
      } else {
        Storage.create('notes', {
          evaluationId: evalId, eleveId: elvId,
          statut:'noté', valeur: val20, anneeId: ev.anneeId
        });
        created++;
      }
    });

    Notify.toast(`Notes enregistrées (${created} ajoutées, ${updated} modifiées${deleted?`, ${deleted} supprimées`:''}).`, 'success');
    bootstrap.Modal.getInstance(document.getElementById('modalSaisie')).hide();
    this.refresh();
  },

  // ============================================================
  // CALCULS : moyennes pondérées, rangs, classements
  // ============================================================

  /**
   * Calcule pour chaque élève d'une classe, sur une période :
   * - moyenne par matière (pondérée par les poids d'évaluation)
   * - moyenne générale (pondérée par coefficients de matières)
   * - rang
   */
  calcClassement(){
    const classeId = document.getElementById('classClasse').value;
    const periode = document.getElementById('classPeriode').value;
    const cls = Storage.getById('classes', classeId);
    if(!cls) return;

    const eleves = Storage.getAll('eleves').filter(e=>e.classeId===classeId);
    if(!eleves.length){
      document.getElementById('classementBody').innerHTML =
        `<div class="empty-module"><i class="bi bi-people"></i><p>Aucun élève dans cette classe.</p></div>`;
      return;
    }

    // Évaluations de la période pour cette classe
    const evals = Storage.getAll('evaluations').filter(ev=>
      ev.classeId===classeId && ev.periode===periode
    );
    if(!evals.length){
      document.getElementById('classementBody').innerHTML =
        `<div class="alert alert-warning small">Aucune évaluation enregistrée pour cette classe et cette période.</div>`;
      return;
    }

    const matieres = Storage.getAll('matieres').filter(m=>(m.classeIds||[]).includes(classeId));
    const notes = Storage.getAll('notes');

    // Calcul par élève
    const resultats = eleves.map(el=>{
      let totalPoints = 0, totalCoef = 0;
      const details = [];

      matieres.forEach(mat=>{
        const matEvals = evals.filter(ev=>ev.matiereId===mat.id);
        let sumNotes = 0, sumPoids = 0;
        matEvals.forEach(ev=>{
          const note = notes.find(n=>n.evaluationId===ev.id && n.eleveId===el.id);
          if(note && note.statut==='noté' && note.valeur!=null){
            const poids = this.POIDS[ev.type] || 1;
            sumNotes += note.valeur * poids;
            sumPoids += poids;
          }
        });
        if(sumPoids > 0){
          const moyMat = sumNotes / sumPoids;
          totalPoints += moyMat * mat.coefficient;
          totalCoef += mat.coefficient;
          details.push({matiere: mat.nom, coef: mat.coefficient, moyenne: moyMat});
        }
      });

      const moyGen = totalCoef > 0 ? totalPoints / totalCoef : null;
      return {eleve: el, moyenne: moyGen, totalCoef, details};
    });

    // Trier par moyenne descendante
    const evalues = resultats.filter(r=>r.moyenne != null).sort((a,b)=>b.moyenne - a.moyenne);
    const nonEvalues = resultats.filter(r=>r.moyenne == null);

    // Attribuer rang
    evalues.forEach((r,i)=>{
      r.rang = i+1;
      // Ex-aequo : même moyenne
      if(i>0 && Math.abs(evalues[i-1].moyenne - r.moyenne) < 0.01){
        r.rang = evalues[i-1].rang;
      }
    });

    // Stats classe
    const moyennes = evalues.map(r=>r.moyenne);
    const moyClasse = moyennes.length ? moyennes.reduce((a,b)=>a+b,0)/moyennes.length : 0;
    const moyMin = moyennes.length ? Math.min(...moyennes) : 0;
    const moyMax = moyennes.length ? Math.max(...moyennes) : 0;

    document.getElementById('classementBody').innerHTML = `
      <div class="alert alert-light border d-flex flex-wrap gap-3 small mb-3">
        <div><strong>Classe :</strong> ${Utils.escapeHtml(cls.nom)}</div>
        <div><strong>Période :</strong> ${Utils.escapeHtml(periode)}</div>
        <div><strong>Élèves évalués :</strong> ${evalues.length} / ${eleves.length}</div>
        <div><strong>Moyenne classe :</strong> ${moyClasse.toFixed(2)}/20</div>
        <div><strong>Min :</strong> ${moyMin.toFixed(2)}</div>
        <div><strong>Max :</strong> ${moyMax.toFixed(2)}</div>
      </div>

      <div class="table-responsive">
        <table class="table table-hover table-sm align-middle">
          <thead>
            <tr>
              <th>Rang</th>
              <th>Matricule</th>
              <th>Nom & Prénom</th>
              <th>Moyenne</th>
              <th>Mention</th>
            </tr>
          </thead>
          <tbody>
            ${evalues.map(r=>{
              const mention = this.getMention(r.moyenne);
              return `<tr>
                <td><strong>${r.rang}</strong>${r.rang<=3?' <i class="bi bi-trophy-fill text-warning"></i>':''}</td>
                <td>${Utils.escapeHtml(r.eleve.matricule)}</td>
                <td>${Utils.escapeHtml(r.eleve.prenom+' '+r.eleve.nom)}</td>
                <td class="fw-bold">${r.moyenne.toFixed(2)}</td>
                <td><span class="badge bg-${mention.color}-subtle text-${mention.color}">${mention.label}</span></td>
              </tr>`;
            }).join('')}
            ${nonEvalues.length?`<tr><td colspan="5" class="text-muted small text-center py-2">${nonEvalues.length} élève(s) sans note</td></tr>`:''}
          </tbody>
        </table>
      </div>
    `;
  },

  getMention(moy){
    if(moy >= 16) return {label:'Excellent', color:'success'};
    if(moy >= 14) return {label:'Très bien', color:'success'};
    if(moy >= 12) return {label:'Bien', color:'primary'};
    if(moy >= 10) return {label:'Passable', color:'warning'};
    if(moy >= 8)  return {label:'Insuffisant', color:'orange'};
    return {label:'Faible', color:'danger'};
  },

  openClassement(){
    new bootstrap.Modal(document.getElementById('modalClassement')).show();
    this.calcClassement();
  }
};