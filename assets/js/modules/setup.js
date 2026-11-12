/**
 * Écran de bienvenue au premier démarrage.
 * Demande à l'admin de choisir le type d'établissement.
 * Ne s'affiche qu'une seule fois (flag localStorage).
 */
const Setup = {
  KEY: 'gestschool_setup_done',

  needsSetup(){
    return !localStorage.getItem(this.KEY);
  },

  run(){
    if(!this.needsSetup()) return;

    const overlay = document.createElement('div');
    overlay.className = 'setup-overlay';
    overlay.innerHTML = `
      <div class="setup-card">
        <div class="setup-header">
          <div class="setup-logo"><i class="bi bi-mortarboard-fill"></i></div>
          <h4>Bienvenue sur GestSchool</h4>
          <p>Avant de commencer, indiquez le type de votre établissement.<br>
            Ce choix peut être modifié plus tard dans les paramètres.</p>
        </div>

        <div class="setup-choices">
          <div class="setup-choice" data-type="secondaire">
            <div class="setup-choice-icon"><i class="bi bi-building"></i></div>
            <div class="setup-choice-title">Enseignement secondaire</div>
            <div class="setup-choice-desc">
              Collèges et lycées. Classes, matières classiques, notes /20, bulletins trimestriels.
            </div>
          </div>

          <div class="setup-choice" data-type="superieur">
            <div class="setup-choice-icon"><i class="bi bi-bank"></i></div>
            <div class="setup-choice-title">Enseignement supérieur</div>
            <div class="setup-choice-desc">
              Universités, BTS, DUT, grandes écoles. Filières, UE, crédits ECTS, relevés LMD.
            </div>
            <div class="setup-choice-badge">Nouveau</div>
          </div>
        </div>

        <div class="setup-footer">
          <p>Vous pourrez changer ce choix à tout moment dans <strong>Paramètres</strong>.</p>
          <button class="setup-btn" id="setupConfirm" disabled>
            <i class="bi bi-check2 me-1"></i> Démarrer
          </button>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);

    let selected = null;
    overlay.querySelectorAll('.setup-choice').forEach(choice=>{
      choice.onclick = ()=>{
        overlay.querySelectorAll('.setup-choice').forEach(c=>c.classList.remove('selected'));
        choice.classList.add('selected');
        selected = choice.dataset.type;
        overlay.querySelector('#setupConfirm').disabled = false;
      };
    });

    overlay.querySelector('#setupConfirm').onclick = ()=>{
      if(!selected) return;
      const db = Storage.read();
      if(db && db.parametres){
        db.parametres.typeEtablissement = selected;
        Storage.write(db);
      }
      localStorage.setItem(this.KEY, '1');
      Notify.toast(
        selected === 'superieur'
          ? 'Mode supérieur activé. Bienvenue !'
          : 'Mode secondaire activé. Bienvenue !',
        'success'
      );
      overlay.remove();
      // Recharger pour appliquer les nouveaux libellés
      setTimeout(()=>location.reload(), 800);
    };
  },

  /**
   * Réinitialiser le flag (utile pour tester le premier démarrage).
   * Accessible depuis la console : Setup.reset()
   */
  reset(){
    localStorage.removeItem(this.KEY);
    console.log('[Setup] Flag réinitialisé. Rechargez la page.');
  }
};