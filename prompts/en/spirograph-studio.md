## Spirograph Studio

Build a standalone HTML page that simulates a geared spirograph. A small gear rolls along the inside of a large ring gear, driving a pen that draws a pattern stroke by stroke. Viewers can use sliders to adjust tooth counts, pen-hole position, and drawing speed, and change inks to draw overlapping layers. Style the device as Plate No. 7 from the fictional Orbis Drafting Company, like a physical instrument on a drafting desk.

### Palette and type

Use warm drafting paper (#f6f1e7) with a faint 24 px square grid. Set primary text in ink blue (#1d2433), secondary text in muted brown-gray (#7a7262), and separators in light brown (#d8ccb4).

Offer five inks in vermilion (#e2462b), Prussian blue (#1f3f78), emerald green (#1c7d64), saffron yellow (#e8a21b), and plum purple (#7a2e6b).

Use a geometric sans-serif for titles and controls, preferably Avenir Next, Avenir, Futura, or Century Gothic. Set numerical readouts and dial labels in a monospaced face such as Courier New.

### Layout and controls

At the top, show the title “Spirograph Studio”, with “Studio” in vermilion. Place a thick horizontal rule below it. On desktop, use two columns, with a large round drawing plate on the left and a settings card on the right. Switch to a single column below 820 px.

Use a radial gradient for the paper on the drawing plate, with two faint halos around the outer rim and a soft shadow. Stack two canvas elements inside the plate and size their drawing buffers for the device pixel ratio. Keep the existing ink on the lower canvas and redraw the gear and pen on the upper canvas every frame. Show the current curve parameters in small monospaced text below the plate.

Give the settings card a cream background with a 6 px hard offset shadow. Add a short explanation and separate the four sliders with dashed rules. Give the tracks ruler-like tick marks and the thumbs the appearance of small bullseyes.

- Outer ring gear tooth count from 40 to 144
- Inner gear tooth count from 12 to 100
- Pen-hole position from 0.10 to 1.00
- Drawing speed from 1 to 10

Below the sliders, add a row of round ink swatches and four pill-shaped buttons labeled “Pause / Resume”, “New layer”, “Randomize”, and “Fresh paper”. Show drawing progress with a progress bar and a lap counter.

### Drawing animation

Calculate the pen position using the following hypotrochoid equations.

x = (R − r)cos(t) + d cos((R − r)/r × t)  
y = (R − r)sin(t) − d sin((R − r)/r × t)

Draw the curve segment by segment in increments of 0.015 radians. Use multiply blending so overlapping ink lines naturally darken.

Draw the toothed outer ring on the upper canvas, along with the small gear rolling along its inner edge, its spokes rotating in the opposite direction, and a pen arm connecting the gear to the colored tip. The curve closes and drawing stops automatically after r / gcd(R, r) full laps. Here, gcd is the greatest common divisor of the outer and inner tooth counts.

Keep previously drawn layers. On resize, redraw them using their saved parameters. Add a slight spring effect when the pointer hovers over a slider thumb or ink swatch. With the system's reduced-motion preference enabled, draw the curve almost immediately and change control states without transitions.

### Description

Turn the classic gear drawing toy into a piece with the tactile feel of ink on paper. The faint ring gear, rolling gear, and pen arm move across the plate. The pen follows the curve until its endpoints meet and form a complete flower. Changing a tooth count or pen-hole position changes the flower. Layers of colored ink overlap on the warm paper and darken where their lines cross, like a print made with several inks.

### Visual implementation

- Trace the curve progressively on the device-pixel-ratio-aware lower canvas and retain the ink already drawn.
- Use a separate upper canvas for the ring gear, rolling gear, spokes, pen arm, and pen tip.
- Composite the ink using multiply blending so intersections darken.
- Use the greatest common divisor of the tooth counts to determine when the curve closes.
- Save the layers and redraw them when the page is resized.
- Make the grid paper with two linear gradients, one horizontal and one vertical, and the round paper with a radial gradient.
- Give the sliders ruler-like tick marks and bullseye thumbs with a slight spring effect on hover.

### Interaction

Dragging an outer ring, inner gear, or pen-hole slider starts the current layer again with the new settings. Previously drawn layers stay on the paper. Click a swatch to change ink, adjust speed with the speed slider, and use Pause and Resume to control playback.

“New layer” starts another drawing on top of the current one. “Randomize” chooses parameters and an ink at random. “Fresh paper” clears all layers. The progress bar and lap counter show how far the current pattern is from closing.
