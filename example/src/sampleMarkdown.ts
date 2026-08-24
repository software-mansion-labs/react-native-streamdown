export const sampleMarkdown = `# Black Holes

Black holes are among the most **fascinating** and _mysterious_ objects in the universe.

## What Is a Black Hole?

A black hole is a region of spacetime where gravity is so **extremely strong** that nothing — not even light or other electromagnetic waves — has enough energy to escape it.

The boundary of no escape is called the **event horizon**. Although it has a great effect on the fate and circumstances of an object crossing it, it has no locally detectable features according to \`general relativity\`.

## Types of Black Holes

There are **three main types** of black holes:

1. **Stellar black holes** — formed by the gravitational collapse of a star
2. **Supermassive black holes** — found at the center of most galaxies
3. **Intermediate black holes** — a class between stellar and supermassive

| Type         | Typical mass         | Where they form                 |
| ------------ | -------------------- | ------------------------------- |
| Stellar      | 3 – 100              | Collapse of a massive star      |
| Intermediate | 100 – 100,000        | Star cluster mergers (proposed) |
| Supermassive | 10⁶ – 10¹⁰           | Galactic centers                |

### Stellar Black Holes

When a massive star (_typically > 25 solar masses_) exhausts its nuclear fuel, it may collapse under its own gravity to form a stellar black hole.

### Supermassive Black Holes

These have masses ranging from **millions** to **billions** of solar masses. The supermassive black hole at the center of the Milky Way is called \`Sagittarius A*\`.

## The Math Behind the Horizon

The size of the event horizon is set by the **Schwarzschild radius** $r_s = \\frac{2GM}{c^2}$, where $G$ is the gravitational constant, $M$ is the mass, and $c$ is the speed of light.

For a non-rotating black hole this defines a perfect sphere:

$$
r_s = \\frac{2GM}{c^2}
$$

Black holes also radiate. The **Hawking temperature** falls off with mass:

$$
T_H = \\frac{\\hbar c^3}{8 \\pi G M k_B}
$$

## Estimating a Radius

A quick way to compute the Schwarzschild radius of the Sun in Python:

\`\`\`python
G = 6.674e-11   # gravitational constant
c = 2.998e8     # speed of light
M = 1.989e30    # one solar mass, in kg

r_s = 2 * G * M / c ** 2
print(f"{r_s:.0f} m")  # ~2950 m
\`\`\`

## Key Properties

- **Mass**: Determines the size of the event horizon
- **Spin**: Black holes can rotate at nearly the speed of light
- **Charge**: Theoretically possible but astrophysically negligible

## Open Questions

- [x] Detect black hole mergers via gravitational waves
- [x] Image a supermassive black hole's shadow
- [ ] Directly observe Hawking radiation
- [ ] Reconcile ~~classical singularities~~ with quantum gravity

## Famous Image

In 2019, the **Event Horizon Telescope** collaboration released the first-ever direct image of a black hole — the supermassive black hole in galaxy _Messier 87_.

![First image of a black hole, Messier 87](https://upload.wikimedia.org/wikipedia/commons/4/4f/Black_hole_-_Messier_87_crop_max_res.jpg)

> "We have seen what we thought was unseeable." — Sheperd Doeleman

Learn more at [NASA's Black Hole page](https://science.nasa.gov/astrophysics/focus-areas/black-holes).

---

_This content is for demonstration purposes only._
`;
