// Constants and utility functions
const DIRECTION = {
    LEFT: 'L',
    RIGHT: 'R',
    STAY: 'S'
};

// Global variables
let turingMachine = {
    states: [],
    inputAlphabet: [],
    tapeAlphabet: [],
    transitions: {},
    initialState: '',
    acceptState: '',
    rejectState: '',
    blankSymbol: 'B'
};

let simulationState = {
    tape: [],
    currentState: '',
    headPosition: 0,
    isRunning: false,
    isPaused: false,
    stepCount: 0,
    speed: 500, // milliseconds between steps
    history: []
};

// Example machines
const exampleMachines = {
    palindrome: {
        name: "Palindrome Checker",
        description: "This machine checks if a binary string is a palindrome (reads the same forwards and backwards).",
        states: ["q0", "q1", "q2", "q3", "q4", "qAccept", "qReject"],
        inputAlphabet: ["0", "1"],
        tapeAlphabet: ["0", "1", "X", "Y", "B"],
        initialState: "q0",
        acceptState: "qAccept",
        rejectState: "qReject",
        blankSymbol: "B",
        transitions: {
            "q0,0": { nextState: "q1", writeSymbol: "X", moveDirection: "R" },
            "q0,1": { nextState: "q2", writeSymbol: "Y", moveDirection: "R" },
            "q0,X": { nextState: "q3", writeSymbol: "X", moveDirection: "R" },
            "q0,Y": { nextState: "q3", writeSymbol: "Y", moveDirection: "R" },
            "q0,B": { nextState: "qAccept", writeSymbol: "B", moveDirection: "S" },
            
            "q1,0": { nextState: "q1", writeSymbol: "0", moveDirection: "R" },
            "q1,1": { nextState: "q1", writeSymbol: "1", moveDirection: "R" },
            "q1,X": { nextState: "q1", writeSymbol: "X", moveDirection: "R" },
            "q1,Y": { nextState: "q1", writeSymbol: "Y", moveDirection: "R" },
            "q1,B": { nextState: "q4", writeSymbol: "B", moveDirection: "L" },
            
            "q2,0": { nextState: "q2", writeSymbol: "0", moveDirection: "R" },
            "q2,1": { nextState: "q2", writeSymbol: "1", moveDirection: "R" },
            "q2,X": { nextState: "q2", writeSymbol: "X", moveDirection: "R" },
            "q2,Y": { nextState: "q2", writeSymbol: "Y", moveDirection: "R" },
            "q2,B": { nextState: "q3", writeSymbol: "B", moveDirection: "L" },
            
            "q3,0": { nextState: "qReject", writeSymbol: "0", moveDirection: "S" },
            "q3,1": { nextState: "qReject", writeSymbol: "1", moveDirection: "S" },
            "q3,X": { nextState: "q3", writeSymbol: "X", moveDirection: "L" },
            "q3,Y": { nextState: "q3", writeSymbol: "Y", moveDirection: "L" },
            "q3,B": { nextState: "q0", writeSymbol: "B", moveDirection: "R" },
            
            "q4,0": { nextState: "qReject", writeSymbol: "0", moveDirection: "S" },
            "q4,1": { nextState: "qReject", writeSymbol: "1", moveDirection: "S" },
            "q4,X": { nextState: "q0", writeSymbol: "X", moveDirection: "R" },
            "q4,Y": { nextState: "qReject", writeSymbol: "Y", moveDirection: "S" },
            "q4,B": { nextState: "qAccept", writeSymbol: "B", moveDirection: "S" }
        },
        inputString: "0110"
    },
    
    evenBinary: {
        name: "Even Binary Numbers",
        description: "This machine accepts binary numbers that are even (end with 0).",
        states: ["q0", "qAccept", "qReject"],
        inputAlphabet: ["0", "1"],
        tapeAlphabet: ["0", "1", "B"],
        initialState: "q0",
        acceptState: "qAccept",
        rejectState: "qReject",
        blankSymbol: "B",
        transitions: {
            "q0,0": { nextState: "qAccept", writeSymbol: "0", moveDirection: "R" },
            "q0,1": { nextState: "qReject", writeSymbol: "1", moveDirection: "R" },
            "q0,B": { nextState: "qAccept", writeSymbol: "B", moveDirection: "S" }
        },
        inputString: "1010"
    },
    
    binaryAddition: {
        name: "Binary Addition",
        description: "This machine adds two binary numbers. Input format: first number, then #, then second number (e.g., 101#11).",
        states: ["q0", "q1", "q2", "q3", "q4", "q5", "q6", "q7", "qAccept", "qReject"],
        inputAlphabet: ["0", "1", "#"],
        tapeAlphabet: ["0", "1", "#", "X", "Y", "Z", "B"],
        initialState: "q0",
        acceptState: "qAccept",
        rejectState: "qReject",
        blankSymbol: "B",
        transitions: {
            "q0,0": { nextState: "q0", writeSymbol: "0", moveDirection: "R" },
            "q0,1": { nextState: "q0", writeSymbol: "1", moveDirection: "R" },
            "q0,#": { nextState: "q1", writeSymbol: "#", moveDirection: "R" },
            
            "q1,0": { nextState: "q1", writeSymbol: "0", moveDirection: "R" },
            "q1,1": { nextState: "q1", writeSymbol: "1", moveDirection: "R" },
            "q1,B": { nextState: "q2", writeSymbol: "B", moveDirection: "L" },
            
            "q2,0": { nextState: "q3", writeSymbol: "X", moveDirection: "L" },
            "q2,1": { nextState: "q4", writeSymbol: "Y", moveDirection: "L" },
            "q2,B": { nextState: "q7", writeSymbol: "B", moveDirection: "L" },
            
            "q3,0": { nextState: "q3", writeSymbol: "0", moveDirection: "L" },
            "q3,1": { nextState: "q3", writeSymbol: "1", moveDirection: "L" },
            "q3,#": { nextState: "q5", writeSymbol: "#", moveDirection: "L" },
            
            "q4,0": { nextState: "q4", writeSymbol: "0", moveDirection: "L" },
            "q4,1": { nextState: "q4", writeSymbol: "1", moveDirection: "L" },
            "q4,#": { nextState: "q6", writeSymbol: "#", moveDirection: "L" },
            
            "q5,0": { nextState: "q0", writeSymbol: "X", moveDirection: "R" },
            "q5,1": { nextState: "q0", writeSymbol: "Y", moveDirection: "R" },
            "q5,B": { nextState: "q0", writeSymbol: "0", moveDirection: "R" },
            
            "q6,0": { nextState: "q0", writeSymbol: "Y", moveDirection: "R" },
            "q6,1": { nextState: "q0", writeSymbol: "Z", moveDirection: "R" },
            "q6,B": { nextState: "q0", writeSymbol: "1", moveDirection: "R" },
            
            "q7,X": { nextState: "q7", writeSymbol: "0", moveDirection: "L" },
            "q7,Y": { nextState: "q7", writeSymbol: "1", moveDirection: "L" },
            "q7,Z": { nextState: "q7", writeSymbol: "0", moveDirection: "L" },
            "q7,#": { nextState: "qAccept", writeSymbol: "#", moveDirection: "L" }
        },
        inputString: "101#11"
    },
    
    copyString: {
        name: "String Copy Machine",
        description: "This machine copies a binary string separated by a # symbol.",
        states: ["q0", "q1", "q2", "q3", "q4", "qAccept", "qReject"],
        inputAlphabet: ["0", "1", "#"],
        tapeAlphabet: ["0", "1", "#", "X", "Y", "B"],
        initialState: "q0",
        acceptState: "qAccept",
        rejectState: "qReject",
        blankSymbol: "B",
        transitions: {
            "q0,0": { nextState: "q1", writeSymbol: "X", moveDirection: "R" },
            "q0,1": { nextState: "q2", writeSymbol: "Y", moveDirection: "R" },
            "q0,#": { nextState: "q4", writeSymbol: "#", moveDirection: "R" },
            
            "q1,0": { nextState: "q1", writeSymbol: "0", moveDirection: "R" },
            "q1,1": { nextState: "q1", writeSymbol: "1", moveDirection: "R" },
            "q1,#": { nextState: "q1", writeSymbol: "#", moveDirection: "R" },
            "q1,B": { nextState: "q3", writeSymbol: "0", moveDirection: "L" },
            
            "q2,0": { nextState: "q2", writeSymbol: "0", moveDirection: "R" },
            "q2,1": { nextState: "q2", writeSymbol: "1", moveDirection: "R" },
            "q2,#": { nextState: "q2", writeSymbol: "#", moveDirection: "R" },
            "q2,B": { nextState: "q3", writeSymbol: "1", moveDirection: "L" },
            
            "q3,0": { nextState: "q3", writeSymbol: "0", moveDirection: "L" },
            "q3,1": { nextState: "q3", writeSymbol: "1", moveDirection: "L" },
            "q3,#": { nextState: "q3", writeSymbol: "#", moveDirection: "L" },
            "q3,X": { nextState: "q0", writeSymbol: "X", moveDirection: "R" },
            "q3,Y": { nextState: "q0", writeSymbol: "Y", moveDirection: "R" },
            
            "q4,B": { nextState: "qAccept", writeSymbol: "B", moveDirection: "S" },
            "q4,0": { nextState: "q4", writeSymbol: "0", moveDirection: "R" },
            "q4,1": { nextState: "q4", writeSymbol: "1", moveDirection: "R" }
        },
        inputString: "101#"
    },
    
    threeZeros: {
        name: "Accept Strings with Three Zeros",
        description: "This machine accepts strings that contain exactly three 0s.",
        states: ["q0", "q1", "q2", "q3", "q4", "qAccept", "qReject"],
        inputAlphabet: ["0", "1"],
        tapeAlphabet: ["0", "1", "B"],
        initialState: "q0",
        acceptState: "qAccept",
        rejectState: "qReject",
        blankSymbol: "B",
        transitions: {
            "q0,0": { nextState: "q1", writeSymbol: "0", moveDirection: "R" },
            "q0,1": { nextState: "q0", writeSymbol: "1", moveDirection: "R" },
            "q0,B": { nextState: "qReject", writeSymbol: "B", moveDirection: "S" },
            
            "q1,0": { nextState: "q2", writeSymbol: "0", moveDirection: "R" },
            "q1,1": { nextState: "q1", writeSymbol: "1", moveDirection: "R" },
            "q1,B": { nextState: "qReject", writeSymbol: "B", moveDirection: "S" },
            
            "q2,0": { nextState: "q3", writeSymbol: "0", moveDirection: "R" },
            "q2,1": { nextState: "q2", writeSymbol: "1", moveDirection: "R" },
            "q2,B": { nextState: "qReject", writeSymbol: "B", moveDirection: "S" },
            
            "q3,0": { nextState: "q4", writeSymbol: "0", moveDirection: "R" },
            "q3,1": { nextState: "q3", writeSymbol: "1", moveDirection: "R" },
            "q3,B": { nextState: "qAccept", writeSymbol: "B", moveDirection: "S" },
            
            "q4,0": { nextState: "qReject", writeSymbol: "0", moveDirection: "S" },
            "q4,1": { nextState: "q4", writeSymbol: "1", moveDirection: "R" },
            "q4,B": { nextState: "qReject", writeSymbol: "B", moveDirection: "S" }
        },
        inputString: "10010"
    }
};

