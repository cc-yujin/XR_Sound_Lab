let csound;
let initialized = false;

let params = {
  level: 0.0,
};

function updateParams() {
  if (initialized) {
    csound
      .getControlChannel("level")
      .then((f) => {
        params.level = f;
        console.log("Level:", params.level);
      })
      .catch((err) => console.error("Error getting control channel:", err));
  }
}

function setup() {
  createCanvas(800, 600, WEBGL);
}

function draw() {
  updateParams();
  background(0);

  let time = millis();

  noFill();
  stroke(255);

  rotateX(time * 0.001);
  rotateY(time * 0.001);
  rotateZ(time * 0.001);

  box(30.0 + params.level * 500.0);
}

async function mouseClicked() {
  if (!initialized) {
    try {
      csound = await Csound();
      console.log("Csound initialized");

      await csound.compileCsdText(soundCode);
      console.log("Csound script compiled");

      await csound.start();
      console.log("Csound started");

      initialized = true;
    } catch (err) {
      console.error("Error initializing Csound:", err);
    }
  }
}

let soundCode = `
<CsoundSynthesizer>
<CsOptions>
-odac -m4
</CsOptions>
<CsInstruments>
nchnls = 2
0dbfs = 1.0

gkLevel chnexport "level", 3

schedule "schedule", 0, 0.1, 0

instr schedule
  iBPM = 60
  ibeat = p4
  ibeatDur = 60/i(iBPM)

  if ibeat % 1 == 0 then
    schedule "synth1", 0, 0.25, 110
  endif
  
  schedule "schedule", ibeatDur * 0.25, 0.1, ibeat + 0.25
endin

instr synth1
  aenv line 0.1, p3, 0.0
  asig oscil aenv, p4
  outs asig, asig
  alevel follow asig, 0.01
  gkLevel = k(alevel)
endin

</CsInstruments>
<CsScore>
</CsScore>
</CsoundSynthesizer>
`;
