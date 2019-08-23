# fuzzy
Find a search string in a string.


## API

### `find(searchString)`

`searchString`: search string to find
* `exactly`: resets search options to defaults of an exact match
* `giveOrTake(options)`: defaults to an exact match
    * `caseSensitivity`: defaults to false
    * `whiteSpace`: defaults to false
    * `leadingWhiteSpace`: defaults to false
    * `trailingWhiteSpace`: defaults to false
    * `characters`: defaults to 0
* `in(string)`: string to search in