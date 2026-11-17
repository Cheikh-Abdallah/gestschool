/**
 * Module 1 : Tableau de bord.
 * Deux vues : mode secondaire (élèves/classes) et mode supérieur (étudiants/filières).
 */
const Dashboard = {
  charts: [],

  render(container){
    // ══════════════════════════════════════════════════════════
    // MODE SUPÉRIEUR : dashboard universitaire
    // ══════════════════════════════════════════════════════════
    if(Utils.isSuperieur()){
      this.renderSuperieur(container);
      return;
    }

    this.destroyCharts();
    const annee = this.activeAnnee();
    const eleves = this.elevesAnnee(annee.id);
    const enseignants = Storage.getAll('enseignants').filter(e=>e.anneeId===annee.id);
    const classes = Storage.getAll('classes').filter(c=>c.anneeId===annee.id);
    const paiements = Storage.getAll('paiements').filter(p=>p.anneeId===annee.id);
    const frais = Storage.getAll('frais').filter(f=>f.anneeId===annee.id);
    const absences = Storage.getAll('absences').filter(a=>a.anneeId===annee.id);
    const notes = Storage.getAll('notes').filter(n=>n.anneeId===annee.id);

    const totalEleves = eleves.length;
    const garcons = eleves.filter(e=>e.sexe==='M').length;
    const filles = eleves.filter(e=>e.sexe==='F').length;

    const today = new Date().toISOString().slice(0,10);
    const absentsAujourdhui = new Set(absences.filter(a=>a.date===today && a.type==='absence').map(a=>a.eleveId)).size;
    const presents = Math.max(0, totalEleves - absentsAujourdhui);

    const totalAttendu = this.calculTotalAttendu(eleves, frais);
    const totalEncaisse = paiements.reduce((s,p)=>s+(p.montantPaye||0),0);
    const totalImpaye = Math.max(0, totalAttendu - totalEncaisse);
    const tauxRecouv = totalAttendu ? Math.round((totalEncaisse/totalAttendu)*100) : 0;
    const moyGen = notes.length ? (notes.reduce((s,n)=>s+(n.valeur||0),0)/notes.length) : 0;

    container.innerHTML = `
      <div class="page-title">Bonjour ${Utils.escapeHtml(Auth.current()?.nom.split(' ')[0]||'')} 👋</div>
      <div class="page-sub">Tableau de bord · Année ${annee.libelle} · ${annee.periodes[0]}</div>

      <div class="stat-grid">
        ${this.statCard('bi-people-fill','',totalEleves,'Élèves inscrits')}
        ${this.statCard('bi-gender-male','purple',garcons,'Garçons')}
        ${this.statCard('bi-gender-female','purple',filles,'Filles')}
        ${this.statCard('bi-person-workspace','',enseignants.length,'Enseignants')}
        ${this.statCard('bi-building','',classes.length,'Classes')}
        ${this.statCard('bi-check-circle-fill','green',presents,'Présents')}
        ${this.statCard('bi-x-circle-fill','red',absentsAujourdhui,'Absents')}
        ${this.statCard('bi-graph-up-arrow','orange',tauxRecouv+'%','Taux de recouvrement')}
      </div>

      <div class="grid-2">
        <div class="card-panel">
          <h6><i class="bi bi-graph-up"></i> Évolution des inscriptions</h6>
          <div class="chart-box"><canvas id="chartInscriptions"></canvas></div>
        </div>
        <div class="card-panel">
          <h6><i class="bi bi-pie-chart-fill"></i> Répartition par sexe</h6>
          <div class="chart-box"><canvas id="chartSexes"></canvas></div>
        </div>
      </div>

      <div class="grid-2">
        <div class="card-panel">
          <h6><i class="bi bi-bar-chart-fill"></i> Répartition par classe</h6>
          <div class="chart-box"><canvas id="chartClasses"></canvas></div>
        </div>
        <div class="card-panel">
          <h6><i class="bi bi-cash-coin"></i> Paiements mensuels</h6>
          <div class="chart-box"><canvas id="chartPaiements"></canvas></div>
        </div>
      </div>

      <div class="card-panel">
        <h6><i class="bi bi-clipboard-data"></i> Statistiques des résultats scolaires</h6>
        <div class="chart-box"><canvas id="chartResultats"></canvas></div>
      </div>

      <div class="card-panel">
        <h6><i class="bi bi-wallet2"></i> Situation financière</h6>
        <div class="finance-row"><span>Total attendu</span><strong>${Utils.formatFCFA(totalAttendu)}</strong></div>
        <div class="finance-row"><span>Encaissé</span><strong class="text-success">${Utils.formatFCFA(totalEncaisse)}</strong></div>
        <div class="finance-row"><span>Impayés</span><strong class="text-danger">${Utils.formatFCFA(totalImpaye)}</strong></div>
        <div class="finance-bar"><div class="fill" style="width:${tauxRecouv}%"></div></div>
        <small class="text-muted">Taux global de recouvrement : <strong>${tauxRecouv}%</strong> · Moyenne générale actuelle : <strong>${moyGen.toFixed(2)}/20</strong></small>
      </div>

      <div class="grid-2">
        <div class="card-panel">
          <h6><i class="bi bi-person-plus-fill"></i> Dernières inscriptions</h6>
          <ul class="mini-list" id="lastInscriptions"></ul>
        </div>
        <div class="card-panel">
          <h6><i class="bi bi-cash-stack"></i> Derniers paiements</h6>
          <ul class="mini-list" id="lastPaiements"></ul>
        </div>
      </div>

      <div class="grid-2">
        <div class="card-panel">
          <h6><i class="bi bi-calendar-x-fill"></i> Absences récentes</h6>
          <ul class="mini-list" id="lastAbsences"></ul>
        </div>
        <div class="card-panel">
          <h6><i class="bi bi-calendar-event"></i> Événements à venir</h6>
          <ul class="mini-list">
            <li><div class="mini-avatar">15</div><div><strong>Conseil de classe</strong><div class="small text-muted">Trimestre 1</div></div><span class="mini-meta">15/11</span></li>
            <li><div class="mini-avatar">20</div><div><strong>Composition</strong><div class="small text-muted">Toutes classes</div></div><span class="mini-meta">20/11</span></li>
            <li><div class="mini-avatar">30</div><div><strong>Remise bulletins</strong><div class="small text-muted">Trimestre 1</div></div><span class="mini-meta">30/11</span></li>
            <li><div class="mini-avatar">05</div><div><strong>Réunion parents</strong><div class="small text-muted">6ᵉ et 5ᵉ</div></div><span class="mini-meta">05/12</span></li>
          </ul>
        </div>
      </div>
    `;

    this.renderCharts({eleves, classes, paiements, notes});
    this.renderLists({eleves, paiements, absences});
  },

  statCard(icon, colorClass, value, label){
    return `
      <div class="stat-card">
        <div class="stat-icon ${colorClass}"><i class="bi ${icon}"></i></div>
        <div>
          <div class="stat-value">${value}</div>
          <div class="stat-label">${label}</div>
        </div>
      </div>`;
  },

  activeAnnee(){
    const annees = Storage.getAllIncludingArchived('annees');
    return annees.find(a=>a.active) || annees[0];
  },

  elevesAnnee(anneeId){
    return Storage.getAll('eleves').filter(e=>e.anneeId===anneeId);
  },

  calculTotalAttendu(eleves, frais){
    let total = 0;
    eleves.forEach(el=>{
      const fraisClasse = frais.filter(f=>f.classeId===el.classeId);
      fraisClasse.forEach(f=>{ total += f.montant; });
    });
    return total;
  },

  destroyCharts(){
    this.charts.forEach(c=>{ try{c.destroy();}catch(e){} });
    this.charts = [];
  },

  renderCharts({eleves, classes, paiements, notes}){
    const moisCount = [0,0,0,0,0,0,0,0,0,0,0,0];
    eleves.forEach(e=>{
      if(e.dateInscription){
        const m = new Date(e.dateInscription).getMonth();
        if(!isNaN(m)) moisCount[m]++;
      }
    });
    this.chart('chartInscriptions','line',{
      labels:['Sep','Oct','Nov','Déc','Jan','Fév','Mar','Avr','Mai','Juin'],
      datasets:[{
        label:'Inscriptions',
        data:moisCount.slice(8).concat(moisCount.slice(0,8)),
        borderColor:'#1D4ED8',
        backgroundColor:'rgba(29,78,216,.12)',
        fill:true, tension:.35, pointRadius:4
      }]
    });

    const g = eleves.filter(e=>e.sexe==='M').length;
    const f = eleves.filter(e=>e.sexe==='F').length;
    this.chart('chartSexes','doughnut',{
      labels:['Garçons','Filles'],
      datasets:[{data:[g,f],backgroundColor:['#1D4ED8','#F59E0B'],borderWidth:0}]
    },{cutout:'65%'});

    const dataCls = classes.map(c=>({
      nom:c.nom,
      count:eleves.filter(e=>e.classeId===c.id).length
    }));
    this.chart('chartClasses','bar',{
      labels:dataCls.map(x=>x.nom),
      datasets:[{label:'Élèves',data:dataCls.map(x=>x.count),backgroundColor:'#1D4ED8',borderRadius:6}]
    },{plugins:{legend:{display:false}},scales:{y:{beginAtZero:true}}});

    const moisPay = [0,0,0,0,0,0,0,0,0,0,0,0];
    paiements.forEach(p=>{
      if(p.date){
        const m = new Date(p.date).getMonth();
        if(!isNaN(m)) moisPay[m]+=(p.montantPaye||0);
      }
    });
    this.chart('chartPaiements','bar',{
      labels:['Jan','Fév','Mar','Avr','Mai','Juin','Juil','Août','Sep','Oct','Nov','Déc'],
      datasets:[{
        label:'Encaissements (FCFA)',
        data:moisPay,
        backgroundColor:'#16A34A',borderRadius:6
      }]
    },{plugins:{legend:{display:false}},scales:{y:{beginAtZero:true}}});

    const buckets = {'0-5':0,'5-10':0,'10-12':0,'12-15':0,'15-20':0};
    notes.forEach(n=>{
      const v = n.valeur||0;
      if(v<5) buckets['0-5']++;
      else if(v<10) buckets['5-10']++;
      else if(v<12) buckets['10-12']++;
      else if(v<15) buckets['12-15']++;
      else buckets['15-20']++;
    });
    this.chart('chartResultats','bar',{
      labels:Object.keys(buckets),
      datasets:[{
        label:'Nombre de notes',
        data:Object.values(buckets),
        backgroundColor:['#DC2626','#F59E0B','#3B82F6','#16A34A','#0B2545'],
        borderRadius:6
      }]
    },{plugins:{legend:{display:false}},scales:{y:{beginAtZero:true}}});
  },

  chart(id, type, data, options){
    const ctx = document.getElementById(id);
    if(!ctx) return;
    const inst = new Chart(ctx, {
      type, data,
      options: Object.assign({
        responsive:true,
        maintainAspectRatio:false,
        plugins:{legend:{position:'bottom',labels:{boxWidth:12,font:{size:11}}}}
      }, options||{})
    });
    this.charts.push(inst);
  },

  renderLists({eleves, paiements, absences}){
    const sortedEl = [...eleves].sort((a,b)=>(b.dateInscription||'').localeCompare(a.dateInscription||'')).slice(0,5);
    const elInscr = document.getElementById('lastInscriptions');
    if(elInscr){
      elInscr.innerHTML = sortedEl.map(e=>{
        const cls = Storage.getById('classes', e.classeId);
        return `<li>
          <div class="mini-avatar">${e.prenom[0]}${e.nom[0]}</div>
          <div><strong>${Utils.escapeHtml(e.prenom+' '+e.nom)}</strong>
            <div class="small text-muted">${cls?cls.nom:'—'}</div></div>
          <span class="mini-meta">${Utils.formatDate(e.dateInscription)}</span>
        </li>`;
      }).join('') || '<li class="text-muted small">Aucune inscription.</li>';
    }

    const sortedPay = [...paiements].sort((a,b)=>(b.date||'').localeCompare(a.date||'')).slice(0,5);
    const elPay = document.getElementById('lastPaiements');
    if(elPay){
      elPay.innerHTML = sortedPay.map(p=>{
        const el = Storage.getById('eleves', p.eleveId);
        return `<li>
          <div class="mini-avatar"><i class="bi bi-cash"></i></div>
          <div><strong>${Utils.formatFCFA(p.montantPaye)}</strong>
            <div class="small text-muted">${el?Utils.escapeHtml(el.prenom+' '+el.nom):'—'} · ${p.mode}</div></div>
          <span class="mini-meta">${Utils.formatDate(p.date)}</span>
        </li>`;
      }).join('') || '<li class="text-muted small">Aucun paiement.</li>';
    }

    const sortedAbs = [...absences].sort((a,b)=>(b.date||'').localeCompare(a.date||'')).slice(0,5);
    const elAbs = document.getElementById('lastAbsences');
    if(elAbs){
      elAbs.innerHTML = sortedAbs.map(a=>{
        const el = Storage.getById('eleves', a.eleveId);
        return `<li>
          <div class="mini-avatar"><i class="bi bi-${a.type==='retard'?'clock':'x-circle'}"></i></div>
          <div><strong>${el?Utils.escapeHtml(el.prenom+' '+el.nom):'—'}</strong>
            <div class="small text-muted">${a.type} · ${a.justifie?'justifié':'non justifié'}</div></div>
          <span class="mini-meta">${Utils.formatDate(a.date)}</span>
        </li>`;
      }).join('') || '<li class="text-muted small">Aucune absence.</li>';
    }
  },

  // ============================================================
  // DASHBOARD MODE SUPÉRIEUR
  // ============================================================
  renderSuperieur(container){
    this.destroyCharts();

    const annee = Storage.getAllIncludingArchived('annees').find(a=>a.active);
    const etudiants = Storage.getAll('eleves').filter(e=>e.typeEtudiant === 'superieur');
    const enseignants = Storage.getAll('enseignants');
    const filieres = Storage.getAll('filieres');
    const niveaux = Storage.getAll('niveaux');
    const groupes = Storage.getAll('groupes');
    const ues = Storage.getAll('ue');
    const ecues = Storage.getAll('ecue');

    const garcons = etudiants.filter(e=>e.sexe === 'M').length;
    const filles = etudiants.filter(e=>e.sexe === 'F').length;

    let totalValides = 0, totalEtudiantsEvalues = 0, totalCreditsAcquis = 0, totalCredits = 0;
    groupes.forEach(g=>{
      if(typeof NotesLMD !== 'undefined'){
        const res = NotesLMD.calcMoyennes(g.id, 'S1');
        if(res){
          res.etudiants.forEach(r=>{
            if(r.moySemestre != null) totalEtudiantsEvalues++;
            if(r.resultat === 'Validé' || r.resultat === 'Compensé') totalValides++;
            totalCreditsAcquis += r.creditsAcquis;
            totalCredits += r.totalCredits;
          });
        }
      }
    });
    const tauxReussite = totalEtudiantsEvalues ? Math.round(totalValides/totalEtudiantsEvalues*100) : 0;

    const paiements = Storage.getAll('paiements').filter(p=>p.statut !== 'annulé');
    const frais = Storage.getAll('frais');
    let attendu = 0;
    etudiants.forEach(el=>{
      const fraisCls = frais.filter(f=>f.classeId === el.classeId);
      attendu += fraisCls.reduce((s,f)=>s+(f.montant||0),0);
    });
    const encaisse = paiements.filter(p=>etudiants.some(e=>e.id===p.eleveId)).reduce((s,p)=>s+(p.montantPaye||0),0);
    const impaye = Math.max(0, attendu - encaisse);
    const tauxRecouv = attendu ? Math.round(encaisse/attendu*100) : 0;

    const parFiliere = filieres.map(f=>{
      const niveauxFil = niveaux.filter(n=>n.filiereId === f.id);
      const grpIds = groupes.filter(g=>niveauxFil.some(n=>n.id === g.niveauId)).map(g=>g.id);
      return {
        filiere: f,
        etudiants: etudiants.filter(e=>grpIds.includes(e.classeId)).length
      };
    });

    const parNiveau = {};
    groupes.forEach(g=>{
      const niv = Storage.getById('niveaux', g.niveauId);
      if(!niv) return;
      const code = niv.code;
      parNiveau[code] = (parNiveau[code]||0) + etudiants.filter(e=>e.classeId === g.id).length;
    });

    const derniersPaiements = paiements.filter(p=>etudiants.some(e=>e.id===p.eleveId))
      .sort((a,b)=>(b.date||'').localeCompare(a.date||'')).slice(0,5);

    container.innerHTML = `
      <div class="page-title">Tableau de bord · Enseignement Supérieur</div>
      <div class="page-sub">Année ${annee?.libelle||'—'} · Session 1</div>

      <div class="stat-grid">
        ${this.statCard('bi-people-fill','',etudiants.length,'Étudiants')}
        ${this.statCard('bi-gender-male','purple',garcons,'Hommes')}
        ${this.statCard('bi-gender-female','purple',filles,'Femmes')}
        ${this.statCard('bi-person-workspace','',enseignants.length,'Enseignants')}
        ${this.statCard('bi-diagram-3','',filieres.length,'Filières')}
        ${this.statCard('bi-layers','',niveaux.length,'Niveaux')}
        ${this.statCard('bi-journal-bookmark','',ues.length,'UE')}
        ${this.statCard('bi-award','green',tauxReussite+'%','Taux réussite')}
      </div>

      <div class="grid-2">
        <div class="card-panel">
          <h6><i class="bi bi-pie-chart-fill"></i> Répartition par filière</h6>
          <div class="chart-box"><canvas id="chartFilieres"></canvas></div>
        </div>
        <div class="card-panel">
          <h6><i class="bi bi-bar-chart-fill"></i> Répartition par niveau</h6>
          <div class="chart-box"><canvas id="chartNiveaux"></canvas></div>
        </div>
      </div>

      <div class="card-panel">
        <h6><i class="bi bi-wallet2"></i> Situation financière</h6>
        <div class="finance-row"><span>Attendu</span><strong>${Utils.formatFCFA(attendu)}</strong></div>
        <div class="finance-row"><span>Encaissé</span><strong class="text-success">${Utils.formatFCFA(encaisse)}</strong></div>
        <div class="finance-row"><span>Impayés</span><strong class="text-danger">${Utils.formatFCFA(impaye)}</strong></div>
        <div class="finance-bar"><div class="fill" style="width:${tauxRecouv}%"></div></div>
        <small class="text-muted">Taux de recouvrement : <strong>${tauxRecouv}%</strong> · Crédits acquis : <strong>${totalCreditsAcquis}/${totalCredits}</strong></small>
      </div>

      <div class="grid-2">
        <div class="card-panel">
          <h6><i class="bi bi-trophy"></i> Réussite par filière</h6>
          <ul class="mini-list">
            ${parFiliere.map(pf=>{
              const niveauxFil = niveaux.filter(n=>n.filiereId === pf.filiere.id);
              const grpIds = groupes.filter(g=>niveauxFil.some(n=>n.id === g.niveauId)).map(g=>g.id);
              let val = 0, tot = 0;
              grpIds.forEach(gid=>{
                if(typeof NotesLMD !== 'undefined'){
                  const r = NotesLMD.calcMoyennes(gid, 'S1');
                  if(r){
                    tot += r.etudiants.length;
                    val += r.etudiants.filter(x=>x.resultat==='Validé' || x.resultat==='Compensé').length;
                  }
                }
              });
              const taux = tot ? Math.round(val/tot*100) : 0;
              return `<li>
                <div class="mini-avatar"><i class="bi bi-mortarboard"></i></div>
                <div><strong>${Utils.escapeHtml(pf.filiere.code)}</strong>
                  <div class="small text-muted">${pf.etudiants} étudiant(s)</div></div>
                <span class="mini-meta text-${taux>=70?'success':taux>=50?'warning':'danger'} fw-bold">${taux}%</span>
              </li>`;
            }).join('')}
          </ul>
        </div>
        <div class="card-panel">
          <h6><i class="bi bi-cash-stack"></i> Derniers paiements</h6>
          <ul class="mini-list">
            ${derniersPaiements.map(p=>{
              const etu = Storage.getById('eleves', p.eleveId);
              return `<li>
                <div class="mini-avatar"><i class="bi bi-cash"></i></div>
                <div><strong>${Utils.formatFCFA(p.montantPaye)}</strong>
                  <div class="small text-muted">${etu?Utils.escapeHtml(etu.prenom+' '+etu.nom):'—'} · ${p.mode}</div></div>
                <span class="mini-meta">${Utils.formatDate(p.date)}</span>
              </li>`;
            }).join('') || '<li class="text-muted small">Aucun paiement.</li>'}
          </ul>
        </div>
      </div>
    `;

    setTimeout(()=>{
      this.chart('chartFilieres', 'doughnut', {
        labels: parFiliere.map(p=>p.filiere.code),
        datasets: [{
          data: parFiliere.map(p=>p.etudiants),
          backgroundColor: ['#1D4ED8','#7C3AED','#16A34A','#F59E0B','#DC2626','#0891B2','#BE185D'],
          borderWidth: 0
        }]
      }, {cutout:'65%'});

      this.chart('chartNiveaux', 'bar', {
        labels: Object.keys(parNiveau),
        datasets: [{
          label: 'Étudiants',
          data: Object.values(parNiveau),
          backgroundColor: '#1D4ED8',
          borderRadius: 6
        }]
      }, {plugins:{legend:{display:false}}, scales:{y:{beginAtZero:true}}});
    }, 50);
  }
};
