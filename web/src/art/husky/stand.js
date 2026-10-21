// Standing pose: key frame, overlays and the clips played standing.
// Hand-drawn pixel frames; see index.js for the format.
export const STAND = String.raw`
# key pose: standing, side view
frame stand
point eye 49,23
point mouth 55,26
point ear 45,8
point look 37,8
point head 50,7
point tail 14,16
point belly 26,31
point body 33,40
point feet 33,58
part head 37,8,30,30
part tail 13,15,17,18
part leg 16,46,14,13
part leg 38,45,13,14
set eyes=side ears=side tail=curl look=stand breathe=stand
........................................................................
........................................................................
........................................................................
........................................................................
........................................................................
........................................................................
........................................................................
........................................................................
........................................................................
.................................................KK.....................
................................................KDDK....................
.........................................KK.....KDDK....................
........................................KDDK...KDDLDK...................
........................................KDDK...KDLWDK...................
.......................................KDDDDK.KDDLWWDK..................
.......................................KDDDDK.KDLWWWDK..................
...................KKKKKK..............KDDDDDKDDLWWWLDK.................
.................KKDDDDDDKK...........KDDDDDDKDDLWWWLDK.................
................KDDDDDDDDDDKK.........KDDDDDDKDDDLLLDDDK................
...............KDDDDDDDDDDDDDK........KDDDDDDDDDDDDDDDDDK...............
...............KDDDDDLLLLDDDDK.......KDDDDDDDDDDDDDDDDDDDKK.............
..............KDDDLLKKKKKWDDDK.......KDDDDDDDDDDDDDDWWDDDDDK............
..............KDDLLK.....KWDDK.......KDDDDDDDDDDDDDDDDDDDDDDK...........
..............KDDLWK.....KWWWK.......KDDDDDDDDDDDDKKKKWWWWWWKKKKK.......
..............KDDLWK......KKK........KDDDDDDDDDDDKBEbBKWWLLLLNNNK.......
..............KDDLWK.................KDDDDDDDDGGGKBbbBKWWWWWWNNNNK......
...............KDDLWK................KDDDDDDDGGGWWKKKKWWWWWWWWWWK.......
...............KDDLWWK...............KDDDDDDGGGWWWWWWWWWWKWWWWWK........
................KDDLWWK..............KDDDDDGGGWWWWWWWWWWWWKKKKK.........
................KDDDLWWK............KDDDDDGGGWWWWWWWWWWWWWwwwK..........
.................KDDDLWWK..........KDDDDDGGGWWWWWWWWWWWWWKKKK...........
..................KDDDLLWWK.......KDDDDDGGWWWWWWWWWWWWWWK...............
...................KDDDLLKKKKKKKKKDDDDDDGWWWWWWWWWWWWWWKK...............
....................KKKKKDDDDDDDDDDDDDDDGWWWWWWWWWWWWWK.................
....................KKDDDDDDDDDDDDDDDDDDGWWWWWWWWWWWwK..................
...................KDDDDDDDDDDDDDDDDDDDDDWWWWWWWWWWKK...................
..................KDDDDDDDDDDDDDDDDDDDDDDDWWWWWWWK......................
..................KDDGDDDGGDDGGGDDDGGDDGGGDWWWWWwK......................
..................KGDGGGGGDGGKKDGGGGGGDGGGGDWWWKWK......................
..................KGGGGGGGGGGGGKGGGGGGGGGGGGGWWWWK......................
..................KGGGGGGGGGGGGGKGGGGGGGGGGGGWWWWK......................
..................KGGGGGGGGGGGGGKGGGGGGGGGGGGWWWWK......................
..................KGGLLLGGLLLLGLKLLLGGLLLLGLLWWWWK......................
..................KLGLLLLLLGLLLLKGLLLLLLGLLLLWWWWK......................
..................KLLLWWLLLLWWWKLLLLWWLLLWWWLWWWWK......................
..................KWWWWWWWWWWWWKWWWWWWWWWWWWWWWWWK......................
................KKKKWWWWWWWWWWKWWWWWWWWWWWWWKwWWWK......................
................KLLGKWWWWWWWWKwwwwwwwwwwwwwwKwWWWK......................
................KGLLKKWWWWWWKKKKKKKKKKKKKKKKKwWWWK......................
................KGLLK.KwWWWWK.........KGLLK.KwWWWK......................
................KGLLK.KwWWWWK.........KGLLK.KwWWWK......................
................KGLLK.KwWWWWK.........KGLLK.KwWWWK......................
................KGLLK.KwWWWWK.........KGLLK.KwWWWK......................
................KGLLK.KwWWWWK.........KGLLK.KwWWWK......................
................KGLLK.KwWWWWK.........KGLLK.KwWWWK......................
................KGLLK.KwWWWWK.........KGLLK.KwWWWK......................
................KGLLLKKwWWWWWK........KGLLLKKwWWWWK.....................
................KGGKGKKwwwwKwK........KGGKGKKwwwKwK.....................
.................KKKK..KKKKKK..........KKKK..KKKKK......................
........................................................................

# eyes closed (blink)
stamp blink_side @eye 0,0
~DDDD~
DDDDDD
~KKKK~
~WWWW~

# near ear flicks back
stamp twitch_side @ear 0,1
~~~~..~~~~
~~K~...~~~
~KDDKK.~~~
~KD~LDK~~~
KDDLW~~DK~
KDLWW~~~~~
KDLW~~L~DK
~~~~LLLD~~
~~~DDDDD~~

# looks at you
stamp look_front_stand @look 0,1
~~~KK~~~~~~~..~~~~~~~KK~~~~~~
~~KDDK~~~~~....~~~~~KDDK~~~~~
~~KDD~~~~~~....~~~~~KDDK~~~~~
~KDP~~~~~~......~~~KDDPDK~~~~
~KDPP~~~~~......~~~KDPPDK~~~~
~KDPP~~~~.KKKKKK.~KDDPPDK~~~~
~KDPPP~DK~~DDDD~~KDDPPPDK~~~~
~KDWPP~~D~~DDDDD~DDDPPWDK~~~~
~~~~WP~~D~~DDDDD~DDDPWDDK~~~~
~~~~~~~~D~~~DDD~~~DDDDDDK~~~~
~~~~~~WW~~~~~~~~~~WWDDDDK~~~~
.K~~~KKKK~~~~~~~~KKK~DDDK~~~~
.K~~KBEbBK~~~~~DKBEbBKDDK~~~~
.KW~KBbbBKW~~~~WKBbbBK~WK~~~~
.KWWWKKKKWWW~DWWWKKKK~~W~...~
.KWWWWWWWWWLLLLWWW~~WWWWK...~
.KWWWWWWWWKNNNNKWW~~~~~~K....
.KWWWWWWWWWKNN~WW~~~~~~~K...~
..KWWWWWWK~~KK~~K~~~W~~K...~~
..KWWWWWW~KK~~KK~~~~~WW~..~~~
~~~KWWWW~~~~~~~~~~~~~WK..~~~~
~~~KwWW~~~~~~~~~~~~~Ww~.~~~~~
~~~DKw~~~~~~~~~~~~~WwK~~~~~~~
~~~DK~ww~~~~~~~~~~wwWK~~~~~~~
~~~DDK~~~wwwwwwwwWWWK~~~~~~~~
~~~DDDK~~~~~~~~WWWWK~~~~~~~~~
~~~~DDDK~~~~~~WWWWK~~~~~~~~~~
~~~~~DDDK~~~WWWWWK~~~~~~~~~~~
~~~~~~DG~~~W~~~~~~~~~~~~~~~~~
~~~~~~~G~~W~~~~~~~~~~~~~~~~~~

# blink while looking at you
stamp blink_front @look 0,1
~~~KK~~~~~~~..~~~~~~~KK~~~~~~
~~KDDK~~~~~....~~~~~KDDK~~~~~
~~KDD~~~~~~....~~~~~KDDK~~~~~
~KDP~~~~~~......~~~KDDPDK~~~~
~KDPP~~~~~......~~~KDPPDK~~~~
~KDPP~~~~.KKKKKK.~KDDPPDK~~~~
~KDPPP~DK~~DDDD~~KDDPPPDK~~~~
~KDWPP~~D~~DDDDD~DDDPPWDK~~~~
~~~~WP~~D~~DDDDD~DDDPWDDK~~~~
~~~~~~~~D~~~DDD~~~DDDDDDK~~~~
~~~~~~WW~~~~~~~~~~WWDDDDK~~~~
.K~~~~~~~~~~~~~~~~~~DDDDK~~~~
.K~~~~~~~~~~~~~DD~~~~~DDK~~~~
.KW~~KKKK~W~~~~W~KKKK~~WK~~~~
.KWWWWWWWWWW~DWWW~~~~~~W~...~
.KWWWWWWWWWLLLLWWW~~WWWWK...~
.KWWWWWWWWKNNNNKWW~~~~~~K....
.KWWWWWWWWWKNN~WW~~~~~~~K...~
..KWWWWWWK~~KK~~K~~~W~~K...~~
..KWWWWWW~KK~~KK~~~~~WW~..~~~
~~~KWWWW~~~~~~~~~~~~~WK..~~~~
~~~KwWW~~~~~~~~~~~~~Ww~.~~~~~
~~~DKw~~~~~~~~~~~~~WwK~~~~~~~
~~~DK~ww~~~~~~~~~~wwWK~~~~~~~
~~~DDK~~~wwwwwwwwWWWK~~~~~~~~
~~~DDDK~~~~~~~~WWWWK~~~~~~~~~
~~~~DDDK~~~~~~WWWWK~~~~~~~~~~
~~~~~DDDK~~~WWWWWK~~~~~~~~~~~
~~~~~~DG~~~W~~~~~~~~~~~~~~~~~
~~~~~~~G~~W~~~~~~~~~~~~~~~~~~

# looks up
stamp look_up_stand @look -5,1
~~~~~~~KK~~~~~~~~..~~~~~~~~~~~~~~~
~~~~~~KDDK~~~~~~....~~~~~~~~~~~~~~
~~~~~~KDDD~K~~~~....~~~~~~~~~~~~~~
~~~~~~KDDL~DK~~......~~~~~~~~~~~~~
~~~~~~KDDWWDDKK......~~~~~~~~~~~~~
~K~~~~KD~WWWLDDK......~~~~~~~~~~~~
KDK~~~KD~WWWWLD~DKKKK.~~~KK~~~~~~~
KDDKK~KD~LWWLD~~DDDDDK~KKNNNK~~~~~
KDDDDK~~~~LLLD~~DDDDDWWLNNNNK~~~~~
KDDDDD~~~~~~~D~WWDDWWWLWWKKK~~~~~~
KDDDDDDK~~~~~~~~~~WWWLWWWWWK~~~~~~
~KDDDD~~~~~~~~~KKKKWWWWWWW~K~~~~~~
~KDDDD~~~~~~~~KBEbKW~~KKKKK.~~~~~~
~KDDDD~~~~~~~~KBbbKWWWWwwwK..~~~~~
~KDDDD~~~~~~~~~KKKWWWW~wKKK......~
~KDDDD~~~~~~GGGWWWWWWWW~K........~
~KDDDD~~~~~GGGWWWWWWWWWK..........
~~KDDD~~~~~GGWWW~~WWWW~K.........~
~~KDDD~~~~~G~WW~~~~~~~~K........~~
~~~KDD~~~~G~~W~~~~~~~~K........~~~
~~~KD~~~~~~~W~~~~~~~~~K.......~~~~
~~~~~~~~~D~~~~~~~~~~~K.......~~~~~
~~~~~~~~D~GG~~~~~~~~~K...~~~~~~~~~
~~~~~~~~DGG~~~~~~~~~K....~~~~~~~~~
~~~~~~~~DG~~~~~~~~~K...~~~~~~~~~~~
~~~~~~~~DG~~~~~~~~~K..~~~~~~~~~~~~
~~~~~~~~~DG~~~~~~~K..~~~~~~~~~~~~~
~~~~~~~~~~DD~~~~~WK~~~~~~~~~~~~~~~
~~~~~~~~~~~DG~~~W~~~~~~~~~~~~~~~~~
~~~~~~~~~~~~G~~W~~~~~~~~~~~~~~~~~~

# looks down
stamp look_down_stand @look 0,1
~~~~~~~~~~~~..~~~~~~~~~~~~~~~~
~~~~~~~~~~~....~~~~~~~~~~~~~~~
~~~~..~~~~~....~~~~~~~~~~~~~~~
~~~....~~~.K~K..~~~~~~~~~~~~~~
~~~....~~K~~DK..~~~KKK~~~~~~~~
~~......~~~~DDK..~KKDDK~~~~~~~
~~......KD~DDDK..KDDDDK~~~~~~~
~~.....KD~~DDDK.KDDLLDK~~~~~~~
~.....K~D~~DDDKK~DLWWDK~~~~~~~
~....K~~D~~~DDK~~LWWWDK~~~~~~~
~...K~~~~~~~~K~~LWWWWDK~~~~~~~
....K~~~~~~~~~~~~WWWLDK~~~~~~~
...KK~~~~~~~~~~DDLLLL~~~~~~~~~
...K~~~~~~~~~~~~~~~~~~K.~~~~~~
...K~~~~~~~~~DDDDDDDDDK.....~~
..K~~~~~~~~~DDDDDDDDDDDK....~~
..K~~~~~~DDDDDDDDD~~DDDK.....~
.K~~~~~~DDDGGDD~~KKDDDDKK...~~
.K~~~~~D~~GGGGKBEbBKDDDDK..~~~
~~~~~G~~~GGG~~KBbbBK~WDDD~~~~~
~~~GG~~~G~~~~~~KKKK~~WWWDK~~~~
~~~GWWW~~~~~~~~~~~~~WWLLLKK~~~
~~GWW~~~~~~~~~~~~~~WWWWWLLKKK~
~~GW~~~~~~~~~~~~~~WWWWWWWLNNNK
~~~W~~~~~~~~~~~~~WWWWKWWWWNNNK
~~~W~~~~~~~~~~~WWWWWWWKKKKKKK~
~~~W~~~~~~~~~~WWWWWWWwwwwwK~~~
~~~~W~~~~~~~WWWWWWWKKKKKKK~~~~
~~~~WW~~~~~WWKKKKKK~~~~~~~~~~~
~~~~~WW~~~W~~~~~~~~~~~~~~~~~~~

# tail swings forward
stamp wag_curl_1 @tail 0,0
~~~~~......~~~~~~~
~~~....KKKK~~~~~~~
~~...KK~~~~~~~~~~~
~...K~~~~~~~~~~~K~
~..K~~~DDDD~~~~DDK
...KDDDDDLLLL~~DDK
..KDDDLLKKK~KW~DDK
..KDDLLK~~~..K~DDK
..KDDLWK~~~~.~WWWK
..KDDLWK~~~~~~KKK~
~.K~DLWK~~~~~~~~~~
~..KDDLWK~~~~~~~~~
~~.K~DL~WK~~~~~~~~
~~..K~DL~WK~~~~~~~
~~~.K~~DL~WK~~~~~~
~~~~.K~~D~~~~~~~~~
~~~~~.K~~D~~~~~~~~

# tail swings back
stamp wag_curl_2 @tail -1,0
~~~~~K~~~~~.~~~~~
~~~K~D~~~~~K~.~~~
~~KD~~~~~~~~~K~.~
~KD~~~~~~~~~~~~K.
~KD~~~~L~~~D~~~K.
KD~~L~K~~~~WD~~K.
KD~L~K.~~~~KWD~K.
KD~LWK.~~~~KW~~K.
KD~LWK.~~~~~K~~.~
KD~LWK.~~~~~~~~~~
~KD~LWK.~~~~~~~~~
~KD~LW~K.~~~~~~~~
~~KD~LW~K.~~~~~~~
~~KD~~LW~K.~~~~~~
~~~KD~~LW~K.~~~~~
~~~~KD~~L~W~K.~~~
~~~~~KD~~L~W~~~~~

# breathing in: the back rises a pixel
stamp breathe_stand @belly 1,0
KKKKKKK
DDDDDDD

# run 1/6
frame run1 from stand
patch 3,8
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~KK~~~~~~~~~~~~~~~~~
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~KDD~~~~~~~~~~~~~~~~~
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~KDDL~~K~~~~~~~~~~~~~
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~KK..~~KDDLWWDDK~~~~~~~~~~~~
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~KDDKK.~KDLWWWWDK~~~~~~~~~~~~
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~KDD~~~~KDLWW~LDDK~~~~~~~~~~~
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~DKD~L~LL~DK~~~~~~~~~~~
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~KD~~~~DKD~DDDD~DK~~~~~~~~~~~
~~~~~~~~~~~~~~~~......~~~~~~~~~~~~~KD~~~~~~~~DLLLD~DK~~~~~~~~~~
~~~~~~~~~~~~~~..........~~~~~~~~~~~~~~~~~~D~~DDDDD~DDK~~~~~~~~~
~~~~~~~~~~~~~.............~~~~~~~~KD~~~~~~D~~~DDD~~~DDKK~~~~~~~
~~~~~~~~~~~~...............~~~~~~~KD~~~~~~~~~~~~~WW~~DDDK~~~~~~
~~~~~~~~~~~~...............~~~~~~~~~~~~~~~~~~~~~~~~~~~DDDK~~~~~
~~~~~~~~~~~................~~~~~~~~~~~~~~~~~~~~KKKKWWWWWWKKKKK~
~~~~~~~~~~~......~~~~~.....~~~~~~~~~~~~~~~~~~~KBEbBKWWLLLLNNNK~
~~~~~~~~~~~......~~~~~.....~~~~~~~~~~~~~~~~GGGKBbbBK~~~~~WNNNNK
~~~KKKKK~~~......~~~~~~...~~~~~~~~~~~~~~~~GGGWWKKKKW~~WWWWWWW~~
~KKDDDDDKKK......~~~~~~~~~~~~~~~~~~~~~~~~GG~WWWWWWWW~K~~~~WWK..
KDDDDDDDDDDK~K....~~~~~~~~~~~~~~~K~~~~~~GG~WW~~WWWW~~~KKKKKKK.~
KDDDDDDDDDDDD~KK...~~~~~~~~~~~~~KDD~~~~GG~WW~~~~~~~~~~~RRPPR~~~
KWWLLDDDDDDDDD~~K...~~~~~~~~~~~KDDD~~~GG~WW~~~~~~~~~~~~~RPPpK~~
~KWWWLLLDDDDDD~~K...~KKKKKKKKKKDDD~~~GGWWW~~~~~~~~~~~KKKKPpPK~~
~~KKWWWWWLLLLDDKKKKKDDDDDDDDDDDDD~~~~GWWW~~~~~~~~~~~KK...~KK~~~
~~~~KKKKKWWWWKK~K~~DDDDDDDDDDDDD~~~~~~W~~~~~~~~~~~~K..~~~~~~~~~
~~~~~~~~~KKKK~KDD~~~DDDDDDDDDDD~~~~~~~~~~~~~~~~~~wK...~~~~~~~~~
~~~~~~~~~~~~~KDDDDDDDD~~~~~~~~~~~~~~~D~~~~~~~~~~KK..~~~~~~~~~~~
~~~~~~~~~~~~~KDDGDD~GG~~GGG~~~~~GG~~G~G~~~~~~~K....~~~~~~~~~~~~
~~~~~~~~~~~~~KGDGGGGG~GGKK~GGGGGGGG~GGGG~~~~~wK...~~~~~~~~~~~~~
~~~~~~~~~~~~~KGGGGGGGGGGGGKGGGGGGGGGGGGGG~~~K~~~~~~~~~~~~~~~~~~
~~~~~~~~~~~~~KGGGG~GGG~~GG~K~GGG~~GG~~~GGG~~~W~~~~~~~~~~~~~~~~~
~~~~~~~~~~~~~KGG~G~~~~~G~~G~G~~~~~~G~~~~GG~~W~~~~~~~~~~~~~~~~~~
~~~~~~~~~~~~~KGGLLL~~LLLL~LKLLLLL~~LLLL~LL~~~~~~~~~~~~~~~~~~~~~
~~~~~~~~~~~~~KLGLLLLLL~LLLLK~G~LLLLLL~LLLL~~~~~~~~~~~~~~~~~~~~~
~~~~~~~~~~~~~KLLLWWLLLLWWWKLLLLLLWWLLLWWWL~~~~~~~~~~~~~~~~~~~~~
~~~~~~~~~~~~~KWWWWWWWWWWWWKWWWWWWWWWWWWWWW~~~~~~~~~~~~~~~~~~~~~
~~~~~~~~~~~KKKKWWWWWWWWWWKWWWWWWWWWWWWWWWKw~~~~~~~~~~~~~~~~~~~~
~~~~~~~~~~~KLLG~WWW~~WWWKwwwwwwwwwwwwwwwwwKw~~WK~~~~~~~~~~~~~~~
~~~~~~~~~~KGLLK.K~~~~~~KKKKK~KKKKKKKKKKKKKKKw~WWK~~~~~~~~~~~~~~
~~~~~~~~~KGLL~..~w~~~~K...............KGLLK.KwWWWK~~~~~~~~~~~~~
~~~~~~~~KGLLK..KwW~~~K.................KGLLK.KwWWWK~~~~~~~~~~~~
~~~~~~~KGLLK~.KwWWW~K...................~GLLK.~wWWWK~~~~~~~~~~~
~~~~~~KGLLK~~~wWWWW~......~~~~~~~~~.....~~GLLK.KwWWWK~~~~~~~~~~
~~~~~KGLLK~~KwWWWWK.......~~~~~~~~~.....~~GLLL~KwWWWWK~~~~~~~~~
~~~~~KGLLK~KwWWWW~~.......~~~~~~~~~.....~~GGKG~KwwwKwK~~~~~~~~~
~~~~~~KGK~KwWWWWK.~.......~~~~~~~~~.....~.KKKK.~KKKKK~~~~~~~~~~
~~~~~~~K~~KwWWWWK.~.......~~~~~~~~~.....~......~~~~~~~~~~~~~~~~
~~~~~~~~~~~KwwwK..~.......~~~~~~~~~.....~......~~~~~~~~~~~~~~~~
~~~~~~~~~~~~K~K...~.......~~~~~~~~~.....~......~~~~~~~~~~~~~~~~
~~~~~~~~~~~~~..............~~~~~~~~.............~~~~~~~~~~~~~~~
~~~~~~~~~~~~~..............~~~~~~~~.............~~~~~~~~~~~~~~~
~~~~~~~~~~~~~~....~~......~~~~~~~~~~....~~.....~~~~~~~~~~~~~~~~

# run 2/6
frame run2 from stand
patch 4,9
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~..~~~~~~~~~~~~~
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~K~...~~~~~~~~~~~~
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~..~~~KDDKK.~~~~~~~~~~~~
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~....~~KD~LDK~~~~~~~~~~~~
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~K~...~KDDLW~~DK~~~~~~~~~~
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~KD~KK..KDLWW~~~~~~~~~~~~~~
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~KD~~~K.KDLW~~L~DK~~~~~~~~~
~~~~~~~~~~~~~~~......~~~~~~~~~~~~~~~~~~~~~~~~LLLD~~~~~~~~~~~
~~~~~~~~~~~~~..........~~~~~~~~~~~~~~~~~~~~~DDDDD~~~~~~~~~~~
~~~~~~~~~~~~.............~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
~~~~~~~~~~~...............~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
~~~~~~~~~~~...............~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
~~~~~~~~~~................~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
~~~~~~~~~~......~~~~~.....~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
~~~~~~~~~~......~~~~~.....~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
~~~~~~~~~~......~~~~~~...~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
~~~~~~~~~~......~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
~~~KKKKK~~~......~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
~KKDDDDDKKK.......~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~KW~~~~~~
KDDDDDDDDDDK~K.....~~~~~~~~~~~~~K~~~~~~~~~~~~~~~~~~~~K~~~~~K
KDDDDDDDDDDDD~KK....~~~~~~~~~~~KD~~~~~~~~~~~~~~~~~~~~KRRPPRK
KWWLLDDDDDDDDD~~K....~~~~~~~~~KD~~~~~~~~~~~~~~~~~~~~~W~RPPpK
~KWWWLLLDDDDDDD~K...KK~KKKKKKKD~~~~~~~~~~~~~~~~~~~~~~KKKPpPK
~~KKWWWWWLLLLDD~KKKKDDDDDDDDDD~~~~~~~~~~~~~~~~~~~~~~~~~~KKK~
~~~~KKKKKWWWWKKK~DDDD~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
~~~~~~~~~KKKK~KDDD~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
~~~~~~~~~~~~~KDD~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
~~~~~~~~~~~~~KD~G~~~GG~~GGG~~~~GG~~GGG~~~~~~~~~~~~~~~~~~~~~~
~~~~~~~~~~~~~KG~G~GGGD~GKKD~GGG~~G~~~~G~~~~~~~~~~~~~~~~~~~~~
~~~~~~~~~~~~~KG~G~~~~~G~~G~G~~~~~~G~~~~G~~~~~~~~~~~~~~~~~~~~
~~~~~~~~~~~~~KG~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
~~~~~~~~~~~~~KG~~~~~~~~~~~~KG~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
~~~~~~~~~~~~~KG~LLL~~LLLL~LKLLLL~~LLLL~LL~~~~~~~~~~~~~~~~~~~
~~~~~~~~~~~~~KL~L~~~LLG~~~LKGG~~LL~~G~L~~~~~~~~~~~~~~~~~~~~~
~~~~~~~~~~~~~KL~LWW~~~~WWWK~LL~~WW~~LWWW~~~~~~~~~~~~~~~~~~~~
~~~~~~~~~~~~~KWWWW~~WWWW~~KWWWWW~~WWW~~~W~~~~~~~~~~~~~~~~~~~
~~~~~~~~~~~KKK~~~~~~~~~~~K~W~~~~~~~~~~~~Kw~~~~~~~~~~~~~~~~~~
~~~~~~~~~~~KLLG~~~~~~~~~Kwwwwwwwwwwwwwww~~~~~~~~~~~~~~~~~~~~
~~~~~~~~~~~KG~~K~~~~~~~KK~KKKKKKKKKKKKKK~Kw~~WK~~~~~~~~~~~~~
~~~~~~~~~~~~~~~~~~w~~~~K............~GLL~Kw~~WK~~~~~~~~~~~~~
~~~~~~~~~~~~~~~~~KwW~~~K.~~~~~~~~~...KGLLKw~~WK~~~~~~~~~~~~~
~~~~~~~~~~~~.KG~LK~~~~~~~~~~~~~~~~....~GLLKw~WWK~~~~~~~~~~~~
~~~~~~~~~~~~.KG~LK~~~~~~~~~~~~~~~~.....KGLKw~WWK~~~~~~~~~~~~
~~~~~~~~~~~~.KG~LK.Kw~~~WK~~~~~~~~.....KGLKw~WWK~~~~~~~~~~~~
~~~~~~~~~~~~..KG~~~~~~~~~~~~~~~~~~.....KGGKKwWWWK~~~~~~~~~~~
~~~~~~~~~~~~...K.~.KwwwK.~~~~~~~~~.....~~KKKwWWWK~~~~~~~~~~~
~~~~~~~~~~~~.....~..KKK..~~~~~~~~~.....~...KwWWWK~~~~~~~~~~~
~~~~~~~~~~~~..............~~~~~~~~.........Kw~WWWK~~~~~~~~~~
~~~~~~~~~~~~..............~~~~~~~~.........Kw~wKwK~~~~~~~~~~
~~~~~~~~~~~~~....~~......~~~~~~~~~~....~~...~~KKK~~~~~~~~~~~

# run 3/6
frame run3 from stand
patch 7,8
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~KK~~~~~~~~~~~~~~~~~
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~KDD~~~~~~~~~~~~~~~~~
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~KDDL~~K~~~~~~~~~~~~~
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~KK..~~KDDLWWDDK~~~~~~~~~~~~
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~KDDKK.~KDLWWWWDK~~~~~~~~~~~~
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~KDD~~~~KDLWW~LDDK~~~~~~~~~~~
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~DKD~L~LL~DK~~~~~~~~~~~
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~KD~~~~DKD~DDDD~DK~~~~~~~~~~~
~~~~~~~~~~~~......~~~~~~~~~~~~~KD~~~~~~~~DLLLD~DK~~~~~~~~~~
~~~~~~~~~~..........~~~~~~~~~~~~~~~~~~D~~DDDDD~DDK~~~~~~~~~
~~~~~~~~~.............~~~~~~~~KD~~~~~~D~~~DDD~~~DDKK~~~~~~~
~~~~~~~~...............~~~~~~~KD~~~~~~~~~~~~~WW~~DDDK~~~~~~
~~~~~~~~...............~~~~~~~~~~~~~~~~~~~~~~~~~~~DDDK~~~~~
~~~~~~~................~~~~~~~~~~~~~~~~~~~~KKKKWWWWWWKKKKK~
~~~~~~~......~~~~~.....~~~~~~~~~~~~~~~~~~~KBEbBKWWLLLLNNNK~
~~~~~~~......~~~~~.....~~~~~~~~~~~~~~~~GGGKBbbBK~~~~~WNNNNK
~~~~~~~......~~~~~~...~~~~~~~~~~~~~~~~GGGWWKKKKW~~WWWWWWW~~
~~~KKKK~.....~~~~~~~~~~~~~~~~~~~~~~~~GG~WWWWWWWW~K~~~~WWK..
~KKDDDDD~KK...~~~~~~~~~~~~~~~~~~~~~~GG~WW~~WWWW~~~KKKKKKK.~
KDDDDDDDD~~KKK.~~~~~~~~~~~~~~KD~~~~GG~WW~~~~~~~~~~~RRPPR~~~
KDDDDDDDDD~~DDK~~~~~~~~~~~~~KDD~~~GG~WW~~~~~~~~~~~~~RPPpK~~
KWWLLDDDDD~~~DDD~~~~~~~~~~~KDD~~~GGWWW~~~~~~~~~~~KKKKPpPK~~
~KWWWLLLDDD~~~DDK.~~KKKKKKKDD~~~~GWWW~~~~~~~~~~~KK...~KK~~~
~~KKWWWWWLLLL~~KKKK~DDDDDDDD~~~~~~W~~~~~~~~~~~~K..~~~~~~~~~
~~~~KKKKKWWWWKKKKDDDDDDDDDD~~~~~~~~~~~~~~~~~~wK...~~~~~~~~~
~~~~~~~~~KKKK.~DDD~~~~~~~~~~~~~~~D~~~~~~~~~~KK..~~~~~~~~~~~
~~~~~~~~~~~~~~D~~~~~~~~~~~~~~~~~~DD~~~~~~~K....~~~~~~~~~~~~
~~~~~~~~~~~~.K~~G~~~GG~~GG~~GG~~GGGD~~~~~wK...~~~~~~~~~~~~~
~~~~~~~~~~~..KG~GGGGG~GGKKGGGGG~GGGGD~~~K~~~~~~~~~~~~~~~~~~
~~~~~~~~~~~..K~GGG~~GG~~~GGG~~GG~~~GGG~~~W~~~~~~~~~~~~~~~~~
~~~~~~~~~~~..K~~~~~G~~GGG~~~~~~G~~~~GG~~W~~~~~~~~~~~~~~~~~~
~~~~~~~~~~~..K~~~~~~~~~~G~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
~~~~~~~~~~~..K~~LLL~~LLLLGLLL~~LLLL~LL~~~~~~~~~~~~~~~~~~~~~
~~~~~~~~~~~..KL~LLLLLL~LLL~LLLLLL~LLLL~~~~~~~~~~~~~~~~~~~~~
~~~~~~~~~~~..K~~~WW~~~~WWW~~~WW~~~WWW~~~~~~~~~~~~~~~~~~~~~~
~~~~~~~~~~~..KWWWWWWWWWWWWWWWWWWWWWWWW~~~~~~~~~~~~~~~~~~~~~
~~~~~~~~~~~~KKK~~WWWW~~~WKWWW~~WWW~~~Kw~~~~~~~~~~~~~~~~~~~~
~~~~~~~~~~~~LLGK~~~~~~~~~wwwwwwwwwwwwKw~~~~~~~~~~~~~~~~~~~~
~~~~~~~~~...~GLLK~~~~~~~KKKKKKKKKKKKKwW~~K.~~~~~~~~~~~~~~~~
~~~~~~~~~....~GLLKKw~~WWK.....KGLLK.KwW~~K.~~~~~~~~~~~~~~~~
~~~~~~~~~.....~GLLKKwWWWW~....~GLL~~wWW~K..~~~~~~~~~~~~~~~~
~~~~~~~~~.....~~GLLKKwWWWWK~~KGLLK.~wWW~K..~~~~~~~~~~~~~~~~
~~~~~~~~~.....~.KGLLK~wWWWWK~KGLLKKwWWWK...~~~~~~~~~~~~~~~~
~~~~~~~~~.....~.KGLLK.KwWWWWKGLLK.KwWWWK...~~~~~~~~~~~~~~~~
~~~~~~~~~.....~..KGK..~KwWWWWKLLKKwWWWK....~~~~~~~~~~~~~~~~
~~~~~~~~~.....~...K...KwWWWWKLL~.KwWWWK....~~~~~~~~~~~~~~~~
~~~~~~~~~.....~.......~KwwwKGLL~KwWWW~.....~~~~~~~~~~~~~~~~
~~~~~~~~~.....~.......~~KKKGLLK.KwWWW~.....~~~~~~~~~~~~~~~~
~~~~~~~~~..............~~~KGLLL~KwWWWWK.....~~~~~~~~~~~~~~~
~~~~~~~~~..............~~~KGGKG~Kwww~wK.....~~~~~~~~~~~~~~~
~~~~~~~~~~....~~......~~~~~KKKK~.~~~KK.....~~~~~~~~~~~~~~~~

# run 4/6
frame run4 from stand
patch 6,8
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~KK~~~~~~~~~~~~~~~~~
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~KDD~~~~~~~~~~~~~~~~~
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~KDDL~~K~~~~~~~~~~~~~
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~KK..~~KDDLWWDDK~~~~~~~~~~~~
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~KDDKK.~KDLWWWWDK~~~~~~~~~~~~
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~KDD~~~~KDLWW~LDDK~~~~~~~~~~~
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~DKD~L~LL~DK~~~~~~~~~~~
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~KD~~~~DKD~DDDD~DK~~~~~~~~~~~
~~~~~~~~~~~~~......~~~~~~~~~~~~~KD~~~~~~~~DLLLD~DK~~~~~~~~~~
~~~~~~~~~~~..........~~~~~~~~~~~~~~~~~~D~~DDDDD~DDK~~~~~~~~~
~~~~~~~~~~.............~~~~~~~~KD~~~~~~D~~~DDD~~~DDKK~~~~~~~
~~~~~~~~~...............~~~~~~~KD~~~~~~~~~~~~~WW~~DDDK~~~~~~
~~~~~~~~~...............~~~~~~~~~~~~~~~~~~~~~~~~~~~DDDK~~~~~
~~~~~~~~................~~~~~~~~~~~~~~~~~~~~KKKKWWWWWWKKKKK~
~~~~~~~~......~~~~~.....~~~~~~~~~~~~~~~~~~~KBEbBKWWLLLLNNNK~
~~~~~~~~......~~~~~.....~~~~~~~~~~~~~~~~GGGKBbbBK~~~~~WNNNNK
~~~~~~~~......~~~~~~...~~~~~~~~~~~~~~~~GGGWWKKKKW~~WWWWWWW~~
~~~~~~~~......~~~~~~~~~~~~~~~~~~~~~~~~GG~WWWWWWWW~K~~~~WWK..
~~~KKKKK~......~~~~~~~~~~~~~~~~~~~~~~GG~WW~~WWWW~~~KKKKKKK.~
~KKDDDDDK~K.....~~~~~~~~~~~~~~~D~~~~GG~WW~~~~~~~~~~~RRPPR~~~
KDDDDDDDDDDKKK...~~~~~~~~~~~~~KD~~~GG~WW~~~~~~~~~~~~~RPPpK~~
KDDDDDDDDDD~~~KK..~~~~~~~~~~~KD~~~GGWWW~~~~~~~~~~~KKKKPpPK~~
KWWLLDDDDDDD~~~DK..~~~~~~~~~KD~~~~GWWW~~~~~~~~~~~KK...~KK~~~
~KWWWLLLDDDDD~~~K...~KKKKKKKD~~~~~~W~~~~~~~~~~~~K..~~~~~~~~~
~~KKWWWWWLLLLD~KKKK~DDDDDDDD~~~~~~~~~~~~~~~~~~wK...~~~~~~~~~
~~~~KKKKKWWWWK~~~DD~~~~~~~~~~~~~~~D~~~~~~~~~~KK..~~~~~~~~~~~
~~~~~~~~~KKKK~~D~~~~~~~~~~~~~~~~~~DD~~~~~~~K....~~~~~~~~~~~~
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~DD~~~~~wK...~~~~~~~~~~~~~
~~~~~~~~~~~~.K~~G~~~GG~~GGG~~GG~~GGGDD~~~K~~~~~~~~~~~~~~~~~~
~~~~~~~~~~~~.KGDGGG~~~G~KK~GG~~G~~~~GDG~~~W~~~~~~~~~~~~~~~~~
~~~~~~~~~~~~.KG~~~~~G~~GGGK~~~~~G~~~~GG~~W~~~~~~~~~~~~~~~~~~
~~~~~~~~~~~~.K~~~~~~~~~~~G~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
~~~~~~~~~~~~.K~~~~~~~~~~~~G~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
~~~~~~~~~~~~.K~~LLL~~LLLL~LLLL~~LLLL~LL~~~~~~~~~~~~~~~~~~~~~
~~~~~~~~~~~~.KLG~~LL~~G~L~LG~~LL~~G~L~~~~~~~~~~~~~~~~~~~~~~~
~~~~~~~~~~~~.KL~~WW~~L~WWW~L~~WW~~LWWW~~~~~~~~~~~~~~~~~~~~~~
~~~~~~~~~~~~.KWW~~WWWW~~~WKWWW~~WWW~~~W~~~~~~~~~~~~~~~~~~~~~
~~~~~~~~~~~K~KK~~~~~~~~~~~~~~~~~~~~~~~Kw~~~~~~~~~~~~~~~~~~~~
~~~~~~~~~~.~LLGK~~~~~~~~~wwwwwwwwwwwww~~~~~~~~~~~~~~~~~~~~~~
~~~~~~~~~~.KGLLKK~~~~~~~KKKKKKKKKKKKKKwW~~K.~~~~~~~~~~~~~~~~
~~~~~~~~~~.KG~L~.Kw~~~W~.......~GLL~.~wW~~K.~~~~~~~~~~~~~~~~
~~~~~~~~~~..KGLL~Kw~~~WK~~~~~~~KGL~K~wWW~K..~~~~~~~~~~~~~~~~
~~~~~~~~~~..KGLL~.Kw~~WWK~~~~~KGLLK.~wWW~K..~~~~~~~~~~~~~~~~
~~~~~~~~~~..KGLL~.Kw~~WWK~~~~KGLLK.KwWWWK...~~~~~~~~~~~~~~~~
~~~~~~~~~~...KGLLKKw~~WWK~~~~~KG~...~wwK....~~~~~~~~~~~~~~~~
~~~~~~~~~~...KGLLK.Kw~WWWK~~~~~K.....K~.....~~~~~~~~~~~~~~~~
~~~~~~~~~~...KGLLK.Kw~WWWK~~~~~~.....~......~~~~~~~~~~~~~~~~
~~~~~~~~~~...KGLLK.Kw~WWWK~~~~~~.....~......~~~~~~~~~~~~~~~~
~~~~~~~~~~...KGLLLKKw~~WWWK~~~~~.............~~~~~~~~~~~~~~~
~~~~~~~~~~...~~G~GKK~w~wKwK~~~~~.............~~~~~~~~~~~~~~~
~~~~~~~~~~~...~KK~..~~~KKK~~~~~~~....~~.....~~~~~~~~~~~~~~~~

# run 5/6
frame run5 from stand
patch 5,8
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~KK~~~~~~~~~~~~~~~~~
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~KDD~~~~~~~~~~~~~~~~~
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~KDDL~~K~~~~~~~~~~~~~
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~KK..~~KDDLWWDDK~~~~~~~~~~~~
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~KDDKK.~KDLWWWWDK~~~~~~~~~~~~
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~KDD~~~~KDLWW~LDDK~~~~~~~~~~~
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~DKD~L~LL~DK~~~~~~~~~~~
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~KD~~~~DKD~DDDD~DK~~~~~~~~~~~
~~~~~~~~~~~~~~......~~~~~~~~~~~~~KD~~~~~~~~DLLLD~DK~~~~~~~~~~
~~~~~~~~~~~~..........~~~~~~~~~~~~~~~~~~D~~DDDDD~DDK~~~~~~~~~
~~~~~~~~~~~.............~~~~~~~~KD~~~~~~D~~~DDD~~~DDKK~~~~~~~
~~~~~~~~~~...............~~~~~~~KD~~~~~~~~~~~~~WW~~DDDK~~~~~~
~~~~~~~~~~...............~~~~~~~~~~~~~~~~~~~~~~~~~~~DDDK~~~~~
~~~~~~~~~................~~~~~~~~~~~~~~~~~~~~KKKKWWWWWWKKKKK~
~~~~~~~~~......~~~~~.....~~~~~~~~~~~~~~~~~~~KBEbBKWWLLLLNNNK~
~~~~~~~~~......~~~~~.....~~~~~~~~~~~~~~~~GGGKBbbBK~~~~~WNNNNK
~~~~~~~~~......~~~~~~...~~~~~~~~~~~~~~~~GGGWWKKKKW~~WWWWWWW~~
~~~KKKKK~......~~~~~~~~~~~~~~~~~~~~~~~~GG~WWWWWWWW~K~~~~WWK..
~KKDDDDDKK~.....~~~~~~~~~~~~~~~~~~~~~~GG~WW~~WWWW~~~KKKKKKK.~
KDDDDDDDDDDKKK...~~~~~~~~~~~~~~KD~~~~GG~WW~~~~~~~~~~~RRPPR~~~
KDDDDDDDDDDD~~KK..~~~~~~~~~~~~KDD~~~GG~WW~~~~~~~~~~~~~RPPpK~~
KWWLLDDDDDDD~~~DK..~~~~~~~~~~KDD~~~GGWWW~~~~~~~~~~~KKKKPpPK~~
~KWWWLLLDDDDD~~~K...KKKKKKKKKDD~~~~GWWW~~~~~~~~~~~KK...~KK~~~
~~KKWWWWWLLLLD~KKKKKDDDDDDDDDD~~~~~~W~~~~~~~~~~~~K..~~~~~~~~~
~~~~KKKKKWWWWK~KK~DDDDDDDDDDD~~~~~~~~~~~~~~~~~~wK...~~~~~~~~~
~~~~~~~~~KKKK~KDDDDD~~~~~~~~~~~~~~~D~~~~~~~~~~KK..~~~~~~~~~~~
~~~~~~~~~~~~~KDDD~~~~~~~~~~~~~~~~~~DD~~~~~~~K....~~~~~~~~~~~~
~~~~~~~~~~~~~KD~G~~~GG~~GGG~~~GG~~GGGD~~~~~wK...~~~~~~~~~~~~~
~~~~~~~~~~~~~~G~GGGGG~GGKK~GGGGGG~GGGGD~~~K~~~~~~~~~~~~~~~~~~
~~~~~~~~~~~~~~GG~GGG~~GG~~KGGG~~GG~~~GGG~~~W~~~~~~~~~~~~~~~~~
~~~~~~~~~~~~~~~G~~~~~G~~GGGK~~~~~G~~~~GG~~W~~~~~~~~~~~~~~~~~~
~~~~~~~~~~~~~~~~~~~~~~~~~~GK~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
~~~~~~~~~~~~~~~~LLL~~LLLL~L~LLL~~LLLL~LL~~~~~~~~~~~~~~~~~~~~~
~~~~~~~~~~~~~~L~LLLLLL~LLLL~~LLLLLL~LLLL~~~~~~~~~~~~~~~~~~~~~
~~~~~~~~~~~~~~LL~WWLL~~WWWKL~~~WW~~~WWW~~~~~~~~~~~~~~~~~~~~~~
~~~~~~~~~~~~~~WWWWWWWWWWWWKWWWWWWWWWWWWW~~~~~~~~~~~~~~~~~~~~~
~~~~~~~~~~~KK~KWW~~WWWW~~KWWWWW~~WWW~~~Kw~~~~~~~~~~~~~~~~~~~~
~~~~~~~~~~~KLLGK~~~~~~~~KwwwwwwwwwwwwwwwKw~~WK~~~~~~~~~~~~~~~
~~~~~~~~~~~~GLLKK~~~~~~KK~KKKKKKKKKKKKK~Kw~~WK~~~~~~~~~~~~~~~
~~~~~~~~~~KG~~K..Kw~~~~K...........KGLL~.Kw~WWK~~~~~~~~~~~~~~
~~~~~~~~~~KGL~K.~w~~~~K............~GLL~..KwWWWK~~~~~~~~~~~~~
~~~~~~~~~KGLLK..KwW~~~K.~~~~~~~~~...KGLLK.KwWWWK~~~~~~~~~~~~~
~~~~~~~~~KGLLK.~wWW~~K..~~~~~~~~~...KGLLLKKwWWWWK~~~~~~~~~~~~
~~~~~~~~KGLLK..~wWW~~K..~~~~~~~~~...KGG~GKKwwwKwK~~~~~~~~~~~~
~~~~~~~~KGLLK.KwWWW~K...~~~~~~~~~....~K~K..K~KKK~~~~~~~~~~~~~
~~~~~~~KGLL~..KwWWW~K...~~~~~~~~~.....~......~~~~~~~~~~~~~~~~
~~~~~~~KGLL~.KwWWWWK....~~~~~~~~~.....~......~~~~~~~~~~~~~~~~
~~~~~~~KGLL~.KwWWWWK....~~~~~~~~~.....~......~~~~~~~~~~~~~~~~
~~~~~~~KGLLLKKwWWWW~K....~~~~~~~~.............~~~~~~~~~~~~~~~
~~~~~~~KGGKGKKwwwwK~K....~~~~~~~~.............~~~~~~~~~~~~~~~
~~~~~~~~KKKK..~~KK~~....~~~~~~~~~~....~~.....~~~~~~~~~~~~~~~~

# run 6/6 (smear frame)
frame run6 from stand
patch 2,8
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~KK~~~~~~~~~~~~~~~~~
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~KDD~~~~~~~~~~~~~~~~~
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~KDDL~~K~~~~~~~~~~~~~
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~KK..~~KDDLWWDDK~~~~~~~~~~~~
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~KDDKK.~KDLWWWWDK~~~~~~~~~~~~
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~KDD~~~~KDLWW~LDDK~~~~~~~~~~~
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~DKD~L~LL~DK~~~~~~~~~~~
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~KD~~~~DKD~DDDD~DK~~~~~~~~~~~
~~~~~~~~~~~~~~~~~......~~~~~~~~~~~~~KD~~~~~~~~DLLLD~DK~~~~~~~~~~
~~~~~~~~~~~~~~~..........~~~~~~~~~~~~~~~~~~D~~DDDDD~DDK~~~~~~~~~
~~~~~~~~~~~~~~.............~~~~~~~~KD~~~~~~D~~~DDD~~~DDKK~~~~~~~
~~~~~~~~~~~~~...............~~~~~~~KD~~~~~~~~~~~~~WW~~DDDK~~~~~~
~~~~~~~~~~~~~...............~~~~~~~~~~~~~~~~~~~~~~~~~~~DDDK~~~~~
~~~~~~~~~~~~................~~~~~~~~~~~~~~~~~~~~KKKKWWWWWWKKKKK~
~~~~~~~~~~~~......~~~~~.....~~~~~~~~~~~~~~~~~~~KBEbBKWWLLLLNNNK~
~~~~~~~~~~~~......~~~~~.....~~~~~~~~~~~~~~~~GGGKBbbBK~~~~~WNNNNK
~~~KKKKK~~~~......~~~~~~...~~~~~~~~~~~~~~~~GGGWWKKKKW~~WWWWWWW~~
~KKDDDDDKKK~......~~~~~~~~~~~~~~~~~~~~~~~~GG~WWWWWWWW~K~~~~WWK..
KDDDDDDDDDDKK~.....~~~~~~~~~~~~~~~K~~~~~~GG~WW~~WWWW~~~KKKKKKK.~
KDDDDDDDDDDDDDKK....~~~~~~~~~~~~~KDD~~~~GG~WW~~~~~~~~~~~RRPPR~~~
KWWLLDDDDDDDDDD~K....~~~~~~~~~~~KDDD~~~GG~WW~~~~~~~~~~~~~RPPpK~~
~KWWWLLLDDDDDDD~K...K~KKKKKKKKKKDDD~~~GGWWW~~~~~~~~~~~KKKKPpPK~~
~~KKWWWWWLLLLDD~KKKKDDDDDDDDDDDDDD~~~~GWWW~~~~~~~~~~~KK...~KK~~~
~~~~KKKKKWWWWKKK~~~~DDDDDDDDDDDDD~~~~~~W~~~~~~~~~~~~K..~~~~~~~~~
~~~~~~~~~KKKK~KDDD~~~DDDDDDDDDDD~~~~~~~~~~~~~~~~~~wK...~~~~~~~~~
~~~~~~~~~~~~~KDDDDDDDDD~~~~~~~~~~~~~~~D~~~~~~~~~~KK..~~~~~~~~~~~
~~~~~~~~~~~~~KDDGDDDGG~~GGG~~~~~~GG~~G~G~~~~~~~K....~~~~~~~~~~~~
~~~~~~~~~~~~~KGDGGGGG~GGKK~GGGGGGGGG~GGGG~~~~~wK...~~~~~~~~~~~~~
~~~~~~~~~~~~~KGGGGGGGGGGGGKGGGGGGGGGGGGGGG~~~K~~~~~~~~~~~~~~~~~~
~~~~~~~~~~~~~KGGGGG~GGG~~GGK~~GGG~~GG~~~GGG~~~W~~~~~~~~~~~~~~~~~
~~~~~~~~~~~~~KGGG~G~~~~~G~~~GG~~~~~~G~~~~GG~~W~~~~~~~~~~~~~~~~~~
~~~~~~~~~~~~~KGGLLL~~LLLL~LKLLLLLL~~LLLL~LL~~~~~~~~~~~~~~~~~~~~~
~~~~~~~~~~~~~KLGLLLLLL~LLLLK~~G~LLLLLL~LLLL~~~~~~~~~~~~~~~~~~~~~
~~~~~~~~~~~~~KLLLWWLLLLWWWKLLLLLLLWWLLLWWWL~~~~~~~~~~~~~~~~~~~~~
~~~~~~~~~~~~~KWWWWWWWWWWWWKWWWWWWWWWWWWWWWW~~~~~~~~~~~~~~~~~~~~~
~~~~~~~~~~~KKKKWWWWWWWWWWKWWWWWWWWWWWWWWWWKw~~~~~~~~~~~~~~~~~~~~
~~~~~~~~~~~KLLGKWWWW~~WWKwwwwwwwwwwwwwwwwwwKw~~WK~~~~~~~~~~~~~~~
~~~~~~~~~~KGLLK~~~~~~~~KKKKKK~KKKKKKKKKKKKKKKw~WWK~~~~~~~~~~~~~~
~~~~~~~~~KGLLK..~w~~~~K................KGLLK.KwWWWK~~~~~~~~~~~~~
~~~~~~~~KGLLK~.KwWW~~K..................KGLLK.KwWWWK~~~~~~~~~~~~
~~~~~~~KGLLK~~~wWWWWK....................~GLLK.~wWWWK~~~~~~~~~~~
~~~~~~KGLLK~~KwWWWWK.......~~~~~~~~~.....~~GLLK.KwWWWK~~~~~~~~~~
~~~~~KGLLK~~KwWWWW~~.......~~~~~~~~~.....~.KGLL~~KwWWWK~~~~~~~~~
~~~~KGLLK~~KwWWWWK.~.......~~~~~~~~~.....~..KGLLK~KwWWWK~~~~~~~~
~~~~KGLLK~KwWWWWK..~.......~~~~~~~~~.....~..KGLLLKKwWWWWK~~~~~~~
~~~~~KGK~KwWWWWK...~.......~~~~~~~~~.....~..KGG~GKKwwwKwK~~~~~~~
~~~~~~K~~KwWWWWK...~.......~~~~~~~~~.....~...KK~K~~KKKKK~~~~~~~~
~~~~~~~~~~Kwww~....~.......~~~~~~~~~.....~......~~~~~~~~~~~~~~~~
~~~~~~~~~~~KKK..............~~~~~~~~.............~~~~~~~~~~~~~~~
~~~~~~~~~~~~~~..............~~~~~~~~.............~~~~~~~~~~~~~~~
~~~~~~~~~~~~~~~....~~......~~~~~~~~~~....~~.....~~~~~~~~~~~~~~~~

# walk 1/6
frame walk1 from stand
patch 16,48
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~Kw~~WK~~~
~~~~~KwW~~~K.~~~~~~~~KGL~K.~.Kw~~WK~~~
.KG~LKwW~~~K.~~~~~~~~KGL~K.~.Kw~~WK~~~
.KG~~wWW~~K..~~~~~~~KGLLK..~..Kw~WWK~~
..KG~wWW~~K..~~~~~~~KGLLK..~..Kw~WWK~~
..KKwWWW~K...~~~~~~KGLLK...~..Kw~WWK~~
..KwWWWWK....~~~~~~~KG~....~...KwWWWK~
...KwwwK.....~~~~~~~~K.....~...KwWWWK~
...KK~~LK.....~~~~~~~~.........Kw~WWWK
...~~G~GK.....~~~~~~~~.........Kw~wKwK
~...~KK~.....~~~~~~~~~~....~~...~~KKK~

# walk 2/6 (passing: body up a pixel)
frame walk2 from stand
move 0,0,72,47 0,-1
patch 16,45
...~~~~~~~~~~~~~~~~~~~~~~~~~WW~K..
KKK~KwwwwwwwwwwwwwwwwwwwwwwwKwWWWK
~~~~~~~~~~~~~~KKKKKKKKKKKKKK~~~~~~
~~~~~~~~~~~~~.........~GLL~.~~~~~~
~~~~~~~~~~~~~~~~~~~~~~.KG~LK~~~~~~
~~~~~~~~~~~~~~~~~~~~~~.KG~LK~~~~~~
~~~~~~.Kw~~~WK~~~~~~~~..KGLL~~~~~~
~~~~~~.Kw~~~WK~~~~~~~~..KGLL~~~~~~
~~~~~~.Kw~~~WK~~~~~~~~..KGLL~~~~~~
~~~~~~.Kw~~~WWK~~~~~~~..KGGK~~~~~~
~~~~~~.Kwwww~wK~~~~~~~...K~K~~~~~~
~~~~~~..KKKKK~~~~~~~~~......~~~~~~
~~~~~~........~~~~~~~~......~~~~~~
~~~~~~~......~~~~~~~~~~....~~~~~~~

# walk 3/6
frame walk3 from stand
patch 13,48
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~wW~~K.~
~~KGL~K.~~~~~~~~~~~~~~~~~.KG~LKwW~~K.~
~~KGL~K.~~~~~~~~~~~~~~~~~.KG~LKwW~~K.~
~KGLLK..~.Kw~~~WK~~~~~~~~..KG~wWW~K..~
~KGLLK..~.Kw~~~WK~~~~~~~~..KG~wWW~K..~
KGLLK...~..Kw~~WWK~~~~~~~...K~wWW~K..~
KGLLK...~..Kw~~WWK~~~~~~~...KwWWWK...~
KGLLK...~..Kw~~WWWK~~~~~~...KwWWWK...~
KGLLLK.....Kwwww~wK~~~~~~...KwWWW~K...
KGG~~K......KK~K~K~~~~~~~...~wwwK~K...
~KKK~...~~......~~~~~~~~~~...~KK~~...~

# walk 4/6
frame walk4 from stand
patch 13,49
~~KGL~K.~~~~~~~~~~~~~~~~~.KG~LKwW~~K.~
~~KGL~K.~~~~~~~~~~~~~~~~~.KG~LKwW~~K.~
~KGLLK..~.Kw~~~WK~~~~~~~~..KG~wWW~K..~
~KGLLK..~.Kw~~~WK~~~~~~~~..KG~wWW~K..~
KGLLK...~..Kw~~WWK~~~~~~~..KKwWWWK...~
~KG~....~..Kw~~WWK~~~~~~~...K~wwK....~
~~K.....~...Kw~WWWK~~~~~~...KGK~K....~
~~~.........Kw~~WWWK~~~~~...KGLLLK....
~~~.........K~w~wKwK~~~~~...~~G~GK....
~~~~....~~...~~~KKK~~~~~~~...~KK~....~

# walk 5/6 (passing: body up a pixel)
frame walk5 from stand
move 0,0,72,47 0,-1
patch 16,45
...~~~~~~~~~~~~~~~~~~~~~~~~~WW~K..~~~
KKK~KwwwwwwwwwwwwwwwwwwwwwwwKwWWWK~~~
~~~~~~~~~~~~~~KKKKKKKKKKKKKK~~~~~~~~~
~~~~~~~~~~~~~.........~GLL~..Kw~~WK~~
~~~~~~~~~~~~~~~~~~~~~~~~~~~~.Kw~~WK~~
.KG~LK~~~~~~~~~~~~~~~~~~~~~~.Kw~~WK~~
.KG~LK~~~~~~~~~~~~~~~~~~~~~~..Kw~WWK~
..KGLL~~~~~~~~~~~~~~~~~~~~~~..Kw~WWK~
..KGLL~~~~~~~~~~~~~~~~~~~~~~..Kw~WWWK
..KGGK~~~~~~~~~~~~~~~~~~~~~~..KwwwKwK
...K~K~~~~~~~~~~~~~~~~~~~~~~...KK~KK~
......~~~~~~~~~~~~~~~~~~~~~~.......~~
......~~~~~~~~~~~~~~~~~~~~~~.......~~
~....~~~~~~~~~~~~~~~~~~~~~~~~.....~~~

# walk 6/6
frame walk6 from stand
patch 16,48
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~Kw~~WK~~~
~~~~~~~~~~~~~~~~~~~~~KGL~K.~.Kw~~WK~~~
.KG~LKwW~~~K.~~~~~~~~KGL~K.~.Kw~~WK~~~
.KG~LKwW~~~K.~~~~~~~KGLLK..~..Kw~WWK~~
..KG~wWW~~K..~~~~~~~KGLLK..~..Kw~WWK~~
..KG~wWW~~K..~~~~~~~KGLLK..~...KwWWWK~
..KKwWWW~K...~~~~~~KGLLK...~...KwWWWK~
..KKwWWW~K...~~~~~~KGLLK...~...KwWWWWK
..KKwWWW~~K...~~~~~KGLLLK......KwwwKwK
...~www~K~K...~~~~~KGG~~K.......~K~KK~
~...~KK~~~...~~~~~~~KKK~...~~.....~~~~

# TODO placeholder
frame crouch from stand

# TODO placeholder
frame sit_down1 from stand

# TODO placeholder
frame sit from stand

# TODO placeholder
frame sit_half from stand

# TODO placeholder
frame lie_down1 from stand

# TODO placeholder
frame lie from stand

# TODO placeholder
frame curl1 from stand

# TODO placeholder
frame curl2 from stand

# TODO placeholder
frame sleep from stand

# TODO placeholder
frame sleep_flick from stand

# TODO placeholder
frame happy1 from stand

# TODO placeholder
frame happy2 from stand

# TODO placeholder
frame happy3 from stand

# TODO placeholder
frame happy4 from stand

# TODO placeholder
frame pet1 from stand

# TODO placeholder
frame pet2 from stand

# TODO placeholder
frame scratch1 from stand

# TODO placeholder
frame scratch2 from stand

# TODO placeholder
frame scratch3 from stand

# TODO placeholder
frame shake1 from stand

# TODO placeholder
frame shake2 from stand

# TODO placeholder
frame shake3 from stand

# TODO placeholder
frame shake4 from stand

# TODO placeholder
frame shake_end from stand

# TODO placeholder
frame flinch1 from stand

# TODO placeholder
frame flinch2 from stand

# TODO placeholder
frame bow from stand

# TODO placeholder
frame bow2 from stand

# TODO placeholder
frame yawn1 from stand

# TODO placeholder
frame yawn2 from stand

# TODO placeholder
frame yawn3 from stand

# TODO placeholder
frame tilt0 from stand

# TODO placeholder
frame tilt1 from stand

# TODO placeholder
frame eat1 from stand

# TODO placeholder
frame eat2 from stand

# TODO placeholder
frame eat3 from stand
`;