// DOM elements
const elements = {
    // Example elements
    exampleButtons: document.querySelectorAll('.example-btn'),
    exampleDescription: document.getElementById('example-description'),
    
    // Configuration elements
    tabButtons: document.querySelectorAll('.tab-btn'),
    tabContents: document.querySelectorAll('.tab-content'),
    statesInput: document.getElementById('states'),
    initialStateInput: document.getElementById('initial-state'),
    acceptStateInput: document.getElementById('accept-state'),
    rejectStateInput: document.getElementById('reject-state'),
    inputAlphabetInput: document.getElementById('input-alphabet'),
    tapeAlphabetInput: document.getElementById('tape-alphabet'),
    blankSymbolInput: document.getElementById('blank-symbol'),
    inputStringInput: document.getElementById('input-string'),
    transitionTable: document.getElementById('transition-table'),
    transitionBody: document.getElementById('transition-body'),
    addTransitionBtn: document.getElementById('add-transition'),
    saveMachineBtn: document.getElementById('save-machine'),
    loadMachineBtn: document.getElementById('load-machine'),
    clearMachineBtn: document.getElementById('clear-machine'),
    
    // Simulation elements
    tapeElement: document.getElementById('tape'),
    tapeLeftBtn: document.getElementById('tape-left'),
    tapeRightBtn: document.getElementById('tape-right'),
    currentStateElement: document.getElementById('current-state'),
    resetSimBtn: document.getElementById('reset-sim'),
    stepSimBtn: document.getElementById('step-sim'),
    playSimBtn: document.getElementById('play-sim'),
    pauseSimBtn: document.getElementById('pause-sim'),
    simSpeedInput: document.getElementById('sim-speed'),
    speedValueText: document.getElementById('speed-value'),
    statusElement: document.getElementById('status'),
    stepsCountElement: document.getElementById('steps-count'),
    currentTransitionElement: document.getElementById('current-transition-details'),
    executionHistoryElement: document.getElementById('execution-history'),
    
    // Visual elements
    visualTransitionTable: document.getElementById('visual-transition-table'),
    transitionAnimation: document.getElementById('transition-animation')
};

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    initializeEventListeners();
    initializeMachineFromInputs();
    initializeTabs();
    renderTransitionTable();
    initializeTape();
    updateVisualTransitionTable();
    initializeExampleButtons();
});

