import React, { useState } from 'react';
import { Box, Text, useApp } from 'ink';
import TextInput from 'ink-text-input';
import dashify from 'dashify';
import { execa } from 'execa';
import { execFile } from 'child_process';
import SelectInput from 'ink-select-input';

type GitAppState = 'create-branch' | 'something-else';

const items: { label: string; value: GitAppState }[] = [
	{ label: 'Create branch', value: 'create-branch' },
	{ label: 'Something else', value: 'something-else' },
];

export function GitApp() {
	const { exit } = useApp();
	const [branchName, setBranchName] = useState<string>('');
	const [gitAppState, setGitAppState] = useState<GitAppState | null>(null);

	const handleBranchSubmit = async (value: string) => {
		const pattern = /[A-Z]{3,4}-\d+\s/;

		const match = value.match(pattern);
		const [prefix] = match;
		const description = value.replace(prefix, '');

		const gitBranchName = `${prefix.replace(' ', '')}-${dashify(description)}`;

		console.log(gitBranchName, match);

		try {
			const { stdout: chStdout } = await execa('git', ['checkout', '-b', gitBranchName]);
			console.log('Checkout', chStdout);

			const { stdout: addStdout } = await execa('git', ['add', '.']);
			console.log('Add', addStdout);

			const { stdout: commitStdout } = await execa('git', ['commit', '-m', value]);
			console.log('Commit', commitStdout);
		} catch (error) {
			console.log(error);
		}

		exit();
	};

	if (!gitAppState) {
		return (
			<>
				<Text color={'yellow'}>Select a Git option:</Text>
				<SelectInput items={items} onSelect={(item) => setGitAppState(item.value)} />
			</>
		);
	}

	if (gitAppState === 'create-branch') {
		return (
			<>
				<Box borderColor={'green'}>
					<Text color={'yellow'}>
						Name your branch <Text color={'gray'}>(eg. FMS-420 My branch name)</Text>:
					</Text>
				</Box>
				<TextInput
					value={branchName}
					onChange={(value) => setBranchName(value)}
					onSubmit={handleBranchSubmit}
				></TextInput>
			</>
		);
	}

	if (gitAppState === 'something-else') {
		return (
			<>
				<Box width={80} borderStyle={'single'} borderColor={'green'}>
					<Text>Something else</Text>
				</Box>
			</>
		);
	}
}
