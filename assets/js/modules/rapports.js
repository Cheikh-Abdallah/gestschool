/**
 * Module 14 : Rapports et impressions.
 * Hub central de 9 rapports imprimables et exportables en CSV.
 */
const Rapports = {
  state: {
    rapportActif: null
  },

  RAPPORTS: [
    { id:'eleves',      icon:'bi-people-fill',        cat:'Élèves',      titre:'Liste des élèves',            desc:'Liste complète avec matricules, classes et contacts.' },
    { id:'enseignants', icon:'bi-person-workspace',   cat:'Personnel',   titre:'Liste des enseignants',       desc:'Enseignants avec spécialités et affectations.' },
    { id:'effectifs',   icon:'bi-building',           cat:'Élèves',      titre:'Effectifs par classe',        desc:'Répartition des élèves et taux de remplissage.' },
    { id:'absences',    icon:'bi-calendar-x',         cat:'Discipline',  titre:'Absences et retards',         desc:'Historique détaillé avec justification.' },
    { id:'resultats',   icon:'bi-trophy',             cat:'Pédagogique', titre:'Classements et résultats',    desc:'Classement complet par classe et période.' },
    { id:'financier',   icon:'bi-wallet2',            cat:'Finances',    titre:'Situation financière',        desc:'Vue globale : attendu, encaissé, impayés.' },
    { id:'impayes',     icon:'bi-exclamation-circle', cat:'Finances',    titre:'État des impayés',            desc:'Élèves débiteurs et montants restants.' },
    { id:'caisse',      icon:'bi-journal-text',       cat:'Finances',    titre:'Journal de caisse',           desc:'Toutes les transactions avec traçabilité.' },
    { id:'stats',       icon:'bi-graph-up-arrow',     cat:'Synthèse',    titre:'Statistiques annuelles',      desc:'Synthèse générale de l\'établissement.' }
  ],

  render(container){
    this.container = container;
    container.innerHTML = `
      <div class="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3 no-print">
        <div>
          <div class="page-title">Rapports et impressions</div>
          <div class="page-sub">Exports PDF, impressions A4 et fichiers CSV</div>
        </div>
        <div class="d-flex gap-2" id="rapportActions" style="display:none">
          <button class="btn btn-outline-secondary btn-sm" id="btnExportCsvRap">
            <i class="bi bi-filetype-csv me-1"></i> Exporter CSV
          </button>
          <button class="btn btn-primary btn-sm" id="btnPrintRap">
            <i class="bi bi-printer me-1"></i> Imprimer / PDF
          </button>
        </div>
      </div>

      <div id="rapportSelector" class="no-print">
        <div class="row g-3" id="rapportCards"></div>
      </div>

      <div id="rapportFiltres" class="no-print" style="display:none"></div>

      <div id="rapportApercu"></div>
    `;

    this.renderCards();
  },

  renderCards(){
    const grid = document.getElementById('rapportCards');
    // Grouper par catégorie
    const cats = [...new Set(this.RAPPORTS.map(r=>r.cat))];
    let html = '';
    cats.forEach(cat=>{
      const items = this.RAPPORTS.filter(r=>r.cat === cat);
      html += `<div class="col-12"><h6 class="text-muted text-uppercase small fw-bold mt-2 mb-1" style="letter-spacing:1px">${cat}</h6></div>`;
      items.forEach(r=>{
        html += `
          <div class="col-md-6 col-lg-4">
            <div class="rapport-card" data-id="${r.id}">
              <div class="rapport-icon"><i class="bi ${r.icon}"></i></div>
              <div>
                <div class="rapport-titre">${r.titre}</div>
                <div class="rapport-desc">${r.desc}</div>
              </div>
            </div>
          </div>`;
      });
    });
    grid.innerHTML = html;

    grid.querySelectorAll('.rapport-card').forEach(card=>{
      card.onclick = ()=> this.openRapport(card.dataset.id);
    });
  },

  openRapport(id){
    this.state.rapportActif = id;
    const r = this.RAPPORTS.find(x=>x.id === id);
    if(!r) return;

    // Boutons d'action
    document.getElementById('rapportActions').style.display = 'flex';
    document.getElementById('btnPrintRap').onclick = ()=> window.print();
    document.getElementById('btnExportCsvRap').onclick = ()=> this.exportCsv();

    // Filtres
    const filtres = document.getElementById('rapportFiltres');
    filtres.style.display = 'block';
    filtres.innerHTML = this.renderFiltres(id);

    // Attacher les events de filtres
    this.bindFiltres(id);

    // Générer l'aperçu
    this.generateApercu(id);
  },

  renderFiltres(id){
    const classes = Storage.getAll('classes');
    const annee = Storage.getAllIncludingArchived('annees').find(a=>a.active);
    const periodes = annee?.periodes || ['Trimestre 1','Trimestre 2','Trimestre 3'];
    const today = new Date().toISOString().slice(0,10);
    const mois = today.slice(0,7);

    let html = '<div class="card-panel mb-3 py-3"><div class="row g-2 align-items-end">';

    if(['eleves','effectifs','resultats','financier','impayes'].includes(id)){
      html += `<div class="col-md-4">
        <label class="form-label small fw-semibold">Classe</label>
        <select class="form-select form-select-sm" id="fRapClasse">
          <option value="">Toutes classes</option>
          ${classes.map(c=>`<option value="${c.id}">${Utils.escapeHtml(c.nom)}</option>`).join('')}
        </select>
      </div>`;
    }

    if(['absences','resultats'].includes(id)){
      html += `<div class="col-md-3">
        <label class="form-label small fw-semibold">Période</label>
        <select class="form-select form-select-sm" id="fRapPeriode">
          ${periodes.map(p=>`<option value="${p}">${p}</option>`).join('')}
        </select>
      </div>`;
    }

    if(id === 'absences'){
      html += `<div class="col-md-3">
        <label class="form-label small fw-semibold">Du</label>
        <input type="date" class="form-control form-control-sm" id="fRapDateFrom" value="${new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().slice(0,10)}">
      </div>
      <div class="col-md-3">
        <label class="form-label small fw-semibold">Au</label>
        <input type="date" class="form-control form-control-sm" id="fRapDateTo" value="${today}">
      </div>`;
    }

    if(id === 'caisse'){
      html += `<div class="col-md-3">
        <label class="form-label small fw-semibold">Du</label>
        <input type="date" class="form-control form-control-sm" id="fRapDateFrom" value="${new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().slice(0,10)}">
      </div>
      <div class="col-md-3">
        <label class="form-label small fw-semibold">Au</label>
        <input type="date" class="form-control form-control-sm" id="fRapDateTo" value="${today}">
      </div>`;
    }

    if(id === 'enseignants'){
      html += `<div class="col-md-4">
        <label class="form-label small fw-semibold">Statut</label>
        <select class="form-select form-select-sm" id="fRapStatut">
          <option value="">Tous statuts</option>
          <option value="Titulaire">Titulaire</option>
          <option value="Vacataire">Vacataire</option>
          <option value="Contractuel">Contractuel</option>
        </select>
      </div>`;
    }

    if(id === 'stats'){
      html += `<div class="col-md-4">
        <label class="form-label small fw-semibold">Année scolaire</label>
        <select class="form-select form-select-sm" id="fRapAnnee">
          ${Storage.getAllIncludingArchived('annees').filter(a=>!a.archived).map(a=>`<option value="${a.id}" ${a.active?'selected':''}>${Utils.escapeHtml(a.libelle)}</option>`).join('')}
        </select>
      </div>`;
    }

    html += `<div class="col-md-3">
      <button class="btn btn-primary btn-sm w-100" id="btnRefreshRap">
        <i class="bi bi-arrow-clockwise me-1"></i> Actualiser
      </button>
    </div>`;

    html += '</div></div>';
    return html;
  },

  bindFiltres(id){
    const btn = document.getElementById('btnRefreshRap');
    if(btn) btn.onclick = ()=> this.generateApercu(id);

    // Écouteurs pour recalcul auto
    ['fRapClasse','fRapPeriode','fRapDateFrom','fRapDateTo','fRapStatut','fRapAnnee'].forEach(fid=>{
      const el = document.getElementById(fid);
      if(el) el.onchange = ()=> this.generateApercu(id);
    });
  },

  getFiltre(id){
    const g = (x)=>document.getElementById(x)?.value || '';
    return {
      classeId: g('fRapClasse'),
      periode: g('fRapPeriode') || (Storage.getAllIncludingArchived('annees').find(a=>a.active)?.periodes?.[0] || 'Trimestre 1'),
      dateFrom: g('fRapDateFrom'),
      dateTo: g('fRapDateTo'),
      statut: g('fRapStatut'),
      anneeId: g('fRapAnnee') || Storage.getAllIncludingArchived('annees').find(a=>a.active)?.id
    };
  },

  // ============================================================
  // GÉNÉRATION DES APERÇUS
  // ============================================================
  generateApercu(id){
    const f = this.getFiltre(id);
    let html = '';
    if(id === 'eleves')          html = this.rapEleves(f);
    else if(id === 'enseignants') html = this.rapEnseignants(f);
    else if(id === 'effectifs')   html = this.rapEffectifs(f);
    else if(id === 'absences')    html = this.rapAbsences(f);
    else if(id === 'resultats')   html = this.rapResultats(f);
    else if(id === 'financier')   html = this.rapFinancier(f);
    else if(id === 'impayes')     html = this.rapImpayes(f);
    else if(id === 'caisse')      html = this.rapCaisse(f);
    else if(id === 'stats')       html = this.rapStats(f);

    document.getElementById('rapportApercu').innerHTML = html;
  },

  // ---------- En-tête commun ----------
  headerDocument(titre, sousTitre=''){
    const p = Storage.read().parametres || {};
    const annee = Storage.getAllIncludingArchived('annees').find(a=>a.active);
    return `
      <div class="fiche-head">
        <div>
          ${p.docLigne1?`<div style="font-size:.72rem;font-weight:600">${Utils.escapeHtml(p.docLigne1)}</div>`:''}
          ${p.docLigne2?`<div style="font-size:.7rem">${Utils.escapeHtml(p.docLigne2)}</div>`:''}
          ${p.docLigne3?`<div style="font-size:.7rem">${Utils.escapeHtml(p.docLigne3)}</div>`:''}
          <h5 class="mb-0 mt-1">${Utils.escapeHtml(p.etablissement||'')}</h5>
          <small class="text-muted">${Utils.escapeHtml(p.adresse||'')} — Tél. ${Utils.escapeHtml(p.telephone||'')}</small>
        </div>
        <div class="text-end small">
          <div>Année scolaire <strong>${annee?.libelle||'—'}</strong></div>
          <div class="text-muted">Généré le ${Utils.formatDate(new Date().toISOString())}</div>
          ${sousTitre?`<div class="mt-1 small text-muted">${sousTitre}</div>`:''}
        </div>
      </div>
      <h6 class="text-center my-3 fw-bold" style="letter-spacing:1px">${Utils.escapeHtml(titre.toUpperCase())}</h6>
    `;
  },

  footerDocument(){
    const p = Storage.read().parametres || {};
    return `
      <div class="rap-footer">${Utils.escapeHtml(p.footer || p.etablissement || '')}</div>
      <div class="rap-signature">
        <div></div>
        <div class="text-center small">
          Le Directeur<br><br><br>
          ${Utils.escapeHtml(p.signDirecteur || p.directeur || '')}
        </div>
      </div>
    `;
  },

  // ---------- 1. Liste des élèves ----------
  rapEleves(f){
    let eleves = Storage.getAll('eleves');
    if(f.classeId) eleves = eleves.filter(e=>e.classeId === f.classeId);
    eleves.sort((a,b)=>a.nom.localeCompare(b.nom));

    const html = eleves.length ? `
      <table class="table table-bordered table-sm rap-table">
        <thead class="table-light">
          <tr>
            <th style="width:40px">#</th>
            <th>Matricule</th>
            <th>Nom & Prénom</th>
            <th>Sexe</th>
            <th>Date naiss.</th>
            <th>Classe</th>
            <th>Responsable</th>
            <th>Téléphone</th>
          </tr>
        </thead>
        <tbody>
          ${eleves.map((e,i)=>{
            const cls = Storage.getById('classes', e.classeId);
            return `<tr>
              <td>${i+1}</td>
              <td>${Utils.escapeHtml(e.matricule)}</td>
              <td><strong>${Utils.escapeHtml(e.prenom+' '+e.nom)}</strong></td>
              <td>${e.sexe==='M'?'M':'F'}</td>
              <td>${Utils.formatDate(e.dateNaissance)}</td>
              <td>${cls?Utils.escapeHtml(cls.nom):'—'}</td>
              <td>${Utils.escapeHtml(e.nomPere||e.nomTuteur||'—')}</td>
              <td>${Utils.escapeHtml(e.telephoneResponsable||'—')}</td>
            </tr>`;
          }).join('')}
        </tbody>
      </table>
      <div class="text-end small mt-2">Total : <strong>${eleves.length}</strong> élève(s)</div>
    ` : '<p class="text-muted text-center">Aucun élève.</p>';

    return `<div class="rap-doc">${this.headerDocument('Liste des élèves', f.classeId?('Classe : '+Storage.getById('classes', f.classeId)?.nom):'Toutes classes')}${html}${this.footerDocument()}</div>`;
  },

  // ---------- 2. Liste des enseignants ----------
  rapEnseignants(f){
    let ens = Storage.getAll('enseignants');
    if(f.statut) ens = ens.filter(e=>e.statut === f.statut);
    ens.sort((a,b)=>a.nom.localeCompare(b.nom));

    const html = ens.length ? `
      <table class="table table-bordered table-sm rap-table">
        <thead class="table-light">
          <tr>
            <th style="width:40px">#</th>
            <th>Matricule</th>
            <th>Nom & Prénom</th>
            <th>Sexe</th>
            <th>Spécialité</th>
            <th>Statut</th>
            <th>Matières</th>
            <th>Téléphone</th>
          </tr>
        </thead>
        <tbody>
          ${ens.map((e,i)=>{
            const matieres = (e.matieres||[]).map(id=>Storage.getById('matieres',id)?.nom).filter(Boolean).join(', ');
            return `<tr>
              <td>${i+1}</td>
              <td>${Utils.escapeHtml(e.matricule)}</td>
              <td><strong>${Utils.escapeHtml(e.prenom+' '+e.nom)}</strong></td>
              <td>${e.sexe==='M'?'M':'F'}</td>
              <td>${Utils.escapeHtml(e.specialite||'—')}</td>
              <td>${Utils.escapeHtml(e.statut||'—')}</td>
              <td class="small">${Utils.escapeHtml(matieres||'—')}</td>
              <td>${Utils.escapeHtml(e.telephone||'—')}</td>
            </tr>`;
          }).join('')}
        </tbody>
      </table>
      <div class="text-end small mt-2">Total : <strong>${ens.length}</strong> enseignant(s)</div>
    ` : '<p class="text-muted text-center">Aucun enseignant.</p>';

    return `<div class="rap-doc">${this.headerDocument('Liste des enseignants')}${html}${this.footerDocument()}</div>`;
  },

  // ---------- 3. Effectifs par classe ----------
  rapEffectifs(f){
    let classes = Storage.getAll('classes');
    if(f.classeId) classes = classes.filter(c=>c.id === f.classeId);

    const data = classes.map(c=>{
      const eleves = Storage.getAll('eleves').filter(e=>e.classeId === c.id);
      const g = eleves.filter(e=>e.sexe==='M').length;
      const fille = eleves.filter(e=>e.sexe==='F').length;
      const max = c.effectifMax || 40;
      return {classe: c, total: eleves.length, g, f: fille, max, pct: Math.round(eleves.length/max*100)};
    });
    data.sort((a,b)=>a.classe.nom.localeCompare(b.classe.nom));

    const totalEleves = data.reduce((s,x)=>s+x.total,0);
    const totalG = data.reduce((s,x)=>s+x.g,0);
    const totalF = data.reduce((s,x)=>s+x.f,0);

    const html = `
      <table class="table table-bordered table-sm rap-table">
        <thead class="table-light">
          <tr>
            <th>Classe</th>
            <th>Cycle</th>
            <th>Prof. principal</th>
            <th class="text-center">Garçons</th>
            <th class="text-center">Filles</th>
            <th class="text-center">Total</th>
            <th class="text-center">Max</th>
            <th class="text-center">Remplissage</th>
          </tr>
        </thead>
        <tbody>
          ${data.map(d=>{
            const prof = Storage.getById('enseignants', d.classe.profPrincipalId);
            return `<tr>
              <td><strong>${Utils.escapeHtml(d.classe.nom)}</strong></td>
              <td>${Utils.escapeHtml(d.classe.cycle||'—')}</td>
              <td>${prof?Utils.escapeHtml(prof.prenom+' '+prof.nom):'—'}</td>
              <td class="text-center">${d.g}</td>
              <td class="text-center">${d.f}</td>
              <td class="text-center fw-semibold">${d.total}</td>
              <td class="text-center text-muted">${d.max}</td>
              <td class="text-center">${d.pct}%</td>
            </tr>`;
          }).join('')}
        </tbody>
        <tfoot class="table-light fw-semibold">
          <tr>
            <td colspan="3">Total établissement</td>
            <td class="text-center">${totalG}</td>
            <td class="text-center">${totalF}</td>
            <td class="text-center">${totalEleves}</td>
            <td colspan="2"></td>
          </tr>
        </tfoot>
      </table>
    `;

    return `<div class="rap-doc">${this.headerDocument('Effectifs par classe')}${html}${this.footerDocument()}</div>`;
  },

  // ---------- 4. Absences et retards ----------
  rapAbsences(f){
    let list = Storage.getAll('absences');
    if(f.classeId){
      list = list.filter(a=>{
        const el = Storage.getById('eleves', a.eleveId);
        return el && el.classeId === f.classeId;
      });
    }
    if(f.dateFrom) list = list.filter(a=>(a.date||'') >= f.dateFrom);
    if(f.dateTo)   list = list.filter(a=>(a.date||'') <= f.dateTo);
    list.sort((a,b)=>(b.date||'').localeCompare(a.date||''));

    const html = list.length ? `
      <table class="table table-bordered table-sm rap-table">
        <thead class="table-light">
          <tr>
            <th style="width:40px">#</th>
            <th>Date</th>
            <th>Élève</th>
            <th>Classe</th>
            <th>Type</th>
            <th>Motif</th>
            <th>Statut</th>
          </tr>
        </thead>
        <tbody>
          ${list.map((a,i)=>{
            const el = Storage.getById('eleves', a.eleveId);
            const cls = el ? Storage.getById('classes', el.classeId) : null;
            return `<tr>
              <td>${i+1}</td>
              <td>${Utils.formatDate(a.date)}${a.heure?' <small>'+Utils.escapeHtml(a.heure)+'</small>':''}</td>
              <td>${el?Utils.escapeHtml(el.prenom+' '+el.nom):'—'}</td>
              <td>${cls?Utils.escapeHtml(cls.nom):'—'}</td>
              <td>${a.type==='absence'?'Absence':'Retard'}</td>
              <td>${Utils.escapeHtml(a.motif||'—')}</td>
              <td>${a.justifie?'Justifiée':'Non justifiée'}</td>
            </tr>`;
          }).join('')}
        </tbody>
      </table>
      <div class="text-end small mt-2">
        Total : <strong>${list.length}</strong> enregistrement(s) —
        Absences : <strong>${list.filter(x=>x.type==='absence').length}</strong> ·
        Retards : <strong>${list.filter(x=>x.type==='retard').length}</strong> ·
        Justifiées : <strong>${list.filter(x=>x.justifie).length}</strong>
      </div>
    ` : '<p class="text-muted text-center">Aucun enregistrement sur la période.</p>';

    return `<div class="rap-doc">${this.headerDocument('Absences et retards', `Période : ${f.dateFrom} → ${f.dateTo}`)}${html}${this.footerDocument()}</div>`;
  },

  // ---------- 5. Classements et résultats ----------
  rapResultats(f){
    if(!f.classeId){
      return `<div class="rap-doc">${this.headerDocument('Classements et résultats')}<p class="text-muted text-center py-4">Sélectionnez une classe pour générer le classement.</p>${this.footerDocument()}</div>`;
    }

    const res = Bulletins.calculerResultats(f.classeId, f.periode);
    if(!res || !res.eleves.length){
      return `<div class="rap-doc">${this.headerDocument('Classements et résultats')}<p class="text-muted text-center py-4">Aucun élève.</p>${this.footerDocument()}</div>`;
    }

    const cls = Storage.getById('classes', f.classeId);
    const sorted = res.eleves.slice().sort((a,b)=>(a.rang||9999)-(b.rang||9999));

    const html = `
      <div class="text-center small mb-3">
        <div><strong>Classe :</strong> ${Utils.escapeHtml(cls?.nom||'')} — <strong>Période :</strong> ${Utils.escapeHtml(f.periode)}</div>
        <div class="text-muted">
          Effectif : ${res.stats.effectif} · Évalués : ${res.stats.nbEvalues} ·
          Moyenne classe : <strong>${res.stats.moyClasse.toFixed(2)}</strong> ·
          Min : ${res.stats.moyMin.toFixed(2)} · Max : ${res.stats.moyMax.toFixed(2)}
        </div>
      </div>
      <table class="table table-bordered table-sm rap-table">
        <thead class="table-light">
          <tr>
            <th class="text-center" style="width:60px">Rang</th>
            <th>Matricule</th>
            <th>Nom & Prénom</th>
            <th class="text-center">Moyenne</th>
            <th class="text-center">Mention</th>
            <th class="text-center">Décision</th>
          </tr>
        </thead>
        <tbody>
          ${sorted.map(r=>`
            <tr>
              <td class="text-center fw-bold">${r.rang||'—'}</td>
              <td>${Utils.escapeHtml(r.eleve.matricule)}</td>
              <td>${Utils.escapeHtml(r.eleve.prenom+' '+r.eleve.nom)}</td>
              <td class="text-center fw-semibold">${r.moyenne!=null?r.moyenne.toFixed(2):'—'}</td>
              <td class="text-center">${Utils.escapeHtml(r.mention)}</td>
              <td class="text-center">${Utils.escapeHtml(r.decision)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;

    return `<div class="rap-doc">${this.headerDocument('Classements et résultats', 'Période : '+f.periode)}${html}${this.footerDocument()}</div>`;
  },

  // ---------- 6. Situation financière ----------
  rapFinancier(f){
    const paiements = Storage.getAll('paiements').filter(p=>p.statut !== 'annulé');
    const frais = Storage.getAll('frais');
    let eleves = Storage.getAll('eleves');
    if(f.classeId) eleves = eleves.filter(e=>e.classeId === f.classeId);

    let attendu = 0;
    eleves.forEach(el=>{
      const fraisCls = frais.filter(fr=>fr.classeId === el.classeId);
      attendu += fraisCls.reduce((s,fr)=>s+(fr.montant||0),0);
    });
    const encaisse = paiements.filter(p=>eleves.some(e=>e.id===p.eleveId))
      .reduce((s,p)=>s+(p.montantPaye||0),0);
    const impaye = Math.max(0, attendu - encaisse);
    const taux = attendu ? Math.round(encaisse/attendu*100) : 0;

    // Par mode
    const parMode = {};
    paiements.filter(p=>eleves.some(e=>e.id===p.eleveId)).forEach(p=>{
      parMode[p.mode] = (parMode[p.mode]||0) + (p.montantPaye||0);
    });

    // Par classe
    const parClasse = {};
    eleves.forEach(el=>{
      const cls = Storage.getById('classes', el.classeId);
      if(!cls) return;
      const fraisCls = frais.filter(fr=>fr.classeId === el.classeId);
      const att = fraisCls.reduce((s,fr)=>s+(fr.montant||0),0);
      const enc = paiements.filter(p=>p.eleveId===el.id).reduce((s,p)=>s+(p.montantPaye||0),0);
      if(!parClasse[cls.nom]) parClasse[cls.nom] = {att:0, enc:0};
      parClasse[cls.nom].att += att;
      parClasse[cls.nom].enc += enc;
    });

    const html = `
      <div class="row g-2 text-center mb-3">
        <div class="col-3"><div class="rap-kpi"><div class="rap-kpi-label">Attendu</div><div class="rap-kpi-value">${Utils.formatFCFA(attendu)}</div></div></div>
        <div class="col-3"><div class="rap-kpi text-success"><div class="rap-kpi-label">Encaissé</div><div class="rap-kpi-value">${Utils.formatFCFA(encaisse)}</div></div></div>
        <div class="col-3"><div class="rap-kpi text-danger"><div class="rap-kpi-label">Impayés</div><div class="rap-kpi-value">${Utils.formatFCFA(impaye)}</div></div></div>
        <div class="col-3"><div class="rap-kpi text-warning"><div class="rap-kpi-label">Taux</div><div class="rap-kpi-value">${taux}%</div></div></div>
      </div>

      <h6 class="fw-bold small mt-4">Détail par classe</h6>
      <table class="table table-bordered table-sm rap-table">
        <thead class="table-light">
          <tr>
            <th>Classe</th>
            <th class="text-end">Attendu</th>
            <th class="text-end">Encaissé</th>
            <th class="text-end">Impayé</th>
            <th class="text-center">Taux</th>
          </tr>
        </thead>
        <tbody>
          ${Object.entries(parClasse).sort().map(([nom, x])=>{
            const imp = Math.max(0, x.att - x.enc);
            const t = x.att ? Math.round(x.enc/x.att*100) : 0;
            return `<tr>
              <td><strong>${Utils.escapeHtml(nom)}</strong></td>
              <td class="text-end">${Utils.formatFCFA(x.att)}</td>
              <td class="text-end text-success">${Utils.formatFCFA(x.enc)}</td>
              <td class="text-end text-danger">${Utils.formatFCFA(imp)}</td>
              <td class="text-center">${t}%</td>
            </tr>`;
          }).join('')}
        </tbody>
      </table>

      <h6 class="fw-bold small mt-4">Répartition par mode de paiement</h6>
      <table class="table table-bordered table-sm rap-table">
        <thead class="table-light">
          <tr>
            <th>Mode</th>
            <th class="text-end">Montant</th>
            <th class="text-center">%</th>
          </tr>
        </thead>
        <tbody>
          ${Object.entries(parMode).sort((a,b)=>b[1]-a[1]).map(([mode,v])=>{
            const pct = encaisse ? Math.round(v/encaisse*100) : 0;
            return `<tr><td>${mode}</td><td class="text-end">${Utils.formatFCFA(v)}</td><td class="text-center">${pct}%</td></tr>`;
          }).join('') || '<tr><td colspan="3" class="text-center text-muted">Aucun paiement.</td></tr>'}
        </tbody>
      </table>
    `;

    return `<div class="rap-doc">${this.headerDocument('Situation financière', f.classeId?('Classe : '+Storage.getById('classes',f.classeId)?.nom):'Toutes classes')}${html}${this.footerDocument()}</div>`;
  },

  // ---------- 7. État des impayés ----------
  rapImpayes(f){
    const frais = Storage.getAll('frais');
    const paiements = Storage.getAll('paiements').filter(p=>p.statut !== 'annulé');
    let eleves = Storage.getAll('eleves');
    if(f.classeId) eleves = eleves.filter(e=>e.classeId === f.classeId);

    const impayes = [];
    eleves.forEach(el=>{
      const fraisCls = frais.filter(fr=>fr.classeId === el.classeId);
      const att = fraisCls.reduce((s,fr)=>s+(fr.montant||0),0);
      const enc = paiements.filter(p=>p.eleveId===el.id).reduce((s,p)=>s+(p.montantPaye||0),0);
      const reste = Math.max(0, att - enc);
      if(reste > 0) impayes.push({el, att, enc, reste});
    });
    impayes.sort((a,b)=>b.reste - a.reste);

    const totalReste = impayes.reduce((s,x)=>s+x.reste,0);

    const html = impayes.length ? `
      <table class="table table-bordered table-sm rap-table">
        <thead class="table-light">
          <tr>
            <th style="width:40px">#</th>
            <th>Matricule</th>
            <th>Nom & Prénom</th>
            <th>Classe</th>
            <th class="text-end">Attendu</th>
            <th class="text-end">Payé</th>
            <th class="text-end">Reste dû</th>
          </tr>
        </thead>
        <tbody>
          ${impayes.map((x,i)=>{
            const cls = Storage.getById('classes', x.el.classeId);
            return `<tr>
              <td>${i+1}</td>
              <td>${Utils.escapeHtml(x.el.matricule)}</td>
              <td>${Utils.escapeHtml(x.el.prenom+' '+x.el.nom)}</td>
              <td>${cls?Utils.escapeHtml(cls.nom):'—'}</td>
              <td class="text-end">${Utils.formatFCFA(x.att)}</td>
              <td class="text-end text-success">${Utils.formatFCFA(x.enc)}</td>
              <td class="text-end text-danger fw-semibold">${Utils.formatFCFA(x.reste)}</td>
            </tr>`;
          }).join('')}
        </tbody>
        <tfoot class="table-light fw-semibold">
          <tr>
            <td colspan="6" class="text-end">Total impayés</td>
            <td class="text-end text-danger">${Utils.formatFCFA(totalReste)}</td>
          </tr>
        </tfoot>
      </table>
      <div class="text-end small mt-2"><strong>${impayes.length}</strong> élève(s) débiteur(s)</div>
    ` : '<p class="text-success text-center py-4"><i class="bi bi-check-circle-fill me-1"></i>Aucun impayé. 🎉</p>';

    return `<div class="rap-doc">${this.headerDocument('État des impayés', f.classeId?('Classe : '+Storage.getById('classes',f.classeId)?.nom):'Toutes classes')}${html}${this.footerDocument()}</div>`;
  },

  // ---------- 8. Journal de caisse ----------
  rapCaisse(f){
    let list = Storage.getAllIncludingArchived('paiements');
    if(f.dateFrom) list = list.filter(p=>(p.date||'') >= f.dateFrom);
    if(f.dateTo)   list = list.filter(p=>(p.date||'') <= f.dateTo);
    list.sort((a,b)=>(a.date||'').localeCompare(b.date||''));

    const totaux = {
      valides: list.filter(p=>p.statut!=='annulé').reduce((s,p)=>s+(p.montantPaye||0),0),
      annules: list.filter(p=>p.statut==='annulé').reduce((s,p)=>s+(p.montantPaye||0),0)
    };

    const html = list.length ? `
      <table class="table table-bordered table-sm rap-table">
        <thead class="table-light">
          <tr>
            <th>Date</th>
            <th>Transaction</th>
            <th>Élève</th>
            <th>Motif</th>
            <th class="text-end">Montant</th>
            <th>Mode</th>
            <th>Statut</th>
            <th>Encaissé par</th>
          </tr>
        </thead>
        <tbody>
          ${list.map(p=>{
            const el = Storage.getById('eleves', p.eleveId);
            return `<tr class="${p.statut==='annulé'?'text-muted':''}">
              <td>${Utils.formatDate(p.date)}</td>
              <td><code class="small">${Utils.escapeHtml(p.transactionId)}</code></td>
              <td>${el?Utils.escapeHtml(el.prenom+' '+el.nom):'—'}</td>
              <td>${Utils.escapeHtml(p.libelle)}</td>
              <td class="text-end ${p.statut==='annulé'?'text-decoration-line-through':'fw-semibold text-success'}">${Utils.formatFCFA(p.montantPaye)}</td>
              <td>${Utils.escapeHtml(p.mode)}</td>
              <td>${p.statut==='annulé'?'Annulé':'Validé'}</td>
              <td>${Utils.escapeHtml(p.encaissePar||'—')}</td>
            </tr>`;
          }).join('')}
        </tbody>
        <tfoot class="table-light">
          <tr>
            <td colspan="4" class="text-end fw-semibold">Total validé</td>
            <td class="text-end fw-bold text-success">${Utils.formatFCFA(totaux.valides)}</td>
            <td colspan="3"></td>
          </tr>
          ${totaux.annules > 0 ? `<tr>
            <td colspan="4" class="text-end small text-muted">Total annulé</td>
            <td class="text-end small text-muted text-decoration-line-through">${Utils.formatFCFA(totaux.annules)}</td>
            <td colspan="3"></td>
          </tr>` : ''}
        </tfoot>
      </table>
      <div class="text-end small mt-2">${list.length} transaction(s) sur la période</div>
    ` : '<p class="text-muted text-center">Aucune transaction sur la période.</p>';

    return `<div class="rap-doc">${this.headerDocument('Journal de caisse', `Du ${f.dateFrom} au ${f.dateTo}`)}${html}${this.footerDocument()}</div>`;
  },

  // ---------- 9. Statistiques annuelles ----------
  rapStats(f){
    const anneeId = f.anneeId;
    const eleves = Storage.getAll('eleves').filter(e=>e.anneeId === anneeId);
    const enseignants = Storage.getAll('enseignants').filter(e=>e.anneeId === anneeId);
    const classes = Storage.getAll('classes').filter(c=>c.anneeId === anneeId);
    const paiements = Storage.getAll('paiements').filter(p=>p.anneeId === anneeId && p.statut !== 'annulé');
    const absences = Storage.getAll('absences').filter(a=>a.anneeId === anneeId);

    const g = eleves.filter(e=>e.sexe==='M').length;
    const filles = eleves.filter(e=>e.sexe==='F').length;

    // Répartition par cycle
    const parCycle = {};
    classes.forEach(c=>{
      if(!parCycle[c.cycle]) parCycle[c.cycle] = 0;
      parCycle[c.cycle] += eleves.filter(e=>e.classeId === c.id).length;
    });

    // Répartition paiements par mode
    const parMode = {};
    paiements.forEach(p=>{
      parMode[p.mode] = (parMode[p.mode]||0) + (p.montantPaye||0);
    });

    // Absences par type
    const absCount = absences.filter(a=>a.type==='absence').length;
    const retCount = absences.filter(a=>a.type==='retard').length;

    // Total encaissé
    const totalEncaisse = paiements.reduce((s,p)=>s+(p.montantPaye||0),0);

    const html = `
      <h6 class="fw-bold small mt-2">Vue d'ensemble</h6>
      <div class="row g-2 text-center mb-3">
        <div class="col-3"><div class="rap-kpi"><div class="rap-kpi-label">Élèves</div><div class="rap-kpi-value">${eleves.length}</div></div></div>
        <div class="col-3"><div class="rap-kpi"><div class="rap-kpi-label">Enseignants</div><div class="rap-kpi-value">${enseignants.length}</div></div></div>
        <div class="col-3"><div class="rap-kpi"><div class="rap-kpi-label">Classes</div><div class="rap-kpi-value">${classes.length}</div></div></div>
        <div class="col-3"><div class="rap-kpi text-success"><div class="rap-kpi-label">Recettes</div><div class="rap-kpi-value">${Utils.formatFCFA(totalEncaisse)}</div></div></div>
      </div>

      <div class="row g-3">
        <div class="col-6">
          <h6 class="fw-bold small">Répartition par sexe</h6>
          <table class="table table-bordered table-sm rap-table">
            <tbody>
              <tr><td>Garçons</td><td class="text-end">${g} (${eleves.length?Math.round(g/eleves.length*100):0}%)</td></tr>
              <tr><td>Filles</td><td class="text-end">${filles} (${eleves.length?Math.round(filles/eleves.length*100):0}%)</td></tr>
            </tbody>
          </table>
        </div>
        <div class="col-6">
          <h6 class="fw-bold small">Répartition par cycle</h6>
          <table class="table table-bordered table-sm rap-table">
            <tbody>
              ${Object.entries(parCycle).map(([k,v])=>`<tr><td>${Utils.escapeHtml(k)}</td><td class="text-end">${v}</td></tr>`).join('') || '<tr><td colspan="2" class="text-muted text-center">—</td></tr>'}
            </tbody>
          </table>
        </div>
      </div>

      <h6 class="fw-bold small mt-3">Discipline</h6>
      <table class="table table-bordered table-sm rap-table">
        <tbody>
          <tr><td>Absences enregistrées</td><td class="text-end">${absCount}</td></tr>
          <tr><td>Retards enregistrés</td><td class="text-end">${retCount}</td></tr>
          <tr><td>Total justifié</td><td class="text-end">${absences.filter(a=>a.justifie).length}</td></tr>
          <tr><td>Total non justifié</td><td class="text-end">${absences.filter(a=>!a.justifie).length}</td></tr>
        </tbody>
      </table>

      <h6 class="fw-bold small mt-3">Recettes par mode</h6>
      <table class="table table-bordered table-sm rap-table">
        <thead class="table-light"><tr><th>Mode</th><th class="text-end">Montant</th></tr></thead>
        <tbody>
          ${Object.entries(parMode).sort((a,b)=>b[1]-a[1]).map(([k,v])=>`<tr><td>${k}</td><td class="text-end">${Utils.formatFCFA(v)}</td></tr>`).join('') || '<tr><td colspan="2" class="text-muted text-center">Aucun paiement.</td></tr>'}
        </tbody>
      </table>
    `;

    return `<div class="rap-doc">${this.headerDocument('Statistiques annuelles')}${html}${this.footerDocument()}</div>`;
  },

  // ============================================================
  // EXPORT CSV
  // ============================================================
  exportCsv(){
    const id = this.state.rapportActif;
    if(!id){ Notify.toast('Aucun rapport actif.', 'danger'); return; }

    const f = this.getFiltre(id);
    let rows = [];

    if(id === 'eleves'){
      let list = Storage.getAll('eleves');
      if(f.classeId) list = list.filter(e=>e.classeId === f.classeId);
      rows = [['Matricule','Prénom','Nom','Sexe','Date naiss.','Classe','Responsable','Téléphone']];
      list.forEach(e=>{
        const cls = Storage.getById('classes', e.classeId);
        rows.push([e.matricule, e.prenom, e.nom, e.sexe, e.dateNaissance, cls?.nom||'', e.nomPere||e.nomTuteur||'', e.telephoneResponsable||'']);
      });
    }
    else if(id === 'enseignants'){
      let list = Storage.getAll('enseignants');
      if(f.statut) list = list.filter(e=>e.statut === f.statut);
      rows = [['Matricule','Prénom','Nom','Sexe','Spécialité','Statut','Téléphone','Email']];
      list.forEach(e=>{
        rows.push([e.matricule, e.prenom, e.nom, e.sexe, e.specialite||'', e.statut||'', e.telephone||'', e.email||'']);
      });
    }
    else if(id === 'effectifs'){
      let classes = Storage.getAll('classes');
      if(f.classeId) classes = classes.filter(c=>c.id === f.classeId);
      rows = [['Classe','Cycle','Effectif','Garçons','Filles','Max','Remplissage']];
      classes.forEach(c=>{
        const el = Storage.getAll('eleves').filter(e=>e.classeId === c.id);
        const g = el.filter(e=>e.sexe==='M').length;
        const fi = el.filter(e=>e.sexe==='F').length;
        const max = c.effectifMax||40;
        rows.push([c.nom, c.cycle||'', el.length, g, fi, max, Math.round(el.length/max*100)+'%']);
      });
    }
    else if(id === 'absences'){
      let list = Storage.getAll('absences');
      if(f.classeId) list = list.filter(a=>{
        const el = Storage.getById('eleves', a.eleveId);
        return el && el.classeId === f.classeId;
      });
      if(f.dateFrom) list = list.filter(a=>(a.date||'') >= f.dateFrom);
      if(f.dateTo)   list = list.filter(a=>(a.date||'') <= f.dateTo);
      rows = [['Date','Heure','Élève','Classe','Type','Motif','Justifiée']];
      list.forEach(a=>{
        const el = Storage.getById('eleves', a.eleveId);
        const cls = el ? Storage.getById('classes', el.classeId) : null;
        rows.push([a.date, a.heure||'', el?el.prenom+' '+el.nom:'', cls?.nom||'', a.type, a.motif||'', a.justifie?'Oui':'Non']);
      });
    }
    else if(id === 'resultats'){
      if(!f.classeId){ Notify.toast('Sélectionnez une classe.', 'danger'); return; }
      const res = Bulletins.calculerResultats(f.classeId, f.periode);
      const sorted = res.eleves.slice().sort((a,b)=>(a.rang||9999)-(b.rang||9999));
      rows = [['Rang','Matricule','Nom','Prénom','Moyenne','Mention','Décision']];
      sorted.forEach(r=>{
        rows.push([r.rang||'', r.eleve.matricule, r.eleve.nom, r.eleve.prenom, r.moyenne!=null?r.moyenne.toFixed(2):'', r.mention, r.decision]);
      });
    }
    else if(id === 'financier'){
      const stats = Paiements.computeStats();
      rows = [['Indicateur','Valeur']];
      rows.push(['Attendu', stats.attendu]);
      rows.push(['Encaissé', stats.encaisse]);
      rows.push(['Impayés', stats.impaye]);
      rows.push(['Taux recouvrement', stats.taux+'%']);
    }
    else if(id === 'impayes'){
      const frais = Storage.getAll('frais');
      const paiements = Storage.getAll('paiements').filter(p=>p.statut !== 'annulé');
      let eleves = Storage.getAll('eleves');
      if(f.classeId) eleves = eleves.filter(e=>e.classeId === f.classeId);
      rows = [['Matricule','Élève','Classe','Attendu','Payé','Reste']];
      eleves.forEach(el=>{
        const att = frais.filter(fr=>fr.classeId===el.classeId).reduce((s,fr)=>s+(fr.montant||0),0);
        const enc = paiements.filter(p=>p.eleveId===el.id).reduce((s,p)=>s+(p.montantPaye||0),0);
        const reste = Math.max(0, att - enc);
        if(reste > 0){
          const cls = Storage.getById('classes', el.classeId);
          rows.push([el.matricule, el.prenom+' '+el.nom, cls?.nom||'', att, enc, reste]);
        }
      });
    }
    else if(id === 'caisse'){
      let list = Storage.getAllIncludingArchived('paiements');
      if(f.dateFrom) list = list.filter(p=>(p.date||'') >= f.dateFrom);
      if(f.dateTo)   list = list.filter(p=>(p.date||'') <= f.dateTo);
      rows = [['Date','Transaction','Élève','Motif','Montant','Mode','Statut','Encaissé par']];
      list.forEach(p=>{
        const el = Storage.getById('eleves', p.eleveId);
        rows.push([p.date, p.transactionId, el?el.prenom+' '+el.nom:'', p.libelle, p.montantPaye||0, p.mode, p.statut||'validé', p.encaissePar||'']);
      });
    }
    else if(id === 'stats'){
      // Multi-sections
      const anneeId = f.anneeId;
      const eleves = Storage.getAll('eleves').filter(e=>e.anneeId === anneeId);
      const enseignants = Storage.getAll('enseignants').filter(e=>e.anneeId === anneeId);
      const classes = Storage.getAll('classes').filter(c=>c.anneeId === anneeId);
      rows = [['Indicateur','Valeur']];
      rows.push(['Élèves', eleves.length]);
      rows.push(['Garçons', eleves.filter(e=>e.sexe==='M').length]);
      rows.push(['Filles', eleves.filter(e=>e.sexe==='F').length]);
      rows.push(['Enseignants', enseignants.length]);
      rows.push(['Classes', classes.length]);
    }

    const csv = rows.map(r=>r.map(v=>`"${String(v??'').replace(/"/g,'""')}"`).join(';')).join('\n');
    const blob = new Blob(['\ufeff'+csv], {type:'text/csv;charset=utf-8;'});
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'rapport_'+id+'_'+new Date().toISOString().slice(0,10)+'.csv';
    a.click();
    Notify.toast('CSV téléchargé.', 'success');
    Auth.log('rapport_export', 'Export CSV du rapport ' + id);
  }
};