// Event listeners setup
function initializeEventListeners() {
    // Tab navigation
    elements.tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tabId = button.getAttribute('data-tab');
            
            // Remove active class from all tabs
            elements.tabButtons.forEach(btn => btn.classList.remove('active'));
            elements.tabContents.forEach(content => content.classList.remove('active'));
            
            // Add active class to current tab
            button.classList.add('active');
            document.getElementById(tabId).classList.add('active');
        });
    });
    
    // Configuration panel event listeners
    elements.addTransitionBtn.addEventListener('click', addTransitionRow);
    elements.saveMachineBtn.addEventListener('click', saveMachine);
    elements.loadMachineBtn.addEventListener('click', loadMachine);
    elements.clearMachineBtn.addEventListener('click', clearMachine);
    
    // Configuration inputs change listener
    const configInputs = [
        elements.statesInput, elements.initialStateInput, elements.acceptStateInput,
        elements.rejectStateInput, elements.inputAlphabetInput, elements.tapeAlphabetInput,
        elements.blankSymbolInput
    ];
    
    configInputs.forEach(input => {
        input.addEventListener('change', () => {
            initializeMachineFromInputs();
            updateVisualTransitionTable();
        });
    });
    
    // Simulation control event listeners
    elements.resetSimBtn.addEventListener('click', resetSimulation);
    elements.stepSimBtn.addEventListener('click', stepSimulation);
    elements.playSimBtn.addEventListener('click', startSimulation);
    elements.pauseSimBtn.addEventListener('click', pauseSimulation);
    elements.tapeLeftBtn.addEventListener('click', () => scrollTape(-5));
    elements.tapeRightBtn.addEventListener('click', () => scrollTape(5));
    
    // Simulation speed listener
    elements.simSpeedInput.addEventListener('input', updateSimulationSpeed);
    
    // Input string listener
    elements.inputStringInput.addEventListener('change', () => {
        resetSimulation();
    });
}

// Example machines
function initializeExampleButtons() {
    elements.exampleButtons.forEach(button => {
        button.addEventListener('click', () => {
            const exampleKey = button.getAttribute('data-example');
            loadExampleMachine(exampleKey);
        });
    });
}

function loadExampleMachine(exampleKey) {
    const example = exampleMachines[exampleKey];
    
    if (example) {
        // Show description
        elements.exampleDescription.innerHTML = `
            <h3>${example.name}</h3>
            <p>${example.description}</p>
            <button id="load-example" class="btn success-btn">
                <i class="fas fa-download"></i> Load This Example
            </button>
        `;
        
        // Add event listener to the load button
        document.getElementById('load-example').addEventListener('click', () => {
            // Update all configuration fields
            elements.statesInput.value = example.states.join(', ');
            elements.initialStateInput.value = example.initialState;
            elements.acceptStateInput.value = example.acceptState;
            elements.rejectStateInput.value = example.rejectState;
            elements.inputAlphabetInput.value = example.inputAlphabet.join(', ');
            elements.tapeAlphabetInput.value = example.tapeAlphabet.join(', ');
            elements.blankSymbolInput.value = example.blankSymbol;
            elements.inputStringInput.value = example.inputString;
            
            // Update machine configuration
            turingMachine.states = example.states;
            turingMachine.initialState = example.initialState;
            turingMachine.acceptState = example.acceptState;
            turingMachine.rejectState = example.rejectState;
            turingMachine.inputAlphabet = example.inputAlphabet;
            turingMachine.tapeAlphabet = example.tapeAlphabet;
            turingMachine.blankSymbol = example.blankSymbol;
            turingMachine.transitions = example.transitions;
            
            // Clear existing transition rows
            elements.transitionBody.innerHTML = '';
            
            // Create transition rows
            Object.entries(example.transitions).forEach(([key, transition]) => {
                const [currentState, currentSymbol] = key.split(',');
                
                const row = document.createElement('tr');
                
                // Current state cell
                const currentStateCell = document.createElement('td');
                const currentStateSelect = createSelectWithOptions(turingMachine.states);
                currentStateSelect.value = currentState;
                currentStateCell.appendChild(currentStateSelect);
                
                // Current symbol cell
                const currentSymbolCell = document.createElement('td');
                const currentSymbolSelect = createSelectWithOptions(turingMachine.tapeAlphabet);
                currentSymbolSelect.value = currentSymbol;
                currentSymbolCell.appendChild(currentSymbolSelect);
                
                // New state cell
                const newStateCell = document.createElement('td');
                const newStateSelect = createSelectWithOptions(turingMachine.states);
                newStateSelect.value = transition.nextState;
                newStateCell.appendChild(newStateSelect);
                
                // Write symbol cell
                const writeSymbolCell = document.createElement('td');
                const writeSymbolSelect = createSelectWithOptions(turingMachine.tapeAlphabet);
                writeSymbolSelect.value = transition.writeSymbol;
                writeSymbolCell.appendChild(writeSymbolSelect);
                
                // Move direction cell
                const moveDirectionCell = document.createElement('td');
                const moveDirectionSelect = document.createElement('select');
                moveDirectionSelect.innerHTML = `
                    <option value="${DIRECTION.LEFT}">Left</option>
                    <option value="${DIRECTION.RIGHT}">Right</option>
                    <option value="${DIRECTION.STAY}">Stay</option>
                `;
                moveDirectionSelect.value = transition.moveDirection;
                moveDirectionCell.appendChild(moveDirectionSelect);
                
                // Action cell (delete button)
                const actionCell = document.createElement('td');
                const deleteButton = document.createElement('button');
                deleteButton.innerHTML = '<i class="fas fa-trash-alt"></i> Delete';
                deleteButton.className = 'btn danger-btn';
                deleteButton.addEventListener('click', () => {
                    row.remove();
                    updateTransitionsFromTable();
                    updateVisualTransitionTable();
                });
                actionCell.appendChild(deleteButton);
                
                // Add event listeners to update transitions when changed
                [currentStateSelect, currentSymbolSelect, newStateSelect, writeSymbolSelect, moveDirectionSelect].forEach(select => {
                    select.addEventListener('change', () => {
                        updateTransitionsFromTable();
                        updateVisualTransitionTable();
                    });
                });
                
                // Add all cells to the row
                row.appendChild(currentStateCell);
                row.appendChild(currentSymbolCell);
                row.appendChild(newStateCell);
                row.appendChild(writeSymbolCell);
                row.appendChild(moveDirectionCell);
                row.appendChild(actionCell);
                
                // Add row to the table
                elements.transitionBody.appendChild(row);
            });
            
            // Reset the simulation
            resetSimulation();
            
            // Update the visual transition table
            updateVisualTransitionTable();
            
            // Show a success message
            showNotification(`Example "${example.name}" loaded successfully!`, 'success');
        });
    }
}

