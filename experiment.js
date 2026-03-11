// config
const DATAPIPE_EXPERIMENT_ID = 'H8x9hsd4OeZC';
const TESTING_MODE = true;       // force a condition for testing
const FORCED_CONDITION = 'diff';  // 'time' or 'diff' — only when TESTING_MODE is true
const TURNSTILE_SITE_KEY = '0x4AAAAAACm5Uv12VL36op0J';
const VERIFY_WORKER_URL = 'https://ted-verify.sll-stanford.workers.dev';
const PROLIFIC_REDIRECT_URL = 'https://app.prolific.com/submissions/complete?cc=XXXXXXX'; // swap in your completion code

// condition assignment
const urlParams = new URLSearchParams(window.location.search);
let condition;

if (TESTING_MODE) {
    condition = FORCED_CONDITION;
} else if (urlParams.has('condition')) {
    condition = urlParams.get('condition');
} else {
    condition = Math.random() < 0.5 ? 'time' : 'diff';
}

// put condition in url
const newUrl = new URL(window.location);
newUrl.searchParams.set('condition', condition);
window.history.replaceState({}, '', newUrl);

// prolific url params
const prolific_pid = urlParams.get('PROLIFIC_PID') || '';
const study_id = urlParams.get('STUDY_ID') || '';
const session_id = urlParams.get('SESSION_ID') || '';

// condition-specific wording
const conditionConfig = {
    diff: {
        taskDescription: 'judge how <b>difficult</b> it would be to build each structure from start to finish',
        trialQuestion: 'How <b>difficult</b> would it be to build this structure?',
        sliderLabels: ['easy', 'difficult'],
        warmupEasy: 'This is an example of an <b>easy</b> structure to build.',
        warmupHard: 'This is an example of a <b>difficult</b> structure to build.',
        scaleDescription: 'You will use a sliding scale from 0 (easy) to 100 (difficult) to mark your answer.</p><p>You can drag the circle to respond.',
        exampleFinal: 'stim_files/Example_Final_Diff_Screenshot.png',
        exampleInitial: 'stim_files/Example_Initial_Diff_Screenshot.png',
    },
    time: {
        taskDescription: 'estimate the <b>time</b> it would take to build each structure from start to finish',
        trialQuestion: 'How <b>long</b> would it take to build this structure?',
        sliderLabels: ['0 seconds', '100 seconds'],
        warmupEasy: 'This is an example of a structure that would be <b>quick</b> to build.',
        warmupHard: 'This is an example of a structure that would take a <b>long time</b> to build.',
        scaleDescription: 'You will use a sliding scale from 0 seconds to 100 seconds to mark your answer.</p><p>You can drag the circle to respond.',
        exampleFinal: 'stim_files/Example_Final_Time_Screenshot.png',
        exampleInitial: 'stim_files/Example_Initial_Time_Screenshot.png',
    }
};

const config = conditionConfig[condition];

// init jspsych
const jsPsych = initJsPsych({
    show_progress_bar: true,
    auto_update_progress_bar: false,
    on_finish: function () {
        saveAllData();
        // redirect to prolific
        window.location.href = PROLIFIC_REDIRECT_URL;
    }
});

const subject_id = jsPsych.randomization.randomID(10);
const filename = `${subject_id}.csv`;

// attach to all rows
jsPsych.data.addProperties({
    subject_id: subject_id,
    condition: condition,
    prolific_pid: prolific_pid,
    study_id: study_id,
    session_id: session_id,
});

// data saving
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

// backup save on tab close
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

// trial list — structures 7-36, each w/ _1 and _2
const trialPairs = [];
for (let i = 7; i <= 36; i++) {
    trialPairs.push(jsPsych.randomization.shuffle([`${i}_1`, `${i}_2`]));
}
const shuffledPairs = jsPsych.randomization.shuffle(trialPairs);
const mainTrialList = shuffledPairs.flat();

// warmups shuffled
const warmupOrder = jsPsych.randomization.shuffle(['37_1', '37_2']);

// preload imgs
const allImages = mainTrialList.map(t => `stim_files/${t}.jpg`)
    .concat(warmupOrder.map(t => `stim_files/${t}.jpg`))
    .concat([config.exampleFinal, config.exampleInitial, 'src/lab_logo.png']);

