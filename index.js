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

async function loadConfig() {
  try {
    const data = await fs.readFile(CONFIG_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return {};
  }
}

async function saveConfig(config) {
  await fs.writeFile(CONFIG_FILE, JSON.stringify(config, null, 2));
}

async function configureSettings() {
  const existingConfig = await loadConfig();

  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'location',
      message: 'Enter your default location:',
      default: existingConfig.location || '',
    },
    {
      type: 'input',
      name: 'apiKey',
      message: 'Enter your weather API key:',
      default: existingConfig.apiKey || '',
    },
  ]);

  await saveConfig(answers);

  console.log(chalk.green('Settings saved successfully!'));
  await sleep(1000);
}

const getIcon = (icon) => {
  switch (icon.slice(0, -1)) {
    case '01':
      return '☀️';
    case '02':
      return '🌤️';
    case '03':
      return '☁️';
    case '04':
      return '☁️';
    case '09':
      return '🌧️';
    case '10':
      return '🌦️';
    case '11':
      return '🌩️';
    case '13':
      return '❄️';
    case '50':
      return '🌫️';
    default:
      return '🌈';
  }
};

async function checkWeather() {
  const config = await loadConfig();
  if (!config.location || !config.apiKey) {
    console.log(chalk.red('Please configure your location and API key first.'));
    await sleep(1000);
    return;
  }

  const spinner = createSpinner('Fetching weather data...').start();
  try {
    const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${config.location}&appid=${config.apiKey}&units=metric`);
    const data = await response.json();

    if (data.cod !== 200) {
      spinner.error({ text: `Error: ${data.message}` });
      return;
    }

    spinner.success({ text: 'Weather data fetched successfully!' });

    console.log(chalk.bold(`\n🌎 Weather in ${data.name}`));
    console.log(`${getIcon(data.weather[0].icon)}  ${chalk.yellow(data.weather[0].main)} - ${chalk.italic(data.weather[0].description)}`);
    console.log(`🌡️ Temperature: ${data.main.temp.toFixed(1)}°C / ${(data.main.temp * 9/5 + 32).toFixed(1)}°F`);
    console.log(`🤔 Feels like: ${data.main.feels_like.toFixed(1)}°C / ${(data.main.feels_like * 9/5 + 32).toFixed(1)}°F`);
    console.log(`📈 Maximum temperature: ${chalk.red(data.main.temp_max.toFixed(1))}°C / ${chalk.red((data.main.temp_max * 9/5 + 32).toFixed(1))}°F`);
    console.log(`📉 Minimum temperature: ${chalk.blue(data.main.temp_min.toFixed(1))}°C / ${chalk.blue((data.main.temp_min * 9/5 + 32).toFixed(1))}°F`);
    console.log(`💧 Humidity: ${chalk.blue(data.main.humidity)}%`);

  } catch (error) {
    spinner.error({ text: `Error fetching weather data: ${error.message}` });
  }

  await sleep(2000);
}

async function start() {
    await welcome();
    await showMenu();
}

start();