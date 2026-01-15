let handPose;
let video;
let hands = [];
let estado = "INICIO"; 
let serieColores = []; 
let pelotitasInteractivas = [];
let indiceEsperado, nivel = 1, tiempoInicio, tiempoInicioEstado = 0;
let limpiandoPantalla = false;

function preload() {
  handPose = ml5.handPose();
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  video = createCapture(VIDEO);
  video.size(640, 480);
  video.hide(); 
  handPose.detectStart(video, (results) => { hands = results; });
}

function windowResized() { resizeCanvas(windowWidth, windowHeight); }

function draw() {
  if (estado === "ERROR") {
    background(255, 0, 0);
    fill(255);
    textAlign(CENTER, CENTER);
    textSize(80);
    text("ERROR", width / 2, height / 2);
    if (millis() - tiempoInicio > 2000) reiniciarTotal();
    return;
  }

  if (limpiandoPantalla) {
    background(255);
    return;
  }

  background(255); 
  if (estado === "INICIO") {
    if (hands.length > 0) iniciarJuego(); 
    else {
      fill(0); textAlign(CENTER, CENTER); textSize(24);
      //text("PON TU MANO PARA COMENZAR", width / 2, height / 2);
    }
  } else if (estado === "MOSTRAR_SERIE") {
    let index = floor((millis() - tiempoInicioEstado) / 1000);
    if (index >= 0 && index < 5) background(serieColores[index]);
  } else if (estado === "JUEGO") {
    if (millis() - tiempoInicio > 15000) { estado = "ERROR"; tiempoInicio = millis(); return; }
    for (let p of pelotitasInteractivas) {
      p.x += p.vx; p.y += p.vy;
      if (p.x < 40 || p.x > width - 40) p.vx *= -1;
      if (p.y < 40 || p.y > height - 40) p.vy *= -1;
      noStroke(); fill(p.col); ellipse(p.x, p.y, 80);
    }
  }
}

function iniciarJuego() {
  estado = "MOSTRAR_SERIE";
  tiempoInicioEstado = millis();
  serieColores = Array.from({length: 5}, () => color(random(255), random(255), random(255)));
  setTimeout(() => {
    if (estado === "MOSTRAR_SERIE") {
      indiceEsperado = 4;
      pelotitasInteractivas = serieColores.map((col, i) => ({
        x: random(100, width - 100), y: random(100, height - 100),
        vx: random(-nivel - 2, nivel + 2), vy: random(-nivel - 2, nivel + 2),
        col: col, id: i
      }));
      estado = "JUEGO"; tiempoInicio = millis();
    }
  }, 5000);
}

function mousePressed() {
  if (estado !== "JUEGO" || limpiandoPantalla) return;
  let p = pelotitasInteractivas.find(p => dist(mouseX, mouseY, p.x, p.y) < 40);
  if (p) {
    if (p.id === indiceEsperado) {
      pelotitasInteractivas = pelotitasInteractivas.filter(pel => pel.id !== indiceEsperado);
      if (indiceEsperado === 0) {
        if (nivel >= 3) reiniciarTotal();
        else { nivel++; estado = "INICIO"; }
      } else {
        indiceEsperado--;
        limpiandoPantalla = true;
        setTimeout(() => { limpiandoPantalla = false; }, 300);
      }
    } else { estado = "ERROR"; tiempoInicio = millis(); }
  }
}

function reiniciarTotal() {
  nivel = 1; estado = "INICIO"; hands = []; limpiandoPantalla = false;
}
