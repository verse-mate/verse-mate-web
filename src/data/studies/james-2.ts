import { InductiveStudy } from './types';

// Precept-method inductive study for James 2.
// Source: user's James_2_Precept_Study.pdf — restructured into the 9-step
// observation + interpretation movements + application format.

export const JAMES_2_STUDY: InductiveStudy = {
  bookId: 59,
  bookName: 'James',
  chapter: 2,
  title: 'James 2',
  subtitle: 'Faith Working Through Impartial Love',
  themeOneLine: 'Living faith displays itself in impartial mercy and active works.',
  steps: [
    {
      number: 1,
      kind: 'bullets',
      title: 'Begin with prayer',
      summary: "Apart from the Holy Spirit's illumination this is just a method.",
      intro: 'Before reading James 2, ask the Holy Spirit to expose where favoritism and dead orthodoxy still live in your own heart. Pray with three focuses:',
      items: [
        { tag: 'POSTURE', text: 'A teachable heart willing to **see** the assembly through Christ\'s eyes, not through worldly distinctions.' },
        { tag: 'EYES', text: 'Awareness of where your faith makes claims your works have not yet backed up.' },
        { tag: 'WILL', text: 'Willingness to act on whatever this chapter exposes — toward the poor, toward the rich, and toward the brother in need (2:15-16).' },
      ],
      note: "James 2 is the chapter that drove Luther to call this letter 'an epistle of straw.' Read it on its own terms — not against Paul, but as the pastoral test that proves your faith is living.",
    },
    {
      number: 2,
      kind: 'qa',
      title: "Ask the 5 W's and an H",
      summary: 'Setting the table — author, audience, occasion.',
      items: [
        { tag: 'WHO', q: 'Who are the chapter\'s two human exemplars?', a: 'Abraham (2:21-24) and Rahab (2:25) — Jewish patriarch and Gentile prostitute, the two ends of the social and ethnic spectrum, both vindicated by what their faith DID. Father and outsider, both justified by works that flowed from real belief.' },
        { tag: 'TO WHOM', q: 'Whom does James address in this chapter?', a: '"My brethren" (2:1, 14) — the assembly that has begun showing partiality. The chapter names two specific addressees: the church seating the poor "stand over there" (2:3) and the one who says "Go in peace, be warmed and filled" (2:16) but gives nothing.' },
        { tag: 'WHEN', q: 'At what point in the letter\'s argument are we?', a: 'Directly after 1:22-27, where James commanded "be doers of the word" and defined pure religion as visiting orphans and widows and remaining unstained from the world. Chapter 2 is the FIRST major test case of doer-faith — partiality is the failure, mercy is the proof.' },
        { tag: 'WHERE', q: 'Where does the chapter set its scenes?', a: 'The *synagōgē* (2:2 — the Jewish-Christian assembly), the courts (2:6) where the rich oppress and drag believers, the household scene (2:15-16) where a brother lacks clothing and food, and Israel\'s history (Abraham at Moriah, Rahab at Jericho). Real settings, real bodies.' },
        { tag: 'WHY', q: 'What problem is the chapter solving?', a: 'The fissure between profession and practice. Brothers are professing faith in "our glorious Lord Jesus Christ" while showing partiality to wealthy visitors and turning away the destitute. The chapter\'s diagnostic: faith without works is dead (2:17, 26). James is not opposing Paul on justification; he is exposing a faith that produces nothing as no faith at all.' },
        { tag: 'HOW', q: 'How does the chapter build its argument?', a: 'Two test cases (assembly partiality 2:1-13; empty profession 2:14-26) bracketing two Old Testament vindications (Abraham 2:21-24; Rahab 2:25). Movement: concrete failure → diagnostic principle → biblical proof. Even the demons believe and shudder (2:19) — orthodox doctrine alone is not the test.' },
      ],
    },
    {
      number: 3,
      kind: 'keywords',
      title: 'Mark key words and phrases',
      summary: "Repeated words carry the author's purpose. Counting them shows what James is fixing in your mind.",
      inventory: [
        { word: 'faith', greek: 'pistis', count: 16, verses: '2:1, 5, 14 (×2), 17, 18 (×3), 20, 22 (×2), 23, 24, 26', definition: "Settled trust, firm reliance, conviction. Chapter 2's central question: is the faith one claims a living, active trust or merely intellectual assent? (Even demons believe — 2:19.)" },
        { word: 'works / deeds', greek: 'erga / poieo', count: 12, verses: '2:14, 17, 18 (×3), 20, 21, 22 (×2), 24, 25, 26', definition: 'Visible actions; the deeds that flow from faith. Not the meritorious works Paul rejects (Romans 4) but the obedient works Paul commends (Ephesians 2:10).' },
        { word: 'law', greek: 'nomos', count: 5, verses: '2:8, 9, 10, 11, 12', definition: "Law, principle. James uses it of the Mosaic law (2:8-11) and of the unified moral standard of God's character that lies behind it." },
        { word: 'brethren', greek: 'adelphoi', count: 4, verses: '2:1, 5, 14, 15', definition: "Fellow believers. James uses the family address with particular force in chapter 2, where the assembly's partiality wounds family unity." },
        { word: 'justified', greek: 'dikaioo', count: 3, verses: '2:21, 24, 25', definition: "To be declared righteous; to be vindicated, shown to be right. Paul uses the same word of the believer's position before God by faith alone; James uses it of the visible vindication of that faith by deeds. Calvin: faith alone justifies, but the faith that justifies is not alone." },
        { word: 'partiality / favoritism', greek: 'prosopolempsia', count: 2, verses: '2:1, 9', definition: 'Literally face-receiving — judging by external appearance, status, or wealth. Probably coined from a Hebrew idiom; appears only in Christian Greek literature.' },
        { word: 'mercy / merciless', greek: 'eleos / aneleos', count: 2, verses: '2:13', definition: "Compassion, kindness shown to the unworthy. James 2:13 makes mercy the believer's defining mark — and the absence of it the mark of judgment." },
      ],
    },
    {
      number: 4,
      kind: 'lists',
      title: 'Make lists',
      summary: '"What I learn about ___" — extract truths from each marked word.',
      lists: [
        {
          title: 'What James 2 teaches about God',
          columns: ['Verse', 'Truth'],
          rows: [
            { ref: '2:1', truth: 'Our glorious Lord Jesus Christ — the standard against which favoritism is measured.' },
            { ref: '2:5', truth: 'Chose the poor of this world to be rich in faith and heirs of the kingdom.' },
            { ref: '2:11', truth: 'The lawgiver behind both "Do not commit adultery" and "Do not commit murder."' },
            { ref: '2:13', truth: 'Mercy in His judgment triumphs over judgment.' },
            { ref: '2:19', truth: 'God is one — the Shema (Deuteronomy 6:4) confessed even by demons.' },
            { ref: '2:23', truth: 'Called Abraham His friend — covenantal intimacy as the goal of faith.' },
          ],
        },
        {
          title: 'What James 2 teaches about faith and works',
          columns: ['Verse', 'Truth'],
          rows: [
            { ref: '2:14', truth: 'Faith without works is asked: "Can that faith save him?" (rhetorical — no).' },
            { ref: '2:17', truth: 'Faith without works is **dead**, being by itself.' },
            { ref: '2:19', truth: 'Demons believe and shudder — bare orthodox assent is not saving faith.' },
            { ref: '2:20', truth: 'Faith without works is **useless** (literally idle, inactive).' },
            { ref: '2:22', truth: 'Faith and works cooperate; works **perfect** (complete, mature) faith.' },
            { ref: '2:24', truth: 'A man is justified by works and **not by faith alone**.' },
            { ref: '2:26', truth: 'Faith without works is dead, like a body without the spirit.' },
          ],
        },
      ],
    },
    {
      number: 5,
      kind: 'contrasts',
      title: 'Watch for contrasts and comparisons',
      summary: 'Highly descriptive language James uses to make a point memorable.',
      items: [
        { verses: '2:2-4', type: 'Contrast', pairing: 'Rich man in fine clothes ↔ poor man in dirty clothes — the assembly\'s evil distinction.' },
        { verses: '2:5-7', type: 'Contrast', pairing: 'God chose the poor ↔ the rich oppress and blaspheme the fair name.' },
        { verses: '2:8-9', type: 'Contrast', pairing: 'Fulfilling the royal law ↔ committing sin via partiality.' },
        { verses: '2:10-11', type: 'Contrast', pairing: 'Whole law as integrated unit — stumbling in one point makes one guilty of all.' },
        { verses: '2:13', type: 'Contrast', pairing: 'Merciless judgment for the merciless ↔ mercy triumphs over judgment.' },
        { verses: '2:15-16', type: 'Contrast', pairing: '"Be warmed and filled" without provision = empty faith.' },
        { verses: '2:17-18', type: 'Contrast', pairing: 'Faith without works ↔ faith demonstrated by works.' },
        { verses: '2:19', type: 'Comparison', pairing: 'Demons believe and shudder — bare assent is not saving faith.' },
        { verses: '2:21-25', type: 'Contrast', pairing: 'Abraham (Genesis 15 + 22) ↔ Rahab (Joshua 2) — faith demonstrated by deed.' },
        { verses: '2:26', type: 'Comparison', pairing: 'Body without the spirit is dead, so faith without works is dead.' },
      ],
    },
    {
      number: 6,
      kind: 'bullets',
      title: 'Note expressions of time',
      summary: 'James 2 is dominated by hypothetical conditionals — "if/then" cases that name typical, recurring situations.',
      items: [
        { tag: '2:2', text: '"*if* a man comes into your assembly with a gold ring" — typical scenario, not one-off.' },
        { tag: '2:8-9', text: '"*if*… *if*…" — fulfilling royal law vs. showing partiality, present continuative.' },
        { tag: '2:14', text: '"*if* someone says he has faith but he has no works" — the empty-profession test case.' },
        { tag: '2:15', text: '"*if* a brother or sister is without clothing and in need of daily food" — concrete present need.' },
      ],
      note: 'The "if" structure is rhetorical: each scenario is presented as a test the reader must answer about their own assembly and their own faith.',
    },
    {
      number: 7,
      kind: 'bullets',
      title: 'Mark geographic locations',
      summary: 'Where events take place anchors the social and historical setting.',
      items: [
        { tag: '2:2', text: '**your assembly** (Greek *συναγωγή*, *synagōgē*) — the Jewish-Christian gathering. The only NT use of *synagōgē* for a Christian congregation is here.' },
        { tag: '2:6', text: '**court** — the Roman judicial venue where the rich oppress and "personally drag you" (cf. Acts 16:19).' },
      ],
      note: 'James writes into a community that meets in a *synagōgē*-style assembly while being economically pressured by the same wealthy class who blaspheme Christ\'s name (2:7).',
    },
    {
      number: 8,
      kind: 'bullets',
      title: 'Mark terms of conclusion',
      summary: 'Pivots that signal a summary or inference.',
      items: [
        { tag: '2:12', text: '**"So speak and so act"** — pivot from the law-argument to imperative obedience.' },
        { tag: '2:17', text: '**"Even so faith, if it has no works, is dead"** — the chapter\'s first conclusion of the faith-argument.' },
        { tag: '2:24', text: '**"You see that a man is justified by works and not by faith alone"** — the central conclusion James draws from Abraham.' },
        { tag: '2:26', text: '**"For just as the body without the spirit is dead, so also faith without works is dead"** — final, summary conclusion of the chapter.' },
      ],
      note: 'The four conclusions stack into one argument: speak and act → empty faith is dead → works justify the claim of faith → faith without works is dead.',
    },
    {
      number: 9,
      kind: 'segments',
      title: 'Identify the chapter theme',
      summary: "Center on the main person/event/teaching; express briefly using the text's own words.",
      themeHeadline: 'Faith without works is dead. Faith with works is alive — and friend of God.',
      segments: [
        {
          title: 'Where this chapter sits in the letter',
          body: 'James 1:27 defined "pure and undefiled religion" as visiting orphans and widows and remaining unstained by the world. Chapter 2 picks up exactly there: how can a person of living faith favor the wealthy assembly visitor over the poor one? The chapter takes the *doer-of-the-word* command of 1:22 and makes it specific — first toward the poor brother in your assembly (2:1-13), then toward the cold and hungry brother at your door (2:14-17), then in the larger doctrinal claim that faith without works is **dead** (2:18-26). The chapter is the doctrinal core of the letter — and the most quoted passage in the Reformation-era debate on faith and works.',
        },
        {
          title: 'Two claims to faith',
          body: 'James presents two competing claims, both verbal, both confessionally orthodox. The first: someone *says* he has faith (2:14). The second: someone *believes* God is one (2:19) — the Shema of Deuteronomy 6:4, the central confession of Israel. Both claims pass a doctrinal-test card. Both fail the test that James actually administers: visible works of mercy. The chapter\'s diagnostic question is not *what do you confess?* but *what does your confession produce?* That is the question every chapter of the letter, in different vocabulary, comes back to.',
        },
        {
          title: 'Path A — Living faith',
          body: 'Living faith is **shown by works**. Two case studies prove the principle. **Abraham** (2:21-23): justified by works when he offered Isaac (Genesis 22), which fulfilled the faith already counted as righteousness in Genesis 15:6 *decades earlier*. **Rahab** (2:25): the Gentile outsider whose first-recorded faith expressed itself immediately in costly obedience (Joshua 2). Two case studies, one principle: living faith *acts*. Faith and works are not in tension; they are one organism — body and spirit (2:26). The reward of living faith is the title **friend of God** (2:23) — the same title given to Abraham in 2 Chronicles 20:7 and Isaiah 41:8.',
        },
        {
          title: 'Path B — Dead faith',
          body: 'Dead faith is faith *without works*. It speaks pious words to the cold and hungry without acting — *"go in peace, be warmed and be filled"* (2:16) — and changes nothing. It confesses the Shema while **shuddering with the demons** (2:19). The Greek word *phrissousin* (shudder) is graphic — *the hair stands on end*. Orthodox doctrinal assent that produces no obedience is not saving faith; it is **demonic faith**. Three times James calls this faith **dead** (2:17, 26) and **useless** (*argē*, idle, 2:20). The vocabulary is deliberate. Dead faith is not weak faith; it is *no faith at all* — only its outline.',
        },
        {
          title: 'The bridge — the royal law and mercy',
          body: 'What integrates the chapter is the **royal law** (2:8, *nomos basilikos*) — Leviticus 19:18, *love your neighbor as yourself*, which Jesus called "the second [great commandment], like" the first (Matthew 22:39). Not a new law; the integrating principle of the whole. **Mercy** is its operating expression. James 2:13 — *mercy triumphs over judgment* — is both gospel comfort (we receive mercy) and gospel command (we extend it). The link runs straight from receiving mercy to giving it: a person who has been forgiven much loves much (Luke 7:47). Tim Keller (*Generous Justice*, 2010) draws the line directly: mercy is not a moral feature added to faith — it flows from having received it.',
        },
        {
          title: 'Reading James 2 alongside Paul',
          body: '*Dikaioō* ("justified," 2:21, 24, 25) is the same word Paul uses in Romans 3:28 — and the Reformation took 500 years to settle the apparent tension. The orthodox resolution (Augustine, Calvin, Owen, Edwards, Moo, Carson): **Paul** uses *dikaioō* of the believer\'s position before God at conversion — forensic, on the basis of Christ\'s righteousness imputed by faith alone. **James** uses *dikaioō* of the visible vindication of that faith by deeds, both before observers and at the final judgment (Matthew 12:37). Calvin\'s summary holds: *"It is faith alone which justifies, but the faith which justifies is not alone."* Paul himself links the two in one breath — *saved by grace through faith… for good works which God prepared beforehand* (Ephesians 2:8-10).',
        },
      ],
    },
  ],
  interpretation: {
    intro: 'Interpretation asks what the text *means* — moving from observation (what does it say?) to discerning the author\'s intent in his original context. The movements below trace the chapter\'s argument verse by verse, with Greek illumination where the original word carries weight the English can\'t fully hold.',
    movements: [
      {
        number: 1,
        title: 'Partiality contradicts faith in the Lord of glory',
        range: '2:1-7',
        excerpt: 'Do not hold your faith in our glorious Lord Jesus Christ with an attitude of personal favoritism.',
        body: `James opens with a contradiction so blunt it lands as accusation. You cannot, James says, hold faith in **the Lord of glory** while ranking people by their clothes. The construction is deliberate: Christ's glory is the standard of value. To privilege the well-dressed visitor over the brother in dirty garments is not a small lapse — it is a *theological* failure, because it values the wrong glory.

The scenario James paints (2:2-3) is concrete: a man with a gold ring and fine clothes walks into the assembly; a poor man in dirty clothes walks in too; the assembly seats them according to appearance. James calls this becoming "judges with evil motives" (2:4). The verb is sharp — it positions the partial host as a judge passing sentence on the basis of clothes, when only one Lord of glory has the authority to judge anyone. Then James inverts the world's ranking entirely (2:5): God *chose the poor* of this world to be **rich in faith** and *heirs of the kingdom*. The ones the assembly is humiliating are the ones God has elected and crowned.

The closing argument (2:6-7) is unsparing. The rich whom the assembly is courting are the very class that "oppress you" and "drag you into court" and "blaspheme the fair name by which you have been called." The flattery is not just morally wrong — it is *strategically blind*. Believers are courting their persecutors and shaming their family.

**Cross-references.** Impartiality is foundational across both Testaments: Leviticus 19:15, Deuteronomy 10:17 ("the great God… shows no partiality"), Acts 10:34, Romans 2:11, Ephesians 6:9, 1 Peter 1:17. James's contribution is the most pastoral — the principle pressed against an actual assembly's seating chart.

> **Greek note.** *Prosōpolēmpsia* (favoritism, v.1) — *face-receiving*, built from the Hebrew idiom "to lift the face." Appears only in Christian Greek; James (or Paul, Romans 2:11) coined it.`,
      },
      {
        number: 2,
        title: "The royal law and the unity of God's law",
        range: '2:8-13',
        excerpt: 'If you are fulfilling the royal law according to the Scripture, "YOU SHALL LOVE YOUR NEIGHBOR AS YOURSELF," you are doing well.',
        body: `James now widens the diagnosis from one assembly to the whole moral landscape. Some of his readers might have answered the partiality charge with: *but I keep most of the law*. James cuts that off with a striking claim about the unity of God's law: the same Lawgiver said "do not commit adultery" and "do not commit murder," and so the one who keeps every commandment but stumbles in *one* point has become guilty of the whole (2:10-11). The argument isn't that every sin is equal in severity — it is that **God's law is one organic unit**, expressing one unified character. To violate any part is to dishonor the Lawgiver, not just the rule.

The integrating principle James names is the **royal law** — the law that fits the king's kingdom: *love your neighbor as yourself* (2:8, quoting Leviticus 19:18). This is the same passage Jesus identified as the second great commandment (Matthew 22:39). Partiality is not a marginal failure; it is a *direct* violation of the royal law, because it stops loving the neighbor in front of you. James's line is therefore brutal but accurate: the "I keep most of it" defense is the very mindset that flunks the law's own test for unity.

The capstone (2:12-13) reframes the whole question through the lens of judgment: *speak and act as those who are to be judged by the law of liberty*. The Christian's law is not bondage; it is the law that liberates a redeemed heart to love. And then the principle that should govern every interaction in the assembly: *judgment will be merciless to one who has shown no mercy; mercy triumphs over judgment*. The closing line is gospel — mercy is the mark of those who have received it. Tim Keller (*Generous Justice*, 2010) connects this directly to the cross: mercy is not a moral feature *added to* faith; it flows *from* having received mercy first.

**Cross-references.** Galatians 3:10 makes the same one-sin-equals-all-the-law argument from a different angle. Calvin's summary: *"He who has not obeyed the whole law has not obeyed it at all."* Matthew 5:7 is its reverse: blessed are the merciful, for they shall obtain mercy.

> **Greek note.** *Nomos basilikos* (royal law, v.8) — the *king's law*. *Nomos eleutherias* (law of liberty, v.12) recurs from James 1:25. James cites the Decalogue commands in **LXX order** (Deuteronomy 5:17-18 LXX places adultery before murder) — not the Exodus order most English Bibles use.`,
      },
      {
        number: 3,
        title: 'Faith without works is dead',
        range: '2:14-26',
        excerpt: 'What use is it, my brethren, if someone says he has faith but he has no works? Can that faith save him?',
        body: `The chapter's climactic section opens with a question that anticipates its own answer: *what use is it if someone **says** he has faith but he has no works? Can that faith save him?* The grammatical hint — "**that** faith" — already signals the verdict. The faith James is examining is not faith proper; it is the *claim* to faith, untested by action. His test case (2:15-16) is devastating in its simplicity: a brother or sister is without clothing and daily food, and a believer says *"go in peace, be warmed and be filled"* without giving them anything. The benediction is correct in form. The hands are empty. James calls that benediction **useless** — and the faith that produced it dead.

The chapter then makes its sharpest theological move (2:18-19). An imagined interlocutor offers: *"You have faith and I have works"* — as if faith and works were two equally valid spiritual gifts that different Christians might be assigned. James destroys the dichotomy: *show me your faith without the works, and I will show you my faith **by** my works*. Faith that exists "by itself" cannot be exhibited at all — it is invisible because it is not there. Then the final blow: even **the demons believe** the basic creed (2:19, the Shema, Deuteronomy 6:4 — "God is one"). And they shudder. Orthodox doctrinal assent that produces no obedience is not saving faith. It is *demonic* faith.

The two case studies (2:21-25) drive the principle home with two opposite examples. **Abraham**, the father of faith, was *justified by works* when he offered Isaac (Genesis 22). James is careful to note this happened *after* the foundational reckoning of righteousness in Genesis 15:6 — the obedience of Genesis 22 *fulfilled* (confirmed, publicly displayed) the faith already counted righteous. **Rahab**, the Gentile harlot, was *justified by works* the moment she received the spies and sent them out another way (Joshua 2). Two opposite ends of Israel's history — patriarch and outsider, decades of faith and a single decisive act — and the same verdict: living faith acts. The closing simile (2:26) is the chapter's death certificate: *as the body without the spirit is dead, so faith without works is dead*.

**Reading James alongside Paul.** *Justified* (*dikaioō*) is the same word Paul uses in Romans 3:28 — and the Reformation took 500 years to settle the apparent tension. The orthodox resolution (Augustine, Calvin, Owen, Edwards; modern: Moo, Carson): **Paul** uses *dikaioō* of the believer's *position before God* at conversion — forensic, on the basis of Christ's righteousness imputed by faith alone. **James** uses *dikaioō* of the *vindication of that faith* by visible works — both before observers and at the final judgment (cf. Matthew 12:37). Calvin's summary stands: *"It is faith alone which justifies, but the faith which justifies is not alone."* Paul himself links the two in one breath — *saved by grace through faith… for good works which God prepared beforehand* (Ephesians 2:8-10).

**Cross-references.** Romans 3:28; Romans 4:1-5; Galatians 2:16; Ephesians 2:8-10; Matthew 7:21-23 ("not everyone who says to me, Lord, Lord"); Matthew 25:31-46 (the sheep and goats — separated by what they *did*).

> **Greek note.** *Dikaioō* (justified, vv.21, 24, 25) — declared righteous, vindicated. *Phrissousin* (shudder, v.19) — graphic; *the hair stands on end*. *Argē* (useless, v.20) — *idle*, inactive. *Nekra* (dead, vv.17, 26) — clinically dead, not weak.`,
      },
    ],
  },
  application: {
    intro: 'Application is where Observation and Interpretation become obedience. Each question is paired with a movement of the chapter — read it slowly, answer it honestly, and let it land on a specific situation in your week. Don\'t generalize; name the relationship, the moment, the next step.',
    questions: [
      { range: '2:1-7', question: 'Where in my church or my heart am I extending preferential treatment based on appearance, wealth, education, or social position? What would removing that favoritism cost me — and is that cost evidence that the favoritism is real?' },
      { range: '2:8-13', question: 'Where am I treating one of God\'s commands as light because I keep most of the others? Is mercy something I extend in proportion to how much mercy I have received — or in inverse proportion?' },
      { range: '2:14-17', question: 'Name one practical, visible need around me that my "faith" has not yet acted on. What is the next concrete step this week?' },
      { range: '2:18-20', question: 'If a stranger followed me through this week without hearing me speak, what "works" would they conclude my faith is alive in?' },
      { range: '2:21-26', question: "Where is my faith functioning like Abraham's (an active, costly trust) and where is it functioning like the demons' (orthodox assent without obedience)?" },
    ],
  },
};
