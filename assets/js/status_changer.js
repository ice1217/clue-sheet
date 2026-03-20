function statusButtonChanger (control) {
  const Data = [
    { status: 'unchecked', value: '\u2B1C' },
    { status: 'x', value: '\u274c' },
    { status: 'question', value: '\u2753' },
    { status: 'checked', value: '\u2705' }
  ]

  let index = Data.map(function (e) { return e.value }).indexOf(control.value)
  index++
  if ((index) >= Data.length) {
    index = 0
  }
  control.value = Data[index].value
  const clue = $(control).closest('td').siblings('.guess-component') // eslint-disable-line no-undef
  switch (Data[index].status) {
    case 'x':
      clue.toggleClass('x').siblings().removeClass('checked')
      break
    case 'checked':
      clue.toggleClass('checked').siblings().removeClass('x')
      break
    default:
      clue.removeClass('x checked')
  }
  saveState()
}

// Function to update player name input width based on value
function adjustPlayerNameWidth(input) {
  const length = Math.max(1, input.value.length)
  const widthInCh = Math.min(Math.max(length + 1, 8), 24)
  input.style.width = `${widthInCh}ch`
}

// Function to sync player names
function syncPlayerNames(playerNum, value) {
  const inputs = document.querySelectorAll(`input.player-name[data-player="${playerNum}"]`)
  inputs.forEach(input => {
    if (input.value !== value) {
      input.value = value
    }
    adjustPlayerNameWidth(input)
  })
  saveState()
}

// Function to save state to localStorage
function saveState() {
  const state = {
    playerNames: {},
    checkboxes: {}
  }

  // Save player names
  const playerInputs = document.querySelectorAll('input.player-name')
  playerInputs.forEach(input => {
    const playerNum = input.getAttribute('data-player')
    state.playerNames[playerNum] = input.value
  })

  // Save checkbox states
  const checkboxes = document.querySelectorAll('input.multi-checkbox')
  checkboxes.forEach((checkbox, index) => {
    state.checkboxes[index] = checkbox.value
  })

  localStorage.setItem('clueSheetState', JSON.stringify(state))
}

// Function to load state from localStorage
function loadState() {
  const state = JSON.parse(localStorage.getItem('clueSheetState'))
  if (!state) return

  // Load player names
  for (const playerNum in state.playerNames) {
    const inputs = document.querySelectorAll(`input.player-name[data-player="${playerNum}"]`)
    inputs.forEach(input => {
      input.value = state.playerNames[playerNum]
      adjustPlayerNameWidth(input)
    })
  }

  // Load checkbox states
  const checkboxes = document.querySelectorAll('input.multi-checkbox')
  for (const index in state.checkboxes) {
    if (checkboxes[index]) {
      checkboxes[index].value = state.checkboxes[index]
      // Also update the classes
      const clue = $(checkboxes[index]).closest('td').siblings('.guess-component') // eslint-disable-line no-undef
      const status = getStatusFromValue(state.checkboxes[index])
      switch (status) {
        case 'x':
          clue.addClass('x').removeClass('checked')
          break
        case 'checked':
          clue.addClass('checked').removeClass('x')
          break
        default:
          clue.removeClass('x checked')
      }
    }
  }
}

function getStatusFromValue(value) {
  const Data = [
    { status: 'unchecked', value: '\u2B1C' },
    { status: 'x', value: '\u274c' },
    { status: 'question', value: '\u2753' },
    { status: 'checked', value: '\u2705' }
  ]
  const item = Data.find(d => d.value === value)
  return item ? item.status : 'unchecked'
}

// Function to reset
function resetState() {
  localStorage.removeItem('clueSheetState')
  location.reload()
}

// Attach function to all checkboxes and player names
window.onload = function () {
  loadState()

  const elements = document.getElementsByClassName('multi-checkbox')
  for (let i = 0; i < elements.length; i++) {
    elements[i].onclick = function () {
      statusButtonChanger(this)
    }
  }

  const playerInputs = document.querySelectorAll('input.player-name')
  playerInputs.forEach(input => {
    adjustPlayerNameWidth(input)
    input.addEventListener('input', function() {
      const playerNum = this.getAttribute('data-player')
      syncPlayerNames(playerNum, this.value)
      adjustPlayerNameWidth(this)
    })
  })

  const resetButton = document.getElementById('reset-button')
  if (resetButton) {
    resetButton.onclick = resetState
  }
}
