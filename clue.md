---
layout: default
---

# Clue Game Sheet

<button id="reset-button">New Game</button>

<!-- Configuration Modal -->
<div id="config-modal" class="modal">
  <div class="modal-content">
    <h2>New Game Configuration</h2>
    
    <div class="config-section">
      <label>Edition:</label>
      <div class="radio-group">
        <label><input type="radio" name="edition" value="standard" checked /> Standard</label>
        <label><input type="radio" name="edition" value="mini" /> Mini</label>
      </div>
    </div>

    <div class="config-section">
      <label for="player-count">Number of Players (2-6):</label>
      <select id="player-count">
        <option value="">-- Select --</option>
        <option value="2">2 Players</option>
        <option value="3">3 Players</option>
        <option value="4">4 Players</option>
        <option value="5">5 Players</option>
        <option value="6">6 Players</option>
      </select>
    </div>

    <div class="config-section" id="player-names-section" style="display: none;">
      <label>Player Names:</label>
      <div id="player-names-inputs"></div>
    </div>

    <div class="config-buttons">
      <button id="config-submit" class="btn btn-primary">Start Game</button>
      <button id="config-cancel" class="btn btn-secondary" style="display: none;">Cancel</button>
    </div>
  </div>
</div>

<!-- Standard Edition Game Sheet -->
<div id="game-standard" style="display: none;">
  {% assign edition = "standard" %}
  {% include suspects.html %}
  {% include weapons.html %}
  {% include rooms.html %}
</div>

<!-- Mini Edition Game Sheet -->
<div id="game-mini" style="display: none;">
  {% assign edition = "mini" %}
  {% include suspects.html %}
  {% include weapons.html %}
  {% include rooms.html %}
</div>
