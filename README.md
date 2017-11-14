# tabletop

## intro

Trying to come up with a simple but useful tabletop simulation or sandbox.  
This is an attempt to create an engine akin to the lovely
[tabletopia](https://tabletopia.com/) and
[tabletop simulator](http://store.steampowered.com/app/286160/Tabletop_Simulator/).

The focus here is on simplicity, portability and I intend to support bots later on
to both play the game (as a player) and enforce rules (as a referee).

The visual part is supposed to be super simple 2D and expose actions via dragging with
the left button (moving) and performing additional actions with the right button,
via a radial menu.

By the time bots get supported, this may cease to be a sandbox if I get to enforce
game rules.

I'm trying to depend the very least on both the platform and the language,
so relying on canvas for rendering. The idea is to be able to port this without much effort.

## TODO
* fix bug on flip group failing
* zones (bags of objects, aligning positioning by stacking or placing in linear direction)
* camera support (position, rotation, scale)


## more distance roadmap

* support a bot to be able to log the actions and enforce rules.  
* support a bot to log in and act as a player.


## definition

Read the [internals](INTERNALS.md)


## externals

I'm starting the artwork by using [kenney's boardgame pack](https://kenney.nl/assets/boardgame-pack).


## reference material

* [canvas cheat sheet](https://simon.html5.org/dump/html5-canvas-cheat-sheet.html)
