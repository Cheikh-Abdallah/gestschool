/**
 * Initialisation + jeu de données de démonstration.
 * Établissement fictif : École Cheikh Anta Diop, Dakar, Sénégal.
 */
const DB = {
  init(){
    if(Storage.read()) return;
    const annee = {
      id:'annee_2024',
      libelle:'2024-2025',
      active:true,
      typePeriode:'trimestre',
      periodes:['Trimestre 1','Trimestre 2','Trimestre 3'],
      gestionManuelle: false
    };

    // ============================================================
    // PARAMÈTRES ÉTABLISSEMENT
    // ============================================================
    const parametres = {
      typeEtablissement: 'secondaire',
      etablissement: 'École Cheikh Anta Diop',
      adresse: 'Avenue Bourguiba, Dakar, Sénégal',
      telephone: '+221 33 800 00 00',
      email: 'contact@ecole-cad.sn',
      directeur: 'M. Ibrahima SARR',
      devise: 'FCFA',
      slogan: '',
      logo: null,
      seuilReussite: 10,
      seuilPassable: 10,
      seuilBien: 12,
      seuilTresBien: 14,
      seuilExcellent: 16,
      docLigne1: 'RÉPUBLIQUE DU SÉNÉGAL',
      docLigne2: "MINISTÈRE DE L'ÉDUCATION NATIONALE",
      docLigne3: "INSPECTION D'ACADÉMIE DE DAKAR",
      docMention: 'Un Peuple - Un But - Une Foi',
      signDirecteur: 'M. Ibrahima SARR',
      signCenseur: '',
      signSurveillant: '',
      signComptable: '',
      signProf: '',
      cachet: 'CACHET OFFICIEL',
      footer: "Établissement public d'enseignement secondaire"
    };

    // ============================================================
    // CLASSES (12 classes)
    // ============================================================
    const nomsClasses = [
      {nom:'6ᵉ A',niveau:'6ᵉ',cycle:'Moyen'},
      {nom:'6ᵉ B',niveau:'6ᵉ',cycle:'Moyen'},
      {nom:'5ᵉ A',niveau:'5ᵉ',cycle:'Moyen'},
      {nom:'5ᵉ B',niveau:'5ᵉ',cycle:'Moyen'},
      {nom:'4ᵉ A',niveau:'4ᵉ',cycle:'Moyen'},
      {nom:'4ᵉ B',niveau:'4ᵉ',cycle:'Moyen'},
      {nom:'3ᵉ A',niveau:'3ᵉ',cycle:'Moyen'},
      {nom:'3ᵉ B',niveau:'3ᵉ',cycle:'Moyen'},
      {nom:'2nde L',niveau:'2nde',cycle:'Secondaire'},
      {nom:'2nde S',niveau:'2nde',cycle:'Secondaire'},
      {nom:'1ère L',niveau:'1ère',cycle:'Secondaire'},
      {nom:'Term L2',niveau:'Terminale',cycle:'Secondaire'}
    ];
    const classes = nomsClasses.map((c,i)=>({
      id:'cls_'+(i+1),
      nom:c.nom, niveau:c.niveau, cycle:c.cycle, serie:'',
      effectifMax:40,
      profPrincipalId:null,
      enseignantIds:[],
      matiereIds:[],
      anneeId:annee.id
    }));

    // ============================================================
    // ENSEIGNANTS (18 profs)
    // ============================================================
    const profsRaw = [
      ['Awa','NDIAYE','F'],['Cheikh','DIOP','M'],['Fatou','SOW','F'],
      ['Moussa','FALL','M'],['Aminata','BA','F'],['Ibrahima','GUEYE','M'],
      ['Mariama','DIALLO','F'],['Ousmane','SARR','M'],['Khady','THIAM','F'],
      ['Alioune','CISSE','M'],['Ndeye','FAYE','F'],['Abdoulaye','NIANG','M'],
      ['Sokhna','MBOUP','F'],['Modou','SEC','M'],['Adja','KA','F'],
      ['Pape','DIAGNE','M'],['Nafissatou','SY','F'],['Lamine','BODIAN','M']
    ];
    const specialites = ['Mathématiques','Français','Anglais','SVT','Histoire-Géo','Physique-Chimie'];
    const statuts = ['Titulaire','Titulaire','Titulaire','Contractuel','Vacataire'];

    const enseignants = profsRaw.map((p,i)=>({
      id:'ens_'+(i+1),
      matricule:'ENS-'+(1001+i),
      prenom:p[0], nom:p[1], sexe:p[2],
      dateNaissance: new Date(1980 + (i%15), i%12, (i%27)+1).toISOString().slice(0,10),
      telephone:'+221 77 '+(100+i)+' 00 '+(10+i),
      email:(p[0].toLowerCase()+'.'+p[1].toLowerCase()+'@ecole-cad.sn'),
      adresse:'Quartier '+(i%10)+', Dakar',
      specialite: specialites[i%6],
      diplome: i%3===0 ? 'Master' : 'Licence',
      statut: statuts[i%statuts.length],
      dateRecrutement:'2020-09-01',
      matieres:[],
      classes:[],
      anneeId:annee.id
    }));

    // ============================================================
    // ÉLÈVES (245)
    // ============================================================
    const prenomsM = ['Moussa','Ibrahima','Cheikh','Alioune','Modou','Pape','Lamine','Ousmane','Abdoulaye','Mamadou','Souleymane','Babacar','Assane','Malick'];
    const prenomsF = ['Fatou','Aminata','Awa','Mariama','Khady','Ndeye','Sokhna','Adja','Nafissatou','Coumba','Bineta','Astou','Rokhaya','Dieynaba','Seynabou'];
    const noms = ['NDIAYE','DIOP','SOW','FALL','BA','GUEYE','DIALLO','SARR','THIAM','CISSE','FAYE','NIANG','MBOUP','SEC','KA','DIAGNE','SY','BODIAN','SYLLA','CAMARA'];
    const eleves = [];
    let matricule = 1000;

    for(let i=0;i<245;i++){
      const sexe = i%2===0 ? 'M' : 'F';
      const prenom = sexe==='M' ? prenomsM[i%prenomsM.length] : prenomsF[i%prenomsF.length];
      const nom = noms[i%noms.length];
      const classeIdx = i%classes.length;
      matricule++;
      eleves.push({
        id:'elv_'+(i+1),
        matricule:'ELV-'+matricule,
        prenom, nom, sexe,
        dateNaissance: new Date(2008+(i%6), i%12, (i%27)+1).toISOString().slice(0,10),
        lieuNaissance:'Dakar',
        nationalite:'Sénégalaise',
        adresse:'Quartier '+(i%10)+', Dakar',
        telephone:'+221 77 '+(200+i)+' 00 '+(20+i),
        photo:null,
        dateInscription:'2024-10-'+String((i%9)+1).padStart(2,'0'),
        classeId:classes[classeIdx].id,
        anneeId:annee.id,
        nomPere:'M. '+nom,
        nomMere:'Mme '+prenom,
        nomTuteur:'',
        telephoneResponsable:'+221 77 '+(200+i)+' 00 '+(20+i),
        adresseResponsable:'Dakar',
        infosMed: (i%20===0) ? 'Allergie aux arachides' : ''
      });
    }

    classes.forEach((c,i)=>{
      c.profPrincipalId = enseignants[i%enseignants.length].id;
    });

    // ============================================================
    // MATIÈRES (8)
    // ============================================================
    const matieresRaw = [
      {nom:'Mathématiques',     coef:4, vol:4},
      {nom:'Français',          coef:4, vol:4},
      {nom:'Anglais',           coef:3, vol:3},
      {nom:'SVT',               coef:2, vol:2},
      {nom:'Histoire-Géo',      coef:2, vol:2},
      {nom:'Physique-Chimie',   coef:3, vol:3},
      {nom:'EPS',               coef:1, vol:1},
      {nom:'Éducation civique', coef:1, vol:1}
    ];
    const matieres = matieresRaw.map((m,i)=>({
      id:'mat_'+(i+1),
      nom:m.nom,
      coefficient:m.coef,
      classeIds:classes.map(c=>c.id),
      enseignantId:enseignants[i%enseignants.length].id,
      volumeHoraire:m.vol,
      anneeId:annee.id
    }));

    matieres.forEach(mat=>{
      const ens = enseignants.find(e=>e.id === mat.enseignantId);
      if(ens){
        ens.matieres.push(mat.id);
        mat.classeIds.forEach(cid=>{
          if(!ens.classes.includes(cid)) ens.classes.push(cid);
        });
      }
    });

    classes.forEach(c=>{
      c.matiereIds = matieres.filter(m=>m.classeIds.includes(c.id)).map(m=>m.id);
      const ensSet = new Set();
      c.matiereIds.forEach(mid=>{
        const mat = matieres.find(m=>m.id===mid);
        if(mat && mat.enseignantId) ensSet.add(mat.enseignantId);
      });
      c.enseignantIds = [...ensSet];
    });

    // ============================================================
    // FRAIS
    // ============================================================
    const frais = [];
    classes.forEach((c,i)=>{
      frais.push({
        id:'fr_ins_'+(i+1),
        classeId:c.id,
        libelle:"Frais d'inscription",
        montant:25000,
        type:'inscription',
        anneeId:annee.id
      });
      for(let m=0;m<9;m++){
        frais.push({
          id:'fr_men_'+c.id+'_'+(m+1),
          classeId:c.id,
          libelle:'Mensualité '+(m+1),
          montant:[35000,40000,45000,50000][i%4],
          type:'mensualite',
          mois:m+1,
          anneeId:annee.id
        });
      }
    });

    // ============================================================
    // PAIEMENTS (~70% des élèves)
    // ============================================================
    const modes = ['Espèces','Wave','Orange Money','Virement bancaire'];
    const paiements = [];
    let payIdx = 0;

    eleves.forEach((el, ei)=>{
      if(ei % 10 < 7){
        const ins = frais.find(f=>f.classeId===el.classeId && f.type==='inscription');
        if(ins){
          paiements.push({
            id:'pay_'+(++payIdx),
            transactionId:'TRX-'+String(10000+payIdx).padStart(5,'0'),
            eleveId:el.id, fraisId:ins.id, libelle:ins.libelle,
            montantAttendu:ins.montant, montantPaye:ins.montant,
            mode:modes[ei%modes.length],
            date:'2024-10-'+String((ei%9)+1).padStart(2,'0'),
            encaissePar:'secretaire',
            statut:'validé',
            anneeId:annee.id
          });
        }
        const nbMens = 1 + (ei%5);
        for(let m=1;m<=nbMens;m++){
          const fr = frais.find(f=>f.classeId===el.classeId && f.type==='mensualite' && f.mois===m);
          if(fr){
            paiements.push({
              id:'pay_'+(++payIdx),
              transactionId:'TRX-'+String(10000+payIdx).padStart(5,'0'),
              eleveId:el.id, fraisId:fr.id, libelle:fr.libelle,
              montantAttendu:fr.montant, montantPaye:fr.montant,
              mode:modes[(ei+m)%modes.length],
              date:'2024-'+String(9+m).padStart(2,'0')+'-'+String((ei%27)+1).padStart(2,'0'),
              encaissePar:'comptable',
              statut:'validé',
              anneeId:annee.id
            });
          }
        }
      }
    });

    // ============================================================
    // ABSENCES (60)
    // ============================================================
    const absences = [];
    for(let i=0;i<60;i++){
      const el = eleves[i*3 % eleves.length];
      absences.push({
        id:'abs_'+(i+1),
        eleveId:el.id, classeId:el.classeId,
        date:'2024-11-'+String((i%15)+1).padStart(2,'0'),
        heure: i%5===0 ? '08:15' : '',
        type: i%5===0 ? 'retard' : 'absence',
        motif:['Maladie','Rendez-vous','Non justifié','Transport'][i%4],
        justifie: i%3===0,
        justifDetail: i%3===0 ? 'Certificat médical' : '',
        anneeId:annee.id
      });
    }

    // ============================================================
    // ÉVALUATIONS + NOTES (secondaire)
    // ============================================================
    const evaluations = [];
    const notes = [];
    let evIdx = 0, noteIdx = 0;

    classes.forEach(cls=>{
      matieres.slice(0,5).forEach(mat=>{
        evIdx++;
        evaluations.push({
          id:'ev_'+evIdx,
          classeId:cls.id,
          matiereId:mat.id,
          periode:'Trimestre 1',
          type:'Composition',
          date:'2024-11-15',
          bareme:20,
          anneeId:annee.id
        });
        eleves.filter(e=>e.classeId===cls.id).slice(0,20).forEach((el,idx)=>{
          notes.push({
            id:'nt_'+(++noteIdx),
            evaluationId:'ev_'+evIdx,
            eleveId:el.id,
            valeur: 8 + ((idx*7 + mat.coefficient*3) % 13),
            statut:'noté',
            anneeId:annee.id
          });
        });
      });
    });

    // ============================================================
    // EMPLOI DU TEMPS (échantillon)
    // ============================================================
    const emploiTemps = [];
    const jours = ['Lundi','Mardi','Mercredi','Jeudi','Vendredi'];
    let empIdx = 0;

    classes.forEach(c=>{
      jours.forEach(j=>{
        matieres.slice(0,4).forEach((m,mi)=>{
          emploiTemps.push({
            id:'emp_'+(++empIdx),
            classeId:c.id,
            matiereId:m.id,
            enseignantId:m.enseignantId,
            salle:'Salle '+(c.id.replace(/\D/g,'') || '1'),
            jour:j,
            heureDebut:(8+mi*2)+':00',
            heureFin:(10+mi*2)+':00',
            anneeId:annee.id
          });
        });
      });
    });

    // ============================================================
    // UTILISATEURS (6 comptes démo)
    // ============================================================
    const utilisateurs = [
      {id:'usr_admin',login:'admin',     password:'admin123',nom:'Admin',   role:'admin'},
      {id:'usr_dir',  login:'directeur', password:'dir123',  nom:'Directeur', role:'directeur'},
      {id:'usr_sec',  login:'secretaire',password:'sec123',  nom:'Secretaire',  role:'secretaire'},
      {id:'usr_com',  login:'comptable', password:'com123',  nom:'Comptable',     role:'comptable'},
      {id:'usr_ens',  login:'enseignant',password:'ens123',  nom:'Enseignant',    role:'enseignant'},
      {id:'usr_surv', login:'surveillant',password:'surv123',nom:'Surveillant',  role:'surveillant'}
    ];

    // ============================================================
    // COLLECTIONS SUPÉRIEUR (déclarées ICI pour être accessibles
    // dans le Storage.write final même si le if n'est pas exécuté)
    // ============================================================
    let filieres = [], niveaux = [], groupes = [], ue = [], ecue = [];
    let evalsLMD = [], notesLMD = [];

    if(parametres.typeEtablissement === 'superieur'){
      filieres = [
        {id:'fil_info', code:'INFO', nom:'Informatique', cycle:'Licence', dureeAnnees:3, description:'Génie logiciel, réseaux, développement web'},
        {id:'fil_gestion', code:'GEST', nom:'Gestion des Entreprises', cycle:'Licence', dureeAnnees:3, description:'Comptabilité, marketing, management'},
        {id:'fil_droit', code:'DROIT', nom:'Droit', cycle:'Licence', dureeAnnees:3, description:'Droit public et privé'},
        {id:'fil_bts_info', code:'BTS-INFO', nom:'BTS Informatique', cycle:'BTS', dureeAnnees:2, description:'Brevet de Technicien Supérieur'},
        {id:'fil_dut_gest', code:'DUT-GEST', nom:'DUT Gestion', cycle:'DUT', dureeAnnees:2, description:"Diplôme Universitaire de Technologie"}
      ];

      niveaux = [
        {id:'niv_info_l1', filiereId:'fil_info', code:'L1', libelle:'Licence 1 Informatique', ordre:1, creditsRequis:60, fraisScolarite:500000},
        {id:'niv_info_l2', filiereId:'fil_info', code:'L2', libelle:'Licence 2 Informatique', ordre:2, creditsRequis:60, fraisScolarite:550000},
        {id:'niv_info_l3', filiereId:'fil_info', code:'L3', libelle:'Licence 3 Informatique', ordre:3, creditsRequis:60, fraisScolarite:600000},
        {id:'niv_gest_l1', filiereId:'fil_gestion', code:'L1', libelle:'Licence 1 Gestion', ordre:1, creditsRequis:60, fraisScolarite:480000},
        {id:'niv_gest_l2', filiereId:'fil_gestion', code:'L2', libelle:'Licence 2 Gestion', ordre:2, creditsRequis:60, fraisScolarite:520000},
        {id:'niv_gest_l3', filiereId:'fil_gestion', code:'L3', libelle:'Licence 3 Gestion', ordre:3, creditsRequis:60, fraisScolarite:580000},
        {id:'niv_droit_l1', filiereId:'fil_droit', code:'L1', libelle:'Licence 1 Droit', ordre:1, creditsRequis:60, fraisScolarite:450000},
        {id:'niv_bts1', filiereId:'fil_bts_info', code:'BTS1', libelle:'BTS 1 Informatique', ordre:1, creditsRequis:60, fraisScolarite:600000},
        {id:'niv_bts2', filiereId:'fil_bts_info', code:'BTS2', libelle:'BTS 2 Informatique', ordre:2, creditsRequis:60, fraisScolarite:650000},
        {id:'niv_dut1', filiereId:'fil_dut_gest', code:'DUT1', libelle:'DUT 1 Gestion', ordre:1, creditsRequis:60, fraisScolarite:550000}
      ];

      groupes = [
        {id:'grp_info_l1_a', niveauId:'niv_info_l1', nom:'L1 Info - Groupe A', effectifMax:40, profPrincipalId:null, enseignantIds:[], ueIds:[], anneeId:annee.id},
        {id:'grp_info_l1_b', niveauId:'niv_info_l1', nom:'L1 Info - Groupe B', effectifMax:40, profPrincipalId:null, enseignantIds:[], ueIds:[], anneeId:annee.id},
        {id:'grp_info_l2_a', niveauId:'niv_info_l2', nom:'L2 Info - Groupe A', effectifMax:40, profPrincipalId:null, enseignantIds:[], ueIds:[], anneeId:annee.id},
        {id:'grp_gest_l1_a', niveauId:'niv_gest_l1', nom:'L1 Gestion - Groupe A', effectifMax:45, profPrincipalId:null, enseignantIds:[], ueIds:[], anneeId:annee.id},
        {id:'grp_droit_l1_a', niveauId:'niv_droit_l1', nom:'L1 Droit - Groupe A', effectifMax:50, profPrincipalId:null, enseignantIds:[], ueIds:[], anneeId:annee.id},
        {id:'grp_bts1_a', niveauId:'niv_bts1', nom:'BTS 1 Info - Groupe A', effectifMax:30, profPrincipalId:null, enseignantIds:[], ueIds:[], anneeId:annee.id}
      ];

      ue = [
        {id:'ue_info_l1_s1_01', code:'UE-INFO-L1-S1-01', nom:'Programmation 1', semestre:'S1', filiereId:'fil_info', niveauId:'niv_info_l1', creditsECTS:6, coefficient:3, typeUE:'Fondamentale', ecueIds:[], enseignantIds:[], anneeId:annee.id},
        {id:'ue_info_l1_s1_02', code:'UE-INFO-L1-S1-02', nom:'Mathématiques discrètes', semestre:'S1', filiereId:'fil_info', niveauId:'niv_info_l1', creditsECTS:6, coefficient:3, typeUE:'Fondamentale', ecueIds:[], enseignantIds:[], anneeId:annee.id},
        {id:'ue_info_l1_s1_03', code:'UE-INFO-L1-S1-03', nom:'Architecture des ordinateurs', semestre:'S1', filiereId:'fil_info', niveauId:'niv_info_l1', creditsECTS:6, coefficient:3, typeUE:'Fondamentale', ecueIds:[], enseignantIds:[], anneeId:annee.id},
        {id:'ue_info_l1_s1_04', code:'UE-INFO-L1-S1-04', nom:'Anglais technique', semestre:'S1', filiereId:'fil_info', niveauId:'niv_info_l1', creditsECTS:3, coefficient:1, typeUE:'Transversale', ecueIds:[], enseignantIds:[], anneeId:annee.id},
        {id:'ue_info_l1_s1_05', code:'UE-INFO-L1-S1-05', nom:'Méthodologie universitaire', semestre:'S1', filiereId:'fil_info', niveauId:'niv_info_l1', creditsECTS:3, coefficient:1, typeUE:'Transversale', ecueIds:[], enseignantIds:[], anneeId:annee.id},
        {id:'ue_info_l1_s2_01', code:'UE-INFO-L1-S2-01', nom:'Programmation 2', semestre:'S2', filiereId:'fil_info', niveauId:'niv_info_l1', creditsECTS:6, coefficient:3, typeUE:'Fondamentale', ecueIds:[], enseignantIds:[], anneeId:annee.id},
        {id:'ue_info_l1_s2_02', code:'UE-INFO-L1-S2-02', nom:'Bases de données', semestre:'S2', filiereId:'fil_info', niveauId:'niv_info_l1', creditsECTS:6, coefficient:3, typeUE:'Fondamentale', ecueIds:[], enseignantIds:[], anneeId:annee.id},
        {id:'ue_info_l2_s1_01', code:'UE-INFO-L2-S1-01', nom:'Algorithmique avancée', semestre:'S1', filiereId:'fil_info', niveauId:'niv_info_l2', creditsECTS:6, coefficient:3, typeUE:'Fondamentale', ecueIds:[], enseignantIds:[], anneeId:annee.id},
        {id:'ue_info_l2_s1_02', code:'UE-INFO-L2-S1-02', nom:'Réseaux', semestre:'S1', filiereId:'fil_info', niveauId:'niv_info_l2', creditsECTS:6, coefficient:3, typeUE:'Professionnelle', ecueIds:[], enseignantIds:[], anneeId:annee.id},
        {id:'ue_gest_l1_s1_01', code:'UE-GEST-L1-S1-01', nom:'Comptabilité générale', semestre:'S1', filiereId:'fil_gestion', niveauId:'niv_gest_l1', creditsECTS:6, coefficient:3, typeUE:'Fondamentale', ecueIds:[], enseignantIds:[], anneeId:annee.id},
        {id:'ue_gest_l1_s1_02', code:'UE-GEST-L1-S1-02', nom:'Économie générale', semestre:'S1', filiereId:'fil_gestion', niveauId:'niv_gest_l1', creditsECTS:6, coefficient:3, typeUE:'Fondamentale', ecueIds:[], enseignantIds:[], anneeId:annee.id},
        {id:'ue_droit_l1_s1_01', code:'UE-DROIT-L1-S1-01', nom:'Introduction au droit', semestre:'S1', filiereId:'fil_droit', niveauId:'niv_droit_l1', creditsECTS:6, coefficient:3, typeUE:'Fondamentale', ecueIds:[], enseignantIds:[], anneeId:annee.id},
        {id:'ue_bts1_s1_01', code:'UE-BTS1-S1-01', nom:'Développement web', semestre:'S1', filiereId:'fil_bts_info', niveauId:'niv_bts1', creditsECTS:6, coefficient:3, typeUE:'Professionnelle', ecueIds:[], enseignantIds:[], anneeId:annee.id}
      ];

      ecue = [
        {id:'ecue_info_l1_s1_01_cm', ueId:'ue_info_l1_s1_01', nom:'CM Programmation 1', coefficient:1, volumeCM:20, volumeTD:0, volumeTP:0, enseignantId:null, anneeId:annee.id},
        {id:'ecue_info_l1_s1_01_td', ueId:'ue_info_l1_s1_01', nom:'TD Programmation 1', coefficient:1, volumeCM:0, volumeTD:15, volumeTP:0, enseignantId:null, anneeId:annee.id},
        {id:'ecue_info_l1_s1_01_tp', ueId:'ue_info_l1_s1_01', nom:'TP Programmation 1', coefficient:1, volumeCM:0, volumeTD:0, volumeTP:15, enseignantId:null, anneeId:annee.id},
        {id:'ecue_info_l1_s1_02_cm', ueId:'ue_info_l1_s1_02', nom:'CM Maths discrètes', coefficient:1, volumeCM:25, volumeTD:0, volumeTP:0, enseignantId:null, anneeId:annee.id},
        {id:'ecue_info_l1_s1_02_td', ueId:'ue_info_l1_s1_02', nom:'TD Maths discrètes', coefficient:1, volumeCM:0, volumeTD:20, volumeTP:0, enseignantId:null, anneeId:annee.id},
        {id:'ecue_info_l1_s1_03_cm', ueId:'ue_info_l1_s1_03', nom:'CM Architecture', coefficient:1, volumeCM:20, volumeTD:0, volumeTP:0, enseignantId:null, anneeId:annee.id},
        {id:'ecue_info_l1_s1_03_tp', ueId:'ue_info_l1_s1_03', nom:'TP Architecture', coefficient:1, volumeCM:0, volumeTD:0, volumeTP:20, enseignantId:null, anneeId:annee.id},
        {id:'ecue_info_l1_s1_04_td', ueId:'ue_info_l1_s1_04', nom:'TD Anglais technique', coefficient:1, volumeCM:0, volumeTD:20, volumeTP:0, enseignantId:null, anneeId:annee.id},
        {id:'ecue_info_l1_s1_05_cm', ueId:'ue_info_l1_s1_05', nom:'CM Méthodologie', coefficient:1, volumeCM:15, volumeTD:0, volumeTP:0, enseignantId:null, anneeId:annee.id},
        {id:'ecue_gest_l1_s1_01_cm', ueId:'ue_gest_l1_s1_01', nom:'CM Comptabilité', coefficient:1, volumeCM:25, volumeTD:0, volumeTP:0, enseignantId:null, anneeId:annee.id},
        {id:'ecue_gest_l1_s1_01_td', ueId:'ue_gest_l1_s1_01', nom:'TD Comptabilité', coefficient:1, volumeCM:0, volumeTD:20, volumeTP:0, enseignantId:null, anneeId:annee.id}
      ];

      ue.forEach(u => {
        u.ecueIds = ecue.filter(e => e.ueId === u.id).map(e => e.id);
      });

      ue.forEach((u, i) => {
        const ens = enseignants[i % enseignants.length];
        if(ens) u.enseignantIds = [ens.id];
      });

      groupes.forEach((g, i) => {
        g.profPrincipalId = enseignants[i % enseignants.length].id;
      });

      // --- Étudiants dans les groupes ---
      const prenomsM2 = ['Mamadou','Ousmane','Ibrahima','Cheikh','Alioune','Pape','Moussa','Abdoulaye','Malick','Babacar'];
      const prenomsF2 = ['Fatou','Aminata','Awa','Mariama','Khady','Ndeye','Sokhna','Coumba','Astou','Rokhaya'];
      const nomsEt = ['DIALLO','SARR','THIAM','CISSE','FAYE','NIANG','SY','BODIAN','CAMARA','MBAYE','DIENG','SECK'];

      let etuMatricule = 5000;
      groupes.forEach((grp, gi)=>{
        const nbEtudiants = 8 + (gi % 5) * 3;
        for(let i=0; i<nbEtudiants; i++){
          const sexe = (gi + i) % 2 === 0 ? 'M' : 'F';
          const prenom = sexe === 'M' ? prenomsM2[(gi*7+i) % prenomsM2.length] : prenomsF2[(gi*7+i) % prenomsF2.length];
          const nom = nomsEt[(gi*5+i) % nomsEt.length];
          etuMatricule++;
          eleves.push({
            id:'etu_' + etuMatricule,
            matricule:'ETU-' + etuMatricule,
            ine:'INE-' + String(20000000 + etuMatricule),
            prenom, nom, sexe,
            dateNaissance: new Date(2000 + (i%5), i%12, (i%27)+1).toISOString().slice(0,10),
            lieuNaissance:'Dakar',
            nationalite:'Sénégalaise',
            email: (prenom.toLowerCase() + '.' + nom.toLowerCase() + etuMatricule + '@etu.ucad.sn'),
            telephone: '+221 77 ' + (300 + etuMatricule % 100) + ' ' + (10 + i) + ' ' + (20 + i),
            adresse:'Cité universitaire, Dakar',
            dateInscription:'2024-10-' + String((i%9)+1).padStart(2,'0'),
            classeId: grp.id,
            anneeId: annee.id,
            nomTuteur:'',
            telephoneResponsable:'+221 77 ' + (400 + i) + ' 00 ' + (30 + i),
            adresseResponsable:'Dakar',
            infosMed:'',
            typeEtudiant: 'superieur'
          });
        }
      });

      // --- Évaluations + Notes LMD ---
      let evLMDIdx = 0, noteLMDIdx = 0;

      ecue.forEach(ec=>{
        const ueObj = ue.find(u=>u.id === ec.ueId);
        if(!ueObj) return;
        const groupesNiveau = groupes.filter(g=>g.niveauId === ueObj.niveauId);

        groupesNiveau.forEach(grp=>{
          evLMDIdx++;
          evalsLMD.push({
            id:'evLMD_' + evLMDIdx,
            ueId: ueObj.id,
            ecueId: ec.id,
            groupeId: grp.id,
            semestre: ueObj.semestre,
            session: 'S1',
            type: 'CC',
            date: '2024-11-20',
            bareme: 20,
            anneeId: annee.id
          });

          evLMDIdx++;
          evalsLMD.push({
            id:'evLMD_' + evLMDIdx,
            ueId: ueObj.id,
            ecueId: ec.id,
            groupeId: grp.id,
            semestre: ueObj.semestre,
            session: 'S1',
            type: 'Examen',
            date: '2025-01-15',
            bareme: 20,
            anneeId: annee.id
          });

          const etudiantsGrp = eleves.filter(e=>e.classeId === grp.id && e.typeEtudiant === 'superieur');
          etudiantsGrp.forEach((etu, idx)=>{
            const ccVal = 8 + ((idx * 3 + ec.volumeTD + ec.volumeTP) % 12);
            notesLMD.push({
              id:'ntLMD_' + (++noteLMDIdx),
              evaluationId: 'evLMD_' + (evLMDIdx - 1),
              etudiantId: etu.id,
              valeur: Math.min(20, ccVal),
              statut: 'noté',
              anneeId: annee.id
            });
            const examVal = 8 + ((idx * 5 + ec.volumeCM) % 12);
            notesLMD.push({
              id:'ntLMD_' + (++noteLMDIdx),
              evaluationId: 'evLMD_' + evLMDIdx,
              etudiantId: etu.id,
              valeur: Math.min(20, examVal),
              statut: 'noté',
              anneeId: annee.id
            });
          });
        });
      });
    }

    // ============================================================
    // ÉCRITURE FINALE
    // ============================================================
    Storage.write({
      parametres,
      annees:[annee],
      utilisateurs,
      eleves,
      enseignants,
      classes,
      matieres,
      frais,
      paiements,
      absences,
      evaluations,
      notes,
      emploiTemps,
      logs:[],
      filieres,
      niveaux,
      groupes,
      ue,
      ecue,
      evaluationsLMD: evalsLMD,
      notesLMD: notesLMD
    });
  }
};
