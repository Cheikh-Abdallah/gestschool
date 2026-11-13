/**
 * Initialisation de la base de données VIERGE.
 * Aucune donnée de démonstration.
 */
const DB = {
  init(){
    // Si une base existe déjà, on ne fait rien
    if(Storage.read()) return;

    // 1. Année académique par défaut (vide, à configurer par vous)
    const anneeActive = {
      id: 'annee_initiale',
      libelle: '2024-2025',
      active: true,
      typePeriode: 'semestre', // Modifiable par vous dans "Paramètres"
      periodes: [
        { nom: 'Semestre 1', debut: '', fin: '' },
        { nom: 'Semestre 2', debut: '', fin: '' }
      ],
      gestionManuelle: true
    };

    // 2. Paramètres de l'établissement (à personnaliser dans Paramètres)
    const parametres = {
      typeEtablissement: 'superieur', // 'secondaire' ou 'superieur'
      etablissement: 'Mon Établissement',
      adresse: '',
      telephone: '',
      email: '',
      directeur: '',
      devise: 'FCFA',
      slogan: '',
      logo: null,
      seuilReussite: 10,
      seuilPassable: 10,
      seuilBien: 12,
      seuilTresBien: 14,
      seuilExcellent: 16,
      docLigne1: '',
      docLigne2: '',
      docLigne3: '',
      docMention: '',
      signDirecteur: '',
      signCenseur: '',
      signSurveillant: '',
      signComptable: '',
      signProf: '',
      cachet: '',
      footer: ''
    };

    // 3. Comptes utilisateurs (indispensables pour se connecter)
    const utilisateurs = [
      { id: 'usr_admin', login: 'admin',     password: 'admin123', nom: 'Administrateur', role: 'admin' },
      { id: 'usr_dir',   login: 'directeur', password: 'dir123',   nom: 'Directeur',      role: 'directeur' },
      { id: 'usr_sec',   login: 'secretaire',password: 'sec123',   nom: 'Secrétaire',     role: 'secretaire' },
      { id: 'usr_com',   login: 'comptable', password: 'com123',   nom: 'Comptable',      role: 'comptable' },
      { id: 'usr_ens',   login: 'enseignant',password: 'ens123',   nom: 'Enseignant',     role: 'enseignant' },
      { id: 'usr_surv',  login: 'surveillant',password: 'surv123', nom: 'Surveillant',    role: 'surveillant' }
    ];

    // 4. Écriture de la base 100% vierge
    Storage.write({
      parametres,
      annees: [anneeActive],
      utilisateurs,

      // Toutes les autres collections sont VIDES
      eleves: [],
      enseignants: [],
      classes: [],
      matieres: [],
      frais: [],
      paiements: [],
      absences: [],
      evaluations: [],
      notes: [],
      emploiTemps: [],
      logs: [],

      // Collections pour le mode supérieur (LMD)
      filieres: [],
      niveaux: [],
      groupes: [],
      ue: [],
      ecue: [],
      evaluationsLMD: [],
      notesLMD: []
    });
  }
};
