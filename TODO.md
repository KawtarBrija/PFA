# TODO - Refonte complete par role (Agent / Superviseur / Admin)

## Backend

- [x] SecurityConfig : matrice d'acces stricte par role
  - [x] `/api/users/**` -> ADMIN uniquement
  - [x] `/api/containers/**` (GET) -> SUPERVISOR, AGENT (ADMIN exclu)
  - [x] `/api/containers` (POST) et `/api/containers/*/release` -> AGENT uniquement
  - [x] `/api/movements/**` (GET) -> SUPERVISOR uniquement
  - [x] `/api/histories/**` (GET) -> ADMIN, SUPERVISOR, AGENT (AGENT scope sur ses propres operations)
- [x] Suppression complete du Dashboard (Controller/Service/DTO + regle de securite) : plus aucun role n'a de Dashboard
- [x] Suppression des endpoints PUT/DELETE `/api/containers/{id}` (hors perimetre : seuls create + release existent)
- [x] Reset password : `ResetPasswordRequest` DTO + `POST /api/users/{id}/reset-password` (ADMIN, BCrypt, mot de passe jamais renvoye)
- [x] Recherche + pagination + tri (Specification JPA) :
  - [x] `GET /api/containers/search` (matricule/allocation/agent, ISO20/40, FULL/EMPTY, bloc, ligne, dates)
  - [x] `GET /api/movements/search` (matricule/allocation, label ENP/ENV/EXIT, agent, dates)
  - [x] `GET /api/histories/search` (matricule/allocation/agent, label ENP/ENV/EXIT, dates)
- [x] Normalisation du libelle de mouvement de sortie a "EXIT" (au lieu de EXIT_FULL/EXIT_EMPTY bruts)
- [x] Fix bug critique : `releaseContainer` inserait un mouvement avec `allocation_code` NULL (colonne NOT NULL) car
      l'allocation etait effacee avant la creation du mouvement -> reordonnance pour capturer le snapshot avant nettoyage
- [x] Fix cosmetique : `Movement.places` stockait le `toString()` Java des entites `Place` -> stocke desormais les numeros de place
- [x] Nettoyage : suppression des overloads morts `UserService.searchUsers(...)`, suppression du dossier dupplique vide `backend/backend/`

## Frontend

- [x] Restructuration complete (`App.jsx` monolithique -> `context/`, `routes/`, `components/`, `pages/`, `hooks/`, `utils/`)
- [x] Suppression totale du Dashboard / statistiques pour tous les roles
- [x] Menus strictement conformes par role (`components/layout/AppLayout.jsx`) :
  - [x] AGENT : Register Arrival, Release Container, Review History, Logout
  - [x] SUPERVISOR : Container Inventory, Movements, History, Logout (lecture seule, aucune action de modification dans l'UI)
  - [x] ADMIN : User Management, History, Logout
- [x] Register Arrival : formulaire matricule/etat/ISO, affichage de l'allocation calculee (bloc/ligne/place/allocation)
- [x] Release Container : recherche matricule/allocation, confirmation SweetAlert2, mise a jour temps reel
- [x] Review History (agent) / History (admin/supervisor) : recherche, filtre date, filtre mouvement (ENP/ENV/EXIT), tri, pagination
- [x] Container Inventory : recherche + filtres (ISO20/40, FULL/EMPTY, bloc, ligne, date) + tri + pagination
- [x] Movements : recherche + filtres (ENP/ENV/EXIT, agent, date) + tri + pagination
- [x] User Management : creation, edition, suppression (SweetAlert2 confirm), reset password (SweetAlert2), recherche instantanee, filtre par role, pagination ; mot de passe jamais affiche
- [x] Fix tailwind.config.js : palette `brand` incomplete (manquait 400/600/800/900), corrigee pour un rendu bleu/blanc/gris coherent

## Validation effectuee

- [x] `mvn compile` backend : OK, aucune erreur
- [x] `npm run build` frontend : OK, aucune erreur
- [x] Backend + PostgreSQL demarres, tests API par role (curl) :
  - [x] ADMIN : `/users` 200, `/containers` 403, `/movements` 403, `/histories` 200
  - [x] SUPERVISOR : `/users` 403, `/containers` 200, `/movements` 200, `/histories` 200
  - [x] AGENT : `/users` 403, `/containers` 200, `/movements` 403, `/histories` 200
  - [x] Register Arrival ISO20 (1 place) et ISO40 (2 places consecutives) valides, mouvements ENP/ENV corrects
  - [x] Release Container valide (bug allocation_code NULL corrige), historique EXIT correct
  - [x] Reset password ADMIN valide (204)
- [ ] Verification visuelle complete en navigateur (chromium-cli indisponible dans cet environnement) :
      serveur frontend demarre sur http://localhost:5173 et ouvert dans le navigateur par defaut pour confirmation manuelle.
