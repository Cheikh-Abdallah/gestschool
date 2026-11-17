/**
 * Module 2 : Gestion des élèves.
 * CRUD complet, recherche, filtres, tri, pagination,
 * fiche individuelle imprimable, réinscription.
 */
const Eleves = {
  state: {
    page: 1,
    pageSize: 10,
    search: '',
    filtreClasse: '',
    filtreSexe: '',
    filtreAnnee: '',
    sortKey: 'nom',
    sortDir: 'asc'
  },

  render(container){
    this.container = container;
    container.innerHTML = `
      <div class="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
        <div>
          <div class="page-title">Gestion des élèves</div>
          <div class="page-sub">Inscriptions, fiches individuelles et réinscriptions</div>
        </div>
        <div class="d-flex gap-2">
          <button class="btn btn-outline-success btn-sm" id="btnImportEleves">
            <i class="bi bi-file-earmark-excel me-1"></i> Importer Excel
          </button>
          <button class="btn btn-outline-secondary btn-sm" id="btnExportCsv">
            <i class="bi bi-filetype-csv me-1"></i> Exporter CSV
          </button>
          <button class="btn btn-primary btn-sm" id="btnAddEleve">
            <i class="bi bi-plus-lg me-1"></i> Nouvel élève
          </button>
        </div>
      </div>

      <div class="card-panel">
        <div class="row g-2 mb-3">
          <div class="col-12 col-md-4">
            <div class="search-inline">
              <i class="bi bi-search"></i>
              <input type="text" id="fSearch" placeholder="Rechercher (nom, matricule…)">
            </div>
          </div>
          <div class="col-6 col-md-2">
            <select class="form-select form-select-sm" id="fClasse"><option value="">Toutes classes</option></select>
          </div>
          <div class="col-6 col-md-2">
            <select class="form-select form-select-sm" id="fSexe">
              <option value="">Tous sexes</option>
              <option value="M">Garçons</option>
              <option value="F">Filles</option>
            </select>
          </div>
          <div class="col-6 col-md-2">
            <select class="form-select form-select-sm" id="fAnnee"><option value="">Toutes années</option></select>
          </div>
          <div class="col-6 col-md-2">
            <button class="btn btn-outline-secondary btn-sm w-100" id="btnReset">
              <i class="bi bi-arrow-counterclockwise me-1"></i> Réinitialiser
            </button>
          </div>
        </div>

        <div class="table-responsive">
          <table class="table table-hover align-middle mb-0" id="tblEleves">
            <thead>
              <tr>
                <th data-sort="matricule" style="cursor:pointer">Matricule</th>
                <th data-sort="nom" style="cursor:pointer">Nom & Prénom</th>
                <th data-sort="sexe" style="cursor:pointer">Sexe</th>
                <th data-sort="classe" style="cursor:pointer">Classe</th>
                <th data-sort="dateNaissance" style="cursor:pointer">Naissance</th>
                <th data-sort="dateInscription" style="cursor:pointer">Inscription</th>
                <th class="text-end">Actions</th>
              </tr>
            </thead>
            <tbody id="tbodyEleves"></tbody>
          </table>
        </div>

        <div class="d-flex flex-wrap justify-content-between align-items-center mt-3 gap-2">
          <small class="text-muted" id="paginationInfo"></small>
          <nav><ul class="pagination pagination-sm mb-0" id="pagination"></ul></nav>
        </div>
      </div>

      <!-- Modale formulaire — CORRIGÉE : plus de modal-dialog-scrollable, classe modal-eleve -->
      <div class="modal fade" id="modalEleve" tabindex="-1">
        <div class="modal-dialog modal-lg modal-dialog-centered">
          <div class="modal-content modal-eleve">
            <form id="formEleve" novalidate>
              <div class="modal-header">
                <h6 class="modal-title" id="modalEleveTitle">Nouvel élève</h6>
                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
              </div>
              <div class="modal-body">
                <input type="hidden" id="eId">
                <div class="row g-3">
                  <div class="col-md-4">
                    <label class="form-label">Matricule *</label>
                    <input class="form-control" id="eMatricule" required>
                    <div class="invalid-feedback">Matricule obligatoire et unique.</div>
                  </div>
                  <div class="col-md-4">
                    <label class="form-label">Prénom *</label>
                    <input class="form-control" id="ePrenom" required>
                    <div class="invalid-feedback">Prénom obligatoire.</div>
                  </div>
                  <div class="col-md-4">
                    <label class="form-label">Nom *</label>
                    <input class="form-control" id="eNom" required>
                    <div class="invalid-feedback">Nom obligatoire.</div>
                  </div>

                  <div class="col-md-4">
                    <label class="form-label">Sexe *</label>
                    <select class="form-select" id="eSexe" required>
                      <option value="">— Choisir —</option>
                      <option value="M">Masculin</option>
                      <option value="F">Féminin</option>
                    </select>
                    <div class="invalid-feedback">Sélectionnez le sexe.</div>
                  </div>
                  <div class="col-md-4">
                    <label class="form-label">Date de naissance</label>
                    <input type="date" class="form-control" id="eDateNaissance">
                  </div>
                  <div class="col-md-4">
                    <label class="form-label">Lieu de naissance</label>
                    <input class="form-control" id="eLieuNaissance">
                  </div>

                  <div class="col-md-4">
                    <label class="form-label">Nationalité</label>
                    <input class="form-control" id="eNationalite" value="Sénégalaise">
                  </div>
                  <div class="col-md-4">
                    <label class="form-label">Téléphone</label>
                    <input class="form-control" id="eTelephone" placeholder="+221 …">
                  </div>
                  <div class="col-md-4">
                    <label class="form-label">Date d'inscription</label>
                    <input type="date" class="form-control" id="eDateInscription">
                  </div>

                  <div class="col-md-4">
                    <label class="form-label">Classe *</label>
                    <select class="form-select" id="eClasse" required></select>
                    <div class="invalid-feedback">Sélectionnez une classe.</div>
                  </div>
                  <div class="col-md-4">
                    <label class="form-label">Année scolaire *</label>
                    <select class="form-select" id="eAnnee" required></select>
                    <div class="invalid-feedback">Sélectionnez l'année.</div>
                  </div>
                  <div class="col-md-4">
                    <label class="form-label">Photo (URL)</label>
                    <input class="form-control" id="ePhoto" placeholder="https://…">
                  </div>

                  <div class="col-12"><hr class="my-1"><small class="text-muted fw-semibold">Responsable</small></div>
                  <div class="col-md-4">
                    <label class="form-label">Nom du père</label>
                    <input class="form-control" id="eNomPere">
                  </div>
                  <div class="col-md-4">
                    <label class="form-label">Nom de la mère</label>
                    <input class="form-control" id="eNomMere">
                  </div>
                  <div class="col-md-4">
                    <label class="form-label">Nom du tuteur</label>
                    <input class="form-control" id="eNomTuteur">
                  </div>
                  <div class="col-md-6">
                    <label class="form-label">Téléphone responsable</label>
                    <input class="form-control" id="eTelResponsable">
                  </div>
                  <div class="col-md-6">
                    <label class="form-label">Adresse responsable</label>
                    <input class="form-control" id="eAdresseResponsable">
                  </div>

                  <div class="col-12"><hr class="my-1"><small class="text-muted fw-semibold">Informations médicales</small></div>
                  <div class="col-md-6">
                    <label class="form-label">Adresse</label>
                    <input class="form-control" id="eAdresse">
                  </div>
                  <div class="col-md-6">
                    <label class="form-label">Informations médicales utiles</label>
                    <input class="form-control" id="eInfosMed" placeholder="Allergies, traitement…">
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
      <div class="modal fade" id="modalFiche" tabindex="-1">
        <div class="modal-dialog modal-lg modal-dialog-scrollable">
          <div class="modal-content">
            <div class="modal-header no-print">
              <h6 class="modal-title"><i class="bi bi-person-vcard me-1"></i> Fiche élève</h6>
              <div class="d-flex gap-2">
                <button class="btn btn-sm btn-outline-secondary" id="btnPrintFiche">
                  <i class="bi bi-printer"></i> Imprimer
                </button>
                <button class="btn-close" data-bs-dismiss="modal"></button>
              </div>
            </div>
            <div class="modal-body" id="ficheBody"></div>
          </div>
        </div>
      </div>
    `;

    this.bindEvents();
    this.populateFilters();
    this.refresh();
  },

  bindEvents(){
    document.getElementById('btnAddEleve').onclick = ()=> this.openForm();
    document.getElementById('btnReset').onclick = ()=>{
      this.state = {...this.state, page:1, search:'', filtreClasse:'', filtreSexe:'', filtreAnnee:''};
      document.getElementById('fSearch').value='';
      document.getElementById('fClasse').value='';
      document.getElementById('fSexe').value='';
      document.getElementById('fAnnee').value='';
      this.refresh();
    };
    document.getElementById('fSearch').addEventListener('input', e=>{
      this.state.search = e.target.value.trim().toLowerCase();
      this.state.page = 1;
      this.refresh();
    });
    document.getElementById('fClasse').onchange = e=>{ this.state.filtreClasse=e.target.value; this.state.page=1; this.refresh(); };
    document.getElementById('fSexe').onchange   = e=>{ this.state.filtreSexe=e.target.value;   this.state.page=1; this.refresh(); };
    document.getElementById('fAnnee').onchange  = e=>{ this.state.filtreAnnee=e.target.value;  this.state.page=1; this.refresh(); };
    document.getElementById('btnExportCsv').onclick = ()=> this.exportCsv();

    document.querySelectorAll('#tblEleves th[data-sort]').forEach(th=>{
      th.onclick = ()=>{
        const k = th.dataset.sort;
        if(this.state.sortKey === k) this.state.sortDir = this.state.sortDir==='asc'?'desc':'asc';
        else { this.state.sortKey = k; this.state.sortDir = 'asc'; }
        this.refresh();
      };
    });
    document.getElementById('btnImportEleves').onclick = () => ImportExcel.open('eleves');
    document.getElementById('formEleve').onsubmit = (e)=>{ e.preventDefault(); this.save(); };
    document.getElementById('btnPrintFiche').onclick = ()=> window.print();
  },

  populateFilters(){
    const classes = Storage.getAll('classes');
    const annees = Storage.getAllIncludingArchived('annees');
    const selClasse = document.getElementById('fClasse');
    classes.forEach(c=>{
      selClasse.insertAdjacentHTML('beforeend', `<option value="${c.id}">${Utils.escapeHtml(c.nom)}</option>`);
    });
    const selAnnee = document.getElementById('fAnnee');
    annees.forEach(a=>{
      selAnnee.insertAdjacentHTML('beforeend', `<option value="${a.id}">${Utils.escapeHtml(a.libelle)}</option>`);
    });

    const eClasse = document.getElementById('eClasse');
    eClasse.innerHTML = '<option value="">— Choisir —</option>' + classes.map(c=>`<option value="${c.id}">${Utils.escapeHtml(c.nom)}</option>`).join('');
    const eAnnee = document.getElementById('eAnnee');
    eAnnee.innerHTML = annees.map(a=>`<option value="${a.id}" ${a.active?'selected':''}>${Utils.escapeHtml(a.libelle)}</option>`).join('');
  },

  getFiltered(){
    let list = Storage.getAll('eleves');
    const s = this.state;

    if(s.filtreClasse) list = list.filter(e=>e.classeId === s.filtreClasse);
    if(s.filtreSexe)   list = list.filter(e=>e.sexe === s.filtreSexe);
    if(s.filtreAnnee)  list = list.filter(e=>e.anneeId === s.filtreAnnee);

    if(s.search){
      list = list.filter(e=>
        (e.nom||'').toLowerCase().includes(s.search) ||
        (e.prenom||'').toLowerCase().includes(s.search) ||
        (e.matricule||'').toLowerCase().includes(s.search)
      );
    }

    const dir = s.sortDir==='asc'?1:-1;
    list.sort((a,b)=>{
      let va, vb;
      if(s.sortKey==='classe'){
        va = Storage.getById('classes', a.classeId)?.nom || '';
        vb = Storage.getById('classes', b.classeId)?.nom || '';
      } else {
        va = a[s.sortKey] || '';
        vb = b[s.sortKey] || '';
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

    const tbody = document.getElementById('tbodyEleves');
    if(!pageList.length){
      tbody.innerHTML = `<tr><td colspan="7" class="text-center text-muted py-4">Aucun élève trouvé.</td></tr>`;
    } else {
      tbody.innerHTML = pageList.map(e=>{
        const classe = Storage.getById('classes', e.classeId);
        return `<tr>
          <td><span class="badge-matricule">${Utils.escapeHtml(e.matricule)}</span></td>
          <td><strong>${Utils.escapeHtml(e.prenom+' '+e.nom)}</strong></td>
          <td>${e.sexe==='M'?'<span class="badge bg-primary-subtle text-primary">M</span>':'<span class="badge bg-warning-subtle text-warning">F</span>'}</td>
          <td>${classe ? Utils.escapeHtml(classe.nom) : '—'}</td>
          <td>${Utils.formatDate(e.dateNaissance)}</td>
          <td>${Utils.formatDate(e.dateInscription)}</td>
          <td class="text-end">
            <button class="btn btn-sm btn-light" title="Voir fiche" data-act="fiche" data-id="${e.id}"><i class="bi bi-eye"></i></button>
            <button class="btn btn-sm btn-light" title="Modifier" data-act="edit" data-id="${e.id}"><i class="bi bi-pencil"></i></button>
            <button class="btn btn-sm btn-light" title="Réinscrire" data-act="reinscrire" data-id="${e.id}"><i class="bi bi-arrow-repeat"></i></button>
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
        else if(act==='reinscrire') this.reinscrire(id);
      };
    });

    document.getElementById('paginationInfo').textContent =
      total === 0 ? '0 résultat' : `${start+1}–${Math.min(start+this.state.pageSize, total)} sur ${total} élève(s)`;

    const pag = document.getElementById('pagination');
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
    const modal = new bootstrap.Modal(document.getElementById('modalEleve'));
    const form = document.getElementById('formEleve');
    form.classList.remove('was-validated');

    if(id){
      const e = Storage.getById('eleves', id);
      if(!e) return;
      document.getElementById('modalEleveTitle').textContent = 'Modifier élève · ' + e.matricule;
      document.getElementById('eId').value = e.id;
      document.getElementById('eMatricule').value = e.matricule || '';
      document.getElementById('ePrenom').value = e.prenom || '';
      document.getElementById('eNom').value = e.nom || '';
      document.getElementById('eSexe').value = e.sexe || '';
      document.getElementById('eDateNaissance').value = e.dateNaissance || '';
      document.getElementById('eLieuNaissance').value = e.lieuNaissance || '';
      document.getElementById('eNationalite').value = e.nationalite || '';
      document.getElementById('eTelephone').value = e.telephone || '';
      document.getElementById('eDateInscription').value = e.dateInscription || '';
      document.getElementById('eClasse').value = e.classeId || '';
      document.getElementById('eAnnee').value = e.anneeId || '';
      document.getElementById('ePhoto').value = e.photo || '';
      document.getElementById('eNomPere').value = e.nomPere || '';
      document.getElementById('eNomMere').value = e.nomMere || '';
      document.getElementById('eNomTuteur').value = e.nomTuteur || '';
      document.getElementById('eTelResponsable').value = e.telephoneResponsable || '';
      document.getElementById('eAdresseResponsable').value = e.adresseResponsable || '';
      document.getElementById('eAdresse').value = e.adresse || '';
      document.getElementById('eInfosMed').value = e.infosMed || '';
    } else {
      form.reset();
      document.getElementById('modalEleveTitle').textContent = 'Nouvel élève';
      document.getElementById('eId').value = '';
      const all = Storage.getAllIncludingArchived('eleves');
      const maxNum = all.reduce((m,e)=>{
        const n = parseInt((e.matricule||'').replace(/\D/g,'')) || 0;
        return Math.max(m,n);
      }, 0);
      document.getElementById('eMatricule').value = 'ELV-' + (maxNum+1);
      document.getElementById('eDateInscription').value = new Date().toISOString().slice(0,10);
      const anneeActive = Storage.getAllIncludingArchived('annees').find(a=>a.active);
      if(anneeActive) document.getElementById('eAnnee').value = anneeActive.id;
    }
    modal.show();
  },

  save(){
    const form = document.getElementById('formEleve');
    form.classList.add('was-validated');
    if(!form.checkValidity()) return;

    const id = document.getElementById('eId').value;
    const data = {
      matricule: document.getElementById('eMatricule').value.trim(),
      prenom:    document.getElementById('ePrenom').value.trim(),
      nom:       document.getElementById('eNom').value.trim(),
      sexe:      document.getElementById('eSexe').value,
      dateNaissance: document.getElementById('eDateNaissance').value,
      lieuNaissance: document.getElementById('eLieuNaissance').value.trim(),
      nationalite:   document.getElementById('eNationalite').value.trim(),
      telephone:     document.getElementById('eTelephone').value.trim(),
      dateInscription: document.getElementById('eDateInscription').value,
      classeId:      document.getElementById('eClasse').value,
      anneeId:       document.getElementById('eAnnee').value,
      photo:         document.getElementById('ePhoto').value.trim(),
      nomPere:       document.getElementById('eNomPere').value.trim(),
      nomMere:       document.getElementById('eNomMere').value.trim(),
      nomTuteur:     document.getElementById('eNomTuteur').value.trim(),
      telephoneResponsable: document.getElementById('eTelResponsable').value.trim(),
      adresseResponsable:   document.getElementById('eAdresseResponsable').value.trim(),
      adresse:       document.getElementById('eAdresse').value.trim(),
      infosMed:      document.getElementById('eInfosMed').value.trim()
    };

    const all = Storage.getAllIncludingArchived('eleves');
    const dup = all.find(e=> e.matricule.toLowerCase() === data.matricule.toLowerCase() && e.id !== id);
    if(dup){
      Notify.toast('Ce matricule existe déjà : ' + data.matricule, 'danger');
      return;
    }

    if(id){
      Storage.update('eleves', id, data);
      Notify.toast('Élève modifié avec succès.', 'success');
    } else {
      Storage.create('eleves', data);
      Notify.toast('Élève enregistré avec succès.', 'success');
    }
    bootstrap.Modal.getInstance(document.getElementById('modalEleve')).hide();
    this.refresh();
  },

  archive(id){
    const e = Storage.getById('eleves', id);
    if(!e) return;
    if(!confirm(`Archiver définitivement l'élève ${e.prenom} ${e.nom} ?\n(L'élève ne sera plus visible, mais les données restent en base.)`)) return;
    Storage.remove('eleves', id, true);
    Notify.toast('Élève archivé.', 'warning');
    this.refresh();
  },

  reinscrire(id){
    const e = Storage.getById('eleves', id);
    if(!e) return;
    const annees = Storage.getAllIncludingArchived('annees');
    const choices = annees.map(a=>`${a.id}: ${a.libelle}`).join('\n');
    const saisie = prompt(
      `Réinscrire ${e.prenom} ${e.nom} dans une nouvelle année.\n` +
      `Copiez l'ID d'année cible parmi :\n${choices}\n\nID d'année cible :`,
      annees.find(a=>a.active)?.id || ''
    );
    if(!saisie) return;
    const cible = annees.find(a=>a.id===saisie);
    if(!cible){ Notify.toast('Année introuvable.', 'danger'); return; }

    const newE = {...e, id:undefined, anneeId:cible.id, dateInscription:new Date().toISOString().slice(0,10)};
    delete newE.id; delete newE.createdAt; delete newE.updatedAt;
    Storage.create('eleves', newE);
    Notify.toast(`Élève réinscrit en ${cible.libelle}.`, 'success');
    this.refresh();
  },

  showFiche(id){
    const e = Storage.getById('eleves', id);
    if(!e) return;
    const classe = Storage.getById('classes', e.classeId);
    const annee = Storage.getById('annees', e.anneeId);
    const param = Storage.read().parametres;
    const elevesClasse = Storage.getAll('eleves').filter(x=>x.classeId===e.classeId && x.anneeId===e.anneeId);
    const rang = elevesClasse.sort((a,b)=>a.nom.localeCompare(b.nom)).findIndex(x=>x.id===e.id)+1;

    document.getElementById('ficheBody').innerHTML = `
      <div class="fiche-eleve">
        <div class="fiche-head">
          <div>
            <h5 class="mb-0">${Utils.escapeHtml(param.etablissement)}</h5>
            <small class="text-muted">${Utils.escapeHtml(param.adresse)}</small><br>
            <small class="text-muted">Tél. ${Utils.escapeHtml(param.telephone)} — Année ${annee?.libelle||'—'}</small>
          </div>
          <div class="fiche-photo">${e.photo?`<img src="${Utils.escapeHtml(e.photo)}">`:`<i class="bi bi-person"></i>`}</div>
        </div>
        <h6 class="text-center my-3 fw-bold" style="letter-spacing:1px">FICHE INDIVIDUELLE DE L'ÉLÈVE</h6>
        <table class="table table-bordered table-sm fiche-table">
          <tbody>
            <tr><th style="width:35%">Matricule</th><td>${Utils.escapeHtml(e.matricule)}</td></tr>
            <tr><th>Nom & Prénom</th><td><strong>${Utils.escapeHtml(e.prenom+' '+e.nom)}</strong></td></tr>
            <tr><th>Sexe</th><td>${e.sexe==='M'?'Masculin':'Féminin'}</td></tr>
            <tr><th>Date de naissance</th><td>${Utils.formatDate(e.dateNaissance)} à ${Utils.escapeHtml(e.lieuNaissance||'—')}</td></tr>
            <tr><th>Nationalité</th><td>${Utils.escapeHtml(e.nationalite||'—')}</td></tr>
            <tr><th>Adresse</th><td>${Utils.escapeHtml(e.adresse||'—')}</td></tr>
            <tr><th>Téléphone</th><td>${Utils.escapeHtml(e.telephone||'—')}</td></tr>
            <tr><th>Classe</th><td>${classe?Utils.escapeHtml(classe.nom):'—'} (${elevesClasse.length} élèves)</td></tr>
            <tr><th>Rang alphabétique</th><td>${rang} / ${elevesClasse.length}</td></tr>
            <tr><th>Date d'inscription</th><td>${Utils.formatDate(e.dateInscription)}</td></tr>
            <tr><th>Nom du père</th><td>${Utils.escapeHtml(e.nomPere||'—')}</td></tr>
            <tr><th>Nom de la mère</th><td>${Utils.escapeHtml(e.nomMere||'—')}</td></tr>
            <tr><th>Tuteur</th><td>${Utils.escapeHtml(e.nomTuteur||'—')}</td></tr>
            <tr><th>Tél. responsable</th><td>${Utils.escapeHtml(e.telephoneResponsable||'—')}</td></tr>
            <tr><th>Adresse responsable</th><td>${Utils.escapeHtml(e.adresseResponsable||'—')}</td></tr>
            <tr><th>Infos médicales</th><td>${Utils.escapeHtml(e.infosMed||'—')}</td></tr>
          </tbody>
        </table>
        <div class="fiche-signatures">
          <div>Le Directeur<br><br><br>${Utils.escapeHtml(param.directeur||'')}</div>
          <div>Signature & Cachet<br><br><br>______________________</div>
        </div>
      </div>
    `;
    new bootstrap.Modal(document.getElementById('modalFiche')).show();
  },

  exportCsv(){
    const list = this.getFiltered();
    const rows = [['Matricule','Prénom','Nom','Sexe','Date naissance','Classe','Année','Téléphone','Tél. responsable']];
    list.forEach(e=>{
      const c = Storage.getById('classes', e.classeId);
      const a = Storage.getById('annees', e.anneeId);
      rows.push([
        e.matricule, e.prenom, e.nom, e.sexe, e.dateNaissance,
        c?c.nom:'', a?a.libelle:'', e.telephone||'', e.telephoneResponsable||''
      ]);
    });
    const csv = rows.map(r=>r.map(v=>`"${String(v??'').replace(/"/g,'""')}"`).join(';')).join('\n');
    const blob = new Blob(['\ufeff'+csv], {type:'text/csv;charset=utf-8;'});
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'eleves_'+new Date().toISOString().slice(0,10)+'.csv';
    a.click();
    Notify.toast('Export CSV généré.', 'success');
  }
};
