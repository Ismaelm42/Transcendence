export function showPromotionOptions() {

	document.getElementById("overlay")?.classList.remove("hidden");
	document.getElementById("modal")?.classList.remove("hidden");
}

export function hidePromotionOptions() {

	document.getElementById("overlay")?.classList.add("hidden");
	document.getElementById("modal")?.classList.add("hidden");
}
