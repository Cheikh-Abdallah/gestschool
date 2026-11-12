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
};