// G L O B A L
let score = 0;
let gravity = 1; // Pixels at which things fall
let gameState = "start";
let floor = 900;


// I M A G E S 

// platforms
let longPlatform;
let shortPlatform;

// charecter
let sealHead;
let arrow;

// bg
let bgSong;
let bgImage;
let scoreFont;

// cutscene
let cut1;
let cut2;
let cut3;
let cut4
let cut5;


// P R E L O A D
function preload() {
  // platforms
  longPlatform = loadImage("images/longPlatform.png");
  shortPlatform = loadImage("images/shortPlatform.png");
  // charecter
  sealHead = loadImage('images/sealHead.png')
  arrow = loadImage("images/arrow.png");
  // bg
  bgImage = loadImage("images/bg.jpg");
  bgSong = loadSound("sounds/bgSong.mp3");
  scoreFont = loadFont("fonts/PixelifySans-Regular.ttf");
  // cutscene
  cut1 = loadImage("cutscene/cut1.jpeg");
  cut2 = loadImage("cutscene/cut2.jpeg");
  cut3 = loadImage("cutscene/cut3.jpeg");
  cut4 = loadImage("cutscene/cut4.jpeg");
  cut5 = loadImage("cutscene/cut5.jpeg");
}


// S E A L
let seal = {
  x: 20,
  y: 550,
  health: 3,
  g: 0, // Gravity - also controls jump - how much force is sending it up or down
  xm: 1, // Xmove - which way the seal moves in its jump
  jumping: false,

  // Move seal based on mouse position
  moveSeal: function() {
    if (mouseX > this.x) {
      // If mouse is to the right of seal
      if (this.xm < 8) {
        this.xm += 0.7;
      }
    }
    if (mouseX < this.x) {
      // If mouse is to the left of seal
      if (this.xm > -8) {
        this.xm -= 0.7;
      }
    }
  },

  // Jump seal up
  jumpUp: function() {
    if (this.jumping === false) {
      if (gameState === 'play' && gameCount > 480) {
        if (keyIsDown(32)){
          this.g = -20;
          this.jumping = true;
        }
      }
    }
  },


  // Show the seal on the canvas
  makeSeal: function() {
    fill(255);
    image(sealHead, this.x, this.y, 20, 20);
  },

  // Apply gravity to seal
  applyGravity: function() {
    this.y = this.y + this.g;
    if (this.y < floor) {
      this.g = this.g + 1;
      this.x = this.x + this.xm;
    }
    if (this.y > floor) {
      this.y = floor;
      this.g = 0;
    }

    // gravity
    if (this.x >= width - 2) {
      this.xm = -this.xm;
    } else if (this.x <= 0) {
      this.xm = -this.xm;
    }

    if (this.y <= 0) {
      this.g = -this.g;
    }
  },
};


// P L A T F O R M S
let currentPlatforms = []; // platforms on canvas

class Platform {
  constructor(x, y, fall) {
    this.x = x;
    this.y = y;
    this.fall = fall;
    this.type = random() > 0.5 ? longPlatform : shortPlatform; // Randomly choose platform type
    this.width = this.type === longPlatform ? 100 : 80; // Width for long:short platform
    this.height = 30;
  }

  // put platforms on canvas
  toCanvas() {
    image(this.type, this.x, this.y, this.width, this.height);
  }

  // apply gravity
  moveDown() {
    this.y += gravity;
  }

  // Ensure seal cannot pass through platform
  checkCollision(seal) {
    // Define platform corners
    let platformTop = this.y;
    let platformBottom = this.y + this.height;
    let platformLeft = this.x;
    let platformRight = this.x + this.width;

    // Define seal corners
    let sealTop = seal.y;
    let sealBottom = seal.y + 10;
    let sealLeft = seal.x;
    let sealRight = seal.x + 10;

    if (
      sealBottom >= platformTop && // Seal above platform
      sealTop <= platformBottom && // Seal below platform
      sealRight >= platformLeft &&
      sealLeft <= platformRight
    ) {
      if (seal.y + 10 <= this.y + this.height / 2) {
        // If the seal is in the upper half of the platform
        seal.y = this.y - 11;
        seal.jumping = false;
        seal.xm = 0;
        seal.g = 0;
      } else {
        // If the seal is in the lower half of the platform
        seal.y = this.y + this.height + 1;
        seal.g = -seal.g; // Reverse the gravity
      }
      seal.xm = -seal.xm; // Reverse the horizontal movement to make it bounce off the sides
    }
  }
}


