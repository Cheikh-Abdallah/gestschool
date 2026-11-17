/**
 * Module 3 : Gestion des enseignants.
 * CRUD, filtres, recherche, fiche imprimable,
 * affectation matières/classes, emploi du temps, heures.
 */
const Enseignants = {
  state: {
    page: 1,
    pageSize: 10,
    search: '',
    filtreSpecialite: '',
    filtreStatut: '',
    sortKey: 'nom',
    sortDir: 'asc'
  },

  render(container){
    this.container = container;
    container.innerHTML = `
      <div class="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
        <div>
          <div class="page-title">Gestion des enseignants</div>
          <div class="page-sub">Profils, affectations, emploi du temps et heures</div>
        </div>
        <div class="d-flex gap-2">
          <button class="btn btn-outline-success btn-sm" id="btnImportEleves">
  <i class="bi bi-file-earmark-excel me-1"></i> Importer Excel
</button>
          <button class="btn btn-outline-secondary btn-sm" id="btnExportCsvEns">
            <i class="bi bi-filetype-csv me-1"></i> Exporter CSV
          </button>
          <button class="btn btn-primary btn-sm" id="btnAddEns">
            <i class="bi bi-plus-lg me-1"></i> Nouvel enseignant
          </button>
        </div>
      </div>

      <div class="card-panel">
        <div class="row g-2 mb-3">
          <div class="col-12 col-md-4">
            <div class="search-inline">
              <i class="bi bi-search"></i>
              <input type="text" id="fSearchEns" placeholder="Rechercher (nom, matricule, spécialité…)">
            </div>
          </div>
          <div class="col-6 col-md-3">
            <select class="form-select form-select-sm" id="fSpecialiteEns">
              <option value="">Toutes spécialités</option>
            </select>
          </div>
          <div class="col-6 col-md-3">
            <select class="form-select form-select-sm" id="fStatutEns">
              <option value="">Tous statuts</option>
              <option value="Titulaire">Titulaire</option>
              <option value="Vacataire">Vacataire</option>
              <option value="Contractuel">Contractuel</option>
            </select>
          </div>
          <div class="col-12 col-md-2">
            <button class="btn btn-outline-secondary btn-sm w-100" id="btnResetEns">
              <i class="bi bi-arrow-counterclockwise me-1"></i> Réinitialiser
            </button>
          </div>
        </div>

        <div class="table-responsive">
          <table class="table table-hover align-middle mb-0" id="tblEns">
            <thead>
              <tr>
                <th data-sort="matricule" style="cursor:pointer">Matricule</th>
                <th data-sort="nom" style="cursor:pointer">Nom & Prénom</th>
                <th data-sort="sexe" style="cursor:pointer">Sexe</th>
                <th data-sort="specialite" style="cursor:pointer">Spécialité</th>
                <th data-sort="statut" style="cursor:pointer">Statut</th>
                <th data-sort="matieres" style="cursor:pointer">Matières</th>
                <th class="text-end">Actions</th>
              </tr>
            </thead>
            <tbody id="tbodyEns"></tbody>
          </table>
        </div>

        <div class="d-flex flex-wrap justify-content-between align-items-center mt-3 gap-2">
          <small class="text-muted" id="paginationInfoEns"></small>
          <nav><ul class="pagination pagination-sm mb-0" id="paginationEns"></ul></nav>
        </div>
      </div>

      <!-- Modale formulaire -->
      <div class="modal fade" id="modalEns" tabindex="-1">
        <div class="modal-dialog modal-lg modal-dialog-centered">
          <div class="modal-content modal-ens">
            <form id="formEns" novalidate>
              <div class="modal-header">
                <h6 class="modal-title" id="modalEnsTitle">Nouvel enseignant</h6>
                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
              </div>
              <div class="modal-body">
                <input type="hidden" id="ensId">
                <div class="row g-3">
                  <div class="col-md-4">
                    <label class="form-label">Matricule *</label>
                    <input class="form-control" id="ensMatricule" required>
                    <div class="invalid-feedback">Matricule obligatoire.</div>
                  </div>
                  <div class="col-md-4">
                    <label class="form-label">Prénom *</label>
                    <input class="form-control" id="ensPrenom" required>
                    <div class="invalid-feedback">Prénom obligatoire.</div>
                  </div>
                  <div class="col-md-4">
                    <label class="form-label">Nom *</label>
                    <input class="form-control" id="ensNom" required>
                    <div class="invalid-feedback">Nom obligatoire.</div>
                  </div>

                  <div class="col-md-4">
                    <label class="form-label">Sexe *</label>
                    <select class="form-select" id="ensSexe" required>
                      <option value="">— Choisir —</option>
                      <option value="M">Masculin</option>
                      <option value="F">Féminin</option>
                    </select>
                    <div class="invalid-feedback">Sélectionnez le sexe.</div>
                  </div>
                  <div class="col-md-4">
                    <label class="form-label">Date de naissance</label>
                    <input type="date" class="form-control" id="ensDateNaissance">
                  </div>
                  <div class="col-md-4">
                    <label class="form-label">Téléphone</label>
                    <input class="form-control" id="ensTelephone" placeholder="+221 …">
                  </div>

                  <div class="col-md-4">
                    <label class="form-label">Email</label>
                    <input type="email" class="form-control" id="ensEmail">
                  </div>
                  <div class="col-md-4">
                    <label class="form-label">Diplôme</label>
                    <input class="form-control" id="ensDiplome" placeholder="Licence, Master…">
                  </div>
                  <div class="col-md-4">
                    <label class="form-label">Spécialité *</label>
                    <input class="form-control" id="ensSpecialite" required placeholder="Mathématiques…">
                    <div class="invalid-feedback">Spécialité obligatoire.</div>
                  </div>

                  <div class="col-md-4">
                    <label class="form-label">Statut professionnel *</label>
                    <select class="form-select" id="ensStatut" required>
                      <option value="">— Choisir —</option>
                      <option value="Titulaire">Titulaire</option>
                      <option value="Vacataire">Vacataire</option>
                      <option value="Contractuel">Contractuel</option>
                    </select>
                    <div class="invalid-feedback">Sélectionnez le statut.</div>
                  </div>
                  <div class="col-md-4">
                    <label class="form-label">Date de recrutement</label>
                    <input type="date" class="form-control" id="ensDateRecrutement">
                  </div>
                  <div class="col-md-4">
                    <label class="form-label">Adresse</label>
                    <input class="form-control" id="ensAdresse">
                  </div>

                  <div class="col-12"><hr class="my-1"><small class="text-muted fw-semibold">Affectations</small></div>
                  <div class="col-md-6">
                    <label class="form-label">Matières enseignées</label>
                    <select class="form-select" id="ensMatieres" multiple size="5"></select>
                    <small class="text-muted">Ctrl / Cmd pour sélection multiple.</small>
                  </div>
                  <div class="col-md-6">
                    <label class="form-label">Classes affectées</label>
                    <select class="form-select" id="ensClasses" multiple size="5"></select>
                    <small class="text-muted">Ctrl / Cmd pour sélection multiple.</small>
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

      <!-- Modale fiche -->
      <div class="modal fade" id="modalFicheEns" tabindex="-1">
        <div class="modal-dialog modal-lg modal-dialog-scrollable">
          <div class="modal-content">
            <div class="modal-header no-print">
              <h6 class="modal-title"><i class="bi bi-person-badge me-1"></i> Fiche enseignant</h6>
              <div class="d-flex gap-2">
                <button class="btn btn-sm btn-outline-secondary" id="btnPrintFicheEns">
                  <i class="bi bi-printer"></i> Imprimer
                </button>
                <button class="btn-close" data-bs-dismiss="modal"></button>
              </div>
            </div>
            <div class="modal-body" id="ficheEnsBody"></div>
          </div>
        </div>
      </div>

      <!-- Modale emploi du temps -->
      <div class="modal fade" id="modalEDTEns" tabindex="-1">
        <div class="modal-dialog modal-xl modal-dialog-scrollable">
          <div class="modal-content">
            <div class="modal-header">
              <h6 class="modal-title"><i class="bi bi-calendar3 me-1"></i> Emploi du temps</h6>
              <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body" id="edtEnsBody"></div>
          </div>
        </div>
      </div>
    `;

    this.bindEvents();
    this.populateFilters();
    this.refresh();
  },

  bindEvents(){
    document.getElementById('btnAddEns').onclick = ()=> this.openForm();
    document.getElementById('btnResetEns').onclick = ()=>{
      this.state = {...this.state, page:1, search:'', filtreSpecialite:'', filtreStatut:''};
      document.getElementById('fSearchEns').value='';
      document.getElementById('fSpecialiteEns').value='';
      document.getElementById('fStatutEns').value='';
      this.refresh();
    };
    document.getElementById('fSearchEns').addEventListener('input', e=>{
      this.state.search = e.target.value.trim().toLowerCase();
      this.state.page = 1;
      this.refresh();
    });
    document.getElementById('fSpecialiteEns').onchange = e=>{ this.state.filtreSpecialite=e.target.value; this.state.page=1; this.refresh(); };
    document.getElementById('fStatutEns').onchange     = e=>{ this.state.filtreStatut=e.target.value;     this.state.page=1; this.refresh(); };
    document.getElementById('btnExportCsvEns').onclick = ()=> this.exportCsv();

    document.querySelectorAll('#tblEns th[data-sort]').forEach(th=>{
      th.onclick = ()=>{
        const k = th.dataset.sort;
        if(this.state.sortKey === k) this.state.sortDir = this.state.sortDir==='asc'?'desc':'asc';
        else { this.state.sortKey = k; this.state.sortDir = 'asc'; }
        this.refresh();
      };
    });
    document.getElementById('btnImportEnseignants').onclick = () => ImportExcel.open('enseignants');
    document.getElementById('formEns').onsubmit = (e)=>{ e.preventDefault(); this.save(); };
    document.getElementById('btnPrintFicheEns').onclick = ()=> window.print();
  },

  populateFilters(){
    // Spécialités uniques
    const specialites = [...new Set(Storage.getAll('enseignants').map(e=>e.specialite).filter(Boolean))].sort();
    const selSpec = document.getElementById('fSpecialiteEns');
    selSpec.innerHTML = '<option value="">Toutes spécialités</option>' +
      specialites.map(s=>`<option value="${Utils.escapeHtml(s)}">${Utils.escapeHtml(s)}</option>`).join('');

    // Matières (select multiple)
    const matieres = Storage.getAll('matieres');
    const selMat = document.getElementById('ensMatieres');
    selMat.innerHTML = matieres.map(m=>`<option value="${m.id}">${Utils.escapeHtml(m.nom)}</option>`).join('');

    // Classes (select multiple)
    const classes = Storage.getAll('classes');
    const selCls = document.getElementById('ensClasses');
    selCls.innerHTML = classes.map(c=>`<option value="${c.id}">${Utils.escapeHtml(c.nom)}</option>`).join('');
  },

  getFiltered(){
    let list = Storage.getAll('enseignants');
    const s = this.state;

    if(s.filtreSpecialite) list = list.filter(e=>e.specialite === s.filtreSpecialite);
    if(s.filtreStatut)     list = list.filter(e=>e.statut === s.filtreStatut);

    if(s.search){
      list = list.filter(e=>
        (e.nom||'').toLowerCase().includes(s.search) ||
        (e.prenom||'').toLowerCase().includes(s.search) ||
        (e.matricule||'').toLowerCase().includes(s.search) ||
        (e.specialite||'').toLowerCase().includes(s.search) ||
        (e.email||'').toLowerCase().includes(s.search)
      );
    }

    const dir = s.sortDir==='asc'?1:-1;
    list.sort((a,b)=>{
      let va, vb;
      if(s.sortKey==='matieres'){
        va = (a.matieres||[]).length;
        vb = (b.matieres||[]).length;
        return (va-vb)*dir;
      }
      va = a[s.sortKey] || '';
      vb = b[s.sortKey] || '';
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

    const tbody = document.getElementById('tbodyEns');
    if(!pageList.length){
      tbody.innerHTML = `<tr><td colspan="7" class="text-center text-muted py-4">Aucun enseignant trouvé.</td></tr>`;
    } else {
      tbody.innerHTML = pageList.map(e=>{
        const matieres = (e.matieres||[]).map(id=>Storage.getById('matieres', id)?.nom).filter(Boolean);
        return `<tr>
          <td><span class="badge-matricule">${Utils.escapeHtml(e.matricule)}</span></td>
          <td><strong>${Utils.escapeHtml(e.prenom+' '+e.nom)}</strong></td>
          <td>${e.sexe==='M'?'<span class="badge bg-primary-subtle text-primary">M</span>':'<span class="badge bg-warning-subtle text-warning">F</span>'}</td>
          <td>${Utils.escapeHtml(e.specialite||'—')}</td>
          <td><span class="badge bg-secondary-subtle text-secondary">${Utils.escapeHtml(e.statut||'—')}</span></td>
          <td>${matieres.length?matieres.map(m=>`<span class="badge-matricule me-1">${Utils.escapeHtml(m)}</span>`).join(''):'—'}</td>
          <td class="text-end">
            <button class="btn btn-sm btn-light" title="Voir fiche" data-act="fiche" data-id="${e.id}"><i class="bi bi-eye"></i></button>
            <button class="btn btn-sm btn-light" title="Modifier" data-act="edit" data-id="${e.id}"><i class="bi bi-pencil"></i></button>
            <button class="btn btn-sm btn-light" title="Emploi du temps" data-act="edt" data-id="${e.id}"><i class="bi bi-calendar3"></i></button>
            <button class="btn btn-sm btn-light text-danger" title="Archiver" data-act="del" data-id="${e.id}"><i class="bi bi-trash"></i></button>
          </td>
        </tr>`;
      }).join('');
    }

    tbody.querySelectorAll('[data-act]').forEach(btn=>{
      btn.onclick = ()=>{
        const id = btn.dataset.id;
        const act = btn.dataset.act;
        if(act==='fiche') this.showFiche(id);
        else if(act==='edit') this.openForm(id);
        else if(act==='del') this.archive(id);
        else if(act==='edt') this.showEDT(id);
      };
    });

    document.getElementById('paginationInfoEns').textContent =
      total === 0 ? '0 résultat' : `${start+1}–${Math.min(start+this.state.pageSize, total)} sur ${total} enseignant(s)`;

    const pag = document.getElementById('paginationEns');
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
    const modal = new bootstrap.Modal(document.getElementById('modalEns'));
    const form = document.getElementById('formEns');
    form.classList.remove('was-validated');

    // Reset selects multiples
    document.getElementById('ensMatieres').querySelectorAll('option').forEach(o=>o.selected=false);
    document.getElementById('ensClasses').querySelectorAll('option').forEach(o=>o.selected=false);

    if(id){
      const e = Storage.getById('enseignants', id);
      if(!e) return;
      document.getElementById('modalEnsTitle').textContent = 'Modifier enseignant · ' + e.matricule;
      document.getElementById('ensId').value = e.id;
      document.getElementById('ensMatricule').value = e.matricule || '';
      document.getElementById('ensPrenom').value = e.prenom || '';
      document.getElementById('ensNom').value = e.nom || '';
      document.getElementById('ensSexe').value = e.sexe || '';
      document.getElementById('ensDateNaissance').value = e.dateNaissance || '';
      document.getElementById('ensTelephone').value = e.telephone || '';
      document.getElementById('ensEmail').value = e.email || '';
      document.getElementById('ensDiplome').value = e.diplome || '';
      document.getElementById('ensSpecialite').value = e.specialite || '';
      document.getElementById('ensStatut').value = e.statut || '';
      document.getElementById('ensDateRecrutement').value = e.dateRecrutement || '';
      document.getElementById('ensAdresse').value = e.adresse || '';
      (e.matieres||[]).forEach(mid=>{
        const opt = document.querySelector(`#ensMatieres option[value="${mid}"]`);
        if(opt) opt.selected = true;
      });
      (e.classes||[]).forEach(cid=>{
        const opt = document.querySelector(`#ensClasses option[value="${cid}"]`);
        if(opt) opt.selected = true;
      });
    } else {
      form.reset();
      document.getElementById('modalEnsTitle').textContent = 'Nouvel enseignant';
      document.getElementById('ensId').value = '';
      const all = Storage.getAllIncludingArchived('enseignants');
      const maxNum = all.reduce((m,e)=>{
        const n = parseInt((e.matricule||'').replace(/\D/g,'')) || 0;
        return Math.max(m,n);
      }, 0);
      document.getElementById('ensMatricule').value = 'ENS-' + (Math.max(1000, maxNum+1));
      document.getElementById('ensDateRecrutement').value = new Date().toISOString().slice(0,10);
    }
    modal.show();
  },

  save(){
    const form = document.getElementById('formEns');
    form.classList.add('was-validated');
    if(!form.checkValidity()) return;

    const id = document.getElementById('ensId').value;
    const matieres = [...document.getElementById('ensMatieres').selectedOptions].map(o=>o.value);
    const classes = [...document.getElementById('ensClasses').selectedOptions].map(o=>o.value);

    const data = {
      matricule: document.getElementById('ensMatricule').value.trim(),
      prenom:    document.getElementById('ensPrenom').value.trim(),
      nom:       document.getElementById('ensNom').value.trim(),
      sexe:      document.getElementById('ensSexe').value,
      dateNaissance: document.getElementById('ensDateNaissance').value,
      telephone:     document.getElementById('ensTelephone').value.trim(),
      email:         document.getElementById('ensEmail').value.trim(),
      diplome:       document.getElementById('ensDiplome').value.trim(),
      specialite:    document.getElementById('ensSpecialite').value.trim(),
      statut:        document.getElementById('ensStatut').value,
      dateRecrutement: document.getElementById('ensDateRecrutement').value,
      adresse:       document.getElementById('ensAdresse').value.trim(),
      matieres, classes
    };

    const all = Storage.getAllIncludingArchived('enseignants');
    const dup = all.find(e=> e.matricule.toLowerCase() === data.matricule.toLowerCase() && e.id !== id);
    if(dup){
      Notify.toast('Ce matricule existe déjà : ' + data.matricule, 'danger');
      return;
    }

    if(id){
      Storage.update('enseignants', id, data);
      Notify.toast('Enseignant modifié avec succès.', 'success');
    } else {
      Storage.create('enseignants', data);
      Notify.toast('Enseignant enregistré avec succès.', 'success');
    }
    bootstrap.Modal.getInstance(document.getElementById('modalEns')).hide();
    this.refresh();
  },

  archive(id){
    const e = Storage.getById('enseignants', id);
    if(!e) return;
    if(!confirm(`Archiver définitivement l'enseignant ${e.prenom} ${e.nom} ?\n(L'enseignant ne sera plus visible, mais les données restent en base.)`)) return;
    Storage.remove('enseignants', id, true);
    Notify.toast('Enseignant archivé.', 'warning');
    this.refresh();
  },

  showFiche(id){
    const e = Storage.getById('enseignants', id);
    if(!e) return;
    const param = Storage.read().parametres;
    const matieres = (e.matieres||[]).map(mid=>Storage.getById('matieres', mid)).filter(Boolean);
    const classes = (e.classes||[]).map(cid=>Storage.getById('classes', cid)).filter(Boolean);
    const edt = Storage.getAll('emploiTemps').filter(x=>x.enseignantId===e.id);
    const heures = edt.reduce((sum, x)=>{
      const [h1,m1] = (x.heureDebut||'0:0').split(':').map(Number);
      const [h2,m2] = (x.heureFin||'0:0').split(':').map(Number);
      return sum + ((h2*60+m2)-(h1*60+m1))/60;
    }, 0);

    document.getElementById('ficheEnsBody').innerHTML = `
      <div class="fiche-eleve">
        <div class="fiche-head">
          <div>
            <h5 class="mb-0">${Utils.escapeHtml(param.etablissement)}</h5>
            <small class="text-muted">${Utils.escapeHtml(param.adresse)}</small><br>
            <small class="text-muted">Tél. ${Utils.escapeHtml(param.telephone)} — Année en cours</small>
          </div>
          <div class="fiche-photo"><i class="bi bi-person-badge"></i></div>
        </div>
        <h6 class="text-center my-3 fw-bold" style="letter-spacing:1px">FICHE INDIVIDUELLE DE L'ENSEIGNANT</h6>
        <table class="table table-bordered table-sm fiche-table">
          <tbody>
            <tr><th style="width:35%">Matricule</th><td>${Utils.escapeHtml(e.matricule)}</td></tr>
            <tr><th>Nom & Prénom</th><td><strong>${Utils.escapeHtml(e.prenom+' '+e.nom)}</strong></td></tr>
            <tr><th>Sexe</th><td>${e.sexe==='M'?'Masculin':'Féminin'}</td></tr>
            <tr><th>Date de naissance</th><td>${Utils.formatDate(e.dateNaissance)}</td></tr>
            <tr><th>Téléphone</th><td>${Utils.escapeHtml(e.telephone||'—')}</td></tr>
            <tr><th>Email</th><td>${Utils.escapeHtml(e.email||'—')}</td></tr>
            <tr><th>Adresse</th><td>${Utils.escapeHtml(e.adresse||'—')}</td></tr>
            <tr><th>Diplôme</th><td>${Utils.escapeHtml(e.diplome||'—')}</td></tr>
            <tr><th>Spécialité</th><td>${Utils.escapeHtml(e.specialite||'—')}</td></tr>
            <tr><th>Statut</th><td>${Utils.escapeHtml(e.statut||'—')}</td></tr>
            <tr><th>Date de recrutement</th><td>${Utils.formatDate(e.dateRecrutement)}</td></tr>
            <tr><th>Matières enseignées</th><td>${matieres.length?matieres.map(m=>Utils.escapeHtml(m.nom)).join(', '):'—'}</td></tr>
            <tr><th>Classes affectées</th><td>${classes.length?classes.map(c=>Utils.escapeHtml(c.nom)).join(', '):'—'}</td></tr>
            <tr><th>Volume horaire hebdo</th><td>${heures} h</td></tr>
          </tbody>
        </table>
        <div class="fiche-signatures">
          <div>Le Directeur<br><br><br>${Utils.escapeHtml(param.directeur||'')}</div>
          <div>Signature & Cachet<br><br><br>______________________</div>
        </div>
      </div>
    `;
    new bootstrap.Modal(document.getElementById('modalFicheEns')).show();
  },

  showEDT(id){
    const e = Storage.getById('enseignants', id);
    if(!e) return;
    const edt = Storage.getAll('emploiTemps').filter(x=>x.enseignantId===e.id);
    const jours = ['Lundi','Mardi','Mercredi','Jeudi','Vendredi'];
    const creneaux = [...new Set(edt.map(x=>x.heureDebut+'-'+x.heureFin))].sort();

    let html = `<div class="mb-2"><strong>${Utils.escapeHtml(e.prenom+' '+e.nom)}</strong> — ${edt.length} créneau(x)</div>`;
    if(!edt.length){
      html += `<div class="empty-module"><i class="bi bi-calendar-x"></i><p>Aucun créneau d'emploi du temps enregistré pour cet enseignant.</p></div>`;
    } else {
      html += `<div class="table-responsive"><table class="table table-bordered table-sm edt-table"><thead><tr><th>Horaire</th>${jours.map(j=>`<th>${j}</th>`).join('')}</tr></thead><tbody>`;
      creneaux.forEach(cr=>{
        html += `<tr><td class="fw-semibold small">${cr}</td>`;
        jours.forEach(j=>{
          const cell = edt.find(x=>x.heureDebut+'-'+x.heureFin===cr && x.jour===j);
          if(cell){
            const mat = Storage.getById('matieres', cell.matiereId);
            const cls = Storage.getById('classes', cell.classeId);
            html += `<td class="edt-cell"><div class="edt-mat">${Utils.escapeHtml(mat?.nom||'')}</div><small>${Utils.escapeHtml(cls?.nom||'')}</small></td>`;
          } else {
            html += `<td></td>`;
          }
        });
        html += `</tr>`;
      });
      html += `</tbody></table></div>`;
    }
    document.getElementById('edtEnsBody').innerHTML = html;
    new bootstrap.Modal(document.getElementById('modalEDTEns')).show();
  },

  exportCsv(){
    const list = this.getFiltered();
    const rows = [['Matricule','Prénom','Nom','Sexe','Spécialité','Statut','Téléphone','Email','Matières','Classes']];
    list.forEach(e=>{
      const mats = (e.matieres||[]).map(id=>Storage.getById('matieres',id)?.nom).filter(Boolean).join(', ');
      const cls = (e.classes||[]).map(id=>Storage.getById('classes',id)?.nom).filter(Boolean).join(', ');
      rows.push([e.matricule, e.prenom, e.nom, e.sexe, e.specialite||'', e.statut||'', e.telephone||'', e.email||'', mats, cls]);
    });
    const csv = rows.map(r=>r.map(v=>`"${String(v??'').replace(/"/g,'""')}"`).join(';')).join('\n');
    const blob = new Blob(['\ufeff'+csv], {type:'text/csv;charset=utf-8;'});
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'enseignants_'+new Date().toISOString().slice(0,10)+'.csv';
    a.click();
    Notify.toast('Export CSV généré.', 'success');
  }
};
