document.addEventListener("DOMContentLoaded", function () {
  // Function to display a custom message box instead of alert()
  function showMessageBox(message, duration = 3000) {
    const messageBox = document.getElementById("messageBox");
    messageBox.textContent = message;
    messageBox.classList.add("show");

    setTimeout(() => {
      messageBox.classList.remove("show");
    }, duration);
  }

  window.onload = function () {
    try {
      // Initialize Splitting.js on the element with data-splitting attribute
      Splitting();

      // Get elements
      const chars = document.querySelectorAll(".char");
      const doorWrapper = document.querySelector(".door-wrapper");
      const doorSlideLeft = document.getElementById("doorSlideLeft");
      const doorSlideRight = document.getElementById("doorSlideRight");
      const loadingTextElement = document.querySelector(".loading-text");
      const contentContainer = document.querySelector(".container");
      const gearCanvas = document.getElementById("gearCanvas");
      const body = document.querySelector("body");
      // Gear drawing and animation logic (adapted from your provided code)
      function drawGears() {
        var canvas = document.getElementById("gearCanvas");
        var container = canvas.parentElement;
        canvas.width = container.offsetWidth;
        canvas.height = container.offsetHeight;

        if (!canvas.getContext) {
          console.error("Canvas not supported.");
          return;
        }
        var ctx = canvas.getContext("2d");

        // Updated gear colors for the new theme
        var gearColor = "#5d81a9"; // Lighter blue for gears
        var bgColor = ctx.createRadialGradient(
          canvas.width / 2,
          canvas.height / 2,
          0,
          canvas.width / 2,
          canvas.height / 2,
          Math.max(canvas.width, canvas.height)
        );
        bgColor.addColorStop(0, "#000d1a");
        bgColor.addColorStop(1, "#00001a");
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        var boltColor = "#4a5568"; // Darker blue for bolts
        var centerColor = "#3a577a"; // Main door panel blue for gear centers
        ctx.strokeStyle = gearColor;

        var arcA = [];

        function ArcCreator(x, y, r, angle, speed) {
          this.x = x;
          this.y = y;
          this.r = r;
          this.angle = angle;
          this.speed = speed;
        }

        function getMainArcs(
          x,
          y,
          radius,
          angle,
          speed,
          teethCount,
          teethSizeDivider,
          bars,
          color1
        ) {
          var newArc = new ArcCreator(x, y, radius, Math.PI * 2, speed);
          newArc.color1 = color1;
          newArc.innerArcs = [];
          for (var i = 0; i < Math.PI * 2; i += Math.PI / (teethCount / 2)) {
            var point = [x + Math.cos(i) * radius, y + Math.sin(i) * radius];
            var innerArc = new ArcCreator(
              point[0],
              point[1],
              radius / teethSizeDivider,
              i
            );
            newArc.innerArcs.push(innerArc);
          }
          newArc.bars = [];
          for (var j = 0; j < Math.PI * 2; j += (Math.PI * 2) / bars) {
            var bar = {
              x: x + Math.cos(j) * (radius * 0.8),
              y: y + Math.sin(j) * (radius * 0.8),
              angle: j,
            };
            newArc.bars.push(bar);
          }
          arcA.push(newArc);
        }

        function animateGears() {
          ctx.fillStyle = bgColor;
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          for (var i = 0; i < arcA.length; i++) {
            ctx.strokeStyle = arcA[i].color1;
            ctx.fillStyle = arcA[i].color1;
            ctx.beginPath();
            ctx.arc(arcA[i].x, arcA[i].y, arcA[i].r, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.fillStyle = bgColor;
            ctx.arc(arcA[i].x, arcA[i].y, arcA[i].r * 0.8, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = arcA[i].color1;
            for (var k = 0; k < arcA[i].bars.length; k++) {
              ctx.beginPath();
              ctx.moveTo(arcA[i].x, arcA[i].y);
              ctx.lineTo(arcA[i].bars[k].x, arcA[i].bars[k].y);
              ctx.lineWidth = arcA[i].r / 8;
              ctx.stroke();
              arcA[i].bars[k].angle += arcA[i].speed;
              arcA[i].bars[k].x =
                arcA[i].x + Math.cos(arcA[i].bars[k].angle) * (arcA[i].r * 0.8);
              arcA[i].bars[k].y =
                arcA[i].y + Math.sin(arcA[i].bars[k].angle) * (arcA[i].r * 0.8);
            }

            for (var j = 0; j < arcA[i].innerArcs.length; j++) {
              ctx.beginPath();
              ctx.arc(
                arcA[i].innerArcs[j].x,
                arcA[i].innerArcs[j].y,
                arcA[i].innerArcs[j].r,
                0,
                Math.PI * 2
              );
              ctx.fill();
              arcA[i].innerArcs[j].angle += arcA[i].speed;
              arcA[i].innerArcs[j].x =
                arcA[i].x + Math.cos(arcA[i].innerArcs[j].angle) * arcA[i].r;
              arcA[i].innerArcs[j].y =
                arcA[i].y + Math.sin(arcA[i].innerArcs[j].angle) * arcA[i].r;
            }
            ctx.beginPath();
            ctx.fillStyle = centerColor;
            ctx.arc(arcA[i].x, arcA[i].y, arcA[i].r * 0.4, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = arcA[i].color1;
            ctx.fillStyle = boltColor;
            ctx.beginPath();
            ctx.arc(arcA[i].x, arcA[i].y, arcA[i].r * 0.1, 0, Math.PI * 2);
            ctx.fill();
          }

          requestAnimationFrame(animateGears);
        }

        // Original gear layout's approximate bounding box and center
        const originalMinX = 61;
        const originalMaxX = 543;
        const originalMinY = 36;
        const originalMaxY = 452;
        const originalWidth = originalMaxX - originalMinX; // Approx 482
        const originalHeight = originalMaxY - originalMinY; // Approx 416
        const originalCenterX = originalMinX + originalWidth / 2; // Approx 302
        const originalCenterY = originalMinY + originalHeight / 2; // Approx 244

        // Determine the canvas's current center
        const canvasCenterX = canvas.width / 2;
        const canvasCenterY = canvas.height / 2;

        // Calculate a global scaling factor to fit the entire gear system
        // Use the minimum of width/height scaling to ensure the whole system fits
        const scaleFactor =
          Math.min(
            canvas.width / originalWidth,
            canvas.height / originalHeight
          ) * 0.8; // Scale down slightly to add some padding

        // Define the gear configurations with their original relative positions and radii
        const gearConfigs = [
          {
            x: 150,
            y: 120,
            r: 100,
            speed: 0.01,
            teeth: 20,
            teethDiv: 10,
            bars: 5,
            color: "#5d81a9",
          }, // Lighter blue
          {
            x: 150,
            y: 120,
            r: 50,
            speed: -0.015,
            teeth: 20,
            teethDiv: 10,
            bars: 5,
            color: "#4a5568",
          }, // Darker blue
          {
            x: 343,
            y: 201,
            r: 100,
            speed: -0.01,
            teeth: 20,
            teethDiv: 10,
            bars: 3,
            color: "#4a5568",
          }, // Darker blue
          {
            x: 225,
            y: 307,
            r: 50,
            speed: 0.02,
            teeth: 10,
            teethDiv: 6,
            bars: 2,
            color: "#5d81a9",
          }, // Lighter blue
          {
            x: 408,
            y: 346,
            r: 50,
            speed: 0.02,
            teeth: 10,
            teethDiv: 6,
            bars: 8,
            color: "#5d81a9",
          }, // Lighter blue
          {
            x: 290,
            y: 452,
            r: 100,
            speed: -0.01,
            teeth: 20,
            teethDiv: 10,
            bars: 4,
            color: "#4a5568",
          }, // Darker blue
          {
            x: 225,
            y: 307,
            r: 25,
            speed: 0.04,
            teeth: 10,
            teethDiv: 6,
            bars: 2,
            color: "#4a5568",
          }, // Darker blue
          {
            x: 61,
            y: 434,
            r: 120,
            speed: 0.01,
            teeth: 20,
            teethDiv: 12,
            bars: 10,
            color: "#5d81a9",
          }, // Lighter blue
          {
            x: 543,
            y: 36,
            r: 150,
            speed: 2 / 3 / 100,
            teeth: 30,
            teethDiv: 16,
            bars: 10,
            color: "#5d81a9",
          }, // Lighter blue
        ];

        // Add gears to the array with dynamically scaled positions and radii
        gearConfigs.forEach((config) => {
          const newX =
            canvasCenterX + (config.x - originalCenterX) * scaleFactor;
          const newY =
            canvasCenterY + (config.y - originalCenterY) * scaleFactor;
          const newRadius = config.r * scaleFactor;
          getMainArcs(
            newX,
            newY,
            newRadius,
            Math.PI * 2,
            config.speed,
            config.teeth,
            config.teethDiv,
            config.bars,
            config.color
          );
        });

        animateGears(); // Start the gear animation loop
      }

      // Define the Anime.js timeline
      const loadingTimeline = anime.timeline({
        easing: "easeInOutQuad",
        loop: false,
        autoplay: true,
      });

      // Phase 1: Main Doors Slide Out and Canvas fades in
      loadingTimeline
        .add(
          {
            targets: doorSlideLeft,
            translateX: "-100%", // Slide left panel out
            duration: 1500,
            easing: "easeInOutCubic",
          },
          0
        )
        .add(
          {
            targets: doorSlideRight,
            translateX: "100%", // Slide right panel out
            duration: 1500,
            easing: "easeInOutCubic",
          },
          0
        )
        .add(
          {
            targets: gearCanvas, // Fade in the canvas
            opacity: [0, 1],
            duration: 1000,
            easing: "easeOutQuad",
            begin: function () {
              drawGears(); // Start drawing gears when canvas becomes visible
            },
          },
          "-=1000"
        ); // Start fading in canvas when doors are about halfway open

      // Phase 2: Loading Text Appears & Animates (starts as doors are mostly open)
      loadingTimeline
        .add(
          {
            targets: loadingTextElement,
            opacity: [0, 1], // Fade in the entire loading text container
            duration: 800,
            easing: "easeOutExpo",
          },
          "-=500"
        ) // Overlap with door animation

        .add(
          {
            targets: chars,
            opacity: [0, 1],
            translateY: [20, 0],
            rotateZ: [10, 0], // Subtle rotation
            delay: anime.stagger(60), // Stagger character animation
            duration: 700,
            easing: "easeOutBack", // Bouncy effect
            loop: true, // Keep looping
            direction: "alternate", // Ping-pong effect
            endDelay: 1000, // A short delay before reversing
          },
          "-=200"
        ); // Start character animation shortly after text container appears

      // Phase 3: Loading text, door wrapper, and canvas fade out, content fades in
      loadingTimeline.add(
        {
          targets: [doorWrapper, loadingTextElement, gearCanvas],
          opacity: 0,
          duration: 1500,
          easing: "easeOutQuad",
          complete: function () {
            doorWrapper.style.display = "none"; // Hide the door wrapper completely
            contentContainer.classList.add("show"); // Make content visible for animation
            body.style.overflowY = "auto";
            // Animate the content in
            anime({
              targets: contentContainer,
              opacity: [0, 1],
              translateY: [20, 0],
              duration: 1000,
              easing: "easeOutExpo",
            });
            showMessageBox("System Boot Complete!", 2500);
          },
        },
        "+=1500"
      ); // Start this animation 1.5 seconds after previous one finishes
    } catch (error) {
      console.error("An error occurred during page loading:", error);
      showMessageBox("Failed to load system. Please refresh.", 5000);
    }
  };
});
