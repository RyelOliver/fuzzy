const {
    indexOf,
    find, within, giveOrTake,
} = require('./fuzzy');

describe('Find', () => {
    describe('Exactly', () => {
        it('Should return the start and end index', () => {
            const value = 'ipsum';
            const string = 'lorem ipsum dolor';

            [
                find(value).within(string),
                find(value).exactly.within(string),
                find(value).giveOrTake({
                    caseSensitivity: false,
                    whiteSpace: false,
                    leadingWhiteSpace: false,
                    trailingWhiteSpace: false,
                    characters: 0,
                }).within(string),
            ]
                .forEach(actual => expect(actual).toEqual([ 6, 11 ]));
        });

        it('Should return undefined', () => {
            const actual = find('foo').within('bar');
            expect(actual).toBeUndefined();
        });
    });

    describe('Give or take', () => {
        it('Should find the string give or take the case', () => {
            const value = 'ipsum';
            const string = 'lorem ipSum dolor';

            const success = find(value).giveOrTake({
                caseSensitivity: true,
            }).within(string);
            expect(success).toEqual([ 6, 11 ]);

            const error = find(value).giveOrTake({
                caseSensitivity: false,
            }).within(string);
            expect(error).toBeUndefined();
        });

        it('Should find the string give or take white space', () => {
            [
                {
                    value: 'ipsum dolor',
                    string: 'lorem ipsumdolor sit',
                    expected: [ 6, 16 ],
                },
                {
                    value: 'ipsumdolor',
                    string: 'lorem ipsum dolor sit',
                    expected: [ 6, 17 ],
                },
                {
                    value: 'ipsum   dolor',
                    string: 'lorem ipsum dolor sit',
                    expected: [ 6, 17 ],
                },
            ]
                .forEach(({ value, string, expected }) => {
                    const success = find(value).giveOrTake({
                        whiteSpace: true,
                    }).within(string);
                    expect(success).toEqual(expected);

                    const error = find(value).giveOrTake({
                        whiteSpace: false,
                    }).within(string);
                    expect(error).toBeUndefined();
                });
        });

        it('Should find the string give or take the leading white space', () => {
            [
                {
                    value: ' ipsum dolor',
                    string: 'loremipsumdolor sit',
                    expected: [ 5, 15 ],
                },
                {
                    value: ' ipsum   dolor',
                    string: 'loremipsum dolor sit',
                    expected: [ 5, 16 ],
                },
                // Greedy leading white space
                {
                    value: '  ipsumdolor',
                    string: 'lorem ipsum dolor sit',
                    expected: [ 5, 17 ],
                },
            ]
                .forEach(({ value, string, expected }) => {
                    const success = find(value).giveOrTake({
                        whiteSpace: true,
                        leadingWhiteSpace: true,
                    }).within(string);
                    expect(success).toEqual(expected);

                    const error = find(value).giveOrTake({
                        whiteSpace: true,
                        leadingWhiteSpace: false,
                    }).within(string);
                    expect(error).toBeUndefined();
                });
        });

        it('Should find the string give or take the trailing white space', () => {
            [
                {
                    value: 'ipsum dolor ',
                    string: 'lorem ipsumdolorsit',
                    expected: [ 6, 16 ],
                },
                {
                    value: 'ipsum   dolor ',
                    string: 'lorem ipsum dolorsit',
                    expected: [ 6, 17 ],
                },
                // Greedy trailing white space
                {
                    value: 'ipsumdolor  ',
                    string: 'lorem ipsum dolor sit',
                    expected: [ 6, 18 ],
                },
            ]
                .forEach(({ value, string, expected }) => {
                    const success = find(value).giveOrTake({
                        whiteSpace: true,
                        trailingWhiteSpace: true,
                    }).within(string);
                    expect(success).toEqual(expected);

                    const error = find(value).giveOrTake({
                        whiteSpace: true,
                        trailingWhiteSpace: false,
                    }).within(string);
                    expect(error).toBeUndefined();
                });
        });

        it.skip('Should find the string give or take some characters', () => {
            [
                'rm ipsm dol',
                'rem isu dol',
                'rem ipum dl',
            ]
                .forEach(value => {
                    const actual = find(value).giveOrTake({
                        characters: 2,
                    }).within('lorem ipsum dolor sit amet');
                    expect(actual).toEqual([ 2, 15 ]);
                });
        });

        it.skip('Should just work', () => {
            const actual = find('is .159 and ').giveOrTake({
                whiteSpace: true,
                characters: 5,
            }).within('Pie is 3.14159 and tastes good');
            expect(actual).toEqual([ 4, 19 ]);
        });
    });
});