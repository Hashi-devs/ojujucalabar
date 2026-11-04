# Ojuju Calabar

A Muniac Studios game. A first-person 3D Nigerian horror escape game for phones and computers.

**The story.** October 1997. Tobenna “Tobi” Adeleke, 26, a NITEL engineer from Lagos, is sent to Oke-Ọla, the hill town where he was born. At the top of the hill stands Adeleke House, his father’s house, empty since the night of 14 October 1975, when Mama ran down the hill in the rain with him, aged four. Tonight is twenty-two years to the night. In 1975 Chief Olumide Adeleke’s cement contracts and land grabs cost a labourer his life. His driver, Effiong Etim from Calabar, said he would talk. Papa bricked him into the chimney. A week later the thing the hill children named **Ojuju Calabar** came for Papa: tall, long-fingered, in raffia, with a dark carved face, because Effiong’s grandfather was an Ekpo elder in Ikot Ekpene and Effiong came back the way his forefathers’ spirits come back. He does not want revenge on the boy. He wants his name and a burial.

Seven rooms (the Living Room, Tobi’s Room, Mama’s Kitchen, the Boys’ Quarters, Papa’s Office, Mama’s Prayer Room and the Master Bedroom) and the roof, each with its own puzzle chain, scares, hints and a journal. Fourteen memory pages and seven comic-strip memories tell the story; the true ending needs all fourteen pages. Oil paintings in the house change with what you learn. It runs on its own small WebGL engine. There are no model or audio files: every texture is painted in code and every sound is synthesised. The only picture file is the optional loading illustration (see below).

## Playing on a computer

W A S D or the arrow keys walk. Click the view once and the mouse looks around (Esc frees the mouse). Click, E or Space uses what the dot is on. 1 to 6 hold an item from the tray, Q puts it away, J opens the journal, H gives a hint, M opens the menu, and Esc closes anything with a ✕. On wide screens the game fills the window and the tray runs down the right side.

## Ads and CrazyGames

The build makes two web versions:

- `www/` is your own site (Cloudflare) and the Android app. It has no ads and no ad buttons.
- `crazygames/` is for CrazyGames. It loads the CrazyGames SDK. Upload the files inside it (`index.html`, `privacy.html`, `icon-192.png`) as a zip on the CrazyGames developer portal.

Ads only ever appear as a choice, never by surprise, following CrazyGames' rules:

- **Hints:** the first hint in every room is free. After that the next note comes back after 45 seconds, or straight away if you choose to watch a short ad.
- **The last lantern:** once per chapter, when the last lantern goes out, you can watch a short ad to relight one lantern and stay in the room instead of going back to the start of the chapter.

