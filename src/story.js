/* ================= STORY: pages, cards, voices ================= */
/* Adeleke House, Oke-Ọla, a Yoruba hill town.
   1935  Olumide Adeleke born. Self-made: transport, then contracts.
   1947  Adaeze born in Enugu. A teacher.
   1970  They marry, after the war.
   1971  2 March: Tobenna Oluwaseun Adeleke born.
   1972  The house is built at the top of the hill, with a chimney nobody in Nigeria needs.
   1973  Effiong Etim, 22, from Calabar, becomes Papa's driver. His grandfather was an Ekpo elder in Ikot Ekpene.
   1975  The cement import contracts: ships of cement paid for and never delivered. Land on the hill road "acquired".
         19 Sept: a labourer dies on one of the plots. 3 Oct: Effiong says he will talk. 7 Oct: Effiong is gone;
         that night Papa "fixes the chimney". 14 Oct, 7:20 pm: the thing the children call Ojuju Calabar comes
         for Papa. He is found at the foot of the chimney, alive, and never wakes. Every clock stops at 7:20.
         Mama runs down the hill in the rain with Tobi, four.
   1994  Mama moves to the UK. Tobi studies engineering at UNILAG.
   1997  Monday 13 Oct: a NITEL mast project sends Tobi, 26, to Oke-Ọla. Tuesday 14 Oct: twenty-two years to the night.
   Why "Ojuju Calabar": Effiong came back the way his forefathers' spirits come back: as Ekpo, in raffia, with a dark
   carved face. Nobody on the hill had ever seen Ekpo. To them he was "the Calabar man", so the children named the
   thing Ojuju Calabar. It is not evil for its own sake. It wants its name back, and a burial. */

