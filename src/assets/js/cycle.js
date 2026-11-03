const AUTO_MS = 6000;
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');

document.querySelectorAll('[data-carousel]').forEach((root) => {
	const stage = root.querySelector('.carousel-stage');
	const slots = [...root.querySelectorAll('.carousel-slot')];
	const next = document.querySelector(`.carousel-next[aria-controls="${root.id}"]`);
	const toggle = document.querySelector(`.carousel-toggle[aria-controls="${root.id}"]`);
	const status = root.querySelector('.carousel-status');
	const n = slots.length;
	let turn = 0;

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
		stage.classList.add('is-turning');
		turn += 1;
		render();
		clearTimeout(settle);
		settle = setTimeout(() => stage.classList.remove('is-turning'), 1000);
	};

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
		toggle.setAttribute('aria-label', stopped ? 'Play' : 'Pause');
		toggle.dataset.state = stopped ? 'paused' : 'playing';
		schedule();
	};
	reducedMotion.addEventListener('change', () => setStopped(reducedMotion.matches));
	toggle.hidden = false;
	toggle.addEventListener('click', () => setStopped(!stopped));

	next.hidden = false;
	next.addEventListener('click', () => {
		advance();
		schedule();
		const active = slots[turn % n];
		status.textContent = `Step ${(turn % n) + 1} of ${n}: ${active.querySelector('.carousel-name').textContent}`;
	});

	render();
	setStopped(stopped);
});
