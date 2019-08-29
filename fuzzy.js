
const DEFAULT_OPTIONS = {
    caseSensitivity: false,
    whiteSpace: false,
    leadingWhiteSpace: false,
    trailingWhiteSpace: false,
    characters: 0,
};

function indexOf ({ value, string, options }) {
    if (options.caseSensitivity) {
        value = value.toLowerCase();
        string = string.toLowerCase();
    }

    const exact = Object.entries(options)
        .every(([ key, value ]) => {
            if (key === 'caseSensitivity')
                return true;

            return value === DEFAULT_OPTIONS[key];
        });

    if (exact) {
        if (string.indexOf(value) < 0)
            return undefined;

        const start = string.indexOf(value);
        const end = start + value.length;
        return [ start, end ];
    }

    let leadingWhiteSpace;
    [ , leadingWhiteSpace, value ] = value.match(/^(\s*)(.*)/);

    let trailingWhiteSpace;
    [ , value, trailingWhiteSpace ] = value.match(/(.*?)(\s*)$/);

    function greedyLeadingWhiteSpace () {
        while (leadingWhiteSpace) {
            if (leadingWhiteSpace[leadingWhiteSpace.length - 1] === string[start - 1]) {
                leadingWhiteSpace = leadingWhiteSpace.substring(0, leadingWhiteSpace.length - 1);
                start--;
            } else {
                return;
            }
        }
    }

    function testString () {
        let valueCharacterIndex = 0;
        let stringCharacterIndex = start;

        function remainingValueCharacters () {
            return value.length - valueCharacterIndex;
        }

        function remainingStringCharacters () {
            return string.length - stringCharacterIndex;
        }

        function greedyTrailingWhiteSpace () {
            while (trailingWhiteSpace) {
                if (trailingWhiteSpace[0] === string[stringCharacterIndex]) {
                    trailingWhiteSpace = trailingWhiteSpace.substring(1);
                    stringCharacterIndex++;
                } else {
                    return;
                }
            }
        }

        if (!options.leadingWhiteSpace) {
            if (string.indexOf(leadingWhiteSpace, stringCharacterIndex) !== stringCharacterIndex)
                return undefined;
            stringCharacterIndex += leadingWhiteSpace.length;
        }

        while (
            remainingValueCharacters() > 0 &&
            remainingStringCharacters() > 0
        ) {
            const valueCharacter = value[valueCharacterIndex];
            const stringCharacter = string[stringCharacterIndex];

            if (stringCharacterIndex === start && valueCharacter !== stringCharacter)
                return undefined;

            if (options.whiteSpace) {
                if (valueCharacter.match(/\s/)) {
                    valueCharacterIndex++;
                    continue;
                }

                if (stringCharacter.match(/\s/)) {
                    stringCharacterIndex++;
                    continue;
                }
            }

            if (valueCharacter !== stringCharacter)
                return undefined;

            if (remainingValueCharacters() > 1) {
                valueCharacterIndex++;
                stringCharacterIndex++;
                continue;
            }

            stringCharacterIndex++;
            if (!options.trailingWhiteSpace) {
                if (string.indexOf(trailingWhiteSpace, stringCharacterIndex) !== stringCharacterIndex)
                    return undefined;
                stringCharacterIndex += trailingWhiteSpace.length;
            } else {
                greedyTrailingWhiteSpace();
            }
            return stringCharacterIndex;
        }

        if (remainingValueCharacters() > 0)
            return undefined;

        if (!options.trailingWhiteSpace) {
            if (string.indexOf(trailingWhiteSpace, stringCharacterIndex) !== stringCharacterIndex)
                return undefined;
            stringCharacterIndex += trailingWhiteSpace.length;
        } else {
            greedyTrailingWhiteSpace();
        }
        return stringCharacterIndex;
    }

    let start = 0;
    let end;

    while (string.length - start > 0) {
        end = testString();
        if (end) {
            if (options.leadingWhiteSpace)
                greedyLeadingWhiteSpace();
            return [ start, end ];
        }
        start++;
    }

    return undefined;
}

const Fuzzy = {
    indexOf,
    find: function (value) {
        let options = DEFAULT_OPTIONS;
        return {
            get exactly () {
                options = DEFAULT_OPTIONS;
                return this;
            },
            giveOrTake: function (roughly) {
                options = { ...options, ...roughly };
                return this;
            },
            in: function (string) {
                return indexOf({ value, string, options });
            },
        };
    },
};

module.exports = Fuzzy;