/**
 * Module d'import Excel générique.
 * Utilisable pour toutes les entités (élèves, enseignants, filières...).
 */
const ImportExcel = {
  currentConfig: null,
  parsedData: null,

  /**
   * Ouvre la modale d'import pour une entité donnée.
   * @param {string} entity - 'eleves' | 'enseignants' | 'filieres' | 'niveaux' | 'ue' | ...
   */
  open(entity){
    const config = this.getConfig(entity);
    if(!config){
      Notify.toast('Import non disponible pour cette entité.', 'danger');
      return;
    }
    this.currentConfig = config;
    this.parsedData = null;
    this.renderModal();
  },

  /**
   * Configuration de chaque entité : colonnes, validations, transformation.
   */
  getConfig(entity){
    const configs = {
      eleves: {
        label: 'Élèves',
        entity: 'eleves',
        requiredFields: ['nom', 'prenom', 'sexe'],
        columns: [
          { key: 'matricule', label: 'Matricule', hint: 'Auto-généré si vide', required: false },
          { key: 'ine', label: 'INE', required: false },
          { key: 'nom', label: 'Nom', required: true },
          { key: 'prenom', label: 'Prénom', required: true },
          { key: 'sexe', label: 'Sexe (M/F)', required: true },
          { key: 'dateNaissance', label: 'Date de naissance (AAAA-MM-JJ)', required: false },
          { key: 'lieuNaissance', label: 'Lieu de naissance', required: false },
          { key: 'nationalite', label: 'Nationalité', required: false },
          { key: 'email', label: 'Email', required: false },
          { key: 'telephone', label: 'Téléphone', required: false },
          { key: 'adresse', label: 'Adresse', required: false },
          { key: 'nomPere', label: 'Nom du père', required: false },
          { key: 'nomMere', label: 'Nom de la mère', required: false },
          { key: 'nomTuteur', label: 'Nom du tuteur', required: false },
          { key: 'telephoneResponsable', label: 'Téléphone responsable', required: false },
          { key: 'classeNom', label: 'Classe (nom)', hint: 'Doit exister', required: false },
          { key: 'infosMed', label: 'Infos médicales', required: false }
        ],
        transform: (row) => {
          // Convertir la classe en ID
          if(row.classeNom){
            const cls = Storage.getAll('classes').find(c => 
              c.nom.toLowerCase() === row.classeNom.toLowerCase()
            );
            row.classeId = cls ? cls.id : null;
            delete row.classeNom;
          }
          // Valeurs par défaut
          if(!row.sexe || !['M','F'].includes(row.sexe.toUpperCase())){
            throw new Error('Sexe invalide (M ou F attendu)');
          }
          row.sexe = row.sexe.toUpperCase();
          row.nationalite = row.nationalite || 'Sénégalaise';
          return row;
        },
        validate: (row) => {
          if(!row.nom || !row.prenom) return 'Nom et prénom obligatoires';
          if(!['M','F'].includes(row.sexe)) return 'Sexe M ou F';
          return null;
        },
        duplicateCheck: (row) => {
          const existing = Storage.getAllIncludingArchived('eleves').find(e =>
            e.matricule && row.matricule && e.matricule.toLowerCase() === row.matricule.toLowerCase()
          );
          return existing ? `Matricule ${row.matricule} déjà utilisé` : null;
        }
      },

      enseignants: {
        label: 'Enseignants',
        entity: 'enseignants',
        requiredFields: ['nom', 'prenom', 'sexe', 'specialite'],
        columns: [
          { key: 'matricule', label: 'Matricule', required: false },
          { key: 'nom', label: 'Nom', required: true },
          { key: 'prenom', label: 'Prénom', required: true },
          { key: 'sexe', label: 'Sexe (M/F)', required: true },
          { key: 'dateNaissance', label: 'Date de naissance', required: false },
          { key: 'telephone', label: 'Téléphone', required: false },
          { key: 'email', label: 'Email', required: false },
          { key: 'adresse', label: 'Adresse', required: false },
          { key: 'specialite', label: 'Spécialité', required: true },
          { key: 'diplome', label: 'Diplôme', required: false },
          { key: 'statut', label: 'Statut (Titulaire/Vacataire/Contractuel)', required: false },
          { key: 'dateRecrutement', label: 'Date de recrutement', required: false }
        ],
        transform: (row) => {
          if(row.sexe) row.sexe = row.sexe.toUpperCase();
          row.statut = row.statut || 'Titulaire';
          return row;
        },
        validate: (row) => {
          if(!row.nom || !row.prenom) return 'Nom et prénom obligatoires';
          if(!['M','F'].includes(row.sexe)) return 'Sexe M ou F';
          return null;
        },
        duplicateCheck: (row) => {
          const existing = Storage.getAllIncludingArchived('enseignants').find(e =>
            e.matricule && row.matricule && e.matricule.toLowerCase() === row.matricule.toLowerCase()
          );
          return existing ? `Matricule ${row.matricule} déjà utilisé` : null;
        }
      },

      filieres: {
        label: 'Filières',
        entity: 'filieres',
        requiredFields: ['code', 'nom', 'cycle'],
        columns: [
          { key: 'code', label: 'Code', required: true },
          { key: 'nom', label: 'Nom', required: true },
          { key: 'cycle', label: 'Cycle (Licence/Master/BTS/DUT...)', required: true },
          { key: 'dureeAnnees', label: 'Durée (années)', required: false },
          { key: 'description', label: 'Description', required: false }
        ],
        transform: (row) => {
          if(row.code) row.code = row.code.toUpperCase();
          row.dureeAnnees = parseInt(row.dureeAnnees) || 3;
          return row;
        },
        validate: (row) => {
          if(!row.code || !row.nom) return 'Code et nom obligatoires';
          return null;
        },
        duplicateCheck: (row) => {
          const existing = Storage.getAll('filieres').find(f =>
            f.code.toLowerCase() === row.code.toLowerCase()
          );
          return existing ? `Code ${row.code} déjà utilisé` : null;
        }
      },

      niveaux: {
        label: 'Niveaux',
        entity: 'niveaux',
        requiredFields: ['filiereCode', 'code', 'libelle'],
        columns: [
          { key: 'filiereCode', label: 'Code Filière', hint: 'Doit exister', required: true },
          { key: 'code', label: 'Code', required: true },
          { key: 'libelle', label: 'Libellé', required: true },
          { key: 'ordre', label: 'Ordre', required: false },
          { key: 'creditsRequis', label: 'Crédits requis', required: false },
          { key: 'fraisScolarite', label: 'Frais scolarité', required: false }
        ],
        transform: (row) => {
          if(row.filiereCode){
            const fil = Storage.getAll('filieres').find(f =>
              f.code.toLowerCase() === row.filiereCode.toLowerCase()
            );
            if(!fil) throw new Error(`Filière "${row.filiereCode}" introuvable`);
            row.filiereId = fil.id;
            delete row.filiereCode;
          }
          row.ordre = parseInt(row.ordre) || 1;
          row.creditsRequis = parseInt(row.creditsRequis) || 60;
          row.fraisScolarite = parseInt(row.fraisScolarite) || 0;
          return row;
        },
        validate: (row) => {
          if(!row.code || !row.libelle) return 'Code et libellé obligatoires';
          return null;
        },
        duplicateCheck: (row) => {
          const existing = Storage.getAll('niveaux').find(n =>
            n.filiereId === row.filiereId && n.code.toLowerCase() === row.code.toLowerCase()
          );
          return existing ? `Code ${row.code} déjà utilisé dans cette filière` : null;
        }
      },

      ue: {
        label: 'UE (Unités d\'Enseignement)',
        entity: 'ue',
        requiredFields: ['code', 'nom', 'niveauCode'],
        columns: [
          { key: 'code', label: 'Code UE', required: true },
          { key: 'nom', label: 'Nom', required: true },
          { key: 'filiereCode', label: 'Code Filière', required: true },
          { key: 'niveauCode', label: 'Code Niveau', required: true },
          { key: 'semestre', label: 'Semestre (S1/S2)', required: true },
          { key: 'creditsECTS', label: 'Crédits ECTS', required: false },
          { key: 'coefficient', label: 'Coefficient', required: false },
          { key: 'typeUE', label: 'Type', required: false }
        ],
        transform: (row) => {
          if(row.filiereCode){
            const fil = Storage.getAll('filieres').find(f =>
              f.code.toLowerCase() === row.filiereCode.toLowerCase()
            );
            if(!fil) throw new Error(`Filière "${row.filiereCode}" introuvable`);
            row.filiereId = fil.id;
            delete row.filiereCode;
          }
          if(row.niveauCode){
            const niv = Storage.getAll('niveaux').find(n =>
              n.filiereId === row.filiereId &&
              n.code.toLowerCase() === row.niveauCode.toLowerCase()
            );
            if(!niv) throw new Error(`Niveau "${row.niveauCode}" introuvable`);
            row.niveauId = niv.id;
            delete row.niveauCode;
          }
          row.semestre = (row.semestre || 'S1').toUpperCase();
          row.creditsECTS = parseInt(row.creditsECTS) || 6;
          row.coefficient = parseInt(row.coefficient) || 1;
          row.typeUE = row.typeUE || 'Fondamentale';
          row.ecueIds = [];
          row.enseignantIds = [];
          return row;
        },
        validate: (row) => {
          if(!row.code || !row.nom) return 'Code et nom obligatoires';
          if(!['S1','S2'].includes(row.semestre)) return 'Semestre S1 ou S2';
          return null;
        },
        duplicateCheck: (row) => {
          const existing = Storage.getAll('ue').find(u =>
            u.code.toLowerCase() === row.code.toLowerCase()
          );
          return existing ? `Code ${row.code} déjà utilisé` : null;
        }
      }
    };

    return configs[entity] || null;
  },

  renderModal(){
    const cfg = this.currentConfig;
    const existing = document.getElementById('modalImportExcel');
    if(existing) existing.remove();

    const modalHtml = `
      <div class="modal fade" id="modalImportExcel" tabindex="-1">
        <div class="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable">
          <div class="modal-content">
            <div class="modal-header">
              <h6 class="modal-title">
                <i class="bi bi-file-earmark-excel me-1 text-success"></i>
                Importer ${cfg.label} depuis Excel
              </h6>
              <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body">
              <div id="importStep1">
                <div class="alert alert-info small">
                  <strong><i class="bi bi-info-circle me-1"></i> Comment procéder :</strong>
                  <ol class="mb-0 mt-2">
                    <li>Téléchargez le modèle Excel pré-rempli avec les bonnes colonnes.</li>
                    <li>Remplissez-le avec vos données (une ligne = un enregistrement).</li>
                    <li>Glissez-déposez le fichier ou cliquez pour le sélectionner.</li>
                    <li>Vérifiez l'aperçu puis confirmez l'import.</li>
                  </ol>
                </div>

                <div class="d-flex gap-2 mb-3">
                  <button class="btn btn-outline-success" id="btnDownloadTemplate">
                    <i class="bi bi-download me-1"></i> Télécharger le modèle Excel
                  </button>
                </div>

                <div class="upload-zone" id="uploadZone">
                  <i class="bi bi-cloud-upload display-4 text-primary"></i>
                  <p class="mt-3 mb-1"><strong>Glissez votre fichier ici</strong></p>
                  <p class="text-muted small mb-3">ou</p>
                  <button class="btn btn-primary" id="btnSelectFile">
                    <i class="bi bi-folder2-open me-1"></i> Parcourir les fichiers
                  </button>
                  <input type="file" id="excelFileInput" accept=".xlsx,.xls,.csv" class="d-none">
                  <p class="text-muted small mt-3 mb-0">Formats acceptés : .xlsx, .xls, .csv (max 5 Mo)</p>
                </div>
              </div>

              <div id="importStep2" class="d-none">
                <div class="d-flex justify-content-between align-items-center mb-3">
                  <div>
                    <h6 class="mb-1">Aperçu des données</h6>
                    <small class="text-muted" id="previewSummary"></small>
                  </div>
                  <button class="btn btn-sm btn-outline-secondary" id="btnBackToUpload">
                    <i class="bi bi-arrow-left me-1"></i> Changer de fichier
                  </button>
                </div>

                <div class="alert alert-warning small d-none" id="importErrors"></div>
                <div class="alert alert-info small" id="importWarnings"></div>

                <div class="table-responsive" style="max-height: 400px;">
                  <table class="table table-sm table-bordered align-middle" id="previewTable">
                    <thead class="table-light sticky-top"></thead>
                    <tbody></tbody>
                  </table>
                </div>
              </div>

              <div id="importStep3" class="d-none text-center py-4">
                <div class="spinner-border text-primary mb-3" role="status" style="width: 3rem; height: 3rem;"></div>
                <p><strong>Import en cours…</strong></p>
                <p class="text-muted small">Création des enregistrements dans la base.</p>
              </div>

              <div id="importStep4" class="d-none text-center py-4">
                <i class="bi bi-check-circle-fill text-success" style="font-size: 4rem;"></i>
                <h5 class="mt-3 text-success">Import terminé !</h5>
                <p class="text-muted" id="importResultSummary"></p>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-light" data-bs-dismiss="modal" id="btnCancelImport">Annuler</button>
              <button type="button" class="btn btn-primary d-none" id="btnConfirmImport">
                <i class="bi bi-check2-circle me-1"></i> Confirmer l'import
              </button>
              <button type="button" class="btn btn-success d-none" id="btnCloseAfterImport" data-bs-dismiss="modal">
                <i class="bi bi-check me-1"></i> Terminer
              </button>
            </div>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHtml);
    this.bindModalEvents();
    new bootstrap.Modal(document.getElementById('modalImportExcel')).show();
  },

  bindModalEvents(){
    const modalEl = document.getElementById('modalImportExcel');
    const fileInput = document.getElementById('excelFileInput');
    const uploadZone = document.getElementById('uploadZone');
    const btnSelect = document.getElementById('btnSelectFile');
    const btnDownload = document.getElementById('btnDownloadTemplate');
    const btnConfirm = document.getElementById('btnConfirmImport');
    const btnBack = document.getElementById('btnBackToUpload');

    // Téléchargement du template
    btnDownload.onclick = () => this.downloadTemplate();

    // Sélection de fichier
    btnSelect.onclick = () => fileInput.click();
    fileInput.onchange = (e) => {
      if(e.target.files[0]) this.handleFile(e.target.files[0]);
    };

    // Drag & drop
    uploadZone.addEventListener('click', (e) => {
      if(e.target === uploadZone || e.target.tagName === 'I' || e.target.tagName === 'P') {
        fileInput.click();
      }
    });
    uploadZone.addEventListener('dragover', (e) => {
      e.preventDefault();
      uploadZone.classList.add('dragover');
    });
    uploadZone.addEventListener('dragleave', () => {
      uploadZone.classList.remove('dragover');
    });
    uploadZone.addEventListener('drop', (e) => {
      e.preventDefault();
      uploadZone.classList.remove('dragover');
      if(e.dataTransfer.files[0]) this.handleFile(e.dataTransfer.files[0]);
    });

    // Retour
    btnBack.onclick = () => {
      document.getElementById('importStep2').classList.add('d-none');
      document.getElementById('importStep1').classList.remove('d-none');
      btnConfirm.classList.add('d-none');
      this.parsedData = null;
    };

    // Confirmation
    btnConfirm.onclick = () => this.doImport();

    // Nettoyage à la fermeture
    modalEl.addEventListener('hidden.bs.modal', () => modalEl.remove());
  },

  downloadTemplate(){
    const cfg = this.currentConfig;
    const headers = cfg.columns.map(c => c.label);
    const exampleRow = cfg.columns.map(c => {
      if(c.key === 'sexe') return 'M';
      if(c.key === 'nom') return 'DIOP';
      if(c.key === 'prenom') return 'Amadou';
      if(c.key === 'code') return 'CODE001';
      if(c.key === 'cycle') return 'Licence';
      if(c.key === 'semestre') return 'S1';
      if(c.key === 'filiereCode') return 'INFO';
      if(c.key === 'niveauCode') return 'L1';
      if(c.key === 'dateNaissance' || c.key === 'dateRecrutement') return '2000-01-15';
      return '';
    });

    const ws = XLSX.utils.aoa_to_sheet([headers, exampleRow]);
    // Ajuster la largeur des colonnes
    ws['!cols'] = headers.map(() => ({ wch: 20 }));

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Import');
    XLSX.writeFile(wb, `modele_${cfg.entity}_gestschool.xlsx`);

    Notify.toast('Modèle Excel téléchargé.', 'success');
  },

  handleFile(file){
    // Vérification de taille (max 5 Mo)
    if(file.size > 5 * 1024 * 1024){
      Notify.toast('Fichier trop volumineux (max 5 Mo).', 'danger');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(firstSheet, { defval: '' });

        if(!jsonData.length){
          Notify.toast('Le fichier est vide.', 'danger');
          return;
        }

        this.parseAndPreview(jsonData);
      } catch(err){
        console.error(err);
        Notify.toast('Erreur lors de la lecture du fichier.', 'danger');
      }
    };
    reader.readAsArrayBuffer(file);
  },

  parseAndPreview(jsonData){
    const cfg = this.currentConfig;
    const parsed = [];
    const errors = [];

    jsonData.forEach((rawRow, index) => {
      const row = {};
      // Mapper les labels du fichier aux clés internes
      cfg.columns.forEach(col => {
        const rawValue = rawRow[col.label];
        row[col.key] = rawValue !== undefined && rawValue !== '' 
          ? String(rawValue).trim() 
          : '';
      });

      // Validation
      const validationError = cfg.validate ? cfg.validate(row) : null;
      if(validationError){
        errors.push({ ligne: index + 2, erreur: validationError });
        return;
      }

      // Transform (conversion des références, etc.)
      try {
        const transformed = cfg.transform ? cfg.transform(row) : row;
        // Détection des doublons
        const duplicateError = cfg.duplicateCheck ? cfg.duplicateCheck(transformed) : null;
        if(duplicateError){
          errors.push({ ligne: index + 2, erreur: duplicateError });
          transformed._hasError = true;
          transformed._error = duplicateError;
        }
        parsed.push(transformed);
      } catch(err){
        errors.push({ ligne: index + 2, erreur: err.message });
      }
    });

    this.parsedData = parsed;
    this.showPreview(parsed, errors);
  },

  showPreview(data, errors){
    // Basculer sur l'étape 2
    document.getElementById('importStep1').classList.add('d-none');
    document.getElementById('importStep2').classList.remove('d-none');
    document.getElementById('btnConfirmImport').classList.remove('d-none');

    const cfg = this.currentConfig;
    const validRows = data.filter(r => !r._hasError);
    const invalidRows = data.filter(r => r._hasError);

    // Résumé
    document.getElementById('previewSummary').textContent = 
      `${data.length} ligne(s) détectée(s) · ${validRows.length} valide(s) · ${invalidRows.length} avec erreur(s)`;

    // Erreurs
    const errorsEl = document.getElementById('importErrors');
    if(invalidRows.length > 0){
      errorsEl.classList.remove('d-none');
      errorsEl.innerHTML = `
        <strong><i class="bi bi-exclamation-triangle-fill me-1"></i> ${invalidRows.length} ligne(s) en erreur (ne seront PAS importées) :</strong>
        <ul class="mb-0 mt-2">
          ${invalidRows.slice(0, 5).map(r => 
            `<li>${Utils.escapeHtml(r._error)}</li>`
          ).join('')}
          ${invalidRows.length > 5 ? `<li>... et ${invalidRows.length - 5} autres</li>` : ''}
        </ul>
      `;
    } else {
      errorsEl.classList.add('d-none');
    }

    const warningsEl = document.getElementById('importWarnings');
    warningsEl.innerHTML = `
      <i class="bi bi-info-circle me-1"></i>
      ${validRows.length} enregistrement(s) seront créés. Vérifiez l'aperçu avant de confirmer.
    `;

    // Tableau d'aperçu
    const table = document.getElementById('previewTable');
    const visibleCols = cfg.columns.filter(c => 
      data.some(r => r[c.key] !== '' && r[c.key] !== null && r[c.key] !== undefined)
    );

    table.querySelector('thead').innerHTML = `<tr>
      <th style="width: 40px;">#</th>
      ${visibleCols.map(c => `<th>${Utils.escapeHtml(c.label)}</th>`).join('')}
      <th style="width: 100px;">Statut</th>
    </tr>`;

    table.querySelector('tbody').innerHTML = data.slice(0, 50).map((row, i) => `
      <tr class="${row._hasError ? 'table-danger' : ''}">
        <td>${i + 2}</td>
        ${visibleCols.map(c => `<td>${Utils.escapeHtml(String(row[c.key] || ''))}</td>`).join('')}
        <td>${row._hasError 
          ? '<span class="badge bg-danger">Erreur</span>' 
          : '<span class="badge bg-success">OK</span>'
        }</td>
      </tr>
    `).join('') + (data.length > 50 
      ? `<tr><td colspan="${visibleCols.length + 2}" class="text-center text-muted">... et ${data.length - 50} ligne(s) supplémentaire(s)</td></tr>`
      : '');

    // Si toutes les lignes sont en erreur, désactiver le bouton
    if(validRows.length === 0){
      document.getElementById('btnConfirmImport').disabled = true;
      document.getElementById('btnConfirmImport').textContent = 'Aucune ligne valide';
    } else {
      document.getElementById('btnConfirmImport').disabled = false;
      document.getElementById('btnConfirmImport').innerHTML = `<i class="bi bi-check2-circle me-1"></i> Importer ${validRows.length} ligne(s)`;
    }
  },

  doImport(){
    // Basculer sur l'étape 3 (chargement)
    document.getElementById('importStep2').classList.add('d-none');
    document.getElementById('importStep3').classList.remove('d-none');
    document.getElementById('btnConfirmImport').classList.add('d-none');
    document.getElementById('btnCancelImport').classList.add('d-none');

    setTimeout(() => {
      try {
        const cfg = this.currentConfig;
        const validRows = this.parsedData.filter(r => !r._hasError);
        const anneeActive = Storage.getAllIncludingArchived('annees').find(a => a.active);

        let created = 0;
        let failed = 0;

        validRows.forEach(row => {
          try {
            // Nettoyer les champs techniques
            delete row._hasError;
            delete row._error;

            // Ajouter les champs par défaut
            if(!row.matricule){
              const all = Storage.getAllIncludingArchived(cfg.entity);
              const prefix = cfg.entity === 'eleves' ? 'ELV' : cfg.entity === 'enseignants' ? 'ENS' : 'GEN';
              const maxNum = all.reduce((m, e) => {
                const n = parseInt((e.matricule || '').replace(/\D/g, '')) || 0;
                return Math.max(m, n);
              }, 1000);
              row.matricule = `${prefix}-${maxNum + 1}`;
            }
            if(anneeActive) row.anneeId = anneeActive.id;

            Storage.create(cfg.entity, row);
            created++;
          } catch(err) {
            console.error('Erreur import ligne:', err, row);
            failed++;
          }
        });

        // Étape 4 : Résultat
        document.getElementById('importStep3').classList.add('d-none');
        document.getElementById('importStep4').classList.remove('d-none');
        document.getElementById('btnCloseAfterImport').classList.remove('d-none');

        document.getElementById('importResultSummary').innerHTML = `
          <strong>${created}</strong> enregistrement(s) créé(s) avec succès.
          ${failed > 0 ? `<br><span class="text-danger">${failed} échec(s)</span>` : ''}
        `;

        Auth.log('import_excel', `Import Excel ${cfg.entity} : ${created} créé(s)`);

      } catch(err) {
        console.error(err);
        Notify.toast('Erreur lors de l\'import.', 'danger');
        document.getElementById('importStep3').classList.add('d-none');
        document.getElementById('importStep2').classList.remove('d-none');
        document.getElementById('btnConfirmImport').classList.remove('d-none');
      }
    }, 500);
  }
};
