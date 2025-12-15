/**
 * @param errors object or string containing errors from backend
 * use this function to format errors received from backend and display
 * with showMessage function
 * @returns error in a string format separated by new lines
 */
export	function formatErrors(errors: any): string {
	if (!errors) return "Bad request.";
	if (typeof errors === "string") return errors;
	if (Array.isArray(errors)) return errors.map(e => String(e)).join("\n");
	if (typeof errors === "object") {
		return Object.entries(errors)
			.flatMap(([key, value]) => {
				if (Array.isArray(value)) {
					return value.map(v => `${key}: ${v}`);
				}
				return `${key}: ${String(value)}`;
			})
			.join("\n");
	}
	return String(errors);
}