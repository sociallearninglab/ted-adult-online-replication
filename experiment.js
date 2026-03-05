/* ==================== CONFIGURATION ==================== */
const DATAPIPE_EXPERIMENT_ID = 'H8x9hsd4OeZC';
const TESTING_MODE = false;        // Set to true to force a specific condition
const FORCED_CONDITION = 'diff';   // 'time' or 'diff' — only used when TESTING_MODE = true

/* ==================== CONDITION ASSIGNMENT ==================== */
const urlParams = new URLSearchParams(window.location.search);
let condition;

if (TESTING_MODE) {
    condition = FORCED_CONDITION;
} else if (urlParams.has('condition')) {
    condition = urlParams.get('condition');
} else {
    condition = Math.random() < 0.5 ? 'time' : 'diff';
}

// Update URL to reflect condition
const newUrl = new URL(window.location);
newUrl.searchParams.set('condition', condition);
window.history.replaceState({}, '', newUrl);

/* ==================== CONDITION-SPECIFIC TEXT ==================== */
const conditionConfig = {
    diff: {
        taskDescription: 'judge how <b>difficult</b> it would be to build each structure from start to finish',
        trialQuestion: 'How <b>difficult</b> would it be to build this structure?',
        sliderLabels: ['easy', 'difficult'],
        warmupEasy: 'This is an example of an <b>easy</b> structure to build.',
        warmupHard: 'This is an example of a <b>difficult</b> structure to build.',
        scaleDescription: 'You will use a sliding scale from 0 (easy) to 100 (difficult) to mark your answer. You must drag the slider to respond.',
    },
    time: {
        taskDescription: 'estimate the <b>time</b> it would take to build each structure from start to finish',
        trialQuestion: 'How <b>long</b> would it take to build this structure?',
        sliderLabels: ['0 seconds', '100 seconds'],
        warmupEasy: 'This is an example of a structure that would be <b>quick</b> to build.',
        warmupHard: 'This is an example of a structure that would take a <b>long time</b> to build.',
        scaleDescription: 'You will use a sliding scale from 0 seconds to 100 seconds to mark your answer. You must drag the slider to respond.',
    }
};

const config = conditionConfig[condition];

/* ==================== INITIALIZE JSPSYCH ==================== */
const jsPsych = initJsPsych({
    show_progress_bar: true,
    auto_update_progress_bar: false,
    on_finish: function () {
        saveAllData();
    }
});

const subject_id = jsPsych.randomization.randomID(10);
const filename = `${subject_id}.csv`;

jsPsych.data.addProperties({
    subject_id: subject_id,
    condition: condition,
});

/* ==================== DATA SAVING ==================== */
let saveCount = 0;

function saveAllData() {
    saveCount++;
    const data = jsPsych.data.get().csv();
    const saveName = saveCount === 1 ? filename : `${subject_id}_${saveCount}.csv`;
    fetch('https://pipe.jspsych.org/api/data/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': '*/*' },
        body: JSON.stringify({
            experimentID: DATAPIPE_EXPERIMENT_ID,
            filename: saveName,
            data: data
        })
    });
}

// Attempt to save on page close
window.addEventListener('beforeunload', function () {
    saveCount++;
    const data = jsPsych.data.get().csv();
    const blob = new Blob([JSON.stringify({
        experimentID: DATAPIPE_EXPERIMENT_ID,
        filename: `${subject_id}_${saveCount}.csv`,
        data: data
    })], { type: 'application/json' });
    navigator.sendBeacon('https://pipe.jspsych.org/api/data/', blob);
});

/* ==================== GENERATE TRIAL LIST ==================== */
// Main trials: structures 7-36, each with _1 and _2 variants
const trialPairs = [];
for (let i = 7; i <= 36; i++) {
    trialPairs.push(jsPsych.randomization.shuffle([`${i}_1`, `${i}_2`]));
}
const shuffledPairs = jsPsych.randomization.shuffle(trialPairs);
const mainTrialList = shuffledPairs.flat();

// Warmup trials: 37_1 and 37_2, shuffled order
const warmupOrder = jsPsych.randomization.shuffle(['37_1', '37_2']);

// All image paths for preloading
const allImages = mainTrialList.map(t => `stim_files/${t}.jpg`)
    .concat(warmupOrder.map(t => `stim_files/${t}.jpg`))
    .concat(['src/lab_logo.png']);

/* ==================== TIMELINE ==================== */
const timeline = [];

// 1. Preload images
timeline.push({
    type: jsPsychPreload,
    images: allImages,
});

// 2. Consent
timeline.push({
    type: jsPsychHtmlButtonResponse,
    stimulus: `
        <div class="consent-container">
            <div style="text-align: center; margin-bottom: 20px;">
                <img src="src/lab_logo.png" height="80">
            </div>
            <p>By agreeing to take part in this research, you agree to view and rate a series of block structures. This experiment will take approximately 10 minutes to complete.</p>
            <p>By answering the following questions, you are participating in a study being performed by cognitive scientists in the Stanford Department of Psychology. If you have questions about this research, please contact us at <a href="mailto:sociallearninglab@stanford.edu">sociallearninglab@stanford.edu</a>.</p>
            <p>You must be at least 18 years old to participate. Your participation in this research is voluntary. You may decline to answer any or all of the following questions. You may decline further participation, at any time, without adverse consequences. Your anonymity is assured; the researchers who have requested your participation will not receive any personal information about you.</p>
        </div>
    `,
    choices: ['I AGREE'],
    data: { trial_type_custom: 'consent' },
    on_finish: function () {
        document.documentElement.requestFullscreen().catch(() => {});
    }
});

