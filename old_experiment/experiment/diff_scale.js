// ## High-level overview
// Things happen in this order:
// 

// ASSIGN VARIABLES
//create array of all trials

var trial7 = shuffle(["7_1","7_2"])
var trial8 = shuffle(["8_1","8_2"])
var trial9 = shuffle(["9_1","9_2"])
var trial10 = shuffle(["10_1","10_2"])
var trial11 = shuffle(["11_1","11_2"])
var trial12 = shuffle(["12_1","12_2"])
var trial13 = shuffle(["13_1","13_2"])
var trial14 = shuffle(["14_1","14_2"])
var trial15 = shuffle(["15_1","15_2"])
var trial16 = shuffle(["16_1","16_2"])
var trial17 = shuffle(["17_1","17_2"])
var trial18 = shuffle(["18_1","18_2"])
var trial19 = shuffle(["19_1","19_2"])
var trial20 = shuffle(["20_1","20_2"])
var trial21 = shuffle(["21_1","21_2"])
var trial22 = shuffle(["22_1","22_2"])
var trial23 = shuffle(["23_1","23_2"])
var trial24 = shuffle(["24_1","24_2"])
var trial25 = shuffle(["25_1","25_2"])
var trial26 = shuffle(["26_1","26_2"])
var trial27 = shuffle(["27_1","27_2"])
var trial28 = shuffle(["28_1","28_2"])
var trial29 = shuffle(["29_1","29_2"])
var trial30 = shuffle(["30_1","30_2"])
var trial31 = shuffle(["31_1","31_2"])
var trial32 = shuffle(["32_1","32_2"])
var trial33 = shuffle(["33_1","33_2"])
var trial34 = shuffle(["34_1","34_2"])
var trial35 = shuffle(["35_1","35_2"])
var trial36 = shuffle(["36_1","36_2"])

var practice_trials = shuffle(["37_1","37_2"])
practice_trials.unshift("example_init")
practice_trials.unshift("example_intro")

// var ver_1_trials = shuffle([trial7, trial8, trial9, trial10, trial11, 
//                         trial12, trial13, trial14, trial15, trial16, 
//                         trial17, trial18, trial19, trial20])

// var ver_2_trials = shuffle([trial21, trial22, trial23, trial24, trial25,
//                             trial26, trial27, trial28, trial29, trial30,
//                             trial31, trial32, trial33, trial34])

var all_trials = shuffle([trial7, trial8, trial9, trial10, trial11, trial12, trial13, trial14, trial15,
  trial16, trial17, trial18, trial19, trial20, trial21, trial22, trial23, trial24, trial25,
  trial26, trial27, trial28, trial29, trial30, trial31, trial31, trial33, trial34, trial35, trial36])

var trials = [];

for (i = 0; i < all_trials.length; i++) {
  tr = all_trials[i];
  for (k = 0; k < tr.length; k++) {
    trials.push(tr[k]);
  }
}

// HELPER FUNCTIONS
// Shows slides. We're using jQuery here - the **$** is the jQuery selector function, which takes as input either a DOM element or a CSS selector string.
function showSlide(id) {
  // Hide all slides
  $('html,body').scrollTop(0);
	$(".slide").hide();3
	// Show just the slide we want to show
	$("#"+id).show();
}

// Shuffle array
function shuffle(array) {
  var currentIndex = array.length, temporaryValue, randomIndex ;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}

//Update text input
function updateTextInput(val,ID) {
   document.getElementById(ID).value=val;
   rating = document.getElementById(ID).value;
}

