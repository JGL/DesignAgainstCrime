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

// GUI controls: https://github.com/bitcraftlab/p5.gui

var visible;
var gui;

var lineWidth8;
var lineWidthMin;
var lineWidthMax;
var lineWidthStep;
var backgroundColour;
var lineColour;
var lineAlpha;
var lineAlphaMin;
var lineAlphaMax;
var lineAlphaStep;

function setup() {
  canvas = createCanvas(800, 600);
  textSize(42);
  textAlign(CENTER, CENTER); //https://p5js.org/reference/#/p5/textAlign
  //setting up colour mode and fill mode
  colorMode(HSB); //https://p5js.org/reference/#/p5/colorMode have to do it right at the start of setup, otherwise other created colours remember the colour mode they were created in
  //colorMode(HSB, 360, 100, 100, 1) is default

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

  visible = true;

  lineWidth = 8;
  lineWidthMin = 0;
  lineWidthMax = 42;
  lineWidthStep = 1;
  backgroundColour = [0, 0, 100]; //https://rgb.to/white
  lineColour = [0, 0, 0]; //black in hsl, https://rgb.to/black

  // Create Layout GUI
  gui = createGui("Press g to hide/show me");
  gui.addGlobals('lineWidth', 'backgroundColour', 'lineColour');
}

// Using p5 to render
function draw() {
  background(backgroundColour);

  strokeWeight(lineWidth);
  stroke(lineColour);
  noFill();
  beginShape();
  //drawing Catmull-Rom splines between rectangles first....
  //https://p5js.org/reference/#/p5/curveVertex
  curveVertex(rectangles[0].matterRectangle.position.x, rectangles[0].matterRectangle.position.y); //have to add first point twice to draw properly
  for (var i = 0; i < rectangles.length; i++) {
    var rectangleCentreX = rectangles[i].matterRectangle.position.x;
    var rectangleCentreY = rectangles[i].matterRectangle.position.y;
    curveVertex(rectangleCentreX, rectangleCentreY);
  }
  curveVertex(rectangles[rectangles.length - 1].matterRectangle.position.x, rectangles[rectangles.length - 1].matterRectangle.position.y); //have to add last point twice to draw properly
  endShape();

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

// check for keyboard events
function keyPressed() {
  switch (key) {
    // type [F1] to hide / show the GUI
    case 'g':
      visible = !visible;
      if (visible) gui.show();
      else gui.hide();
      break;
  }
}

function DACRectangle(theRectangle, theWord, rectangleWidth, rectangleHeight) {
  // quick class to hold Matter Rectangle and its colour
  this.matterRectangle = theRectangle;
  this.colour = color(random(360), 100, 100, 1); //random hue, saturation 100%, brightness 100%, alpha 100%;
  this.word = theWord;
  this.rectangleWidth = rectangleWidth;
  this.rectangleHeight = rectangleHeight;
}
