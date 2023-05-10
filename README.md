# Building UI for Pomodoro timer application using AI experiment

## Terminology

App-description - the description of desired app that AI should build
AI-node - is some AI with specific purpose, has `system` and/or `assistant` message in order to make output result more specific

## AI-nodes
### Clarity-node
An `AI-node` that has a purpose to take `app-description` as an input and outputs with updated input which should be clearer and concise. Each change of the original input should be explained at the very end of the output text. The `AI-node` should also suggest what user need to clarify in order to have desired result.

### Style-primitivist-node
An `AI-node` that creates primitive black and white schematic elements but with configurable interface

## Initial app description
We are building pomodoro timer widget. It is a react component that has multiple visual states and elements.

The widget has the following visual states (name - description):
 - initial - initial state of the widget
 - working - timer is started
 - paused - timer is paused
 - finished-working - selected timer time is exceeded, timer displays how much time is extra, user has an option to rest 0, 5, 10, 15 minutes
 - resting - user choose one of the resting timer options: 5, 10, 15 - user sees timer countdown accordingly
 - finished-resting - chosen resting time countdown by user is exceeded, timer displays how much time is extra

The main element of the widget is the timer sector which consists of time counter and widget state status text. The sector is outlined by the thin border with rounded corner and nice padding.  Time counter has the following format: minutes plus dot plus seconds, initially it looks like 00.00. There should be always two digits for seconds and at least 2 for minutes that means if we value is less then 10 we should have zero/zeros sign instead of value for minutes or seconds.

The state status text displaying one of the following widget states, next the list of states will be provided as state - status_name:
 - initial - New pomodoro!
 - working - Working
 - paused - Paused
 - finished-working - Finished working
 - resting - Resting
 - finished-resting - Finished resting

Except the timer sector app has different elements presence of which is depending on the current state:

- Timer option button - looks like square with a digit at the center. Corners are little bit rounded. On mouse hover this button should have little bit highlighted background
- Control button - looks like rectangular with a text at the center. Corners are little bit rounded. On mouse hover this button should have little bit highlighted background

Timer option buttons and control buttons appears in the widget below the timer sector depends on current status.
 - initial - no control button but have a three timer option buttons placed in one row horizontally with values: 20, 25, 30 - click on the element will transition app state from `initial` to `working` with timer set according to the chosen button value
 - working - no timer option buttons but have two control buttons placed in one row horizontally with names: "STOP" and "PAUSE" - click on the stop button returns the app in `initial` state, click on "PAUSE" button moving app to `paused` state
 - paused - no timer option buttons but have two control buttons placed in one row horizontally with names: "STOP" and "RESUME" - click on the stop button returns the app in `initial` state, click on "RESUME" button returning app to `working` state
 - finished-working - has an extra title with text `Choose rest minutes` and four timer option buttons placed in one row horizontally with values: 0, 5, 10, 15 - click on the element will transition app state from `finished-working` to `resting` with timer set according to the chosen button with an exception of 0 - if user clicks on 0 app will transition to `initial` state directly
 - resting - has only one control button named `SKIP` click on which transitioning app into `initial state`
 - finished-resting - has only one control button named `START NEW` click on which transitioning app into `initial state`
