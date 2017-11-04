# Internals

## what an object consists of

    has id, a unique string
    has position in pixels (x, y)
    has an optional state, a string

    has an optional class, a string (defining default attributes such)
    has dimensions in pixels (w, h)
    has rotation in degrees (defaults to 0)
    has anchor, an array of floats to determine the pivot point of the object (0.5, 0.5)
    can have src, a string URL
    can have color: a string color
    can have alpha, a float between 0 and 1
    has an optional object, with a composed key of from:to:attr.
      from can be *
      from and to are state names
      the usage of this lookup is to apply attr changes when state change, such as changing the color or image when a card flips, dice rolls, etc.
    has an optional array of actions
      action has a name, array of params, function
      param has name, default value, description, possible values
    blocked, boolean: can't be moved
    disabled, boolean: can't be acted upon


## example objects

    piece - like a chess piece or a piece in the monopoly game
    dice - has n facets (ex: 6). can be rolled
    card - has 2 faces. can be flipped
    counter - displays a number, can be incremented, decremented, set
    label - displays text. can be set
    pile - array of objects. there can be dedicated piles such as a card-pile, which actions such as flip, shuffle, align, etc.

most objects exist in array of global board

there must some user-related objects.


## user

    name, string
    camera, having: position, rotation, scale
    team name, a string
    color, a string
    avatar, a string url