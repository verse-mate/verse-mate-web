import { ChapterAlignment } from './types';
import { LEXICON } from './lemmas';

// ─────────────────────────────────────────────────────────────────────────
// James 5 — woe to the unjust rich, patience like the farmer, Job and
// Elijah, prayer + anointing for the sick, restoring the wanderer.
// Surface forms against ESV.
// ─────────────────────────────────────────────────────────────────────────

const VERSES: ChapterAlignment['verses'] = {
  1: [
    { surface: 'rich', lemma: 'plousios', contextual:
      'James 5:1 opens a six-verse prophetic woe-oracle against the unjust rich whose hoarded gold testifies against them. Same polemical register as 1:10–11.' },
  ],
  4: [
    { surface: 'Lord', lemma: 'kurios', contextual:
      'Κυρίου Σαβαώθ — "the Lord of Sabaoth" (Lord of armies/hosts). James reaches for the prophets\' military title for God when describing the unpaid laborers\' cry.' },
  ],
  7: [
    { surface: 'patient', lemma: 'makrothumia', contextual:
      'μακροθυμία = "long-tempered" — patience with people. James 5 stacks μακροθυμία and ὑπομονή because waiting on God involves both: patience with people who wound and circumstances that don\'t resolve.' },
    { surface: 'brethren', lemma: 'adelphos' },
    { surface: 'brothers', lemma: 'adelphos' },
    { surface: 'coming', lemma: 'parousia', contextual:
      'Hellenistic royal vocabulary: παρουσία was the formal arrival of an emperor or king, demanding a city\'s reception. The NT borrows it for Christ\'s royal return.' },
    { surface: 'Lord', lemma: 'kurios' },
    { surface: 'farmer', lemma: 'georgos', contextual:
      'γῆ + ἔργον = "land-worker." The metaphor turns on the farmer\'s waiting: he cannot rush the rains, but he plants and tends in confident expectation.' },
  ],
  8: [
    { surface: 'patient', lemma: 'makrothumia' },
    { surface: 'coming', lemma: 'parousia' },
    { surface: 'Lord', lemma: 'kurios' },
  ],
  9: [
    { surface: 'brethren', lemma: 'adelphos' },
    { surface: 'brothers', lemma: 'adelphos' },
    { surface: 'judged', lemma: 'krisis' },
  ],
  10: [
    { surface: 'brethren', lemma: 'adelphos' },
    { surface: 'brothers', lemma: 'adelphos' },
    { surface: 'prophets', lemma: 'prophetes', contextual:
      'James 5:10 invokes the prophets as the working models of ὑπομονή — they spoke God\'s word and bore the suffering that followed. Their endurance, not their oratory, is the example.' },
    { surface: 'patience', lemma: 'makrothumia' },
    { surface: 'Lord', lemma: 'kurios' },
  ],
  11: [
    { surface: 'steadfast', lemma: 'hupomone' },
    { surface: 'endured', lemma: 'hupomone', contextual:
      'ὑπομονή closes the inclusio that opened in 1:3–4. The whole letter is bracketed by this word — endurance under weight is James\'s opening counsel and his final reassurance.' },
    { surface: 'Lord', lemma: 'kurios' },
  ],
  12: [
    { surface: 'brethren', lemma: 'adelphos' },
    { surface: 'brothers', lemma: 'adelphos' },
    { surface: 'swear', lemma: 'omnyo', contextual:
      'James 5:12 echoes Jesus (Mt 5:33–37). The first-century world was awash in graded oaths used to evade commitment. James calls for the speech that needs no scaffolding.' },
    { surface: 'oath', lemma: 'horkos' },
    { surface: 'judgment', lemma: 'krisis' },
  ],
  13: [
    { surface: 'pray', lemma: 'proseuchomai', contextual:
      'James 5:13–18 contains the densest prayer-vocabulary in the NT epistles — seven prayer-words in six verses. Prayer is named as the believer\'s response to every condition.' },
  ],
  14: [
    { surface: 'sick', lemma: 'astheneo', contextual:
      'ἀσθενῶν is most naturally read as the physically ill — but the wider NT range includes spiritual weakness, so the elder\'s ministry is not strictly limited to the bedridden.' },
    { surface: 'pray', lemma: 'proseuchomai' },
    { surface: 'anointing', lemma: 'aleipho', contextual:
      'James uses ἀλείφω, not χρίω — pastoral / medicinal, not coronation. Olive oil in the first century was both medicine and sign; the act is sacramental prayer, not magical formula.' },
    { surface: 'oil', lemma: 'elaion' },
    { surface: 'Lord', lemma: 'kurios' },
  ],
  15: [
    { surface: 'prayer', lemma: 'euche', contextual:
      'εὐχή can mean prayer or vow — fittingly, since this prayer is bound to elders, oil, and community accountability. Not a private petition but a covenantal act.' },
    { surface: 'faith', lemma: 'pistis' },
    { surface: 'sick', lemma: 'astheneo' },
    { surface: 'Lord', lemma: 'kurios' },
    { surface: 'sins', lemma: 'hamartia' },
  ],
  16: [
    { surface: 'confess', lemma: 'exomologeo', contextual:
      'ἐξομολογέω — out-loud, thorough, mutual confession, not silent self-acknowledgement. The ἐξ- intensifier and middle voice are deliberate.' },
    { surface: 'sins', lemma: 'hamartia' },
    { surface: 'pray', lemma: 'proseuchomai' },
    { surface: 'healed', lemma: 'iaomai', contextual:
      'ἰαθῆτε — the verb is deliberately broader than physical cure. It ranges across body, conscience, and broken relationship. Healing here is whole-person restoration.' },
    { surface: 'righteous', lemma: 'dikaiosune' },
  ],
  17: [
    { surface: 'prayed', lemma: 'proseuchomai' },
  ],
  18: [
    { surface: 'prayed', lemma: 'proseuchomai' },
    { surface: 'rain', lemma: 'huetos', contextual:
      'Palestinian agriculture depended on early and late rains. Both are named in 5:7. Rain is covenant blessing, withheld for covenant breach — Elijah\'s prayer is covenantal litigation, not magic.' },
    { surface: 'fruit', lemma: 'karpos' },
  ],
  19: [
    { surface: 'brethren', lemma: 'adelphos' },
    { surface: 'brothers', lemma: 'adelphos' },
    { surface: 'wanders', lemma: 'planao', contextual:
      'πλανάω is the verb behind "planet" — the wandering star, opposite of fixed. James closes the letter with this image: the community\'s task is to bring back the one who wanders.' },
  ],
  20: [
    { surface: 'wandering', lemma: 'planao' },
    { surface: 'sinner', lemma: 'hamartia' },
    { surface: 'death', lemma: 'thanatos', contextual:
      'James ends where the gestation chain of 1:15 ended — at θάνατος. But here θάνατος is what restoration prevents. The letter closes by reversing its opening warning.' },
    { surface: 'sins', lemma: 'hamartia' },
  ],
};

// James 5's spine: the patience-pair (μακροθυμία toward people, ὑπομονή
// toward circumstances — the latter closing the 1:3–4 inclusio) and the
// eschatological anchor of the παρουσία that gives waiting its purpose.
const THEME_LEMMAS = ['hupomone', 'makrothumia', 'parousia'];

export const JAMES_5_ALIGNMENT: ChapterAlignment = {
  bookId: 59,
  book: 'James',
  chapter: 5,
  version: 'ESV',
  verses: VERSES,
  lexicon: LEXICON,
  themeLemmas: THEME_LEMMAS,
};
