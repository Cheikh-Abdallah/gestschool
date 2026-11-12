/**
 * Module 9 : Bulletins scolaires.
 * Génération individuelle ou en lot, calculs pondérés,
 * rangs, moyennes de classe, mentions et impressions A4.
 */
const Bulletins = {
  POIDS: {
    'Interrogation': 1,
    'Devoir': 2,
    'Évaluation continue': 2,
    'Composition': 3,
    'Examen': 4
  },

  state: {
    classeId: '',
    periode: '',
    eleveId: '',
    mode: 'individuel' // 'individuel' | 'lot'
  },

  render(container){
    this.container = container;
    const classes = Storage.getAll('classes');
    const anneeActive = Storage.getAllIncludingArchived('annees').find(a=>a.active);
    const periodes = anneeActive?.periodes || ['Trimestre 1','Trimestre 2','Trimestre 3'];

    container.innerHTML = `
      <div class="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3 no-print">
        <div>
          <div class="page-title">Bulletins scolaires</div>
          <div class="page-sub">Génération, aperçu et impression A4 · ${anneeActive?.libelle||''}</div>
        </div>
      </div>

      <div class="card-panel no-print">
        <div class="row g-3 align-items-end">
          <div class="col-md-4">
            <label class="form-label small fw-semibold">Classe</label>
            <select class="form-select" id="bulClasse">
              <option value="">— Choisir une classe —</option>
              ${classes.map(c=>`<option value="${c.id}">${Utils.escapeHtml(c.nom)}</option>`).join('')}
            </select>
          </div>
          <div class="col-md-3">
            <label class="form-label small fw-semibold">Période</label>
            <select class="form-select" id="bulPeriode">
              ${periodes.map(p=>`<option value="${p}">${p}</option>`).join('')}
            </select>
          </div>
          <div class="col-md-5">
            <label class="form-label small fw-semibold">Mode de génération</label>
            <div class="d-flex gap-2">
              <div class="form-check form-check-inline">
                <input class="form-check-input" type="radio" name="bulMode" id="bulModeIndiv" value="individuel" checked>
                <label class="form-check-label small" for="bulModeIndiv">Individuel</label>
              </div>
              <div class="form-check form-check-inline">
                <input class="form-check-input" type="radio" name="bulMode" id="bulModeLot" value="lot">
                <label class="form-check-label small" for="bulModeLot">Toute la classe</label>
              </div>
            </div>
          </div>

          <div class="col-md-4" id="wrapEleve">
            <label class="form-label small fw-semibold">Élève</label>
            <select class="form-select" id="bulEleve">
              <option value="">— Choisir une classe d'abord —</option>
            </select>
          </div>

          <div class="col-md-8 d-flex gap-2">
            <button class="btn btn-primary" id="btnGenerer">
              <i class="bi bi-file-earmark-text me-1"></i> Générer
            </button>
            <button class="btn btn-outline-secondary d-none" id="btnImprimer">
              <i class="bi bi-printer me-1"></i> Imprimer / PDF
            </button>
          </div>
        </div>
      </div>

      <div id="bulApercu"></div>
    `;

    this.bindEvents(classes, periodes);
  },

  bindEvents(classes, periodes){
    document.getElementById('bulClasse').onchange = ()=>{
      this.state.classeId = document.getElementById('bulClasse').value;
      this.populateEleves();
    };
    document.getElementById('bulPeriode').onchange = ()=>{
      this.state.periode = document.getElementById('bulPeriode').value;
    };
    document.getElementById('bulEleve').onchange = ()=>{
      this.state.eleveId = document.getElementById('bulEleve').value;
    };
    document.querySelectorAll('input[name="bulMode"]').forEach(r=>{
      r.onchange = ()=>{
        this.state.mode = r.value;
        document.getElementById('wrapEleve').style.display = r.value==='individuel'?'block':'none';
      };
    });
    document.getElementById('btnGenerer').onclick = ()=> this.generer();
    document.getElementById('btnImprimer').onclick = ()=> window.print();

    // Pré-remplir
    this.state.periode = document.getElementById('bulPeriode').value;
  },

  populateEleves(){
    const sel = document.getElementById('bulEleve');
    const classeId = document.getElementById('bulClasse').value;
    if(!classeId){
      sel.innerHTML = '<option value="">— Choisir une classe d\'abord —</option>';
      return;
    }
    const eleves = Storage.getAll('eleves')
      .filter(e=>e.classeId===classeId)
      .sort((a,b)=>a.nom.localeCompare(b.nom));
    sel.innerHTML = '<option value="">— Choisir un élève —</option>' +
      eleves.map(e=>`<option value="${e.id}">${Utils.escapeHtml(e.prenom+' '+e.nom+' ('+e.matricule+')')}</option>`).join('');
  },

  // ============================================================
  // CALCULS CENTRAUX
  // ============================================================

  /**
   * Calcule les résultats d'une classe pour une période donnée.
   * Retourne un objet {
   *   classe, matieres, eleves: [{eleve, notesParMatiere, moyenne, rang, mention, decision}],
   *   stats: {moyClasse, moyMin, moyMax, effectif}
   * }
   */
  calculerResultats(classeId, periode){
    const classe = Storage.getById('classes', classeId);
    if(!classe) return null;

    const eleves = Storage.getAll('eleves')
      .filter(e=>e.classeId === classeId)
      .sort((a,b)=>a.nom.localeCompare(b.nom));

    // Matières de la classe
    const matieres = Storage.getAll('matieres')
      .filter(m => (m.classeIds||[]).includes(classeId))
      .sort((a,b)=>a.nom.localeCompare(b.nom));

    // Évaluations de la période
    const evals = Storage.getAll('evaluations').filter(ev=>
      ev.classeId === classeId && ev.periode === periode
    );

    const allNotes = Storage.getAll('notes');

    // Calcul par élève
    const resultats = eleves.map(el=>{
      let totalPoints = 0, totalCoef = 0;
      const notesParMatiere = [];

      matieres.forEach(mat=>{
        const matEvals = evals.filter(ev=>ev.matiereId === mat.id);
        let sumNotes = 0, sumPoids = 0;
        const notesBrutes = [];

        matEvals.forEach(ev=>{
          const note = allNotes.find(n=>n.evaluationId===ev.id && n.eleveId===el.id);
          if(note && note.statut==='noté' && note.valeur != null){
            const poids = this.POIDS[ev.type] || 1;
            sumNotes += note.valeur * poids;
            sumPoids += poids;
            notesBrutes.push({type: ev.type, note: note.valeur, poids});
          }
        });

        let moyMat = null;
        let notePond = null;
        if(sumPoids > 0){
          moyMat = sumNotes / sumPoids;
          notePond = moyMat * mat.coefficient;
          totalPoints += notePond;
          totalCoef += mat.coefficient;
        }

        notesParMatiere.push({
          matiere: mat,
          notesBrutes,
          moyenne: moyMat,
          notePond,
          appreciation: moyMat!=null ? this.getAppreciation(moyMat) : '—'
        });
      });

      const moyenne = totalCoef > 0 ? totalPoints / totalCoef : null;

      return {
        eleve: el,
        notesParMatiere,
        totalPoints,
        totalCoef,
        moyenne,
        rang: null,
        mention: moyenne!=null ? this.getMention(moyenne) : '—',
        decision: moyenne!=null ? this.getDecision(moyenne) : '—'
      };
    });

    // Rangs (sur les élèves notés)
    const notes = resultats.filter(r=>r.moyenne != null).sort((a,b)=>b.moyenne - a.moyenne);
    let lastMoy = null, lastRang = 0;
    notes.forEach((r, i)=>{
      if(lastMoy != null && Math.abs(r.moyenne - lastMoy) < 0.01){
        r.rang = lastRang;
      } else {
        r.rang = i+1;
        lastRang = i+1;
        lastMoy = r.moyenne;
      }
    });

    // Stats classe
    const moyennes = notes.map(r=>r.moyenne);
    const stats = {
      moyClasse: moyennes.length ? moyennes.reduce((a,b)=>a+b,0)/moyennes.length : 0,
      moyMin: moyennes.length ? Math.min(...moyennes) : 0,
      moyMax: moyennes.length ? Math.max(...moyennes) : 0,
      effectif: eleves.length,
      nbEvalues: notes.length
    };

    return { classe, matieres, eleves: resultats, stats };
  },

  getMention(moy){
    if(moy >= 16) return 'Excellent';
    if(moy >= 14) return 'Très bien';
    if(moy >= 12) return 'Bien';
    if(moy >= 10) return 'Passable';
    if(moy >= 8)  return 'Insuffisant';
    return 'Faible';
  },

  getDecision(moy){
    return moy >= 10 ? 'Admis' : 'Redouble';
  },

  getAppreciation(moy){
    if(moy >= 16) return 'Excellent travail';
    if(moy >= 14) return 'Très bon travail';
    if(moy >= 12) return 'Bon travail';
    if(moy >= 10) return 'Travail satisfaisant';
    if(moy >= 8)  return 'Doit fournir plus d\'efforts';
    return 'Résultats insuffisants';
  },

  getAppreciationGenerale(moy){
    if(moy >= 16) return 'Félicitations. Excellent trimestre, continuez ainsi.';
    if(moy >= 14) return 'Encouragements. Très bon travail d\'ensemble.';
    if(moy >= 12) return 'Bon travail. Poursuivez vos efforts.';
    if(moy >= 10) return 'Résultats satisfaisants. Peut mieux faire.';
    if(moy >= 8)  return 'Résultats insuffisants. Un travail plus régulier est nécessaire.';
    return 'Résultats très faibles. Un accompagnement est recommandé.';
  },

  // ============================================================
  // GÉNÉRATION
  // ============================================================

  generer(){
    const classeId = document.getElementById('bulClasse').value;
    const periode = document.getElementById('bulPeriode').value;
    const mode = this.state.mode;

    if(!classeId){
      Notify.toast('Sélectionnez une classe.', 'danger');
      return;
    }
    if(mode === 'individuel' && !document.getElementById('bulEleve').value){
      Notify.toast('Sélectionnez un élève.', 'danger');
      return;
    }

    const resultats = this.calculerResultats(classeId, periode);
    if(!resultats){
      Notify.toast('Données introuvables.', 'danger');
      return;
    }

    if(mode === 'individuel'){
      const eleveId = document.getElementById('bulEleve').value;
      const r = resultats.eleves.find(x=>x.eleve.id === eleveId);
      if(!r){
        Notify.toast('Élève introuvable dans cette classe.', 'danger');
        return;
      }
      document.getElementById('bulApercu').innerHTML = this.renderBulletin(r, resultats, periode);
    } else {
      // Lot : tous les élèves avec page-break entre chacun
      const html = resultats.eleves
        .sort((a,b)=>(a.rang||9999)-(b.rang||9999))
        .map((r, i)=> `<div class="${i>0?'page-break':''}">${this.renderBulletin(r, resultats, periode)}</div>`)
        .join('');
      document.getElementById('bulApercu').innerHTML = html;
    }

    document.getElementById('btnImprimer').classList.remove('d-none');
    Notify.toast('Bulletin(s) généré(s).', 'success');
    window.scrollTo({top:0, behavior:'smooth'});
  },

  renderBulletin(resultat, resultats, periode){
    const param = Storage.read().parametres;
    const annee = Storage.getAllIncludingArchived('annees').find(a=>a.active);
    const el = resultat.eleve;
    const cls = resultats.classe;
    const stats = resultats.stats;

    // Rang affichage
    const rangTxt = resultat.rang ? `${resultat.rang}${this.getOrdinal(resultat.rang)} / ${stats.effectif}` : 'Non évalué';
    const moyTxt = resultat.moyenne!=null ? resultat.moyenne.toFixed(2) : '—';

    // Moyenne de classe affichée à 2 décimales
    const moyClasseTxt = stats.moyClasse.toFixed(2);

    // Lignes du tableau des notes
    const lignes = resultat.notesParMatiere.map(npm=>{
      const moy = npm.moyenne!=null ? npm.moyenne.toFixed(2) : '—';
      const pond = npm.notePond!=null ? npm.notePond.toFixed(2) : '—';
      return `<tr>
        <td>${Utils.escapeHtml(npm.matiere.nom)}</td>
        <td class="text-center">${npm.matiere.coefficient}</td>
        <td class="text-center">${moy}</td>
        <td class="text-center">${pond}</td>
        <td class="text-center small">${Utils.escapeHtml(npm.appreciation)}</td>
      </tr>`;
    }).join('');

    // Ligne moyenne finale
    const totalCoef = resultat.notesParMatiere.reduce((s,n)=>s+(n.moyenne!=null?n.matiere.coefficient:0),0);

    return `
      <div class="bulletin-a4">
        <!-- EN-TÊTE -->
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
            <div class="bul-annee">Année scolaire ${annee?.libelle||'—'}</div>
            <div class="bul-periode">${Utils.escapeHtml(periode)}</div>
          </div>
        </div>

        <div class="bul-title">BULLETIN DE NOTES</div>

        <!-- INFOS ÉLÈVE -->
        <div class="bul-infos">
          <div class="bul-infos-grid">
            <div><strong>Matricule :</strong> ${Utils.escapeHtml(el.matricule)}</div>
            <div><strong>Nom :</strong> ${Utils.escapeHtml(el.nom)}</div>
            <div><strong>Prénom :</strong> ${Utils.escapeHtml(el.prenom)}</div>
            <div><strong>Sexe :</strong> ${el.sexe==='M'?'Masculin':'Féminin'}</div>
            <div><strong>Classe :</strong> ${Utils.escapeHtml(cls.nom)}</div>
            <div><strong>Effectif :</strong> ${stats.effectif}</div>
            <div><strong>Date de naissance :</strong> ${Utils.formatDate(el.dateNaissance)}</div>
            <div><strong>Rang :</strong> <strong class="bul-rang">${rangTxt}</strong></div>
          </div>
        </div>

        <!-- TABLEAU NOTES -->
        <table class="bul-table">
          <thead>
            <tr>
              <th>Matières</th>
              <th class="text-center" style="width:70px">Coef</th>
              <th class="text-center" style="width:80px">Moyenne /20</th>
              <th class="text-center" style="width:90px">Notes pondérées</th>
              <th class="text-center">Appréciation</th>
            </tr>
          </thead>
          <tbody>
            ${lignes}
          </tbody>
          <tfoot>
            <tr>
              <td class="fw-bold">Total</td>
              <td class="text-center fw-bold">${totalCoef}</td>
              <td class="text-center fw-bold bul-moy-gen">${moyTxt}</td>
              <td class="text-center fw-bold">${resultat.totalPoints.toFixed(2)}</td>
              <td></td>
            </tr>
          </tfoot>
        </table>

        <!-- RÉSULTATS -->
        <div class="bul-resultats">
          <div class="bul-res-col">
            <div class="bul-res-label">Moyenne générale</div>
            <div class="bul-res-value bul-moy-gen-big">${moyTxt}/20</div>
          </div>
          <div class="bul-res-col">
            <div class="bul-res-label">Moyenne de classe</div>
            <div class="bul-res-value">${moyClasseTxt}/20</div>
          </div>
          <div class="bul-res-col">
            <div class="bul-res-label">Moyenne min.</div>
            <div class="bul-res-value">${stats.moyMin.toFixed(2)}</div>
          </div>
          <div class="bul-res-col">
            <div class="bul-res-label">Moyenne max.</div>
            <div class="bul-res-value">${stats.moyMax.toFixed(2)}</div>
          </div>
          <div class="bul-res-col">
            <div class="bul-res-label">Mention</div>
            <div class="bul-res-value bul-mention">${Utils.escapeHtml(resultat.mention)}</div>
          </div>
          <div class="bul-res-col">
            <div class="bul-res-label">Décision</div>
            <div class="bul-res-value bul-decision">${resultat.decision}</div>
          </div>
        </div>

        <!-- APPRÉCIATIONS -->
        <div class="bul-appreciation">
          <div class="bul-appr-title">Appréciation du conseil de classe</div>
          <div class="bul-appr-text">${Utils.escapeHtml(this.getAppreciationGenerale(resultat.moyenne))}</div>
        </div>

        <div class="bul-travail">
          <div><strong>Travail :</strong> ${resultat.moyenne>=10?'Satisfaisant':'Insuffisant'}</div>
          <div><strong>Conduite :</strong> Bien</div>
        </div>

        <!-- SIGNATURES -->
        <div class="bul-signatures">
          <div>
            <div class="bul-sign-label">Professeur principal</div>
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
          Bulletin généré le ${Utils.formatDate(new Date().toISOString())} — ${Utils.escapeHtml(param.etablissement)}
        </div>
      </div>
    `;
  },

  getOrdinal(n){
    return n === 1 ? 'er' : 'e';
  }
};