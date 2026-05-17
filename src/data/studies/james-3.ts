import { InductiveStudy } from './types';

// Precept-method inductive study for James 3.
// Source: user's James_3_Precept_Study.pdf — restructured into the 9-step
// observation + interpretation movements + application format.

export const JAMES_3_STUDY: InductiveStudy = {
  bookId: 59,
  bookName: 'James',
  chapter: 3,
  title: 'James 3',
  subtitle: 'The Tongue and the Two Wisdoms',
  themeOneLine: 'The tongue reveals which wisdom the heart belongs to.',
  steps: [
    {
      number: 1,
      kind: 'bullets',
      title: 'Begin with prayer',
      summary: "Apart from the Holy Spirit's illumination this is just a method.",
      intro: 'Before reading James 3, ask the Holy Spirit to surface what your tongue has revealed about your heart in the last 48 hours. Pray with three focuses:',
      items: [
        { tag: 'POSTURE', text: 'A teachable heart willing to **see** which wisdom (earthly or from above) is currently directing your speech.' },
        { tag: 'EYES', text: 'Awareness of the small sparks your words have lit — and the fires you are still pretending you didn\'t start.' },
        { tag: 'WILL', text: 'Willingness to ask God for the wisdom from above (per James 1:5) instead of envying what earthly wisdom seems to deliver.' },
      ],
      note: 'James 3 is the chapter that turns the diagnostic from outward action (chapter 2) inward to speech and motive. The same Spirit who illumines the text must be invited to illumine the speaker.',
    },
    {
      number: 2,
      kind: 'qa',
      title: "Ask the 5 W's and an H",
      summary: 'Setting the table — author, audience, occasion.',
      items: [
        { tag: 'WHO', q: 'Who is the chapter\'s primary target within the assembly?', a: 'Teachers and would-be teachers (3:1) — "we will incur a stricter judgment." James includes himself in the "we"; he is a Jerusalem-church elder writing about a discipline he himself bears. The warning then widens to every believer whose tongue reveals which wisdom is operating.' },
        { tag: 'TO WHOM', q: 'Whom does the chapter call to account?', a: 'Anyone who teaches OR whose speech betrays the wisdom-source of their heart. The tongue is the universal diagnostic. The chapter\'s address shifts from "let not many of you become teachers" (3:1) to "who among you is wise and understanding?" (3:13) — a question every believer must answer.' },
        { tag: 'WHEN', q: 'At what stage of self-examination is the reader?', a: 'Past Chapter 1\'s warning that an unbridled tongue makes religion worthless (1:26) and Chapter 2\'s demand to be a doer of the word. Now the diagnostic moves INTERNAL: what kind of wisdom (from above or from below) is producing the speech that your tongue spills?' },
        { tag: 'WHERE', q: 'Where does the chapter locate the tongue\'s fire?', a: '"Set on fire by hell" (3:6, Greek *Geenna* — the Valley of Hinnom south of Jerusalem, the smoking refuse-fire that became Jesus\'s standing image for final judgment). All other "locations" in the chapter (fountain, fig tree, vine, salt water) are similes from the natural world, not geography.' },
        { tag: 'WHY', q: 'What is the chapter exposing?', a: 'That speech is the most reliable test of the wisdom indwelling a person. Two wisdoms exist (3:13-18): from above (pure, peaceable, gentle, reasonable, full of mercy and good fruits, unwavering, without hypocrisy) and from below (earthly, natural, demonic). The tongue is the proof of which one rules — the spring betrays the source.' },
        { tag: 'HOW', q: 'How does the chapter argue?', a: 'Two halves. (1) The tongue is uncontrollable (3:1-12) — proven through three escalating similes: horse bit, ship rudder, fire. (2) The two wisdoms are visible by their fruit (3:13-18) — seven qualities of wisdom from above set against jealousy and selfish ambition, with peacemakers sowing the harvest of righteousness (3:18).' },
      ],
    },
    {
      number: 3,
      kind: 'keywords',
      title: 'Mark key words and phrases',
      summary: "Repeated words carry the author's purpose. Counting them shows what James is fixing in your mind.",
      inventory: [
        { word: 'tongue', greek: 'glossa', count: 5, verses: '3:5, 6 (×2), 8', definition: "Physical tongue, but in James a metonymy for speech and language as a whole. The chapter's central organ — small, unruly, disproportionate in power." },
        { word: 'brethren', greek: 'adelphoi', count: 4, verses: '3:1, 10, 12', definition: 'Fellow believers. James addresses them with this word as he warns about teaching, speech, and bitter rivalry.' },
        { word: 'wisdom / wise', greek: 'sophia / sophos', count: 5, verses: '3:13 (×2), 15, 17', definition: 'Practical, applied skill in living. James 3 is the chapter where the two wisdoms of 1:5 are diagnosed — earthly vs. from above.' },
        { word: 'from above', greek: 'anothen', count: 2, verses: '3:15, 17', definition: 'From above, from heaven. The same word Jesus used to Nicodemus in John 3:3 (born from above / again). James 1:17 introduced the vocabulary; chapter 3 uses it as the test of true wisdom.' },
        { word: 'body', greek: 'soma', count: 3, verses: '3:2, 3, 6', definition: 'Physical body. The tongue is a small part of the body that defiles the entire body (3:6); the bridled tongue means the bridled body (3:2).' },
        { word: 'fire', greek: 'pur / phlogizo', count: 3, verses: '3:5, 6 (×2)', definition: 'Fire; to set on fire, ignite. The tongue is a fire (3:6) — small spark, forest blaze. Fueled, James says, by hell itself.' },
      ],
    },
    {
      number: 4,
      kind: 'lists',
      title: 'Make lists',
      summary: '"What I learn about ___" — extract truths from each marked word.',
      lists: [
        {
          title: 'What James 3 teaches about God',
          columns: ['Verse', 'Truth'],
          rows: [
            { ref: '3:9', truth: 'Our "Lord and Father" — the same God we bless with the same tongue we curse with.' },
            { ref: '3:9', truth: 'Made men in His likeness — cursing image-bearers cuts against God\'s own character.' },
            { ref: '3:15', truth: "The wisdom that doesn't come down from Him is earthly, natural, demonic — implying His wisdom is the alternative source." },
            { ref: '3:17', truth: '"Wisdom from above" — God is the dispenser of wisdom (cf. 1:5).' },
          ],
        },
        {
          title: 'What James 3 teaches about the tongue',
          columns: ['Verse', 'Truth'],
          rows: [
            { ref: '3:2', truth: 'The one who does not stumble in speech is "perfect" (mature) — bridling the tongue is the test of bridling the whole body.' },
            { ref: '3:5', truth: 'Small part of the body, yet boasts great things — like a small spark setting a forest aflame.' },
            { ref: '3:6', truth: 'A fire, "the very world of iniquity," set on fire by hell itself.' },
            { ref: '3:8', truth: '**No human can tame it** — a restless evil, full of deadly poison.' },
            { ref: '3:9-10', truth: 'Capable of both blessing the Lord and cursing image-bearers from the same mouth — a self-contradicting organ.' },
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
        { verses: '3:2', type: 'Contrast', pairing: '"We all stumble in many ways" — no one is exempt, including the teacher.' },
        { verses: '3:3-5', type: 'Comparison', pairing: 'Bit/horse, rudder/ship, spark/forest — small thing controls or destroys a great thing.' },
        { verses: '3:6', type: 'Metaphor', pairing: 'The tongue is a fire, the world of iniquity, set on fire by hell.' },
        { verses: '3:7-8', type: 'Contrast', pairing: 'Every animal can be tamed by men ↔ no one can tame the tongue.' },
        { verses: '3:9-12', type: 'Contrast', pairing: 'Same mouth: blessing + cursing. Fountain, fig tree, vine — nothing in nature behaves this way.' },
        { verses: '3:13-14', type: 'Contrast', pairing: 'Show wisdom by gentle behavior ↔ bitter jealousy and selfish ambition lie against truth.' },
        { verses: '3:15-17', type: 'Contrast', pairing: 'Earthly, natural, demonic ↔ pure, peaceable, gentle, reasonable, merciful, unwavering, without hypocrisy.' },
        { verses: '3:18', type: 'Metaphor', pairing: 'Righteousness is a seed sown in peace by peacemakers — agricultural harvest.' },
      ],
    },
    {
      number: 6,
      kind: 'bullets',
      title: 'Note expressions of time',
      summary: 'James 3 uses universal / categorical claims rather than dated events — the timing is "always."',
      items: [
        { tag: '3:2', text: '"We **all** stumble in many ways" — universal claim, no exception.' },
        { tag: '3:7-8', text: '"Every species… **has been tamed**… but **no one can tame** the tongue" — perfect-tense / categorical absolute.' },
        { tag: '3:13', text: '"Who among you is wise?" — present challenge to the assembled reader.' },
      ],
      note: 'The lack of historical time markers in James 3 is itself meaningful — the chapter is making timeless wisdom claims, not narrating a historical event. The "when" is *whenever the tongue speaks*.',
    },
    {
      number: 7,
      kind: 'bullets',
      title: 'Mark geographic locations',
      summary: 'Where events take place anchors the historical setting.',
      items: [
        { tag: '3:6', text: '**hell** (Greek *γέεννα*, *Geenna*) — the Valley of Hinnom south of Jerusalem, where pagan child-sacrifice had occurred (2 Kings 23:10; Jeremiah 7:31). Jesus\'s preferred word for hell. Of all NT writers besides Jesus, only James uses it.' },
        { tag: '3:11-12', text: '**fountain, fig tree, vine, salt water** — natural-world locations functioning as similes, not as anchors of setting.' },
      ],
      note: "James names *Geenna* deliberately — the tongue's fuel is not earthly. The natural-world similes that follow contrast with that infernal source: nothing in creation behaves the way the unbridled tongue does.",
    },
    {
      number: 8,
      kind: 'bullets',
      title: 'Mark terms of conclusion',
      summary: 'Pivots that signal a summary or inference.',
      items: [
        { tag: '3:10', text: '**"My brethren, these things ought not to be this way"** — pivot from describing the inconsistency to declaring it intolerable.' },
        { tag: '3:13', text: '**"Who among you is wise and understanding?"** — rhetorical pivot from tongue-section to wisdom-section. The diagnostic shifts from symptom (speech) to source (wisdom).' },
        { tag: '3:18', text: '**"And the seed whose fruit is righteousness is sown in peace by those who make peace"** — capstone of the chapter; the agricultural image of peacemaking yields the chapter\'s harvest claim.' },
      ],
      note: "The pivot at 3:13 is the chapter's hinge — James moves from \"your tongue is a problem\" to \"your tongue is a symptom; the source is which wisdom you live by.\"",
    },
    {
      number: 9,
      kind: 'segments',
      title: 'Identify the chapter theme',
      summary: "Center on the main person/event/teaching; express briefly using the text's own words.",
      themeHeadline: 'The tongue reveals which wisdom the heart belongs to.',
      segments: [
        {
          title: 'Where this chapter sits in the letter',
          body: 'James 1:26 warned that an unbridled tongue is evidence of *worthless religion*. James 1:5 promised that wisdom will be given to anyone who asks. Chapter 3 takes both seeds and grows them. The first half (3:1-12) returns to the tongue — small, unruly, disproportionate in power. The second half (3:13-18) widens into a diagnostic: *which wisdom* is producing your speech? The chapter is the bridge between James 1 (the thesis) and James 4 (the heart-source diagnosis). It is also the most quoted passage in the New Testament on Christian speech.',
        },
        {
          title: "The teacher's stricter judgment (3:1)",
          body: 'The chapter opens with a warning aimed at would-be teachers: *let not many of you become teachers, knowing that as such we will incur a stricter judgment* (3:1). James includes himself in that "we" — a Jerusalem-church elder writing pastorally, not from above. The teacher\'s words are weighed with the same standard the teacher applies to others (cf. Matthew 7:2; Luke 12:48). Howard Hendricks built his entire philosophy of Bible teaching on this verse: the teacher unwilling to be changed by the text he teaches has no business teaching it. The warning frames everything that follows — it is not theoretical.',
        },
        {
          title: "The tongue's disproportionate power (3:3-12)",
          body: "James stacks **three similes** to make one point three ways: the bit in the horse's mouth, the rudder on the ship, the spark that sets a forest aflame. Three small things, three disproportionate effects. Then the metaphor sharpens: *the tongue is a fire, the very world of iniquity… set on fire by hell itself* (3:6). The Greek word for hell here is *Geenna* — Jesus's preferred word, used among NT writers only by James. The tongue's fuel is not earthly. The capstone (3:7-12): every animal can be tamed by humans, but **no human can tame the tongue**. The same mouth blesses God and curses image-bearers (3:9-10) — a self-contradicting organ.",
        },
        {
          title: 'The wisdom test (3:13)',
          body: '*Who among you is wise and understanding?* James does not answer with a creedal test or an intellectual one. The wisdom test is **gentle behavior** — *deeds in the gentleness of wisdom* (3:13). Wisdom proves itself the same way faith does in chapter 2: it acts. The test is not "what do you know?" but "what do you produce?" That same diagnostic logic runs through the whole letter. Faith → works (ch. 2). Speech → wisdom-source (ch. 3). Pleasure → conflict (ch. 4). Confession → endurance (ch. 5).',
        },
        {
          title: 'Two wisdoms, two birthplaces',
          body: 'The chapter\'s pivot at 3:15 is sharp: *this wisdom is not that which comes down from above, but is **earthly, natural, demonic***. Three adjectives, three layers — *epigeios* (earthly, of the world), *psuchikos* (soulish, the operating wisdom of the unregenerate, cf. 1 Corinthians 2:14), *daimoniōdēs* (demonic, sourced in the fallen spirit-world). Source: bitter jealousy and selfish ambition. Fruit: disorder and every evil thing (3:16). The two wisdoms have **different birthplaces** — *anōthen* (from above, 3:15, 17) is the same word Jesus used to Nicodemus in John 3:3 ("born from above / again"). Wisdom from above and the new birth share a single source.',
        },
        {
          title: 'Wisdom from above — seven qualities (3:17)',
          body: 'Seven qualities of heavenly wisdom, in deliberate order: **first pure, then peaceable** (*prōton hagnē, epeita eirēnikē*). The order is exegetically loaded — heavenly wisdom does not buy peace by sacrificing purity; it secures peace *through* purity. Then: gentle (*epieikēs* — yielding, equitable), reasonable (*eupeithēs* — open to persuasion), full of mercy and good fruits, unwavering, without hypocrisy. The list reads as a portrait of Christ Himself — the antithesis of "jealousy and selfish ambition" (3:14, 16). It is also the antidote: ask God for *this* wisdom (1:5) and the tongue starts to bridle, because the source has changed.',
        },
        {
          title: 'The harvest (3:18)',
          body: 'The chapter ends in agricultural metaphor: *the seed whose fruit is righteousness is sown in peace by those who make peace*. The chapter that began with the tongue\'s destructive fire ends with peacemaking\'s constructive harvest. Notice the inversion: the same person who *cannot* tame the tongue *can* receive the wisdom from above (1:5) — and that wisdom\'s first work is *gentleness* (3:13). The chapter\'s argument is therefore not "try harder to control your speech." It is "ask for, receive, and live by a different wisdom" — and the speech follows.',
        },
      ],
    },
  ],
  interpretation: {
    intro: 'Interpretation asks what the text *means* — moving from observation (what does it say?) to discerning the author\'s intent in his original context. The movements below trace the chapter\'s argument verse by verse. Where the original Greek changes the shade of an English word, a brief note follows the interpretation as supplement.',
    movements: [
      {
        number: 1,
        title: "The teacher's stricter judgment",
        range: '3:1-2',
        excerpt: 'Let not many of you become teachers, my brethren, knowing that as such we will incur a stricter judgment.',
        body: `James opens the chapter with a warning so sharp it reads as restraint: *let not many of you become teachers*. The first-century synagogue and the early church both held the teacher in unusual honor — the seat carried weight, social standing, and moral authority. James writes against the natural drift toward that seat. Many wanted to teach; many should not. The reason is not hidden but stated outright: *we will incur a stricter judgment*. The teacher's verdict at the end is *stricter*, not because God is harsher with teachers, but because the teacher has handled holy things and shaped other people's understanding of God. Greater stewardship, greater accounting (Luke 12:48).

The pronoun matters. James says **we** — including himself among the *didaskaloi*, the assembly's teachers. He is not warning others from a safer seat; he is warning fellow teachers, with himself in the same line. The pastoral tone of the entire letter is set by this small grammatical choice. Whatever follows about the tongue — its smallness, its fire, its untamability — applies first to the man writing it.

Verse 2 is the bridge: *we all stumble in many ways*. No exemption, including the teacher. The man who *does not stumble in what he says* is **perfect** (*teleios*, mature, complete) — *able to bridle the whole body as well*. James's claim is that **speech is the diagnostic for self-mastery**: control the tongue and the rest of the body falls in line; fail to bridle the tongue and no other discipline holds. The bridge to the rest of the chapter is laid — the tongue is about to be examined as the proxy for the whole person.

**Cross-references.** Matthew 7:2 ("with what judgment you judge, you shall be judged"); Luke 12:48 ("to whom much is given, much will be required"); 1 Timothy 3:1-7 and Titus 1:5-9 give the qualifications for teaching elders. Howard Hendricks (*Teaching to Change Lives*, 1987) built his entire philosophy of Bible teaching on James 3:1: the teacher unwilling to be changed by the text he teaches has no business teaching it.

> **Greek note.** *Didaskaloi* (teachers, v.1) — those who exposit Scripture authoritatively in the assembly. *Krima* (judgment, v.1) — the *verdict*, not merely the process. *Teleios* (perfect, v.2) — mature, complete, lacking nothing.`,
      },
      {
        number: 2,
        title: "The tongue's disproportionate power",
        range: '3:3-12',
        excerpt: 'The tongue is a small part of the body, and yet it boasts of great things. See how great a forest is set aflame by such a small fire!',
        body: `James now stacks **three similes** to make a single point three ways: the bit in the horse's mouth, the rudder on the great ship, the spark that sets a forest aflame. Three small things; three disproportionate effects. The bit turns a thousand-pound animal; the rudder steers a ship driven by storm winds; the spark levels a forest. The tongue is each of these — a small organ with the leverage of a thousand-fold its size. James is not arguing that words are *important*; that would be too mild. He is arguing that words **rule**. They direct what the body becomes and what the assembly becomes.

Then the metaphor sharpens past simile into accusation (3:6): *the tongue is a fire, the very world of iniquity… set on fire by hell itself*. The tongue is not merely *like* a fire; it *is* a fire. And its fuel source is not earthly. The word James reaches for is *Geenna* — the Valley of Hinnom south of Jerusalem, the place of pagan child-sacrifice (2 Kings 23:10; Jeremiah 7:31), Jesus's preferred word for hell. The tongue's worst speech is not generated by the speaker alone; James locates it in cosmic warfare. The mouth is a vent for an underworld fire that, left unbridled, **defiles the entire body** and *sets on fire the course of life*.

The argument's capstone (3:7-8) is one of the bleakest claims in the New Testament about human moral capacity. *Every species of beast and bird, of reptile and creature of the sea, is tamed and has been tamed by humanity* — but **no one can tame the tongue**. *No one*, *oudeis*. James is not exaggerating. The tongue is the one organ humanity cannot domesticate by willpower or technique. It is *a restless evil, full of deadly poison*. The image is the cobra — coiled, unpredictable, lethal. The verdict is meant to break self-confidence about speech.

The closing simile (3:9-12) drives a final wedge. The same mouth blesses *the Lord and Father* and curses *those made in the likeness of God* — direct echo of Genesis 1:26-27. Cursing image-bearers is a theological scandal because the image is what makes them sacred. James's analogies from creation (3:11-12) close the case: the fountain doesn't pour fresh and bitter from the same opening; the fig tree doesn't produce olives; salt water cannot produce fresh. **Nothing in nature behaves the way the unbridled tongue does.** The contradiction proves something is wrong at the source — and James will name it in the next movement.

**Cross-references.** Proverbs sits in the background everywhere: Proverbs 10:19, 12:18, 15:1-2, 18:21 ("death and life are in the power of the tongue"), 25:11. Jesus's own teaching closes the loop: Matthew 12:34-37 — *out of the abundance of the heart the mouth speaks… by your words you will be justified, and by your words you will be condemned*.

> **Greek note.** *Geenna* (hell, v.6) — Valley of Hinnom; Jesus's preferred word for hell; among NT writers, only James uses it. *Akatastaton kakon* (restless evil, v.8) — same root as *akatastatos* (unstable) in James 1:8; the tongue and the divided heart share the same instability. *Homoiōsin theou* (the likeness of God, v.9) — direct echo of Genesis 1:26-27 LXX.`,
      },
      {
        number: 3,
        title: 'Two wisdoms, two harvests',
        range: '3:13-18',
        excerpt: 'The wisdom from above is first pure, then peaceable, gentle, reasonable, full of mercy and good fruits, unwavering, without hypocrisy.',
        body: `If the first half of the chapter exposes the symptom (the tongue), the second half diagnoses the source (the wisdom). James asks: *who among you is wise and understanding?* (3:13). And he refuses to answer with a creedal test or a credentialed one. The wisdom test is **gentle behavior**: *let him show by his good behavior his deeds in the gentleness of wisdom*. Wisdom proves itself the way faith does in chapter 2 — it acts, and it acts *gently*. The intellectual test would credit the harshly accurate person; James will not. The truly wise are recognized by the same fruit Christ embodied: meekness under authority, restraint under provocation, deeds that bend toward the lowly.

Then the diagnostic gets brutally direct (3:14-15). If your heart carries *bitter jealousy and selfish ambition*, **do not be arrogant and so lie against the truth**. The wisdom you live by *is not that which comes down from above*. It is **earthly, natural, demonic** — three adjectives forming a descending staircase. *Earthly*: bound to the world's standards. *Natural*: the unregenerate human's operating wisdom (compare 1 Corinthians 2:14, where Paul uses the same word for the natural man who cannot receive the things of the Spirit). *Demonic*: sourced in the fallen spirit-world. Three layers, one verdict. The fruit of this wisdom (3:16) is *disorder and every evil thing* — *akatastasia*, the same root James used of the unstable tongue (3:8) and the double-minded man (1:8). One unstable wisdom, one unstable life.

Verse 17 is the alternative — and the chapter's heart. *The wisdom from above is first pure, then peaceable, gentle, reasonable, full of mercy and good fruits, unwavering, without hypocrisy*. Seven qualities, but the **order matters**. *First* pure, *then* peaceable. James anticipates the temptation to chase peace at the cost of purity — to keep relational comfort by tolerating what God has called unclean. Heavenly wisdom refuses the trade. It does not buy peace by sacrificing purity; it secures peace **through** purity. The list reads as a portrait of Christ Himself, the antithesis of *jealousy and selfish ambition* — and the antidote: ask God for *this* wisdom (1:5) and the tongue starts to bridle, because the source has changed.

The closing image (3:18) ends the chapter in agriculture. *The seed whose fruit is righteousness is sown in peace by those who make peace*. The chapter that began with the tongue's destructive fire ends with peacemaking's constructive harvest. The inversion is the chapter's gospel: the same person who *cannot* tame the tongue *can* receive the wisdom from above (1:5) — and that wisdom's first work is gentleness (3:13). The argument is therefore not "try harder to control your speech." It is *ask for, receive, and live by a different wisdom — and the speech follows*.

**Cross-references.** Proverbs 8 (wisdom personified as from above); 1 Corinthians 1-2 (the wisdom of the world vs. the wisdom of God); Galatians 5:19-23 (the works of the flesh vs. the fruit of the Spirit — same diagnostic logic, different vocabulary); John 3:3 (Jesus to Nicodemus, *born from above*).

> **Greek note.** *Anōthen* (from above, vv.15, 17) — the same word Jesus used to Nicodemus in John 3:3; James 1:17 already established it for *every good and perfect gift*. *Psuchikos* (natural, v.15) — *soulish*, the operating wisdom of the unregenerate. *Daimoniōdēs* (demonic, v.15) — sourced in the fallen spirit-world. *Hagnē* pure / *eirēnikē* peaceable / *epieikēs* gentle / *eupeithēs* reasonable / *mestē eleous kai karpōn agathōn* full of mercy and good fruits / *adiakritos* unwavering / *anupokritos* without hypocrisy.`,
      },
    ],
  },
  application: {
    intro: 'Application is where Observation and Interpretation become obedience. Each question is paired with a movement of the chapter — read it slowly, answer it honestly, and let it land on a specific situation in your week. Don\'t generalize; name the relationship, the moment, the next step.',
    questions: [
      { range: '3:1-2', question: "Where am I taking on a teacher's responsibility (in the family, online, in a small group, in casual conversation) without taking the teacher's accountability? Where have my words exceeded my willingness to be changed by them?" },
      { range: '3:3-6', question: "Recall the last 24 hours of words I have spoken. Which were small sparks that have lit fires somewhere — fires I am still avoiding looking at?" },
      { range: '3:7-8', question: "Where have I treated taming the tongue as a project I will accomplish, when James says no human can? What does this say about the prayer life behind my speech?" },
      { range: '3:9-12', question: "Whom have I cursed (subtly, by complaint, by sarcasm, by gossip) this week, while blessing God on Sunday? Who is the image-bearer my mouth keeps hitting?" },
      { range: '3:13-14', question: "When I am wronged, what comes out — gentleness or bitter rivalry? What does that tell me about the wisdom currently operating my heart?" },
      { range: '3:17-18', question: "Of the seven qualities of wisdom from above, which is most absent in my life right now? Where would planting that seed in peace bear a harvest of righteousness?" },
    ],
  },
};
