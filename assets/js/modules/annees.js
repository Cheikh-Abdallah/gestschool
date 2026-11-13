/**
 * Module 10 : Années scolaires et périodes.
 * Gestion complète, avec ajout manuel des périodes.
 */
const Annees = {
  render(container){
    this.container = container;
    container.innerHTML = `
      <div class="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
        <div>
          <div class="page-title">Années académiques</div>
          <div class="page-sub">Gestion des années et des périodes (semestres/trimestres)</div>
        </div>
        <div class="d-flex gap-2">
          <button class="btn btn-primary btn-sm" id="btnAddAnnee">
            <i class="bi bi-plus-lg me-1"></i> Nouvelle année
          </button>
        </div>
      </div>

      <div class="card-panel">
        <h6><i class="bi bi-calendar-range"></i> Liste des années académiques</h6>
        <div class="table-responsive">
          <table class="table table-hover align-middle mb-0" id="tblAnnees">
            <thead>
              <tr>
                <th>Libellé</th>
                <th>Périodes</th>
                <th>Statut</th>
                <th class="text-end">Actions</th>
              </tr>
            </thead>
            <tbody id="tbodyAnnees"></tbody>
          </table>
        </div>
      </div>

      <!-- Modale d'ajout / modification -->
      <div class="modal fade" id="modalAnnee" tabindex="-1">
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content modal-an">
            <form id="formAnnee" novalidate>
              <div class="modal-header">
                <h6 class="modal-title" id="modalAnneeTitle">Nouvelle année académique</h6>
                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
              </div>
              <div class="modal-body">
                <input type="hidden" id="anId">
                <div class="row g-3">
                  <div class="col-12">
                    <label class="form-label">Libellé de l'année *</label>
                    <input class="form-control" id="anLibelle" required placeholder="2026-2027">
                    <div class="invalid-feedback">Libellé obligatoire.</div>
                  </div>
                  <div class="col-12">
                    <label class="form-label">Type de périodes *</label>
                    <select class="form-select" id="anType" required>
                      <option value="semestre">Semestres</option>
                      <option value="trimestre">Trimestres</option>
                    </select>
                  </div>
                  
                  <div class="col-12 mt-3">
                    <label class="form-label fw-semibold">Périodes de l'année</label>
                    <div id="listePeriodes"></div>
                    <button type="button" class="btn btn-sm btn-outline-primary mt-2" id="btnAddPeriode">
                      <i class="bi bi-plus"></i> Ajouter une période
                    </button>
                  </div>

                  <div class="col-12 mt-3">
                    <div class="form-check">
                      <input class="form-check-input" type="checkbox" id="anActive">
                      <label class="form-check-label small" for="anActive">
                        Définir comme année <strong>active</strong>
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
    `;

    this.bindEvents();
    this.refresh();
  },

  bindEvents(){
    document.getElementById('btnAddAnnee').onclick = ()=> this.openForm();
    document.getElementById('formAnnee').onsubmit = (e)=>{ e.preventDefault(); this.save(); };
    
    // Ajout d'une ligne de période
    document.getElementById('btnAddPeriode').onclick = ()=>{
      const html = `
        <div class="d-flex gap-2 mb-2 align-items-center" data-periode>
          <input type="text" class="form-control form-control-sm" placeholder="Ex: Semestre 1" data-nom required>
          <input type="date" class="form-control form-control-sm" data-debut title="Début">
          <input type="date" class="form-control form-control-sm" data-fin title="Fin">
          <button type="button" class="btn btn-sm btn-outline-danger" onclick="this.parentElement.remove()">
            <i class="bi bi-trash"></i>
          </button>
        </div>
      `;
      document.getElementById('listePeriodes').insertAdjacentHTML('beforeend', html);
    };
  },

  refresh(){
    const annees = Storage.getAllIncludingArchived('annees');
    const tbody = document.getElementById('tbodyAnnees');

    if(!annees.length){
      tbody.innerHTML = `<tr><td colspan="4" class="text-center text-muted py-4">Aucune année académique.</td></tr>`;
      return;
    }

    annees.sort((a,b)=>b.libelle.localeCompare(a.libelle));

    tbody.innerHTML = annees.map(a=>{
      const statusBadge = a.active
        ? '<span class="badge bg-success-subtle text-success"><i class="bi bi-check-circle me-1"></i>Active</span>'
        : a.archived
          ? '<span class="badge bg-secondary-subtle text-secondary">Archivée</span>'
          : '<span class="badge bg-warning-subtle text-warning">Inactive</span>';

      // Affichage des périodes
      let periodes = a.periodes || [];
      const periodesHtml = periodes.length
        ? periodes.map(p => `<span class="badge bg-light text-dark border me-1">${Utils.escapeHtml(p.nom || p)}</span>`).join('')
        : '<span class="text-muted small">Aucune période définie</span>';

      return `<tr class="${a.active?'row-active':''}">
        <td><strong>${Utils.escapeHtml(a.libelle)}</strong></td>
        <td>${periodesHtml}</td>
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
    const modal = new bootstrap.Modal(document.getElementById('modalAnnee'));
    const form = document.getElementById('formAnnee');
    form.classList.remove('was-validated');
    document.getElementById('listePeriodes').innerHTML = '';

    if(id){
      const a = Storage.getAllIncludingArchived('annees').find(x=>x.id===id);
      if(!a) return;
      document.getElementById('modalAnneeTitle').textContent = 'Modifier l\'année';
      document.getElementById('anId').value = a.id;
      document.getElementById('anLibelle').value = a.libelle;
      document.getElementById('anType').value = a.typePeriode || 'semestre';
      document.getElementById('anActive').checked = !!a.active;
      
      // Recharger les périodes existantes
      if(a.periodes && a.periodes.length){
        a.periodes.forEach(p => {
          const nom = typeof p === 'string' ? p : p.nom;
          const debut = p.debut || '';
          const fin = p.fin || '';
          
          const html = `
            <div class="d-flex gap-2 mb-2 align-items-center" data-periode>
              <input type="text" class="form-control form-control-sm" value="${Utils.escapeHtml(nom)}" data-nom required>
              <input type="date" class="form-control form-control-sm" value="${debut}" data-debut>
              <input type="date" class="form-control form-control-sm" value="${fin}" data-fin>
              <button type="button" class="btn btn-sm btn-outline-danger" onclick="this.parentElement.remove()">
                <i class="bi bi-trash"></i>
              </button>
            </div>
          `;
          document.getElementById('listePeriodes').insertAdjacentHTML('beforeend', html);
        });
      }
    } else {
      form.reset();
      document.getElementById('modalAnneeTitle').textContent = 'Nouvelle année académique';
      document.getElementById('anId').value = '';
      document.getElementById('anActive').checked = false;
      document.getElementById('anLibelle').value = '2026-2027';
      
      // Créer 2 périodes par défaut
      document.getElementById('btnAddPeriode').click();
      document.getElementById('btnAddPeriode').click();
      
      // Pré-remplir les noms
      const inputs = document.querySelectorAll('#listePeriodes [data-nom]');
      if(inputs[0]) inputs[0].value = 'Semestre 1';
      if(inputs[1]) inputs[1].value = 'Semestre 2';
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
    const actif = document.getElementById('anActive').checked;

    // Récupération manuelle des périodes
    const periodes = [];
    const rows = document.querySelectorAll('#listePeriodes [data-periode]');
    rows.forEach(row=>{
      const nom = row.querySelector('[data-nom]').value.trim();
      const debut = row.querySelector('[data-debut]').value;
      const fin = row.querySelector('[data-fin]').value;
      if(nom) periodes.push({ nom, debut, fin });
    });

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
      gestionManuelle: true,
      periodes: periodes,
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
    Notify.toast('Année ' + a.libelle + ' activée.', 'success');
    this.refresh();
    this.updateHeaderBadge();
  },

  archiver(id){
    const a = Storage.getAllIncludingArchived('annees').find(x=>x.id===id);
    if(!a) return;
    if(a.active){
      Notify.toast('Impossible d\'archiver l\'année active.', 'danger');
      return;
    }
    if(!confirm(`Archiver l'année ${a.libelle} ?`)) return;
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
  }
};
