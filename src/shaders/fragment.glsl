uniform float time;
uniform vec3 diffuse; // Base color passed from React component
uniform float opacity;
uniform sampler2D uNoiseTexture;

// Receive the live dynamic amplitude state
varying float vAudioNoise;

void main() {
    // 1. Map coordinates relative to the center of the particle point
    vec2 centerCoords = gl_PointCoord - vec2(0.5);
    float distFromCenter = length(centerCoords);

    // Hard boundary clip to ensure everything stays contained inside a circular radius
    if (distFromCenter > 0.5) {
        discard;
    }

    // 2. 🟢 THE FIX: Sample the Perlin image directly inside the particle grid!
    vec4 textureNoise = texture2D(uNoiseTexture, gl_PointCoord);

    // Create irregular, rocky edges by discarding pixels based on noise thresholds
    float rockEdgeThreshold = 0.25 + (distFromCenter * 0.65);
    if (textureNoise.r < rockEdgeThreshold) {
        discard;
    }

    // 3. Create a smooth inner glow falloff profile
    float radialGlow = 1.0 - (distFromCenter * 2.0);
    radialGlow = smoothstep(0.0, 1.0, radialGlow);

    // 4. Compute dynamic color mixing
    // Transitions from your emerald green theme to an electric cyan nebula glare
    vec3 deepSpaceTeal = vec3(0.05, 0.75, 0.95);
    vec3 coreColor = mix(diffuse, deepSpaceTeal, vAudioNoise);

    // Inject bright energy highlights that flash outward on sharp audio peaks
    vec3 energyFlash = vec3(0.6, 1.0, 0.8) * (vAudioNoise * 1.5);
    vec3 finalRGB = (coreColor + energyFlash) * radialGlow * 1.8;

    gl_FragColor = vec4(finalRGB, opacity * radialGlow);
}