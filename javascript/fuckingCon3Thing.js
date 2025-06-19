document.addEventListener("DOMContentLoaded", (event) => {
  // --- Phaser Clock Logic ---

  // Phaser configuration
  const phaserConfig = {
    type: Phaser.AUTO,
    width: 605, // Match the analog-clock div's size
    height: 605, // Match the analog-clock div's size
    parent: "clock-phaser-container", // This is the ID of the div inside .analog-clock
    scene: {
      preload: preload,
      create: create,
      update: update,
    },
    transparent: true, // Make the Phaser canvas background transparent
  };

  // Initialize Phaser game
  const game = new Phaser.Game(phaserConfig);

  // Declare global variables for Phaser elements
  let hourHand;
  let minuteHand;
  let secondHand;
  let centerCircle;
  let weekdayText;
  let flexImage;

  /**
   * Preload function: Used to load all assets before the Phaser game starts.
   */
  function preload() {
    this.load.svg("flex-logo", "../resourses/flex.svg"); // Ensure img/flex.svg exists
  }

  /**
   * Create function: Called once when the Phaser scene is created.
   * Set up all Phaser game objects (clock face, hands, text, logo).
   */
  function create() {
    const centerX = phaserConfig.width / 2;
    const centerY = phaserConfig.height / 2;
    const radius = 300;

    // Draw the clock face (background circle for the Phaser canvas)
    const face = this.add.graphics();
    face.fillStyle(0x2d3035); // Darker grey for the clock face background
    face.fillCircle(centerX, centerY, radius);

    // Draw clock outline
    face.lineStyle(4, 0x5a5d63); // Lighter grey for outline on dark mode
    face.strokeCircle(centerX, centerY, radius);

    // Style for hour numbers (Roman numerals)
    const textStyle = {
      fontFamily: `'Times New Roman', Times, serif`,
      fontSize: "40px",
      color: `rgb(255, 204, 0)`, // Bright golden for numbers
    };

    // Add the FlexDesign logo text (drawn by Phaser)
    const logoStyle = {
      fontFamily: `'Times New Roman', Times, serif`,
      fontSize: "20px",
      color: `rgb(255, 204, 0)`, // Bright golden for logo
    };
    const logo = this.add.text(centerX, centerY - 100, "FlexDesign", logoStyle);
    logo.setOrigin(0.5, 0.5);

    // Add the flex.svg image as a sprite (drawn by Phaser)
    flexImage = this.add
      .image(centerX, centerY * 0.5, "flex-logo")
      .setScale(0.2);
    flexImage.setOrigin(0.5, 0.5);

    // Draw hour markers (Roman numerals)
    let rome = "XII,I,II,III,IV,V,VI,VII,VIII,IX,X,XI,";
    let time = rome.split(",");
    for (let i = 0; i < 12; i++) {
      const angle = Phaser.Math.DegToRad(i * 30 - 90);
      const angleDeg = i * 30;
      const x = centerX + Math.cos(angle) * (radius - 40);
      const y = centerY + Math.sin(angle) * (radius - 40);
      const text = this.add.text(x, y, time[i], textStyle);
      text.angle = angleDeg;
      text.setOrigin(0.5, 0.5);
    }

    // Inner clock scale (small lines)
    const innerRadius1 = radius - 60;
    const innerRadius2 = radius - 70;
    face.lineStyle(2, 0x5a5d63); // Lighter grey for inner lines
    for (let i = 0; i < 12; i++) {
      const angle = Phaser.Math.DegToRad(i * 30 - 90);
      const startX1 = centerX + Math.cos(angle) * innerRadius1;
      const startY1 = centerY + Math.sin(angle) * innerRadius1;
      const endX1 = centerX + Math.cos(angle) * innerRadius2;
      const endY1 = centerY + Math.sin(angle) * innerRadius2;
      face.lineBetween(startX1, startY1, endX1, endY1);
    }
    face.lineStyle(1, 0x5a5d63); // Lighter grey
    face.strokeCircle(centerX, centerY, innerRadius2 - 3);

    // Minute markers (small dots)
    face.fillStyle(0x5a5d63); // Lighter grey for minute dots
    for (let i = 0; i < 60; i++) {
      if (i % 5 !== 0) {
        const angle = Phaser.Math.DegToRad(i * 6 - 90);
        const x = centerX + Math.cos(angle) * (radius - 15);
        const y = centerY + Math.sin(angle) * (radius - 15);
        face.fillCircle(x, y, 3);
      }
    }

    // Month Marker (sub-dial)
    const monthDialX = centerX - 100;
    const monthDialY = centerY + 100;
    const monthDialRadius = radius - 240;
    face.fillStyle(0x888a8f); // Slightly lighter dot for sub-dial center
    face.fillCircle(monthDialX, monthDialY, 4);
    face.lineStyle(1, 0xffcc00); // Bright golden outline for sub-dial
    face.strokeCircle(monthDialX, monthDialY, monthDialRadius);
    face.strokeCircle(monthDialX, monthDialY, monthDialRadius + 4);

    for (let i = 0; i < 12; i++) {
      const angle = Phaser.Math.DegToRad(i * 30 - 90);
      const x = monthDialX + Math.cos(angle) * (monthDialRadius - 10);
      const y = monthDialY + Math.sin(angle) * (monthDialRadius - 10);
      const dotRadius = 2;
      face.fillStyle(0x888a8f); // Lighter dot
      face.fillCircle(x, y, dotRadius);
    }

    // Day Marker (sub-dial)
    const dayDialX = centerX + 100;
    const dayDialY = centerY + 100;
    const dayDialRadius = radius - 225;
    face.fillStyle(0x888a8f); // Slightly lighter dot for sub-dial center
    face.fillCircle(dayDialX, dayDialY, 5);
    face.lineStyle(1, 0xffcc00); // Bright golden outline for sub-dial
    face.strokeCircle(dayDialX, dayDialY, dayDialRadius);
    face.strokeCircle(dayDialX, dayDialY, dayDialRadius + 5);

    for (let i = 0; i < 30; i++) {
      const angle = Phaser.Math.DegToRad(i * 12 - 90);
      const x = dayDialX + Math.cos(angle) * (dayDialRadius - 10);
      const y = dayDialY + Math.sin(angle) * (dayDialRadius - 10);
      const dotRadius = 2;
      face.fillStyle(0x888a8f); // Lighter dot
      face.fillCircle(x, y, dotRadius);
    }

    // Weekday text display (drawn by Phaser)
    const weekdayTextStyle = {
      fontFamily: `'Times New Roman', Times, serif`,
      fontSize: "20px",
      fontWeight: "normal",
      color: `rgb(170, 200, 255)`, // Light blue for weekdays on dark mode
      align: "center",
    };
    weekdayText = this.add.text(
      centerX - 100,
      centerY - 20,
      "",
      weekdayTextStyle
    );
    weekdayText.setOrigin(0.5, 0.5);

    // Create the clock hands (graphics objects)
    hourHand = this.add.graphics();
    minuteHand = this.add.graphics();
    secondHand = this.add.graphics();
    monthHand = this.add.graphics();
    dayHand = this.add.graphics();

    // Center circle (covers the base of the hands)
    centerCircle = this.add.graphics();
    centerCircle.fillStyle(0x2d3035); // Darker grey for center circle
    centerCircle.fillCircle(centerX, centerY, 8);
    centerCircle.lineStyle(3, 0xff6b6b); // Red-orange outline for contrast
    centerCircle.strokeCircle(centerX, centerY, 8);

    // Initial draw of the hands to show current time
    updateHands(this);
  }

  /**
   * Update function: Called every frame.
   * Used for game logic that needs continuous updates (like hand movement).
   */
  function update() {
    updateHands(this);
  }

  /**
   * Helper function to update the positions of all clock hands.
   * @param {Phaser.Scene} scene - The current Phaser scene.
   */
  function updateHands(scene) {
    const now = new Date();
    const hours = now.getHours() % 12; // 12-hour format
    const minutes = now.getMinutes();
    const seconds = now.getSeconds();
    const month = now.getMonth(); // 0-11
    const day = now.getDate(); // 1-31
    const dayOfWeek = now.getDay(); // 0 (Sunday) to 6 (Saturday)

    const centerX = phaserConfig.width / 2;
    const centerY = phaserConfig.height / 2;

    // Hand lengths
    const monthLength = 30; // Shorter for sub-dial
    const dayLength = 30; // Shorter for sub-dial
    const hourLength = 160;
    const minuteLength = 200;
    const secondLength = 280;

    // Calculate angles (Phaser.Math.DegToRad converts degrees to radians)
    // -90 degrees offset to make 12 o'clock (or 0 degrees) point upwards
    const hourAngle = Phaser.Math.DegToRad(hours * 30 + minutes * 0.5 - 90);
    const minuteAngle = Phaser.Math.DegToRad(minutes * 6 - 90);
    const secondAngle = Phaser.Math.DegToRad(seconds * 6 - 90);

    // Month hand: 12 months, 360 degrees / 12 = 30 degrees per month
    const monthAngle = Phaser.Math.DegToRad((month + 1) * 30 - 90); // +1 because month is 0-indexed

    // Day hand: Assuming a 30-day dial for simplicity (360/30 = 12 degrees per day)
    const dayAngle = Phaser.Math.DegToRad(day * 12 - 90);

    // Clear previous hand drawings before redrawing
    hourHand.clear();
    minuteHand.clear();
    secondHand.clear();
    monthHand.clear();
    dayHand.clear();

    // Draw hour hand
    hourHand.lineStyle(6, 0xe0e0e0); // Light grey for hour hand
    hourHand.beginPath();
    hourHand.moveTo(centerX, centerY);
    hourHand.lineTo(
      centerX + Math.cos(hourAngle) * hourLength,
      centerY + Math.sin(hourAngle) * hourLength
    );
    hourHand.strokePath();

    // Draw minute hand
    minuteHand.lineStyle(4, 0xe0e0e0); // Light grey for minute hand
    minuteHand.beginPath();
    minuteHand.moveTo(centerX, centerY);
    minuteHand.lineTo(
      centerX + Math.cos(minuteAngle) * minuteLength,
      centerY + Math.sin(minuteAngle) * minuteLength
    );
    minuteHand.strokePath();

    // Draw second hand
    secondHand.beginPath();
    secondHand.lineStyle(2, 0xff6b6b); // Red-orange for second hand
    secondHand.moveTo(centerX, centerY);
    secondHand.lineTo(
      centerX + Math.cos(secondAngle) * secondLength,
      centerY + Math.sin(secondAngle) * secondLength
    );
    // Add a small "tail" to the second hand
    secondHand.lineTo(
      centerX - Math.cos(secondAngle) * 80,
      centerY - Math.sin(secondAngle) * 80
    );
    secondHand.strokePath();

    // Draw month hand (from its sub-dial center)
    const monthDialX = centerX - 100;
    const monthDialY = centerY + 100;
    monthHand.lineStyle(2, 0xe0e0e0); // Light grey for month hand
    monthHand.beginPath();
    monthHand.moveTo(monthDialX, monthDialY);
    monthHand.lineTo(
      monthDialX + Math.cos(monthAngle) * monthLength,
      monthDialY + Math.sin(monthAngle) * monthLength
    );
    monthHand.strokePath();

    // Draw day hand (from its sub-dial center)
    const dayDialX = centerX + 100;
    const dayDialY = centerY + 100;
    dayHand.lineStyle(2, 0xe0e0e0); // Light grey for day hand
    dayHand.beginPath();
    dayHand.moveTo(dayDialX, dayDialY);
    dayHand.lineTo(
      dayDialX + Math.cos(dayAngle) * dayLength,
      dayDialY + Math.sin(dayAngle) * dayLength
    );
    dayHand.strokePath();

    // Update weekday text (Phaser element)
    const weekdays = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
    const weekdayTextStyle = {
      fontFamily: `'Times New Roman', Times, serif`,
      fontSize: "20px",
      fontWeight: "normal",
      color: `rgb(170, 200, 255)`, // Light blue for weekdays
      align: "center",
    };
    const weekendTextStyle = {
      ...weekdayTextStyle,
      color: `rgb(255, 100, 100)`, // Slightly softer red for weekends in dark mode
    };

    if (dayOfWeek === 0 || dayOfWeek === 6) {
      // Sunday (0) or Saturday (6)
      weekdayText.setStyle(weekendTextStyle);
    } else {
      weekdayText.setStyle(weekdayTextStyle);
    }
    weekdayText.setText(weekdays[dayOfWeek]);
  }

  // --- Digital Display Logic (for HTML elements) ---
  const digitalTimeDisplay = document.querySelector(".digital-time");
  const digitalDateDisplay = document.querySelector(".digital-date");

  function updateDigitalDisplays() {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const dayOfWeek = now.getDay();

    // Digital Time Display (e.g., 09:48)
    const formattedHours = String(hours % 12 || 12).padStart(2, "0");
    const formattedMinutes = String(minutes).padStart(2, "0");
    digitalTimeDisplay.textContent = `${formattedHours}:${formattedMinutes}`;

    // Digital Date Display (e.g., WED)
    const weekdays = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
    digitalDateDisplay.textContent = weekdays[dayOfWeek];
  }

  // Run updateDigitalDisplays every second
  setInterval(updateDigitalDisplays, 1000);

  // Set initial digital display state immediately
  updateDigitalDisplays();
}); // End of DOMContentLoaded listener
