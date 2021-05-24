#!/usr/bin/env node
const fs = require('fs');
const program = require('commander');
const download = require('download-git-repo');
const handlebars = require('handlebars');
const inquirer = require('inquirer');
const ora = require('ora');
const chalk = require('chalk');
program.version('1.0.0', '-v, --version')
    .command('init <name>')
    .action((name) => {
        if(!fs.existsSync(name)){
            inquirer.prompt([
                {
                    name: 'description',
                    message: '请输入项目描述'
                },
                {
                    name: 'author',
                    message: '请输入作者名称'
                }
            ]).then((answers) => {
                const spinner = ora('正在下载模板...');
                spinner.start();
                download('direct:https://github.com/running-snail-sfs/react-template.git#main', name, {clone: true}, (err) => {
                    if(err){
                        spinner.fail();
                        console.log(err);
                    }else{
                        spinner.succeed();
                        const fileName = `${name}/package.json`;
                        const meta = {
                            name,
                            description: answers.description,
                            author: answers.author
                        }
                        if(fs.existsSync(fileName)){
                            const content = fs.readFileSync(fileName).toString();
                            const result = handlebars.compile(content)(meta);
                            fs.writeFileSync(fileName, result);
                        }
                        console.log(chalk.green('正在初始化项目，可能需要一会...'));
                        const exec = require('child_process').exec;
                        const cwd = `./${name}`
                        const cmdStr = `npm install`;
                        exec(cmdStr, { cwd }, (err) => {
                            if (err) {
                                console.log(err);
                            } else {
                                console.log(
                                    chalk.green(`项目初始化完成,请 cd ${name} : yarn dev or npm run dev`)
                                );
                            }
                        });
                    }
                })
            })
        }else{
            console.log(chalk.red('项目已存在'));
        }
    })
program.parse(process.argv);