// Tab initialization
function initializeTabs() {
    // Ensure one tab is active at start
    if (!document.querySelector('.tab-btn.active')) {
        elements.tabButtons[0].classList.add('active');
        document.getElementById(elements.tabButtons[0].getAttribute('data-tab')).classList.add('active');
    }
}

// Machine initialization functions
function initializeMachineFromInputs() {
    turingMachine.states = parseCommaSeparatedInput(elements.statesInput.value);
    turingMachine.initialState = elements.initialStateInput.value.trim();
    turingMachine.acceptState = elements.acceptStateInput.value.trim();
    turingMachine.rejectState = elements.rejectStateInput.value.trim();
    turingMachine.inputAlphabet = parseCommaSeparatedInput(elements.inputAlphabetInput.value);
    turingMachine.tapeAlphabet = parseCommaSeparatedInput(elements.tapeAlphabetInput.value);
    turingMachine.blankSymbol = elements.blankSymbolInput.value.trim();
    
    // Validate machine configuration
    validateMachineConfiguration();
}

function parseCommaSeparatedInput(input) {
    return input.split(',').map(item => item.trim()).filter(item => item !== '');
}

function validateMachineConfiguration() {
    // Check if initial, accept and reject states are in states list
    if (!turingMachine.states.includes(turingMachine.initialState)) {
        console.warn(`Initial state ${turingMachine.initialState} not in states list. Adding it.`);
        turingMachine.states.push(turingMachine.initialState);
    }
    
    if (!turingMachine.states.includes(turingMachine.acceptState)) {
        console.warn(`Accept state ${turingMachine.acceptState} not in states list. Adding it.`);
        turingMachine.states.push(turingMachine.acceptState);
    }
    
    if (!turingMachine.states.includes(turingMachine.rejectState)) {
        console.warn(`Reject state ${turingMachine.rejectState} not in states list. Adding it.`);
        turingMachine.states.push(turingMachine.rejectState);
    }
    
    // Check if blank symbol is in tape alphabet
    if (!turingMachine.tapeAlphabet.includes(turingMachine.blankSymbol)) {
        console.warn(`Blank symbol ${turingMachine.blankSymbol} not in tape alphabet. Adding it.`);
        turingMachine.tapeAlphabet.push(turingMachine.blankSymbol);
    }
    
    // Check if all input alphabet symbols are in tape alphabet
    turingMachine.inputAlphabet.forEach(symbol => {
        if (!turingMachine.tapeAlphabet.includes(symbol)) {
            console.warn(`Input symbol ${symbol} not in tape alphabet. Adding it.`);
            turingMachine.tapeAlphabet.push(symbol);
        }
    });
}

// Transitions management
function addTransitionRow() {
    const row = document.createElement('tr');
    
    // Create select for current state
    const currentStateCell = document.createElement('td');
    const currentStateSelect = createSelectWithOptions(turingMachine.states);
    currentStateCell.appendChild(currentStateSelect);
    
    // Create select for current symbol
    const currentSymbolCell = document.createElement('td');
    const currentSymbolSelect = createSelectWithOptions(turingMachine.tapeAlphabet);
    currentSymbolCell.appendChild(currentSymbolSelect);
    
    // Create select for new state
    const newStateCell = document.createElement('td');
    const newStateSelect = createSelectWithOptions(turingMachine.states);
    newStateCell.appendChild(newStateSelect);
    
    // Create select for write symbol
    const writeSymbolCell = document.createElement('td');
    const writeSymbolSelect = createSelectWithOptions(turingMachine.tapeAlphabet);
    writeSymbolCell.appendChild(writeSymbolSelect);
    
    // Create select for move direction
    const moveDirectionCell = document.createElement('td');
    const moveDirectionSelect = document.createElement('select');
    moveDirectionSelect.innerHTML = `
        <option value="${DIRECTION.LEFT}">Left</option>
        <option value="${DIRECTION.RIGHT}">Right</option>
        <option value="${DIRECTION.STAY}">Stay</option>
    `;
    moveDirectionCell.appendChild(moveDirectionSelect);
    
    // Create delete button
    const actionCell = document.createElement('td');
    const deleteButton = document.createElement('button');
    deleteButton.innerHTML = '<i class="fas fa-trash-alt"></i> Delete';
    deleteButton.className = 'btn danger-btn';
    deleteButton.addEventListener('click', () => {
        row.remove();
        updateTransitionsFromTable();
        updateVisualTransitionTable();
    });
    actionCell.appendChild(deleteButton);
    
    // Add event listeners to update transitions when changed
    [currentStateSelect, currentSymbolSelect, newStateSelect, writeSymbolSelect, moveDirectionSelect].forEach(select => {
        select.addEventListener('change', () => {
            updateTransitionsFromTable();
            updateVisualTransitionTable();
        });
    });
    
    // Add all cells to the row
    row.appendChild(currentStateCell);
    row.appendChild(currentSymbolCell);
    row.appendChild(newStateCell);
    row.appendChild(writeSymbolCell);
    row.appendChild(moveDirectionCell);
    row.appendChild(actionCell);
    
    // Add row to the table
    elements.transitionBody.appendChild(row);
    
    // Update transitions data
    updateTransitionsFromTable();
    updateVisualTransitionTable();
}

