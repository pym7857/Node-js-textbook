#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const readline = require('readline');

let rl;
let type = process.argv[2];               // 2번째 인자
let name = process.argv[3];               // 3번째 인자
let directory = process.argv[4] || '.';   // 4번째 인자 

/* 생성할 html코드 */
const htmlTemplate = `<!DOCTYPE html>
<html>
<head>
    <meta chart="utf-8" />
    <title> Template </title>
</head>
<body>
    <h1> Hello </h1>
    <p> CLI </p>
</body>
</html>`;

/* 생성할 js코드 */
const routerTemplate = `const express = require('express');
const router = express.Router();

router.get('/', (req, res, next) => {
    try {
        res.send('ok');
    } catch (e) {
        console.error(e);
        next(e);
    }
});

module.exports = router;`;

/**
 * exist함수는 fs.accessSync 메서드를 통해 파일이나 폴더가 존재하는지 검사합니다.
 */
const exist = (dir) => {
    try {
        fs.accessSync(dir, fs.constants.F_OK | fs.constants.R_OK | fs.constants.W_OK);
        return true;
    } catch (e) {
        return false;
    }
};

/**
 * mkdirp함수는 리눅스 명령어 mkdir -p에서 따온 함수입니다. ( mkdir -p : 상위 경로(parents)도 함께 생성 )
 * 현재 경로와 입력한 경로의 상대적인 위치를 파악한 후, 순차적으로 상위 폴더부터 만들어 나갑니다.
 * ex) public/html과 같은 경로를 인자(dir)로 제공하면 public폴더를 만들고, 그 안에 html폴더를 순차적으로 만듭니다.
 * 
 * 3장에서 웬만하면 fs모듈의 Sync가 붙은 메서드를 사용하지 말라고 했습니다. 하지만 CLI프로그램은 웹 서버가 아니므로 사용해도 딱히 큰 문제가 없습니다.
 */
const mkdirp = (dir) => {
    const dirname = path
        .relative('.', path.normalize(dir))
        .split(path.sep)                    // 구분자('/')로 split
        .filter(p => !!p);                  // !!p : null이나 undefined제거
    dirname.forEach((d, idx) => {
        const pathBuilder = dirname.slice(0, idx + 1).join(path.sep);
        if (!exist(pathBuilder)) {
            fs.mkdirSync(pathBuilder);      // 폴더 생성 
        }
    });
};

/**
 * makeTemplate 함수는 실질적인 프로그램 로직을 담고 있습니다.
 * 유효한 명령어가 들어왔다면 디렉터리를 만든 후(mkdirp함수), type(html 또는 express-router)에 따라 파일을 만들고, 파일 안에 템플릿 내용을 입력합니다.
 * 
 * 참고) directory와 name은 위에서 선언해준 전역변수 입니다.
 */
const makeTemplate = () => {
    mkdirp(directory);
    if (type === 'html') {
        const pathToFile = path.join(directory, `${name}.html`);    // 파일 생성
        if (exist(pathToFile)) {
            console.error('이미 해당 파일이 존재합니다.');
        } else {
            fs.writeFileSync(pathToFile, htmlTemplate);             // 파일(pathToFile)에 내용입력
            console.log(pathToFile, '생성 완료');
        }
    } else if (type === 'express-router') {
        const pathToFile = path.join(directory, `${name}.js`);
        if (exist(pathToFile)) {
            console.error('이미 해당 파일이 존재합니다.');
        } else {
            fs.writeFileSync(pathToFile, routerTemplate);           // 파일(pathToFile)에 내용입력
            console.log(pathToFile, '생성 완료');
        }
    } else {
        console.error('html 또는 express-router 둘 중 하나를 입력하세요.');
    }
};

/* 디렉터리를 사용자로부터 입력받는 함수 */
const dirAnswer = (answer) => {
    directory = (answer && answer.trim() || '.');   // 입력하지 않으면 현재경로(.)
    rl.close();
    makeTemplate();
};

/* 파일명을 사용자로부터 입력받는 함수 */
const nameAnswer = (answer) => {
    if (!answer || !answer.trim()) {
        console.clear();
        console.log('name을 반드시 입력하셔야 합니다.');
        return rl.question('파일명을 설정하세요.', nameAnswer);
    }
    name = answer;
    return rl.question('저장할 경로를 설정하세요.(설정하지 않으면 현재경로)', dirAnswer);
};

/* 템플릿 종류를 사용자로부터 입력받는 함수 */
const typeAnswer = (answer) => {
    if (answer !=='html' && answer !=='express-router') {
        console.clear();
        console.log('html 또는 express-router만 지원합니다.');
        return rl.question('어떤 타입의 템플릿이 필요하십니까?', typeAnswer);
    }
    type = answer;
    return rl.question('파일명을 설정하세요.', nameAnswer);
}

/**
 * 명령어 호출 시 program 함수가 호출되어 내부 로직이 돌아가게 됩니다.
 * 간단히 type과 name이 있는지 검사한 후 makeTemplate() 함수를 호출합니다.
 */
const program = () => {
    if (!type || !name) {   // 명령어를 외우지 못한 사람들을 위해, 하나씩 입력받음
        rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
        });
        console.clear();
        rl.question('어떤 타입의 템플릿이 필요하십니까?', typeAnswer);
    } else {
        makeTemplate();     // 예전처럼 cli html test public 명령어도 가능합니다.
    }
};

program();



/* const dirAnswer = (answer) => {
    directory = (answer && answer.trim()) || '.';
    rl.close();
    makeTemplate();
};

const nameAnswer = (answer) => {
    if (!answer || !answer.trim()) {

    }
} */