// timeline
const timeline = [];

// preload imgs
timeline.push({
    type: jsPsychPreload,
    images: allImages,
});

// captcha
const captcha_data = {};
timeline.push({
    type: jsPsychHtmlKeyboardResponse,
    stimulus: '',
    on_load: function () {
        const progressBar = document.getElementById('jspsych-progressbar-container');
        if (progressBar) progressBar.style.visibility = 'hidden';
        const container = document.getElementById('captcha-container');
        const btn = document.getElementById('captcha-proceed');
        const widgetTarget = document.getElementById('turnstile-widget');
        container.style.display = 'block';
        let attempts = 0;
        const maxAttempts = 50;
        function tryRender() {
            if (typeof turnstile !== 'undefined') {
                turnstile.render('#turnstile-widget', {
                    sitekey: TURNSTILE_SITE_KEY,
                    callback: async function (token) {
                        captcha_data.token = token;
                        if (VERIFY_WORKER_URL) {
                            try {
                                const res = await fetch(VERIFY_WORKER_URL, {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ token }),
                                });
                                const v = await res.json();
                                captcha_data.server_verified = v.success;
                                captcha_data.challenge_ts = v.challenge_ts;
                                captcha_data.hostname = v.hostname;
                                captcha_data.verify_error_codes = v.error_codes;
                            } catch (err) {
                                captcha_data.server_verified = null;
                                captcha_data.verify_error = err.message;
                            }
                        }
                        btn.style.display = 'inline-block';
                    },
                    'error-callback': function (errorCode) {
                        captcha_data.errorCode = errorCode;
                        widgetTarget.innerHTML =
                            '<p style="color: #b22222;">Verification error. Please try reloading the page.</p>';
                    }
                });
            } else if (attempts < maxAttempts) {
                attempts++;
                setTimeout(tryRender, 100);
            } else {
                widgetTarget.innerHTML =
                    '<p style="color: #b22222; font-weight: bold;">' +
                    'Security verification failed to load.<br>' +
                    'Please disable any ad blockers for this page and reload.' +
                    '</p>';
            }
        }
        tryRender();
        btn.onclick = () => {
            container.style.display = 'none';
            if (progressBar) progressBar.style.visibility = 'visible';
            jsPsych.finishTrial(captcha_data);
        };
    },
    data: { trial_type_custom: 'captcha' },
});

