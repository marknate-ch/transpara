(() => {
  const scene = document.querySelector('.cinematic');
  if (!scene) return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const sky = scene.querySelector('.v3-sky');
  const pickup = scene.querySelector('.v3-pickup');
  const openDoor = scene.querySelector('.v3-pickup-open');
  const pilots = [...scene.querySelectorAll('.v3-pilot')];
  const terrain = scene.querySelector('.v3-terrain');
  const van = scene.querySelector('.v3-van');
  const dark = scene.querySelector('.v3-dark');
  const glow = scene.querySelector('.v3-road-glow');
  const transition = scene.querySelector('.v3-transition');
  const clouds = [...scene.querySelectorAll('.v3-cloud')];
  const stages = [...scene.querySelectorAll('[data-stage]')];
  const links = stages.map(stage => [...stage.querySelectorAll('a')]);
  const count = scene.querySelector('.cinematic-count');
  const bar = scene.querySelector('.cinematic-progress i');
  const stops = [0, .2, .35, .49, .72, .84, .96];
  const clamp = (n, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, n));
  const smooth = n => { const t = clamp(n); return t * t * (3 - 2 * t); };
  const phase = (p, a, b) => smooth((p - a) / (b - a));
  const lerp = (a, b, t) => a + (b - a) * t;
  const key = (p, points) => {
    if (p <= points[0][0]) return points[0][1];
    for (let i = 1; i < points.length; i++) {
      if (p <= points[i][0]) {
        const t = smooth((p - points[i - 1][0]) / (points[i][0] - points[i - 1][0]));
        return lerp(points[i - 1][1], points[i][1], t);
      }
    }
    return points.at(-1)[1];
  };
  const position = () => {
    const rect = scene.getBoundingClientRect();
    return clamp(-rect.top / Math.max(1, rect.height - innerHeight));
  };

  function paint(p) {
    const mobile = innerWidth <= 700;
    const dive = phase(p, .01, .31);
    const close = phase(p, .76, .84);
    const isolate = phase(p, .85, .94);
    const skyScale = key(p, [[0, 1.06], [.31, 1.7], [1, 1.7]]);
    sky.style.transform = 'translate3d(' + (-8*dive).toFixed(2) + 'vw,' + (-40*dive).toFixed(2) + 'vh,-120px) scale(' + skyScale.toFixed(3) + ') rotateX(' + (4*dive).toFixed(2) + 'deg)';
    sky.style.opacity = (1-phase(p,.31,.34)).toFixed(3);

    const pickupScale = key(p, [[0, 1.04], [.32, 1.06], [.49, 1.14], [.59, 1.26], [.69, mobile ? 3.5 : 4.1]]);
    const pickupX = mobile ? key(p, [[0, 45], [.32, 45], [.43, 35], [.5, 20], [.56, 5], [.69, -38]]) : key(p, [[0, 0], [.56, 0], [.69, -24]]);
    const pickupY = key(p, [[0, 22], [.32, 0], [.59, -3], [.69, 3]]);
    pickup.style.transform = 'translate(-50%,-50%) translate3d(' + pickupX.toFixed(2) + 'vw,' + pickupY.toFixed(2) + 'vh,0) scale(' + pickupScale.toFixed(3) + ')';
    pickup.style.clipPath = 'inset(' + ((1-phase(p,.18,.32))*100).toFixed(2) + '% 0 0 0)';
    pickup.style.opacity = (1-phase(p,.69,.715)).toFixed(3);
    pickup.style.filter = 'blur(' + (phase(p,.63,.7)*14).toFixed(1) + 'px)';
    openDoor.style.opacity = phase(p,.39,.47).toFixed(3);
    pilots.forEach((pilot,i) => {
      const walk = phase(p,i?.47:.44,i?.59:.57);
      const vanish = 1-phase(p,i?.63:.61,i?.68:.66);
      pilot.style.opacity = (phase(p,.31,.36)*vanish).toFixed(3);
      pilot.style.transform = 'translate3d(' + (walk*(i?45:60)).toFixed(1) + '%,' + (-walk*5).toFixed(1) + '%,0) scale(' + (1-walk*.18).toFixed(3) + ')';
      pilot.style.filter = 'blur(' + (phase(p,.58,.67)*7).toFixed(1) + 'px)';
    });

    const terrainY = key(p, [[0, 100], [.68, 70], [.72, -2], [.84, -12], [1, -12]]);
    const terrainScale = key(p, [[0, .78], [.68, .86], [.76, 1.15], [.85, 1.75], [1, 1.75]]);
    terrain.style.transform = 'translate3d(' + (-12*close).toFixed(2) + 'vw,' + terrainY.toFixed(2) + 'vh,0) scale(' + terrainScale.toFixed(3) + ') rotateX(' + key(p, [[0, 13], [.45, 0], [1, 0]]).toFixed(2) + 'deg)';
    terrain.style.opacity = (phase(p,.685,.71)*(1-phase(p,.85,.94))).toFixed(3);
    const vanScale = key(p, [[0, .22], [.7, .22], [.76, .92], [.84, 3.25], [.94, .84], [1, .84]]);
    const vanX = key(p, [[0, 27], [.7, 27], [.76, 19], [.84, 2], [.94, 17], [1, 17]]);
    const vanY = key(p, [[0, -4], [.76, -4], [.84, 43], [.94, 14], [1, 14]]);
    const vanTurn = key(p, [[0, -7], [.76, 0], [.84, 2], [.94, -2], [1, -2]]);
    const driverFocus = phase(p,.77,.84)*(1-phase(p,.86,.94));
    const roadApproach = phase(p,.76,.84);
    const framedX = mobile ? lerp(vanX - 30, vanX * 1.25, roadApproach) - 24 * isolate : vanX - key(p, [[0, 0], [.69, 9], [.71, 9], [.735, 0]]);
    const roadContact = mobile
      ? key(p, [[0, 0], [.69, 19], [.71, 18], [.72, 0]])
      : key(p, [[0, 0], [.69, 27], [.71, 25], [.735, 0]]);
    const framedY = (mobile ? vanY + 12 * (1-roadApproach) - 35 * driverFocus - 24 * isolate : vanY) + roadContact;
    van.style.transform = 'translate(-50%,-50%) translate3d(' + framedX.toFixed(2) + 'vw,' + framedY.toFixed(2) + 'vh,160px) rotateY(' + vanTurn.toFixed(2) + 'deg) scale(' + (vanScale*(mobile?.78:1)).toFixed(3) + ')';
    van.style.opacity = phase(p, .69, .71).toFixed(3);
    van.style.filter = 'drop-shadow(0 ' + lerp(2,36,isolate).toFixed(0) + 'px ' + lerp(3,42,isolate).toFixed(0) + 'px rgba(0,0,0,.48))';
    clouds.forEach((cloud, i) => {
      const offsets = [1, -1, .4];
      cloud.style.transform = 'translate3d(' + (offsets[i]*dive*54).toFixed(2) + 'vw,' + (dive*(34+i*13)).toFixed(2) + 'vh,' + ((i+1)*95*dive).toFixed(0) + 'px) scale(' + (1+dive*(1.4+i*.3)).toFixed(2) + ')';
      cloud.style.opacity = (1 - phase(p, .25, .34)).toFixed(3);
    });
    transition.style.opacity = (phase(p,.665,.69)*(1-phase(p,.705,.735))*.72).toFixed(3);
    dark.style.opacity = isolate.toFixed(3);
    glow.style.opacity = (isolate*.65).toFixed(3);

    const left = Math.max(0, stops.findLastIndex(stop => stop <= p));
    const right = Math.min(left+1, stops.length-1);
    const blend = left === right ? 0 : phase(p, stops[left], stops[right]);
    const active = blend < .5 ? left : right;
    stages.forEach((stage, i) => {
      let opacity = i === left ? 1 - phase(blend,.3,.55) : i === right ? phase(blend,.5,.75) : 0;
      if (i === 5 && p >= .87) opacity = 1 - phase(p,.87,.9);
      if (i === 6) opacity = phase(p,.95,.98);
      stage.style.opacity = opacity.toFixed(3);
      stage.style.pointerEvents = i === active && opacity > .5 ? 'auto' : 'none';
      stage.style.transform = mobile ? 'translate3d(0,' + ((1-opacity)*18).toFixed(1) + 'px,0)' : 'translate3d(0,calc(-42% + ' + ((1-opacity)*24).toFixed(1) + 'px),0)';
      stage.setAttribute('aria-hidden', String(i !== active || opacity <= .5));
      links[i].forEach(a => { a.tabIndex = i === active && opacity > .5 ? 0 : -1; });
    });
    count.textContent = String(active+1).padStart(2,'0') + ' / 07';
    bar.style.width = (p*100).toFixed(1) + '%';
  }

  if (reduced.matches) {
    scene.classList.add('v3-reduced');
    paint(0);
    return;
  }
  let rendered = position();
  let running = false;
  function tick() {
    const target = position();
    rendered += (target-rendered) * (innerWidth<=700?.24:.17);
    if (Math.abs(target-rendered)<.0005) rendered = target;
    paint(rendered);
    if (rendered !== target) requestAnimationFrame(tick);
    else running = false;
  }
  function schedule() { if (!running) { running = true; requestAnimationFrame(tick); } }
  addEventListener('scroll', schedule, {passive:true});
  addEventListener('resize', schedule);
  paint(rendered);
})();
