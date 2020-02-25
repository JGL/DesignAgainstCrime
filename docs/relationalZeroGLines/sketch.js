// Based on examples from: http://brm.io/matter-js/
// Originally from https://github.com/shiffman/p5-matter/blob/master/01_basics/sketch.js

var Engine = Matter.Engine;
var Render = Matter.Render;
var World = Matter.World;
var Body = Matter.Body;
var Bodies = Matter.Bodies;
var Composite = Matter.Composite;
var Composites = Matter.Composites;
var Constraint = Matter.Constraint;

//via https://github.com/shiffman/p5-matter/blob/master/03_chain/sketch.js
var Mouse = Matter.Mouse;
var MouseConstraint = Matter.MouseConstraint;
var mouseConstraint;

var engine;
var world;
var bodies;

var canvas;
var constraint;

var ground;
var leftWall;
var rightWall;
var ceiling;

var words = [
  "Design",
  "Against",
  "Crime",
  "Research",
  "Centre",
  "Socially",
  "Responsive",
  "Design",
  "and",
  "Innovation"
];
var rectangles = []; //array holding the rectangles in the simulation

function setup() {
  canvas = createCanvas(800, 600);
  textSize(42);
  textAlign(CENTER, CENTER); //https://p5js.org/reference/#/p5/textAlign
  //setting up colour mode and fill mode
  colorMode(HSB, 100); //https://p5js.org/reference/#/p5/colorMode have to do it right at the start of setup, otherwise other created colours remember the colour mode they were created in

  // create an engine
  engine = Engine.create();
  world = engine.world;
  //zero gravity in matter.js 
  //https://stackoverflow.com/questions/29466684/disabling-gravity-in-matter-js
  //https: //brm.io/matter-js/docs/classes/World.html#property_gravity
  world.gravity.y = 0;

  // get mouse interaction set up....
  var mouse = Mouse.create(canvas.elt);
  var mouseParams = {
    mouse: mouse,
    constraint: {
      stiffness: 0.1
    }
  };
  mouseConstraint = MouseConstraint.create(engine, mouseParams);
  mouseConstraint.mouse.pixelRatio = pixelDensity();
  World.add(world, mouseConstraint);

  //make walls to constrain everything
  var params = {
    isStatic: true
  };
  ground = Bodies.rectangle(width / 2, height + 1, width, 1, params); //+1 so it's just below the bottom of the screen, Matter.Bodies.rectangle(x, y, width, height, [options])
  leftWall = Bodies.rectangle(0, height / 2, 1, height, params);
  rightWall = Bodies.rectangle(width, height / 2, 1, height, params);
  ceiling = Bodies.rectangle(width / 2, 0, width, 1, params);
  World.add(world, ground);
  World.add(world, leftWall);
  World.add(world, rightWall);
  World.add(world, ceiling);

  //https://p5js.org/reference/#/p5/textAscent and https://p5js.org/reference/#/p5/textDescent
  var pixelPadding = 10; //10 pixels on width and height
  var heightOfText = textAscent() + textDescent() + pixelPadding;
  var startXPosition = 200;
  var endXPosition = width - startXPosition;
  var widthForWords = endXPosition - startXPosition;
  var spacePerWord = widthForWords / words.length;
  var randomXVelocity = random(-5, 5);
  var randomYVelocity = random(-5, 5);

  //now create and add the rectangles to the world
  for (var i = 0; i < words.length; i++) {
    //https://p5js.org/reference/#/p5/textWidth
    var widthOfText = textWidth(words[i]) + pixelPadding;
    var textXPosition = spacePerWord * i;

    if ((textXPosition + (widthOfText / 2)) > width) {
      textXPosition -= (widthOfText / 2);
    }

    if ((textXPosition - (widthOfText / 2)) < 0) {
      textXPosition += (widthOfText / 2);
    }

    var newRectangle = Bodies.rectangle(
      textXPosition,
      height / 2,
      widthOfText,
      heightOfText
    );
    var theRectangleToRemember = new DACRectangle(
      newRectangle,
      words[i],
      widthOfText,
      heightOfText
    );
    rectangles.push(theRectangleToRemember);
    World.add(world, newRectangle);

    //set a random velocity of the new rectangle
    //see http://brm.io/matter-js/docs/classes/Body.html
    //from http://codepen.io/lilgreenland/pen/jrMvaB?editors=0010#0
    Body.setVelocity(newRectangle, {
      x: randomXVelocity,
      y: randomYVelocity
    });
  }

  // run the engine
  Engine.run(engine);
}

// Using p5 to render
function draw() {
  background(255);

  strokeWeight(8);
  stroke(0);
  //drawing straight lines between rectangles first....
  for (var i = 0; i < (rectangles.length - 1); i++) {
    var startX = rectangles[i].matterRectangle.position.x;
    var startY = rectangles[i].matterRectangle.position.y;
    var endX = rectangles[i + 1].matterRectangle.position.x;
    var endY = rectangles[i + 1].matterRectangle.position.y;
    line(startX, startY, endX, endY);
  }

  noStroke();
  //drawing the rectangles themselves and their text
  for (var i = 0; i < rectangles.length; i++) {
    // Getting vertices of each object
    var theRectangle = rectangles[i].matterRectangle;
    var angle = theRectangle.angle;
    var theColour = rectangles[i].colour;
    var translateTargetX = theRectangle.position.x;
    var translateTargetY = theRectangle.position.y;
    var vertices = theRectangle.vertices;

    fill(theColour);
    beginShape();
    for (var j = 0; j < vertices.length; j++) {
      vertex(vertices[j].x, vertices[j].y);
    }
    endShape();

    fill(0);
    push();
    translate(translateTargetX, translateTargetY);
    //ellipse(0, 0, 72, 72);
    rotate(angle);
    text(rectangles[i].word, 0, 0);
    pop();
  }
}

function DACRectangle(theRectangle, theWord, rectangleWidth, rectangleHeight) {
  // quick class to hold Matter Rectangle and its colour
  this.matterRectangle = theRectangle;
  this.colour = color(random(100), 100, 100, 100); //random hue, saturation 50%, brightness 100%, alpha 50%;
  this.word = theWord;
  this.rectangleWidth = rectangleWidth;
  this.rectangleHeight = rectangleHeight;
}
