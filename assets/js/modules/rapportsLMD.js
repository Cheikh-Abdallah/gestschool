/**
 * Module : Rapports LMD (mode supérieur).
 * 3 rapports spécialisés + adaptations des rapports existants.
 */
const RapportsLMD = {
  state: {
    rapportActif: null
  },

  RAPPORTS_LMD: [
    {
      id: 'releves_niveau',
      icon: 'bi-file-earmark-ruled',
      cat: 'LMD',
      titre: 'Relevés par niveau',
      desc: 'Tous les relevés de notes d\'un groupe sur une session.'
    },
    {
      id: 'validation_credits',
      icon: 'bi-award',
      cat: 'LMD',
      titre: 'Validation des crédits',
      desc: 'Tableau UE × Étudiants : crédits acquis, résultats par UE.'
    },
    {
      id: 'attestation',
      icon: 'bi-file-earmark-medical',
      cat: 'LMD',
      titre: 'Attestation de réussite',
      desc: 'Document officiel individuel attestant la validation d\'un semestre.'
    },
    {
      id: 'stats_lmd',
      icon: 'bi-graph-up',
      cat: 'LMD',
      titre: 'Statistiques universitaires',
      desc: 'Taux de réussite par filière, niveau et groupe.'
    }
  ],

  render(container){
    this.container = container;

    container.innerHTML = `
      <div class="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3 no-print">
        <div>
          <div class="page-title">Rapports LMD</div>
          <div class="page-sub">Relevés, validations de crédits et attestations</div>
        </div>
        <button class="btn btn-outline-secondary btn-sm" id="btnBackRapports">
          <i class="bi bi-arrow-left me-1"></i> Rapports généraux
        </button>
      </div>

      <div id="rapportLMDSelector" class="no-print">
        <div class="row g-3" id="rapportLMDCards"></div>
      </div>

      <div id="rapportLMDFiltres" class="no-print" style="display:none"></div>
      <div id="rapportLMDApercu"></div>
    `;

    document.getElementById('btnBackRapports').onclick = ()=>{
      Rapports.render(document.getElementById('appContent'));
    };

    this.renderCards();
  },

  renderCards(){
    const grid = document.getElementById('rapportLMDCards');
    let html = '';
    this.RAPPORTS_LMD.forEach(r=>{
      html += `
        <div class="col-md-6 col-lg-3">
          <div class="rapport-card" data-id="${r.id}">
            <div class="rapport-icon"><i class="bi ${r.icon}"></i></div>
            <div>
              <div class="rapport-titre">${r.titre}</div>
              <div class="rapport-desc">${r.desc}</div>
            </div>
          </div>
        </div>`;
    });
    grid.innerHTML = html;

    grid.querySelectorAll('.rapport-card').forEach(card=>{
      card.onclick = ()=> this.openRapport(card.dataset.id);
    });
  },

  openRapport(id){
    this.state.rapportActif = id;
    const r = this.RAPPORTS_LMD.find(x=>x.id === id);
    if(!r) return;

    const filtres = document.getElementById('rapportLMDFiltres');
    filtres.style.display = 'block';
    filtres.innerHTML = this.renderFiltres(id);

    // Bind events
    ['fLMDGroupe','fLMDSession','fLMDEtudiant'].forEach(fid=>{
      const el = document.getElementById(fid);
      if(el) el.onchange = ()=> this.generate(id);
    });
    const btnRefresh = document.getElementById('btnRefreshLMD');
    if(btnRefresh) btnRefresh.onclick = ()=> this.generate(id);

    this.generate(id);
  },

  renderFiltres(id){
    const groupes = Storage.getAll('groupes');
    let html = '<div class="card-panel mb-3 py-3"><div class="row g-2 align-items-end">';

    // Tous les rapports LMD filtrent par groupe
    html += `<div class="col-md-4">
      <label class="form-label small fw-semibold">Groupe</label>
      <select class="form-select form-select-sm" id="fLMDGroupe">
        <option value="">— Choisir un groupe —</option>
        ${groupes.map(g=>`<option value="${g.id}">${Utils.escapeHtml(g.nom)}</option>`).join('')}
      </select>
    </div>`;

    // Attestation = étudiant individuel
    if(id === 'attestation'){
      html += `<div class="col-md-4">
        <label class="form-label small fw-semibold">Étudiant</label>
        <select class="form-select form-select-sm" id="fLMDEtudiant">
          <option value="">— Choisir un groupe d'abord —</option>
        </select>
      </div>`;
    }

    // Session pour la plupart
    if(['releves_niveau','validation_credits','attestation'].includes(id)){
      html += `<div class="col-md-3">
        <label class="form-label small fw-semibold">Session</label>
        <select class="form-select form-select-sm" id="fLMDSession">
          <option value="S1">Session 1</option>
          <option value="S2">Session 2 (Rattrapage)</option>
        </select>
      </div>`;
    }

    html += `<div class="col-md-2">
      <button class="btn btn-primary btn-sm w-100" id="btnRefreshLMD">
        <i class="bi bi-arrow-clockwise me-1"></i> Actualiser
      </button>
    </div>`;
    html += `<div class="col-md-3">
      <button class="btn btn-outline-secondary btn-sm w-100" id="btnPrintLMD">
        <i class="bi bi-printer me-1"></i> Imprimer
      </button>
    </div>`;

    html += '</div></div>';
    setTimeout(()=>{
      // Bind du bouton imprimer
      const btn = document.getElementById('btnPrintLMD');
      if(btn) btn.onclick = ()=> window.print();
      // Cascade groupe → étudiant
      const grpSel = document.getElementById('fLMDGroupe');
      if(grpSel){
        grpSel.onchange = ()=>{
          const gid = grpSel.value;
          if(id === 'attestation'){
            const etus = Storage.getAll('eleves').filter(e=>e.classeId === gid && e.typeEtudiant === 'superieur').sort((a,b)=>a.nom.localeCompare(b.nom));
            const sel = document.getElementById('fLMDEtudiant');
            if(sel) sel.innerHTML = '<option value="">— Choisir un étudiant —</option>' +
              etus.map(e=>`<option value="${e.id}">${Utils.escapeHtml(e.prenom+' '+e.nom+' ('+e.matricule+')')}</option>`).join('');
          }
          this.generate(id);
        };
      }
    }, 50);

    return html;
  },

  generate(id){
    const apercu = document.getElementById('rapportLMDApercu');
    const f = {
      groupeId: document.getElementById('fLMDGroupe')?.value,
      session: document.getElementById('fLMDSession')?.value || 'S1',
      etudiantId: document.getElementById('fLMDEtudiant')?.value
    };

    if(!f.groupeId){
      apercu.innerHTML = `<div class="card-panel"><p class="text-muted text-center mb-0">Sélectionnez un groupe pour générer le rapport.</p></div>`;
      return;
    }

    if(id === 'releves_niveau') apercu.innerHTML = this.rapRelevesNiveau(f);
    else if(id === 'validation_credits') apercu.innerHTML = this.rapValidationCredits(f);
    else if(id === 'attestation') apercu.innerHTML = this.rapAttestation(f);
    else if(id === 'stats_lmd') apercu.innerHTML = this.rapStatsLMD(f);
  },

  // ============================================================
  // EN-TÊTE COMMUN
  // ============================================================
  header(titre, sousTitre=''){
    const p = Storage.read().parametres || {};
    const annee = Storage.getAllIncludingArchived('annees').find(a=>a.active);
    return `
      <div class="fiche-head">
        <div>
          ${p.docLigne1?`<div style="font-size:.7rem;font-weight:600">${Utils.escapeHtml(p.docLigne1)}</div>`:''}
          ${p.docLigne2?`<div style="font-size:.68rem">${Utils.escapeHtml(p.docLigne2)}</div>`:''}
          <h5 class="mb-0 mt-1">${Utils.escapeHtml(p.etablissement||'')}</h5>
          <small class="text-muted">${Utils.escapeHtml(p.adresse||'')} — Tél. ${Utils.escapeHtml(p.telephone||'')}</small>
        </div>
        <div class="text-end small">
          <div>Année <strong>${annee?.libelle||'—'}</strong></div>
          <div class="text-muted">${Utils.formatDate(new Date().toISOString())}</div>
          ${sousTitre?`<div class="mt-1 small text-muted">${sousTitre}</div>`:''}
        </div>
      </div>
      <h6 class="text-center my-3 fw-bold" style="letter-spacing:1px">${Utils.escapeHtml(titre.toUpperCase())}</h6>
    `;
  },

  footer(){
    const p = Storage.read().parametres || {};
    return `
      <div class="rap-footer">${Utils.escapeHtml(p.footer||'')}</div>
      <div class="rap-signature">
        <div class="text-center small">
          Le Chef de Département<br><br><br>
          ______________________
        </div>
        <div class="text-center small">
          Le Directeur<br><br><br>
          ${Utils.escapeHtml(p.signDirecteur||p.directeur||'')}
        </div>
      </div>
    `;
  },

  // ============================================================
  // 1. Relevés par niveau (liste des étudiants avec moyennes)
  // ============================================================
  rapRelevesNiveau(f){
    const res = NotesLMD.calcMoyennes(f.groupeId, f.session);
    if(!res || !res.etudiants.length){
      return `<div class="rap-doc">${this.header('Relevés par niveau')}<p class="text-muted text-center">Aucune donnée.</p>${this.footer()}</div>`;
    }

    const grp = res.groupe;
    const niveau = Storage.getById('niveaux', grp.niveauId);
    const filiere = niveau ? Storage.getById('filieres', niveau.filiereId) : null;

    const sorted = res.etudiants.slice().sort((a,b)=>(a.rang||9999)-(b.rang||9999));

    return `
      <div class="rap-doc">
        ${this.header('Relevés de notes — '+grp.nom, `Session ${f.session} — ${filiere?.nom||''} — ${niveau?.libelle||''}`)}
        <table class="rap-table table table-bordered table-sm">
          <thead class="table-light">
            <tr>
              <th class="text-center" style="width:50px">Rang</th>
              <th>Matricule</th>
              <th>Nom & Prénom</th>
              <th class="text-center">Moy. Sem.</th>
              <th class="text-center">Crédits</th>
              <th class="text-center">Résultat</th>
            </tr>
          </thead>
          <tbody>
            ${sorted.map(r=>`
              <tr>
                <td class="text-center fw-bold">${r.rang||'—'}</td>
                <td>${Utils.escapeHtml(r.etudiant.matricule)}</td>
                <td>${Utils.escapeHtml(r.etudiant.prenom+' '+r.etudiant.nom)}</td>
                <td class="text-center fw-semibold">${r.moySemestre!=null?r.moySemestre.toFixed(2):'—'}</td>
                <td class="text-center">${r.creditsAcquis}/${r.totalCredits}</td>
                <td class="text-center"><span class="badge bg-${r.resultat==='Validé'?'success':r.resultat==='Compensé'?'primary':r.resultat.includes('Ajourné')?'warning':'danger'}-subtle text-${r.resultat==='Validé'?'success':r.resultat==='Compensé'?'primary':r.resultat.includes('Ajourné')?'warning':'danger'}">${r.resultat}</span></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        <div class="text-end small mt-2">
          ${sorted.length} étudiant(s) — 
          Validés : <strong>${sorted.filter(r=>r.resultat==='Validé').length}</strong> — 
          Compensés : <strong>${sorted.filter(r=>r.resultat==='Compensé').length}</strong> — 
          Ajournés : <strong>${sorted.filter(r=>r.resultat.includes('Ajourné')).length}</strong> — 
          Redoublants : <strong>${sorted.filter(r=>r.resultat==='Redouble').length}</strong>
        </div>
        ${this.footer()}
      </div>
    `;
  },

  // ============================================================
  // 2. Validation des crédits (tableau UE × Étudiants)
  // ============================================================
  rapValidationCredits(f){
    const res = NotesLMD.calcMoyennes(f.groupeId, f.session);
    if(!res || !res.etudiants.length){
      return `<div class="rap-doc">${this.header('Validation des crédits')}<p class="text-muted text-center">Aucune donnée.</p>${this.footer()}</div>`;
    }

    const ues = res.ues;
    const etudiants = res.etudiants.slice().sort((a,b)=>(a.rang||9999)-(b.rang||9999));

    return `
      <div class="rap-doc">
        ${this.header('Validation des crédits', res.groupe.nom + ' — Session ' + f.session)}
        <div class="table-responsive">
          <table class="rap-table table table-bordered table-sm">
            <thead class="table-light">
              <tr>
                <th rowspan="2">Étudiant</th>
                ${ues.map(u=>`<th class="text-center" style="font-size:.7rem">${Utils.escapeHtml(u.code)}<br><small>${u.creditsECTS} ECTS</small></th>`).join('')}
                <th rowspan="2" class="text-center">Total ECTS</th>
              </tr>
              <tr></tr>
            </thead>
            <tbody>
              ${etudiants.map(r=>{
                let totalAcquis = 0;
                const cells = ues.map(u=>{
                  const ueR = r.ues.find(x=>x.ue.id === u.id);
                  let cls = 'text-muted';
                  let val = '—';
                  if(ueR && ueR.moyenne != null){
                    val = ueR.moyenne.toFixed(2);
                    if(ueR.moyenne >= 10){ cls = 'text-success fw-bold'; totalAcquis += u.creditsECTS; }
                    else if(ueR.moyenne >= 8){ cls = 'text-warning fw-bold'; }
                    else { cls = 'text-danger'; }
                  }
                  return `<td class="text-center ${cls}">${val}</td>`;
                }).join('');
                return `<tr>
                  <td>${Utils.escapeHtml(r.etudiant.prenom+' '+r.etudiant.nom)}</td>
                  ${cells}
                  <td class="text-center fw-bold">${totalAcquis}/${r.totalCredits}</td>
                </tr>`;
              }).join('')}
            </tbody>
          </table>
        </div>
        <div class="small text-muted mt-2">
          <strong>Légende :</strong> 
          <span class="text-success">■ Validée (≥10)</span> — 
          <span class="text-warning">■ Rattrapage (8–9.99)</span> — 
          <span class="text-danger">■ Ajournée (<8)</span>
        </div>
        ${this.footer()}
      </div>
    `;
  },

  // ============================================================
  // 3. Attestation de réussite (individuel)
  // ============================================================
  rapAttestation(f){
    if(!f.etudiantId){
      return `<div class="rap-doc">${this.header('Attestation de réussite')}<p class="text-muted text-center">Sélectionnez un étudiant.</p>${this.footer()}</div>`;
    }

    const res = NotesLMD.calcMoyennes(f.groupeId, f.session);
    const r = res.etudiants.find(x=>x.etudiant.id === f.etudiantId);
    if(!r){
      return `<div class="rap-doc">${this.header('Attestation de réussite')}<p class="text-muted text-center">Étudiant non trouvé.</p>${this.footer()}</div>`;
    }

    const etu = r.etudiant;
    const grp = res.groupe;
    const niveau = Storage.getById('niveaux', grp.niveauId);
    const filiere = niveau ? Storage.getById('filieres', niveau.filiereId) : null;
    const param = Storage.read().parametres;
    const annee = Storage.getAllIncludingArchived('annees').find(a=>a.active);

    const isValide = r.resultat === 'Validé' || r.resultat === 'Compensé';

    return `
      <div class="rap-doc attestation">
        ${this.header('Attestation de réussite', 'Document officiel')}

        <div class="attestation-body">
          <p>Le Directeur de <strong>${Utils.escapeHtml(param.etablissement)}</strong>,</p>

          <p>Vu les résultats des délibérations du jury de la session 
            <strong>${f.session === 'S1' ? '1 (normale)' : '2 (rattrapage)'}</strong> 
            de l'année universitaire <strong>${annee?.libelle||'—'}</strong>,</p>

          <p class="text-center my-4 fs-6">
            <strong>ATTESTE QUE</strong>
          </p>

          <div class="attestation-etudiant">
            <div><strong>Nom :</strong> ${Utils.escapeHtml(etu.nom)}</div>
            <div><strong>Prénom :</strong> ${Utils.escapeHtml(etu.prenom)}</div>
            <div><strong>Matricule :</strong> ${Utils.escapeHtml(etu.matricule)}</div>
            <div><strong>INE :</strong> ${Utils.escapeHtml(etu.ine||'—')}</div>
            <div><strong>Date de naissance :</strong> ${Utils.formatDate(etu.dateNaissance)} à ${Utils.escapeHtml(etu.lieuNaissance||'—')}</div>
            <div><strong>Filière :</strong> ${filiere?Utils.escapeHtml(filiere.nom):'—'}</div>
            <div><strong>Niveau :</strong> ${niveau?Utils.escapeHtml(niveau.libelle):'—'}</div>
            <div><strong>Groupe :</strong> ${Utils.escapeHtml(grp.nom)}</div>
          </div>

          <p class="mt-4">
            ${isValide 
              ? `a <strong>validé</strong> son semestre avec une moyenne générale de <strong>${r.moySemestre.toFixed(2)}/20</strong> et a obtenu <strong>${r.creditsAcquis}/${r.totalCredits} crédits ECTS</strong> (${r.resultat}).`
              : `n'a pas validé son semestre (moyenne : ${r.moySemestre!=null?r.moySemestre.toFixed(2)+'/20':'—'}, ${r.creditsAcquis}/${r.totalCredits} crédits acquis — ${r.resultat}).`
            }
          </p>

          <p class="mt-3">
            En foi de quoi, la présente attestation lui est délivrée pour servir et valoir ce que de droit.
          </p>

          <div class="attestation-date">
            Fait à ${Utils.escapeHtml(param.adresse?.split(',').pop()?.trim()||'Dakar')}, 
            le ${Utils.formatDate(new Date().toISOString())}
          </div>

          <div class="attestation-signature">
            <div class="text-center">
              <strong>Le Directeur</strong><br><br><br><br>
              ${Utils.escapeHtml(param.signDirecteur || param.directeur || '')}<br>
              <small class="text-muted">Cachet de l'établissement</small>
            </div>
          </div>
        </div>

        <div class="rap-footer">${Utils.escapeHtml(param.footer||'')} — Document non contractuel sans cachet officiel.</div>
      </div>
    `;
  },

  // ============================================================
  // 4. Statistiques universitaires
  // ============================================================
  rapStatsLMD(f){
    // Parcourir toutes les filières et niveaux pour statistiques globales
    const filieres = Storage.getAll('filieres');
    const groupes = Storage.getAll('groupes');
    const session = f.session;

    // Calculer les stats par filière
    const statsParFiliere = filieres.map(fil=>{
      const niveauxFil = Storage.getAll('niveaux').filter(n=>n.filiereId === fil.id);
      const grpIds = groupes.filter(g=>niveauxFil.some(n=>n.id === g.niveauId)).map(g=>g.id);

      let totalEtudiants = 0, totalValides = 0, totalCreditsAcquis = 0, totalCredits = 0;
      grpIds.forEach(gid=>{
        const res = NotesLMD.calcMoyennes(gid, session);
        if(res){
          totalEtudiants += res.etudiants.length;
          res.etudiants.forEach(r=>{
            if(r.resultat === 'Validé' || r.resultat === 'Compensé') totalValides++;
            totalCreditsAcquis += r.creditsAcquis;
            totalCredits += r.totalCredits;
          });
        }
      });

      return {
        filiere: fil,
        nbNiveaux: niveauxFil.length,
        nbGroupes: grpIds.length,
        nbEtudiants: totalEtudiants,
        nbValides: totalValides,
        tauxReussite: totalEtudiants ? Math.round(totalValides/totalEtudiants*100) : 0,
        tauxCredits: totalCredits ? Math.round(totalCreditsAcquis/totalCredits*100) : 0
      };
    });

    const totalGlobal = {
      etudiants: statsParFiliere.reduce((s,f)=>s+f.nbEtudiants,0),
      valides: statsParFiliere.reduce((s,f)=>s+f.nbValides,0),
      taux: 0
    };
    totalGlobal.taux = totalGlobal.etudiants ? Math.round(totalGlobal.valides/totalGlobal.etudiants*100) : 0;

    return `
      <div class="rap-doc">
        ${this.header('Statistiques universitaires', `Session ${session} — Toutes filières`)}
        
        <div class="row g-2 text-center mb-3">
          <div class="col-3"><div class="rap-kpi"><div class="rap-kpi-label">Filières</div><div class="rap-kpi-value">${filieres.length}</div></div></div>
          <div class="col-3"><div class="rap-kpi"><div class="rap-kpi-label">Étudiants</div><div class="rap-kpi-value">${totalGlobal.etudiants}</div></div></div>
          <div class="col-3"><div class="rap-kpi text-success"><div class="rap-kpi-label">Validés</div><div class="rap-kpi-value">${totalGlobal.valides}</div></div></div>
          <div class="col-3"><div class="rap-kpi text-warning"><div class="rap-kpi-label">Taux réussite</div><div class="rap-kpi-value">${totalGlobal.taux}%</div></div></div>
        </div>

        <h6 class="fw-bold mt-3">Détail par filière</h6>
        <table class="rap-table table table-bordered table-sm">
          <thead class="table-light">
            <tr>
              <th>Filière</th>
              <th class="text-center">Cycle</th>
              <th class="text-center">Niveaux</th>
              <th class="text-center">Groupes</th>
              <th class="text-center">Étudiants</th>
              <th class="text-center">Validés</th>
              <th class="text-center">Taux réussite</th>
              <th class="text-center">% Crédits</th>
            </tr>
          </thead>
          <tbody>
            ${statsParFiliere.map(s=>`
              <tr>
                <td><strong>${Utils.escapeHtml(s.filiere.nom)}</strong></td>
                <td class="text-center"><span class="badge-cycle ${(s.filiere.cycle||'').toLowerCase()}">${Utils.escapeHtml(s.filiere.cycle)}</span></td>
                <td class="text-center">${s.nbNiveaux}</td>
                <td class="text-center">${s.nbGroupes}</td>
                <td class="text-center">${s.nbEtudiants}</td>
                <td class="text-center text-success fw-bold">${s.nbValides}</td>
                <td class="text-center fw-bold">${s.tauxReussite}%</td>
                <td class="text-center">${s.tauxCredits}%</td>
              </tr>
            `).join('')}
          </tbody>
          <tfoot class="table-light fw-bold">
            <tr>
              <td colspan="4">Total établissement</td>
              <td class="text-center">${totalGlobal.etudiants}</td>
              <td class="text-center text-success">${totalGlobal.valides}</td>
              <td class="text-center">${totalGlobal.taux}%</td>
              <td></td>
            </tr>
          </tfoot>
        </table>

        <h6 class="fw-bold mt-4">Détail par niveau</h6>
        <table class="rap-table table table-bordered table-sm">
          <thead class="table-light">
            <tr>
              <th>Niveau</th>
              <th>Filière</th>
              <th class="text-center">Groupes</th>
              <th class="text-center">Étudiants</th>
              <th class="text-center">Taux réussite</th>
            </tr>
          </thead>
          <tbody>
            ${Storage.getAll('niveaux').map(niv=>{
              const fil = Storage.getById('filieres', niv.filiereId);
              const grpIds = groupes.filter(g=>g.niveauId === niv.id).map(g=>g.id);
              let total = 0, valides = 0;
              grpIds.forEach(gid=>{
                const res = NotesLMD.calcMoyennes(gid, session);
                if(res){
                  total += res.etudiants.length;
                  valides += res.etudiants.filter(r=>r.resultat === 'Validé' || r.resultat === 'Compensé').length;
                }
              });
              const taux = total ? Math.round(valides/total*100) : 0;
              return `<tr>
                <td><strong>${Utils.escapeHtml(niv.libelle)}</strong></td>
                <td>${fil?Utils.escapeHtml(fil.code):'—'}</td>
                <td class="text-center">${grpIds.length}</td>
                <td class="text-center">${total}</td>
                <td class="text-center fw-bold ${taux>=70?'text-success':taux>=50?'text-warning':'text-danger'}">${taux}%</td>
              </tr>`;
            }).join('')}
          </tbody>
        </table>

        ${this.footer()}
      </div>
    `;
  }
};