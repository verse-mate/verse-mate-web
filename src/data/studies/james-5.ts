import { InductiveStudy } from './types';

// Precept-method inductive study for James 5.
// Source: user's James_5_Precept_Study.pdf (+ James Master Key Words PDF for
// transliterated Greek + definitions). Restructured into the 9-step
// observation + interpretation movements + application format.

export const JAMES_5_STUDY: InductiveStudy = {
  bookId: 59,
  bookName: 'James',
  chapter: 5,
  title: 'James 5',
  subtitle: 'Patience, Prayer, and Rescue',
  themeOneLine: 'Wait patiently and pray fervently until the coming of the Lord.',
  steps: [
    {
      number: 1,
      kind: 'bullets',
      title: 'Begin with prayer',
      summary: "Apart from the Holy Spirit's illumination this is just a method.",
      intro: 'Before reading James 5, ask the Holy Spirit to anchor your heart in eschatological hope and turn it toward someone wandering. Pray with three focuses:',
      items: [
        { tag: 'POSTURE', text: 'A teachable heart willing to **wait** — not as stoicism but as the believer\'s answer to a coming Lord.' },
        { tag: 'EYES', text: 'Awareness of the prayer life this chapter calls for: in suffering, in joy, in sickness, in sin.' },
        { tag: 'WILL', text: 'Willingness to act on the closing imperative — turn back the brother who has wandered (5:19-20). The chapter ends without a benediction. Someone is wandering — go.' },
      ],
      note: "James 5 closes the letter where it opened (1:3-4) — the same Greek word for endurance bookends the book. Read it as the pastoral capstone: hear God's judgment of injustice, wait with the farmer's patience, pray with Elijah-faith, rescue the one who has strayed.",
    },
    {
      number: 2,
      kind: 'qa',
      title: "Ask the 5 W's and an H",
      summary: 'Setting the table — author, audience, occasion.',
      items: [
        { tag: 'WHO', q: 'Who are the chapter\'s three audiences?', a: 'The unjust rich (5:1-6) who hoarded wealth and defrauded laborers; the suffering brethren (5:7-12) waiting for the Lord\'s coming; the sick and sin-burdened in the assembly (5:13-18); and any wandering brother (5:19-20). Four addressees in twenty verses — a closing pastoral sweep.' },
        { tag: 'TO WHOM', q: 'Whom does the chapter command directly?', a: 'The "brethren" (5:7, 9, 10, 12, 19) — but now in pastoral closure: patience, integrity of speech, prayer, restoration. The rich of 5:1-6 are addressed in apostrophe — rebuke spoken AS IF to them but written FOR the assembly to overhear and learn from.' },
        { tag: 'WHEN', q: 'When does the chapter set its hope?', a: '"Until the coming of the Lord" (5:7) — the *parousia*. The same "last days" (5:3) where the rich\'s gold is corroding as a witness against them. Eschatological time-frame: hoarded wealth witnesses against you in days that are already ending; the Judge is "standing right at the door" (5:9); the coming is "at hand" (5:8).' },
        { tag: 'WHERE', q: 'Where does the chapter set its scenes?', a: 'Agricultural fields where wages are withheld and laborers cry out (5:4); the assembly where elders pray over the sick and anoint with oil (5:14); Elijah\'s drought-stricken Israel (5:17-18, 1 Kings 17-18); and the wandering brother\'s path that someone must walk to bring him back (5:19-20).' },
        { tag: 'WHY', q: 'What does the chapter\'s ending accomplish?', a: 'It closes the letter the way it opened. The Greek word for endurance (*hupomonē*) bookends James (1:3-4 → 5:11), so the letter\'s last pastoral note returns to its first. Patience is now grounded in the coming of the Lord, sustained by prayer, and exercised in the ministry of restoring a wanderer. The letter ends mid-action.' },
        { tag: 'HOW', q: 'How does the chapter teach?', a: 'Four pastoral movements: woe to the unjust rich (5:1-6) → patience until the coming (5:7-12) → prayer for every season (5:13-18) → the ministry of restoration (5:19-20). The letter ends without a benediction or farewell — an unfinished sentence, almost a commission: someone is wandering; go.' },
      ],
    },
    {
      number: 3,
      kind: 'keywords',
      title: 'Mark key words and phrases',
      summary: "Repeated words carry the author's purpose. Counting them shows what James is fixing in your mind.",
      inventory: [
        { word: 'brethren', greek: 'adelphoi', count: 5, verses: '5:7, 9, 10, 12, 19', definition: 'Fellow believers. James addresses them five times in this final chapter — the densest concentration of family address in the letter, fitting for the closing pastoral exhortation.' },
        { word: 'Lord', greek: 'kurios', count: 8, verses: '5:4, 7, 8, 10, 11 (×2), 14, 15', definition: "Master, sovereign. The Lord of Sabaoth (5:4 — armies), the coming Lord (5:7-8 — parousia), and the merciful Lord (5:11 — Job's outcome) are all in view." },
        { word: 'patience / endurance', greek: 'makrothumia / hupomone', count: 6, verses: '5:7 (×2), 8, 10, 11', definition: 'Makrothumia = literally long-tempered, slow to anger — the patience extended toward people. Hupomone = staying-under, steadfastness — the endurance offered to circumstances. James uses both. Hupomone forms an inclusio with 1:3-4, framing the entire letter.' },
        { word: 'pray / prayer', greek: 'proseuchomai / euche', count: 7, verses: '5:13, 14, 15, 16 (×2), 17, 18', definition: "To pray; prayer. Seven uses in six verses (5:13-18) — the densest concentration of prayer-vocabulary in the New Testament epistles. Prayer is the believer's response in every condition: suffering, joy, illness, sin." },
        { word: 'rich', greek: 'plousios', count: 1, verses: '5:1', definition: 'Wealthy. The single occurrence in chapter 5 opens a six-verse warning to the unjust rich whose hoarded gold testifies against them.' },
        { word: 'coming of the Lord', greek: 'parousia tou kuriou', count: 2, verses: '5:7, 8', definition: "Royal arrival; technical New Testament term for Christ's Second Coming (Matthew 24:3; 1 Thessalonians 4:15). James's basis for patience: the wait has an end and a Person." },
        { word: 'last days', greek: 'eschatais hemerais', count: 1, verses: '5:3', definition: 'Eschatological vocabulary. The early church understood the last days to begin at Pentecost (Acts 2:17, quoting Joel 2). The rich are storing treasure precisely in the age that makes treasure-storing absurd.' },
        { word: 'sick / heal', greek: 'astheneo / iaomai', count: 3, verses: '5:14, 15, 16', definition: 'Astheneo = to be without strength, sick. Iaomai = to heal. The prayer offered in faith will restore the sick (5:15) — a corporate, elder-led ministry of intercession and pastoral care.' },
      ],
    },
    {
      number: 4,
      kind: 'lists',
      title: 'Make lists',
      summary: '"What I learn about ___" — extract truths from each marked word.',
      lists: [
        {
          title: 'What James 5 teaches about God',
          columns: ['Verse', 'Truth'],
          rows: [
            { ref: '5:4', truth: '"Lord of Sabaoth" — Hebrew YHWH Tseva\'ot, the LORD of armies. Hears the wages cried out by the underpaid.' },
            { ref: '5:7-8', truth: 'Has a coming (parousia) that is "near" — eschatological hope frames the patience.' },
            { ref: '5:9', truth: 'The Judge stands "right at the door" — sobering nearness.' },
            { ref: '5:11', truth: "Full of compassion and merciful — His dealings with Job revealed His character." },
            { ref: '5:15', truth: 'Raises up the sick; forgives sins committed.' },
            { ref: '5:17-18', truth: 'Answered Elijah — a man "with a nature like ours" — both to withhold and to give rain.' },
            { ref: '5:20', truth: 'Saves souls from death and covers a multitude of sins through the ministry of restoration.' },
          ],
        },
        {
          title: 'What James 5 teaches about prayer and the waiting believer',
          columns: ['Verse', 'Truth'],
          rows: [
            { ref: '5:7', truth: 'Patience is modeled by the farmer — between early and late rains, not just at harvest.' },
            { ref: '5:11', truth: 'Endurance produces blessedness (cf. 1:12) and reveals the Lord\'s character.' },
            { ref: '5:13', truth: 'Three conditions, three responses: suffering → pray. Cheerful → sing. Sick → call elders.' },
            { ref: '5:14', truth: 'The sick member is to call the elders — a corporate, named-office ministry.' },
            { ref: '5:16', truth: '"The effective prayer of a righteous man can accomplish much" — set up by mutual confession.' },
            { ref: '5:17', truth: "Elijah's effective prayer was the prayer of an ordinary man — the door to the same prayer life is open." },
            { ref: '5:19-20', truth: 'The wandering brother is restored by another brother — there is no solo salvation here.' },
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
        { verses: '5:1-3', type: 'Contrast', pairing: 'Rich storing treasure ↔ in the last days, treasure becomes the testimony against them.' },
        { verses: '5:4', type: 'Contrast', pairing: 'Withheld wages cry out ↔ the Lord of Sabaoth hears.' },
        { verses: '5:7-8', type: 'Comparison', pairing: 'The farmer waits for early and late rains — patience modeled.' },
        { verses: '5:10-11', type: 'Contrast', pairing: 'Prophets / Job — patience and endurance under suffering.' },
        { verses: '5:12', type: 'Contrast', pairing: 'Elaborate oaths ↔ plain yes and no (echo of Matthew 5:34-37).' },
        { verses: '5:13', type: 'Contrast', pairing: 'Suffering → pray · cheerful → sing · sick → call elders. Three conditions, three responses.' },
        { verses: '5:17', type: 'Comparison', pairing: 'Elijah was "a man with a nature like ours" — prayer is not for spiritual elite.' },
        { verses: '5:19-20', type: 'Contrast', pairing: 'Wandering brother ↔ the one who turns him back — covering sins, saving souls.' },
      ],
    },
    {
      number: 6,
      kind: 'bullets',
      title: 'Note expressions of time',
      summary: 'James 5 is saturated with eschatological time markers — the chapter pivots on "the coming of the Lord."',
      items: [
        { tag: '5:1', text: '"weep and howl for your miseries which are **coming** upon you" — eschatological future.' },
        { tag: '5:3', text: '"It is **in the last days** that you have stored up your treasure" — present age, "last days" since Pentecost (Acts 2:17).' },
        { tag: '5:7', text: '"**until** the coming of the Lord" — eschatological terminus for the believer\'s patience.' },
        { tag: '5:8', text: '"the coming of the Lord **is near**" — proximity, urgency.' },
        { tag: '5:7', text: '"**early and late rains**" — Palestine\'s agricultural cycle (October-November and March-April).' },
        { tag: '5:17', text: '"three years and six months" — the duration of Elijah\'s prayed-for drought (1 Kings 17-18).' },
      ],
      note: 'The chapter\'s patience is not stoic — it is **eschatological**. The wait has an end and a Person.',
    },
    {
      number: 7,
      kind: 'bullets',
      title: 'Mark geographic locations',
      summary: 'Where events take place anchors the historical setting.',
      items: [
        { tag: '5:4', text: '**fields** — agricultural workplace where wages are mowed and withheld; the precise injustice Mosaic law forbids (Leviticus 19:13; Deuteronomy 24:14-15).' },
        { tag: '5:14', text: '**the assembly / church** — corporate setting where elders are called to pray over the sick. The earliest NT instance of *elders* as the named office to which the sick should appeal.' },
        { tag: '5:17-18', text: "**the earth** (Israel during Elijah's drought) — \"it did not rain on the earth for three years and six months\" (1 Kings 17-18)." },
      ],
      note: 'Three locations, three pastoral arenas: the workplace where injustice cries out, the assembly where the sick are prayed over, and the Old Testament memory of a praying prophet — all anchoring James\'s closing exhortation.',
    },
    {
      number: 8,
      kind: 'bullets',
      title: 'Mark terms of conclusion',
      summary: 'Pivots that signal a summary or inference.',
      items: [
        { tag: '5:7', text: '**"Therefore be patient, brethren"** — pivot from rebuke of the rich (5:1-6) to exhortation toward the suffering.' },
        { tag: '5:13', text: '**"Is anyone among you suffering? Then he must pray"** — pivot to the prayer-for-every-season section.' },
        { tag: '5:16', text: '**"Therefore, confess your sins to one another"** — application drawn from the prayer of faith.' },
        { tag: '5:19-20', text: "**\"My brethren, if any among you strays from the truth\"** — the letter's final pivot, ending without a benediction." },
      ],
      note: 'The four hinges trace the chapter\'s arc: judgment of injustice → patience of saints → prayer of the church → rescue of the wanderer. The last hinge is the closing of the whole letter.',
    },
    {
      number: 9,
      kind: 'segments',
      title: 'Identify the chapter theme',
      summary: "Center on the main person/event/teaching; express briefly using the text's own words.",
      themeHeadline: 'Wait patiently. Pray fervently. Rescue the wanderer. The Lord is near.',
      segments: [
        {
          title: 'Where this chapter sits in the letter',
          body: 'James 4 ended with the rebuke of arrogant planning: life is a vapor; the right speech is *if the Lord wills*. James 5 opens by pressing that warning harder against the unjust rich (already glimpsed in 2:6-7), then pivots to the answering virtue: **patience until the coming of the Lord**. The chapter closes the letter the way it opened (1:2-4) — *endurance*, the same Greek word *hupomone*, forms an inclusio framing the entire book. The structure of the closing chapter is itself the structure of pastoral ministry: hear God\'s judgment of injustice (5:1-6), wait with the farmer\'s patience (5:7-12), pray with Elijah-faith (5:13-18), and rescue the one who has strayed (5:19-20).',
        },
        {
          title: 'Movement 1 — Woe to the unjust rich (5:1-6)',
          body: 'James opens with **prophetic-rebuke vocabulary** — the same cadence as Amos 8 and Isaiah 5. The rich whose hoarded gold has rusted are storing treasure *in the last days* (5:3) — the very age that makes treasure-storing absurd. The withheld wages of the day-laborer (the precise injustice forbidden in Leviticus 19:13 and Deuteronomy 24:14-15) cry out, and the One who hears is the **Lord of Sabaoth** (5:4) — the Septuagint\'s rendering of *YHWH tseva\'ot*, the LORD of armies. James is the only NT writer outside an Isaiah quotation to use this name. The image inverts the rich man\'s self-understanding: *you have fattened your hearts in a day of slaughter* (5:5) — cattle gorged precisely when the slaughter is imminent.',
        },
        {
          title: 'Movement 2 — Patience until the coming (5:7-12)',
          body: 'The corrective virtue is named with two complementary Greek words. **Makrothumia** (5:7-8, 10) — literally *long-tempered*, slow to anger; the patience extended toward people (also used of God\'s own forbearance, Romans 9:22; 2 Peter 3:9). **Hupomone** (5:11) — *staying-under*, steadfastness; the endurance offered to circumstances (the same word from 1:3-4). James uses both. The farmer\'s patience between the early and late rains models the first; **Job\'s endurance** (5:11) models the second — Job was not patient in the common sense (he complained vigorously) but he stayed under and did not curse God. The chapter\'s eschatological frame is sharp: *the Judge is standing right at the door* (5:9), and *the coming of the Lord (parousia) is near* (5:8). Patience here is not stoic — it is the wait that has an end and a Person.',
        },
        {
          title: 'Movement 3 — Prayer for every season (5:13-18)',
          body: 'Seven occurrences of prayer-vocabulary in six verses — the densest concentration of prayer-vocabulary in the New Testament epistles. Three conditions, three responses: **suffering → pray. Cheerful → sing. Sick → call the elders.** The sickness section names the **elders of the church** (*presbuterous tēs ekklēsias*, 5:14) — the earliest NT instance of *elders* as the named office to which the sick should appeal. Anointing with oil (5:14) is practical, not sacramental — two orthodox readings stand: symbolic (oil sets the sick before the Lord) or medicinal (oil was a primary first-century medicine, cf. Luke 10:34). Mutual confession (5:16) sets up the climactic claim: *the effective prayer of a righteous man can accomplish much*. Then Elijah (5:17): *a man with a nature like ours* — *homoiopathēs*, used only here and in Acts 14:15 — de-romanticized so the door is open to the reader.',
        },
        {
          title: 'Movement 4 — Rescue the wanderer (5:19-20)',
          body: 'The chapter ends in the shortest, most punctual statement of restoration in the New Testament. *If any among you strays from the truth and one turns him back…* (5:19). The Greek word for "strays" is *planēthē* — same root as English *planet*, "wandering" star. The wandering is gradual, not abrupt. The reward of the rescuer is *covering a multitude of sins* (5:20) — direct echo of Proverbs 10:12 (cf. 1 Peter 4:8). The covering is not of the rescuer\'s sins but of the wanderer\'s; the rescuer\'s reward is having *participated* in the covering.',
        },
        {
          title: "Why the letter ends without a benediction",
          body: 'Read James 5:20 and notice what is *not* there. **No "grace and peace."** No closing prayer. No final greeting. The letter that opened with *Greetings* (1:1) ends without one. The omission is rhetorical: James leaves the reader at the threshold of action. Someone is wandering; **go**. Compare Paul\'s letters, which always close with benedictions and personal greetings; James\'s closing is a deliberate cliffhanger. The structure of the whole book is the structure of pastoral ministry — and the last word is not given to the writer but withheld, waiting on the reader to put the pen down and walk to the wandering brother.',
        },
      ],
    },
  ],
  interpretation: {
    intro: 'Interpretation asks what the text *means* — moving from observation (what does it say?) to discerning the author\'s intent in his original context. The movements below trace the chapter\'s argument verse by verse. Where the original Greek changes the shade of an English word, a brief note follows the interpretation as supplement.',
    movements: [
      {
        number: 1,
        title: 'Woe to the unjust rich',
        range: '5:1-6',
        excerpt: 'The pay of the laborers who mowed your fields, and which has been withheld by you, cries out against you; and the outcry of those who did the harvesting has reached the ears of the Lord of Sabaoth.',
        body: `James opens chapter 5 with the most thunderous prophetic denunciation in the New Testament outside the book of Revelation. *Come now, you rich, weep and howl for your miseries which are coming upon you* (5:1). The verb *howl* (*ololuzō*) is onomatopoetic — a wail. James is not warning these rich men; he is *announcing the verdict* that has already fallen on them. The address is not to rich believers in general but to a specific class — the unjust wealthy who have made their fortunes by exploiting the laboring poor, the same class chapter 2 said *oppress you and personally drag you into court* (2:6) and chapter 4 said *boast about your business plans as if you owned tomorrow* (4:13-16). James places himself squarely in the prophetic tradition of Amos, Isaiah, and Malachi.

The accusation has three counts. **First (5:2-3): hoarding.** *Your riches have rotted… your gold and your silver have rusted; and their rust will be a witness against you*. The image is searing — wealth treated as a permanent good rather than a stewardship to deploy *rots*, just as physically as food rots when stored past use. The rust will *eat your flesh like fire*, James says. The very wealth the rich man counts as his security becomes, in the day of judgment, the witness *against* him. James adds an eschatological razor: *it is in the last days that you have stored up your treasure*. The early church understood the *last days* to begin at Pentecost (Acts 2:17, quoting Joel 2). To stockpile treasure now is not just morally wrong — it is **chronologically absurd**, like loading a ship's hold the night before it sinks.

**Second (5:4): withheld wages.** *The pay of the laborers who mowed your fields, and which has been withheld by you, cries out against you*. James reaches directly back to Mosaic legislation (Leviticus 19:13; Deuteronomy 24:14-15) which forbade holding back the day-laborer's wages even one night. The wages, James says, *cry out* — and *the outcry of those who did the harvesting has reached the ears of the Lord of Sabaoth*. The title is shocking. *Sabaoth* is the OT war-name of God: the **LORD of armies / hosts**, used over 250 times by the prophets and almost never elsewhere in the NT. James is invoking the commander of heaven's armies as the One who has heard the cry. The implication is unmistakable: the rich have made themselves military targets of God Himself.

**Third (5:5-6): luxury and condemnation.** *You have lived luxuriously on the earth and led a life of wanton pleasure; you have fattened your hearts in a day of slaughter*. The image is agricultural and violent — cattle gorged on grain precisely when the slaughter is imminent. The rich man thinks he is feasting; James says he is **fattening himself for the kill**. *You have condemned and put to death the righteous man; he does not resist you*. The unresisting righteous one is, at one level, the day-laborer who has no legal recourse; at another level, the typology points to **Christ Himself** (1 Peter 2:23; Acts 7:52). Either way, James names the violence economic exploitation actually is.

**Cross-references.** The prophetic tradition runs strong here — Amos 4:1-3, Amos 8:4-6 (the same exact crime, same denunciation); Malachi 3:5; Isaiah 5:8-10; Jeremiah 22:13-17. Tim Keller (*Generous Justice*, 2010) argues that James 5:1-6 is the New Testament's clearest single statement of the same biblical justice ethic that runs through the entire OT prophetic corpus.

> **Greek note.** *Kyrios sabaōth* (Lord of Sabaoth, v.4) — the Septuagint rendering of YHWH tseva'ot, *the LORD of armies*; outside Romans 9:29 (an Isaiah quotation), James is the only NT writer to use it. *Eschatais hēmerais* (last days, v.3) — the age that began at Pentecost (Acts 2:17). *Ololuzō* (howl, v.1) — onomatopoetic; a wail.`,
      },
      {
        number: 2,
        title: 'Patience until the coming of the Lord',
        range: '5:7-12',
        excerpt: 'Therefore be patient, brethren, until the coming of the Lord. The farmer waits for the precious produce of the soil, being patient about it, until it gets the early and late rains.',
        body: `Verse 7 pivots from prophetic thunder to pastoral tenderness. *Therefore be patient, brethren, until the coming of the Lord*. The *therefore* is not decorative — it draws the line directly from the prior verses. **Because** the Lord of Sabaoth has heard the cry of the oppressed (5:4), and **because** the day of the rich man's slaughter is set (5:5), the believer who is currently being mistreated does not need to engineer his own justice. He waits. The warning to the rich is, paradoxically, the comfort of the poor.

The patience James commands is **agricultural**. *The farmer waits for the precious produce of the soil, being patient about it, until it gets the early and late rains* (5:7). In Palestine the early rains came in October-November (softening soil for sowing) and the late rains in March-April (fattening the grain for harvest). The farmer's patience is not the patience of *waiting for one event* — it is the patience that sustains him through the **entire span** between the two rains, holding his hope through dry months when nothing visible is happening. James's pastoral application is exact: the believer is not waiting for a single moment of vindication; he is enduring the entire stretch of Christian life *between* Pentecost and *parousia*. The harvest is certain; the timing is the Lord's.

The word James uses for *coming* in 5:7-8 is *parousia* — the technical NT term for the **royal arrival** of the King (Matthew 24:3; 1 Thessalonians 4:15; 2 Peter 3:4; 1 John 2:28). The patience James commands is therefore not stoic resolve. It is **eschatological**: it has shape because it has direction. The Judge is not absent; He is *standing right at the door* (5:9). That phrase reorients everything. The believer who knows the Judge is at the threshold does not need to grumble against fellow believers (5:9), because the next move is His.

Verses 10-11 supply two examples. **The prophets** suffered before the believer did, and they are now *blessed* (5:10-11) — Hebrews 11 makes the same case. **Job** (5:11) is named with care. James does not say *the patience of Job* — he says *you have heard of the **endurance** of Job*. The Greek word is *hupomonē*, the same word from James 1:3-4 (*the testing of your faith produces endurance*). Job was famously **not** patient in the common sense; he protested loudly. But he was *enduring* — he stayed under the weight without cursing God. And the outcome of the Lord's dealings with him was that *the Lord is full of compassion and is merciful* (5:11, echoing Exodus 34:6). The promise is the same for the reader.

The chapter's first ethical command lands in 5:12: *do not swear, either by heaven or by earth or with any other oath; but your yes is to be yes, and your no, no*. This is the closest verbal parallel between James and the Sermon on the Mount (Matthew 5:34-37) — James 5:12 is essentially Matthew 5:34-37 in epistolary form. James is not concerned with formal oath-taking in court (cf. Hebrews 6:13-18, where God Himself swears); he is concerned with the **integrity of speech under pressure**. The believer who is tempted to escalate his word with oaths because his plain word has not been trusted should not escalate; he should restore the trust by becoming the man whose plain word is enough.

**Cross-references.** Romans 9:22, 2 Peter 3:9 (God's *makrothumia* — His own long-tempered patience, the model for the believer's). Matthew 24:3, 1 Thessalonians 4:15-18, 2 Peter 3:3-13 (the *parousia*). Job 1-2, 42 (Job's endurance and the merciful outcome). Hebrews 11:32-38 (the prophets as examples). Matthew 5:33-37 (the parallel oath teaching).

> **Greek note.** *Makrothumēsate* (be patient, vv.7, 8, 10) — literally *long-tempered*, slow to anger. *Parousia* (coming, vv.7, 8) — royal arrival; technical NT term for the Second Coming. *Hupomonē* (endurance, v.11) — *staying-under*; same word as James 1:3-4. *Splanchnos kai oiktirmōn* (compassionate and merciful, v.11) — direct echo of Exodus 34:6 LXX.`,
      },
      {
        number: 3,
        title: 'Prayer for every season',
        range: '5:13-18',
        excerpt: 'Is anyone among you suffering? Then he must pray. Is anyone cheerful? He is to sing praises. Is anyone among you sick? Then he must call for the elders of the church.',
        body: `Verses 13-18 contain the densest concentration of prayer-vocabulary in the NT epistles — **seven prayer-words in six verses**. James's pastoral structure is striking in its simplicity: he names three life-conditions and gives the corresponding prayer-response for each. *Is anyone among you suffering? Then he must pray. Is anyone cheerful? He is to sing praises. Is anyone among you sick? Then he must call for the elders of the church*. Prayer is not a special tool for spiritual emergencies; it is the **shape of every season**. Suffering, joy, and illness are different forms of the same posture: a heart turned toward God in the present circumstance.

The third condition gets unusual elaboration (5:14-15) — and the church has debated this passage for two thousand years. *Let him call for the elders of the church, and let them pray over him, anointing him with oil in the name of the Lord*. Two structural points first. The named office is *presbuterous tēs ekklēsias* — *elders of the church*, the earliest NT instance of elders identified as the office to be summoned in sickness. James writes from Jerusalem, where the elder structure was already mature (Acts 15:2, 4, 6, 22-23). The sick believer does not pray alone; the church leadership comes to him.

The anointing with oil holds **two orthodox readings**. **(a) Symbolic**: the oil signifies setting the sick person before the Lord, a sacramental gesture parallel to OT anointings. **(b) Medicinal**: oil was a primary first-century medicine (cf. Luke 10:34, the Good Samaritan pours oil and wine on the wounds), and James is commanding the church to pair prayer with sensible medical care, not as alternatives but as complementary. Both readings stay within orthodox interpretation across the Reformed and patristic traditions. Neither reading supports the later Roman Catholic *extreme unction* — the post-Tridentine practice that reads the oil as **preparation for death** rather than a means toward restoration. James's grammar is unmistakably restorative: *the prayer offered in faith will **restore** the one who is sick, and the Lord will **raise him up***.

The verb *sōzō* (5:15) is double-edged. It can mean physical restoration *or* salvation. The context here is principally physical (it parallels *raise him up*), but James adds the spiritual layer in v.15b: *if he has committed sins, they will be forgiven him*. Mutual confession of sins follows in v.16: *therefore, confess your sins to one another, and pray for one another so that you may be healed*. The *therefore* binds physical healing and spiritual reconciliation together — the same Lord heals both, and they are entangled in the believer's life. James assumes that some illness has spiritual roots (cf. 1 Corinthians 11:30) without claiming all illness does.

The chapter's most extraordinary claim follows: *the effective prayer of a righteous man can accomplish much* (5:16). And then, lest the reader hear *righteous man* and think of someone safely beyond him, James names **Elijah**. *Elijah was a man with a nature like ours* (5:17). The phrase *like ours* (*homoiopathēs*) is used only here and in Acts 14:15. James de-romanticizes Elijah deliberately — the same Elijah who called down fire on Carmel (1 Kings 18) was a man who, three chapters later, asked God to take his life because he was tired and afraid (1 Kings 19:4). If *that* man's prayer shut up the heavens for three and a half years and then opened them again (5:17-18, citing 1 Kings 17-18), then **the prayer of an ordinary believer is not in a different category** from Elijah's. The door is open to the reader. Charles Spurgeon's sermon "Effective Prayer" (Metropolitan Tabernacle Pulpit, vol. 12) preached this point against the perpetual temptation to feel one's prayer life is too small to count. James says it is not.

**Cross-references.** 1 Kings 17-18 (the historical record of Elijah's prayer); 1 Kings 19:4 (Elijah's exhaustion — the *like ours* James names); Acts 4:24-31 (the early church's united prayer); 1 John 5:14-15 (the same confidence in prayer-with-faith); 1 Corinthians 11:30 (the entanglement of sin and illness in the body).

> **Greek note.** *Presbuterous tēs ekklēsias* (elders of the church, v.14) — the named office of pastoral leadership. *Aleipsantes elaiō* (anointing with oil, v.14) — practical or symbolic anointing; not the later sacramental *extreme unction*. *Sōzō* (save / restore, v.15) — physical restoration here, with spiritual overtones in v.15b. *Homoiopathēs* (a man with a nature like ours, v.17) — used only here and Acts 14:15.`,
      },
      {
        number: 4,
        title: 'The ministry of restoration',
        range: '5:19-20',
        excerpt: 'My brethren, if any among you strays from the truth and one turns him back, let him know that he who turns a sinner from the error of his way will save his soul from death and will cover a multitude of sins.',
        body: `The letter ends in two verses that read like a final commission. *My brethren, if any among you strays from the truth and one turns him back, let him know that he who turns a sinner from the error of his way will save his soul from death and will cover a multitude of sins*. James does not soften the closing or decorate it; he hands the reader a task and stops writing.

The straying is *gradual*. The Greek verb is *planēthē* — *to wander, to be led astray*. Same root as English *planet* (wandering star). James is not picturing a believer who repudiates the faith in a single decisive renouncement; he is picturing the slow drift — the small accommodations, the cooled affections, the missed gatherings, the unrepented sin, the tongue that has stopped being bridled (3:1-12), the wisdom that has quietly become *earthly, natural, demonic* (3:15). Wandering is what the chapter has been diagnosing the whole way through. And the whole letter, really. James 1's double-minded man wandered. James 2's faith-without-works wandered. James 3's untamed tongue wandered. James 4's friend-of-the-world wandered. James 5's hoarding rich wandered. The whole epistle has been pastoral *anti-wandering* — and now James entrusts the rescue work to the assembly.

The rescuer's reward is striking. *He who turns a sinner from the error of his way will save his soul from death and will cover a multitude of sins* (5:20). Two questions every reader has asked: whose soul, whose sins? The natural reading — and the one most Reformed commentators take (Moo, Carson, Calvin in his James commentary) — is that **the wanderer's** soul is saved from death and **the wanderer's** sins are covered. The rescuer's reward is having *participated* in the covering, not having his own sins covered by his rescue work (which would tilt toward works-righteousness, the opposite of the gospel logic running through the whole letter, cf. 2:14-26). The phrase *cover a multitude of sins* is direct echo of Proverbs 10:12 (*love covers all transgressions*) — and 1 Peter 4:8 quotes the same Proverb in the same pastoral application. Two apostles, one Old Testament well, one principle: love that pursues a wanderer participates in the covering Christ Himself accomplished.

And then — **the letter ends.** No *grace and peace*. No closing benediction. No final greetings. The book that opened with the single word *Greetings* (1:1) closes without one. The omission is rhetorical. James leaves the reader **at the threshold of action**. Compare Paul's letters, which always close with benedictions and personal greetings; James's closing is a deliberate cliffhanger. The structure of the last sentence becomes the shape of pastoral ministry itself: someone is wandering in your orbit; the letter has ended; **go**.

**Cross-references.** Galatians 6:1 (*restore such a one in a spirit of gentleness, looking to yourself, lest you too be tempted*); Matthew 18:15-17 (the procedure of going to the wandering brother); Luke 15 (the three parables of restoration — the lost sheep, the lost coin, the lost son). Proverbs 10:12 + 1 Peter 4:8 (the OT well James drinks from). Jude 22-23 (a parallel closing call to rescue).

> **Greek note.** *Planēthē* (strays, v.19) — to wander, be led astray; same root as English *planet*. *Kalupsei plēthos hamartiōn* (will cover a multitude of sins, v.20) — direct echo of Proverbs 10:12; cf. 1 Peter 4:8.`,
      },
    ],
  },
  application: {
    intro: 'Application is where Observation and Interpretation become obedience. Each question is paired with a movement of the chapter — read it slowly, answer it honestly, and let it land on a specific situation in your week. Don\'t generalize; name the relationship, the moment, the next step.',
    questions: [
      { range: '5:1-6', question: 'How am I treating those who labor for me — at home, in business, in the gig economy I employ? Am I withholding wages, recognition, or honor that the Lord of Sabaoth has heard cried out?' },
      { range: '5:7-11', question: "In what specific situation am I refusing to wait? What does the farmer's patience — through both the early and late rains — look like for me right now? Where do I need to count Job blessed and stop trying to escape my staying-under?" },
      { range: '5:12', question: 'Where is my "yes" not yes? Where do I reach for elaborate guarantees (promises, oaths, contracts heavy with rhetoric) because my plain word can\'t be trusted?' },
      { range: '5:13', question: 'Of the three conditions — suffering, cheerful, sick — which describes me today? Is my response the one James names — pray, sing, or call the elders?' },
      { range: '5:14-18', question: 'Have I called for the elders for any chronic suffering? Where am I treating Elijah-like prayer as for someone else, when James says he was a man like me?' },
      { range: '5:19-20', question: "Who in my orbit has wandered from truth, and what does the first step toward turning them back look like before the end of this week? The letter ends with this question — answer it before closing this study." },
    ],
  },
};