// consent
timeline.push({
    type: jsPsychHtmlButtonResponse,
    stimulus: `
        <div class="consent-container">
            <div style="text-align: center; margin-bottom: 20px;">
                <img src="src/lab_logo.png" height="80">
            </div>
            <p>By agreeing to take part in this research, you agree to view and rate a series of block structures. This experiment will take approximately X minutes to complete.</p>
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

// instructions
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

// scale explanation
timeline.push({
    type: jsPsychHtmlButtonResponse,
    stimulus: `
        <div class="instruction-container" style="text-align: center;">
            <p>${config.scaleDescription}</p>
            <p>Here is an example of what you will see on each trial:</p>
            <img src="${config.exampleFinal}" class="trial-image">
        </div>
    `,
    choices: ['Next'],
    data: { trial_type_custom: 'example_intro' },
});

// partial-start note
timeline.push({
    type: jsPsychHtmlButtonResponse,
    stimulus: `
        <div class="instruction-container" style="text-align: center;">
            <p>Sometimes at START, the structure will be partially made already. Please look carefully at both photos!</p>
            <img src="${config.exampleInitial}" class="trial-image">
        </div>
    `,
    choices: ['Next'],
    data: { trial_type_custom: 'example_init' },
});

// warmups
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

// transition to main trials
timeline.push({
    type: jsPsychHtmlButtonResponse,
    stimulus: `
        <div class="instruction-container" style="text-align: center;">
            <p>You are now ready to begin.</p>
            <p>Please click continue to start.</p>
        </div>
    `,
    choices: ['Continue'],
    data: { trial_type_custom: 'begin_main' },
});

// main trials
const totalMainTrials = mainTrialList.length;
let trialsSinceLastSave = 0;

let _currentArrowHandler = null;

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
        on_load: function () {
            const slider = document.getElementById('jspsych-html-slider-response-response');
            const suffix = condition === 'time' ? 's' : '';

            // editable number input synced with slider
            const input = document.createElement('input');
            input.type = 'number';
            input.id = 'slider-value-input';
            input.min = 0;
            input.max = 100;
            input.value = slider.value;
            input.style.cssText = 'font-size: 18px; font-weight: 600; color: #2c3e50; display: block; margin: 8px auto 0; padding: 4px 8px; border: 1px solid #ccc; border-radius: 6px; background: #f9f9f9; width: 80px; text-align: center;';
            slider.parentNode.insertBefore(input, slider.nextSibling.nextSibling);

            if (suffix) {
                const suffixLabel = document.createElement('span');
                suffixLabel.textContent = suffix;
                suffixLabel.style.cssText = 'font-size: 16px; color: #555; margin-left: 4px;';
                input.insertAdjacentElement('afterend', suffixLabel);
            }

            // slider → input (covers drag)
            slider.addEventListener('input', function () {
                input.value = this.value;
            });

            // input → slider
            input.addEventListener('input', function () {
                let val = parseInt(this.value, 10);
                if (isNaN(val)) return;
                val = Math.max(0, Math.min(100, val));
                slider.value = val;
                this.value = val;
                slider.dispatchEvent(new Event('input', { bubbles: true }));
                slider.dispatchEvent(new Event('change', { bubbles: true }));
            });

            // arrow keys: jsPsych steals focus to BODY, so we intercept at
            // capture phase on document and programmatically update the slider
            if (_currentArrowHandler) {
                document.removeEventListener('keydown', _currentArrowHandler, true);
            }
            _currentArrowHandler = function (e) {
                if (document.activeElement === input) return;
                if (!['ArrowLeft', 'ArrowDown', 'ArrowRight', 'ArrowUp'].includes(e.key)) return;

                e.preventDefault();
                e.stopPropagation();
                let val = parseInt(slider.value, 10);
                if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') val = Math.max(0, val - 1);
                if (e.key === 'ArrowRight' || e.key === 'ArrowUp') val = Math.min(100, val + 1);
                slider.value = val;
                input.value = val;
                slider.dispatchEvent(new Event('input', { bubbles: true }));
                slider.dispatchEvent(new Event('change', { bubbles: true }));
            };
            document.addEventListener('keydown', _currentArrowHandler, true);
        },
        data: {
            trial_type_custom: 'rating',
            stimulus_id: trial,
            trial_number: index + 1,
        },
        on_finish: function () {
            // clean up arrow key handler
            if (_currentArrowHandler) {
                document.removeEventListener('keydown', _currentArrowHandler, true);
                _currentArrowHandler = null;
            }

            jsPsych.progressBar.progress = (index + 1) / totalMainTrials;

            // save every 10
            trialsSinceLastSave++;
            if (trialsSinceLastSave >= 10) {
                saveAllData();
                trialsSinceLastSave = 0;
            }
        }
    });
});

// demographics (optional)
timeline.push({
    type: jsPsychSurveyHtmlForm,
    preamble: '<p>Finally, we have a few demographic questions for you.</p>',
    html: `
        <p>How old are you? <input type="text" name="age" size="5"></p>
        <p>What is your native/first language? <input type="text" name="language" size="20"></p>
        <p>What is your ethnicity?
            <select name="ethnicity">
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
            <select name="gender">
                <option value="">-- Select --</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
            </select>
        </p>
        <p>Do you have any colorblindness? <input type="text" name="colorblind" size="20"></p>
        <p>Were you able to focus throughout the experiment?
            <select name="focus">
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

// end screen
timeline.push({
    type: jsPsychHtmlButtonResponse,
    stimulus: `
        <div class="end-container">
            <p>You're finished - thanks for participating!</p>
            <p>Redirecting you back to Prolific...</p>
        </div>
    `,
    choices: ['Complete'],
    data: { trial_type_custom: 'end' },
    on_load: function () {
        saveAllData();
    }
});

// run
jsPsych.run(timeline);