function showTrialPic(trialname) {

  var newSlide = $('<div/>', {
      id: 'trial'+trialname,
      class: "slide",
  });

SlideName = 'trial'+trialname;

    var imageDiv = $('<div/>', {
        id: 'trial' + trialname,
        class: "trial",
    });

    imageDiv.html('<div style="width: 500px; margin: 0 auto; text-align: center; padding: 20px 15px 10px 10px"></div>\n' +
    //'<center> <a href = "http://web.stanford.edu/~masaba/TEDEstimation/"\n' +
    '<center><img src="http://web.stanford.edu/~masaba/Estimation/images/trial_pictures/'+trialname+'.jpg" height="300" width="600" alt="Stanford University"</center>\n');
      newSlide.append(imageDiv);

      var QuestionDiv = $('<div/>', {
        id: 'question' + trialname,
        class: "question",
    });

    QuestionDiv.html('<div style="width: 500px; margin: 0 auto; text-align: center; padding: 20px 15px 10px 10px"></div>\n' +
                          '<p class="block-text"><center>How <b>difficult</b> would it be to build this structure?</center></p></div>');
newSlide.append(QuestionDiv);
   
      var ScaleDiv = $('<div/>', {
        id: 'scale' + trialname,
        class: 'scale',
    });

  ScaleDiv.html('<div style="width: 800px; margin: 0 auto; text-align: center; "></div>\n' +
    '<td><nobr><class="block-text"><center><b>easy</b>&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp<b>difficult</nobr></b></td></span>\n'+
    '<base href="https://user-content-dot-custom-elements.appspot.com/PolymerElements/paper-slider/v1.0.14/paper-slider/">\n'+
    //'<script src="https://user-content-dot-custom-elements.appspot.com/PolymerElements/paper-slider/v1.0.14/paper-slider/webcomponentsjs/webcomponents-lite.js"></script>\n'+
        '<script src="../webcomponentsjs/webcomponents-lite.js"></script>\n'+
   '<link rel="import" href="paper-slider.html">\n'+
    '<center><paper-slider id="slider'+trialname+'" width="500" min="0" max="100" value="50" markers=[0,100] pin value = "aria-valuenow" editable maxMarkers=5></paper-slider></center><br><br>\n'+
    '<style is="custom-style">\n'+
        'paper-slider{\n'+
          '--paper-slider-container-color: var(--paper-grey-400);\n'+ 
          '--paper-slider-knob-color: var(--paper-blue-500);\n'+
          '--paper-slider-active-color: var(--paper-grey-400);\n'+
          '--paper-slider-height: 10px;\n'+
          'width: 600px;}</style>');
  
  newSlide.append(ScaleDiv);

      var CounterDiv = $('<div/>', {
        id: 'counter' + trialname,
        class: "counter",
    });

  CounterDiv.html('<div style="width: 500px; margin: 0 auto; text-align: center; padding: 20px 15px 10px 10px"></div>\n' +
                      '<p class="block-text"><center>'+(experiment.order_trials.length+1)+'/60 Trials</div>');

newSlide.append(CounterDiv);


  var ButtonDiv = $('<div/>', {
        id: 'button',
        class: 'button',
    });

  ButtonDiv.html('<button type="button" onclick="this.blur(); saveEstimate();">Continue</button>');
newSlide.append(ButtonDiv);

var errorMessDiv = $('<div/>', {
        id: 'errorMessage' + trialname,
        class: 'errorMessage',
    });

  errorMessDiv.html('<div <tr><td align="center">\n' +
      '<center><div id="error_att'+trialname+'"></div></center>\n' +
      '</td></tr>\n' +
      '<br><br>');

newSlide.append(errorMessDiv);

$("body").append(newSlide);
showSlide(SlideName);

}

function saveEstimate() {
slidstring = "slider";
element = slidstring.concat(experiment.curr_trial);
estimate = document.getElementById(element).value;

errorId = "#error_att";
errorIdTrial = errorId.concat(experiment.curr_trial);

if (estimate == 0) {
     $(errorIdTrial).html('<font color="red">' + 
           'Please make a response!' + 
           '</font>');
}

else {
experiment.trial_responses.push(estimate);
experiment.order_trials.push(experiment.curr_trial);
experiment.next();
}
}

function submitDemographics(){
  data = $('#demographicsForm').serializeArray();  
  experiment.demographics.push(data);
  experiment.end();
}

//MAIN EXPERIMENT
showSlide("instructions");

var experiment = {

  // An array to store the data that we're collecting.
  order_trials: [],
  practice_left: practice_trials,
  trials_left: trials,
  trial_responses: [],
  demographics: [],
  curr_trial: '',
  // The function that gets called when the sequence is finished.

next: function() {

if (experiment.trials_left.length == 0) {
showSlide("demographics");
}

else if (experiment.practice_left.length > 0) {
experiment.curr_trial = experiment.practice_left.shift();
showSlide(experiment.curr_trial);
}

else {
experiment.curr_trial = experiment.trials_left.shift();
showTrialPic(experiment.curr_trial);
}
},

end: function() {
    // Show the finish slide.
    showSlide("finished");
    // Wait 1.5 seconds and then submit the whole experiment object to Mechanical Turk (mmturkey filters out the functions so we know we're just submitting properties [i.e. data])
    // setTimeout(function() { turk.submit(experiment) }, 1500);
    turk.submit(experiment)
   // $.post("http://localhost:8888", JSON.stringify(experiment));
  },
}
