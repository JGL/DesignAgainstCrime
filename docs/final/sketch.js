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

var engine; //matter physics engine
var world; //matter physics world
var bodies; //matter physics bodies

var canvas; //pixel canvas

var ground; //ground object for the physics simluation, so that the rectangles can't go off the canvas
var leftWall; //left wall as above
var rightWall; //right wall as above
var ceiling; //ceilling as above

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
]; //array containing the words to be displayed by the simulation
var rectangles = []; //array holding the rectangles in the simulation

// GUI controls: https://github.com/bitcraftlab/p5.gui
// var visible; //is the GUI visible or not?
// var gui; //the gui object itself

var colourChoice; // GUI controller for selecting the colour variant
var backgroundColours = []; //array to contain different background colours, ordered by colourChoice index
var wordColours = []; //array of arrays of word colours, ordered by the words array above
var wordBackgroundColours = []; //array of arrays of word background colours, ordered by the words array above

var lineColours = []; // array to contain different line colours to connect the rectangles, ordered by colourChoice index

var control1X;
var control1Y;
var control2X;
var control2Y;

var currentIndex; //0 to start with and then 1 after the fade has happened

function setup() {
  canvas = createCanvas(800, 600); //800 pixel wide 600 pixel high canvas
  textSize(42); //42 is the answer to everything
  textAlign(CENTER, CENTER); //https://p5js.org/reference/#/p5/textAlign

  // create an engine
  engine = Engine.create();
  world = engine.world;

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
  var horizontalSpacePerWord = widthForWords / words.length;
  var verticalSpacePerWord = height / (words.length + 1);
  var randomXVelocity = random(-5, 5);
  var randomYVelocity = random(-5, 5);

  //now create and add the rectangles to the world
  for (var i = 0; i < words.length; i++) {
    //https://p5js.org/reference/#/p5/textWidth
    var widthOfText = textWidth(words[i]) + pixelPadding;
    var textXPosition = horizontalSpacePerWord * i;
    //var textYPosition = height / 2;
    var textYPosition = verticalSpacePerWord * (i + 1);

    if ((textXPosition + (widthOfText / 2)) > width) {
      textXPosition -= (widthOfText / 2);
    }

    if ((textXPosition - (widthOfText / 2)) < 0) {
      textXPosition += (widthOfText / 2);
    }

    var newRectangle = Bodies.rectangle(
      textXPosition,
      textYPosition,
      widthOfText,
      heightOfText
    );
    var theRectangleToRemember = new DACRectangle(
      newRectangle,
      words[i],
      widthOfText,
      heightOfText,
      i
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

  //pick random values for curve control points
  control1X = random(width);
  control1Y = random(height);
  control2X = random(width);
  control2Y = random(height);

  visible = true;

  backgroundColours = [
    color(233, 52, 78),
    color(235, 59, 86)
  ];

  lineColours = [
    color(255, 255, 255, 255),
    color(255, 255, 255, 255)
  ];

  // var words = [
  //   "Design",
  //   "Against",
  //   "Crime",
  //   "Research",
  //   "Centre",
  //   "Socially",
  //   "Responsive",
  //   "Design",
  //   "and",
  //   "Innovation"
  // ]; //array containing the words to be displayed by the simulation

  wordBackgroundColours = [
    [color(255, 255, 255), color(97, 95, 90)],
    [color(255, 255, 255), color(101, 152, 144)],
    [color(255, 255, 255), color(101, 152, 144)],
    [color(255, 255, 255), color(97, 95, 90)],
    [color(255, 255, 255), color(97, 95, 90)],
    [color(255, 255, 255), color(250, 249, 113)],
    [color(255, 255, 255), color(250, 249, 113)],
    [color(255, 255, 255), color(250, 249, 113)],
    [color(255, 255, 255), color(101, 152, 144)],
    [color(255, 255, 255), color(250, 249, 113)]
  ];

  wordColours = [
    [color(0, 0, 0), color(255, 255, 255)],
    [color(0, 0, 0), color(255, 255, 255)],
    [color(0, 0, 0), color(255, 255, 255)],
    [color(0, 0, 0), color(255, 255, 255)],
    [color(0, 0, 0), color(255, 255, 255)],
    [color(0, 0, 0), color(0, 0, 0)],
    [color(0, 0, 0), color(0, 0, 0)],
    [color(0, 0, 0), color(0, 0, 0)],
    [color(0, 0, 0), color(255, 255, 255)],
    [color(0, 0, 0), color(0, 0, 0)]
  ];

  //https://www.youtube.com/watch?v=nGfTjA8qNDA - "9.4: JavaScript setTimeout() Function - p5.js Tutorial "
  //https://github.com/CodingTrain/website/blob/be0b7898cf08aa7092c30dbf532fb49f5e08b42c/Tutorials/P5JS/p5.js/09/9.04_p5.js_setTimeout/sketch.js
  //
  setTimeout(goZeroGravity, 2000); //in 2000 milliseconds, run the goZeroGravity function

  currentIndex = 0; //with the first element in all the colour arrays, before going onto the second after zero gravity has occurred
}

// Using p5 to render
function draw() {

  background(backgroundColours[currentIndex]);

  if (currentIndex == 1) {
    strokeWeight(8);
    stroke(lineColours[currentIndex]);
    noFill();

    //drawing bezier curves lines between rectangles first....
    for (var i = 0; i < (rectangles.length - 1); i++) {
      var startX = rectangles[i].matterRectangle.position.x;
      var startY = rectangles[i].matterRectangle.position.y;
      var endX = rectangles[i + 1].matterRectangle.position.x;
      var endY = rectangles[i + 1].matterRectangle.position.y;
      bezier(startX, startY, control1X, control1Y, control2X, control2Y, endX, endY);
    }
  }

  noStroke();
  //drawing the rectangles themselves and their text
  for (var i = 0; i < rectangles.length; i++) {
    // Getting vertices of each object
    var theRectangle = rectangles[i].matterRectangle;
    var angle = theRectangle.angle;
    var theColour = color(255, 0, 0); //rectangles[i].colour;
    var translateTargetX = theRectangle.position.x;
    var translateTargetY = theRectangle.position.y;
    var vertices = theRectangle.vertices;

    fill(wordBackgroundColours[i][currentIndex]);
    beginShape();
    for (var j = 0; j < vertices.length; j++) {
      vertex(vertices[j].x, vertices[j].y);
    }
    endShape();

    fill(wordColours[i][currentIndex]);
    push();
    translate(translateTargetX, translateTargetY);
    //ellipse(0, 0, 72, 72);
    rotate(angle);
    text(rectangles[i].word, 0, 0);
    pop();
  }
}

// check for keyboard events
function keyPressed() {
  switch (key) {
    // type [g] to hide / show the GUI
    case 'g':
      visible = !visible;
      if (visible) gui.show();
      else gui.hide();
      break;
    case '0':
      world.gravity.y = 0;
      break;
    case '1':
      world.gravity.y = 1;
      break;
  }
}

function DACRectangle(theRectangle, theWord, rectangleWidth, rectangleHeight, wordIndex) {
  // quick class to hold Matter Rectangle and its colour
  this.matterRectangle = theRectangle;
  this.word = theWord;
  this.rectangleWidth = rectangleWidth;
  this.rectangleHeight = rectangleHeight;
  this.wordIndex = wordIndex;
}

function goZeroGravity() {
  world.gravity.y = 0;
  currentIndex = 1;

  for (var i = 0; i < rectangles.length; i++) {
    //set a random velocity of the new rectangle
    var randomXVelocity = random(-5, 5);
    var randomYVelocity = random(-5, -1);
    //see http://brm.io/matter-js/docs/classes/Body.html
    //from http://codepen.io/lilgreenland/pen/jrMvaB?editors=0010#0
    Body.setVelocity(rectangles[i].matterRectangle, {
      x: randomXVelocity,
      y: randomYVelocity
    });
  }
}