const PAGES = [
  { id: 'photo', room: 'foyer', obj: 'photo', where: 'the framed photograph on the side stool', title: 'Adeleke House, Christmas 1972',
    text: 'A big man in a white agbada and a blue fila, laughing. A woman in a green gele, holding a baby who is reaching for the camera. At the very edge, half cut off, a young man in a driver’s cap, smiling at the baby instead of the lens.\n\nOn the back, in Mama’s hand: “Olumide, Adaeze, Tobenna. And Effiong, who would not stand in the middle.”\n\nSomeone has scratched the driver’s face away with a pin.' },
  { id: 'notebook', room: 'foyer', obj: 'books', where: 'the showglass cabinet', title: 'Mama’s exercise book',
    text: 'Behind the wedding plates nobody is allowed to eat from, a school exercise book.\n\n“12 September 1975. He says the cement is making us rich. Ships of it, waiting in the lagoon at Lagos, and we are paid for every day they wait. I do not understand how waiting is work.\n\n30 September. Men at the gate again at midnight. Effiong sent them away and came back grey. He would not look at me.\n\n2 October. Effiong carved Tobi a little wooden car. Tobi will not sleep without it.”' },

  { id: 'gown', room: 'nursery', obj: 'wardrobe', where: 'the wardrobe', title: 'A naming-day outfit',
    text: 'Under old newspaper: a tiny white lace outfit, the size of your two hands. A card is pinned to it.\n\n“Tobenna Oluwaseun Adeleke. Named on his eighth day, 10 March 1971.\nTobenna: praise God. Oluwaseun: God has done it.\nTwo names, because he has two peoples. — A.”' },
  { id: 'lullaby', room: 'nursery', obj: 'crib', where: 'the cot', title: 'Folded into the mattress',
    // the verses follow this run's music box, so the page never gives a different order from the box
    get text() { const V = { star: 'Kpakpando, because you are small and bright.', moon: 'Ọnwa, because you are quiet.', sun: 'Anyanwụ, because one day you will go, and I must let you.' };
      return 'Mama’s lullaby, written out in biro, Igbo and English side by side. You know every word, and you do not know how.\n\n“' + PZ().box.map(k => V[k]).join('\n') + '\n\nNwa m, rahụ ụra. Mama nọ ebe a.”'; } },

  { id: 'burnt', room: 'kitchen', obj: 'range', where: 'the gas cooker', title: 'A burnt letter',
    text: 'Half of it survived the flame. A careful, uneven hand.\n\n“…Madam, I am not a man for writing. I am begging you, take Tobi and go to your people in Enugu for some time. Do not tell Oga I wrote this. The papers in his office are not good papers.\n\nIf anything happens to me, my people are in Ikot Ekpene. Tell them where I am.\n\n— Effiong”\n\nShe burned it. She must have been afraid he would find it.' },
  { id: 'household', room: 'kitchen', obj: 'ktable', where: 'the kitchen table', title: 'The kitchen book, October 1975',
    text: '“3 Oct. Oga says the boys’ quarters is to be locked. Effiong to sleep in the garage.\n\n8 Oct. Effiong did not come for breakfast. Oga says he has travelled home. His plate is still here.\n\n9 Oct. Cement bags in the boys’ quarters, and a trowel. Oga says the chimney was leaking. We have never once lit that chimney.\n\n15 Oct. Madam is gone. Oga is in the hospital. I am going home.”' },

  { id: 'plate', room: 'cellar', obj: 'coffin', where: 'the long crate, once it is open', title: 'An identity card',
    text: 'Inside the crate, under a folded driver’s cap: a laminated card.\n\nADELEKE HOLDINGS LTD.\nSTAFF IDENTITY CARD\nNAME: EFFIONG ETIM\nPOST: DRIVER\nSTATE OF ORIGIN: CROSS RIVER\nISSUED: 4 JANUARY 1973\n\nThe photograph shows a young man trying not to smile. On the back, in his hand: “If found, return to Etim family, Ikot Ekpene.”\n\nEffiong Etim. So that was his name.' },
  { id: 'letters', room: 'cellar', obj: 'barrel', where: 'the tin box by the kegs', title: 'The Ekpo elder',
    text: 'A rusty tin box behind the kegs. Letters from Ikot Ekpene, and a photograph of an old man in a dark carved mask and a raffia fringe that reaches the ground.\n\nOn the back, in a schoolboy’s hand:\n“My grandfather, Etim Akpan, Ekpo elder. When Ekpo comes out, the ancestors walk among us again. Children run. Bad men run faster.”\n\nNobody up here had ever seen Ekpo. To them he was only the Calabar man.' },

  { id: 'diary', room: 'study', obj: 'diary', where: 'the diary on the desk', title: 'Papa’s diary, October 1975',
    text: '“3 October. E. says he will go to the newspapers about the cement and the hill road. He says a man died for my plots. He wants money. They all want money.\n\n7 October. I fixed the chimney myself. Nobody is to go on the roof.\n\n12 October. Something walks the upstairs at night. Tobi says Uncle Effiong is on the roof.\n\n14 October. Seven twenty. It is in the house. It has his\n\n”\n\nThe rest is a long blot of ink.' },
  { id: 'globe', room: 'study', obj: 'globe', where: 'the globe', title: 'A map of the hill road',
    text: 'Folded inside the globe’s stand: a survey map of Oke-Ọla. Plots along the hill road are shaded and named for the families who farmed them: Lawal. Adigun. Ojo. Over each one, in Papa’s hand: ACQUIRED.\n\nOne plot has a small cross on it, and a date.\n“19 Sept 1975. Site accident. Settled.”' },

  { id: 'register', room: 'chapel', obj: 'lectern', where: 'the Bible stand', title: 'The names she prayed for',
    text: 'A Bible open at Psalm 91. In the margin, a list in Mama’s hand, written over and over:\n\n“Olumide: open his eyes.\nTobenna: keep him.\nEffiong: wherever you are, God keep you.\nThe families on the hill road: forgive us.”\n\nThe last time she wrote it, the ink ran.' },
  { id: 'prayer', room: 'chapel', obj: 'altar', where: 'the prayer table', title: 'A card on the kneeler',
    text: 'The kneeler is worn through at one end. A card is pinned to it, in a shaking hand.\n\n“Holy Mother, if he will not stop, show me a way out. Do not let my son grow up in this house. Chineke, I am begging.”\n\nBelow it, in newer ink: “The way out is down the hill. Tonight.”' },

  { id: 'photo2', room: 'attic', obj: 'trunk', where: 'the iron trunk box', title: 'The wedding, 1970',
    text: 'Mama’s trunk, left behind. On top: a photograph of a registry wedding. A young man in a borrowed suit and a young woman in white, both laughing so hard the picture is blurred.\n\nOn the back: “He promised me a quiet life. — A., Lagos, 1970.”' },
  { id: 'shawl', room: 'attic', obj: 'rchair', where: 'the rocking chair', title: 'A small wrapper',
    text: 'Folded on the rocking chair: a small wrapper printed with stars, moons and suns. A paper is pinned to it.\n\n“For Tobenna, when he is grown. Tie it on cold nights. I will come back for it.\n— Mama”\n\nShe never did.' }
];
const PAGE_BY_OBJ = {};
PAGES.forEach(p => { PAGE_BY_OBJ[p.obj] = p; });

