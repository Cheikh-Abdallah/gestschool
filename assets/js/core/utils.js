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
    if(isNaN(d.getTime())) return '—';
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
    return (db.parametres && db.parametres.typeEtablissement) || 'secondaire';
  },

  label(key){
    const sup = this._typeEtablissement() === 'superieur';
    const dict = {
      eleve:        sup ? 'Étudiant'   : 'Élève',
      eleves:       sup ? 'Étudiants'  : 'Élèves',
      Eleve:        sup ? 'Étudiant'   : 'Élève',
      Eleves:       sup ? 'Étudiants'  : 'Élèves',
      classe:       sup ? 'Groupe'     : 'Classe',
      classes:      sup ? 'Groupes'    : 'Classes',
      Classe:       sup ? 'Groupe'     : 'Classe',
      Classes:      sup ? 'Groupes'    : 'Classes',
      matiere:      sup ? 'UE'         : 'Matière',
      matieres:     sup ? 'UE'         : 'Matières',
      Matiere:      sup ? 'UE'         : 'Matière',
      Matieres:     sup ? 'UE'         : 'Matières',
      bulletin:     sup ? 'Relevé de notes' : 'Bulletin',
      bulletins:    sup ? 'Relevés de notes' : 'Bulletins',
      Bulletin:     sup ? 'Relevé de notes' : 'Bulletin',
      Bulletins:    sup ? 'Relevés de notes' : 'Bulletins',
      profPrincipal: sup ? 'Responsable pédagogique' : 'Professeur principal',
      niveau:       'Niveau',
      filiere:      'Filière',
      scolarite:    'Scolarité'
    };
    return dict[key] || key;
  },

  isSuperieur(){
    return this._typeEtablissement() === 'superieur';
  },

  // ============================================================
  // EN-TÊTE DE DOCUMENT (fiches, reçus, bulletins, rapports)
  // ============================================================
  enteteDocument(sousTitre){
    sousTitre = sousTitre || '';
    const p = (Storage.read() && Storage.read().parametres) || {};
    const annees = Storage.getAllIncludingArchived('annees') || [];
    const annee = annees.find(function(a){ return a.active; }) || annees[0] || null;

    // Lignes officielles (République, Ministère, Inspection)
    const lignesOfficielles = [];
    if(p.docLigne1) lignesOfficielles.push(p.docLigne1);
    if(p.docLigne2) lignesOfficielles.push(p.docLigne2);
    if(p.docLigne3) lignesOfficielles.push(p.docLigne3);

    // Bloc logo (image ou placeholder)
    let logoHtml;
    if(p.logo){
      logoHtml = '<div class="entete-doc-logo"><img src="' + this.escapeHtml(p.logo) + '" alt="Logo"></div>';
    } else {
      logoHtml = '<div class="entete-doc-logo entete-doc-logo-placeholder"><i class="bi bi-mortarboard-fill"></i></div>';
    }

    // Lignes officielles HTML
    let lignesHtml = '';
    if(lignesOfficielles.length){
      lignesHtml = lignesOfficielles.map(function(l){
        return '<div class="entete-doc-ligne">' + Utils.escapeHtml(l) + '</div>';
      }).join('');
    }

    // Détails de contact
    let adresseHtml = p.adresse ? '<div class="entete-doc-detail"><i class="bi bi-geo-alt"></i> ' + this.escapeHtml(p.adresse) + '</div>' : '';
    let telHtml = p.telephone ? '<div class="entete-doc-detail"><i class="bi bi-telephone"></i> ' + this.escapeHtml(p.telephone) + '</div>' : '';
    let emailHtml = p.email ? '<div class="entete-doc-detail"><i class="bi bi-envelope"></i> ' + this.escapeHtml(p.email) + '</div>' : '';
    let sloganHtml = p.slogan ? '<div class="entete-doc-slogan">« ' + this.escapeHtml(p.slogan) + ' »</div>' : '';

    // Colonne droite
    let anneeHtml = annee ? '<div class="entete-doc-annee">Année ' + this.escapeHtml(annee.libelle) + '</div>' : '';
    let sousTitreHtml = sousTitre ? '<div class="entete-doc-soust">' + this.escapeHtml(sousTitre) + '</div>' : '';
    let dateHtml = '<div class="entete-doc-date">Édité le ' + this.formatDate(new Date().toISOString()) + '</div>';

    return '<div class="entete-doc">' +
      '<div class="entete-doc-left">' +
        logoHtml +
        '<div class="entete-doc-infos">' +
          lignesHtml +
          '<div class="entete-doc-nom">' + this.escapeHtml(p.etablissement || '—') + '</div>' +
          adresseHtml +
          telHtml +
          emailHtml +
          sloganHtml +
        '</div>' +
      '</div>' +
      '<div class="entete-doc-right">' +
        anneeHtml +
        sousTitreHtml +
        dateHtml +
      '</div>' +
    '</div>';
  }
};
