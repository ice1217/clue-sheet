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
  
  // Handle unused column checkbox
  if (control.classList.contains('unused-checkbox')) {
    const row = control.closest('tr')
    if (Data[index].status === 'checked') {
      row.classList.add('unused-row')
    } else {
      row.classList.remove('unused-row')
    }
  } else {
    // Regular checkbox styling
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

// ===== Configuration Modal Functions =====

function showConfigModal() {
  document.getElementById('config-modal').style.display = 'flex'
  // Show cancel button on subsequent opens
  const isFirstLoad = !localStorage.getItem('gameConfig')
  document.getElementById('config-cancel').style.display = isFirstLoad ? 'none' : 'inline-block'
}

function hideConfigModal() {
  document.getElementById('config-modal').style.display = 'none'
}

function updatePlayerNameFields(count) {
  const container = document.getElementById('player-names-inputs')
  const section = document.getElementById('player-names-section')
  
  container.innerHTML = ''
  
  if (!count || count < 2 || count > 6) {
    section.style.display = 'none'
    return
  }
  
  section.style.display = 'block'
  
  for (let i = 1; i <= parseInt(count); i++) {
    const div = document.createElement('div')
    div.className = 'player-name-input-group'
    div.innerHTML = `
      <label for="player-${i}">Player ${i}:</label>
      <input type="text" id="player-${i}" value="P${i}" class="config-player-input" />
    `
    container.appendChild(div)
  }
}

function submitConfiguration() {
  const edition = document.querySelector('input[name="edition"]:checked').value
  const playerCount = document.getElementById('player-count').value
  
  if (!playerCount) {
    alert('Please select the number of players')
    return
  }
  
  const playerNames = {}
  for (let i = 1; i <= parseInt(playerCount); i++) {
    const input = document.getElementById(`player-${i}`)
    playerNames[i] = input.value || `P${i}`
  }
  
  const gameConfig = {
    edition: edition,
    playerCount: parseInt(playerCount),
    playerNames: playerNames
  }
  
  localStorage.setItem('gameConfig', JSON.stringify(gameConfig))
  hideConfigModal()
  renderGameSheet(gameConfig)
}

function renderGameSheet(config) {
  // Hide both editions first
  document.getElementById('game-standard').style.display = 'none'
  document.getElementById('game-mini').style.display = 'none'
  
  // Show appropriate edition
  const editionId = `game-${config.edition}`
  document.getElementById(editionId).style.display = 'block'
  
  // Get all tables in the active edition
  const activeEdition = document.getElementById(editionId)
  const tables = activeEdition.querySelectorAll('table')
  
  tables.forEach(table => {
    // Update player name inputs and hide/show columns
    for (let playerNum = 1; playerNum <= 6; playerNum++) {
      const inputs = table.querySelectorAll(`input.player-name[data-player="${playerNum}"]`)
      inputs.forEach(input => {
        const shouldShow = playerNum <= config.playerCount
        // Hide/show the th (header cell)
        input.parentElement.style.display = shouldShow ? '' : 'none'
        
        if (shouldShow) {
          input.value = config.playerNames[playerNum] || `P${playerNum}`
          adjustPlayerNameWidth(input)
        }
      })
    }
    
    // Hide unused player columns in checkbox cells
    const allRows = table.querySelectorAll('tr')
    
    for (let playerNum = 1; playerNum <= 6; playerNum++) {
      allRows.forEach((row, rowIndex) => {
        if (rowIndex === 0) return // Skip header row (it's handled by the player-name input styling)
        
        // Find the checkbox cells for this player (skip first cell which is unused column, skip second which is name)
        const cells = row.querySelectorAll('td')
        if (cells[playerNum + 1]) { // +1 for unused column, +1 for name column
          cells[playerNum + 1].style.display = playerNum <= config.playerCount ? '' : 'none'
        }
      })
    }
  })
  
  // Clear and reload state for this configuration
  clearGameState()
  loadState()
  attachEventHandlers()
}

function clearGameState() {
  const config = JSON.parse(localStorage.getItem('gameConfig'))
  if (config) {
    const stateKey = `clueSheetState-${config.edition}-${config.playerCount}`
    localStorage.removeItem(stateKey)
  }
}

function getStateKey() {
  const config = JSON.parse(localStorage.getItem('gameConfig'))
  if (config) {
    return `clueSheetState-${config.edition}-${config.playerCount}`
  }
  return 'clueSheetState'
}

// Override saveState to use config-scoped key
const originalSaveState = saveState
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

  const stateKey = getStateKey()
  localStorage.setItem(stateKey, JSON.stringify(state))
}

// Override loadState to use config-scoped key
const originalLoadState = loadState
function loadState() {
  const stateKey = getStateKey()
  const state = JSON.parse(localStorage.getItem(stateKey))
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
      
      // Handle unused column styling
      if (checkboxes[index].classList.contains('unused-checkbox')) {
        const row = checkboxes[index].closest('tr')
        const status = getStatusFromValue(state.checkboxes[index])
        if (status === 'checked') {
          row.classList.add('unused-row')
        } else {
          row.classList.remove('unused-row')
        }
      } else {
        // Regular checkbox styling
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
}

function attachEventHandlers() {
  const elements = document.getElementsByClassName('multi-checkbox')
  for (let i = 0; i < elements.length; i++) {
    elements[i].onclick = function () {
      statusButtonChanger(this)
    }
  }

  const playerInputs = document.querySelectorAll('input.player-name')
  playerInputs.forEach(input => {
    input.removeEventListener('input', handlePlayerNameChange)
    input.addEventListener('input', handlePlayerNameChange)
  })
}

function handlePlayerNameChange(event) {
  const playerNum = this.getAttribute('data-player')
  syncPlayerNames(playerNum, this.value)
  adjustPlayerNameWidth(this)
}

// Attach function to all checkboxes and player names
window.onload = function () {
  // Setup configuration modal event listeners
  const playerCountSelect = document.getElementById('player-count')
  if (playerCountSelect) {
    playerCountSelect.addEventListener('change', function() {
      updatePlayerNameFields(this.value)
    })
  }
  
  const configSubmitBtn = document.getElementById('config-submit')
  if (configSubmitBtn) {
    configSubmitBtn.addEventListener('click', submitConfiguration)
  }
  
  const configCancelBtn = document.getElementById('config-cancel')
  if (configCancelBtn) {
    configCancelBtn.addEventListener('click', hideConfigModal)
  }
  
  const resetButton = document.getElementById('reset-button')
  if (resetButton) {
    resetButton.onclick = showConfigModal
  }
  
  // Check if game config exists
  const gameConfig = localStorage.getItem('gameConfig')
  if (gameConfig) {
    // Render the game sheet with stored config
    renderGameSheet(JSON.parse(gameConfig))
  } else {
    // Show configuration modal on first load
    showConfigModal()
  }
}
