const Utils = {
  uid(prefix='id'){
    return prefix + '_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2,7);
  },

  formatFCFA(n){
    return new Intl.NumberFormat('fr-SN', {maximumFractionDigits:0}).format(n||0) + ' FCFA';
  },

  formatDate(iso){
    if(!iso) return '—';
    const d = new Date(iso);
    return d.toLocaleDateString('fr-FR', {day:'2-digit', month:'2-digit', year:'numeric'});
  },

  monthLabel(n){
    const m = ['Jan','Fév','Mar','Avr','Mai','Juin','Juil','Août','Sep','Oct','Nov','Déc'];
    return m[n] || '';
  },

  escapeHtml(s){
    return String(s??'').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  },
    // ============================================================
  // LIBELLÉS DYNAMIQUES (Mode dual : secondaire / supérieur)
  // ============================================================
  _typeEtablissement(){
    const db = Storage.read() || {};
    return db.parametres?.typeEtablissement || 'secondaire';
  },

  /**
   * Retourne le libellé adapté au type d'établissement.
   * Exemples :
   *   Utils.label('eleve')      → 'Élève'     ou 'Étudiant'
   *   Utils.label('eleves')     → 'Élèves'    ou 'Étudiants'
   *   Utils.label('classe')     → 'Classe'    ou 'Groupe'
   *   Utils.label('matiere')    → 'Matière'   ou 'UE'
   *   Utils.label('bulletin')   → 'Bulletin'  ou 'Relevé de notes'
   */
  label(key){
    const sup = this._typeEtablissement() === 'superieur';
    const dict = {
      // Élèves / Étudiants
      eleve:        sup ? 'Étudiant'   : 'Élève',
      eleves:       sup ? 'Étudiants'  : 'Élèves',
      Eleve:        sup ? 'Étudiant'   : 'Élève',
      Eleves:       sup ? 'Étudiants'  : 'Élèves',
      // Classes / Groupes
      classe:       sup ? 'Groupe'     : 'Classe',
      classes:      sup ? 'Groupes'    : 'Classes',
      Classe:       sup ? 'Groupe'     : 'Classe',
      Classes:      sup ? 'Groupes'    : 'Classes',
      // Matières / UE
      matiere:      sup ? 'UE'         : 'Matière',
      matieres:     sup ? 'UE'         : 'Matières',
      Matiere:      sup ? 'UE'         : 'Matière',
      Matieres:     sup ? 'UE'         : 'Matières',
      // Bulletins / Relevés
      bulletin:     sup ? 'Relevé de notes' : 'Bulletin',
      bulletins:    sup ? 'Relevés de notes' : 'Bulletins',
      Bulletin:     sup ? 'Relevé de notes' : 'Bulletin',
      Bulletins:    sup ? 'Relevés de notes' : 'Bulletins',
      // Prof principal → Responsable pédagogique
      profPrincipal: sup ? 'Responsable pédagogique' : 'Professeur principal',
      // Divers
      niveau:       sup ? 'Niveau'      : 'Niveau',
      filiere:      sup ? 'Filière'     : 'Filière',
      // Scolarité
      scolarite:    sup ? 'Scolarité'   : 'Scolarité'
    };
    return dict[key] || key;
  },

  isSuperieur(){
    return this._typeEtablissement() === 'superieur';
  }
    // ============================================================
  // EN-TÊTE DE DOCUMENT (fiches, reçus, bulletins, rapports)
  // Retourne un bloc HTML complet avec logo + infos établissement
  // ============================================================
  enteteDocument(sousTitre=''){
    const p = (Storage.read()?.parametres) || {};
    const annee = Storage.getAllIncludingArchived('annees').find(a => a.active);

    // Lignes officielles (République, Ministère, Inspection)
    const lignesOfficielles = [
      p.docLigne1 || '',
      p.docLigne2 || '',
      p.docLigne3 || ''
    ].filter(Boolean);

    return `
      <div class="entete-doc">
        <div class="entete-doc-left">
          ${p.logo
            ? `<div class="entete-doc-logo"><img src="${Utils.escapeHtml(p.logo)}" alt="Logo"></div>`
            : `<div class="entete-doc-logo entete-doc-logo-placeholder"><i class="bi bi-mortarboard-fill"></i></div>`
          }
          <div class="entete-doc-infos">
            ${lignesOfficielles.length
              ? lignesOfficielles.map(l => `<div class="entete-doc-ligne">${Utils.escapeHtml(l)}</div>`).join('')
              : ''
            }
            <div class="entete-doc-nom">${Utils.escapeHtml(p.etablissement || '—')}</div>
            ${p.adresse ? `<div class="entete-doc-detail"><i class="bi bi-geo-alt"></i> ${Utils.escapeHtml(p.adresse)}</div>` : ''}
            ${p.telephone ? `<div class="entete-doc-detail"><i class="bi bi-telephone"></i> ${Utils.escapeHtml(p.telephone)}</div>` : ''}
            ${p.email ? `<div class="entete-doc-detail"><i class="bi bi-envelope"></i> ${Utils.escapeHtml(p.email)}</div>` : ''}
            ${p.slogan ? `<div class="entete-doc-slogan">« ${Utils.escapeHtml(p.slogan)} »</div>` : ''}
          </div>
        </div>
        <div class="entete-doc-right">
          ${annee ? `<div class="entete-doc-annee">Année ${Utils.escapeHtml(annee.libelle)}</div>` : ''}
          ${sousTitre ? `<div class="entete-doc-soust">${Utils.escapeHtml(sousTitre)}</div>` : ''}
          <div class="entete-doc-date">Édité le ${Utils.formatDate(new Date().toISOString())}</div>
        </div>
      </div>
    `;
  },
};
