export interface TeamData {
  id: string;
  name: string;
  flag: string;
  group: string;
  fifaRanking: number;
  confederation: string;
  coach: string;
  players: PlayerData[];
}

export interface PlayerData {
  name: string;
  position: string;
  age: number;
}

export interface MatchData {
  id: string;
  group: string;
  team1: string;
  team2: string;
  date: string;
  venue: string;
  stage: string;
}

const PLAYERS_BY_TEAM: Record<string, PlayerData[]> = {
  // Group A
  mexico: [
    { name: "Santiago Giménez", position: "FW", age: 25 },
    { name: "Edson Álvarez", position: "MF", age: 28 },
    { name: "Julián Quiñones", position: "FW", age: 28 },
    { name: "Luis Chávez", position: "MF", age: 30 },
    { name: "Guillermo Ochoa", position: "GK", age: 40 },
  ],
  "south-africa": [
    { name: "Percy Tau", position: "FW", age: 31 },
    { name: "Lyle Foster", position: "FW", age: 25 },
    { name: "Teboho Mokoena", position: "MF", age: 28 },
    { name: "Mothobi Mvala", position: "MF", age: 30 },
    { name: "Rowen Williams", position: "GK", age: 37 },
  ],
  "south-korea": [
    { name: "Son Heung-min", position: "FW", age: 33 },
    { name: "Kim Min-jae", position: "DF", age: 29 },
    { name: "Lee Kang-in", position: "MF", age: 25 },
    { name: "Hwang Hee-chan", position: "FW", age: 30 },
    { name: "Hwang In-beom", position: "MF", age: 29 },
  ],
  "czech-republic": [
    { name: "Patrik Schick", position: "FW", age: 30 },
    { name: "Tomáš Souček", position: "MF", age: 31 },
    { name: "Vladimír Coufal", position: "DF", age: 33 },
    { name: "Antonín Barák", position: "MF", age: 31 },
    { name: "Ladislav Krejčí", position: "DF", age: 26 },
  ],

  // Group B
  canada: [
    { name: "Alphonso Davies", position: "DF", age: 25 },
    { name: "Jonathan David", position: "FW", age: 26 },
    { name: "Stephen Eustáquio", position: "MF", age: 29 },
    { name: "Cyle Larin", position: "FW", age: 31 },
    { name: "Tajon Buchanan", position: "FW", age: 27 },
  ],
  bosnia: [
    { name: "Edin Džeko", position: "FW", age: 40 },
    { name: "Miralem Pjanić", position: "MF", age: 35 },
    { name: "Sead Kolašinac", position: "DF", age: 32 },
    { name: "Ermedin Demirović", position: "FW", age: 27 },
    { name: "Rade Krunić", position: "MF", age: 32 },
  ],
  qatar: [
    { name: "Akram Afif", position: "FW", age: 29 },
    { name: "Almoez Ali", position: "FW", age: 29 },
    { name: "Hassan Al-Haydos", position: "MF", age: 35 },
    { name: "Boualem Khoukhi", position: "DF", age: 35 },
    { name: "Abdelkarim Hassan", position: "DF", age: 32 },
  ],
  switzerland: [
    { name: "Granit Xhaka", position: "MF", age: 33 },
    { name: "Manuel Akanji", position: "DF", age: 30 },
    { name: "Xherdan Shaqiri", position: "MF", age: 34 },
    { name: "Ruben Vargas", position: "FW", age: 27 },
    { name: "Gregor Kobel", position: "GK", age: 28 },
  ],

  // Group C
  brazil: [
    { name: "Vinícius Jr.", position: "FW", age: 25 },
    { name: "Rodrygo", position: "FW", age: 25 },
    { name: "Raphinha", position: "FW", age: 29 },
    { name: "Bruno Guimarães", position: "MF", age: 28 },
    { name: "Alisson", position: "GK", age: 33 },
  ],
  morocco: [
    { name: "Achraf Hakimi", position: "DF", age: 27 },
    { name: "Hakim Ziyech", position: "FW", age: 33 },
    { name: "Sofyan Amrabat", position: "MF", age: 29 },
    { name: "Noussair Mazraoui", position: "DF", age: 28 },
    { name: "Bilal El Khannouss", position: "MF", age: 22 },
  ],
  haiti: [
    { name: "Duckens Nazon", position: "FW", age: 31 },
    { name: "Frantzdy Pierrot", position: "FW", age: 31 },
    { name: "Johnny Placide", position: "GK", age: 37 },
    { name: "Ricardo Adé", position: "DF", age: 35 },
    { name: "Carlens Arcus", position: "DF", age: 29 },
  ],
  scotland: [
    { name: "Scott McTominay", position: "MF", age: 29 },
    { name: "Andy Robertson", position: "DF", age: 32 },
    { name: "John McGinn", position: "MF", age: 31 },
    { name: "Kieran Tierney", position: "DF", age: 28 },
    { name: "Che Adams", position: "FW", age: 29 },
  ],

  // Group D
  usa: [
    { name: "Christian Pulisic", position: "FW", age: 27 },
    { name: "Weston McKennie", position: "MF", age: 27 },
    { name: "Tyler Adams", position: "MF", age: 27 },
    { name: "Folarin Balogun", position: "FW", age: 24 },
    { name: "Antonee Robinson", position: "DF", age: 28 },
  ],
  paraguay: [
    { name: "Miguel Almirón", position: "FW", age: 32 },
    { name: "Julio Enciso", position: "FW", age: 22 },
    { name: "Diego Gómez", position: "MF", age: 22 },
    { name: "Gustavo Gómez", position: "DF", age: 31 },
    { name: "Robert Rojas", position: "DF", age: 29 },
  ],
  australia: [
    { name: "Craig Goodwin", position: "FW", age: 34 },
    { name: "Jackson Irvine", position: "MF", age: 32 },
    { name: "Harry Souttar", position: "DF", age: 27 },
    { name: "Mathew Ryan", position: "GK", age: 34 },
    { name: "Riley McGree", position: "MF", age: 27 },
  ],
  turkey: [
    { name: "Hakan Çalhanoğlu", position: "MF", age: 32 },
    { name: "Arda Güler", position: "MF", age: 21 },
    { name: "Kenan Yıldız", position: "FW", age: 21 },
    { name: "Çağlar Söyüncü", position: "DF", age: 29 },
    { name: "Orkun Kökçü", position: "MF", age: 25 },
  ],

  // Group E
  germany: [
    { name: "Jamal Musiala", position: "MF", age: 23 },
    { name: "Florian Wirtz", position: "MF", age: 22 },
    { name: "İlkay Gündoğan", position: "MF", age: 35 },
    { name: "Manuel Neuer", position: "GK", age: 40 },
    { name: "Jonathan Tah", position: "DF", age: 30 },
  ],
  curacao: [
    { name: "Leandro Bacuna", position: "MF", age: 34 },
    { name: "Juninho Bacuna", position: "MF", age: 28 },
    { name: "Charlison Benschop", position: "FW", age: 36 },
    { name: "Cuco Martina", position: "DF", age: 36 },
    { name: "Richairo Živković", position: "FW", age: 29 },
  ],
  "ivory-coast": [
    { name: "Sébastien Haller", position: "FW", age: 31 },
    { name: "Franck Kessié", position: "MF", age: 29 },
    { name: "Nicolas Pépé", position: "FW", age: 31 },
    { name: "Serge Aurier", position: "DF", age: 33 },
    { name: "Amad Diallo", position: "FW", age: 23 },
  ],
  ecuador: [
    { name: "Enner Valencia", position: "FW", age: 36 },
    { name: "Moisés Caicedo", position: "MF", age: 24 },
    { name: "Pervis Estupiñán", position: "DF", age: 27 },
    { name: "Alan Franco", position: "MF", age: 27 },
    { name: "Willian Pacho", position: "DF", age: 24 },
  ],

  // Group F
  netherlands: [
    { name: "Virgil van Dijk", position: "DF", age: 34 },
    { name: "Frenkie de Jong", position: "MF", age: 29 },
    { name: "Cody Gakpo", position: "FW", age: 26 },
    { name: "Xavi Simons", position: "MF", age: 22 },
    { name: "Memphis Depay", position: "FW", age: 32 },
  ],
  japan: [
    { name: "Takefusa Kubo", position: "FW", age: 24 },
    { name: "Wataru Endō", position: "MF", age: 32 },
    { name: "Kaoru Mitoma", position: "FW", age: 28 },
    { name: "Ayase Ueda", position: "FW", age: 27 },
    { name: "Takehiro Tomiyasu", position: "DF", age: 27 },
  ],
  sweden: [
    { name: "Alexander Isak", position: "FW", age: 26 },
    { name: "Dejan Kulusevski", position: "FW", age: 25 },
    { name: "Victor Lindelöf", position: "DF", age: 31 },
    { name: "Emil Forsberg", position: "MF", age: 34 },
    { name: "Anthony Elanga", position: "FW", age: 23 },
  ],
  tunisia: [
    { name: "Ellyes Skhiri", position: "MF", age: 30 },
    { name: "Wahbi Khazri", position: "FW", age: 35 },
    { name: "Ali Abdi", position: "DF", age: 32 },
    { name: "Anis Ben Slimane", position: "MF", age: 25 },
    { name: "Bechir Ben Saïd", position: "FW", age: 32 },
  ],

  // Group G
  belgium: [
    { name: "Kevin De Bruyne", position: "MF", age: 34 },
    { name: "Romelu Lukaku", position: "FW", age: 32 },
    { name: "Jeremy Doku", position: "FW", age: 23 },
    { name: "Youri Tielemans", position: "MF", age: 29 },
    { name: "Thibaut Courtois", position: "GK", age: 34 },
  ],
  egypt: [
    { name: "Mohamed Salah", position: "FW", age: 33 },
    { name: "Mohamed Elneny", position: "MF", age: 33 },
    { name: "Mahmoud Trezeguet", position: "FW", age: 31 },
    { name: "Mostafa Mohamed", position: "FW", age: 28 },
    { name: "Mohamed Abdelmonem", position: "DF", age: 27 },
  ],
  iran: [
    { name: "Mehdi Taremi", position: "FW", age: 33 },
    { name: "Sardar Azmoun", position: "FW", age: 30 },
    { name: "Alireza Jahanbakhsh", position: "FW", age: 32 },
    { name: "Saeid Ezatolahi", position: "MF", age: 29 },
    { name: "Ali Gholizadeh", position: "FW", age: 30 },
  ],
  "new-zealand": [
    { name: "Chris Wood", position: "FW", age: 34 },
    { name: "Liberato Cacace", position: "DF", age: 25 },
    { name: "Joe Bell", position: "MF", age: 26 },
    { name: "Stipe Ukich", position: "FW", age: 24 },
    { name: "Michael Boxall", position: "DF", age: 37 },
  ],

  // Group H
  spain: [
    { name: "Lamine Yamal", position: "FW", age: 18 },
    { name: "Pedri", position: "MF", age: 23 },
    { name: "Rodri", position: "MF", age: 29 },
    { name: "Nico Williams", position: "FW", age: 23 },
    { name: "Dani Olmo", position: "MF", age: 27 },
  ],
  "cape-verde": [
    { name: "Ryan Mendes", position: "FW", age: 36 },
    { name: "Jamiro Monteiro", position: "MF", age: 32 },
    { name: "Garry Rodrigues", position: "FW", age: 35 },
    { name: "Steven Moreira", position: "DF", age: 31 },
    { name: "Marco Soares", position: "MF", age: 40 },
  ],
  "saudi-arabia": [
    { name: "Salem Al-Dawsari", position: "FW", age: 34 },
    { name: "Feras Al-Brikan", position: "FW", age: 25 },
    { name: "Mohamed Kanno", position: "MF", age: 31 },
    { name: "Saud Abdulhamid", position: "DF", age: 26 },
    { name: "Yasser Al-Shahrani", position: "DF", age: 33 },
  ],
  uruguay: [
    { name: "Federico Valverde", position: "MF", age: 27 },
    { name: "Darwin Núñez", position: "FW", age: 26 },
    { name: "Ronald Araújo", position: "DF", age: 27 },
    { name: "Manuel Ugarte", position: "MF", age: 25 },
    { name: "Facundo Pellistri", position: "FW", age: 24 },
  ],

  // Group I
  france: [
    { name: "Kylian Mbappé", position: "FW", age: 27 },
    { name: "Eduardo Camavinga", position: "MF", age: 23 },
    { name: "William Saliba", position: "DF", age: 25 },
    { name: "Aurélien Tchouaméni", position: "MF", age: 26 },
    { name: "Mike Maignan", position: "GK", age: 30 },
  ],
  senegal: [
    { name: "Ismaïla Sarr", position: "FW", age: 28 },
    { name: "Idrissa Gueye", position: "MF", age: 36 },
    { name: "Kalidou Koulibaly", position: "DF", age: 34 },
    { name: "Nicolas Jackson", position: "FW", age: 24 },
    { name: "Pape Matar Sarr", position: "MF", age: 23 },
  ],
  iraq: [
    { name: "Ayman Hussein", position: "FW", age: 30 },
    { name: "Ali Adnan", position: "DF", age: 32 },
    { name: "Ibrahim Bayesh", position: "MF", age: 25 },
    { name: "Jalal Hassan", position: "GK", age: 34 },
    { name: "Mohammed Ali", position: "FW", age: 25 },
  ],
  norway: [
    { name: "Erling Haaland", position: "FW", age: 25 },
    { name: "Martin Ødegaard", position: "MF", age: 27 },
    { name: "Alexander Sørloth", position: "FW", age: 30 },
    { name: "Andreas Hanche-Olsen", position: "DF", age: 29 },
    { name: "Sander Berge", position: "MF", age: 28 },
  ],

  // Group J
  argentina: [
    { name: "Lionel Messi", position: "FW", age: 39 },
    { name: "Julián Álvarez", position: "FW", age: 26 },
    { name: "Enzo Fernández", position: "MF", age: 25 },
    { name: "Lautaro Martínez", position: "FW", age: 28 },
    { name: "Emiliano Martínez", position: "GK", age: 33 },
  ],
  algeria: [
    { name: "Riyad Mahrez", position: "FW", age: 35 },
    { name: "Islam Slimani", position: "FW", age: 37 },
    { name: "Ramiz Zerrouki", position: "FW", age: 26 },
    { name: "Sofiane Feghouli", position: "MF", age: 36 },
    { name: "Aïssa Mandi", position: "DF", age: 34 },
  ],
  austria: [
    { name: "David Alaba", position: "DF", age: 33 },
    { name: "Marcel Sabitzer", position: "MF", age: 32 },
    { name: "Christoph Baumgartner", position: "MF", age: 26 },
    { name: "Marko Arnautović", position: "FW", age: 37 },
    { name: "Konrad Laimer", position: "MF", age: 28 },
  ],
  jordan: [
    { name: "Musa Al-Taamari", position: "FW", age: 28 },
    { name: "Ali Olwan", position: "FW", age: 27 },
    { name: "Noor Al-Rawabdeh", position: "MF", age: 28 },
    { name: "Yazan Al-Arab", position: "DF", age: 30 },
    { name: "Nizar Al-Rashdan", position: "GK", age: 28 },
  ],

  // Group K
  portugal: [
    { name: "Cristiano Ronaldo", position: "FW", age: 41 },
    { name: "Bruno Fernandes", position: "MF", age: 31 },
    { name: "Rafael Leão", position: "FW", age: 26 },
    { name: "Bernardo Silva", position: "MF", age: 31 },
    { name: "Rúben Dias", position: "DF", age: 28 },
  ],
  "dr-congo": [
    { name: "Chancel Mbemba", position: "DF", age: 31 },
    { name: "Gaël Kakuta", position: "MF", age: 34 },
    { name: "Yoane Wissa", position: "FW", age: 29 },
    { name: "Cédric Bakambu", position: "FW", age: 35 },
    { name: "Arthur Masuaku", position: "DF", age: 32 },
  ],
  uzbekistan: [
    { name: "Eldor Shomurodov", position: "FW", age: 30 },
    { name: "Odiljon Hamrobekov", position: "MF", age: 30 },
    { name: "Azizbek Turgunboev", position: "FW", age: 31 },
    { name: "Rustam Ashurmatov", position: "DF", age: 29 },
    { name: "Jaloliddin Masharipov", position: "FW", age: 32 },
  ],
  colombia: [
    { name: "James Rodríguez", position: "MF", age: 34 },
    { name: "Luis Díaz", position: "FW", age: 29 },
    { name: "Jhon Arias", position: "MF", age: 28 },
    { name: "Yerson Mosquera", position: "DF", age: 24 },
    { name: "David Ospina", position: "GK", age: 37 },
  ],

  // Group L
  england: [
    { name: "Harry Kane", position: "FW", age: 32 },
    { name: "Jude Bellingham", position: "MF", age: 22 },
    { name: "Bukayo Saka", position: "FW", age: 24 },
    { name: "Declan Rice", position: "MF", age: 27 },
    { name: "Phil Foden", position: "MF", age: 25 },
  ],
  croatia: [
    { name: "Luka Modrić", position: "MF", age: 40 },
    { name: "Mateo Kovačić", position: "MF", age: 32 },
    { name: "Joško Gvardiol", position: "DF", age: 24 },
    { name: "Andrej Kramarić", position: "FW", age: 34 },
    { name: "Lovro Majer", position: "MF", age: 28 },
  ],
  ghana: [
    { name: "Mohammed Kudus", position: "MF", age: 25 },
    { name: "Thomas Partey", position: "MF", age: 32 },
    { name: "Inaki Williams", position: "FW", age: 31 },
    { name: "Antoine Semenyo", position: "FW", age: 26 },
    { name: "Alexander Djiku", position: "DF", age: 31 },
  ],
  panama: [
    { name: "Ismael Díaz", position: "FW", age: 28 },
    { name: "Adalberto Carrasquilla", position: "MF", age: 27 },
    { name: "Cecilio Waterman", position: "FW", age: 34 },
    { name: "José Córdoba", position: "DF", age: 24 },
    { name: "Orlando Mosquera", position: "GK", age: 31 },
  ],
};

