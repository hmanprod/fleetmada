# Module Authentification & Onboarding

## Perimetre
- UI: `/login`, `/register`, `/onboarding`
- API: `/api/auth/login`, `/api/auth/register`, `/api/auth/logout`, `/api/auth/check-blacklist`, `/api/onboarding/company`, `/api/profile`
- Regles techniques: token Bearer, verification blacklist, routes protegees

## User stories

### US-AUTH-001 - Connexion utilisateur (P0)
En tant qu'utilisateur, je veux me connecter avec email et mot de passe afin d'acceder a l'application.

Criteres d'acceptation:
1. Si email ou mot de passe est vide, un message d'erreur explicite est affiche.
2. Si les identifiants sont valides, le token est stocke et la session est active.
3. Si l'utilisateur tente d'acceder a une page protegee sans session, il est redirige vers `/login` avec un message.

### US-AUTH-002 - Creation de compte entreprise (P0)
En tant que nouveau client, je veux creer un compte avec mes informations personnelles et societaires afin d'initialiser mon espace FleetMada.

Criteres d'acceptation:
1. Le formulaire exige prenom, nom, societe, email, mot de passe, confirmation, acceptation des conditions.
2. Si les mots de passe ne correspondent pas, l'inscription est bloquee avec message.
3. Une inscription valide connecte l'utilisateur et demarre le parcours d'onboarding.

### US-AUTH-003 - Onboarding guide en 3 etapes (P0)
En tant qu'utilisateur nouvellement inscrit, je veux renseigner le profil de ma flotte afin de personnaliser le produit.

Criteres d'acceptation:
1. Etape 1: taille de flotte et secteur obligatoires.
2. Etape 2: selection d'objectifs metier (entretien, actifs, conformite, couts).
3. Etape 3: la finalisation enregistre les donnees et redirige vers le tableau de bord.

### US-AUTH-004 - Deconnexion securisee (P0)
En tant qu'utilisateur connecte, je veux me deconnecter afin de fermer ma session en securite.

Criteres d'acceptation:
1. L'action de deconnexion appelle l'API de logout.
2. Le token local/cookie est supprime meme en cas d'erreur serveur.
3. Toute reutilisation du token deconnecte est refusee (blacklist).

### US-AUTH-005 - Protection API par token Bearer (P0)
En tant qu'equipe securite, je veux que les API privees refusent les appels non authentifies afin de proteger les donnees.

Criteres d'acceptation:
1. Une route API privee sans header `Authorization` renvoie `401`.
2. Un header mal forme (`Bearer` invalide) renvoie `401`.
3. Un token blackliste est refuse avec message d'erreur d'authentification.