/* a line under each room title card */
const EPIGRAPHS = {
  foyer: '“Business, my dear. Business does not sleep.”',
  nursery: '“My child, sleep now. Mama is here.”',
  kitchen: '“Madam, take the small boy and go.”',
  cellar: '“If found, return to Etim family, Ikot Ekpene.”',
  study: '“Nobody is going anywhere, Effiong.”',
  chapel: '“God, protect my child.”',
  attic: '“Some houses keep what they take.”',
  roof: '“Where is my name?”'
};

const LOAD_QUOTES = [
  'Every clock in the house stopped at 7:20.',
  'Whatever calls you, do not answer.',
  'Somebody upstairs is still walking in circles.',
  'Three words in a lullaby, and the order matters.',
  'Go before dark.',
  'Where is my name?',
  'Some houses keep what they take.'
];

/* Spoken lines. Each has an id; drop a recording named <id>.m4a (or .mp3, .ogg, .opus, .wav) into assets/voice/
   and rebuild, and the game plays it with the speaker's ghost effects. Without a recording, the line still shows as text.
   The ids match the voice script in the Story Bible (O01, M01, T03…), with short aliases the code uses. */
const LINES = {
  O01: { who: 'ojuju', t: 'Tobiii…' },
  O02: { who: 'ojuju', t: 'Olumide’s son…' },
  O03: { who: 'ojuju', t: 'Where is my name?' },
  O04: { who: 'ojuju', t: 'You have your father’s face.' },
  O05: { who: 'ojuju', t: 'Who is there?' },
  O06: { who: 'ojuju', t: 'They called me Effiong…' },
  O07: { who: 'ojuju', t: 'Free me…' },
  M01: { who: 'mama', t: 'Tobenna, keep quiet… keep quiet…' },
  M02: { who: 'mama', t: 'Not that way, my child.' },
  M03: { who: 'mama', t: 'Never go back to that house.' },
  M04: { who: 'mama', t: 'Don’t look back.' },
  K01: { who: 'kid', t: 'Uncle Effiong! Vroom vroom!' },
  K02: { who: 'kid', t: 'Daddy is shouting…' },
  T03: { who: 'tobi', t: 'Papa… what did you do?' },
  T06: { who: 'tobi', t: 'Effiong Etim. So that was your name.' },
  T07: { who: 'tobi', t: 'Hello, Papa.' },
  E01: { who: 'tobi', t: 'It’s here. He’s inside.' },
  // aliases the game code already calls
  o_who: { who: 'ojuju', t: 'Who is there?', v: 'O05' },
  o_effiong: { who: 'ojuju', t: 'Tobiii…', v: 'O01' },
  o_notlike: { who: 'ojuju', t: 'Not like that.' },
  m_getout: { who: 'mama', t: 'Tobenna, get out. Get out.' },
  m_notyet: { who: 'mama', t: 'Not that way, my child.', v: 'M02' },
  m_candles: { who: 'mama', t: 'Not yet, my child.' }
};
const AMBIENT_LINES = ['O01', 'O02', 'O03', 'O04', 'O05', 'O06', 'O07', 'M01', 'M02', 'M03', 'K01', 'K02'];
