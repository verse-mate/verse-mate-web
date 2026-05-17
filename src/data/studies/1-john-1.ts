import { InductiveStudy } from './types';

// Precept-method inductive study for 1 John 1.
// Step kinds: prose | qa | keywords | lists | contrasts | bullets | segments.
// Scripture references stay as verse numbers; the user reads the actual text
// from the Bible side of the split-view.

export const FIRST_JOHN_1_STUDY: InductiveStudy = {
  bookId: 62,
  bookName: '1 John',
  chapter: 1,
  title: '1 John 1',
  subtitle: 'The Precept Method, Verse by Verse',
  themeOneLine: 'Walk in the light as He is in the Light — fellowship with the Father, the Son, and one another.',
  steps: [
    {
      number: 1,
      kind: 'bullets',
      title: 'Begin with prayer',
      summary: "Apart from the Holy Spirit's illumination this is just a method.",
      intro: 'Before reading 1 John 1, ask the Holy Spirit to test the gap between what you profess and how you walk, and to surface the specific sin you have been minimizing. Pray with three focuses:',
      items: [
        { tag: 'POSTURE', text: 'Willingness to be tested by your *walk*, not by your profession. John writes for assurance, but the assurance is grounded in objective tests (1:6-10), not in subjective certainty.' },
        { tag: 'EYES', text: 'Honesty about sin. The two greatest dangers in this chapter are not gross immorality — they are spiritual self-deception: (a) claiming fellowship while walking in darkness (1:6) and (b) denying you have sin at all (1:8, 10). Ask the Spirit to surface what you have rationalized.' },
        { tag: 'WILL', text: 'Readiness to confess. Confession (*homologeo*, 1:9) is not vague regret — it is naming the specific sin and saying the same thing about it that God does. Decide before you read that you will name what He surfaces.' },
      ],
      note: '1 John 1 is the doctrinal foundation for the whole letter — every test of true faith in chapters 2-5 is anchored in three claims made here: **God is light** (1:5), **the blood of Jesus cleanses** (1:7), and **confession secures forgiveness** (1:9). Read the prologue (vv. 1-4) as eyewitness testimony, not abstract theology. John is the last apostle alive; he stakes the gospel on what he heard, saw, looked at, and touched.',
    },
    {
      number: 2,
      kind: 'qa',
      title: "Ask the 5 W's and an H",
      summary: 'Setting the table — author, audience, occasion.',
      items: [
        {
          tag: 'WHO',
          q: 'Who wrote it?',
          a: 'John the Apostle, son of Zebedee — the "disciple whom Jesus loved" (John 13:23; 21:20), brother of James (the first apostolic martyr, Acts 12:2). Same author as the Gospel of John and Revelation. He names himself nowhere in the letter; the authority is the eyewitness "we" of 1:1-4.',
        },
        {
          tag: 'TO WHOM',
          q: 'To whom is it written?',
          a: 'His "little children" (*teknia*, used at 2:1, 12, 28; 3:7, 18; 4:4; 5:21) — congregations in Asia Minor he had pastored for decades, very likely the same churches addressed in Revelation 2-3 (Ephesus, Smyrna, Pergamum, Thyatira, Sardis, Philadelphia, Laodicea).',
        },
        {
          tag: 'WHEN',
          q: 'When was it written?',
          a: 'Late first century, likely AD 85-95. After the destruction of Jerusalem (AD 70), after the martyrdoms of Paul and Peter (~AD 64-67), and after John\'s Gospel. He writes as the last surviving apostle.',
        },
        {
          tag: 'WHERE',
          q: 'Where was the audience?',
          a: 'Asia Minor — John was writing from Ephesus, where he had settled after Jerusalem and shepherded the churches of the region.',
        },
        {
          tag: 'WHY',
          q: 'Why was it written?',
          a: 'A schism had already occurred — false teachers had "gone out from us" (2:19), denying the true humanity of Christ (4:2-3), claiming a higher *gnosis* available to spiritual elites, and asserting the enlightened were beyond sin (1:8, 10). This is incipient Gnosticism — Cerinthus and the proto-Docetists named by Irenaeus. John writes to settle the unsettled with **objective tests of true faith**: doctrinal (right Christology), moral (obedience), relational (love).',
        },
        {
          tag: 'HOW',
          q: 'How does it teach (genre)?',
          a: 'Epistle, but more circular tract than personal letter. No greeting, no named recipients, no closing. Reads as a pastoral sermon — three concentric cycles, each touching the same three tests (truth, righteousness, love). Cyclic, not linear; Hebraic in rhythm, Hellenistic in vocabulary.',
        },
      ],
    },
    {
      number: 3,
      kind: 'keywords',
      title: 'Mark key words and phrases',
      summary: "Repeated words carry the author's purpose. Counting them shows what John is fixing in your mind.",
      inventory: [
        { word: 'fellowship', greek: 'koinonia', count: 4, verses: '1:3 (×2), 6, 7', definition: 'Shared participation, partnership, mutual life. Not loose social companionship but the active sharing of a common life — here the believer\'s shared life with the Father, the Son, and other believers.' },
        { word: 'light', greek: 'phos', count: 3, verses: '1:5, 7 (×2)', definition: 'The visible radiance God IS (not merely possesses) — moral purity, truth, and self-revelation. The opposite of concealment.' },
        { word: 'darkness', greek: 'skotia / skotos', count: 2, verses: '1:5, 6', definition: 'The realm of moral evil, ignorance of God, and concealment. *Skotia* (v.5) and *skotos* (v.6) are near-synonyms John uses interchangeably to widen the negative pole of the metaphor.' },
        { word: 'sin / sins', greek: 'hamartia', count: 4, verses: '1:7, 8, 9 (×2)', definition: 'Missing the mark — moral failure of falling short of God\'s character. Singular and plural in this chapter: as a principle/nature (1:7-8) and as discrete acts (1:9).' },
        { word: 'cleanse', greek: 'katharizo', count: 2, verses: '1:7, 9', definition: 'To purify, to make ritually and morally clean. In v.7 the present tense — *keeps on cleansing* — frames atonement as continuous provision for the believer\'s daily walk, not one-time-and-finished.' },
        { word: 'truth', greek: 'aletheia', count: 2, verses: '1:6, 8', definition: 'Reality as God sees it — both as doctrine (right beliefs about Christ) and as moral correspondence (right walk). Walking in darkness or denying sin = not *doing* the truth.' },
        { word: 'lie / liar', greek: 'pseudomai / pseustes', count: 2, verses: '1:6, 10', definition: 'To speak falsehood; a falsifier. Two of the chapter\'s three "if we say" denials end here — claiming fellowship while walking in darkness IS lying (1:6), and denying we have sinned makes God Himself the liar (1:10).' },
        { word: 'word', greek: 'logos', count: 2, verses: '1:1, 10', definition: 'The Word who *is* (1:1, the personal *Logos* — same lemma as John 1:1) and the word God has spoken (1:10, His revealed message). John bookends the chapter with *logos* in both senses.' },
        { word: 'life', greek: 'zoe', count: 3, verses: '1:1, 2 (×2)', definition: 'Genuine, God-given, eternal life — not biological existence (*bios*) but the quality of life that belongs to God and is communicated in Christ (cf. John 1:4; 5:26; 17:3).' },
        { word: 'confess', greek: 'homologeo', count: 1, verses: '1:9', definition: 'Literally *to say the same thing* — to agree with God\'s verdict on a specific sin. Not generic regret, not naming-while-excusing, but specific moral agreement with God.' },
        { word: 'manifested / revealed', greek: 'phaneroo', count: 2, verses: '1:2 (×2)', definition: 'To make visible what was hidden. The eternal Life that was *with the Father* has now appeared in history. Anti-docetic in force — the Word of Life did not merely *seem* to appear; He was made visible.' },
      ],
    },
    {
      number: 4,
      kind: 'lists',
      title: 'Make lists',
      summary: '"What I learn about ___" — extract truths from each marked word.',
      lists: [
        {
          title: 'What 1 John 1 teaches about God',
          columns: ['Verse', 'Truth'],
          rows: [
            { ref: '1:1', truth: 'Has existed from the beginning — eternal preexistence of the Word of Life.' },
            { ref: '1:2', truth: 'Is the Father; the eternal Life was with Him before time.' },
            { ref: '1:3', truth: 'Has a Son named Jesus Christ; fellowship is with Father and Son together.' },
            { ref: '1:5', truth: 'IS light — not has light, sends light, or dwells in light. Identity, not attribute.' },
            { ref: '1:5', truth: 'Has no darkness in Him at all — strongest negation in the chapter.' },
            { ref: '1:7', truth: 'His Son\'s blood keeps on cleansing those who walk in the Light.' },
            { ref: '1:9', truth: 'Is faithful (*pistos*) — keeps the promise He has made.' },
            { ref: '1:9', truth: 'Is righteous (*dikaios*) — forgives in a way that satisfies His own justice, not bypasses it.' },
            { ref: '1:9', truth: 'Forgives confessed sins AND cleanses from all unrighteousness — the provision exceeds the request.' },
            { ref: '1:10', truth: 'His word is in those who acknowledge their sin; denying sin calls Him a liar.' },
          ],
        },
        {
          title: 'What 1 John 1 teaches about Jesus Christ',
          columns: ['Verse', 'Truth'],
          rows: [
            { ref: '1:1', truth: 'Was from the beginning — the same eternal *Logos* of John 1:1.' },
            { ref: '1:1', truth: 'Is the Word of Life — life is intrinsic to His person.' },
            { ref: '1:1', truth: 'Was heard, seen, looked at, and physically touched — fully man.' },
            { ref: '1:2', truth: 'Is the eternal Life that was with the Father, now made visible.' },
            { ref: '1:3', truth: 'Is the Son of the Father — genuine Sonship, not adoption.' },
            { ref: '1:7', truth: 'His blood cleanses from all sin — substitutionary atonement applied continuously.' },
          ],
        },
        {
          title: 'What 1 John 1 teaches about the believer and sin',
          columns: ['Verse', 'Truth'],
          rows: [
            { ref: '1:3-4', truth: 'Has fellowship with the Father and the Son, and that fellowship completes joy.' },
            { ref: '1:6', truth: 'Cannot claim fellowship while walking in darkness without lying.' },
            { ref: '1:7', truth: 'Walking in the light produces fellowship with one another AND ongoing cleansing.' },
            { ref: '1:8', truth: 'Has sin (the principle); denying it is self-deception, not maturity.' },
            { ref: '1:9', truth: 'Confession is the prescribed posture; God\'s response is forgiveness AND cleansing.' },
            { ref: '1:10', truth: 'Denying past or present sinful acts makes God a liar and shows His word is not internalized.' },
          ],
        },
      ],
    },
    {
      number: 5,
      kind: 'contrasts',
      title: 'Watch for contrasts and comparisons',
      summary: 'Highly descriptive language John uses to make the test memorable.',
      items: [
        { verses: '1:1-2', type: 'Contrast', pairing: 'What was from the beginning (eternal) ↔ what was manifested in time (historical).' },
        { verses: '1:5', type: 'Contrast', pairing: 'God IS light ↔ in Him there is no darkness at all.' },
        { verses: '1:6', type: 'Contrast', pairing: '*Saying* we have fellowship ↔ *walking* in darkness — profession contradicted by practice.' },
        { verses: '1:6-7', type: 'Contrast', pairing: 'Walking in darkness ↔ walking in the Light.' },
        { verses: '1:7', type: 'Comparison', pairing: 'Walking in the Light **as He Himself is in the Light** — God\'s own being is the standard.' },
        { verses: '1:8-9', type: 'Contrast', pairing: 'Denying we have sin (self-deception) ↔ confessing our sins (forgiveness, cleansing).' },
        { verses: '1:9', type: 'Comparison', pairing: 'God is faithful AND righteous — both attributes ground the forgiveness, not just His mercy.' },
        { verses: '1:8, 10', type: 'Contrast', pairing: '"We have no sin" (principle denied) ↔ "we have not sinned" (act denied) — escalating dishonesty.' },
        { verses: '1:10', type: 'Contrast', pairing: 'Calling God a liar (denial of sin) ↔ His word abiding in us (truth received).' },
      ],
    },
    {
      number: 6,
      kind: 'bullets',
      title: 'Note expressions of time',
      summary: 'The relationship of events in time often sheds light on meaning. Verb tenses in 1 John 1 are theologically loaded.',
      items: [
        { tag: '1:1', text: '"*from the beginning*" — eternal preexistence of the Word of Life, the same temporal anchor as John 1:1.' },
        { tag: '1:2', text: '"the life *was manifested*" — past historical event of the incarnation. Not a continuing process; a completed appearing.' },
        { tag: '1:2', text: '"eternal life that *was with* the Father" — perpetual fellowship in the Godhead before time began.' },
        { tag: '1:7', text: '"*cleanses* (katharizei, present indicative) us from all sin" — continuous, ongoing action. The blood is not finished its work the day you believed; it keeps cleansing.' },
        { tag: '1:9', text: '"if we *confess* (homologomen, present subjunctive)" — habitual, ongoing posture, not a one-time crisis.' },
        { tag: '1:10', text: '"if we say we *have not sinned* (perfect tense)" — denying both the past act and the present state of having sinned.' },
      ],
      note: 'The present-tense verbs of vv. 7 and 9 are the chapter\'s pastoral engine. The blood **keeps on cleansing**, and confession is **kept on** as a way of life. The Christian life is framed as continuous walking in the light met by continuous cleansing through the Son\'s blood, sustained by continuous confession on the believer\'s side and continuous faithfulness on God\'s.',
    },
    {
      number: 7,
      kind: 'bullets',
      title: 'Mark geographic locations',
      summary: 'Where events take place anchors the historical setting. 1 John has no place names, but vv. 1-4 are inseparable from a place.',
      items: [
        { tag: '1:1', text: '**eyes that saw, hands that touched** — Galilee and Judea, AD 27-33. The apostles heard Jesus preach in real synagogues, watched Him eat and weep in real homes, saw the post-resurrection wounds (John 20:24-29), touched the risen Christ (Luke 24:39).' },
        { tag: '1:2', text: '**that which was manifested** — Bethlehem, Nazareth, Capernaum, Jerusalem. The "manifestation" of the Word of Life is anchored in named towns in first-century Palestine.' },
      ],
      note: '1 John has no place names because the letter circulates among scattered Asia Minor churches — geography-neutral by design. But the prologue (vv. 1-4) is geography-saturated by implication. John writes against teachers who had decoupled the gospel from history, treating the Christ as a spiritual abstraction. He reattaches it. Christianity rises or falls on the historical fact of the incarnate, crucified, bodily-risen Jesus of Nazareth.',
    },
    {
      number: 8,
      kind: 'bullets',
      title: 'Mark terms of conclusion',
      summary: '"Therefore," "but," "if" — these hinges flag the chapter\'s rhetorical shape.',
      items: [
        { tag: '1:5', text: '**"And this is the message we have heard from Him and announce to you..."** — bridge from the prologue (vv. 1-4) into the doctrinal core. *Message* (*angelia*) appears in the NT only here and at 3:11; both times it introduces a foundational truth received from Christ.' },
        { tag: '1:6', text: '**"If we say..."** — the first of three "if we say" denials (vv. 6, 8, 10). These are the chapter\'s rhetorical spine.' },
        { tag: '1:7', text: '**"But if we walk in the Light..."** — the positive antithesis to v. 6; introduces the chapter\'s first promise (fellowship and cleansing).' },
        { tag: '1:9', text: '**"If we confess our sins..."** — the chapter\'s hinge promise. Conditioned on confession; secured by God\'s faithfulness and righteousness.' },
      ],
      note: 'The chapter\'s rhetorical engine is the **conditional sentence**. Three negative "if we say" denials (vv. 6, 8, 10) and two positive "if we walk / if we confess" promises (vv. 7, 9). Each pair tests whether profession matches reality. The chapter\'s shape: prologue (1-4) → doctrinal anchor (5) → five conditional tests (6-10).',
    },
    {
      number: 9,
      kind: 'segments',
      title: 'Identify the chapter theme',
      summary: "Center on the main person/event/teaching; express briefly using the text's own words.",
      themeHeadline: 'What we have heard, seen, looked at, and touched — we proclaim, that you may have fellowship with the Father, the Son, and one another.',
      segments: [
        {
          title: 'The prologue\'s anchor — eyewitness, not idea',
          body: '1 John opens with four physical-sense verbs piled together — **heard**, **seen with our eyes**, **looked at** (*theaomai*, "to gaze upon carefully"), **touched with our hands** (*pselaphao*, "to handle"). This is not poetic ornament. By the late first century, false teachers — incipient Gnostics, named Cerinthus and the proto-Docetists by Irenaeus — were teaching that the Christ was a spiritual being who only *seemed* to take flesh, and that the spiritual elite reached salvation by secret knowledge (*gnosis*) detached from history. John annihilates that premise in the first sentence. The Word of Life was **heard** (He preached real sermons), **seen** (He stood in real space), **looked at** (the apostles watched Him carefully, over years), and **physically touched** (Thomas put his fingers into the wounds, John 20:27). Christianity rests on historical events, not on a spiritual experience that can be detached from the man Jesus.',
        },
        {
          title: 'God is light — the doctrinal anchor (1:5)',
          body: 'The chapter\'s pivot is one sentence: *God is light, and in Him there is no darkness at all.* John says **is**, not *has*. Light is what God IS — moral purity, full self-revelation, the absence of concealment. The "no darkness at all" is the chapter\'s strongest negation (*ouk... oudemia* — *not... none whatsoever*). This claim does the chapter\'s whole pastoral work. Every conditional that follows in vv. 6-10 is an inference from it. If God is light with no darkness at all, then walking in darkness while claiming fellowship is incoherent (1:6); sin must be exposed, not denied (1:8, 10); and confession that secures forgiveness (1:9) must operate openly, not in the shadow of self-deception. John\'s morality is grounded in an ontology — what God IS determines what fellowship with Him requires.',
        },
        {
          title: 'The five conditional tests (1:6-10)',
          body: 'Verses 6-10 are five conditionals that test profession against reality. The **three "if we say" lines** (vv. 6, 8, 10) target three forms of self-deception: claiming fellowship while walking in darkness (lie about your walk); claiming we have no sin at all (lie about your nature — the perfectionist heresy of the Gnostics); claiming we have not committed any sinful act (lie about your history). The **two positive "if we" lines** (vv. 7, 9) name the alternative: walking in the light, which yields fellowship and continuous cleansing; and confessing sin, which yields forgiveness and cleansing from all unrighteousness. John writes for assurance, not anxiety — but assurance grounded in **objective tests**, not subjective certainty. The chapter is not afraid of believers who *have sinned*; it is afraid of believers who *cannot bring themselves to admit* they have sinned.',
        },
        {
          title: 'Continuous cleansing, continuous confession',
          body: 'Two present-tense verbs anchor the chapter\'s pastoral payoff. **v. 7** — the blood of Jesus *keeps on cleansing* (*katharizei*) us from all sin. The blood applied once at the cross has continuous force in the believer\'s daily walk. **v. 9** — if we *keep on confessing* (*homologomen*) our sins, He is faithful and righteous to forgive. Confession is not a one-time event but the believer\'s habit of agreement with God about specific sin. The combination is the New Covenant pattern: continuous walking in the light met by continuous cleansing through the Son\'s blood, sustained by continuous confession on our side and continuous faithfulness on God\'s. The believer is **never** unable to come back. The provision is open at all times.',
        },
        {
          title: 'The chapter\'s purpose — fellowship and completed joy',
          body: 'John states why he writes (1:3-4): *that you also may have fellowship with us*, and that fellowship is *with the Father and with His Son Jesus Christ* — *so that our joy may be made complete*. The same words *joy* (*chara*) and *complete* (*pleroo*) Jesus used in His high-priestly prayer (John 15:11; 17:13). John\'s aim is not information transfer but **shared life**. The horizontal fellowship of believers and the vertical fellowship with the Triune God are one fabric. When one falters, the other will. When both hold, joy is full. This purpose statement re-orients the whole chapter: doctrinal precision (1:5), moral honesty (1:6-10), and continuous confession (1:9) all serve the end of *koinonia* and *chara*.',
        },
      ],
    },
  ],
  interpretation: {
    intro: 'Interpretation asks what the text *means* — moving from observation (what does it say?) to discerning the author\'s intent in his original context. The movements below trace the chapter\'s argument from the eyewitness prologue through the five conditional tests. Where the original Greek changes the shade of an English word, a brief note follows the interpretation as supplement.',
    movements: [
      {
        number: 1,
        title: 'The Word of Life — heard, seen, looked at, touched',
        range: '1:1-4',
        excerpt: 'What was from the beginning, what we have heard, what we have seen with our eyes, what we have looked at and touched with our hands, concerning the Word of Life…',
        body: `John opens not with a greeting but with a sentence-fragment that piles eyewitness verbs together. The grammatical subject — "what" — keeps delaying its predicate, building tension across four clauses before he finally completes the thought in verse 3: *what we have seen and heard, we proclaim to you also*. The structure is intentional. Before John tells the reader anything else, he tells them where his message comes from: from someone he *heard preach*, *saw with his eyes*, *looked at*, and *touched with his hands*.

The four verbs escalate. **Heard** is the loosest — many heard Jesus and walked away. **Seen with the eyes** narrows — eyewitnesses, not hearsay. **Looked at** (*theaomai*) — to gaze upon carefully, the same verb John uses of the incarnation in John 1:14 (*we beheld His glory*). **Touched** (*pselaphao*) — to handle, the very verb the risen Christ uses in Luke 24:39 when He tells the disciples *handle Me and see, for a spirit does not have flesh and bones as you see that I have*. John is recalling, almost certainly, the resurrection morning and the days that followed: he ate with the risen Christ, watched Him cook fish on the shore (John 21:9-13), saw Thomas put his hand in the side wound.

This is anti-docetic theology in narrative form. By the 90s, teachers in Asia Minor — what later writers will call the school of Cerinthus and the proto-Docetists — were teaching that the divine Christ descended on the human Jesus at His baptism and left Him before the cross, that the flesh was a costume the divine Spirit briefly wore. The first sentence of 1 John makes that impossible. *The Word of Life* — the same *Logos* of John 1:1 — was heard, seen, looked at, **and physically touched**. Christianity rises or falls on the historical fact of the incarnate, crucified, and bodily-risen Jesus of Nazareth.

The purpose of the proclamation is named in verses 3-4. The apostles do not testify so the church can have **knowledge** (the false teachers were selling *gnosis*) but so the church can have **fellowship** — *koinonia*, shared life. And that fellowship is itself with the Father and His Son Jesus Christ. John names a vertical and horizontal axis in one breath: the same shared life that binds the apostles to the Father and the Son extends to every believer who receives the proclamation. The stated outcome — *that our joy may be made complete* — uses the same vocabulary Jesus used in His high-priestly prayer (John 17:13). John writes to extend that joy.

> **Greek note.** *Logos tēs zōēs* (Word of Life) is the same *Logos* of John 1:1. *Theaomai* (to gaze upon, look at carefully) and *pselaphao* (to touch, handle) are the resurrection-morning verbs — Luke 24:39 uses *pselaphao* in the risen Christ\'s own command. *Koinonia* (fellowship) is shared participation, not casual companionship; *chara peplērōmenē* (complete joy) deliberately echoes John 15:11 and 17:13.`,
      },
      {
        number: 2,
        title: 'God is light — the chapter\'s doctrinal pivot',
        range: '1:5',
        excerpt: 'This is the message we have heard from Him and announce to you, that God is Light, and in Him there is no darkness at all.',
        body: `After the four-verse prologue, the chapter\'s doctrinal pivot is one sentence. John frames it carefully: *this is the message we have heard from Him*. The Greek for *message* (*angelia*) is rare in the NT — used only here and at 3:11. And 3:11 pairs it identically: *this is the message you have heard from the beginning, that we should love one another*. The two *angelia* statements set the structural poles of the letter: **God is light (1:5)** anchors holiness; **love one another (3:11)** anchors community. Both come from Jesus Himself, mediated through the apostle who heard them.

The claim is **God is light** — a predicate-noun construction with no verb in the Greek (*ho theos phōs estin*). John does not say God *has* light, *sends* light, or *dwells in* light. He says God IS light. Light here is not the physical phenomenon but the moral and revelatory reality light symbolizes: holiness, transparency, truth, self-disclosure. **Darkness** — which God IS NOT — represents moral evil, concealment, ignorance of God. The Old Testament theological background is dense: Psalm 27:1 (*the LORD is my light*), Psalm 104:2 (*covering Yourself with light as with a cloak*), Isaiah 60:19, Habakkuk 3:4. The Gospel of John establishes the same metaphor: *the light shines in the darkness* (John 1:5); *I am the Light of the world* (John 8:12).

The chapter\'s strongest negation closes the sentence: *and in Him there is no darkness at all*. The double negative in Greek (*ouk... oudemia*) is emphatic — *not... none whatsoever*. This matters because the false teachers claimed a higher knowledge that placed them beyond the categories of light and dark. John\'s answer is to make those categories the very nature of God. There is no shadow side, no esoteric layer where God\'s holiness is suspended. To be in fellowship with God is to be in the light, period.

This single verse is the chapter\'s whole pastoral foundation. Every conditional that follows in vv. 6-10 is an inference from it. If God is light with no darkness at all, then walking in darkness while claiming fellowship is incoherent (v. 6); sin must be exposed, not denied (vv. 8, 10); and the blood that cleanses (v. 7) and the confession that secures forgiveness (v. 9) must operate openly — not in the shadow of self-deception.

> **Greek note.** *Angelia* (message) appears in the NT only at 1:5 and 3:11 — both times for a foundational truth received from Christ Himself. *Ho theos phōs estin* — God-is-light is verbless in Greek; an identity statement, not an attribute. *Skotia oudemia* — "darkness none whatsoever" — the strongest negation John can make.`,
      },
      {
        number: 3,
        title: 'Walking in the light — fellowship and the cleansing blood',
        range: '1:6-7',
        excerpt: 'If we say that we have fellowship with Him and yet walk in the darkness, we lie and do not practice the truth; but if we walk in the Light as He Himself is in the Light, we have fellowship with one another, and the blood of Jesus His Son cleanses us from all sin.',
        body: `Verses 6 and 7 are a paired conditional — first the false claim, then the right walk. The false claim takes profession (*we have fellowship*) and pairs it with a contrary practice (*walk in the darkness*). John\'s verdict is direct: *we lie and do not practice the truth*. Truth is not merely something we believe; it is something we **do** — *poieō tēn alētheian*, "do the truth." A walk that contradicts the profession exposes the profession as false. The chapter is not interested in claims; it is interested in lives.

Verse 7 names the alternative. *If we walk in the Light as He Himself is in the Light* — note the comparative: not "as well as He" but "as He Himself is." The standard is God\'s own being in the Light, not other believers\' performance. Two consequences follow: **fellowship with one another** (the horizontal axis the prologue named, now grounded in shared walking-in-light) and **continuous cleansing by the blood**. The verb tense is crucial — *katharizei* is **present indicative**: the blood of Jesus *keeps on cleansing* us from all sin. This is not the once-for-all justification at conversion (which is real and finished); it is the ongoing application of the cross to the believer\'s daily walk.

The combination is striking. Walking in the light does not mean we have stopped sinning. If it did, verse 7 would not need to mention cleansing at all — light-walkers would have nothing to be cleansed from. The picture is rather a believer **moving in the realm of light** — choosing transparency, repenting quickly, refusing concealment — while the residue of indwelling sin is continuously dealt with by the blood. The pastoral payoff is enormous: there is no condition of failure in which the cross is not currently sufficient. As Spurgeon put it: the blood that washes is always near; the basin is full; the believer is always within reach of cleansing.

The "blood of Jesus His Son" is the chapter\'s first explicit reference to the atonement. *Blood* (*haima*) is the Old Testament\'s word for life poured out in sacrifice (Leviticus 17:11). John pairs *Jesus* (the historical name, the man) with *His Son* (the divine identity, the Father\'s eternal Son) — both halves of the incarnational claim of vv. 1-4 are now active in the verb *cleanses*. The cross does the work because the One whose blood was shed is both fully man (so that real human blood was offered) and fully God\'s Son (so that the offering has infinite worth).

> **Greek note.** *Peripateō* (walk) is the standard Pauline-Johannine word for the whole conduct of life, not isolated steps. *Katharizei* — present indicative, *keeps on cleansing*; the same verb returns in v. 9 in the infinitive. *Skotos* in v. 6 differs from *skotia* in v. 5 — near-synonyms John uses interchangeably; do not over-press the distinction.`,
      },
      {
        number: 4,
        title: 'The honesty of confessed sin',
        range: '1:8-9',
        excerpt: 'If we say that we have no sin, we are deceiving ourselves and the truth is not in us. If we confess our sins, He is faithful and righteous to forgive us our sins and to cleanse us from all unrighteousness.',
        body: `The second "if we say" (v. 8) targets the perfectionist heresy of the false teachers. *If we say we have no sin* — note the **singular** *hamartia*, "sin" as a principle or condition, not specific sinful acts. The claim is that the truly enlightened are beyond the sin-principle itself, that *gnosis* has elevated them above the human moral condition. John\'s verdict: *we are deceiving ourselves, and the truth is not in us*. The deception is self-inflicted (*planōmen heautous*) — no one outside has to lie to us; we are perfectly capable of fooling ourselves about our own condition.

This rejection of perfectionism is one of the New Testament\'s strongest. It echoes Jeremiah 17:9 (*the heart is more deceitful than all else*), Romans 7:14-25 (Paul\'s confession of indwelling sin), and Jesus\'s own teaching that *out of the heart* come evil thoughts (Matthew 15:19). The believer who has been justified, sanctified positionally, and adopted as a child of God still has a sin-nature, still falters, still must reckon honestly with what remains. Anyone who claims otherwise has substituted self-deception for self-knowledge.

Verse 9 names the prescribed alternative. *If we confess our sins* — now **plural** *hamartias*, specific sinful actions, not the principle. **Confess** is *homologeō*, literally *to say the same thing* — to agree with God\'s verdict on a specific sin. This is not vague regret, not naming-while-excusing, not general spiritual humility. It is specific moral agreement: *Lord, You call this sin, and I call it sin. You name this a betrayal of Your character, and I name it the same.* The verb is **present subjunctive** — habitual, ongoing, the believer\'s posture, not the sinner\'s one-time crisis.

The promise rests on two attributes of God working in tandem. *He is faithful* (*pistos*) — He keeps the promise He has made. *And righteous* (*dikaios*) — He acts in accordance with His own justice. The combination is striking. We might expect *merciful* and *gracious*, but John says *faithful* and *righteous*. The cross has so satisfied the justice of God that forgiving the confessing believer is now an act of God\'s **righteousness**, not a suspension of it (Romans 3:25-26). The Father can forgive every sin you confess because the Son has already paid for every sin you confess. The result is twofold: *forgive us our sins* (judicial pardon for the named act) AND *cleanse us from all unrighteousness* (moral purification reaching beyond what we named, to the unrighteousness we did not see). The provision exceeds the request.

> **Greek note.** *Hamartia* moves from singular (v. 8 — sin as principle/nature) to plural (v. 9 — specific sins) — the difference is crucial. *Homologeō* — *homo-* (same) + *logos* (word) — to say the same thing about a sin that God says about it. *Pistos kai dikaios* (faithful and righteous) — Old Testament covenant attributes (Deuteronomy 32:4) applied to the cross\'s logic.`,
      },
      {
        number: 5,
        title: 'The danger of denying we have sinned',
        range: '1:10',
        excerpt: 'If we say that we have not sinned, we make Him a liar and His word is not in us.',
        body: `The third "if we say" (v. 10) closes the trio with the strongest negation in the chapter. Where v. 8 denied sin as a **principle**, v. 10 denies sin as **act** — *we have not sinned* (*ouk hamartēkamen*, perfect tense: we have neither sinned in the past nor are now in a sinful state). The escalation is deliberate. First, claim fellowship while walking in darkness — lie about your walk. Second, claim to be without sin — lie about your nature. Third, claim never to have sinned — lie about your history.

John\'s verdict on the third claim is the chapter\'s most severe: *we make Him a liar, and His word is not in us*. To deny that we have sinned is to call God Himself the liar, because God\'s entire revelation — Old Testament law, prophets, gospel, apostolic writing — assumes universal human sin (Romans 3:23; Isaiah 53:6; Psalm 14:1-3; Psalm 51:5). To deny what God has uniformly affirmed is not a minor disagreement; it impugns His truthfulness. The corollary follows immediately: *His word is not in us*. We have not internalized His message. We have rejected the diagnosis the whole canon offers.

This makes verse 10 the chapter\'s sharpest pastoral test. The chapter is not afraid of believers who **have sinned** — verse 9 has just promised cleansing for them. The chapter is afraid of believers who *cannot bring themselves to admit* they have sinned. The first kind God forgives daily. The second kind has cut themselves off from the very provision the chapter announces. Honest confession opens the channel. Self-protective denial closes it.

Read as a whole, the three "if we say" lines (vv. 6, 8, 10) form a single warning: **profession without honesty is fatal**. And the two positive lines (vv. 7, 9) form the corresponding promise: **walking in the light and confessing what the light exposes meet a God whose Son\'s blood keeps on cleansing**. The chapter\'s invitation is precise: do not protect yourself from being seen. The God who is light has already seen, has already provided, and is faithful to forgive every sin you bring honestly into His presence.

> **Greek note.** *Ouk hamartēkamen* — perfect tense, denying both past act and present state. *Pseustēs* (liar) — the noun form of *pseudomai* in v. 6; John deliberately bookends the conditional trio with the same root.`,
      },
    ],
  },
  application: {
    intro: 'Application is where Observation and Interpretation become obedience. Each question is paired with a movement of the chapter — read it slowly, answer it honestly, and let it land on a specific situation in your week. Don\'t generalize; name the relationship, the moment, the next step.',
    questions: [
      { range: '1:1-4', question: 'Where am I tempted to detach my faith from the historical Jesus of Nazareth — preferring an abstract "Christ-idea" because it makes fewer demands than the Man who really lived, taught, died, and rose? What specific gospel event do I need to reread this week to anchor my faith in fact, not feeling?' },
      { range: '1:3-4', question: 'Whose fellowship with me would make my joy more complete this week if I pursued it? Which believer am I keeping at arm\'s length while claiming to have fellowship with the Father?' },
      { range: '1:5', question: 'What part of my life am I treating as exempt from God\'s light — a category of thought, relationship, or money where I act as if His holiness does not reach? What would full transparency in that area look like?' },
      { range: '1:6-7', question: 'Where am I claiming fellowship with God while walking in darkness — speaking, viewing, spending, or relating in a way I would not let another believer see? What is the single step from concealment to walking in the light?' },
      { range: '1:7', question: 'When did I last operate as if Christ\'s blood is *currently* cleansing me — not as past-tense at conversion but as present-tense provision today? Where am I living as if a particular sin is beyond what the blood reaches?' },
      { range: '1:8-9', question: 'Which sin have I been minimizing, excusing, or relabeling instead of *confessing* — saying the same thing about it that God does? Confess it specifically this week, by name, agreeing with His verdict.' },
      { range: '1:9', question: 'Where am I trusting my feeling of forgiveness more than God\'s stated faithfulness? Read v. 9 aloud and rest the assurance on the promise, not the emotion.' },
      { range: '1:10', question: 'What past sin am I refusing to acknowledge — explaining it as a misunderstanding, a phase, or someone else\'s fault — when an honest accounting would call it what God calls it? Naming it does not condemn me; denying it cuts me off from the cleansing John just promised.' },
    ],
  },
};
