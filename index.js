#!/usr/bin/env node

import chalk from 'chalk';
import inquirer from 'inquirer';
import gradient from 'gradient-string';
import chalkAnimation from 'chalk-animation';
import figlet from 'figlet';
import { createSpinner } from 'nanospinner';
import fetch from 'node-fetch';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const CONFIG_FILE = path.join(process.cwd(), 'weather-cli-config.json');

const sleep = (ms = 2000) => new Promise((r) => setTimeout(r, ms));

async function welcome() {
    const rainbowTitle = chalkAnimation.rainbow('Welcome to the Weather CLI!\n');
    await sleep();
    rainbowTitle.stop();
    
    console.log(
      gradient.pastel.multiline(figlet.textSync('WEATHER CLI', { horizontalLayout: 'full' }))
    );
  
    console.log(chalk.greenBright('Get the weather via the command line!\n'));
}

async function showMenu() {
    const answers = await inquirer.prompt([
      {
        type: 'list',
        name: 'action',
        message: 'What would you like to do?',
        choices: [
          'Check the Weather (Simple)',
          'Check the Weather (Advanced)',
          'Configure Settings',
          'Exit'
        ]
      }
    ]);
  
    switch (answers.action) {
      case 'Check the Weather (Simple)':
        await checkWeather();
        break;
      case 'Check the Weather (Advanced)':
        await advanceWeather();
        break;
      case 'Configure Settings':
        await configureSettings();
        break;
      case 'Exit':
        console.log(chalk.blue('Goodbye!'));
        process.exit(0);
    }
  
    await showMenu();
}


async function start() {
    await welcome();
    await showMenu();
}

start();