import { ChapterAlignment } from './types';
import { LEXICON } from './lemmas';

// ─────────────────────────────────────────────────────────────────────────
// James 2 — favoritism, the royal law, mercy over judgment, faith + works.
// Surface forms authored against the ESV text.
// ─────────────────────────────────────────────────────────────────────────

const VERSES: ChapterAlignment['verses'] = {
  1: [
    { surface: 'brothers', lemma: 'adelphos' },
    { surface: 'brethren', lemma: 'adelphos' },
    { surface: 'partiality', lemma: 'prosopolempsia', contextual:
      'προσωπολημψία literally means "face-receiving" — a Christian coinage from a Hebrew idiom. James charges that judging by face/status is incompatible with allegiance to the glorious Lord.' },
    { surface: 'favoritism', lemma: 'prosopolempsia' },
    { surface: 'faith', lemma: 'pistis' },
    { surface: 'Lord', lemma: 'kyrios' },
  ],
  2: [
    { surface: 'assembly', lemma: 'synagoge', contextual:
      'James calls the Christian gathering a συναγωγή — one of the earliest indicators of the Jewish-Christian register of the letter. The vocabulary still belongs to the Jewish covenantal world.' },
    { surface: 'gold ring', lemma: 'chrysodaktylios', contextual:
      'χρυσοδακτύλιος is a hapax — "gold-ringed." In Roman society this signaled equestrian rank. James paints the visitor in status-iconography and dares the assembly to seat him by it.' },
  ],
  5: [
    { surface: 'brethren', lemma: 'adelphos' },
    { surface: 'brothers', lemma: 'adelphos' },
    { surface: 'poor', lemma: 'ptochos', contextual:
      'πτωχούς — the beggarly poor, not the working-poor (πενιχρός). The same LXX word for the anawim, YHWH\'s poor ones whom God chooses.' },
    { surface: 'faith', lemma: 'pistis' },
    { surface: 'love', lemma: 'agapao' },
  ],
  6: [
    { surface: 'poor', lemma: 'ptochos' },
    { surface: 'rich', lemma: 'plousios' },
  ],
  8: [
    { surface: 'royal', lemma: 'basilikos', contextual:
      'νόμος βασιλικός — "royal law." Either the law issued by the King, the king-quality summary of the whole Torah, or both. Love of neighbor is named as the Torah\'s crowning command.' },
    { surface: 'law', lemma: 'nomos' },
    { surface: 'love', lemma: 'agapao' },
  ],
  9: [
    { surface: 'partiality', lemma: 'prosopolempsia' },
    { surface: 'favoritism', lemma: 'prosopolempsia' },
    { surface: 'law', lemma: 'nomos' },
    { surface: 'sin', lemma: 'hamartia' },
  ],
  10: [
    { surface: 'law', lemma: 'nomos', contextual:
      'For James, νόμος is a unified whole — break one ἐντολή, break all. The Torah is not a checklist of separable rules but the moral architecture of a single covenant.' },
  ],
  11: [
    { surface: 'law', lemma: 'nomos' },
  ],
  12: [
    { surface: 'law', lemma: 'nomos' },
    { surface: 'liberty', lemma: 'eleutheria', contextual:
      'James\'s "law of liberty" (1:25; 2:12) is not freedom from law but freedom in it — a heart so reshaped that obedience is freely given, not extracted.' },
  ],
  13: [
    { surface: 'judgment', lemma: 'krisis', contextual:
      'James sets ἔλεος (mercy) and κρίσις (judgment) in a contest mercy wins — not because justice fails, but because in Christ judgment is satisfied and mercy released.' },
    { surface: 'mercy', lemma: 'eleos', contextual:
      'ἔλεος in LXX often translates חֶסֶד — covenant loyalty in action. James makes mercy the defining mark of the believer; its absence is the mark of judgment.' },
  ],
  14: [
    { surface: 'brethren', lemma: 'adelphos' },
    { surface: 'brothers', lemma: 'adelphos' },
    { surface: 'faith', lemma: 'pistis', contextual:
      'James does not deny justification by πίστις; he denies that a πίστις producing no ἔργα is the same πίστις that justifies. Demons in v19 "believe" without pistis-trust.' },
    { surface: 'works', lemma: 'ergon' },
  ],
  15: [
    { surface: 'brother', lemma: 'adelphos' },
    { surface: 'sister', lemma: 'adelphos' },
  ],
  17: [
    { surface: 'faith', lemma: 'pistis' },
    { surface: 'works', lemma: 'ergon' },
    { surface: 'dead', lemma: 'nekros', contextual:
      'νεκρά — not "weak faith" or "young faith" but corpse-faith. The metaphor is brutally biological: a body without breath is not asleep, it is dead.' },
  ],
  18: [
    { surface: 'faith', lemma: 'pistis' },
    { surface: 'works', lemma: 'ergon' },
  ],
  19: [
    { surface: 'believe', lemma: 'pistis', contextual:
      'James says even the δαιμόνια "believe" — and shudder. Belief as bare cognitive assent is not pistis-trust. The demons confess what they do not entrust themselves to.' },
  ],
  20: [
    { surface: 'faith', lemma: 'pistis' },
    { surface: 'works', lemma: 'ergon' },
    { surface: 'dead', lemma: 'nekros' },
  ],
  21: [
    { surface: 'justified', lemma: 'dikaioo', contextual:
      'Paul (Rom 4) uses δικαιόω forensically — God declares the sinner righteous by faith. James (here) uses the same verb of the visible vindication of that faith by deeds. Calvin: faith alone justifies, but the faith that justifies is not alone.' },
    { surface: 'works', lemma: 'ergon' },
  ],
  22: [
    { surface: 'faith', lemma: 'pistis' },
    { surface: 'works', lemma: 'ergon' },
  ],
  23: [
    { surface: 'believed', lemma: 'pistis' },
    { surface: 'righteousness', lemma: 'dikaiosyne' },
  ],
  24: [
    { surface: 'justified', lemma: 'dikaioo' },
    { surface: 'works', lemma: 'ergon' },
    { surface: 'faith', lemma: 'pistis' },
  ],
  25: [
    { surface: 'justified', lemma: 'dikaioo' },
    { surface: 'works', lemma: 'ergon' },
  ],
  26: [
    { surface: 'faith', lemma: 'pistis' },
    { surface: 'works', lemma: 'ergon' },
    { surface: 'dead', lemma: 'nekros' },
  ],
};

// James 2's spine: the faith-vs-works debate (πίστις + ἔργον — chapter's
// central argument) and the opening problem of προσωπολημψία that the
// argument is launched to correct.
const THEME_LEMMAS = ['pistis', 'ergon', 'prosopolempsia'];

export const JAMES_2_ALIGNMENT: ChapterAlignment = {
  bookId: 59,
  book: 'James',
  chapter: 2,
  version: 'ESV',
  verses: VERSES,
  lexicon: LEXICON,
  themeLemmas: THEME_LEMMAS,
};
