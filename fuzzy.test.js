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

                if (string.indexOf(searchString) < 0)
                    return undefined;

                const start = string.indexOf(searchString);
                const end = start + searchString.length;
                return [ start, end ];
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

        it.skip('Should find the string give or take white space', () => {
            const actual = find('foo').giveOrTake({
                whiteSpace: false,
            }).in('bar');
            expect(actual).toEqual([ 0, 0 ]);
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