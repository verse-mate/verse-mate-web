import { ChapterAlignment } from './types';
import { LEXICON } from './lemmas';

// ─────────────────────────────────────────────────────────────────────────
// James 1 — verse-by-verse alignment of English surface forms to lemma
// keys, with per-occurrence contextual glosses. Lexicon entries live in
// lemmas.ts (shared across all five chapters).
//
// Surface forms authored against the ESV text returned by /bible/book/59/1.
// Renderer match is case-insensitive at word boundaries. Where the API
// might serve NASB-style alternates (e.g. "endurance" for "steadfastness"),
// both surface forms map to the same lemma.
// ─────────────────────────────────────────────────────────────────────────

const VERSES: ChapterAlignment['verses'] = {
  1: [
    { surface: 'servant', lemma: 'doulos', contextual:
      'James calls himself a δοῦλος — total-ownership "bondservant," not a hired hand. The brother of Jesus opens by ceding any familial claim.' },
    { surface: 'Lord', lemma: 'kyrios' },
  ],
  2: [
    { surface: 'brethren', lemma: 'adelphos' },
    { surface: 'brothers', lemma: 'adelphos' },
    { surface: 'trials', lemma: 'peirasmos', contextual:
      'Here πειρασμοί are external pressures God permits — the same word that flips in v13 to internal enticement toward sin. Outside trials test; inside desire tempts.' },
  ],
  3: [
    { surface: 'testing', lemma: 'dokimion', contextual:
      'The δοκίμιον is the assay — the refining process that proves whether a faith is genuine metal. The verse promises that this assay produces something.' },
    { surface: 'steadfastness', lemma: 'hypomone', contextual:
      'Not Stoic resignation. ὑπομονή is active staying-power under weight — the muscle that bears up and keeps going.' },
    { surface: 'endurance', lemma: 'hypomone', contextual:
      'Not Stoic resignation. ὑπομονή is active staying-power under weight — the muscle that bears up and keeps going.' },
  ],
  4: [
    { surface: 'steadfastness', lemma: 'hypomone' },
    { surface: 'endurance', lemma: 'hypomone' },
    { surface: 'perfect', lemma: 'teleios', contextual:
      'τέλειοι here means "having reached the goal you were made for" — mature, not flawless. James is describing arrival, not moral perfection.' },
    { surface: 'complete', lemma: 'holokleros', contextual:
      'ὁλόκληροι complements τέλειοι: not only mature in goal but whole in every part — no missing piece in the believer\'s formation.' },
  ],
  5: [
    { surface: 'wisdom', lemma: 'sophia', contextual:
      'σοφία here is the Proverbs-style skill in living wisely before God under pressure — not Greek philosophy.' },
    { surface: 'generously', lemma: 'haplos', contextual:
      'ἁπλῶς literally means "singly / without duplicity" — God\'s giving is the antithesis of the διψυχος (two-souled) doubter in v8.' },
  ],
  6: [
    { surface: 'doubting', lemma: 'diakrino', contextual:
      'διακρινόμενος is "being inwardly at odds with oneself" — divided allegiance, not intellectual uncertainty.' },
    { surface: 'doubts', lemma: 'diakrino' },
  ],
  7: [
    { surface: 'Lord', lemma: 'kyrios' },
  ],
  8: [
    { surface: 'double-minded', lemma: 'dipsychos', contextual:
      'δίψυχος — "two-souled." James appears to have coined this word; both NT uses are his. It names sustained divided loyalty, not a moment of indecision.' },
  ],
  9: [
    { surface: 'brother', lemma: 'adelphos' },
    { surface: 'lowly', lemma: 'tapeinos', contextual:
      'ταπεινός in Greek culture was an insult ("base, low-bred"). The LXX inverted it — God lifts the ταπεινός. James draws on the LXX trajectory.' },
  ],
  10: [
    { surface: 'rich', lemma: 'plousios' },
  ],
  11: [
    { surface: 'rich', lemma: 'plousios' },
  ],
  12: [
    { surface: 'trial', lemma: 'peirasmos' },
    { surface: 'crown', lemma: 'stephanos', contextual:
      'στέφανος — the athletic victor\'s wreath, not the royal διάδημα. The metaphor is the endurance runner, not the coronation.' },
    { surface: 'love', lemma: 'agapao' },
  ],
  13: [
    { surface: 'tempted', lemma: 'peirazo', contextual:
      'πειραζόμενος shifts the πειρ- word group from external trial (v2) to internal enticement. James insists this enticement does not come from God.' },
  ],
  14: [
    { surface: 'tempted', lemma: 'peirazo' },
    { surface: 'desire', lemma: 'epithymia', contextual:
      'ἐπιθυμία in James is desire fixed on the wrong object — the inner force that "lures and entices." Not desire-as-such, but desire turned away from God.' },
  ],
  15: [
    { surface: 'desire', lemma: 'epithymia' },
    { surface: 'sin', lemma: 'hamartia', contextual:
      'ἁμαρτία here completes the gestation metaphor — desire conceives, ἁμαρτία is born, θάνατος is the final birth. The chain is biological, not legal.' },
    { surface: 'death', lemma: 'thanatos' },
  ],
  16: [
    { surface: 'brethren', lemma: 'adelphos' },
    { surface: 'brothers', lemma: 'adelphos' },
  ],
  17: [
    { surface: 'perfect', lemma: 'teleios' },
    { surface: 'lights', lemma: 'phos', contextual:
      'τῶν φώτων — "the lights," the heavenly luminaries (sun, moon, stars) that God made and that shift in the sky. The contrast: those lights vary; their Father does not.' },
  ],
  18: [
    { surface: 'word', lemma: 'logos', contextual:
      'λόγῳ ἀληθείας — "the word of truth," James\'s shorthand for the gospel message that effects new birth. Not abstract logos; the announced gospel.' },
    { surface: 'firstfruits', lemma: 'aparche', contextual:
      'ἀπαρχή — LXX firstfruits offering. Believers are the first portion of God\'s new creation, pledge that the rest of the harvest is coming.' },
  ],
  19: [
    { surface: 'brethren', lemma: 'adelphos' },
    { surface: 'brothers', lemma: 'adelphos' },
    { surface: 'anger', lemma: 'orge' },
  ],
  20: [
    { surface: 'anger', lemma: 'orge', contextual:
      'ἀνδρὸς ὀργή — settled human wrath. James doesn\'t condemn all anger (cf. Eph 4:26); he denies that human ὀργή is the engine of God\'s δικαιοσύνη.' },
    { surface: 'righteousness', lemma: 'dikaiosyne', contextual:
      'δικαιοσύνη θεοῦ here keeps the relational/ethical register — the kind of right-with-God-and-neighbor life that human wrath cannot produce.' },
  ],
  21: [
    { surface: 'meekness', lemma: 'prautes', contextual:
      'πραΰτητι — strength under control, not weakness. Classical Greek used πραΰτης of horses broken to the bit: power held in restraint.' },
    { surface: 'implanted', lemma: 'emphytos', contextual:
      'ἔμφυτος — "ingrafted, planted within." Hapax in the NT. Echoes Jeremiah\'s new covenant promise (Jer 31:33): the word written on the heart.' },
    { surface: 'word', lemma: 'logos' },
  ],
  22: [
    { surface: 'doers', lemma: 'poietes', contextual:
      'ποιηταὶ λόγου — "word-makers" in the verb-of-action sense. Modern "doer" understates: a ποιητής shapes a thing into existence.' },
    { surface: 'word', lemma: 'logos' },
    { surface: 'hearers', lemma: 'akroates', contextual:
      'ἀκροατής was the technical term for a lecture-attender in Greek schools — paid to listen but not enrolled. James turns the cultural caricature against the church.' },
  ],
  23: [
    { surface: 'hearer', lemma: 'akroates' },
    { surface: 'word', lemma: 'logos' },
    { surface: 'doer', lemma: 'poietes' },
  ],
  25: [
    { surface: 'perfect', lemma: 'teleios' },
    { surface: 'law', lemma: 'nomos', contextual:
      'νόμον τέλειον τὸν τῆς ἐλευθερίας — the "complete law of liberty." Not Torah-versus-grace; the Torah read through Jesus and lived from the inside out.' },
    { surface: 'liberty', lemma: 'eleutheria', contextual:
      'ἐλευθερία in James is not freedom from law but freedom in the law — a heart so reshaped that obedience is given, not extracted.' },
    { surface: 'hearer', lemma: 'akroates' },
    { surface: 'doer', lemma: 'poietes' },
  ],
  26: [
    { surface: 'religion', lemma: 'threskeia', contextual:
      'θρησκεία is the visible practice of devotion — rituals, fasts, alms. James doesn\'t devalue practice; he tests its honesty by the tongue.' },
  ],
  27: [
    { surface: 'Religion', lemma: 'threskeia', contextual:
      'James relocates θρησκεία: the genuine cult-act is care for the powerless. The "religion" word becomes a justice word.' },
    { surface: 'orphans', lemma: 'orphanos' },
    { surface: 'widows', lemma: 'chera' },
    { surface: 'unstained', lemma: 'aspilos', contextual:
      'ἄσπιλος is sacrificial vocabulary — the unblemished Passover lamb. James applies cultic purity to ordinary life in the world-system.' },
  ],
};

// The doctrinal/literary spine of James 1: endurance-under-trial (ὑπομονή,
// forms the 1:3–4 ↔ 5:11 inclusio), the coined diagnosis of divided loyalty
// (δίψυχος), and the gospel that effects new birth + reshapes obedience
// (λόγος). Other tappable words remain subtle.
const THEME_LEMMAS = ['hypomone', 'dipsychos', 'logos'];

export const JAMES_1_ALIGNMENT: ChapterAlignment = {
  bookId: 59,
  book: 'James',
  chapter: 1,
  version: 'ESV',
  verses: VERSES,
  lexicon: LEXICON,
  themeLemmas: THEME_LEMMAS,
};
