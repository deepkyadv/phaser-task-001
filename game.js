const sessionData = [];
let sessionID;
let countdown;
let timerEvent;
let startTime;
let endTime;
let ball;
let sessionActive = false; // Track session status

class MainScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MainScene' });
  }

  preload() {
    this.load.image('back', 'assets/cloudWithSea.png');
    this.load.audio('clock', 'assets/audio/oldClock.mp3');
    this.load.image('ball', 'assets/ball.png');
  }

  create() {
    this.add.image(0, 0, 'back').setOrigin(0, 0); // Corrected background image placement
    this.clockSound = this.sound.add('clock');

    // Set the ball to start at the bottom of the screen
    ball = this.physics.add.image(500, 600, 'ball').setCollideWorldBounds(true).setBounce(1, 1);
    ball.setDisplaySize(100, 100);
    this.physics.world.setBounds(0, 0, this.scale.width, this.scale.height, true, true, true, true); // Ensure ball interacts with visible canvas edges

    document.getElementById('startSessionBtn').addEventListener('click', () => {
      if (!sessionActive) {
        this.startSession();
      }
    });

    // Handle visibility changes (in this case, we do nothing when visibility changes)
    document.addEventListener('visibilitychange', this.handleVisibilityChange.bind(this));
  }

  startSession() {
    sessionActive = true;
    sessionID = Phaser.Math.Between(1000, 9999).toString();
    countdown = Phaser.Math.Between(60, 120); // Changed back to 30-120 seconds for variability
    startTime = new Date().toLocaleTimeString();
    document.getElementById('sessionId').innerText = sessionID;
    document.getElementById('startTime').innerText = startTime;
    document.getElementById('counterValue').innerText = countdown;
    this.clockSound.play({ loop: true });

    // Set the ball velocity to a random value
    const velocityX = Phaser.Math.Between(-600, 600);
    const velocityY = Phaser.Math.Between(-600, 600);

    ball.setVelocity(velocityX, velocityY);

    timerEvent = this.time.addEvent({
      delay: 1000,
      callback: this.updateCountdown,
      callbackScope: this,
      loop: true
    });
  }

  updateCountdown() {
    if (countdown > 0) { // Continue countdown regardless of visibility
      countdown--;
      document.getElementById('counterValue').innerText = countdown;
    } else {
      this.endSession();
    }
  }

  endSession() {
    endTime = new Date().toLocaleTimeString();
    sessionData.push({ sessionID, startTime, endTime });
    document.getElementById('endTime').innerText = endTime;
    this.updateSessionList();
    this.clockSound.stop();
    timerEvent.remove();
    ball.setVelocity(0, 0); // Stop ball movement
    sessionActive = false;
  }

  updateSessionList() {
    const sessionList = document.getElementById('sessionList');
    sessionList.innerHTML = '';
    sessionData.forEach(session => {
      const li = document.createElement('li');
      sessionList.appendChild(li);
    });
  }

  checkBallPosition(){
    if (ball.y < 325) { // If the ball crosses mid-height
      ball.setVelocityY(Math.abs(ball.body.velocity.y)); // Reverse the direction if it goes above mid-height
    }
  }

  handleVisibilityChange() {
    // Do nothing; the game should continue running as usual
  }

  update(time, delta) {
    this.checkBallPosition();
  }
}

const config = {
  type: Phaser.CANVAS,
  width: 1000,
  height: 650,
  scene: MainScene,
  parent: 'gameContainer',
  physics: {
    default: 'arcade',
    arcade: {
      debug: false,
      gravity: { y: 0 } // Ensure no gravity affects the ball
    }
  },
  disableVisibilityChange: true // Prevent the game from pausing when focus is lost
};

const game = new Phaser.Game(config);
