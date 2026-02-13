# AI Dragon Generation Plan

## Goal
Generate 30+ ultra high-quality dragon sprite sheets using AI image generation to match the quality of existing monsters like `alien.png` and `cyber_dragon_sheet.png`.

## Current Progress
✅ Generated 10 AI dragons so far
- Fire dragons: 6 variants
- Ice dragons: 2 variants  
- Shadow dragons: 2 variants
- Storm dragons: 1 variant

📍 **Remaining: 20+ more dragons to reach 30 total**

## Dragon Types to Generate

### Classic Dragons (4-5 variants each)
1. **Fire Dragons** (✅ 6 done) - Red/orange, flames, volcanic
2. **Ice Dragons** (✅ 2 done, need 3 more) - Blue/white, frost, crystalline
3. **Shadow Dragons** (✅ 2 done, need 3 more) - Purple/black, dark energy
4. **Storm Dragons** (✅ 1 done, need 4 more) - Blue/yellow, lightning, electric

### Unique Dragon Types (Need 20+ more)
5. **Earth/Stone Dragons** - Brown/gray, rocky texture, mountain theme
6. **Forest/Nature Dragons** - Green/brown, vines, leaves, wooden scales
7. **Metal/Gold Dragons** - Metallic gold/silver, shiny armor plating
8. **Poison/Acid Dragons** - Toxic green/purple, dripping venom
9. **Light/Holy Dragons** - White/gold, radiant, angelic wings
10. **Dark/Void Dragons** - Deep black/purple, cosmic, star-filled
11. **Lava/Magma Dragons** - Orange/red, molten rock, glowing cracks
12. **Crystal Dragons** - Multi-colored, gemstone, prismatic
13. **Wind/Air Dragons** - Pale blue/white, cloudy, ethereal
14. **Water/Sea Dragons** - Aqua/teal, scales like fish, ocean theme
15. **Bone/Undead Dragons** - Skeletal, ghostly, necromantic
16. **Celestial/Star Dragons** - Deep blue with stars, cosmic energy
17. **Inferno Dragons** - Deep red/black, intense heat, hellfire
18. **Frost Giants Dragons** - Pale icy blue, massive, ancient
19. **Mechanical Dragons** - Steampunk/cyberpunk, metallic parts
20. **Rainbow/Prismatic Dragons** - Multi-colored, magical, shifting hues

## AI Generation Prompts Template

### Standard Dragon Prompt Format
```
Ultra high quality pixel art sprite sheet of a [TYPE] dragon, professional RPG game quality. 64x64 pixel frames arranged in neat grid rows. [DESCRIPTION]. Multiple animation sequences: walk cycle from multiple angles, breath attack, claw swipe attack, hurt/death sequence. Detailed scales with gradient shading, [WING_DETAILS], professional game developer quality with beautiful anti-aliasing and detail. Transparent background. LPC RPG sprite sheet format compatible. Same artistic quality as high-end indie game pixel art like Owlboy or CrossCode.
```

### Example Prompts

**Earth Dragon:**
```
Ultra high quality pixel art sprite sheet of an earth/stone dragon, professional RPG game quality. 64x64 pixel frames arranged in neat grid rows. Massive brown and gray dragon with rocky textured scales, glowing amber eyes, stone-like horns, earth/rock breath attack. Multiple animation sequences: walk cycle from multiple angles, rock breath attack, claw swipe attack, hurt/death sequence. Detailed rocky scales with brown and gray gradient shading, boulder-like wing membranes, cracks with glowing magma, professional game developer quality with beautiful anti-aliasing. Transparent background. LPC RPG sprite sheet format. Same artistic quality as high-end indie game pixel art.
```

**Celestial Dragon:**
```
Ultra high quality pixel art sprite sheet of a celestial/star dragon, professional RPG game quality. 64x64 pixel frames arranged in neat grid rows. Mystical deep blue dragon with star-filled scales, glowing white eyes, constellation patterns, cosmic energy breath. Multiple animation sequences: walk cycle from multiple angles, starlight breath attack, claw swipe attack, hurt/death sequence. Detailed scales with midnight blue and white stars gradient shading, translucent cosmic wing membranes with nebula patterns, professional game developer quality with beautiful anti-aliasing. Transparent background. LPC RPG sprite sheet format. Same artistic quality as high-end indie game pixel art.
```

## Automated Generation Script

When AI quota resets (approximately 6:30pm EST, 2026-02-11), use the Python script below to automatically batch-generate dragons.

**Note:** This is a reference/planning document. Actual generation will use the `generate_image` tool when quota is available.

## Next Steps

1. **Wait for quota reset** (~4.5 hours from 1:15pm EST)
2. **Batch generate remaining dragons** using prompts above
3. **Save to**: `d:\NFTagachi\frontend\public\premium_sprites\dragons\`
4. **Organize by type** with clear naming convention:
   - `earth_dragon_001.png`, `earth_dragon_002.png`
   - `celestial_dragon_001.png`
   - etc.

## Quality Standards
- Must match quality of `alien.png` and `cyber_dragon_sheet.png`
- Ultra-detailed pixel art with professional shading
- Proper LPC format with complete animation sequences
- Transparent backgrounds
- 64x64 pixel frames minimum
- Gradient shading and anti-aliasing
