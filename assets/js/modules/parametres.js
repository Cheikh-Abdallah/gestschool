/**
 * Module 13 : Paramètres de l'établissement.
 * Configuration générale, logo, seuils, mentions,
 * sauvegarde/restauration de la base.
 * V2 : ajout du sélecteur typeEtablissement (secondaire / supérieur).
 */
const Parametres = {
  state: {
    tab: 'general' // 'general' | 'documents' | 'donnees'
  },

  render(container){
    if(!Auth.canAccessCurrent('parametres')){
      container.innerHTML = `<div class="empty-module"><i class="bi bi-shield-lock"></i><h5>Accès refusé</h5></div>`;
      return;
    }

    this.container = container;

    container.innerHTML = `
      <div class="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
        <div>
          <div class="page-title">Paramètres</div>
          <div class="page-sub">Configuration de l'établissement et des documents</div>
        </div>
      </div>

      <div class="card-panel">
        <ul class="nav nav-tabs nav-tabs-custom mb-3">
          <li class="nav-item"><a class="nav-link active" data-tab="general">Général</a></li>
          <li class="nav-item"><a class="nav-link" data-tab="documents">Documents</a></li>
          <li class="nav-item"><a class="nav-link" data-tab="donnees">Données</a></li>
        </ul>
        <div id="paramTabContent"></div>
      </div>
    `;

    document.querySelectorAll('.nav-tabs-custom .nav-link').forEach(l=>{
      l.onclick = (e)=>{
        e.preventDefault();
        this.state.tab = l.dataset.tab;
        document.querySelectorAll('.nav-tabs-custom .nav-link').forEach(x=>x.classList.toggle('active', x.dataset.tab === l.dataset.tab));
        this.renderTab();
      };
    });

    this.renderTab();
  },

  renderTab(){
    const content = document.getElementById('paramTabContent');
    if(this.state.tab === 'general') this.renderGeneral(content);
    else if(this.state.tab === 'documents') this.renderDocuments(content);
    else if(this.state.tab === 'donnees') this.renderDonnees(content);
  },

  // ============================================================
  // ONGLET GÉNÉRAL
  // ============================================================
  renderGeneral(container){
    const p = Storage.read().parametres || {};
    container.innerHTML = `
      <form id="formGeneral" novalidate>

        <div class="alert alert-info small mb-4">
          <i class="bi bi-info-circle me-1"></i>
          <strong>Mode d'établissement :</strong> choisissez le type d'enseignement.
          Les libellés s'adaptent automatiquement (Élève ↔ Étudiant, Classe ↔ Groupe…).
        </div>

        <div class="mb-4">
          <label class="form-label small fw-semibold">Type d'établissement</label>
          <div class="d-flex gap-3 flex-wrap">
            <div class="form-check">
              <input class="form-check-input" type="radio" name="typeEtab" id="typeSecondaire" value="secondaire" ${p.typeEtablissement !== 'superieur' ? 'checked' : ''}>
              <label class="form-check-label" for="typeSecondaire">
                <i class="bi bi-building me-1"></i> Enseignement secondaire
              </label>
            </div>
            <div class="form-check">
              <input class="form-check-input" type="radio" name="typeEtab" id="typeSuperieur" value="superieur" ${p.typeEtablissement === 'superieur' ? 'checked' : ''}>
              <label class="form-check-label" for="typeSuperieur">
                <i class="bi bi-bank me-1"></i> Enseignement supérieur
                <span class="badge bg-warning-subtle text-warning ms-1">Nouveau</span>
              </label>
            </div>
          </div>
        </div>

        <hr class="mb-4">

        <div class="row g-3">
          <div class="col-md-8">
            <h6 class="text-primary mb-3"><i class="bi bi-building me-1"></i> Informations de l'établissement</h6>
            <div class="row g-3">
              <div class="col-md-8">
                <label class="form-label">Nom de l'établissement *</label>
                <input class="form-control" id="pNom" required value="${Utils.escapeHtml(p.etablissement||'')}">
                <div class="invalid-feedback">Nom obligatoire.</div>
              </div>
              <div class="col-md-4">
                <label class="form-label">Devise *</label>
                <input class="form-control" id="pDevise" required value="${Utils.escapeHtml(p.devise||'FCFA')}">
                <div class="invalid-feedback">Devise obligatoire.</div>
              </div>
              <div class="col-12">
                <label class="form-label">Adresse</label>
                <input class="form-control" id="pAdresse" value="${Utils.escapeHtml(p.adresse||'')}">
              </div>
              <div class="col-md-6">
                <label class="form-label">Téléphone</label>
                <input class="form-control" id="pTelephone" value="${Utils.escapeHtml(p.telephone||'')}">
              </div>
              <div class="col-md-6">
                <label class="form-label">Email</label>
                <input type="email" class="form-control" id="pEmail" value="${Utils.escapeHtml(p.email||'')}">
                <div class="invalid-feedback">Email invalide.</div>
              </div>
              <div class="col-md-6">
                <label class="form-label">Directeur / Responsable</label>
                <input class="form-control" id="pDirecteur" value="${Utils.escapeHtml(p.directeur||'')}">
              </div>
              <div class="col-md-6">
                <label class="form-label">Slogan / Devise de l'école</label>
                <input class="form-control" id="pSlogan" value="${Utils.escapeHtml(p.slogan||'')}" placeholder="Excellence et discipline">
              </div>
            </div>
          </div>
          <div class="col-md-4">
            <h6 class="text-primary mb-3"><i class="bi bi-image me-1"></i> Logo</h6>
            <div class="logo-uploader">
              <div class="logo-preview" id="logoPreview">
                ${p.logo ? `<img src="${p.logo}" alt="Logo">` : `<i class="bi bi-image"></i>`}
              </div>
              <input type="file" class="d-none" id="logoFile" accept="image/*">
              <div class="mt-2 d-flex gap-2">
                <button type="button" class="btn btn-sm btn-outline-primary" id="btnUploadLogo">
                  <i class="bi bi-upload me-1"></i> Changer
                </button>
                ${p.logo?`<button type="button" class="btn btn-sm btn-outline-danger" id="btnRemoveLogo">
                  <i class="bi bi-trash me-1"></i> Supprimer
                </button>`:''}
              </div>
              <small class="text-muted d-block mt-2">PNG, JPG — max 200 Ko recommandé.</small>
            </div>
          </div>
        </div>

        <hr class="my-4">

        <h6 class="text-primary mb-3"><i class="bi bi-trophy me-1"></i> Seuils et mentions</h6>
        <div class="row g-3">
          <div class="col-md-3">
            <label class="form-label">Seuil de réussite</label>
            <input type="number" class="form-control" id="pSeuilReussite" min="0" max="20" step="0.5" value="${p.seuilReussite ?? 10}">
            <small class="text-muted">Moyenne minimale (défaut 10/20).</small>
          </div>
          <div class="col-md-3">
            <label class="form-label">Seuil "Passable"</label>
            <input type="number" class="form-control" id="pSeuilPassable" min="0" max="20" step="0.5" value="${p.seuilPassable ?? 10}">
          </div>
          <div class="col-md-3">
            <label class="form-label">Seuil "Bien"</label>
            <input type="number" class="form-control" id="pSeuilBien" min="0" max="20" step="0.5" value="${p.seuilBien ?? 12}">
          </div>
          <div class="col-md-3">
            <label class="form-label">Seuil "Très bien"</label>
            <input type="number" class="form-control" id="pSeuilTresBien" min="0" max="20" step="0.5" value="${p.seuilTresBien ?? 14}">
          </div>
          <div class="col-md-3">
            <label class="form-label">Seuil "Excellent"</label>
            <input type="number" class="form-control" id="pSeuilExcellent" min="0" max="20" step="0.5" value="${p.seuilExcellent ?? 16}">
          </div>
        </div>

        <div class="mt-4 d-flex gap-2">
          <button type="submit" class="btn btn-primary">
            <i class="bi bi-check2 me-1"></i> Enregistrer
          </button>
          <button type="button" class="btn btn-light" id="btnResetGeneral">
            <i class="bi bi-arrow-counterclockwise me-1"></i> Annuler
          </button>
        </div>
      </form>
    `;

    // Events
    document.getElementById('btnUploadLogo').onclick = ()=> document.getElementById('logoFile').click();
    document.getElementById('logoFile').onchange = (e)=> this.handleLogoUpload(e);
    const removeBtn = document.getElementById('btnRemoveLogo');
    if(removeBtn) removeBtn.onclick = ()=> this.removeLogo();
    document.getElementById('formGeneral').onsubmit = (e)=>{ e.preventDefault(); this.saveGeneral(); };
    document.getElementById('btnResetGeneral').onclick = ()=> this.renderTab();
  },

  handleLogoUpload(e){
    const file = e.target.files[0];
    if(!file) return;
    if(file.size > 500 * 1024){
      Notify.toast('Image trop volumineuse (max 500 Ko).', 'danger');
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev)=>{
      const dataUrl = ev.target.result;
      const db = Storage.read();
      if(!db.parametres) db.parametres = {};
      db.parametres.logo = dataUrl;
      Storage.write(db);
      Auth.log('param_logo', 'Logo mis à jour');
      Notify.toast('Logo mis à jour.', 'success');
      this.renderTab();
    };
    reader.readAsDataURL(file);
  },

  removeLogo(){
    if(!confirm('Supprimer le logo ?')) return;
    const db = Storage.read();
    if(db.parametres) db.parametres.logo = null;
    Storage.write(db);
    Auth.log('param_logo', 'Logo supprimé');
    Notify.toast('Logo supprimé.', 'warning');
    this.renderTab();
  },

  saveGeneral(){
    const form = document.getElementById('formGeneral');
    form.classList.add('was-validated');
    if(!form.checkValidity()) return;

    const db = Storage.read();
    const p = db.parametres || {};
    const oldType = p.typeEtablissement || 'secondaire';

    // --- Récupération des champs ---
    const typeEtab = document.querySelector('input[name="typeEtab"]:checked')?.value || 'secondaire';

    p.typeEtablissement = typeEtab;
    p.etablissement = document.getElementById('pNom').value.trim();
    p.devise       = document.getElementById('pDevise').value.trim();
    p.adresse      = document.getElementById('pAdresse').value.trim();
    p.telephone    = document.getElementById('pTelephone').value.trim();
    p.email        = document.getElementById('pEmail').value.trim();
    p.directeur    = document.getElementById('pDirecteur').value.trim();
    p.slogan       = document.getElementById('pSlogan').value.trim();

    p.seuilReussite   = parseFloat(document.getElementById('pSeuilReussite').value);
    p.seuilPassable   = parseFloat(document.getElementById('pSeuilPassable').value);
    p.seuilBien       = parseFloat(document.getElementById('pSeuilBien').value);
    p.seuilTresBien   = parseFloat(document.getElementById('pSeuilTresBien').value);
    p.seuilExcellent  = parseFloat(document.getElementById('pSeuilExcellent').value);

    // --- Sauvegarde (AVANT toute confirmation ou reload) ---
    db.parametres = p;
    Storage.write(db);

    // --- Logs ---
    Auth.log('param_update', 'Paramètres généraux mis à jour');
    const typeChanged = oldType !== typeEtab;
    if(typeChanged){
      Auth.log('param_type_change', 'Type d\'établissement : ' + oldType + ' → ' + typeEtab);
    }

    // --- Notification ---
    Notify.toast('Paramètres enregistrés.', 'success');

    // --- Proposer le rechargement si le type a changé ---
    if(typeChanged){
      const label = typeEtab === 'superieur' ? 'supérieur' : 'secondaire';
      setTimeout(()=>{
        if(confirm(
          'Le mode d\'établissement est maintenant « ' + label + ' ».\n\n' +
          'Recharger maintenant pour appliquer les nouveaux libellés (Étudiant, Groupe, UE…) ?'
        )){
          location.reload();
        }
      }, 400);
    }
  },

  // ============================================================
  // ONGLET DOCUMENTS
  // ============================================================
  renderDocuments(container){
    const p = Storage.read().parametres || {};
    container.innerHTML = `
      <form id="formDocs" novalidate>
        <p class="small text-muted">Ces informations apparaissent sur les documents imprimés (bulletins, reçus, fiches, rapports).</p>

        <h6 class="text-primary mb-3 mt-3"><i class="bi bi-file-earmark-text me-1"></i> En-tête des documents</h6>
        <div class="row g-3">
          <div class="col-md-6">
            <label class="form-label">Ligne 1 (nom officiel)</label>
            <input class="form-control" id="dLigne1" value="${Utils.escapeHtml(p.docLigne1 || p.etablissement || '')}" placeholder="RÉPUBLIQUE DU SÉNÉGAL">
          </div>
          <div class="col-md-6">
            <label class="form-label">Ligne 2 (ministère)</label>
            <input class="form-control" id="dLigne2" value="${Utils.escapeHtml(p.docLigne2 || '')}" placeholder="MINISTÈRE DE L'ÉDUCATION NATIONALE">
          </div>
          <div class="col-md-6">
            <label class="form-label">Ligne 3 (inspection / académie)</label>
            <input class="form-control" id="dLigne3" value="${Utils.escapeHtml(p.docLigne3 || '')}" placeholder="INSPECTION D'ACADÉMIE DE DAKAR">
          </div>
          <div class="col-md-6">
            <label class="form-label">Mention légale / devise</label>
            <input class="form-control" id="dMention" value="${Utils.escapeHtml(p.docMention || '')}" placeholder="Un Peuple - Un But - Une Foi">
          </div>
        </div>

        <h6 class="text-primary mb-3 mt-4"><i class="bi bi-pen me-1"></i> Signatures officielles</h6>
        <div class="row g-3">
          <div class="col-md-4">
            <label class="form-label">Le Directeur</label>
            <input class="form-control" id="dSignDirecteur" value="${Utils.escapeHtml(p.signDirecteur || p.directeur || '')}">
          </div>
          <div class="col-md-4">
            <label class="form-label">Le Censeur / Proviseur</label>
            <input class="form-control" id="dSignCenseur" value="${Utils.escapeHtml(p.signCenseur || '')}">
          </div>
          <div class="col-md-4">
            <label class="form-label">Le Surveillant Général</label>
            <input class="form-control" id="dSignSurveillant" value="${Utils.escapeHtml(p.signSurveillant || '')}">
          </div>
          <div class="col-md-4">
            <label class="form-label">Le Comptable / Intendant</label>
            <input class="form-control" id="dSignComptable" value="${Utils.escapeHtml(p.signComptable || '')}">
          </div>
          <div class="col-md-4">
            <label class="form-label">Le Professeur principal / Responsable péda.</label>
            <input class="form-control" id="dSignProf" value="${Utils.escapeHtml(p.signProf || '')}" placeholder="(vide = prof du bulletin)">
          </div>
          <div class="col-md-4">
            <label class="form-label">Cachet (texte)</label>
            <input class="form-control" id="dCachet" value="${Utils.escapeHtml(p.cachet || '')}" placeholder="CACHET OFFICIEL">
          </div>
        </div>

        <h6 class="text-primary mb-3 mt-4"><i class="bi bi-card-text me-1"></i> Pied de page</h6>
        <div class="row g-3">
          <div class="col-12">
            <label class="form-label">Texte du pied de page</label>
            <textarea class="form-control" id="dFooter" rows="2" placeholder="Établissement public d'enseignement...">${Utils.escapeHtml(p.footer || '')}</textarea>
          </div>
        </div>

        <div class="mt-4 d-flex gap-2">
          <button type="submit" class="btn btn-primary">
            <i class="bi bi-check2 me-1"></i> Enregistrer
          </button>
          <button type="button" class="btn btn-light" id="btnResetDocs">
            <i class="bi bi-arrow-counterclockwise me-1"></i> Annuler
          </button>
        </div>
      </form>
    `;

    document.getElementById('formDocs').onsubmit = (e)=>{ e.preventDefault(); this.saveDocs(); };
    document.getElementById('btnResetDocs').onclick = ()=> this.renderTab();
  },

  saveDocs(){
    const db = Storage.read();
    const p = db.parametres || {};
    p.docLigne1 = document.getElementById('dLigne1').value.trim();
    p.docLigne2 = document.getElementById('dLigne2').value.trim();
    p.docLigne3 = document.getElementById('dLigne3').value.trim();
    p.docMention = document.getElementById('dMention').value.trim();
    p.signDirecteur = document.getElementById('dSignDirecteur').value.trim();
    p.signCenseur = document.getElementById('dSignCenseur').value.trim();
    p.signSurveillant = document.getElementById('dSignSurveillant').value.trim();
    p.signComptable = document.getElementById('dSignComptable').value.trim();
    p.signProf = document.getElementById('dSignProf').value.trim();
    p.cachet = document.getElementById('dCachet').value.trim();
    p.footer = document.getElementById('dFooter').value.trim();

    db.parametres = p;
    Storage.write(db);
    Auth.log('param_docs', 'Paramètres documents mis à jour');
    Notify.toast('Documents enregistrés.', 'success');
  },

  // ============================================================
  // ONGLET DONNÉES
  // ============================================================
  renderDonnees(container){
    const db = Storage.read() || {};
    const stats = {
      eleves: (db.eleves||[]).length,
      enseignants: (db.enseignants||[]).length,
      classes: (db.classes||[]).length,
      paiements: (db.paiements||[]).length,
      annees: (db.annees||[]).length,
      logs: (db.logs||[]).length
    };

    container.innerHTML = `
      <div class="row g-3">
        <div class="col-md-6">
          <div class="data-card">
            <h6><i class="bi bi-cloud-download me-1 text-primary"></i> Exporter la base</h6>
            <p class="small text-muted">Télécharge un fichier JSON contenant toutes les données (élèves, notes, paiements, paramètres…).</p>
            <div class="small mb-3">
              <div><strong>${stats.eleves}</strong> élèves · <strong>${stats.enseignants}</strong> enseignants · <strong>${stats.classes}</strong> classes</div>
              <div><strong>${stats.paiements}</strong> paiements · <strong>${stats.annees}</strong> années · <strong>${stats.logs}</strong> logs</div>
            </div>
            <button class="btn btn-primary btn-sm" id="btnExportDb">
              <i class="bi bi-download me-1"></i> Exporter (JSON)
            </button>
          </div>
        </div>

        <div class="col-md-6">
          <div class="data-card">
            <h6><i class="bi bi-cloud-upload me-1 text-success"></i> Importer une base</h6>
            <p class="small text-muted">Restaure une sauvegarde précédemment exportée. <strong class="text-danger">Écrase toutes les données actuelles.</strong></p>
            <input type="file" class="form-control form-control-sm mb-2" id="importFile" accept="application/json">
            <button class="btn btn-success btn-sm" id="btnImportDb" disabled>
              <i class="bi bi-upload me-1"></i> Restaurer
            </button>
          </div>
        </div>

        <div class="col-md-6">
          <div class="data-card danger">
            <h6><i class="bi bi-arrow-repeat me-1 text-warning"></i> Réinitialiser avec les données de démo</h6>
            <p class="small text-muted">Supprime toutes les données actuelles et recharge le jeu de démonstration initial (245 élèves, notes, paiements…).</p>
            <button class="btn btn-warning btn-sm" id="btnResetDemo">
              <i class="bi bi-arrow-repeat me-1"></i> Réinitialiser la démo
            </button>
          </div>
        </div>

        <div class="col-md-6">
          <div class="data-card danger">
            <h6><i class="bi bi-trash me-1 text-danger"></i> Vider complètement la base</h6>
            <p class="small text-muted">Supprime <strong>toutes les données</strong> et force la déconnexion. Irréversible.</p>
            <button class="btn btn-danger btn-sm" id="btnClearDb">
              <i class="bi bi-trash me-1"></i> Tout supprimer
            </button>
          </div>
        </div>
      </div>
    `;

    document.getElementById('btnExportDb').onclick = ()=> this.exportDb();
    document.getElementById('importFile').onchange = (e)=>{
      document.getElementById('btnImportDb').disabled = !e.target.files[0];
    };
    document.getElementById('btnImportDb').onclick = ()=> this.importDb();
    document.getElementById('btnResetDemo').onclick = ()=> this.resetDemo();
    document.getElementById('btnClearDb').onclick = ()=> this.clearDb();
  },

  exportDb(){
    const db = Storage.read();
    const blob = new Blob([JSON.stringify(db, null, 2)], {type:'application/json'});
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    const date = new Date().toISOString().slice(0,10);
    a.download = 'gestschool_backup_'+date+'.json';
    a.click();
    Auth.log('db_export', 'Export de la base');
    Notify.toast('Sauvegarde téléchargée.', 'success');
  },

  importDb(){
    const file = document.getElementById('importFile').files[0];
    if(!file) return;
    if(!confirm('Restaurer cette sauvegarde ?\nToutes les données actuelles seront écrasées.')) return;

    const reader = new FileReader();
    reader.onload = (e)=>{
      try {
        const data = JSON.parse(e.target.result);
        // Validation minimale
        if(!data.parametres || !data.utilisateurs){
          throw new Error('Fichier invalide.');
        }
        Storage.write(data);
        Auth.log('db_import', 'Import de la base depuis ' + file.name);
        Notify.toast('Base restaurée. Rechargement…', 'success');
        setTimeout(()=>location.reload(), 1500);
      } catch(err){
        Notify.toast('Fichier de sauvegarde invalide.', 'danger');
      }
    };
    reader.readAsText(file);
  },

  resetDemo(){
    if(!confirm('Réinitialiser avec les données de démo ?\nToutes les données actuelles seront perdues.')) return;
    if(!confirm('Êtes-vous vraiment sûr ? Cette action est irréversible.')) return;
    Storage.reset();
    DB.init();
    Auth.log('db_reset_demo', 'Base réinitialisée avec les données de démo');
    Notify.toast('Base réinitialisée. Rechargement…', 'success');
    setTimeout(()=>location.reload(), 1500);
  },

  clearDb(){
    if(!confirm('Supprimer TOUTES les données ?\nL\'application sera vide et vous serez déconnecté.')) return;
    if(!confirm('Dernière confirmation : tout est perdu, y compris les comptes utilisateurs.')) return;
    Storage.reset();
    sessionStorage.removeItem('gestschool_session');
    Notify.toast('Base supprimée. Redémarrage…', 'warning');
    setTimeout(()=>location.href='index.html', 1500);
  }
};