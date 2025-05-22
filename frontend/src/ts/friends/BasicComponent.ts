export abstract class BasicComponent {
	private templatePath: string;
	private scriptHandler?: () => void;
	protected el?: HTMLElement;
  
	constructor(templatePath: string, scriptHandler?: () => void) {
	  this.templatePath = templatePath;
	  this.scriptHandler = scriptHandler;
	}
  
	async render(target: HTMLElement, placeholders: Record<string, string> = {}) {
	  const html = await this.loadTemplate();
	  const parsed = this.replacePlaceholders(html, placeholders);
	  const wrapper = document.createElement('div');
	  wrapper.innerHTML = parsed;
  
	  this.el = wrapper.firstElementChild as HTMLElement;
	  target.appendChild(this.el);
  
	  if (this.scriptHandler) this.scriptHandler();
	}
  
	private async loadTemplate(): Promise<string> {
	  const response = await fetch(this.templatePath);
	  return await response.text();
	}
  
	private replacePlaceholders(template: string, data: Record<string, string>): string {
	  return template.replace(/\{\{(.*?)\}\}/g, (_, key) => {
		const trimmedKey = key.trim();
		if (!(trimmedKey in data)) {
		  console.warn(`Missing placeholder key: ${trimmedKey}`);
		}
		return data[trimmedKey] || '';
	  });
	}
  }
  