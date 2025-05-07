import { PluginSettingTab, App, Setting } from 'obsidian';
import WorkflowPlugin from './main';

export class SampleSettingTab extends PluginSettingTab {
	plugin: WorkflowPlugin;

	constructor(app: App, plugin: WorkflowPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		new Setting(containerEl)
			.setName('Setting #1')
			.setDesc('It\'s a secret')
			.addText(text => text
				.setPlaceholder('Enter your secret')
				.setValue(this.plugin.settings.mySetting)
				.onChange(async (value) => {
					this.plugin.settings.mySetting = value;
					await this.plugin.saveSettings();
				}));
	}
}
