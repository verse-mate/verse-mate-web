import { BibleBook, BibleVersion, Chapter, Commentary, VerseInsight, Topic, TopicEvent } from './types';

export const BIBLE_BOOKS: BibleBook[] = [
  // Old Testament
  { name: 'Genesis', shortName: 'Gen', testament: 'OT', chapters: 50 },
  { name: 'Exodus', shortName: 'Exod', testament: 'OT', chapters: 40 },
  { name: 'Leviticus', shortName: 'Lev', testament: 'OT', chapters: 27 },
  { name: 'Numbers', shortName: 'Num', testament: 'OT', chapters: 36 },
  { name: 'Deuteronomy', shortName: 'Deut', testament: 'OT', chapters: 34 },
  { name: 'Joshua', shortName: 'Josh', testament: 'OT', chapters: 24 },
  { name: 'Judges', shortName: 'Judg', testament: 'OT', chapters: 21 },
  { name: 'Ruth', shortName: 'Ruth', testament: 'OT', chapters: 4 },
  { name: '1 Samuel', shortName: '1Sam', testament: 'OT', chapters: 31 },
  { name: '2 Samuel', shortName: '2Sam', testament: 'OT', chapters: 24 },
  { name: '1 Kings', shortName: '1Kgs', testament: 'OT', chapters: 22 },
  { name: '2 Kings', shortName: '2Kgs', testament: 'OT', chapters: 25 },
  { name: '1 Chronicles', shortName: '1Chr', testament: 'OT', chapters: 29 },
  { name: '2 Chronicles', shortName: '2Chr', testament: 'OT', chapters: 36 },
  { name: 'Ezra', shortName: 'Ezra', testament: 'OT', chapters: 10 },
  { name: 'Nehemiah', shortName: 'Neh', testament: 'OT', chapters: 13 },
  { name: 'Esther', shortName: 'Esth', testament: 'OT', chapters: 10 },
  { name: 'Job', shortName: 'Job', testament: 'OT', chapters: 42 },
  { name: 'Psalms', shortName: 'Ps', testament: 'OT', chapters: 150 },
  { name: 'Proverbs', shortName: 'Prov', testament: 'OT', chapters: 31 },
  { name: 'Ecclesiastes', shortName: 'Eccl', testament: 'OT', chapters: 12 },
  { name: 'Song of Solomon', shortName: 'Song', testament: 'OT', chapters: 8 },
  { name: 'Isaiah', shortName: 'Isa', testament: 'OT', chapters: 66 },
  { name: 'Jeremiah', shortName: 'Jer', testament: 'OT', chapters: 52 },
  { name: 'Lamentations', shortName: 'Lam', testament: 'OT', chapters: 5 },
  { name: 'Ezekiel', shortName: 'Ezek', testament: 'OT', chapters: 48 },
  { name: 'Daniel', shortName: 'Dan', testament: 'OT', chapters: 12 },
  { name: 'Hosea', shortName: 'Hos', testament: 'OT', chapters: 14 },
  { name: 'Joel', shortName: 'Joel', testament: 'OT', chapters: 3 },
  { name: 'Amos', shortName: 'Amos', testament: 'OT', chapters: 9 },
  { name: 'Obadiah', shortName: 'Obad', testament: 'OT', chapters: 1 },
  { name: 'Jonah', shortName: 'Jonah', testament: 'OT', chapters: 4 },
  { name: 'Micah', shortName: 'Mic', testament: 'OT', chapters: 7 },
  { name: 'Nahum', shortName: 'Nah', testament: 'OT', chapters: 3 },
  { name: 'Habakkuk', shortName: 'Hab', testament: 'OT', chapters: 3 },
  { name: 'Zephaniah', shortName: 'Zeph', testament: 'OT', chapters: 3 },
  { name: 'Haggai', shortName: 'Hag', testament: 'OT', chapters: 2 },
  { name: 'Zechariah', shortName: 'Zech', testament: 'OT', chapters: 14 },
  { name: 'Malachi', shortName: 'Mal', testament: 'OT', chapters: 4 },
  // New Testament
  { name: 'Matthew', shortName: 'Matt', testament: 'NT', chapters: 28 },
  { name: 'Mark', shortName: 'Mark', testament: 'NT', chapters: 16 },
  { name: 'Luke', shortName: 'Luke', testament: 'NT', chapters: 24 },
  { name: 'John', shortName: 'John', testament: 'NT', chapters: 21 },
  { name: 'Acts', shortName: 'Acts', testament: 'NT', chapters: 28 },
  { name: 'Romans', shortName: 'Rom', testament: 'NT', chapters: 16 },
  { name: '1 Corinthians', shortName: '1Cor', testament: 'NT', chapters: 16 },
  { name: '2 Corinthians', shortName: '2Cor', testament: 'NT', chapters: 13 },
  { name: 'Galatians', shortName: 'Gal', testament: 'NT', chapters: 6 },
  { name: 'Ephesians', shortName: 'Eph', testament: 'NT', chapters: 6 },
  { name: 'Philippians', shortName: 'Phil', testament: 'NT', chapters: 4 },
  { name: 'Colossians', shortName: 'Col', testament: 'NT', chapters: 4 },
  { name: '1 Thessalonians', shortName: '1Thess', testament: 'NT', chapters: 5 },
  { name: '2 Thessalonians', shortName: '2Thess', testament: 'NT', chapters: 3 },
  { name: '1 Timothy', shortName: '1Tim', testament: 'NT', chapters: 6 },
  { name: '2 Timothy', shortName: '2Tim', testament: 'NT', chapters: 4 },
  { name: 'Titus', shortName: 'Titus', testament: 'NT', chapters: 3 },
  { name: 'Philemon', shortName: 'Phlm', testament: 'NT', chapters: 1 },
  { name: 'Hebrews', shortName: 'Heb', testament: 'NT', chapters: 13 },
  { name: 'James', shortName: 'Jas', testament: 'NT', chapters: 5 },
  { name: '1 Peter', shortName: '1Pet', testament: 'NT', chapters: 5 },
  { name: '2 Peter', shortName: '2Pet', testament: 'NT', chapters: 3 },
  { name: '1 John', shortName: '1John', testament: 'NT', chapters: 5 },
  { name: '2 John', shortName: '2John', testament: 'NT', chapters: 1 },
  { name: '3 John', shortName: '3John', testament: 'NT', chapters: 1 },
  { name: 'Jude', shortName: 'Jude', testament: 'NT', chapters: 1 },
  { name: 'Revelation', shortName: 'Rev', testament: 'NT', chapters: 22 },
];

