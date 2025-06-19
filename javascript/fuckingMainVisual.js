document.addEventListener("DOMContentLoaded", function () {
  //For text
  // Options from your React component props
  const options = {
    text: "Hello Every One!",
    fontFamily: "Compressa VF",
    fontUrl:
      "https://res.cloudinary.com/dr6lvwubh/raw/upload/v1529908256/CompressaPRO-GX.woff2",
    width: true,
    weight: true,
    italic: true,
    alpha: false,
    flex: true,
    stroke: true, // Changed to true based on your original usage
    scale: false,
    textColor: "#813939",
    strokeColor: "#ff0000",
    className: "",
    minFontSize: 36,
  };

  const containerRef = document.querySelector(".text-pressure-container");
  const titleRef = document.getElementById("textPressureTitle");
  let spansRef = []; // Array to hold references to individual character spans

  const mouseRef = { x: 0, y: 0 };
  const cursorRef = { x: 0, y: 0 };

  let currentFontSize = options.minFontSize;
  let currentScaleY = 1;
  let currentLineHeight = 1;

  const chars = options.text.split("");

  // Populate the title with spans for each character
  chars.forEach((char, i) => {
    const span = document.createElement("span");
    span.textContent = char;
    span.dataset.char = char; // For stroke effect
    span.style.color = options.stroke ? "transparent" : options.textColor; // Set initial color
    // Set initial font-variation-settings for the variable font to ensure it renders
    span.style.fontVariationSettings = `'wght' 400, 'wdth' 100, 'ital' 0`;
    span.style.opacity = options.alpha ? 0 : 1; // Initial opacity based on alpha option
    titleRef.appendChild(span);
    spansRef.push(span);
  });

  // Apply flex and stroke classes based on options
  if (options.flex) {
    titleRef.classList.add("flex-enabled");
  }
  if (options.stroke) {
    titleRef.classList.add("stroke-enabled");
  }

  const dist = (a, b) => {
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const handleMouseMove = (e) => {
    cursorRef.x = e.clientX;
    cursorRef.y = e.clientY;
  };
  const handleTouchMove = (e) => {
    const t = e.touches[0];
    cursorRef.x = t.clientX;
    cursorRef.y = t.clientY;
    e.preventDefault(); // Prevent scrolling on touch devices
  };

  window.addEventListener("mousemove", handleMouseMove);
  window.addEventListener("touchmove", handleTouchMove, { passive: false });

  // Function to set initial mouse position based on container center
  const setInitialMousePosition = () => {
    if (containerRef) {
      const { left, top, width, height } = containerRef.getBoundingClientRect();
      mouseRef.x = left + width / 2;
      mouseRef.y = top + height / 2;
      cursorRef.x = mouseRef.x;
      cursorRef.y = mouseRef.y;
    }
  };

  const setSize = () => {
    if (!containerRef || !titleRef) return;

    const { width: containerW, height: containerH } =
      containerRef.getBoundingClientRect();

    let newFontSize = containerW / (chars.length * 0.6); // Adjust factor for better fitting
    newFontSize = Math.max(newFontSize, options.minFontSize);

    currentFontSize = newFontSize;
    currentScaleY = 1;
    currentLineHeight = 1;

    // Apply immediately to measure (using CSS variables)
    titleRef.style.setProperty("--font-size", `${currentFontSize}px`);
    titleRef.style.setProperty("--line-height", currentLineHeight);
    titleRef.style.setProperty(
      "--transform-scale",
      `scale(1, ${currentScaleY})`
    );

    // Use requestAnimationFrame to ensure styles are applied before measuring
    requestAnimationFrame(() => {
      if (!titleRef) return;
      const textRect = titleRef.getBoundingClientRect();

      if (options.scale && textRect.height > 0) {
        const yRatio = containerH / textRect.height;
        currentScaleY = yRatio;
        currentLineHeight = yRatio;
        titleRef.style.setProperty("--line-height", currentLineHeight);
        titleRef.style.setProperty(
          "--transform-scale",
          `scale(1, ${currentScaleY})`
        );
      }
    });
  };

  // Call setInitialMousePosition and setSize on window load and resize
  window.addEventListener("load", () => {
    setInitialMousePosition();
    setSize();
    animate(); // Start animation loop after everything is set up
  });
  window.addEventListener("resize", () => {
    setInitialMousePosition(); // Recalculate mouse start position on resize
    setSize();
  });

  let rafId;
  const animate = () => {
    // Smoothly move mouseRef towards cursorRef
    mouseRef.x += (cursorRef.x - mouseRef.x) / 10; // Slightly faster smoothing
    mouseRef.y += (cursorRef.y - mouseRef.y) / 10; // Slightly faster smoothing

    if (titleRef) {
      const titleRect = titleRef.getBoundingClientRect();
      // Use the half-width of the actual text for maxDist for more precise effect
      const maxDist = titleRect.width / 2;

      spansRef.forEach((span) => {
        if (!span) return;

        const rect = span.getBoundingClientRect();
        const charCenter = {
          x: rect.left + rect.width / 2, // Use rect.left for accurate position
          y: rect.top + rect.height / 2, // Use rect.top for accurate position
        };

        const d = dist(mouseRef, charCenter);

        const getAttr = (distance, minVal, maxVal) => {
          // Normalize distance relative to maxDist
          const normalizedDist = Math.min(1, Math.abs(distance) / maxDist);
          // Linearly interpolate between maxVal (when d is 0) and minVal (when d is maxDist)
          return maxVal - normalizedDist * (maxVal - minVal);
        };

        // Clamp values to ensure they stay within valid ranges for variable fonts
        const wdth = options.width
          ? Math.max(5, Math.min(200, Math.floor(getAttr(d, 5, 200))))
          : 100;
        const wght = options.weight
          ? Math.max(100, Math.min(900, Math.floor(getAttr(d, 100, 900))))
          : 400;
        const italVal = options.italic
          ? Math.max(0, Math.min(1, getAttr(d, 0, 1))).toFixed(2)
          : 0;
        const alphaVal = options.alpha
          ? Math.max(0, Math.min(1, getAttr(d, 0, 1))).toFixed(2)
          : 1;

        span.style.opacity = alphaVal;
        span.style.fontVariationSettings = `'wght' ${wght}, 'wdth' ${wdth}, 'ital' ${italVal}`;
      });
    }

    rafId = requestAnimationFrame(animate);
  };

  // --- Configuration Variables ---
  // These parameters control the behavior and appearance of the fluid simulation.
  const config = {
    SIM_RESOLUTION: 128, // Resolution of the fluid simulation grid
    DYE_RESOLUTION: 1800, // Resolution of the dye (color) texture
    DENSITY_DISSIPATION: 0.97, // How quickly color dissipates
    VELOCITY_DISSIPATION: 0.98, // How quickly velocity dissipates
    PRESSURE: 0.8, // Strength of the pressure solver
    PRESSURE_ITERATIONS: 20, // Number of iterations for pressure solver (higher = more accurate)
    CURL: 30, // Strength of vorticity confinement (adds swirls)
    SPLAT_RADIUS: 0.4, // Radius of the splat (how large the initial splash is)
    SPLAT_FORCE: 6000, // Force applied when a splat occurs
    SHADING: true, // Enable/disable shading (adds depth perception)
    COLOR_UPDATE_SPEED: 10, // How quickly new colors are generated for splats
    BACK_COLOR: { r: 0, g: 0, b: 0 }, // Background color of the canvas (unused if transparent is true)
    TRANSPARENT: false, // Make the background transparent (useful for overlays)
  };

  // --- Global WebGL State Variables ---
  let gl; // The WebGL rendering context
  let ext; // WebGL extensions (e.g., for half-float textures)
  let canvas; // Reference to the HTML canvas element
  let blit; // Function to render a full-screen quad (initialized later)

  // --- Simulation Program Variables ---
  let baseVertexShader; // Common vertex shader for all programs
  let copyProgram; // Program to copy textures
  let clearProgram; // Program to clear textures
  let splatProgram; // Program for applying splats (force and color)
  let advectionProgram; // Program for advecting (moving) quantities (velocity, dye)
  let divergenceProgram; // Program for calculating divergence of velocity field
  let curlProgram; // Program for calculating curl (vorticity) of velocity field
  let vorticityProgram; // Program for applying vorticity confinement
  let pressureProgram; // Program for solving pressure
  let gradientSubtractProgram; // Program for subtracting pressure gradient from velocity
  let displayProgram; // Program for rendering the final fluid to the screen

  // --- Simulation Data (Framebuffers) ---
  let dye; // Double FBO for color (dye)
  let velocity; // Double FBO for velocity field
  let divergence; // Single FBO for divergence
  let curl; // Single FBO for curl (vorticity)
  let pressure; // Double FBO for pressure field

  // --- Animation Loop Variables ---
  let lastUpdateTime = Date.now();
  let colorUpdateTimer = 0.0;
  let pointers = []; // Stores information about mouse/touch pointers for interaction

  // --- WebGL Utility Functions ---

  /**
   * Initializes the WebGL context and necessary extensions.
   * @param {HTMLCanvasElement} canvasElement - The canvas element to get the context from.
   * @returns {{gl: WebGLRenderingContext, ext: object}} - Object containing the WebGL context and extensions.
   */
  function getWebGLContext(canvasElement) {
    const params = {
      alpha: true, // Enable alpha channel (for transparency)
      depth: false, // Disable depth buffer (not needed for 2D fluid)
      stencil: false, // Disable stencil buffer
      antialias: false, // Disable antialiasing (handled by higher resolutions if desired)
      preserveDrawingBuffer: false, // Don't preserve drawing buffer (performance)
    };

    let glContext = canvasElement.getContext("webgl2", params);
    const isWebGL2 = !!glContext;

    if (!isWebGL2) {
      glContext =
        canvasElement.getContext("webgl", params) ||
        canvasElement.getContext("experimental-webgl", params);
    }

    if (!glContext) {
      alert(
        "Your browser does not support WebGL. Please try a different browser like Chrome or Firefox."
      );
      return null;
    }

    // Get necessary extensions for WebGL1 if WebGL2 is not available
    let halfFloat, supportLinearFiltering;
    if (isWebGL2) {
      glContext.getExtension("EXT_color_buffer_float"); // Required for rendering to float textures
      supportLinearFiltering = glContext.getExtension(
        "OES_texture_float_linear"
      ); // For linear filtering of float textures
    } else {
      halfFloat = glContext.getExtension("OES_texture_half_float"); // For half-float textures
      supportLinearFiltering = glContext.getExtension(
        "OES_texture_half_float_linear"
      ); // For linear filtering of half-float textures
    }

    glContext.clearColor(0.0, 0.0, 0.0, 1.0); // Set default clear color

    // Determine best texture formats based on supported extensions
    let formatRGBA, formatRG, formatR;
    if (isWebGL2) {
      formatRGBA = getSupportedFormat(
        glContext,
        glContext.RGBA16F,
        glContext.RGBA,
        glContext.HALF_FLOAT
      );
      formatRG = getSupportedFormat(
        glContext,
        glContext.RG16F,
        glContext.RG,
        glContext.HALF_FLOAT
      );
      formatR = getSupportedFormat(
        glContext,
        glContext.R16F,
        glContext.RED,
        glContext.HALF_FLOAT
      );
    } else {
      // Fallback formats for WebGL1 (often uses RGBA for R and RG)
      formatRGBA = getSupportedFormat(
        glContext,
        glContext.RGBA,
        glContext.RGBA,
        halfFloat && halfFloat.HALF_FLOAT_OES
      );
      formatRG = getSupportedFormat(
        glContext,
        glContext.RGBA,
        glContext.RGBA,
        halfFloat && halfFloat.HALF_FLOAT_OES
      );
      formatR = getSupportedFormat(
        glContext,
        glContext.RGBA,
        glContext.RGBA,
        halfFloat && halfFloat.HALF_FLOAT_OES
      );
    }

    return {
      gl: glContext,
      ext: {
        formatRGBA,
        formatRG,
        formatR,
        halfFloatTexType: isWebGL2
          ? glContext.HALF_FLOAT
          : halfFloat && halfFloat.HALF_FLOAT_OES,
        supportLinearFiltering,
      },
    };
  }

  /**
   * Checks if a texture format is supported for rendering.
   * @param {WebGLRenderingContext} glContext - The WebGL context.
   * @param {number} internalFormat - The internal format of the texture.
   * @param {number} format - The format of the texel data.
   * @param {number} type - The data type of the texel data.
   * @returns {{internalFormat: number, format: number}|null} - Supported format object or null.
   */
  function getSupportedFormat(glContext, internalFormat, format, type) {
    if (!supportRenderTextureFormat(glContext, internalFormat, format, type)) {
      // Try fallback formats if the preferred one is not supported
      switch (internalFormat) {
        case glContext.R16F:
          return getSupportedFormat(
            glContext,
            glContext.RG16F,
            glContext.RG,
            type
          );
        case glContext.RG16F:
          return getSupportedFormat(
            glContext,
            glContext.RGBA16F,
            glContext.RGBA,
            type
          );
        default:
          return null;
      }
    }
    return { internalFormat, format };
  }

  /**
   * Tests if a specific texture format can be rendered to.
   * @param {WebGLRenderingContext} glContext - The WebGL context.
   * @param {number} internalFormat - The internal format of the texture.
   * @param {number} format - The format of the texel data.
   * @param {number} type - The data type of the texel data.
   * @returns {boolean} - True if supported, false otherwise.
   */
  function supportRenderTextureFormat(glContext, internalFormat, format, type) {
    const texture = glContext.createTexture();
    glContext.bindTexture(glContext.TEXTURE_2D, texture);
    glContext.texParameteri(
      glContext.TEXTURE_2D,
      glContext.TEXTURE_MIN_FILTER,
      glContext.NEAREST
    );
    glContext.texParameteri(
      glContext.TEXTURE_2D,
      glContext.TEXTURE_MAG_FILTER,
      glContext.NEAREST
    );
    glContext.texParameteri(
      glContext.TEXTURE_2D,
      glContext.TEXTURE_WRAP_S,
      glContext.CLAMP_TO_EDGE
    );
    glContext.texParameteri(
      glContext.TEXTURE_2D,
      glContext.TEXTURE_WRAP_T,
      glContext.CLAMP_TO_EDGE
    );
    glContext.texImage2D(
      glContext.TEXTURE_2D,
      0,
      internalFormat,
      4,
      4,
      0,
      format,
      type,
      null
    );

    const fbo = glContext.createFramebuffer();
    glContext.bindFramebuffer(glContext.FRAMEBUFFER, fbo);
    glContext.framebufferTexture2D(
      glContext.FRAMEBUFFER,
      glContext.COLOR_ATTACHMENT0,
      glContext.TEXTURE_2D,
      texture,
      0
    );

    const status = glContext.checkFramebufferStatus(glContext.FRAMEBUFFER);
    return status === glContext.FRAMEBUFFER_COMPLETE;
  }

  /**
   * Compiles a WebGL shader.
   * @param {number} type - The type of shader (gl.VERTEX_SHADER or gl.FRAGMENT_SHADER).
   * @param {string} source - The GLSL source code for the shader.
   * @param {string[]} [keywords=[]] - Optional array of keywords to #define in the shader.
   * @returns {WebGLShader} - The compiled shader.
   */
  function compileShader(type, source, keywords = []) {
    let finalSource = "";
    keywords.forEach((keyword) => {
      finalSource += "#define " + keyword + "\n";
    });
    finalSource += source;

    const shader = gl.createShader(type);
    gl.shaderSource(shader, finalSource);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.error(
        `Shader compile error (${
          type === gl.VERTEX_SHADER ? "Vertex" : "Fragment"
        }):`,
        gl.getShaderInfoLog(shader)
      );
    }
    return shader;
  }

  /**
   * Creates and links a WebGL program from vertex and fragment shaders.
   * @param {WebGLShader} vertexShader - The compiled vertex shader.
   * @param {WebGLShader} fragmentShader - The compiled fragment shader.
   * @returns {WebGLProgram} - The linked WebGL program.
   */
  function createProgram(vertexShader, fragmentShader) {
    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error("Program link error:", gl.getProgramInfoLog(program));
    }
    return program;
  }

  /**
   * Gets all uniform locations for a given WebGL program.
   * @param {WebGLProgram} program - The WebGL program.
   * @returns {Object.<string, WebGLUniformLocation>} - An object mapping uniform names to their locations.
   */
  function getUniforms(program) {
    const uniforms = {};
    const uniformCount = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);
    for (let i = 0; i < uniformCount; i++) {
      const uniformName = gl.getActiveUniform(program, i).name;
      uniforms[uniformName] = gl.getUniformLocation(program, uniformName);
    }
    return uniforms;
  }

  /**
   * Represents a WebGL shader program with uniform caching.
   */
  class ShaderProgram {
    /**
     * @param {WebGLShader} vertexShader - The compiled vertex shader.
     * @param {WebGLShader} fragmentShader - The compiled fragment shader.
     */
    constructor(vertexShader, fragmentShader) {
      this.program = createProgram(vertexShader, fragmentShader);
      this.uniforms = getUniforms(this.program);
    }

    /** Binds the shader program for use. */
    bind() {
      gl.useProgram(this.program);
    }
  }

  /**
   * Represents a single Frame Buffer Object (FBO) with an attached texture.
   */
  class FBO {
    /**
     * @param {number} width - The width of the FBO texture.
     * @param {number} height - The height of the FBO texture.
     * @param {number} internalFormat - The internal format of the texture (e.g., gl.RGBA16F).
     * @param {number} format - The format of the texture data (e.g., gl.RGBA).
     * @param {number} type - The data type of the texture (e.g., gl.HALF_FLOAT).
     * @param {number} param - The texture filtering parameter (e.g., gl.LINEAR or gl.NEAREST).
     */
    constructor(width, height, internalFormat, format, type, param) {
      this.width = width;
      this.height = height;
      this.texelSizeX = 1.0 / width;
      this.texelSizeY = 1.0 / height;

      this.texture = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, this.texture);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, param);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, param);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texImage2D(
        gl.TEXTURE_2D,
        0,
        internalFormat,
        width,
        height,
        0,
        format,
        type,
        null
      );

      this.fbo = gl.createFramebuffer();
      gl.bindFramebuffer(gl.FRAMEBUFFER, this.fbo);
      gl.framebufferTexture2D(
        gl.FRAMEBUFFER,
        gl.COLOR_ATTACHMENT0,
        gl.TEXTURE_2D,
        this.texture,
        0
      );
      gl.viewport(0, 0, width, height); // Set viewport for this FBO
      gl.clear(gl.COLOR_BUFFER_BIT); // Clear the FBO initially
    }

    /**
     * Activates the texture unit and binds this FBO's texture.
     * @param {number} id - The texture unit ID (e.g., 0, 1, 2).
     * @returns {number} - The texture unit ID.
     */
    attach(id) {
      gl.activeTexture(gl.TEXTURE0 + id);
      gl.bindTexture(gl.TEXTURE_2D, this.texture);
      return id;
    }
  }

  /**
   * Represents a pair of FBOs for ping-ponging (reading from one, writing to the other).
   */
  class DoubleFBO {
    /**
     * @param {number} width - The width of the FBO textures.
     * @param {number} height - The height of the FBO textures.
     * @param {number} internalFormat - The internal format of the textures.
     * @param {number} format - The format of the textures.
     * @param {number} type - The data type of the textures.
     * @param {number} param - The texture filtering parameter.
     */
    constructor(width, height, internalFormat, format, type, param) {
      this.width = width;
      this.height = height;
      this.texelSizeX = 1.0 / width;
      this.texelSizeY = 1.0 / height;
      this.read = new FBO(width, height, internalFormat, format, type, param);
      this.write = new FBO(width, height, internalFormat, format, type, param);
    }

    /** Swaps the read and write FBOs. */
    swap() {
      let temp = this.read;
      this.read = this.write;
      this.write = temp;
    }

    /**
     * Resizes the double FBO. Copies content from old FBO to new one.
     * @param {number} w - New width.
     * @param {number} h - New height.
     * @param {number} internalFormat - New internal format.
     * @param {number} format - New format.
     * @param {number} type - New type.
     * @param {number} param - New parameter.
     * @returns {DoubleFBO} - The resized DoubleFBO.
     */
    resize(w, h, internalFormat, format, type, param) {
      if (this.width === w && this.height === h) return this;

      // Dispose of old FBOs to free memory
      gl.deleteTexture(this.read.texture);
      gl.deleteFramebuffer(this.read.fbo);
      gl.deleteTexture(this.write.texture);
      gl.deleteFramebuffer(this.write.fbo);

      this.width = w;
      this.height = h;
      this.texelSizeX = 1.0 / w;
      this.texelSizeY = 1.0 / h;
      this.read = new FBO(w, h, internalFormat, format, type, param);
      this.write = new FBO(w, h, internalFormat, format, type, param);

      // Copy contents from old textures to new ones (optional, but good for visual continuity)
      // This requires a separate copy program, which is why it was in your original code.
      // For simplicity here, we just re-initialize. If seamless resizing is critical,
      // you'd re-introduce the resizeFBO and resizeDoubleFBO with a copy step.
      return this;
    }
  }

  // --- GLSL Shader Definitions ---

  // Basic vertex shader for drawing a full-screen quad
  const baseVertexShaderSource = `
            precision highp float;
            attribute vec2 aPosition;
            varying vec2 vUv;
            varying vec2 vL;
            varying vec2 vR;
            varying vec2 vT;
            varying vec2 vB;
            uniform vec2 texelSize;

            void main () {
                vUv = aPosition * 0.5 + 0.5; // Convert from clip space (-1 to 1) to UV space (0 to 1)
                // Calculate neighbor UVs for finite difference approximations
                vL = vUv - vec2(texelSize.x, 0.0);
                vR = vUv + vec2(texelSize.x, 0.0);
                vT = vUv + vec2(0.0, texelSize.y);
                vB = vUv - vec2(0.0, texelSize.y);
                gl_Position = vec4(aPosition, 0.0, 1.0); // Output vertex position
            }
        `;

  // Fragment shader to copy a texture
  const copyShaderSource = `
            precision mediump float;
            precision mediump sampler2D;
            varying highp vec2 vUv;
            uniform sampler2D uTexture;

            void main () {
                gl_FragColor = texture2D(uTexture, vUv);
            }
        `;

  // Fragment shader to clear a texture by a given value
  const clearShaderSource = `
            precision mediump float;
            precision mediump sampler2D;
            varying highp vec2 vUv;
            uniform sampler2D uTexture;
            uniform float value;

            void main () {
                gl_FragColor = value * texture2D(uTexture, vUv);
            }
        `;

  // Fragment shader for applying a splat (force or color)
  const splatShaderSource = `
            precision highp float;
            precision highp sampler2D;
            varying vec2 vUv;
            uniform sampler2D uTarget;    // The texture to splat onto (velocity or dye)
            uniform float aspectRatio;    // Aspect ratio of the canvas
            uniform vec2 point;           // Normalized coordinates of the splat center
            uniform vec3 color;           // Color (for dye) or velocity components (for velocity)
            uniform float radius;         // Radius of the splat

            void main () {
                vec2 p = vUv - point.xy;  // Vector from splat center to current fragment UV
                p.x *= aspectRatio;       // Adjust for aspect ratio
                // Calculate Gaussian falloff
                vec3 splat = exp(-dot(p, p) / radius) * color;
                vec3 base = texture2D(uTarget, vUv).xyz; // Get existing value from target texture
                gl_FragColor = vec4(base + splat, 1.0); // Add splat to existing value
            }
        `;

  // Fragment shader for advection (moving quantities through the velocity field)
  const advectionShaderSource = `
            precision highp float;
            precision highp sampler2D;
            varying vec2 vUv;
            uniform sampler2D uVelocity; // Velocity field
            uniform sampler2D uSource;   // Quantity to advect (e.g., dye, or velocity itself)
            uniform vec2 texelSize;      // Size of a texel in the velocity texture
            uniform float dt;            // Delta time
            uniform float dissipation;   // Dissipation factor

            // Manual bilinear interpolation function (used if hardware linear filtering is not supported)
            vec4 bilerp (sampler2D sam, vec2 uv, vec2 tsize) {
                vec2 st = uv / tsize - 0.5; // Offset to center of texel
                vec2 iuv = floor(st);       // Integer part of texel coordinate
                vec2 fuv = fract(st);       // Fractional part for interpolation

                // Sample 4 surrounding texels
                vec4 a = texture2D(sam, (iuv + vec2(0.5, 0.5)) * tsize);
                vec4 b = texture2D(sam, (iuv + vec2(1.5, 0.5)) * tsize);
                vec4 c = texture2D(sam, (iuv + vec2(0.5, 1.5)) * tsize);
                vec4 d = texture2D(sam, (iuv + vec2(1.5, 1.5)) * tsize);

                // Bilinear interpolation
                return mix(mix(a, b, fuv.x), mix(c, d, fuv.x), fuv.y);
            }

            void main () {
                // Trace back current fragment's position using velocity field and dt
                #ifdef MANUAL_FILTERING
                    vec2 coord = vUv - dt * bilerp(uVelocity, vUv, texelSize).xy * texelSize;
                    gl_FragColor = dissipation * bilerp(uSource, coord, texelSize);
                #else
                    vec2 coord = vUv - dt * texture2D(uVelocity, vUv).xy * texelSize;
                    gl_FragColor = dissipation * texture2D(uSource, coord);
                #endif
            }
        `;

  // Fragment shader to calculate divergence of the velocity field
  const divergenceShaderSource = `
            precision mediump float;
            precision mediump sampler2D;
            varying highp vec2 vUv;
            varying highp vec2 vL;
            varying highp vec2 vR;
            varying highp vec2 vT;
            varying highp vec2 vB;
            uniform sampler2D uVelocity;

            void main () {
                // Sample velocities from neighbors
                float L = texture2D(uVelocity, vL).x;
                float R = texture2D(uVelocity, vR).x;
                float T = texture2D(uVelocity, vT).y;
                float B = texture2D(uVelocity, vB).y;

                // Handle boundary conditions (assume no flow across boundaries)
                vec2 C = texture2D(uVelocity, vUv).xy;
                if (vL.x < 0.0) { L = -C.x; }
                if (vR.x > 1.0) { R = -C.x; }
                if (vT.y > 1.0) { T = -C.y; }
                if (vB.y < 0.0) { B = -C.y; }

                // Calculate divergence (partial_x(vx) + partial_y(vy))
                float div = 0.5 * (R - L + T - B);
                gl_FragColor = vec4(div, 0.0, 0.0, 1.0); // Store divergence in red channel
            }
        `;

  // Fragment shader to calculate curl (vorticity) of the velocity field
  const curlShaderSource = `
            precision mediump float;
            precision mediump sampler2D;
            varying highp vec2 vUv;
            varying highp vec2 vL;
            varying highp vec2 vR;
            varying highp vec2 vT;
            varying highp vec2 vB;
            uniform sampler2D uVelocity;

            void main () {
                // Sample velocities from neighbors
                float L = texture2D(uVelocity, vL).y; // vx_y_left
                float R = texture2D(uVelocity, vR).y; // vx_y_right
                float T = texture2D(uVelocity, vT).x; // vy_x_top
                float B = texture2D(uVelocity, vB).x; // vy_x_bottom
                // Calculate vorticity (partial_x(vy) - partial_y(vx))
                float vorticity = R - L - T + B;
                gl_FragColor = vec4(0.5 * vorticity, 0.0, 0.0, 1.0); // Store vorticity in red channel
            }
        `;

  // Fragment shader for applying vorticity confinement
  const vorticityShaderSource = `
            precision highp float;
            precision highp sampler2D;
            varying vec2 vUv;
            varying vec2 vL;
            varying vec2 vR;
            varying vec2 vT;
            varying vec2 vB;
            uniform sampler2D uVelocity; // Current velocity field
            uniform sampler2D uCurl;     // Pre-calculated curl field
            uniform float curl;          // Strength of confinement
            uniform float dt;            // Delta time

            void main () {
                float L = texture2D(uCurl, vL).x;
                float R = texture2D(uCurl, vR).x;
                float T = texture2D(uCurl, vT).x;
                float B = texture2D(uCurl, vB).x;
                float C = texture2D(uCurl, vUv).x; // Curl at current fragment

                // Calculate force based on gradients of vorticity magnitude
                // This force pushes particles towards the center of vortices
                vec2 force = 0.5 * vec2(abs(T) - abs(B), abs(R) - abs(L));
                force /= length(force) + 0.0001; // Normalize force
                force *= curl * C;               // Scale by curl strength and current curl
                force.y *= -1.0;                 // Adjust direction

                vec2 velocity = texture2D(uVelocity, vUv).xy;
                velocity += force * dt; // Apply force to velocity
                // Clamp velocity to prevent extreme values
                velocity = min(max(velocity, -1000.0), 1000.0);
                gl_FragColor = vec4(velocity, 0.0, 1.0);
            }
        `;

  // Fragment shader for solving pressure (Jacobi iteration)
  const pressureShaderSource = `
            precision mediump float;
            precision mediump sampler2D;
            varying highp vec2 vUv;
            varying highp vec2 vL;
            varying highp vec2 vR;
            varying highp vec2 vT;
            varying highp vec2 vB;
            uniform sampler2D uPressure;    // Previous pressure field
            uniform sampler2D uDivergence;  // Divergence field

            void main () {
                // Sample pressure from neighbors
                float L = texture2D(uPressure, vL).x;
                float R = texture2D(uPressure, vR).x;
                float T = texture2D(uPressure, vT).x;
                float B = texture2D(uPressure, vB).x;
                // Get divergence at current fragment
                float divergence = texture2D(uDivergence, vUv).x;

                // Jacobi iteration for pressure (average of neighbors minus divergence)
                float pressure = (L + R + B + T - divergence) * 0.25;
                gl_FragColor = vec4(pressure, 0.0, 0.0, 1.0); // Store new pressure in red channel
            }
        `;

  // Fragment shader to subtract the pressure gradient from the velocity field
  const gradientSubtractShaderSource = `
            precision mediump float;
            precision mediump sampler2D;
            varying highp vec2 vUv;
            varying highp vec2 vL;
            varying highp vec2 vR;
            varying highp vec2 vT;
            varying highp vec2 vB;
            uniform sampler2D uPressure; // Solved pressure field
            uniform sampler2D uVelocity; // Current velocity field

            void main () {
                // Calculate pressure gradient from neighbors
                float L = texture2D(uPressure, vL).x;
                float R = texture2D(uPressure, vR).x;
                float T = texture2D(uPressure, vT).x;
                float B = texture2D(uPressure, vB).x;

                vec2 velocity = texture2D(uVelocity, vUv).xy;
                // Subtract pressure gradient (negative gradient points towards lower pressure)
                velocity.xy -= vec2(R - L, T - B);
                gl_FragColor = vec4(velocity, 0.0, 1.0);
            }
        `;

  // Fragment shader for final display, with optional shading
  const displayShaderSource = `
            precision highp float;
            precision highp sampler2D;
            varying vec2 vUv;
            varying vec2 vL;
            varying vec2 vR;
            varying vec2 vT;
            varying vec2 vB;
            uniform sampler2D uTexture;     // The dye (color) texture
            uniform vec2 texelSize;         // Texel size of the dye texture (for shading)

            // Linear to Gamma conversion (for better visual appearance on sRGB displays)
            vec3 linearToGamma (vec3 color) {
                color = max(color, vec3(0));
                return max(1.055 * pow(color, vec3(0.416666667)) - 0.055, vec3(0));
            }

            void main () {
                vec3 c = texture2D(uTexture, vUv).rgb; // Get color from dye texture

                #ifdef SHADING // Apply simple Phong shading if SHADING is defined
                    // Calculate approximate normal from intensity gradients
                    vec3 lc = texture2D(uTexture, vL).rgb;
                    vec3 rc = texture2D(uTexture, vR).rgb;
                    vec3 tc = texture2D(uTexture, vT).rgb;
                    vec3 bc = texture2D(uTexture, vB).rgb;

                    float dx = length(rc) - length(lc);
                    float dy = length(tc) - length(bc);

                    vec3 n = normalize(vec3(dx, dy, length(texelSize))); // Surface normal
                    vec3 l = vec3(0.0, 0.0, 1.0); // Simple light direction (from viewer)

                    float diffuse = clamp(dot(n, l) + 0.7, 0.7, 1.0); // Diffuse lighting
                    c *= diffuse; // Apply lighting
                #endif

                // Convert to gamma space if rendering to a normal display (optional but recommended)
                // c = linearToGamma(c); // Disabled for simplicity/performance in this example, but can be enabled.

                // Calculate alpha based on maximum color component (for transparency)
                float a = max(c.r, max(c.g, c.b));
                gl_FragColor = vec4(c, a); // Output final color with alpha
            }
        `;

  // --- Simulation Core Functions ---

  /**
   * Initializes the WebGL environment, shaders, programs, and framebuffers.
   */
  function init() {
    canvas = document.getElementById("fluidCanvas");
    const webglContext = getWebGLContext(canvas);
    if (!webglContext) return; // Exit if WebGL not supported

    gl = webglContext.gl;
    ext = webglContext.ext;

    // --- Setup for Blitting (Full-screen quad rendering) ---
    // Create and bind the vertex buffer for the full-screen quad.
    // This needs to happen after 'gl' is initialized.
    const quadVertices = new Float32Array([-1, -1, -1, 1, 1, 1, 1, -1]); // Positions for a quad
    const quadIndices = new Uint16Array([0, 1, 2, 0, 2, 3]); // Indices for two triangles

    const vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, quadVertices, gl.STATIC_DRAW);

    const indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, quadIndices, gl.STATIC_DRAW);

    // Configure vertex attributes for position (assuming layout location 0 in shader)
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(0);

    // Define the blit function here, now that 'gl' is available and buffers are set up.
    // This function renders the bound texture onto the specified target FBO or the canvas.
    blit = (targetFBO) => {
      if (targetFBO == null) {
        // Render to the default framebuffer (canvas)
        gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      } else {
        // Render to the specified Framebuffer Object (FBO)
        gl.viewport(0, 0, targetFBO.width, targetFBO.height);
        gl.bindFramebuffer(gl.FRAMEBUFFER, targetFBO.fbo);
      }
      gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0); // Draw the two triangles
    };
    // --- End Setup for Blitting ---

    // Compile all shaders
    baseVertexShader = compileShader(gl.VERTEX_SHADER, baseVertexShaderSource);

    copyProgram = new ShaderProgram(
      baseVertexShader,
      compileShader(gl.FRAGMENT_SHADER, copyShaderSource)
    );
    clearProgram = new ShaderProgram(
      baseVertexShader,
      compileShader(gl.FRAGMENT_SHADER, clearShaderSource)
    );
    splatProgram = new ShaderProgram(
      baseVertexShader,
      compileShader(gl.FRAGMENT_SHADER, splatShaderSource)
    );
    advectionProgram = new ShaderProgram(
      baseVertexShader,
      compileShader(
        gl.FRAGMENT_SHADER,
        advectionShaderSource,
        ext.supportLinearFiltering ? [] : ["MANUAL_FILTERING"]
      )
    );
    divergenceProgram = new ShaderProgram(
      baseVertexShader,
      compileShader(gl.FRAGMENT_SHADER, divergenceShaderSource)
    );
    curlProgram = new ShaderProgram(
      baseVertexShader,
      compileShader(gl.FRAGMENT_SHADER, curlShaderSource)
    );
    vorticityProgram = new ShaderProgram(
      baseVertexShader,
      compileShader(gl.FRAGMENT_SHADER, vorticityShaderSource)
    );
    pressureProgram = new ShaderProgram(
      baseVertexShader,
      compileShader(gl.FRAGMENT_SHADER, pressureShaderSource)
    );
    gradientSubtractProgram = new ShaderProgram(
      baseVertexShader,
      compileShader(gl.FRAGMENT_SHADER, gradientSubtractShaderSource)
    );
    displayProgram = new ShaderProgram(
      baseVertexShader,
      compileShader(
        gl.FRAGMENT_SHADER,
        displayShaderSource,
        config.SHADING ? ["SHADING"] : []
      )
    );

    // Initialize all Framebuffer Objects (FBOs)
    initFramebuffers();

    // Initialize pointer for user interaction
    pointers.push({
      id: -1, // Use -1 for mouse, touch identifiers for touches
      down: false,
      moved: false,
      texcoordX: 0,
      texcoordY: 0,
      prevTexcoordX: 0,
      prevTexcoordY: 0,
      deltaX: 0,
      deltaY: 0,
      color: generateColor(), // Initial random color for the pointer
    });

    // Start the main animation loop
    update();
  }

  /**
   * Initializes or resizes all simulation Framebuffer Objects.
   */
  function initFramebuffers() {
    const simRes = getResolution(config.SIM_RESOLUTION);
    const dyeRes = getResolution(config.DYE_RESOLUTION);

    const texType = ext.halfFloatTexType; // Use half-float if supported
    const rgba = ext.formatRGBA;
    const rg = ext.formatRG;
    const r = ext.formatR;
    // Use linear filtering if supported, otherwise nearest neighbor
    const filtering = ext.supportLinearFiltering ? gl.LINEAR : gl.NEAREST;

    // Velocity FBOs
    if (!velocity) {
      velocity = new DoubleFBO(
        simRes.width,
        simRes.height,
        rg.internalFormat,
        rg.format,
        texType,
        filtering
      );
    } else {
      velocity.resize(
        simRes.width,
        simRes.height,
        rg.internalFormat,
        rg.format,
        texType,
        filtering
      );
    }

    // Dye (color) FBOs
    if (!dye) {
      dye = new DoubleFBO(
        dyeRes.width,
        dyeRes.height,
        rgba.internalFormat,
        rgba.format,
        texType,
        filtering
      );
    } else {
      dye.resize(
        dyeRes.width,
        dyeRes.height,
        rgba.internalFormat,
        rgba.format,
        texType,
        filtering
      );
    }

    // Single FBOs for intermediate calculations
    divergence = new FBO(
      simRes.width,
      simRes.height,
      r.internalFormat,
      r.format,
      texType,
      gl.NEAREST
    );
    curl = new FBO(
      simRes.width,
      simRes.height,
      r.internalFormat,
      r.format,
      texType,
      gl.NEAREST
    );
    pressure = new DoubleFBO(
      simRes.width,
      simRes.height,
      r.internalFormat,
      r.format,
      texType,
      gl.NEAREST
    );
  }

  /**
   * The main animation loop.
   */
  function update() {
    const now = Date.now();
    // Calculate delta time in seconds
    const dt = Math.min((now - lastUpdateTime) / 1000, 0.016666); // Clamp dt to avoid large jumps
    lastUpdateTime = now;

    // Update pointer colors periodically
    colorUpdateTimer += dt;
    if (colorUpdateTimer >= 1.0 / config.COLOR_UPDATE_SPEED) {
      // Generate a new random color for the primary pointer
      pointers[0].color = generateColor();
      colorUpdateTimer = 0;
    }

    // Apply user input (splats) to the simulation
    applyInputs();

    // Perform fluid simulation steps
    step(dt);

    // Render the final fluid state to the canvas
    render();

    // Request the next animation frame
    requestAnimationFrame(update);
  }

  /**
   * Applies forces and colors from active pointers (mouse/touch) to the simulation.
   */
  function applyInputs() {
    pointers.forEach((p) => {
      if (p.moved) {
        // If the pointer has moved, apply a splat
        splatPointer(p);
        p.moved = false; // Reset moved flag
      }
    });
  }

  /**
   * Executes one step of the fluid simulation.
   * @param {number} dt - Delta time (time elapsed since last frame) in seconds.
   */
  function step(dt) {
    // Disable blending for most simulation steps
    gl.disable(gl.BLEND);

    // 1. Vorticity Confinement
    // Calculate curl (vorticity) of the velocity field
    curlProgram.bind();
    gl.uniform2f(
      curlProgram.uniforms.texelSize,
      velocity.texelSizeX,
      velocity.texelSizeY
    );
    gl.uniform1i(curlProgram.uniforms.uVelocity, velocity.read.attach(0));
    blit(curl); // Output to curl FBO

    // Apply vorticity confinement to add swirls and maintain turbulence
    vorticityProgram.bind();
    gl.uniform2f(
      vorticityProgram.uniforms.texelSize,
      velocity.texelSizeX,
      velocity.texelSizeY
    );
    gl.uniform1i(vorticityProgram.uniforms.uVelocity, velocity.read.attach(0));
    gl.uniform1i(vorticityProgram.uniforms.uCurl, curl.attach(1));
    gl.uniform1f(vorticityProgram.uniforms.curl, config.CURL);
    gl.uniform1f(vorticityProgram.uniforms.dt, dt);
    blit(velocity.write); // Output to velocity.write
    velocity.swap(); // Swap velocity FBOs (read becomes write, write becomes read)

    // 2. Divergence
    // Calculate divergence of the velocity field
    divergenceProgram.bind();
    gl.uniform2f(
      divergenceProgram.uniforms.texelSize,
      velocity.texelSizeX,
      velocity.texelSizeY
    );
    gl.uniform1i(divergenceProgram.uniforms.uVelocity, velocity.read.attach(0));
    blit(divergence); // Output to divergence FBO

    // 3. Pressure Solve (Jacobi Iteration)
    // Initialize pressure with a cleared state before iteration
    clearProgram.bind();
    gl.uniform1i(clearProgram.uniforms.uTexture, pressure.read.attach(0)); // Attach previous pressure (initially empty)
    gl.uniform1f(clearProgram.uniforms.value, config.PRESSURE); // Apply a base pressure value
    blit(pressure.write); // Clear or initialize pressure.write
    pressure.swap(); // Swap pressure FBOs

    pressureProgram.bind();
    gl.uniform2f(
      pressureProgram.uniforms.texelSize,
      velocity.texelSizeX,
      velocity.texelSizeY
    );
    gl.uniform1i(pressureProgram.uniforms.uDivergence, divergence.attach(0)); // Divergence is constant during iterations

    // Perform multiple Jacobi iterations to solve for pressure
    for (let i = 0; i < config.PRESSURE_ITERATIONS; i++) {
      gl.uniform1i(pressureProgram.uniforms.uPressure, pressure.read.attach(1)); // Read from current pressure
      blit(pressure.write); // Write to next pressure FBO
      pressure.swap(); // Swap pressure FBOs
    }

    // 4. Gradient Subtract
    // Subtract the pressure gradient from the velocity field to make it divergence-free
    gradientSubtractProgram.bind();
    gl.uniform2f(
      gradientSubtractProgram.uniforms.texelSize,
      velocity.texelSizeX,
      velocity.texelSizeY
    );
    gl.uniform1i(
      gradientSubtractProgram.uniforms.uPressure,
      pressure.read.attach(0)
    ); // Read final pressure
    gl.uniform1i(
      gradientSubtractProgram.uniforms.uVelocity,
      velocity.read.attach(1)
    ); // Read current velocity
    blit(velocity.write); // Output corrected velocity
    velocity.swap(); // Swap velocity FBOs

    // 5. Advection (Velocity)
    // Advect the velocity field by itself (self-advection)
    advectionProgram.bind();
    gl.uniform2f(
      advectionProgram.uniforms.texelSize,
      velocity.texelSizeX,
      velocity.texelSizeY
    );
    // If manual filtering is used, dyeTexelSize uniform needs to be set.
    if (!ext.supportLinearFiltering) {
      gl.uniform2f(
        advectionProgram.uniforms.dyeTexelSize,
        velocity.texelSizeX,
        velocity.texelSizeY
      );
    }
    gl.uniform1i(advectionProgram.uniforms.uVelocity, velocity.read.attach(0)); // Use current velocity as source
    gl.uniform1i(advectionProgram.uniforms.uSource, velocity.read.attach(0)); // Advect velocity itself
    gl.uniform1f(advectionProgram.uniforms.dt, dt);
    gl.uniform1f(
      advectionProgram.uniforms.dissipation,
      config.VELOCITY_DISSIPATION
    ); // Apply velocity dissipation
    blit(velocity.write);
    velocity.swap();

    // 6. Advection (Dye/Color)
    // Advect the dye (color) field using the corrected velocity field
    advectionProgram.bind();
    gl.uniform2f(
      advectionProgram.uniforms.texelSize,
      velocity.texelSizeX,
      velocity.texelSizeY
    );
    // If manual filtering is used, dyeTexelSize uniform needs to be set.
    if (!ext.supportLinearFiltering) {
      gl.uniform2f(
        advectionProgram.uniforms.dyeTexelSize,
        dye.texelSizeX,
        dye.texelSizeY
      );
    }
    gl.uniform1i(advectionProgram.uniforms.uVelocity, velocity.read.attach(0)); // Use current velocity
    gl.uniform1i(advectionProgram.uniforms.uSource, dye.read.attach(1)); // Advect dye
    gl.uniform1f(advectionProgram.uniforms.dt, dt);
    gl.uniform1f(
      advectionProgram.uniforms.dissipation,
      config.DENSITY_DISSIPATION
    ); // Apply dye dissipation
    blit(dye.write);
    dye.swap();
  }

  /**
   * Renders the final dye texture to the screen.
   * @param {FBO|null} [target=null] - The target FBO to render to, or null for the canvas.
   */
  function render(target = null) {
    // Enable blending for final display if transparency is desired
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    gl.enable(gl.BLEND);

    displayProgram.bind();
    // Set texelSize uniform for shading if enabled
    if (config.SHADING) {
      const width = target == null ? gl.drawingBufferWidth : target.width;
      const height = target == null ? gl.drawingBufferHeight : target.height;
      gl.uniform2f(
        displayProgram.uniforms.texelSize,
        1.0 / width,
        1.0 / height
      );
    }
    gl.uniform1i(displayProgram.uniforms.uTexture, dye.read.attach(0)); // Attach final dye texture
    blit(target); // Draw to screen or target FBO
  }

  /**
   * Applies a splat (force and color) based on a pointer's movement.
   * @param {object} pointer - The pointer object containing position and delta.
   */
  function splatPointer(pointer) {
    const dx = pointer.deltaX * config.SPLAT_FORCE;
    const dy = pointer.deltaY * config.SPLAT_FORCE;
    splat(pointer.texcoordX, pointer.texcoordY, dx, dy, pointer.color);
  }

  /**
   * Creates a single splat of velocity and color at a given position.
   * @param {number} x - Normalized X coordinate (0-1).
   * @param {number} y - Normalized Y coordinate (0-1).
   * @param {number} dx - X component of velocity force.
   * @param {number} dy - Y component of velocity force.
   * @param {object} color - RGB color object {r, g, b}.
   */
  function splat(x, y, dx, dy, color) {
    splatProgram.bind();

    // Splat velocity
    gl.uniform1i(splatProgram.uniforms.uTarget, velocity.read.attach(0));
    gl.uniform1f(
      splatProgram.uniforms.aspectRatio,
      canvas.width / canvas.height
    );
    gl.uniform2f(splatProgram.uniforms.point, x, y);
    gl.uniform3f(splatProgram.uniforms.color, dx, dy, 0.0); // For velocity, 'color' holds dx, dy, 0
    gl.uniform1f(
      splatProgram.uniforms.radius,
      correctRadius(config.SPLAT_RADIUS / 100.0)
    );
    blit(velocity.write);
    velocity.swap();

    // Splat dye (color)
    gl.uniform1i(splatProgram.uniforms.uTarget, dye.read.attach(0));
    gl.uniform3f(splatProgram.uniforms.color, color.r, color.g, color.b); // For dye, 'color' holds RGB
    blit(dye.write);
    dye.swap();
  }

  // --- Helper Utility Functions ---

  /**
   * Corrects the splat radius based on aspect ratio.
   * @param {number} radius - The base splat radius.
   * @returns {number} - The corrected radius.
   */
  function correctRadius(radius) {
    let aspectRatio = canvas.width / canvas.height;
    if (aspectRatio > 1) radius *= aspectRatio; // Adjust for wider screens
    return radius;
  }

  /**
   * Updates a pointer's data when a mouse/touch event starts.
   * @param {object} pointer - The pointer object to update.
   * @param {number} id - The ID of the pointer (for multi-touch).
   * @param {number} posX - X coordinate of the event.
   * @param {number} posY - Y coordinate of the event.
   */
  function updatePointerDownData(pointer, id, posX, posY) {
    pointer.id = id;
    pointer.down = true;
    pointer.moved = false; // Reset moved state on click/touch
    pointer.texcoordX = posX / canvas.width;
    pointer.texcoordY = 1.0 - posY / canvas.height; // WebGL Y is inverted
    pointer.prevTexcoordX = pointer.texcoordX;
    pointer.prevTexcoordY = pointer.texcoordY;
    pointer.deltaX = 0;
    pointer.deltaY = 0;
    pointer.color = generateColor(); // Assign a new color on down event
  }

  /**
   * Updates a pointer's data when it moves.
   * @param {object} pointer - The pointer object to update.
   * @param {number} posX - Current X coordinate.
   * @param {number} posY - Current Y coordinate.
   * @param {object} color - The color associated with this pointer.
   */
  function updatePointerMoveData(pointer, posX, posY, color) {
    pointer.prevTexcoordX = pointer.texcoordX;
    pointer.prevTexcoordY = pointer.texcoordY;
    pointer.texcoordX = posX / canvas.width;
    pointer.texcoordY = 1.0 - posY / canvas.height;

    // Calculate delta movement
    pointer.deltaX = correctDeltaX(pointer.texcoordX - pointer.prevTexcoordX);
    pointer.deltaY = correctDeltaY(pointer.texcoordY - pointer.prevTexcoordY);

    // Set moved flag if there's significant movement
    pointer.moved =
      Math.abs(pointer.deltaX) > 0 || Math.abs(pointer.deltaY) > 0;
    pointer.color = color; // Maintain the color for the duration of the drag
  }

  /**
   * Updates a pointer's data when the interaction ends.
   * @param {object} pointer - The pointer object to update.
   */
  function updatePointerUpData(pointer) {
    pointer.down = false;
  }

  /**
   * Corrects the X delta based on canvas aspect ratio.
   * @param {number} delta - The raw X delta.
   * @returns {number} - The corrected X delta.
   */
  function correctDeltaX(delta) {
    let aspectRatio = canvas.width / canvas.height;
    if (aspectRatio < 1) delta *= aspectRatio; // Adjust for taller screens
    return delta;
  }

  /**
   * Corrects the Y delta based on canvas aspect ratio.
   * @param {number} delta - The raw Y delta.
   * @returns {number} - The corrected Y delta.
   */
  function correctDeltaY(delta) {
    let aspectRatio = canvas.width / canvas.height;
    if (aspectRatio > 1) delta /= aspectRatio; // Adjust for wider screens
    return delta;
  }

  /**
   * Generates a random RGB color from HSV values.
   * @returns {{r: number, g: number, b: number}} - Random RGB color object.
   */
  function generateColor() {
    // Generate a random hue, full saturation, full value
    let c = HSVtoRGB(Math.random(), 1.0, 1.0);
    // Slightly reduce intensity for better blending
    c.r *= 0.15;
    c.g *= 0.15;
    c.b *= 0.15;
    return c;
  }

  /**
   * Converts HSV (Hue, Saturation, Value) to RGB color.
   * @param {number} h - Hue (0-1).
   * @param {number} s - Saturation (0-1).
   * @param {number} v - Value (0-1).
   * @returns {{r: number, g: number, b: number}} - RGB color object with values 0-1.
   */
  function HSVtoRGB(h, s, v) {
    let r, g, b, i, f, p, q, t;
    i = Math.floor(h * 6);
    f = h * 6 - i;
    p = v * (1 - s);
    q = v * (1 - f * s);
    t = v * (1 - (1 - f) * s);
    switch (i % 6) {
      case 0:
        r = v;
        g = t;
        b = p;
        break;
      case 1:
        r = q;
        g = v;
        b = p;
        break;
      case 2:
        r = p;
        g = v;
        b = t;
        break;
      case 3:
        r = p;
        g = q;
        b = v;
        break;
      case 4:
        r = t;
        g = p;
        b = v;
        break;
      case 5:
        r = v;
        g = p;
        b = q;
        break;
      default:
        break;
    }
    return { r, g, b };
  }

  /**
   * Wraps a value around a given range.
   * @param {number} value - The value to wrap.
   * @param {number} min - The minimum of the range.
   * @param {number} max - The maximum of the range.
   * @returns {number} - The wrapped value.
   */
  function wrap(value, min, max) {
    const range = max - min;
    if (range === 0) return min;
    return ((value - min) % range) + min;
  }

  /**
   * Calculates the resolution for simulation grids based on canvas size and desired resolution.
   * Ensures a consistent aspect ratio.
   * @param {number} resolution - The target resolution for the shorter side.
   * @returns {{width: number, height: number}} - Calculated width and height.
   */
  function getResolution(resolution) {
    let aspectRatio = gl.drawingBufferWidth / gl.drawingBufferHeight;
    let width, height;
    if (gl.drawingBufferWidth > gl.drawingBufferHeight) {
      width = Math.round(resolution * aspectRatio);
      height = resolution;
    } else {
      width = resolution;
      height = Math.round(resolution / aspectRatio);
    }
    return { width: width, height: height };
  }

  /**
   * Scales an input value by the device's pixel ratio for consistent rendering across devices.
   * @param {number} input - The value to scale.
   * @returns {number} - The scaled value.
   */
  function scaleByPixelRatio(input) {
    const pixelRatio = window.devicePixelRatio || 1;
    return Math.floor(input * pixelRatio);
  }

  /**
   * Simple hash code function for strings (not used in this final version, but kept for reference).
   * @param {string} s - The string to hash.
   * @returns {number} - The hash code.
   */
  function hashCode(s) {
    if (s.length === 0) return 0;
    let hash = 0;
    for (let i = 0; i < s.length; i++) {
      hash = (hash << 5) - hash + s.charCodeAt(i);
      hash |= 0; // Convert to 32bit integer
    }
    return hash;
  }

  // --- Event Listeners ---

  /**
   * Handles mouse down events to start a splat.
   */
  window.addEventListener("mousedown", (e) => {
    const pointer = pointers[0]; // Use the first pointer for mouse
    const posX = scaleByPixelRatio(e.clientX);
    const posY = scaleByPixelRatio(e.clientY);
    updatePointerDownData(pointer, -1, posX, posY);
    splat(
      pointer.texcoordX,
      pointer.texcoordY,
      0, // No initial velocity on click, only on drag
      0,
      pointer.color
    ); // Apply an initial color splat
  });

  /**
   * Handles mouse move events to create continuous splats when mouse is down.
   */
  window.addEventListener("mousemove", (e) => {
    const pointer = pointers[0];
    // if (!pointer.down) return; // Only apply splat if mouse is down

    const posX = scaleByPixelRatio(e.clientX);
    const posY = scaleByPixelRatio(e.clientY);
    updatePointerMoveData(pointer, posX, posY, pointer.color); // Pass existing color
  });

  /**
   * Handles mouse up events to mark the pointer as no longer active.
   */
  window.addEventListener("mouseup", (e) => {
    const pointer = pointers[0];
    updatePointerUpData(pointer);
  });

  /**
   * Handles touch start events to register new touch pointers.
   */
  window.addEventListener(
    "touchstart",
    (e) => {
      e.preventDefault(); // Prevent default browser touch behavior (e.g., scrolling, zoom)
      const touches = e.targetTouches;
      for (let i = 0; i < touches.length; i++) {
        // Find or create a pointer object for each touch
        let pointer = pointers.find((p) => p.id === touches[i].identifier);
        if (!pointer) {
          pointer = {
            id: touches[i].identifier,
            down: false,
            moved: false,
            texcoordX: 0,
            texcoordY: 0,
            prevTexcoordX: 0,
            prevTexcoordY: 0,
            deltaX: 0,
            deltaY: 0,
            color: generateColor(),
          };
          pointers.push(pointer);
        }

        const posX = scaleByPixelRatio(touches[i].clientX);
        const posY = scaleByPixelRatio(touches[i].clientY);
        updatePointerDownData(pointer, touches[i].identifier, posX, posY);
        splat(
          pointer.texcoordX,
          pointer.texcoordY,
          0, // No initial velocity on touch, only on drag
          0,
          pointer.color
        ); // Apply an initial color splat
      }
    },
    { passive: false }
  ); // Use { passive: false } to allow preventDefault

  /**
   * Handles touch move events to create continuous splats based on touch movement.
   */
  window.addEventListener(
    "touchmove",
    (e) => {
      e.preventDefault(); // Prevent default browser touch behavior
      const touches = e.targetTouches;
      for (let i = 0; i < touches.length; i++) {
        const pointer = pointers.find((p) => p.id === touches[i].identifier);
        if (pointer && pointer.down) {
          // Only process if touch is down and pointer exists
          const posX = scaleByPixelRatio(touches[i].clientX);
          const posY = scaleByPixelRatio(touches[i].clientY);
          updatePointerMoveData(pointer, posX, posY, pointer.color);
        }
      }
    },
    { passive: false }
  );

  /**
   * Handles touch end/cancel events to mark pointers as no longer active.
   */
  window.addEventListener("touchend", (e) => {
    const touches = e.changedTouches;
    for (let i = 0; i < touches.length; i++) {
      const pointer = pointers.find((p) => p.id === touches[i].identifier);
      if (pointer) {
        updatePointerUpData(pointer);
        // Optionally remove the pointer from the array if no longer active
        // For simplicity, we keep them, but in a more complex app you might manage a pool.
      }
    }
  });

  /**
   * Handles window resize events to adjust canvas size and simulation resolutions.
   */
  window.addEventListener("resize", () => {
    // Adjust canvas dimensions to fill the window
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    // Set the WebGL viewport to match the new canvas size
    gl.viewport(0, 0, canvas.width, canvas.height);

    // Re-initialize framebuffers with new resolutions to ensure fluid adapts
    initFramebuffers();
  });

  // --- Initial Setup on DOM Load ---
  // Ensure the DOM is fully loaded before attempting to access the canvas.

  init(); // Initialize the simulation
  // Trigger a resize event immediately to set the initial canvas size and FBOs correctly
  window.dispatchEvent(new Event("resize"));
});
