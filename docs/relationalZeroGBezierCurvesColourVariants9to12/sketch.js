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

var visible; //is the GUI visible or not?
var gui; //the gui object itself

var colourChoice; // GUI controller for selecting the colour variant
var backgroundColours = []; //array to contain different background colours, ordered by colourChoice index
var wordColours = []; //array of arrays of word colours, ordered by the words array above
var wordBackgroundColours = []; //array of arrays of word background colours, ordered by the words array above

var lineColours = []; // array to contain different line colours to connect the rectangles, ordered by colourChoice index

var control1X;
var control1Y;
var control2X;
var control2Y;

function setup() {
  canvas = createCanvas(800, 600); //800 pixel wide 600 pixel high canvas
  textSize(42); //42 is the answer to everything
  textAlign(CENTER, CENTER); //https://p5js.org/reference/#/p5/textAlign

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

  colourChoice = ['Variant 9', 'Variant 10', 'Variant 11', 'Variant 12'];

  // Create Layout GUI
  gui = createGui("Press g to hide/show me");
  gui.addGlobals('colourChoice');

  backgroundColours = [
    color(238, 221, 123),
    color(155, 38, 79),
    color(24, 24, 24),
    color(62, 81, 89)
  ];

  lineColours = [
    color(255, 255, 255, 255),
    color(76, 59, 70, 255),
    color(255, 255, 255, 192),
    color(255, 255, 255, 192)
  ];

  // var words = [
  // 1  "Design",
  // 2  "Against",
  // 3  "Crime",
  // 4  "Research",
  // 5  "Centre",
  // 6  "Socially",
  // 7  "Responsive",
  // 8  "Design",
  // 9  "and",
  // 10  "Innovation"
  // ]; //array containing the words to be displayed by the simulation

  wordBackgroundColours = [
    [color(97, 95, 90), color(235, 60, 82), color(235, 186, 67), color(238, 205, 218)],
    [color(73, 164, 183), color(187, 181, 74), color(221, 80, 72), color(213, 189, 164)],
    [color(73, 164, 183), color(187, 181, 74), color(221, 80, 72), color(238, 205, 218)],
    [color(134, 190, 152), color(137, 193, 161), color(82, 110, 63), color(230, 168, 95)],
    [color(134, 190, 152), color(137, 193, 161), color(82, 110, 63), color(95, 143, 166)],
    [color(235, 59, 86), color(44, 75, 118), color(116, 175, 205), color(95, 143, 166)],
    [color(235, 59, 86), color(44, 75, 118), color(116, 175, 205), color(95, 143, 166)],
    [color(235, 59, 86), color(235, 60, 82), color(82, 110, 63), color(230, 168, 95)],
    [color(134, 190, 152), color(187, 181, 74), color(235, 186, 67), color(119, 132, 104)],
    [color(235, 59, 86), color(44, 75, 118), color(235, 186, 67), color(238, 205, 218)],
  ];

  wordColours = [
    [color(255, 255, 255), color(255, 255, 255), color(255, 255, 255), color(0, 0, 0)],
    [color(68, 65, 71), color(255, 255, 255), color(255, 255, 255), color(0, 0, 0)],
    [color(68, 65, 71), color(255, 255, 255), color(255, 255, 255), color(0, 0, 0)],
    [color(255, 255, 255), color(255, 255, 255), color(255, 255, 255), color(0, 0, 0)],
    [color(255, 255, 255), color(255, 255, 255), color(255, 255, 255), color(255, 255, 255)],
    [color(255, 255, 255), color(255, 255, 255), color(255, 255, 255), color(0, 0, 0)],
    [color(255, 255, 255), color(255, 255, 255), color(255, 255, 255), color(255, 255, 255)],
    [color(255, 255, 255), color(255, 255, 255), color(255, 255, 255), color(0, 0, 0)],
    [color(255, 255, 255), color(255, 255, 255), color(255, 255, 255), color(255, 255, 255)],
    [color(255, 255, 255), color(255, 255, 255), color(255, 255, 255), color(0, 0, 0)],
  ];
}

// Using p5 to render
function draw() {
  var currentIndex = getIndexOfVariant();

  background(backgroundColours[currentIndex]);

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
    // type g to hide / show the GUI
    case 'g':
      visible = !visible;
      if (visible) gui.show();
      else gui.hide();
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

function getIndexOfVariant() {
  var theIndex = 0;
  switch (colourChoice) {
    case 'Variant 9':
      theIndex = 0;
      break;
    case 'Variant 10':
      theIndex = 1;
      break;
    case 'Variant 11':
      theIndex = 2;
      break;
    case 'Variant 12':
      theIndex = 3;
      break;
  }

  return theIndex;
}