const JOHN_1: Record<BibleVersion, Chapter> = {
  ESV: {
    book: 'John', chapter: 1,
    verses: [
      { number: 1, text: 'In the beginning was the Word, and the Word was with God, and the Word was God.' },
      { number: 2, text: 'He was in the beginning with God.' },
      { number: 3, text: 'All things were made through him, and without him was not any thing made that was made.' },
      { number: 4, text: 'In him was life, and the life was the light of men.' },
      { number: 5, text: 'The light shines in the darkness, and the darkness has not overcome it.' },
      { number: 6, text: 'There was a man sent from God, whose name was John.' },
      { number: 7, text: 'He came as a witness, to bear witness about the light, that all might believe through him.' },
      { number: 8, text: 'He was not the light, but came to bear witness about the light.' },
      { number: 9, text: 'The true light, which gives light to everyone, was coming into the world.' },
      { number: 10, text: 'He was in the world, and the world was made through him, yet the world did not know him.' },
      { number: 11, text: 'He came to his own, and his own people did not receive him.' },
      { number: 12, text: 'But to all who did receive him, who believed in his name, he gave the right to become children of God,' },
      { number: 13, text: 'who were born, not of blood nor of the will of the flesh nor of the will of man, but of God.' },
      { number: 14, text: 'And the Word became flesh and dwelt among us, and we have seen his glory, glory as of the only Son from the Father, full of grace and truth.' },
      { number: 15, text: '(John bore witness about him, and cried out, "This was he of whom I said, \'He who comes after me ranks before me, because he was before me.\'")'  },
      { number: 16, text: 'For from his fullness we have all received, grace upon grace.' },
      { number: 17, text: 'For the law was given through Moses; grace and truth came through Jesus Christ.' },
      { number: 18, text: 'No one has ever seen God; the only God, who is at the Father\'s side, he has made him known.' },
      { number: 19, text: 'And this is the testimony of John, when the Jews sent priests and Levites from Jerusalem to ask him, "Who are you?"' },
      { number: 20, text: 'He confessed, and did not deny, but confessed, "I am not the Christ."' },
      { number: 21, text: 'And they asked him, "What then? Are you Elijah?" He said, "I am not." "Are you the Prophet?" And he answered, "No."' },
      { number: 22, text: 'So they said to him, "Who are you? We need to give an answer to those who sent us. What do you say about yourself?"' },
      { number: 23, text: 'He said, "I am the voice of one crying out in the wilderness, \'Make straight the way of the Lord,\' as the prophet Isaiah said."' },
      { number: 24, text: '(Now they had been sent from the Pharisees.)' },
      { number: 25, text: 'They asked him, "Then why are you baptizing, if you are neither the Christ, nor Elijah, nor the Prophet?"' },
      { number: 26, text: 'John answered them, "I baptize with water, but among you stands one you do not know,' },
      { number: 27, text: 'even he who comes after me, the strap of whose sandal I am not worthy to untie."' },
      { number: 28, text: 'These things took place in Bethany across the Jordan, where John was baptizing.' },
      { number: 29, text: 'The next day he saw Jesus coming toward him, and said, "Behold, the Lamb of God, who takes away the sin of the world!' },
      { number: 30, text: 'This is he of whom I said, \'After me comes a man who ranks before me, because he was before me.\'' },
      { number: 31, text: 'I myself did not know him, but for this purpose I came baptizing with water, that he might be revealed to Israel."' },
      { number: 32, text: 'And John bore witness: "I saw the Spirit descend from heaven like a dove, and it remained on him.' },
      { number: 33, text: 'I myself did not know him, but he who sent me to baptize with water said to me, \'He on whom you see the Spirit descend and remain, this is he who baptizes with the Holy Spirit.\'' },
      { number: 34, text: 'And I have seen and have borne witness that this is the Son of God."' },
      { number: 35, text: 'The next day again John was standing with two of his disciples,' },
      { number: 36, text: 'and he looked at Jesus as he walked by and said, "Behold, the Lamb of God!"' },
      { number: 37, text: 'The two disciples heard him say this, and they followed Jesus.' },
      { number: 38, text: 'Jesus turned and saw them following and said to them, "What are you seeking?" And they said to him, "Rabbi" (which means Teacher), "where are you staying?"' },
      { number: 39, text: 'He said to them, "Come and you will see." So they came and saw where he was staying, and they stayed with him that day, for it was about the tenth hour.' },
      { number: 40, text: 'One of the two who heard John speak and followed Jesus was Andrew, Simon Peter\'s brother.' },
      { number: 41, text: 'He first found his own brother Simon and said to him, "We have found the Messiah" (which means Christ).' },
      { number: 42, text: 'He brought him to Jesus. Jesus looked at him and said, "You are Simon the son of John. You shall be called Cephas" (which means Peter).' },
      { number: 43, text: 'The next day Jesus decided to go to Galilee. He found Philip and said to him, "Follow me."' },
      { number: 44, text: 'Now Philip was from Bethsaida, the city of Andrew and Peter.' },
      { number: 45, text: 'Philip found Nathanael and said to him, "We have found him of whom Moses in the Law and also the prophets wrote, Jesus of Nazareth, the son of Joseph."' },
      { number: 46, text: 'Nathanael said to him, "Can anything good come out of Nazareth?" Philip said to him, "Come and see."' },
      { number: 47, text: 'Jesus saw Nathanael coming toward him and said of him, "Behold, an Israelite indeed, in whom there is no deceit!"' },
      { number: 48, text: 'Nathanael said to him, "How do you know me?" Jesus answered him, "Before Philip called you, when you were under the fig tree, I saw you."' },
      { number: 49, text: 'Nathanael answered him, "Rabbi, you are the Son of God! You are the King of Israel!"' },
      { number: 50, text: 'Jesus answered him, "Because I said to you, \'I saw you under the fig tree,\' do you believe? You will see greater things than these."' },
      { number: 51, text: 'And he said to him, "Truly, truly, I say to you, you will see heaven opened, and the angels of God ascending and descending on the Son of Man."' },
    ],
  },
  NIV: {
    book: 'John', chapter: 1,
    verses: [
      { number: 1, text: 'In the beginning was the Word, and the Word was with God, and the Word was God.' },
      { number: 2, text: 'He was with God in the beginning.' },
      { number: 3, text: 'Through him all things were made; without him nothing was made that has been made.' },
      { number: 4, text: 'In him was life, and that life was the light of all mankind.' },
      { number: 5, text: 'The light shines in the darkness, and the darkness has not overcome it.' },
      { number: 6, text: 'There was a man sent from God whose name was John.' },
      { number: 7, text: 'He came as a witness to testify concerning that light, so that through him all might believe.' },
      { number: 8, text: 'He himself was not the light; he came only as a witness to the light.' },
      { number: 9, text: 'The true light that gives light to everyone was coming into the world.' },
      { number: 10, text: 'He was in the world, and though the world was made through him, the world did not recognize him.' },
    ],
  },
  KJV: {
    book: 'John', chapter: 1,
    verses: [
      { number: 1, text: 'In the beginning was the Word, and the Word was with God, and the Word was God.' },
      { number: 2, text: 'The same was in the beginning with God.' },
      { number: 3, text: 'All things were made by him; and without him was not any thing made that was made.' },
      { number: 4, text: 'In him was life; and the life was the light of men.' },
      { number: 5, text: 'And the light shineth in darkness; and the darkness comprehended it not.' },
      { number: 6, text: 'There was a man sent from God, whose name was John.' },
      { number: 7, text: 'The same came for a witness, to bear witness of the Light, that all men through him might believe.' },
      { number: 8, text: 'He was not that Light, but was sent to bear witness of that Light.' },
      { number: 9, text: 'That was the true Light, which lighteth every man that cometh into the world.' },
      { number: 10, text: 'He was in the world, and the world was made by him, and the world knew him not.' },
    ],
  },
  NLT: {
    book: 'John', chapter: 1,
    verses: [
      { number: 1, text: 'In the beginning the Word already existed. The Word was with God, and the Word was God.' },
      { number: 2, text: 'He existed in the beginning with God.' },
      { number: 3, text: 'God created everything through him, and nothing was created except through him.' },
      { number: 4, text: 'The Word gave life to everything that was created, and his life brought light to everyone.' },
      { number: 5, text: 'The light shines in the darkness, and the darkness can never extinguish it.' },
      { number: 6, text: 'God sent a man, John the Baptist,' },
      { number: 7, text: 'to tell about the light so that everyone might believe because of his testimony.' },
      { number: 8, text: 'John himself was not the light; he was simply a witness to tell about the light.' },
      { number: 9, text: 'The one who is the true light, who gives light to everyone, was coming into the world.' },
      { number: 10, text: 'He came into the very world he created, but the world didn\'t recognize him.' },
    ],
  },
};

