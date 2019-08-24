const Fuzzy = {
    find: function (searchString) {
        const defaultOptions = {
            caseSensitivity: false,
            whiteSpace: false,
            leadingWhiteSpace: false,
            trailingWhiteSpace: false,
            characters: 0,
        };
        let options = defaultOptions;
        return {
            get exactly () {
                options = defaultOptions;
                return this;
            },
            giveOrTake: function (roughly) {
                options = { ...options, ...roughly };
                return this;
            },
            in: function (string) {
                if (options.caseSensitivity) {
                    searchString = searchString.toLowerCase();
                    string = string.toLowerCase();
                }

                const notFuzzy = Object.entries(options)
                    .every(([ key, value ]) => {
                        if (key === 'caseSensitivity')
                            return true;

                        return value === defaultOptions[key];
                    });

                if (notFuzzy) {
                    if (string.indexOf(searchString) < 0)
                        return undefined;

                    const start = string.indexOf(searchString);
                    const end = start + searchString.length;
                    return [ start, end ];
                }

                function testString (start) {
                    let searchCharacterIndex = 0;
                    let stringCharacterIndex = start;

                    function remainingSearchStringCharacters () {
                        return searchString.length - (searchCharacterIndex + 1);
                    }

                    function remainingStringCharacters () {
                        return string.length - (stringCharacterIndex + 1);
                    }

                    while (remainingSearchStringCharacters() && remainingStringCharacters()) {
                        const searchCharacter = searchString[searchCharacterIndex];
                        const stringCharacter = string[stringCharacterIndex];

                        if (stringCharacterIndex === start && searchCharacter !== stringCharacter)
                            return undefined;

                        if (searchCharacter.match(/\s/)) {
                            searchCharacterIndex++;
                            continue;
                        }

                        if (stringCharacter.match(/\s/)) {
                            stringCharacterIndex++;
                            continue;
                        }

                        if (searchCharacter !== stringCharacter)
                            return undefined;

                        searchCharacterIndex++;
                        stringCharacterIndex++;
                    }

                    if (remainingSearchStringCharacters())
                        return undefined;

                    return stringCharacterIndex;
                }

                let start = 0;
                let end;

                while (string.length - start > 0) {
                    end = testString(start);
                    if (end)
                        return [ start, end ];
                    start++;
                }

                return undefined;
            },
        };
    },
};

const { find } = Fuzzy;

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
                    expected: [ 6, 15 ],
                },
                {
                    searchString: 'ipsumdolor',
                    string: 'lorem ipsum dolor sit',
                    expected: [ 6, 16 ],
                },
                {
                    searchString: 'ipsum   dolor',
                    string: 'lorem ipsum dolor sit',
                    expected: [ 6, 16 ],
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

        it.skip('Should find the string give or take the leading white space', () => {
            const actual = find('foo').giveOrTake({
                leadingWhiteSpace: false,
            }).in('bar');
            expect(actual).toEqual([ 0, 0 ]);
        });

        it.skip('Should find the string give or take the trailing white space', () => {
            const actual = find('foo').giveOrTake({
                trailingWhiteSpace: false,
            }).in('bar');
            expect(actual).toEqual([ 0, 0 ]);
        });

        it.skip('Should find the string give or take some characters', () => {
            const actual = find('foo').giveOrTake({
                characters: 0,
            }).in('bar');
            expect(actual).toEqual([ 0, 0 ]);
        });
    });
});