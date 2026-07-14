CREATE TYPE stt_conteneur AS ENUM ('V','P');
CREATE TYPE mvmt_conteneur AS ENUM ('ENV','ENP');
CREATE TYPE iso AS ENUM ('20','40');
CREATE TYPE stt_emplacement AS ENUM ('LIBRE','OCCUPE');
CREATE TYPE role_utilisateur AS ENUM ('ADMIN','AGENT','SUPERVISEUR');

CREATE TABLE utilisateur(
id SERIAL PRIMARY KEY,
nom VARCHAR(50) NOT NULL,
prenom VARCHAR(50) NOT NULL,
login VARCHAR(50) UNIQUE NOT NULL,
mot_de_passe VARCHAR(255) NOT NULL,
role role_utilisateur NOT NULL DEFAULT 'AGENT',
date_creation TIMESTAMP NOT NULL DEFAULT now()
);

--SELECT enumlabel
--FROM pg_enum
--WHERE enumtypid = 'stt_emplacement'::regtype;
--DROP TYPE IF EXISTS stt_emplacement CASCADE;

CREATE TABLE blocs(
id SERIAL PRIMARY KEY,
code_bloc VARCHAR(2) UNIQUE NOT NULL,
nb_lignes INTEGER NOT NULL DEFAULT 7,
nb_positioins INTEGER NOT NULL DEFAULT 10
);

CREATE TABLE emplacements(
id SERIAL PRIMARY KEY,
bloc_id INTEGER NOT NULL REFERENCES blocs(id) ON DELETE CASCADE,
ligne CHAR(1) NOT NULL CHECK (ligne BETWEEN 'A' AND 'G'),
position VARCHAR(2) NOT NULL,
code_emplacement VARCHAR(5) UNIQUE NOT NULL,
statut stt_emplacement NOT NULL DEFAULT 'LIBRE',
conteneur_id INTEGER,
UNIQUE(bloc_id, ligne, position)
);

CREATE TABLE conteneurs(
id SERIAL PRIMARY KEY,
code_conteneur VARCHAR(11) UNIQUE NOT NULL,
statut stt_conteneur NOT NULL,
iso iso NOT NULL,
mouvement mvmt_conteneur NOT NULL,
date_entree TIMESTAMP NOT NULL DEFAULT now(),
emplacement_1_id INTEGER REFERENCES emplacements(id),
emplacement_2_id INTEGER REFERENCES emplacements(id),
utilisateur_id INTEGER REFERENCES utilisateur(id),
CONSTRAINT check_format_code
CHECK (code_conteneur ~ '^[A-Z]{4}[0-9]{7}$'),
CONSTRAINT check_iso_emplacement
 CHECK (
            (iso = '20' AND emplacement_2_id IS NULL) OR
            (iso = '40' AND emplacement_2_id IS NOT NULL)
        )
);

ALTER TABLE emplacements
    ADD CONSTRAINT fk_conteneur
    FOREIGN KEY (conteneur_id) REFERENCES conteneurs(id) ON DELETE SET NULL;


CREATE INDEX idx_emplacement_statut ON emplacements(statut);
CREATE INDEX idx_emplacement_bloc_ligne ON emplacements(bloc_id, ligne);
CREATE INDEX idx_conteneur_code ON conteneurs(code_conteneur);

CREATE OR REPLACE FUNCTION generer_emplacements(
    p_bloc_id INTEGER,
    p_code_bloc VARCHAR(2)
)
RETURNS VOID AS $$
DECLARE
    l_ligne CHAR;
    l_pos INTEGER;
    l_code VARCHAR(5);
BEGIN
    FOR l_ligne IN
        SELECT chr(ascii('A') + i)
        FROM generate_series(0,6) AS i
    LOOP

        FOR l_pos IN
            SELECT generate_series(1,19,2)
        LOOP

            l_code := p_code_bloc || l_ligne || lpad(l_pos::text, 2, '0');

            INSERT INTO emplacements (
                bloc_id,
                ligne,
                position,
                code_emplacement
            )
            VALUES (
                p_bloc_id,
                l_ligne,
                lpad(l_pos::text, 2, '0'),
                l_code
            );

        END LOOP;
    END LOOP;
END;
$$ LANGUAGE plpgsql;


INSERT INTO blocs (code_bloc) VALUES ('AA') RETURNING id;  -- id = 1
INSERT INTO blocs (code_bloc) VALUES ('AB') RETURNING id;  -- id = 2


SELECT generer_emplacements(1, 'AA');
SELECT generer_emplacements(2, 'AB');

SELECT * FROM emplacements ORDER BY bloc_id, ligne, position;

INSERT INTO utilisateur (nom, prenom, login, mot_de_passe, role)
VALUES ('Test', 'Admin', 'admin', '$2a$10$exempleHashBcrypt', 'ADMIN');

INSERT INTO conteneurs (code_conteneur, statut, iso, mouvement, emplacement_1_id)
VALUES ('ABCD1234567', 'P', '20', 'ENP', 1);