const PSALM_23: Record<BibleVersion, Chapter> = {
  ESV: {
    book: 'Psalms', chapter: 23,
    verses: [
      { number: 1, text: 'The LORD is my shepherd; I shall not want.' },
      { number: 2, text: 'He makes me lie down in green pastures. He leads me beside still waters.' },
      { number: 3, text: 'He restores my soul. He leads me in paths of righteousness for his name\'s sake.' },
      { number: 4, text: 'Even though I walk through the valley of the shadow of death, I will fear no evil, for you are with me; your rod and your staff, they comfort me.' },
      { number: 5, text: 'You prepare a table before me in the presence of my enemies; you anoint my head with oil; my cup overflows.' },
      { number: 6, text: 'Surely goodness and mercy shall follow me all the days of my life, and I shall dwell in the house of the LORD forever.' },
    ],
  },
  NIV: {
    book: 'Psalms', chapter: 23,
    verses: [
      { number: 1, text: 'The LORD is my shepherd, I lack nothing.' },
      { number: 2, text: 'He makes me lie down in green pastures, he leads me beside quiet waters,' },
      { number: 3, text: 'he refreshes my soul. He guides me along the right paths for his name\'s sake.' },
      { number: 4, text: 'Even though I walk through the darkest valley, I will fear no evil, for you are with me; your rod and your staff, they comfort me.' },
      { number: 5, text: 'You prepare a table before me in the presence of my enemies. You anoint my head with oil; my cup overflows.' },
      { number: 6, text: 'Surely your goodness and love will follow me all the days of my life, and I will dwell in the house of the LORD forever.' },
    ],
  },
  KJV: {
    book: 'Psalms', chapter: 23,
    verses: [
      { number: 1, text: 'The LORD is my shepherd; I shall not want.' },
      { number: 2, text: 'He maketh me to lie down in green pastures: he leadeth me beside the still waters.' },
      { number: 3, text: 'He restoreth my soul: he leadeth me in the paths of righteousness for his name\'s sake.' },
      { number: 4, text: 'Yea, though I walk through the valley of the shadow of death, I will fear no evil: for thou art with me; thy rod and thy staff they comfort me.' },
      { number: 5, text: 'Thou preparest a table before me in the presence of mine enemies: thou anointest my head with oil; my cup runneth over.' },
      { number: 6, text: 'Surely goodness and mercy shall follow me all the days of my life: and I will dwell in the house of the LORD for ever.' },
    ],
  },
  NLT: {
    book: 'Psalms', chapter: 23,
    verses: [
      { number: 1, text: 'The LORD is my shepherd; I have all that I need.' },
      { number: 2, text: 'He lets me rest in green meadows; he leads me beside peaceful streams.' },
      { number: 3, text: 'He renews my strength. He guides me along right paths, bringing honor to his name.' },
      { number: 4, text: 'Even when I walk through the darkest valley, I will not be afraid, for you are close beside me. Your rod and your staff protect and comfort me.' },
      { number: 5, text: 'You prepare a feast for me in the presence of my enemies. You honor me by anointing my head with oil. My cup overflows with blessings.' },
      { number: 6, text: 'Surely your goodness and unfailing love will pursue me all the days of my life, and I will live in the house of the LORD forever.' },
    ],
  },
};

