/**
 * Module : Notes et évaluations (mode supérieur LMD).
 * Saisie par ECUE, sessions S1/S2/Rattrapage, calcul moyennes UE.
 */
const NotesLMD = {
  POIDS: {
    'CC': 0.4,
    'TP': 0.4,
    'Examen': 0.6,
    'Rattrapage': 1.0
  },

  state: {
    page: 1, pageSize: 15,
    search: '', filtreUE: '', filtreSession: '', filtreGroupe: '',
    saisieEvalId: null
  },

  render(container){
    this.container = container;
    container.innerHTML = `
      <div class="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
        <div>
          <div class="page-title">Notes et évaluations LMD</div>
          <div class="page-sub">Saisie par ECUE — Sessions S1, S2, Rattrapage</div>
        </div>
        <div class="d-flex gap-2">
          <button class="btn btn-outline-primary btn-sm" id="btnCalcMoyennes">
            <i class="bi bi-calculator me-1"></i> Calculer les moyennes UE
          </button>
          <button class="btn btn-primary btn-sm" id="btnAddEvalLMD">
            <i class="bi bi-plus-lg me-1"></i> Nouvelle évaluation
          </button>
        </div>
      </div>

      <div class="row g-3 mb-3">
        <div class="col-6 col-md-3">
          <div class="stat-card">
            <div class="stat-icon"><i class="bi bi-clipboard-check"></i></div>
            <div><div class="stat-value" id="statNbEvalLMD">0</div><div class="stat-label">Évaluations</div></div>
          </div>
        </div>
        <div class="col-6 col-md-3">
          <div class="stat-card">
            <div class="stat-icon green"><i class="bi bi-pencil-square"></i></div>
            <div><div class="stat-value" id="statNbNotesLMD">0</div><div class="stat-label">Notes saisies</div></div>
          </div>
        </div>
        <div class="col-6 col-md-3">
          <div class="stat-card">
            <div class="stat-icon purple"><i class="bi bi-award"></i></div>
            <div><div class="stat-value" id="statNbUEValidees">0</div><div class="stat-label">UE validées</div></div>
          </div>
        </div>
        <div class="col-6 col-md-3">
          <div class="stat-card">
            <div class="stat-icon orange"><i class="bi bi-arrow-repeat"></i></div>
            <div><div class="stat-value" id="statNbRattrapages">0</div><div class="stat-label">En rattrapage</div></div>
          </div>
        </div>
      </div>

      <div class="card-panel">
        <div class="row g-2 mb-3">
          <div class="col-12 col-md-3">
            <div class="search-inline">
              <i class="bi bi-search"></i>
              <input type="text" id="fSearchEvalLMD" placeholder="Rechercher…">
            </div>
          </div>
          <div class="col-6 col-md-3">
            <select class="form-select form-select-sm" id="fUE_EvalLMD"><option value="">Toutes UE</option></select>
          </div>
          <div class="col-6 col-md-2">
            <select class="form-select form-select-sm" id="fSessionEvalLMD">
              <option value="">Toutes sessions</option>
              <option value="S1">Session 1 (normale)</option>
              <option value="S2">Session 2 (rattrapage)</option>
            </select>
          </div>
          <div class="col-6 col-md-2">
            <select class="form-select form-select-sm" id="fGroupeEvalLMD"><option value="">Tous groupes</option></select>
          </div>
          <div class="col-6 col-md-2">
            <button class="btn btn-outline-secondary btn-sm w-100" id="btnResetEvalLMD">
              <i class="bi bi-arrow-counterclockwise"></i> Reset
            </button>
          </div>
        </div>

        <div class="table-responsive">
          <table class="table table-hover align-middle mb-0" id="tblEvalLMD">
            <thead>
              <tr>
                <th>Date</th>
                <th>UE</th>
                <th>ECUE</th>
                <th>Groupe</th>
                <th>Type</th>
                <th>Session</th>
                <th>Progression</th>
                <th class="text-end">Actions</th>
              </tr>
            </thead>
            <tbody id="tbodyEvalLMD"></tbody>
          </table>
        </div>

        <div class="d-flex flex-wrap justify-content-between align-items-center mt-3 gap-2">
          <small class="text-muted" id="paginationInfoEvalLMD"></small>
          <nav><ul class="pagination pagination-sm mb-0" id="paginationEvalLMD"></ul></nav>
        </div>
      </div>

      <!-- Modale évaluation -->
      <div class="modal fade" id="modalEvalLMD" tabindex="-1">
        <div class="modal-dialog modal-lg modal-dialog-centered">
          <div class="modal-content modal-sup">
            <form id="formEvalLMD" novalidate>
              <div class="modal-header">
                <h6 class="modal-title">Nouvelle évaluation LMD</h6>
                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
              </div>
              <div class="modal-body">
                <div class="row g-3">
                  <div class="col-md-6">
                    <label class="form-label">Filière *</label>
                    <select class="form-select" id="evFILMD" required></select>
                  </div>
                  <div class="col-md-6">
                    <label class="form-label">Niveau *</label>
                    <select class="form-select" id="evNIVLMD" required></select>
                  </div>
                  <div class="col-md-6">
                    <label class="form-label">UE *</label>
                    <select class="form-select" id="evUELMD" required></select>
                  </div>
                  <div class="col-md-6">
                    <label class="form-label">ECUE *</label>
                    <select class="form-select" id="evECUELMD" required></select>
                  </div>
                  <div class="col-md-6">
                    <label class="form-label">Groupe *</label>
                    <select class="form-select" id="evGRPLMD" required></select>
                  </div>
                  <div class="col-md-6">
                    <label class="form-label">Type d'évaluation *</label>
                    <select class="form-select" id="evTYPE" required>
                      <option value="CC">Contrôle Continu (40%)</option>
                      <option value="Examen">Examen (60%)</option>
                      <option value="TP">TP (40%)</option>
                      <option value="Rattrapage">Rattrapage (100%)</option>
                    </select>
                  </div>
                  <div class="col-md-6">
                    <label class="form-label">Session *</label>
                    <select class="form-select" id="evSESSION" required>
                      <option value="S1">Session 1 (normale)</option>
                      <option value="S2">Session 2 (rattrapage)</option>
                    </select>
                  </div>
                  <div class="col-md-6">
                    <label class="form-label">Date *</label>
                    <input type="date" class="form-control" id="evDATELMD" required>
                  </div>
                </div>
              </div>
              <div class="modal-footer">
                <button type="button" class="btn btn-light" data-bs-dismiss="modal">Annuler</button>
                <button type="submit" class="btn btn-primary"><i class="bi bi-check2 me-1"></i> Créer</button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <!-- Modale saisie -->
      <div class="modal fade" id="modalSaisieLMD" tabindex="-1">
        <div class="modal-dialog modal-xl modal-dialog-scrollable">
          <div class="modal-content">
            <div class="modal-header">
              <div>
                <h6 class="modal-title" id="saisieLMDTitle">Saisie des notes</h6>
                <small class="text-muted" id="saisieLMDSub"></small>
              </div>
              <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body" id="saisieLMDBody"></div>
            <div class="modal-footer">
              <div class="me-auto small text-muted" id="saisieLMDStats"></div>
              <button type="button" class="btn btn-light" data-bs-dismiss="modal">Fermer</button>
              <button type="button" class="btn btn-primary" id="btnSaveNotesLMD">
                <i class="bi bi-save me-1"></i> Enregistrer
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Modale calcul moyennes -->
      <div class="modal fade" id="modalCalcLMD" tabindex="-1">
        <div class="modal-dialog modal-xl modal-dialog-scrollable">
          <div class="modal-content">
            <div class="modal-header">
              <h6 class="modal-title"><i class="bi bi-calculator me-1"></i> Calcul des moyennes UE</h6>
              <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body">
              <div class="row g-2 mb-3">
                <div class="col-md-4">
                  <select class="form-select form-select-sm" id="calcGroupeLMD"></select>
                </div>
                <div class="col-md-3">
                  <select class="form-select form-select-sm" id="calcSessionLMD">
                    <option value="S1">Session 1</option>
                    <option value="S2">Session 2</option>
                  </select>
                </div>
                <div class="col-md-3">
                  <button class="btn btn-primary btn-sm w-100" id="btnDoCalcLMD">
                    <i class="bi bi-play-fill me-1"></i> Calculer
                  </button>
                </div>
              </div>
              <div id="calcResultLMD"></div>
            </div>
          </div>
        </div>
      </div>
    `;

    this.bindEvents();
    this.populateSelects();
    this.refresh();
  },

  bindEvents(){
    document.getElementById('btnAddEvalLMD').onclick = ()=> this.openForm();
    document.getElementById('btnCalcMoyennes').onclick = ()=> this.openCalc();
    document.getElementById('fSearchEvalLMD').addEventListener('input', e=>{
      this.state.search = e.target.value.trim().toLowerCase();
      this.state.page = 1;
      this.refresh();
    });
    document.getElementById('fUE_EvalLMD').onchange = e=>{
      this.state.filtreUE = e.target.value;
      this.state.page = 1;
      this.refresh();
    };
    document.getElementById('fSessionEvalLMD').onchange = e=>{
      this.state.filtreSession = e.target.value;
      this.state.page = 1;
      this.refresh();
    };
    document.getElementById('fGroupeEvalLMD').onchange = e=>{
      this.state.filtreGroupe = e.target.value;
      this.state.page = 1;
      this.refresh();
    };
    document.getElementById('btnResetEvalLMD').onclick = ()=>{
      this.state = {...this.state, page:1, search:'', filtreUE:'', filtreSession:'', filtreGroupe:''};
      document.getElementById('fSearchEvalLMD').value='';
      document.getElementById('fUE_EvalLMD').value='';
      document.getElementById('fSessionEvalLMD').value='';
      document.getElementById('fGroupeEvalLMD').value='';
      this.refresh();
    };
    document.getElementById('formEvalLMD').onsubmit = (e)=>{ e.preventDefault(); this.saveEval(); };
    document.getElementById('btnSaveNotesLMD').onclick = ()=> this.saveNotes();
    document.getElementById('btnDoCalcLMD').onclick = ()=> this.doCalcMoyennes();

    // Cascade formulaire évaluation
    document.getElementById('evFILMD').onchange = ()=>{
      const fid = document.getElementById('evFILMD').value;
      const niveaux = Storage.getAll('niveaux').filter(n=>n.filiereId === fid);
      document.getElementById('evNIVLMD').innerHTML = niveaux.map(n=>`<option value="${n.id}">${Utils.escapeHtml(n.libelle)}</option>`).join('');
      this.updateFormUE();
    };
    document.getElementById('evNIVLMD').onchange = ()=> this.updateFormUE();
    document.getElementById('evUELMD').onchange = ()=> this.updateFormECUE();
    document.getElementById('evNIVLMD').addEventListener('change', ()=>{
      this.updateFormGroupes();
    });
  },

  populateSelects(){
    // Filières
    const filieres = Storage.getAll('filieres');
    document.getElementById('evFILMD').innerHTML = filieres.map(f=>`<option value="${f.id}">${Utils.escapeHtml(f.code+' — '+f.nom)}</option>`).join('');
    // Déclencher la cascade
    document.getElementById('evFILMD').dispatchEvent(new Event('change'));

    // Filtres
    document.getElementById('fUE_EvalLMD').innerHTML = '<option value="">Toutes UE</option>' +
      Storage.getAll('ue').map(u=>`<option value="${u.id}">${Utils.escapeHtml(u.code+' — '+u.nom)}</option>`).join('');
    document.getElementById('fGroupeEvalLMD').innerHTML = '<option value="">Tous groupes</option>' +
      Storage.getAll('groupes').map(g=>`<option value="${g.id}">${Utils.escapeHtml(g.nom)}</option>`).join('');

    // Calcul
    document.getElementById('calcGroupeLMD').innerHTML =
      Storage.getAll('groupes').map(g=>`<option value="${g.id}">${Utils.escapeHtml(g.nom)}</option>`).join('');
  },

  updateFormUE(){
    const nid = document.getElementById('evNIVLMD').value;
    const ues = Storage.getAll('ue').filter(u=>u.niveauId === nid);
    document.getElementById('evUELMD').innerHTML = ues.length
      ? ues.map(u=>`<option value="${u.id}">${Utils.escapeHtml(u.code+' — '+u.nom)}</option>`).join('')
      : '<option value="">— Aucune UE —</option>';
    this.updateFormECUE();
    this.updateFormGroupes();
  },

  updateFormECUE(){
    const uid = document.getElementById('evUELMD').value;
    const ecues = Storage.getAll('ecue').filter(e=>e.ueId === uid);
    document.getElementById('evECUELMD').innerHTML = ecues.length
      ? ecues.map(e=>`<option value="${e.id}">${Utils.escapeHtml(e.nom)}</option>`).join('')
      : '<option value="">— Aucun ECUE —</option>';
  },

  updateFormGroupes(){
    const nid = document.getElementById('evNIVLMD').value;
    const grps = Storage.getAll('groupes').filter(g=>g.niveauId === nid);
    document.getElementById('evGRPLMD').innerHTML = grps.length
      ? grps.map(g=>`<option value="${g.id}">${Utils.escapeHtml(g.nom)}</option>`).join('')
      : '<option value="">— Aucun groupe —</option>';
  },

  getFiltered(){
    let list = Storage.getAll('evaluationsLMD');
    const s = this.state;
    if(s.filtreUE) list = list.filter(e=>e.ueId === s.filtreUE);
    if(s.filtreSession) list = list.filter(e=>e.session === s.filtreSession);
    if(s.filtreGroupe) list = list.filter(e=>e.groupeId === s.filtreGroupe);
    if(s.search){
      list = list.filter(e=>{
        const ue = Storage.getById('ue', e.ueId);
        const ec = Storage.getById('ecue', e.ecueId);
        return ((ue?.nom||'')+' '+(ec?.nom||'')).toLowerCase().includes(s.search);
      });
    }
    list.sort((a,b)=>(b.date||'').localeCompare(a.date||''));
    return list;
  },

  refresh(){
    // Stats
    const evals = Storage.getAll('evaluationsLMD');
    const notes = Storage.getAll('notesLMD');
    document.getElementById('statNbEvalLMD').textContent = evals.length;
    document.getElementById('statNbNotesLMD').textContent = notes.filter(n=>n.statut==='noté').length;

    // Calculer les UE validées / rattrapage
    let nbValidees = 0, nbRattrapages = 0;
    Storage.getAll('groupes').forEach(grp=>{
      const results = this.calcMoyennes(grp.id, 'S1');
      if(results){
        results.ues.forEach(u=>{
          if(u.moyenne != null){
            if(u.moyenne >= 10) nbValidees++;
            else if(u.moyenne >= 8) nbRattrapages++;
          }
        });
      }
    });
    document.getElementById('statNbUEValidees').textContent = nbValidees;
    document.getElementById('statNbRattrapages').textContent = nbRattrapages;

    // Liste
    const list = this.getFiltered();
    const total = list.length;
    const totalPages = Math.max(1, Math.ceil(total / this.state.pageSize));
    if(this.state.page > totalPages) this.state.page = totalPages;
    const start = (this.state.page - 1) * this.state.pageSize;
    const pageList = list.slice(start, start + this.state.pageSize);

    const tbody = document.getElementById('tbodyEvalLMD');
    tbody.innerHTML = pageList.length ? pageList.map(ev=>{
      const ue = Storage.getById('ue', ev.ueId);
      const ecue = Storage.getById('ecue', ev.ecueId);
      const grp = Storage.getById('groupes', ev.groupeId);
      const nbEtus = Storage.getAll('eleves').filter(e=>e.classeId === ev.groupeId && e.typeEtudiant === 'superieur').length;
      const nbNotes = Storage.getAll('notesLMD').filter(n=>n.evaluationId === ev.id && n.statut === 'noté').length;
      const pct = nbEtus ? Math.round((nbNotes/nbEtus)*100) : 0;
      return `<tr>
        <td>${Utils.formatDate(ev.date)}</td>
        <td><strong>${Utils.escapeHtml(ue?.code||'')}</strong><br><small class="text-muted">${Utils.escapeHtml(ue?.nom||'')}</small></td>
        <td>${Utils.escapeHtml(ecue?.nom||'—')}</td>
        <td>${Utils.escapeHtml(grp?.nom||'—')}</td>
        <td><span class="badge bg-secondary-subtle text-secondary">${ev.type}</span></td>
        <td><span class="badge bg-${ev.session==='S2'?'warning':'primary'}-subtle text-${ev.session==='S2'?'warning':'primary'}">${ev.session}</span></td>
        <td><div class="progress-mini"><div class="fill ${pct===100?'green':pct>=50?'orange':'red'}" style="width:${pct}%"></div></div> <small>${nbNotes}/${nbEtus}</small></td>
        <td class="text-end">
          <button class="btn btn-sm btn-primary" data-act="saisie" data-id="${ev.id}" title="Saisir"><i class="bi bi-pencil-square"></i></button>
          <button class="btn btn-sm btn-light text-danger" data-act="del" data-id="${ev.id}" title="Supprimer"><i class="bi bi-trash"></i></button>
        </td>
      </tr>`;
    }).join('') : `<tr><td colspan="8" class="text-center text-muted py-4">Aucune évaluation LMD.</td></tr>`;

    tbody.querySelectorAll('[data-act]').forEach(btn=>{
      btn.onclick = ()=>{
        const id = btn.dataset.id;
        if(btn.dataset.act === 'saisie') this.openSaisie(id);
        else this.deleteEval(id);
      };
    });

    document.getElementById('paginationInfoEvalLMD').textContent =
      total === 0 ? '0 résultat' : `${start+1}–${Math.min(start+this.state.pageSize, total)} sur ${total} évaluation(s)`;

    this.renderPagination(totalPages);
  },

  renderPagination(totalPages){
    const pag = document.getElementById('paginationEvalLMD');
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

  openForm(){
    document.getElementById('formEvalLMD').classList.remove('was-validated');
    document.getElementById('formEvalLMD').reset();
    document.getElementById('evFILMD').dispatchEvent(new Event('change'));
    document.getElementById('evDATELMD').value = new Date().toISOString().slice(0,10);
    new bootstrap.Modal(document.getElementById('modalEvalLMD')).show();
  },

  saveEval(){
    const form = document.getElementById('formEvalLMD');
    form.classList.add('was-validated');
    if(!form.checkValidity()) return;

    const anneeActive = Storage.getAllIncludingArchived('annees').find(a=>a.active);
    const ueId = document.getElementById('evUELMD').value;
    const ue = Storage.getById('ue', ueId);
    const data = {
      ueId,
      ecueId: document.getElementById('evECUELMD').value,
      groupeId: document.getElementById('evGRPLMD').value,
      semestre: ue?.semestre || 'S1',
      session: document.getElementById('evSESSION').value,
      type: document.getElementById('evTYPE').value,
      date: document.getElementById('evDATELMD').value,
      bareme: 20,
      anneeId: anneeActive?.id
    };

    Storage.create('evaluationsLMD', data);
    Notify.toast('Évaluation LMD créée.', 'success');
    bootstrap.Modal.getInstance(document.getElementById('modalEvalLMD')).hide();
    this.refresh();
  },

  deleteEval(id){
    const ev = Storage.getById('evaluationsLMD', id);
    if(!ev) return;
    const nbNotes = Storage.getAll('notesLMD').filter(n=>n.evaluationId === id).length;
    if(nbNotes > 0 && !confirm(`Cette évaluation contient ${nbNotes} note(s). Supprimer ?`)) return;
    // Supprimer les notes liées
    Storage.getAll('notesLMD').filter(n=>n.evaluationId === id).forEach(n=>Storage.remove('notesLMD', n.id, false));
    Storage.remove('evaluationsLMD', id, true);
    Notify.toast('Évaluation supprimée.', 'warning');
    this.refresh();
  },

  openSaisie(evalId){
    const ev = Storage.getById('evaluationsLMD', evalId);
    if(!ev) return;
    this.state.saisieEvalId = evalId;

    const ue = Storage.getById('ue', ev.ueId);
    const ecue = Storage.getById('ecue', ev.ecueId);
    const grp = Storage.getById('groupes', ev.groupeId);
    const etudiants = Storage.getAll('eleves').filter(e=>e.classeId === ev.groupeId && e.typeEtudiant === 'superieur').sort((a,b)=>a.nom.localeCompare(b.nom));
    const notes = Storage.getAll('notesLMD').filter(n=>n.evaluationId === evalId);

    document.getElementById('saisieLMDTitle').textContent = `${ecue?.nom} · ${grp?.nom}`;
    document.getElementById('saisieLMDSub').textContent = `${ue?.code} — ${ev.type} — ${ev.session} — ${Utils.formatDate(ev.date)}`;

    if(!etudiants.length){
      document.getElementById('saisieLMDBody').innerHTML = `<div class="empty-module"><i class="bi bi-people"></i><p>Aucun étudiant dans ce groupe.</p></div>`;
      new bootstrap.Modal(document.getElementById('modalSaisieLMD')).show();
      return;
    }

    document.getElementById('saisieLMDBody').innerHTML = `
      <div class="table-responsive">
        <table class="table table-hover align-middle mb-0">
          <thead><tr>
            <th style="width:40px">#</th>
            <th>Matricule</th>
            <th>Nom & Prénom</th>
            <th style="width:130px">Note /20</th>
            <th style="width:150px">Statut</th>
          </tr></thead>
          <tbody>
            ${etudiants.map((e,i)=>{
              const note = notes.find(n=>n.etudiantId === e.id);
              const valeur = note && note.statut==='noté' && note.valeur!=null ? note.valeur : '';
              const statut = note ? note.statut : 'noté';
              return `<tr data-etudiant="${e.id}">
                <td>${i+1}</td>
                <td><span class="badge-matricule">${Utils.escapeHtml(e.matricule)}</span></td>
                <td><strong>${Utils.escapeHtml(e.prenom+' '+e.nom)}</strong></td>
                <td><input type="number" class="form-control form-control-sm note-input-LMD" data-etudiant="${e.id}" min="0" max="20" step="0.25" value="${valeur}" placeholder="—"></td>
                <td><select class="form-select form-select-sm statut-select-LMD" data-etudiant="${e.id}">
                  <option value="noté" ${statut==='noté'?'selected':''}>Noté</option>
                  <option value="absent" ${statut==='absent'?'selected':''}>Absent</option>
                  <option value="dispensé" ${statut==='dispensé'?'selected':''}>Dispensé</option>
                </select></td>
              </tr>`;
            }).join('')}
          </tbody>
        </table>
      </div>
    `;

    // Activer/désactiver selon statut
    document.querySelectorAll('.statut-select-LMD').forEach(sel=>{
      sel.onchange = ()=>{
        const eid = sel.dataset.etudiant;
        const inp = document.querySelector(`.note-input-LMD[data-etudiant="${eid}"]`);
        if(sel.value !== 'noté'){ inp.value=''; inp.disabled=true; }
        else inp.disabled = false;
        this.updateSaisieStats();
      };
      const eid = sel.dataset.etudiant;
      const inp = document.querySelector(`.note-input-LMD[data-etudiant="${eid}"]`);
      if(sel.value !== 'noté') inp.disabled = true;
    });
    document.querySelectorAll('.note-input-LMD').forEach(inp=>{
      inp.oninput = ()=> this.updateSaisieStats();
    });

    this.updateSaisieStats();
    new bootstrap.Modal(document.getElementById('modalSaisieLMD')).show();
  },

  updateSaisieStats(){
    const inputs = [...document.querySelectorAll('.note-input-LMD')].filter(i=>!i.disabled && i.value !== '');
    const vals = inputs.map(i=>parseFloat(i.value)).filter(v=>!isNaN(v));
    if(!vals.length){
      document.getElementById('saisieLMDStats').textContent = 'Aucune note saisie.';
      return;
    }
    const moy = vals.reduce((a,b)=>a+b,0)/vals.length;
    const min = Math.min(...vals);
    const max = Math.max(...vals);
    document.getElementById('saisieLMDStats').innerHTML =
      `<strong>${vals.length}</strong> note(s) — Moyenne : <strong>${moy.toFixed(2)}</strong> · Min : ${min} · Max : ${max}`;
  },

  saveNotes(){
    const evalId = this.state.saisieEvalId;
    const ev = Storage.getById('evaluationsLMD', evalId);
    if(!ev) return;

    const rows = document.querySelectorAll('#saisieLMDBody tbody tr');
    let created = 0, updated = 0, deleted = 0;

    rows.forEach(row=>{
      const etuId = row.dataset.etudiant;
      const input = row.querySelector('.note-input-LMD');
      const sel = row.querySelector('.statut-select-LMD');
      const statut = sel.value;
      const valRaw = input.value.trim();

      const existing = Storage.getAll('notesLMD').find(n=>n.evaluationId===evalId && n.etudiantId===etuId);

      if(statut !== 'noté'){
        if(existing){
          Storage.update('notesLMD', existing.id, {statut, valeur: null});
          updated++;
        } else {
          Storage.create('notesLMD', {evaluationId: evalId, etudiantId: etuId, statut, valeur:null, anneeId: ev.anneeId});
          created++;
        }
        return;
      }

      if(valRaw === ''){
        if(existing){ Storage.remove('notesLMD', existing.id, false); deleted++; }
        return;
      }

      const val = parseFloat(valRaw);
      if(isNaN(val) || val < 0 || val > 20){
        Notify.toast('Note invalide (0–20).', 'danger');
        return;
      }

      if(existing){
        Storage.update('notesLMD', existing.id, {statut:'noté', valeur: val});
        updated++;
      } else {
        Storage.create('notesLMD', {evaluationId: evalId, etudiantId: etuId, statut:'noté', valeur: val, anneeId: ev.anneeId});
        created++;
      }
    });

    Notify.toast(`Notes enregistrées (${created} ajoutées, ${updated} modifiées).`, 'success');
    bootstrap.Modal.getInstance(document.getElementById('modalSaisieLMD')).hide();
    this.refresh();
  },

  // ============================================================
  // CALCULS LMD
  // ============================================================

  /**
   * Calcule les moyennes par ECUE, par UE, et par étudiant d'un groupe.
   * Retourne { etudiants: [{etudiant, ues: [{ue, moyenne, credits, ecues: [...]}], moySemestre, creditsAcquis, resultat}] }
   */
  calcMoyennes(groupeId, session='S1'){
    const grp = Storage.getById('groupes', groupeId);
    if(!grp) return null;
    const niveauId = grp.niveauId;
    const ues = Storage.getAll('ue').filter(u=>u.niveauId === niveauId);
    if(!ues.length) return { groupe: grp, ues: [], etudiants: [] };

    const etudiants = Storage.getAll('eleves').filter(e=>e.classeId === groupeId && e.typeEtudiant === 'superieur');
    const evals = Storage.getAll('evaluationsLMD').filter(e=>e.groupeId === groupeId && e.session === session);
    const notes = Storage.getAll('notesLMD');

    const resultats = etudiants.map(etu=>{
      let totalPointsSemestre = 0, totalCredits = 0;
      const ueResults = [];

      ues.forEach(ue=>{
        const ecues = Storage.getAll('ecue').filter(e=>e.ueId === ue.id);
        let totalPtsUE = 0, totalCoefUE = 0;
        const ecueResults = [];

        ecues.forEach(ec=>{
          // Évaluations de cet ECUE pour ce groupe/session
          const ecEvals = evals.filter(e=>e.ecueId === ec.id);
          let sumNotes = 0, sumPoids = 0;

          ecEvals.forEach(ev=>{
            const note = notes.find(n=>n.evaluationId === ev.id && n.etudiantId === etu.id);
            if(note && note.statut === 'noté' && note.valeur != null){
              const poids = this.POIDS[ev.type] || 1;
              sumNotes += note.valeur * poids;
              sumPoids += poids;
            }
          });

          let moyEcue = null;
          if(sumPoids > 0){
            moyEcue = sumNotes / sumPoids;
            totalPtsUE += moyEcue * (ec.coefficient || 1);
            totalCoefUE += ec.coefficient || 1;
          }
          ecueResults.push({ecue: ec, moyenne: moyEcue});
        });

        const moyUE = totalCoefUE > 0 ? totalPtsUE / totalCoefUE : null;

        // Validation UE
        const creditsAcquis = moyUE != null && moyUE >= 10 ? ue.creditsECTS : 0;
        const statut = moyUE == null ? 'non-évalué'
          : moyUE >= 10 ? 'validée'
          : moyUE >= 8 ? 'rattrapage'
          : 'ajournée';

        if(moyUE != null){
          totalPointsSemestre += moyUE * ue.creditsECTS;
          totalCredits += ue.creditsECTS;
        }

        ueResults.push({
          ue, ecues: ecueResults, moyenne: moyUE,
          credits: ue.creditsECTS, creditsAcquis, statut
        });
      });

      const moySemestre = totalCredits > 0 ? totalPointsSemestre / totalCredits : null;
      const creditsAcquis = ueResults.reduce((s,u)=>s+u.creditsAcquis, 0);

      // Compensation : si moySemestre ≥ 10, toutes les UE sont validées
      let compensation = false;
      if(moySemestre != null && moySemestre >= 10 && creditsAcquis < totalCredits){
        compensation = true;
        ueResults.forEach(u=>{
          if(u.statut === 'rattrapage') u.creditsAcquis = u.credits;
        });
      }

      // Résultat final
      let resultat;
      if(moySemestre == null) resultat = 'Non évalué';
      else if(moySemestre >= 10) resultat = 'Validé';
      else if(compensation) resultat = 'Compensé';
      else if(ueResults.some(u=>u.statut === 'rattrapage')) resultat = 'Ajourné (rattrapage)';
      else resultat = 'Redouble';

      return {
        etudiant: etu,
        ues: ueResults,
        moySemestre,
        creditsAcquis,
        totalCredits,
        resultat
      };
    });

    // Rangs
    const evalues = resultats.filter(r=>r.moySemestre != null).sort((a,b)=>b.moySemestre - a.moySemestre);
    evalues.forEach((r, i)=>{
      r.rang = i+1;
      if(i>0 && Math.abs(evalues[i-1].moySemestre - r.moySemestre) < 0.01){
        r.rang = evalues[i-1].rang;
      }
    });

    return { groupe: grp, ues, etudiants: resultats };
  },

  openCalc(){
    new bootstrap.Modal(document.getElementById('modalCalcLMD')).show();
  },

  doCalcMoyennes(){
    const grpId = document.getElementById('calcGroupeLMD').value;
    const session = document.getElementById('calcSessionLMD').value;
    const res = this.calcMoyennes(grpId, session);
    if(!res || !res.etudiants.length){
      document.getElementById('calcResultLMD').innerHTML = '<p class="text-muted">Aucune donnée.</p>';
      return;
    }

    const html = `
      <p class="small text-muted">
        ${res.groupe.nom} — ${res.ues.length} UE — ${res.etudiants.length} étudiant(s)
      </p>
      <div class="table-responsive">
        <table class="table table-sm table-bordered align-middle">
          <thead class="table-light">
            <tr>
              <th>Étudiant</th>
              <th class="text-center">Rang</th>
              <th class="text-center">Moy. Semestre</th>
              <th class="text-center">Crédits</th>
              <th class="text-center">Résultat</th>
            </tr>
          </thead>
          <tbody>
            ${res.etudiants.sort((a,b)=>(a.rang||9999)-(b.rang||9999)).map(r=>`
              <tr>
                <td>${Utils.escapeHtml(r.etudiant.prenom+' '+r.etudiant.nom)}</td>
                <td class="text-center fw-bold">${r.rang||'—'}</td>
                <td class="text-center fw-bold">${r.moySemestre!=null?r.moySemestre.toFixed(2):'—'}</td>
                <td class="text-center">${r.creditsAcquis}/${r.totalCredits}</td>
                <td class="text-center"><span class="badge bg-${r.resultat==='Validé'?'success':r.resultat==='Compensé'?'primary':r.resultat.includes('Ajourné')?'warning':'danger'}-subtle text-${r.resultat==='Validé'?'success':r.resultat==='Compensé'?'primary':r.resultat.includes('Ajourné')?'warning':'danger'}">${r.resultat}</span></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
    document.getElementById('calcResultLMD').innerHTML = html;
  }
};