UPDATE emplacements SET statut = 'OCCUPE', conteneur_id = (SELECT id FROM conteneurs WHERE code_conteneur = 'ABCD1234567')
WHERE id = 1;

ALTER TABLE conteneurs
    ADD COLUMN date_sortie TIMESTAMP NULL,
    ADD COLUMN est_sorti BOOLEAN NOT NULL DEFAULT FALSE;

	CREATE INDEX idx_conteneur_est_sorti ON conteneurs(est_sorti);

	CREATE TYPE type_mouvement_historique AS ENUM ('ENTREE', 'SORTIE');

CREATE TABLE historique_mouvements (
    id                  SERIAL PRIMARY KEY,
    conteneur_id        INTEGER NOT NULL REFERENCES conteneurs(id) ON DELETE CASCADE,
    code_conteneur      VARCHAR(11) NOT NULL,  
    type_mouvement      type_mouvement_historique NOT NULL,
    mouvement_detail    VARCHAR(3),              
    emplacement_1_code  VARCHAR(5),             
    emplacement_2_code  VARCHAR(5),              
    date_mouvement      TIMESTAMP NOT NULL DEFAULT now(),
    utilisateur_id      INTEGER REFERENCES utilisateur(id),  

    CONSTRAINT check_type_mouvement_coherence
        CHECK (
            (type_mouvement = 'ENTREE' AND mouvement_detail IS NOT NULL) OR
            (type_mouvement = 'SORTIE')
        )
);

CREATE INDEX idx_historique_conteneur ON historique_mouvements(conteneur_id);
CREATE INDEX idx_historique_date ON historique_mouvements(date_mouvement);
CREATE INDEX idx_historique_type ON historique_mouvements(type_mouvement);

CREATE VIEW vue_taux_occupation AS
SELECT
    COUNT(*) FILTER (WHERE statut = 'OCCUPE') AS emplacements_occupes,
    COUNT(*) AS emplacements_total,
    ROUND(
        100.0 * COUNT(*) FILTER (WHERE statut = 'OCCUPE') / NULLIF(COUNT(*), 0),
        2
    ) AS taux_occupation_pourcent
FROM emplacements;

CREATE VIEW vue_entrees_aujourdhui AS
SELECT COUNT(*) AS nb_entrees_aujourdhui
FROM conteneurs
WHERE date_entree::date = CURRENT_DATE;

CREATE VIEW vue_repartition_iso AS
SELECT iso, COUNT(*) AS nombre
FROM conteneurs
WHERE est_sorti = FALSE
GROUP BY iso;

CREATE VIEW vue_occupation_par_bloc AS
SELECT
    b.code_bloc,
    COUNT(*) FILTER (WHERE e.statut = 'OCCUPE') AS emplacements_occupes,
    COUNT(*) AS emplacements_total,
    ROUND(
        100.0 * COUNT(*) FILTER (WHERE e.statut = 'OCCUPE') / NULLIF(COUNT(*), 0),
        2
    ) AS taux_occupation_pourcent
FROM blocs b
JOIN emplacements e ON e.bloc_id = b.id
GROUP BY b.code_bloc
ORDER BY taux_occupation_pourcent DESC;

CREATE VIEW vue_duree_moyenne_sejour AS
SELECT
    ROUND(AVG(EXTRACT(EPOCH FROM (date_sortie - date_entree)) / 3600)::numeric, 2) AS duree_moyenne_heures
FROM conteneurs
WHERE est_sorti = TRUE;


SELECT * FROM vue_taux_occupation;

INSERT INTO historique_mouvements 
    (conteneur_id, code_conteneur, type_mouvement, mouvement_detail, emplacement_1_code, utilisateur_id)
VALUES 
    (
        (SELECT id FROM conteneurs WHERE code_conteneur = 'ABCD1234567'),
        'ABCD1234567', 'ENTREE', 'ENP', 'AAG01', 1
    );

UPDATE conteneurs 
SET est_sorti = TRUE, date_sortie = now() 
WHERE code_conteneur = 'ABCD1234567';

UPDATE emplacements 
SET statut = 'LIBRE', conteneur_id = NULL 
WHERE conteneur_id = (SELECT id FROM conteneurs WHERE code_conteneur = 'ABCD1234567');

INSERT INTO historique_mouvements 
    (conteneur_id, code_conteneur, type_mouvement, emplacement_1_code, utilisateur_id)
VALUES 
    (
        (SELECT id FROM conteneurs WHERE code_conteneur = 'ABCD1234567'),
        'ABCD1234567', 'SORTIE', 'AAG01', 1
    );

CREATE TABLE refresh_tokens (
    id              SERIAL PRIMARY KEY,
    utilisateur_id  INTEGER NOT NULL REFERENCES utilisateur(id) ON DELETE CASCADE,
    token           VARCHAR(255) UNIQUE NOT NULL,
    date_expiration TIMESTAMP NOT NULL,
    revoque         BOOLEAN NOT NULL DEFAULT FALSE,
    date_creation   TIMESTAMP NOT NULL DEFAULT now()
);

CREATE INDEX idx_refresh_token ON refresh_tokens(token);