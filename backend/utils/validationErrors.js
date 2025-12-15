/**
 * 
 * @param {*} zErr object returned by zod validation
 * @description formats zod validation errors into a more readable object
 * @returns plain string object with field names as keys and error messages as values
 */
export function formatZodError(zErr) {
	const fieldErrors = {};
	if (!zErr) return fieldErrors;

	if (Array.isArray(zErr.errors)) {
		zErr.errors.forEach(e => {
			const key = e.path && e.path.length ? e.path.join('.') : '_';
			fieldErrors[key] = fieldErrors[key] ? fieldErrors[key] + '; ' + e.message : e.message;
		});
		return fieldErrors;
	}

	if (typeof zErr.format === 'function') {
		const formatted = zErr.format();
		const flatten = (obj, prefix = '') => {
			for (const k in obj) {
				if (!Object.prototype.hasOwnProperty.call(obj, k)) continue;
				if (k === '_errors') {
					if (obj[k] && obj[k].length) {
						const fieldKey = prefix.slice(0, -1) || '_';
						fieldErrors[fieldKey] = fieldErrors[fieldKey]
							? fieldErrors[fieldKey] + '; ' + obj[k].join('; ')
							: obj[k].join('; ');
					}
				} else if (typeof obj[k] === 'object' && obj[k] !== null) {
					flatten(obj[k], prefix + k + '.');
				}
			}
		};
		flatten(formatted);
	}

	return fieldErrors;
	 
	// to see how zerr is shown with no format comment the code above and uncomment below
	// go to register and try to register with invalid data
	//return zErr;

}

export default formatZodError;
