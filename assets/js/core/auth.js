/**
 * Authentification + Permissions par rôle + Logs.
 * V3 : session en localStorage (fiable en PWA / standalone).
 */
const Auth = {
  SESSION_KEY: 'gestschool_session',
  SESSION_TTL: 8 * 60 * 60 * 1000, // 8 heures

  // ============================================================
  // RÔLES ET PERMISSIONS
  // ============================================================
  ROLES: {
    admin: {
      label: 'Administrateur',
      color: 'danger',
      icon: 'bi-shield-fill-check',
      modules: ['dashboard','eleves','enseignants','classes','matieres','notes','absences','paiements','bulletins','emploi','annees','rapports','utilisateurs','parametres','filieres','niveaux','ue','ecue','notesLMD','bulletinsLMD'],
      description: 'Accès total à toutes les fonctionnalités.'
    },
    directeur: {
      label: 'Directeur',
      color: 'primary',
      icon: 'bi-person-badge',
      modules: ['dashboard','eleves','enseignants','classes','matieres','notes','absences','paiements','bulletins','emploi','annees','rapports','parametres','filieres','niveaux','ue','ecue','notesLMD','bulletinsLMD'],
      description: 'Consultation et validation. Pas de gestion des utilisateurs.'
    },
    secretaire: {
      label: 'Secrétaire',
      color: 'info',
      icon: 'bi-person-workspace',
      modules: ['dashboard','eleves','classes','bulletins','rapports','filieres','niveaux'],
      description: 'Inscriptions et gestion des élèves.'
    },
    comptable: {
      label: 'Comptable',
      color: 'success',
      icon: 'bi-cash-coin',
      modules: ['dashboard','eleves','paiements','bulletins','rapports'],
      description: 'Paiements et finances.'
    },
    enseignant: {
      label: 'Enseignant',
      color: 'warning',
      icon: 'bi-mortarboard',
      modules: ['dashboard','notes','absences','emploi','bulletins','ue','ecue','notesLMD','bulletinsLMD'],
      description: 'Notes et absences de ses classes.'
    },
    surveillant: {
      label: 'Surveillant',
      color: 'secondary',
      icon: 'bi-eye',
      modules: ['dashboard','absences','emploi','rapports'],
      description: 'Suivi des absences et retards.'
    }
  },

  // ============================================================
  // SESSION (localStorage + expiration 8h)
  // ============================================================
  login(login, password){
    const users = Storage.getAllIncludingArchived('utilisateurs');
    const user = users.find(u => u.login === login && u.password === password && !u.archived);
    if(!user) return null;
    const session = {
      userId: user.id,
      nom: user.nom,
      login: user.login,
      role: user.role,
      loginAt: new Date().toISOString(),
      expiresAt: Date.now() + this.SESSION_TTL
    };
    localStorage.setItem(this.SESSION_KEY, JSON.stringify(session));
    this.log('login', 'Connexion de ' + user.nom);
    return session;
  },

  current(){
    try{
      const raw = localStorage.getItem(this.SESSION_KEY);
      if(!raw) return null;
      const s = JSON.parse(raw);
      if(s.expiresAt && Date.now() > s.expiresAt){
        localStorage.removeItem(this.SESSION_KEY);
        return null;
      }
      return s;
    }catch(e){
      return null;
    }
  },

  logout(){
    const u = this.current();
    if(u) this.log('logout', 'Déconnexion de ' + u.nom);
    localStorage.removeItem(this.SESSION_KEY);
    location.href = 'index.html';
  },

  requireAuth(){
    const s = this.current();
    if(!s){ location.href = 'index.html'; return null; }
    return s;
  },

  // ============================================================
  // PERMISSIONS
  // ============================================================
  getRole(role){
    return this.ROLES[role] || null;
  },

  canAccess(role, module){
    const r = this.getRole(role);
    return r ? r.modules.includes(module) : false;
  },

  canAccessCurrent(module){
    const s = this.current();
    return s ? this.canAccess(s.role, module) : false;
  },

  isAdmin(){
    const s = this.current();
    return s && s.role === 'admin';
  },

  // ============================================================
  // LOGS
  // ============================================================
  log(action, details){
    const s = this.current();
    const db = Storage.read() || {};
    if(!db.logs) db.logs = [];
    db.logs.push({
      id: 'log_' + Date.now() + '_' + Math.random().toString(36).slice(2,6),
      userId: s?.userId || 'anonyme',
      userNom: s?.nom || 'Anonyme',
      role: s?.role || '—',
      action,
      details,
      date: new Date().toISOString()
    });
    if(db.logs.length > 500) db.logs = db.logs.slice(-500);
    Storage.write(db);
  },

  getLogs(){
    const db = Storage.read() || {};
    return (db.logs || []).sort((a,b)=>b.date.localeCompare(a.date));
  },

  clearLogs(){
    if(!this.isAdmin()) return false;
    const db = Storage.read() || {};
    db.logs = [];
    Storage.write(db);
    this.log('logs_clear', 'Purge de tous les logs');
    return true;
  },

  // ============================================================
  // MOT DE PASSE
  // ============================================================
  changePassword(userId, oldPwd, newPwd){
    const u = Storage.getById('utilisateurs', userId);
    if(!u) return {ok:false, message:'Utilisateur introuvable.'};
    if(u.password !== oldPwd) return {ok:false, message:'Ancien mot de passe incorrect.'};
    if(newPwd.length < 6) return {ok:false, message:'Le nouveau mot de passe doit contenir au moins 6 caractères.'};
    Storage.update('utilisateurs', userId, {password: newPwd});
    this.log('password_change', 'Mot de passe modifié pour ' + u.login);
    return {ok:true};
  },

  resetPassword(userId, newPwd){
    if(!this.isAdmin()) return {ok:false, message:'Accès refusé.'};
    const u = Storage.getById('utilisateurs', userId);
    if(!u) return {ok:false, message:'Utilisateur introuvable.'};
    if(newPwd.length < 6) return {ok:false, message:'Le mot de passe doit contenir au moins 6 caractères.'};
    Storage.update('utilisateurs', userId, {password: newPwd});
    this.log('password_reset', 'Réinitialisation du mot de passe de ' + u.login);
    return {ok:true};
  }
};
