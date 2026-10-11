INSERT INTO explanations (type, explanation, chapter_id, language_code)
SELECT fixture.type::explanation_type_enum, fixture.body, chapters.chapter_id, 'en'
FROM chapters
JOIN books ON books.book_id = chapters.book_id
CROSS JOIN (
  VALUES
    ('summary', $$Genesis 1 tells how God makes the heavens and the earth in six days and rests on the seventh. Each day closes with the note that what He made was good, and people are made in His image to care for what He made.$$),
    ('byline', $$## Genesis 1:1
### Summary
The first line names God as the maker of everything that exists.

## Genesis 1:2
### Summary
Before the first day the earth is empty and dark, and the Spirit of God moves over the waters.

## Genesis 1:3
### Summary
God speaks, and light appears: creation happens by His word.$$),
    ('detailed', $$## Order out of emptiness
The six days fall into two sets of three. The first three shape spaces (light and dark, sky and sea, land), and the next three fill them (lights, birds and fish, animals and people).

## People in His image
Only people are made in the image of God, and they are given the care of the earth.$$)
) AS fixture(type, body)
WHERE books.name = 'Genesis' AND chapters.chapter_number = 1
ON CONFLICT DO NOTHING;
