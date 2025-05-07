import { App, Editor, MarkdownView, Modal, Notice, Plugin, setIcon, TFile } from 'obsidian';
import { SampleSettingTab } from './SampleSettingTab';
import { MessageCategory, messages } from './messages';


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
    status: string | null;
    description: string | null;
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
			new NoteInfoModal(this.app).open();
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
			new NoteInfoModal(this.app).open();
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
						new NoteInfoModal(this.app).open();
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

export class NoteInfoModal extends Modal {
    private file: TFile | null;
    
    constructor(app: App) {
        super(app);
        this.file = this.app.workspace.getActiveFile();
    }
    
    async onOpen() {
        const { contentEl } = this;
        
        // Apply some base styling to the modal
        contentEl.addClass('note-workflow-modal');
        
        // Get metadata
        const metadata = await this.getNoteMetadata();
        
        // Render title
        this.renderTitle(contentEl);
        
        // Render metadata in a box
        this.renderMetadataBox(contentEl, metadata);
        
        // Render workflow guidance
        this.renderWorkflowGuidance(contentEl, metadata);
        
        // Add interactive buttons
        this.addInteractionButtons(contentEl, metadata);
    }
    
    onClose() {
        const { contentEl } = this;
        contentEl.empty();
    }
    
	
    private renderTitle(container: HTMLElement): void {
        const titleEl = container.createEl('h1', { 
            text: 'Note Taking Workflow 1.0',
            cls: 'workflow-title'
        });
        
        // Add some styling to the title
        titleEl.style.borderBottom = '2px solid var(--interactive-accent)';
        titleEl.style.paddingBottom = '10px';
        titleEl.style.marginBottom = '20px';
        titleEl.style.color = 'var(--text-accent)';
    }
    
    private async getNoteMetadata(): Promise<NoteMetadata> {
        const metadata: NoteMetadata = {
            title: "No active file?!?",
            status: null,
            description: null,
            sources: 0,
            ankiCards: 0,
            illustration: false
        };
        
        if (!this.file) {
            return metadata;
        }
        
        metadata.title = this.file.basename;
        
        await this.app.fileManager.processFrontMatter(this.file, (frontmatter) => {
            metadata.status = frontmatter.status ?? metadata.status;
            metadata.description = frontmatter.description ?? metadata.description;
            // Additional counting logic here
        });
        
        return metadata;
    }
    
    private renderMetadataBox(container: HTMLElement, metadata: NoteMetadata): void {
        // Create a box for metadata
        const metadataBox = container.createEl('div', { cls: 'metadata-box' });
        
        // Style the box
        metadataBox.style.border = '1px solid var(--background-modifier-border)';
        metadataBox.style.borderRadius = '5px';
        metadataBox.style.padding = '15px';
        metadataBox.style.marginBottom = '20px';
        metadataBox.style.backgroundColor = 'var(--background-secondary)';
        
        // Add a metadata title
        metadataBox.createEl('h2', { 
            text: 'Current Note Metadata',
            cls: 'metadata-title'
        }).style.marginTop = '0';
        
        // Create a table for metadata
        const table = metadataBox.createEl('table');
        table.style.width = '100%';
        
        // Add table rows for each metadata item
        this.addMetadataRow(table, 'Title', metadata.title);
        this.addMetadataRow(table, 'Status', (metadata.status) ? metadata.status : messages[MessageCategory.STATUS_INDICATORS].MISSING);
        this.addMetadataRow(table, 'Description', (metadata.description ? metadata.description : messages[MessageCategory.STATUS_INDICATORS].MISSING));
        this.addMetadataRow(table, 'Sources', metadata.sources.toString());
        this.addMetadataRow(table, 'Anki Cards', metadata.ankiCards.toString());
        // this.addMetadataRow(table, 'Illustration', metadata.illustration ? '✅ Found' : '❌ Missing');
		this.addMetadataRow(table, 'Illustration', metadata.illustration ? 
            messages[MessageCategory.STATUS_INDICATORS].FOUND : 
            messages[MessageCategory.STATUS_INDICATORS].MISSING
        );
    }
    
	private addMetadataRow(table: HTMLTableElement, label: string, value: string): void {
        const row = table.createEl('tr');
        
        const labelCell = row.createEl('td', { text: label });
        labelCell.style.fontWeight = 'bold';
        labelCell.style.padding = '5px 10px 5px 0';
        labelCell.style.width = '30%';
        
        const valueCell = row.createEl('td', { text: value });
        valueCell.style.padding = '5px 0';
    }

	private renderWorkflowGuidance(container: HTMLElement, metadata: NoteMetadata): void {
		const guidanceBox = container.createEl('div', { cls: 'guidance-box' });
		
		// Style already applied via CSS
		
        // Add a heading
        guidanceBox.createEl('h3', { 
            text: 'Workflow Guidance', 
            cls: 'guidance-title' 
        });
		
		// Add the workflow guidance
		guidanceBox.createEl('p', { 
			text: 'To improve this note, focus on the following steps:'
		});
		
		// Add bullet points with more specific guidance
		const ul = guidanceBox.createEl('ul');
		
		if (metadata.status) {
			ul.createEl('li', { 
				text: 'Review and update the status to reflect the current stage of the note'
			});
		} else {
			ul.createEl('li').innerHTML = 'Missing status! Start with adding:  <strong>unprocessed</strong>';
	
		}

		if (metadata.description) {
			ul.createEl('li', { 
				text: 'Ensure the description succinctly captures the main idea of the note'
			});
		} else {
			ul.createEl('li').innerHTML = 'Missing description! Write something short for use with <strong>dataview</strong>';
		}
		
		ul.createEl('li', { 
			text: 'Verify all claims have proper sources cited (aim for at least 3 sources)'
		});
		
		ul.createEl('li', { 
			text: 'Create Anki cards for key concepts (minimum 3 recommended)'
		});
		
		ul.createEl('li', { 
			text: 'Add a visual element to enhance understanding (diagram, chart, or image)'
		});
	}
    
    private addInteractionButtons(container: HTMLElement, metadata: NoteMetadata): void {
        // Create a button container
        const buttonContainer = container.createEl('div', { cls: 'button-container' });
        
        // Style the button container
        buttonContainer.style.display = 'flex';
        buttonContainer.style.gap = '10px';
        buttonContainer.style.marginTop = '20px';
        buttonContainer.style.justifyContent = 'flex-end';
        
        // Add status button
        const statusButton = buttonContainer.createEl('button', { 
            text: 'Log Status',
            cls: 'mod-cta'
        });
        statusButton.addEventListener('click', () => {
            console.log(metadata.status);
        });
        
        // Add filename button
        const filenameButton = buttonContainer.createEl('button', {
            text: 'Log Filename'
        });
        filenameButton.addEventListener('click', () => {
            if (this.file) {
                console.log(this.file.basename);
            } else {
                console.log("No active file");
            }
        });
        
        // Add close button
        const closeButton = buttonContainer.createEl('button', {
            text: 'Close',
            cls: 'mod-warning'
        });
        closeButton.addEventListener('click', () => {
            this.close();
        });
    }
}



