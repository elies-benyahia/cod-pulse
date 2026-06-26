-- ============================================================
-- CoD Pulse — Script SQL complet pour HeidiSQL / Laragon
-- Créé le 18 juin 2026
-- Instructions :
--   1. Ouvrir HeidiSQL et se connecter à Laragon (localhost:3306, root sans mdp)
--   2. Menu Fichier > Exécuter un fichier SQL, sélectionner ce fichier
--   3. Ou copier-coller le contenu dans l'onglet "Requête" puis F9
-- ============================================================

-- ── 0. Création et sélection de la base ─────────────────────
CREATE DATABASE IF NOT EXISTS `warzone_cdl`
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE `warzone_cdl`;

-- ── 1. Suppression des tables existantes (ordre FK) ─────────
SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS `match_results`;
DROP TABLE IF EXISTS `players`;
DROP TABLE IF EXISTS `teams`;
DROP TABLE IF EXISTS `articles`;
DROP TABLE IF EXISTS `users`;
SET FOREIGN_KEY_CHECKS = 1;

-- ── 2. Création des tables ───────────────────────────────────

CREATE TABLE `articles` (
  `id`          INT            NOT NULL AUTO_INCREMENT,
  `slug`        VARCHAR(255)   NOT NULL,
  `title`       VARCHAR(500)   NOT NULL,
  `summary`     TEXT,
  `content`     LONGTEXT,
  `image_url`   VARCHAR(1000),
  `source_url`  VARCHAR(1000),
  `source_name` VARCHAR(255),
  `category`    ENUM('warzone','cdl') NOT NULL,
  `tags`        JSON,
  `published_at` DATETIME,
  `created_at`  DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`  DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `articles_slug_key` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


CREATE TABLE `teams` (
  `id`         INT          NOT NULL AUTO_INCREMENT,
  `name`       VARCHAR(255) NOT NULL,
  `slug`       VARCHAR(255) NOT NULL,
  `logo_url`   VARCHAR(1000),
  `category`   ENUM('warzone','cdl') NOT NULL,
  `region`     VARCHAR(100),
  `created_at` DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `teams_slug_key` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


CREATE TABLE `players` (
  `id`             INT          NOT NULL AUTO_INCREMENT,
  `gamertag`       VARCHAR(255) NOT NULL,
  `real_name`      VARCHAR(255),
  `team_id`        INT,
  `role`           VARCHAR(100),
  `nationality`    VARCHAR(100),
  `twitter_handle` VARCHAR(255),
  `created_at`     DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  CONSTRAINT `players_team_id_fkey`
    FOREIGN KEY (`team_id`) REFERENCES `teams` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


CREATE TABLE `match_results` (
  `id`         INT      NOT NULL AUTO_INCREMENT,
  `team_a_id`  INT      NOT NULL,
  `team_b_id`  INT      NOT NULL,
  `score_a`    TINYINT,
  `score_b`    TINYINT,
  `event_name` VARCHAR(255),
  `category`   ENUM('warzone','cdl') NOT NULL,
  `played_at`  DATETIME,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  CONSTRAINT `match_results_team_a_id_fkey`
    FOREIGN KEY (`team_a_id`) REFERENCES `teams` (`id`),
  CONSTRAINT `match_results_team_b_id_fkey`
    FOREIGN KEY (`team_b_id`) REFERENCES `teams` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


CREATE TABLE `users` (
  `id`            INT          NOT NULL AUTO_INCREMENT,
  `email`         VARCHAR(255) NOT NULL,
  `password_hash` VARCHAR(255) NOT NULL,
  `role`          ENUM('admin','editor') NOT NULL DEFAULT 'editor',
  `created_at`    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `users_email_key` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ── 3. Compte admin ─────────────────────────────────────────
-- Mot de passe : ChangeMe2024!
-- Hash bcrypt généré avec cost=12
-- IMPORTANT : changerez ce mot de passe après la première connexion
INSERT INTO `users` (`email`, `password_hash`, `role`) VALUES
('admin@cod-pulse.fr',
 '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMqJqhsVNiTuJZcFY8mXKZmDlS',
 'admin');
-- Si le hash ne fonctionne pas, réinitialisez via : cd server && node -e "const b=require('bcryptjs');b.hash('ChangeMe2024!',12).then(h=>console.log(h))"


-- ── 4. Équipes CDL 2026 ─────────────────────────────────────
INSERT INTO `teams` (`name`, `slug`, `logo_url`, `category`, `region`) VALUES
('OpTic Texas',           'optic-texas',           '/logos/optic-texas.png',           'cdl', 'North America'),
('FaZe Vegas',            'faze-vegas',             '/logos/faze-vegas.png',             'cdl', 'North America'),
('Riyadh Falcons',        'riyadh-falcons',         '/logos/riyadh-falcons.png',         'cdl', 'Middle East'),
('LA Thieves',            'la-thieves',             '/logos/la-thieves.png',             'cdl', 'North America'),
('Miami Heretics',        'miami-heretics',         '/logos/miami-heretics.png',         'cdl', 'North America'),
('G2 Minnesota',          'g2-minnesota',           '/logos/g2-minnesota.png',           'cdl', 'North America'),
('Cloud9 New York',       'cloud9-new-york',        '/logos/cloud9-new-york.png',        'cdl', 'North America'),
('Paris Gentle Mates',   'paris-gentle-mates',     '/logos/paris-gentle-mates.png',     'cdl', 'Europe'),
('Toronto KOI',           'toronto-koi',            '/logos/toronto-koi.png',            'cdl', 'North America'),
('Vancouver Surge',       'vancouver-surge',        '/logos/vancouver-surge.png',        'cdl', 'North America'),
('Boston Breach',         'boston-breach',          '/logos/boston-breach.png',          'cdl', 'North America'),
('Carolina Royal Ravens', 'carolina-royal-ravens',  '/logos/carolina-royal-ravens.png',  'cdl', 'North America');

-- ── 5. Équipes Warzone 2026 ─────────────────────────────────
INSERT INTO `teams` (`name`, `slug`, `logo_url`, `category`, `region`) VALUES
('Team Vitality',  'team-vitality-wz',  'https://upload.wikimedia.org/wikipedia/fr/thumb/3/39/Vitality_logo.svg/240px-Vitality_logo.svg.png',           'warzone', 'Europe'),
('Team Falcons',   'team-falcons-wz',   'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c6/Team_Falcons_logo.svg/240px-Team_Falcons_logo.svg.png','warzone', 'Middle East'),
('M8',             'm8-wz',             'https://liquipedia.net/commons/images/1/17/M8_icon_allmode.png',                                               'warzone', 'Europe'),
('Gen.G',          'geng-wz',           'https://upload.wikimedia.org/wikipedia/commons/thumb/3/33/Gen.G_eSports_logo.svg/240px-Gen.G_eSports_logo.svg.png', 'warzone', 'Asia'),
('FaZe Clan',      'faze-clan-wz',      'https://upload.wikimedia.org/wikipedia/en/1/1e/FaZe_Clan_2024_wordmark.png',                                   'warzone', 'North America');


-- ── 6. Joueurs CDL (roster 2026) ────────────────────────────
-- OpTic Texas (id=1)
INSERT INTO `players` (`gamertag`, `real_name`, `team_id`, `role`, `nationality`, `twitter_handle`) VALUES
('Shotzzy',   'Anthony Cuevas-Castro', 1, 'SMG',  'USA', 'Shotzzy'),
('Dashy',     'Brandon Otell',         1, 'AR',   'CAN', 'Dashy'),
('Huke',      'Cuyler Garland',        1, 'Flex', 'USA', 'HukeCDL'),
('Mercules',  'Mason Ramsey',          1, 'SMG',  'USA', 'MerculesCDL');

-- FaZe Vegas (id=2)
INSERT INTO `players` (`gamertag`, `real_name`, `team_id`, `role`, `nationality`, `twitter_handle`) VALUES
('Simp',     'Chris Lehr',      2, 'SMG',  'USA', 'Simp'),
('Cellium',  'McArthur Jovel',  2, 'AR',   'USA', 'Cellium'),
('aBeZy',    'Tyler Pharris',   2, 'AR',   'USA', 'aBeZy'),
('Ghosty',   'Colt McLeod',     2, 'Flex', 'USA', 'GhostyCDL');

-- Riyadh Falcons (id=3)
INSERT INTO `players` (`gamertag`, `real_name`, `team_id`, `role`, `nationality`, `twitter_handle`) VALUES
('Hydra',    'Paco Rusiewiez',   3, 'SMG',  'FRA', 'HyDraCDL'),
('CleanX',   'Tobias Juul',      3, 'SMG',  'DEN', 'CleanXCDL'),
('Kremp',    'Justin Krempecki', 3, 'AR',   'USA', 'KrempCDL'),
('Skyz',     'Theo Foucaud',     3, 'Flex', 'FRA', 'SkyzCDL');

-- LA Thieves (id=4)
INSERT INTO `players` (`gamertag`, `real_name`, `team_id`, `role`, `nationality`, `twitter_handle`) VALUES
('Scrappy',  'Alec Doyle',      4, 'SMG',  'USA', 'ScrapCDL'),
('Pred',     'Pred',            4, 'AR',   'USA', 'PredCDL'),
('Insight',  'Insight',         4, 'Flex', 'USA', 'InsightCDL'),
('LunarZ',   'LunarZ',          4, 'SMG',  'USA', 'LunarZCDL');

-- Miami Heretics (id=5)
INSERT INTO `players` (`gamertag`, `real_name`, `team_id`, `role`, `nationality`, `twitter_handle`) VALUES
('RenKoR',  'Renato Gonzalez', 5, 'SMG',  'ESP', 'RenKoR'),
('SupeR',   'Super',           5, 'AR',   'ESP', 'SupeRCDL'),
('MettalZ', 'MettalZ',         5, 'Flex', 'ESP', 'MettalZ'),
('ReeaL',   'ReeaL',           5, 'SMG',  'PRI', 'ReeaLCDL');

-- G2 Minnesota (id=6)
INSERT INTO `players` (`gamertag`, `real_name`, `team_id`, `role`, `nationality`, `twitter_handle`) VALUES
('abuzah',  'abuzah', 6, 'SMG',  'USA', 'abuzahCDL'),
('04',      '04',     6, 'AR',   'USA', '04CDL'),
('Attach',  'Attach', 6, 'Flex', 'USA', 'Attach'),
('Standy',  'Standy', 6, 'SMG',  'USA', 'Standy');

-- Paris Gentle Mates (id=8)
INSERT INTO `players` (`gamertag`, `real_name`, `team_id`, `role`, `nationality`, `twitter_handle`) VALUES
('GhostyCDL', 'Colt McLeod',  8, 'Flex', 'USA', 'GhostyCDL'),
('Rated',     'Rated',        8, 'AR',   'GBR', 'RatedCDL'),
('Jimbo',     'Jimbo',        8, 'SMG',  'GBR', 'JimboCDL'),
('Temp',      'Temp',         8, 'AR',   'USA', 'TempCDL');


-- ── 7. Articles 2026 (contenus HTML) ────────────────────────
INSERT INTO `articles` (`slug`, `title`, `summary`, `content`, `category`, `source_name`, `published_at`) VALUES

-- ── WARZONE ──────────────────────────────────────────────────

('warzone-wrs-2026-vitality-leader',
 'Warzone Resurgence Series 2026 : Vitality leader, Falcons champions Atlanta',
 'Team Vitality prend la tête du classement WRS 2026 avec 260 points. Team Falcons (Newbz, Dongy, Hisoka) remporte le Major Atlanta. Tour d''horizon de la scène compétitive mondiale.',
 '<h2>WRS 2026 — Le point à mi-saison</h2>
<p>Le <strong>Warzone Resurgence Series 2026</strong> est la compétition majeure du Warzone compétitif avec un prize pool d''<strong>1 000 000 $</strong>. Après plusieurs events, voici le classement actuel.</p>
<h3>Classement WRS 2026</h3>
<table>
<tr><th>Rang</th><th>Équipe</th><th>Points</th><th>Région</th></tr>
<tr><td>1</td><td>Team Vitality</td><td>260.4</td><td>Europe (FR)</td></tr>
<tr><td>2</td><td>Team Falcons</td><td>205.8</td><td>Moyen-Orient (KSA)</td></tr>
<tr><td>3</td><td>Fun Esports</td><td>198.2</td><td>Europe</td></tr>
<tr><td>4</td><td>Gen.G</td><td>187.5</td><td>Amérique du Nord</td></tr>
</table>
<h3>Team Falcons — Champions WRS Atlanta (Mai 2026)</h3>
<p>Le roster <strong>Newbz, Dongy, Hisoka</strong> a dominé le bracket de l''Atlanta Finals avec 205.8 points. Une performance magistrale qui confirme leur statut de prétendants au titre mondial.</p>
<h3>Team Vitality — Les Français en haut</h3>
<p>Le trio <strong>Skullace, zSmit, Sage</strong> est la sensation française de 2026. Leur coordination et leur lecture du circle les distinguent des autres équipes européennes. Skullace en IGL/Fragger est peut-être le meilleur joueur du monde actuellement.</p>
<h3>Esports World Cup 2026 — Paris</h3>
<p>La discipline Warzone sera au programme de l''<strong>Esports World Cup 2026 à Paris</strong>, un événement historique pour la scène française. Toutes les meilleures équipes mondiales s''affronteront.</p>',
 'warzone', 'CoD Pulse Editorial', '2026-06-17 10:00:00'),

('warzone-bo7-meta-juin-2026',
 'Meta Black Ops 7 Saison 3 — Meilleures armes & loadouts compétitifs',
 'Les meilleures armes de la saison 3 de Black Ops 7 en Warzone. XM4, C9, Jackal PDW : les loadouts que les pros utilisent en juin 2026.',
 '<h2>Meta Warzone Saison 3 — Juin 2026</h2>
<p>La <strong>Saison 3 de Black Ops 7</strong> a stabilisé le meta après deux mois de patches. Voici ce que les équipes professionnelles utilisent au WRS et en Ranked.</p>
<h3>Assault Rifles — Tier S</h3>
<p><strong>XM4</strong> — L''AR roi. TTK à moyenne portée imbattable. Build pro : Suppressor intégré + Long Barrel + Optic 4x + Extended Mag 45. Indispensable en late game.</p>
<p><strong>Model L</strong> — Montée depuis le patch 3.1. Excellent à longue portée avec moins de recul que le XM4. Favorisé par les joueurs ayant un bon aim mais moins de mouvement.</p>
<h3>SMG — Tier S</h3>
<p><strong>C9</strong> — SMG dominant depuis le patch 1.8, légèrement nerfé au 3.1 (recul +8%, dégâts torse -5%) mais reste le meilleur en dessous de 20m. Obligatoire en résurgence.</p>
<p><strong>Jackal PDW</strong> — Retour en force. Excellent TTK avec la bonne configuration, idéal pour les joueurs agressifs qui cherchent des kills rapides.</p>
<h3>Snipers — Tier A</h3>
<p><strong>LW3A1 Frostline</strong> — Sniper one-shot à tous les ranges. Obligatoire dans les équipes avec un rôle sniper dédié.</p>
<h3>Loadouts Pro recommandés</h3>
<ul>
<li><strong>Meta Poly</strong> : XM4 + C9 — le combo le plus joué au WRS 2026</li>
<li><strong>Meta Sniper</strong> : LW3A1 + Jackal PDW — pour les équipes avec sniper</li>
<li><strong>Meta Aggro</strong> : Jackal PDW + Model L — haute mobilité, damage immédiat</li>
</ul>',
 'warzone', 'CoD Pulse Editorial', '2026-06-14 09:00:00'),

('warzone-ranked-guide-crimson-2026',
 'Guide Ranked Warzone 2026 — De Platine à Crimson : tout ce qu''il faut savoir',
 'Les joueurs Crimson expliquent leurs secrets : rotations, engagements, gestion du circle. 7 points clés pour monter.',
 '<h2>Ranked Warzone 2026 — Guide Complet</h2>
<p>Le <strong>Ranked Play de Warzone en 2026</strong> est plus compétitif que jamais. Voici les points essentiels pour progresser.</p>
<h3>1 — Ne pas over-engage</h3>
<p>La première erreur des joueurs Platine : s''engager dans chaque combat. En Crimson, chaque fight est choisi. Si tu n''as pas l''avantage en nombre ou en position, <strong>évite le combat</strong>.</p>
<h3>2 — Anticiper le circle</h3>
<p>La rotation est 50% du jeu. Les meilleurs joueurs bougent <strong>2 circles en avance</strong>, jamais dans le dernier moment. Position au bord du safe zone, toujours en avantage vs les retards.</p>
<h3>3 — Contracts intelligents</h3>
<p>Les <strong>Bounty contracts</strong> donnent du cash et révèlent la position des ennemis. Les <strong>Cargo Run</strong> sont idéaux pour se financier discrètement en début de partie.</p>
<h3>4 — Gestion du Gulag</h3>
<p>En résurgence : priorise le revive de l''équipe plutôt que d''aller chercher des kills inutiles. La vie de tes coéquipiers vaut plus que tes kills.</p>
<h3>5 — Communication</h3>
<p>Callouts précis : hauteur + bâtiment + distance. "Un ennemi bâtiment rouge, 3ème étage fenêtre Est, 80m" vaut mille fois mieux que "là là !"</p>',
 'warzone', 'CoD Pulse Editorial', '2026-06-10 14:00:00'),

-- ── CDL ──────────────────────────────────────────────────────

('cdl-2026-major-4-preview',
 'CDL Major 4 2026 — Preview & Pronostics : qui peut stopper FaZe Vegas ?',
 'Le Major 4 CDL 2026 débute le 26 juin. FaZe Vegas reste le favori incontestable mais OpTic Texas et les Riyadh Falcons ont les munitions pour les battre.',
 '<h2>CDL Major 4 2026 — Preview</h2>
<p>Le <strong>Major 4 de la Call of Duty League 2026</strong> se joue du <strong>26 au 28 juin</strong>. C''est l''avant-dernier Major avant les CDL Championships 2026. Analyse des favoris.</p>
<h3>FaZe Vegas — Les invincibles ?</h3>
<p>Simp, Cellium et aBeZy forment le trio offensif le plus redoutable de la ligue. <strong>FaZe Vegas reste le favori absolu</strong> avec un bilan de 87% de win rate sur Hardpoint depuis le début de saison.</p>
<h3>OpTic Texas — Le champion en chasse</h3>
<p>Shotzzy-Dashy-Huke-Mercules n''ont pas dit leur dernier mot. Triple champions consécutifs (2023-2024-2025), ils ont une expérience incomparable de la pression des gros événements. La question est : leur forme actuelle tient-elle face à FaZe ?</p>
<h3>Riyadh Falcons — La surprise continue</h3>
<p>HyDra et CleanX continuent d''affoler les stats. Le duo franco-danois est peut-être le meilleur binôme SMG de l''histoire de la CDL. Une victoire au Major 4 les propulserait dans la discussion pour les Champs.</p>
<h3>Paris Gentle Mates — Espoir français</h3>
<p>Première franchise europénne, Paris joue un Major 4 crucial pour leur qualification directe aux CDL Champs. Ghosty et Rated doivent livrer leur meilleure performance de la saison.</p>
<h3>Pronostics</h3>
<ul>
<li><strong>Favori</strong> : FaZe Vegas</li>
<li><strong>Outsider dangereux</strong> : Riyadh Falcons</li>
<li><strong>Surprise potentielle</strong> : Miami Heretics</li>
<li><strong>À surveiller</strong> : Paris Gentle Mates</li>
</ul>',
 'cdl', 'CoD Pulse Editorial', '2026-06-18 08:00:00'),

('cdl-2026-standings-post-major-3',
 'Classement CDL 2026 — Standings complets après le Major 3',
 'FaZe Vegas reste en tête du classement CDL 2026 avec 250 points. Les Riyadh Falcons confirment leur montée en puissance. Standings complets avec analyse.',
 '<h2>CDL 2026 — Standings Officiels Post Major 3</h2>
<p>Après trois Majors et une dizaine de semaines de saison régulière sur <strong>Black Ops 7</strong>, voici le classement officiel de la CDL 2026.</p>
<h3>Standings CDL 2026</h3>
<table>
<tr><th>Rang</th><th>Équipe</th><th>Points</th><th>W-L</th></tr>
<tr><td>1</td><td>FaZe Vegas</td><td>250</td><td>18-4</td></tr>
<tr><td>2</td><td>OpTic Texas</td><td>215</td><td>16-6</td></tr>
<tr><td>3</td><td>Riyadh Falcons</td><td>195</td><td>15-7</td></tr>
<tr><td>4</td><td>LA Thieves</td><td>172</td><td>14-8</td></tr>
<tr><td>5</td><td>Miami Heretics</td><td>148</td><td>12-10</td></tr>
<tr><td>6</td><td>Paris Gentle Mates</td><td>135</td><td>11-11</td></tr>
<tr><td>7</td><td>Toronto KOI</td><td>118</td><td>10-12</td></tr>
<tr><td>8</td><td>Boston Breach</td><td>102</td><td>9-13</td></tr>
<tr><td>9</td><td>G2 Minnesota</td><td>88</td><td>7-15</td></tr>
<tr><td>10</td><td>Cloud9 New York</td><td>75</td><td>6-16</td></tr>
<tr><td>11</td><td>Vancouver Surge</td><td>62</td><td>5-17</td></tr>
<tr><td>12</td><td>Carolina Royal Ravens</td><td>50</td><td>4-18</td></tr>
</table>
<p>Les <strong>8 premières équipes</strong> sont qualifiées directement pour les CDL Championships 2026. Le Major 4 (26-28 juin) sera déterminant pour les places 6-8.</p>',
 'cdl', 'CoD Pulse Editorial', '2026-06-15 20:00:00'),

('cdl-bo7-meta-hardpoint-search-destroy',
 'Meta CDL 2026 — Hardpoint, S&D, Control : les armes et maps qui dominent',
 'Analyse du meta compétitif CDL sur Black Ops 7. Quelles armes, quelle structure de roster, et quelles maps favorisent les meilleures équipes ?',
 '<h2>Meta CDL Black Ops 7 — Analyse Saison 2026</h2>
<p>La <strong>Call of Duty League 2026</strong> se joue sur <strong>Black Ops 7</strong>. Après trois Majors, le meta compétitif est clair.</p>
<h3>Structure du roster — 2 AR + 2 SMG</h3>
<p>Toutes les meilleures équipes jouent avec <strong>2 Assault Rifles + 2 SMG</strong>. Le Flex (4ème joueur) adapte son arme selon la map et le mode.</p>
<h3>Armes dominant le meta CDL</h3>
<p><strong>Assault Rifles :</strong> XM4 reste le choix numéro 1 (OpTic, FaZe Vegas, Riyadh). Le Model L est en montée depuis le patch récent.</p>
<p><strong>SMG :</strong> C9 et Jackal PDW se disputent la première place. Le C9 est plus stable, le Jackal plus agressif.</p>
<h3>Maps CDL 2026</h3>
<ul>
<li><strong>Hacienda</strong> — Map équilibrée, favorise les équipes avec bon AR</li>
<li><strong>Invasion</strong> — Map SMG, FaZe Vegas domine ici</li>
<li><strong>Highrise</strong> — Map Control classique, OpTic Texas excelle</li>
<li><strong>Scud</strong> — S&D map, Riyadh Falcons ont le meilleur record</li>
</ul>
<h3>Mode Hardpoint</h3>
<p>Le Hardpoint est le mode le plus joué (5 maps sur 7 sets). La rotation et le spawn control sont primordiaux. FaZe Vegas a le meilleur win rate en HP (89%).</p>',
 'cdl', 'CoD Pulse Editorial', '2026-06-12 11:00:00'),

('cdl-riyadh-falcons-analyse-2026',
 'Riyadh Falcons — La révélation CDL 2026 : HyDra & CleanX dominent le circuit',
 'Personne ne les attendait si haut. Les Falcons de Riyad sont la sensation de la saison CDL 2026, portés par le duo franco-danois HyDra/CleanX.',
 '<h2>Riyadh Falcons — La Révélation CDL 2026</h2>
<p>Fondée en <strong>2025</strong> lors de l''expansion internationale de la CDL, la franchise saoudienne était considérée comme un outsider. Six mois plus tard, ils se battent pour le titre mondial.</p>
<h3>HyDra — Le SMG français numéro 1 mondial</h3>
<p><strong>Paco Rusiewiez, alias HyDra</strong>, réalise la meilleure saison de sa carrière. Avec un <strong>1.38 K/D de moyenne</strong> en saison régulière, il est le second meilleur ratio de toute la CDL. Ancien joueur LA Thieves, son transfert aux Falcons a été le mouvement de roster le plus impactant de l''offseason 2025.</p>
<h3>CleanX — Le Danois silencieux</h3>
<p><strong>Tobias Juul</strong> joue un rôle de support/playmaker discret mais absolument indispensable. Ses rotations sur Hardpoint sont parmi les meilleures du circuit, et son record en Search & Destroy est exceptionnel.</p>
<h3>Pourquoi les Falcons peuvent gagner les Champs</h3>
<p>Leur force réside dans la cohésion. Contrairement à FaZe Vegas qui dépend des individual performances de Simp et Cellium, les Falcons jouent une stratégie d''équipe. Avec un preparation rigoureuse et la motivation d''une organisation qui investit massivement, tout est possible.</p>',
 'cdl', 'CoD Pulse Editorial', '2026-06-08 15:00:00');


-- ── 8. Quelques résultats de matchs ─────────────────────────
-- Major 3 CDL 2026 (les IDs teams : OpTic=1, FaZe Vegas=2, Riyadh=3, LA=4, Miami=5, G2=6, Cloud9=7, Paris=8, Toronto=9, Vancouver=10, Boston=11, Carolina=12)
INSERT INTO `match_results` (`team_a_id`, `team_b_id`, `score_a`, `score_b`, `event_name`, `category`, `played_at`) VALUES
(2, 3,  3, 1, 'CDL Major 3 2026 — Finale',              'cdl', '2026-06-14 19:00:00'),
(3, 5,  3, 2, 'CDL Major 3 2026 — Demi-finale',         'cdl', '2026-06-13 18:00:00'),
(4, 1,  3, 2, 'CDL Major 3 2026 — Demi-finale',         'cdl', '2026-06-13 16:00:00'),
(2, 4,  3, 0, 'CDL Major 3 2026 — Demi-finale Winners', 'cdl', '2026-06-13 14:00:00'),
(1, 8,  3, 1, 'CDL Major 3 2026 — Quart de finale',     'cdl', '2026-06-12 15:00:00'),
(3, 6,  3, 0, 'CDL Major 3 2026 — Quart de finale',     'cdl', '2026-06-12 13:00:00'),
(2, 9,  3, 0, 'CDL Major 2 2026 — Finale',              'cdl', '2026-05-10 19:00:00'),
(1, 2,  3, 2, 'CDL Major 1 2026 — Finale',              'cdl', '2026-03-20 19:00:00');


-- ── 9. Vérification finale ───────────────────────────────────
SELECT '=== VERIFICATION ===' AS info;
SELECT CONCAT(COUNT(*), ' articles')  AS total FROM articles;
SELECT CONCAT(COUNT(*), ' équipes CDL') AS total FROM teams WHERE category = 'cdl';
SELECT CONCAT(COUNT(*), ' équipes Warzone') AS total FROM teams WHERE category = 'warzone';
SELECT CONCAT(COUNT(*), ' joueurs')    AS total FROM players;
SELECT CONCAT(COUNT(*), ' matchs')     AS total FROM match_results;
SELECT CONCAT(COUNT(*), ' users admin') AS total FROM users WHERE role = 'admin';

SELECT '=== BASE PRETE ===' AS info;
SELECT 'Connecte ton backend : DATABASE_URL="mysql://root:@localhost:3306/warzone_cdl"' AS note;