const GENESIS_1: Record<BibleVersion, Chapter> = {
  ESV: {
    book: 'Genesis', chapter: 1,
    verses: [
      { number: 1, text: 'In the beginning, God created the heavens and the earth.' },
      { number: 2, text: 'The earth was without form and void, and darkness was over the face of the deep. And the Spirit of God was hovering over the face of the waters.' },
      { number: 3, text: 'And God said, "Let there be light," and there was light.' },
      { number: 4, text: 'And God saw that the light was good. And God separated the light from the darkness.' },
      { number: 5, text: 'God called the light Day, and the darkness he called Night. And there was evening and there was morning, the first day.' },
      { number: 6, text: 'And God said, "Let there be an expanse in the midst of the waters, and let it separate the waters from the waters."' },
      { number: 7, text: 'And God made the expanse and separated the waters that were under the expanse from the waters that were above the expanse. And it was so.' },
      { number: 8, text: 'And God called the expanse Heaven. And there was evening and there was morning, the second day.' },
      { number: 9, text: 'And God said, "Let the waters under the heavens be gathered together into one place, and let the dry land appear." And it was so.' },
      { number: 10, text: 'God called the dry land Earth, and the waters that were gathered together he called Seas. And God saw that it was good.' },
    ],
  },
  NIV: {
    book: 'Genesis', chapter: 1,
    verses: [
      { number: 1, text: 'In the beginning God created the heavens and the earth.' },
      { number: 2, text: 'Now the earth was formless and empty, darkness was over the surface of the deep, and the Spirit of God was hovering over the waters.' },
      { number: 3, text: 'And God said, "Let there be light," and there was light.' },
      { number: 4, text: 'God saw that the light was good, and he separated the light from the darkness.' },
      { number: 5, text: 'God called the light "day," and the darkness he called "night." And there was evening, and there was morning—the first day.' },
    ],
  },
  KJV: {
    book: 'Genesis', chapter: 1,
    verses: [
      { number: 1, text: 'In the beginning God created the heaven and the earth.' },
      { number: 2, text: 'And the earth was without form, and void; and darkness was upon the face of the deep. And the Spirit of God moved upon the face of the waters.' },
      { number: 3, text: 'And God said, Let there be light: and there was light.' },
      { number: 4, text: 'And God saw the light, that it was good: and God divided the light from the darkness.' },
      { number: 5, text: 'And God called the light Day, and the darkness he called Night. And the evening and the morning were the first day.' },
    ],
  },
  NLT: {
    book: 'Genesis', chapter: 1,
    verses: [
      { number: 1, text: 'In the beginning God created the heavens and the earth.' },
      { number: 2, text: 'The earth was formless and empty, and darkness covered the deep waters. And the Spirit of God was hovering over the surface of the waters.' },
      { number: 3, text: 'Then God said, "Let there be light," and there was light.' },
      { number: 4, text: 'And God saw that the light was good. Then he separated the light from the darkness.' },
      { number: 5, text: 'God called the light "day" and the darkness "night." And evening passed and morning came, marking the first day.' },
    ],
  },
};

