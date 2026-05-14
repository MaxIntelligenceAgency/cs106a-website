// ───────────── Cursor-Desktop · auto-playing core demo ─────────────
  (function () {
    const root = document.getElementById('cd-root');
    if (!root) return;

    const STAGES = [
      {
        id: 'aruco-perc',
        eyebrow: 'Stage 01 / 05 · Perception',
        title: 'ArUco perception',
        prompt: 'Detect the printed ArUco marker and turn it into a 6-DoF pose the controller can servo on.',
        thought: 'Reading aruco_perception.py · 1.2 s',
        body:
          '<p>Run <strong>cv2.aruco.detectMarkers</strong> on every camera frame. ' +
          'When ID 0 is visible, run <strong>solvePnP</strong> with the printed tag size and ' +
          'camera intrinsics — that gives a direct metric translation and rotation.</p>' +
          '<p>The yaw is extracted from the rotation matrix and packed into the unused ' +
          '<code>orientation.z</code> field so messaging stays cheap.</p>',
        files: [
          { name: 'aruco_perception.py', plus: '+34', minus: '−0', color: 'var(--onyx-outline)' },
          { name: 'tello_direct_io.py',  plus: '+12', minus: '−4', color: 'var(--forest-green-action)' },
        ],
        codeTab: 'aruco_perception.py',
        codeMeta: 'my_drone_vision · perception',
      },
      {
        id: 'face-perc',
        eyebrow: 'Stage 02 / 05 · Perception',
        title: 'Face perception',
        prompt: 'Swap the marker detector for YOLOv8 + ReID. Same Pose message, different signal.',
        thought: 'Reading face_perception.py · 0.9 s',
        body:
          '<p>Run <strong>YOLOv8</strong> on every frame, then <strong>ReID</strong> picks the same ' +
          'person out of multiple faces (locks identity at first detection).</p>' +
          '<p>Output is a <em>pose-like</em> message: normalized image-center error in x/y, and the ' +
          'face <strong>area</strong> packed into <code>z</code> as a depth proxy.</p>',
        files: [
          { name: 'face_perception.py', plus: '+41', minus: '−0', color: 'var(--onyx-outline)' },
          { name: 'reid_tracker.py',    plus: '+18', minus: '−2', color: 'var(--forest-green-action)' },
        ],
        codeTab: 'face_perception.py',
        codeMeta: 'my_drone_vision · perception',
      },
      {
        id: 'aruco-ctrl',
        eyebrow: 'Stage 03 / 05 · Control',
        title: 'ArUco · 4-axis PD servo',
        prompt: 'Convert the metric pose into a body-frame Twist command. PD + low-pass filter.',
        thought: 'Reading aruco_controller.py · 1.4 s',
        body:
          '<p>Four independent PD loops on <strong>forward, side, vertical, yaw</strong>. ' +
          'EMA smoothing α = 0.4 · RC clamps 12 / 18 / 12 / 25.</p>' +
          '<p>Tag confirmed for 5 s → auto-takeoff. Auto-land on tag loss > 5 s.</p>',
        files: [
          { name: 'aruco_controller.py', plus: '+62', minus: '−5', color: 'var(--onyx-outline)' },
          { name: 'pd_filter.py',        plus: '+24', minus: '−0', color: 'var(--forest-green-action)' },
        ],
        codeTab: 'aruco_controller.py',
        codeMeta: 'my_drone_vision · 4-axis PD servo',
      },
      {
        id: 'face-ctrl',
        eyebrow: 'Stage 04 / 05 · Control',
        title: 'Face · image-based servo',
        prompt: 'Same PD structure. Error signal is now image-center offset + face-area depth proxy.',
        thought: 'Reading face_controller.py · 1.0 s',
        body:
          '<p>Yaw and vertical from <strong>image-center error</strong>. Forward motion from ' +
          '<strong>face area</strong> (smaller = farther, larger = closer).</p>' +
          '<p>Holds the head near image center at ~1.5 m social distance. Auto-land on prolonged loss.</p>',
        files: [
          { name: 'face_controller.py', plus: '+48', minus: '−6', color: 'var(--onyx-outline)' },
          { name: 'pd_filter.py',       plus: '+0',  minus: '−0', color: 'var(--forest-green-action)' },
        ],
        codeTab: 'face_controller.py',
        codeMeta: 'my_drone_vision · image-based servo',
      },
      {
        id: 'state',
        eyebrow: 'Stage 05 / 05 · Safety',
        title: 'Safety state machine',
        prompt: 'Five states wrap the controller. Loss recovery, soft-land, auto-takeoff — all here.',
        thought: 'Reading state_machine.py · 1.1 s',
        body:
          '<p><strong>Idle → Arm → Follow → Search → Land.</strong> The state machine never lets ' +
          'the controller fly blind: tag lost > 0.5 s drops to <em>search</em>, > 5 s lands cleanly.</p>' +
          '<p>The <em>same</em> state machine wraps both ArUco and face controllers — only the perception input changes.</p>',
        files: [
          { name: 'state_machine.py', plus: '+71', minus: '−12', color: 'var(--onyx-outline)' },
          { name: 'tello_action.py',  plus: '+9',  minus: '−1',  color: 'var(--forest-green-action)' },
        ],
        codeTab: 'state_machine.py',
        codeMeta: 'my_drone_vision · safety wrapper',
      },
    ];

    const TICK_MS = 50;
    const DURATION = 7000;
    const RESUME_AFTER = 6000;

    const sideEl     = document.getElementById('cd-side');
    const stageBtns  = sideEl.querySelectorAll('.cd-stage');
    const barEl      = document.getElementById('cd-bar');
    const eyebrowEl  = document.getElementById('cd-mid-eyebrow');
    const titleEl    = document.getElementById('cd-mid-title');
    const promptEl   = document.getElementById('cd-mid-prompt');
    const thoughtEl  = document.getElementById('cd-mid-thought');
    const bodyEl     = document.getElementById('cd-mid-body');
    const filesEl    = document.getElementById('cd-mid-files');
    const codeTabEl  = document.getElementById('cd-code-tab');
    const codeMetaEl = document.getElementById('cd-code-meta');
    const codePanes  = root.querySelectorAll('.cd-code-pane');
    const toggleBtn  = document.getElementById('cd-toggle');
    const toggleLbl  = toggleBtn.querySelector('.cd-toggle-label');

    let idx = 0;
    let elapsed = 0;
    let userPaused = false;
    let suspendUntil = 0;
    let hovering = false;
    let inView = true;

    function activate(i) {
      idx = i;
      elapsed = 0;
      const s = STAGES[i];

      stageBtns.forEach((btn, j) => {
        btn.classList.toggle('active', j === i);
        btn.classList.toggle('done', j < i);
      });

      eyebrowEl.textContent = s.eyebrow;
      titleEl.textContent   = s.title;
      promptEl.textContent  = s.prompt;
      thoughtEl.textContent = s.thought;
      bodyEl.innerHTML      = s.body;
      filesEl.innerHTML = s.files.map(f =>
        '<div class="cd-mid-file">' +
          '<span class="icon-dot" style="background:' + f.color + ';"></span>' +
          '<span>' + f.name + '</span>' +
          '<span class="delta">' + f.plus + '</span>' +
          '<span class="delta-rm">' + f.minus + '</span>' +
        '</div>'
      ).join('');

      codeTabEl.querySelector('span:first-child').textContent = s.codeTab;
      codeMetaEl.textContent = s.codeMeta;
      codePanes.forEach(p => p.classList.toggle('active', p.dataset.pane === s.id));

      barEl.style.width = '0%';
    }

    function setPlaying(playing) {
      userPaused = !playing;
      toggleBtn.classList.toggle('paused', !playing);
      toggleLbl.textContent = playing ? 'Auto · Playing' : 'Paused';
    }

    setInterval(() => {
      const now = Date.now();
      const softPaused = hovering || now < suspendUntil || !inView;
      if (userPaused || softPaused) return;

      elapsed += TICK_MS;
      if (elapsed >= DURATION) {
        activate((idx + 1) % STAGES.length);
      } else {
        barEl.style.width = (elapsed / DURATION * 100).toFixed(2) + '%';
      }
    }, TICK_MS);

    stageBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        const target = btn.dataset.stage;
        const i = STAGES.findIndex(s => s.id === target);
        if (i < 0) return;
        activate(i);
        suspendUntil = Date.now() + RESUME_AFTER;
      });
    });

    root.addEventListener('mouseenter', () => { hovering = true; });
    root.addEventListener('mouseleave', () => { hovering = false; });

    toggleBtn.addEventListener('click', () => {
      setPlaying(userPaused);
      if (!userPaused) suspendUntil = 0;
    });

    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver((entries) => {
        inView = entries[0].isIntersecting;
      }, { threshold: 0.15 });
      io.observe(root);
    }

    activate(0);
  })();

  // Tab switching for all code-window groups
  document.querySelectorAll('.code-window').forEach(win => {
    const tabs  = win.querySelectorAll('.code-tab');
    const panes = win.querySelectorAll('.code-pane');
    const copy  = win.querySelector('.code-copy');

    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const target = tab.dataset.tab;
        tabs.forEach(t => t.classList.toggle('active', t === tab));
        panes.forEach(p => p.classList.toggle('active', p.id === target));
        if (copy) copy.dataset.copy = target;
      });
    });

    if (copy) {
      copy.addEventListener('click', async () => {
        const target = copy.dataset.copy;
        const pane = win.querySelector('#' + target + ' pre');
        if (!pane) return;
        try {
          await navigator.clipboard.writeText(pane.innerText);
          const orig = copy.textContent;
          copy.textContent = '✓ Copied';
          copy.classList.add('copied');
          setTimeout(() => {
            copy.textContent = orig;
            copy.classList.remove('copied');
          }, 1400);
        } catch {}
      });
    }
  });

  // Optional: section highlighting on scroll for nav (lightweight)
  const navLinks = document.querySelectorAll('.nav ul a');
  const sections = Array.from(navLinks).map(a => document.querySelector(a.getAttribute('href'))).filter(Boolean);
  const onScroll = () => {
    const y = window.scrollY + 120;
    let active = sections[0];
    for (const s of sections) { if (s.offsetTop <= y) active = s; }
    navLinks.forEach(a => {
      const match = a.getAttribute('href') === '#' + (active && active.id);
      a.style.color = match ? 'var(--inkwell)' : '';
    });
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // ───────────── Online sim · interactive AR-tag follower ─────────────
  (function () {
    const root   = document.getElementById('os-root');
    if (!root) return;
    const stage  = document.getElementById('os-stage');
    const cv     = document.getElementById('os-canvas');
    const hint   = document.getElementById('os-hint');

    const btnOrbit = document.getElementById('os-orbit');
    const btnVec   = document.getElementById('os-vec');
    const btnRing  = document.getElementById('os-ring');
    const btnHide  = document.getElementById('os-hide');
    const btnReset = document.getElementById('os-reset');

    const elState = document.getElementById('os-state-name');
    const elDot   = document.getElementById('os-state-dot');
    const elVx    = document.getElementById('os-vx');
    const elVy    = document.getElementById('os-vy');
    const elYaw   = document.getElementById('os-yaw');
    const elDist  = document.getElementById('os-dist');
    const elLoss  = document.getElementById('os-loss');

    const ctx = cv.getContext('2d');

    // ── world / view ──────────────────────────────────────────────
    let W = 1200, H = 600, dpr = 1;
    function resize() {
      const r = stage.getBoundingClientRect();
      dpr = window.devicePixelRatio || 1;
      W = r.width; H = r.height;
      cv.width  = W * dpr;
      cv.height = H * dpr;
      cv.style.width  = W + 'px';
      cv.style.height = H + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    new ResizeObserver(resize).observe(stage);
    resize();

    // ── PARAMS · mirror project values ────────────────────────────
    // Pixel scale: 100 px = 1 m (so target_dist = 1.5 m → 150 px)
    const TARGET_DIST = 150;
    const Kp_fwd = 0.020, Kd_fwd = 0.18;
    const Kp_side = 0.025, Kd_side = 0.18;
    const Kp_yaw = 1.4,    Kd_yaw  = 0.4;
    const ALPHA  = 0.4;                      // EMA · LPF strength
    const MAX_V  = 320;                      // px/s clamp
    const MAX_W  = 2.0;                      // rad/s yaw clamp
    const ARM_T  = 1.5;                      // s of stable tag → ARM
    const SEARCH_T = 0.8;                    // s of loss → SEARCH
    const LAND_T   = 4.0;                    // s of loss → LAND

    // ── state ─────────────────────────────────────────────────────
    let marker, drone, lpf_fwd, lpf_side, lpf_yaw,
        prev_e_fwd, prev_e_side, prev_e_yaw,
        state, lostT, armT, t,
        orbitT, lastInteract, hideTag, autoOrbit, showVec, showRing;

    function reset() {
      marker = { x: W * 0.65, y: H * 0.45 };
      drone  = { x: W * 0.30, y: H * 0.55, yaw: 0, vx: 0, vy: 0, w: 0 };
      lpf_fwd = lpf_side = lpf_yaw = 0;
      prev_e_fwd = prev_e_side = prev_e_yaw = 0;
      state = 'IDLE'; lostT = 0; armT = 0; t = 0; orbitT = 0;
      lastInteract = performance.now();
    }

    autoOrbit = true; showVec = true; showRing = true; hideTag = false;
    reset();

    // ── controls ──────────────────────────────────────────────────
    function toggle(btn, value) {
      btn.classList.toggle('on', value);
    }
    btnOrbit.addEventListener('click', () => { autoOrbit = !autoOrbit; toggle(btnOrbit, autoOrbit); });
    btnVec  .addEventListener('click', () => { showVec   = !showVec;   toggle(btnVec, showVec); });
    btnRing .addEventListener('click', () => { showRing  = !showRing;  toggle(btnRing, showRing); });
    btnHide .addEventListener('click', () => { hideTag   = !hideTag;   toggle(btnHide, hideTag); });
    btnReset.addEventListener('click', () => { reset(); });

    // ── drag ──────────────────────────────────────────────────────
    let dragging = false, dragOffX = 0, dragOffY = 0;
    function pointerPos(e) {
      const r = stage.getBoundingClientRect();
      const p = e.touches ? e.touches[0] : e;
      return { x: p.clientX - r.left, y: p.clientY - r.top };
    }
    function startDrag(e) {
      const p = pointerPos(e);
      const dx = p.x - marker.x, dy = p.y - marker.y;
      const r = 56;
      if (dx*dx + dy*dy <= r*r) {
        dragging = true;
        stage.classList.add('dragging');
        dragOffX = dx; dragOffY = dy;
        autoOrbit = false; toggle(btnOrbit, false);
        lastInteract = performance.now();
        if (hint) hint.classList.add('fade');
        e.preventDefault();
      }
    }
    function moveDrag(e) {
      if (!dragging) return;
      const p = pointerPos(e);
      marker.x = Math.max(20, Math.min(W - 20, p.x - dragOffX));
      marker.y = Math.max(20, Math.min(H - 20, p.y - dragOffY));
      lastInteract = performance.now();
      e.preventDefault();
    }
    function endDrag() {
      if (!dragging) return;
      dragging = false;
      stage.classList.remove('dragging');
    }
    stage.addEventListener('mousedown',  startDrag);
    window.addEventListener('mousemove', moveDrag);
    window.addEventListener('mouseup',   endDrag);
    stage.addEventListener('touchstart', startDrag, { passive: false });
    window.addEventListener('touchmove', moveDrag, { passive: false });
    window.addEventListener('touchend',  endDrag);

    // ── PD step ────────────────────────────────────────────────────
    function step(dt) {
      // Auto-orbit · Lissajous (figure-eight) when idle
      const idleMs = performance.now() - lastInteract;
      if (autoOrbit && !dragging && idleMs > 1500) {
        orbitT += dt;
        const cx = W * 0.55, cy = H * 0.50;
        const ax = Math.min(W * 0.30, 320);
        const ay = Math.min(H * 0.30, 180);
        marker.x = cx + ax * Math.sin(orbitT * 0.55);
        marker.y = cy + ay * Math.sin(orbitT * 1.10);    // 1:2 frequency
      } else {
        // bias orbit phase so resuming feels continuous
        orbitT += dt * 0.0;
      }

      const tagSeen = !hideTag;
      if (tagSeen) lostT = 0;
      else lostT += dt;

      // ── state machine ────────────────────────────────────────
      if (state === 'IDLE') {
        if (tagSeen) { armT += dt; if (armT > ARM_T) { state = 'ARM'; armT = 0; } }
        else armT = 0;
      } else if (state === 'ARM') {
        // brief takeoff hold
        armT += dt;
        if (armT > 0.6) { state = 'FOLLOW'; }
      } else if (state === 'FOLLOW') {
        if (!tagSeen && lostT > SEARCH_T) state = 'SEARCH';
      } else if (state === 'SEARCH') {
        if (tagSeen) { state = 'FOLLOW'; }
        else if (lostT > LAND_T) state = 'LAND';
      } else if (state === 'LAND') {
        // sticky — until reset
      }

      // ── controller ────────────────────────────────────────────
      let cmd_vx = 0, cmd_vy = 0, cmd_w = 0;
      if (state === 'FOLLOW' && tagSeen) {
        const dx = marker.x - drone.x;
        const dy = marker.y - drone.y;
        const dist = Math.hypot(dx, dy);
        const dirx = dx / (dist || 1);
        const diry = dy / (dist || 1);

        // Forward error: how far we are from the target distance
        const e_fwd = dist - TARGET_DIST;
        const de_fwd = e_fwd - prev_e_fwd; prev_e_fwd = e_fwd;
        lpf_fwd = ALPHA * de_fwd + (1 - ALPHA) * lpf_fwd;
        const speed = Kp_fwd * e_fwd + Kd_fwd * lpf_fwd;

        // Velocity along the bearing to the marker
        cmd_vx = Math.max(-MAX_V/100, Math.min(MAX_V/100, speed)) * dirx * 100;
        cmd_vy = Math.max(-MAX_V/100, Math.min(MAX_V/100, speed)) * diry * 100;

        // Yaw error: align drone heading with bearing to marker
        const target_yaw = Math.atan2(dy, dx);
        let e_yaw = target_yaw - drone.yaw;
        while (e_yaw >  Math.PI) e_yaw -= 2 * Math.PI;
        while (e_yaw < -Math.PI) e_yaw += 2 * Math.PI;
        const de_yaw = e_yaw - prev_e_yaw; prev_e_yaw = e_yaw;
        lpf_yaw = ALPHA * de_yaw + (1 - ALPHA) * lpf_yaw;
        cmd_w = Kp_yaw * e_yaw + Kd_yaw * lpf_yaw;
        cmd_w = Math.max(-MAX_W, Math.min(MAX_W, cmd_w));
      } else if (state === 'SEARCH') {
        // yaw scan, slow drift to halt
        cmd_w = 1.4;
        cmd_vx = drone.vx * 0.92;
        cmd_vy = drone.vy * 0.92;
      } else if (state === 'LAND') {
        cmd_vx = drone.vx * 0.85;
        cmd_vy = drone.vy * 0.85;
        cmd_w = 0;
      } else {
        // IDLE / ARM
        cmd_vx = 0; cmd_vy = 0; cmd_w = 0;
      }

      drone.vx = cmd_vx;
      drone.vy = cmd_vy;
      drone.w  = cmd_w;
      drone.x += drone.vx * dt;
      drone.y += drone.vy * dt;
      drone.yaw += drone.w * dt;
      // wrap yaw
      while (drone.yaw >  Math.PI) drone.yaw -= 2 * Math.PI;
      while (drone.yaw < -Math.PI) drone.yaw += 2 * Math.PI;
    }

    // ── trail ─────────────────────────────────────────────────────
    const trail = [];
    function pushTrail() {
      trail.push({ x: drone.x, y: drone.y });
      if (trail.length > 80) trail.shift();
    }

    // ── draw ──────────────────────────────────────────────────────
    function drawArucoMarker(x, y, size, faded) {
      const half = size / 2;
      ctx.save();
      ctx.translate(x, y);
      // Drop shadow
      ctx.shadowColor = 'rgba(0,0,0,0.18)';
      ctx.shadowBlur = 16;
      ctx.shadowOffsetY = 4;
      // Outer black border
      ctx.fillStyle = faded ? '#7a7974' : '#141414';
      ctx.fillRect(-half, -half, size, size);
      ctx.shadowColor = 'transparent';
      // Inner white
      const inner = size * 0.78;
      ctx.fillStyle = '#fafaf7';
      ctx.fillRect(-inner/2, -inner/2, inner, inner);
      // 5x5 black/white pattern (fixed; mimics ID 0)
      const cell = inner / 5;
      const pat = [
        [1,0,1,0,1],
        [0,1,1,1,0],
        [1,1,0,1,1],
        [0,1,1,1,0],
        [1,0,1,0,1],
      ];
      ctx.fillStyle = faded ? '#7a7974' : '#141414';
      for (let r = 0; r < 5; r++) for (let c = 0; c < 5; c++) {
        if (pat[r][c]) ctx.fillRect(-inner/2 + c*cell, -inner/2 + r*cell, cell, cell);
      }
      ctx.restore();
    }

    function drawDrone(d) {
      ctx.save();
      ctx.translate(d.x, d.y);
      ctx.rotate(d.yaw);
      // shadow
      ctx.shadowColor = 'rgba(0,0,0,0.20)';
      ctx.shadowBlur = 14;
      ctx.shadowOffsetY = 5;
      // body
      ctx.fillStyle = '#262510';
      ctx.beginPath();
      ctx.arc(0, 0, 12, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowColor = 'transparent';
      // arms
      ctx.strokeStyle = '#262510';
      ctx.lineWidth = 4;
      ctx.lineCap = 'round';
      const r = 22;
      [[-1,-1],[1,-1],[-1,1],[1,1]].forEach(([sx, sy]) => {
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(sx * r * 0.7, sy * r * 0.7);
        ctx.stroke();
      });
      // rotors (blurred)
      ctx.fillStyle = 'rgba(245,78,0,0.18)';
      [[-1,-1],[1,-1],[-1,1],[1,1]].forEach(([sx, sy]) => {
        ctx.beginPath();
        ctx.arc(sx * r * 0.7, sy * r * 0.7, 8, 0, Math.PI * 2);
        ctx.fill();
      });
      // facing arrow
      ctx.fillStyle = '#f54e00';
      ctx.beginPath();
      ctx.moveTo(16, 0);
      ctx.lineTo(8, -5);
      ctx.lineTo(8,  5);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }

    function draw() {
      ctx.clearRect(0, 0, W, H);

      // Connecting line + safe distance ring
      if (showRing && !hideTag) {
        ctx.strokeStyle = 'rgba(38,37,16,0.22)';
        ctx.setLineDash([6, 6]);
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.arc(marker.x, marker.y, TARGET_DIST, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      if (showVec && !hideTag) {
        ctx.strokeStyle = 'rgba(245,78,0,0.45)';
        ctx.lineWidth = 1.2;
        ctx.setLineDash([3, 4]);
        ctx.beginPath();
        ctx.moveTo(drone.x, drone.y);
        ctx.lineTo(marker.x, marker.y);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // Trail
      ctx.strokeStyle = 'rgba(38,37,16,0.18)';
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      trail.forEach((p, i) => {
        if (i === 0) ctx.moveTo(p.x, p.y); else ctx.lineTo(p.x, p.y);
      });
      ctx.stroke();

      // Marker
      drawArucoMarker(marker.x, marker.y, 64, hideTag);
      if (hideTag) {
        ctx.font = '11px JetBrains Mono, monospace';
        ctx.fillStyle = '#7a7974';
        ctx.textAlign = 'center';
        ctx.fillText('tag occluded', marker.x, marker.y + 56);
      }

      // Drone
      drawDrone(drone);

      // Velocity vector
      if (showVec) {
        const sp = Math.hypot(drone.vx, drone.vy);
        if (sp > 5) {
          ctx.strokeStyle = '#f54e00';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(drone.x, drone.y);
          ctx.lineTo(drone.x + drone.vx * 0.30, drone.y + drone.vy * 0.30);
          ctx.stroke();
        }
      }
    }

    // ── HUD ────────────────────────────────────────────────────────
    const STATE_COLOR = {
      IDLE:   ['var(--muted-stone)',         '#7a7974'],
      ARM:    ['var(--forest-green-action)', '#34785c'],
      FOLLOW: ['var(--chartreuse-alert)',    '#4ade80'],
      SEARCH: ['var(--goldenrod-accent)',    '#c08532'],
      LAND:   ['var(--onyx-outline)',        '#f54e00'],
    };
    function fmt(n, d) { return (n >= 0 ? '+' : '') + n.toFixed(d); }
    function updateHUD() {
      const [css, hex] = STATE_COLOR[state] || STATE_COLOR.IDLE;
      elState.firstChild && (elState.lastChild.textContent = state);
      elDot.style.background = hex;
      elState.lastChild && (elState.lastChild.nodeValue = state);
      // Re-render whole text safely:
      elState.innerHTML = '<span class="dot" style="background:' + hex + '"></span>' + state;

      // m/s · pixels → meters: 100 px = 1 m
      elVx.textContent  = fmt(drone.vx / 100, 2);
      elVy.textContent  = fmt(drone.vy / 100, 2);
      elYaw.textContent = fmt(drone.w, 2);
      const dist = Math.hypot(marker.x - drone.x, marker.y - drone.y);
      elDist.textContent = (dist / 100).toFixed(2) + ' m';
      elLoss.textContent = lostT.toFixed(1) + ' s';
      elLoss.classList.toggle('amber', lostT > SEARCH_T && lostT <= LAND_T);
      elLoss.classList.toggle('red',   lostT > LAND_T);
      elLoss.classList.toggle('muted', lostT === 0);
    }

    // ── loop ──────────────────────────────────────────────────────
    let last = performance.now();
    let trailTick = 0;
    function frame(now) {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      step(dt);
      trailTick += dt;
      if (trailTick > 0.05) { pushTrail(); trailTick = 0; }
      draw();
      updateHUD();
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  })();

  // ───────────── Architecture pipeline · mode toggle ─────────────
  (function () {
    const root = document.getElementById('pipeline');
    if (!root) return;
    const btns  = root.querySelectorAll('.pipeline-mode');
    const swaps = root.querySelectorAll('.swap');

    btns.forEach((b) => {
      b.addEventListener('click', () => {
        const mode = b.dataset.mode;
        if (root.dataset.mode === mode) return;
        // Fade swap labels out → switch text → fade in
        swaps.forEach(s => s.classList.add('fading'));
        setTimeout(() => {
          root.dataset.mode = mode;
          btns.forEach(x => x.classList.toggle('active', x === b));
          swaps.forEach(s => {
            const next = s.dataset[mode];
            if (next) s.textContent = next;
          });
          requestAnimationFrame(() => {
            swaps.forEach(s => s.classList.remove('fading'));
          });
        }, 180);
      });
    });
  })();

  // ───────────── Hero sim · same logic, no toolbar ─────────────
  (function () {
    const stage = document.getElementById('hero-sim-stage');
    const cv    = document.getElementById('hero-sim-canvas');
    const hint  = document.getElementById('hero-sim-hint');
    if (!stage || !cv) return;
    const ctx = cv.getContext('2d');

    let W = 600, H = 480, dpr = 1;
    function resize() {
      const r = stage.getBoundingClientRect();
      dpr = window.devicePixelRatio || 1;
      W = r.width; H = r.height;
      cv.width  = W * dpr;
      cv.height = H * dpr;
      cv.style.width  = W + 'px';
      cv.style.height = H + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    new ResizeObserver(resize).observe(stage);
    resize();

    // PARAMS · same as #online
    const TARGET_DIST = 110;
    const Kp_fwd = 0.020, Kd_fwd = 0.18;
    const Kp_yaw = 1.4,    Kd_yaw  = 0.4;
    const ALPHA  = 0.4;
    const MAX_V  = 320;
    const MAX_W  = 2.0;

    let marker = { x: W * 0.65, y: H * 0.40 };
    let drone  = { x: W * 0.30, y: H * 0.65, yaw: 0, vx: 0, vy: 0, w: 0 };
    let lpf_fwd = 0, lpf_yaw = 0;
    let prev_e_fwd = 0, prev_e_yaw = 0;
    let orbitT = 0;
    let lastInteract = performance.now();
    const trail = [];

    // Drag
    let dragging = false, dragOffX = 0, dragOffY = 0;
    function ptr(e) {
      const r = stage.getBoundingClientRect();
      const p = e.touches ? e.touches[0] : e;
      return { x: p.clientX - r.left, y: p.clientY - r.top };
    }
    stage.addEventListener('mousedown',  startDrag);
    window.addEventListener('mousemove', moveDrag);
    window.addEventListener('mouseup',   endDrag);
    stage.addEventListener('touchstart', startDrag, { passive: false });
    window.addEventListener('touchmove', moveDrag, { passive: false });
    window.addEventListener('touchend',  endDrag);
    function startDrag(e) {
      const p = ptr(e);
      const dx = p.x - marker.x, dy = p.y - marker.y;
      if (dx*dx + dy*dy <= 56*56) {
        dragging = true;
        dragOffX = dx; dragOffY = dy;
        lastInteract = performance.now();
        if (hint) hint.classList.add('fade');
        e.preventDefault();
      }
    }
    function moveDrag(e) {
      if (!dragging) return;
      const p = ptr(e);
      marker.x = Math.max(20, Math.min(W - 20, p.x - dragOffX));
      marker.y = Math.max(20, Math.min(H - 20, p.y - dragOffY));
      lastInteract = performance.now();
      e.preventDefault();
    }
    function endDrag() { dragging = false; }

    function step(dt) {
      // Auto-orbit when idle ≥ 1.5s
      const idle = performance.now() - lastInteract;
      if (!dragging && idle > 1500) {
        orbitT += dt;
        const cx = W * 0.55, cy = H * 0.45;
        const ax = Math.min(W * 0.28, 200);
        const ay = Math.min(H * 0.28, 130);
        marker.x = cx + ax * Math.sin(orbitT * 0.55);
        marker.y = cy + ay * Math.sin(orbitT * 1.10);
      }

      const dx = marker.x - drone.x;
      const dy = marker.y - drone.y;
      const dist = Math.hypot(dx, dy);
      const dirx = dx / (dist || 1);
      const diry = dy / (dist || 1);

      // forward PD
      const e_fwd = dist - TARGET_DIST;
      const de_fwd = e_fwd - prev_e_fwd; prev_e_fwd = e_fwd;
      lpf_fwd = ALPHA * de_fwd + (1 - ALPHA) * lpf_fwd;
      const speed = Kp_fwd * e_fwd + Kd_fwd * lpf_fwd;
      drone.vx = Math.max(-MAX_V/100, Math.min(MAX_V/100, speed)) * dirx * 100;
      drone.vy = Math.max(-MAX_V/100, Math.min(MAX_V/100, speed)) * diry * 100;

      // yaw PD
      const target_yaw = Math.atan2(dy, dx);
      let e_yaw = target_yaw - drone.yaw;
      while (e_yaw >  Math.PI) e_yaw -= 2 * Math.PI;
      while (e_yaw < -Math.PI) e_yaw += 2 * Math.PI;
      const de_yaw = e_yaw - prev_e_yaw; prev_e_yaw = e_yaw;
      lpf_yaw = ALPHA * de_yaw + (1 - ALPHA) * lpf_yaw;
      drone.w = Math.max(-MAX_W, Math.min(MAX_W, Kp_yaw * e_yaw + Kd_yaw * lpf_yaw));

      drone.x += drone.vx * dt;
      drone.y += drone.vy * dt;
      drone.yaw += drone.w * dt;
      while (drone.yaw >  Math.PI) drone.yaw -= 2 * Math.PI;
      while (drone.yaw < -Math.PI) drone.yaw += 2 * Math.PI;
    }

    function drawArucoMarker(x, y, size) {
      const half = size / 2;
      ctx.save();
      ctx.translate(x, y);
      ctx.shadowColor = 'rgba(0,0,0,0.18)';
      ctx.shadowBlur = 14; ctx.shadowOffsetY = 4;
      ctx.fillStyle = '#141414';
      ctx.fillRect(-half, -half, size, size);
      ctx.shadowColor = 'transparent';
      const inner = size * 0.78;
      ctx.fillStyle = '#fafaf7';
      ctx.fillRect(-inner/2, -inner/2, inner, inner);
      const cell = inner / 5;
      const pat = [
        [1,0,1,0,1],
        [0,1,1,1,0],
        [1,1,0,1,1],
        [0,1,1,1,0],
        [1,0,1,0,1],
      ];
      ctx.fillStyle = '#141414';
      for (let r = 0; r < 5; r++) for (let c = 0; c < 5; c++) {
        if (pat[r][c]) ctx.fillRect(-inner/2 + c*cell, -inner/2 + r*cell, cell, cell);
      }
      ctx.restore();
    }

    function drawDrone(d) {
      ctx.save();
      ctx.translate(d.x, d.y);
      ctx.rotate(d.yaw);
      ctx.shadowColor = 'rgba(0,0,0,0.20)';
      ctx.shadowBlur = 12; ctx.shadowOffsetY = 4;
      ctx.fillStyle = '#262510';
      ctx.beginPath();
      ctx.arc(0, 0, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowColor = 'transparent';
      ctx.strokeStyle = '#262510';
      ctx.lineWidth = 3.5;
      ctx.lineCap = 'round';
      const r = 18;
      [[-1,-1],[1,-1],[-1,1],[1,1]].forEach(([sx, sy]) => {
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(sx * r * 0.7, sy * r * 0.7);
        ctx.stroke();
      });
      ctx.fillStyle = 'rgba(245,78,0,0.18)';
      [[-1,-1],[1,-1],[-1,1],[1,1]].forEach(([sx, sy]) => {
        ctx.beginPath();
        ctx.arc(sx * r * 0.7, sy * r * 0.7, 6.5, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.fillStyle = '#f54e00';
      ctx.beginPath();
      ctx.moveTo(13, 0);
      ctx.lineTo(7, -4);
      ctx.lineTo(7,  4);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }

    function draw() {
      ctx.clearRect(0, 0, W, H);

      // safe ring
      ctx.strokeStyle = 'rgba(38,37,16,0.22)';
      ctx.setLineDash([5, 5]);
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(marker.x, marker.y, TARGET_DIST, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);

      // bearing line
      ctx.strokeStyle = 'rgba(245,78,0,0.40)';
      ctx.setLineDash([3, 4]);
      ctx.beginPath();
      ctx.moveTo(drone.x, drone.y);
      ctx.lineTo(marker.x, marker.y);
      ctx.stroke();
      ctx.setLineDash([]);

      // trail
      ctx.strokeStyle = 'rgba(38,37,16,0.18)';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      trail.forEach((p, i) => {
        if (i === 0) ctx.moveTo(p.x, p.y); else ctx.lineTo(p.x, p.y);
      });
      ctx.stroke();

      drawArucoMarker(marker.x, marker.y, 52);
      drawDrone(drone);
    }

    let last = performance.now(), trailT = 0;
    function frame(now) {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      step(dt);
      trailT += dt;
      if (trailT > 0.05) {
        trail.push({ x: drone.x, y: drone.y });
        if (trail.length > 70) trail.shift();
        trailT = 0;
      }
      draw();
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  })();