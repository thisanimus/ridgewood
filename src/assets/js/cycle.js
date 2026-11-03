// Process carousel: advances the cycle one step clockwise, by button or every
// 6s on its own (with a Pause/Play toggle). All motion is CSS — this only
// bumps --turn, marks each step's position, and toggles .is-turning
// (transitions on, only while moving).
// Positions: 0 = active (12 o'clock), 1 = previous (3), 2 = opposite (6), 3 = next (9).
const AUTO_MS = 6000;
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');

document.querySelectorAll('[data-carousel]').forEach((root) => {
	const stage = root.querySelector('.carousel-stage');
	const slots = [...root.querySelectorAll('.carousel-slot')];
	// controls live in the copy block, tied to the carousel by aria-controls
	const next = document.querySelector(`.carousel-next[aria-controls="${root.id}"]`);
	const toggle = document.querySelector(`.carousel-toggle[aria-controls="${root.id}"]`);
	const status = root.querySelector('.carousel-status');
	const n = slots.length;
	let turn = 0; // never wraps, so the rotation always continues clockwise

	const render = () => {
		stage.style.setProperty('--turn', turn);
		slots.forEach((slot, i) => {
			const pos = (((turn - i) % n) + n) % n;
			slot.dataset.pos = pos;
			slot.inert = pos !== 0;
		});
	};

	let settle;
	const advance = () => {
		// transitions only exist while .is-turning is set; it must be on in the
		// same frame the positions change, and stays on until the motion settles
		stage.classList.add('is-turning');
		turn += 1;
		render();
		clearTimeout(settle);
		settle = setTimeout(() => stage.classList.remove('is-turning'), 1000);
	};

	// Auto-advance. Stopped by the Pause button (and from the start for
	// reduced-motion users, who can press Play to opt in); also held while the
	// active card is hovered, or the carousel or Next button has keyboard focus.
	let timer;
	let stopped = reducedMotion.matches;
	const held = () =>
		slots[turn % n].matches(':hover') ||
		root.contains(document.activeElement) ||
		document.activeElement === next;
	const schedule = () => {
		clearInterval(timer);
		if (!stopped) timer = setInterval(() => held() || advance(), AUTO_MS);
	};
	const setStopped = (value) => {
		stopped = value;
		toggle.setAttribute('aria-label', stopped ? 'Play' : 'Pause'); // icon-only button
		toggle.dataset.state = stopped ? 'paused' : 'playing';
		schedule();
	};
	reducedMotion.addEventListener('change', () => setStopped(reducedMotion.matches));
	toggle.hidden = false;
	toggle.addEventListener('click', () => setStopped(!stopped));

	next.hidden = false;
	next.addEventListener('click', () => {
		advance();
		schedule(); // a fresh 6s after a manual advance
		const active = slots[turn % n];
		status.textContent = `Step ${(turn % n) + 1} of ${n}: ${active.querySelector('.carousel-name').textContent}`;
	});

	render();
	setStopped(stopped);
});
