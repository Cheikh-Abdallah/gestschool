/**
 * Module 4 : Gestion des classes.
 */
const Classes = {
  state: { page:1, pageSize:10, search:'', filtreCycle:'', filtreNiveau:'', sortKey:'nom', sortDir:'asc' },

  render(container){
    this.container = container;
    container.innerHTML = `
      <div class="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
        <div>
          <div class="page-title">Gestion des classes</div>
          <div class="page-sub">Création, effectifs, professeur principal et listes</div>
        </div>
        <div class="d-flex gap-2">
          <button class="btn btn-outline-success btn-sm" id="btnImportClasses">
            <i class="bi bi-file-earmark-excel me-1"></i> Importer Excel
          </button>
          <button class="btn btn-outline-secondary btn-sm" id="btnExportCsvCls">
            <i class="bi bi-filetype-csv me-1"></i> Exporter CSV
          </button>
          <button class="btn btn-primary btn-sm" id="btnAddCls">
            <i class="bi bi-plus-lg me-1"></i> Nouvelle classe
          </button>
        </div>
      </div>

      <div class="card-panel">
        <div class="row g-2 mb-3">
          <div class="col-12 col-md-4">
            <div class="search-inline">
              <i class="bi bi-search"></i>
              <input type="text" id="fSearchCls" placeholder="Rechercher une classe…">
            </div>
          </div>
          <div class="col-6 col-md-3">
            <select class="form-select form-select-sm" id="fCycleCls">
              <option value="">Tous cycles</option>
              <option value="Préscolaire">Préscolaire</option>
              <option value="Élémentaire">Élémentaire</option>
              <option value="Moyen">Moyen</option>
              <option value="Secondaire">Secondaire</option>
            </select>
          </div>
          <div class="col-6 col-md-3">
            <select class="form-select form-select-sm" id="fNiveauCls">
              <option value="">Tous niveaux</option>
            </select>
          </div>
          <div class="col-12 col-md-2">
            <button class="btn btn-outline-secondary btn-sm w-100" id="btnResetCls">
              <i class="bi bi-arrow-counterclockwise me-1"></i> Réinitialiser
            </button>
          </div>
        </div>

        <div class="table-responsive">
          <table class="table table-hover align-middle mb-0" id="tblCls">
            <thead>
              <tr>
                <th data-sort="nom" style="cursor:pointer">Classe</th>
                <th data-sort="cycle" style="cursor:pointer">Cycle</th>
                <th data-sort="niveau" style="cursor:pointer">Niveau</th>
                <th data-sort="prof" style="cursor:pointer">Prof. principal</th>
                <th data-sort="effectif" style="cursor:pointer">Effectif</th>
                <th class="text-end">Actions</th>
              </tr>
            </thead>
            <tbody id="tbodyCls"></tbody>
          </table>
        </div>

        <div class="d-flex flex-wrap justify-content-between align-items-center mt-3 gap-2">
          <small class="text-muted" id="paginationInfoCls"></small>
          <nav><ul class="pagination pagination-sm mb-0" id="paginationCls"></ul></nav>
        </div>
      </div>

      <!-- Modale formulaire -->
      <div class="modal fade" id="modalCls" tabindex="-1">
        <div class="modal-dialog modal-lg modal-dialog-centered">
          <div class="modal-content modal-cls">
            <form id="formCls" novalidate>
              <div class="modal-header">
                <h6 class="modal-title" id="modalClsTitle">Nouvelle classe</h6>
                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
              </div>
              <div class="modal-body">
                <input type="hidden" id="clsId">
                <div class="row g-3">
                  <div class="col-md-4">
                    <label class="form-label">Nom de la classe *</label>
                    <input class="form-control" id="clsNom" required placeholder="6ᵉ A, Terminale L2…">
                    <div class="invalid-feedback">Nom obligatoire.</div>
                  </div>
                  <div class="col-md-4">
                    <label class="form-label">Niveau *</label>
                    <input class="form-control" id="clsNiveau" required placeholder="6ᵉ, 5ᵉ, Terminale…">
                    <div class="invalid-feedback">Niveau obligatoire.</div>
                  </div>
                  <div class="col-md-4">
                    <label class="form-label">Cycle *</label>
                    <select class="form-select" id="clsCycle" required>
                      <option value="">— Choisir —</option>
                      <option value="Préscolaire">Préscolaire</option>
                      <option value="Élémentaire">Élémentaire</option>
                      <option value="Moyen">Moyen</option>
                      <option value="Secondaire">Secondaire</option>
                    </select>
                    <div class="invalid-feedback">Cycle obligatoire.</div>
                  </div>

                  <div class="col-md-4">
                    <label class="form-label">Série (si secondaire)</label>
                    <input class="form-control" id="clsSerie" placeholder="L, S, L2…">
                  </div>
                  <div class="col-md-4">
                    <label class="form-label">Effectif maximum</label>
                    <input type="number" class="form-control" id="clsEffectifMax" min="1" max="100" value="40">
                  </div>
                  <div class="col-md-4">
                    <label class="form-label">Année scolaire *</label>
                    <select class="form-select" id="clsAnnee" required></select>
                    <div class="invalid-feedback">Sélectionnez l'année.</div>
                  </div>

                  <div class="col-md-6">
                    <label class="form-label">Professeur principal</label>
                    <select class="form-select" id="clsProf"></select>
                  </div>
                  <div class="col-md-6">
                    <label class="form-label">Enseignants affectés</label>
                    <select class="form-select" id="clsEnseignants" multiple size="5"></select>
                    <small class="text-muted">Ctrl / Cmd pour sélection multiple.</small>
                  </div>

                  <div class="col-12">
                    <label class="form-label">Matières de la classe</label>
                    <select class="form-select" id="clsMatieres" multiple size="5"></select>
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

      <!-- Modale détail classe -->
      <div class="modal fade" id="modalDetailCls" tabindex="-1">
        <div class="modal-dialog modal-xl modal-dialog-scrollable">
          <div class="modal-content">
            <div class="modal-header no-print">
              <h6 class="modal-title" id="modalDetailClsTitle"><i class="bi bi-building me-1"></i> Détail classe</h6>
              <div class="d-flex gap-2">
                <button class="btn btn-sm btn-outline-secondary" id="btnPrintCls">
                  <i class="bi bi-printer"></i> Imprimer liste
                </button>
                <button class="btn-close" data-bs-dismiss="modal"></button>
              </div>
            </div>
            <div class="modal-body" id="detailClsBody"></div>
          </div>
        </div>
      </div>
    `;

    this.bindEvents();
    this.populateFilters();
    this.refresh();
  },

  bindEvents(){
    document.getElementById('btnAddCls').onclick = ()=> this.openForm();
    document.getElementById('btnResetCls').onclick = ()=>{
      this.state = {...this.state, page:1, search:'', filtreCycle:'', filtreNiveau:''};
      document.getElementById('fSearchCls').value='';
      document.getElementById('fCycleCls').value='';
      document.getElementById('fNiveauCls').value='';
      this.refresh();
    };
    document.getElementById('fSearchCls').addEventListener('input', e=>{
      this.state.search = e.target.value.trim().toLowerCase();
      this.state.page = 1;
      this.refresh();
    });
    document.getElementById('fCycleCls').onchange  = e=>{ this.state.filtreCycle=e.target.value;  this.state.page=1; this.refresh(); };
    document.getElementById('fNiveauCls').onchange = e=>{ this.state.filtreNiveau=e.target.value; this.state.page=1; this.refresh(); };

    document.querySelectorAll('#tblCls th[data-sort]').forEach(th=>{
      th.onclick = ()=>{
        const k = th.dataset.sort;
        if(this.state.sortKey === k) this.state.sortDir = this.state.sortDir==='asc'?'desc':'asc';
        else { this.state.sortKey = k; this.state.sortDir = 'asc'; }
        this.refresh();
      };
    });

    document.getElementById('formCls').onsubmit = (e)=>{ e.preventDefault(); this.save(); };

    // ✅ Impression isolée
    document.getElementById('btnPrintCls').onclick = ()=>{
      document.body.classList.add('printing-doc');
      setTimeout(()=>{
        window.print();
        setTimeout(()=> document.body.classList.remove('printing-doc'), 500);
      }, 50);
    };

    // ✅ Boutons protégés
    const btnImport = document.getElementById('btnImportClasses');
    if(btnImport) btnImport.onclick = () => ImportExcel.open('classes');
    
    const btnExport = document.getElementById('btnExportCsvCls');
    if(btnExport) btnExport.onclick = () => this.exportCsv();
  },

  populateFilters(){
    const niveaux = [...new Set(Storage.getAll('classes').map(c=>c.niveau).filter(Boolean))].sort();
    const selNiv = document.getElementById('fNiveauCls');
    selNiv.innerHTML = '<option value="">Tous niveaux</option>' +
      niveaux.map(n=>`<option value="${Utils.escapeHtml(n)}">${Utils.escapeHtml(n)}</option>`).join('');

    const annees = Storage.getAllIncludingArchived('annees');
    const selAnnee = document.getElementById('clsAnnee');
    selAnnee.innerHTML = annees.map(a=>`<option value="${a.id}" ${a.active?'selected':''}>${Utils.escapeHtml(a.libelle)}</option>`).join('');

    const ens = Storage.getAll('enseignants');
    const selProf = document.getElementById('clsProf');
    selProf.innerHTML = '<option value="">— Aucun —</option>' +
      ens.map(e=>`<option value="${e.id}">${Utils.escapeHtml(e.prenom+' '+e.nom)}</option>`).join('');

    const selEns = document.getElementById('clsEnseignants');
    selEns.innerHTML = ens.map(e=>`<option value="${e.id}">${Utils.escapeHtml(e.prenom+' '+e.nom)}</option>`).join('');

    const mats = Storage.getAll('matieres');
    const selMat = document.getElementById('clsMatieres');
    selMat.innerHTML = mats.map(m=>`<option value="${m.id}">${Utils.escapeHtml(m.nom)}</option>`).join('');
  },

  getFiltered(){
    let list = Storage.getAll('classes');
    const s = this.state;
    if(s.filtreCycle)  list = list.filter(c=>c.cycle === s.filtreCycle);
    if(s.filtreNiveau) list = list.filter(c=>c.niveau === s.filtreNiveau);
    if(s.search){
      list = list.filter(c=>
        (c.nom||'').toLowerCase().includes(s.search) ||
        (c.niveau||'').toLowerCase().includes(s.search) ||
        (c.serie||'').toLowerCase().includes(s.search)
      );
    }
    const dir = s.sortDir==='asc'?1:-1;
    list.sort((a,b)=>{
      let va, vb;
      if(s.sortKey==='effectif'){
        va = Storage.getAll('eleves').filter(x=>x.classeId===a.id).length;
        vb = Storage.getAll('eleves').filter(x=>x.classeId===b.id).length;
        return (va-vb)*dir;
      }
      if(s.sortKey==='prof'){
        va = Storage.getById('enseignants', a.profPrincipalId)?.nom || '';
        vb = Storage.getById('enseignants', b.profPrincipalId)?.nom || '';
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

    const tbody = document.getElementById('tbodyCls');
    if(!pageList.length){
      tbody.innerHTML = `<tr><td colspan="6" class="text-center text-muted py-4">Aucune classe trouvée.</td></tr>`;
    } else {
      tbody.innerHTML = pageList.map(c=>{
        const prof = Storage.getById('enseignants', c.profPrincipalId);
        const effectif = Storage.getAll('eleves').filter(e=>e.classeId===c.id).length;
        const max = c.effectifMax || 40;
        const pct = Math.min(100, Math.round((effectif/max)*100));
        const colorClass = pct>=100 ? 'red' : pct>=80 ? 'orange' : 'green';
        return `<tr>
          <td><strong>${Utils.escapeHtml(c.nom)}</strong>${c.serie?` <span class="badge-matricule">${Utils.escapeHtml(c.serie)}</span>`:''}</td>
          <td><span class="badge bg-secondary-subtle text-secondary">${Utils.escapeHtml(c.cycle||'—')}</span></td>
          <td>${Utils.escapeHtml(c.niveau||'—')}</td>
          <td>${prof?Utils.escapeHtml(prof.prenom+' '+prof.nom):'<span class="text-muted">—</span>'}</td>
          <td>
            <div class="d-flex align-items-center gap-2">
              <span class="fw-semibold">${effectif}/${max}</span>
              <div class="effectif-bar"><div class="fill ${colorClass}" style="width:${pct}%"></div></div>
            </div>
          </td>
          <td class="text-end">
            <button class="btn btn-sm btn-light" title="Voir détail" data-act="detail" data-id="${c.id}"><i class="bi bi-eye"></i></button>
            <button class="btn btn-sm btn-light" title="Modifier" data-act="edit" data-id="${c.id}"><i class="bi bi-pencil"></i></button>
            <button class="btn btn-sm btn-light text-danger" title="Supprimer" data-act="del" data-id="${c.id}"><i class="bi bi-trash"></i></button>
          </td>
        </tr>`;
      }).join('');
    }

    tbody.querySelectorAll('[data-act]').forEach(btn=>{
      btn.onclick = ()=>{
        const id = btn.dataset.id;
        const act = btn.dataset.act;
        if(act==='detail') this.showDetail(id);
        else if(act==='edit') this.openForm(id);
        else if(act==='del') this.archive(id);
      };
    });

    document.getElementById('paginationInfoCls').textContent =
      total === 0 ? '0 résultat' : `${start+1}–${Math.min(start+this.state.pageSize, total)} sur ${total} classe(s)`;

    const pag = document.getElementById('paginationCls');
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
    const modal = new bootstrap.Modal(document.getElementById('modalCls'));
    const form = document.getElementById('formCls');
    form.classList.remove('was-validated');
    document.getElementById('clsEnseignants').querySelectorAll('option').forEach(o=>o.selected=false);
    document.getElementById('clsMatieres').querySelectorAll('option').forEach(o=>o.selected=false);

    if(id){
      const c = Storage.getById('classes', id);
      if(!c) return;
      document.getElementById('modalClsTitle').textContent = 'Modifier classe · ' + c.nom;
      document.getElementById('clsId').value = c.id;
      document.getElementById('clsNom').value = c.nom || '';
      document.getElementById('clsNiveau').value = c.niveau || '';
      document.getElementById('clsCycle').value = c.cycle || '';
      document.getElementById('clsSerie').value = c.serie || '';
      document.getElementById('clsEffectifMax').value = c.effectifMax || 40;
      document.getElementById('clsAnnee').value = c.anneeId || '';
      document.getElementById('clsProf').value = c.profPrincipalId || '';
      (c.enseignantIds||[]).forEach(eid=>{
        const opt = document.querySelector(`#clsEnseignants option[value="${eid}"]`);
        if(opt) opt.selected = true;
      });
      (c.matiereIds||[]).forEach(mid=>{
        const opt = document.querySelector(`#clsMatieres option[value="${mid}"]`);
        if(opt) opt.selected = true;
      });
    } else {
      form.reset();
      document.getElementById('modalClsTitle').textContent = 'Nouvelle classe';
      document.getElementById('clsId').value = '';
      document.getElementById('clsEffectifMax').value = 40;
      const anneeActive = Storage.getAllIncludingArchived('annees').find(a=>a.active);
      if(anneeActive) document.getElementById('clsAnnee').value = anneeActive.id;
    }
    modal.show();
  },

  save(){
    const form = document.getElementById('formCls');
    form.classList.add('was-validated');
    if(!form.checkValidity()) return;

    const id = document.getElementById('clsId').value;
    const enseignantIds = [...document.getElementById('clsEnseignants').selectedOptions].map(o=>o.value);
    const matiereIds = [...document.getElementById('clsMatieres').selectedOptions].map(o=>o.value);

    const data = {
      nom:         document.getElementById('clsNom').value.trim(),
      niveau:      document.getElementById('clsNiveau').value.trim(),
      cycle:       document.getElementById('clsCycle').value,
      serie:       document.getElementById('clsSerie').value.trim(),
      effectifMax: parseInt(document.getElementById('clsEffectifMax').value) || 40,
      anneeId:     document.getElementById('clsAnnee').value,
      profPrincipalId: document.getElementById('clsProf').value || null,
      enseignantIds,
      matiereIds
    };

    const all = Storage.getAllIncludingArchived('classes');
    const dup = all.find(c=> c.nom.toLowerCase() === data.nom.toLowerCase()
      && c.anneeId === data.anneeId && c.id !== id);
    if(dup){
      Notify.toast('Une classe avec ce nom existe déjà pour cette année.', 'danger');
      return;
    }

    if(id){
      Storage.update('classes', id, data);
      Notify.toast('Classe modifiée avec succès.', 'success');
    } else {
      Storage.create('classes', data);
      Notify.toast('Classe créée avec succès.', 'success');
    }
    bootstrap.Modal.getInstance(document.getElementById('modalCls')).hide();
    this.refresh();
  },

  archive(id){
    const c = Storage.getById('classes', id);
    if(!c) return;
    const effectif = Storage.getAll('eleves').filter(e=>e.classeId===id).length;
    if(effectif > 0){
      if(!confirm(`La classe ${c.nom} contient ${effectif} élève(s).\nSupprimer quand même ?`)) return;
    } else {
      if(!confirm(`Supprimer la classe ${c.nom} ?`)) return;
    }
    Storage.remove('classes', id, true);
    Notify.toast('Classe archivée.', 'warning');
    this.refresh();
  },

  showDetail(id){
    const c = Storage.getById('classes', id);
    if(!c) return;
    const prof = Storage.getById('enseignants', c.profPrincipalId);
    const eleves = Storage.getAll('eleves').filter(e=>e.classeId===id).sort((a,b)=>a.nom.localeCompare(b.nom));
    const ensIds = c.enseignantIds || [];
    const enseignants = ensIds.map(eid=>Storage.getById('enseignants', eid)).filter(Boolean);
    const matIds = c.matiereIds || [];
    const matieres = matIds.map(mid=>Storage.getById('matieres', mid)).filter(Boolean);
    const param = Storage.read().parametres || {};
    const annee = Storage.getById('annees', c.anneeId);

    document.getElementById('modalDetailClsTitle').innerHTML =
      `<i class="bi bi-building me-1"></i> Classe ${Utils.escapeHtml(c.nom)} — ${eleves.length} élève(s)`;

    let elevesHtml = '';
    if(eleves.length){
      elevesHtml = `
        <div class="table-responsive">
          <table class="table table-sm table-bordered align-middle mb-0">
            <thead><tr>
              <th style="width:40px">#</th>
              <th>Matricule</th>
              <th>Nom & Prénom</th>
              <th>Sexe</th>
              <th>Date naissance</th>
              <th>Téléphone responsable</th>
            </tr></thead>
            <tbody>
              ${eleves.map((e,i)=>`
                <tr>
                  <td>${i+1}</td>
                  <td>${Utils.escapeHtml(e.matricule)}</td>
                  <td><strong>${Utils.escapeHtml(e.prenom+' '+e.nom)}</strong></td>
                  <td>${e.sexe==='M'?'M':'F'}</td>
                  <td>${Utils.formatDate(e.dateNaissance)}</td>
                  <td>${Utils.escapeHtml(e.telephoneResponsable||'—')}</td>
                </tr>`).join('')}
            </tbody>
          </table>
        </div>`;
    } else {
      elevesHtml = `<p class="text-muted small">Aucun élève inscrit dans cette classe.</p>`;
    }

    document.getElementById('detailClsBody').innerHTML = `
      <div class="fiche-eleve">
        ${Utils.enteteDocument('LISTE DES ÉLÈVES — ' + c.nom)}

        <div class="row g-3 mb-3">
          <div class="col-md-6">
            <div class="info-block">
              <div class="info-label">Professeur principal</div>
              <div class="info-value">${prof?Utils.escapeHtml(prof.prenom+' '+prof.nom):'—'}</div>
            </div>
          </div>
          <div class="col-md-6">
            <div class="info-block">
              <div class="info-label">Effectif</div>
              <div class="info-value">${eleves.length} / ${c.effectifMax||40}</div>
            </div>
          </div>
          <div class="col-md-12">
            <div class="info-block">
              <div class="info-label">Enseignants affectés</div>
              <div class="info-value">${enseignants.length?enseignants.map(e=>Utils.escapeHtml(e.prenom+' '+e.nom)).join(', '):'—'}</div>
            </div>
          </div>
        </div>

        ${elevesHtml}

        <div class="fiche-signatures mt-4">
          <div>Le Professeur principal<br><br><br>${prof?Utils.escapeHtml(prof.prenom+' '+prof.nom):'______________________'}</div>
          <div>Le Directeur<br><br><br>${Utils.escapeHtml(param.signDirecteur || param.directeur || '')}</div>
        </div>
      </div>
    `;
    new bootstrap.Modal(document.getElementById('modalDetailCls')).show();
  },

  exportCsv(){
    const list = this.getFiltered();
    const rows = [['Classe','Cycle','Niveau','Série','Effectif','Max','Prof principal','Année']];
    list.forEach(c=>{
      const prof = Storage.getById('enseignants', c.profPrincipalId);
      const effectif = Storage.getAll('eleves').filter(e=>e.classeId===c.id).length;
      const annee = Storage.getById('annees', c.anneeId);
      rows.push([
        c.nom, c.cycle||'', c.niveau||'', c.serie||'',
        effectif, c.effectifMax||40,
        prof?prof.prenom+' '+prof.nom:'', annee?annee.libelle:''
      ]);
    });
    const csv = rows.map(r=>r.map(v=>`"${String(v??'').replace(/"/g,'""')}"`).join(';')).join('\n');
    const blob = new Blob(['\ufeff'+csv], {type:'text/csv;charset=utf-8;'});
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'classes_'+new Date().toISOString().slice(0,10)+'.csv';
    a.click();
    Notify.toast('Export CSV généré.', 'success');
  }
};
