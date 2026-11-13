/**
 * Module 8 : Gestion des frais scolaires et paiements.
 * Définition des frais par classe, encaissements, soldes,
 * impayés, reçus imprimables, rapports financiers.
 */
const Paiements = {
  state: {
    tab: 'paiements',
    page: 1,
    pageSize: 14,
    search: '',
    filtreClasse: '',
    filtreMode: '',
    sortKey: 'date',
    sortDir: 'desc'
  },

  render(container){
    this.container = container;
    container.innerHTML = `
      <div class="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
        <div>
          <div class="page-title">Frais scolaires et paiements</div>
          <div class="page-sub">Encaissements, soldes, impayés et rapports financiers</div>
        </div>
        <div class="d-flex gap-2 flex-wrap">
          <button class="btn btn-outline-secondary btn-sm" id="btnExportCsvPay">
            <i class="bi bi-filetype-csv me-1"></i> CSV
          </button>
          <button class="btn btn-outline-primary btn-sm" id="btnAddFrais">
            <i class="bi bi-tags me-1"></i> Gérer les frais
          </button>
          <button class="btn btn-primary btn-sm" id="btnAddPay">
            <i class="bi bi-plus-lg me-1"></i> Nouveau paiement
          </button>
        </div>
      </div>

      <div class="row g-3 mb-3">
        <div class="col-6 col-md-3">
          <div class="stat-card">
            <div class="stat-icon"><i class="bi bi-calculator"></i></div>
            <div><div class="stat-value" id="statAttendu">0</div><div class="stat-label">Attendu</div></div>
          </div>
        </div>
        <div class="col-6 col-md-3">
          <div class="stat-card">
            <div class="stat-icon green"><i class="bi bi-cash-coin"></i></div>
            <div><div class="stat-value" id="statEncaisse">0</div><div class="stat-label">Encaissé</div></div>
          </div>
        </div>
        <div class="col-6 col-md-3">
          <div class="stat-card">
            <div class="stat-icon red"><i class="bi bi-exclamation-circle"></i></div>
            <div><div class="stat-value" id="statImpaye">0</div><div class="stat-label">Impayés</div></div>
          </div>
        </div>
        <div class="col-6 col-md-3">
          <div class="stat-card">
            <div class="stat-icon orange"><i class="bi bi-percent"></i></div>
            <div><div class="stat-value" id="statTaux">0%</div><div class="stat-label">Taux recouvrement</div></div>
          </div>
        </div>
      </div>

      <div class="card-panel">
        <ul class="nav nav-tabs nav-tabs-custom mb-3" id="payTabs">
          <li class="nav-item"><a class="nav-link active" data-tab="paiements">Paiements</a></li>
          <li class="nav-item"><a class="nav-link" data-tab="frais">Frais par classe</a></li>
          <li class="nav-item"><a class="nav-link" data-tab="impayes">Impayés</a></li>
          <li class="nav-item"><a class="nav-link" data-tab="rapport">Rapport financier</a></li>
        </ul>
        <div id="tabContent"></div>
      </div>

      <!-- Modale paiement -->
      <div class="modal fade" id="modalPay" tabindex="-1">
        <div class="modal-dialog modal-lg modal-dialog-centered">
          <div class="modal-content modal-pay">
            <form id="formPay" novalidate>
              <div class="modal-header">
                <h6 class="modal-title" id="modalPayTitle">Nouveau paiement</h6>
                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
              </div>
              <div class="modal-body">
                <input type="hidden" id="payId">
                <div class="row g-3">
                  <div class="col-md-6">
                    <label class="form-label">Élève *</label>
                    <select class="form-select" id="payEleve" required></select>
                    <div class="invalid-feedback">Élève obligatoire.</div>
                  </div>
                  <div class="col-md-6">
                    <label class="form-label">Motif du paiement *</label>
                    <select class="form-select" id="payFrais" required></select>
                    <div class="invalid-feedback">Motif obligatoire.</div>
                  </div>

                  <div class="col-md-6">
                    <label class="form-label">Montant attendu</label>
                    <input class="form-control" id="payAttendu" readonly>
                  </div>
                  <div class="col-md-6">
                    <label class="form-label">Montant payé (FCFA) *</label>
                    <input type="number" class="form-control" id="payMontant" min="0" required>
                    <div class="invalid-feedback">Montant obligatoire.</div>
                  </div>

                  <div class="col-md-6">
                    <label class="form-label">Mode de paiement *</label>
                    <select class="form-select" id="payMode" required>
                      <option value="">— Choisir —</option>
                      <option value="Espèces">Espèces</option>
                      <option value="Wave">Wave</option>
                      <option value="Orange Money">Orange Money</option>
                      <option value="Virement bancaire">Virement bancaire</option>
                      <option value="Autre">Autre</option>
                    </select>
                    <div class="invalid-feedback">Mode obligatoire.</div>
                  </div>
                  <div class="col-md-6">
                    <label class="form-label">Date du paiement *</label>
                    <input type="date" class="form-control" id="payDate" required>
                    <div class="invalid-feedback">Date obligatoire.</div>
                  </div>

                  <div class="col-12">
                    <div class="alert alert-info small mb-0 d-none" id="payInfo"></div>
                  </div>
                </div>
              </div>
              <div class="modal-footer">
                <button type="button" class="btn btn-light" data-bs-dismiss="modal">Annuler</button>
                <button type="submit" class="btn btn-primary">
                  <i class="bi bi-check2 me-1"></i> Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <!-- Modale frais -->
      <div class="modal fade" id="modalFrais" tabindex="-1">
        <div class="modal-dialog modal-xl modal-dialog-scrollable">
          <div class="modal-content">
            <div class="modal-header">
              <h6 class="modal-title"><i class="bi bi-tags me-1"></i> Grille tarifaire par classe</h6>
              <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body" id="fraisBody"></div>
            <div class="modal-footer">
              <button type="button" class="btn btn-light" data-bs-dismiss="modal">Fermer</button>
              <button type="button" class="btn btn-primary" id="btnSaveFrais">
                <i class="bi bi-save me-1"></i> Enregistrer la grille
              </button>
            </div>
          </div>
        </div>
      </div>
    `;

    this.bindEvents();
    this.refresh();
    this.switchTab('paiements');
  },

  bindEvents(){
    document.querySelectorAll('#payTabs .nav-link').forEach(link=>{
      link.onclick = (e)=>{
        e.preventDefault();
        this.switchTab(link.dataset.tab);
      };
    });

    document.getElementById('btnAddPay').onclick = ()=> this.openPayForm();
    document.getElementById('btnAddFrais').onclick = ()=> this.openFraisModal();
    document.getElementById('btnExportCsvPay').onclick = ()=> this.exportCsv();
    document.getElementById('formPay').onsubmit = (e)=>{ e.preventDefault(); this.savePay(); };
    document.getElementById('btnSaveFrais').onclick = ()=> this.saveFrais();

    document.getElementById('payEleve').onchange = ()=> this.updatePayInfo();
    document.getElementById('payFrais').onchange = ()=> this.updatePayInfo();
    document.getElementById('payMontant').oninput = ()=> this.updatePayInfo();
  },

  switchTab(tab){
    this.state.tab = tab;
    document.querySelectorAll('#payTabs .nav-link').forEach(l=>{
      l.classList.toggle('active', l.dataset.tab === tab);
    });
    const content = document.getElementById('tabContent');
    if(tab === 'paiements') this.renderPaiements(content);
    else if(tab === 'frais') this.renderFrais(content);
    else if(tab === 'impayes') this.renderImpayes(content);
    else if(tab === 'rapport') this.renderRapport(content);
  },

  refresh(){
    const stats = this.computeStats();
    document.getElementById('statAttendu').textContent = Utils.formatFCFA(stats.attendu);
    document.getElementById('statEncaisse').textContent = Utils.formatFCFA(stats.encaisse);
    document.getElementById('statImpaye').textContent = Utils.formatFCFA(stats.impaye);
    document.getElementById('statTaux').textContent = stats.taux + '%';
    this.switchTab(this.state.tab);
  },

  computeStats(){
    const eleves = Storage.getAll('eleves');
    const frais = Storage.getAll('frais');
    const paiements = Storage.getAll('paiements').filter(p=>p.statut !== 'annulé');

    let attendu = 0;
    eleves.forEach(el=>{
      const fraisClasse = frais.filter(f=>f.classeId === el.classeId);
      attendu += fraisClasse.reduce((s,f)=>s+(f.montant||0),0);
    });
    const encaisse = paiements.reduce((s,p)=>s+(p.montantPaye||0),0);
    const impaye = Math.max(0, attendu - encaisse);
    const taux = attendu ? Math.round((encaisse/attendu)*100) : 0;
    return {attendu, encaisse, impaye, taux, eleves, frais, paiements};
  },

  computeSoldeEleve(eleveId){
    const el = Storage.getById('eleves', eleveId);
    if(!el) return null;
    const frais = Storage.getAll('frais').filter(f=>f.classeId === el.classeId);
    const paiements = Storage.getAll('paiements')
      .filter(p=>p.eleveId === eleveId && p.statut !== 'annulé');

    const details = frais.map(f=>{
      const paid = paiements.filter(p=>p.fraisId === f.id).reduce((s,p)=>s+(p.montantPaye||0),0);
      return {
        fraisId: f.id,
        libelle: f.libelle,
        type: f.type,
        attendu: f.montant,
        paye: paid,
        reste: Math.max(0, f.montant - paid)
      };
    });

    const totalAttendu = details.reduce((s,d)=>s+d.attendu, 0);
    const totalPaye = details.reduce((s,d)=>s+d.paye, 0);
    const totalReste = Math.max(0, totalAttendu - totalPaye);
    return {details, totalAttendu, totalPaye, totalReste};
  },

  renderPaiements(container){
    const classes = Storage.getAll('classes');
    container.innerHTML = `
      <div class="row g-2 mb-3">
        <div class="col-12 col-md-3">
          <div class="search-inline">
            <i class="bi bi-search"></i>
            <input type="text" id="fSearchPay" placeholder="Rechercher un élève…" value="${Utils.escapeHtml(this.state.search)}">
          </div>
        </div>
        <div class="col-6 col-md-2">
          <select class="form-select form-select-sm" id="fClassePay">
            <option value="">Toutes classes</option>
            ${classes.map(c=>`<option value="${c.id}" ${this.state.filtreClasse===c.id?'selected':''}>${Utils.escapeHtml(c.nom)}</option>`).join('')}
          </select>
        </div>
        <div class="col-6 col-md-2">
          <select class="form-select form-select-sm" id="fModePay">
            <option value="">Tous modes</option>
            ${['Espèces','Wave','Orange Money','Virement bancaire','Autre'].map(m=>`<option value="${m}" ${this.state.filtreMode===m?'selected':''}>${m}</option>`).join('')}
          </select>
        </div>
        <div class="col-12 col-md-2">
          <button class="btn btn-outline-secondary btn-sm w-100" id="btnResetPay">
            <i class="bi bi-arrow-counterclockwise me-1"></i> Réinitialiser
          </button>
        </div>
      </div>

      <div class="table-responsive">
        <table class="table table-hover align-middle mb-0" id="tblPay">
          <thead>
            <tr>
              <th>Date</th>
              <th>Transaction</th>
              <th>Élève</th>
              <th>Classe</th>
              <th>Motif</th>
              <th>Montant</th>
              <th>Mode</th>
              <th class="text-end">Actions</th>
            </tr>
          </thead>
          <tbody id="tbodyPay"></tbody>
        </table>
      </div>

      <div class="d-flex flex-wrap justify-content-between align-items-center mt-3 gap-2">
        <small class="text-muted" id="paginationInfoPay"></small>
        <nav><ul class="pagination pagination-sm mb-0" id="paginationPay"></ul></nav>
      </div>
    `;

    document.getElementById('fSearchPay').addEventListener('input', e=>{
      this.state.search = e.target.value.trim().toLowerCase();
      this.state.page = 1;
      this.renderPaiements(container);
    });
    document.getElementById('fClassePay').onchange = e=>{ this.state.filtreClasse=e.target.value; this.state.page=1; this.renderPaiements(container); };
    document.getElementById('fModePay').onchange   = e=>{ this.state.filtreMode=e.target.value;   this.state.page=1; this.renderPaiements(container); };
    document.getElementById('btnResetPay').onclick = ()=>{
      this.state = {...this.state, page:1, search:'', filtreClasse:'', filtreMode:''};
      this.renderPaiements(container);
    };

    this.renderPaiementsTable();
  },

  getFilteredPaiements(){
    let list = Storage.getAll('paiements');
    const s = this.state;
    if(s.filtreClasse){
      list = list.filter(p=>{
        const el = Storage.getById('eleves', p.eleveId);
        return el && el.classeId === s.filtreClasse;
      });
    }
    if(s.filtreMode) list = list.filter(p=>p.mode === s.filtreMode);
    if(s.search){
      list = list.filter(p=>{
        const el = Storage.getById('eleves', p.eleveId);
        return el && ((el.nom+' '+el.prenom+' '+el.matricule+' '+p.transactionId).toLowerCase().includes(s.search));
      });
    }
    list.sort((a,b)=>(b.date||'').localeCompare(a.date||''));
    return list;
  },

  renderPaiementsTable(){
    const list = this.getFilteredPaiements();
    const total = list.length;
    const totalPages = Math.max(1, Math.ceil(total / this.state.pageSize));
    if(this.state.page > totalPages) this.state.page = totalPages;

    const start = (this.state.page - 1) * this.state.pageSize;
    const pageList = list.slice(start, start + this.state.pageSize);

    const tbody = document.getElementById('tbodyPay');
    if(!pageList.length){
      tbody.innerHTML = `<tr><td colspan="8" class="text-center text-muted py-4">Aucun paiement.</td></tr>`;
    } else {
      tbody.innerHTML = pageList.map(p=>{
        const el = Storage.getById('eleves', p.eleveId);
        const cls = el ? Storage.getById('classes', el.classeId) : null;
        const annule = p.statut === 'annulé';
        return `<tr class="${annule?'row-annule':''}">
          <td>${Utils.formatDate(p.date)}</td>
          <td><span class="badge-matricule">${Utils.escapeHtml(p.transactionId)}</span></td>
          <td>${el?Utils.escapeHtml(el.prenom+' '+el.nom):'—'}</td>
          <td>${cls?Utils.escapeHtml(cls.nom):'—'}</td>
          <td>${Utils.escapeHtml(p.libelle)}</td>
          <td class="fw-semibold ${annule?'text-muted text-decoration-line-through':'text-success'}">${Utils.formatFCFA(p.montantPaye)}</td>
          <td><span class="badge bg-secondary-subtle text-secondary">${Utils.escapeHtml(p.mode)}</span></td>
          <td class="text-end">
            <button class="btn btn-sm btn-light" title="Voir reçu" data-act="recu" data-id="${p.id}"><i class="bi bi-receipt"></i></button>
            ${!annule?`<button class="btn btn-sm btn-light text-danger" title="Annuler" data-act="annuler" data-id="${p.id}"><i class="bi bi-x-circle"></i></button>`:''}
          </td>
        </tr>`;
      }).join('');
    }

    tbody.querySelectorAll('[data-act]').forEach(btn=>{
      btn.onclick = ()=>{
        const id = btn.dataset.id;
        const act = btn.dataset.act;
        if(act==='recu') this.showRecu(id);
        else if(act==='annuler') this.annulerPaiement(id);
      };
    });

    document.getElementById('paginationInfoPay').textContent =
      total === 0 ? '0 résultat' : `${start+1}–${Math.min(start+this.state.pageSize, total)} sur ${total} paiement(s)`;

    const pag = document.getElementById('paginationPay');
    let html = '';
    html += `<li class="page-item ${this.state.page===1?'disabled':''}"><a class="page-link" href="#" data-p="${this.state.page-1}">«</a></li>`;
    for(let i=1;i<=totalPages;i++){
      if(totalPages>7 && i>2 && i<totalPages-1 && Math.abs(i-this.state.page)>1){
        if(i===3) html += `<li class="page-item disabled"><span class="page-link">…</span></li>`;
        continue;
      }
      html += `<li class="page-item ${i===this.state.page?'active':''}"><a class="page-link" href="#" data-p="${i}">${i}</a></li>`;
    }
    html += `<li class="page-item ${this.state.page===totalPages?'disabled':''}"><a class="page-link" href="#" data-p="${this.state.page+1}">»</a></li>`;
    pag.innerHTML = html;
    pag.querySelectorAll('a[data-p]').forEach(a=>{
      a.onclick = (ev)=>{
        ev.preventDefault();
        const p = parseInt(a.dataset.p);
        if(p>=1 && p<=totalPages){ this.state.page = p; this.renderPaiementsTable(); }
      };
    });
  },

  renderFrais(container){
    const classes = Storage.getAll('classes');
    const frais = Storage.getAll('frais');
    container.innerHTML = `
      <p class="small text-muted">Grille tarifaire appliquée à chaque classe (inscription + mensualités + frais annexes).</p>
      <div class="table-responsive">
        <table class="table table-sm align-middle">
          <thead>
            <tr>
              <th>Classe</th>
              <th>Frais inscription</th>
              <th>Mensualité (×9)</th>
              <th>Total annuel</th>
              <th>Effectif</th>
              <th>Attendu classe</th>
            </tr>
          </thead>
          <tbody>
            ${classes.map(c=>{
              const frCls = frais.filter(f=>f.classeId===c.id);
              const insc = frCls.find(f=>f.type==='inscription');
              const mens = frCls.find(f=>f.type==='mensualite');
              const totalAnnuel = frCls.reduce((s,f)=>s+f.montant,0);
              const eff = Storage.getAll('eleves').filter(e=>e.classeId===c.id).length;
              return `<tr>
                <td><strong>${Utils.escapeHtml(c.nom)}</strong></td>
                <td>${insc?Utils.formatFCFA(insc.montant):'—'}</td>
                <td>${mens?Utils.formatFCFA(mens.montant):'—'}</td>
                <td class="fw-semibold">${Utils.formatFCFA(totalAnnuel)}</td>
                <td>${eff}</td>
                <td class="text-success fw-semibold">${Utils.formatFCFA(totalAnnuel*eff)}</td>
              </tr>`;
            }).join('')}
          </tbody>
        </table>
      </div>
    `;
  },

  openFraisModal(){
    const classes = Storage.getAll('classes');
    const frais = Storage.getAll('frais');
    let html = `<div class="alert alert-info small mb-3">
      Définissez pour chaque classe les montants des frais d'inscription et de la mensualité.
      Les 9 mensualités seront générées automatiquement avec le même montant.
    </div>
    <div class="table-responsive">
      <table class="table table-sm align-middle">
        <thead>
          <tr>
            <th>Classe</th>
            <th style="width:160px">Inscription (FCFA)</th>
            <th style="width:160px">Mensualité (FCFA)</th>
          </tr>
        </thead>
        <tbody>
          ${classes.map(c=>{
            const frCls = frais.filter(f=>f.classeId===c.id);
            const insc = frCls.find(f=>f.type==='inscription');
            const mens = frCls.find(f=>f.type==='mensualite');
            return `<tr data-classe="${c.id}">
              <td><strong>${Utils.escapeHtml(c.nom)}</strong></td>
              <td><input type="number" min="0" class="form-control form-control-sm" data-field="inscription" value="${insc?.montant||0}"></td>
              <td><input type="number" min="0" class="form-control form-control-sm" data-field="mensualite" value="${mens?.montant||0}"></td>
            </tr>`;
          }).join('')}
        </tbody>
      </table>
    </div>`;
    document.getElementById('fraisBody').innerHTML = html;
    new bootstrap.Modal(document.getElementById('modalFrais')).show();
  },

  saveFrais(){
    const rows = document.querySelectorAll('#fraisBody tr[data-classe]');
    const anneeActive = Storage.getAllIncludingArchived('annees').find(a=>a.active);
    rows.forEach(row=>{
      const classeId = row.dataset.classe;
      const insc = parseInt(row.querySelector('[data-field="inscription"]').value) || 0;
      const mens = parseInt(row.querySelector('[data-field="mensualite"]').value) || 0;

      const existingInsc = Storage.getAll('frais').find(f=>f.classeId===classeId && f.type==='inscription');
      if(existingInsc){
        Storage.update('frais', existingInsc.id, {montant:insc});
      } else if(insc > 0){
        Storage.create('frais', {classeId, libelle:"Frais d'inscription", montant:insc, type:'inscription', anneeId:anneeActive?.id});
      }

      for(let m=1;m<=9;m++){
        const existing = Storage.getAll('frais').find(f=>f.classeId===classeId && f.type==='mensualite' && f.mois===m);
        if(existing){
          Storage.update('frais', existing.id, {montant:mens});
        } else if(mens > 0){
          Storage.create('frais', {classeId, libelle:'Mensualité '+m, montant:mens, type:'mensualite', mois:m, anneeId:anneeActive?.id});
        }
      }
    });
    Notify.toast('Grille tarifaire enregistrée.', 'success');
    bootstrap.Modal.getInstance(document.getElementById('modalFrais')).hide();
    this.refresh();
  },

  renderImpayes(container){
    const eleves = Storage.getAll('eleves');
    const impayes = [];
    eleves.forEach(el=>{
      const solde = this.computeSoldeEleve(el.id);
      if(solde && solde.totalReste > 0){
        impayes.push({eleve: el, ...solde});
      }
    });
    impayes.sort((a,b)=>b.totalReste - a.totalReste);

    container.innerHTML = `
      <div class="d-flex justify-content-between align-items-center mb-3">
        <p class="small text-muted mb-0"><strong>${impayes.length}</strong> élève(s) avec solde dû — Total : <strong class="text-danger">${Utils.formatFCFA(impayes.reduce((s,x)=>s+x.totalReste,0))}</strong></p>
      </div>
      <div class="table-responsive">
        <table class="table table-hover align-middle">
          <thead>
            <tr>
              <th>Élève</th>
              <th>Classe</th>
              <th>Attendu</th>
              <th>Payé</th>
              <th>Reste</th>
              <th>%</th>
              <th class="text-end">Actions</th>
            </tr>
          </thead>
          <tbody>
            ${impayes.length?impayes.map(x=>{
              const cls = Storage.getById('classes', x.eleve.classeId);
              const pct = x.totalAttendu ? Math.round((x.totalPaye/x.totalAttendu)*100) : 0;
              return `<tr>
                <td><strong>${Utils.escapeHtml(x.eleve.prenom+' '+x.eleve.nom)}</strong><br><small class="text-muted">${Utils.escapeHtml(x.eleve.matricule)}</small></td>
                <td>${cls?Utils.escapeHtml(cls.nom):'—'}</td>
                <td>${Utils.formatFCFA(x.totalAttendu)}</td>
                <td class="text-success">${Utils.formatFCFA(x.totalPaye)}</td>
                <td class="text-danger fw-semibold">${Utils.formatFCFA(x.totalReste)}</td>
                <td>
                  <div class="progress-mini"><div class="fill ${pct>=80?'green':pct>=50?'orange':'red'}" style="width:${pct}%"></div></div>
                  <small class="text-muted">${pct}%</small>
                </td>
                <td class="text-end">
                  <button class="btn btn-sm btn-primary" data-act="payer" data-id="${x.eleve.id}"><i class="bi bi-cash-coin"></i> Payer</button>
                </td>
              </tr>`;
            }).join(''):`<tr><td colspan="7" class="text-center text-success py-4"><i class="bi bi-check-circle-fill fs-3 d-block mb-2"></i>Aucun impayé. 🎉</td></tr>`}
          </tbody>
        </table>
      </div>
    `;

    container.querySelectorAll('[data-act="payer"]').forEach(btn=>{
      btn.onclick = ()=> this.openPayForm(null, btn.dataset.id);
    });
  },

  renderRapport(container){
    const paiements = Storage.getAll('paiements').filter(p=>p.statut !== 'annulé');
    const today = new Date().toISOString().slice(0,10);
    const moisCourant = today.slice(0,7);
    const duJour = paiements.filter(p=>p.date === today);
    const duMois = paiements.filter(p=>(p.date||'').startsWith(moisCourant));

    const parMode = {};
    paiements.forEach(p=>{
      parMode[p.mode] = (parMode[p.mode]||0) + (p.montantPaye||0);
    });

    const parMois = {};
    paiements.forEach(p=>{
      const m = (p.date||'').slice(0,7);
      parMois[m] = (parMois[m]||0) + (p.montantPaye||0);
    });
    const moisSorted = Object.entries(parMois).sort();
    const stats = this.computeStats();

    container.innerHTML = `
      <div class="row g-3 mb-3">
        <div class="col-md-4">
          <div class="stat-card"><div class="stat-icon green"><i class="bi bi-calendar-day"></i></div>
            <div><div class="stat-value">${Utils.formatFCFA(duJour.reduce((s,p)=>s+p.montantPaye,0))}</div><div class="stat-label">Recettes du jour</div></div>
          </div>
        </div>
        <div class="col-md-4">
          <div class="stat-card"><div class="stat-icon"><i class="bi bi-calendar-month"></i></div>
            <div><div class="stat-value">${Utils.formatFCFA(duMois.reduce((s,p)=>s+p.montantPaye,0))}</div><div class="stat-label">Recettes du mois</div></div>
          </div>
        </div>
        <div class="col-md-4">
          <div class="stat-card"><div class="stat-icon purple"><i class="bi bi-calendar-range"></i></div>
            <div><div class="stat-value">${Utils.formatFCFA(stats.encaisse)}</div><div class="stat-label">Recettes totales</div></div>
          </div>
        </div>
      </div>

      <h6 class="fw-bold mb-2"><i class="bi bi-pie-chart me-1"></i> Recettes par mode de paiement</h6>
      <div class="table-responsive mb-3">
        <table class="table table-sm">
          <thead><tr><th>Mode</th><th>Nombre</th><th>Montant</th><th>%</th></tr></thead>
          <tbody>
            ${Object.entries(parMode).sort((a,b)=>b[1]-a[1]).map(([mode, montant])=>{
              const nb = paiements.filter(p=>p.mode===mode).length;
              const pct = stats.encaisse ? Math.round((montant/stats.encaisse)*100) : 0;
              return `<tr><td>${mode}</td><td>${nb}</td><td class="fw-semibold">${Utils.formatFCFA(montant)}</td><td>${pct}%</td></tr>`;
            }).join('') || '<tr><td colspan="4" class="text-muted text-center">Aucun paiement.</td></tr>'}
          </tbody>
        </table>
      </div>

      <h6 class="fw-bold mb-2"><i class="bi bi-graph-up me-1"></i> Évolution mensuelle</h6>
      <div class="table-responsive">
        <table class="table table-sm">
          <thead><tr><th>Mois</th><th>Recettes</th></tr></thead>
          <tbody>
            ${moisSorted.map(([m, v])=>`<tr><td>${m}</td><td class="fw-semibold text-success">${Utils.formatFCFA(v)}</td></tr>`).join('') || '<tr><td colspan="2" class="text-muted text-center">Aucune donnée.</td></tr>'}
          </tbody>
        </table>
      </div>
    `;
  },

  openPayForm(id=null, preselectedEleveId=null){
    const modal = new bootstrap.Modal(document.getElementById('modalPay'));
    const form = document.getElementById('formPay');
    form.classList.remove('was-validated');

    const eleves = Storage.getAll('eleves').sort((a,b)=>a.nom.localeCompare(b.nom));
    const selEl = document.getElementById('payEleve');
    selEl.innerHTML = '<option value="">— Choisir —</option>' +
      eleves.map(e=>{
        const cls = Storage.getById('classes', e.classeId);
        return `<option value="${e.id}">${Utils.escapeHtml(e.matricule+' — '+e.prenom+' '+e.nom+' ('+(cls?.nom||'?')+')')}</option>`;
      }).join('');

    document.getElementById('modalPayTitle').textContent = 'Nouveau paiement';
    document.getElementById('payId').value = '';
    document.getElementById('payDate').value = new Date().toISOString().slice(0,10);
    document.getElementById('payInfo').classList.add('d-none');

    if(preselectedEleveId){
      selEl.value = preselectedEleveId;
      this.updatePayFraisSelect();
    } else {
      document.getElementById('payFrais').innerHTML = '<option value="">— Choisir un élève d\'abord —</option>';
      document.getElementById('payAttendu').value = '';
    }
    document.getElementById('payMontant').value = '';
    selEl.onchange = ()=> this.updatePayFraisSelect();
    modal.show();
    if(preselectedEleveId) this.updatePayInfo();
  },

  updatePayFraisSelect(){
    const eleveId = document.getElementById('payEleve').value;
    const selFrais = document.getElementById('payFrais');
    if(!eleveId){
      selFrais.innerHTML = '<option value="">— Choisir un élève d\'abord —</option>';
      document.getElementById('payAttendu').value = '';
      return;
    }
    const el = Storage.getById('eleves', eleveId);
    if(!el) return;
    const fraisCls = Storage.getAll('frais').filter(f=>f.classeId===el.classeId);
    const paiements = Storage.getAll('paiements').filter(p=>p.eleveId===eleveId && p.statut !== 'annulé');

    selFrais.innerHTML = '<option value="">— Choisir un motif —</option>' +
      fraisCls.map(f=>{
        const paid = paiements.filter(p=>p.fraisId===f.id).reduce((s,p)=>s+(p.montantPaye||0),0);
        const reste = Math.max(0, f.montant - paid);
        const status = reste === 0 ? ' [Payé]' : reste < f.montant ? ` [Reste ${Utils.formatFCFA(reste)}]` : '';
        return `<option value="${f.id}" data-attendu="${f.montant}" data-reste="${reste}">${Utils.escapeHtml(f.libelle)} — ${Utils.formatFCFA(f.montant)}${status}</option>`;
      }).join('');
    document.getElementById('payAttendu').value = '';
  },

  updatePayInfo(){
    const fraisId = document.getElementById('payFrais').value;
    const opt = document.querySelector(`#payFrais option[value="${fraisId}"]`);
    const info = document.getElementById('payInfo');
    if(!opt){
      document.getElementById('payAttendu').value = '';
      info.classList.add('d-none');
      return;
    }
    const attendu = parseInt(opt.dataset.attendu)||0;
    const reste = parseInt(opt.dataset.reste)||0;
    document.getElementById('payAttendu').value = Utils.formatFCFA(attendu);
    if(reste === 0){
      info.className = 'alert alert-success small mb-0';
      info.innerHTML = `<i class="bi bi-check-circle me-1"></i> Ce frais est déjà entièrement payé.`;
    } else {
      info.className = 'alert alert-warning small mb-0';
      info.innerHTML = `<i class="bi bi-exclamation-triangle me-1"></i> Reste à payer : <strong>${Utils.formatFCFA(reste)}</strong>. Paiement partiel accepté.`;
    }
    info.classList.remove('d-none');
  },

  savePay(){
    const form = document.getElementById('formPay');
    form.classList.add('was-validated');
    if(!form.checkValidity()) return;

    const eleveId = document.getElementById('payEleve').value;
    const fraisId = document.getElementById('payFrais').value;
    const montant = parseInt(document.getElementById('payMontant').value) || 0;
    const mode = document.getElementById('payMode').value;
    const date = document.getElementById('payDate').value;

    if(montant <= 0){
      Notify.toast('Le montant doit être supérieur à 0.', 'danger');
      return;
    }

    const frais = Storage.getById('frais', fraisId);
    if(!frais){ Notify.toast('Frais introuvable.', 'danger'); return; }

    const anneeActive = Storage.getAllIncludingArchived('annees').find(a=>a.active);

    const all = Storage.getAllIncludingArchived('paiements');
    const maxNum = all.reduce((m,p)=>{
      const n = parseInt((p.transactionId||'').replace(/\D/g,'')) || 0;
      return Math.max(m,n);
    }, 10000);
    const transactionId = 'TRX-' + (maxNum + 1);

    Storage.create('paiements', {
      transactionId,
      eleveId, fraisId,
      libelle: frais.libelle,
      montantAttendu: frais.montant,
      montantPaye: montant,
      mode, date,
      encaissePar: Auth.current()?.role || 'admin',
      statut: 'validé',
      anneeId: anneeActive?.id
    });

    Notify.toast('Paiement enregistré : ' + transactionId, 'success');
    bootstrap.Modal.getInstance(document.getElementById('modalPay')).hide();
    this.refresh();
  },

  annulerPaiement(id){
    const p = Storage.getById('paiements', id);
    if(!p) return;
    if(!confirm(`Annuler le paiement ${p.transactionId} de ${Utils.formatFCFA(p.montantPaye)} ?\nCette action est traçable.`)) return;
    Storage.update('paiements', id, {
      statut: 'annulé',
      annuleLe: new Date().toISOString(),
      annulePar: Auth.current()?.role || 'admin'
    });
    Notify.toast('Paiement annulé.', 'warning');
    this.refresh();
  },

  // ═══════════════════════════════════════════════════════════
  // IMPRESSION DU REÇU (FORMAT A4 STRICT, 1 SEULE PAGE)
  // ═══════════════════════════════════════════════════════════
  showRecu(id){
    const p = Storage.getById('paiements', id);
    if(!p) return;
    const el = Storage.getById('eleves', p.eleveId);
    const cls = el ? Storage.getById('classes', el.classeId) : null;
    const param = Storage.read().parametres || {};
    const annule = p.statut === 'annulé';

    const recuHtml = `
      <div class="recu">
        ${Utils.enteteDocument('REÇU DE PAIEMENT')}
        <div class="recu-bandeau ${annule ? 'recu-annule' : 'recu-valide'}">
          <div>
            <div class="recu-bandeau-label">N° de transaction</div>
            <div class="recu-bandeau-num">${Utils.escapeHtml(p.transactionId)}</div>
          </div>
          <div class="text-end">
            <div class="recu-bandeau-label">Statut</div>
            <div class="recu-bandeau-statut">${annule ? '✕ ANNULÉ' : '✓ VALIDÉ'}</div>
          </div>
        </div>
        <div class="recu-section">
          <div class="recu-section-title">Informations de l'élève</div>
          <table class="recu-table">
            <tr><th>Nom & Prénom</th><td>${el ? Utils.escapeHtml(el.prenom+' '+el.nom) : '—'}</td></tr>
            <tr><th>Matricule</th><td>${el ? Utils.escapeHtml(el.matricule) : '—'}</td></tr>
            <tr><th>Classe</th><td>${cls ? Utils.escapeHtml(cls.nom) : '—'}</td></tr>
          </table>
        </div>
        <div class="recu-section">
          <div class="recu-section-title">Détails du paiement</div>
          <table class="recu-table">
            <tr><th>Motif</th><td>${Utils.escapeHtml(p.libelle)}</td></tr>
            <tr><th>Montant attendu</th><td>${Utils.formatFCFA(p.montantAttendu || 0)}</td></tr>
            <tr><th>Mode de paiement</th><td>${Utils.escapeHtml(p.mode)}</td></tr>
            <tr><th>Date du paiement</th><td>${Utils.formatDate(p.date)}</td></tr>
            <tr><th>Encaissé par</th><td>${Utils.escapeHtml(p.encaissePar || '—')}</td></tr>
          </table>
        </div>
        <div class="recu-montant ${annule ? 'recu-montant-annule' : ''}">
          <div class="recu-montant-label">MONTANT PAYÉ</div>
          <div class="recu-montant-valeur">${Utils.formatFCFA(p.montantPaye)}</div>
        </div>
        ${annule ? `
          <div class="recu-alerte-annule">
            <strong>⚠ Ce paiement a été annulé</strong><br>
            Annulé le ${Utils.formatDate(p.annuleLe)} par ${Utils.escapeHtml(p.annulePar || '—')}
          </div>
        ` : ''}
        <div class="recu-signatures">
          <div><div class="recu-sign-label">Le Caissier</div><div class="recu-sign-line"></div></div>
          <div><div class="recu-sign-label">Le Directeur</div><div class="recu-sign-name">${Utils.escapeHtml(param.signDirecteur || param.directeur || '')}</div><div class="recu-sign-line"></div></div>
          <div><div class="recu-sign-label">Cachet</div><div class="recu-sign-line"></div></div>
        </div>
        <div class="recu-mention">
          Ce reçu ne vaut que pour le montant indiqué ci-dessus. Conservez-le précieusement.
        </div>
      </div>
    `;

    const printWindow = window.open('', '_blank');
    if(!printWindow){
      Notify.toast('Veuillez autoriser les pop-ups pour imprimer le reçu.', 'danger');
      return;
    }

    const basePath = window.location.pathname.replace('app.html', '').replace(/\/$/, '');

    printWindow.document.write(`
      <!DOCTYPE html>
      <html lang="fr">
      <head>
        <meta charset="UTF-8">
        <title>Reçu - ${p.transactionId}</title>
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
        <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.css" rel="stylesheet">
        <link rel="stylesheet" href="${window.location.origin}${basePath}/assets/css/style.css">
        <link rel="stylesheet" href="${window.location.origin}${basePath}/assets/css/paiements.css">
        <style>
          /* Styles écran */
          body { background: #f4f6fa; padding: 20px; }
          .recu { background: #fff; max-width: 800px; margin: 0 auto; padding: 30px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); border-radius: 8px; }
          
          /* Styles STRICTS pour l'impression A4 */
          @media print {
            @page { size: A4 portrait; margin: 10mm; }
            body { 
              background: #fff !important; 
              padding: 0 !important; 
              margin: 0 !important;
              font-size: 11px !important; /* Force une police plus petite pour tout tenir */
            }
            .recu { 
              box-shadow: none !important; 
              padding: 0 !important; 
              max-width: 100% !important; 
              border-radius: 0 !important; 
              margin: 0 !important;
            }
            .no-print { display: none !important; }
            
            /* Compactage du reçu pour éviter le débordement */
            .recu-table { font-size: 11px !important; }
            .recu-table th, .recu-table td { padding: 3px 6px !important; }
            .recu-section-title { font-size: 11px !important; margin-bottom: 3px !important; }
            .recu-montant-valeur { font-size: 18px !important; }
            .recu-bandeau-num { font-size: 13px !important; }
            .recu-bandeau-statut { font-size: 13px !important; }
            .entete-doc { margin-bottom: 10px !important; padding-bottom: 5px !important; }
            .entete-doc-nom { font-size: 15px !important; }
            .recu-signatures { margin-top: 15px !important; }
            .recu-sign-line { margin-top: 20px !important; }
            .recu-mention { font-size: 9px !important; margin-top: 10px !important; }
          }
        </style>
      </head>
      <body>
        <div class="no-print mb-3 text-center">
          <button onclick="window.print()" class="btn btn-primary btn-lg">
            <i class="bi bi-printer"></i> Lancer l'impression
          </button>
        </div>
        ${recuHtml}
      </body>
      </html>
    `);
    printWindow.document.close();
  },

  exportCsv(){
    const list = this.getFilteredPaiements();
    const rows = [['Date','Transaction','Élève','Classe','Motif','Montant attendu','Montant payé','Mode','Statut','Encaissé par']];
    list.forEach(p=>{
      const el = Storage.getById('eleves', p.eleveId);
      const cls = el ? Storage.getById('classes', el.classeId) : null;
      rows.push([
        p.date, p.transactionId,
        el?el.prenom+' '+el.nom:'', cls?cls.nom:'',
        p.libelle, p.montantAttendu||0, p.montantPaye||0,
        p.mode, p.statut||'validé', p.encaissePar||''
      ]);
    });
    const csv = rows.map(r=>r.map(v=>`"${String(v??'').replace(/"/g,'""')}"`).join(';')).join('\n');
    const blob = new Blob(['\ufeff'+csv], {type:'text/csv;charset=utf-8;'});
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'paiements_'+new Date().toISOString().slice(0,10)+'.csv';
    a.click();
    Notify.toast('Export CSV généré.', 'success');
  }
};
