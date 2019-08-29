const { find } = require('./fuzzy');

describe('Find', () => {
    describe('Exactly', () => {
        it('Should return the start and end index', () => {
            const searchString = 'ipsum';
            const string = 'lorem ipsum dolor';

            [
                find(searchString).in(string),
                find(searchString).exactly.in(string),
                find(searchString).giveOrTake({
                    caseSensitivity: false,
                    whiteSpace: false,
                    leadingWhiteSpace: false,
                    trailingWhiteSpace: false,
                    characters: 0,
                }).in(string),
            ]
                .forEach(actual => expect(actual).toEqual([ 6, 11 ]));
        });

        it('Should return undefined', () => {
            const actual = find('foo').in('bar');
            expect(actual).toBeUndefined();
        });
    });

    describe('Give or take', () => {
        it('Should find the string give or take the case', () => {
            const searchString = 'ipsum';
            const string = 'lorem ipSum dolor';

            const success = find(searchString).giveOrTake({
                caseSensitivity: true,
            }).in(string);
            expect(success).toEqual([ 6, 11 ]);

            const error = find(searchString).giveOrTake({
                caseSensitivity: false,
            }).in(string);
            expect(error).toBeUndefined();
        });

        it('Should find the string give or take white space', () => {
            [
                {
                    searchString: 'ipsum dolor',
                    string: 'lorem ipsumdolor sit',
                    expected: [ 6, 16 ],
                },
                {
                    searchString: 'ipsumdolor',
                    string: 'lorem ipsum dolor sit',
                    expected: [ 6, 17 ],
                },
                {
                    searchString: 'ipsum   dolor',
                    string: 'lorem ipsum dolor sit',
                    expected: [ 6, 17 ],
                },
            ]
                .forEach(({ searchString, string, expected }) => {
                    const success = find(searchString).giveOrTake({
                        whiteSpace: true,
                    }).in(string);
                    expect(success).toEqual(expected);

                    const error = find(searchString).giveOrTake({
                        whiteSpace: false,
                    }).in(string);
                    expect(error).toBeUndefined();
                });
        });

        it('Should find the string give or take the leading white space', () => {
            [
                {
                    searchString: ' ipsum dolor',
                    string: 'loremipsumdolor sit',
                    expected: [ 5, 15 ],
                },
                {
                    searchString: ' ipsum   dolor',
                    string: 'loremipsum dolor sit',
                    expected: [ 5, 16 ],
                },
                // Greedy leading white space
                {
                    searchString: '  ipsumdolor',
                    string: 'lorem ipsum dolor sit',
                    expected: [ 5, 17 ],
                },
            ]
                .forEach(({ searchString, string, expected }) => {
                    const success = find(searchString).giveOrTake({
                        whiteSpace: true,
                        leadingWhiteSpace: true,
                    }).in(string);
                    expect(success).toEqual(expected);

                    const error = find(searchString).giveOrTake({
                        whiteSpace: true,
                        leadingWhiteSpace: false,
                    }).in(string);
                    expect(error).toBeUndefined();
                });
        });

        it('Should find the string give or take the trailing white space', () => {
            [
                {
                    searchString: 'ipsum dolor ',
                    string: 'lorem ipsumdolorsit',
                    expected: [ 6, 16 ],
                },
                {
                    searchString: 'ipsum   dolor ',
                    string: 'lorem ipsum dolorsit',
                    expected: [ 6, 17 ],
                },
                // Greedy trailing white space
                {
                    searchString: 'ipsumdolor  ',
                    string: 'lorem ipsum dolor sit',
                    expected: [ 6, 18 ],
                },
            ]
                .forEach(({ searchString, string, expected }) => {
                    const success = find(searchString).giveOrTake({
                        whiteSpace: true,
                        trailingWhiteSpace: true,
                    }).in(string);
                    expect(success).toEqual(expected);

                    const error = find(searchString).giveOrTake({
                        whiteSpace: true,
                        trailingWhiteSpace: false,
                    }).in(string);
                    expect(error).toBeUndefined();
                });
        });

        it.skip('Should find the string give or take some characters', () => {
            const actual = find('foo').giveOrTake({
                characters: 0,
            }).in('bar');
            expect(actual).toEqual([ 0, 0 ]);
        });

        it.skip('Should just work', () => {
            const actual = find('is .159 and ').giveOrTake({
                whiteSpace: true,
                characters: 5,
            }).in('Pie is 3.14159 and tastes good');
            expect(actual).toEqual([ 4, 19 ]);
        });
    });
});