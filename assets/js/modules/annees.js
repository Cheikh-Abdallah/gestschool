/**
 * Module 10 : Années scolaires et périodes.
 * Création, activation, archivage, périodes,
 * réinscription en lot, gestion des redoublements.
 */
const Annees = {
  render(container){
    this.container = container;
    container.innerHTML = `
      <div class="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
        <div>
          <div class="page-title">Années scolaires</div>
          <div class="page-sub">Gestion du cycle de vie et des périodes</div>
        </div>
        <div class="d-flex gap-2">
          <button class="btn btn-outline-secondary btn-sm" id="btnReinscription">
            <i class="bi bi-arrow-up-circle me-1"></i> Réinscription en lot
          </button>
          <button class="btn btn-primary btn-sm" id="btnAddAnnee">
            <i class="bi bi-plus-lg me-1"></i> Nouvelle année
          </button>
        </div>
      </div>

      <div class="card-panel">
        <h6><i class="bi bi-calendar-range"></i> Liste des années scolaires</h6>
        <div class="table-responsive">
          <table class="table table-hover align-middle mb-0" id="tblAnnees">
            <thead>
              <tr>
                <th>Libellé</th>
                <th>Périodes</th>
                <th>Élèves</th>
                <th>Classes</th>
                <th>Statut</th>
                <th class="text-end">Actions</th>
              </tr>
            </thead>
            <tbody id="tbodyAnnees"></tbody>
          </table>
        </div>
      </div>

      <!-- Modale création -->
      <div class="modal fade" id="modalAnnee" tabindex="-1">
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content modal-an">
            <form id="formAnnee" novalidate>
              <div class="modal-header">
                <h6 class="modal-title" id="modalAnneeTitle">Nouvelle année scolaire</h6>
                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
              </div>
              <div class="modal-body">
                <input type="hidden" id="anId">
                <div class="row g-3">
                  <div class="col-12">
                    <label class="form-label">Libellé *</label>
                    <input class="form-control" id="anLibelle" required placeholder="2026-2027">
                    <div class="invalid-feedback">Libellé obligatoire.</div>
                  </div>
                  <div class="col-12">
                    <label class="form-label">Type de périodes *</label>
                    <select class="form-select" id="anType" required>
                      <option value="trimestre">Trimestres</option>
                      <option value="semestre">Semestres</option>
                    </select>
                    <div class="invalid-feedback">Type obligatoire.</div>
                  </div>
                  <div class="col-12">
                    <label class="form-label">Gestion des périodes</label>
                    <select class="form-select" id="anGestion">
                      <option value="auto">Automatique (génère les périodes)</option>
                      <option value="manuelle">Manuelle (je définis les dates et noms)</option>
                    </select>
                  </div>

                  <!-- Bloc de gestion manuelle (caché si auto) -->
                  <div class="col-12 d-none" id="blocPeriodesManuelles">
                    <label class="form-label fw-semibold">Périodes personnalisées</label>
                    <div id="listePeriodes"></div>
                    <button type="button" class="btn btn-sm btn-outline-primary mt-2" id="btnAddPeriode">
                      <i class="bi bi-plus"></i> Ajouter une période
                    </button>
                  </div>

                  <div class="col-12">
                    <div class="form-check mt-2">
                      <input class="form-check-input" type="checkbox" id="anActive">
                      <label class="form-check-label small" for="anActive">
                        Définir comme année <strong>active</strong> (les autres seront automatiquement désactivées)
                      </label>
                    </div>
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

      <!-- Modale réinscription en lot -->
      <div class="modal fade" id="modalReinscription" tabindex="-1">
        <div class="modal-dialog modal-xl modal-dialog-scrollable">
          <div class="modal-content">
            <div class="modal-header">
              <h6 class="modal-title"><i class="bi bi-arrow-up-circle me-1"></i> Réinscription en lot</h6>
              <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body" id="reinscriptionBody"></div>
            <div class="modal-footer">
              <button type="button" class="btn btn-light" data-bs-dismiss="modal">Annuler</button>
              <button type="button" class="btn btn-primary" id="btnConfirmReinscription">
                <i class="bi bi-check2-all me-1"></i> Valider les réinscriptions
              </button>
            </div>
          </div>
        </div>
      </div>
    `;

    this.bindEvents();
    this.refresh();
  },

  bindEvents(){
    document.getElementById('btnAddAnnee').onclick = ()=> this.openForm();
    document.getElementById('btnReinscription').onclick = ()=> this.openReinscription();
    document.getElementById('formAnnee').onsubmit = (e)=>{ e.preventDefault(); this.save(); };
    document.getElementById('btnConfirmReinscription').onclick = ()=> this.confirmReinscription();
  },

  refresh(){
    const annees = Storage.getAllIncludingArchived('annees');
    const tbody = document.getElementById('tbodyAnnees');

    if(!annees.length){
      tbody.innerHTML = `<tr><td colspan="6" class="text-center text-muted py-4">Aucune année scolaire.</td></tr>`;
      return;
    }

    annees.sort((a,b)=>b.libelle.localeCompare(a.libelle));

    tbody.innerHTML = annees.map(a=>{
      const eleves = Storage.getAll('eleves').filter(e=>e.anneeId===a.id);
      const classes = Storage.getAll('classes').filter(c=>c.anneeId===a.id);
      const statusBadge = a.active
        ? '<span class="badge bg-success-subtle text-success"><i class="bi bi-check-circle me-1"></i>Active</span>'
        : a.archived
          ? '<span class="badge bg-secondary-subtle text-secondary">Archivée</span>'
          : '<span class="badge bg-warning-subtle text-warning">Inactive</span>';

      // Gestion des périodes
      let periodes = [];
      if (a.gestionManuelle) {
        periodes = a.periodes || [];
      } else {
        periodes = a.typePeriode === 'semestre' ? ['Semestre 1', 'Semestre 2'] : ['Trimestre 1', 'Trimestre 2', 'Trimestre 3'];
      }

      const periodesHtml = periodes.length
        ? periodes.map(p => typeof p === 'string' ? p : p.nom).map(nom => `<span class="badge-matricule me-1">${Utils.escapeHtml(nom)}</span>`).join('')
        : '—';

      return `<tr class="${a.active?'row-active':''}">
        <td><strong>${Utils.escapeHtml(a.libelle)}</strong></td>
        <td>${periodesHtml}</td>
        <td>${eleves.length}</td>
        <td>${classes.length}</td>
        <td>${statusBadge}</td>
        <td class="text-end">
          ${!a.active && !a.archived ? `<button class="btn btn-sm btn-success" title="Activer" data-act="activer" data-id="${a.id}"><i class="bi bi-check2-circle"></i></button>`:''}
          ${!a.archived ? `<button class="btn btn-sm btn-light" title="Modifier" data-act="edit" data-id="${a.id}"><i class="bi bi-pencil"></i></button>`:''}
          ${a.archived ? `<button class="btn btn-sm btn-light" title="Désarchiver" data-act="désarchiver" data-id="${a.id}"><i class="bi bi-arrow-counterclockwise"></i></button>`:''}
          ${!a.active && !a.archived ? `<button class="btn btn-sm btn-light" title="Archiver" data-act="archiver" data-id="${a.id}"><i class="bi bi-archive"></i></button>`:''}
        </td>
      </tr>`;
    }).join('');

    tbody.querySelectorAll('[data-act]').forEach(btn=>{
      btn.onclick = ()=>{
        const id = btn.dataset.id;
        const act = btn.dataset.act;
        if(act==='activer') this.activer(id);
        else if(act==='edit') this.openForm(id);
        else if(act==='archiver') this.archiver(id);
        else if(act==='désarchiver') this.desarchiver(id);
      };
    });
  },

  openForm(id=null){
    const modalEl = document.getElementById('modalAnnee');
    const modal = new bootstrap.Modal(modalEl);
    const form = document.getElementById('formAnnee');
    form.classList.remove('was-validated');
    document.getElementById('listePeriodes').innerHTML = '';
    document.getElementById('blocPeriodesManuelles').classList.add('d-none');

    document.getElementById('anGestion').onchange = (e)=>{
      document.getElementById('blocPeriodesManuelles').classList.toggle('d-none', e.target.value !== 'manuelle');
    };

    document.getElementById('btnAddPeriode').onclick = ()=>{
      const html = `
        <div class="d-flex gap-2 mb-2 align-items-center" data-periode>
          <input type="text" class="form-control form-control-sm" placeholder="Ex: Semestre 1" data-nom required>
          <input type="date" class="form-control form-control-sm" data-debut>
          <input type="date" class="form-control form-control-sm" data-fin>
          <button type="button" class="btn btn-sm btn-outline-danger" onclick="this.parentElement.remove()">
            <i class="bi bi-trash"></i>
          </button>
        </div>
      `;
      document.getElementById('listePeriodes').insertAdjacentHTML('beforeend', html);
    };

    if(id){
      const a = Storage.getAllIncludingArchived('annees').find(x=>x.id===id);
      if(!a) return;
      document.getElementById('modalAnneeTitle').textContent = 'Modifier année · ' + a.libelle;
      document.getElementById('anId').value = a.id;
      document.getElementById('anLibelle').value = a.libelle;
      document.getElementById('anType').value = a.typePeriode || 'trimestre';
      document.getElementById('anActive').checked = !!a.active;
      
      const gestion = a.gestionManuelle ? 'manuelle' : 'auto';
      document.getElementById('anGestion').value = gestion;
      document.getElementById('anGestion').dispatchEvent(new Event('change'));

      if(gestion === 'manuelle' && a.periodes){
        a.periodes.forEach(p => {
          document.getElementById('btnAddPeriode').click(); // Crée une ligne vide
          const rows = document.querySelectorAll('#listePeriodes [data-periode]');
          const lastRow = rows[rows.length - 1];
          lastRow.querySelector('[data-nom]').value = p.nom || '';
          lastRow.querySelector('[data-debut]').value = p.debut || '';
          lastRow.querySelector('[data-fin]').value = p.fin || '';
        });
      }

    } else {
      form.reset();
      document.getElementById('modalAnneeTitle').textContent = 'Nouvelle année scolaire';
      document.getElementById('anId').value = '';
      
      const annees = Storage.getAllIncludingArchived('annees');
      const last = annees.sort((x,y)=>y.libelle.localeCompare(x.libelle))[0];
      if(last){
        const [start] = last.libelle.split('-').map(n=>parseInt(n));
        if(!isNaN(start)){
          document.getElementById('anLibelle').value = (start+1)+'-'+(start+2);
        }
      }
      document.getElementById('anActive').checked = false;
    }
    modal.show();
  },

  save(){
    const form = document.getElementById('formAnnee');
    form.classList.add('was-validated');
    if(!form.checkValidity()) return;

    const id = document.getElementById('anId').value;
    const libelle = document.getElementById('anLibelle').value.trim();
    const typePeriode = document.getElementById('anType').value;
    const gestion = document.getElementById('anGestion').value;
    const actif = document.getElementById('anActive').checked;

    // Récupération des périodes manuelles
    let periodes = [];
    if(gestion === 'manuelle'){
      const rows = document.querySelectorAll('#listePeriodes [data-periode]');
      rows.forEach(row=>{
        const nom = row.querySelector('[data-nom]').value.trim();
        const debut = row.querySelector('[data-debut]').value;
        const fin = row.querySelector('[data-fin]').value;
        if(nom) periodes.push({ nom, debut, fin });
      });
    }

    // Si c'est auto, on génère les périodes en mémoire pour l'affichage (mais on ne sauvegarde que les noms)
    if(gestion === 'auto'){
      periodes = typePeriode === 'semestre' 
        ? ['Semestre 1', 'Semestre 2'] 
        : ['Trimestre 1', 'Trimestre 2', 'Trimestre 3'];
    }

    // Vérifier doublon
    const dup = Storage.getAllIncludingArchived('annees').find(a=>a.libelle.toLowerCase()===libelle.toLowerCase() && a.id !== id);
    if(dup){ Notify.toast('Cette année existe déjà.', 'danger'); return; }

    // Si activée, désactiver les autres
    if(actif){
      Storage.getAllIncludingArchived('annees').forEach(a=>{
        if(a.active && a.id !== id){
          Storage.update('annees', a.id, {active:false});
        }
      });
    }

    const data = {
      libelle,
      typePeriode,
      gestionManuelle: gestion === 'manuelle',
      periodes,
      active: actif
    };

    if(id){
      Storage.update('annees', id, data);
      Notify.toast('Année modifiée.', 'success');
    } else {
      Storage.create('annees', {...data, archived:false});
      Notify.toast('Année créée.', 'success');
    }
    bootstrap.Modal.getInstance(document.getElementById('modalAnnee')).hide();
    this.refresh();
    this.updateHeaderBadge();
  },

  activer(id){
    const a = Storage.getAllIncludingArchived('annees').find(x=>x.id===id);
    if(!a) return;
    Storage.getAllIncludingArchived('annees').forEach(x=>{
      Storage.update('annees', x.id, {active: x.id === id});
    });
    Notify.toast('Année ' + a.libelle + ' activée. Toute l\'application utilise maintenant cette année.', 'success');
    this.refresh();
    this.updateHeaderBadge();
  },

  archiver(id){
    const a = Storage.getAllIncludingArchived('annees').find(x=>x.id===id);
    if(!a) return;
    if(a.active){
      Notify.toast('Impossible d\'archiver l\'année active. Activez d\'abord une autre année.', 'danger');
      return;
    }
    if(!confirm(`Archiver l'année ${a.libelle} ?\nLes données restent consultables via "Désarchiver".`)) return;
    Storage.update('annees', id, {archived: true, active: false});
    Notify.toast('Année archivée.', 'warning');
    this.refresh();
  },

  desarchiver(id){
    Storage.update('annees', id, {archived: false});
    Notify.toast('Année désarchivée.', 'success');
    this.refresh();
  },

  updateHeaderBadge(){
    const annee = Storage.getAllIncludingArchived('annees').find(a=>a.active);
    const badge = document.getElementById('anneeBadge');
    if(badge && annee) badge.textContent = 'Année ' + annee.libelle;
  },

  // ============================================================
  // RÉINSCRIPTION EN LOT
  // ============================================================
  openReinscription(){
    const annees = Storage.getAllIncludingArchived('annees').filter(a=>!a.archived);
    const anneeActive = annees.find(a=>a.active);
    const destinations = annees.filter(a=>a.id !== anneeActive?.id);

    if(!anneeActive){
      Notify.toast('Aucune année active.', 'danger');
      return;
    }
    if(!destinations.length){
      Notify.toast('Créez d\'abord une année de destination.', 'danger');
      return;
    }

    const eleves = Storage.getAll('eleves').filter(e=>e.anneeId === anneeActive.id);

    if(!eleves.length){
      document.getElementById('reinscriptionBody').innerHTML =
        `<div class="alert alert-warning">Aucun élève inscrit dans l'année active (${Utils.escapeHtml(anneeActive.libelle)}).</div>`;
      new bootstrap.Modal(document.getElementById('modalReinscription')).show();
      return;
    }

    const classesSrc = Storage.getAll('classes').filter(c=>c.anneeId===anneeActive.id);
    const classeDst = document.getElementById('reinscriptionDst')?.value;

    const nextNiveau = {
      'PS':'MS', 'MS':'GS', 'GS':'CI',
      'CI':'CP', 'CP':'CE1', 'CE1':'CE2', 'CE2':'CM1', 'CM1':'CM2', 'CM2':'6ᵉ',
      '6ᵉ':'5ᵉ', '5ᵉ':'4ᵉ', '4ᵉ':'3ᵉ', '3ᵉ':'2nde',
      '2nde':'1ère', '1ère':'Terminale', 'Terminale':'Diplômé'
    };

    let html = `
      <div class="alert alert-info small mb-3">
        <i class="bi bi-info-circle me-1"></i>
        Source : <strong>${Utils.escapeHtml(anneeActive.libelle)}</strong>
        (${eleves.length} élève(s)) →
        Destination :
        <select class="form-select form-select-sm d-inline-block" style="width:auto" id="destAnneeSelect">
          ${destinations.map(a=>`<option value="${a.id}">${Utils.escapeHtml(a.libelle)}</option>`).join('')}
        </select>
      </div>
      <p class="small text-muted">
        Pour chaque élève, choisissez la classe de destination en ${Utils.escapeHtml(destinations[0].libelle)}.
      </p>
      <div class="table-responsive">
        <table class="table table-sm align-middle">
          <thead class="table-light">
            <tr>
              <th>Élève</th>
              <th>Classe actuelle</th>
              <th>Nouvelle classe</th>
            </tr>
          </thead>
          <tbody>
    `;

    const classesDstAll = Storage.getAll('classes').filter(c=>c.anneeId === destinations[0].id);

    eleves.forEach(el=>{
      const clsActuelle = Storage.getById('classes', el.classeId);
      const niveauActuel = clsActuelle?.niveau || '';
      const niveauSuivant = nextNiveau[niveauActuel] || niveauActuel;

      const classesPossibles = classesDstAll.filter(c=>
        c.niveau === niveauSuivant || c.niveau === niveauActuel
      );

      html += `<tr data-eleve="${el.id}">
        <td><strong>${Utils.escapeHtml(el.prenom+' '+el.nom)}</strong><br><small class="text-muted">${Utils.escapeHtml(el.matricule)}</small></td>
        <td>${Utils.escapeHtml(clsActuelle?.nom||'—')}</td>
        <td>
          <select class="form-select form-select-sm dest-classe" data-eleve="${el.id}">
            <option value="">— Ignorer (non réinscrit) —</option>
            ${classesPossibles.map(c=>{
              const suggested = c.niveau === niveauSuivant;
              return `<option value="${c.id}" ${suggested?'selected':''}>${Utils.escapeHtml(c.nom)} ${suggested?'✓':''}</option>`;
            }).join('')}
          </select>
        </td>
      </tr>`;
    });

    html += `</tbody></table></div>`;
    document.getElementById('reinscriptionBody').innerHTML = html;
    new bootstrap.Modal(document.getElementById('modalReinscription')).show();
  },

  confirmReinscription(){
    const destAnneeId = document.getElementById('destAnneeSelect')?.value;
    if(!destAnneeId){ Notify.toast('Sélectionnez l\'année de destination.', 'danger'); return; }

    const anneeSource = Storage.getAllIncludingArchived('annees').find(a=>a.active);
    const anneeDst = Storage.getAllIncludingArchived('annees').find(a=>a.id === destAnneeId);
    if(!anneeDst){ Notify.toast('Année destination introuvable.', 'danger'); return; }

    const rows = document.querySelectorAll('#reinscriptionBody tr[data-eleve]');
    let count = 0;

    rows.forEach(row=>{
      const elvId = row.dataset.eleve;
      const sel = row.querySelector('.dest-classe');
      const newClasseId = sel.value;
      if(!newClasseId) return;

      const el = Storage.getById('eleves', elvId);
      if(!el) return;

      const existing = Storage.getAll('eleves').find(e=>
        e.matricule === el.matricule && e.anneeId === destAnneeId
      );
      if(existing) return; 

      const newEl = {...el, id: undefined, anneeId: destAnneeId, classeId: newClasseId, dateInscription: new Date().toISOString().slice(0,10)};
      delete newEl.id; delete newEl.createdAt; delete newEl.updatedAt;
      Storage.create('eleves', newEl);
      count++;
    });

    if(count === 0){
      Notify.toast('Aucun élève à réinscrire (aucune classe sélectionnée).', 'warning');
    } else {
      Notify.toast(`${count} élève(s) réinscrit(s) en ${anneeDst.libelle}.`, 'success');
    }
    bootstrap.Modal.getInstance(document.getElementById('modalReinscription')).hide();
    this.refresh();
  }
};