const TEAMS: TeamData[] = [
  { id: "mexico", name: "Mexico", flag: "🇲🇽", group: "A", fifaRanking: 12, confederation: "CONCACAF", coach: "Jaime Lozano", players: PLAYERS_BY_TEAM.mexico },
  { id: "south-africa", name: "South Africa", flag: "🇿🇦", group: "A", fifaRanking: 54, confederation: "CAF", coach: "Hugo Broos", players: PLAYERS_BY_TEAM["south-africa"] },
  { id: "south-korea", name: "South Korea", flag: "🇰🇷", group: "A", fifaRanking: 23, confederation: "AFC", coach: "Hong Myung-bo", players: PLAYERS_BY_TEAM["south-korea"] },
  { id: "czech-republic", name: "Czech Republic", flag: "🇨🇿", group: "A", fifaRanking: 36, confederation: "UEFA", coach: "Ivan Hašek", players: PLAYERS_BY_TEAM["czech-republic"] },
  { id: "canada", name: "Canada", flag: "🇨🇦", group: "B", fifaRanking: 45, confederation: "CONCACAF", coach: "Jesse Marsch", players: PLAYERS_BY_TEAM.canada },
  { id: "bosnia", name: "Bosnia & Herz.", flag: "🇧🇦", group: "B", fifaRanking: 57, confederation: "UEFA", coach: "Sergej Barbarez", players: PLAYERS_BY_TEAM.bosnia },
  { id: "qatar", name: "Qatar", flag: "🇶🇦", group: "B", fifaRanking: 46, confederation: "AFC", coach: "Tintín Márquez", players: PLAYERS_BY_TEAM.qatar },
  { id: "switzerland", name: "Switzerland", flag: "🇨🇭", group: "B", fifaRanking: 15, confederation: "UEFA", coach: "Murat Yakin", players: PLAYERS_BY_TEAM.switzerland },
  { id: "brazil", name: "Brazil", flag: "🇧🇷", group: "C", fifaRanking: 5, confederation: "CONMEBOL", coach: "Dorival Júnior", players: PLAYERS_BY_TEAM.brazil },
  { id: "morocco", name: "Morocco", flag: "🇲🇦", group: "C", fifaRanking: 13, confederation: "CAF", coach: "Walid Regragui", players: PLAYERS_BY_TEAM.morocco },
  { id: "haiti", name: "Haiti", flag: "🇭🇹", group: "C", fifaRanking: 82, confederation: "CONCACAF", coach: "Sébastien Migné", players: PLAYERS_BY_TEAM.haiti },
  { id: "scotland", name: "Scotland", flag: "🏴󠁧󠁢󠁳󠁣󠁴󠁿", group: "C", fifaRanking: 34, confederation: "UEFA", coach: "Steve Clarke", players: PLAYERS_BY_TEAM.scotland },
  { id: "usa", name: "USA", flag: "🇺🇸", group: "D", fifaRanking: 13, confederation: "CONCACAF", coach: "Mauricio Pochettino", players: PLAYERS_BY_TEAM.usa },
  { id: "paraguay", name: "Paraguay", flag: "🇵🇾", group: "D", fifaRanking: 51, confederation: "CONMEBOL", coach: "Daniel Garnero", players: PLAYERS_BY_TEAM.paraguay },
  { id: "australia", name: "Australia", flag: "🇦🇺", group: "D", fifaRanking: 25, confederation: "AFC", coach: "Graham Arnold", players: PLAYERS_BY_TEAM.australia },
  { id: "turkey", name: "Turkey", flag: "🇹🇷", group: "D", fifaRanking: 29, confederation: "UEFA", coach: "Vincenzo Montella", players: PLAYERS_BY_TEAM.turkey },
  { id: "germany", name: "Germany", flag: "🇩🇪", group: "E", fifaRanking: 9, confederation: "UEFA", coach: "Julian Nagelsmann", players: PLAYERS_BY_TEAM.germany },
  { id: "curacao", name: "Curaçao", flag: "🇨🇼", group: "E", fifaRanking: 84, confederation: "CONCACAF", coach: "Dick Advocaat", players: PLAYERS_BY_TEAM.curacao },
  { id: "ivory-coast", name: "Ivory Coast", flag: "🇨🇮", group: "E", fifaRanking: 38, confederation: "CAF", coach: "Emerse Faé", players: PLAYERS_BY_TEAM["ivory-coast"] },
  { id: "ecuador", name: "Ecuador", flag: "🇪🇨", group: "E", fifaRanking: 27, confederation: "CONMEBOL", coach: "Félix Sánchez Bas", players: PLAYERS_BY_TEAM.ecuador },
  { id: "netherlands", name: "Netherlands", flag: "🇳🇱", group: "F", fifaRanking: 7, confederation: "UEFA", coach: "Ronald Koeman", players: PLAYERS_BY_TEAM.netherlands },
  { id: "japan", name: "Japan", flag: "🇯🇵", group: "F", fifaRanking: 17, confederation: "AFC", coach: "Hajime Moriyasu", players: PLAYERS_BY_TEAM.japan },
  { id: "sweden", name: "Sweden", flag: "🇸🇪", group: "F", fifaRanking: 24, confederation: "UEFA", coach: "Jon Dahl Tomasson", players: PLAYERS_BY_TEAM.sweden },
  { id: "tunisia", name: "Tunisia", flag: "🇹🇳", group: "F", fifaRanking: 31, confederation: "CAF", coach: "Kais Yaâkoubi", players: PLAYERS_BY_TEAM.tunisia },
  { id: "belgium", name: "Belgium", flag: "🇧🇪", group: "G", fifaRanking: 6, confederation: "UEFA", coach: "Domenico Tedesco", players: PLAYERS_BY_TEAM.belgium },
  { id: "egypt", name: "Egypt", flag: "🇪🇬", group: "G", fifaRanking: 33, confederation: "CAF", coach: "Hossam Hassan", players: PLAYERS_BY_TEAM.egypt },
  { id: "iran", name: "Iran", flag: "🇮🇷", group: "G", fifaRanking: 20, confederation: "AFC", coach: "Amir Ghalenoei", players: PLAYERS_BY_TEAM.iran },
  { id: "new-zealand", name: "New Zealand", flag: "🇳🇿", group: "G", fifaRanking: 94, confederation: "OFC", coach: "Darren Bazeley", players: PLAYERS_BY_TEAM["new-zealand"] },
  { id: "spain", name: "Spain", flag: "🇪🇸", group: "H", fifaRanking: 3, confederation: "UEFA", coach: "Luis de la Fuente", players: PLAYERS_BY_TEAM.spain },
  { id: "cape-verde", name: "Cape Verde", flag: "🇨🇻", group: "H", fifaRanking: 64, confederation: "CAF", coach: "Bubista", players: PLAYERS_BY_TEAM["cape-verde"] },
  { id: "saudi-arabia", name: "Saudi Arabia", flag: "🇸🇦", group: "H", fifaRanking: 56, confederation: "AFC", coach: "Roberto Mancini", players: PLAYERS_BY_TEAM["saudi-arabia"] },
  { id: "uruguay", name: "Uruguay", flag: "🇺🇾", group: "H", fifaRanking: 11, confederation: "CONMEBOL", coach: "Marcelo Bielsa", players: PLAYERS_BY_TEAM.uruguay },
  { id: "france", name: "France", flag: "🇫🇷", group: "I", fifaRanking: 2, confederation: "UEFA", coach: "Didier Deschamps", players: PLAYERS_BY_TEAM.france },
  { id: "senegal", name: "Senegal", flag: "🇸🇳", group: "I", fifaRanking: 19, confederation: "CAF", coach: "Pape Thiaw", players: PLAYERS_BY_TEAM.senegal },
  { id: "iraq", name: "Iraq", flag: "🇮🇶", group: "I", fifaRanking: 59, confederation: "AFC", coach: "Jesús Casas", players: PLAYERS_BY_TEAM.iraq },
  { id: "norway", name: "Norway", flag: "🇳🇴", group: "I", fifaRanking: 43, confederation: "UEFA", coach: "Ståle Solbakken", players: PLAYERS_BY_TEAM.norway },
  { id: "argentina", name: "Argentina", flag: "🇦🇷", group: "J", fifaRanking: 1, confederation: "CONMEBOL", coach: "Lionel Scaloni", players: PLAYERS_BY_TEAM.argentina },
  { id: "algeria", name: "Algeria", flag: "🇩🇿", group: "J", fifaRanking: 40, confederation: "CAF", coach: "Vladimir Petković", players: PLAYERS_BY_TEAM.algeria },
  { id: "austria", name: "Austria", flag: "🇦🇹", group: "J", fifaRanking: 22, confederation: "UEFA", coach: "Ralf Rangnick", players: PLAYERS_BY_TEAM.austria },
  { id: "jordan", name: "Jordan", flag: "🇯🇴", group: "J", fifaRanking: 67, confederation: "AFC", coach: "Jamal Sellami", players: PLAYERS_BY_TEAM.jordan },
  { id: "portugal", name: "Portugal", flag: "🇵🇹", group: "K", fifaRanking: 8, confederation: "UEFA", coach: "Roberto Martínez", players: PLAYERS_BY_TEAM.portugal },
  { id: "dr-congo", name: "DR Congo", flag: "🇨🇩", group: "K", fifaRanking: 60, confederation: "CAF", coach: "Sébastien Desabre", players: PLAYERS_BY_TEAM["dr-congo"] },
  { id: "uzbekistan", name: "Uzbekistan", flag: "🇺🇿", group: "K", fifaRanking: 72, confederation: "AFC", coach: "Srečko Katanec", players: PLAYERS_BY_TEAM.uzbekistan },
  { id: "colombia", name: "Colombia", flag: "🇨🇴", group: "K", fifaRanking: 14, confederation: "CONMEBOL", coach: "Néstor Lorenzo", players: PLAYERS_BY_TEAM.colombia },
  { id: "england", name: "England", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", group: "L", fifaRanking: 4, confederation: "UEFA", coach: "Thomas Tuchel", players: PLAYERS_BY_TEAM.england },
  { id: "croatia", name: "Croatia", flag: "🇭🇷", group: "L", fifaRanking: 10, confederation: "UEFA", coach: "Zlatko Dalić", players: PLAYERS_BY_TEAM.croatia },
  { id: "ghana", name: "Ghana", flag: "🇬🇭", group: "L", fifaRanking: 42, confederation: "CAF", coach: "Otto Addo", players: PLAYERS_BY_TEAM.ghana },
  { id: "panama", name: "Panama", flag: "🇵🇦", group: "L", fifaRanking: 52, confederation: "CONCACAF", coach: "Thomas Christiansen", players: PLAYERS_BY_TEAM.panama },
];

export const GROUPS = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L"];

const GROUP_MATCHDATES: Record<string, string[]> = {
  A: ["Jun 11", "Jun 16", "Jun 21"],
  B: ["Jun 12", "Jun 17", "Jun 22"],
  C: ["Jun 12", "Jun 17", "Jun 22"],
  D: ["Jun 13", "Jun 18", "Jun 23"],
  E: ["Jun 13", "Jun 18", "Jun 23"],
  F: ["Jun 14", "Jun 19", "Jun 24"],
  G: ["Jun 14", "Jun 19", "Jun 24"],
  H: ["Jun 15", "Jun 20", "Jun 25"],
  I: ["Jun 15", "Jun 20", "Jun 25"],
  J: ["Jun 16", "Jun 21", "Jun 26"],
  K: ["Jun 17", "Jun 22", "Jun 27"],
  L: ["Jun 18", "Jun 23", "Jun 28"],
};

const VENUES = ["Mexico City", "Guadalajara", "Monterrey", "Vancouver", "Toronto", "New York", "Los Angeles", "Dallas", "Houston", "Kansas City", "Philadelphia", "Atlanta", "Boston", "San Francisco", "Seattle", "Miami"];

export interface VenueData {
  id: string;
  city: string;
  country: string;
  flag: string;
  stadium: string;
  capacity: number;
  matches: number;
}

const VENUE_DATA: VenueData[] = [
  { id: "mexico-city", city: "Mexico City", country: "Mexico", flag: "🇲🇽", stadium: "Estadio Azteca", capacity: 87523, matches: 8 },
  { id: "guadalajara", city: "Guadalajara", country: "Mexico", flag: "🇲🇽", stadium: "Estadio Akron", capacity: 46355, matches: 6 },
  { id: "monterrey", city: "Monterrey", country: "Mexico", flag: "🇲🇽", stadium: "Estadio BBVA", capacity: 53500, matches: 6 },
  { id: "vancouver", city: "Vancouver", country: "Canada", flag: "🇨🇦", stadium: "BC Place", capacity: 54500, matches: 6 },
  { id: "toronto", city: "Toronto", country: "Canada", flag: "🇨🇦", stadium: "BMO Field", capacity: 30991, matches: 6 },
  { id: "new-york", city: "New York", country: "USA", flag: "🇺🇸", stadium: "MetLife Stadium", capacity: 82500, matches: 8 },
  { id: "los-angeles", city: "Los Angeles", country: "USA", flag: "🇺🇸", stadium: "SoFi Stadium", capacity: 70240, matches: 6 },
  { id: "dallas", city: "Dallas", country: "USA", flag: "🇺🇸", stadium: "AT&T Stadium", capacity: 80000, matches: 8 },
  { id: "houston", city: "Houston", country: "USA", flag: "🇺🇸", stadium: "NRG Stadium", capacity: 72220, matches: 6 },
  { id: "kansas-city", city: "Kansas City", country: "USA", flag: "🇺🇸", stadium: "Arrowhead Stadium", capacity: 76416, matches: 6 },
  { id: "philadelphia", city: "Philadelphia", country: "USA", flag: "🇺🇸", stadium: "Lincoln Financial Field", capacity: 69596, matches: 6 },
  { id: "atlanta", city: "Atlanta", country: "USA", flag: "🇺🇸", stadium: "Mercedes-Benz Stadium", capacity: 71000, matches: 6 },
  { id: "boston", city: "Boston", country: "USA", flag: "🇺🇸", stadium: "Gillette Stadium", capacity: 65878, matches: 6 },
  { id: "san-francisco", city: "San Francisco", country: "USA", flag: "🇺🇸", stadium: "Levi's Stadium", capacity: 68500, matches: 6 },
  { id: "seattle", city: "Seattle", country: "USA", flag: "🇺🇸", stadium: "Lumen Field", capacity: 68740, matches: 6 },
  { id: "miami", city: "Miami", country: "USA", flag: "🇺🇸", stadium: "Hard Rock Stadium", capacity: 65326, matches: 6 },
];

export function getVenues(): VenueData[] {
  return VENUE_DATA;
}

function generateMatches(): MatchData[] {
  const matches: MatchData[] = [];
  let venueIdx = 0;

  GROUPS.forEach((group) => {
    const teams = TEAMS.filter(t => t.group === group);
    if (teams.length !== 4) return;
    const [t1, t2, t3, t4] = teams;
    const dates = GROUP_MATCHDATES[group] || ["TBD", "TBD", "TBD"];

    const groupMatches = [
      { team1: t1.id, team2: t2.id, date: dates[0] },
      { team1: t3.id, team2: t4.id, date: dates[0] },
      { team1: t1.id, team2: t3.id, date: dates[1] },
      { team1: t2.id, team2: t4.id, date: dates[1] },
      { team1: t1.id, team2: t4.id, date: dates[2] },
      { team1: t2.id, team2: t3.id, date: dates[2] },
    ];

    groupMatches.forEach((m, i) => {
      matches.push({
        id: `${group}-${i + 1}`,
        group,
        team1: m.team1,
        team2: m.team2,
        date: m.date,
        venue: VENUES[venueIdx % VENUES.length],
        stage: "Group Stage",
      });
      venueIdx++;
    });
  });

  return matches;
}

export const MATCHES = generateMatches();

export function getTeamsByGroup(group: string): TeamData[] {
  return TEAMS.filter(t => t.group === group);
}

export function getTeamById(id: string): TeamData | undefined {
  return TEAMS.find(t => t.id === id);
}

export function getMatchesForTeam(teamId: string): MatchData[] {
  return MATCHES.filter(m => m.team1 === teamId || m.team2 === teamId);
}

export function getTeamName(id: string): string {
  return TEAMS.find(t => t.id === id)?.name || id;
}

export function getTeamFlag(id: string): string {
  return TEAMS.find(t => t.id === id)?.flag || "";
}

export interface PlayerWithTeam extends PlayerData {
  teamId: string;
  teamName: string;
  teamFlag: string;
  teamGroup: string;
}

export function getStarOfTheWeek(): PlayerWithTeam {
  const all = getAllPlayers();
  const now = new Date();
  const week = Math.floor((now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / (7 * 86400000));
  return all[week % all.length];
}

export function getAllPlayers(): PlayerWithTeam[] {
  const result: PlayerWithTeam[] = [];
  for (const team of TEAMS) {
    for (const player of team.players) {
      result.push({ ...player, teamId: team.id, teamName: team.name, teamFlag: team.flag, teamGroup: team.group });
    }
  }
  return result;
}

export function getAllTeams(): TeamData[] {
  return TEAMS;
}

export interface Standing {
  teamId: string;
  teamName: string;
  flag: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDiff: number;
  points: number;
}

const RANDOM_SEED: Record<string, number> = {};
function seededRandom(key: string): number {
  if (!RANDOM_SEED[key]) RANDOM_SEED[key] = key.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  const x = Math.sin(RANDOM_SEED[key]++ * 9301 + 49297) * 49297;
  return x - Math.floor(x);
}

export function getGroupStandings(group: string): Standing[] {
  const teams = getTeamsByGroup(group);
  const matches = MATCHES.filter((m) => m.group === group);
  const stats: Record<string, Standing> = {};

  for (const team of teams) {
    stats[team.id] = {
      teamId: team.id,
      teamName: team.name,
      flag: team.flag,
      played: 0,
      won: 0,
      drawn: 0,
      lost: 0,
      goalsFor: 0,
      goalsAgainst: 0,
      goalDiff: 0,
      points: 0,
    };
  }

  for (const match of matches) {
    const t1 = teams.find((t) => t.id === match.team1);
    const t2 = teams.find((t) => t.id === match.team2);
    if (!t1 || !t2) continue;
    if (!isMatchDatePassed(match.date)) continue;

    const rank1 = t1.fifaRanking;
    const rank2 = t2.fifaRanking;
    const s1 = seededRandom(`${match.id}-score-1`);
    const s2 = seededRandom(`${match.id}-score-2`);
    const strength1 = 1 / rank1;
    const strength2 = 1 / rank2;
    const total = strength1 + strength2;
    const prob1 = strength1 / total;
    const prob2 = strength2 / total;

    const goals1 = Math.round(prob1 * (2 + s1 * 3));
    const goals2 = Math.round(prob2 * (2 + s2 * 3));

    stats[match.team1].played++;
    stats[match.team2].played++;
    stats[match.team1].goalsFor += goals1;
    stats[match.team1].goalsAgainst += goals2;
    stats[match.team2].goalsFor += goals2;
    stats[match.team2].goalsAgainst += goals1;

    if (goals1 > goals2) {
      stats[match.team1].won++;
      stats[match.team1].points += 3;
      stats[match.team2].lost++;
    } else if (goals2 > goals1) {
      stats[match.team2].won++;
      stats[match.team2].points += 3;
      stats[match.team1].lost++;
    } else {
      stats[match.team1].drawn++;
      stats[match.team1].points += 1;
      stats[match.team2].drawn++;
      stats[match.team2].points += 1;
    }
  }

  return Object.values(stats)
    .map((s) => ({ ...s, goalDiff: s.goalsFor - s.goalsAgainst }))
    .sort((a, b) => b.points - a.points || b.goalDiff - a.goalDiff || b.goalsFor - a.goalsFor);
}

export function findPlayerByName(name: string): { player: PlayerData; team: TeamData } | undefined {
  const slug = slugify(name);
  for (const team of TEAMS) {
    const player = team.players.find((p) => slugify(p.name) === slug);
    if (player) return { player, team };
  }
  return undefined;
}

export function slugify(name: string): string {
  return name.toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function getAdjacentPlayers(name: string): { prev: PlayerWithTeam | null; next: PlayerWithTeam | null } {
  const all = getAllPlayers();
  const idx = all.findIndex((p) => slugify(p.name) === slugify(name));
  if (idx === -1) return { prev: null, next: null };
  return {
    prev: idx > 0 ? all[idx - 1] : null,
    next: idx < all.length - 1 ? all[idx + 1] : null,
  };
}

function parseMatchDate(dateStr: string): Date {
  return new Date(`2026 ${dateStr}`);
}

function isMatchDatePassed(dateStr: string): boolean {
  return parseMatchDate(dateStr) <= new Date();
}

export function getMatchScore(matchId: string, team1Id: string, team2Id: string, date?: string): [number, number] {
  if (date && !isMatchDatePassed(date)) return [0, 0];
  const t1 = TEAMS.find((t) => t.id === team1Id);
  const t2 = TEAMS.find((t) => t.id === team2Id);
  if (!t1 || !t2) return [0, 0];
  const s1 = seededRandom(`${matchId}-score-1`);
  const s2 = seededRandom(`${matchId}-score-2`);
  const strength1 = 1 / t1.fifaRanking;
  const strength2 = 1 / t2.fifaRanking;
  const total = strength1 + strength2;
  const g1 = Math.round((strength1 / total) * (2 + s1 * 3));
  const g2 = Math.round((strength2 / total) * (2 + s2 * 3));
  return [g1, g2];
}

export interface KnockoutMatch {
  id: string;
  round: string;
  team1: string | null;
  team2: string | null;
  score1?: number;
  score2?: number;
}

export function getKnockoutBracket(): KnockoutMatch[] {
  const groupWinners: { team: TeamData; group: string }[] = [];
  const groupRunnersUp: { team: TeamData; group: string }[] = [];

  for (const group of GROUPS) {
    const standings = getGroupStandings(group);
    if (standings.length >= 2) {
      const t1 = getTeamById(standings[0].teamId);
      const t2 = getTeamById(standings[1].teamId);
      if (t1) groupWinners.push({ team: t1, group });
      if (t2) groupRunnersUp.push({ team: t2, group });
    }
  }

  const matches: KnockoutMatch[] = [];

  for (let i = 0; i < Math.min(groupWinners.length, groupRunnersUp.length); i++) {
    const w = groupWinners[i];
    const r = groupRunnersUp[groupRunnersUp.length - 1 - i];
    if (w && r) {
      const s1 = seededRandom(`ko-r32-${i}-1`);
      const s2 = seededRandom(`ko-r32-${i}-2`);
      matches.push({
        id: `r32-${i}`,
        round: "Round of 32",
        team1: w.team.id,
        team2: r.team.id,
        score1: Math.round(1 + s1 * 3),
        score2: Math.round(s2 * 2),
      });
    }
  }

  const r16: KnockoutMatch[] = [];
  for (let i = 0; i < Math.floor(matches.length / 2); i++) {
    const s1 = seededRandom(`ko-r16-${i}-1`);
    const s2 = seededRandom(`ko-r16-${i}-2`);
    r16.push({
      id: `r16-${i}`,
      round: "Round of 16",
      team1: null,
      team2: null,
      score1: Math.round(1 + s1 * 2),
      score2: Math.round(s2 * 2),
    });
  }

  const qf: KnockoutMatch[] = [];
  for (let i = 0; i < 4; i++) {
    const s1 = seededRandom(`ko-qf-${i}-1`);
    const s2 = seededRandom(`ko-qf-${i}-2`);
    qf.push({
      id: `qf-${i}`,
      round: "Quarter-final",
      team1: null,
      team2: null,
      score1: Math.round(1 + s1 * 2),
      score2: Math.round(s2 * 1.5),
    });
  }

  const sf: KnockoutMatch[] = [];
  for (let i = 0; i < 2; i++) {
    const s1 = seededRandom(`ko-sf-${i}-1`);
    const s2 = seededRandom(`ko-sf-${i}-2`);
    sf.push({
      id: `sf-${i}`,
      round: "Semi-final",
      team1: null,
      team2: null,
      score1: Math.round(1 + s1 * 2),
      score2: Math.round(s2 * 1.5),
    });
  }

  const final: KnockoutMatch[] = [{
    id: "final",
    round: "Final",
    team1: null,
    team2: null,
    score1: Math.round(1 + seededRandom("ko-final-1") * 2),
    score2: Math.round(seededRandom("ko-final-2") * 1.5),
  }];

  return [...matches, ...r16, ...qf, ...sf, ...final];
}

export interface ScorerEntry {
  playerName: string;
  teamId: string;
  teamName: string;
  teamFlag: string;
  position: string;
  goals: number;
  matches: number;
  teamGroup: string;
}

export interface MatchGoalScorer {
  playerName: string;
  teamId: string;
  minute: number;
}

export function getMatchGoalScorers(matchId: string, team1Id: string, team2Id: string, date?: string): { scorers1: MatchGoalScorer[]; scorers2: MatchGoalScorer[] } {
  const t1 = getTeamById(team1Id);
  const t2 = getTeamById(team2Id);
  if (!t1 || !t2) return { scorers1: [], scorers2: [] };
  if (date && !isMatchDatePassed(date)) return { scorers1: [], scorers2: [] };
  const [s1, s2] = getMatchScore(matchId, team1Id, team2Id, date);
  const pw: Record<string, number> = { FW: 0.60, MF: 0.30, DF: 0.08, GK: 0.02 };

  function dist(players: PlayerData[], goals: number, tid: string, seed: string): MatchGoalScorer[] {
    if (goals === 0) return [];
    const ws = players.map(p => pw[p.position] || 0.10);
    const total = ws.reduce((a, b) => a + b, 0);
    const norm = ws.map(w => w / total);
    const res: MatchGoalScorer[] = [];
    for (let g = 0; g < goals; g++) {
      const r = seededRandom(`${seed}-${g}`);
      let cum = 0;
      for (let i = 0; i < players.length; i++) {
        cum += norm[i];
        if (r < cum) {
          const minute = Math.round(10 + seededRandom(`${seed}-${g}-min`) * 75);
          res.push({ playerName: players[i].name, teamId: tid, minute });
          break;
        }
      }
    }
    return res.sort((a, b) => a.minute - b.minute);
  }

  return {
    scorers1: dist(t1.players, s1, team1Id, `${matchId}-t1`),
    scorers2: dist(t2.players, s2, team2Id, `${matchId}-t2`),
  };
}

export function getTopScorers(limit = 30): ScorerEntry[] {
  const all = getAllPlayers();
  const map: Record<string, ScorerEntry> = {};
  for (const p of all) {
    const k = `${p.teamId}-${p.name}`;
    map[k] = { playerName: p.name, teamId: p.teamId, teamName: p.teamName, teamFlag: p.teamFlag, position: p.position, goals: 0, matches: 0, teamGroup: getTeamById(p.teamId)?.group || "" };
  }
  for (const m of MATCHES) {
    const t1 = getTeamById(m.team1);
    const t2 = getTeamById(m.team2);
    if (!t1 || !t2) continue;
    if (!isMatchDatePassed(m.date)) continue;
    for (const pl of t1.players) { const k = `${t1.id}-${pl.name}`; if (map[k]) map[k].matches++; }
    for (const pl of t2.players) { const k = `${t2.id}-${pl.name}`; if (map[k]) map[k].matches++; }
    const gs = getMatchGoalScorers(m.id, m.team1, m.team2, m.date);
    for (const sc of gs.scorers1) { const k = `${sc.teamId}-${sc.playerName}`; if (map[k]) map[k].goals++; }
    for (const sc of gs.scorers2) { const k = `${sc.teamId}-${sc.playerName}`; if (map[k]) map[k].goals++; }
  }
  return Object.values(map).filter(s => s.goals > 0).sort((a, b) => b.goals - a.goals || b.matches - a.matches).slice(0, limit);
}

export interface PlayerMatchPerformance {
  matchId: string;
  opponent: string;
  opponentFlag: string;
  date: string;
  venue: string;
  stage: string;
  goals: number;
  minutes: number[];
  teamScore: number;
  opponentScore: number;
  isWin: boolean;
  isDraw: boolean;
}

export function getPlayerMatchPerformances(playerName: string, teamId: string): PlayerMatchPerformance[] {
  const teamMatches = MATCHES.filter(m => m.team1 === teamId || m.team2 === teamId);
  const result: PlayerMatchPerformance[] = [];
  for (const m of teamMatches) {
    if (!isMatchDatePassed(m.date)) continue;
    const isTeam1 = m.team1 === teamId;
    const opponentId = isTeam1 ? m.team2 : m.team1;
    const opponentTeam = getTeamById(opponentId);
    if (!opponentTeam) continue;
    const [s1, s2] = getMatchScore(m.id, m.team1, m.team2, m.date);
    const teamScore = isTeam1 ? s1 : s2;
    const oppScore = isTeam1 ? s2 : s1;
    const gs = getMatchGoalScorers(m.id, m.team1, m.team2, m.date);
    const playerGoals = [...gs.scorers1, ...gs.scorers2]
      .filter(sc => sc.playerName === playerName && sc.teamId === teamId);
    result.push({
      matchId: m.id,
      opponent: opponentTeam.name,
      opponentFlag: opponentTeam.flag,
      date: m.date,
      venue: m.venue,
      stage: m.stage,
      goals: playerGoals.length,
      minutes: playerGoals.map(sc => sc.minute),
      teamScore,
      opponentScore: oppScore,
      isWin: teamScore > oppScore,
      isDraw: teamScore === oppScore,
    });
  }
  return result;
}

export interface StarOfMatch {
  playerName: string;
  teamId: string;
  teamName: string;
  teamFlag: string;
  position: string;
  goals: number;
  minutes: number[];
  teamScore: number;
  opponentScore: number;
  isWinningTeam: boolean;
}

export function getStarOfTheMatch(matchId: string): StarOfMatch | null {
  const match = MATCHES.find(m => m.id === matchId);
  if (!match) return null;
  const team1 = getTeamById(match.team1);
  const team2 = getTeamById(match.team2);
  if (!team1 || !team2) return null;

  if (!isMatchDatePassed(match.date)) return null;

  const { scorers1, scorers2 } = getMatchGoalScorers(match.id, match.team1, match.team2, match.date);
  const all = [...scorers1, ...scorers2];
  if (all.length === 0) return null;

  const goalCounts: Record<string, { count: number; minutes: number[]; teamId: string }> = {};
  for (const sc of all) {
    if (!goalCounts[sc.playerName]) goalCounts[sc.playerName] = { count: 0, minutes: [], teamId: sc.teamId };
    goalCounts[sc.playerName].count++;
    goalCounts[sc.playerName].minutes.push(sc.minute);
  }

  const sorted = Object.entries(goalCounts).sort((a, b) => b[1].count - a[1].count);
  const top = sorted[0];
  const playerData = getAllPlayers().find(p => p.name === top[0] && p.teamId === top[1].teamId);
  if (!playerData) return null;

  const [s1, s2] = getMatchScore(match.id, match.team1, match.team2, match.date);
  const isTeam1 = top[1].teamId === match.team1;
  const teamScore = isTeam1 ? s1 : s2;
  const oppScore = isTeam1 ? s2 : s1;

  return {
    playerName: top[0],
    teamId: top[1].teamId,
    teamName: isTeam1 ? team1.name : team2.name,
    teamFlag: isTeam1 ? team1.flag : team2.flag,
    position: playerData.position,
    goals: top[1].count,
    minutes: top[1].minutes.sort((a, b) => a - b),
    teamScore,
    opponentScore: oppScore,
    isWinningTeam: teamScore > oppScore,
  };
}

export function getRelatedPlayers(name: string, teamId: string, position: string, limit = 6): PlayerWithTeam[] {
  const all = getAllPlayers();
  const teammates = all.filter((p) => p.teamId === teamId && slugify(p.name) !== slugify(name));
  const samePosition = all.filter((p) => p.position === position && p.teamId !== teamId && slugify(p.name) !== slugify(name));
  const seen = new Set<string>();
  const result: PlayerWithTeam[] = [];
  for (const p of [...teammates, ...samePosition]) {
    const key = `${p.teamId}-${p.name}`;
    if (!seen.has(key)) {
      seen.add(key);
      result.push(p);
    }
    if (result.length >= limit) break;
  }
  return result;
}

export default TEAMS;
