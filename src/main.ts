import { App, Editor, MarkdownView, Modal, Notice, Plugin, setIcon, TFile } from 'obsidian';
import { SampleSettingTab } from './SampleSettingTab';
import { getFrontmatterProperty, updateFrontmatterProperty } from './frontmatter-utils';


// Remember to rename these classes and interfaces!

export interface WorkflowSettings {
	mySetting: string;
	dailyNoteFolder: string;
	dailyNoteFormat: string;
}

const DEFAULT_SETTINGS: WorkflowSettings = {
	mySetting: 'default',
	dailyNoteFolder: '/Journal',
	dailyNoteFormat: 'YYYY-MM-DD'
}

interface NoteMetadata {
    title: string;
    status: string;
    description: string;
    sources: number;
    ankiCards: number;
    illustration: boolean;
}

export default class WorkflowPlugin extends Plugin {
	settings: WorkflowSettings;

	async onload() {
		await this.loadSettings();

		// This creates an icon in the left ribbon.
		const ribbonIconEl = this.addRibbonIcon('telescope', 'Sample Plugin', (evt: MouseEvent) => {
			// Called when the user clicks the icon.
			// new Notice('This is a notice!');
			new WorkflowModal(this.app).open();
		});
		// Perform additional things with the ribbon
		//ribbonIconEl.addClass('my-plugin-ribbon-class');

		// This adds a status bar item to the bottom of the app. Does not work on mobile apps.
		// const statusBarItemEl = this.addStatusBarItem();
		// statusBarItemEl.setText('telescope');
		// Inside your plugin's onload() method
		// const statusBarItemEl = this.addStatusBarItem();
		// statusBarItemEl.setText('🔭');
		const statusBarItemEl = this.addStatusBarItem();
		setIcon(statusBarItemEl, 'telescope'); // Replace 'star' with any Lucide icon name	

		// Add click handler to status bar item
		statusBarItemEl.onClickEvent(() => {
			// new Notice('No active pomodoro. Start one from the command palette.');
			new WorkflowModal(this.app).open();
		});

		// Add DEBUG command
		this.addCommand({
			id: 'test-wip',
			name: 'test wip',
			callback: () => {
				console.log("So many 🍅")
				// this.updatePomodoroCounter();
			}
		});

		// // This adds a simple command that can be triggered anywhere
		// this.addCommand({
		// 	id: 'open-sample-modal-simple',
		// 	name: 'Open sample modal (simple)',
		// 	callback: () => {
		// 		new SampleModal(this.app).open();
		// 	}
		// });
		// // This adds an editor command that can perform some operation on the current editor instance
		// this.addCommand({
		// 	id: 'sample-editor-command',
		// 	name: 'Sample editor command',
		// 	editorCallback: (editor: Editor, view: MarkdownView) => {
		// 		console.log(editor.getSelection());
		// 		editor.replaceSelection('Sample Editor Command');
		// 	}
		// });
		// This adds a complex command that can check whether the current state of the app allows execution of the command
		this.addCommand({
			id: 'open-workflow-modal',
			name: 'Open workflow modal',
			checkCallback: (checking: boolean) => {
				// Conditions to check
				const markdownView = this.app.workspace.getActiveViewOfType(MarkdownView);
				if (markdownView) {
					// If checking is true, we're simply "checking" if the command can be run.
					// If checking is false, then we want to actually perform the operation.
					if (!checking) {
						new WorkflowModal(this.app).open();
					}

					// This command will only show up in Command Palette when the check function returns true
					return true;
				}
			}
		});

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new SampleSettingTab(this.app, this));

		// If the plugin hooks up any global DOM events (on parts of the app that doesn't belong to this plugin)
		// Using this function will automatically remove the event listener when this plugin is disabled.
		// this.registerDomEvent(document, 'click', (evt: MouseEvent) => {
		// 	//REMOVEME
		// 	console.log('click', evt);
		// });

		// When registering intervals, this function will automatically clear the interval when the plugin is disabled.
		// this.registerInterval(window.setInterval(() => console.log('setInterval'), 5 * 60 * 1000));
	}

	onunload() {

	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

class WorkflowModal extends Modal {
	settings: WorkflowSettings;
	plugin: WorkflowPlugin;

	constructor(app: App) {
		super(app);
	}

	// Function to get note metadata from a file
	async getNoteMetadata(app: App, file: TFile | null): Promise<NoteMetadata> {
		// Default values
		const metadata: NoteMetadata = {
			title: "No active file?!?",
			status: "Status is not set",
			description: "Description is not set",
			sources: 0,
			ankiCards: 0,
			illustration: false
		};
		
		if (!file) {
			return metadata;
		}
		
		// Set title from the file
		metadata.title = file.basename;
		
		// Get frontmatter data
		await app.fileManager.processFrontMatter(file, (frontmatter) => {
			// Use optional chaining and nullish coalescing for cleaner code
			metadata.status = frontmatter.status ?? metadata.status;
			metadata.description = frontmatter.description ?? metadata.description;
			
			// You can add your counting logic here
			// metadata.sources = countSources(frontmatter);
			// metadata.ankiCards = countAnkiCards(frontmatter);
			// metadata.illustration = checkForIllustration(frontmatter);
		});
		
		return metadata;
	}

	// Function to render metadata to container
	renderMetadata(container: HTMLElement, metadata: NoteMetadata): void {
		container.createEl('h2', { text: `Current note: ${metadata.title}` });
		container.createEl('p', { text: `Current status: ${metadata.status}` });
		container.createEl('p', { text: `Description: ${metadata.description}` });
		container.createEl('p', { text: `No of sources: ${metadata.sources}` });
		container.createEl('p', { text: `No of Anki cards: ${metadata.ankiCards}` });
		container.createEl('p', { text: metadata.illustration ? "Found illustration(s)" : "Add an illustration" });
	}

	// Usage in your modal or component
	async displayNoteInfo(app: App, file: TFile | null, contentEl: HTMLElement): Promise<void> {
		const metadata = await this.getNoteMetadata(app, file);
		this.renderMetadata(contentEl, metadata);
	}

	async onOpen() {	
		const file = this.app.workspace.getActiveFile();
		this.displayNoteInfo(this.app, file, this.contentEl);
		
		this.contentEl.createEl('p', { text: "moar" });

		// const {contentEl} = this;
		// Create buttons container
		// const buttonContainer = contentEl.createDiv('button-container');
		// buttonContainer.style.display = 'flex';
		// buttonContainer.style.justifyContent = 'space-around';
		// buttonContainer.style.marginTop = '20px';
		
		// // Stop button
		// const stopBtn = buttonContainer.createEl('button', {text: 'Stop'});
		// stopBtn.addEventListener('click', () => {
		// 	// this.plugin.stopTimer();
		// 	this.close();
		// });
		
		// // Restart button
		// const restartBtn = buttonContainer.createEl('button', {text: 'Restart'});
		// restartBtn.addEventListener('click', () => {
		// 	// this.plugin.restartTimer();
		// 	this.close();
		// });
	}

	onClose() {
		const {contentEl} = this;
		contentEl.empty();
	}

	
}


