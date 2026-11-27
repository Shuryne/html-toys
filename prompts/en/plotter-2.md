Create a generative art webpage called Plotter No. 2. A pen plotter draws an imaginary mountain-and-water landscape on white paper with a blue ballpoint pen. Viewers can watch the gantry move, the pen lift and lower, and the ink line grow behind the tip. Each fresh sheet gets a new composition. The pleasure of the piece is watching a patient machine draw an entire picture by hand.

Deliver one complete `index.html` file. Embed the styles, scripts, plotter glyphs, and synthesized sound effects, so the saved file can be opened by double-clicking and run offline in a browser. Drawing begins as soon as the page opens.

## Scene and palette

Use pure white paper (#FFFFFF) on a light gray cutting mat (#D9D9D9) with a faint grid. Draw the entire picture in a single ballpoint blue (#1F3FBF). Build the plotter from near-black (#111111) and aluminum gray, using red (#D93025) only on the pen clip and the mushroom-head pause button. The scene should be bright, like a clean drafting bench.

Use small, slightly letter-spaced monospaced text in the interface. The title is a single small line reading “2号绘图仪”. Use Simplified Chinese for buttons, statuses, layer names, and the title block on the paper.

## A landscape on every sheet

Generate the composition from a random seed, then convert it into an ordered list of polyline paths for the plotter to execute.

- Use layered noise to generate 5–8 ridgelines at different depths. Give different mountains distinct hatching to separate the layers naturally. Use fine lines that follow the slope for terrain contours, rainlike vertical lines for steep faces, crosshatching for shaded slopes, and sparse dots and short dashes for scree.
- At each x-coordinate, track the occlusion silhouette of the nearer ridges and clip the distant lines that fall behind it. The ridgelines and hatching should read as foreground and background in one coherent drawing.
- In the sky, draw either a sun made from concentric circles or a spiral, or a crescent moon with a few stars. Occasionally add horizontal cloud bands that break around the sun or moon, or a small flock of birds.
- In the foreground, draw either a lake made from short horizontal strokes, with ripples breaking up the mountain reflections, or a few pine trees outlined with zigzag strokes.
- Draw a thin frame and registration crosses in all four corners. Leave room along the bottom for a small title block such as “山水第 0417 号 · 种子 8F3A · 1 支笔 · 2,318 笔”. Update the artwork number, seed, and stroke count for the current drawing. Embed single-line vector glyphs for the Chinese characters, Latin letters, numerals, and symbols in the title block so the plotter writes it stroke by stroke.

## How the plotter moves

Put a guide rail on either side of the paper. The gantry travels along the Y axis, and the pen carriage with its loop of cable slides along the gantry on the X axis. When the pen lifts, its tip should visibly separate from its shadow. When the pen is down, the ink must follow the tip exactly and appear only where the tip has already passed.

Along a straight segment, move at a steady feed rate. Slow down before a corner and speed up again after it. Pen-up travel is faster than pen-down drawing. Give the ink subtle variation, including a tiny dot wherever the pen touches down, slightly lighter ink at higher speeds, and a barely perceptible wobble. Order the paths before drawing to minimize pen-up travel.

At the start, have the carriage return to its home position in a corner with a slight mechanical jolt. Draw the frame and registration crosses in the first two seconds, then begin on the sky. The best moment to watch is the tip sweeping quickly along a whole ridgeline, then laying down hundreds of short strokes on the slope as the shading and volume emerge.

## Controls and feedback

Below the paper, build a control panel that looks like physical hardware, with a knurled dial, a toggle lever, two black keycaps, a red mushroom-head button, and a small monospaced character LCD.

- Give the speed dial seven settings, 1×, 2×, 4×, 8×, 16×, 32×, and 64×, with 4× as the default.
- Press the red “暂停” (Pause) button to hold the current position. Press it again to release it and resume from the same place.
- “完成” (Finish) immediately shows the completed drawing. “换纸” (Change paper) slides the current sheet to the right into the output tray, feeds a blank sheet in from the left, and begins a new composition.
- The LCD shows the pen-up or pen-down state, coordinates, progress, and estimated time remaining in real time, for example “落笔  X 212.4  Y 88.0  37%  剩余 01:12”.
- On wide screens, add a “绘图清单” (Plot checklist) that looks screen-printed on the mat next to the machine. List each layer and its stroke count, check layers off as they finish, and display the cumulative pen-down and pen-up distances in meters.
- Clicking the paper while the plotter is drawing queues that spot. The pen later travels there to draw a tiny V-shaped bird. Clicking after the drawing finishes also wakes the machine to add the bird.
- The sound lever defaults to off. With sound enabled, use two oscillators to imitate the X and Y stepper motors. Pitch follows the speed of each axis. Lifting and lowering the pen each produce a soft click.

Keyboard controls are Space to pause or resume, F to finish, N to change paper, and + and − to change speed.

On phones, use portrait-oriented paper and a simplified gantry. Respect the system's reduced-motion preference. In that mode, show the complete artwork immediately and provide “上一图层” (Previous layer) and “下一图层” (Next layer) buttons so viewers can inspect the drawing layer by layer.
