let video;
let handpose;
let predictions = [];

let catcherX = 320;
let score = 0;
let ball;

function setup() {
  createCanvas(640, 480);

  // 啟用相機
  video = createCapture(VIDEO);
  video.size(width, height);
  video.hide();

  // 啟用 handpose 模型
  handpose = ml5.handpose(video, modelReady);
  handpose.on("predict", (results) => {
    predictions = results;
  });

  // 初始生成一顆球
  ball = new Ball();
}

function modelReady() {
  console.log("✅ handpose 模型載入完成");
}

function draw() {
  background(255);

  // 顯示鏡像相機畫面
  push();
  translate(width, 0);
  scale(-1, 1);
  image(video, 0, 0, width, height);
  pop();

  // 顯示接盤位置（由手勢控制）
  if (predictions.length > 0) {
    let hand = predictions[0].landmarks;
    let x = hand[9][0]; // 中指根部座標
    catcherX = width - x; // 鏡像校正
  }

  drawCatcher();

  // 更新與顯示球
  ball.update();
  ball.display();

  // 判斷是否接到
  if (
    ball.y > height - 30 &&
    ball.x > catcherX - 40 &&
    ball.x < catcherX + 40
  ) {
    if (ball.correct) {
      score += 1;
    } else {
      score -= 1;
    }
    ball = new Ball(); // 重新產生一顆球
  }

  // 如果球掉到底部也重生
  if (ball.y > height) {
    ball = new Ball();
  }

  // 顯示分數
  fill(0);
  textSize(20);
  text("分數：" + score, 20, 30);
}

function drawCatcher() {
  fill(0, 102, 255, 180);
  noStroke();
  rectMode(CENTER);
  rect(catcherX, height - 15, 100, 15, 10);
}

class Ball {
  constructor() {
    this.x = random(50, width - 50);
    this.y = 0;
    this.speed = 3;
    this.text = random(["2+2=4", "3+1=5", "5-2=3", "1+1=3"]);
    this.correct = ["2+2=4", "5-2=3"].includes(this.text);
  }

  update() {
    this.y += this.speed;
  }

  display() {
    fill(this.correct ? "green" : "red");
    ellipse(this.x, this.y, 50);
    fill(255);
    textAlign(CENTER, CENTER);
    textSize(14);
    text(this.text, this.x, this.y);
  }
}