function createSelectWithOptions(options) {
    const select = document.createElement('select');
    options.forEach(option => {
        const optionElement = document.createElement('option');
        optionElement.value = option;
        optionElement.textContent = option;
        select.appendChild(optionElement);
    });
    return select;
}

function updateTransitionsFromTable() {
    // Clear existing transitions
    turingMachine.transitions = {};
    
    // Get all rows from the transition table
    const rows = elements.transitionBody.querySelectorAll('tr');
    
    rows.forEach(row => {
        const cells = row.querySelectorAll('td');
        if (cells.length === 6) { // Make sure row is valid
            const currentState = cells[0].querySelector('select').value;
            const currentSymbol = cells[1].querySelector('select').value;
            const newState = cells[2].querySelector('select').value;
            const writeSymbol = cells[3].querySelector('select').value;
            const moveDirection = cells[4].querySelector('select').value;
            
            // Create the transition
            const key = `${currentState},${currentSymbol}`;
            turingMachine.transitions[key] = {
                nextState: newState,
                writeSymbol: writeSymbol,
                moveDirection: moveDirection
            };
        }
    });
}

// Save/Load machine configuration
function saveMachine() {
    // Update transitions before saving
    updateTransitionsFromTable();
    
    // Create a configuration object
    const config = {
        states: turingMachine.states,
        inputAlphabet: turingMachine.inputAlphabet,
        tapeAlphabet: turingMachine.tapeAlphabet,
        transitions: turingMachine.transitions,
        initialState: turingMachine.initialState,
        acceptState: turingMachine.acceptState,
        rejectState: turingMachine.rejectState,
        blankSymbol: turingMachine.blankSymbol,
        inputString: elements.inputStringInput.value
    };
    
    // Save to localStorage
    localStorage.setItem('turingMachineConfig', JSON.stringify(config));
    
    // Notify the user
    showNotification('Machine configuration saved successfully!', 'success');
}

function loadMachine() {
    // Try to get the configuration from localStorage
    const savedConfig = localStorage.getItem('turingMachineConfig');
    
    if (savedConfig) {
        const config = JSON.parse(savedConfig);
        
        // Update input fields
        elements.statesInput.value = config.states.join(', ');
        elements.initialStateInput.value = config.initialState;
        elements.acceptStateInput.value = config.acceptState;
        elements.rejectStateInput.value = config.rejectState;
        elements.inputAlphabetInput.value = config.inputAlphabet.join(', ');
        elements.tapeAlphabetInput.value = config.tapeAlphabet.join(', ');
        elements.blankSymbolInput.value = config.blankSymbol;
        elements.inputStringInput.value = config.inputString || '';
        
        // Update the machine configuration
        turingMachine.states = config.states;
        turingMachine.inputAlphabet = config.inputAlphabet;
        turingMachine.tapeAlphabet = config.tapeAlphabet;
        turingMachine.transitions = config.transitions;
        turingMachine.initialState = config.initialState;
        turingMachine.acceptState = config.acceptState;
        turingMachine.rejectState = config.rejectState;
        turingMachine.blankSymbol = config.blankSymbol;
        
        // Clear existing transition rows
        elements.transitionBody.innerHTML = '';
        
        // Create transition rows from the loaded configuration
        Object.entries(config.transitions).forEach(([key, transition]) => {
            const [currentState, currentSymbol] = key.split(',');
            
            const row = document.createElement('tr');
            
            // Current state cell
            const currentStateCell = document.createElement('td');
            const currentStateSelect = createSelectWithOptions(turingMachine.states);
            currentStateSelect.value = currentState;
            currentStateCell.appendChild(currentStateSelect);
            
            // Current symbol cell
            const currentSymbolCell = document.createElement('td');
            const currentSymbolSelect = createSelectWithOptions(turingMachine.tapeAlphabet);
            currentSymbolSelect.value = currentSymbol;
            currentSymbolCell.appendChild(currentSymbolSelect);
            
            // New state cell
            const newStateCell = document.createElement('td');
            const newStateSelect = createSelectWithOptions(turingMachine.states);
            newStateSelect.value = transition.nextState;
            newStateCell.appendChild(newStateSelect);
            
            // Write symbol cell
            const writeSymbolCell = document.createElement('td');
            const writeSymbolSelect = createSelectWithOptions(turingMachine.tapeAlphabet);
            writeSymbolSelect.value = transition.writeSymbol;
            writeSymbolCell.appendChild(writeSymbolSelect);
            
            // Move direction cell
            const moveDirectionCell = document.createElement('td');
            const moveDirectionSelect = document.createElement('select');
            moveDirectionSelect.innerHTML = `
                <option value="${DIRECTION.LEFT}">Left</option>
                <option value="${DIRECTION.RIGHT}">Right</option>
                <option value="${DIRECTION.STAY}">Stay</option>
            `;
            moveDirectionSelect.value = transition.moveDirection;
            moveDirectionCell.appendChild(moveDirectionSelect);
            
            // Action cell (delete button)
            const actionCell = document.createElement('td');
            const deleteButton = document.createElement('button');
            deleteButton.innerHTML = '<i class="fas fa-trash-alt"></i> Delete';
            deleteButton.className = 'btn danger-btn';
            deleteButton.addEventListener('click', () => {
                row.remove();
                updateTransitionsFromTable();
                updateVisualTransitionTable();
            });
            actionCell.appendChild(deleteButton);
            
            // Add event listeners to update transitions when changed
            [currentStateSelect, currentSymbolSelect, newStateSelect, writeSymbolSelect, moveDirectionSelect].forEach(select => {
                select.addEventListener('change', () => {
                    updateTransitionsFromTable();
                    updateVisualTransitionTable();
                });
            });
            
            // Add all cells to the row
            row.appendChild(currentStateCell);
            row.appendChild(currentSymbolCell);
            row.appendChild(newStateCell);
            row.appendChild(writeSymbolCell);
            row.appendChild(moveDirectionCell);
            row.appendChild(actionCell);
            
            // Add row to the table
            elements.transitionBody.appendChild(row);
        });
        
        // Reset the simulation
        resetSimulation();
        
        // Update the visual transition table
        updateVisualTransitionTable();
        
        // Notify the user
        showNotification('Machine configuration loaded successfully!', 'info');
    } else {
        showNotification('No saved configuration found!', 'warning');
    }
}

