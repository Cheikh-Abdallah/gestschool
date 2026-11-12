/**
 * Module : Relevés de notes LMD (mode supérieur).
 * Génération individuelle ou en lot, format A4 officiel.
 */
const BulletinsLMD = {
  state: { groupeId:'', session:'S1', etudiantId:'', mode:'individuel' },

  render(container){
    this.container = container;
    const groupes = Storage.getAll('groupes');
    const annee = Storage.getAllIncludingArchived('annees').find(a=>a.active);

    container.innerHTML = `
      <div class="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3 no-print">
        <div>
          <div class="page-title">Relevés de notes LMD</div>
          <div class="page-sub">Année ${annee?.libelle||''} — Relevés officiels avec crédits ECTS</div>
        </div>
      </div>

      <div class="card-panel no-print">
        <div class="row g-3 align-items-end">
          <div class="col-md-4">
            <label class="form-label small fw-semibold">Groupe</label>
            <select class="form-select" id="bulGrpLMD">
              <option value="">— Choisir un groupe —</option>
              ${groupes.map(g=>`<option value="${g.id}">${Utils.escapeHtml(g.nom)}</option>`).join('')}
            </select>
          </div>
          <div class="col-md-3">
            <label class="form-label small fw-semibold">Session</label>
            <select class="form-select" id="bulSessionLMD">
              <option value="S1">Session 1 (normale)</option>
              <option value="S2">Session 2 (rattrapage)</option>
            </select>
          </div>
          <div class="col-md-5">
            <label class="form-label small fw-semibold">Mode</label>
            <div class="d-flex gap-3">
              <div class="form-check">
                <input class="form-check-input" type="radio" name="bulModeLMD" id="modeIndivLMD" value="individuel" checked>
                <label class="form-check-label small" for="modeIndivLMD">Individuel</label>
              </div>
              <div class="form-check">
                <input class="form-check-input" type="radio" name="bulModeLMD" id="modeLotLMD" value="lot">
                <label class="form-check-label small" for="modeLotLMD">Toute la classe</label>
              </div>
            </div>
          </div>
          <div class="col-md-4" id="wrapEtuLMD">
            <label class="form-label small fw-semibold">Étudiant</label>
            <select class="form-select" id="bulEtuLMD">
              <option value="">— Choisir un groupe d'abord —</option>
            </select>
          </div>
          <div class="col-md-8 d-flex gap-2">
            <button class="btn btn-primary" id="btnGenLMD">
              <i class="bi bi-file-earmark-text me-1"></i> Générer
            </button>
            <button class="btn btn-outline-secondary d-none" id="btnPrintLMD">
              <i class="bi bi-printer me-1"></i> Imprimer / PDF
            </button>
          </div>
        </div>
      </div>

      <div id="bulLMDPreview"></div>
    `;

    document.getElementById('bulGrpLMD').onchange = ()=>{
      const gid = document.getElementById('bulGrpLMD').value;
      const etus = Storage.getAll('eleves').filter(e=>e.classeId === gid && e.typeEtudiant === 'superieur').sort((a,b)=>a.nom.localeCompare(b.nom));
      document.getElementById('bulEtuLMD').innerHTML = '<option value="">— Choisir un étudiant —</option>' +
        etus.map(e=>`<option value="${e.id}">${Utils.escapeHtml(e.prenom+' '+e.nom+' ('+e.matricule+')')}</option>`).join('');
    };
    document.querySelectorAll('input[name="bulModeLMD"]').forEach(r=>{
      r.onchange = ()=>{
        this.state.mode = r.value;
        document.getElementById('wrapEtuLMD').style.display = r.value==='individuel'?'block':'none';
      };
    });
    document.getElementById('btnGenLMD').onclick = ()=> this.generer();
    document.getElementById('btnPrintLMD').onclick = ()=> window.print();
  },

  generer(){
    const gid = document.getElementById('bulGrpLMD').value;
    const session = document.getElementById('bulSessionLMD').value;
    const mode = document.querySelector('input[name="bulModeLMD"]:checked').value;

    if(!gid){ Notify.toast('Sélectionnez un groupe.', 'danger'); return; }
    if(mode === 'individuel' && !document.getElementById('bulEtuLMD').value){
      Notify.toast('Sélectionnez un étudiant.', 'danger'); return;
    }

    const res = NotesLMD.calcMoyennes(gid, session);
    if(!res){ Notify.toast('Données introuvables.', 'danger'); return; }

    if(mode === 'individuel'){
      const eid = document.getElementById('bulEtuLMD').value;
      const r = res.etudiants.find(x=>x.etudiant.id === eid);
      if(!r){ Notify.toast('Étudiant non trouvé.', 'danger'); return; }
      document.getElementById('bulLMDPreview').innerHTML = this.renderBulletin(r, res, session);
    } else {
      const html = res.etudiants
        .sort((a,b)=>(a.rang||9999)-(b.rang||9999))
        .map((r,i)=>`<div class="${i>0?'page-break':''}">${this.renderBulletin(r, res, session)}</div>`)
        .join('');
      document.getElementById('bulLMDPreview').innerHTML = html;
    }

    document.getElementById('btnPrintLMD').classList.remove('d-none');
    Notify.toast('Relevé(s) généré(s).', 'success');
    window.scrollTo({top:0, behavior:'smooth'});
  },

  renderBulletin(resultat, resultats, session){
    const param = Storage.read().parametres;
    const annee = Storage.getAllIncludingArchived('annees').find(a=>a.active);
    const etu = resultat.etudiant;
    const grp = resultats.groupe;
    const niveau = Storage.getById('niveaux', grp.niveauId);
    const filiere = niveau ? Storage.getById('filieres', niveau.filiereId) : null;

    const moyTxt = resultat.moySemestre != null ? resultat.moySemestre.toFixed(2) : '—';
    const rangTxt = resultat.rang ? `${resultat.rang}/${resultats.etudiants.length}` : '—';

    // Lignes UE avec ECUE
    const lignesUE = resultat.ues.map(ueR=>{
      const ue = ueR.ue;
      const ecuesHtml = ueR.ecues.map(ecR=>`
        <tr class="ecue-row">
          <td class="pl-4">↳ ${Utils.escapeHtml(ecR.ecue.nom)}</td>
          <td class="text-center">${ecR.ecue.coefficient}</td>
          <td class="text-center">${ecR.moyenne!=null?ecR.moyenne.toFixed(2):'—'}</td>
          <td colspan="2"></td>
        </tr>
      `).join('');

      return `<tr class="ue-header">
        <td colspan="2"><strong>${Utils.escapeHtml(ue.code)} — ${Utils.escapeHtml(ue.nom)}</strong> <span class="badge-type-ue ${(ue.typeUE||'').toLowerCase()}">${ue.typeUE}</span></td>
        <td class="text-center"></td>
        <td class="text-center"><span class="badge-ects">${ue.creditsECTS} ECTS</span></td>
        <td class="text-center fw-bold">${ueR.moyenne!=null?ueR.moyenne.toFixed(2):'—'}</td>
      </tr>
      ${ecuesHtml}`;
    }).join('');

    return `
      <div class="bulletin-a4 releve-lmd">
        <div class="bul-head">
          <div class="bul-head-left">
            <div class="bul-logo">${param.logo?`<img src="${param.logo}">`:`<i class="bi bi-mortarboard-fill"></i>`}</div>
            <div>
              <div class="bul-ecole">${Utils.escapeHtml(param.etablissement)}</div>
              <div class="bul-ecole-sub">${Utils.escapeHtml(param.adresse)}</div>
              <div class="bul-ecole-sub">Tél : ${Utils.escapeHtml(param.telephone)}</div>
            </div>
          </div>
          <div class="bul-head-right">
            <div class="bul-annee">Année universitaire ${annee?.libelle||'—'}</div>
            <div class="bul-periode">Session ${session === 'S1' ? '1' : '2 (Rattrapage)'}</div>
          </div>
        </div>

        <div class="bul-title">RELEVÉ DE NOTES</div>

        <div class="bul-infos">
          <div class="bul-infos-grid">
            <div><strong>Matricule :</strong> ${Utils.escapeHtml(etu.matricule)}</div>
            <div><strong>INE :</strong> ${Utils.escapeHtml(etu.ine||'—')}</div>
            <div><strong>Nom :</strong> ${Utils.escapeHtml(etu.nom)}</div>
            <div><strong>Prénom :</strong> ${Utils.escapeHtml(etu.prenom)}</div>
            <div><strong>Filière :</strong> ${filiere?Utils.escapeHtml(filiere.nom):'—'}</div>
            <div><strong>Niveau :</strong> ${niveau?Utils.escapeHtml(niveau.libelle):'—'}</div>
            <div><strong>Groupe :</strong> ${Utils.escapeHtml(grp.nom)}</div>
            <div><strong>Rang :</strong> <strong>${rangTxt}</strong></div>
          </div>
        </div>

        <table class="bul-table releve-table">
          <thead>
            <tr>
              <th>UE / ECUE</th>
              <th class="text-center" style="width:50px">Coef</th>
              <th class="text-center" style="width:70px">Moy /20</th>
              <th class="text-center" style="width:70px">ECTS</th>
              <th class="text-center" style="width:90px">Résultat UE</th>
            </tr>
          </thead>
          <tbody>
            ${lignesUE}
          </tbody>
        </table>

        <div class="bul-resultats">
          <div class="bul-res-col">
            <div class="bul-res-label">Moy. Semestre</div>
            <div class="bul-res-value bul-moy-gen-big">${moyTxt}/20</div>
          </div>
          <div class="bul-res-col">
            <div class="bul-res-label">Crédits acquis</div>
            <div class="bul-res-value">${resultat.creditsAcquis}/${resultat.totalCredits}</div>
          </div>
          <div class="bul-res-col">
            <div class="bul-res-label">Décision</div>
            <div class="bul-res-value bul-decision">${resultat.resultat}</div>
          </div>
        </div>

        <div class="bul-appreciation">
          <div class="bul-appr-title">Appréciation du jury</div>
          <div class="bul-appr-text">${Utils.escapeHtml(this.getAppreciation(resultat))}</div>
        </div>

        <div class="bul-signatures">
          <div>
            <div class="bul-sign-label">Responsable pédagogique</div>
            <div class="bul-sign-line"></div>
          </div>
          <div>
            <div class="bul-sign-label">Le Directeur</div>
            <div class="bul-sign-name">${Utils.escapeHtml(param.directeur||'')}</div>
            <div class="bul-sign-line"></div>
          </div>
          <div>
            <div class="bul-sign-label">Cachet de l'établissement</div>
            <div class="bul-sign-line"></div>
          </div>
        </div>

        <div class="bul-footer">
          Relevé généré le ${Utils.formatDate(new Date().toISOString())} — ${Utils.escapeHtml(param.etablissement)}
        </div>
      </div>
    `;
  },

  getAppreciation(r){
    if(r.moySemestre == null) return 'Étudiant non évalué.';
    if(r.resultat === 'Validé') return `Semestre validé avec ${r.creditsAcquis}/${r.totalCredits} crédits ECTS. Félicitations.`;
    if(r.resultat === 'Compensé') return `Semestre compensé. ${r.creditsAcquis}/${r.totalCredits} crédits acquis par compensation.`;
    if(r.resultat.includes('Ajourné')) return `Ajourné(e). Doit passer les UE en rattrapage (session 2).`;
    return `Résultats insuffisants. Redoublement recommandé.`;
  }
};