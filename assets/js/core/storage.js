/**
 * Couche de persistance LocalStorage.
 * API générique prête à être remplacée par des fetch() vers une API PHP/MySQL.
 */
const Storage = {
  KEY: 'gestschool_db_v1',

  read(){
    try { return JSON.parse(localStorage.getItem(this.KEY)) || null; }
    catch(e){ console.error('DB read error', e); return null; }
  },

  write(data){
    localStorage.setItem(this.KEY, JSON.stringify(data));
  },

  reset(){
    localStorage.removeItem(this.KEY);
  },

  // -------- API génériques (miroir d'un futur backend) --------
  getAll(collection){
    const db = this.read() || {};
    return (db[collection] || []).filter(x => !x.archived);
  },

  getAllIncludingArchived(collection){
    const db = this.read() || {};
    return db[collection] || [];
  },

  getById(collection, id){
    const db = this.read() || {};
    return (db[collection] || []).find(x => x.id === id) || null;
  },

  create(collection, item){
    const db = this.read() || {};
    if(!db[collection]) db[collection] = [];
    item.id = item.id || Utils.uid(collection);
    item.createdAt = item.createdAt || new Date().toISOString();
    item.updatedAt = new Date().toISOString();
    db[collection].push(item);
    this.write(db);
    return item;
  },

  update(collection, id, patch){
    const db = this.read() || {};
    const list = db[collection] || [];
    const idx = list.findIndex(x => x.id === id);
    if(idx === -1) return null;
    list[idx] = {...list[idx], ...patch, updatedAt:new Date().toISOString()};
    this.write(db);
    return list[idx];
  },

  remove(collection, id, soft=true){
    const db = this.read() || {};
    const list = db[collection] || [];
    const idx = list.findIndex(x => x.id === id);
    if(idx === -1) return false;
    if(soft){ list[idx].archived = true; list[idx].updatedAt = new Date().toISOString(); }
    else list.splice(idx,1);
    this.write(db);
    return true;
  }
};