const ROMANS_8: Record<BibleVersion, Chapter> = {
  ESV: {
    book: 'Romans', chapter: 8,
    verses: [
      { number: 1, text: 'There is therefore now no condemnation for those who are in Christ Jesus.' },
      { number: 2, text: 'For the law of the Spirit of life has set you free in Christ Jesus from the law of sin and death.' },
      { number: 3, text: 'For God has done what the law, weakened by the flesh, could not do. By sending his own Son in the likeness of sinful flesh and for sin, he condemned sin in the flesh,' },
      { number: 4, text: 'in order that the righteous requirement of the law might be fulfilled in us, who walk not according to the flesh but according to the Spirit.' },
      { number: 5, text: 'For those who live according to the flesh set their minds on the things of the flesh, but those who live according to the Spirit set their minds on the things of the Spirit.' },
      { number: 6, text: 'For to set the mind on the flesh is death, but to set the mind on the Spirit is life and peace.' },
      { number: 7, text: 'For the mind that is set on the flesh is hostile to God, for it does not submit to God\'s law; indeed, it cannot.' },
      { number: 8, text: 'Those who are in the flesh cannot please God.' },
      { number: 9, text: 'You, however, are not in the flesh but in the Spirit, if in fact the Spirit of God dwells in you. Anyone who does not have the Spirit of Christ does not belong to him.' },
      { number: 10, text: 'But if Christ is in you, although the body is dead because of sin, the Spirit is life because of righteousness.' },
      { number: 28, text: 'And we know that for those who love God all things work together for good, for those who are called according to his purpose.' },
      { number: 31, text: 'What then shall we say to these things? If God is for us, who can be against us?' },
      { number: 37, text: 'No, in all these things we are more than conquerors through him who loved us.' },
      { number: 38, text: 'For I am sure that neither death nor life, nor angels nor rulers, nor things present nor things to come, nor powers,' },
      { number: 39, text: 'nor height nor depth, nor anything else in all creation, will be able to separate us from the love of God in Christ Jesus our Lord.' },
    ],
  },
  NIV: {
    book: 'Romans', chapter: 8,
    verses: [
      { number: 1, text: 'Therefore, there is now no condemnation for those who are in Christ Jesus,' },
      { number: 2, text: 'because through Christ Jesus the law of the Spirit who gives life has set you free from the law of sin and death.' },
      { number: 28, text: 'And we know that in all things God works for the good of those who love him, who have been called according to his purpose.' },
    ],
  },
  KJV: {
    book: 'Romans', chapter: 8,
    verses: [
      { number: 1, text: 'There is therefore now no condemnation to them which are in Christ Jesus, who walk not after the flesh, but after the Spirit.' },
      { number: 2, text: 'For the law of the Spirit of life in Christ Jesus hath made me free from the law of sin and death.' },
      { number: 28, text: 'And we know that all things work together for good to them that love God, to them who are the called according to his purpose.' },
    ],
  },
  NLT: {
    book: 'Romans', chapter: 8,
    verses: [
      { number: 1, text: 'So now there is no condemnation for those who belong to Christ Jesus.' },
      { number: 2, text: 'And because you belong to him, the power of the life-giving Spirit has freed you from the power of sin that leads to death.' },
      { number: 28, text: 'And we know that God causes everything to work together for the good of those who love God and are called according to his purpose for them.' },
    ],
  },
};