If no ad can play (ad blocker, CrazyGames' Basic Launch with ads switched off, no ad available), the ad buttons do not appear or quietly disappear, and the game carries on. The game pauses and goes silent while an ad plays, and it tells CrazyGames when play starts and stops.

## Speedrun leaderboard

Haunted runs race on a live online leaderboard. When a new game starts in Haunted mode while online, the game registers the run with the server and checks in at each room. At the end, the player types a name (2 to 16 letters or numbers) and posts the time. The clock stops at the chimney, before the ending comics. Each name shows once with its best time, and ★ marks runs that found all 14 pages. The board updates live while it is open, from the title screen, the menu, or the end screen. The menu also has a Speedrun timer switch that shows the clock on screen.

A run cannot be posted if it started offline, or if it switched to Gentle mode at any point.

**The server** is the Supabase project `ojuju-calabar` (free plan, London). The game holds only the public key. The server checks every run before it goes on the board: all seven rooms entered in order, at least 5 seconds apart, a finishing time of at least 3 minutes, and a game clock never faster than the server's own clock. A name belongs to the phone that first used it. No browser game can be made fully cheat-proof, so keep an eye on the top of the board.

**Looking after the board** (supabase.com → project `ojuju-calabar` → Table Editor):
- `scores`: the board itself. Delete a row to remove a time.
- `banned_words`: add a row to block a word in names.
- `name_keys`: delete a name's row to free that name for someone else.
- `runs` and `checkpoints`: the raw runs, for checking a suspicious time.

Free Supabase projects pause after about a week with no activity. Players using the board keep it awake; if it does pause, open the project on supabase.com and press Restore.

## New answers every game

Every new game rolls its own answers, so walkthroughs and memorised speedruns don't carry over. The story's facts stay fixed: every clock in the house stopped at 7:20, and the window code is always 14 October (1 4 1 0).
- **The big standing clock** in the Living Room ran on a little after the others, until Mama slammed the door. It stops at a different minute between 7:21 and 8:59 each game, and that time is the drawer code.
- **The music box** plays star, moon and sun in a different order. The little door takes that order, and the harmonium takes it backwards.
- **The recipe card's** pounding rhythm (three groups of one to three pounds) is different, and so is the mortar.
- **The mirror** lists bone, blood, sea and grave in a different order, and the candles follow it (bone white, blood red, sea blue, grave green).

Hints, journal notes and Pidgin all follow the answers of the current game. A save keeps its answers. Saves from before this version use a fixed set.

## NEPA takes light

In the four rooms lit by mains power (Living Room, Tobi's Room, Kitchen, Master Bedroom), there is a 7-in-10 chance that the power cuts once, 30 to 75 seconds after you walk in. The room goes black, the neighbours' generators start down the hill, and Tobi's torch comes on. The torch shows a battery bar at the top of the screen. It lights the room around you but runs down in about 38 seconds; tap it to switch it off and save the battery. In Haunted mode the dark feeds your fear, and faster once the torch is dead. Ojuju often walks past the door while the lights are off. After 25 to 35 seconds the power returns and the whole hill shouts "Up NEPA!". Puzzles still work in the dark.

## Hiding places

Every room has one piece of furniture that hides you from Ojuju's visits:
- Living Room: behind the cushion chair
- Tobi's Room: the wardrobe
- Kitchen: under the table
- Boys' Quarters: the blue water drum
- Papa's Office: under the desk
- Prayer Room: under a bench
- Master Bedroom: Papa's wardrobe under the Ankara wrapper

When footsteps come for the door, the message names the nearest one. Walk to it and tap it before he opens the door (about four seconds). You watch through a gap while he searches, and you climb out when he has gone. Once he is in, only a hiding place you are already next to will save you; anything else you tap gives you away, as before.

## Chapter select and the gallery

After the first finish, the title screen offers **Chapter select**: start Chapter 1, 2 or 3 from its first room, carrying what you would have by then (Chapter 2: matches; Chapter 3: matches and the mason's hammer), with new puzzle answers. Chapter runs don't go on the leaderboard. Memory pages and cowries found in any run are kept on the phone, so a chapter run ends in the true ending once every page has been found at least once.

**The Gallery** (title screen and menu) has seven pictures. Every cowrie ever found unlocks one more. Placeholders show until Amuro's art is in: save a picture as `assets/gallery/g1.png` to `g7.png` (or .jpg / .webp) and rebuild. `assets/gallery/README.txt` lists what each one is. The captions are in `src/extras.js`.

## Lanterns and Ojuju Calabar walking the house

In Haunted mode you carry five lanterns (top right, next to the fear bar). Being caught by Ojuju Calabar (in a chase, during a visit, or when your fear fills up) puts one out, and you wake at the door of the room with everything you had. Each cowrie you find relights one. When the last goes out you go back to the start of the chapter: Downstairs (Living Room, Tobi’s Room, Kitchen), the Boys’ Quarters and Papa’s Office, or Upstairs (Prayer Room, Master Bedroom, roof). Between the set pieces he walks the house: footsteps that pass the door, glimpses at the far end of the room, furniture turned while your back was turned, and visits, where he steps into the room and you must keep still and touch nothing until he leaves. Gentle mode has none of this.

## Controls

The game plays either way up. Sideways is recommended: on a phone held upright it suggests turning sideways once (with “Play upright” and “Don’t ask again”), and when you tap to start it tries to go fullscreen.

- **Left thumb:** put it down anywhere on the left side of the screen. The stick appears under your thumb; drag to walk. A quick tap on the left side still examines what you tap.
- **Right thumb:** drag on the right side to look around. Look speed (Slow, Normal, Fast) is in the menu.
- **Hand button (bottom right):** uses whatever is under the dot in the middle. It glows orange when the dot is on something. You can also tap things directly.
- **Item tray** (right edge): tap an item to hold it, then use it on something.
- **Lightbulb:** hints. **Book:** journal and memory pages.
- **On a computer:** W A S D to walk, mouse drag or the arrow keys to look, E or Space to use what is under the dot.

## What's in the house

- **Comic-strip cut scenes.** The opening (Lagos, the market at the foot of the hill, Baba Lawal’s warning), seven memories from 1975 that come back in the rooms, and the endings are comic strips. Tap to reveal each panel; Skip is top right.
- **Oil paintings with moods.** Mama’s portrait, Papa’s portrait, the family in 1972 (the driver’s face painted black), Mama and small Tobi, and the wedding in 1970. Each one changes as you learn what happened.
- **Seven rooms and a roof.** After the Master Bedroom you climb out onto the zinc roof and run for the chimney while Ojuju Calabar climbs out of the window behind you. Break the new bricks with the mason’s hammer, cover him with Mama’s white cloth, and call him by his real name.
- **The hunt.** In the Boys’ Quarters, Ojuju rises from the long crate and walks toward you. Hide in the blue water drum in the corner; you see out through the gap under the lid while he sniffs around and leaves. If he reaches you in the open, you get the full scare and a big jump in fear.
- **"Do not answer."** In Papa's Office, the Prayer Room and the Master Bedroom, something calls your name once. Stand still until it passes. If you move, it finds you.
- **A puzzle that spans rooms.** The Master Bedroom window has burglary-proof bars with a four-number padlock: the night she ran, day and month. The answer is on the Living Room calendar and in Papa's diary.
- **Seven cowrie shells,** one hidden in each room. Your best count shows on the title screen.
- **Pidgin.** Switch on the title screen or in the menu. Narration, hints, menus, labels and the ghosts' voices change; letters, diaries and notes stay in the English they were written in. The translations are in `src/pidgin.js`. Have a native speaker read them before release.
- **Graphics: Auto, High, Low.** Auto starts on High and switches to Low by itself if the phone struggles. Low uses fewer lights and a lower resolution, for budget phones.
- **Share your escape.** At the end, a picture with your time, pages and cowries for WhatsApp and Instagram stories.
- **Send feedback.** In the menu. Set your email or WhatsApp number in `src/game.js` (the `FEEDBACK` line near the end-of-game code) and rebuild.
- **Privacy page.** `privacy.html` is built into `www/`. Use its address for the Play Store's privacy policy field.
- **Launch kit.** `LAUNCH.md` has the Play Store listing text and a 30-second trailer script.

## Scares that hurt

In Haunted mode every jump scare lands on you:
- **All of them:** you stumble back, drop what you were holding, and stay shaken for a few seconds. Shaken means slow, unsteady, red at the edges, with your heart pounding. Your fear also jumps.
- **Ojuju Calabar:** puts out your light in the Boys’ Quarters, Papa's Office and the Prayer Room, and every time his face comes at you, one lantern burns out.
- **Mama’s memory:** drags you back to the door.
- **Small Tobi’s echo:** snatches an item and throws it across the room. It glints where it lands; tap it to get it back.
- **The hands:** hold your ankles so you can't move.
- **The eyes:** close the dark in around you.

When fear fills up, the house takes you back to the door. Gentle mode keeps only a small stumble.

## Ghost voices

The ghosts speak in the dark: their words appear in the middle of the screen, letter by letter, each in their own style.
- **Ojuju:** big, red-glowing and shaking.
- **Mama:** soft, green and swaying.
- **Small Tobi:** small and darting.
- **Tobi:** plain, close to the mic.

Each line can also play a recording. Put the recordings in `assets/voice/`, named by line id (`O01.m4a`, `M02.m4a` and so on; comic balloons use ids like `F4-1.m4a`), and rebuild. The game makes each speaker sound like a ghost:
- **Ojuju:** pitched down, with a second deeper voice underneath, from behind you.
- **Mama:** echoing and soft.
- **Small Tobi:** pitched up and quick.

The lines are listed in `src/story.js` under `LINES`, and the comic dialogue in `src/comic.js` under `STRIPS`. The full voice script is in the Story Bible.

## Comic art

Every comic panel has an art id (`op_lagos`, `f4_gap` and so on). Until you add a drawing the game draws a simple placeholder. Save your drawing as `assets/comic/<art id>.png` (or `.jpg` / `.webp`), about 4:3, without words, and rebuild. `assets/comic/README.txt` lists every art id in play order with its caption and dialogue.

## Saving

The game saves by itself, in the middle of a room too: whenever you pick something up, solve something, find a page, and every few seconds. Close the app, come back, tap Continue, and you are standing where you left off. Dying only sends you back to the start of your current room. The save lives in the phone's browser storage, so clearing site data erases it.

## The loading illustration

Drop your picture in `assets/` and name it `loading.jpg`, `loading.png` or `loading.webp`, then run `python3 build3d.py`. The build shrinks it (1280 px on the long side) and builds it into the game. It fills the loading screen, so a tall portrait picture works best. With no picture in that folder the loading screen shows a drawn placeholder house.

## Play it right now (no APK)

Open `www/index.html` in Chrome on your phone. On Android, use the menu and choose "Add to Home screen". It then runs fullscreen from your home screen like an app. It needs a phone with WebGL, which is every phone from the last several years.

## Turn it into an APK

The Android SDK downloads are blocked in the sandbox where this was made, so the APK itself has to be built on a computer. This folder is ready for it. You need:

1. Node.js 20 or newer
2. Android Studio (it brings the Android SDK and a JDK)

Then, in this folder:

```
npm run setup    # installs Capacitor and creates the android/ project
npm run apk      # builds the debug APK
```

Your APK lands at `android/app/build/outputs/apk/debug/app-debug.apk`. Copy it to your phone and open it. Android will ask you to allow installs from your file manager or browser the first time.

The game works in both orientations, so leave the app's screen orientation unlocked (don't add `android:screenOrientation` to the `<activity>` tag). The game itself suggests turning sideways.

## Fonts

Headings, titles and labels use **Ojuju**, an African display typeface (SIL Open Font License). It is built into the game from `assets/fonts/` (Regular, Bold and ExtraBold, trimmed to the characters the game uses), so it works offline in the APK. Body text uses Bricolage Grotesque from Google Fonts. Without a connection the body falls back to the phone's default sans-serif. To swap the heading font, replace the three `.woff` files in `assets/fonts/` and rebuild.

## Editing the game

Source is in `src/`. After changing anything, run `python3 build3d.py`. It regenerates `www/index.html` (the standalone page), `dist/` and the Capacitor config. The build needs Python 3 only.

| File | What it holds |
| --- | --- |
| `src/engine.js` | The WebGL engine: lights, fog, picking, collision, billboards |
| `src/textures.js`, `src/textures2.js`, `src/textures_ng.js` | Every texture, painted with canvas drawing. `textures_ng.js` holds the Nigerian touches: terrazzo, two-tone paint, POP ceilings, Ankara prints, lace covers, the showglass, the TV, the bank calendar, the agbada, the trunk box and both family portraits |
| `src/rooms3d.js` | The Living Room, Tobi’s Room, Boys’ Quarters and Master Bedroom as 3D models, the bush lamp builder, the room list, and the hover labels |
| `src/rooms_new.js` | Mama’s Kitchen, Papa’s Office and the Prayer Room |
| `src/story.js` | The timeline, the fourteen memory pages, the room epigraphs, loading quotes and the voice lines |
| `src/comic.js` | The comic reader, every strip (opening, seven memories, endings) and the placeholder panel art |
| `src/paintings.js` | The oil paintings and their moods |
| `src/chase.js` | Ojuju's chases, hiding in the drum, the "do not answer" moments, and the roof |
| `src/pidgin.js` | The Pidgin translations and the language switch |
| `src/scares.js` | Ojuju Calabar and every other scare: jump faces, the raffia figure, shadows, runners, blackouts, whispers, tripwire zones |
| `src/nepa.js` | NEPA taking light: the power cut, the torch and its battery |
| `src/extras.js` | Chapter select, the lasting page and cowrie collections, and the gallery |
| `src/leaderboard.js` | The speedrun leaderboard: the run checks, posting a name, the live board and the on-screen timer |
| `src/game.js` | Puzzle logic, locks, hints, saving, loading screen, cutscenes, title and menus |
| `src/audio.js` | Synthesised sound and ambience |
| `src/art2.js` | Item icons and symbol art |
| `src/style.css`, `src/body.html` | Styling and page skeleton |

## Solution (spoilers)

1. The Living Room: read the paper on top of the TV, read the big standing clock (a different minute every game, such as 7:34), set the drawer dials to that time (7 3 4), take the coral beads, use them on Mama’s oil painting, take the iron key, use it on the hall door. Papa’s agbada has the matchbox.
2. Tobi’s Room: take the button from the rocking horse, use it on the teddy for the wind-up key, use that on the music box (it plays star, moon and sun in this game's order), enter that order on the little door.
3. Mama’s Kitchen: light the gas cooker (it hides a memory page). Tap the mortar by the window and pound the yam in the rhythm on the recipe card, which changes every game; for example two quick, a breath, one, a breath, three quick (Listen plays it first). The pantry opens. Take the boys’ quarters key from its nail and use it on the low door.
4. The Boys’ Quarters: light the bush lamp with the matches. Tune Effiong’s old radio (the station is different every game). His voice says the padlock key is in the bottles Oga poured for the dead: tap the schnapps rack for the small key, and use it on the padlock. Take the crowbar and mason’s hammer from the red toolbox, open the long crate with the crowbar for the brass key, hide in the blue drum when Ojuju rises, then use the brass key on the big keyhole.
5. Papa’s Office: light the hurricane lamp. Mend the smashed photo by tapping each piece until it is upright. Then tap the record player and match the voices: “Ah, my small driver!” is Effiong; “What is mine stays mine” is Papa (blue fila); the lullaby is Mama (green gele). Take the black key from the drawer and use it on the iron door.
6. Mama’s Prayer Room: light the two candles. Read the red writing under the Sacred Heart picture (SING IT BACK). Play the harmonium: the music box's order, backwards. Take the rope from the little cupboard. Tap the prayer table twice to take Mama’s white cloth. Use the rope on the hatch and climb.
7. The Master Bedroom: tear a strip from the Ankara wrapper, wipe the mirror, read it, then light the candles in the mirror's order (bone = white, blood = red, sea = blue, grave = green). The boards fall away; set the padlock on the bars to 1 4 1 0 (14 October) and climb out.
8. The Roof: run to the chimney, round the water tank and the loose zinc. Hit the newer bricks with the mason’s hammer until they break, cover him with Mama’s white cloth, then tap the chimney and choose his name: Effiong Etim.

The Boys’ Quarters chase: when the crate opens, Ojuju rises. Hide in the blue water drum in the corner nearest the door wall until he leaves.

### Memory pages (the true ending needs all 14)

| Room | Pages |
| --- | --- |
| The Living Room | the framed photograph on the side stool, the showglass cabinet |
| Tobi’s Room | the wardrobe (it will scare you first), the cot |
| Mama’s Kitchen | the gas cooker (after it is lit), the kitchen table |
| The Boys’ Quarters | Effiong’s ID card (in the crate, once open), the tin box by the kegs |
| Papa’s Office | the diary on the desk, the globe |
| The Prayer Room | the Bible stand, the prayer table |
| The Master Bedroom | the iron trunk box, the rocking chair |

You cannot come back to a room, so the game warns you before you leave one that still has pages in it.

Note for editors: inside the code the rooms keep their old keys (foyer, nursery, kitchen, cellar, study, chapel, attic), objects keep old ids (`coffin` is the long crate, `organ` the harmonium, `tree` the chimney), and Ojuju Calabar's art is still named SILAS_SVG and FACE_SILAS. Only the names players see were changed.