// new platform on the canvas
function createPlatform() {
  let newX;
  if (score > 7) {
    newX = random(100, 500);
  } else {
    newX = random(20, 500);
  }

  // Check if the new platform is jumpable
  if (currentPlatforms.length > 0) {
    let lastPlatform = currentPlatforms[currentPlatforms.length - 1];
    const minDistance = 200;
    const maxDistance = 400;

    while (Math.abs(newX - lastPlatform.x) < minDistance || Math.abs(newX - lastPlatform.x) > maxDistance) {
      newX = random(20, 500); // Move platform to a new position
      lastPlatform = currentPlatforms[currentPlatforms.length - 1];
    }
  }

  currentPlatforms.push(new Platform(newX, 0, 1));
  score++;
}

// starting platform
let startPlatform;
function removeStartingPlatform() {
  if (score > 7 && currentPlatforms.includes(startPlatform)) {
    startPlatform.x--;
  }
}

// update all platforms on the canvas
function updatePlatforms() {
  for (let i = currentPlatforms.length - 1; i >= 0; i--) {
    let platform = currentPlatforms[i];

    if (platform.fall === 1) {
      platform.moveDown();
    }

    platform.toCanvas();
    platform.checkCollision(seal);

    // Remove platforms that are out of the canvas
    if (platform.y > height) {
      currentPlatforms.splice(i, 1);
    }
  }
}

// F L O O R

function drawFloor() {
  fill("#95A9C1");
  stroke("#95A9C1");
  rect(0, 760, 550, 40);
  fill("white");
  textSize(30);
  text("SCORE: " + score, 70, 775);
}

// S E T U P



function sealMovement() {
  seal.applyGravity();
  seal.jumpUp();
  seal.moveSeal();

  // Draw the rotating seal
  push();
  translate(seal.x + 5, seal.y);
  rotate(seal.xm * 10 + 45 + 180);
  image(arrow, 0, 0, 10, 10);
  pop();
}


// S T A R T + E N D

function drawStartScreen() {
  textSize(70);
  background(bgImage);
  textAlign(CENTER, CENTER);
  fill("#576B8C");
  text("JUMPY SEAL", width / 2, 350);
  textSize(40);
  fill("#91AAC1");
  text("Press SPACE to Start", width / 2, 460);
}

function drawGameOverScreen() {
  textSize(50);
  background("#95A9C1");
  textAlign(CENTER, CENTER);
  fill("white");
  text("GAME OVER\nSCORE: " + score + "\nPress 'R' to Restart", width / 2, height / 2);
}

// S E T U P

function setup() {
  createCanvas(550, 800);
  bgSong.play()
  background(bgImage);

  // Font default
  textSize(30);
  textFont(scoreFont);

  // Set modes
  angleMode(DEGREES);
  imageMode(CORNER);
  frameRate(40);

  // Initial platform for seal to land on
  createPlatform();
  startPlatform = new Platform(0, 600, 0);
  currentPlatforms.push(startPlatform);

}

// K E Y P R E S S

function keyPressed() {
  if (keyCode === 32 && gameState === "start") {
    gameState = "play";
  } else if (keyCode === 82 && gameState === "gameover") {
    location.reload();
  }
}

// D R A W

let gameCount = 0;

function cutscene(){
  if (gameCount < 80) {
    image(cut1, 0, 0, 550, 800);
  } else if (gameCount < 160) {
    image(cut2, 0, 0, 550, 800);
  } else if (gameCount < 240) {
    image(cut3, 0, 0, 550, 800);
  } else if (gameCount < 320) {
    image(cut4, 0, 0, 550, 800);
  } else if (gameCount < 400) {
    image(cut5, 0, 0, 550, 800);
  } else if (gameCount > 400 & gameCount < 480 ){
    text("press SPACE to jump", width / 2, (height/2)-25); 
    text("control jump direction", width / 2, (height/2)+15);
    text("and power with the mouse", width / 2, (height/2)+40);
  } else if (gameCount > 480) {
    seal.makeSeal();
    sealMovement();
  }
}

// D R A W

function draw() {
  background(bgImage);

  if (gameState === "start") {
    drawStartScreen();
  } else if (gameState === "play") {
      gameCount++;
      console.log(gameCount) 
      removeStartingPlatform();
  
      // Check if the game is over
      if (seal.y > 850) {
        gameState = "gameover";
      } else {
        // Display the floor and score
        drawFloor();

        // Update and display platforms
        updatePlatforms();

        // Display the floor and score
        drawFloor();
        
        // play cutscene if conditions met
        cutscene()

        // Create a new platform every couple of gameCounts
        if (gameCount % 160 === 0) {
          createPlatform();  
        }
    }
  } else if (gameState === "gameover") {
    drawGameOverScreen();
  }

}