const SAMPLE_CHAPTERS: Record<string, Record<BibleVersion, Chapter>> = {
  'John-1': JOHN_1,
  'Psalms-23': PSALM_23,
  'Genesis-1': GENESIS_1,
  'Romans-8': ROMANS_8,
};

export function getChapter(book: string, chapter: number, version: BibleVersion): Chapter {
  const key = `${book}-${chapter}`;
  const data = SAMPLE_CHAPTERS[key];
  if (data && data[version]) return data[version];
  // Fallback: generate placeholder verses
  const verses = Array.from({ length: 10 }, (_, i) => ({
    number: i + 1,
    text: `[${version}] ${book} ${chapter}:${i + 1} — Sample verse text. Full content will be available when connected to a Bible API.`,
  }));
  return { book, chapter, verses };
}

export const COMMENTARIES: Record<string, Commentary[]> = {
  'John-1': [
    { verse: 1, summary: 'The eternal Word', detail: 'John opens his Gospel by echoing Genesis 1:1, establishing that the Word (Logos) existed before creation. The Greek philosophical concept of Logos is repurposed to describe Jesus as the divine reason and creative power of God.' },
    { verse: 3, summary: 'Agent of creation', detail: 'The Word is identified as the agent through whom all things were made, echoing Colossians 1:16 and Hebrews 1:2. Nothing in creation exists apart from the Word\'s creative activity.' },
    { verse: 14, summary: 'The Incarnation', detail: 'The climactic verse of the prologue: the eternal Word "became flesh." The Greek "eskēnōsen" (dwelt/tabernacled) recalls God\'s presence in the tabernacle, signaling a new and permanent dwelling of God among humanity.' },
  ],
};