function clearMachine() {
    // Clear all input fields
    elements.statesInput.value = 'q0, q1, q2, qAccept, qReject';
    elements.initialStateInput.value = 'q0';
    elements.acceptStateInput.value = 'qAccept';
    elements.rejectStateInput.value = 'qReject';
    elements.inputAlphabetInput.value = '0, 1';
    elements.tapeAlphabetInput.value = '0, 1, B';
    elements.blankSymbolInput.value = 'B';
    elements.inputStringInput.value = '';
    
    // Clear transitions
    elements.transitionBody.innerHTML = '';
    turingMachine.transitions = {};
    
    // Reset the machine configuration
    initializeMachineFromInputs();
    
    // Reset the simulation
    resetSimulation();
    
    // Update the visual transition table
    updateVisualTransitionTable();
    
    // Notify the user
    showNotification('Machine configuration cleared!', 'warning');
}

// Notifications
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas ${getIconForType(type)}"></i>
            <span>${message}</span>
        </div>
        <button class="notification-close"><i class="fas fa-times"></i></button>
    `;
    
    // Add to body
    document.body.appendChild(notification);
    
    // Add event listener to close button
    notification.querySelector('.notification-close').addEventListener('click', () => {
        notification.classList.add('hide');
        setTimeout(() => {
            notification.remove();
        }, 300);
    });
    
    // Show with animation
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    // Auto-hide after 3 seconds
    setTimeout(() => {
        notification.classList.add('hide');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
    
    function getIconForType(type) {
        switch(type) {
            case 'success': return 'fa-check-circle';
            case 'warning': return 'fa-exclamation-triangle';
            case 'error': return 'fa-times-circle';
            case 'info':
            default: return 'fa-info-circle';
        }
    }
}

// Tape visualization and manipulation
function initializeTape() {
    resetSimulation();
}

function renderTape() {
    // Clear the tape element
    elements.tapeElement.innerHTML = '';
    
    // Ensure tape has at least 21 cells (10 on each side of the head)
    ensureTapeLength();
    
    // Get the start and end indices for rendering (show 21 cells centered on the head)
    const mid = 10;
    const start = Math.max(0, simulationState.headPosition - mid);
    const end = Math.min(simulationState.tape.length, simulationState.headPosition + mid + 1);
    
    // Create and add cells to the tape
    for (let i = start; i < end; i++) {
        const cell = document.createElement('div');
        cell.className = 'tape-cell';
        cell.textContent = simulationState.tape[i];
        
        if (i === simulationState.headPosition) {
            cell.classList.add('active');
        }
        
        elements.tapeElement.appendChild(cell);
    }
    
    // Update current state display
    elements.currentStateElement.textContent = simulationState.currentState;
    
    // Update state circle color based on state type
    if (simulationState.currentState === turingMachine.acceptState) {
        elements.currentStateElement.style.backgroundColor = 'var(--secondary-color)';
    } else if (simulationState.currentState === turingMachine.rejectState) {
        elements.currentStateElement.style.backgroundColor = 'var(--accent-color)';
    } else {
        elements.currentStateElement.style.backgroundColor = 'var(--primary-color)';
    }
    
    // Center the active cell in the view
    const activeCellIndex = simulationState.headPosition - start;
    if (activeCellIndex >= 0 && activeCellIndex < end - start) {
        const cells = elements.tapeElement.querySelectorAll('.tape-cell');
        if (cells[activeCellIndex]) {
            cells[activeCellIndex].scrollIntoView({
                behavior: 'smooth',
                block: 'center',
                inline: 'center'
            });
        }
    }
}

function ensureTapeLength() {
    // Make sure there are at least 10 blank cells on each side of the head
    while (simulationState.headPosition < 10) {
        simulationState.tape.unshift(turingMachine.blankSymbol);
        simulationState.headPosition++;
    }
    
    while (simulationState.headPosition >= simulationState.tape.length - 10) {
        simulationState.tape.push(turingMachine.blankSymbol);
    }
}

function scrollTape(offset) {
    // This function allows manual scrolling of the tape
    // It does not affect the simulation state, just the display
    const tapeElement = elements.tapeElement;
    tapeElement.scrollLeft += offset * 60; // Each cell is about 60px wide
}

// Simulation functions
function resetSimulation() {
    // Reset simulation state
    simulationState.isRunning = false;
    simulationState.isPaused = false;
    simulationState.stepCount = 0;
    simulationState.currentState = turingMachine.initialState;
    simulationState.history = [];
    
    // Get input string and create tape
    const inputString = elements.inputStringInput.value.trim();
    simulationState.tape = inputString.split('');
    
    // Add blank symbol to the end if needed
    if (simulationState.tape.length === 0) {
        simulationState.tape.push(turingMachine.blankSymbol);
    }
    
    // Set head position to the leftmost cell
    simulationState.headPosition = 0;
    
    // Update speed based on slider
    updateSimulationSpeed();
    
    // Update the display
    renderTape();
    elements.statusElement.textContent = 'Ready';
    elements.statusElement.style.color = '';
    elements.stepsCountElement.textContent = `Steps: ${simulationState.stepCount}`;
    elements.currentTransitionElement.textContent = 'None';
    elements.executionHistoryElement.innerHTML = '';
    
    // Clear any existing transition animations
    elements.transitionAnimation.innerHTML = '';
    
    // Enable/disable buttons
    elements.stepSimBtn.disabled = false;
    elements.playSimBtn.disabled = false;
    elements.pauseSimBtn.disabled = true;
}

function updateSimulationSpeed() {
    // Map speed value (1-10) to milliseconds (1000-100)
    const speedValue = parseInt(elements.simSpeedInput.value);
    const mappedSpeed = 1100 - (speedValue * 100);
    simulationState.speed = mappedSpeed;
    
    // Update the speed text
    let speedText;
    if (speedValue <= 3) speedText = 'Slow';
    else if (speedValue <= 7) speedText = 'Medium';
    else speedText = 'Fast';
    
    elements.speedValueText.textContent = speedText;
}

function stepSimulation() {
    // Don't step if already in a final state
    if (simulationState.currentState === turingMachine.acceptState || 
        simulationState.currentState === turingMachine.rejectState) {
        return;
    }
    
    // Get current symbol from tape
    const currentSymbol = simulationState.tape[simulationState.headPosition] || turingMachine.blankSymbol;
    
    // Look up transition
    const transitionKey = `${simulationState.currentState},${currentSymbol}`;
    const transition = turingMachine.transitions[transitionKey];
    
    if (transition) {
        // Record the current state for history
        const historyEntry = {
            stepNumber: simulationState.stepCount + 1,
            fromState: simulationState.currentState,
            toState: transition.nextState,
            readSymbol: currentSymbol,
            writeSymbol: transition.writeSymbol,
            moveDirection: transition.moveDirection,
            headPosition: simulationState.headPosition
        };
        
        // Apply the transition
        const oldSymbol = simulationState.tape[simulationState.headPosition];
        simulationState.tape[simulationState.headPosition] = transition.writeSymbol;
        
        const oldState = simulationState.currentState;
        simulationState.currentState = transition.nextState;
        
        // Show animation for the transition
        showTransitionAnimation(historyEntry, oldState, oldSymbol);
        
        // Move the head
        const oldHeadPosition = simulationState.headPosition;
        
        if (transition.moveDirection === DIRECTION.LEFT) {
            simulationState.headPosition--;
            
            // Add a blank cell on the left if needed
            if (simulationState.headPosition < 0) {
                simulationState.tape.unshift(turingMachine.blankSymbol);
                simulationState.headPosition = 0;
            }
        } else if (transition.moveDirection === DIRECTION.RIGHT) {
            simulationState.headPosition++;
            
            // Add a blank cell on the right if needed
            if (simulationState.headPosition >= simulationState.tape.length) {
                simulationState.tape.push(turingMachine.blankSymbol);
            }
        }
        
        // Add to history
        simulationState.history.push(historyEntry);
        addHistoryEntry(historyEntry);
        
        // Increment step count
        simulationState.stepCount++;
        
        // Update display
        renderTape();
        elements.stepsCountElement.textContent = `Steps: ${simulationState.stepCount}`;
        elements.currentTransitionElement.textContent = `(${oldState}, ${currentSymbol}) → (${transition.nextState}, ${transition.writeSymbol}, ${transition.moveDirection})`;
        
        // Check if we're in a final state
        if (simulationState.currentState === turingMachine.acceptState) {
            elements.statusElement.textContent = 'Accepted ✓';
            elements.statusElement.style.color = 'var(--secondary-color)';
            simulationState.isRunning = false;
            elements.playSimBtn.disabled = true;
            elements.stepSimBtn.disabled = true;
            elements.pauseSimBtn.disabled = true;
            showNotification('Input accepted by the machine!', 'success');
        } else if (simulationState.currentState === turingMachine.rejectState) {
            elements.statusElement.textContent = 'Rejected ✗';
            elements.statusElement.style.color = 'var(--accent-color)';
            simulationState.isRunning = false;
            elements.playSimBtn.disabled = true;
            elements.stepSimBtn.disabled = true;
            elements.pauseSimBtn.disabled = true;
            showNotification('Input rejected by the machine!', 'error');
        }
    } else {
        // No transition found, reject
        elements.statusElement.textContent = `No transition found for (${simulationState.currentState}, ${currentSymbol})`;
        elements.statusElement.style.color = 'var(--accent-color)';
        simulationState.currentState = turingMachine.rejectState;
        simulationState.isRunning = false;
        elements.playSimBtn.disabled = true;
        elements.stepSimBtn.disabled = true;
        elements.pauseSimBtn.disabled = true;
        
        // Add to history
        const historyEntry = {
            stepNumber: simulationState.stepCount + 1,
            fromState: simulationState.currentState,
            toState: turingMachine.rejectState,
            readSymbol: currentSymbol,
            writeSymbol: currentSymbol,
            moveDirection: DIRECTION.STAY,
            headPosition: simulationState.headPosition,
            error: true
        };
        simulationState.history.push(historyEntry);
        addHistoryEntry(historyEntry);
        
        showNotification(`No transition defined for state "${simulationState.currentState}" and symbol "${currentSymbol}"`, 'error');
        
        renderTape();
    }
    
    // Ensure there are enough blank cells
    ensureTapeLength();
}

function showTransitionAnimation(historyEntry, oldState, oldSymbol) {
    // Get the active tape cell position
    const activeCell = elements.tapeElement.querySelector('.tape-cell.active');
    if (!activeCell) return;
    
    const cellRect = activeCell.getBoundingClientRect();
    const cellCenterX = cellRect.left + cellRect.width / 2;
    const cellCenterY = cellRect.top + cellRect.height / 2;
    
    // Create animation container if it doesn't exist
    elements.transitionAnimation.innerHTML = '';
    
    // Create and position the arrow element
    const arrow = document.createElement('div');
    arrow.className = 'transition-arrow';
    
    // Set direction icon
    let directionIcon;
    switch(historyEntry.moveDirection) {
        case DIRECTION.LEFT:
            directionIcon = '<i class="fas fa-arrow-left"></i>';
            break;
        case DIRECTION.RIGHT:
            directionIcon = '<i class="fas fa-arrow-right"></i>';
            break;
        case DIRECTION.STAY:
            directionIcon = '<i class="fas fa-arrows-alt-h"></i>';
            break;
    }
    arrow.innerHTML = directionIcon;
    
    // Position the arrow
    arrow.style.left = `${cellCenterX - 20}px`; // 20 is half the arrow width
    arrow.style.top = `${cellCenterY - 20}px`; // 20 is half the arrow height
    
    // Create direction text indicator
    const directionText = document.createElement('div');
    directionText.className = 'direction-indicator';
    directionText.innerHTML = `${oldState}(${oldSymbol}) → ${historyEntry.toState}(${historyEntry.writeSymbol})`;
    
    // Position the text above the arrow
    directionText.style.left = `${cellCenterX - 100}px`; // Center the text
    directionText.style.top = `${cellCenterY - 60}px`; // Position above the arrow
    
    // Add elements to the DOM
    elements.transitionAnimation.appendChild(arrow);
    elements.transitionAnimation.appendChild(directionText);
    
    // Remove after animation completes
    setTimeout(() => {
        arrow.remove();
        directionText.remove();
    }, 800);
}

function addHistoryEntry(entry) {
    const historyStep = document.createElement('div');
    historyStep.className = 'history-step';
    
    const stepNumber = document.createElement('div');
    stepNumber.className = 'step-number';
    stepNumber.textContent = entry.stepNumber;
    
    const stepDetails = document.createElement('div');
    stepDetails.className = 'step-details';
    
    // If there was an error (no transition found)
    if (entry.error) {
        stepDetails.innerHTML = `<span style="color: var(--accent-color);">No transition found for (${entry.fromState}, ${entry.readSymbol})</span>`;
    } else {
        stepDetails.textContent = `(${entry.fromState}, ${entry.readSymbol}) → (${entry.toState}, ${entry.writeSymbol}, ${entry.moveDirection})`;
    }
    
    historyStep.appendChild(stepNumber);
    historyStep.appendChild(stepDetails);
    
    elements.executionHistoryElement.appendChild(historyStep);
    
    // Scroll to the bottom of the history container
    elements.executionHistoryElement.scrollTop = elements.executionHistoryElement.scrollHeight;
}

function startSimulation() {
    simulationState.isRunning = true;
    simulationState.isPaused = false;
    elements.playSimBtn.disabled = true;
    elements.pauseSimBtn.disabled = false;
    elements.stepSimBtn.disabled = true;
    elements.statusElement.textContent = 'Running...';
    elements.statusElement.style.color = '';
    
    runSimulation();
}

function pauseSimulation() {
    simulationState.isPaused = true;
    simulationState.isRunning = false;
    elements.playSimBtn.disabled = false;
    elements.pauseSimBtn.disabled = true;
    elements.stepSimBtn.disabled = false;
    elements.statusElement.textContent = 'Paused';
}

function runSimulation() {
    if (simulationState.isRunning) {
        // Perform one step
        stepSimulation();
        
        // If we're in a final state or paused, stop the simulation
        if (simulationState.currentState === turingMachine.acceptState || 
            simulationState.currentState === turingMachine.rejectState || 
            simulationState.isPaused) {
            return;
        }
        
        // Schedule the next step
        setTimeout(runSimulation, simulationState.speed);
    }
}

// Visualization of transitions
function updateVisualTransitionTable() {
    // Clear the visual transition table
    elements.visualTransitionTable.innerHTML = '';
    
    // Sort transitions for better display
    const sortedTransitions = Object.entries(turingMachine.transitions)
        .sort(([keyA], [keyB]) => keyA.localeCompare(keyB));
    
    // Group transitions by current state
    const transitionsByState = {};
    
    sortedTransitions.forEach(([key, transition]) => {
        const [currentState, currentSymbol] = key.split(',');
        
        if (!transitionsByState[currentState]) {
            transitionsByState[currentState] = [];
        }
        
        transitionsByState[currentState].push({
            currentSymbol,
            nextState: transition.nextState,
            writeSymbol: transition.writeSymbol,
            moveDirection: transition.moveDirection
        });
    });
    
    // Create cards for each state
    Object.entries(transitionsByState).forEach(([state, transitions]) => {
        const card = document.createElement('div');
        card.className = 'transition-card';
        
        // Add special styling for accept/reject states
        if (state === turingMachine.acceptState) {
            card.style.borderLeft = '4px solid var(--secondary-color)';
        } else if (state === turingMachine.rejectState) {
            card.style.borderLeft = '4px solid var(--accent-color)';
        } else if (state === turingMachine.initialState) {
            card.style.borderLeft = '4px solid var(--primary-color)';
        }
        
        const stateHeader = document.createElement('h3');
        stateHeader.textContent = `State: ${state}`;
        
        // Add icon or indicator for special states
        if (state === turingMachine.initialState) {
            stateHeader.innerHTML += ' <span class="badge" style="background-color: var(--primary-color);">Initial</span>';
        }
        if (state === turingMachine.acceptState) {
            stateHeader.innerHTML += ' <span class="badge" style="background-color: var(--secondary-color);">Accept</span>';
        }
        if (state === turingMachine.rejectState) {
            stateHeader.innerHTML += ' <span class="badge" style="background-color: var(--accent-color);">Reject</span>';
        }
        
        card.appendChild(stateHeader);
        
        const transitionsList = document.createElement('ul');
        transitionsList.style.listStyle = 'none';
        transitionsList.style.padding = '0';
        
        transitions.forEach(t => {
            const item = document.createElement('li');
            item.innerHTML = `
                <div style="display: flex; align-items: center; gap: 5px; margin: 8px 0;">
                    <div style="font-weight: bold;">${t.currentSymbol}</div>
                    <div style="margin: 0 5px;">→</div>
                    <div>
                        <span style="color: var(--primary-color);">${t.nextState}</span>,
                        <span style="color: var(--dark-color);">${t.writeSymbol}</span>,
                        <span style="color: var(--accent-color);">${getDirectionName(t.moveDirection)}</span>
                    </div>
                </div>
            `;
            transitionsList.appendChild(item);
        });
        
        card.appendChild(transitionsList);
        elements.visualTransitionTable.appendChild(card);
    });
    
    function getDirectionName(direction) {
        switch(direction) {
            case DIRECTION.LEFT: return "Left";
            case DIRECTION.RIGHT: return "Right";
            case DIRECTION.STAY: return "Stay";
            default: return direction;
        }
    }
}

// Add CSS for notifications
const notificationStyles = document.createElement('style');
notificationStyles.textContent = `
    .notification {
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px;
        border-radius: var(--border-radius);
        background-color: white;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        z-index: 1000;
        transform: translateX(120%);
        transition: transform 0.3s ease;
        max-width: 300px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        min-width: 250px;
    }
    
    .notification.show {
        transform: translateX(0);
    }
    
    .notification.hide {
        transform: translateX(120%);
    }
    
    .notification-content {
        display: flex;
        align-items: center;
        gap: 10px;
    }
    
    .notification.success {
        border-left: 4px solid var(--secondary-color);
    }
    
    .notification.success i {
        color: var(--secondary-color);
    }
    
    .notification.warning {
        border-left: 4px solid var(--warning-color);
    }
    
    .notification.warning i {
        color: var(--warning-color);
    }
    
    .notification.error {
        border-left: 4px solid var(--accent-color);
    }
    
    .notification.error i {
        color: var(--accent-color);
    }
    
    .notification.info {
        border-left: 4px solid var(--primary-color);
    }
    
    .notification.info i {
        color: var(--primary-color);
    }
    
    .notification-close {
        background: none;
        border: none;
        cursor: pointer;
        font-size: 1rem;
        color: var(--gray-color);
    }
    
    .badge {
        font-size: 0.7rem;
        padding: 2px 6px;
        border-radius: 10px;
        color: white;
        margin-left: 5px;
    }
`;
document.head.appendChild(notificationStyles);

// Initial render of the transition table
function renderTransitionTable() {
    // Populate with a sample transition if the table is empty
    if (elements.transitionBody.children.length === 0) {
        addTransitionRow();
    }
}