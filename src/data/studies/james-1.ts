import { InductiveStudy } from './types';

// Precept-method inductive study for James 1.
// Step kinds: prose | qa | keywords | lists | contrasts | bullets | segments.
// Scripture references stay as verse numbers; the user reads the actual text
// from the Bible side of the split-view.

export const JAMES_1_STUDY: InductiveStudy = {
  bookId: 59,
  bookName: 'James',
  chapter: 1,
  title: 'James 1',
  subtitle: 'The Precept Method, Verse by Verse',
  themeOneLine: 'Consider it joy in trials; be doers of the word.',
  steps: [
    {
      number: 1,
      kind: 'prose',
      title: 'Begin with prayer',
      summary: "Apart from the Holy Spirit's illumination this is just a method.",
      body: `Before reading James 1, pause and ask the Holy Spirit to open your understanding. Inductive method tools are valuable, but they are means — not the end. Pray for:

- A teachable heart that wants to **see** the text before interpreting it.
- Eyes to notice what James repeats — repetition is the author's highlighter.
- Willingness to obey what you find before you have it all figured out.

The point of the exercise is the closing imperative of the chapter: be a **doer of the word**, not merely a hearer (1:22).`,
    },
    {
      number: 2,
      kind: 'qa',
      title: "Ask the 5 W's and an H",
      summary: 'Setting the table — author, audience, occasion.',
      items: [
        {
          q: 'Who wrote it?',
          a: 'James, the half-brother of Jesus (Matthew 13:55; Galatians 1:19), leader of the Jerusalem church (Acts 15:13; 21:18). He calls himself "a bond-servant of God and of the Lord Jesus Christ" (1:1).',
        },
        {
          q: 'To whom?',
          a: '"The twelve tribes who are dispersed abroad" (1:1) — Jewish believers scattered after the persecution in Acts 8:1 / 11:19.',
        },
        {
          q: 'When?',
          a: 'Likely AD 44–49, one of the earliest New Testament books, written before the Jerusalem Council of Acts 15.',
        },
        {
          q: 'Where (audience)?',
          a: 'Across the Roman world — διασπορά (*diaspora*, 1:1).',
        },
        {
          q: 'Why?',
          a: 'Pastoral exhortation in the wisdom-literature tradition. Steep dependence on Proverbs and the Sermon on the Mount. James writes to scattered believers under social and economic pressure to live out genuine faith under trial.',
        },
        {
          q: 'How (genre)?',
          a: 'Epistle with strong wisdom and proverbial flavor — interpret accordingly. Genuine faith proves itself by works under trial.',
        },
      ],
    },
    {
      number: 3,
      kind: 'keywords',
      title: 'Mark key words and phrases',
      summary: "Repeated words carry the author's purpose. Counting them shows what James is fixing in your mind.",
      legend: [
        { mark: 'Gold bold', appliesTo: 'God / Father / Lord (the Father)', example: 'God (1:5, 13, 17, 20, 27); Father of lights (1:17)' },
        { mark: 'Red bold', appliesTo: 'Jesus / Christ / Lord (the Son)', example: 'Lord Jesus Christ (1:1); Lord (1:7, 12)' },
        { mark: 'Orange underline', appliesTo: 'Author — James', example: 'James (1:1)' },
        { mark: 'Green bold', appliesTo: 'Recipients — brethren / brother', example: 'brethren (1:2, 16, 19); brother (1:9)' },
        { mark: 'Crimson bold', appliesTo: 'trial / testing / tempt / lust / sin / death', example: 'trials, testing, endurance (1:2-4, 12); lust, sin, death (1:13-15)' },
        { mark: 'Blue bold', appliesTo: 'wisdom / ask / faith / doubt / double-minded', example: 'wisdom, ask, faith, doubting, double-minded (1:5-8)' },
        { mark: 'Purple bold', appliesTo: 'word / word of truth / word implanted', example: 'word of truth (1:18); word implanted (1:21); word (1:22, 23)' },
        { mark: 'Teal bold', appliesTo: 'doer / hearer', example: 'doers, hearers (1:22-25)' },
        { mark: 'Green underline', appliesTo: 'Geographic locations', example: 'dispersed abroad (1:1)' },
        { mark: 'Plain underline', appliesTo: 'Terms of conclusion / hinge', example: 'Let no one say (1:13); Therefore (1:21)' },
        { mark: 'Italics', appliesTo: 'Comparisons, similes, metaphors', example: 'like the surf of the sea (1:6); like flowering grass (1:10)' },
      ],
      inventory: [
        { word: 'brethren / beloved brethren', greek: 'ἀδελφοί', count: 3, verses: '1:2, 16, 19' },
        { word: 'trial / testing / tempt', greek: 'πειρασμός / δοκίμιον / πειράζω', count: 6, verses: '1:2, 3, 12, 13×3, 14' },
        { word: 'faith', greek: 'πίστις', count: 2, verses: '1:3, 6' },
        { word: 'endurance / perseverance', greek: 'ὑπομονή', count: 3, verses: '1:3, 4, 12' },
        { word: 'ask', greek: 'αἰτέω', count: 2, verses: '1:5, 6' },
        { word: 'wisdom', greek: 'σοφία', count: 1, verses: '1:5' },
        { word: 'word', greek: 'λόγος', count: 4, verses: '1:18, 21, 22, 23' },
        { word: 'doer / do', greek: 'ποιητής / ποιέω', count: 4, verses: '1:22, 23, 25 (×2)' },
        { word: 'religion / religious', greek: 'θρησκεία / θρῆσκος', count: 3, verses: '1:26 (×2), 27' },
      ],
    },
    {
      number: 4,
      kind: 'lists',
      title: 'Make lists',
      summary: '"What I learn about ___" — extract truths from each marked word.',
      lists: [
        {
          title: 'What James 1 teaches about God',
          columns: ['Verse', 'Truth'],
          rows: [
            { ref: '1:5', truth: 'Gives wisdom to all generously and without reproach.' },
            { ref: '1:12', truth: 'Has promised the crown of life to those who love Him.' },
            { ref: '1:13', truth: 'Cannot be tempted by evil; tempts no one.' },
            { ref: '1:17', truth: 'Every good and perfect gift comes from Him; He is the Father of lights.' },
            { ref: '1:17', truth: 'No variation or shifting shadow with Him — immutable.' },
            { ref: '1:18', truth: 'Brought us forth by the word of truth, by His own will.' },
            { ref: '1:20', truth: 'The anger of man does not achieve His righteousness.' },
            { ref: '1:27', truth: 'Defines pure and undefiled religion.' },
          ],
        },
        {
          title: 'What James 1 teaches about the believer under trial',
          columns: ['Verse', 'Truth'],
          rows: [
            { ref: '1:2', truth: 'Encounters various trials — they are an event, not a surprise.' },
            { ref: '1:3-4', truth: 'Testing produces endurance; endurance produces maturity.' },
            { ref: '1:5', truth: 'May lack wisdom — the prescribed response is to ask God.' },
            { ref: '1:6-8', truth: 'Must ask in faith; the doubter is unstable, double-minded.' },
            { ref: '1:12', truth: 'Will be approved and crowned if they persevere under trial.' },
            { ref: '1:14-15', truth: 'Is tempted from within (own lust), not from God.' },
            { ref: '1:21-22', truth: 'Receives the implanted word and proves it by doing.' },
            { ref: '1:26-27', truth: 'Lives religion through bridled tongue, mercy, and purity.' },
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
        { verses: '1:2', type: 'Contrast', pairing: 'Trials encountered → "consider it all joy" — paradox vs. natural reaction.' },
        { verses: '1:6-8', type: 'Simile', pairing: 'The doubter is like the surf of the sea, driven and tossed by the wind.' },
        { verses: '1:9-11', type: 'Contrast', pairing: 'Humble brother glories in high position; rich man glories in humiliation.' },
        { verses: '1:10-11', type: 'Simile', pairing: 'Rich man is like flowering grass — withered by the scorching sun.' },
        { verses: '1:13-14', type: 'Contrast', pairing: 'God tempts no one ↔ each one tempted by his own lust.' },
        { verses: '1:19-20', type: 'Contrast', pairing: 'Quick to hear ↔ slow to speak / slow to anger.' },
        { verses: '1:22-24', type: 'Simile', pairing: 'Hearer-only is like a man who looks in a mirror and forgets.' },
        { verses: '1:22-25', type: 'Contrast', pairing: 'Forgetful hearer ↔ effectual doer.' },
        { verses: '1:26-27', type: 'Contrast', pairing: 'Worthless religion ↔ pure and undefiled religion.' },
      ],
    },
    {
      number: 6,
      kind: 'bullets',
      title: 'Note expressions of time',
      summary: 'The relationship of events in time often sheds light on meaning.',
      items: [
        { tag: '1:2', text: '"*when* you encounter various trials" — trials are situational events, not moods.' },
        { tag: '1:12', text: '"*once* he has been approved" — endurance precedes the crown of life.' },
        { tag: '1:15', text: '"*then when* lust has conceived" — sin is a timed gestation, not an instant.' },
        { tag: '1:18', text: '"*in the exercise of His will* He brought us forth" — new birth is God-timed.' },
      ],
      note: 'The temporal flow in 1:14-15 is especially careful — James pictures sin as a gestation: lust → conceives → sin → accomplished → death. The sequence is what makes the warning concrete.',
    },
    {
      number: 7,
      kind: 'bullets',
      title: 'Mark geographic locations',
      summary: 'Where events take place anchors the historical setting.',
      items: [
        { tag: '1:1', text: '**dispersed abroad** / διασπορά — the only geographical anchor in the chapter, and it sets the entire pastoral situation.' },
      ],
      note: 'James writes to scattered, displaced Jewish believers across the Roman world. The trials they "encounter" in verse 2 are the trials of displacement, social marginalization, and economic pressure that come with diaspora life.',
    },
    {
      number: 8,
      kind: 'bullets',
      title: 'Mark terms of conclusion',
      summary: '"Therefore," "thus," "for this reason" flag a summary or inference.',
      items: [
        { tag: '1:13', text: '**"Let no one say…"** — closes the wisdom subsection and pivots to the temptation discussion.' },
        { tag: '1:21', text: '**"Therefore, putting aside all filthiness…"** — pivots to the doer-command the chapter has been building toward.' },
        { tag: '1:22', text: '**"But prove yourselves doers of the word"** — the imperative the whole chapter has been moving toward.' },
      ],
      note: 'These hinges show the chapter\'s rhetorical shape: trials (2-12) → temptation\'s true source (13-18) → receive the word, do the word (19-27).',
    },
    {
      number: 9,
      kind: 'segments',
      title: 'Identify the chapter theme',
      summary: "Center on the main person/event/teaching; express briefly using the text's own words.",
      themeHeadline: "Consider it joy in trials; be doers of the word.",
      segments: [
        {
          title: 'Path A — Trial → Endurance → Crown of life',
          body: 'External pressure (1:2) tests faith (1:3) and produces endurance (1:4); the believer who perseveres is approved and receives the crown of life (1:12). Same word *peirasmos*, redemptive trajectory.',
        },
        {
          title: 'Path B — Temptation → Lust → Sin → Death',
          body: 'Internal desire (1:14) entices, conceives (1:15), brings forth sin, and ends in death. The chain is gestational — name the stage, break the chain.',
        },
        {
          title: 'The bridge between the two paths',
          body: 'Wisdom asked of God (1:5) + the word implanted (1:21) + obedience that proves the difference (1:22-25). This is what shifts a circumstance from trajectory B to trajectory A.',
        },
        {
          title: 'The closing portrait',
          body: 'Pure and undefiled religion (1:27) — a bridled tongue, care for orphans and widows in distress, kept unstained by the world. The chapter\'s exhortation lands here.',
        },
      ],
    },
  ],
  interpretation: {
    intro: 'Precept teaches six interpretation guardrails (context rules; full counsel of the Word; Scripture never contradicts Scripture; don\'t base convictions on obscure passages; interpret literally with respect for genre; look for the single meaning). The five movements below apply those guardrails to James 1 verse by verse.',
    movements: [
      {
        number: 1,
        title: 'Trials test and mature faith',
        range: '1:2-4',
        excerpt: 'Consider it all joy when you encounter various trials, knowing that the testing of your faith produces endurance.',
        body: `**Greek illumination.** *Peirasmos* ("trials," v.2) and *peirazomenos* ("tempted," v.13) share a root. James does intentional wordplay: external trials (v.2) test faith for good; internal temptations (v.13) entice toward sin. Same word, two trajectories — the same circumstance can function as either, depending on how the heart receives it.

*Dokimion* ("testing," v.3) is the assayer's word — proving genuineness, like testing metal for impurity by fire (cf. 1 Peter 1:7).

*Hupomonē* ("endurance") is *staying under*, not passive resignation — active steadfastness, remaining faithful while bearing weight.

**Cross-references (full counsel).** Romans 5:3-5 and 1 Peter 1:6-7 give the same trial → endurance → proven character chain. Three apostles, one canonical pattern.`,
      },
      {
        number: 2,
        title: 'Wisdom by faith, not double-mindedness',
        range: '1:5-8',
        excerpt: 'But if any of you lacks wisdom, let him ask of God, who gives to all generously.',
        body: `**Greek illumination.** *Dipsuchos* ("double-minded," v.8) — literally *two-souled*. James appears to have coined this word; it occurs only here and in James 4:8 in the entire New Testament. The two occurrences form a strong internal cross-reference within the letter.

*Diakrinomenos* ("doubting," v.6) — to *judge back-and-forth*, to be divided. Not honest questioning; the divided heart that wants both God's wisdom and the world's path.

**Interpretive caution.** This is not a blank-check prayer promise. Context anchors it: wisdom *for the trial in front of you*. James's wisdom is practical know-how for suffering, not abstract intellectual content.`,
      },
      {
        number: 3,
        title: 'Reversal — humble exalted, rich humbled',
        range: '1:9-11',
        excerpt: 'The brother of humble circumstances is to glory in his high position; the rich man, in his humiliation.',
        body: `Old Testament wisdom DNA — directly echoing Isaiah 40:6-8 ("All flesh is grass, and all its loveliness is like the flower of the field…"). James pastors scattered, often impoverished Jewish believers. Many were tempted to envy the resourced rich who remained settled. James reframes: economic position is the inverse of kingdom position. The humble glory in their high position in Christ; the rich glory in being humbled — because the wealth itself is grass.`,
      },
      {
        number: 4,
        title: 'Origin of temptation; origin of new life',
        range: '1:12-18',
        excerpt: 'Let no one say when he is tempted, "I am being tempted by God"; for God cannot be tempted by evil, and He Himself does not tempt anyone.',
        body: `**The death sequence.** James pictures temptation as a gestation. Sin is never abrupt — it is conceived, carried, and delivered:

\`\`\`
LUST  →  conceives  →  SIN  →  accomplished  →  DEATH
ἐπιθυμία              ἁμαρτία                    θάνατος
\`\`\`

The pastoral application: name the stage your temptation is in, and break the chain there. Desire is not yet sin; conception is the moment of consent; birth is the act; death is the harvest.

**Father of lights (1:17).** *Patēr tōn phōtōn* evokes Genesis 1:14-18 — God as creator of sun, moon, stars. Unlike those luminaries, He has no *parallagē ē tropēs aposkiasma* (variation or shifting shadow). The astronomical metaphor is sharp: stars rise and set, the sun shifts shadows. God doesn't. The implication for v.13 is that the same God who tempts no one cannot be variable in His character toward you in *this* trial.

**Note on an orthodox debate.** James 1:18 — "He brought us forth by the word of truth" — is read by Reformed scholars (Moo, *The Letter of James*, Pillar NT Commentary, 2000) as **regeneration**. Some classical Arminian readers extend the metaphor to general creation. Both stay within orthodoxy. The contextual evidence — "first fruits among His creatures," redemptive language, and the immediate v.21 follow-up about "the word implanted, which is able to save your souls" — favors the regeneration reading.`,
      },
      {
        number: 5,
        title: 'Receive the word, do the word, prove the religion',
        range: '1:19-27',
        excerpt: 'Prove yourselves doers of the word, and not merely hearers who delude themselves.',
        body: `**Greek illumination.** *Emphuton logon* ("the word implanted," v.21) — *engrafted*, planted within, taking root. Echoes Jeremiah 31:33, the new-covenant promise of an internalized law. The word is not merely heard externally; it is planted as a living thing.

*Thrēskeia* ("religion," vv.26-27) — outward cultic observance, ritual practice. James is sharp: external religion that fails to bridle the tongue is *mataios* (worthless, futile). Pure religion, by contrast, is *amiantos* (undefiled) — Levitical purity language pulled into ethics. To stay *aspilon* (unstained — the same word used of Christ as the spotless lamb in 1 Peter 1:19) by the world.

**The mirror.** The chapter's closing image (1:23-25) is the man who looks at himself in a mirror and walks away forgetting what he saw. The Precept method's own Achilles' heel sits here too: a marked-up page has done nothing if the marker walks away unchanged. Observation and Interpretation exist for Application.`,
      },
    ],
  },
  application: {
    intro: 'Application is anchored in 2 Timothy 3:16-17. Once you know what the Word says and what it means, you are obligated before God to live by it. Ask one question per movement — slowly.',
    questions: [
      { range: '1:2-4', question: 'What current trial am I refusing to "consider joy"? Where am I trying to escape it instead of letting endurance do its perfect work?' },
      { range: '1:5-8', question: 'In what specific situation this week do I lack wisdom — and have I actually asked God for it, or only complained about it? Where am I being double-minded — wanting God\'s wisdom but not wanting to obey it?' },
      { range: '1:9-11', question: 'If I\'m of "humble circumstances," do I see my position in Christ as my high position? If I have wealth, where is it making me forget I\'m grass?' },
      { range: '1:13-15', question: 'What temptation am I currently blaming on circumstances or others, when James says it originates in my own lust? At which stage is my current temptation — desire, conception, birth, or death? Where do I need to break the chain?' },
      { range: '1:17-18', question: 'What "good gift" from God am I currently treating as variable, conditional, or absent — when James says the Giver is unshifting?' },
      { range: '1:19-20', question: 'Of the three commands — quick to hear, slow to speak, slow to anger — which is most violated in my life this week? In what specific relationship?' },
      { range: '1:22-25', question: "Name one thing I've heard from Scripture in the last 30 days and not done. What is the next concrete obedience?" },
      { range: '1:26-27', question: 'Where is my tongue revealing that my religion is worthless? Who are the practical "orphans and widows" in my orbit, and what does visiting them look like in my schedule this week?' },
    ],
  },
};
