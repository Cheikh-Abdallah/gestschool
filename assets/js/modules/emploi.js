/**
 * Module 11 : Emploi du temps.
 * Création de créneaux, détection de conflits,
 * vues par classe/enseignant, impression A4.
 */
const Emploi = {
  JOURS: ['Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi'],
  HEURES: ['08:00','09:00','10:00','11:00','12:00','13:00','14:00','15:00','16:00','17:00','18:00'],

  state: {
    vue: 'classe', // 'classe' | 'enseignant'
    cibleId: '',   // classeId ou enseignantId
    filterConflits: false
  },

  render(container){
    this.container = container;
    container.innerHTML = `
      <div class="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
        <div>
          <div class="page-title">Emploi du temps</div>
          <div class="page-sub">Créneaux, conflits et emplois hebdomadaires</div>
        </div>
        <div class="d-flex gap-2 flex-wrap">
          <button class="btn btn-outline-secondary btn-sm" id="btnPrintEDT">
            <i class="bi bi-printer me-1"></i> Imprimer
          </button>
          <button class="btn btn-primary btn-sm" id="btnAddCreneau">
            <i class="bi bi-plus-lg me-1"></i> Nouveau créneau
          </button>
        </div>
      </div>

      <div class="card-panel">
        <div class="row g-3 align-items-end mb-3">
          <div class="col-md-3">
            <label class="form-label small fw-semibold">Vue</label>
            <select class="form-select" id="edtVue">
              <option value="classe">Par classe</option>
              <option value="enseignant">Par enseignant</option>
            </select>
          </div>
          <div class="col-md-5">
            <label class="form-label small fw-semibold" id="edtCibleLabel">Classe</label>
            <select class="form-select" id="edtCible"></select>
          </div>
          <div class="col-md-4">
            <div class="form-check">
              <input class="form-check-input" type="checkbox" id="edtConflits">
              <label class="form-check-label small fw-semibold" for="edtConflits">
                Voir uniquement les créneaux en conflit
              </label>
            </div>
          </div>
        </div>

        <div id="edtApercu"></div>
      </div>

      <!-- Modale créneau -->
      <div class="modal fade" id="modalCreneau" tabindex="-1">
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content modal-edt">
            <form id="formCreneau" novalidate>
              <div class="modal-header">
                <h6 class="modal-title" id="modalCreneauTitle">Nouveau créneau</h6>
                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
              </div>
              <div class="modal-body">
                <input type="hidden" id="crId">
                <div class="row g-3">
                  <div class="col-md-6">
                    <label class="form-label">Classe *</label>
                    <select class="form-select" id="crClasse" required></select>
                    <div class="invalid-feedback">Classe obligatoire.</div>
                  </div>
                  <div class="col-md-6">
                    <label class="form-label">Matière *</label>
                    <select class="form-select" id="crMatiere" required></select>
                    <div class="invalid-feedback">Matière obligatoire.</div>
                  </div>
                  <div class="col-md-6">
                    <label class="form-label">Enseignant *</label>
                    <select class="form-select" id="crEnseignant" required></select>
                    <div class="invalid-feedback">Enseignant obligatoire.</div>
                  </div>
                  <div class="col-md-6">
                    <label class="form-label">Salle</label>
                    <input class="form-control" id="crSalle" placeholder="Ex. Salle 12">
                  </div>
                  <div class="col-md-12">
                    <label class="form-label">Jour *</label>
                    <select class="form-select" id="crJour" required>
                      ${this.JOURS.map(j=>`<option value="${j}">${j}</option>`).join('')}
                    </select>
                  </div>
                  <div class="col-md-6">
                    <label class="form-label">Heure début *</label>
                    <input type="time" class="form-control" id="crDebut" required>
                    <div class="invalid-feedback">Heure de début obligatoire.</div>
                  </div>
                  <div class="col-md-6">
                    <label class="form-label">Heure fin *</label>
                    <input type="time" class="form-control" id="crFin" required>
                    <div class="invalid-feedback">Heure de fin obligatoire.</div>
                  </div>
                  <div class="col-12">
                    <div id="conflitAlert" class="d-none"></div>
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
    this.populateSelects();
    this.refresh();
  },

  bindEvents(){
    document.getElementById('edtVue').onchange = ()=>{
      this.state.vue = document.getElementById('edtVue').value;
      this.populateCibles();
      this.state.cibleId = '';
      this.refresh();
    };
    document.getElementById('edtCible').onchange = ()=>{
      this.state.cibleId = document.getElementById('edtCible').value;
      this.refresh();
    };
    document.getElementById('edtConflits').onchange = ()=>{
      this.state.filterConflits = document.getElementById('edtConflits').checked;
      this.refresh();
    };
    document.getElementById('btnAddCreneau').onclick = ()=> this.openCreneauForm();
    document.getElementById('btnPrintEDT').onclick = ()=> window.print();
    document.getElementById('formCreneau').onsubmit = (e)=>{ e.preventDefault(); this.saveCreneau(); };

    // Re-populer matières et enseignant selon classe
    document.getElementById('crClasse').onchange = ()=> this.populateMatiereEns();
    document.getElementById('crMatiere').onchange = ()=>{
      // Auto-sélectionner l'enseignant de la matière
      const matId = document.getElementById('crMatiere').value;
      const mat = Storage.getById('matieres', matId);
      if(mat && mat.enseignantId){
        document.getElementById('crEnseignant').value = mat.enseignantId;
      }
    };
  },

  populateSelects(){
    // Vue
    this.populateCibles();

    // Classe
    const classes = Storage.getAll('classes');
    document.getElementById('crClasse').innerHTML =
      '<option value="">— Choisir —</option>' +
      classes.map(c=>`<option value="${c.id}">${Utils.escapeHtml(c.nom)}</option>`).join('');

    // Enseignant
    const ens = Storage.getAll('enseignants');
    document.getElementById('crEnseignant').innerHTML =
      '<option value="">— Choisir —</option>' +
      ens.map(e=>`<option value="${e.id}">${Utils.escapeHtml(e.prenom+' '+e.nom)}</option>`).join('');

    // Matière (sera filtrée ensuite)
    document.getElementById('crMatiere').innerHTML = '<option value="">— Choisir une classe d\'abord —</option>';
  },

  populateCibles(){
    const sel = document.getElementById('edtCible');
    const label = document.getElementById('edtCibleLabel');
    if(this.state.vue === 'classe'){
      label.textContent = 'Classe';
      const classes = Storage.getAll('classes');
      sel.innerHTML = '<option value="">— Choisir une classe —</option>' +
        classes.map(c=>`<option value="${c.id}" ${this.state.cibleId===c.id?'selected':''}>${Utils.escapeHtml(c.nom)}</option>`).join('');
    } else {
      label.textContent = 'Enseignant';
      const ens = Storage.getAll('enseignants');
      sel.innerHTML = '<option value="">— Choisir un enseignant —</option>' +
        ens.map(e=>`<option value="${e.id}" ${this.state.cibleId===e.id?'selected':''}>${Utils.escapeHtml(e.prenom+' '+e.nom)}</option>`).join('');
    }
  },

  populateMatiereEns(){
    const classeId = document.getElementById('crClasse').value;
    const selMat = document.getElementById('crMatiere');
    if(!classeId){
      selMat.innerHTML = '<option value="">— Choisir une classe d\'abord —</option>';
      return;
    }
    const matieres = Storage.getAll('matieres').filter(m=>(m.classeIds||[]).includes(classeId));
    selMat.innerHTML = '<option value="">— Choisir —</option>' +
      matieres.map(m=>`<option value="${m.id}">${Utils.escapeHtml(m.nom)}</option>`).join('');
  },

  // ============================================================
  // Détection de conflits
  // ============================================================
  checkConflits(creneau, excludeId=null){
    const {jour, heureDebut, heureFin, classeId, enseignantId, salle} = creneau;
    if(!jour || !heureDebut || !heureFin) return [];

    const toMin = t => { const [h,m] = t.split(':').map(Number); return h*60 + m; };
    const startA = toMin(heureDebut);
    const endA   = toMin(heureFin);
    if(endA <= startA) return [{type:'horaire', message:'L\'heure de fin doit être après l\'heure de début.'}];

    const all = Storage.getAll('emploiTemps').filter(c => c.id !== excludeId);
    const conflits = [];

    all.forEach(other=>{
      if(other.jour !== jour) return;
      const startB = toMin(other.heureDebut);
      const endB   = toMin(other.heureFin);
      // Chevauchement
      const chevauche = startA < endB && endA > startB;
      if(!chevauche) return;

      // Même classe ?
      if(other.classeId === classeId){
        const cls = Storage.getById('classes', classeId);
        conflits.push({
          type: 'classe',
          message: `La classe ${cls?.nom||''} a déjà un cours le ${jour} de ${other.heureDebut} à ${other.heureFin}.`
        });
      }
      // Même enseignant ?
      if(other.enseignantId === enseignantId){
        const ens = Storage.getById('enseignants', enseignantId);
        conflits.push({
          type: 'enseignant',
          message: `${ens?ens.prenom+' '+ens.nom:'L\'enseignant'} a déjà un cours le ${jour} de ${other.heureDebut} à ${other.heureFin}.`
        });
      }
      // Même salle ?
      if(salle && other.salle && salle.trim().toLowerCase() === other.salle.trim().toLowerCase()){
        conflits.push({
          type: 'salle',
          message: `La salle ${salle} est déjà occupée le ${jour} de ${other.heureDebut} à ${other.heureFin}.`
        });
      }
    });

    return conflits;
  },

  // ============================================================
  // Rendu de la grille
  // ============================================================
  refresh(){
    const content = document.getElementById('edtApercu');
    if(!this.state.cibleId){
      content.innerHTML = `<div class="empty-module"><i class="bi bi-calendar3"></i><p>Sélectionnez une ${this.state.vue==='classe'?'classe':'un enseignant'} pour afficher l'emploi du temps.</p></div>`;
      return;
    }

    const creneaux = Storage.getAll('emploiTemps').filter(c=>
      this.state.vue === 'classe' ? c.classeId === this.state.cibleId : c.enseignantId === this.state.cibleId
    );

    // Détection des conflits pour marquage
    const conflitsSet = new Set();
    creneaux.forEach(c=>{
      const conflits = this.checkConflits(c, c.id);
      if(conflits.length) conflitsSet.add(c.id);
    });

    const filtered = this.state.filterConflits ? creneaux.filter(c=>conflitsSet.has(c.id)) : creneaux;

    // Extraire toutes les heures utilisées
    const heuresUtilisees = [...new Set(filtered.map(c=>c.heureDebut+'-'+c.heureFin))]
      .sort((a,b)=>{
        const [ha] = a.split('-'); const [hb] = b.split('-');
        return ha.localeCompare(hb);
      });

    // Titre
    let titre = '';
    if(this.state.vue === 'classe'){
      const cls = Storage.getById('classes', this.state.cibleId);
      titre = `Classe ${cls?.nom||''}`;
    } else {
      const e = Storage.getById('enseignants', this.state.cibleId);
      titre = `${e?.prenom||''} ${e?.nom||''}`;
    }

    if(!filtered.length){
      content.innerHTML = `
        <div class="edt-header">
          <h6 class="mb-0"><i class="bi bi-calendar-week me-1"></i> ${Utils.escapeHtml(titre)}</h6>
          <small class="text-muted">0 créneau${this.state.filterConflits?' en conflit':''}</small>
        </div>
        <div class="empty-module">
          <i class="bi bi-calendar-x"></i>
          <p>${this.state.filterConflits?'Aucun conflit détecté. 🎉':'Aucun créneau enregistré.'}</p>
        </div>`;
      return;
    }

    // Grille
    let html = `
      <div class="edt-header">
        <h6 class="mb-0"><i class="bi bi-calendar-week me-1"></i> ${Utils.escapeHtml(titre)}</h6>
        <div class="small text-muted">
          ${filtered.length} créneau(x)
          ${conflitsSet.size ? `<span class="badge bg-danger-subtle text-danger ms-2"><i class="bi bi-exclamation-triangle me-1"></i>${conflitsSet.size} conflit(s)</span>` : ''}
        </div>
      </div>
      <div class="table-responsive">
        <table class="table table-bordered edt-grid">
          <thead>
            <tr>
              <th style="width:100px">Horaire</th>
              ${this.JOURS.map(j=>`<th class="text-center">${j}</th>`).join('')}
            </tr>
          </thead>
          <tbody>
    `;

    heuresUtilisees.forEach(hRange=>{
      html += `<tr><td class="fw-semibold small text-center">${hRange.replace('-',' – ')}</td>`;
      this.JOURS.forEach(jour=>{
        const cell = filtered.find(c=>c.jour===jour && c.heureDebut+'-'+c.heureFin===hRange);
        if(cell){
          const mat = Storage.getById('matieres', cell.matiereId);
          const cls = Storage.getById('classes', cell.classeId);
          const ens = Storage.getById('enseignants', cell.enseignantId);
          const isConflit = conflitsSet.has(cell.id);
          html += `<td class="edt-cell ${isConflit?'edt-conflit':''}" data-creneau="${cell.id}">
            <div class="edt-mat">${Utils.escapeHtml(mat?.nom||'—')}</div>
            <div class="edt-meta">
              ${this.state.vue==='classe'
                ? `<i class="bi bi-person"></i> ${Utils.escapeHtml(ens?.prenom||'')} ${Utils.escapeHtml(ens?.nom||'')}`
                : `<i class="bi bi-building"></i> ${Utils.escapeHtml(cls?.nom||'')}`}
            </div>
            ${cell.salle?`<div class="edt-meta small text-muted"><i class="bi bi-door-open"></i> ${Utils.escapeHtml(cell.salle)}</div>`:''}
            ${isConflit?`<div class="edt-meta text-danger fw-bold"><i class="bi bi-exclamation-triangle"></i> Conflit</div>`:''}
            <div class="edt-actions">
              <button class="edt-btn" data-act="edit" data-id="${cell.id}" title="Modifier"><i class="bi bi-pencil"></i></button>
              <button class="edt-btn text-danger" data-act="del" data-id="${cell.id}" title="Supprimer"><i class="bi bi-trash"></i></button>
            </div>
          </td>`;
        } else {
          html += `<td class="edt-empty"></td>`;
        }
      });
      html += `</tr>`;
    });

    html += `</tbody></table></div>`;
    content.innerHTML = html;

    // Actions
    content.querySelectorAll('[data-act]').forEach(btn=>{
      btn.onclick = (e)=>{
        e.stopPropagation();
        const id = btn.dataset.id;
        const act = btn.dataset.act;
        if(act==='edit') this.openCreneauForm(id);
        else if(act==='del') this.deleteCreneau(id);
      };
    });
  },

  // ============================================================
  // Formulaire
  // ============================================================
  openCreneauForm(id=null){
    const modal = new bootstrap.Modal(document.getElementById('modalCreneau'));
    const form = document.getElementById('formCreneau');
    form.classList.remove('was-validated');
    document.getElementById('conflitAlert').classList.add('d-none');

    if(id){
      const c = Storage.getById('emploiTemps', id);
      if(!c) return;
      document.getElementById('modalCreneauTitle').textContent = 'Modifier créneau';
      document.getElementById('crId').value = c.id;
      document.getElementById('crClasse').value = c.classeId;
      this.populateMatiereEns();
      document.getElementById('crMatiere').value = c.matiereId;
      document.getElementById('crEnseignant').value = c.enseignantId;
      document.getElementById('crSalle').value = c.salle || '';
      document.getElementById('crJour').value = c.jour;
      document.getElementById('crDebut').value = c.heureDebut;
      document.getElementById('crFin').value = c.heureFin;
    } else {
      form.reset();
      document.getElementById('modalCreneauTitle').textContent = 'Nouveau créneau';
      document.getElementById('crId').value = '';
      document.getElementById('crMatiere').innerHTML = '<option value="">— Choisir une classe d\'abord —</option>';
      // Pré-remplir avec la classe/enseignant courant
      if(this.state.vue === 'classe' && this.state.cibleId){
        document.getElementById('crClasse').value = this.state.cibleId;
        this.populateMatiereEns();
      } else if(this.state.vue === 'enseignant' && this.state.cibleId){
        document.getElementById('crEnseignant').value = this.state.cibleId;
      }
      document.getElementById('crDebut').value = '08:00';
      document.getElementById('crFin').value = '10:00';
    }
    modal.show();
  },

  saveCreneau(){
    const form = document.getElementById('formCreneau');
    form.classList.add('was-validated');
    if(!form.checkValidity()) return;

    const id = document.getElementById('crId').value;
    const anneeActive = Storage.getAllIncludingArchived('annees').find(a=>a.active);
    const data = {
      classeId:     document.getElementById('crClasse').value,
      matiereId:    document.getElementById('crMatiere').value,
      enseignantId: document.getElementById('crEnseignant').value,
      salle:        document.getElementById('crSalle').value.trim(),
      jour:         document.getElementById('crJour').value,
      heureDebut:   document.getElementById('crDebut').value,
      heureFin:     document.getElementById('crFin').value,
      anneeId:      anneeActive?.id
    };

    // Vérifier conflits
    const conflits = this.checkConflits(data, id || null);
    if(conflits.length){
      const alertEl = document.getElementById('conflitAlert');
      alertEl.className = 'alert alert-danger small mb-0';
      alertEl.innerHTML = `<strong><i class="bi bi-exclamation-triangle me-1"></i>Conflit détecté :</strong><ul class="mb-0 mt-1">${conflits.map(c=>`<li>${Utils.escapeHtml(c.message)}</li>`).join('')}</ul>`;
      alertEl.classList.remove('d-none');
      return;
    }

    if(id){
      Storage.update('emploiTemps', id, data);
      Notify.toast('Créneau modifié.', 'success');
    } else {
      Storage.create('emploiTemps', data);
      Notify.toast('Créneau ajouté.', 'success');
    }
    bootstrap.Modal.getInstance(document.getElementById('modalCreneau')).hide();
    this.refresh();
  },

  deleteCreneau(id){
    if(!confirm('Supprimer ce créneau ?')) return;
    Storage.remove('emploiTemps', id, false);
    Notify.toast('Créneau supprimé.', 'warning');
    this.refresh();
  }
};