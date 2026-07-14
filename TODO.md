# TODO - SommaPort fixes

## Auth / Connexion
- [x] Fix baseURL Axios (frontend) pour pointer vers le bon port backend



## DataSeeder
- [x] Mettre à jour DataSeeder pour créer/mettre à jour ADMIN, SUPERVISEUR, AGENT (zéro doublon)

- [x] Garder compatibilité legacy admin@somaport.com


## Movement (nouvelle entité)
- [ ] Ajouter `MovementType` enum
- [ ] Ajouter entité JPA `Movement`
- [ ] Ajouter Repository, DTO, Mapper, Service
- [ ] Ajouter Controller (endpoint mouvements)
- [ ] Modifier `ContainerService.createContainer` pour créer automatiquement un Movement ENTRY_FULL/ENTRY_EMPTY dans la même transaction

## Historique
- [ ] Mettre à jour frontend HistoryPage pour consommer l’endpoint mouvements (recherche/tri/pagination — version minimale d’abord)

- [ ] (Option) Conserver /api/histories existant si besoin

## Dashboard
- [ ] Étendre DashboardResponse + DashboardService pour compter entrées/sorties pleines/vide
- [ ] Mettre à jour frontend DashboardPage pour afficher cartes + graph

## Validation
- [x] Lancer tests Maven / build backend

- [ ] Lancer backend et frontend et vérifier login + role routing
- [ ] Vérifier que la création container génère bien Movement

