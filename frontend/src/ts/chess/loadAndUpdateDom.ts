
export async function saveNotation() {

	const notationsItems = document.getElementById('notations-items');
	localStorage.setItem('notationHTML', notationsItems!.innerHTML);
}

export async function loadNotation() {

	const saved = localStorage.getItem('notationHTML');
	if (saved) {
		const notationsItems = document.getElementById('notations-items');
		if (notationsItems)
			notationsItems.innerHTML = saved;
	}
}

export function deleteNotation() {

	const notationsItems = document.getElementById('notations-items');

	if (notationsItems)
		notationsItems.innerHTML = '';
	localStorage.removeItem('notationHTML');
}
