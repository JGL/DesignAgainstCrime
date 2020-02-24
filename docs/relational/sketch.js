// Based on examples from: http://brm.io/matter-js/
// Originally from https://github.com/shiffman/p5-matter/blob/master/01_basics/sketch.js

var Engine = Matter.Engine;
var Render = Matter.Render;
var World = Matter.World;
var Bodies = Matter.Bodies;
var Composite = Matter.Composite;

var engine;

var ground;
var leftWall;
var rightWall;
var ceiling;

var words = ["Design", "Against", "Crime", "Research", "Centre", "Socially", "Responsive", "Design", "and", "Innovation"];
var rectangles = []; //array holding the rectangles in the simulation

function DACRectangle(theRectangle, theWord, rectangleWidth, rectangleHeight) { // quick class to hold Matter Rectangle and its colour
  this.matterRectangle = theRectangle;
  this.colour = color(random(100), 50, 100, 50); //random hue, saturation 50%, brightness 100%, alpha 50%;
  this.word = theWord;
  this.rectangleWidth = rectangleWidth;
  this.rectangleHeight = rectangleHeight;
}

function setup() {
  createCanvas(800, 600);
  textSize(42);
  textAlign(CENTER, CENTER); //https://p5js.org/reference/#/p5/textAlign

  // create an engine
  engine = Engine.create();

  //make walls to constrain everything
  var params = {
    isStatic: true
  }
  ground = Bodies.rectangle(width / 2, height + 1, width, 1, params); //+1 so it's just below the bottom of the screen, Matter.Bodies.rectangle(x, y, width, height, [options])
  leftWall = Bodies.rectangle(0, height / 2, 1, height, params);
  rightWall = Bodies.rectangle(width, height / 2, 1, height, params);
  ceiling = Bodies.rectangle(width / 2, 0, width, 1, params);
  World.add(engine.world, ground);
  World.add(engine.world, leftWall);
  World.add(engine.world, rightWall);
  World.add(engine.world, ceiling);

  //https://p5js.org/reference/#/p5/textAscent and https://p5js.org/reference/#/p5/textDescent
  var pixelPadding = 10; //10 pixels on width and height
  var heightOfText = textAscent() + textDescent() + pixelPadding;
  //now create and add the rectangles to the world
  for (var i = 0; i < words.length; i++) {
    //https://p5js.org/reference/#/p5/textWidth
    var widthOfText = textWidth(words[i]) + pixelPadding;
    var newRectangle = Bodies.rectangle(100 + ((width / words.length) * i), 200, widthOfText, heightOfText);
    var theRectangleToRemember = new DACRectangle(newRectangle, words[i], widthOfText, heightOfText);
    rectangles.push(theRectangleToRemember);
    World.add(engine.world, newRectangle);
  }

  // run the engine
  Engine.run(engine);
}

// Using p5 to render
function draw() {
  // I could ask for everything in the world
  // var bodies = Composite.allBodies(engine.world);

  background(51);

  for (var i = 0; i < rectangles.length; i++) {
    // Getting vertices of each object
    var vertices = rectangles[i].matterRectangle.vertices;
    fill(255);
    beginShape();
    for (var j = 0; j < vertices.length; j++) {
      vertex(vertices[j].x, vertices[j].y);
    }
    endShape();

    var theRectangle = rectangles[i].matterRectangle;
    var pos = theRectangle.position;
    var angle = theRectangle.angle;
    var theColour = theRectangle.colour;
    var translateTargetX = pos.x;
    var translateTargetY = pos.y;
    push();
    translate(translateTargetX, translateTargetY);
    rotate(angle);
    fill(0);
    text(rectangles[i].word, 0, 0);
    pop();
  }

  // // Ground vertices
  // var vertices = ground.vertices;
  // beginShape();
  // fill(127);
  // for (var i = 0; i < vertices.length; i++) {
  //   vertex(vertices[i].x, vertices[i].y);
  // }
  // endShape();
}