// 3. Instructions
timeline.push({
    type: jsPsychHtmlButtonResponse,
    stimulus: `
        <div class="instruction-container">
            <p>Welcome to the experiment! In this game, you will view a series of block structures. For each structure, you will see a "START" picture and a "FINISH" picture.</p>
            <p>Your task is to ${config.taskDescription}.</p>
            <p>Click the button below when you are ready to begin.</p>
        </div>
    `,
    choices: ['Start'],
    data: { trial_type_custom: 'instructions' },
});

// 4. Partial-start explanation
timeline.push({
    type: jsPsychHtmlButtonResponse,
    stimulus: `
        <div class="instruction-container">
            <p>Sometimes at START, the structure will be partially made already. Please look carefully at both photos!</p>
        </div>
    `,
    choices: ['Next'],
    data: { trial_type_custom: 'example_init' },
});

// 5. Scale explanation
timeline.push({
    type: jsPsychHtmlButtonResponse,
    stimulus: `
        <div class="instruction-container">
            <p>${config.scaleDescription}</p>
            <p>Here is an example of what you will see on each trial.</p>
        </div>
    `,
    choices: ['Next'],
    data: { trial_type_custom: 'example_intro' },
});

// 6. Warmup trials (37_1 and 37_2 in shuffled order)
warmupOrder.forEach(trial => {
    const isEasy = trial === '37_1';
    timeline.push({
        type: jsPsychHtmlButtonResponse,
        stimulus: `
            <div class="trial-container" style="text-align: center;">
                <img src="stim_files/${trial}.jpg" class="trial-image">
                <p>${isEasy ? config.warmupEasy : config.warmupHard}</p>
            </div>
        `,
        choices: ['Next'],
        data: { trial_type_custom: 'warmup', stimulus_id: trial },
    });
});

// 7. Main trials (60 total)
const totalMainTrials = mainTrialList.length;
let trialsSinceLastSave = 0;

mainTrialList.forEach((trial, index) => {
    timeline.push({
        type: jsPsychHtmlSliderResponse,
        stimulus: `
            <div class="trial-container" style="text-align: center;">
                <img src="stim_files/${trial}.jpg" class="trial-image">
                <p>${config.trialQuestion}</p>
            </div>
        `,
        labels: config.sliderLabels,
        min: 0,
        max: 100,
        slider_start: 50,
        require_movement: true,
        slider_width: 500,
        button_label: 'Continue',
        data: {
            trial_type_custom: 'rating',
            stimulus_id: trial,
            trial_number: index + 1,
        },
        on_finish: function () {
            // Update progress bar
            jsPsych.setProgressBar((index + 1) / totalMainTrials);

            // Incremental save every 10 trials
            trialsSinceLastSave++;
            if (trialsSinceLastSave >= 10) {
                saveAllData();
                trialsSinceLastSave = 0;
            }
        }
    });
});

// 8. Demographics
timeline.push({
    type: jsPsychSurveyHtmlForm,
    preamble: '<p>Finally, we have a few demographic questions for you.</p>',
    html: `
        <p>How old are you? <input type="text" name="age" size="5" required></p>
        <p>What is your native/first language? <input type="text" name="language" size="20" required></p>
        <p>What is your ethnicity?
            <select name="ethnicity" required>
                <option value="">-- Select --</option>
                <option value="white">White</option>
                <option value="hispanic">Hispanic or Latino</option>
                <option value="asian">Asian/Pacific Islander</option>
                <option value="black">Black or African American</option>
                <option value="native">Native American</option>
                <option value="other">Other</option>
            </select>
        </p>
        <p>What is your gender?
            <select name="gender" required>
                <option value="">-- Select --</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
            </select>
        </p>
        <p>Do you have any colorblindness? <input type="text" name="colorblind" size="20"></p>
        <p>Were you able to focus throughout the experiment?
            <select name="focus" required>
                <option value="">-- Select --</option>
                <option value="yes">Yes</option>
                <option value="no">No</option>
                <option value="kind of">Kind of</option>
            </select>
        </p>
        <p>Did you run into any issues? <input type="text" name="issues" size="40"></p>
    `,
    button_label: 'Submit',
    data: { trial_type_custom: 'demographics' },
});

// 9. End screen
timeline.push({
    type: jsPsychHtmlButtonResponse,
    stimulus: `
        <div class="end-container">
            <p>You're finished - thanks for participating!</p>
            <p>Your data has been saved. You may now close this window.</p>
        </div>
    `,
    choices: ['Close'],
    data: { trial_type_custom: 'end' },
    on_load: function () {
        saveAllData();
    }
});

// Run the experiment
jsPsych.run(timeline);