export const VERSE_INSIGHTS: Record<string, VerseInsight[]> = {
  'John-1': [
    {
      verse: 1,
      crossReferences: ['Genesis 1:1', 'Proverbs 8:22-31', '1 John 1:1-2', 'Revelation 19:13'],
      originalLanguage: 'Ἐν ἀρχῇ ἦν ὁ λόγος (En archē ēn ho logos) — "In [the] beginning was the Word." The imperfect tense "ēn" indicates continuous past existence, not a point of origin.',
      historicalContext: 'Written around 90 AD in Ephesus, John\'s prologue bridges Jewish monotheism and Greek philosophy. "Logos" was a term familiar to both Hellenistic Jews (via Philo of Alexandria) and Greek Stoic philosophers.',
    },
    {
      verse: 14,
      crossReferences: ['Philippians 2:6-8', 'Colossians 1:15', '1 Timothy 3:16', 'Hebrews 2:14'],
      originalLanguage: 'Καὶ ὁ λόγος σὰρξ ἐγένετο (Kai ho logos sarx egeneto) — "And the Word became flesh." "Egeneto" (became) contrasts with "ēn" (was) in verse 1, marking a definitive moment of incarnation.',
      historicalContext: 'The claim that the divine Logos became "flesh" (sarx) was scandalous to both Greek and Jewish audiences. Greeks saw flesh as inferior; Jews guarded God\'s transcendence. This verse became central to Christological debates in the early church.',
    },
  ],
};

export const TOPICS: Topic[] = [
  { id: '1', name: 'Creation', description: 'God\'s creative work and the origin of all things', icon: 'Sparkles' },
  { id: '2', name: 'Salvation', description: 'God\'s plan for redeeming humanity', icon: 'Heart' },
  { id: '3', name: 'Prayer', description: 'Communication with God', icon: 'MessageCircle' },
  { id: '4', name: 'Faith', description: 'Trust and belief in God', icon: 'Shield' },
  { id: '5', name: 'Love', description: 'God\'s love and how we love others', icon: 'Heart' },
  { id: '6', name: 'Prophecy', description: 'Messages from God about the future', icon: 'Eye' },
  { id: '7', name: 'Miracles', description: 'Supernatural acts of God', icon: 'Zap' },
  { id: '8', name: 'Wisdom', description: 'Godly wisdom and understanding', icon: 'BookOpen' },
];

export const TOPIC_EVENTS: TopicEvent[] = [
  { id: 'e1', topicId: '1', title: 'Creation of the World', description: 'God created the heavens and the earth in six days and rested on the seventh.', references: ['Genesis 1:1-2:3'] },
  { id: 'e2', topicId: '1', title: 'Creation of Humanity', description: 'God formed man from the dust and breathed life into him.', references: ['Genesis 2:7', 'Genesis 1:26-27'] },
  { id: 'e3', topicId: '2', title: 'The Exodus', description: 'God delivered Israel from slavery in Egypt.', references: ['Exodus 12-14'] },
  { id: 'e4', topicId: '2', title: 'The Cross', description: 'Jesus died for the sins of the world.', references: ['John 19:17-30', 'Romans 5:8'] },
  { id: 'e5', topicId: '7', title: 'Parting the Red Sea', description: 'God parted the Red Sea so Israel could cross on dry ground.', references: ['Exodus 14:21-22'] },
  { id: 'e6', topicId: '7', title: 'Water into Wine', description: 'Jesus performed his first miracle at the wedding in Cana.', references: ['John 2:1-11'] },
];
